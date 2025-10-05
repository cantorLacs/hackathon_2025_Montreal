# Script para obtener los 200 asteroides MÁS CERCANOS a la Tierra (últimos 50 años)
param()

$API_KEY = "FtlbR4MhcVSE1Z3DYcoGeBqQqQtfzKIOerjefTbl"

Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "OBTENCIÓN AUTOMÁTICA DE LOS 200 ASTEROIDES MÁS CERCANOS" -ForegroundColor Yellow
Write-Host ("=" * 80) -ForegroundColor Cyan

# PASO 1: Obtener lista
Write-Host "`n[1/3] Descargando lista..." -ForegroundColor Cyan

$cadUrl = 'https://ssd-api.jpl.nasa.gov/cad.api?date-min=1975-01-01&date-max=2025-12-31&dist-max=0.1&sort=dist&limit=200&fullname=true'

$cadData = Invoke-RestMethod -Uri $cadUrl
Write-Host "  OK: $($cadData.count) asteroides" -ForegroundColor Green

# Convertir a objetos
$asteroidList = @()
for ($i = 0; $i -lt $cadData.data.Count; $i++) {
    $row = $cadData.data[$i]
    $asteroidList += @{
        des = $row[0]
        orbit_id = $row[1]
        jd = $row[2]
        cd = $row[3]
        dist = $row[4]
        v_rel = $row[7]
        h = $row[10]
        fullname = $row[11]
    }
}

# PASO 2: Descargar elementos orbitales
Write-Host "`n[2/3] Descargando elementos orbitales..." -ForegroundColor Cyan

$results = @()
$success = 0

foreach ($ast in $asteroidList) {
    $name = $ast.des
    $encoded = [System.Uri]::EscapeDataString($name)
    $amp = [char]38
    $sbdbUrl = "https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=${encoded}${amp}full-prec=true"
    
    try {
        $sbdbData = Invoke-RestMethod -Uri $sbdbUrl
        
        if ($sbdbData.orbit -and $sbdbData.orbit.elements) {
            $elem = $sbdbData.orbit.elements
            
            $results += @{
                id = $name.Replace(' ', '').Replace('(', '').Replace(')', '')
                name = $name
                full_name = $ast.fullname.Trim()
                h = if ($sbdbData.phys_par.H) { $sbdbData.phys_par.H } else { [double]$ast.h }
                orbit_class = if ($sbdbData.object.orbit_class.code) { $sbdbData.object.orbit_class.code } else { "NEO" }
                e = ($elem | Where-Object {$_.name -eq 'e'}).value
                a = ($elem | Where-Object {$_.name -eq 'a'}).value
                i = ($elem | Where-Object {$_.name -eq 'i'}).value
                om = ($elem | Where-Object {$_.name -eq 'om'}).value
                w = ($elem | Where-Object {$_.name -eq 'w'}).value
                ma = ($elem | Where-Object {$_.name -eq 'ma'}).value
                n = ($elem | Where-Object {$_.name -eq 'n'}).value
                epoch = $sbdbData.orbit.epoch
                orbit_id = $ast.orbit_id
                cd = $ast.cd
                dist = $ast.dist
                v_rel = $ast.v_rel
            }
            
            $success++
            if ($success % 10 -eq 0) {
                Write-Host "  Progreso: $success/$($asteroidList.Count)" -ForegroundColor Gray
            }
        }
        
        Start-Sleep -Milliseconds 300
    }
    catch {
        # Ignorar errores silenciosamente
    }
}

Write-Host "  OK: $success asteroides descargados" -ForegroundColor Green

# PASO 3: Generar JSON
Write-Host "`n[3/3] Generando JSON..." -ForegroundColor Cyan

$outputFile = "top200_closest_asteroids_REAL.json"
$jsonContent = "{\n  `"metadata`": {\n    `"source`": `"NASA JPL CAD + SBDB`",\n    `"count`": $success\n  },\n  `"asteroids`": [\n"

for ($i = 0; $i -lt $results.Count; $i++) {
    $ast = $results[$i]
    
    # Convertir fecha
    if ($ast.cd -match '(\d{4})-(\w{3})-(\d{2}) (\d{2}):(\d{2})') {
        $year = $Matches[1]
        $monthNum = switch ($Matches[2]) {
            'Jan' { '01' }; 'Feb' { '02' }; 'Mar' { '03' }; 'Apr' { '04' }
            'May' { '05' }; 'Jun' { '06' }; 'Jul' { '07' }; 'Aug' { '08' }
            'Sep' { '09' }; 'Oct' { '10' }; 'Nov' { '11' }; 'Dec' { '12' }
        }
        $day = $Matches[3]
        $hour = $Matches[4]
        $min = $Matches[5]
        $isoDate = "${year}-${monthNum}-${day}T${hour}:${min}:00.000Z"
        $shortDate = "${year}-${monthNum}-${day}"
    }
    else {
        $isoDate = "1970-01-01T00:00:00.000Z"
        $shortDate = "1970-01-01"
    }
    
    $distKm = [math]::Round([double]$ast.dist * 149597870.7, 0)
    $diameter = 1329 / [math]::Sqrt([math]::Pow(10, 0.2 * $ast.h))
    
    $jsonContent += "    {\n"
    $jsonContent += "      `"id`": `"$($ast.id)`",\n"
    $jsonContent += "      `"name`": `"$($ast.name)`",\n"
    $jsonContent += "      `"full_name`": `"$($ast.full_name)`",\n"
    $jsonContent += "      `"is_potentially_hazardous_asteroid`": false,\n"
    $jsonContent += "      `"absolute_magnitude_h`": $($ast.h),\n"
    $jsonContent += "      `"estimated_diameter`": {\n"
    $jsonContent += "        `"kilometers`": {\n"
    $jsonContent += "          `"estimated_diameter_min`": $([math]::Round($diameter * 0.7, 4)),\n"
    $jsonContent += "          `"estimated_diameter_max`": $([math]::Round($diameter * 1.3, 4))\n"
    $jsonContent += "        }\n"
    $jsonContent += "      },\n"
    $jsonContent += "      `"orbital_data`": {\n"
    $jsonContent += "        `"orbit_id`": `"$($ast.orbit_id)`",\n"
    $jsonContent += "        `"epoch_osculation`": $($ast.epoch),\n"
    $jsonContent += "        `"eccentricity`": `"$($ast.e)`",\n"
    $jsonContent += "        `"semi_major_axis`": `"$($ast.a)`",\n"
    $jsonContent += "        `"inclination`": `"$($ast.i)`",\n"
    $jsonContent += "        `"ascending_node_longitude`": `"$($ast.om)`",\n"
    $jsonContent += "        `"perihelion_argument`": `"$($ast.w)`",\n"
    $jsonContent += "        `"mean_anomaly`": `"$($ast.ma)`",\n"
    $jsonContent += "        `"mean_motion`": `"$($ast.n)`",\n"
    $jsonContent += "        `"orbit_class`": {\n"
    $jsonContent += "          `"orbit_class_type`": `"$($ast.orbit_class)`"\n"
    $jsonContent += "        }\n"
    $jsonContent += "      },\n"
    $jsonContent += "      `"close_approach_data`": [{\n"
    $jsonContent += "        `"close_approach_date`": `"$shortDate`",\n"
    $jsonContent += "        `"close_approach_date_full`": `"$isoDate`",\n"
    $jsonContent += "        `"relative_velocity`": {\n"
    $jsonContent += "          `"kilometers_per_second`": `"$($ast.v_rel)`",\n"
    $jsonContent += "          `"kilometers_per_hour`": `"$([math]::Round([double]$ast.v_rel * 3600, 0))`"\n"
    $jsonContent += "        },\n"
    $jsonContent += "        `"miss_distance`": {\n"
    $jsonContent += "          `"astronomical`": `"$($ast.dist)`",\n"
    $jsonContent += "          `"kilometers`": `"$distKm`",\n"
    $jsonContent += "          `"lunar`": `"$([math]::Round($distKm / 384400, 2))`"\n"
    $jsonContent += "        },\n"
    $jsonContent += "        `"orbiting_body`": `"Earth`"\n"
    $jsonContent += "      }]\n"
    $jsonContent += "    }"
    
    if ($i -lt $results.Count - 1) {
        $jsonContent += ","
    }
    
    $jsonContent += "`n"
}

$jsonContent += "  ]\n}"

$jsonContent | Out-File -Encoding UTF8 $outputFile

Write-Host "  OK: $outputFile" -ForegroundColor Green
Write-Host "`nTotal: $success asteroides" -ForegroundColor Green
Write-Host "Asteroide #1: $($results[0].name) - $([math]::Round([double]$results[0].dist * 149597870.7, 0)) km" -ForegroundColor Yellow
