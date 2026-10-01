import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  conditionBars,
  escapeHTML,
  formatBRL,
  instagramLink,
  orderMessage,
  photoSrcset,
  photosOf,
  pieceFromHash,
  visibleProducts,
  whatsappLink,
} from "../../js/lib/catalog.js";

const P = (no, extra = {}) => ({
  no,
  cat: "tenis",
  name: `Peça ${no}`,
  brand: "Marca",
  price: 100,
  cond: 7,
  img: `p${no}`,
  ...extra,
});

describe("visibleProducts", () => {
  const list = [
    P("01", { price: 300, cond: 6 }),
    P("02", { price: 100, cond: 9, cat: "bones" }),
    P("03", { price: 200, cond: null, status: "vendido" }),
    P("04", { price: 50, cond: 8 }),
  ];
  const nos = (arr) => arr.map((p) => p.no);

  it("mantém a ordem do drop por padrão, com indisponíveis no fim", () => {
    assert.deepEqual(nos(visibleProducts(list)), ["01", "02", "04", "03"]);
  });

  it("filtra por categoria", () => {
    assert.deepEqual(nos(visibleProducts(list, { filter: "bones" })), ["02"]);
  });

  it("ordena por preço e por condição sem tirar as vendidas do fim", () => {
    assert.deepEqual(nos(visibleProducts(list, { sort: "price-asc" })), ["04", "02", "01", "03"]);
    assert.deepEqual(nos(visibleProducts(list, { sort: "price-desc" })), ["01", "02", "04", "03"]);
    assert.deepEqual(nos(visibleProducts(list, { sort: "cond" })), ["02", "04", "01", "03"]);
  });

  it("não altera a lista original", () => {
    const copy = structuredClone(list);
    visibleProducts(list, { sort: "price-asc" });
    assert.deepEqual(list, copy);
  });

  it("usa a ordem do drop quando a ordenação é desconhecida", () => {
    assert.deepEqual(nos(visibleProducts(list, { sort: "xyz" })), ["01", "02", "04", "03"]);
  });
});

describe("orderMessage", () => {
  it("lista as peças com tamanho e soma o total", () => {
    const msg = orderMessage([P("01", { price: 700, size: "42" }), P("05", { price: 1250 })], "00");
    assert.equal(
      msg,
      [
        "Olá! Vi a pré-venda da OTILC (Drop 00) e quero reservar:",
        "• Nº01 Peça 01 (Marca, tam 42): R$ 700",
        "• Nº05 Peça 05 (Marca): R$ 1.250",
        "Total: R$ 1.950",
      ].join("\n"),
    );
  });
});

describe("links de contato", () => {
  it("monta o link do WhatsApp só com dígitos e texto codificado", () => {
    assert.equal(
      whatsappLink("+55 (11) 99999-8888", "Olá & tchau"),
      "https://wa.me/5511999998888?text=Ol%C3%A1%20%26%20tchau",
    );
  });
  it("retorna null sem número", () => {
    assert.equal(whatsappLink("", "x"), null);
  });
  it("aceita Instagram com ou sem @", () => {
    assert.equal(instagramLink("@otilc"), "https://instagram.com/otilc");
    assert.equal(instagramLink("otilc"), "https://instagram.com/otilc");
    assert.equal(instagramLink(""), null);
  });
});

describe("utilidades", () => {
  it("escapa HTML", () => {
    assert.equal(
      escapeHTML(`<img src=x onerror="a('b')">&`),
      "&lt;img src=x onerror=&quot;a(&#39;b&#39;)&quot;&gt;&amp;",
    );
  });
  it("formata reais no padrão brasileiro", () => {
    assert.equal(formatBRL(1250), "1.250");
  });
  it("lê o número da peça do hash", () => {
    assert.equal(pieceFromHash("#peca-07"), "07");
    assert.equal(pieceFromHash("#pecas"), null);
    assert.equal(pieceFromHash(""), null);
  });
  it("desenha a régua de condição com meia barra", () => {
    assert.deepEqual(conditionBars(7.5), ["on", "on", "on", "on", "on", "on", "on", "half", "", ""]);
    assert.equal(conditionBars(10).filter((c) => c === "on").length, 10);
  });
  it("lista as fotos e o srcset responsivo", () => {
    assert.deepEqual(photosOf(P("01", { imgs: ["a", "b"] })), ["p01", "a", "b"]);
    assert.equal(photoSrcset("x"), "assets/img/w/x-400.webp 400w, assets/img/w/x-800.webp 800w");
  });
});
