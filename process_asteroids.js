const fs = require('fs');

// Leer sin BOM
const rawData = fs.readFileSync('step2_orbital_elements.json', 'utf8');
const cleanData = rawData.replace(/^\uFEFF/, ''); // Remover BOM
const data = JSON.parse(cleanData);

const asteroids = data.map(ast => {
  // Convertir fecha
  const match = ast.date.match(/(\d{4})-(\w{3})-(\d{2}) (\d{2}):(\d{2})/);
  if (!match) return null;
  
  const months = {Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12'};
  const isoDate = `${match[1]}-${months[match[2]]}-${match[3]}T${match[4]}:${match[5]}:00.000Z`;
  const shortDate = `${match[1]}-${months[match[2]]}-${match[3]}`;
  
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
    description: `Los ${asteroids.length} asteroides MAS CERCANOS a la Tierra (1975-2025)`,
    precision: 'MAXIMA - Elementos orbitales REALES de SBDB',
    date_generated: new Date().toISOString()
  },
  asteroids: asteroids
};

fs.writeFileSync('top200_closest_asteroids_FINAL.json', JSON.stringify(output, null, 2), 'utf8');
console.log('OK: JSON final generado');
console.log('Total: ' + asteroids.length + ' asteroides');
console.log('#1: ' + asteroids[0].name + ' - ' + asteroids[0].close_approach_data[0].miss_distance.kilometers + ' km');
console.log('\nPrimeros 5 asteroides:');
asteroids.slice(0, 5).forEach((a, i) => {
  console.log(`  ${i+1}. ${a.name} - ${a.close_approach_data[0].miss_distance.kilometers} km (${a.close_approach_data[0].close_approach_date})`);
});
