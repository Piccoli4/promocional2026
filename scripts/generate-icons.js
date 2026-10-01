import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('public/icons', { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of sizes) {
    await sharp('src/assets/UyP.png')
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 85, alpha: 1 } })
        .toFile(`public/icons/icon-${size}x${size}.png`);
    console.log(`✓ icon-${size}x${size}.png`);
}

// Favicon de la pestaña: a 32px el escudo se ve nítido sin depender de que el
// navegador achique el de 192.
await sharp('src/assets/UyP.png')
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 85, alpha: 1 } })
    .toFile('public/icons/favicon-32x32.png');
console.log('✓ favicon-32x32.png');