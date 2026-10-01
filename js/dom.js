import { platformEvents } from "./lib/analytics.js";
import { state } from "./state.js";

/** @param {string} s @param {ParentNode} [root] @returns {HTMLElement} */
export const $ = (s, root = document) => root.querySelector(s);

/**
 * Envia um evento para GA4 e/ou Meta Pixel, se estiverem carregados (só depois do consentimento).
 * @param {string} event ver platformEvents em js/lib/analytics.js
 * @param {import("./lib/analytics.js").EventData} [data]
 */
export function track(event, data = {}) {
  if (!window.gtag && !window.fbq) return;
  try {
    const { ga4, meta } = platformEvents(event, { categories: state.categories, ...data });
    if (ga4 && window.gtag) window.gtag("event", ...ga4);
    if (meta && window.fbq) window.fbq(...meta);
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
