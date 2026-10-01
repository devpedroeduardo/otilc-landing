import { conditionBars, visibleProducts } from "../lib/catalog.js";
import { state } from "../state.js";

/** Lista na ordem e filtro atuais da grade. */
export const currentList = () => visibleProducts(state.products, state);

/** Régua de condição em barras. @param {number|null} c */
export function condHTML(c) {
  if (c == null) return `<span class="cond none">Sem nota</span>`;
  const bars = conditionBars(c)
    .map((cls) => `<i class="${cls}"></i>`)
    .join("");
  const v = String(c).replace(".", ",");
  return `<span class="cond" title="Condição ${v} de 10"><span class="bar" aria-hidden="true">${bars}</span>${v}<small>/10</small></span>`;
}
