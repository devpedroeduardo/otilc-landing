import { readFile } from "node:fs/promises";
import { expect } from "@playwright/test";

const root = new URL("../../", import.meta.url);
export const DATA = JSON.parse(await readFile(new URL("data/products.json", root), "utf8"));
const CONFIG_SRC = await readFile(new URL("js/config.js", root), "utf8");

/** Abre a página e espera as peças carregarem. */
export async function openHome(page, path = "/") {
  await page.goto(path);
  await expect(page.locator("html")).toHaveAttribute("data-ready", "true");
}

/** Substitui o products.json servido, para testar estados (vendido, galeria...). */
export async function mockProducts(page, edit) {
  const data = structuredClone(DATA);
  edit(data.products);
  await page.route("**/data/products.json", (route) => route.fulfill({ json: data }));
}

/** Simula o contato configurado sem tocar no arquivo real. */
export async function mockContact(page, { whatsapp = "", instagram = "" }) {
  const body = CONFIG_SRC.replace(/whatsapp: ".*?"/, `whatsapp: "${whatsapp}"`).replace(
    /instagram: ".*?"/,
    `instagram: "${instagram}"`,
  );
  await page.route("**/js/config.js", (route) => route.fulfill({ body, contentType: "text/javascript" }));
}

/** Clica num card pelo número da peça. */
export const card = (page, no) => page.locator(`.card[data-no="${no}"]`);
