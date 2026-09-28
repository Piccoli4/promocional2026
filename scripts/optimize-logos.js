// Convierte los escudos PNG de src/assets a WebP de 512px.
// En la app se muestran a 82px como mucho y en las imágenes para compartir
// a ~290px, así que 512px sobra incluso en pantallas de alta densidad.
// Uso: node scripts/optimize-logos.js Alianza.png Kimberley.png ...
import sharp from 'sharp';
import { statSync } from 'fs';

const files = process.argv.slice(2);
if (files.length === 0) {
    console.error('Pasá los nombres de los PNG de src/assets a convertir.');
    process.exit(1);
}

for (const file of files) {
    const src = `src/assets/${file}`;
    const dest = src.replace(/\.png$/i, '.webp');
    await sharp(src)
        .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85, alphaQuality: 90, effort: 6 })
        .toFile(dest);
    const kb = (p) => Math.round(statSync(p).size / 1024);
    console.log(`✓ ${file}: ${kb(src)} kB → ${kb(dest)} kB`);
}
