# Los 20 asteroides MÁS CERCANOS a la Tierra en los últimos 20 años
# Usaremos los datos de CAD API + NeoWs API para obtener elementos orbitales precisos

Write-Host "Obteniendo asteroides más cercanos..." -ForegroundColor Cyan

# Lista de los 20 asteroides más cercanos (de CAD API)
$closeApproaches = @(
    @{id='54088823'; name='2020 VT4'; date='2020-Nov-13 17:21'; dist_km='6740'; vel='13.43'},
    @{id='54509097'; name='2025 TF'; date='2025-Oct-01 00:49'; dist_km='6780'; vel='20.88'},
    @{id='54453145'; name='2024 XA'; date='2024-Dec-01 09:46'; dist_km='7720'; vel='13.57'},
    @{id='54413990'; name='2024 LH1'; date='2024-Jun-06 14:02'; dist_km='8100'; vel='17.40'},
    @{id='54432934'; name='2024 UG9'; date='2024-Oct-30 12:42'; dist_km='8850'; vel='20.30'},
    @{id='3726788'; name='2020 QG'; date='2020-Aug-16 04:09'; dist_km='9320'; vel='12.33'},
    @{id='54231926'; name='2021 UA1'; date='2021-Oct-25 03:07'; dist_km='9420'; vel='15.84'},
    @{id='54368598'; name='2025 BP6'; date='2025-Jan-26 01:10'; dist_km='9710'; vel='21.05'},
    @{id='54266223'; name='2023 BU'; date='2023-Jan-27 00:29'; dist_km='9960'; vel='9.27'},
    @{id='54301287'; name='2023 RS'; date='2023-Sep-07 14:26'; dist_km='10360'; vel='13.59'},
    @{id='54488493'; name='2025 OS'; date='2025-Jul-19 03:21'; dist_km='10450'; vel='12.70'},
    @{id='3554566'; name='2011 CQ1'; date='2011-Feb-04 19:39'; dist_km='11850'; vel='9.69'},
    @{id='3785336'; name='2019 UN13'; date='2019-Oct-31 14:45'; dist_km='12610'; vel='12.85'},
    @{id='3561244'; name='2008 TS26'; date='2008-Oct-09 03:30'; dist_km='12640'; vel='15.76'},
    @{id='54084638'; name='2020 CD3'; date='2019-Apr-04 09:33'; dist_km='13100'; vel='7.77'},
    @{id='54088958'; name='2020 JJ'; date='2020-May-04 12:05'; dist_km='13400'; vel='14.36'},
    @{id='3775713'; name='2018 UA'; date='2018-Oct-19 14:46'; dist_km='13670'; vel='14.15'},
    @{id='54304827'; name='2023 UR10'; date='2023-Oct-20 04:24'; dist_km='13940'; vel='12.21'},
    @{id='54221681'; name='2021 SP'; date='2021-Sep-17 11:50'; dist_km='14100'; vel='14.37'},
    @{id='3701166'; name='2016 DY30'; date='2016-Feb-25 19:59'; dist_km='14300'; vel='17.34'}
)

$results = @()

foreach ($approach in $closeApproaches) {
    $id = $approach.id
    $name = $approach.name
    
    Write-Host "`nProcesando: $name (ID: $id)" -ForegroundColor Yellow
    Write-Host "  Acercamiento: $($approach.date) - $($approach.dist_km) km" -ForegroundColor Gray
    
    $url = "https://api.nasa.gov/neo/rest/v1/neo/$id`?api_key=DEMO_KEY"
    
    try {
        $data = Invoke-RestMethod -Uri $url
        
        if ($data) {
            Write-Host "  ✓ Datos obtenidos" -ForegroundColor Green
            
            # Agregar datos de acercamiento
            $data | Add-Member -NotePropertyName 'verified_close_approach' -NotePropertyValue @{
                date = $approach.date
                distance_km = $approach.dist_km
                velocity_km_s = $approach.vel
            } -Force
            
            $results += $data
        }
        
        Start-Sleep -Milliseconds 500
        
    } catch {
        Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Guardando $($results.Count) asteroides..." -ForegroundColor Yellow

$output = @{
    metadata = @{
        source = "NASA NeoWs API"
        description = "Los 20 asteroides que MÁS se han acercado a la Tierra (2005-2025)"
        date_generated = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        precision = "ALTA - Elementos orbitales completos de JPL"
        total_count = $results.Count
    }
    asteroids = $results
}

$output | ConvertTo-Json -Depth 20 | Out-File -Encoding UTF8 "top20_closest_asteroids_precise.json"

Write-Host "✓ Archivo creado: top20_closest_asteroids_precise.json" -ForegroundColor Green
Write-Host "  Total asteroides: $($results.Count)" -ForegroundColor Cyan
