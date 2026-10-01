import { STORE_KEY } from "./config.js";
import { isAvailable } from "./lib/catalog.js";

/** Estado da página. Os módulos leem daqui e avisam mudanças com emit(). */
export const state = {
  drop: "00",
  /** @type {import("./lib/catalog.js").Category[]} */
  categories: [],
  /** @type {import("./lib/catalog.js").Product[]} */
  products: [],
  /** @type {Set<string>} */
  selection: new Set(),
  filter: "todas",
  sort: "drop",
  /** @type {string|null} peça aberta no painel de detalhe */
  currentNo: null,
};

const listeners = new Set();
/** @param {(reason: string) => void} fn */
export const subscribe = (fn) => listeners.add(fn);
/** @param {string} reason */
export const emit = (reason) => listeners.forEach((fn) => fn(reason));

/** @param {string} no */
export const findProduct = (no) => state.products.find((p) => p.no === no);

export const selectedProducts = () => state.products.filter((p) => state.selection.has(p.no));

export function loadSelection() {
  try {
    const arr = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    state.selection = new Set(arr.filter((no) => state.products.some((p) => p.no === no && isAvailable(p))));
  } catch {
    state.selection = new Set();
  }
}

export function saveSelection() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify([...state.selection]));
  } catch {
    /* modo privado ou armazenamento bloqueado: a seleção vale só nesta visita */
  }
}
