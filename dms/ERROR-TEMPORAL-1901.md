# Error del Modelo para Aproximaciones en 1901

## Contexto

Algunas aproximaciones tienen fecha **23 agosto 1901** (~124 años en el pasado desde 2025).

## Análisis de Errores Acumulativos

### 1️⃣ Error en el Período de la Tierra

**Período usado**: 365.25 días (año juliano)  
**Período real**: 365.256363004 días (año sideral tropical)  
**Diferencia**: 0.006363004 días/año = **9.16 minutos/año**

#### Desfase acumulado en 124 años (1901-2025):

```
Desfase = 124 años × 0.006363004 días/año
        = 0.789 días
        ≈ 18.9 horas
```

**Resultado**: La Tierra está desfasada **~19 horas** (≈ 28° de ángulo orbital)

#### Distancia de error:

```
Longitud de arco = (28° / 360°) × 2π × AU
                 = 0.0778 × 2π × 149,597,870.7 km
                 = 73,000,000 km
                 ≈ 0.49 AU
```

### 2️⃣ Error por Excentricidad Ignorada

**Error máximo**: ±2.5 millones de km (como se calculó antes)

Este error **NO se acumula** en el tiempo, es cíclico.

### 3️⃣ Error por Precesión del Perihelio

**Precesión del perihelio terrestre**: ~11.45 arco-segundos/año  
**En 124 años**: 1,420 arco-segundos ≈ 0.394°

Este es un error **muy pequeño** comparado con el del período.

### 4️⃣ Error en Elementos Orbitales del Asteroide

Los elementos orbitales de NASA son **osculating elements** (elementos instantáneos en la época de referencia).

Para proyecciones a **124 años atrás**:

- ✅ **Asteroides Apolo/Aten/Amor**: Elementos relativamente estables (órbitas controladas por Sol)
- ⚠️ **Perturbaciones planetarias**: NO incluidas en nuestro modelo de 2 cuerpos
- ⚠️ **Resonancias orbitales**: Pueden cambiar elementos significativamente
- ⚠️ **Encuentros cercanos pasados**: Pueden haber alterado la órbita

## 🔴 ERROR TOTAL ESTIMADO PARA 1901

### Posición de la Tierra

| Componente | Magnitud |
|------------|----------|
| Desfase temporal | **~73 millones de km** (0.49 AU) |
| Excentricidad | ±2.5 millones de km (0.017 AU) |
| Precesión | Despreciable |
| **TOTAL TIERRA** | **~73 millones de km** |

### Posición del Asteroide

**Para propagación de 124 años con modelo de 2 cuerpos**:

- **Órbitas cortas** (período < 3 años): Error puede ser **> 100 millones de km**
  - Perturbaciones de Júpiter/Saturno acumuladas
  - Múltiples resonancias orbitales
  
- **Órbitas medias** (3-10 años): Error **10-50 millones de km**
  - Perturbaciones significativas pero menos frecuentes
  
- **Órbitas largas** (> 10 años): Error **1-10 millones de km**
  - Menos encuentros planetarios

### ERROR COMBINADO (Geocéntrico)

```
Error total = Error_asteroide + Error_Tierra
            ≈ 73 millones km (Tierra) + 10-100 millones km (asteroide)
            ≈ 83 - 173 millones de km
            ≈ 0.55 - 1.16 AU
```

## ⚠️ CONCLUSIÓN: EL MODELO ES **MUY INCORRECTO** PARA 1901

### Razones principales:

1. 🔴 **Desfase temporal de 19 horas** → Error de posición de 73 millones de km en la Tierra
2. 🔴 **Modelo de 2 cuerpos** → NO incluye perturbaciones planetarias acumuladas en 124 años
3. 🔴 **Elementos osculating** → Válidos solo cerca de la época de referencia
4. 🔴 **Sin integración numérica** → No propagamos cambios en los elementos orbitales

### ¿Por qué NASA muestra estas fechas?

NASA JPL Horizons usa **integración numérica N-body** que:
- ✅ Incluye perturbaciones de todos los planetas
- ✅ Incluye fuerzas relativistas
- ✅ Incluye presión de radiación solar
- ✅ Usa efemérides planetarias DE440/441
- ✅ Integra hacia atrás en el tiempo correctamente

**Nuestro modelo NO hace esto** - usamos elementos orbitales fijos de la época actual.

## 🎯 Implicaciones para el Hackathon

### Para aproximaciones en 1901:

| Dato | Precisión | Razón |
|------|-----------|-------|
| **Fecha de aproximación** | ✅ Exacta | Pre-calculada por NASA JPL |
| **Distancia mínima** | ✅ Exacta | Pre-calculada por NASA JPL |
| **Velocidad relativa** | ✅ Exacta | Pre-calculada por NASA JPL |
| **Posición 3D visualizada** | 🔴 **Error ~100 millones de km** | Calculada por nosotros con modelo simple |
| **Trayectoria mostrada** | 🔴 **Incorrecta para 1901** | Extrapolación no válida |

### ✅ Lo que SÍ es correcto:

1. La **fecha** de la aproximación (23 ago 1901) - viene de NASA
2. La **distancia mínima** - viene de NASA
3. La **visualización de órbitas actuales** - correcta para fechas cercanas a la época

### 🔴 Lo que NO es correcto:

1. La **posición 3D del asteroide** en 1901
2. La **posición 3D de la Tierra** en 1901
3. La **forma de la trayectoria** vista en 1901

## 📋 Recomendaciones

### Opción 1: **Limitar rango temporal visible** (RECOMENDADO)

Deshabilitar visualización 3D para fechas fuera de rango:

```javascript
// Rango válido: ±10 años desde la época de los elementos
const validRange = 10 * 365.25; // días
if (Math.abs(daysSinceEpoch) > validRange) {
    // Mostrar advertencia
    // Deshabilitar renderizado 3D
    // Solo mostrar datos tabulares de NASA
}
```

### Opción 2: **Advertencia visual**

Para fechas > 10 años desde época:
```
⚠️ ADVERTENCIA: Esta visualización 3D es una extrapolación 
aproximada. Los datos numéricos (fecha, distancia) son 
precisos y provienen de NASA JPL, pero las posiciones 
3D mostradas pueden tener errores significativos.
```

### Opción 3: **Solo mostrar datos de NASA**

Para fechas antiguas:
- ✅ Mostrar tabla con fecha, distancia, velocidad (de NASA)
- 🔴 NO renderizar posiciones 3D
- 💬 Explicar que visualización requiere integración N-body

## 🎓 Qué Decir en la Presentación

> "Nuestro visualizador usa **propagación Kepleriana de 2 cuerpos**, que es precisa para fechas cercanas a la época actual (±5-10 años). Para aproximaciones históricas como las de 1901, **mostramos los datos exactos pre-calculados por NASA JPL** (fecha, distancia, velocidad), pero la visualización 3D puede tener errores significativos por no incluir perturbaciones planetarias acumuladas. La integración N-body completa requeriría un simulador mucho más complejo."

## 📊 Tabla de Precisión por Rango Temporal

| Δt desde época | Error posición Tierra | Error posición asteroide | Precisión total |
|----------------|----------------------|-------------------------|-----------------|
| ±1 año | < 1 millón km | < 1 millón km | ✅ Excelente |
| ±5 años | ~6 millones km | 1-10 millones km | ✅ Buena |
| ±10 años | ~12 millones km | 5-30 millones km | ⚠️ Aceptable |
| ±25 años | ~30 millones km | 20-80 millones km | 🔴 Pobre |
| ±50 años | ~60 millones km | 50-150 millones km | 🔴 Muy pobre |
| **±124 años (1901)** | **~73 millones km** | **100-200 millones km** | 🔴 **Inválida** |

## 💡 Solución Rápida para el Hackathon

**Implementar validación de rango temporal** y mostrar advertencia:

```javascript
const VALID_YEARS = 10; // ±10 años desde época

if (Math.abs(currentDate - epochDate) > VALID_YEARS * 365.25) {
    showWarning("Visualización 3D aproximada - Fuera de rango de validez");
    // Opcionalmente: reducir opacidad de trayectorias
    // Mostrar solo datos tabulares de NASA
}
```

Esto es **honesto científicamente** y demuestra comprensión de las limitaciones del modelo.
