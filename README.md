# 🌌 Asteroid Trajectory Viewer - NASA NEO Visualizer

**Version 3.0 - Clean and Optimized Project**

Interactive 3D simulator of asteroid trajectories using real NASA data. Built with Three.js and high-precision Keplerian orbital mechanics.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-3.0-blue.svg)
![Three.js](https://img.shields.io/badge/Three.js-r158-orange.svg)

---

<img width="1911" height="1017" alt="image" src="https://github.com/user-attachments/assets/256d2e7b-7044-4f75-9233-162cc5229333" />


## 🚀 Quick Start

```bash
# Open the visualizer
start asteroid-trajectory-viewer-modular.html
```

🌐 Live Demo

👉 **Try it here:** [Asteroid Trajectory Viewer - GitHub Pages](https://cantorlacs.github.io/hackathon_2025_Montreal/)


### Auto-Loading

The visualizer automatically loads with:
- ✅ 200 closest asteroids to Earth (NASA data)
- ✅ Auto-focus on Earth
- ✅ Filter showing the 10 closest approaches
- ✅ Simulation started automatically

---

## ✨ Main Features

### 🎯 3D Visualization
- **Interactive Solar System** with the Sun and Earth
- **200 NEO asteroids** with real orbits and trajectories
- **Custom colors**:
  - 🔵 Blue Earth with green orbit
  - 🔴 Red asteroids with gray orbits
- **Smooth animation** with Three.js r158
- **Star field** for space atmosphere

### 📊 Precise NASA Data
- **Real orbital elements** from NASA JPL SBDB
- **Verified approach dates** (last 20 years)
- **Exact distances** at closest approach moment
- **Improved precision**: Error < 15,000 km (vs 73M km in previous versions)

### 🎮 Interactive Controls
- **Distance filter**: Slider to show from 5 to 200 asteroids
- **Object focus**: Click asteroid or "🌍 Focus Earth" button
- **Time control**:
  - ▶️ Play/Pause
  - ⏪ ⏩ Rewind/Forward
  - 🎚️ Jog/Shuttle control for precise navigation
  - 📅 Specific date selector
- **3D Camera**:
  - 🖱️ Rotate (drag with mouse)
  - 🔍 Zoom (mouse wheel)
  - 🎯 Maintains focus on selected object

### 🔍 Real-Time Information
- **Earth-Asteroid distance** updated every frame
- **Current date** of simulation
- **Selected asteroid details**:
  - ID and name
  - Estimated diameter
  - Complete orbital elements
  - Date and distance of closest approach

---

## 📁 Project Structure

```
Hackathon/
├── asteroid-trajectory-viewer-modular.html  # ⭐ Main file
├── src/                                     # Modular JavaScript
│   ├── asteroid-visualizer.js              # Main 3D visualizer
│   └── trajectory-simulator.js             # Keplerian propagation engine
├── data/                                    # Asteroid data
│   └── top200_closest_asteroids_FINAL.json # 200 verified asteroids (embedded)
├── README.md                                # This documentation
├── NASA_API_DATA.md                         # NASA API data reference
└── .gitignore                               # Files ignored by Git
```

---

## 🛠️ Technologies Used

- **Three.js r158**: 3D rendering
- **Keplerian Orbital Mechanics**: Orbit propagation
- **NASA JPL APIs**:
  - Close Approach Data (CAD)
  - Small-Body Database (SBDB)
  - Lookup API
- **JavaScript ES6+**: Clean and modular code

---

## 📊 Asteroid Data

### Data Source
All asteroids come from NASA's official database:
- **NASA JPL Close Approach Data**: Verified approaches (1900-2100)
- **NASA SBDB**: High-precision orbital elements (10+ decimals)

### Top 5 Closest Asteroids

| # | Name | Distance | Date |
|---|------|----------|------|
| 1 | 2020 VT4 | 6,746 km | 2020-11-13 |
| 2 | 2025 TF | 6,780 km | 2025-10-01 |
| 3 | 2024 XA | 7,726 km | 2024-12-01 |
| 4 | 2024 LH1 | 8,098 km | 2024-06-06 |
| 5 | 2024 UG9 | 8,850 km | 2024-10-30 |

**200 asteroids** with REAL orbital elements from NASA SBDB

---

## 🎯 Advanced Features

### Auto-Initialization
When loading the page:
1. Automatic loading of 200 asteroids
2. Initial filter: 10 closest
3. Auto-focus on Earth
4. Simulation running

### Asteroid Selection
When clicking an asteroid:
1. Jumps to **2 weeks before** closest approach
2. Maintains focus on asteroid
3. Time continues running (no pause)
4. You can see the complete approach

### Time Navigation
- **Jog/Shuttle**: Precise speed and direction control
- **Speed slider**: -100 (fast rewind) to +100 (fast forward)
- **Auto-return**: Returns to normal speed when released

---

## 🔬 Precision Model

### Calculation Method (v2.0+)

#### Asteroid Position
- Keplerian 2-body propagation
- Newton-Raphson solver for Kepler's equation
- Transformations: Orbital → Heliocentric → Geocentric

