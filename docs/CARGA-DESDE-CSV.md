# 🚀 Carga Directa desde CSV

## ¡NUEVO! Carga asteroides sin necesidad de JSON

El visualizador ahora puede cargar asteroides **directamente desde el archivo CSV** de NASA SBDB, sin necesidad de archivos JSON de la API.

---

## 📊 Datos disponibles en el CSV

El archivo `sbdb_query_results.csv` contiene **2,463 asteroides** con:

### Elementos Orbitales Keplerianos (completos)
- ✅ `e` - Excentricidad
- ✅ `a` - Semi-eje mayor (AU)
- ✅ `i` - Inclinación (grados)
- ✅ `om` (Ω) - Longitud del nodo ascendente (grados)
- ✅ `w` (ω) - Argumento del perihelio (grados)
- ✅ `ma` (M) - Anomalía media (grados)
- ✅ `epoch` - Época de los elementos (Julian Date)

### Datos Adicionales
- ✅ `n` - Movimiento medio (grados/día)
- ✅ `per` - Periodo orbital (días)
- ✅ `q` - Distancia del perihelio (AU)
- ✅ `ad` - Distancia del afelio (AU)
- ✅ `moid` - Distancia mínima de intersección orbital (AU)

### Datos Físicos
- ✅ `H` - Magnitud absoluta
- ✅ `diameter` - Diámetro (km)
- ✅ `albedo` - Albedo geométrico
- ✅ `spec_B` / `spec_T` - Tipo espectral
- ✅ `rot_per` - Periodo de rotación (horas)
- ✅ `extent` - Dimensiones (km)

### Datos de Observación
- ✅ `condition_code` - Código de condición de órbita (0-9)
- ✅ `data_arc` - Arco de datos (días)
- ✅ `first_obs` - Primera observación
- ✅ `last_obs` - Última observación
- ✅ `n_obs_used` - Número de observaciones usadas

### Clasificación
- ✅ `neo` - Es NEO (Y/N)
- ✅ `pha` - Es potencialmente peligroso (Y/N)
- ✅ `class` - Clase orbital (APO, ATE, AMO, etc.)

---

## 🎯 Cómo usar

### 1. Cargar el archivo CSV

1. Abre el visualizador en el navegador
2. Haz clic en **"Cargar CSV"**
3. Selecciona `sbdb_query_results.csv`
4. Verás: `✅ CSV cargado: 2463 asteroides en base de datos`

### 2. Cargar asteroides desde CSV

Abre la **consola del navegador** (F12) y ejecuta uno de estos comandos:

```javascript
// Cargar TODOS los asteroides (2,463)
visualizer.loadFromCSV()

// Cargar los primeros 100 asteroides
visualizer.loadFromCSV(100)

// Cargar los primeros 500 asteroides
visualizer.loadFromCSV(500)

// Cargar solo 50 asteroides (más rápido)
visualizer.loadFromCSV(50)
```

### 3. Esperar la carga

El sistema procesará cada asteroide del CSV:
- ✅ Lee los elementos orbitales
- ✅ Convierte la época de Julian Date a fecha ISO
- ✅ Crea el objeto de asteroide completo
- ✅ Calcula y dibuja la órbita
- ✅ Agrega datos físicos y de observación

**Progreso en consola:**
```
📊 Cargando 2463 asteroides desde CSV...
🎯 Procesando 2463 asteroides...
📈 Progreso: 100/2463
📈 Progreso: 200/2463
...
✅ Carga completa: 2463 exitosos, 0 fallidos
```

---

## 🔬 Cómo funciona internamente

### `loadFromCSV(maxAsteroids)`

1. **Validación**: Verifica que el CSV esté cargado
2. **Limpieza**: Elimina asteroides anteriores de la escena
3. **Conversión**: Para cada asteroide en el CSV:
   - Llama a `createAsteroidFromCSV(csvData)`
   - Valida elementos orbitales requeridos
   - Convierte época de Julian Date a ISO
   - Crea objeto compatible con el visualizador
4. **Visualización**: Crea órbita y mesh 3D
5. **Selección**: Selecciona automáticamente el primer asteroide

### `createAsteroidFromCSV(csvData)`

Convierte una fila del CSV en un objeto de asteroide completo:

```javascript
{
    id: "20001566",
    name: "1566 Icarus (1949 MA)",
    is_potentially_hazardous_asteroid: true,
    
    orbital_data: {
        eccentricity: 0.8270,
        semi_major_axis: 1.078,
        inclination: 22.80,
        ascending_node_longitude: 87.95,
        perihelion_argument: 31.44,
        mean_anomaly: 153.08,
        epoch_osculation: 2461000.5,
        // ... más datos
    },
    
    physical_data: {
        diameter_km: 1.0,
        albedo: 0.51,
        spectral_type: null,
        // ... más datos
    },
    
    observation_data: {
        condition_code: 0,
        data_arc_days: 27807,
        first_observation: "1949-07-01",
        last_observation: "2025-08-18",
        observations_used: 1792
    }
}
```

### `julianToDate(jd)`

Convierte Julian Date a fecha ISO:

```javascript
// JD 2461000.5 → "2027-02-17"
const unixTime = (jd - 2440587.5) * 86400000;
const date = new Date(unixTime);
return date.toISOString().split('T')[0];
```

---

## ⚡ Ventajas vs. JSON de la API

| Característica | CSV Direct | JSON API |
|----------------|-----------|----------|
| **Cantidad** | 2,463 asteroides | ~50-100 |
| **Dependencia API** | ❌ No requiere | ✅ Necesita conexión |
| **Datos físicos** | ✅ Albedo, tipo espectral | ❌ No incluidos |
| **MOID** | ✅ Incluido | ❌ No incluido |
| **Historial observaciones** | ✅ Fechas completas | ❌ Limitado |
| **Velocidad carga** | ⚡ Instantánea | 🐌 ~25s (50 asteroides) |
| **Condition Code** | ✅ 0-9 (precisión) | ❌ No disponible |

---

## 🎨 Datos adicionales visualizables

Con la carga desde CSV, ahora tienes acceso a:

### MOID (Minimum Orbit Intersection Distance)
```javascript
asteroid.close_approach_data[0].miss_distance.astronomical
// Ejemplo: 0.0335 AU = 5 millones de km
```

### Tipo Espectral
```javascript
asteroid.physical_data.spectral_type
// Ejemplos: "S", "C", "Q", "V"
```

### Condition Code (precisión orbital)
```javascript
asteroid.observation_data.condition_code
// 0 = excelente, 9 = muy incierto
```

### Periodo de Rotación
```javascript
asteroid.physical_data.rotation_period
// Ejemplo: 2.2726 horas
```

---

## 🔧 Personalización

### Cambiar cantidad de asteroides

```javascript
// Solo los primeros 10 (para pruebas)
visualizer.loadFromCSV(10)

// Primeros 1000 (balance rendimiento/cantidad)
visualizer.loadFromCSV(1000)

// Todos (puede ser lento en navegadores antiguos)
visualizer.loadFromCSV()
```

### Filtrar por tipo antes de cargar

```javascript
// Cargar solo PHAs
const phas = Array.from(visualizer.dataEnricher.csvData.values())
    .filter(a => a.pha === 'Y');
console.log(`${phas.length} PHAs encontrados`);
```

---

## 🐛 Solución de problemas

### "❌ Primero debes cargar un archivo CSV"
- Asegúrate de haber cargado el CSV usando el botón **"Cargar CSV"**
- Verifica que veas el mensaje: `✅ CSV cargado: 2463 asteroides`

### No se ven asteroides después de cargar
- Espera unos segundos mientras se procesan
- Abre la consola (F12) y verifica errores
- Intenta con menos asteroides: `visualizer.loadFromCSV(50)`

### "Elementos orbitales incompletos"
- Algunos asteroides en el CSV pueden tener datos faltantes
- El sistema los omite automáticamente
- Verifica en consola: `⚠️ [nombre]: Elementos orbitales incompletos`

---

## 📝 Ejemplo completo

```javascript
// 1. Cargar CSV (botón en UI)
// → Click "Cargar CSV" → Seleccionar sbdb_query_results.csv

// 2. Esperar confirmación
// → ✅ CSV cargado: 2463 asteroides en base de datos

// 3. Cargar asteroides (consola)
visualizer.loadFromCSV(100)

// 4. Ver progreso
// 📊 Cargando 2463 asteroides desde CSV...
// 🎯 Procesando 100 asteroides...
// ✅ Carga completa: 100 exitosos, 0 fallidos

// 5. Explorar
// → Usa el panel de lista de asteroides
// → Selecciona diferentes asteroides
// → Visualiza órbitas y datos
```

---

## 🎓 Notas técnicas

### Epoch Propagation
- Cada asteroide tiene una época específica (ej: JD 2461000.5 = 2027-02-17)
- Calcular posiciones muy alejadas de la época acumula errores
- Los elementos orbitales son más precisos cerca de su época

### Coordenadas
- Semi-eje mayor (`a`) en AU (Astronomical Units)
- Ángulos en grados (no radianes)
- Época en Julian Date (se convierte a ISO internamente)

### Rendimiento
- 50 asteroides: ~1 segundo
- 500 asteroides: ~5 segundos
- 2,463 asteroides: ~20 segundos
- Depende del hardware del navegador

---

## 🚀 Próximos pasos

Ahora que tienes todos los asteroides cargados, puedes:

1. **Filtrar por clase orbital** (APO, ATE, AMO)
2. **Ordenar por MOID** (más cercanos a la Tierra)
3. **Visualizar condition code** (precisión orbital)
4. **Colorear por tipo espectral** (S, C, Q, V)
5. **Añadir búsqueda por nombre**

¡Disfruta explorando los 2,463 asteroides! 🌌
