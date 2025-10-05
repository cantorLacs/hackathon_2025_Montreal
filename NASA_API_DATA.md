# NASA API Data Reference

## Overview

This document explains the asteroid data extracted from NASA's Horizons API and how it's utilized in the Near-Earth Asteroid Trajectory Visualizer.

---

## Data Sources

### 1. NASA Horizons API
- **Endpoint**: `https://ssd.jpl.nasa.gov/api/horizons.api`
- **Purpose**: Provides high-precision orbital elements and ephemeris data for solar system objects
- **Update Frequency**: Real-time access to JPL's latest orbital solutions

### 2. NASA Small-Body Database (SBDB)
- **Endpoint**: `https://ssd-api.jpl.nasa.gov/sbdb.api`
- **Purpose**: Physical characteristics, discovery data, and close approach information
- **Coverage**: Over 1.3 million asteroids and comets

---

## Extracted Orbital Elements

### Keplerian Elements (from Horizons API)

The following orbital elements are extracted for each asteroid:

| Element | Symbol | Description | Unit | Usage in Visualizer |
|---------|--------|-------------|------|---------------------|
| **Eccentricity** | `e` | Orbital shape (0 = circle, <1 = ellipse) | dimensionless | Determines ellipse shape in 3D orbit |
| **Semi-major Axis** | `a` | Average distance from Sun | AU | Scales orbit size |
| **Inclination** | `i` | Tilt relative to ecliptic plane | degrees | Rotates orbit plane in 3D space |
| **Ascending Node** | `Ω` (OMEGA) | Where orbit crosses ecliptic upward | degrees | Rotates orbit around Sun |
| **Argument of Perihelion** | `ω` (omega) | Orientation of ellipse in orbital plane | degrees | Rotates ellipse within plane |
| **Mean Anomaly** | `M` | Position along orbit at epoch | degrees | Calculates starting position |
| **Epoch** | `JD` | Reference time for elements | Julian Date | Time reference for calculations |

### Why Keplerian Elements?

Keplerian elements provide a **compact, mathematically precise** way to describe an orbit with just 6 parameters. They remain nearly constant over time (except for perturbations), making them ideal for:

1. **Efficient storage**: 6 numbers instead of position/velocity vectors
2. **Long-term predictions**: Stable over years for most NEAs
3. **Orbit visualization**: Direct mapping to 3D geometric shapes

---

## Physical & Discovery Data (from SBDB)

### Extracted Fields

```javascript
{
  // Identity
  "full_name": "433 Eros (A898 PA)",
  "designation": "433",
  "name": "Eros",
  
  // Physical Characteristics
  "diameter": 16.84,              // km (mean diameter)
  "H": 11.16,                     // Absolute magnitude (brightness)
  "albedo": 0.25,                 // Reflectivity (0-1)
  "spec_T": "S",                  // Spectral type (composition)
  
  // Discovery Information
  "discovery_date": "1898-08-13", // When discovered
  "discoverer": "G. Witt",        // Who discovered it
  
  // Orbit Classification
  "orbit_class": "Amor",          // NEA subgroup
  "pha": false,                   // Potentially Hazardous Asteroid
  
  // Close Approach Data
  "close_approach_date": "2025-11-19T01:27:00.000Z",
  "miss_distance": 0.00451,       // AU from Earth
  "relative_velocity": 23.45      // km/s
}
```

### Field Descriptions

#### **Absolute Magnitude (H)**
- Brightness of asteroid at 1 AU from Sun and Earth
- **Lower H** = larger/brighter asteroid
- **Used for**: Sizing asteroid meshes in 3D visualization
- **Formula**: `radius ≈ 1329 / √albedo × 10^(-H/5)` km

#### **Spectral Type (spec_T)**
- Composition classification based on reflectance spectrum
- **Common Types**:
  - **C-type** (Carbonaceous): Dark, carbon-rich, primitive material
  - **S-type** (Silicaceous): Stony, silicate-rich
  - **M-type** (Metallic): Metal-rich, high density
  - **V-type**: Basaltic, from differentiated bodies
- **Used for**: Color-coding asteroids in visualizer

#### **Albedo**
- Fraction of sunlight reflected (0 = black, 1 = perfect mirror)
- **Typical ranges**:
  - C-type: 0.03-0.10 (very dark)
  - S-type: 0.10-0.25 (moderate)
  - M-type: 0.10-0.30 (moderate to high)
- **Used for**: Material properties, size estimation

#### **Orbit Class**
- NEA subgroups based on orbital characteristics:
  - **Atiras**: Orbit entirely inside Earth's (a < 1.0 AU, Q < 0.983 AU)
  - **Atens**: Cross Earth's orbit from inside (a < 1.0 AU, Q > 0.983 AU)
  - **Apollos**: Cross Earth's orbit from outside (a > 1.0 AU, q < 1.017 AU)
  - **Amors**: Approach Earth from outside (1.017 < q < 1.3 AU)
- **Used for**: Classification badges, filtering, color schemes

#### **Potentially Hazardous Asteroid (PHA)**
- Criteria:
  1. **MOID < 0.05 AU** (7.5 million km)
  2. **H < 22** (diameter >140 meters)
- **Used for**: Visual alerts, priority highlighting

---

## Data Processing Pipeline

### 1. **Data Acquisition**
```javascript
// Fetch from Horizons API
const horizonsData = await fetchHorizonsData(asteroidName);
const orbitalElements = parseHorizonsResponse(horizonsData);

// Fetch from SBDB
const sbdbData = await fetchSBDBData(asteroidName);
const physicalData = parseSBDBResponse(sbdbData);
```

### 2. **Data Enrichment** (`data-enricher.js`)
- Combines Horizons + SBDB data
- Adds human-readable descriptions
- Calculates derived values
- Validates data completeness

### 3. **Trajectory Calculation** (`trajectory-simulator.js`)
- Uses Keplerian elements to solve **Kepler's equation**:
  ```
  M = E - e·sin(E)  (iterative solution)
  ```
- Converts to **True Anomaly** (ν)
- Transforms to **3D Cartesian coordinates** (x, y, z)
- Accounts for all 6 orbital elements

### 4. **3D Visualization** (`asteroid-visualizer.js`)
- Creates orbit paths (ellipses)
- Positions asteroid meshes
- Animates over time
- Applies physical characteristics (color, size, labels)

---

## How Data is Used in the Visualizer

### **Orbit Rendering**
```javascript
// Generate 360 points along ellipse
for (let i = 0; i <= 360; i++) {
  const M = (i / 360) * 2 * Math.PI; // Mean anomaly
  const position = keplerToCartesian(elements, M);
  orbitPoints.push(position.x, position.y, position.z);
}
```

### **Real-Time Position Updates**
```javascript
// Every frame (60 FPS)
const currentJD = dateToJulianDate(currentDate);
const daysSinceEpoch = currentJD - elements.epoch;
const M = elements.M0 + (360 / elements.period) * daysSinceEpoch;
const position = keplerToCartesian(elements, M);
asteroidMesh.position.copy(position);
```

### **Visual Properties**
- **Size**: Scaled by absolute magnitude H
- **Color**: Based on spectral type (C=gray, S=orange, M=silver)
- **Label**: Shows name, distance, velocity
- **Orbit line**: Color-coded by class (Apollo=red, Aten=blue, etc.)

### **Interaction Features**
- **Selection**: Click asteroid → focus camera, show details
- **Time Control**: Animate forward/backward in time
- **Distance Filter**: Show only asteroids within X million km
- **Date Jump**: Jump to close approach dates

---

## Data Quality & Uncertainties

### Uncertainty Levels (from SBDB)
```javascript
uncertaintyLevels = {
  0: "Very Low (<1 km uncertainty)",
  1: "Low (1-10 km)",
  2: "Medium (10-100 km)",
  3: "High (100-1,000 km)",
  4: "Very High (1,000-10,000 km)",
  5: "Extremely High (>10,000 km)"
}
```

### Sources of Uncertainty
1. **Observation arc**: Longer observation = better precision
2. **Number of observations**: More observations = lower uncertainty
3. **Recent observations**: Older data = growing uncertainty
4. **Perturbations**: Gravitational interactions with planets

### How We Handle It
- Display uncertainty level in asteroid info panel
- Warning icons for high-uncertainty objects
- Use latest JPL solutions (updated regularly)

---

## Example: Complete Data Flow

### Input: Asteroid `2023 DW`
1. **Horizons API** provides:
   ```
   e = 0.384
   a = 1.123 AU
   i = 2.92°
   Ω = 214.3°
   ω = 278.1°
   M = 156.2° (at epoch 2460000.5)
   ```

2. **SBDB API** provides:
   ```
   H = 24.7
   diameter = ~50 meters
   spec_T = "S"
   close_approach = "2046-02-14"
   miss_distance = 0.00055 AU (82,000 km)
   ```

3. **Enrichment** adds:
   ```
   "Stony asteroid, silicate composition"
   "Potentially concerning close approach"
   "Apollo-class orbit crosser"
   ```

4. **Visualization** creates:
   - Orange elliptical orbit (S-type)
   - Small sphere (~50m scaled)
   - Red orbit line (Apollo)
   - Label: "2023 DW - 82,000 km @ 23.4 km/s"
   - Countdown to Feb 14, 2046

---

## API Rate Limits & Best Practices

### Rate Limits
- **Horizons API**: No strict limit, but requests should be ≤1/second
- **SBDB API**: No strict limit, similar courtesy limit

### Best Practices Implemented
1. **Batch processing**: Download all asteroids in sequence
2. **Local caching**: Store JSON files to avoid re-fetching
3. **Error handling**: Retry with exponential backoff
4. **Respectful delays**: 100ms between requests

### Data Freshness
- **Orbital elements**: Updated when new observations available
- **Close approaches**: Recalculated when orbit updated
- **Physical data**: Rarely changes (unless new observations)

---

## References

### Official Documentation
- [Horizons API Documentation](https://ssd-api.jpl.nasa.gov/doc/horizons.html)
- [SBDB API Documentation](https://ssd-api.jpl.nasa.gov/doc/sbdb.html)
- [Orbital Elements Explained](https://ssd.jpl.nasa.gov/planets/approx_pos.html)

### Scientific Background
- **JPL Small-Body Database**: https://ssd.jpl.nasa.gov/sbdb.cgi
- **Near-Earth Object Program**: https://cneos.jpl.nasa.gov/
- **Keplerian Elements**: Classical orbital mechanics textbooks

---

## Version History

- **v3.0** (Oct 2025): Complete English translation, enhanced documentation
- **v2.0** (Sep 2025): Added complete Keplerian orbit calculations
- **v1.0** (Aug 2025): Initial data pipeline with basic visualization

---

*Last Updated: October 5, 2025*  
*Data Source: NASA Jet Propulsion Laboratory (JPL)*
