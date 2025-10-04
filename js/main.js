// ==========================================
// 🌍 SIMULACIÓN DE LA TIERRA CON THREE.JS
// ==========================================

// URLs de texturas
const TEXTURE_URLS = {
    earthDay: 'https://unpkg.com/three-globe/example/img/earth-day.jpg',
    earthNight: 'https://unpkg.com/three-globe/example/img/earth-night.jpg', 
    earthClouds: 'https://unpkg.com/three-globe/example/img/earth-water.png',
    earthBump: 'https://unpkg.com/three-globe/example/img/earth-topology.png'
};

class EarthSimulation {
    constructor() {
        // Variables principales
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.earth = null;
        this.earthGroup = null;
        this.craters = [];
        
        // Variables de animación
        this.rotationSpeed = 0.005;
        this.isAnimating = true;
        this.craterSize = 0.5;
        
        // Inicializar la simulación
        this.init();
        this.setupEventListeners();
        this.animate();
    }
    
    // ==========================================
    // INICIALIZACIÓN DE THREE.JS
    // ==========================================
    
    init() {
        console.log('🚀 Inicializando simulación de la Tierra...');
        
        // 1. Crear la escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011); // Fondo espacial
        
        // 2. Configurar la cámara
        this.camera = new THREE.PerspectiveCamera(
            75, // Campo de visión
            window.innerWidth / window.innerHeight, // Aspecto
            0.1, // Near plane
            1000 // Far plane
        );
        this.camera.position.set(0, 0, 5); // Posición inicial
        
        // 3. Crear el renderizador
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, // Suavizado
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true; // Habilitar sombras
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Agregar el canvas al contenedor
        const container = document.getElementById('canvas-container');
        container.appendChild(this.renderer.domElement);
        
        // 4. Configurar controles de órbita
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true; // Inercia suave
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 2; // Zoom mínimo
        this.controls.maxDistance = 20; // Zoom máximo
        this.controls.maxPolarAngle = Math.PI; // Permitir vista completa
        
        // 5. Agregar luces
        this.setupLighting();
        
        // 6. Crear fondo estrellado
        this.createStarField();
        
        // 7. Crear la Tierra
        this.createEarth().then(() => {
            console.log('🌍 Tierra inicializada completamente');
        }).catch(error => {
            console.error('❌ Error inicializando la Tierra:', error);
        });
        
        // 7. Manejar redimensionamiento de ventana
        window.addEventListener('resize', () => this.onWindowResize());
        
        console.log('✅ Simulación inicializada correctamente');
    }
    
    // ==========================================
    // CONFIGURACIÓN DE ILUMINACIÓN
    // ==========================================
    
    setupLighting() {
        // Luz ambiente (iluminación general suave)
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Luz direccional (simula el Sol)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 3, 5);
        directionalLight.castShadow = true;
        
        // Configurar sombras
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        
        this.scene.add(directionalLight);
        
        console.log('💡 Iluminación configurada');
    }
    
    // ==========================================
    // CAMPO DE ESTRELLAS
    // ==========================================
    
    createStarField() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 10000;
        
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount; i++) {
            // Posición aleatoria en una esfera grande
            const radius = 50 + Math.random() * 50;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.cos(phi);
            positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
            
            // Color de estrella (variaciones de blanco y azul)
            const intensity = 0.5 + Math.random() * 0.5;
            colors[i * 3] = intensity; // R
            colors[i * 3 + 1] = intensity; // G  
            colors[i * 3 + 2] = intensity + Math.random() * 0.1; // B (ligeramente más azul)
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 1,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
        
        console.log('✨ Campo de estrellas creado');
    }
    
    // ==========================================
    // CREACIÓN DE LA TIERRA
    // ==========================================
    
    async createEarth() {
        // Crear grupo para la Tierra (para rotación)
        this.earthGroup = new THREE.Group();
        this.scene.add(this.earthGroup);
        
        // Geometría de la esfera con más detalle
        const geometry = new THREE.SphereGeometry(1, 128, 64);
        
        // Cargar texturas de manera asíncrona
        const textureLoader = new THREE.TextureLoader();
        
        try {
            console.log('📥 Cargando texturas de la Tierra...');
            
            // Cargar textura principal de la Tierra
            const earthTexture = await this.loadTextureWithFallback(
                textureLoader,
                TEXTURE_URLS.earthDay,
                this.createEarthTexture()
            );
            
            // Cargar mapa de normales para relieve
            const bumpTexture = await this.loadTextureWithFallback(
                textureLoader,
                TEXTURE_URLS.earthBump,
                null
            );
            
            // Crear material realista
            const material = new THREE.MeshPhongMaterial({ 
                map: earthTexture, // Textura principal
                bumpMap: bumpTexture, // Mapa de relieve
                bumpScale: 0.1, // Intensidad del relieve
                shininess: 100, // Brillo de los océanos
                specular: 0x222222, // Color especular
                transparent: false
            });
            
            // Crear la malla
            this.earth = new THREE.Mesh(geometry, material);
            this.earth.receiveShadow = true;
            this.earth.castShadow = true;
            
            this.earthGroup.add(this.earth);
            
            console.log('🌍 Tierra con texturas creada exitosamente');
            
        } catch (error) {
            console.warn('⚠️ Error cargando texturas, usando material básico');
            this.createBasicEarth(geometry);
        }
    }
    
    // Crear textura simple de la Tierra si falla la carga
    createEarthTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        // Fondo oceánico
        context.fillStyle = '#0066cc';
        context.fillRect(0, 0, 512, 256);
        
        // Continentes simplificados
        context.fillStyle = '#00aa00';
        
        // "América"
        context.beginPath();
        context.ellipse(100, 128, 40, 80, 0, 0, 2 * Math.PI);
        context.fill();
        
        // "África y Europa"
        context.beginPath();
        context.ellipse(256, 128, 30, 90, 0, 0, 2 * Math.PI);
        context.fill();
        
        // "Asia"
        context.beginPath();
        context.ellipse(350, 100, 50, 60, 0, 0, 2 * Math.PI);
        context.fill();
        
        // "Australia"
        context.beginPath();
        context.ellipse(380, 180, 25, 15, 0, 0, 2 * Math.PI);
        context.fill();
        
        return new THREE.CanvasTexture(canvas);
    }
    
    // Crear Tierra básica sin texturas externas
    createBasicEarth(geometry) {
        const material = new THREE.MeshPhongMaterial({ 
            map: this.createEarthTexture(),
            shininess: 30,
            specular: 0x111111
        });
        
        this.earth = new THREE.Mesh(geometry, material);
        this.earth.receiveShadow = true;
        this.earth.castShadow = true;
        
        this.earthGroup.add(this.earth);
    }
    
    // Función auxiliar para cargar texturas con fallback
    async loadTextureWithFallback(loader, url, fallbackTexture) {
        return new Promise((resolve) => {
            if (!url) {
                resolve(fallbackTexture);
                return;
            }
            
            loader.load(
                url,
                (texture) => {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    console.log(`✅ Textura cargada: ${url}`);
                    resolve(texture);
                },
                (progress) => {
                    if (progress.total > 0) {
                        console.log(`📥 Progreso: ${Math.round(progress.loaded / progress.total * 100)}%`);
                    }
                },
                (error) => {
                    console.warn(`⚠️ Fallback para textura: ${url}`);
                    resolve(fallbackTexture);
                }
            );
        });
    }
    
    // ==========================================
    // SISTEMA DE CRÁTERES MEJORADO
    // ==========================================
    
    addCrater() {
        // Posición aleatoria en la superficie de la esfera
        const phi = Math.random() * Math.PI; // Latitud
        const theta = Math.random() * 2 * Math.PI; // Longitud
        const surfaceRadius = 1.0; // En la superficie
        
        // Convertir coordenadas esféricas a cartesianas
        const x = surfaceRadius * Math.sin(phi) * Math.cos(theta);
        const y = surfaceRadius * Math.cos(phi);
        const z = surfaceRadius * Math.sin(phi) * Math.sin(theta);
        
        // Crear un cráter más complejo con anillo y depresión
        const craterGroup = new THREE.Group();
        
        // 1. Depresión central del cráter
        const depressionRadius = 0.03 * this.craterSize;
        const depressionGeometry = new THREE.SphereGeometry(depressionRadius, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.7);
        const depressionMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2F1B14, // Marrón muy oscuro
            transparent: true,
            opacity: 0.9
        });
        const depression = new THREE.Mesh(depressionGeometry, depressionMaterial);
        depression.position.set(0, 0, -depressionRadius * 0.3); // Hundir ligeramente
        craterGroup.add(depression);
        
        // 2. Anillo elevado del cráter
        const ringRadius = depressionRadius * 1.8;
        const ringGeometry = new THREE.RingGeometry(depressionRadius * 1.2, ringRadius, 16);
        const ringMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8B6914, // Color tierra/roca
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2; // Orientar horizontalmente
        craterGroup.add(ring);
        
        // 3. Partículas/debris alrededor (opcional)
        if (Math.random() > 0.5) {
            for (let i = 0; i < 5; i++) {
                const debrisGeometry = new THREE.SphereGeometry(0.002 * this.craterSize, 6, 6);
                const debrisMaterial = new THREE.MeshPhongMaterial({ 
                    color: 0x654321,
                    transparent: true,
                    opacity: 0.6
                });
                const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
                
                // Posición aleatoria cerca del cráter
                const debrisDistance = ringRadius * (1.5 + Math.random() * 0.5);
                const debrisAngle = Math.random() * Math.PI * 2;
                debris.position.set(
                    Math.cos(debrisAngle) * debrisDistance,
                    Math.sin(debrisAngle) * debrisDistance,
                    (Math.random() - 0.5) * 0.01
                );
                craterGroup.add(debris);
            }
        }
        
        // Posicionar el grupo del cráter en la superficie
        craterGroup.position.set(x, y, z);
        
        // Orientar hacia el centro de la Tierra
        const direction = new THREE.Vector3(x, y, z).normalize();
        craterGroup.lookAt(
            x + direction.x,
            y + direction.y, 
            z + direction.z
        );
        
        // Agregar al grupo de la Tierra
        this.earthGroup.add(craterGroup);
        this.craters.push(craterGroup);
        
        // Actualizar contador
        this.updateCraterCount();
        
        // Información del cráter
        const craterInfo = {
            position: { x: x.toFixed(2), y: y.toFixed(2), z: z.toFixed(2) },
            size: (depressionRadius * 2).toFixed(3),
            type: depression && ring ? 'complex' : 'simple'
        };
        
        console.log(`🌋 Cráter ${craterInfo.type} creado:`, craterInfo);
        
        return craterGroup;
    }
    
    // Crear cráter en posición específica (para uso futuro)
    addCraterAtPosition(lat, lon, size = null) {
        const phi = (90 - lat) * (Math.PI / 180); // Convertir latitud
        const theta = (lon + 180) * (Math.PI / 180); // Convertir longitud
        const radius = 1.0;
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        // Usar tamaño específico si se proporciona
        const originalSize = this.craterSize;
        if (size !== null) {
            this.craterSize = size;
        }
        
        const crater = this.addCrater();
        crater.position.set(x, y, z);
        
        // Restaurar tamaño original
        this.craterSize = originalSize;
        
        console.log(`🎯 Cráter agregado en lat: ${lat}°, lon: ${lon}°`);
        return crater;
    }
    
    clearCraters() {
        // Remover todos los cráteres
        this.craters.forEach(crater => {
            this.earthGroup.remove(crater);
            crater.geometry.dispose();
            crater.material.dispose();
        });
        this.craters = [];
        this.updateCraterCount();
        console.log('🧹 Cráteres eliminados');
    }
    
    // Actualizar contador de cráteres en la UI
    updateCraterCount() {
        const countElement = document.getElementById('crater-count');
        if (countElement) {
            countElement.textContent = this.craters.length;
        }
    }
    
    // ==========================================
    // CONTROLES DE INTERFAZ
    // ==========================================
    
    setupEventListeners() {
        // Control de velocidad de rotación
        document.getElementById('rotation-speed').addEventListener('input', (e) => {
            this.rotationSpeed = parseFloat(e.target.value) * 0.01;
        });
        
        // Control de tamaño de cráter
        document.getElementById('crater-size').addEventListener('input', (e) => {
            this.craterSize = parseFloat(e.target.value);
        });
        
        // Botón agregar cráter aleatorio
        document.getElementById('add-crater').addEventListener('click', () => {
            this.addCrater();
        });
        
        // Botón agregar múltiples cráteres
        document.getElementById('add-multiple-craters').addEventListener('click', () => {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => this.addCrater(), i * 200); // Crear con pequeño delay
            }
        });
        
        // Botón agregar cráter en coordenadas específicas
        document.getElementById('add-crater-coords').addEventListener('click', () => {
            const lat = parseFloat(document.getElementById('crater-lat').value) || 0;
            const lon = parseFloat(document.getElementById('crater-lon').value) || 0;
            
            // Validar coordenadas
            if (lat < -90 || lat > 90) {
                alert('La latitud debe estar entre -90 y 90 grados');
                return;
            }
            if (lon < -180 || lon > 180) {
                alert('La longitud debe estar entre -180 y 180 grados');
                return;
            }
            
            this.addCraterAtPosition(lat, lon);
        });
        
        // Botón limpiar cráteres
        document.getElementById('clear-craters').addEventListener('click', () => {
            this.clearCraters();
        });
        
        // Toggle wireframe
        document.getElementById('toggle-wireframe').addEventListener('click', () => {
            if (this.earth && this.earth.material) {
                this.earth.material.wireframe = !this.earth.material.wireframe;
            }
        });
        
        // Toggle animación
        document.getElementById('toggle-animation').addEventListener('click', () => {
            this.isAnimating = !this.isAnimating;
            const button = document.getElementById('toggle-animation');
            button.textContent = this.isAnimating ? 'Pausar' : 'Reanudar';
        });
        
        // Resetear vista
        document.getElementById('reset-view').addEventListener('click', () => {
            this.resetCameraView();
        });
        
        // Event listeners para teclado
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        console.log('🎮 Event listeners configurados');
    }
    
    // Resetear la vista de la cámara
    resetCameraView() {
        this.camera.position.set(0, 0, 5);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
        console.log('📷 Vista de cámara reseteada');
    }
    
    // Manejar teclas del teclado
    handleKeyPress(event) {
        switch(event.key.toLowerCase()) {
            case ' ': // Espacio para pausar/reanudar
                event.preventDefault();
                this.isAnimating = !this.isAnimating;
                break;
            case 'c': // 'C' para agregar cráter
                this.addCrater();
                break;
            case 'x': // 'X' para limpiar cráteres
                this.clearCraters();
                break;
            case 'w': // 'W' para wireframe
                if (this.earth && this.earth.material) {
                    this.earth.material.wireframe = !this.earth.material.wireframe;
                }
                break;
            case 'r': // 'R' para resetear vista
                this.resetCameraView();
                break;
        }
    }
    
    // ==========================================
    // BUCLE DE ANIMACIÓN
    // ==========================================
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Rotar la Tierra si la animación está activa
        if (this.isAnimating && this.earthGroup) {
            this.earthGroup.rotation.y += this.rotationSpeed;
        }
        
        // Actualizar controles
        this.controls.update();
        
        // Renderizar la escena
        this.renderer.render(this.scene, this.camera);
    }
    
    // ==========================================
    // UTILIDADES
    // ==========================================
    
    onWindowResize() {
        // Actualizar cámara y renderizador cuando cambia el tamaño de ventana
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// ==========================================
// INICIAR LA APLICACIÓN
// ==========================================

// Esperar a que cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Iniciando simulación de la Tierra...');
    
    // Crear la instancia de la simulación
    window.earthSim = new EarthSimulation();
    
    console.log('🌟 ¡Simulación lista! Usa los controles para interactuar.');
});

// ==========================================
// NOTAS EDUCATIVAS SOBRE THREE.JS
// ==========================================

/*
📚 CONCEPTOS CLAVE DE THREE.JS QUE HEMOS USADO:

1. ESCENA (Scene): 
   - Contenedor principal donde colocamos todos los objetos 3D
   - Es como el "mundo" donde existe todo

2. CÁMARA (Camera):
   - Define desde dónde y cómo vemos la escena
   - PerspectiveCamera simula la visión humana con perspectiva

3. RENDERIZADOR (Renderer):
   - Se encarga de dibujar la escena en el canvas
   - WebGLRenderer usa WebGL para gráficos 3D acelerados por hardware

4. GEOMETRÍA (Geometry):
   - Define la forma de los objetos (SphereGeometry = esfera)
   - Contiene vértices, caras y coordenadas UV

5. MATERIAL (Material):
   - Define cómo se ve la superficie del objeto
   - MeshPhongMaterial permite iluminación realista

6. MALLA (Mesh):
   - Combina geometría + material para crear un objeto 3D visible

7. LUCES (Lights):
   - AmbientLight: iluminación general uniforme
   - DirectionalLight: luz direccional como el sol

8. CONTROLES (Controls):
   - OrbitControls permite rotar, hacer zoom y panorámica con el mouse

PRÓXIMOS PASOS:
- Agregar texturas reales de la Tierra
- Mejorar el sistema de cráteres con geometría más compleja
- Añadir efectos visuales como atmósfera y estrellas
*/