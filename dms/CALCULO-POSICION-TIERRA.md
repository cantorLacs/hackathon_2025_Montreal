# Cálculo de la Posición de la Tierra

## Método Implementado

La posición de la Tierra se calcula usando un **modelo circular simplificado**:

```javascript
getEarthPosition(julianDate) {
    const daysSinceEpoch = julianDate - 2451545.0;
    const earthAngle = (daysSinceEpoch / 365.25) * 2 * Math.PI;
    return {
        x: this.AU * Math.cos(earthAngle),
        y: this.AU * Math.sin(earthAngle),
        z: 0
    };
}
```

### Parámetros Utilizados

1. **Época de referencia**: J2000.0 (JD 2451545.0 = 1 enero 2000, 12:00 TT)
2. **Distancia al Sol**: 1 AU = 149,597,870.7 km (valor exacto por definición IAU)
3. **Período orbital**: 365.25 días (año juliano)
4. **Órbita**: Circular (excentricidad = 0)
5. **Plano orbital**: Eclíptica (inclinación = 0°, z = 0)

## Asunciones del Modelo

### ✅ Simplificaciones Aceptables

1. **Órbita circular**: La Tierra asume e = 0
   - Valor real: e = 0.0167086
   - **Impacto**: ±2.5 millones de km de error (±1.67% de AU)

2. **Período fijo**: 365.25 días
   - Valor real: 365.256363004 días (año sideral)
   - **Impacto**: Desfase de ~6.6 días en 100 años

3. **Sin precesión**: Orientación orbital fija
   - Valor real: El perihelio precede ~11.45" por año
   - **Impacto**: Pequeño para simulaciones cortas (<10 años)

4. **Plano eclíptico**: z = 0 siempre
   - Valor real: La Tierra define la eclíptica por convención
   - **Impacto**: Ninguno, es correcto usar z = 0

## Análisis de Precisión

### Comparación con el Método de los Asteroides

| Aspecto | Asteroides | Tierra |
|---------|-----------|--------|
| **Elementos orbitales** | 6 elementos completos (a, e, i, Ω, ω, M₀) | Modelo circular simplificado |
| **Ecuación de Kepler** | Resuelto con Newton-Raphson | No aplicado (órbita circular) |
| **Anomalía excéntrica** | Calculada iterativamente | No necesaria |
| **Anomalía verdadera** | Convertida desde E | Directamente = ángulo medio |
| **Transformaciones** | 3 rotaciones (i, Ω, ω) | Ninguna (plano xy) |

### Error Absoluto Máximo

```
Error máximo por excentricidad = e × a = 0.0167086 × 149,597,870.7 km
                                       ≈ 2,499,000 km
                                       ≈ 0.0167 AU
                                       ≈ 1.67% de la distancia Tierra-Sol
```

### Error Relativo en Distancias Geocéntricas

Para un asteroide a distancia D de la Tierra:

- **D = 0.05 AU** (muy cercano): Error relativo ≈ 1.67% / 0.05 = 33%
- **D = 0.1 AU** (cercano): Error relativo ≈ 1.67% / 0.1 = 16.7%
- **D = 0.5 AU**: Error relativo ≈ 1.67% / 0.5 = 3.3%
- **D = 1.0 AU**: Error relativo ≈ 1.67% / 1.0 = 1.67%
- **D > 2.0 AU**: Error relativo < 1%

## Evaluación para el Hackathon

### ✅ Ventajas del Modelo Actual

1. **Rapidez**: Cálculo instantáneo sin iteraciones
2. **Simplicidad**: Fácil de entender y verificar
3. **Estabilidad**: Sin problemas numéricos
4. **Suficiente para visualización**: La mayoría de asteroides están > 0.5 AU

### ⚠️ Limitaciones

1. **Aproximaciones muy cercanas** (< 0.1 AU): Error puede ser significativo
2. **Simulaciones largas** (> 10 años): Desfase acumulativo del período
3. **Comparación con efemérides reales**: Diferencias notables

### ✅ Recomendación: **ACEPTABLE PARA EL HACKATHON**

**Razones**:

1. La visualización es **educativa/demostrativa**, no científica de precisión
2. Los datos de aproximación vienen **pre-calculados por NASA JPL** (precisión completa)
3. El error de 1-2% es **visualmente imperceptible** en la escala del sistema solar
4. La alternativa (elementos orbitales completos) añade **complejidad sin beneficio visual**

## Si se Requiere Mayor Precisión

### Opción 1: Elementos Orbitales de la Tierra

Usar valores reales:
- **a** = 1.00000011 AU
- **e** = 0.01671022
- **i** = 0.00005° (eclíptica de la fecha)
- **Ω** = variable (precesión)
- **ω** = 102.94719° (perihelio, epoch J2000)
- **M₀** = calculado desde época

**Ventaja**: Mayor precisión (error < 0.01%)  
**Desventaja**: 5-10x más cálculo, precesión compleja

### Opción 2: VSOP87 (Teoría Analítica)

Serie de términos trigonométricos para calcular posición.

**Ventaja**: Precisión de arco-segundo  
**Desventaja**: Implementación compleja (~1000 líneas)

### Opción 3: NASA SPICE

Usar efemérides tabuladas de JPL.

**Ventaja**: Precisión máxima (metros)  
**Desventaja**: Dependencia externa, archivos grandes

## Conclusión

La posición de la Tierra se calcula mediante:

```
Ángulo = (días desde J2000.0 / 365.25) × 360°
Posición = (AU × cos(ángulo), AU × sin(ángulo), 0)
```

Este método es **correcto y suficiente** para:
- ✅ Visualización 3D del sistema solar
- ✅ Representación de trayectorias asteroidales
- ✅ Demostraciones educativas
- ✅ Proyectos de hackathon

No es adecuado para:
- ❌ Cálculos científicos de precisión
- ❌ Predicción de aproximaciones reales
- ❌ Simulaciones de más de 10-20 años

**Para tu hackathon, la representación ES CORRECTA** ✓

Las aproximaciones mostradas tienen precisión completa porque **vienen directamente de NASA** (campo `close_approach_data`), no las calculamos nosotros.
