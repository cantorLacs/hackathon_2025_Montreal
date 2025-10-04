// ==========================================
// 🌍 SIMULACIÓN SIMPLE DE LA TIERRA
// ==========================================

console.log('🚀 Iniciando simulación...');

// Variables globales
let scene, camera, renderer, controls;
let earth, earthGroup;
let craters = [];
let rotationSpeed = 0.005;
let isAnimating = true;
let craterSize = 0.5;

// ==========================================
// INICIALIZACIÓN
// ==========================================

function init() {
    console.log('📋 Inicializando Three.js...');
    
    try {
        // 1. Crear escena
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000011);
        
        // 2. Crear cámara
        camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        camera.position.set(0, 0, 5);
        
        // 3. Crear renderizador
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        
        // Agregar al DOM
        const container = document.getElementById('canvas-container');
        if (container) {
            container.appendChild(renderer.domElement);
            console.log('✅ Canvas agregado al DOM');
        } else {
            console.error('❌ No se encontró el contenedor canvas-container');
            return;
        }
        
        // 4. Controles de órbita
        if (THREE.OrbitControls) {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            console.log('✅ Controles de órbita inicializados');
        } else {
            console.warn('⚠️ OrbitControls no disponible');
        }
        
        // 5. Luces
        setupLighting();
        
        // 6. Crear Tierra
        createEarth();
        
        // 7. Crear estrellas
        createStars();
        
        // 8. Event listeners
        setupEvents();
        
        // 9. Redimensionamiento
        window.addEventListener('resize', onWindowResize);
        
        console.log('🌟 Inicialización completa');
        
        // 10. Iniciar animación
        animate();
        
    } catch (error) {
        console.error('❌ Error en inicialización:', error);
        
        // Fallback: mostrar mensaje de error
        const container = document.getElementById('canvas-container');
        if (container) {
            container.innerHTML = `
                <div style="color: white; text-align: center; padding: 50px;">
                    <h2>❌ Error al cargar Three.js</h2>
                    <p>Por favor, verifica tu conexión a internet y recarga la página.</p>
                    <p>Error: ${error.message}</p>
                </div>
            `;
        }
    }
}

// ==========================================
// ILUMINACIÓN
// ==========================================

function setupLighting() {
    // Luz ambiente
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    // Luz direccional (Sol)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    console.log('💡 Luces configuradas');
}

// ==========================================
// CREAR LA TIERRA
// ==========================================

function createEarth() {
    // Grupo para rotación
    earthGroup = new THREE.Group();
    scene.add(earthGroup);
    
    // Geometría
    const geometry = new THREE.SphereGeometry(1, 64, 32);
    
    // Material básico con color
    const material = new THREE.MeshPhongMaterial({
        color: 0x2233ff,
        shininess: 30,
        specular: 0x111111
    });
    
    // Crear malla
    earth = new THREE.Mesh(geometry, material);
    earth.receiveShadow = true;
    earth.castShadow = true;
    
    earthGroup.add(earth);
    
    console.log('🌍 Tierra básica creada');
}

// ==========================================
// CAMPO DE ESTRELLAS
// ==========================================

function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 5000;
    
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
        const radius = 50 + Math.random() * 50;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.cos(phi);
        positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        sizeAttenuation: true
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    console.log('✨ Estrellas creadas');
}

// ==========================================
// SISTEMA DE CRÁTERES
// ==========================================

function addCrater() {
    if (!earthGroup) {
        console.warn('⚠️ Earth group no existe aún');
        return;
    }
    
    // Posición aleatoria
    const phi = Math.random() * Math.PI;
    const theta = Math.random() * 2 * Math.PI;
    const radius = 1.02;
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    // Geometría del cráter
    const craterGeometry = new THREE.SphereGeometry(0.05 * craterSize, 16, 16);
    const craterMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513,
        transparent: true,
        opacity: 0.8
    });
    
    const crater = new THREE.Mesh(craterGeometry, craterMaterial);
    crater.position.set(x, y, z);
    crater.lookAt(0, 0, 0);
    
    earthGroup.add(crater);
    craters.push(crater);
    
    updateCraterCount();
    
    console.log(`🌋 Cráter agregado: ${craters.length}`);
}

function clearCraters() {
    craters.forEach(crater => {
        earthGroup.remove(crater);
        crater.geometry.dispose();
        crater.material.dispose();
    });
    craters = [];
    updateCraterCount();
    console.log('🧹 Cráteres eliminados');
}

function updateCraterCount() {
    const countElement = document.getElementById('crater-count');
    if (countElement) {
        countElement.textContent = craters.length;
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEvents() {
    try {
        // Controles de UI
        const rotationSlider = document.getElementById('rotation-speed');
        if (rotationSlider) {
            rotationSlider.addEventListener('input', (e) => {
                rotationSpeed = parseFloat(e.target.value) * 0.01;
            });
        }
        
        const sizeSlider = document.getElementById('crater-size');
        if (sizeSlider) {
            sizeSlider.addEventListener('input', (e) => {
                craterSize = parseFloat(e.target.value);
            });
        }
        
        // Botones
        const addBtn = document.getElementById('add-crater');
        if (addBtn) {
            addBtn.addEventListener('click', addCrater);
        }
        
        const clearBtn = document.getElementById('clear-craters');
        if (clearBtn) {
            clearBtn.addEventListener('click', clearCraters);
        }
        
        const wireframeBtn = document.getElementById('toggle-wireframe');
        if (wireframeBtn) {
            wireframeBtn.addEventListener('click', () => {
                if (earth && earth.material) {
                    earth.material.wireframe = !earth.material.wireframe;
                }
            });
        }
        
        const animationBtn = document.getElementById('toggle-animation');
        if (animationBtn) {
            animationBtn.addEventListener('click', () => {
                isAnimating = !isAnimating;
                animationBtn.textContent = isAnimating ? 'Pausar' : 'Reanudar';
            });
        }
        
        // Teclado
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'c':
                    addCrater();
                    break;
                case 'x':
                    clearCraters();
                    break;
                case ' ':
                    e.preventDefault();
                    isAnimating = !isAnimating;
                    break;
                case 'w':
                    if (earth && earth.material) {
                        earth.material.wireframe = !earth.material.wireframe;
                    }
                    break;
            }
        });
        
        console.log('🎮 Event listeners configurados');
        
    } catch (error) {
        console.error('❌ Error configurando eventos:', error);
    }
}

// ==========================================
// ANIMACIÓN
// ==========================================

function animate() {
    requestAnimationFrame(animate);
    
    try {
        // Rotar la Tierra
        if (isAnimating && earthGroup) {
            earthGroup.rotation.y += rotationSpeed;
        }
        
        // Actualizar controles
        if (controls) {
            controls.update();
        }
        
        // Renderizar
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
        
    } catch (error) {
        console.error('❌ Error en animación:', error);
    }
}

// ==========================================
// REDIMENSIONAMIENTO
// ==========================================

function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// ==========================================
// INICIAR APLICACIÓN
// ==========================================

// Verificar que Three.js esté disponible
if (typeof THREE !== 'undefined') {
    console.log('✅ Three.js cargado correctamente');
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
} else {
    console.error('❌ Three.js no está disponible');
    
    // Mostrar error en la página
    document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('canvas-container');
        if (container) {
            container.innerHTML = `
                <div style="color: white; text-align: center; padding: 50px;">
                    <h2>❌ Three.js no se pudo cargar</h2>
                    <p>Verifica tu conexión a internet y recarga la página.</p>
                </div>
            `;
        }
    });
}