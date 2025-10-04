// ==========================================
// 🛰️ SIMULADOR DE TRAYECTORIAS REALISTAS CON DATOS DE NASA
// ==========================================

class NASATrajectorySimulator {
    constructor() {
        this.AU = 149597870.7; // Kilómetros en 1 AU
        this.earthRadius = 6371; // km
        this.earthMass = 5.972e24; // kg
        this.G = 6.674e-11; // Constante gravitacional
        this.solarMass = 1.989e30; // kg
    }

    /**
     * 🎯 Carga datos reales de asteroides desde API NASA
     * @param {Object} nasaData - Datos JSON de la API de NASA
     */
    loadNASAAsteroid(nasaData) {
        const asteroid = {
            // Datos básicos
            id: nasaData.id,
            name: nasaData.name,
            
            // Dimensiones físicas
            diameter_min: nasaData.estimated_diameter.kilometers.estimated_diameter_min * 1000, // metros
            diameter_max: nasaData.estimated_diameter.kilometers.estimated_diameter_max * 1000, // metros
            diameter_avg: (nasaData.estimated_diameter.kilometers.estimated_diameter_min + 
                          nasaData.estimated_diameter.kilometers.estimated_diameter_max) / 2 * 1000,
            
            // Clasificación de peligrosidad
            is_hazardous: nasaData.is_potentially_hazardous_asteroid,
            
            // Elementos orbitales (época J2000)
            orbital_elements: {
                semi_major_axis: parseFloat(nasaData.orbital_data.semi_major_axis) * this.AU, // km
                eccentricity: parseFloat(nasaData.orbital_data.eccentricity),
                inclination: parseFloat(nasaData.orbital_data.inclination) * Math.PI / 180, // radianes
                longitude_ascending_node: parseFloat(nasaData.orbital_data.ascending_node_longitude) * Math.PI / 180,
                argument_perihelion: parseFloat(nasaData.orbital_data.perihelion_argument) * Math.PI / 180,
                mean_anomaly: parseFloat(nasaData.orbital_data.mean_anomaly) * Math.PI / 180,
                epoch: parseFloat(nasaData.orbital_data.epoch_osculation), // Día juliano
                orbital_period: parseFloat(nasaData.orbital_data.orbital_period), // días
                mean_motion: parseFloat(nasaData.orbital_data.mean_motion) * Math.PI / 180 // rad/día
            },
            
            // Aproximaciones a la Tierra
            close_approaches: nasaData.close_approach_data.map(approach => ({
                date: new Date(approach.close_approach_date_full),
                epoch: approach.epoch_date_close_approach,
                velocity_kms: parseFloat(approach.relative_velocity.kilometers_per_second),
                distance_km: parseFloat(approach.miss_distance.kilometers),
                distance_lunar: parseFloat(approach.miss_distance.lunar)
            })),
            
            // Propiedades físicas estimadas
            estimated_mass: this.estimateMass(
                (nasaData.estimated_diameter.kilometers.estimated_diameter_min + 
                 nasaData.estimated_diameter.kilometers.estimated_diameter_max) / 2
            ),
            
            // Clasificación orbital
            orbit_class: nasaData.orbital_data.orbit_class.orbit_class_type
        };

        return asteroid;
    }

    /**
     * 📐 Calcula posición del asteroide usando elementos orbitales Keplerianos
     * @param {Object} asteroid - Datos del asteroide
     * @param {Date} targetDate - Fecha objetivo
     * @returns {Object} - Posición y velocidad en coordenadas heliocéntricas
     */
    calculatePosition(asteroid, targetDate) {
        const elements = asteroid.orbital_elements;
        
        // 1. Calcular tiempo desde la época
        const julianDate = this.dateToJulian(targetDate);
        const deltaTime = julianDate - elements.epoch; // días
        
        // 2. Calcular anomalía media en el tiempo objetivo
        const meanAnomaly = elements.mean_anomaly + elements.mean_motion * deltaTime;
        
        // 3. Resolver ecuación de Kepler para anomalía excéntrica
        const eccentricAnomaly = this.solveKeplerEquation(meanAnomaly, elements.eccentricity);
        
        // 4. Calcular anomalía verdadera
        const trueAnomaly = 2 * Math.atan2(
            Math.sqrt(1 + elements.eccentricity) * Math.sin(eccentricAnomaly / 2),
            Math.sqrt(1 - elements.eccentricity) * Math.cos(eccentricAnomaly / 2)
        );
        
        // 5. Calcular distancia radial
        const radius = elements.semi_major_axis * (1 - elements.eccentricity * Math.cos(eccentricAnomaly));
        
        // 6. Posición en el plano orbital
        const x_orbital = radius * Math.cos(trueAnomaly);
        const y_orbital = radius * Math.sin(trueAnomaly);
        
        // 7. Transformar a coordenadas heliocéntricas 3D
        const position = this.orbitalToHeliocentric(
            x_orbital, y_orbital, 0,
            elements.longitude_ascending_node,
            elements.inclination,
            elements.argument_perihelion
        );
        
        // 8. Calcular velocidad orbital
        const velocity = this.calculateOrbitalVelocity(
            asteroid, position, trueAnomaly, eccentricAnomaly
        );
        
        return {
            position: position, // [x, y, z] en km desde el Sol
            velocity: velocity, // [vx, vy, vz] en km/s
            distance_from_sun: radius,
            true_anomaly: trueAnomaly,
            julian_date: julianDate
        };
    }

    /**
     * 🌍 Convierte posición heliocéntrica a geocéntrica
     * @param {Array} heliocentricPos - Posición respecto al Sol [x, y, z] km
     * @param {Date} date - Fecha para posición de la Tierra
     * @returns {Array} - Posición respecto a la Tierra [x, y, z] km
     */
    heliocentricToGeocentric(heliocentricPos, date) {
        // Posición aproximada de la Tierra (órbita circular simplificada)
        const dayOfYear = this.dayOfYear(date);
        const earthAngle = (dayOfYear / 365.25) * 2 * Math.PI;
        
        const earthPos = [
            this.AU * Math.cos(earthAngle),
            this.AU * Math.sin(earthAngle),
            0
        ];
        
        return [
            heliocentricPos[0] - earthPos[0],
            heliocentricPos[1] - earthPos[1],
            heliocentricPos[2] - earthPos[2]
        ];
    }

    /**
     * 🎯 Predicción de trayectoria futura
     * @param {Object} asteroid - Datos del asteroide
     * @param {Date} startDate - Fecha inicial
     * @param {number} days - Días a simular
     * @param {number} step - Paso de tiempo en días
     * @returns {Array} - Array de posiciones y fechas
     */
    predictTrajectory(asteroid, startDate, days, step = 0.1) {
        const trajectory = [];
        const currentDate = new Date(startDate);
        
        for (let day = 0; day <= days; day += step) {
            const targetDate = new Date(currentDate.getTime() + day * 24 * 60 * 60 * 1000);
            const helioPos = this.calculatePosition(asteroid, targetDate);
            const geoPos = this.heliocentricToGeocentric(helioPos.position, targetDate);
            
            // Calcular distancia a la Tierra
            const earthDistance = Math.sqrt(geoPos[0]**2 + geoPos[1]**2 + geoPos[2]**2);
            
            trajectory.push({
                date: targetDate,
                julian_date: helioPos.julian_date,
                heliocentric_position: helioPos.position,
                geocentric_position: geoPos,
                earth_distance: earthDistance,
                velocity: helioPos.velocity,
                is_approaching: earthDistance < this.earthRadius + 1000000, // Dentro de 1M km
                threat_level: this.assessThreatLevel(asteroid, earthDistance, helioPos.velocity)
            });
        }
        
        return trajectory;
    }

    /**
     * ⚠️ Evalúa nivel de amenaza
     */
    assessThreatLevel(asteroid, earthDistance, velocity) {
        const moonDistance = 384400; // km
        const velocityMagnitude = Math.sqrt(velocity[0]**2 + velocity[1]**2 + velocity[2]**2);
        
        if (earthDistance < this.earthRadius + 100) {
            return { level: 'IMPACT', color: '#ff0000', description: 'Impacto inminente' };
        } else if (earthDistance < moonDistance * 0.1) {
            return { level: 'CRITICAL', color: '#ff4444', description: 'Peligro extremo' };
        } else if (earthDistance < moonDistance) {
            return { level: 'HIGH', color: '#ff8800', description: 'Aproximación peligrosa' };
        } else if (earthDistance < moonDistance * 5) {
            return { level: 'MODERATE', color: '#ffaa00', description: 'Monitoreo requerido' };
        } else {
            return { level: 'LOW', color: '#00ff00', description: 'Sin peligro inmediato' };
        }
    }

    // ==========================================
    // FUNCIONES AUXILIARES MATEMÁTICAS
    // ==========================================

    solveKeplerEquation(meanAnomaly, eccentricity, tolerance = 1e-6) {
        let E = meanAnomaly; // Primera aproximación
        let delta = 1;
        
        while (Math.abs(delta) > tolerance) {
            delta = (E - eccentricity * Math.sin(E) - meanAnomaly) / (1 - eccentricity * Math.cos(E));
            E -= delta;
        }
        
        return E;
    }

    orbitalToHeliocentric(x, y, z, Omega, i, omega) {
        // Matrices de rotación para transformar del plano orbital al heliocéntrico
        const cosOmega = Math.cos(Omega);
        const sinOmega = Math.sin(Omega);
        const cosi = Math.cos(i);
        const sini = Math.sin(i);
        const cosomega = Math.cos(omega);
        const sinomega = Math.sin(omega);
        
        return [
            (cosOmega * cosomega - sinOmega * sinomega * cosi) * x + 
            (-cosOmega * sinomega - sinOmega * cosomega * cosi) * y,
            
            (sinOmega * cosomega + cosOmega * sinomega * cosi) * x + 
            (-sinOmega * sinomega + cosOmega * cosomega * cosi) * y,
            
            (sinomega * sini) * x + (cosomega * sini) * y
        ];
    }

    calculateOrbitalVelocity(asteroid, position, trueAnomaly, eccentricAnomaly) {
        const elements = asteroid.orbital_elements;
        const mu = this.G * this.solarMass / 1e9; // km³/s²
        
        const r = Math.sqrt(position[0]**2 + position[1]**2 + position[2]**2);
        const v = Math.sqrt(mu * (2/r - 1/elements.semi_major_axis));
        
        // Componentes de velocidad en el plano orbital
        const vx_orbital = -v * Math.sin(eccentricAnomaly);
        const vy_orbital = v * Math.sqrt(1 - elements.eccentricity**2) * Math.cos(eccentricAnomaly);
        
        // Transformar a coordenadas heliocéntricas
        return this.orbitalToHeliocentric(
            vx_orbital, vy_orbital, 0,
            elements.longitude_ascending_node,
            elements.inclination,
            elements.argument_perihelion
        );
    }

    estimateMass(diameter_km) {
        // Densidad típica según composición (kg/m³)
        const density = 2600; // Roca típica de asteroide
        const radius_m = diameter_km * 500; // Radio en metros
        const volume = (4/3) * Math.PI * radius_m**3;
        return volume * density; // kg
    }

    dateToJulian(date) {
        return (date.getTime() / 86400000) + 2440587.5;
    }

    dayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
}

// ==========================================
// 🚀 EJEMPLO DE USO CON DATOS REALES
// ==========================================

// Ejemplo de cómo usar el simulador con tus datos de NASA
const simulator = new NASATrajectorySimulator();

// Cargar datos del JSON (ejemplo con Eros)
const erosData = {
    "id": "2000433",
    "name": "433 Eros (A898 PA)",
    // ... resto de datos de tu JSON
};

const asteroid = simulator.loadNASAAsteroid(erosData);
const currentDate = new Date();
const trajectory = simulator.predictTrajectory(asteroid, currentDate, 365, 1); // 1 año, paso diario

console.log('🎯 Simulación de trayectoria completada:');
console.log(`📊 Puntos calculados: ${trajectory.length}`);
console.log(`⚠️  Aproximaciones peligrosas: ${trajectory.filter(p => p.threat_level.level !== 'LOW').length}`);

export { NASATrajectorySimulator };