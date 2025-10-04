// ==========================================
// 🌍 CONFIGURACIÓN DE TEXTURAS
// ==========================================

const TEXTURE_URLS = {
    // Texturas de la Tierra (usando texturas públicas de la NASA)
    earthDay: 'https://unpkg.com/three-globe/example/img/earth-day.jpg',
    earthNight: 'https://unpkg.com/three-globe/example/img/earth-night.jpg', 
    earthClouds: 'https://unpkg.com/three-globe/example/img/earth-water.png',
    
    // Texturas alternativas (más simples pero funcionales)
    earthSimple: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDUxMiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iMjU2IiBmaWxsPSIjMDA2NmNjIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMzAiIGZpbGw9IiMwMGFhMDAiLz4KPGNpcmNsZSBjeD0iMjAwIiBjeT0iMTUwIiByPSI0MCIgZmlsbD0iIzAwYWEwMCIvPgo8Y2lyY2xlIGN4PSIzNTAiIGN5PSI4MCIgcj0iMjUiIGZpbGw9IiMwMGFhMDAiLz4KPGNpcmNsZSBjeD0iNDAwIiBjeT0iMTgwIiByPSIzNSIgZmlsbD0iIzAwYWEwMCIvPgo8L3N2Zz4=',
    
    // Mapa de normales para relieve
    earthBump: 'https://unpkg.com/three-globe/example/img/earth-topology.png'
};

// Función para cargar texturas con manejo de errores
function loadTexture(url, loader, fallbackColor = 0x0066cc) {
    return new Promise((resolve) => {
        loader.load(
            url,
            (texture) => {
                console.log(`✅ Textura cargada: ${url}`);
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                resolve(texture);
            },
            (progress) => {
                console.log(`📥 Cargando textura... ${(progress.loaded / progress.total * 100)}%`);
            },
            (error) => {
                console.warn(`⚠️ Error cargando textura ${url}, usando color fallback`);
                // Crear una textura simple de color
                const canvas = document.createElement('canvas');
                canvas.width = canvas.height = 1;
                const context = canvas.getContext('2d');
                context.fillStyle = `#${fallbackColor.toString(16).padStart(6, '0')}`;
                context.fillRect(0, 0, 1, 1);
                const texture = new THREE.CanvasTexture(canvas);
                resolve(texture);
            }
        );
    });
}