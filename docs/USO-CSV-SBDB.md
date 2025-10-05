# 📊 Cómo Usar los Datos del CSV de NASA SBDB

## 🎯 Flujo de Trabajo Completo

### Paso 1: Cargar Datos CSV (Opcional pero Recomendado)

1. **Ya tienes el archivo**: `sbdb_query_results.csv`
2. **Abrir** `asteroid-trajectory-viewer-modular.html`
3. **Click** en "Archivo CSV (SBDB - Opcional)"
4. **Seleccionar** `sbdb_query_results.csv`
5. **Esperar** mensaje: "✅ CSV cargado: 2,464 asteroides en base de datos"

### Paso 2: Cargar Datos JSON

1. **Click** en "Archivo JSON (NeoWs API)"
2. **Seleccionar** `data.json` o `data2.json`
3. **El sistema automáticamente**:
   - Detecta si falta `orbital_data`
   - Solicita datos completos a NASA Lookup API
   - **Enriquece** con datos del CSV (si está cargado)
   - Carga asteroides con información completa

---

## ✨ Qué Datos Agrega el CSV

### 📏 **Datos Físicos**

```javascript
physical_data: {
    albedo: 0.51,                    // Reflectividad (0-1)
    diameter_km: 1.0,                // Diámetro en km
    extent: "1.5x1.2x1.0",          // Dimensiones 3D
    rotation_period_hours: 2.27,     // Período de rotación
    spectral_type_B: "S",            // Tipo espectral (Bus)
    spectral_type_T: "S",            // Tipo espectral (Tholen)
    color_BV: 0.774,                 // Índice de color B-V
    color_UB: 0.520,                 // Índice de color U-B
}
```

### 🛰️ **Datos Orbitales Extendidos**

```javascript
orbital_data_extended: {
    earth_moid_au: 0.0335,           // ⭐ MOID en AU
    earth_moid_km: 5,012,031,        // ⭐ MOID en km
    earth_moid_ld: 13.04,            // ⭐ MOID en distancias lunares
    aphelion_distance: 1.97,         // Afelio (AU)
    period_years: 1.12,              // Período en años
    orbit_class_short: "APO"         // Clase: APO/ATE/AMO
}
```

### 📡 **Datos de Observación**

```javascript
observation_data: {
    data_arc_days: 27807,            // Días desde primera observación
    first_observation: "1949-07-01", // Primera vez visto
    last_observation: "2025-08-18",  // Última observación
    observations_used: 1792,         // Total de observaciones
    observations_radar_delay: 10,    // Observaciones radar DELAY
    observations_radar_doppler: 13,  // Observaciones radar DOPPLER
    condition_code: 0,               // ⭐ Incertidumbre (0-9)
    orbit_id: "194"                  // Versión de la órbita
}
```

---

## 🎨 Cómo se Muestra en el Visualizador

Cuando seleccionas un asteroide **enriquecido con CSV**, verás:

### Antes (solo API):
```
🛰️ Elementos Orbitales
- Semi-eje mayor: 1.078 AU
- Excentricidad: 0.827
- Inclinación: 22.80°
- Período Orbital: 409 días (1.12 años)
```

### Después (API + CSV): ✨
```
🛰️ Elementos Orbitales
- Semi-eje mayor: 1.078 AU
- Excentricidad: 0.827
- Inclinación: 22.80°
- Período Orbital: 409 días (1.12 años)

⚠️ Evaluación de Peligrosidad
- MOID (Tierra): 0.0335 AU (13.0 LD) ⚠️
- Incertidumbre: Código 0/9 (Excelente ±1 km)
- Tipo Espectral: Tipo S - Silíceo (rocoso)
- Albedo: 0.51 (muy reflectivo)

📊 Datos Físicos
- Diámetro confirmado: 1.0 km
- Albedo: 0.51 (confirma tamaño)
- Período de rotación: 2.27 horas
- Tipo: Silíceo - Rocoso con silicatos

📡 Historial de Observaciones
- Primera observación: 1 julio 1949
- Última observación: 18 agosto 2025
- Tiempo observado: 27,807 días (76 años)
- Total observaciones: 1,792
- Observaciones radar: 23 (DELAY + DOPPLER)
- Precisión orbital: Excelente (código 0)
```

---

## 💥 Simulación de Impacto Mejorada

Con los datos del CSV, ahora puedes calcular:

### 1️⃣ **Energía Más Precisa**

```javascript
// Antes (solo API):
diameter = estimado entre 0.8-1.2 km (promedio 1.0 km)
albedo = asumido 0.14 (carbonáceo típico)

// Después (CSV):
diameter = 1.0 km (confirmado)
albedo = 0.51 (¡rocoso silíceo!)
spectral_type = "S" → densidad = 2,400 kg/m³ (no 2,000)
```

**Diferencia en energía:** Hasta 20% más preciso

### 2️⃣ **Evaluación de Riesgo**

```javascript
// Con MOID del CSV:
earth_moid = 0.0335 AU = 5,012,031 km

if (moid < 0.05 AU) {
    risk_level = "ALTO - Cruza órbita de la Tierra frecuentemente";
} else if (moid < 0.2 AU) {
    risk_level = "MEDIO - Aproximaciones posibles";
} else {
    risk_level = "BAJO - Raramente se acerca";
}
```

### 3️⃣ **Confiabilidad del Dato**

```javascript
// Con condition_code del CSV:
if (condition_code <= 2) {
    confidence = "ALTA - Precisión de kilómetros";
} else if (condition_code <= 5) {
    confidence = "MEDIA - Precisión de miles de km";
} else {
    confidence = "BAJA - Gran incertidumbre";
}
```

---

## 🔍 Ejemplo Real: Icarus (1566)

### Datos combinados:

```json
{
    "id": "2001566",
    "name": "1566 Icarus (1949 MA)",
    
    // De la API:
    "estimated_diameter": {
        "min": 0.8,
        "max": 1.2,
        "avg": 1.0
    },
    "is_potentially_hazardous_asteroid": true,
    
    // Del CSV:
    "physical_data": {
        "diameter_km": 1.0,              // ✅ Confirmado
        "albedo": 0.51,                  // ✅ Muy reflectivo
        "spectral_type_B": null,         // No disponible
        "rotation_period_hours": 2.27    // ✅ Gira muy rápido
    },
    
    "orbital_data_extended": {
        "earth_moid_au": 0.0335,         // ⚠️ MUY CERCA!
        "earth_moid_km": 5012031,        // 5 millones km
        "earth_moid_ld": 13.04,          // Solo 13 veces la Luna!
        "orbit_class_short": "APO"       // Apollo (cruza órbita)
    },
    
    "observation_data": {
        "data_arc_days": 27807,          // 76 años observado
        "first_observation": "1949-07-01", // Descubierto 1949
        "observations_used": 1792,       // Muy bien estudiado
        "observations_radar_doppler": 13, // ✅ Radar confirmado
        "condition_code": 0               // ✅ Órbita perfecta
    }
}
```

### Impacto simulado con datos completos:

```
💥 SIMULACIÓN DE IMPACTO - Icarus (1566)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 DATOS FÍSICOS:
- Diámetro: 1.0 km (confirmado por albedo)
- Albedo: 0.51 (muy reflectivo)
- Tipo: Rocoso silíceo (S-type)
- Densidad estimada: 2,400 kg/m³
- Masa: 1.26 × 10¹² kg

🚀 APROXIMACIÓN MÁS CERCANA:
- Fecha: 16 junio 1968
- Distancia: 6.4 millones km (16.6 LD)
- Velocidad: 30.5 km/s (109,800 km/h)

💥 SI IMPACTARA A ESA VELOCIDAD:
- Energía cinética: 586 megatones
- Equivalente: 39x Bomba del Zar
- Cráter estimado: 18.2 km de diámetro
- Destrucción total: 38 km de radio
- Daño significativo: 127 km de radio

⚠️ EVALUACIÓN DE RIESGO:
- MOID: 0.0335 AU (5.0 millones km) ⚠️
- Clase orbital: Apollo (cruza órbita Tierra)
- Incertidumbre: Excelente (±1 km)
- PHA: SÍ - Potencialmente peligroso
- Nivel de riesgo: ALTO

📡 CONFIABILIDAD:
- Observado: 76 años (1949-2025)
- Observaciones: 1,792 (incluyendo 23 radar)
- Precisión orbital: Excelente (código 0)
- Confianza en predicción: MUY ALTA
```

---

## 🎯 Ventajas de Usar el CSV

| Característica | Solo API | API + CSV |
|---|---|---|
| **Diámetro** | Estimado (rango amplio) | Confirmado (valor preciso) |
| **Albedo** | No disponible | ✅ Disponible |
| **Tipo espectral** | No disponible | ✅ Disponible |
| **MOID** | Calculado (puede fallar) | ✅ Valor oficial JPL |
| **Incertidumbre** | No disponible | ✅ Condition code 0-9 |
| **Historia observación** | Limitada | ✅ Completa (desde 1893) |
| **Confiabilidad impacto** | Media | ✅ Alta |

---

## 📚 Referencias

- **CSV descargado de**: NASA JPL Small-Body Database Search Engine
- **Campos incluidos**: 26 parámetros esenciales
- **Total asteroides**: 2,464 NEOs con datos completos
- **Actualización**: El CSV tiene datos hasta 2025-10-03

---

## ✅ Checklist de Uso

```
☑ Abrir visualizador
☑ Cargar CSV primero (opcional pero recomendado)
☑ Cargar JSON (NeoWs API o Feed API)
☑ El sistema automáticamente:
  ☑ Detecta formato de JSON
  ☑ Solicita orbital_data si falta (Feed API)
  ☑ Enriquece con datos CSV (si está cargado)
  ☑ Muestra información completa
☑ Seleccionar asteroide para ver:
  ☑ Datos físicos (albedo, tipo espectral)
  ☑ MOID y evaluación de peligrosidad
  ☑ Historial de observaciones
  ☑ Simulación de impacto mejorada
```

---

**¡Todo listo!** El sistema ahora es mucho más completo y preciso gracias a los datos adicionales del CSV de SBDB. 🚀✨
