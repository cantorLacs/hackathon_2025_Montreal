# 🌌 Clases Orbitales de Asteroides NEO

## 📊 Nueva Información Añadida

Se ha agregado información detallada sobre la órbita del asteroide en el panel de información:

1. **Cuerpo que orbita**: ☀️ Sol (todos los NEO orbitan el Sol)
2. **Clase orbital**: Tipo (APO, AMO, ATE, IEO)
3. **Descripción de la clase**: Explicación del tipo de órbita
4. **Rango orbital**: Criterio de clasificación

---

## 🎯 Clases Orbitales de NEO (Near-Earth Objects)

Los asteroides cercanos a la Tierra se clasifican según la relación entre su órbita y la órbita terrestre:

### 1. **APO (Apollo)** 🔴

**Criterio**:
- Semi-eje mayor (a) > 1.0 AU
- Perihelio (q) < 1.017 AU

**Descripción**:
> "Near-Earth asteroid orbits similar to that of 1862 Apollo"

**Características**:
- Cruzan la órbita terrestre desde el exterior
- Pueden acercarse mucho a la Tierra
- Mayoría de asteroides potencialmente peligrosos (PHA)
- Períodos orbitales > 1 año

**Ejemplos famosos**:
- (99942) Apophis - Aproximación de 31,860 km en 2029
- (433) Eros - Primer asteroide visitado por sonda (NEAR)
- (1862) Apollo - Prototipo de la clase

**Visualización**:
```
        Tierra (1 AU)
            ↓
    ─────●─────────
  ☀         ········○ APO
            perihelio < 1.017 AU
```

---

### 2. **AMO (Amor)** 🟠

**Criterio**:
- Semi-eje mayor (a) > 1.0 AU
- Perihelio (q) entre 1.017 y 1.3 AU

**Descripción**:
> "Near-Earth asteroid orbits similar to that of 1221 Amor"

**Características**:
- NO cruzan la órbita terrestre
- Se acercan a la Tierra pero desde fuera
- Menos peligrosos que Apollo
- Pueden evolucionar a Apollo por perturbaciones

**Ejemplos**:
- (1221) Amor - Prototipo de la clase
- (433) Eros - También clasificado como Amor en ciertos períodos
- (1566) Icarus - Órbita altamente excéntrica

**Visualización**:
```
        Tierra (1 AU)
            ↓
    ─────●───────────
           ········○ AMO
           perihelio > 1.017 AU
```

---

### 3. **ATE (Aten)** 🟡

**Criterio**:
- Semi-eje mayor (a) < 1.0 AU
- Afelio (Q) > 0.983 AU

**Descripción**:
> "Near-Earth asteroid orbits similar to that of 2062 Aten"

**Características**:
- Órbitas MÁS PEQUEÑAS que la de la Tierra
- Pasan la mayor parte del tiempo dentro de la órbita terrestre
- Difíciles de detectar (están cerca del Sol)
- Cruzan la órbita terrestre desde el interior

**Ejemplos**:
- (2062) Aten - Prototipo
- (99942) Apophis - También clasificado como Aten
- (2340) Hathor - Aproximación muy cercana

**Visualización**:
```
    Tierra (1 AU)
        ↓
    ●─────────
  ☀  ○ ATE
   afelio > 0.983 AU
```

---

### 4. **IEO (Interior Earth Object)** 🔵

**Criterio**:
- Afelio (Q) < 0.983 AU

**Descripción**:
> "Interior Earth Objects - orbits entirely within Earth's orbit"

**Características**:
- Órbita COMPLETAMENTE dentro de la órbita terrestre
- Extremadamente raros
- Muy difíciles de detectar (siempre cerca del Sol)
- No cruzan la órbita terrestre

**Ejemplos**:
- Muy pocos conocidos
- Difíciles de observar

**Visualización**:
```
    Tierra (1 AU)
        ↓
    ●─────────
  ☀○ IEO
    afelio < 0.983 AU
```

---

## 📐 Parámetros Orbitales Clave

### Perihelio (q)
Distancia mínima al Sol
```
q = a(1 - e)
```

### Afelio (Q)
Distancia máxima al Sol
```
Q = a(1 + e)
```

### Semi-eje mayor (a)
Tamaño de la órbita
```
a = (perihelio + afelio) / 2
```

### Excentricidad (e)
"Ovalamiento" de la órbita
```
e = (afelio - perihelio) / (afelio + perihelio)
```
- e = 0: círculo perfecto
- e < 1: elipse
- e = 1: parábola
- e > 1: hipérbola

---

## 🎨 Visualización en el Panel

### Ejemplo: Apophis

```
┌─────────────────────────────────────────┐
│ 🌠 99942 Apophis (2004 MN4)            │
│ 🎥 Dejar de Seguir                     │
│                                         │
│ ID: 2099942                            │
│ Diámetro: 0.34 - 0.76 km              │
│ Orbita: ☀️ Sol                         │
│ Clase Orbital: APO                     │
│ Peligroso: ⚠️ SÍ                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🌌 Tipo de Órbita: APO                 │
│                                         │
│ Near-Earth asteroid orbits similar to  │
│ that of 1862 Apollo                    │
│                                         │
│ 📐 Rango: a > 1.0 AU; q < 1.017 AU    │
└─────────────────────────────────────────┘
```

---

## 🔍 Interpretación para Usuarios

### ¿Por qué importa la clase orbital?

1. **Riesgo de impacto**:
   - APO: Alto (cruzan desde fuera)
   - ATE: Medio (cruzan desde dentro)
   - AMO: Bajo (no cruzan)
   - IEO: Ninguno (nunca cruzan)

2. **Frecuencia de aproximaciones**:
   - APO/ATE: Frecuentes
   - AMO: Ocasionales
   - IEO: Nunca

3. **Detección**:
   - AMO/APO: Fácil (lejos del Sol)
   - ATE: Moderado
   - IEO: Muy difícil (cerca del Sol)

---

## 🎓 Para la Presentación del Hackathon

### Punto Clave #1: "Clasificación Científica"

> "Mostramos la clasificación oficial de NASA basada en elementos orbitales. Los asteroides Apollo (APO) son los más peligrosos porque cruzan la órbita terrestre desde el exterior."

### Punto Clave #2: "Contexto Educativo"

> "No solo mostramos el tipo de órbita, sino también su descripción y criterios de clasificación, haciendo el visualizador educativo y científicamente preciso."

### Demo Sugerida:

1. Seleccionar asteroide Apollo (APO)
2. Mostrar tarjeta de clase orbital
3. "Este asteroide cruza la órbita terrestre, por eso es potencialmente peligroso"
4. Comparar con asteroide Amor (AMO)
5. "Este NO cruza la órbita, solo se acerca"

---

## 📝 Cambios Implementados

### Archivo: `src/trajectory-simulator.js`

**Líneas ~73-75**: Agregadas propiedades de clase orbital

```javascript
orbitClass: orbitalData.orbit_class.orbit_class_type,
orbitClassDescription: orbitalData.orbit_class.orbit_class_description,
orbitClassRange: orbitalData.orbit_class.orbit_class_range,
```

### Archivo: `src/asteroid-visualizer.js`

**Líneas ~550-570**: Nueva tarjeta de información orbital

```javascript
<div class="info-row">
    <span class="info-label">Orbita:</span>
    <span class="info-value">☀️ Sol</span>
</div>

// Nueva tarjeta morada con descripción
<div class="info-card" style="background: rgba(155, 89, 182, 0.1);">
    <h3>🌌 Tipo de Órbita: ${asteroid.orbitClass}</h3>
    ${asteroid.orbitClassDescription}
    📐 Rango: ${asteroid.orbitClassRange}
</div>
```

---

## ✅ Beneficios

1. **Educativo**: Usuarios aprenden sobre tipos de órbitas NEO
2. **Científico**: Información precisa de NASA JPL
3. **Visual**: Tarjeta distintiva con color morado
4. **Completo**: Tipo + descripción + criterio de clasificación
5. **Contextual**: Ayuda a entender el riesgo del asteroide

---

## 🚀 Para Probar

```powershell
# Iniciar servidor
python -m http.server 8000

# Abrir visualizador
start http://localhost:8000/asteroid-trajectory-viewer-modular.html
```

1. Cargar `data.json`
2. Seleccionar cualquier asteroide
3. Ver nueva tarjeta morada "🌌 Tipo de Órbita"
4. Leer descripción y rango
5. Comparar diferentes clases (APO vs AMO vs ATE)

---

**Versión**: 2.5 - Información de Clase Orbital  
**Fecha**: 2025-10-04  
**Estado**: ✅ **IMPLEMENTADO**
