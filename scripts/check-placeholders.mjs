// Fails the launch build while any unconfirmed content remains.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

const pattern = /verified"?: false|<Notice\b/g;
const found = walk('src')
  .filter((f) => !f.endsWith('Notice.astro'))
  .map((f) => [f, (readFileSync(f, 'utf8').match(pattern) ?? []).length])
  .filter(([, n]) => n);

if (found.length) {
  console.error('Not ready to launch. Unconfirmed content remains:');
  found.forEach(([f, n]) => console.error(`  ${n}  ${f}`));
  process.exit(1);
}
console.log('No placeholders remain.');
