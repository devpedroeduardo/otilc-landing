/**
 * Tradução dos eventos da vitrine para os nomes padrão de cada plataforma.
 * Funções puras (sem DOM), testadas em tests/unit.
 *
 * Eventos de e-commerce recomendados pelo GA4 aparecem prontos nos relatórios de monetização;
 * eventos padrão da Meta servem para otimizar campanhas e montar públicos — por isso nada de nomes próprios.
 *
 * @typedef {import("./catalog.js").Product} Product
 * @typedef {import("./catalog.js").Category} Category
 * @typedef {{ products?: Product[], categories?: Category[], method?: string, source?: string }} EventData
 * @typedef {{ ga4: [string, object] | null, meta: ["track" | "trackCustom", string, object] | null }} PlatformEvents
 */

import { categoryName } from "./catalog.js";

export const CURRENCY = "BRL";

/** @param {Product[]} products */
const sum = (products) => products.reduce((t, p) => t + p.price, 0);

/** Item no formato do GA4. @param {Product} p @param {Category[]} [categories] */
export function ga4Item(p, categories = []) {
  const item = { item_id: p.no, item_name: p.name, item_brand: p.brand, price: p.price, quantity: 1 };
  const cat = categoryName(categories, p.cat);
  if (cat) item.item_category = cat;
  if (p.size) item.item_variant = p.size;
  return item;
}

/** Parâmetros de conteúdo da Meta. @param {Product[]} products */
const metaContent = (products) => ({
  content_ids: products.map((p) => p.no),
  content_type: "product",
  contents: products.map((p) => ({ id: p.no, quantity: 1 })),
  value: sum(products),
  currency: CURRENCY,
});

/**
 * @param {string} event view_item · add_to_cart · remove_from_cart · begin_checkout · contact · share
 * @param {EventData} [data]
 * @returns {PlatformEvents}
 */
export function platformEvents(event, { products = [], categories = [], method, source } = {}) {
  const ecommerce = () => ({
    currency: CURRENCY,
    value: sum(products),
    items: products.map((p) => ga4Item(p, categories)),
  });
  const first = products[0];

  switch (event) {
    case "view_item":
      return {
        ga4: ["view_item", ecommerce()],
        meta: ["track", "ViewContent", { ...metaContent(products), content_name: first?.name }],
      };
    case "add_to_cart":
      return {
        ga4: ["add_to_cart", ecommerce()],
        meta: ["track", "AddToCart", { ...metaContent(products), content_name: first?.name }],
      };
    case "remove_from_cart":
      // a Meta não tem evento padrão de remoção
      return { ga4: ["remove_from_cart", ecommerce()], meta: ["trackCustom", "RemoveFromCart", metaContent(products)] };
    case "begin_checkout":
      // o "checkout" aqui é mandar a seleção no WhatsApp ou copiar a mensagem para o direct
      return {
        ga4: ["begin_checkout", { ...ecommerce(), method }],
        meta: ["track", "InitiateCheckout", { ...metaContent(products), num_items: products.length, method }],
      };
    case "contact":
      // dúvida pelo WhatsApp ou clique na lista de espera: contato, mas sem pedido
      return {
        ga4: ["generate_lead", { lead_source: source }],
        meta: source === "waitlist" ? ["track", "Lead", {}] : ["track", "Contact", { source }],
      };
    case "share":
      return {
        ga4: ["share", { method, content_type: "product", item_id: first?.no }],
        meta: ["trackCustom", "Share", { content_ids: first ? [first.no] : [], method }],
      };
    default:
      return { ga4: null, meta: null };
  }
}
