from datetime import datetime

# Época en Julian Date
jd_epoch = 2461000.5

# Convertir Julian Date a fecha Gregoriana
unix_timestamp = (jd_epoch - 2440587.5) * 86400
epoch_date = datetime.utcfromtimestamp(unix_timestamp)

print(f"Época de los elementos orbitales: {epoch_date.strftime('%Y-%m-%d')}")
print(f"Julian Date: {jd_epoch}")

# Calcular diferencia con hoy (4 Oct 2025)
today = datetime(2025, 10, 4)
days_diff = (today - epoch_date).days

print(f"\nDiferencia con hoy (4 Oct 2025): {days_diff} días")
print(f"Eso es aproximadamente: {days_diff/30.44:.1f} meses")
print(f"O {days_diff/365.25:.2f} años")
