import { productListSchema } from "./lib/schema.js";
import { state } from "./state.js";

/** Insere o JSON-LD das peças no <head> (o Google lê dados estruturados gerados por JS). */
export function injectStructuredData() {
  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.id = "ld-products";
  s.textContent = JSON.stringify(productListSchema(state.products, location.origin + location.pathname));
  document.getElementById("ld-products")?.remove();
  document.head.append(s);
}
