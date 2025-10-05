/**
 * Script to enrich NASA data with CSV information
 * Combines NeoWs API data with SBDB (Small Body Database) data
 */

class NASADataEnricher {
    constructor() {
        this.csvData = new Map(); // SPK-ID -> CSV data
    }

    /**
     * Loads and parses SBDB CSV file
     * @param {File} csvFile - CSV file downloaded from NASA SBDB
     */
    async loadCSV(csvFile) {
        const text = await csvFile.text();
        const lines = text.split('\n');
        
        // Parse header
        const header = this.parseCSVLine(lines[0]);
        console.log('CSV Header:', header);
        
        // Parse data
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = this.parseCSVLine(lines[i]);
            if (values.length !== header.length) continue;
            
            const obj = {};
            header.forEach((key, index) => {
                obj[key] = values[index];
            });
            
            // Use SPK-ID as key
            const spkid = obj.spkid;
            if (spkid) {
                this.csvData.set(spkid, obj);
            }
        }
        
        console.log(`✅ CSV loaded: ${this.csvData.size} asteroids`);
    }

    /**
     * Parses a CSV line respecting quotes
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
     * Enriches a NASA asteroid object with CSV data
     * @param {Object} asteroidData - Asteroid data from Lookup API
     * @returns {Object} - Enriched asteroid
     */
    enrichAsteroid(asteroidData) {
        const spkid = asteroidData.id;
        const csvEntry = this.csvData.get(spkid);
        
        if (!csvEntry) {
            console.warn(`CSV data not found for asteroid ${spkid}`);
            return asteroidData;
        }
        
        // Add additional data
        const enriched = {
            ...asteroidData,
            
            // Physical data
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
            
            // Extended orbital data
            orbital_data_extended: {
                ...asteroidData.orbital_data,
                earth_moid_au: this.parseFloat(csvEntry.moid),
                earth_moid_km: this.parseFloat(csvEntry.moid) * 149597870.7,
                earth_moid_ld: this.parseFloat(csvEntry.moid) * 389.17, // Lunar distances
                aphelion_distance: this.parseFloat(csvEntry.ad),
                period_years: this.parseFloat(csvEntry.per_y),
                orbit_class_short: csvEntry.class || asteroidData.orbital_data?.orbit_class?.orbit_class_type
            },
            
            // Observation data
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
     * Parses a float value, returns null if empty
     */
    parseFloat(value) {
        if (!value || value === '') return null;
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
    }

    /**
     * Gets spectral type description
     */
    getSpectralTypeDescription(specType) {
        const descriptions = {
            'C': 'Carbonaceous - Dark, carbon-rich',
            'S': 'Silicaceous - Rocky, contains silicates',
            'M': 'Metallic - Rich in metals (nickel-iron)',
            'X': 'X-type - Metallic or carbonaceous (ambiguous)',
            'Q': 'Q-type - Silicaceous with olivine',
            'V': 'V-type - Basaltic (similar to Vesta)',
            'D': 'D-type - Very dark, organics',
            'T': 'T-type - Dark, silicates',
            'E': 'E-type - High albedo, enstatite',
            'A': 'A-type - Rich in olivine'
        };
        
        if (!specType) return 'Unknown';
        
        const mainType = specType.charAt(0).toUpperCase();
        return descriptions[mainType] || `Type ${specType}`;
    }

    /**
     * Gets orbital uncertainty level
     */
    getUncertaintyLevel(conditionCode) {
        if (conditionCode === null || conditionCode === undefined) {
            return 'Unknown';
        }
        
        const levels = {
            0: 'Excellent (±1 km)',
            1: 'Very good (±10 km)',
            2: 'Good (±100 km)',
            3: 'Acceptable (±1,000 km)',
            4: 'Fair (±10,000 km)',
            5: 'Poor (±100,000 km)',
            6: 'Very poor (±1,000,000 km)',
            7: 'Critical (±10,000,000 km)',
            8: 'Extremely critical',
            9: 'Undetermined'
        };
        
        return levels[conditionCode] || 'Unknown';
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NASADataEnricher;
}
