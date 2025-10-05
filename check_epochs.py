from datetime import datetime, timedelta

def jd_to_date(jd):
    """Convierte Julian Date a fecha gregoriana"""
    base = datetime(1858, 11, 17)
    return base + timedelta(days=jd - 2400000.5)

# Épocas de los asteroides
epoch_sy10 = 2460943.5
epoch_orpheus = 2460998.5

# Fechas de acercamiento
approach_sy10 = datetime(2025, 10, 5)
approach_orpheus = datetime(2025, 11, 19)

# Convertir épocas a fechas
date_sy10 = jd_to_date(epoch_sy10)
date_orpheus = jd_to_date(epoch_orpheus)

print("=== ANÁLISIS DE ÉPOCAS ===\n")

print("2025 SY10:")
print(f"  Época (JD {epoch_sy10}): {date_sy10.strftime('%Y-%m-%d')}")
print(f"  Acercamiento: {approach_sy10.strftime('%Y-%m-%d')}")
diff_sy10 = (approach_sy10 - date_sy10).days
print(f"  Diferencia: {diff_sy10} días")
print(f"  Distancia esperada: 6.006M km")
print(f"  Distancia calculada: 60.1M km")
print(f"  Factor de error: {60.1 / 6.006:.2f}x\n")

print("Orpheus:")
print(f"  Época (JD {epoch_orpheus}): {date_orpheus.strftime('%Y-%m-%d')}")
print(f"  Acercamiento: {approach_orpheus.strftime('%Y-%m-%d')}")
diff_orpheus = (approach_orpheus - date_orpheus).days
print(f"  Diferencia: {diff_orpheus} días")
print(f"  Distancia esperada: 5.673M km")
print(f"  Distancia calculada: 70.4M km")
print(f"  Factor de error: {70.4 / 5.673:.2f}x\n")

print("=== CONCLUSIÓN ===")
print(f"Ambos asteroides tienen errores de ~10x en la distancia")
print(f"Esto sugiere un problema en la ESCALA o en las UNIDADES")
