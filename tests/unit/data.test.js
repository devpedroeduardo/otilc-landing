import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { productListSchema } from "../../js/lib/schema.js";
import { PHOTO_WIDTHS, photoOriginal, photoSrc } from "../../js/lib/catalog.js";

const data = JSON.parse(await readFile(new URL("../../data/products.json", import.meta.url), "utf8"));
const exists = (p) =>
  access(new URL(`../../${p}`, import.meta.url)).then(
    () => true,
    () => false,
  );

/** Valida o arquivo de dados: um erro de digitação aqui quebraria a vitrine em produção. */
describe("data/products.json", () => {
  const cats = new Set(data.categories.map((c) => c.id));

  it("tem números de peça únicos", () => {
    const nos = data.products.map((p) => p.no);
    assert.equal(new Set(nos).size, nos.length);
  });

  it("cada peça tem campos obrigatórios válidos", () => {
    for (const p of data.products) {
      assert.match(p.no, /^\d{2,}$/, `no inválido: ${p.no}`);
      assert.ok(cats.has(p.cat), `categoria desconhecida em ${p.no}: ${p.cat}`);
      assert.ok(p.name && p.brand && p.img, `nome/marca/foto faltando em ${p.no}`);
      assert.ok(Number.isFinite(p.price) && p.price > 0, `preço inválido em ${p.no}`);
      assert.ok(p.cond === null || (p.cond >= 0 && p.cond <= 10), `condição fora de 0–10 em ${p.no}`);
      assert.ok(!p.status || ["reservado", "vendido"].includes(p.status), `status inválido em ${p.no}`);
    }
  });

  it("toda foto citada existe (original e versões WebP)", async () => {
    for (const p of data.products) {
      for (const name of [p.img, ...(p.imgs || [])]) {
        assert.ok(await exists(photoOriginal(name)), `falta ${photoOriginal(name)}`);
        for (const w of PHOTO_WIDTHS) {
          assert.ok(await exists(photoSrc(name, w)), `falta ${photoSrc(name, w)} — rode npm run images`);
        }
      }
    }
  });

  it("gera dados estruturados válidos", () => {
    const ld = productListSchema(data.products, "https://exemplo.com.br/");
    assert.equal(ld.itemListElement.length, data.products.length);
    const first = ld.itemListElement[0].item;
    assert.equal(first["@type"], "Product");
    assert.equal(first.offers.priceCurrency, "BRL");
    assert.match(first.image[0], /^https:\/\/exemplo\.com\.br\/assets\/img\/.+\.jpg$/);
  });
});
