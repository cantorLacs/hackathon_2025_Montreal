const fs = require('fs');

console.log('='.repeat(70));
console.log('VERIFICACIÓN DE ASTEROIDES CARGADOS');
console.log('='.repeat(70));

// Leer JSON final
const rawData = fs.readFileSync('top200_closest_asteroids_FINAL.json', 'utf8');
const cleanData = rawData.replace(/^\uFEFF/, '');
const data = JSON.parse(cleanData);

console.log('\n📊 ESTADÍSTICAS:');
console.log(`   Total de asteroides: ${data.asteroids.length}`);
console.log(`   Fuente: ${data.metadata.source}`);
console.log(`   Precisión: ${data.metadata.precision}`);
console.log(`   Generado: ${data.metadata.date_generated}`);

console.log('\n🎯 TOP 20 ASTEROIDES MÁS CERCANOS:\n');
console.log('   #  | Nombre            | Distancia  | Fecha       | Velocidad   | Clase');
console.log('   ' + '-'.repeat(75));

data.asteroids.slice(0, 20).forEach((a, i) => {
    const num = (i + 1).toString().padStart(3);
    const name = a.name.padEnd(17);
    const dist = a.close_approach_data[0].miss_distance.kilometers.toString().padStart(8) + ' km';
    const date = a.close_approach_data[0].close_approach_date;
    const vel = a.close_approach_data[0].relative_velocity.kilometers_per_hour.padStart(8) + ' km/h';
    const orbitClass = a.orbital_data.orbit_class.orbit_class_type;
    
    console.log(`   ${num} | ${name} | ${dist} | ${date} | ${vel} | ${orbitClass}`);
});

console.log('\n🔍 VERIFICACIÓN DE PRECISIÓN:');
console.log('\nElementos orbitales del #1 (2020 VT4):');
const asteroid = data.asteroids[0];
console.log(`   Excentricidad: ${asteroid.orbital_data.eccentricity} (${asteroid.orbital_data.eccentricity.length} caracteres)`);
console.log(`   Semi-eje mayor: ${asteroid.orbital_data.semi_major_axis} AU`);
console.log(`   Inclinación: ${asteroid.orbital_data.inclination}°`);
console.log(`   Longitud nodo: ${asteroid.orbital_data.ascending_node_longitude}°`);
console.log(`   Arg. perihelio: ${asteroid.orbital_data.perihelion_argument}°`);
console.log(`   Anomalía media: ${asteroid.orbital_data.mean_anomaly}°`);
console.log(`   Época: ${asteroid.orbital_data.epoch_osculation} JD`);

console.log('\n📏 RANGO DE DISTANCIAS:');
const distances = data.asteroids.map(a => parseInt(a.close_approach_data[0].miss_distance.kilometers));
const min = Math.min(...distances);
const max = Math.max(...distances);
const avg = Math.round(distances.reduce((a, b) => a + b, 0) / distances.length);

console.log(`   Mínima: ${min.toLocaleString()} km (${(min / 6371).toFixed(2)} radios terrestres)`);
console.log(`   Máxima: ${max.toLocaleString()} km (${(max / 6371).toFixed(2)} radios terrestres)`);
console.log(`   Promedio: ${avg.toLocaleString()} km (${(avg / 6371).toFixed(2)} radios terrestres)`);
console.log(`   Distancia Tierra-Luna: 384,400 km (para referencia)`);

console.log('\n⚠️  ASTEROIDES DENTRO DE 10,000 KM:');
const veryClose = data.asteroids.filter(a => parseInt(a.close_approach_data[0].miss_distance.kilometers) < 10000);
console.log(`   Total: ${veryClose.length} asteroides`);
veryClose.slice(0, 10).forEach(a => {
    console.log(`   - ${a.name}: ${a.close_approach_data[0].miss_distance.kilometers} km (${a.close_approach_data[0].close_approach_date})`);
});

console.log('\n📅 DISTRIBUCIÓN POR AÑO:');
const years = {};
data.asteroids.forEach(a => {
    const year = a.close_approach_data[0].close_approach_date.substring(0, 4);
    years[year] = (years[year] || 0) + 1;
});

Object.keys(years).sort().forEach(year => {
    const bar = '█'.repeat(Math.round(years[year] / 2));
    console.log(`   ${year}: ${years[year].toString().padStart(3)} ${bar}`);
});

console.log('\n' + '='.repeat(70));
console.log('✅ VERIFICACIÓN COMPLETADA');
console.log('='.repeat(70));
