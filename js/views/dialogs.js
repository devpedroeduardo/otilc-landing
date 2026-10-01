import { $, setHash } from "../dom.js";
import { state } from "../state.js";

let lastFocus = null;

/** Guarda o elemento que abriu o painel para devolver o foco ao fechar. */
export function rememberFocus(el = document.activeElement) {
  lastFocus = el;
}

export const isDetailOpen = () => !$("#detail-layer").hidden;
export const isBagOpen = () => !$("#bag-layer").hidden;

/** @param {"detail"|"bag"} which */
export function showLayer(which) {
  $(`#${which}-layer`).hidden = false;
  document.body.style.overflow = "hidden";
  $(`#${which} .x`).focus();
}

export function closeAll() {
  const wasDetail = isDetailOpen();
  $("#detail-layer").hidden = true;
  $("#bag-layer").hidden = true;
  document.body.style.overflow = "";
  if (wasDetail) {
    state.currentNo = null;
    if (location.hash.startsWith("#peca-")) setHash("");
  }
  lastFocus?.focus?.();
}

/** Mantém o Tab dentro do painel aberto. @param {KeyboardEvent} e */
function trapFocus(e) {
  const layer = isDetailOpen() ? $("#detail") : isBagOpen() ? $("#bag") : null;
  if (!layer) return;
  const focusable = [
    ...layer.querySelectorAll('a[href],button:not([disabled]),textarea,select,input,[tabindex]:not([tabindex="-1"])'),
  ].filter((el) => el.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  } else if (!layer.contains(document.activeElement)) {
    e.preventDefault();
    first.focus();
  }
}

export function bindDialogs() {
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeAll();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") trapFocus(e);
    if (e.key === "Escape") closeAll();
    if (isDetailOpen() && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      const b = $(`#detail [data-step="${e.key === "ArrowRight" ? 1 : -1}"]`);
      if (b && !b.disabled) b.click();
    }
  });
}
