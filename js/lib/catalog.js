/**
 * Regras do catálogo. Funções puras (sem DOM), testadas em tests/unit.
 * @typedef {{ id: string, name: string }} Category
 * @typedef {{
 *   no: string, cat: string, name: string, brand: string, price: number,
 *   cond: number|null, img: string, size?: string, note?: string, feature?: boolean,
 *   status?: "reservado"|"vendido", imgs?: string[], measures?: string
 * }} Product
 */

export const STATUS_TXT = { reservado: "Reservado", vendido: "Vendido" };

/** @param {Product} p */
export const isAvailable = (p) => !p.status;

/** @param {Product} p */
export const statusText = (p) => STATUS_TXT[p.status] || p.status || "";

/** Versões geradas por scripts/optimize-images.js. */
export const PHOTO_WIDTHS = [400, 800];

/** @param {string} name @param {number} [w] */
export const photoSrc = (name, w = 800) => `assets/img/w/${name}-${w}.webp`;

/** @param {string} name */
export const photoSrcset = (name) => PHOTO_WIDTHS.map((w) => `${photoSrc(name, w)} ${w}w`).join(", ");

/** Foto original em JPG (dados estruturados e compartilhamento). @param {string} name */
export const photoOriginal = (name) => `assets/img/${name}.jpg`;

/** Nomes das fotos: principal seguida das extras. @param {Product} p */
export const photosOf = (p) => [p.img, ...(p.imgs || [])];

/** @param {number} n */
export const formatBRL = (n) => n.toLocaleString("pt-BR");

/** @param {Category[]} categories @param {string} id */
export const categoryName = (categories, id) => categories.find((c) => c.id === id)?.name || "";

/** @param {unknown} s */
export const escapeHTML = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const SORTS = {
  drop: (a, b) => a.no.localeCompare(b.no),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  cond: (a, b) => (b.cond ?? -1) - (a.cond ?? -1),
};

/**
 * Filtra e ordena. Peças vendidas/reservadas continuam visíveis (prova de que saem), mas vão para o fim.
 * @param {Product[]} products
 * @param {{ filter?: string, sort?: keyof typeof SORTS }} opts
 */
export function visibleProducts(products, { filter = "todas", sort = "drop" } = {}) {
  const by = SORTS[sort] || SORTS.drop;
  return products
    .filter((p) => filter === "todas" || p.cat === filter)
    .sort(by)
    .sort((a, b) => Number(isAvailable(b)) - Number(isAvailable(a)));
}

/** @param {Product[]} items */
export const totalOf = (items) => items.reduce((s, p) => s + p.price, 0);

/**
 * Texto do pedido enviado para a loja.
 * @param {Product[]} items
 * @param {string} drop
 */
export function orderMessage(items, drop = "00") {
  return [
    `Olá! Vi a pré-venda da OTILC (Drop ${drop}) e quero reservar:`,
    ...items.map(
      (p) => `• Nº${p.no} ${p.name} (${p.brand}${p.size ? `, tam ${p.size}` : ""}): R$ ${formatBRL(p.price)}`,
    ),
    `Total: R$ ${formatBRL(totalOf(items))}`,
  ].join("\n");
}

/**
 * Link do WhatsApp com mensagem pronta, ou null se não houver número.
 * @param {string} phone @param {string} text
 */
export function whatsappLink(phone, text = "") {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : null;
}

/** @param {string} handle */
export function instagramLink(handle) {
  const h = String(handle || "")
    .replace(/^@/, "")
    .trim();
  return h ? `https://instagram.com/${h}` : null;
}

/** Nº da peça a partir do hash (#peca-01), ou null. @param {string} hash */
export function pieceFromHash(hash) {
  const m = /^#peca-(\d+)$/.exec(hash || "");
  return m ? m[1] : null;
}

/** Nota de condição como barras de 0 a 10 ("on", "half" ou ""). @param {number} c */
export function conditionBars(c) {
  return Array.from({ length: 10 }, (_, k) => (c >= k + 1 ? "on" : c >= k + 0.5 ? "half" : ""));
}
