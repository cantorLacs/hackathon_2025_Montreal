# 🧹 LIMPIEZA DEL PROYECTO

## Archivos a MANTENER (Esenciales)

### HTML Principal
- ✅ `asteroid-trajectory-viewer-modular.html` - Visualizador principal MODULAR

### JavaScript Core
- ✅ `src/asteroid-visualizer.js` - Visualizador principal
- ✅ `src/trajectory-simulator.js` - Simulador de trayectorias
- ✅ `src/data-enricher.js` - Enriquecedor de datos

### Datos Esenciales
- ✅ `top200_closest_asteroids_FINAL.json` - 200 asteroides con elementos REALES
- ✅ `sbdb_query_results.csv` - Base de datos de 2,463 asteroides

### Scripts de Automatización
- ✅ `auto_download_top200.ps1` - Script de descarga automática
- ✅ `process_asteroids.js` - Procesador de datos
- ✅ `update_visualizer.js` - Actualizador del visualizador

### Documentación
- ✅ `README.md` - Documentación principal
- ✅ `RESUMEN_200_ASTEROIDES.md` - Resumen del trabajo

---

## Archivos a MOVER a /archive (No esenciales)

### HTMLs Antiguos/Test
- 🗄️ `asteroid-trajectory-viewer.html` - Versión antigua NO modular
- 🗄️ `temp-ui.html` - UI temporal
- 🗄️ `test-csv-loading.html` - Test
- 🗄️ `test_orpheus_propagation.html` - Test

### JSONs de Prueba/Intermedios
- 🗄️ `2011_CQ1_real.json` - Individual, ya está en top200
- 🗄️ `2020_JJ_real.json` - Individual, ya está en top200
- 🗄️ `2020_QG_real.json` - Individual, ya está en top200
- 🗄️ `2020_VT4_elements.json` - Individual, ya está en top200
- 🗄️ `2020_VT4_real.json` - Individual, ya está en top200
- 🗄️ `2023_BU_elements.json` - Individual, ya está en top200
- 🗄️ `2023_BU_real.json` - Individual, ya está en top200
- 🗄️ `_real.json` - Archivo extraño
- 🗄️ `data.json` - Antiguo
- 🗄️ `data2.json` - Antiguo
- 🗄️ `test_asteroid.json` - Test
- 🗄️ `test_cad.json` - Test
- 🗄️ `neo_browse.json` - No usado
- 🗄️ `closest_approaches_20years.json` - Reemplazado por top200
- 🗄️ `closest_approaches_formatted.json` - Reemplazado
- 🗄️ `close_asteroids_verified.json` - Antiguo
- 🗄️ `precise_orbital_elements.json` - Antiguo
- 🗄️ `top20_closest_asteroids_verified.json` - Reemplazado por top200
- 🗄️ `top20_closest_precise.json` - Reemplazado
- 🗄️ `top5_closest_REAL_elements.json` - Reemplazado
- 🗄️ `top5_real_orbital_elements.json` - Reemplazado
- 🗄️ `step1_cad_data.json` - Intermedio
- 🗄️ `step2_orbital_elements.json` - Intermedio

### Horizons Data (Individuales, ya procesados)
- 🗄️ `horizons_2019 VL5.json`
- 🗄️ `horizons_2020 FA5.json`
- 🗄️ `horizons_2025 SC29.json`
- 🗄️ `horizons_2025 SY10.json`
- 🗄️ `horizons_2025SY10.txt`
- 🗄️ `horizons_2025SY10_clean.txt`
- 🗄️ `horizons_3361.json`
- 🗄️ `horizons_batch.txt`
- 🗄️ `horizons_close_asteroids_batch.txt`
- 🗄️ `horizons_orpheus.txt`

### Scripts Python de Test
- 🗄️ `check_earth_error.py`
- 🗄️ `check_epochs.py`
- 🗄️ `check_icarus_orbit.py`
- 🗄️ `temp_check_epoch.py`

### Scripts PowerShell Antiguos
- 🗄️ `download_top200.ps1` - Versión antigua con errores
- 🗄️ `extract_real_elements.ps1` - Ya no se usa
- 🗄️ `fetch_precise_elements.ps1` - Ya no se usa
- 🗄️ `get_closest_asteroids.ps1` - Ya no se usa
- 🗄️ `get_top200_closest.ps1` - Versión antigua

### Scripts de Verificación (Ya completados)
- 🗄️ `diagnostico.js`
- 🗄️ `verificar_datos.js`

### Documentación Intermedia
- 🗄️ `CONTROLES_AGREGADOS.md` - Info incluida en README
- 🗄️ `VERIFICACION_CONTROLES.md` - Info incluida en README

---

## Estructura FINAL Propuesta

```
Hackathon/
├── 📄 asteroid-trajectory-viewer-modular.html (ÚNICO HTML)
├── 📁 src/
│   ├── asteroid-visualizer.js
│   ├── trajectory-simulator.js
│   └── data-enricher.js
├── 📁 data/
│   ├── top200_closest_asteroids_FINAL.json
│   └── sbdb_query_results.csv
├── 📁 scripts/
│   ├── auto_download_top200.ps1
│   ├── process_asteroids.js
│   └── update_visualizer.js
├── 📁 textures/ (si se usan)
├── 📁 archive/ (TODO lo demás)
├── 📄 README.md
└── 📄 RESUMEN_200_ASTEROIDES.md
```

---

## Comandos para Limpieza

```powershell
# Crear estructura
New-Item -ItemType Directory -Force -Path "data"
New-Item -ItemType Directory -Force -Path "scripts"
New-Item -ItemType Directory -Force -Path "archive/old_json"
New-Item -ItemType Directory -Force -Path "archive/old_scripts"
New-Item -ItemType Directory -Force -Path "archive/old_html"

# Mover datos
Move-Item "top200_closest_asteroids_FINAL.json" "data/"
Move-Item "sbdb_query_results.csv" "data/"

# Mover scripts
Move-Item "auto_download_top200.ps1" "scripts/"
Move-Item "process_asteroids.js" "scripts/"
Move-Item "update_visualizer.js" "scripts/"

# Archivar JSONs antiguos
Move-Item "*_real.json" "archive/old_json/"
Move-Item "data*.json" "archive/old_json/"
Move-Item "test*.json" "archive/old_json/"
Move-Item "horizons*.json" "archive/old_json/"
Move-Item "step*.json" "archive/old_json/"
Move-Item "top5*.json" "archive/old_json/"
Move-Item "top20*.json" "archive/old_json/"
Move-Item "closest*.json" "archive/old_json/"
Move-Item "close*.json" "archive/old_json/"
Move-Item "precise*.json" "archive/old_json/"
Move-Item "neo*.json" "archive/old_json/"

# Archivar scripts antiguos
Move-Item "*.ps1" "archive/old_scripts/" -Exclude "auto_download_top200.ps1"
Move-Item "*.py" "archive/old_scripts/"
Move-Item "diagnostico.js" "archive/old_scripts/"
Move-Item "verificar_datos.js" "archive/old_scripts/"

# Archivar HTMLs antiguos
Move-Item "asteroid-trajectory-viewer.html" "archive/old_html/"
Move-Item "temp*.html" "archive/old_html/"
Move-Item "test*.html" "archive/old_html/"

# Archivar texto Horizons
Move-Item "horizons*.txt" "archive/old_json/"

# Archivar docs intermedios
Move-Item "CONTROLES_AGREGADOS.md" "archive/"
Move-Item "VERIFICACION_CONTROLES.md" "archive/"
```
