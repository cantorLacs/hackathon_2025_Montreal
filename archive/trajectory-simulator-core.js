// ==========================================
// 🛰️ SIMULADOR DE TRAYECTORIAS - IMPLEMENTACIÓN PRÁCTICA
// ==========================================

class TrajectorySimulator {
    constructor() {
        // Constantes astronómicas
        this.AU = 149597870.7; // km - Unidad Astronómica
        this.G = 6.674e-11;    // m³/kg/s² - Constante gravitacional
        this.solarMass = 1.989e30; // kg
        this.earthRadius = 6371; // km
        
        // Configuración de precisión
        this.keplerTolerance = 1e-8; // Tolerancia para ecuación de Kepler
        this.maxKeplerIterations = 20;
    }

    // ==========================================
    // 📊 CARGA Y PROCESAMIENTO DE DATOS NASA
    // ==========================================

    /**
     * Procesa datos del JSON de NASA y extrae información orbital
     */
    loadNASAData(nasaObject) {
        const orbitalData = nasaObject.orbital_data;
        
        return {
            // Identificación
            id: nasaObject.id,
            name: nasaObject.name,
            
            // Elementos orbitales keplerianos (época J2000)
            elements: {
                a: parseFloat(orbitalData.semi_major_axis) * this.AU, // km
                e: parseFloat(orbitalData.eccentricity),
                i: this.degreesToRadians(parseFloat(orbitalData.inclination)),
                Omega: this.degreesToRadians(parseFloat(orbitalData.ascending_node_longitude)),
                omega: this.degreesToRadians(parseFloat(orbitalData.perihelion_argument)),
                M0: this.degreesToRadians(parseFloat(orbitalData.mean_anomaly)),
                n: this.degreesToRadians(parseFloat(orbitalData.mean_motion) / 86400), // rad/s
                epoch: parseFloat(orbitalData.epoch_osculation), // Día juliano
                period: parseFloat(orbitalData.orbital_period) * 86400 // segundos
            },
            
            // Aproximaciones a la Tierra
            closeApproaches: nasaObject.close_approach_data.map(approach => ({
                date: new Date(approach.close_approach_date_full),
                julianDate: this.dateToJulian(new Date(approach.close_approach_date_full)),
                velocity: parseFloat(approach.relative_velocity.kilometers_per_second),
                distance: parseFloat(approach.miss_distance.kilometers)
            })),
            
            // Propiedades físicas
            diameter: {
                min: nasaObject.estimated_diameter.kilometers.estimated_diameter_min,
                max: nasaObject.estimated_diameter.kilometers.estimated_diameter_max,
                avg: (nasaObject.estimated_diameter.kilometers.estimated_diameter_min + 
                     nasaObject.estimated_diameter.kilometers.estimated_diameter_max) / 2
            },
            
            // Clasificación
            orbitClass: orbitalData.orbit_class.orbit_class_type,
            isHazardous: nasaObject.is_potentially_hazardous_asteroid
        };
    }

    // ==========================================
    // 🧮 MATEMÁTICAS ORBITALES CORE
    // ==========================================

    /**
     * Resuelve la ecuación de Kepler: E - e*sin(E) = M
     * Usando método de Newton-Raphson
     */
    solveKeplerEquation(meanAnomaly, eccentricity) {
        let E = meanAnomaly; // Primera aproximación
        
        for (let i = 0; i < this.maxKeplerIterations; i++) {
            const f = E - eccentricity * Math.sin(E) - meanAnomaly;
            const df = 1 - eccentricity * Math.cos(E);
            const deltaE = f / df;
            
            E -= deltaE;
            
            if (Math.abs(deltaE) < this.keplerTolerance) {
                break;
            }
        }
        
        return E;
    }

    /**
     * Convierte anomalía excéntrica a anomalía verdadera
     */
    eccentricToTrueAnomaly(E, e) {
        return 2 * Math.atan2(
            Math.sqrt(1 + e) * Math.sin(E / 2),
            Math.sqrt(1 - e) * Math.cos(E / 2)
        );
    }

    /**
     * Calcula posición en coordenadas orbitales
     */
    orbitalPosition(trueAnomaly, semiMajorAxis, eccentricity) {
        const r = semiMajorAxis * (1 - eccentricity * eccentricity) / 
                 (1 + eccentricity * Math.cos(trueAnomaly));
        
        return {
            x: r * Math.cos(trueAnomaly),
            y: r * Math.sin(trueAnomaly),
            z: 0,
            r: r
        };
    }

    /**
     * Transforma coordenadas del plano orbital al sistema heliocéntrico
     */
    orbitalToHeliocentric(orbitalPos, elements) {
        const {i, Omega, omega} = elements;
        
        // Matrices de rotación
        const cosOmega = Math.cos(Omega);
        const sinOmega = Math.sin(Omega);
        const cosi = Math.cos(i);
        const sini = Math.sin(i);
        const cosomega = Math.cos(omega);
        const sinomega = Math.sin(omega);
        
        // Aplicar rotaciones: primero omega, luego i, finalmente Omega
        const x = (cosOmega * cosomega - sinOmega * sinomega * cosi) * orbitalPos.x +
                 (-cosOmega * sinomega - sinOmega * cosomega * cosi) * orbitalPos.y;
                 
        const y = (sinOmega * cosomega + cosOmega * sinomega * cosi) * orbitalPos.x +
                 (-sinOmega * sinomega + cosOmega * cosomega * cosi) * orbitalPos.y;
                 
        const z = (sinomega * sini) * orbitalPos.x + (cosomega * sini) * orbitalPos.y;
        
        return {x, y, z, r: orbitalPos.r};
    }

    // ==========================================
    // 🕒 PROPAGACIÓN TEMPORAL
    // ==========================================

    /**
     * Calcula la posición del asteroide en un momento específico
     */
    calculatePositionAtTime(asteroid, julianDate) {
        const elements = asteroid.elements;
        
        // 1. Tiempo transcurrido desde la época
        const deltaTime = (julianDate - elements.epoch) * 86400; // segundos
        
        // 2. Anomalía media en el tiempo objetivo
        const meanAnomaly = elements.M0 + elements.n * deltaTime;
        
        // 3. Resolver ecuación de Kepler
        const eccentricAnomaly = this.solveKeplerEquation(meanAnomaly, elements.e);
        
        // 4. Calcular anomalía verdadera
        const trueAnomaly = this.eccentricToTrueAnomaly(eccentricAnomaly, elements.e);
        
        // 5. Posición en coordenadas orbitales
        const orbitalPos = this.orbitalPosition(trueAnomaly, elements.a, elements.e);
        
        // 6. Transformar a coordenadas heliocéntricas
        const heliocentricPos = this.orbitalToHeliocentric(orbitalPos, elements);
        
        // 7. Convertir a geocéntrico (aproximación simple)
        const earthPos = this.getEarthPosition(julianDate);
        const geocentricPos = {
            x: heliocentricPos.x - earthPos.x,
            y: heliocentricPos.y - earthPos.y,
            z: heliocentricPos.z - earthPos.z
        };
        
        return {
            heliocentric: heliocentricPos,
            geocentric: geocentricPos,
            orbital: orbitalPos,
            trueAnomaly: trueAnomaly,
            julianDate: julianDate,
            earthDistance: Math.sqrt(
                geocentricPos.x**2 + geocentricPos.y**2 + geocentricPos.z**2
            )
        };
    }

    /**
     * Genera trayectoria completa para un período de tiempo
     */
    generateTrajectory(asteroid, startDate, endDate, timeStep = 86400) {
        const trajectory = [];
        const startJD = this.dateToJulian(startDate);
        const endJD = this.dateToJulian(endDate);
        const stepJD = timeStep / 86400; // Convertir segundos a días
        
        for (let jd = startJD; jd <= endJD; jd += stepJD) {
            const position = this.calculatePositionAtTime(asteroid, jd);
            trajectory.push({
                ...position,
                date: this.julianToDate(jd)
            });
        }
        
        return trajectory;
    }

    // ==========================================
    // 🌍 SISTEMA DE REFERENCIA TERRESTRE
    // ==========================================

    /**
     * Posición aproximada de la Tierra (órbita circular simple)
     */
    getEarthPosition(julianDate) {
        // Aproximación: órbita circular, año de 365.25 días
        const daysSinceEpoch = julianDate - 2451545.0; // J2000
        const earthAngle = (daysSinceEpoch / 365.25) * 2 * Math.PI;
        
        return {
            x: this.AU * Math.cos(earthAngle),
            y: this.AU * Math.sin(earthAngle),
            z: 0
        };
    }

    // ==========================================
    // 🔍 ANÁLISIS DE TRAYECTORIAS
    // ==========================================

    /**
     * Encuentra aproximaciones cercanas a la Tierra
     */
    findCloseApproaches(trajectory, maxDistance = 7740000) { // ~20 distancias lunares
        return trajectory.filter(point => 
            point.earthDistance < maxDistance
        ).sort((a, b) => a.earthDistance - b.earthDistance);
    }

    /**
     * Calcula velocidad relativa respecto a la Tierra
     */
    calculateRelativeVelocity(asteroid, julianDate) {
        const dt = 0.001; // Pequeño intervalo de tiempo
        const pos1 = this.calculatePositionAtTime(asteroid, julianDate - dt);
        const pos2 = this.calculatePositionAtTime(asteroid, julianDate + dt);
        
        const velocity = {
            x: (pos2.geocentric.x - pos1.geocentric.x) / (2 * dt * 86400),
            y: (pos2.geocentric.y - pos1.geocentric.y) / (2 * dt * 86400),
            z: (pos2.geocentric.z - pos1.geocentric.z) / (2 * dt * 86400)
        };
        
        return Math.sqrt(velocity.x**2 + velocity.y**2 + velocity.z**2);
    }

    /**
     * Evalúa nivel de amenaza basado en distancia y velocidad
     */
    assessThreatLevel(earthDistance, velocity, diameter) {
        const moonDistance = 384400; // km
        
        if (earthDistance < this.earthRadius + 100) {
            return {level: 'IMPACT', severity: 5, color: '#FF0000'};
        } else if (earthDistance < moonDistance * 0.1) {
            return {level: 'CRITICAL', severity: 4, color: '#FF4444'};
        } else if (earthDistance < moonDistance * 0.5) {
            return {level: 'HIGH', severity: 3, color: '#FF8800'};
        } else if (earthDistance < moonDistance * 2) {
            return {level: 'MODERATE', severity: 2, color: '#FFAA00'};
        } else {
            return {level: 'LOW', severity: 1, color: '#00FF00'};
        }
    }

    // ==========================================
    // 🛠️ UTILIDADES
    // ==========================================

    degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    radiansToDegrees(radians) {
        return radians * 180 / Math.PI;
    }

    dateToJulian(date) {
        return (date.getTime() / 86400000) + 2440587.5;
    }

    julianToDate(julianDate) {
        return new Date((julianDate - 2440587.5) * 86400000);
    }
}

// ==========================================
// 🎮 EJEMPLO DE USO PRÁCTICO
// ==========================================

/*
// Inicializar simulador
const simulator = new TrajectorySimulator();

// Cargar datos de asteroide desde NASA JSON
const asteroidData = simulator.loadNASAData(nasaJsonObject);

// Generar trayectoria para los próximos 2 años
const startDate = new Date();
const endDate = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);
const trajectory = simulator.generateTrajectory(asteroidData, startDate, endDate, 86400);

// Analizar aproximaciones peligrosas
const closeApproaches = simulator.findCloseApproaches(trajectory);

// Evaluar amenaza
closeApproaches.forEach(approach => {
    const velocity = simulator.calculateRelativeVelocity(asteroidData, approach.julianDate);
    const threat = simulator.assessThreatLevel(
        approach.earthDistance, 
        velocity, 
        asteroidData.diameter.avg
    );
    
    console.log(`${approach.date}: ${threat.level} - Distancia: ${approach.earthDistance.toFixed(0)} km`);
});
*/

export { TrajectorySimulator };