// Script de diagnóstico para verificar que los controles se carguen correctamente

console.log('🔍 DIAGNÓSTICO DE CONTROLES');
console.log('==========================');

// Verificar que los paneles existan
const controlsPanel = document.getElementById('controls-panel');
const infoPanel = document.getElementById('info-panel');

console.log('Controls Panel:', controlsPanel ? '✅ Encontrado' : '❌ No encontrado');
console.log('Info Panel:', infoPanel ? '✅ Encontrado' : '❌ No encontrado');

if (controlsPanel) {
    console.log('Controls Panel display:', window.getComputedStyle(controlsPanel).display);
    console.log('Controls Panel visibility:', window.getComputedStyle(controlsPanel).visibility);
}

if (infoPanel) {
    console.log('Info Panel display:', window.getComputedStyle(infoPanel).display);
    console.log('Info Panel visibility:', window.getComputedStyle(infoPanel).visibility);
}

// Verificar botones de control de tiempo
const buttons = {
    'play-pause-btn': 'Play/Pause',
    'reset-time-btn': 'Reset Time',
    'jump-to-date': 'Jump to Date',
    'jog-control': 'Jog Control',
    'time-speed-slider': 'Time Speed',
    'toggle-orbits-btn': 'Toggle Orbits',
    'focus-earth-btn': 'Focus Earth',
    'reset-camera-btn': 'Reset Camera',
    'load-verified-btn': 'Load Verified'
};

console.log('\n🎮 BOTONES Y CONTROLES:');
for (const [id, name] of Object.entries(buttons)) {
    const element = document.getElementById(id);
    console.log(`  ${name} (${id}):`, element ? '✅' : '❌');
}

// Verificar inputs
const inputs = {
    'date-picker': 'Date Picker',
    'current-date': 'Current Date Display',
    'time-speed': 'Time Speed Display',
    'jog-status': 'Jog Status'
};

console.log('\n📊 ELEMENTOS DE DISPLAY:');
for (const [id, name] of Object.entries(inputs)) {
    const element = document.getElementById(id);
    console.log(`  ${name} (${id}):`, element ? '✅' : '❌');
}

console.log('\n==========================');
