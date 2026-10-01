import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ga4Item, platformEvents } from "../../js/lib/analytics.js";

const categories = [{ id: "tenis", name: "Tênis" }];
const jordan = {
  no: "01",
  cat: "tenis",
  name: "Air Jordan 3",
  brand: "Nike",
  size: "42",
  price: 700,
  cond: 6,
  img: "j",
};
const bone = { no: "09", cat: "bones", name: "Boné", brand: "New Era", price: 150, cond: 9, img: "b" };

describe("ga4Item", () => {
  it("usa o nome da categoria e o tamanho como variante", () => {
    assert.deepEqual(ga4Item(jordan, categories), {
      item_id: "01",
      item_name: "Air Jordan 3",
      item_brand: "Nike",
      price: 700,
      quantity: 1,
      item_category: "Tênis",
      item_variant: "42",
    });
  });

  it("omite categoria desconhecida e tamanho ausente", () => {
    const item = ga4Item(bone, categories);
    assert.equal("item_category" in item, false);
    assert.equal("item_variant" in item, false);
  });
});

describe("platformEvents", () => {
  it("view_item vira view_item no GA4 e ViewContent na Meta", () => {
    const { ga4, meta } = platformEvents("view_item", { products: [jordan], categories });
    assert.equal(ga4[0], "view_item");
    assert.equal(ga4[1].currency, "BRL");
    assert.equal(ga4[1].value, 700);
    assert.equal(ga4[1].items[0].item_id, "01");
    assert.deepEqual(meta.slice(0, 2), ["track", "ViewContent"]);
    assert.deepEqual(meta[2].content_ids, ["01"]);
    assert.equal(meta[2].content_name, "Air Jordan 3");
  });

  it("adicionar à seleção usa os eventos padrão de carrinho", () => {
    const { ga4, meta } = platformEvents("add_to_cart", { products: [jordan] });
    assert.equal(ga4[0], "add_to_cart");
    assert.deepEqual(meta.slice(0, 2), ["track", "AddToCart"]);
  });

  it("remoção é evento personalizado na Meta (não existe padrão)", () => {
    const { ga4, meta } = platformEvents("remove_from_cart", { products: [jordan] });
    assert.equal(ga4[0], "remove_from_cart");
    assert.deepEqual(meta.slice(0, 2), ["trackCustom", "RemoveFromCart"]);
  });

  it("begin_checkout soma a seleção e informa o canal", () => {
    const { ga4, meta } = platformEvents("begin_checkout", { products: [jordan, bone], method: "whatsapp" });
    assert.equal(ga4[0], "begin_checkout");
    assert.equal(ga4[1].value, 850);
    assert.equal(ga4[1].items.length, 2);
    assert.equal(ga4[1].method, "whatsapp");
    assert.deepEqual(meta.slice(0, 2), ["track", "InitiateCheckout"]);
    assert.equal(meta[2].num_items, 2);
    assert.equal(meta[2].value, 850);
    assert.deepEqual(meta[2].content_ids, ["01", "09"]);
  });

  it("contato: lista de espera é Lead, dúvida no WhatsApp é Contact", () => {
    const wait = platformEvents("contact", { source: "waitlist" });
    assert.deepEqual(wait.ga4, ["generate_lead", { lead_source: "waitlist" }]);
    assert.deepEqual(wait.meta.slice(0, 2), ["track", "Lead"]);
    const wa = platformEvents("contact", { source: "whatsapp" });
    assert.deepEqual(wa.meta.slice(0, 2), ["track", "Contact"]);
  });

  it("share leva a peça e o método", () => {
    const { ga4, meta } = platformEvents("share", { products: [jordan], method: "native" });
    assert.deepEqual(ga4, ["share", { method: "native", content_type: "product", item_id: "01" }]);
    assert.deepEqual(meta, ["trackCustom", "Share", { content_ids: ["01"], method: "native" }]);
  });

  it("evento desconhecido não envia nada", () => {
    assert.deepEqual(platformEvents("qualquer"), { ga4: null, meta: null });
  });
});
