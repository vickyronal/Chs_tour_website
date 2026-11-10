// Builds the logo files from Logo/Chs_logo.png: run `npm run brand` after replacing it.
import sharp from 'sharp';

const source = 'Logo/Chs_logo.png';
const ink = '#14171c';

// The logo, with its empty margin trimmed so sizing is predictable
await sharp(source).trim().png({ compressionLevel: 9 }).toFile('public/brand/logo.png');

// Tab icon: the H and swoosh on a dark rounded square
const mark = await sharp(source).extract({ left: 188, top: 34, width: 134, height: 148 }).png().toBuffer();
const icon = async (size, file) => {
  const inset = Math.round(size * 0.74);
  const art = await sharp(mark).resize({ height: inset }).toBuffer();
  const tile = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${size * 0.2}" fill="${ink}"/></svg>`,
  );
  await sharp(tile).composite([{ input: art, gravity: 'center' }]).png().toFile(file);
};
await icon(96, 'public/brand/favicon.png');
await icon(180, 'public/brand/apple-touch-icon.png');

const { width, height } = await sharp('public/brand/logo.png').metadata();
console.log(`logo.png ${width}×${height}`);
