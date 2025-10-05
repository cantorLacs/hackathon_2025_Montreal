# Script para obtener los 200 asteroides MÁS CERCANOS a la Tierra (últimos 50 años)
# Con elementos orbitales REALES de NASA JPL SBDB

$API_KEY = "FtlbR4MhcVSE1Z3DYcoGeBqQqQtfzKIOerjefTbl"

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "OBTENCIÓN AUTOMÁTICA DE LOS 200 ASTEROIDES MÁS CERCANOS" -ForegroundColor Yellow
Write-Host "Fuente: NASA JPL CAD API + SBDB API" -ForegroundColor Gray
Write-Host "=" * 80 -ForegroundColor Cyan

# PASO 1: Obtener lista de los 200 asteroides más cercanos
Write-Host "`n[1/3] Descargando lista de 200 asteroides más cercanos..." -ForegroundColor Cyan

$cadUrl = "https://ssd-api.jpl.nasa.gov/cad.api?date-min=1975-01-01" + "&date-max=2025-12-31" + "&dist-max=0.1" + "&sort=dist" + "&limit=200" + "&fullname=true"

try {
    $cadData = Invoke-RestMethod -Uri $cadUrl
    Write-Host "  ✓ Obtenidos $($cadData.count) asteroides del CAD API" -ForegroundColor Green
}
catch {
    Write-Host "  ✗ Error obteniendo CAD data: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Convertir a objetos estructurados
$asteroidList = @()
$fields = $cadData.fields

for ($i = 0; $i -lt $cadData.data.Count; $i++) {
    $row = $cadData.data[$i]
    
    $asteroid = @{
        des = $row[0]           # designation
        orbit_id = $row[1]      # orbit ID
        jd = $row[2]            # Julian Date
        cd = $row[3]            # Close Approach Date
        dist = $row[4]          # Distance (AU)
        dist_min = $row[5]      # Min distance
        dist_max = $row[6]      # Max distance
        v_rel = $row[7]         # Relative velocity (km/s)
        v_inf = $row[8]         # V infinity
        t_sigma_f = $row[9]     # Time sigma
        h = $row[10]            # Absolute magnitude H
        fullname = $row[11]     # Full name
    }
    
    $asteroidList += $asteroid
}

Write-Host "  ✓ Procesados $($asteroidList.Count) asteroides" -ForegroundColor Green

# PASO 2: Descargar elementos orbitales REALES de SBDB para cada asteroide
Write-Host "`n[2/3] Descargando elementos orbitales de SBDB..." -ForegroundColor Cyan

$results = @()
$success = 0
$failed = 0

foreach ($ast in $asteroidList) {
    $name = $ast.des
    $progress = [math]::Round(($success + $failed) / $asteroidList.Count * 100, 1)
    
    Write-Host "  [$progress%] $name..." -NoNewline -ForegroundColor Gray
    
    try {
        $encoded = [System.Uri]::EscapeDataString($name)
        $sbdbUrl = "https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=$encoded" + "&full-prec=true"
        
        $sbdbData = Invoke-RestMethod -Uri $sbdbUrl
        
        # Extraer elementos orbitales
        if ($sbdbData.orbit -and $sbdbData.orbit.elements) {
            $elem = $sbdbData.orbit.elements
            
            $e = ($elem | Where-Object {$_.name -eq 'e'}).value
            $a = ($elem | Where-Object {$_.name -eq 'a'}).value
            $i = ($elem | Where-Object {$_.name -eq 'i'}).value
            $om = ($elem | Where-Object {$_.name -eq 'om'}).value
            $w = ($elem | Where-Object {$_.name -eq 'w'}).value
            $ma = ($elem | Where-Object {$_.name -eq 'ma'}).value
            $n = ($elem | Where-Object {$_.name -eq 'n'}).value
            $epoch = $sbdbData.orbit.epoch
            
            # Convertir fecha de acercamiento a ISO
            $dateStr = $ast.cd
            if ($dateStr -match '(\d{4})-(\w{3})-(\d{2}) (\d{2}):(\d{2})') {
                $year = $Matches[1]
                $monthName = $Matches[2]
                $day = $Matches[3]
                $hour = $Matches[4]
                $minute = $Matches[5]
                
                # Convertir mes
                $months = @{
                    'Jan'='01'; 'Feb'='02'; 'Mar'='03'; 'Apr'='04';
                    'May'='05'; 'Jun'='06'; 'Jul'='07'; 'Aug'='08';
                    'Sep'='09'; 'Oct'='10'; 'Nov'='11'; 'Dec'='12'
                }
                $month = $months[$monthName]
                
                $isoDate = "${year}-${month}-${day}T${hour}:${minute}:00.000Z"
            } else {
                $isoDate = "1970-01-01T00:00:00.000Z"
            }
            
            # Calcular distancia en km
            $distKm = [math]::Round([double]$ast.dist * 149597870.7, 0)
            
            # Obtener H (magnitud absoluta)
            $H = if ($sbdbData.phys_par.H) { $sbdbData.phys_par.H } else { [double]$ast.h }
            
            # Estimar diámetro (fórmula aproximada)
            $diameter = 1329 / [math]::Sqrt([math]::Pow(10, 0.2 * $H))
            
            $asteroidData = @{
                id = $name.Replace(' ', '').Replace('(', '').Replace(')', '')
                name = $name
                full_name = $ast.fullname.Trim()
                h = $H
                diameter_km = $diameter
                orbit_class = if ($sbdbData.object.orbit_class.code) { $sbdbData.object.orbit_class.code } else { "NEO" }
                e = $e
                a = $a
                i = $i
                om = $om
                w = $w
                ma = $ma
                n = $n
                epoch = $epoch
                orbit_id = $ast.orbit_id
                approach_date = $isoDate
                approach_date_short = "${year}-${month}-${day}"
                dist_km = $distKm
                vel_km_s = [double]$ast.v_rel
            }
            
            $results += $asteroidData
            $success++
            Write-Host " ✓" -ForegroundColor Green
        } else {
            $failed++
            Write-Host " ✗ (sin elementos)" -ForegroundColor Yellow
        }
        
        # Esperar para no saturar la API
        Start-Sleep -Milliseconds 300
        
    } catch {
        $failed++
        Write-Host " ✗ (error)" -ForegroundColor Red
    }
}

Write-Host "`n  ✓ Descargados: $success asteroides" -ForegroundColor Green
Write-Host "  ✗ Fallidos: $failed asteroides" -ForegroundColor Yellow

# PASO 3: Generar JSON para insertar en asteroid-visualizer.js
Write-Host "`n[3/3] Generando JSON para visualizador..." -ForegroundColor Cyan

$jsonAsteroids = @()

foreach ($ast in $results) {
    $jsonAsteroid = @"
                    {
                        "id": "$($ast.id)",
                        "name": "$($ast.name)",
                        "full_name": "$($ast.full_name)",
                        "is_potentially_hazardous_asteroid": false,
                        "absolute_magnitude_h": $($ast.h),
                        "estimated_diameter": {
                            "kilometers": {
                                "estimated_diameter_min": $([math]::Round($ast.diameter_km * 0.7, 4)),
                                "estimated_diameter_max": $([math]::Round($ast.diameter_km * 1.3, 4))
                            }
                        },
                        "orbital_data": {
                            "orbit_id": "$($ast.orbit_id)",
                            "epoch_osculation": $($ast.epoch),
                            "eccentricity": "$($ast.e)",
                            "semi_major_axis": "$($ast.a)",
                            "inclination": "$($ast.i)",
                            "ascending_node_longitude": "$($ast.om)",
                            "perihelion_argument": "$($ast.w)",
                            "mean_anomaly": "$($ast.ma)",
                            "mean_motion": "$($ast.n)",
                            "orbit_class": {
                                "orbit_class_type": "$($ast.orbit_class)"
                            }
                        },
                        "close_approach_data": [{
                            "close_approach_date": "$($ast.approach_date_short)",
                            "close_approach_date_full": "$($ast.approach_date)",
                            "relative_velocity": {
                                "kilometers_per_second": "$($ast.vel_km_s)",
                                "kilometers_per_hour": "$([math]::Round($ast.vel_km_s * 3600, 0))"
                            },
                            "miss_distance": {
                                "astronomical": "$([math]::Round($ast.dist_km / 149597870.7, 9))",
                                "kilometers": "$($ast.dist_km)",
                                "lunar": "$([math]::Round($ast.dist_km / 384400, 2))"
                            },
                            "orbiting_body": "Earth"
                        }]
                    }
"@
    
    $jsonAsteroids += $jsonAsteroid
}

$fullJson = @"
{
    "metadata": {
        "source": "NASA JPL CAD API + SBDB API",
        "description": "Los $($results.Count) asteroides MÁS CERCANOS a la Tierra (últimos 50 años)",
        "date_range": "1975-2025",
        "precision": "MÁXIMA - Elementos orbitales REALES de SBDB",
        "date_generated": "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
        "api_key_used": "FtlbR4MhcVSE1Z3DYcoGeBqQqQtfzKIOerjefTbl"
    },
    "asteroids": [
$($jsonAsteroids -join ",`n")
    ]
}
"@

# Guardar JSON completo
$fullJson | Out-File -Encoding UTF8 "top200_closest_asteroids_REAL.json"

Write-Host "  ✓ JSON generado: top200_closest_asteroids_REAL.json" -ForegroundColor Green

# Guardar también CSV para análisis
$csvData = $results | ForEach-Object {
    [PSCustomObject]@{
        Name = $_.name
        Date = $_.approach_date_short
        Distance_km = $_.dist_km
        Velocity_km_s = $_.vel_km_s
        Magnitude_H = $_.h
        Diameter_km = [math]::Round($_.diameter_km, 3)
        Eccentricity = $_.e
        SemiMajorAxis_AU = $_.a
        Inclination_deg = $_.i
    }
}

$csvData | Export-Csv -Path "top200_closest_asteroids.csv" -NoTypeInformation -Encoding UTF8

Write-Host "  ✓ CSV generado: top200_closest_asteroids.csv" -ForegroundColor Green

# Generar código JavaScript para insertar en asteroid-visualizer.js
$jsCode = @"
// CÓDIGO PARA INSERTAR EN asteroid-visualizer.js
// Reemplazar la sección de asteroides en loadVerifiedAsteroids()

const data = $fullJson;

// Este código va dentro de async loadVerifiedAsteroids() {...}
// Línea ~1668 en asteroid-visualizer.js
"@

$jsCode | Out-File -Encoding UTF8 "insert_into_visualizer.js"

Write-Host "  ✓ Código JS generado: insert_into_visualizer.js" -ForegroundColor Green

# Resumen
Write-Host "`n" + ("=" * 80) -ForegroundColor Cyan
Write-Host "RESUMEN" -ForegroundColor Yellow
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "  Total asteroides obtenidos: $($results.Count)" -ForegroundColor White
Write-Host "  Rango de fechas: 1975-2025 (50 años)" -ForegroundColor White
Write-Host "  Asteroide más cercano: $($results[0].name) - $($results[0].dist_km) km" -ForegroundColor White
Write-Host "`nArchivos generados:" -ForegroundColor White
Write-Host "  1. top200_closest_asteroids_REAL.json (datos completos)" -ForegroundColor Gray
Write-Host "  2. top200_closest_asteroids.csv (análisis)" -ForegroundColor Gray
Write-Host "  3. insert_into_visualizer.js (código para insertar)" -ForegroundColor Gray
Write-Host "`n¡LISTO! Ahora copia el JSON de top200_closest_asteroids_REAL.json" -ForegroundColor Green
Write-Host "al archivo asteroid-visualizer.js en la función loadVerifiedAsteroids()" -ForegroundColor Green
Write-Host ("=" * 80) -ForegroundColor Cyan
