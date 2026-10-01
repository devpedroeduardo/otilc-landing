/**
 * Troca o endereço público do site em todos os arquivos que precisam de URL absoluta
 * (canonical, Open Graph, JSON-LD, robots.txt, sitemap.xml, README).
 *
 * Uso: npm run site-url -- https://usuario.github.io/otilc-landing/
 *      npm run site-url -- https://otilc.com.br/
 */
import { readFile, writeFile } from "node:fs/promises";

const FILES = ["index.html", "robots.txt", "sitemap.xml", "README.md"];
const CONFIG = "site.config.json";

const arg = process.argv[2];
if (!arg || !/^https:\/\/[^\s/]+/.test(arg)) {
  console.error("Informe a URL completa, com https://. Ex.: npm run site-url -- https://otilc.com.br/");
  process.exit(1);
}
const next = arg.endsWith("/") ? arg : `${arg}/`;
const config = JSON.parse(await readFile(CONFIG, "utf8"));
const prev = config.url;

if (prev === next) {
  console.log(`O site já está configurado para ${next}`);
  process.exit(0);
}

for (const file of FILES) {
  const text = await readFile(file, "utf8");
  const updated = text.split(prev).join(next);
  if (updated !== text) {
    await writeFile(file, updated);
    console.log(`atualizado: ${file}`);
  }
}
await writeFile(CONFIG, `${JSON.stringify({ ...config, url: next }, null, 2)}\n`);
console.log(`URL do site: ${prev} → ${next}`);
