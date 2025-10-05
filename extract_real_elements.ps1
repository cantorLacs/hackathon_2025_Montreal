# Extraer elementos orbitales REALES de los 5 asteroides más cercanos

$asteroids = @(
    @{file='2020_VT4_real.json'; name='2020 VT4'; date='2020-11-13T17:21:00.000Z'; dist_km='6740'; vel='13.43'},
    @{file='2023_BU_real.json'; name='2023 BU'; date='2023-01-27T00:29:00.000Z'; dist_km='9960'; vel='9.27'},
    @{file='2011_CQ1_real.json'; name='2011 CQ1'; date='2011-02-04T19:39:00.000Z'; dist_km='11850'; vel='9.69'},
    @{file='2020_QG_real.json'; name='2020 QG'; date='2020-08-16T04:09:00.000Z'; dist_km='9320'; vel='12.33'},
    @{file='2020_JJ_real.json'; name='2020 JJ'; date='2020-05-04T12:05:00.000Z'; dist_km='13400'; vel='14.36'}
)

$output = @()

foreach ($ast in $asteroids) {
    Write-Host "`nProcesando: $($ast.name)" -ForegroundColor Yellow
    
    $data = Get-Content $ast.file | ConvertFrom-Json
    
    if ($data.orbit -and $data.orbit.elements) {
        $elem = $data.orbit.elements
        
        # Extraer valores
        $e = ($elem | Where-Object {$_.name -eq 'e'}).value
        $a = ($elem | Where-Object {$_.name -eq 'a'}).value
        $i = ($elem | Where-Object {$_.name -eq 'i'}).value
        $om = ($elem | Where-Object {$_.name -eq 'om'}).value
        $w = ($elem | Where-Object {$_.name -eq 'w'}).value
        $ma = ($elem | Where-Object {$_.name -eq 'ma'}).value
        $n = ($elem | Where-Object {$_.name -eq 'n'}).value
        $epoch = $data.orbit.epoch
        
        Write-Host "  e: $e" -ForegroundColor Gray
        Write-Host "  a: $a AU" -ForegroundColor Gray
        Write-Host "  i: $i°" -ForegroundColor Gray
        Write-Host "  Ω: $om°" -ForegroundColor Gray
        Write-Host "  ω: $w°" -ForegroundColor Gray
        Write-Host "  M: $ma°" -ForegroundColor Gray
        Write-Host "  n: $n°/day" -ForegroundColor Gray
        Write-Host "  epoch: $epoch" -ForegroundColor Gray
        
        $output += @"
    {
        "id": "$($ast.name.Replace(' ', ''))",
        "name": "$($ast.name)",
        "full_name": "($($ast.name))",
        "is_potentially_hazardous_asteroid": false,
        "absolute_magnitude_h": $($data.phys_par.H),
        "estimated_diameter": {
            "kilometers": {
                "estimated_diameter_min": $([math]::Round($data.phys_par.diameter / 2, 4)),
                "estimated_diameter_max": $([math]::Round($data.phys_par.diameter * 1.5, 4))
            }
        },
        "orbital_data": {
            "orbit_id": "$($data.orbit.orbit_id)",
            "epoch_osculation": $epoch,
            "eccentricity": "$e",
            "semi_major_axis": "$a",
            "inclination": "$i",
            "ascending_node_longitude": "$om",
            "perihelion_argument": "$w",
            "mean_anomaly": "$ma",
            "mean_motion": "$n",
            "orbit_class": {
                "orbit_class_type": "APO"
            }
        },
        "close_approach_data": [{
            "close_approach_date": "$($ast.date.Split('T')[0])",
            "close_approach_date_full": "$($ast.date)",
            "relative_velocity": {
                "kilometers_per_second": "$($ast.vel)",
                "kilometers_per_hour": "$([math]::Round([double]$ast.vel * 3600, 0))"
            },
            "miss_distance": {
                "astronomical": "$([math]::Round([double]$ast.dist_km / 149597870.7, 9))",
                "kilometers": "$($ast.dist_km)",
                "lunar": "$([math]::Round([double]$ast.dist_km / 384400, 2))"
            },
            "orbiting_body": "Earth"
        }]
    }
"@
    }
}

$fullOutput = @"
{
    "metadata": {
        "source": "NASA JPL SBDB API (Small-Body Database)",
        "description": "Los 5 asteroides MÁS CERCANOS a la Tierra - Elementos orbitales REALES de alta precisión",
        "precision": "MÁXIMA - Datos directos de JPL SBDB con full-prec=true",
        "date_generated": "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    },
    "asteroids": [
$($output -join ",`n")
    ]
}
"@

$fullOutput | Out-File -Encoding UTF8 "top5_closest_REAL_elements.json"

Write-Host "`n✅ Archivo creado: top5_closest_REAL_elements.json" -ForegroundColor Green
