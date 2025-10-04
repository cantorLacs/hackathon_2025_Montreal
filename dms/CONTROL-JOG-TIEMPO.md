# 🎮 Control Manual de Tiempo (Jog/Shuttle)

## ✅ Nueva Funcionalidad Implementada

**Usuario:** "Incluye también una herramienta tipo slide que se mantenga en el centro. Si la pongo un poco a la izquierda el tiempo debe retroceder, y cuando la suelta debe continuar a la velocidad definida y el slider debe volver al centro. Para controlar un poco más directamente el movimiento de los astros"

**Solución:** Control tipo "jog/shuttle" para manipulación directa del flujo temporal

---

## 🎯 ¿Qué es un Control Jog?

### **Concepto**
Similar a los controles de edición de video profesional, permite:
- **Avanzar rápidamente** → Mover a la derecha
- **Retroceder en el tiempo** → Mover a la izquierda  
- **Velocidad normal** → Centro (posición neutra)
- **Auto-retorno** → Vuelve al centro al soltar

### **Inspiración**
```
Controles de edición de video (Premiere, Final Cut):
[⏪========●========⏩]
        Centro = Play normal
```

---

## 🎮 Cómo Funciona

### **Interface Visual**
```
🎮 Control Manual de Tiempo
┌─────────────────────────┐
│ ⏪ ════●════════ ⏩    │
└─────────────────────────┘
  Centro - Velocidad Normal
```

### **Estados del Control**

**1. Centro (Posición 0)**
```
Estado: Normal
Display: "Centro - Velocidad Normal"
Color: Azul (#4a90e2)
Efecto: timeSpeed × 1 (velocidad configurada)
```

**2. Derecha (Valores positivos 1-100)**
```
Estado: Avanzando
Display: "⏩ Avanzando X%"
Color: Verde (#2ecc71)
Efecto: timeSpeed × (X/50)
Ejemplo: +50 → timeSpeed × 1
        +100 → timeSpeed × 2 (doble velocidad)
```

**3. Izquierda (Valores negativos -1 a -100)**
```
Estado: Retrocediendo
Display: "⏪ Retrocediendo X%"
Color: Rojo (#e74c3c)
Efecto: timeSpeed × (X/50)
Ejemplo: -50 → timeSpeed × -1 (retrocede normal)
        -100 → timeSpeed × -2 (retrocede doble)
```

---

## 📊 Tabla de Multiplicadores

| Posición | Valor | Multiplicador | Efecto con 1 día/frame |
|----------|-------|---------------|------------------------|
| ⏪ Max   | -100  | ×-2.0         | Retrocede 2 días/frame |
| ⏪       | -75   | ×-1.5         | Retrocede 1.5 días/frame |
| ⏪       | -50   | ×-1.0         | Retrocede 1 día/frame |
| ⏪       | -25   | ×-0.5         | Retrocede 0.5 días/frame |
| Centro   | 0     | ×1.0          | Normal: 1 día/frame |
| ⏩       | +25   | ×0.5          | Avanza 0.5 días/frame |
| ⏩       | +50   | ×1.0          | Avanza 1 día/frame |
| ⏩       | +75   | ×1.5          | Avanza 1.5 días/frame |
| ⏩ Max   | +100  | ×2.0          | Avanza 2 días/frame |

---

## 🔧 Comportamiento Técnico

### **Fórmula del Jog**
```javascript
// Valor del jog: -100 a +100
const jogMultiplier = jogValue / 50;  // -2 a +2

// Velocidad efectiva
effectiveSpeed = timeSpeed × jogMultiplier;

// Aplicar al tiempo
currentTime += effectiveSpeed × 86400000 (ms);
```

### **Auto-Retorno al Centro**
```javascript
Al soltar el control:
1. Iniciar intervalo cada 50ms
2. Calcular paso hacia el centro
3. Mover gradualmente: paso = valor/10
4. Al llegar a 0: detener intervalo
5. Restaurar estado normal
```

**Ejemplo de retorno:**
```
Posición inicial: +80
Frame 1: +80 - 8 = +72
Frame 2: +72 - 7 = +65
Frame 3: +65 - 6 = +59
...
Frame 10: +10 - 1 = +9
Frame 11: +9 - 1 = +8
...
Frame ~20: 0 (centro)
```

---

## 🎯 Casos de Uso

### **Caso 1: Buscar Evento Específico**
```
Situación: Sabes que hay una aproximación "más o menos por aquí"

Flujo:
1. Configurar velocidad: 🚀 7 días/frame
2. Play
3. Ver que pasas el evento
4. Pausar
5. Mover jog a la IZQUIERDA (⏪)
6. Retroceder lentamente
7. Cuando veas el evento: soltar jog
8. Cambiar velocidad: 🐌 1 hora
9. Play para ver en detalle
```

### **Caso 2: Ajuste Fino de Posición**
```
Situación: Quieres ver la posición exacta en un momento específico

Flujo:
1. Pausar simulación
2. Mover jog ligeramente a derecha/izquierda
3. Asteroides se mueven frame por frame
4. Encontrar posición exacta
5. Soltar jog (vuelve al centro)
6. Capturar screenshot o estudiar
```

### **Caso 3: Rebobinar Después de Aproximación**
```
Situación: Viste una aproximación y quieres verla de nuevo

Flujo:
1. Aproximación terminó
2. Mover jog totalmente a la IZQUIERDA (-100)
3. Retroceder rápidamente (2x velocidad)
4. Ver fecha hasta llegar a "antes del evento"
5. Soltar jog
6. Play para ver de nuevo
```

### **Caso 4: Ralentizar Temporalmente**
```
Situación: Evento interesante ocurriendo pero velocidad muy alta

Flujo:
1. Play con 1 día/frame
2. Asteroide acercándose
3. Mover jog ligeramente a IZQUIERDA (-25)
4. Reduce a 0.5x velocidad
5. Ver evento más lento
6. Soltar jog → vuelve a velocidad normal
```

### **Caso 5: Acelerar Momento Aburrido**
```
Situación: Nada interesante, quieres avanzar rápido

Flujo:
1. Play con 1 día/frame
2. Órbita larga sin eventos
3. Mover jog a DERECHA (+100)
4. Duplicar velocidad → 2 días/frame
5. Avanzar rápidamente
6. Ver aproximación cercana → soltar jog
7. Vuelve a velocidad normal
```

---

## 💡 Ventajas del Sistema

### **1. Control Directo e Intuitivo**
```
✅ No necesitas pausar para ajustar
✅ Control continuo del flujo temporal
✅ Feedback visual inmediato
✅ Reversión automática al soltar
```

### **2. Exploración Fluida**
```
✅ Buscar eventos hacia adelante y atrás
✅ Ajuste fino de posiciones
✅ Rebobinar para ver de nuevo
✅ Acelerar/ralentizar sobre la marcha
```

### **3. Integración con Otros Controles**
```
Jog + Velocidad Base = Gran control
Ejemplo:
- Velocidad base: 1 hora/frame
- Jog a +50: 1 hora × 1 = 1 hora
- Jog a +100: 1 hora × 2 = 2 horas
- Jog a -50: 1 hora × -1 = -1 hora (retrocede)
```

### **4. Experiencia Profesional**
```
Similar a software profesional:
- Adobe Premiere (shuttle control)
- DaVinci Resolve (jog wheel)
- Final Cut Pro (skimming)
```

---

## 🎨 Feedback Visual

### **Estados de Color**
```css
Centro (0):
  Color: Azul #4a90e2
  Mensaje: "Centro - Velocidad Normal"
  Estado: Neutro

Avanzando (+):
  Color: Verde #2ecc71
  Mensaje: "⏩ Avanzando X%"
  Estado: Positivo

Retrocediendo (-):
  Color: Rojo #e74c3c
  Mensaje: "⏪ Retrocediendo X%"
  Estado: Negativo/Reversa
```

### **Elementos Visuales**
```
┌─────────────────────────────┐
│  [⏪]   ════●════   [⏩]   │  ← Slider con iconos
└─────────────────────────────┘
       ↓
  "⏩ Avanzando 50%"            ← Display dinámico
  (verde)
```

---

## 🔄 Ciclo de Vida del Jog

### **1. Usuario Agarra el Control**
```
Evento: mousedown / touchstart
Acción: 
- Detener auto-retorno (si activo)
- Activar modo jog: isJogging = true
- Cambiar cursor: grab → grabbing
```

### **2. Usuario Mueve el Control**
```
Evento: input
Acción:
- Leer valor: -100 a +100
- Guardar: jogValue
- Actualizar display
- Cambiar color según dirección
```

### **3. Simulación Aplica el Jog**
```
En cada frame (animate):
if (isJogging && jogValue !== 0) {
    effectiveSpeed = timeSpeed × (jogValue / 50);
    currentTime += effectiveSpeed × 86400000;
}
```

### **4. Usuario Suelta el Control**
```
Evento: mouseup / touchend / mouseleave
Acción:
- Iniciar auto-retorno
- Intervalo cada 50ms
- Mover gradualmente a 0
- Al llegar: isJogging = false
```

### **5. Control Vuelve al Centro**
```
Animación suave:
Valor actual → 0
Display: "Volviendo al centro..."
Color: Transición a azul
Estado final: Normal
```

---

## 📈 Ejemplos Prácticos

### **Ejemplo 1: Aproximación de Apophis**
```
Objetivo: Ver la aproximación del 13 abril 2029

1. Saltar a fecha: 12 abril 2029
2. Velocidad: 🐌 1 hora/frame
3. Play
4. Aproximación ocurre muy rápido
5. Mover jog a IZQUIERDA (-75)
   → Retrocede 1.5x velocidad
   → Efecto: -1.5 horas/frame
6. Ver fecha retrocediendo
7. Llegar a ~6 horas antes
8. Soltar jog → vuelve a +1 hora/frame
9. Ver aproximación en detalle
```

### **Ejemplo 2: Buscar Próxima Aproximación**
```
Objetivo: Encontrar siguiente aproximación cercana

1. Velocidad: ⚡ 1 día/frame
2. Play
3. Aburrido, nada ocurre
4. Mover jog a DERECHA (+100)
   → Acelera a 2 días/frame
5. Avanzar rápidamente
6. Ver en panel: "Próxima aproximación: 50 DL"
7. Seguir buscando (mantener jog)
8. Ver: "Próxima aproximación: 2 DL" ⚠️
9. Soltar jog
10. Ver evento a velocidad normal
```

### **Ejemplo 3: Estudio de Órbita**
```
Objetivo: Estudiar forma de órbita completa

1. Seleccionar asteroide
2. Pausar
3. Seguimiento de cámara: ON
4. Mover jog ligeramente DERECHA (+10)
   → Avance lento: 0.2x velocidad
5. Asteroide se mueve despacio
6. Observar cada parte de la órbita
7. Cerca de la Tierra: Soltar jog, cambiar a 1h
8. Lejos del Sol: Jog DERECHA para acelerar
9. Completar estudio orbital
```

---

## ⚙️ Configuración Técnica

### **Variables de Estado**
```javascript
this.jogValue = 0;           // -100 a +100
this.isJogging = false;      // Si está en uso
this.jogReturnInterval = null; // Timer de retorno
```

### **Constantes**
```javascript
JOG_MIN = -100;              // Máximo retroceso
JOG_MAX = +100;              // Máximo avance
JOG_CENTER = 0;              // Posición neutra
JOG_DIVISOR = 50;            // Para calcular multiplicador
RETURN_INTERVAL = 50;        // ms entre pasos de retorno
```

### **Cálculos**
```javascript
// Multiplicador de velocidad
jogMultiplier = jogValue / 50;  // Resultado: -2 a +2

// Velocidad efectiva
effectiveSpeed = baseSpeed × jogMultiplier;

// Paso de retorno (proporcional al valor)
returnStep = Math.max(1, Math.abs(jogValue) / 10);
```

---

## 🎓 Comparación con Otros Sistemas

### **vs. Pause + Cambiar Velocidad**
```
ANTES (sin jog):
1. Pausar
2. Cambiar velocidad slider
3. Play
4. Ver resultado
5. Si no es correcto: Pausar, ajustar, Play...

CON JOG:
1. Mover jog
2. Ajuste instantáneo
3. Soltar cuando correcto
4. Continúa automáticamente
```

### **vs. Botones +/- Frame**
```
Botones frame-by-frame:
- Precisión absoluta ✅
- Tedioso para avanzar ❌
- No fluido ❌

Jog:
- Precisión controlable ✅
- Rápido y fluido ✅
- Reversible ✅
```

### **vs. Slider de Fecha**
```
Slider de fecha/timeline:
- Salto instantáneo ✅
- No control de velocidad ❌
- Pierde contexto temporal ❌

Jog:
- Control de velocidad ✅
- Mantiene contexto ✅
- Reversible ✅
```

---

## 🌟 Mejores Prácticas

### **Para Presentaciones**
```
1. Preparar escena (asteroide + fecha)
2. Configurar velocidad base óptima
3. Play para audiencia
4. Usar jog para:
   - Ralentizar momentos clave
   - Retroceder si perdieron algo
   - Acelerar partes aburridas
5. Soltar para continuar fluidamente
```

### **Para Análisis Científico**
```
1. Velocidad base: lenta (1-6 horas)
2. Jog para micro-ajustes
3. Pausar en momentos clave
4. Capturar datos/screenshots
5. Jog para posicionar siguiente evento
6. Repetir
```

### **Para Exploración**
```
1. Velocidad base: media (1 día)
2. Jog DERECHA para buscar rápido
3. Al encontrar evento: Soltar
4. Reducir velocidad base
5. Usar jog para ajuste fino
6. Estudiar evento
```

---

## 🎉 Resumen

### **Características Implementadas**
```
✅ Slider horizontal -100 a +100
✅ Centro = posición neutra (0)
✅ Izquierda = retroceder tiempo
✅ Derecha = avanzar tiempo
✅ Auto-retorno suave al soltar
✅ Feedback visual en tiempo real
✅ Integración con velocidad base
✅ Multiplica velocidad: -2x a +2x
```

### **Beneficios**
```
✅ Control directo del flujo temporal
✅ Exploración fluida adelante/atrás
✅ Ajuste fino sin pausar
✅ Interfaz profesional
✅ Experiencia de usuario superior
```

### **Perfecto Para**
```
🏆 Presentaciones de hackathon
🔬 Análisis científico detallado
🎓 Educación astronómica
🎬 Demos cinematográficas
🎮 Exploración interactiva
```

**¡El control más intuitivo para manipular el tiempo en tu simulación!** 🚀
