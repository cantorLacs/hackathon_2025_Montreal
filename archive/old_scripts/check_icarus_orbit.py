import math

# Datos de Icarus del CSV
a = 1.078  # AU - semi-eje mayor
period_days = 409  # días
n_csv = 0.8805  # del CSV

# Calcular mean motion correcto
# n = 360° / Período (en grados/día)
n_correct_deg_per_day = 360.0 / period_days

# También en radianes/día
n_correct_rad_per_day = (2 * math.pi) / period_days

print("=== Icarus - Verificación de Mean Motion ===")
print(f"\nSemi-eje mayor: {a} AU")
print(f"Período orbital: {period_days} días")
print(f"\nMean motion del CSV: {n_csv}")
print(f"Mean motion correcto (grados/día): {n_correct_deg_per_day:.6f}")
print(f"Mean motion correcto (rad/día): {n_correct_rad_per_day:.6f}")

# Verificar si el CSV está en grados/día
print(f"\n¿El CSV está en grados/día? {abs(n_csv - n_correct_deg_per_day) < 0.01}")
print(f"Diferencia: {abs(n_csv - n_correct_deg_per_day):.6f}")

# Calcular conversión correcta
print(f"\n=== Conversión para el simulador ===")
print(f"n (rad/día) = {n_csv} * π/180 = {math.radians(n_csv):.8f}")
print(f"n (rad/seg) = {math.radians(n_csv) / 86400:.12f}")
