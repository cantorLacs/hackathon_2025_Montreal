# 🚀 Kinetic Impactor Implementation Plan

**Project**: NASA Asteroid Trajectory Visualizer  
**Feature**: Kinetic Impact Simulation  
**Complexity**: Basic  
**Start Date**: October 5, 2025  
**Status**: 🟡 Planning Phase

---

## 📋 Executive Summary

Implement a basic kinetic impactor simulation that allows users to:
- Configure an impactor (mass, velocity, beta factor)
- Simulate the impact on a selected asteroid
- Visualize the original orbit (green) vs modified orbit (red)
- See results: Δv, orbit change, period change

**Scope**: Basic physics only (Δv and semi-major axis change)  
**No**: Validation, uncertainties, presets, complex orbital mechanics

---

## 🎯 Implementation Checklist

### **Phase 0: Impactor-2025 Mode (UI Enhancement)** ✅

- [x] **0.1** Add "Impactor-2025" button in top-center of screen
  - [x] **0.1.1** Create button in HTML (prominent, centered)
  - [x] **0.1.2** Style with distinctive design (mission badge style)
  - [x] **0.1.3** Add icon/emoji (🎯 or 🚀)

- [x] **0.2** Implement "Impactor Mode" toggle functionality
  - [x] **0.2.1** Add `this.impactorMode = false` state in visualizer
  - [x] **0.2.2** Implement `enterImpactorMode()` method
    - Focus camera on Earth
    - Hide all asteroids (except selected/simulated)
    - Hide all orbit lines (except selected/simulated)
    - Show only: Earth, simulated asteroid, impactor (when launched)
  - [x] **0.2.3** Implement `exitImpactorMode()` method
    - Restore camera to previous view
    - Show all asteroids again
    - Show all orbit lines again
  - [x] **0.2.4** Add visual indicator when mode is active

- [x] **0.3** Update UI interactions
  - [x] **0.3.1** Button text toggle: "Impactor-2025" ↔ "Exit Impactor Mode"
  - [x] **0.3.2** Disable asteroid selection in impactor mode (except current)
  - [x] **0.3.3** Show instruction panel: "Select an asteroid to simulate impact"

**Estimated Time**: 1-2 hours  
**Actual Time**: ~1 hour  
**Status**: ✅ COMPLETED

---

### **Phase 1: Core Physics Module** ⏳

- [ ] **1.1** Create `src/kinetic-impactor.js` file
- [ ] **1.2** Implement `KineticImpactor` class
  - [ ] **1.2.1** Define density table (C, S, M types)
  - [ ] **1.2.2** Implement `calculateAsteroidMass(diameter, type)`
  - [ ] **1.2.3** Implement `calculateDeltaV(m_imp, v_imp, beta, m_ast)`
  - [ ] **1.2.4** Implement `calculateOrbitChange(a, e, deltaV, mu)`
  - [ ] **1.2.5** Implement `simulateImpact(asteroid, params)`
- [ ] **1.3** Add JSDoc documentation to all methods
- [ ] **1.4** Unit test with example (2020 VT4)

**Estimated Time**: 2-3 hours

---

### **Phase 2: UI Components** ⏳

- [ ] **2.1** Add "Impactor-2025" mode button (top-center)
  - [ ] **2.1.1** Position: fixed, top center of viewport
  - [ ] **2.1.2** Style: Mission badge design (border, shadow, glow)
  - [ ] **2.1.3** Color scheme: Blue/red gradient when active
  - [ ] **2.1.4** Animation: Pulse effect when mode is active

- [ ] **2.2** Add HTML panel in `asteroid-trajectory-viewer-modular.html`
  - [ ] **2.2.1** Create collapsible "Kinetic Impactor" section
  - [ ] **2.2.2** Add input: Impactor Mass (number, 100-100000 kg)
  - [ ] **2.2.3** Add input: Impact Velocity (number, 1-50 km/s)
  - [ ] **2.2.4** Add slider: Beta Factor (range, 1.0-5.0)
  - [ ] **2.2.5** Add button: "🎯 SIMULATE IMPACT"
  - [ ] **2.2.6** Add results display area (hidden by default)
  - [ ] **2.2.7** Add button: "↩️ RESET ORBIT"

- [ ] **2.3** Add CSS styling
  - [ ] **2.3.1** Style impactor mode button (prominent, centered)
  - [ ] **2.3.2** Style impact panel (similar to existing panels)
  - [ ] **2.3.3** Style inputs and sliders
  - [ ] **2.3.4** Style results section
  - [ ] **2.3.5** Add hover effects and transitions

**Estimated Time**: 2-3 hours

---

### **Phase 3: Integration with Visualizer** ⏳

- [ ] **3.1** Modify `asteroid-visualizer.js`
  - [ ] **3.1.1** Import KineticImpactor module in HTML
  - [ ] **3.1.2** Add `this.kineticImpactor = new KineticImpactor()` in constructor
  - [ ] **3.1.3** Add `this.impactSimulation = null` state variable
  - [ ] **3.1.4** Add `this.modifiedOrbitLine = null` for red orbit
  - [ ] **3.1.5** Add `this.impactorMode = false` state variable
  - [ ] **3.1.6** Store references to all asteroid meshes/lines for show/hide

- [ ] **3.2** Implement Impactor Mode methods
  - [ ] **3.2.1** `toggleImpactorMode()` - Main toggle handler
  - [ ] **3.2.2** `enterImpactorMode()` - Enter clean visualization mode
    - Focus camera on Earth (smooth transition)
    - Hide all asteroids except selected
    - Hide all orbit lines except selected
    - Disable asteroid selection (except current)
    - Show mode indicator
  - [ ] **3.2.3** `exitImpactorMode()` - Return to normal view
    - Restore all asteroids visibility
    - Restore all orbit lines
    - Re-enable asteroid selection
    - Hide mode indicator

- [ ] **3.3** Implement UI interaction methods
  - [ ] **3.3.1** `showImpactPanel(asteroid)` - Display panel when asteroid selected
  - [ ] **3.3.2** `hideImpactPanel()` - Hide panel when asteroid deselected
  - [ ] **3.3.3** Connect beta slider to display value
  - [ ] **3.3.4** Connect "SIMULATE IMPACT" button to handler
  - [ ] **3.3.5** Connect "Impactor-2025" button to toggleImpactorMode()

- [ ] **3.4** Implement simulation methods
  - [ ] **3.4.1** `simulateKineticImpact()` - Run physics simulation
  - [ ] **3.4.2** `displayImpactResults(results)` - Show results in UI
  - [ ] **3.4.3** Format numbers (scientific notation, units)

**Estimated Time**: 3-4 hours

---

### **Phase 4: Orbit Visualization** ⏳

- [ ] **4.1** Implement `createModifiedOrbit(newElements)`
  - [ ] **4.1.1** Generate orbit points from new elements
  - [ ] **4.1.2** Create THREE.Line with red color (0xff0000)
  - [ ] **4.1.3** Add to scene
  - [ ] **4.1.4** Store reference in `this.modifiedOrbitLine`
  - [ ] **4.1.5** Ensure modified orbit remains visible in Impactor Mode

- [ ] **4.2** Implement orbit comparison
  - [ ] **4.2.1** Keep original orbit visible (green)
  - [ ] **4.2.2** Overlay modified orbit (red)
  - [ ] **4.2.3** Optional: Add markers at close approach points
  - [ ] **4.2.4** In Impactor Mode: only show these two orbits

- [ ] **4.3** Implement impactor visualization (optional)
  - [ ] **4.3.1** Create small spacecraft mesh (simple geometry)
  - [ ] **4.3.2** Animate along trajectory to impact point
  - [ ] **4.3.3** Show "impact flash" effect at collision

- [ ] **4.4** Implement `resetOrbit()`
  - [ ] **4.4.1** Remove modified orbit from scene
  - [ ] **4.4.2** Remove impactor mesh if exists
  - [ ] **4.4.3** Clear simulation results
  - [ ] **4.4.4** Reset UI to default values
  - [ ] **4.4.5** Hide results panel

**Estimated Time**: 2-3 hours

---

### **Phase 5: Testing & Validation** ⏳

- [ ] **5.1** Test Impactor Mode functionality
  - [ ] **5.1.1** Button toggles mode correctly
  - [ ] **5.1.2** All asteroids hide except selected
  - [ ] **5.1.3** All orbit lines hide except selected
  - [ ] **5.1.4** Camera focuses on Earth smoothly
  - [ ] **5.1.5** Exit mode restores everything
  - [ ] **5.1.6** Visual indicator shows mode is active

- [ ] **5.2** Test with small asteroid (2020 VT4, ~1.8 km)
  - [ ] **5.2.1** Verify mass calculation (~7.6×10¹² kg)
  - [ ] **5.2.2** Test various impactor masses (100kg - 100,000kg)
  - [ ] **5.2.3** Verify Δv calculation (should be mm/s range)
  - [ ] **5.2.4** Verify orbit change (should be meters to km)
  - [ ] **5.2.5** Test in Impactor Mode (clean view)

- [ ] **5.3** Test with large asteroid (Apophis-sized, ~340m)
  - [ ] **5.3.1** Verify different spectral types affect mass
  - [ ] **5.3.2** Test beta factor range (1.0 - 5.0)
  - [ ] **5.3.3** Verify period change calculation
  - [ ] **5.3.4** Test in Impactor Mode (clean view)

- [ ] **5.4** Edge cases
  - [ ] **5.4.1** Very small impactor (100 kg) → minimal change
  - [ ] **5.4.2** Very large impactor (100,000 kg) → visible change
  - [ ] **5.4.3** Different beta values → proportional results
  - [ ] **5.4.4** Reset after simulation → clean state
  - [ ] **5.4.5** Toggle mode during simulation → correct behavior

- [ ] **5.5** UI/UX testing
  - [ ] **5.5.1** Impactor-2025 button prominent and accessible
  - [ ] **5.5.2** Panel shows/hides correctly
  - [ ] **5.5.3** All inputs respond properly
  - [ ] **5.5.4** Results display correctly formatted
  - [ ] **5.5.5** Both orbits visible simultaneously in Impactor Mode
  - [ ] **5.5.6** No performance issues when hiding/showing objects

**Estimated Time**: 2-3 hours

---

### **Phase 6: Documentation & Polish** ⏳

- [ ] **6.1** Update README.md
  - [ ] **6.1.1** Add "Kinetic Impactor Simulation" to features
  - [ ] **6.1.2** Add usage instructions
  - [ ] **6.1.3** Add example scenarios

- [ ] **6.2** Add code comments
  - [ ] **6.2.1** Document all new methods
  - [ ] **6.2.2** Add inline comments for complex formulas
  - [ ] **6.2.3** Add references to physics equations

- [ ] **6.3** Create user guide
  - [ ] **6.3.1** How to select asteroid
  - [ ] **6.3.2** How to configure impactor
  - [ ] **6.3.3** How to interpret results

- [ ] **6.4** Final polish
  - [ ] **6.4.1** Add tooltips to inputs
  - [ ] **6.4.2** Add help icons with explanations
  - [ ] **6.4.3** Test on different browsers
  - [ ] **6.4.4** Optimize performance

**Estimated Time**: 1 hour

---

### **Phase 7: Git & Deployment** ⏳

- [ ] **7.1** Git commits
  - [ ] **7.1.1** Commit kinetic-impactor.js module
  - [ ] **7.1.2** Commit UI changes (HTML/CSS)
  - [ ] **7.1.3** Commit visualizer integration
  - [ ] **7.1.4** Commit documentation updates

- [ ] **7.2** Testing
  - [ ] **7.2.1** Test in Chrome
  - [ ] **7.2.2** Test in Firefox
  - [ ] **7.2.3** Test in Edge

- [ ] **7.3** Deployment
  - [ ] **7.3.1** Push to GitHub
  - [ ] **7.3.2** Verify live version works
  - [ ] **7.3.3** Update version to 3.1

**Estimated Time**: 30 minutes

---

## 📐 Technical Specifications

### **Physics Formulas**

#### 1. Asteroid Mass
```
M = ρ × V
V = (4/3) × π × r³

Where:
  ρ = density (kg/m³)
  r = radius (m)
  M = mass (kg)
```

#### 2. Delta-V (Change in Velocity)
```
Δv = (m_imp × v_imp × (1 + β)) / M_ast

Where:
  m_imp = impactor mass (kg)
  v_imp = impact velocity (m/s)
  β = momentum enhancement factor (1-5)
  M_ast = asteroid mass (kg)
  Δv = change in velocity (m/s)
```

#### 3. Change in Semi-major Axis
```
Δa = (2 × a² × Δv) / h

Where:
  a = semi-major axis (km)
  Δv = delta-v (km/s)
  h = √(μ × a × (1-e²)) = specific angular momentum
  μ = GM_sun = 1.32712440018×10¹¹ km³/s²
  e = eccentricity
  Δa = change in semi-major axis (km)
```

#### 4. New Orbital Period
```
T = 2π × √(a³ / μ)

Where:
  a = semi-major axis (km)
  μ = GM_sun
  T = period (seconds)
```

---

### **Density Reference Table**

| Spectral Type | Composition | Density (kg/m³) | Example |
|---------------|-------------|-----------------|---------|
| **C-type** | Carbonaceous | 1,700 | Most common (~75%) |
| **S-type** | Silicaceous (stony) | 2,500 | Second most common (~17%) |
| **M-type** | Metallic | 5,500 | Iron-nickel composition |
| **Default** | Unknown | 2,000 | Conservative estimate |

---

### **Default Parameter Values**

| Parameter | Default | Min | Max | Unit | Notes |
|-----------|---------|-----|-----|------|-------|
| Impactor Mass | 1,000 | 100 | 100,000 | kg | DART was 570 kg |
| Impact Velocity | 10 | 1 | 50 | km/s | Typical: 5-25 km/s |
| Beta Factor (β) | 3.0 | 1.0 | 5.0 | - | DART: ~3.6 |

---

## 🎨 UI Design Mockup

### **Top-Center Button (Always Visible)**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              ┌─────────────────────┐                    │
│              │  🎯 Impactor-2025   │  ← Mission Mode    │
│              └─────────────────────┘                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### **Side Panel (When Asteroid Selected in Impactor Mode)**
```
┌─────────────────────────────────────────────┐
│  🚀 KINETIC IMPACTOR SIMULATION             │
├─────────────────────────────────────────────┤
│                                             │
│  Asteroid: 2020 VT4                         │
│  Type: S-type (Silicaceous)                 │
│  Diameter: 1.8 km                           │
│                                             │
│  ───────────────────────────────────────    │
│                                             │
│  Impactor Configuration:                    │
│                                             │
│  Mass (kg):                                 │
│  [    1000    ] ─────────────────           │
│                                             │
│  Velocity (km/s):                           │
│  [    10.0    ] ─────────────────           │
│                                             │
│  Beta Factor (β):                           │
│  [●────────────] 1.0  [3.0]  5.0            │
│                                             │
│  [   🎯 SIMULATE IMPACT   ]                 │
│                                             │
│  ───────────────────────────────────────    │
│                                             │
│  📊 Results:                                │
│                                             │
│  • Asteroid Mass: 7.6×10¹² kg               │
│  • Delta-V: 5.3 mm/s                        │
│  • Semi-major Axis Change: +0.4 km          │
│  • Orbital Period Change: +0.3 seconds      │
│  • Position Shift at Approach: ~2 km        │
│                                             │
│  Legend:                                    │
│  🟢 Original Orbit                          │
│  🔴 Modified Orbit                          │
│                                             │
│  [   ↩️ RESET ORBIT   ]                     │
│                                             │
└─────────────────────────────────────────────┘
```

### **Impactor Mode - Screen View**
```
┌─────────────────────────────────────────────────────────┐
│              ┌─────────────────────┐                    │
│              │ 🔴 EXIT IMPACTOR    │  ← Active Mode     │
│              └─────────────────────┘                    │
│                                                         │
│                                                         │
│                    🌍 EARTH                             │
│                                                         │
│           🟢━━━━━━━━━━━━━━━━━━━━━━━                     │
│         🔴━━━━━━━━━━━━━━━━━━━━━━━━━                     │
│                                                         │
│                        🪨 Asteroid (2020 VT4)           │
│                                                         │
│   ← CLEAN VIEW: Only Earth, selected asteroid,         │
│      original orbit (green), modified orbit (red)       │
│                                                         │
│   (All other asteroids and orbits are HIDDEN)          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Test Scenarios

### **Scenario 1: Small Impact on 2020 VT4**
```
ASTEROID: 2020 VT4
  Diameter: 1.8 km
  Type: S (ρ = 2500 kg/m³)
  Mass: ~7.6×10¹² kg
  Semi-major axis: 0.908 AU

IMPACTOR:
  Mass: 1,000 kg
  Velocity: 10 km/s
  Beta: 3.0

EXPECTED RESULTS:
  Δv: ~5.3 mm/s
  Δa: ~0.4 km
  ΔT: ~0.3 seconds
  Position shift: ~2 km
```

### **Scenario 2: Large Impact on Small Asteroid**
```
ASTEROID: 2020 QG (163m diameter)
  Diameter: 0.163 km
  Type: S (ρ = 2500 kg/m³)
  Mass: ~5.7×10⁹ kg
  
IMPACTOR:
  Mass: 10,000 kg
  Velocity: 15 km/s
  Beta: 4.0

EXPECTED RESULTS:
  Δv: ~105 mm/s (0.105 m/s)
  Δa: ~8 km
  ΔT: ~6 seconds
  Position shift: ~40 km
```

### **Scenario 3: DART-like Mission**
```
ASTEROID: Dimorphos-sized (160m)
  Diameter: 0.16 km
  Type: S (ρ = 2500 kg/m³)
  Mass: ~5×10⁹ kg
  
IMPACTOR:
  Mass: 570 kg (DART actual)
  Velocity: 6.6 km/s
  Beta: 3.6

EXPECTED RESULTS:
  Δv: ~27 mm/s
  Δa: ~2 km
  ΔT: ~1-2 seconds
  (Compare with real DART: -33 minutes period change in binary system)
```

---

## 🔧 File Structure

```
Hackathon/
├── src/
│   ├── asteroid-visualizer.js     (MODIFY - add integration)
│   ├── trajectory-simulator.js    (no changes)
│   └── kinetic-impactor.js        (NEW - core physics)
│
├── asteroid-trajectory-viewer-modular.html  (MODIFY - add UI)
│
├── README.md                       (UPDATE - add feature docs)
├── KINETIC_IMPACTOR_PLAN.md       (THIS FILE)
└── NASA_API_DATA.md               (no changes)
```

---

## 🚨 Known Limitations

1. **Simplified Physics**
   - Only changes semi-major axis (a)
   - Eccentricity (e), inclination (i), and other elements remain constant
   - Valid approximation for tangential impacts only

2. **No Gravitational Perturbations**
   - Does not account for planetary gravitational effects
   - No N-body simulation

3. **Instantaneous Impact**
   - Impact visualization is simplified
   - No crater formation or fragmentation modeling

4. **Single Impact Only**
   - Cannot simulate multiple sequential impacts
   - Cannot simulate binary asteroid systems

5. **Accuracy**
   - Results are estimates for educational purposes
   - Not suitable for mission planning
   - Should not be compared directly with real missions without context

6. **Impactor Mode Display**
   - Hides other asteroids for clarity (not deleted, just hidden)
   - Performance may vary with large asteroid datasets
   - Camera focus on Earth is fixed (not orbital)

---

## 📚 References

### Scientific Papers
- **DART Mission**: Johns Hopkins APL, NASA (2022)
  - Real impact: 570 kg @ 6.6 km/s
  - Result: -33 minutes orbital period change

### Physics Resources
- **Orbital Mechanics**: Howard D. Curtis (2014)
  - Chapter 8: Orbit Perturbations
- **Asteroid Deflection**: Wie, B. (2008)
  - "Dynamics and Control of Gravity Tractor Spacecraft"

### Online Tools
- NASA JPL Small-Body Database: https://ssd.jpl.nasa.gov/sbdb.cgi
- Horizons System: https://ssd.jpl.nasa.gov/horizons/

---

## 📈 Progress Tracking

**Current Status**: � Phase 0 Complete - Starting Phase 1 (Physics)

| Phase | Status | Progress | Time Spent | Time Estimated |
|-------|--------|----------|------------|----------------|
| Phase 0: Impactor Mode | ✅ Completed | 100% | 1h | 1-2h |
| Phase 1: Core Physics | ⏳ Not Started | 0% | 0h | 2-3h |
| Phase 2: UI Components | ⏳ Not Started | 0% | 0h | 2-3h |
| Phase 3: Integration | ⏳ Not Started | 0% | 0h | 3-4h |
| Phase 4: Visualization | ⏳ Not Started | 0% | 0h | 2-3h |
| Phase 5: Testing | ⏳ Not Started | 0% | 0h | 2-3h |
| Phase 6: Documentation | ⏳ Not Started | 0% | 0h | 1h |
| Phase 7: Deployment | ⏳ Not Started | 0% | 0h | 0.5h |
| **TOTAL** | | **~12%** | **1h** | **14-18.5h** |

**Legend**:
- ⏳ Not Started
- 🟡 In Progress
- ✅ Completed
- ❌ Blocked

---

## 🎯 Success Criteria

- [ ] **Impactor-2025 button** visible at top-center
- [ ] **Impactor Mode** toggles correctly (on/off)
- [ ] In Impactor Mode: all asteroids hidden except selected
- [ ] In Impactor Mode: all orbits hidden except selected
- [ ] In Impactor Mode: camera focuses on Earth
- [ ] User can select an asteroid (in normal or impactor mode)
- [ ] Impact panel appears with default values
- [ ] User can modify impactor parameters
- [ ] Simulation runs without errors
- [ ] Results display correctly with proper units
- [ ] Original orbit (green) remains visible
- [ ] Modified orbit (red) overlays correctly
- [ ] Clean visualization: Earth + asteroid + 2 orbits only
- [ ] Reset button clears everything
- [ ] Exit Impactor Mode restores all objects
- [ ] Works on Chrome, Firefox, Edge
- [ ] No performance degradation
- [ ] Code is documented
- [ ] README updated

---

## 🚀 Next Steps

### **Immediate Actions:**

1. **Phase 0**: Add "Impactor-2025" button and mode toggle
   - Create prominent top-center button
   - Implement `toggleImpactorMode()` method
   - Add visibility controls for asteroids/orbits
   - Camera focus on Earth

2. **Phase 1**: Create `src/kinetic-impactor.js`
   - Implement physics calculations
   - Test calculations manually

3. **Phase 2**: Add UI components
   - Impact simulation panel
   - Parameter inputs
   - Results display

4. **Phase 3**: Integrate with visualizer
   - Connect UI to physics
   - Handle mode transitions

5. **Phase 4**: Visualize orbits
   - Green (original) + Red (modified)
   - Optional impactor animation

6. **Phase 5**: Test end-to-end
   - Multiple scenarios
   - Edge cases
   - Performance

7. **Phase 6-7**: Document and deploy

---

## 🎬 User Experience Flow

### **Step 1: Enter Impactor Mode**
```
User clicks "Impactor-2025" button
  ↓
Camera smoothly focuses on Earth
  ↓
All asteroids fade out (except selected)
  ↓
All orbit lines fade out (except selected)
  ↓
Clean view: Earth + Selected Asteroid + Its Orbit
  ↓
Button text changes to "🔴 EXIT IMPACTOR"
```

### **Step 2: Select Asteroid & Simulate**
```
User clicks on an asteroid (or already selected)
  ↓
Impact panel appears with default values
  ↓
User adjusts parameters (mass, velocity, beta)
  ↓
User clicks "🎯 SIMULATE IMPACT"
  ↓
Physics calculations run
  ↓
Modified orbit (red) appears
  ↓
Results display in panel
```

### **Step 3: Analyze Results**
```
View comparison:
  🟢 Original orbit (green)
  🔴 Modified orbit (red)
  
Read results:
  • Δv, orbit change, period change
  
Optional: Reset and try different parameters
```

### **Step 4: Exit Mode**
```
User clicks "🔴 EXIT IMPACTOR"
  ↓
All asteroids fade back in
  ↓
All orbit lines fade back in
  ↓
Camera returns to previous view
  ↓
Button text changes to "🎯 Impactor-2025"
  ↓
Modified orbit remains visible (until reset)
```

---

**Last Updated**: October 5, 2025  
**Version**: 1.1 (Updated with Impactor Mode)  
**Author**: GitHub Copilot + User Collaboration
