/**
 * Script para enriquecer datos de NASA con información del CSV
 * Combina datos de NeoWs API con datos de SBDB (Small Body Database)
 */

class NASADataEnricher {
    constructor() {
        this.csvData = new Map(); // SPK-ID -> datos CSV
    }

    /**
     * Carga y parsea el archivo CSV de SBDB
     * @param {File} csvFile - Archivo CSV descargado de NASA SBDB
     */
    async loadCSV(csvFile) {
        const text = await csvFile.text();
        const lines = text.split('\n');
        
        // Parsear header
        const header = this.parseCSVLine(lines[0]);
        console.log('CSV Header:', header);
        
        // Parsear datos
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = this.parseCSVLine(lines[i]);
            if (values.length !== header.length) continue;
            
            const obj = {};
            header.forEach((key, index) => {
                obj[key] = values[index];
            });
            
            // Usar SPK-ID como clave
            const spkid = obj.spkid;
            if (spkid) {
                this.csvData.set(spkid, obj);
            }
        }
        
        console.log(`✅ CSV cargado: ${this.csvData.size} asteroides`);
    }

    /**
     * Parsea una línea CSV respetando comillas
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    /**
     * Enriquece un objeto asteroide de NASA con datos del CSV
     * @param {Object} asteroidData - Datos del asteroide de Lookup API
     * @returns {Object} - Asteroide enriquecido
     */
    enrichAsteroid(asteroidData) {
        const spkid = asteroidData.id;
        const csvEntry = this.csvData.get(spkid);
        
        if (!csvEntry) {
            console.warn(`No se encontraron datos CSV para asteroide ${spkid}`);
            return asteroidData;
        }
        
        // Agregar datos adicionales
        const enriched = {
            ...asteroidData,
            
            // Datos físicos
            physical_data: {
                albedo: this.parseFloat(csvEntry.albedo),
                diameter_km: this.parseFloat(csvEntry.diameter),
                extent: csvEntry.extent || null,
                rotation_period_hours: this.parseFloat(csvEntry.rot_per),
                GM: this.parseFloat(csvEntry.GM),
                spectral_type_B: csvEntry.spec_B || null,
                spectral_type_T: csvEntry.spec_T || null,
                color_BV: this.parseFloat(csvEntry.BV),
                color_UB: this.parseFloat(csvEntry.UB),
                color_IR: this.parseFloat(csvEntry.IR)
            },
            
            // Datos orbitales adicionales
            orbital_data_extended: {
                ...asteroidData.orbital_data,
                earth_moid_au: this.parseFloat(csvEntry.moid),
                earth_moid_km: this.parseFloat(csvEntry.moid) * 149597870.7,
                earth_moid_ld: this.parseFloat(csvEntry.moid) * 389.17, // Lunar distances
                aphelion_distance: this.parseFloat(csvEntry.ad),
                period_years: this.parseFloat(csvEntry.per_y),
                orbit_class_short: csvEntry.class || asteroidData.orbital_data?.orbit_class?.orbit_class_type
            },
            
            // Datos de observación
            observation_data: {
                data_arc_days: parseInt(csvEntry.data_arc) || 0,
                first_observation: csvEntry.first_obs,
                last_observation: csvEntry.last_obs,
                observations_used: parseInt(csvEntry.n_obs_used) || 0,
                observations_radar_delay: parseInt(csvEntry.n_del_obs_used) || 0,
                observations_radar_doppler: parseInt(csvEntry.n_dop_obs_used) || 0,
                condition_code: parseInt(csvEntry.condition_code) || 9,
                orbit_id: csvEntry.orbit_id
            }
        };
        
        return enriched;
    }

    /**
     * Parsea un valor float, devuelve null si está vacío
     */
    parseFloat(value) {
        if (!value || value === '') return null;
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
    }

    /**
     * Obtiene descripción de tipo espectral
     */
    getSpectralTypeDescription(specType) {
        const descriptions = {
            'C': 'Carbonáceo - Oscuro, rico en carbono',
            'S': 'Silíceo - Rocoso, contiene silicatos',
            'M': 'Metálico - Rico en metales (níquel-hierro)',
            'X': 'Tipo X - Metálico o carbonáceo (ambiguo)',
            'Q': 'Tipo Q - Silíceo con olivino',
            'V': 'Tipo V - Basáltico (similar a Vesta)',
            'D': 'Tipo D - Muy oscuro, orgánicos',
            'T': 'Tipo T - Oscuro, silicatos',
            'E': 'Tipo E - Alto albedo, enstatita',
            'A': 'Tipo A - Rico en olivino'
        };
        
        if (!specType) return 'Desconocido';
        
        const mainType = specType.charAt(0).toUpperCase();
        return descriptions[mainType] || `Tipo ${specType}`;
    }

    /**
     * Obtiene nivel de incertidumbre orbital
     */
    getUncertaintyLevel(conditionCode) {
        if (conditionCode === null || conditionCode === undefined) {
            return 'Desconocido';
        }
        
        const levels = {
            0: 'Excelente (±1 km)',
            1: 'Muy buena (±10 km)',
            2: 'Buena (±100 km)',
            3: 'Aceptable (±1,000 km)',
            4: 'Regular (±10,000 km)',
            5: 'Pobre (±100,000 km)',
            6: 'Muy pobre (±1,000,000 km)',
            7: 'Crítica (±10,000,000 km)',
            8: 'Extremadamente crítica',
            9: 'Sin determinar'
        };
        
        return levels[conditionCode] || 'Desconocido';
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NASADataEnricher;
}
