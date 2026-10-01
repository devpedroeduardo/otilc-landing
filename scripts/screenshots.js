/**
 * Gera as imagens do README em docs/ a partir do site rodando localmente.
 * Uso: npm run dev (em outro terminal) e depois npm run screenshots
 */
import { mkdir } from "node:fs/promises";
import { chromium, devices } from "@playwright/test";
import sharp from "sharp";

const BASE = process.env.BASE_URL || "http://localhost:8080";
const OUT = "docs";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

async function shot(name, { device, path = "/", prepare } = {}) {
  const ctx = await browser.newContext(device ? { ...devices[device] } : { viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(BASE + path);
  await page.locator("html[data-ready='true']").waitFor();
  await page.addStyleTag({ content: "body::after{display:none}" }); // tira o grão para a imagem comprimir melhor
  if (prepare) await prepare(page);
  await page.waitForLoadState("networkidle");
  const png = await page.screenshot();
  await sharp(png).webp({ quality: 82 }).toFile(`${OUT}/${name}.webp`);
  console.log(`docs/${name}.webp`);
  await ctx.close();
}

await shot("desktop-hero");
await shot("desktop-pecas", {
  prepare: (page) => page.locator("#pecas").evaluate((el) => el.scrollIntoView()),
});
await shot("desktop-peca", { path: "/#peca-01" });
await shot("desktop-selecao", {
  prepare: async (page) => {
    await page.locator('.card[data-no="01"] [data-toggle]').click();
    await page.locator('.card[data-no="04"] [data-toggle]').click();
    await page.locator("#open-bag").click();
    await page.waitForTimeout(500);
  },
});
await shot("mobile-hero", { device: "iPhone 13" });
await shot("mobile-peca", { device: "iPhone 13", path: "/#peca-04" });

await browser.close();
