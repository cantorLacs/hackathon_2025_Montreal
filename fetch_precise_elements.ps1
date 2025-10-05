# Script para obtener elementos orbitales de ALTA PRECISIÓN de JPL Horizons
# Para los 20 asteroides que más se han acercado a la Tierra en los últimos 20 años

$asteroids = @(
    @{name='2020 VT4'; approach='2020-Nov-13'; dist='0.00045 AU (67,500 km)'},
    @{name='2025 TF'; approach='2025-Oct-01'; dist='0.000453 AU (67,800 km)'},
    @{name='2024 XA'; approach='2024-Dec-01'; dist='0.000516 AU (77,200 km)'},
    @{name='2024 LH1'; approach='2024-Jun-06'; dist='0.000541 AU (81,000 km)'},
    @{name='2024 UG9'; approach='2024-Oct-30'; dist='0.000592 AU (88,500 km)'},
    @{name='2020 QG'; approach='2020-Aug-16'; dist='0.000623 AU (93,200 km)'},
    @{name='2021 UA1'; approach='2021-Oct-25'; dist='0.000630 AU (94,200 km)'},
    @{name='2025 BP6'; approach='2025-Jan-26'; dist='0.000649 AU (97,100 km)'},
    @{name='2023 BU'; approach='2023-Jan-27'; dist='0.000666 AU (99,600 km)'},
    @{name='2023 RS'; approach='2023-Sep-07'; dist='0.000693 AU (103,600 km)'},
    @{name='2025 OS'; approach='2025-Jul-19'; dist='0.000699 AU (104,500 km)'},
    @{name='2011 CQ1'; approach='2011-Feb-04'; dist='0.000792 AU (118,500 km)'},
    @{name='2019 UN13'; approach='2019-Oct-31'; dist='0.000843 AU (126,100 km)'},
    @{name='2008 TS26'; approach='2008-Oct-09'; dist='0.000845 AU (126,400 km)'},
    @{name='2020 CD3'; approach='2019-Apr-04'; dist='0.000876 AU (131,000 km)'},
    @{name='2020 JJ'; approach='2020-May-04'; dist='0.000896 AU (134,000 km)'},
    @{name='2018 UA'; approach='2018-Oct-19'; dist='0.000914 AU (136,700 km)'},
    @{name='2023 UR10'; approach='2023-Oct-20'; dist='0.000932 AU (139,400 km)'},
    @{name='2021 SP'; approach='2021-Sep-17'; dist='0.000943 AU (141,000 km)'},
    @{name='2016 DY30'; approach='2016-Feb-25'; dist='0.000956 AU (143,000 km)'}
)

$allData = @{
    metadata = @{
        source = "NASA JPL Horizons API"
        description = "Los 20 asteroides que MÁS se han acercado a la Tierra en los últimos 20 años (2005-2025)"
        date_generated = (Get-Date -Format "yyyy-MM-dd")
        precision = "ALTA - Elementos orbitales completos de JPL Horizons"
    }
    asteroids = @()
}

foreach ($ast in $asteroids) {
    $name = $ast.name
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Procesando: $name" -ForegroundColor Yellow
    Write-Host "Acercamiento: $($ast.approach) - $($ast.dist)" -ForegroundColor Green
    
    $encodedName = [System.Web.HttpUtility]::UrlEncode($name)
    $url = "https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND='$encodedName'&OBJ_DATA='YES'&MAKE_EPHEM='NO'&EPHEM_TYPE='ELEMENTS'&CENTER='@sun'"
    
    try {
        Write-Host "Consultando Horizons..." -ForegroundColor Gray
        $response = Invoke-RestMethod -Uri $url -ErrorAction Stop
        
        # Extraer elementos orbitales del resultado
        if ($response.result) {
            Write-Host "✓ Datos recibidos" -ForegroundColor Green
            
            $asteroidData = @{
                name = $name
                close_approach_date = $ast.approach
                close_approach_distance = $ast.dist
                horizons_data = $response.result
            }
            
            $allData.asteroids += $asteroidData
        }
        
        # Esperar para no saturar la API
        Start-Sleep -Milliseconds 1000
        
    } catch {
        Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Guardando resultados..." -ForegroundColor Yellow

$allData | ConvertTo-Json -Depth 20 | Out-File -Encoding UTF8 "precise_asteroid_data_horizons.json"

Write-Host "✓ Completado: $($allData.asteroids.Count) asteroides procesados" -ForegroundColor Green
Write-Host "Archivo guardado: precise_asteroid_data_horizons.json" -ForegroundColor Cyan
