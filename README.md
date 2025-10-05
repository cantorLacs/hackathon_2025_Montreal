# 🌌 Asteroid Trajectory Viewer - NASA NEO Visualizer# 🌌 Asteroid Trajectory Viewer - NASA NEO Visualizer# 🌌 Visualizador de Trayectorias de Asteroides NASA# 🌍 Simulación de la Tierra con Three.js



**Version 3.0 - Clean and Optimized Project**



Interactive 3D simulator of asteroid trajectories using real NASA data. Built with Three.js and high-precision Keplerian orbital mechanics.## 🚀 Inicio Rápido



![Status](https://img.shields.io/badge/status-active-success.svg)

![Version](https://img.shields.io/badge/version-3.0-blue.svg)

![Three.js](https://img.shields.io/badge/Three.js-r158-orange.svg)```bash**Versión 2.0 - Arquitectura Modularizada con Precisión Mejorada**Una aplicación interactiva 3D que simula la Tierra y permite agregar cráteres para estudiar su impacto visual.



---# Abre el visualizador



## 🚀 Quick Startstart asteroid-trajectory-viewer-modular.html



```bash```

# Open the visualizer

start asteroid-trajectory-viewer-modular.htmlSimulador 3D interactivo de trayectorias asteroidales usando datos reales de la NASA. Construido con Three.js y mecánica orbital Kepleriana.## 🚀 Características

```

### Cargar Asteroides

The visualizer automatically loads with:

- ✅ 200 closest asteroids to Earth (NASA data)- Haz clic en **"🚀 Cargar Récords Históricos"** para ver los 200 asteroides más cercanos a la Tierra

- ✅ Auto-focus on Earth

- ✅ Filter showing the 10 closest approaches

- ✅ Simulation started automatically

------- **Modelo 3D realista de la Tierra** con texturas y materiales

---



## ✨ Main Features

## 📁 Estructura del Proyecto- **Sistema de cráteres interactivo** con diferentes tamaños y complejidad

### 🎯 3D Visualization

- **Interactive Solar System** with the Sun and Earth

- **200 NEO asteroids** with real orbits and trajectories

- **Custom colors**:```## ✨ Novedades en v2.0- **Controles de cámara intuitivos** (rotación, zoom, panorámica)

  - 🔵 Blue Earth with green orbit

  - 🔴 Red asteroids with gray orbitsHackathon/

- **Smooth animation** with Three.js r158

├── asteroid-trajectory-viewer-modular.html  # HTML principal ⭐- **Campo de estrellas** para ambiente espacial

### 📊 Precise NASA Data

- **Real orbital elements** from NASA JPL SBDB├── src/                                     # JavaScript core

- **Verified approach dates** (last 20 years)

- **Exact distances** at closest approach moment│   ├── asteroid-visualizer.js### 🎯 Mejora de Precisión- **Interfaz de usuario completa** con controles y estadísticas

- **Improved precision**: Error < 15,000 km (vs 73M km in previous versions)

│   ├── trajectory-simulator.js

### 🎮 Interactive Controls

- **Distance filter**: Slider to show from 5 to 200 asteroids│   └── data-enricher.js- **Posición de la Tierra**: Ahora usa propagación Kepleriana completa con elementos orbitales reales- **Atajos de teclado** para acceso rápido a funciones

- **Object focus**: Click asteroid or "🌍 Focus Earth" button

- **Time control**:├── data/                                    # Datos

  - ▶️ Play/Pause

  - ⏪ ⏩ Rewind/Forward│   ├── top200_closest_asteroids_FINAL.json- **Error reducido**: De **73 millones de km** → **15,000 km** (mejora de 4,800x)

  - 🎚️ Jog/Shuttle control for precise navigation

  - 📅 Specific date selector│   └── sbdb_query_results.csv

- **3D Camera**:

  - 🖱️ Rotate (drag with mouse)├── scripts/                                 # Automatización- **Válido para**: ±100 años desde época J2000.0 sin degradación## 🎮 Controles

  - 🔍 Zoom (mouse wheel)

  - 🎯 Maintains focus on selected object│   ├── auto_download_top200.ps1



### 🔍 Real-Time Information│   ├── process_asteroids.js

- **Earth-Asteroid distance** updated every frame

- **Current date** of simulation│   └── update_visualizer.js

- **Selected asteroid details**:

  - ID and name└── archive/                                 # Archivos antiguos### 📦 Código Modularizado  ### Mouse

  - Estimated diameter

  - Complete orbital elements```

  - Date and distance of closest approach

- `src/trajectory-simulator.js` - Motor de cálculo orbital- **Click y arrastra**: Rotar la vista alrededor de la Tierra

---

---

## 📁 Project Structure

- `src/asteroid-visualizer.js` - Visualización 3D con Three.js- **Scroll**: Hacer zoom in/out

```

Hackathon/## 🎮 Controles

├── asteroid-trajectory-viewer-modular.html  # ⭐ Main file

├── src/                                     # Modular JavaScript- Versión inline disponible en `archive/` para compatibilidad- **Click derecho + arrastra**: Panorámica

│   ├── asteroid-visualizer.js              # Main 3D visualizer

│   ├── trajectory-simulator.js             # Keplerian propagation engine### ⏯️ Tiempo

│   └── data-enricher.js                    # NASA data enricher

├── data/                                    # Asteroid data- Play/Pause, Reset, Saltar a fecha

│   ├── top200_closest_asteroids_FINAL.json # 200 verified asteroids

│   └── sbdb_query_results.csv              # Complete SBDB database

├── README.md                                # This documentation

└── .gitignore                               # Files ignored by Git### 🎮 Jog/Shuttle---### Teclado

```

- Slider para avanzar/retroceder manualmente

---

- **C**: Agregar cráter aleatorio

## 🛠️ Technologies Used

### ⚡ Velocidad

- **Three.js r158**: 3D rendering

- **Keplerian Orbital Mechanics**: Orbit propagation- 🐌 Lenta → 🚀 Muy Rápida## 📁 Estructura del Proyecto- **X**: Limpiar todos los cráteres

- **NASA JPL APIs**:

  - Close Approach Data (CAD)

  - Small-Body Database (SBDB)

  - Lookup API### 🎯 Cámara  - **W**: Alternar modo wireframe

- **JavaScript ES6+**: Clean and modular code

- 🌍 Enfocar Tierra

---

- 🔄 Resetear Vista```- **Espacio**: Pausar/Reanudar rotación de la Tierra

## 📊 Asteroid Data



### Data Source

All asteroids come from NASA's official database:---hackathon/- **R**: Resetear vista de cámara

- **NASA JPL Close Approach Data**: Verified approaches (1900-2100)

- **NASA SBDB**: High-precision orbital elements (10+ decimals)



### Top 5 Closest Asteroids## 📊 Datos├── asteroid-trajectory-viewer.html  # Archivo principal (puede necesitar versión inline)

1. **2020 VT4**: 6,740 km (Nov 13, 2020) - World record 🥇

2. **2020 QG**: 2,950 km (Aug 16, 2020)

3. **2011 CQ1**: 5,480 km (Feb 4, 2011)

4. **2020 JJ**: 7,000 km (May 4, 2020)### Top 5 Récords├── src/                             # Código fuente modularizado ⭐ NUEVO### Interfaz de Usuario

5. **2023 BU**: 3,600 km (Jan 27, 2023)

| # | Nombre | Distancia | Fecha |

---

|---|--------|-----------|-------|│   ├── trajectory-simulator.js      # Motor de cálculo Kepleriano- **Velocidad de Rotación**: Controla qué tan rápido gira la Tierra

## 🎯 Advanced Features

| 1 | 2020 VT4 | 6,746 km | 2020-11-13 |

### Auto-Initialization

When loading the page:| 2 | 2025 TF | 6,780 km | 2025-10-01 |│   └── asteroid-visualizer.js       # Visualización Three.js- **Tamaño de Cráter**: Ajusta el tamaño de los nuevos cráteres

1. Automatic loading of 200 asteroids

2. Initial filter: 10 closest| 3 | 2024 XA | 7,726 km | 2024-12-01 |

3. Auto-focus on Earth

4. Simulation running| 4 | 2024 LH1 | 8,098 km | 2024-06-06 |├── docs/                            # Documentación técnica ⭐ ORGANIZADA- **Agregar Cráter Aleatorio**: Crea un cráter en posición aleatoria



### Asteroid Selection| 5 | 2024 UG9 | 8,850 km | 2024-10-30 |

When clicking an asteroid:

1. Jumps to **2 weeks before** closest approach│   ├── ALTERNATIVAS-PRECISION.md    # Análisis de alternativas- **Agregar 5 Cráteres**: Crea múltiples cráteres de una vez

2. Maintains focus on asteroid

3. Time continues running (no pause)**200 asteroides** con elementos orbitales REALES de NASA SBDB

4. You can see the complete approach

│   ├── CALCULO-POSICION-TIERRA.md   # Método actual explicado- **Coordenadas específicas**: Crear cráteres en latitud/longitud exacta

### Time Navigation

- **Jog/Shuttle**: Precise speed and direction control---

- **Speed slider**: -100 (fast rewind) to +100 (fast forward)

- **Auto-return**: Returns to normal speed when released│   ├── ERROR-TEMPORAL-1901.md       # Limitaciones temporales- **Limpiar Cráteres**: Elimina todos los cráteres existentes



---## 🔧 Actualizar Datos



## 🔧 Technical Improvements (v3.0)│   └── [otros documentos]



### Improved Camera System```powershell

- ✅ Dynamic focus that follows moving objects

- ✅ Maintains orientation when rotating/zoomingcd scripts├── archive/                         # Versiones anteriores ⭐ NUEVO## 🛠️ Tecnologías Utilizadas

- ✅ `cameraTarget` update every frame

- ✅ No OrbitControls dependencies.\auto_download_top200.ps1



### Performance Optimizationsnode process_asteroids.js│   └── asteroid-trajectory-viewer-inline.html  # Versión monolítica completa

- ✅ Modular code separated into 3 files

- ✅ Elimination of 110 obsolete filesnode update_visualizer.js

- ✅ Clean and maintainable structure

- ✅ No duplicate code```├── json_Nasa/                       # Datos JSON de NASA- **Three.js**: Biblioteca JavaScript para gráficos 3D



### Simplified UI

- ❌ Removed file loading controls

- ❌ Removed unnecessary speed presets---└── README.md                        # Este archivo- **WebGL**: Renderizado acelerado por hardware

- ❌ Removed redundant visualization toggles

- ✅ Only essential and functional controls



---Ver **RESUMEN_200_ASTEROIDES.md** para documentación completa.```- **HTML5 Canvas**: Para renderizado y eventos de mouse



## 📝 Version History

- **CSS3**: Estilos modernos y responsivos

### v3.0 (October 2025) - Complete Cleanup

- 🧹 Elimination of 110 obsolete files---

- 🎯 Improved dynamic focus (Earth and asteroids)

- ⏰ Continuous time when selecting asteroids## 📁 Estructura del Proyecto

- 📅 Jump to 2 weeks before approach

- 🎨 Clean and professional project structure## 🚀 Inicio Rápido



### v2.0 (September 2025) - Modularization```

- 📦 Separation into JavaScript modules

- 🎯 Improved orbital precision (error < 15,000 km)### Opción A: Usar Versión Inline (Recomendado)📂 Simulación de la Tierra/

- 📊 200 NASA-verified asteroids

- 🎮 Jog/Shuttle control system```bash├── 📄 index.html          # Archivo principal HTML



### v1.0 (August 2025) - Initial Version# Abrir directamente (todo el código en un archivo)├── 📁 js/

- 🌍 Basic 3D visualization

- 🪐 5 test asteroidsarchive/asteroid-trajectory-viewer-inline.html│   ├── 📄 main.js         # Lógica principal de la aplicación

- 🎥 Simple camera controls

```│   └── 📄 textures.js     # Configuración de texturas

---

└── 📁 textures/           # (Opcional) Texturas locales

## 🤝 Credits

### Opción B: Versión Modularizada (Requiere servidor)```

- **Data**: NASA JPL (Jet Propulsion Laboratory)

- **Rendering**: Three.js```bash

- **Developed for**: Hackathon 2025 Montreal

# Iniciar servidor local## 🔧 Configuración e Instalación

---

python -m http.server 8000

## 📧 Contact

### Método 1: Servidor Local Simple

For questions, suggestions, or to report bugs, open an issue in the repository.

# Abrir navegador```bash

---

http://localhost:8000/asteroid-trajectory-viewer.html# Navegar al directorio del proyecto

**Made with ❤️ for space exploration**

```cd "d:\LaSalle\Hackathon"



### Cargar Datos# Iniciar servidor HTTP simple con Python 3

1. Clic en **"📂 Cargar Datos NASA"**python -m http.server 8080

2. Seleccionar `json_Nasa/data.json`

3. Sistema carga hasta 50 asteroides# O con Node.js (si tienes npx instalado)

npx serve .

---

# Abrir navegador en http://localhost:8080

## 🎮 Funcionalidades Principales```



- **Visualización 3D**: Sistema solar con Sol, Tierra y hasta 50 asteroides### Método 2: Abrir Directamente

- **Órbitas completas**: Período orbital real, no segmentosSimplemente abre el archivo `index.html` en tu navegador moderno.

- **Control de tiempo**: Play/pausa, velocidad 0.1-70 días/frame, jog manual

- **Date picker**: Saltar a fechas específicas## 🎯 Cómo Usar

- **Aproximaciones**: Botones para ver eventos cercanos

- **Cámara**: Seguimiento automático con control manual1. **Exploración Básica**:

- **Información**: Elementos orbitales, próximas aproximaciones, peligrosidad   - Abre la aplicación en tu navegador

   - Usa el mouse para rotar y hacer zoom en la Tierra

---   - Observa el fondo estrellado y la rotación automática



## 🔬 Precisión del Modelo2. **Agregar Cráteres**:

   - Haz click en "Agregar Cráter Aleatorio" para crear cráteres

### Método de Cálculo (v2.0)   - Ajusta el tamaño con el slider antes de crear cráteres

   - Usa coordenadas específicas para ubicaciones exactas

#### Posición de Asteroides

- Propagación Kepleriana de 2 cuerpos3. **Experimentar con Parámetros**:

- Solver Newton-Raphson para ecuación de Kepler   - Cambia la velocidad de rotación

- Transformaciones: Orbital → Heliocéntrica → Geocéntrica   - Prueba diferentes tamaños de cráteres

   - Usa el modo wireframe para ver la geometría

#### Posición de la Tierra ⭐ MEJORADA

```4. **Cráteres en Ubicaciones Reales**:

ANTES (v1.x):   ```

- Modelo circular simplificado   Ejemplos de coordenadas famosas:

- Error: ~73M km en 124 años   - Cráter de Chicxulub: Lat: 21.4, Lon: -89.5

   - Cráter Vredefort: Lat: -27.0, Lon: 27.5

AHORA (v2.0):   - Cráter Barringer: Lat: 35.0, Lon: -111.0

- Elementos orbitales completos   ```

  · a = 1.00000011 AU

  · e = 0.01671022 (excentricidad real)## 🎓 Conceptos de Three.js Explicados

  · Período = 365.256363004 días (sideral exacto)

- Error: ~15,000 km en 124 años### Componentes Fundamentales

- Mejora: 4,800x más preciso1. **Scene**: El mundo 3D donde existen todos los objetos

```2. **Camera**: Define el punto de vista del observador

3. **Renderer**: Dibuja la escena en el canvas HTML

### Precisión por Rango Temporal4. **Geometry**: Define la forma de los objetos (esferas, planos, etc.)

5. **Material**: Define el aspecto visual (color, textura, brillo)

| Período | Error Tierra | Error Asteroide | Confiabilidad |6. **Mesh**: Combina geometría + material = objeto visible

|---------|--------------|-----------------|---------------|7. **Lights**: Iluminan la escena para crear realismo

| ±1 año  | < 1M km      | < 1M km         | ⭐⭐⭐⭐⭐ Excelente |

| ±10 años | ~12M km     | 5-30M km        | ⭐⭐⭐ Buena |### Flujo de Renderizado

| ±100 años | ~73M km    | 100-200M km     | ⭐ Limitada |```

Crear Escena → Agregar Objetos → Configurar Cámara → Renderizar Frame → Repetir

---```



## 📖 Documentación Técnica## 🌟 Posibles Mejoras y Extensiones



### Cálculos y Precisión### Nivel Principiante

- [`ALTERNATIVAS-PRECISION.md`](docs/ALTERNATIVAS-PRECISION.md) - Comparación de 3 niveles de mejora- [ ] Agregar más texturas (nubes, atmósfera)

- [`CALCULO-POSICION-TIERRA.md`](docs/CALCULO-POSICION-TIERRA.md) - Método actual detallado- [ ] Cambiar colores de los cráteres

- [`ERROR-TEMPORAL-1901.md`](docs/ERROR-TEMPORAL-1901.md) - Limitaciones históricas- [ ] Agregar sonidos de impacto

- [ ] Mostrar información de cada cráter al hacer click

### Funcionalidades

- [`CONTROL-DE-FECHAS.md`](docs/CONTROL-DE-FECHAS.md) - Sistema de navegación temporal### Nivel Intermedio

- [`CONTROL-JOG-TIEMPO.md`](docs/CONTROL-JOG-TIEMPO.md) - Control jog/shuttle- [ ] Animaciones de impacto con partículas

- [`SEGUIMIENTO-DE-CAMARA.md`](docs/SEGUIMIENTO-DE-CAMARA.md) - Sistema de cámara- [ ] Diferentes tipos de cráteres (volcánicos, de impacto)

- [ ] Sistema de día/noche con texturas diferentes

---- [ ] Luna orbitando alrededor de la Tierra



## 🎓 Para Presentaciones### Nivel Avanzado

- [ ] Simulación física de impactos

### Mensaje Clave sobre Precisión- [ ] Deformación real de la geometría terrestre

- [ ] Múltiples planetas o lunas

> "Usamos **propagación Kepleriana completa** con elementos orbitales J2000 tanto para la Tierra como para los asteroides. Esto nos da una precisión de **~15,000 km** (0.01%) en rangos de ±100 años, suficiente para visualización educativa. Las **fechas de aproximación vienen pre-calculadas por NASA JPL** con máxima precisión."- [ ] Efectos atmosféricos con shaders personalizados

- [ ] Carga de datos reales de cráteres desde APIs

### Limitaciones a Mencionar

## 📚 Recursos de Aprendizaje

> "El modelo usa **propagación de 2 cuerpos**, válido para fechas cercanas (±10 años). Para fechas históricas, los **datos tabulares de NASA son exactos**, pero la visualización 3D es aproximada porque no incluye perturbaciones planetarias acumuladas."

### Three.js Oficial

### Mejoras v2.0- [Documentación Three.js](https://threejs.org/docs/)

- [Ejemplos Three.js](https://threejs.org/examples/)

> "En v2.0 implementamos **elementos orbitales completos para la Tierra** (en lugar del modelo circular anterior), mejorando la precisión de **73M km a 15,000 km** - una mejora de **4,800 veces**. También **modularizamos el código** para mejor mantenibilidad."- [Manual Three.js](https://threejs.org/manual/)



---### Tutoriales Recomendados

- [Three.js Journey](https://threejs-journey.com/)

## 🛠️ Código Fuente- [Three.js Fundamentals](https://threejsfundamentals.org/)

- [MDN WebGL Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial)

### `src/trajectory-simulator.js`

Motor de cálculo orbital con:### Texturas y Recursos

- Parser de JSON NASA- [NASA Visible Earth](https://visibleearth.nasa.gov/)

- Solver de ecuación de Kepler (Newton-Raphson)- [Solar System Scope Textures](https://www.solarsystemscope.com/textures/)

- **getEarthPosition()** mejorado con Kepler completo- [Free PBR Materials](https://freepbr.com/)

- Generador de trayectorias

## 🐛 Solución de Problemas

### `src/asteroid-visualizer.js`

Visualización Three.js con:### La Tierra se ve muy oscura

- Renderizado 3D del sistema solar- Verifica que las luces estén configuradas correctamente

- Gestión de asteroides y órbitas- Aumenta la intensidad de `AmbientLight`

- Sistema de cámara con seguimiento- Comprueba que el material tenga las propiedades correctas

- Controles de tiempo y UI

### Los cráteres no aparecen

---- Abre la consola del navegador (F12) para ver errores

- Verifica que los event listeners estén funcionando

## 📊 Requisitos Técnicos- Asegúrate de que `earthGroup` esté creado antes de agregar cráteres



- **Navegador**: Chrome/Firefox/Safari con WebGL 2.0### Textura no carga

- **Dependencias**: Three.js r158 (CDN)- Revisa la conexión a internet para texturas externas

- **Rendimiento**: Hasta 50 asteroides @ 60 FPS- Verifica las URLs en `textures.js`

- El sistema tiene fallback a texturas generadas por código

---

### Rendimiento lento

## 📝 Historial- Reduce el número de segmentos en la geometría de la esfera

- Disminuye la cantidad de estrellas en el campo estelar

### v2.0 (Octubre 2025)- Limpia cráteres regularmente con "Limpiar Cráteres"

- ✨ Kepler completo para la Tierra (mejora 4,800x)

- 📦 Código modularizado (src/trajectory-simulator.js, src/asteroid-visualizer.js)## 📄 Licencia

- 📁 Estructura organizada (src/, docs/, archive/)

- 📚 Documentación técnica completaEste proyecto es educativo y de código abierto. Siéntete libre de modificar y experimentar.



### v1.x (Desarrollo Inicial)## 🤝 Contribuciones

- 🎮 Visualizador 3D funcional

- ☄️ Carga datos NASA¡Las contribuciones son bienvenidas! Algunas ideas:

- 🎥 Cámara con seguimiento- Mejorar los efectos visuales

- 📅 Control de tiempo completo- Optimizar el rendimiento

- Agregar nuevas funcionalidades

---- Mejorar la documentación

- Crear tutorials adicionales

## 🌟 Créditos

---

- **NASA JPL** - Datos de NeoWs API

- **Three.js** - Visualización 3D**¡Disfruta explorando el universo 3D con Three.js! 🌌**
- **LaSalle** - Hackathon 2025

---

**Desarrollado para el Hackathon de LaSalle 2025** 🚀

Para más detalles técnicos, consulta la carpeta `docs/`.
