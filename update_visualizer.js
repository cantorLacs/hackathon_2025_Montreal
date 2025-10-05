const fs = require('fs');

// Leer JSON generado
const rawData = fs.readFileSync('top200_closest_asteroids_FINAL.json', 'utf8');
const cleanData = rawData.replace(/^\uFEFF/, '');
const data = JSON.parse(cleanData);

// Leer visualizador actual
const visualizer = fs.readFileSync('src/asteroid-visualizer.js', 'utf8');

// Encontrar el inicio y fin de loadVerifiedAsteroids
const startMarker = 'async loadVerifiedAsteroids() {';
const dataStartMarker = '// Datos embebidos de los asteroides';
const dataEndMarker = ']';
const consoleLogMarker = "console.log('📦 Datos cargados:', data);";

const startIdx = visualizer.indexOf(startMarker);
const dataStart = visualizer.indexOf(dataStartMarker, startIdx);
const consoleIdx = visualizer.indexOf(consoleLogMarker, startIdx);

if (startIdx === -1 || dataStart === -1 || consoleIdx === -1) {
    console.error('No se encontró la función loadVerifiedAsteroids');
    console.error('startIdx:', startIdx, 'dataStart:', dataStart, 'consoleIdx:', consoleIdx);
    process.exit(1);
}

// Generar nuevo código
const newDataSection = `// Datos de los ${data.asteroids.length} asteroides MÁS CERCANOS a la Tierra (1975-2025)
            // Fuente: ${data.metadata.source}
            // Precisión: ${data.metadata.precision}
            // Generado: ${data.metadata.date_generated}
            const data = {
                "metadata": ${JSON.stringify(data.metadata, null, 20)},
                "asteroids": ${JSON.stringify(data.asteroids, null, 20)}
            };
            
            console.log('📦 Datos cargados:', data);`;

// Reemplazar la sección de datos
const before = visualizer.substring(0, dataStart);
const after = visualizer.substring(consoleIdx);
const newContent = before + newDataSection + '\n            \n            ' + after;

// Guardar
fs.writeFileSync('src/asteroid-visualizer.js', newContent, 'utf8');

console.log('✓ Visualizador actualizado con 200 asteroides');
console.log(`✓ Archivo: src/asteroid-visualizer.js`);
console.log(`\nPrimeros 10 asteroides cargados:`);
data.asteroids.slice(0, 10).forEach((a, i) => {
    const km = a.close_approach_data[0].miss_distance.kilometers;
    const date = a.close_approach_data[0].close_approach_date;
    console.log(`  ${i+1}. ${a.name.padEnd(15)} - ${km.toString().padStart(6)} km (${date})`);
});
