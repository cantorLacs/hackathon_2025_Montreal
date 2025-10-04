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
        // Carga de archivo
        document.getElementById('nasa-json-file').addEventListener('change', (e) => {
            this.loadNASAFile(e.target.files[0]);
        });

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

        // Toggle panels
        document.getElementById('toggle-controls').addEventListener('click', () => {
            const panel = document.getElementById('controls-panel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });

        document.getElementById('toggle-info').addEventListener('click', () => {
            const panel = document.getElementById('info-panel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });
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

            // Procesar asteroides
            const neoList = data.near_earth_objects || [];
            let loadedCount = 0;
            let hazardousCount = 0;

            for (const neo of neoList.slice(0, 50)) { // Limitar a 50 para rendimiento
                try {
                    const asteroid = this.simulator.loadNASAData(neo);
                    this.asteroids.push(asteroid);
                    this.createAsteroidVisualization(asteroid);
                    
                    loadedCount++;
                    if (asteroid.isHazardous) hazardousCount++;
                } catch (error) {
                    console.warn('Error procesando asteroide:', error);
                }
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
        // Generar órbita completa basada en el período orbital
        const startDate = new Date();
        
        // Calcular período orbital en días
        const orbitalPeriodDays = asteroid.elements.period / 86400;
        
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
            opacity: 0.6
        });

        const orbitLine = new THREE.Line(geometry, material);
        orbitLine.visible = this.showOrbits;
        this.scene.add(orbitLine);
        this.orbitLines.set(asteroid.id, orbitLine);

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
                    Ø ${asteroid.diameter.avg.toFixed(1)} km | ${asteroid.orbitClass}
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
    selectAsteroid(asteroid) {
        this.selectedAsteroid = asteroid;
        this.cameraFollowMode = true;

        // Actualizar UI
        document.querySelectorAll('.asteroid-item').forEach(item => {
            item.classList.remove('selected');
        });
        event.target.closest('.asteroid-item').classList.add('selected');

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
                    <span class="info-label">Clase Orbital:</span>
                    <span class="info-value">${asteroid.orbitClass}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Peligroso:</span>
                    <span class="info-value">${asteroid.isHazardous ? '⚠️ SÍ' : '✅ NO'}</span>
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
                            <span class="info-value">${(approach.distance / 384400).toFixed(2)} DL 
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
                        const targetDate = new Date(approach.date.getTime() - 24 * 60 * 60 * 1000);
                        this.jumpToDate(targetDate);
                        this.isPaused = true;
                        document.getElementById('play-pause-btn').textContent = '▶️ Play';
                        this.setSpeed(1/24);
                        this.cameraFollowMode = true;
                        this.updateFollowButton();
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
                }
            });

            // Actualizar posición de la Tierra
            const earthPos = this.simulator.getEarthPosition(julianDate);
            this.earth.position.set(
                earthPos.x * this.scale,
                0,
                earthPos.y * this.scale
            );
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
}

// Exportar para uso como módulo ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AsteroidVisualizer;
}
