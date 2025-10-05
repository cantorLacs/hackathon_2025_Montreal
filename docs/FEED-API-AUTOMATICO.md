# 🚀 Soporte Automático para Feed API

## ✨ Nueva Funcionalidad Implementada

El visualizador ahora **detecta automáticamente** cuando un archivo proviene de la **Feed API** (sin `orbital_data`) y **solicita automáticamente** los datos completos usando la **Lookup API** de NASA.

---

## 🔄 Cómo Funciona

### 1. Detección Automática

```javascript
// Al cargar un archivo JSON:
if (!neo.orbital_data) {
    // ¡Detectado! Archivo de Feed API
    console.log(`🔄 Asteroide ${neo.name} sin orbital_data`);
}
```

### 2. Solicitud Automática

```javascript
// Solicitar datos completos a NASA:
const url = `https://api.nasa.gov/neo/rest/v1/neo/${asteroidId}?api_key=${API_KEY}`;
const fullData = await fetch(url).then(r => r.json());
```

### 3. Combinación de Datos

```javascript
// El asteroide ahora tiene TODOS los datos:
{
    // De Feed API:
    "close_approach_data": [...],
    
    // De Lookup API:
    "orbital_data": {
        "semi_major_axis": "1.458",
        "eccentricity": "0.2228",
        ...
    }
}
```

---

## 📊 Comparación de Flujos

### ❌ ANTES (Manual)

```
1. Usuario descarga datos de Feed API
2. Intenta cargar en el visualizador
3. ❌ ERROR: "0 asteroides cargados"
4. Usuario tiene que:
   - Ir a docs/APIs-NASA-COMPARACION.md
   - Leer explicación
   - Descargar datos de Browse API manualmente
   - Volver a cargar
```

### ✅ AHORA (Automático)

```
1. Usuario descarga datos de Feed API
2. Carga en el visualizador
3. ✨ Sistema detecta falta de orbital_data
4. 🔄 Solicita automáticamente a NASA Lookup API
5. ✅ Carga exitosa con datos completos!
```

---

## 🎯 Ejemplo de Uso

### Paso 1: Obtener datos de Feed API

```bash
# PowerShell
$url = "https://api.nasa.gov/neo/rest/v1/feed?start_date=2025-10-04&end_date=2025-10-05&api_key=FtlbR4MhcVSE1Z3DYcoGeBqQqQtfzKIOerjefTbl"
Invoke-WebRequest -Uri $url -OutFile "data_feed.json"
```

### Paso 2: Cargar en el visualizador

1. Abrir `asteroid-trajectory-viewer-modular.html`
2. Click en "📂 Cargar JSON"
3. Seleccionar `data_feed.json`
4. ✨ **¡El sistema hace el resto automáticamente!**

### Lo que verás:

```
🔄 Obteniendo datos
Solicitando datos orbitales de 247517 (2002 QY6) (1/32)...

✅ Datos orbitales obtenidos para 247517 (2002 QY6)

🔄 Obteniendo datos
Solicitando datos orbitales de 319988 (2007 DK) (2/32)...

✅ Datos orbitales obtenidos para 319988 (2007 DK)

...

✅ ¡Éxito!
32 asteroides cargados
✨ 32 asteroides enriquecidos con datos de NASA Lookup API
```

---

## 🔍 Detalles Técnicos

### Código de Detección

```javascript
for (let i = 0; i < limitedList.length; i++) {
    const neo = limitedList[i];
    let asteroidData = neo;
    
    // ✨ DETECCIÓN AUTOMÁTICA
    if (!neo.orbital_data) {
        console.log(`🔄 Asteroide ${neo.name} (ID: ${neo.id}) sin orbital_data`);
        
        // Mostrar progreso al usuario
        this.showNotification(
            '🔄 Obteniendo datos', 
            `Solicitando datos orbitales de ${neo.name} (${i + 1}/${limitedList.length})...`,
            0
        );
        
        // Solicitar a NASA Lookup API
        const fullData = await this.fetchAsteroidData(neo.id);
        
        if (fullData && fullData.orbital_data) {
            asteroidData = fullData; // ✅ Usar datos completos
            fetchedCount++;
        } else {
            skippedCount++;
            continue; // ❌ Omitir este asteroide
        }
    }
    
    // Procesar asteroide con datos completos
    const asteroid = this.simulator.loadNASAData(asteroidData);
    this.asteroids.push(asteroid);
    this.createAsteroidVisualization(asteroid);
}
```

### Método de Solicitud

```javascript
async fetchAsteroidData(asteroidId) {
    const url = `${this.NASA_LOOKUP_URL}${asteroidId}?api_key=${this.NASA_API_KEY}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error(`Error fetching asteroid ${asteroidId}:`, error);
        throw error;
    }
}
```

---

## ⚙️ Configuración

### API Key

La clave de API está configurada en el constructor:

```javascript
constructor() {
    // ...
    this.NASA_API_KEY = 'FtlbR4MhcVSE1Z3DYcoGeBqQqQtfzKIOerjefTbl';
    this.NASA_LOOKUP_URL = 'https://api.nasa.gov/neo/rest/v1/neo/';
}
```

### Límite de Asteroides

Por rendimiento, el sistema procesa máximo **50 asteroides** por carga:

```javascript
const limitedList = neoList.slice(0, 50);
```

---

## 📈 Ventajas

### ✅ Para el Usuario

- ✨ **Sin configuración**: Funciona automáticamente
- 🚀 **Transparente**: No necesita entender las diferencias entre APIs
- 📊 **Progreso visual**: Ve el estado de las solicitudes
- 🎯 **Flexible**: Acepta cualquier formato de NASA

### ✅ Para el Desarrollador

- 🔧 **Robusto**: Maneja errores de red
- 📝 **Logs detallados**: Fácil de depurar
- 🎨 **Limpio**: Código bien estructurado
- 🔄 **Asíncrono**: No bloquea la UI

---

## ⚠️ Consideraciones

### Límite de Rate Limiting

NASA limita las peticiones a **30 por hora** con la clave DEMO.

**Con tu API Key personal**: 1,000 peticiones por hora ✅

### Rendimiento

Cada asteroide requiere una solicitud HTTP:
- **1 asteroide** = ~500ms
- **32 asteroides** = ~16 segundos
- **50 asteroides** = ~25 segundos

El sistema muestra el progreso en tiempo real.

### Conexión a Internet

Requiere conexión activa a internet para funcionar con Feed API.

Si no hay conexión:
- Browse API funciona (datos locales)
- Feed API falla con mensaje claro

---

## 🎓 Casos de Uso

### 1. Asteroides de Hoy

```bash
# Obtener asteroides que pasan HOY
$today = (Get-Date).ToString("yyyy-MM-dd")
$url = "https://api.nasa.gov/neo/rest/v1/feed?start_date=$today&end_date=$today&api_key=YOUR_KEY"
Invoke-WebRequest -Uri $url -OutFile "today.json"
```

### 2. Próxima Semana

```bash
# Próximos 7 días
$start = (Get-Date).ToString("yyyy-MM-dd")
$end = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
$url = "https://api.nasa.gov/neo/rest/v1/feed?start_date=$start&end_date=$end&api_key=YOUR_KEY"
Invoke-WebRequest -Uri $url -OutFile "week.json"
```

### 3. Evento Específico

```bash
# Aproximación de Apophis en 2029
$url = "https://api.nasa.gov/neo/rest/v1/feed?start_date=2029-04-13&end_date=2029-04-14&api_key=YOUR_KEY"
Invoke-WebRequest -Uri $url -OutFile "apophis_2029.json"
```

---

## 🐛 Troubleshooting

### "Error de red"

**Problema**: No se pueden obtener datos de NASA  
**Solución**: 
1. Verificar conexión a internet
2. Verificar que API Key es válida
3. Ver logs en consola del navegador (F12)

### "0 asteroides cargados"

**Problema**: Todos los asteroides fallaron  
**Solución**:
1. Abrir consola (F12)
2. Ver errores específicos
3. Verificar formato del JSON

### Lentitud

**Problema**: Tarda mucho en cargar  
**Solución**:
1. Normal con Feed API (requiere múltiples solicitudes)
2. Para datos rápidos, usar Browse API
3. Reducir rango de fechas en Feed API

---

## 📚 Referencias

- **NASA NeoWs API**: https://api.nasa.gov/
- **Feed API**: `GET /neo/rest/v1/feed?start_date=...&end_date=...`
- **Lookup API**: `GET /neo/rest/v1/neo/{asteroid_id}`
- **Browse API**: `GET /neo/rest/v1/neo/browse`

---

## ✨ Resumen

**El visualizador ahora es inteligente** y adapta su funcionamiento según el tipo de datos que recibe:

- **Browse API** → Carga directa (datos completos incluidos)
- **Feed API** → Enriquecimiento automático (solicita datos faltantes)
- **Hybrid** → Funciona con ambos formatos sin configuración

¡Simplemente carga tu archivo JSON y el sistema hace el resto! 🚀
