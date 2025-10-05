# 📡 Comparación de APIs de NASA

## Problema Detectado

El formato de datos cambia según qué endpoint de NASA uses:

### 1️⃣ **Browse API** - `/neo/rest/v1/neo/browse`
```
✅ Incluye: orbital_data (elementos orbitales completos)
✅ Incluye: close_approach_data
✅ Cantidad: Miles de asteroides
❌ Filtro por fecha: NO disponible
```

**Estructura:**
```json
{
  "near_earth_objects": [
    {
      "id": "2000433",
      "name": "433 Eros",
      "orbital_data": {
        "semi_major_axis": "1.458",
        "eccentricity": "0.2228",
        "inclination": "10.828",
        ...
      },
      "close_approach_data": [...]
    }
  ]
}
```

### 2️⃣ **Feed API** - `/neo/rest/v1/feed?start_date=...&end_date=...`
```
❌ NO incluye: orbital_data
✅ Incluye: close_approach_data
✅ Filtro por fecha: SÍ disponible
✅ Solo asteroides con aproximaciones en el rango de fechas
```

**Estructura:**
```json
{
  "near_earth_objects": {
    "2025-10-05": [
      {
        "id": "2247517",
        "name": "247517 (2002 QY6)",
        "close_approach_data": [...],
        // ❌ NO HAY orbital_data!
      }
    ]
  }
}
```

### 3️⃣ **Lookup API** - `/neo/rest/v1/neo/{asteroid_id}`
```
✅ Incluye: orbital_data (elementos orbitales completos)
✅ Incluye: close_approach_data (todas las aproximaciones históricas/futuras)
✅ Información detallada de UN solo asteroide
❌ Solo un asteroide a la vez
```

**Estructura:**
```json
{
  "id": "2000433",
  "name": "433 Eros",
  "orbital_data": {
    "semi_major_axis": "1.458",
    ...
  },
  "close_approach_data": [...]
}
```

---

## ✅ SOLUCIONES

### Opción A: Usar Browse API (recomendado)
```
URL: https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=YOUR_KEY

Ventajas:
- ✅ Datos completos (orbital_data + close_approach_data)
- ✅ Muchos asteroides de una vez
- ✅ Funciona con tu código actual

Desventajas:
- ❌ No puedes filtrar por fecha de aproximación
- ❌ Devuelve asteroides sin importar cuándo se aproximan
```

### Opción B: Feed API + Lookup API (híbrido)
```javascript
// 1. Usar Feed para obtener IDs de asteroides cercanos en fechas específicas
const feedResponse = await fetch(
  'https://api.nasa.gov/neo/rest/v1/feed?start_date=2025-10-04&end_date=2025-10-05&api_key=YOUR_KEY'
);
const feedData = await feedResponse.json();

// 2. Para cada asteroide, hacer Lookup para obtener orbital_data
const asteroidIds = Object.values(feedData.near_earth_objects)
  .flat()
  .map(neo => neo.id);

// 3. Hacer Lookup individual (o en lotes)
for (const id of asteroidIds) {
  const lookupResponse = await fetch(
    `https://api.nasa.gov/neo/rest/v1/neo/${id}?api_key=YOUR_KEY`
  );
  const fullData = await lookupResponse.json();
  // Ahora sí tiene orbital_data!
}

Ventajas:
- ✅ Filtras por fecha
- ✅ Datos completos de cada asteroide

Desventajas:
- ❌ Muchas peticiones HTTP (lento)
- ❌ Límite de rate limiting (30 req/hora en clave demo)
```

### Opción C: Modificar código para manejar Feed sin orbital_data
```javascript
// Solo mostrar aproximaciones, sin calcular trayectorias
// Usar directamente miss_distance de NASA

Ventajas:
- ✅ Funciona con Feed API
- ✅ Datos precisos de NASA

Desventajas:
- ❌ NO puedes visualizar órbitas 3D
- ❌ Solo ves aproximaciones específicas
```

---

## 🎯 RECOMENDACIÓN

**Para tu hackathon: USA BROWSE API (`data.json` original)**

1. Tiene todos los datos necesarios
2. Funciona con tu código actual
3. Puedes visualizar órbitas completas
4. No requiere múltiples peticiones

**Para obtener nuevos datos:**
```bash
curl "https://api.nasa.gov/neo/rest/v1/neo/browse?page=0&size=50&api_key=FtlbR4MhcVSE1Z3DYcoGeBqQqQtfzKIOerjefTbl" -o data_new.json
```

---

## 📝 NOTA IMPORTANTE

El archivo `data2.json` (Feed API) **no funciona** con tu visualizador porque:
- No tiene `orbital_data`
- No puedes calcular trayectorias sin elementos orbitales
- Solo sirve para ver próximas aproximaciones (sin visualización 3D)

**Solución inmediata:** Sigue usando `data.json` original (Browse API)
