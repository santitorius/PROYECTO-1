// Copia el HTML único (dist-single/index.html) a entrega/quovix-presentacion.html
import { copyFileSync, mkdirSync, statSync } from 'node:fs';

mkdirSync('entrega', { recursive: true });
copyFileSync('dist-single/index.html', 'entrega/quovix-presentacion.html');
const kb = Math.round(statSync('entrega/quovix-presentacion.html').size / 1024);
console.log(`✓ entrega/quovix-presentacion.html (${kb} KB): abre con doble clic, sin internet.`);
