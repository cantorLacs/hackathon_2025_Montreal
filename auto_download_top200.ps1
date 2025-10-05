# Paso 1: Descargar CAD data (200 asteroides más cercanos)
Write-Host "Descargando 200 asteroides más cercanos..." -ForegroundColor Cyan
Invoke-RestMethod -Uri 'https://ssd-api.jpl.nasa.gov/cad.api?date-min=1975-01-01&date-max=2025-12-31&dist-max=0.1&sort=dist&limit=200&fullname=true' | ConvertTo-Json -Depth 5 | Out-File -Encoding UTF8 "step1_cad_data.json"
Write-Host "OK: step1_cad_data.json" -ForegroundColor Green

# Paso 2: Procesar y descargar elementos orbitales
Write-Host "`nDescargando elementos orbitales..." -ForegroundColor Cyan

$cadData = Get-Content "step1_cad_data.json" | ConvertFrom-Json

$results = @()
$count = 0

foreach ($row in $cadData.data) {
    $name = $row[0]
    $count++
    
    if ($count % 20 -eq 0) {
        Write-Host "  Progreso: $count/200..." -ForegroundColor Gray
    }
    
    try {
        $encoded = [System.Uri]::EscapeDataString($name)
        $url = 'https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=' + $encoded + '&full-prec=true'
        
        $sbdb = Invoke-RestMethod -Uri $url
        
        if ($sbdb.orbit.elements) {
            $elem = $sbdb.orbit.elements
            
            $results += @{
                name = $name
                fullname = $row[11]
                date = $row[3]
                dist = $row[4]
                vel = $row[7]
                h = if ($sbdb.phys_par.H) { $sbdb.phys_par.H } else { $row[10] }
                orbit_class = if ($sbdb.object.orbit_class.code) { $sbdb.object.orbit_class.code } else { "NEO" }
                e = ($elem | Where-Object {$_.name -eq 'e'}).value
                a = ($elem | Where-Object {$_.name -eq 'a'}).value
                i = ($elem | Where-Object {$_.name -eq 'i'}).value
                om = ($elem | Where-Object {$_.name -eq 'om'}).value
                w = ($elem | Where-Object {$_.name -eq 'w'}).value
                ma = ($elem | Where-Object {$_.name -eq 'ma'}).value
                n = ($elem | Where-Object {$_.name -eq 'n'}).value
                epoch = $sbdb.orbit.epoch
                orbit_id = $row[1]
            }
        }
        
        Start-Sleep -Milliseconds 250
    }
    catch {
        # Continuar con el siguiente
    }
}

Write-Host "OK: $($results.Count) asteroides descargados" -ForegroundColor Green

# Guardar resultados intermedios
$results | ConvertTo-Json -Depth 5 | Out-File -Encoding UTF8 "step2_orbital_elements.json"
Write-Host "OK: step2_orbital_elements.json" -ForegroundColor Green

Write-Host "`nGenerando JSON final..." -ForegroundColor Cyan

# Paso 3: Generar JSON final para el visualizador
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('step2_orbital_elements.json', 'utf8'));

const asteroids = data.map(ast => {
  // Convertir fecha
  const match = ast.date.match(/(\d{4})-(\w{3})-(\d{2}) (\d{2}):(\d{2})/);
  if (!match) return null;
  
  const months = {Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12'};
  const isoDate = \`\${match[1]}-\${months[match[2]]}-\${match[3]}T\${match[4]}:\${match[5]}:00.000Z\`;
  const shortDate = \`\${match[1]}-\${months[match[2]]}-\${match[3]}\`;
  
  const distKm = Math.round(parseFloat(ast.dist) * 149597870.7);
  const diameter = 1329 / Math.sqrt(Math.pow(10, 0.2 * ast.h));
  
  return {
    id: ast.name.replace(/\s/g, '').replace(/[()]/g, ''),
    name: ast.name,
    full_name: ast.fullname.trim(),
    is_potentially_hazardous_asteroid: false,
    absolute_magnitude_h: parseFloat(ast.h),
    estimated_diameter: {
      kilometers: {
        estimated_diameter_min: parseFloat((diameter * 0.7).toFixed(4)),
        estimated_diameter_max: parseFloat((diameter * 1.3).toFixed(4))
      }
    },
    orbital_data: {
      orbit_id: ast.orbit_id,
      epoch_osculation: parseFloat(ast.epoch),
      eccentricity: ast.e,
      semi_major_axis: ast.a,
      inclination: ast.i,
      ascending_node_longitude: ast.om,
      perihelion_argument: ast.w,
      mean_anomaly: ast.ma,
      mean_motion: ast.n,
      orbit_class: {
        orbit_class_type: ast.orbit_class
      }
    },
    close_approach_data: [{
      close_approach_date: shortDate,
      close_approach_date_full: isoDate,
      relative_velocity: {
        kilometers_per_second: ast.vel,
        kilometers_per_hour: Math.round(parseFloat(ast.vel) * 3600).toString()
      },
      miss_distance: {
        astronomical: ast.dist,
        kilometers: distKm.toString(),
        lunar: (distKm / 384400).toFixed(2)
      },
      orbiting_body: 'Earth'
    }]
  };
}).filter(a => a !== null);

const output = {
  metadata: {
    source: 'NASA JPL CAD + SBDB API',
    description: \`Los \${asteroids.length} asteroides MÁS CERCANOS a la Tierra (1975-2025)\`,
    precision: 'MÁXIMA - Elementos orbitales REALES de SBDB',
    date_generated: new Date().toISOString()
  },
  asteroids: asteroids
};

fs.writeFileSync('top200_closest_asteroids_FINAL.json', JSON.stringify(output, null, 2), 'utf8');
console.log('OK: JSON final generado');
console.log('Total: ' + asteroids.length + ' asteroides');
console.log('#1: ' + asteroids[0].name + ' - ' + asteroids[0].close_approach_data[0].miss_distance.kilometers + ' km');
"

Write-Host "`nLISTO!" -ForegroundColor Green
Write-Host "Ahora copia el contenido de top200_closest_asteroids_FINAL.json" -ForegroundColor Yellow
Write-Host "al archivo asteroid-visualizer.js en loadVerifiedAsteroids()" -ForegroundColor Yellow
