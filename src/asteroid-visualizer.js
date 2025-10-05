/**
 * AsteroidVisualizer - Visualizador 3D de trayectorias asteroidales
 * Usa Three.js para renderizado 3D del sistema solar y asteroides NEO
 * 
 * @version 2.0 - Código modularizado
 * @requires Three.js r158
 * @requires TrajectorySimulator
 */

class AsteroidVisualizer {
    constructor() {
        // Componentes Three.js
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.earth = null;
        this.gridHelper = null;
        
        // Simulador de trayectorias
        this.simulator = new TrajectorySimulator();
        
        // Datos de asteroides
        this.asteroids = [];
        this.orbitLines = new Map();
        this.asteroidMeshes = new Map();
        
        // Control de tiempo
        this.currentTime = new Date();
        this.timeSpeed = 1/24; // Velocidad inicial: 1 hora por frame
        this.isPaused = true;
        
        // Control Jog/Shuttle
        this.jogValue = 0; // -100 a 100
        this.isJogging = false;
        this.jogReturnInterval = null;
        
        // Visualización
        this.showOrbits = true;
        this.scale = 1 / 1000000; // Escala para visualización (km a unidades Three.js)
        
        // Sistema de cámara
        this.selectedAsteroid = null;
        this.cameraFollowMode = false;
        this.cameraOffset = new THREE.Vector3(50, 50, 50);
        this.cameraTarget = new THREE.Vector3(0, 0, 0);
        
        // Distancia Tierra-Asteroide
        this.currentDistance = 0; // en km
        
        // API de NASA
        this.NASA_API_KEY = 'FtlbR4MhcVSE1Z3DYcoGeBqQqQtfzKIOerjefTbl';
        this.NASA_LOOKUP_URL = 'https://api.nasa.gov/neo/rest/v1/neo/';
        
        // Enriquecedor de datos (CSV de SBDB)
        this.dataEnricher = new NASADataEnricher();
        this.csvDataLoaded = false;
    }

    /**
     * Inicializa el visualizador
     */
    async init() {
        this.initThreeJS();
        this.createSolarSystem();
        this.setupControls();
        this.setupEventListeners();
        this.updateDatePicker();
        this.animate();
        
        // Ocultar loading, mostrar controles
        document.getElementById('loading').style.display = 'none';
        document.getElementById('controls-panel').style.display = 'block';
        document.getElementById('info-panel').style.display = 'block';
    }

    /**
     * Inicializa la escena Three.js
     */
    initThreeJS() {
        // Escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000511);

        // Cámara
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        this.camera.position.set(300, 200, 300);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Luces
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        const sunLight = new THREE.PointLight(0xffffff, 2, 2000);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);

        // Estrellas
        this.createStarField();

        // Resize handler
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    /**
     * Crea el campo de estrellas de fondo
     */
    createStarField() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 5000;
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 5000;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2,
            sizeAttenuation: false
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    /**
     * Crea el sistema solar (Sol y Tierra)
     */
    createSolarSystem() {
        // Sol
        const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(sun);

        // Tierra
        const earthGeometry = new THREE.SphereGeometry(5, 32, 32);
        const earthMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4a90e2,
            emissive: 0x112244
        });
        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.scene.add(this.earth);

        // Órbita de la Tierra
        this.createEarthOrbit();

        // Cuadrícula (invisible por defecto)
        const gridHelper = new THREE.GridHelper(500, 50, 0x444444, 0x222222);
        gridHelper.visible = false;
        this.gridHelper = gridHelper;
        this.scene.add(gridHelper);
    }

    /**
     * Crea la órbita visual de la Tierra
     */
    createEarthOrbit() {
        const points = [];
        const segments = 128;
        const radius = this.simulator.AU * this.scale;

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            ));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0x4a90e2, 
            transparent: true,
            opacity: 0.3
        });
        const earthOrbit = new THREE.Line(geometry, material);
        this.scene.add(earthOrbit);
    }

    /**
     * Configura los controles de cámara (mouse)
     */
    setupControls() {
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        this.renderer.domElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            // Desactivar seguimiento cuando se mueve la cámara manualmente
            if (this.cameraFollowMode) {
                this.cameraFollowMode = false;
                this.updateFollowButton();
            }

            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            // Calcular posición relativa al target actual
            const relativePos = new THREE.Vector3().subVectors(this.camera.position, this.cameraTarget);
            const spherical = new THREE.Spherical();
            spherical.setFromVector3(relativePos);

            spherical.theta -= deltaX * 0.01;
            spherical.phi += deltaY * 0.01;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

            relativePos.setFromSpherical(spherical);
            this.camera.position.copy(this.cameraTarget).add(relativePos);
            this.camera.lookAt(this.cameraTarget);

            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.renderer.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            // Desactivar seguimiento cuando se hace zoom manualmente
            if (this.cameraFollowMode) {
                this.cameraFollowMode = false;
                this.updateFollowButton();
            }

            // Calcular dirección desde target a cámara
            const direction = new THREE.Vector3().subVectors(this.camera.position, this.cameraTarget);
            const distance = direction.length();
            const newDistance = Math.max(20, Math.min(1000, distance + e.deltaY * 0.5));
            
            // Mantener la dirección, solo cambiar distancia
            direction.normalize().multiplyScalar(newDistance);
            this.camera.position.copy(this.cameraTarget).add(direction);
            this.camera.lookAt(this.cameraTarget);
        });
    }

    /**
     * Configura los event listeners de la UI
     */
    setupEventListeners() {
        // Carga de archivo JSON
        document.getElementById('nasa-json-file').addEventListener('change', (e) => {
            this.loadNASAFile(e.target.files[0]);
        });
        
        // Carga de archivo CSV (datos adicionales SBDB)
        const csvInput = document.getElementById('sbdb-csv-file');
        if (csvInput) {
            csvInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.showNotification('📊 Cargando CSV', 'Procesando datos de SBDB...', 0);
                    try {
                        await this.dataEnricher.loadCSV(file);
                        this.csvDataLoaded = true;
                        this.showNotification('✅ CSV cargado', `${this.dataEnricher.csvData.size} asteroides en base de datos`, 3000);
                        
                        // Habilitar botón de carga desde CSV
                        document.getElementById('load-from-csv-btn').disabled = false;
                        
                        // Mensaje para cargar directamente del CSV
                        console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  ✅ CSV CARGADO - ${this.dataEnricher.csvData.size} ASTEROIDES DISPONIBLES             ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  El CSV contiene TODOS los datos orbitales necesarios:       ║
║  ✓ Elementos keplerianos (e, a, i, Ω, ω, M)                  ║
║  ✓ Diámetro, albedo, tipo espectral                          ║
║  ✓ MOID, clase orbital, época                                ║
║                                                               ║
║  🚀 USA EL BOTÓN "Cargar desde CSV" o ejecuta en consola:    ║
║                                                               ║
║     visualizer.loadFromCSV()          → Todos los asteroides ║
║     visualizer.loadFromCSV(100)       → Primeros 100         ║
║     visualizer.loadFromCSV(500)       → Primeros 500         ║
║                                                               ║
║  O espera a cargar un JSON que se enriquecerá con el CSV     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
                        `);
                    } catch (error) {
                        console.error('Error cargando CSV:', error);
                        this.showNotification('❌ Error', 'No se pudo cargar el archivo CSV', 3000);
                    }
                }
            });
        }

        // Botón para cargar desde CSV
        const loadFromCsvBtn = document.getElementById('load-from-csv-btn');
        if (loadFromCsvBtn) {
            loadFromCsvBtn.addEventListener('click', async () => {
                console.log(`🚀 Iniciando carga desde CSV...`);
                await this.loadFromCSV(null); // Cargar todos
                
                // ✅ ACTIVAR control de búsqueda
                const searchControl = document.getElementById('asteroid-search-control');
                if (searchControl) {
                    searchControl.style.opacity = '1';
                    searchControl.style.pointerEvents = 'auto';
                }
                const searchInput = document.getElementById('asteroid-search-input');
                if (searchInput) {
                    searchInput.disabled = false;
                }
                
                // ✅ ACTIVAR control de límite después de cargar
                const asteroidControl = document.getElementById('asteroid-limit-control');
                if (asteroidControl) {
                    asteroidControl.style.opacity = '1';
                    asteroidControl.style.pointerEvents = 'auto';
                }
                
                // ✅ ACTIVAR el slider
                const slider = document.getElementById('asteroid-limit-slider');
                if (slider) {
                    slider.disabled = false;
                }
            });
        }
        
        // Slider dinámico de cantidad de asteroides
        const asteroidSlider = document.getElementById('asteroid-limit-slider');
        const asteroidLimitValue = document.getElementById('asteroid-limit-value');
        
        if (asteroidSlider) {
            asteroidSlider.addEventListener('input', (e) => {
                const limit = parseInt(e.target.value);
                asteroidLimitValue.textContent = limit;
                this.updateAsteroidLimit(limit);
            });
        }

        // 🔍 Búsqueda de asteroides
        const searchInput = document.getElementById('asteroid-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                console.log('🔍 Buscando:', e.target.value);
                this.searchAsteroids(e.target.value);
            });
        } else {
            console.warn('⚠️ No se encontró el input de búsqueda');
        }

        // Control de tiempo
        document.getElementById('play-pause-btn').addEventListener('click', () => {
            this.togglePlayPause();
        });

        document.getElementById('reset-time-btn').addEventListener('click', () => {
            this.resetTime();
        });

        // Saltar a fecha específica
        document.getElementById('jump-to-date').addEventListener('click', () => {
            const dateValue = document.getElementById('date-picker').value;
            if (dateValue) {
                this.jumpToDate(new Date(dateValue));
            }
        });

        // Enter en el date picker
        document.getElementById('date-picker').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const dateValue = e.target.value;
                if (dateValue) {
                    this.jumpToDate(new Date(dateValue));
                }
            }
        });

        // Control JOG para avanzar/retroceder tiempo manualmente
        const jogControl = document.getElementById('jog-control');
        const jogStatus = document.getElementById('jog-status');
        
        if (jogControl && jogStatus) {
            jogControl.addEventListener('input', (e) => {
                this.jogValue = parseInt(e.target.value);
                this.isJogging = true;
                
                // Limpiar intervalo de retorno si existe
                if (this.jogReturnInterval) {
                    clearInterval(this.jogReturnInterval);
                    this.jogReturnInterval = null;
                }
                
                // Actualizar display
                if (this.jogValue === 0) {
                    jogStatus.textContent = 'Centro - Velocidad Normal';
                    jogStatus.style.color = '#4a90e2';
                } else if (this.jogValue < 0) {
                    const speed = Math.abs(this.jogValue);
                    jogStatus.textContent = `⏪ Retrocediendo ${speed}%`;
                    jogStatus.style.color = '#e74c3c';
                } else {
                    jogStatus.textContent = `⏩ Avanzando ${this.jogValue}%`;
                    jogStatus.style.color = '#2ecc71';
                }
            });
            
            // Al soltar el jog, volver al centro gradualmente
            jogControl.addEventListener('mouseup', () => {
                this.startJogReturn();
            });
            
            jogControl.addEventListener('touchend', () => {
                this.startJogReturn();
            });
            
            // También manejar cuando el mouse sale del control
            jogControl.addEventListener('mouseleave', (e) => {
                if (e.buttons === 1) {
                    this.startJogReturn();
                }
            });
        }

        document.getElementById('time-speed-slider').addEventListener('input', (e) => {
            const sliderValue = parseFloat(e.target.value);
            // Escala logarítmica para mejor control en valores bajos
            this.timeSpeed = sliderValue <= 0 ? 0 : Math.pow(sliderValue, 1.5) / 50;
            
            // Mostrar en formato legible
            if (this.timeSpeed < 0.1) {
                document.getElementById('time-speed').textContent = `${(this.timeSpeed * 24).toFixed(1)} horas/frame`;
            } else if (this.timeSpeed < 1) {
                document.getElementById('time-speed').textContent = `${this.timeSpeed.toFixed(2)} días/frame`;
            } else {
                document.getElementById('time-speed').textContent = `${this.timeSpeed.toFixed(1)} días/frame`;
            }
        });

        // Botones de velocidad rápida
        document.getElementById('speed-slow').addEventListener('click', () => {
            this.setSpeed(1/24); // 1 hora por frame
        });
        document.getElementById('speed-normal').addEventListener('click', () => {
            this.setSpeed(6/24); // 6 horas por frame
        });
        document.getElementById('speed-fast').addEventListener('click', () => {
            this.setSpeed(1); // 1 día por frame
        });
        document.getElementById('speed-vfast').addEventListener('click', () => {
            this.setSpeed(7); // 7 días por frame
        });

        // Visualización
        document.getElementById('toggle-orbits-btn').addEventListener('click', () => {
            this.toggleOrbits();
        });

        document.getElementById('toggle-grid-btn').addEventListener('click', () => {
            this.gridHelper.visible = !this.gridHelper.visible;
        });

        document.getElementById('show-all-btn').addEventListener('click', () => {
            this.showAllAsteroids();
        });

        document.getElementById('show-hazardous-btn').addEventListener('click', () => {
            this.showHazardousOnly();
        });

        // Toggle panels (arreglado)
        document.getElementById('toggle-controls').addEventListener('click', function() {
            const panel = document.getElementById('controls-panel');
            const btn = this;
            
            if (panel.classList.contains('hidden')) {
                panel.classList.remove('hidden');
                btn.textContent = '◀ Ocultar Controles';
            } else {
                panel.classList.add('hidden');
                btn.textContent = '▶ Mostrar Controles';
            }
        });

        document.getElementById('toggle-info').addEventListener('click', function() {
            const panel = document.getElementById('info-panel');
            const btn = this;
            
            if (panel.classList.contains('hidden')) {
                panel.classList.remove('hidden');
                btn.textContent = 'Ocultar Info ▶';
            } else {
                panel.classList.add('hidden');
                btn.textContent = '◀ Mostrar Info';
            }
        });
        
        // Filtros (DESHABILITADO - UI removida)
        /*
        document.getElementById('apply-filters').addEventListener('click', () => {
            this.applyFilters();
        });
        */
    }

    /**
     * Obtiene datos completos de un asteroide usando NASA Lookup API
     * @param {string} asteroidId - ID del asteroide
     * @returns {Promise<Object>} - Datos completos del asteroide
     */
    async fetchAsteroidData(asteroidId) {
        const url = `${this.NASA_LOOKUP_URL}${asteroidId}?api_key=${this.NASA_API_KEY}`;
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            let data = await response.json();
            
            // ✨ Enriquecer con datos del CSV si está disponible
            if (this.csvDataLoaded) {
                data = this.dataEnricher.enrichAsteroid(data);
            }
            
            return data;
            
        } catch (error) {
            console.error(`Error fetching asteroid ${asteroidId}:`, error);
            throw error;
        }
    }

    /**
     * Carga un archivo JSON de NASA
     * @param {File} file - Archivo JSON
     */
    async loadNASAFile(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            this.showNotification('Cargando...', 'Procesando datos de NASA...');

            // Limpiar asteroides anteriores
            this.clearAsteroids();

            // Detectar formato de la API
            let neoList = [];
            const nearEarthObjects = data.near_earth_objects;
            
            if (Array.isArray(nearEarthObjects)) {
                // Formato Browse: { near_earth_objects: [...] }
                neoList = nearEarthObjects;
            } else if (typeof nearEarthObjects === 'object') {
                // Formato Feed: { near_earth_objects: { "2025-10-05": [...], "2025-10-04": [...] } }
                // Combinar todos los arrays de diferentes fechas
                neoList = Object.values(nearEarthObjects).flat();
            }

            let loadedCount = 0;
            let hazardousCount = 0;
            let skippedCount = 0;
            let fetchedCount = 0;

            // Limitar a 50 asteroides para rendimiento
            const limitedList = neoList.slice(0, 50);
            
            // Procesar asteroides (puede requerir llamadas a la API)
            for (let i = 0; i < limitedList.length; i++) {
                const neo = limitedList[i];
                
                try {
                    let asteroidData = neo;
                    
                    // ✨ NUEVO: Si no tiene orbital_data, solicitar con Lookup API
                    if (!neo.orbital_data) {
                        console.log(`🔄 Asteroide ${neo.name} (ID: ${neo.id}) sin orbital_data, solicitando a NASA...`);
                        
                        this.showNotification(
                            '🔄 Obteniendo datos', 
                            `Solicitando datos orbitales de ${neo.name} (${i + 1}/${limitedList.length})...`,
                            0
                        );
                        
                        try {
                            const fullData = await this.fetchAsteroidData(neo.id);
                            if (fullData && fullData.orbital_data) {
                                asteroidData = fullData;
                                fetchedCount++;
                                console.log(`✅ Datos orbitales obtenidos para ${neo.name}`);
                            } else {
                                console.warn(`❌ No se pudieron obtener datos orbitales para ${neo.name}`);
                                skippedCount++;
                                continue;
                            }
                        } catch (fetchError) {
                            console.error(`❌ Error al obtener datos de ${neo.name}:`, fetchError);
                            skippedCount++;
                            continue;
                        }
                    }
                    
                    const asteroid = this.simulator.loadNASAData(asteroidData);
                    this.asteroids.push(asteroid);
                    this.createAsteroidVisualization(asteroid);
                    
                    loadedCount++;
                    if (asteroid.isHazardous) hazardousCount++;
                    
                } catch (error) {
                    console.warn('Error procesando asteroide:', error);
                    skippedCount++;
                }
            }
            
            // Mensajes informativos
            if (fetchedCount > 0) {
                console.log(`✨ ${fetchedCount} asteroides enriquecidos con datos de NASA Lookup API`);
            }
            
            if (skippedCount > 0 && loadedCount === 0) {
                this.showNotification(
                    '⚠️ Error de red', 
                    `No se pudieron obtener datos orbitales de NASA. Verifique su conexión a internet.`,
                    8000
                );
            } else if (skippedCount > 0) {
                console.warn(`⚠️ ${skippedCount} asteroides omitidos`);
            }

            // Actualizar UI
            document.getElementById('total-asteroids').textContent = loadedCount;
            document.getElementById('hazardous-count').textContent = hazardousCount;
            this.updateAsteroidList();

            this.showNotification('¡Éxito!', `${loadedCount} asteroides cargados`, 2000);

        } catch (error) {
            console.error('Error cargando archivo:', error);
            this.showNotification('Error', 'No se pudo cargar el archivo JSON', 3000);
        }
    }

    /**
     * Crea la visualización 3D de un asteroide
     * @param {Object} asteroid - Datos del asteroide
     */
    createAsteroidVisualization(asteroid) {
        console.log(`🎨 Creando visualización para ${asteroid.name}...`);
        
        // Generar órbita completa basada en el período orbital
        const startDate = new Date();
        
        // Calcular período orbital en días
        const orbitalPeriodDays = asteroid.elements.period / 86400;
        console.log(`  Período orbital: ${orbitalPeriodDays.toFixed(1)} días`);
        
        // Generar la órbita completa (un período completo)
        const endDate = new Date(startDate.getTime() + orbitalPeriodDays * 24 * 60 * 60 * 1000);
        
        // Número de segmentos proporcional al período
        const segments = Math.min(Math.max(64, Math.floor(orbitalPeriodDays / 7)), 256);
        const timeStep = (orbitalPeriodDays * 86400) / segments;
        
        const trajectory = this.simulator.generateTrajectory(asteroid, startDate, endDate, timeStep);

        // Crear línea de órbita COMPLETA
        const points = trajectory.map(point => new THREE.Vector3(
            point.heliocentric.x * this.scale,
            point.heliocentric.z * this.scale,
            point.heliocentric.y * this.scale
        ));

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const color = asteroid.isHazardous ? 0xe74c3c : 0x4a90e2;
        const material = new THREE.LineBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.8,  // Aumentado de 0.6 a 0.8 para mejor visibilidad
            linewidth: 2   // Añadido grosor de línea
        });

        const orbitLine = new THREE.Line(geometry, material);
        orbitLine.visible = this.showOrbits;
        this.scene.add(orbitLine);
        this.orbitLines.set(asteroid.id, orbitLine);
        
        // Log detallado de coordenadas para diagnóstico
        if (points.length > 0) {
            const firstPoint = points[0];
            const midPoint = points[Math.floor(points.length / 2)];
            console.log(`  ✅ Órbita creada: ${points.length} puntos, visible=${orbitLine.visible}`);
            console.log(`     Primer punto: (${firstPoint.x.toFixed(2)}, ${firstPoint.y.toFixed(2)}, ${firstPoint.z.toFixed(2)})`);
            console.log(`     Punto medio: (${midPoint.x.toFixed(2)}, ${midPoint.y.toFixed(2)}, ${midPoint.z.toFixed(2)})`);
            console.log(`     Escala actual: ${this.scale}`);
        }

        // Crear mesh del asteroide
        const size = Math.max(0.5, asteroid.diameter.avg * 0.01);
        const asteroidGeometry = new THREE.SphereGeometry(size, 8, 8);
        const asteroidMaterial = new THREE.MeshPhongMaterial({ 
            color: asteroid.isHazardous ? 0xff4444 : 0x888888,
            emissive: asteroid.isHazardous ? 0x330000 : 0x111111
        });

        const asteroidMesh = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        this.scene.add(asteroidMesh);
        this.asteroidMeshes.set(asteroid.id, {
            mesh: asteroidMesh,
            trajectory: trajectory,
            orbitalPeriod: orbitalPeriodDays
        });
    }

    /**
     * Actualiza la lista de asteroides en la UI
     */
    updateAsteroidList() {
        const listContainer = document.getElementById('asteroid-list');
        listContainer.innerHTML = '';

        this.asteroids.forEach(asteroid => {
            const item = document.createElement('div');
            item.className = 'asteroid-item' + (asteroid.isHazardous ? ' hazardous' : '');
            item.innerHTML = `
                <div class="asteroid-name">${asteroid.name}</div>
                <div class="asteroid-info">
                    Ø ${asteroid.diameter.avg.toFixed(1)} km
                    ${asteroid.isHazardous ? ' ⚠️' : ''}
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.selectAsteroid(asteroid);
            });
            
            listContainer.appendChild(item);
        });
    }

    /**
     * Selecciona un asteroide para seguimiento
     * @param {Object} asteroid - Asteroide seleccionado
     */
    selectAsteroid(asteroid, event = null) {
        console.log(`🎯 Seleccionando asteroide: ${asteroid.name}`);
        
        this.selectedAsteroid = asteroid;
        this.cameraFollowMode = true;

        // 🚀 SALTAR AUTOMÁTICAMENTE A LA FECHA DE ACERCAMIENTO
        if (asteroid.closeApproaches && asteroid.closeApproaches.length > 0) {
            const approachDate = asteroid.closeApproaches[0].date;
            const approachJD = asteroid.closeApproaches[0].julianDate;
            console.log(`📅 Acercamiento de ${asteroid.name}:`);
            console.log(`   Fecha completa: ${approachDate.toISOString()}`);
            console.log(`   Fecha local: ${approachDate.toLocaleString('es-ES')}`);
            console.log(`   JD esperado: ${approachJD.toFixed(4)}`);
            console.log(`   Distancia esperada: ${(asteroid.closeApproaches[0].distance / 1e6).toFixed(2)} millones km`);
            
            // ⚠️ DEBUG: Verificar conversión de fecha
            this.jumpToDate(approachDate);
            
            // ⏸️ PAUSAR INMEDIATAMENTE para evitar que el loop cambie la fecha
            this.isPaused = true;
            const btn = document.getElementById('play-pause-btn');
            if (btn) btn.textContent = '▶️ Play';
            
            // ✅ Calcular distancia EN LA FECHA EXACTA del acercamiento
            const actualJD = this.simulator.dateToJulian(this.currentTime);
            const position = this.simulator.calculatePositionAtTime(asteroid, actualJD);
            this.currentDistance = position.earthDistance;
            this.updateDistanceDisplay();
            
            console.log(`   ✅ Fecha después de salto: ${this.currentTime.toISOString()}`);
            console.log(`   ✅ JD después de salto: ${actualJD.toFixed(4)}`);
            console.log(`   ⚠️ Diferencia JD: ${(actualJD - approachJD).toFixed(4)} (debería ser ~0)`);
            console.log(`   📏 Distancia calculada: ${(this.currentDistance / 1e6).toFixed(2)} millones km`);
        }

        // Actualizar UI
        document.querySelectorAll('.asteroid-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        if (event && event.target) {
            const asteroidItem = event.target.closest('.asteroid-item');
            if (asteroidItem) {
                asteroidItem.classList.add('selected');
            }
        }

        // Mostrar detalles
        const detailsContainer = document.getElementById('asteroid-details');
        detailsContainer.innerHTML = `
            <div class="info-card">
                <h3 style="margin-top: 0;">${asteroid.name}</h3>
                <button id="follow-camera-btn" style="width: 100%; padding: 10px; margin-bottom: 10px; font-size: 14px; cursor: pointer; border: none; border-radius: 6px; color: white; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); transition: all 0.3s ease;">
                    🎥 Dejar de Seguir
                </button>
                <div class="info-row">
                    <span class="info-label">ID:</span>
                    <span class="info-value">${asteroid.id}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Diámetro:</span>
                    <span class="info-value">${asteroid.diameter.min.toFixed(2)} - ${asteroid.diameter.max.toFixed(2)} km</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Peligroso:</span>
                    <span class="info-value">${asteroid.isHazardous ? '⚠️ SÍ' : '✅ NO'}</span>
                </div>
            </div>
            
            <div class="info-card" style="background: rgba(74, 144, 226, 0.1); border-left: 3px solid #4a90e2;">
                <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #4a90e2;">📏 Distancia a la Tierra</h3>
                <div style="text-align: center; padding: 10px;">
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;" id="current-distance">
                        Calculando...
                    </div>
                    <div style="font-size: 11px; color: #888;">
                        (actualización en tiempo real)
                    </div>
                </div>
                <div style="font-size: 11px; color: #888; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                    💡 Referencia: Distancia Tierra-Luna = 384.4 mil km
                </div>
            </div>
            
            <h3>🛰️ Elementos Orbitales</h3>
            <div class="info-card">
                <div class="info-row">
                    <span class="info-label">Semi-eje mayor:</span>
                    <span class="info-value">${(asteroid.elements.a / this.simulator.AU).toFixed(3)} AU</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Excentricidad:</span>
                    <span class="info-value">${asteroid.elements.e.toFixed(4)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Inclinación:</span>
                    <span class="info-value">${(asteroid.elements.i * 180 / Math.PI).toFixed(2)}°</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Período Orbital:</span>
                    <span class="info-value">${(asteroid.elements.period / 86400).toFixed(1)} días (${(asteroid.elements.period / 86400 / 365.25).toFixed(2)} años)</span>
                </div>
            </div>

            ${asteroid.closeApproaches.length > 0 ? `
                <h3>📅 Próximas Aproximaciones</h3>
                ${asteroid.closeApproaches.slice(0, 5).map((approach, index) => `
                    <div class="info-card" style="position: relative;">
                        <div class="info-row">
                            <span class="info-label">Fecha:</span>
                            <span class="info-value">${approach.date.toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Distancia:</span>
                            <span class="info-value">${this.formatDistance(approach.distance)} 
                                ${approach.distance < 384400 ? '⚠️' : ''}
                            </span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Velocidad:</span>
                            <span class="info-value">${approach.velocity.toFixed(2)} km/s</span>
                        </div>
                        <button class="jump-to-approach" data-approach-index="${index}" 
                            style="width: 100%; margin-top: 8px; padding: 8px; font-size: 12px;">
                            🎯 Ver esta Aproximación
                        </button>
                    </div>
                `).join('')}
            ` : ''}
        `;

        // Añadir event listeners
        setTimeout(() => {
            const followBtn = document.getElementById('follow-camera-btn');
            if (followBtn) {
                followBtn.addEventListener('click', () => {
                    this.toggleCameraFollow();
                });
            }

            document.querySelectorAll('.jump-to-approach').forEach(button => {
                button.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.approachIndex);
                    const approach = asteroid.closeApproaches[index];
                    if (approach) {
                        // Saltar a 1 día antes del acercamiento
                        const targetDate = new Date(approach.date.getTime() - 24 * 60 * 60 * 1000);
                        this.jumpToDate(targetDate);
                        
                        // ▶️ INICIAR SIMULACIÓN AUTOMÁTICAMENTE
                        this.isPaused = false;
                        document.getElementById('play-pause-btn').textContent = '⏸️ Pausa';
                        
                        // Configurar velocidad lenta para ver la aproximación (1 hora por frame)
                        this.setSpeed(1/24);
                        
                        // Activar seguimiento de cámara
                        this.cameraFollowMode = true;
                        this.updateFollowButton();
                        
                        console.log(`🚀 Reproduciendo acercamiento de ${asteroid.name} - ${approach.date.toLocaleDateString('es-ES')}`);
                    }
                });
            });
        }, 100);

        // Enfocar cámara
        const meshData = this.asteroidMeshes.get(asteroid.id);
        if (meshData) {
            const pos = meshData.mesh.position;
            const distance = 50;
            this.cameraTarget.copy(pos);
            this.camera.position.set(pos.x + distance, pos.y + distance, pos.z + distance);
            this.camera.lookAt(pos);
        }
    }

    togglePlayPause() {
        this.isPaused = !this.isPaused;
        const btn = document.getElementById('play-pause-btn');
        btn.textContent = this.isPaused ? '▶️ Play' : '⏸️ Pausa';
    }

    setSpeed(speed) {
        this.timeSpeed = speed;
        const sliderValue = Math.pow(speed * 50, 1 / 1.5);
        document.getElementById('time-speed-slider').value = sliderValue;
        
        if (this.timeSpeed < 0.1) {
            document.getElementById('time-speed').textContent = `${(this.timeSpeed * 24).toFixed(1)} horas/frame`;
        } else if (this.timeSpeed < 1) {
            document.getElementById('time-speed').textContent = `${this.timeSpeed.toFixed(2)} días/frame`;
        } else {
            document.getElementById('time-speed').textContent = `${this.timeSpeed.toFixed(1)} días/frame`;
        }
    }

    resetTime() {
        this.currentTime = new Date();
        this.updateTimeDisplay();
        this.updateDatePicker();
    }

    jumpToDate(date) {
        this.currentTime = new Date(date);
        this.updateTimeDisplay();
        this.updateDatePicker();
        this.showNotification('📅 Fecha cambiada', `Saltando a ${this.currentTime.toLocaleDateString('es-ES')}`, 2000);
    }

    updateDatePicker() {
        const datePicker = document.getElementById('date-picker');
        if (datePicker) {
            const year = this.currentTime.getFullYear();
            const month = String(this.currentTime.getMonth() + 1).padStart(2, '0');
            const day = String(this.currentTime.getDate()).padStart(2, '0');
            datePicker.value = `${year}-${month}-${day}`;
        }
    }

    startJogReturn() {
        const jogControl = document.getElementById('jog-control');
        const jogStatus = document.getElementById('jog-status');
        
        this.jogReturnInterval = setInterval(() => {
            const currentValue = parseInt(jogControl.value);
            
            if (currentValue === 0) {
                clearInterval(this.jogReturnInterval);
                this.jogReturnInterval = null;
                this.isJogging = false;
                this.jogValue = 0;
                jogStatus.textContent = 'Centro - Velocidad Normal';
                jogStatus.style.color = '#4a90e2';
                return;
            }
            
            const step = Math.sign(currentValue) * Math.max(1, Math.abs(currentValue) / 10);
            const newValue = currentValue - step;
            
            if (Math.sign(newValue) !== Math.sign(currentValue)) {
                jogControl.value = 0;
                this.jogValue = 0;
            } else {
                jogControl.value = newValue;
                this.jogValue = newValue;
            }
            
            if (this.jogValue === 0) {
                jogStatus.textContent = 'Centro - Velocidad Normal';
                jogStatus.style.color = '#4a90e2';
            } else if (this.jogValue < 0) {
                jogStatus.textContent = `⏪ Retrocediendo ${Math.abs(this.jogValue)}%`;
                jogStatus.style.color = '#e74c3c';
            } else {
                jogStatus.textContent = `⏩ Avanzando ${this.jogValue}%`;
                jogStatus.style.color = '#2ecc71';
            }
        }, 50);
    }

    toggleCameraFollow() {
        this.cameraFollowMode = !this.cameraFollowMode;
        this.updateFollowButton();
        
        if (this.cameraFollowMode && this.selectedAsteroid) {
            this.showNotification('🎥 Seguimiento activado', `Siguiendo a ${this.selectedAsteroid.name}`, 2000);
        } else {
            this.showNotification('🎥 Seguimiento desactivado', 'Cámara libre', 2000);
        }
    }

    updateFollowButton() {
        const btn = document.getElementById('follow-camera-btn');
        if (btn) {
            btn.textContent = this.cameraFollowMode ? '🎥 Dejar de Seguir' : '🎥 Seguir Objeto';
            btn.style.background = this.cameraFollowMode ? 
                'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' : 
                'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)';
        }
    }

    toggleOrbits() {
        this.showOrbits = !this.showOrbits;
        this.orbitLines.forEach(line => {
            line.visible = this.showOrbits;
        });
    }

    showAllAsteroids() {
        this.orbitLines.forEach((line, id) => {
            line.visible = this.showOrbits;
        });
        this.asteroidMeshes.forEach(data => {
            data.mesh.visible = true;
        });
    }

    showHazardousOnly() {
        this.asteroids.forEach(asteroid => {
            const line = this.orbitLines.get(asteroid.id);
            const meshData = this.asteroidMeshes.get(asteroid.id);
            
            if (line) line.visible = asteroid.isHazardous && this.showOrbits;
            if (meshData) meshData.mesh.visible = asteroid.isHazardous;
        });
    }

    clearAsteroids() {
        this.orbitLines.forEach(line => this.scene.remove(line));
        this.asteroidMeshes.forEach(data => this.scene.remove(data.mesh));
        this.orbitLines.clear();
        this.asteroidMeshes.clear();
        this.asteroids = [];
    }

    updateTimeDisplay() {
        document.getElementById('current-date').textContent = 
            this.currentTime.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
    }

    showNotification(title, message, duration = 0) {
        const notification = document.getElementById('notification');
        document.getElementById('notification-title').textContent = title;
        document.getElementById('notification-message').textContent = message;
        notification.style.display = 'block';

        if (duration > 0) {
            setTimeout(() => {
                notification.style.display = 'none';
            }, duration);
        }
    }

    /**
     * Formatea la distancia en unidades legibles (todo en km)
     * @param {number} distanceKm - Distancia en kilómetros
     * @returns {string} - Distancia formateada
     */
    formatDistance(distanceKm) {
        if (distanceKm < 1000) {
            // Menos de 1,000 km
            return `${distanceKm.toFixed(0)} km`;
        } else if (distanceKm < 1000000) {
            // Entre 1,000 y 1 millón km
            return `${(distanceKm / 1000).toFixed(1)} mil km`;
        } else if (distanceKm < 10000000) {
            // Entre 1 millón y 10 millones km
            return `${(distanceKm / 1000000).toFixed(2)} millones km`;
        } else {
            // Más de 10 millones km
            return `${(distanceKm / 1000000).toFixed(1)} millones km`;
        }
    }

    /**
     * Actualiza la visualización de distancia en el panel de información
     */
    updateDistanceDisplay() {
        const distanceElement = document.getElementById('current-distance');
        if (distanceElement && this.selectedAsteroid && this.currentDistance > 0) {
            distanceElement.textContent = this.formatDistance(this.currentDistance);
            
            // Cambiar color según proximidad
            if (this.currentDistance < 384400) {
                // Menos de la distancia Tierra-Luna
                distanceElement.style.color = '#e74c3c'; // Rojo - muy cerca
            } else if (this.currentDistance < 3844000) {
                // Menos de 10 veces la distancia Tierra-Luna (3.8M km)
                distanceElement.style.color = '#f39c12'; // Naranja - cerca
            } else if (this.currentDistance < 38440000) {
                // Menos de 100 veces la distancia Tierra-Luna (38.4M km)
                distanceElement.style.color = '#3498db'; // Azul - distancia media
            } else {
                // Más de 38.4M km
                distanceElement.style.color = '#2ecc71'; // Verde - lejos
            }
        }
    }

    /**
     * Aplica filtros y ordenamiento a los asteroides
     * MÉTODO DESHABILITADO - UI de filtros removida
     */
    /*
    applyFilters() {
        const sortBy = document.getElementById('sort-filter').value;
        const filterPHA = document.getElementById('filter-pha').checked;
        const filterClose = document.getElementById('filter-close').checked;
        
        console.log(`🔍 Aplicando filtros: PHA=${filterPHA}, Close=${filterClose}, Sort=${sortBy}`);
        
        // Primero ocultar TODOS los asteroides en la escena
        this.asteroidMeshes.forEach((data, id) => {
            data.mesh.visible = false;
        });
        
        this.orbitLines.forEach((line, id) => {
            line.visible = false;
        });
        
        // Filtrar asteroides
        let filteredAsteroids = [...this.asteroids];
        
        if (filterPHA) {
            filteredAsteroids = filteredAsteroids.filter(a => a.isHazardous);
            console.log(`   PHA filter: ${filteredAsteroids.length} asteroides peligrosos`);
        }
        
        if (filterClose) {
            filteredAsteroids = filteredAsteroids.filter(a => {
                // Buscar MOID en close approaches
                if (a.closeApproaches && a.closeApproaches.length > 0) {
                    const moidKm = a.closeApproaches[0].distance;
                    const moidAU = moidKm / 149597870.7;
                    return moidAU < 0.05;
                }
                return false;
            });
            console.log(`   MOID filter: ${filteredAsteroids.length} asteroides cercanos`);
        }
        
        // Ordenar asteroides
        switch (sortBy) {
            case 'moid':
                filteredAsteroids.sort((a, b) => {
                    const moidA = a.closeApproaches?.[0]?.distance || Infinity;
                    const moidB = b.closeApproaches?.[0]?.distance || Infinity;
                    return moidA - moidB;
                });
                console.log(`   Ordenado por MOID`);
                break;
                
            case 'diameter':
                filteredAsteroids.sort((a, b) => {
                    return (b.diameter.avg || 0) - (a.diameter.avg || 0);
                });
                console.log(`   Ordenado por diámetro`);
                break;
                
            case 'name':
                filteredAsteroids.sort((a, b) => {
                    return a.name.localeCompare(b.name);
                });
                console.log(`   Ordenado alfabéticamente`);
                break;
        }
        
        // Mostrar solo los asteroides filtrados en la escena 3D
        filteredAsteroids.forEach(asteroid => {
            const meshData = this.asteroidMeshes.get(asteroid.id);
            if (meshData) {
                meshData.mesh.visible = true;
            }
            
            const orbitLine = this.orbitLines.get(asteroid.id);
            if (orbitLine) {
                orbitLine.visible = true;
            }
        });
        
        // Actualizar lista visual
        this.updateFilteredList(filteredAsteroids);
        
        // Actualizar contadores
        document.getElementById('total-asteroids').textContent = filteredAsteroids.length;
        const hazardousCount = filteredAsteroids.filter(a => a.isHazardous).length;
        document.getElementById('hazardous-count').textContent = hazardousCount;
        
        // Actualizar slider para que refleje la cantidad filtrada
        const slider = document.getElementById('asteroid-limit-slider');
        if (slider && filteredAsteroids.length > 0) {
            slider.max = filteredAsteroids.length;
            slider.value = filteredAsteroids.length;
            document.getElementById('asteroid-limit-value').textContent = filteredAsteroids.length;
        }
        
        // Mostrar notificación
        const msg = filterPHA || filterClose ? 
            `${filteredAsteroids.length} de ${this.asteroids.length} asteroides` : 
            `${filteredAsteroids.length} asteroides ordenados`;
        this.showNotification('✅ Filtros aplicados', msg, 2000);
        
        console.log(`✅ Resultado: ${filteredAsteroids.length} asteroides visibles`);
    }
    */
    
    /**
     * Actualiza la lista visual con asteroides filtrados
     */
    updateFilteredList(filteredAsteroids) {
        const listContainer = document.getElementById('asteroid-list');
        listContainer.innerHTML = '';

        if (filteredAsteroids.length === 0) {
            listContainer.innerHTML = '<p style="color: #888; padding: 10px;">No hay asteroides que coincidan con los filtros</p>';
            return;
        }

        filteredAsteroids.forEach(asteroid => {
            const item = document.createElement('div');
            item.className = 'asteroid-item' + (asteroid.isHazardous ? ' hazardous' : '');
            
            // Calcular MOID si está disponible
            let moidText = '';
            if (asteroid.closeApproaches && asteroid.closeApproaches.length > 0) {
                const moidKm = asteroid.closeApproaches[0].distance;
                const moidAU = (moidKm / 149597870.7).toFixed(4);
                moidText = ` • MOID: ${moidAU} AU`;
            }
            
            item.innerHTML = `
                <div class="asteroid-name">${asteroid.name}</div>
                <div class="asteroid-info">
                    Ø ${asteroid.diameter.avg.toFixed(1)} km${moidText}
                    ${asteroid.isHazardous ? ' ⚠️' : ''}
                </div>
            `;
            
            item.addEventListener('click', (e) => {
                this.selectAsteroid(asteroid, e);
            });
            
            listContainer.appendChild(item);
        });
    }

    /**
     * 🔍 Busca asteroides por nombre o número
     * @param {string} query - Texto de búsqueda
     */
    searchAsteroids(query) {
        const resultsContainer = document.getElementById('search-results');
        
        console.log('🔍 searchAsteroids llamado con:', query);
        console.log('🔍 Total asteroides disponibles:', this.asteroids ? this.asteroids.length : 0);
        
        if (!query || query.trim().length < 2) {
            resultsContainer.innerHTML = '<p style="color: #666; padding: 5px;">Escribe al menos 2 caracteres</p>';
            return;
        }
        
        const searchTerm = query.toLowerCase().trim();
        console.log('🔍 Término de búsqueda (limpio):', searchTerm);
        
        const results = this.asteroids.filter(asteroid => {
            const name = asteroid.name ? asteroid.name.trim().toLowerCase() : '';
            const id = asteroid.id ? asteroid.id.toString() : '';
            const match = name.includes(searchTerm) || id.includes(searchTerm);
            
            // DEBUG: Mostrar los primeros 5 nombres cuando se busca "ic"
            if (searchTerm === 'ic' && results.length < 5) {
                console.log('🔍 Ejemplo de nombre:', name, '| ID:', id);
            }
            
            if (match && searchTerm === 'icarus') {
                console.log('🎯 Icarus encontrado:', asteroid.name, 'ID:', asteroid.id);
            }
            return match;
        }).slice(0, 10); // Máximo 10 resultados
        
        console.log('🔍 Resultados encontrados:', results.length);
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p style="color: #666; padding: 5px;">No se encontraron resultados</p>';
            return;
        }
        
        resultsContainer.innerHTML = results.map((asteroid, index) => {
            const elementId = `search-result-${index}`;
            const displayName = asteroid.name ? asteroid.name.trim() : `Asteroid ${asteroid.id}`;
            return `
                <div id="${elementId}" style="padding: 8px; margin: 4px 0; background: #1a1e3d; border-radius: 4px; cursor: pointer; border-left: 3px solid ${asteroid.isHazardous ? '#e74c3c' : '#3498db'};">
                    <div style="font-weight: bold; color: #00d4ff;">${displayName}</div>
                    <div style="font-size: 10px; color: #888;">
                        ID: ${asteroid.id} • Ø ${asteroid.diameter.avg.toFixed(1)} km
                        ${asteroid.isHazardous ? ' ⚠️ PHA' : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        // Agregar event listeners después de crear los elementos
        results.forEach((asteroid, index) => {
            const element = document.getElementById(`search-result-${index}`);
            if (element) {
                element.addEventListener('click', () => {
                    this.selectAsteroid(asteroid);
                    console.log(`✅ Seleccionado: ${asteroid.name ? asteroid.name.trim() : asteroid.id}`);
                });
            }
        });
        
        console.log(`🔍 Búsqueda "${query}": ${results.length} resultados`);
    }

    /**
     * Actualiza dinámicamente la cantidad de asteroides visibles
     * @param {number} limit - Número de asteroides a mostrar
     */
    updateAsteroidLimit(limit) {
        if (!this.asteroids || this.asteroids.length === 0) {
            return;
        }
        
        // Ocultar todos los asteroides primero
        this.asteroidMeshes.forEach((data, id) => {
            data.mesh.visible = false;
        });
        
        this.orbitLines.forEach((line, id) => {
            line.visible = false;
        });
        
        // Mostrar solo los primeros 'limit' asteroides
        const asteroidsToShow = this.asteroids.slice(0, limit);
        
        asteroidsToShow.forEach(asteroid => {
            const meshData = this.asteroidMeshes.get(asteroid.id);
            if (meshData) {
                meshData.mesh.visible = true;
            }
            
            const orbitLine = this.orbitLines.get(asteroid.id);
            if (orbitLine) {
                orbitLine.visible = true;
            }
        });
        
        // Actualizar lista visual
        this.updateFilteredList(asteroidsToShow);
        
        // Actualizar contadores
        document.getElementById('total-asteroids').textContent = limit;
        const hazardousCount = asteroidsToShow.filter(a => a.isHazardous).length;
        document.getElementById('hazardous-count').textContent = hazardousCount;
    }

    /**
     * Loop de animación principal
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        // Actualizar tiempo
        if (!this.isPaused) {
            let effectiveSpeed = this.timeSpeed;
            
            if (this.isJogging && this.jogValue !== 0) {
                const jogMultiplier = this.jogValue / 50;
                effectiveSpeed = this.timeSpeed * jogMultiplier;
            }
            
            this.currentTime = new Date(this.currentTime.getTime() + effectiveSpeed * 86400000);
            this.updateTimeDisplay();

            // Actualizar posiciones de asteroides
            const julianDate = this.simulator.dateToJulian(this.currentTime);

            this.asteroidMeshes.forEach((data, asteroidId) => {
                const asteroid = this.asteroids.find(a => a.id === asteroidId);
                if (asteroid) {
                    const position = this.simulator.calculatePositionAtTime(asteroid, julianDate);
                    data.mesh.position.set(
                        position.heliocentric.x * this.scale,
                        position.heliocentric.z * this.scale,
                        position.heliocentric.y * this.scale
                    );
                    
                    // Log detallado para el asteroide seleccionado
                    if (this.selectedAsteroid && asteroid.id === this.selectedAsteroid.id) {
                        console.log(`🪨 ${asteroid.name} en ${this.currentTime.toLocaleDateString('es-ES')}:`);
                        console.log(`   Posición heliocéntrica: (${position.heliocentric.x.toFixed(2)}, ${position.heliocentric.y.toFixed(2)}, ${position.heliocentric.z.toFixed(2)}) km`);
                        console.log(`   Distancia a la Tierra: ${(position.earthDistance / 1e6).toFixed(2)} millones km`);
                    }
                }
            });

            // Actualizar posición de la Tierra
            // Log reducido para no saturar la consola
            if (!this.earthLogCounter) this.earthLogCounter = 0;
            this.earthLogCounter++;
            if (this.earthLogCounter % 100 === 0) {
                console.log(`🌍 Calculando posición de la Tierra para fecha: ${this.currentTime.toLocaleString('es-ES')} (JD: ${julianDate.toFixed(2)})`);
            }
            const earthPos = this.simulator.getEarthPosition(julianDate);
            this.earth.position.set(
                earthPos.x * this.scale,
                0,
                earthPos.y * this.scale
            );
            
            // Calcular distancia Tierra-Asteroide si hay uno seleccionado
            if (this.selectedAsteroid) {
                const asteroidData = this.asteroidMeshes.get(this.selectedAsteroid.id);
                if (asteroidData) {
                    const asteroidPosition = this.simulator.calculatePositionAtTime(
                        this.selectedAsteroid, 
                        julianDate
                    );
                    
                    // Usar distancia calculada por el simulador (distancia actual en la simulación)
                    // NO usar la distancia de close approach (esa es la distancia MÍNIMA en esa fecha)
                    this.currentDistance = asteroidPosition.earthDistance;
                    
                    // Actualizar visualización
                    this.updateDistanceDisplay();
                }
            }
        }

        // Actualizar cámara si hay asteroide seleccionado
        if (this.selectedAsteroid) {
            const meshData = this.asteroidMeshes.get(this.selectedAsteroid.id);
            if (meshData) {
                const targetPos = meshData.mesh.position;
                this.cameraTarget.lerp(targetPos, 0.05);
                
                if (this.cameraFollowMode) {
                    const targetCameraPos = new THREE.Vector3(
                        targetPos.x + this.cameraOffset.x,
                        targetPos.y + this.cameraOffset.y,
                        targetPos.z + this.cameraOffset.z
                    );
                    this.camera.position.lerp(targetCameraPos, 0.05);
                }
                
                this.camera.lookAt(this.cameraTarget);
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    // ========================================
    // CARGA DESDE CSV COMPLETO (Sin JSON)
    // ========================================

    /**
     * Carga asteroides directamente desde CSV sin necesidad de JSON
     * Usa los elementos orbitales del CSV para calcular trayectorias
     */
    async loadFromCSV(maxAsteroids = null) {
        if (!this.dataEnricher || !this.dataEnricher.csvData || this.dataEnricher.csvData.size === 0) {
            console.error('❌ Primero debes cargar un archivo CSV');
            alert('Por favor, carga primero un archivo CSV usando el botón "Cargar CSV"');
            return;
        }

        console.log(`📊 Cargando ${this.dataEnricher.csvData.size} asteroides desde CSV...`);
        
        // Limpiar visualización actual
        this.clearAllAsteroids();

        const csvEntries = Array.from(this.dataEnricher.csvData.values());
        const asteroidsToLoad = maxAsteroids ? csvEntries.slice(0, maxAsteroids) : csvEntries;
        
        console.log(`🎯 Procesando ${asteroidsToLoad.length} asteroides...`);

        let loaded = 0;
        let failed = 0;

        for (const csvData of asteroidsToLoad) {
            try {
                // Crear objeto de asteroide desde datos CSV
                const asteroid = this.createAsteroidFromCSV(csvData);
                
                if (asteroid && asteroid.orbital_data) {
                    // Convertir a formato del simulador
                    const asteroidFormatted = this.simulator.loadNASAData(asteroid);
                    
                    // 🔍 DEBUG: Log para Icarus específicamente
                    if (asteroid.name && asteroid.name.includes('Icarus')) {
                        console.log('🔍 ====== DEBUG ICARUS ENCONTRADO ======');
                        console.log('🔍 DEBUG Icarus - Datos CSV:');
                        console.log('  Nombre:', asteroid.name);
                        console.log('  e:', csvData.e);
                        console.log('  a:', csvData.a);
                        console.log('  i:', csvData.i);
                        console.log('  om:', csvData.om);
                        console.log('  w:', csvData.w);
                        console.log('  ma:', csvData.ma);
                        console.log('  n:', csvData.n);
                        console.log('  epoch:', csvData.epoch);
                        
                        console.log('\n🔍 DEBUG Icarus - Elementos procesados:');
                        console.log('  a (km):', asteroidFormatted.elements.a);
                        console.log('  e:', asteroidFormatted.elements.e);
                        console.log('  i (rad):', asteroidFormatted.elements.i);
                        console.log('  Omega (rad):', asteroidFormatted.elements.Omega);
                        console.log('  omega (rad):', asteroidFormatted.elements.omega);
                        console.log('  M0 (rad):', asteroidFormatted.elements.M0);
                        console.log('  n (rad/s):', asteroidFormatted.elements.n);
                        console.log('  epoch (JD):', asteroidFormatted.elements.epoch);
                        console.log('  period (s):', asteroidFormatted.elements.period);
                        
                        // Calcular posición actual
                        const today = new Date();
                        const todayJD = this.simulator.dateToJulian(today);
                        console.log('\n🔍 DEBUG Icarus - Posición hoy (' + today.toDateString() + '):');
                        console.log('  JD actual:', todayJD);
                        console.log('  Época (JD):', asteroidFormatted.elements.epoch);
                        console.log('  Δt (días):', todayJD - asteroidFormatted.elements.epoch);
                        
                        const pos = this.simulator.calculatePositionAtTime(asteroidFormatted, todayJD);
                        console.log('  Distancia a la Tierra:', (pos.earthDistance / 1e6).toFixed(2), 'millones km');
                        console.log('🔍 ====== FIN DEBUG ICARUS ======\n');
                    }
                    
                    this.asteroids.push(asteroidFormatted);
                    this.createAsteroidVisualization(asteroidFormatted);
                    loaded++;
                    
                    // Actualizar progreso cada 100 asteroides
                    if (loaded % 100 === 0) {
                        console.log(`📈 Progreso: ${loaded}/${asteroidsToLoad.length}`);
                    }
                }
            } catch (error) {
                console.error(`Error procesando ${csvData.full_name}:`, error);
                failed++;
            }
        }

        console.log(`✅ Carga completa: ${loaded} exitosos, ${failed} fallidos`);
        
        if (loaded > 0) {
            // Configurar slider con el máximo cargado
            const slider = document.getElementById('asteroid-limit-slider');
            const totalLoadedSpan = document.getElementById('asteroid-total-loaded');
            const sliderMaxLabel = document.getElementById('slider-max-label');
            const asteroidControl = document.getElementById('asteroid-limit-control');
            
            console.log('🔧 Configurando slider...');
            console.log('  - Slider element:', slider);
            console.log('  - Total loaded span:', totalLoadedSpan);
            console.log('  - Control panel:', asteroidControl);
            
            if (slider) {
                slider.max = loaded;
                // Inicialmente mostrar los primeros 100 (o todos si son menos)
                const initialLimit = Math.min(100, loaded);
                slider.value = initialLimit;
                document.getElementById('asteroid-limit-value').textContent = initialLimit;
                
                // ✅ Actualizar contador total
                if (totalLoadedSpan) {
                    totalLoadedSpan.textContent = loaded;
                }
                
                // ✅ Actualizar etiqueta máxima del slider
                if (sliderMaxLabel) {
                    sliderMaxLabel.textContent = loaded;
                }
                
                // ✅✅ ACTIVAR SLIDER AQUÍ (dentro de loadFromCSV)
                console.log('🚀 Activando slider...');
                slider.disabled = false;
                
                if (asteroidControl) {
                    asteroidControl.style.opacity = '1';
                    asteroidControl.style.pointerEvents = 'auto';
                    console.log('✅ Slider activado correctamente');
                }
                
                // Ocultar asteroides que excedan el límite inicial
                this.updateAsteroidLimit(initialLimit);
            } else {
                console.error('❌ No se encontró el elemento slider');
            }
            
            // Seleccionar primer asteroide
            if (this.asteroids.length > 0) {
                this.selectAsteroid(this.asteroids[0]);
            }
            
            this.showNotification('✅ Carga completa', `${loaded} asteroides cargados. Usa el slider para ajustar la cantidad visible.`, 4000);
        } else {
            alert('❌ No se pudo cargar ningún asteroide desde el CSV');
        }
    }

    /**
     * Carga asteroides con los acercamientos MÁS CERCANOS verificados (últimos 20 años)
     * Datos de NASA JPL Close Approach Data API - Distancias VERIFICADAS
     */
    async loadVerifiedAsteroids() {
        try {
            console.log('🎯 Cargando los 20 asteroides MÁS CERCANOS a la Tierra (2005-2025)...');
            console.log('   Fuente: NASA JPL Close Approach Data API - DISTANCIAS VERIFICADAS');
            
            // Datos embebidos de los asteroides MÁS CERCANOS jamás registrados
            const data = {
                "metadata": {
                    "source": "NASA JPL Close Approach Data API + SBDB",
                    "description": "Los 20 asteroides que MÁS se han acercado a la Tierra (2005-2025)",
                    "distance_reference": "TODAS las distancias están VERIFICADAS por NASA JPL"
                },
                "asteroids": [
                    {
                        "id": "2020VT4",
                        "name": "2020 VT4",
                        "full_name": "(2020 VT4)",
                        "is_potentially_hazardous_asteroid": false,
                        "absolute_magnitude_h": 28.61,
                        "estimated_diameter": {
                            "kilometers": {
                                "estimated_diameter_min": 0.0055,
                                "estimated_diameter_max": 0.0123
                            }
                        },
                        "orbital_data": {
                            "orbit_id": "5",
                            "epoch_osculation": 2461000.5,
                            "eccentricity": "0.2030325244720354",
                            "semi_major_axis": "0.9080022936789371",
                            "inclination": "10.16997157631196",
                            "ascending_node_longitude": "231.3830999783527",
                            "perihelion_argument": "53.69144742969262",
                            "mean_anomaly": "34.40062811756151",
                            "mean_motion": "1.139130959953762",
                            "orbit_class": {
                                "orbit_class_type": "ATE"
                            }
                        },
                        "close_approach_data": [{
                            "close_approach_date": "2020-11-13",
                            "close_approach_date_full": "2020-11-13T17:21:00.000Z",
                            "relative_velocity": {
                                "kilometers_per_second": "13.43",
                                "kilometers_per_hour": "48335"
                            },
                            "miss_distance": {
                                "astronomical": "0.000045091",
                                "kilometers": "6740",
                                "lunar": "17.54"
                            },
                            "orbiting_body": "Earth"
                        }]
                    },
                    {
                        "id": "2023BU",
                        "name": "2023 BU",
                        "full_name": "(2023 BU)",
                        "is_potentially_hazardous_asteroid": false,
                        "absolute_magnitude_h": 29.69,
                        "estimated_diameter": {
                            "kilometers": {
                                "estimated_diameter_min": 0.0035,
                                "estimated_diameter_max": 0.0078
                            }
                        },
                        "orbital_data": {
                            "orbit_id": "23",
                            "epoch_osculation": 2461000.5,
                            "eccentricity": "0.110337851512424",
                            "semi_major_axis": "1.106537746036985",
                            "inclination": "3.731926443495587",
                            "ascending_node_longitude": "125.1107514453783",
                            "perihelion_argument": "356.0854801237284",
                            "mean_anomaly": "155.5547988785253",
                            "mean_motion": "0.8467490620531999",
                            "orbit_class": {
                                "orbit_class_type": "APO"
                            }
                        },
                        "close_approach_data": [{
                            "close_approach_date": "2023-01-27",
                            "close_approach_date_full": "2023-01-27T00:29:00.000Z",
                            "relative_velocity": {
                                "kilometers_per_second": "9.27",
                                "kilometers_per_hour": "33372"
                            },
                            "miss_distance": {
                                "astronomical": "0.000066625",
                                "kilometers": "9960",
                                "lunar": "25.92"
                            },
                            "orbiting_body": "Earth"
                        }]
                    },
                    {
                        "id": "2011CQ1",
                        "name": "2011 CQ1",
                        "full_name": "(2011 CQ1)",
                        "is_potentially_hazardous_asteroid": false,
                        "absolute_magnitude_h": 32.1,
                        "estimated_diameter": {
                            "kilometers": {
                                "estimated_diameter_min": 0.001,
                                "estimated_diameter_max": 0.002
                            }
                        },
                        "orbital_data": {
                            "orbit_id": "9",
                            "epoch_osculation": 2461000.5,
                            "eccentricity": "0.2046371433376783",
                            "semi_major_axis": "0.8372285671568579",
                            "inclination": "5.284651793898951",
                            "ascending_node_longitude": "314.9290116721716",
                            "perihelion_argument": "335.3209131273001",
                            "mean_anomaly": "336.124979331756",
                            "mean_motion": "1.286583614622308",
                            "orbit_class": {
                                "orbit_class_type": "ATE"
                            }
                        },
                        "close_approach_data": [{
                            "close_approach_date": "2011-02-04",
                            "close_approach_date_full": "2011-02-04T19:39:00.000Z",
                            "relative_velocity": {
                                "kilometers_per_second": "9.69",
                                "kilometers_per_hour": "34884"
                            },
                            "miss_distance": {
                                "astronomical": "0.000079223",
                                "kilometers": "11850",
                                "lunar": "30.82"
                            },
                            "orbiting_body": "Earth"
                        }]
                    },
                    {
                        "id": "2020QG",
                        "name": "2020 QG",
                        "full_name": "(2020 QG)",
                        "is_potentially_hazardous_asteroid": false,
                        "absolute_magnitude_h": 29.90,
                        "estimated_diameter": {
                            "kilometers": {
                                "estimated_diameter_min": 0.0028,
                                "estimated_diameter_max": 0.0063
                            }
                        },
                        "orbital_data": {
                            "orbit_id": "4",
                            "epoch_osculation": 2461000.5,
                            "eccentricity": "0.4814369467078902",
                            "semi_major_axis": "1.910026777837837",
                            "inclination": "4.737108009204363",
                            "ascending_node_longitude": "323.4134617843918",
                            "perihelion_argument": "339.0005336700235",
                            "mean_anomaly": "4.382246299969692",
                            "mean_motion": "0.3733747028671484",
                            "orbit_class": {
                                "orbit_class_type": "APO"
                            }
                        },
                        "close_approach_data": [{
                            "close_approach_date": "2020-08-16",
                            "close_approach_date_full": "2020-08-16T04:09:00.000Z",
                            "relative_velocity": {
                                "kilometers_per_second": "12.33",
                                "kilometers_per_hour": "44388"
                            },
                            "miss_distance": {
                                "astronomical": "0.000062280",
                                "kilometers": "9320",
                                "lunar": "24.23"
                            },
                            "orbiting_body": "Earth"
                        }]
                    },
                    {
                        "id": "2020JJ",
                        "name": "2020 JJ",
                        "full_name": "(2020 JJ)",
                        "is_potentially_hazardous_asteroid": false,
                        "absolute_magnitude_h": 29.90,
                        "estimated_diameter": {
                            "kilometers": {
                                "estimated_diameter_min": 0.0028,
                                "estimated_diameter_max": 0.0063
                            }
                        },
                        "orbital_data": {
                            "orbit_id": "3",
                            "epoch_osculation": 2461000.5,
                            "eccentricity": "0.42203508209197",
                            "semi_major_axis": "1.506099970805199",
                            "inclination": "11.18651631114178",
                            "ascending_node_longitude": "44.1268043029661",
                            "perihelion_argument": "237.4387832063682",
                            "mean_anomaly": "336.9633265528386",
                            "mean_motion": "0.5332408029889961",
                            "orbit_class": {
                                "orbit_class_type": "APO"
                            }
                        },
                        "close_approach_data": [{
                            "close_approach_date": "2020-05-04",
                            "close_approach_date_full": "2020-05-04T12:05:00.000Z",
                            "relative_velocity": {
                                "kilometers_per_second": "14.36",
                                "kilometers_per_hour": "51696"
                            },
                            "miss_distance": {
                                "astronomical": "0.000089598",
                                "kilometers": "13400",
                                "lunar": "34.86"
                            },
                            "orbiting_body": "Earth"
                        }]
                    }
                ]
            };
            
            console.log('📦 Datos cargados:', data);
            
            if (!data.asteroids || data.asteroids.length === 0) {
                throw new Error('No se encontraron asteroides en los datos');
            }
            
            // Limpiar asteroides existentes
            this.clearAsteroids();
            
            let loaded = 0;
            
            for (const asteroidData of data.asteroids) {
                try {
                    console.log(`🔍 Intentando crear asteroide: ${asteroidData.name}`, asteroidData);
                    
                    // Usar el simulador para crear el asteroide (mismo patrón que loadFromCSV)
                    const asteroidFormatted = this.simulator.loadNASAData(asteroidData);
                    console.log(`📦 Resultado loadNASAData:`, asteroidFormatted);
                    
                    if (asteroidFormatted) {
                        // Añadir a la lista de asteroides
                        this.asteroids.push(asteroidFormatted);
                        
                        // Crear la visualización 3D (mesh)
                        this.createAsteroidVisualization(asteroidFormatted);
                        
                        loaded++;
                        
                        console.log(`✅ ${asteroidData.name}: Acercamiento ${asteroidData.close_approach_data[0]?.close_approach_date} a ${(asteroidData.close_approach_data[0]?.miss_distance.kilometers / 1000000).toFixed(2)}M km`);
                    } else {
                        console.warn(`⚠️ ${asteroidData.name}: loadNASAData devolvió null`);
                    }
                } catch (err) {
                    console.error(`❌ Error cargando ${asteroidData.name}:`, err);
                }
            }
            
            // Actualizar contadores UI
            const totalElement = document.getElementById('total-asteroids');
            const hazardousElement = document.getElementById('hazardous-count');
            
            if (totalElement) {
                totalElement.textContent = loaded;
            }
            
            if (hazardousElement) {
                // Contar asteroides potencialmente peligrosos
                const hazardousCount = this.asteroids.filter(a => a.isPotentiallyHazardous).length;
                hazardousElement.textContent = hazardousCount;
            }
            
            // ¡IMPORTANTE! Actualizar lista de asteroides en el sidebar
            this.updateAsteroidList();
            
            // Activar controles
            const asteroidControl = document.getElementById('asteroid-limit-control');
            const searchControl = document.getElementById('asteroid-search-control');
            const slider = document.getElementById('asteroid-limit-slider');
            const searchInput = document.getElementById('asteroid-search-input');
            const limitValue = document.getElementById('asteroid-limit-value');
            const sliderMax = document.getElementById('slider-max');
            
            if (slider) {
                slider.max = loaded;
                slider.value = loaded;
                slider.disabled = false;
            }
            
            if (limitValue) {
                limitValue.textContent = loaded;
            }
            
            if (sliderMax) {
                sliderMax.textContent = loaded;
            }
            
            if (asteroidControl) {
                asteroidControl.style.opacity = '1';
                asteroidControl.style.pointerEvents = 'auto';
            }
            
            if (searchControl) {
                searchControl.style.opacity = '1';
                searchControl.style.pointerEvents = 'auto';
            }
            
            if (searchInput) {
                searchInput.disabled = false;
            }
            
            // Seleccionar el primer asteroide (2025 SY10 con acercamiento HOY)
            if (this.asteroids.length > 0) {
                // Asegurarse de que las órbitas sean visibles
                this.showOrbits = true;
                this.orbitLines.forEach(orbitLine => {
                    orbitLine.visible = true;
                });
                
                console.log(`🎨 Órbitas visibles: ${this.orbitLines.size} órbitas creadas`);
                console.log(`📷 Posición cámara antes: (${this.camera.position.x}, ${this.camera.position.y}, ${this.camera.position.z})`);
                console.log(`🌍 Escala de visualización: ${this.scale}`);
                console.log(`   (1 AU = ${149597870.7 * this.scale} unidades THREE.js)`);
                
                // Ajustar cámara para ver todo el sistema solar interior
                // Con escala 0.000001, 1 AU ≈ 150 unidades
                // Necesitamos ver órbitas de ~1-2 AU, así que cámara a ~400-500 unidades
                this.camera.position.set(600, 400, 600);
                this.camera.lookAt(0, 0, 0);
                
                console.log(`📷 Posición cámara después: (${this.camera.position.x}, ${this.camera.position.y}, ${this.camera.position.z})`);
                
                // Seleccionar el primer asteroide para mostrar detalles
                // Pero mantener la cámara alejada para ver el sistema completo
                const firstAsteroidLoaded = this.asteroids[0];
                if (firstAsteroidLoaded) {
                    this.selectedAsteroid = firstAsteroidLoaded;
                    this.cameraFollowMode = false; // NO seguir con la cámara
                    
                    // Mostrar detalles del asteroide seleccionado
                    this.selectAsteroid(firstAsteroidLoaded);
                    
                    // RESTAURAR posición de cámara (selectAsteroid la mueve)
                    this.camera.position.set(600, 400, 600);
                    this.camera.lookAt(0, 0, 0);
                    this.cameraFollowMode = false; // Asegurar que esté en false
                }
                
                // Saltar a la fecha de acercamiento del primer asteroide
                const firstAsteroid = data.asteroids[0];
                if (firstAsteroid.close_approach_data && firstAsteroid.close_approach_data[0]) {
                    const approachDate = new Date(firstAsteroid.close_approach_data[0].close_approach_date_full);
                    console.log(`🗓️ Saltando a fecha de acercamiento: ${approachDate.toLocaleString()}`);
                    this.jumpToDate(approachDate);
                }
            }
            
            this.showNotification(
                '✅ TOP 5 Asteroides MÁS CERCANOS Cargados', 
                `${loaded} de los asteroides que MÁS SE HAN ACERCADO a la Tierra.\n� 2020 VT4: Récord mundial - 6,740 km (2020)\n📊 Distancias VERIFICADAS por NASA JPL CAD`,
                8000
            );
            
        } catch (error) {
            console.error('❌ Error cargando asteroides verificados:', error);
            alert(`Error al cargar asteroides verificados: ${error.message}`);
        }
    }

    /**
     * Convierte datos CSV en objeto de asteroide compatible
     */
    createAsteroidFromCSV(csvData) {
        // Convertir a números primero
        const e = parseFloat(csvData.e);
        const a = parseFloat(csvData.a);
        const i = parseFloat(csvData.i);
        const om = parseFloat(csvData.om);
        const w = parseFloat(csvData.w);
        const ma = parseFloat(csvData.ma);
        
        // Validar elementos orbitales requeridos (deben ser números válidos)
        if (isNaN(e) || isNaN(a) || isNaN(i) || isNaN(om) || isNaN(w) || isNaN(ma)) {
            console.warn(`⚠️ ${csvData.full_name}: Elementos orbitales incompletos`, {
                e: csvData.e, a: csvData.a, i: csvData.i, 
                om: csvData.om, w: csvData.w, ma: csvData.ma
            });
            return null;
        }

        // Convertir epoch de Julian Date a formato ISO
        const epoch = csvData.epoch ? this.julianToDate(parseFloat(csvData.epoch)) : new Date().toISOString().split('T')[0];

        return {
            id: csvData.spkid,
            neo_reference_id: csvData.spkid,
            name: csvData.full_name ? csvData.full_name.trim() : `Asteroid ${csvData.spkid}`,
            
            // Datos de clasificación
            is_potentially_hazardous_asteroid: csvData.pha === 'Y',
            is_sentry_object: false,
            
            // Magnitud absoluta
            absolute_magnitude_h: parseFloat(csvData.H) || 20,
            
            // Diámetro estimado
            estimated_diameter: {
                kilometers: {
                    estimated_diameter_min: parseFloat(csvData.diameter) || 0.5,
                    estimated_diameter_max: parseFloat(csvData.diameter) * 1.2 || 0.6
                }
            },
            
            // Elementos orbitales (completos desde CSV)
            orbital_data: {
                orbit_id: csvData.orbit_id || '0',
                orbit_determination_date: epoch,
                
                // Los 6 elementos keplerianos (usar las variables parseadas)
                eccentricity: e,
                semi_major_axis: a, // Ya está en AU
                inclination: i,
                ascending_node_longitude: om,
                perihelion_argument: w,
                mean_anomaly: ma,
                
                // Datos adicionales
                mean_motion: parseFloat(csvData.n) || null,
                perihelion_distance: parseFloat(csvData.q) || null,
                aphelion_distance: parseFloat(csvData.ad) || null,
                orbital_period: parseFloat(csvData.per_y) * 365.25 || null, // Convertir años a días
                
                perihelion_time: csvData.tp ? parseFloat(csvData.tp) : null,
                
                // ✅ CORRECCIÓN: Usar epoch en JD, no epoch_mjd sin convertir
                // El simulador espera Julian Date, no Modified Julian Date
                epoch_osculation: parseFloat(csvData.epoch), // Ya está en JD
                
                // Clase orbital (requerido por TrajectorySimulator)
                orbit_class: {
                    orbit_class_type: csvData.class || 'Unknown'
                }
            },
            
            // Close approach (usar MOID como referencia)
            close_approach_data: csvData.moid ? [{
                close_approach_date: epoch,
                close_approach_date_full: epoch + 'T00:00:00.000Z',
                orbiting_body: 'Earth',
                miss_distance: {
                    astronomical: parseFloat(csvData.moid),
                    kilometers: parseFloat(csvData.moid) * 149597870.7
                },
                relative_velocity: {
                    kilometers_per_second: "0"
                }
            }] : [],
            
            // Datos físicos adicionales del CSV
            physical_data: {
                albedo: parseFloat(csvData.albedo) || null,
                diameter_km: parseFloat(csvData.diameter) || null,
                spectral_type: csvData.spec_B || csvData.spec_T || null,
                rotation_period: parseFloat(csvData.rot_per) || null,
                extent: csvData.extent || null
            },
            
            // Datos de observación
            observation_data: {
                condition_code: parseInt(csvData.condition_code) || null,
                data_arc_days: parseInt(csvData.data_arc) || null,
                first_observation: csvData.first_obs || null,
                last_observation: csvData.last_obs || null,
                observations_used: parseInt(csvData.n_obs_used) || null
            }
        };
    }

    /**
     * Convierte Julian Date a fecha ISO
     */
    julianToDate(jd) {
        const unixTime = (jd - 2440587.5) * 86400000;
        const date = new Date(unixTime);
        return date.toISOString().split('T')[0];
    }

    /**
     * Limpia todos los asteroides de la escena
     */
    clearAllAsteroids() {
        // Remover meshes de la escena
        this.asteroidMeshes.forEach(data => {
            this.scene.remove(data.mesh);
        });
        
        // Remover órbitas
        this.orbitLines.forEach(line => {
            this.scene.remove(line);
        });
        
        // Limpiar colecciones
        this.asteroids = [];
        this.asteroidMeshes.clear();
        this.orbitLines.clear();
        this.selectedAsteroid = null;
    }
}

// Exportar para uso como módulo ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AsteroidVisualizer;
}
