/**
 * Gera versões WebP responsivas das fotos das peças.
 * Fonte: assets/img/*.jpg (originais, mantidos no repositório)
 * Saída: assets/img/w/<nome>-400.webp e <nome>-800.webp
 *
 * Uso: npm run images   (só regenera o que mudou; --force refaz tudo)
 */
import { readdir, stat, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const WIDTHS = [400, 800];
const SRC = "assets/img";
const OUT = path.join(SRC, "w");
const force = process.argv.includes("--force");

const mtime = (f) =>
  stat(f).then(
    (s) => s.mtimeMs,
    () => 0,
  );

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => /\.jpe?g$/i.test(f));
let made = 0;
let before = 0;
let after = 0;

for (const file of files) {
  const input = path.join(SRC, file);
  const name = path.parse(file).name;
  const srcTime = await mtime(input);
  before += (await stat(input)).size;
  for (const w of WIDTHS) {
    const output = path.join(OUT, `${name}-${w}.webp`);
    if (force || (await mtime(output)) < srcTime) {
      await sharp(input)
        .rotate()
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 78, effort: 6 })
        .toFile(output);
      made++;
    }
    if (w === 800) after += (await stat(output)).size;
  }
}

const kb = (n) => `${Math.round(n / 1024)} KB`;
console.log(`${made} imagens geradas. Fotos grandes: ${kb(before)} (JPG) → ${kb(after)} (WebP 800px).`);
