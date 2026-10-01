/**
 * Lighthouse local, usando o Chromium do Playwright (útil no Windows, onde o lançador do LHCI
 * às vezes não consegue abrir o Chrome). No CI, o workflow usa `lhci autorun`.
 *
 * Uso: npm run dev (em outro terminal) e depois npm run lighthouse:local [url]
 */
import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";

const PORT = 9333;
const urls = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["http://localhost:8080/", "http://localhost:8080/privacidade.html"];

const browser = await chromium.launch({ args: [`--remote-debugging-port=${PORT}`] });
const pct = (n) => String(Math.round(n * 100)).padStart(3);

for (const [label, preset] of [
  ["mobile ", undefined],
  ["desktop", "desktop"],
]) {
  for (const url of urls) {
    const config = preset ? (await import("lighthouse/core/config/desktop-config.js")).default : undefined;
    const { lhr } = await lighthouse(url, { port: PORT, output: "json", logLevel: "error" }, config);
    const c = lhr.categories;
    console.log(
      `${label}  perf ${pct(c.performance.score)} · a11y ${pct(c.accessibility.score)} · boas práticas ${pct(c["best-practices"].score)} · SEO ${pct(c.seo.score)}  ${url}`,
    );
    const failing = Object.values(lhr.audits).filter(
      (a) =>
        a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== "informative" && a.scoreDisplayMode !== "manual",
    );
    for (const a of failing)
      console.log(`         ↳ ${a.id}: ${a.title}${a.displayValue ? ` (${a.displayValue})` : ""}`);
  }
}
await browser.close();
