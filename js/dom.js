/** @param {string} s @param {ParentNode} [root] @returns {HTMLElement} */
export const $ = (s, root = document) => root.querySelector(s);

/** Envia um evento para GA4 e/ou Meta Pixel, se estiverem instalados. */
export function track(name, params = {}) {
  try {
    if (window.gtag) window.gtag("event", name, params);
    if (window.fbq) window.fbq("trackCustom", name, params);
  } catch {
    /* métricas nunca podem quebrar a página */
  }
}

let toastTimer;
/** Aviso curto no topo da tela. @param {string} text */
export function toast(text) {
  const t = $("#toast");
  t.textContent = text;
  t.hidden = false;
  t.style.animation = "none";
  void t.offsetWidth;
  t.style.animation = "";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 2200);
}

/** Link absoluto de uma peça. @param {string} no */
export const pieceUrl = (no) => `${location.origin}${location.pathname}#peca-${no}`;

/** Troca o hash sem criar entrada no histórico. @param {string} h */
export function setHash(h) {
  try {
    history.replaceState(null, "", h ? `#${h}` : location.pathname + location.search);
  } catch {
    /* ignorado */
  }
}
