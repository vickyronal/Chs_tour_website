// Builds web-ready destination photos from Images/: run `npm run photos` after replacing one.
import sharp from 'sharp';

const photos = {
  bali: 'Images/bali.png',
  maldives: 'Images/maldives.png',
  philippines: 'Images/philippines.png',
  'sri-lanka': 'Images/sri lanka.png',
};

// "Who's travelling?" cards
const tripPhotos = { honeymoon: 'Images/Honymoon.jpg', family: 'Images/Family.jpg', group: 'Images/Group.jpg' };
for (const [slug, source] of Object.entries(tripPhotos)) {
  const { size } = await sharp(source)
    .resize({ width: slug === 'honeymoon' ? 1024 : 1280, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(`public/trips/${slug}.webp`);
  console.log(`trips/${slug}.webp ${Math.round(size / 1024)} KB`);
}

for (const [slug, source] of Object.entries(photos)) {
  for (const width of [640, 1024]) {
    const { size } = await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(`public/destinations/${slug}-${width}.webp`);
    console.log(`${slug}-${width}.webp ${Math.round(size / 1024)} KB`);
  }
}
