// Builds the hero background (public/hero/hero-sky.webp) from Images/image.png:
// run `npm run hero` after replacing it.
import sharp from 'sharp';

const source = 'Images/image.png';

await sharp(source).webp({ quality: 82 }).toFile('public/hero/hero-sky.webp');

const { data, info } = await sharp(source).removeAlpha().raw().toBuffer({ resolveWithObject: true });

// Colour of the top edge, used behind the photo on portrait screens
const sum = [0, 0, 0];
for (let i = 0; i < info.width * 4 * 3; i += 3) for (let c = 0; c < 3; c++) sum[c] += data[i + c];
const hex = sum.map((v) => Math.round(v / (info.width * 4)).toString(16).padStart(2, '0')).join('');
console.log(`Top sky colour: #${hex}`);
