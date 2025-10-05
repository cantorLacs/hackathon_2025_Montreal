from datetime import datetime
import math

# Época de los elementos de la Tierra
earth_epoch_jd = 2451545.0  # J2000.0 = 1 Enero 2000
earth_epoch = datetime(2000, 1, 1, 12, 0, 0)

# Época de los asteroides
asteroid_epoch_jd = 2461000.5  # 21 Nov 2025
asteroid_epoch = datetime(2025, 11, 21)

# Fecha actual
today = datetime(2025, 10, 4)
today_jd = 2460952.5  # Aproximado

print("=== PROBLEMA DE ÉPOCA ===\n")
print(f"Elementos de la TIERRA: Época J2000.0 ({earth_epoch.strftime('%d %b %Y')})")
print(f"Elementos de ASTEROIDES: Época {asteroid_epoch.strftime('%d %b %Y')}")
print(f"Fecha actual: {today.strftime('%d %b %Y')}")

print("\n=== DIFERENCIAS DE TIEMPO ===")
diff_earth_today = (today - earth_epoch).days
diff_asteroid_today = (asteroid_epoch - today).days

print(f"\nTierra propagada desde J2000: {diff_earth_today} días ({diff_earth_today/365.25:.1f} años)")
print(f"Asteroides propagados desde época: {diff_asteroid_today} días ({abs(diff_asteroid_today/365.25):.1f} años)")

print("\n=== ESTIMACIÓN DE ERROR ===")
# La órbita de la Tierra tiene perturbaciones de ~15,000 km después de propagación
# Pero eso es con elementos RECIENTES. Con elementos de hace 25 años...

# Movimiento medio de la Tierra
earth_mean_motion = 360.0 / 365.256363004  # grados/día

# Error acumulado en anomalía media
error_degrees = diff_earth_today * earth_mean_motion
error_cycles = error_degrees / 360.0

print(f"\nCiclos orbitales de la Tierra desde J2000: {error_cycles:.2f} vueltas")
print(f"Anomalía media acumulada: {error_degrees:.1f}°")

# Perturbaciones planetarias causan error
# Aproximación: ~1 km/día de error acumulativo por perturbaciones
perturbation_error_km = diff_earth_today * 1.0

print(f"\nError estimado por perturbaciones: ~{perturbation_error_km/1000:.0f} mil km")
print(f"En AU: ~{perturbation_error_km / 149597870.7:.6f} AU")

print("\n=== IMPACTO EN DISTANCIA TIERRA-ASTEROIDE ===")
print("Si la Tierra está mal posicionada por ~15-20 mil km,")
print("y el asteroide está bien calculado,")
print("la distancia calculada puede tener error significativo.")
print("\n⚠️  La Tierra debería usar elementos de época RECIENTE, no J2000!")
