import { CONTACT } from "../config.js";
import {
  categoryName,
  escapeHTML as esc,
  formatBRL,
  isAvailable,
  photoSrc,
  photosOf,
  pieceFromHash,
  statusText,
} from "../lib/catalog.js";
import { state, findProduct } from "../state.js";
import { $, pieceUrl, setHash, toast, track } from "../dom.js";
import { toggleSelection } from "../actions.js";
import { condHTML, currentList } from "./shared.js";
import { closeAll, isDetailOpen, rememberFocus, showLayer } from "./dialogs.js";
import { openBag } from "./bag.js";

/** @param {string} no */
export function renderDetail(no) {
  const p = findProduct(no);
  if (!p) return;
  state.currentNo = no;
  const list = currentList();
  const i = list.findIndex((x) => x.no === no);
  const on = state.selection.has(no);
  const free = isAvailable(p);
  const photos = photosOf(p);
  const alt = `${esc(p.name)} — ${esc(p.brand)}`;
  const sizeTxt = p.size
    ? esc(p.size)
    : CONTACT.whatsapp
      ? `<a href="#" data-wa="Olá! Qual o tamanho da peça Nº${p.no} ${esc(p.name)} da pré-venda OTILC?">Consultar</a>`
      : "Consultar";

  $("#detail").innerHTML = `
    <button class="x" type="button" data-close aria-label="Fechar">✕</button>
    <div class="pic">
      <div class="main"><img id="d-photo" src="${photoSrc(photos[0])}" alt="${alt}, foto 1 de ${photos.length}"></div>
      ${
        photos.length > 1
          ? `<div class="thumbs" role="group" aria-label="Fotos da peça">${photos
              .map(
                (name, k) =>
                  `<button type="button" data-photo="${k}" aria-label="Foto ${k + 1} de ${photos.length}" aria-current="${k === 0}"><img src="${photoSrc(name, 400)}" alt="" width="56" height="70" loading="lazy"></button>`,
              )
              .join("")}</div>`
          : ""
      }
    </div>
    <div class="info">
      <span class="label">Nº${p.no} · ${esc(categoryName(state.categories, p.cat))}</span>
      <h2 id="d-title">${esc(p.name)}</h2>
      ${free ? "" : `<span class="status-line">${esc(statusText(p))}</span>`}
      ${p.note ? `<span class="note">${esc(p.note)}</span>` : ""}
      <div class="specs">
        <div><span class="label">Marca</span><b>${esc(p.brand)}</b></div>
        <div><span class="label">Tamanho</span><b>${sizeTxt}</b></div>
        <div><span class="label">Condição</span>${condHTML(p.cond)}</div>
        <div><span class="label">Estoque</span><b>${free ? "1 unidade" : esc(statusText(p))}</b></div>
        ${p.measures ? `<div class="wide"><span class="label">Medidas</span><b>${esc(p.measures)}</b></div>` : ""}
      </div>
      <span class="price"><small>R$</small>${formatBRL(p.price)}</span>
      <div class="actions">
        ${
          free
            ? `<button class="btn ${on ? "btn-ghost" : "btn-solid"}" type="button" data-toggle="${p.no}">${on ? "Remover da seleção" : "Adicionar à seleção"}</button>
               ${on ? `<button class="btn btn-solid" type="button" data-bag>Ver seleção <span class="arr" aria-hidden="true">→</span></button>` : ""}`
            : `<button class="btn btn-solid" type="button" disabled>${p.status === "reservado" ? "Peça reservada" : "Peça vendida"}</button>`
        }
      </div>
      <button class="share" type="button" data-share>Compartilhar esta peça ↗</button>
      <div class="nav">
        <button type="button" data-step="-1" ${i <= 0 ? "disabled" : ""}>← Anterior</button>
        <button type="button" data-step="1" ${i >= list.length - 1 ? "disabled" : ""}>Próxima →</button>
      </div>
    </div>`;
}

/** @param {string} no @param {Element} [from] */
export function openDetail(no, from) {
  const p = findProduct(no);
  if (!p) return;
  rememberFocus(from);
  renderDetail(no);
  setHash(`peca-${no}`);
  showLayer("detail");
  track("view_item", { item_id: p.no, item_name: p.name, value: p.price, currency: "BRL" });
}

/** Abre (ou fecha) o painel conforme o hash #peca-NN. */
export function syncWithHash() {
  const no = pieceFromHash(location.hash);
  if (no && findProduct(no)) {
    if (state.currentNo !== no || !isDetailOpen()) openDetail(no);
  } else if (isDetailOpen()) {
    closeAll();
  }
}

/** @param {string} no */
async function sharePiece(no) {
  const p = findProduct(no);
  const url = pieceUrl(no);
  track("share", { item_id: no });
  if (navigator.share) {
    try {
      await navigator.share({
        title: `OTILC · ${p.name}`,
        text: `${p.name} (${p.brand}) por R$ ${formatBRL(p.price)} na pré-venda OTILC`,
        url,
      });
      return;
    } catch (err) {
      if (err?.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    toast("Link da peça copiado");
  } catch {
    window.prompt("Copie o link da peça:", url);
  }
}

/** @param {HTMLElement} btn */
function showPhoto(btn) {
  const photos = photosOf(findProduct(state.currentNo));
  const k = Number(btn.dataset.photo);
  const img = $("#d-photo");
  img.src = photoSrc(photos[k]);
  img.alt = img.alt.replace(/foto \d+ de/, `foto ${k + 1} de`);
  $("#detail")
    .querySelectorAll("[data-photo]")
    .forEach((b) => b.setAttribute("aria-current", String(b === btn)));
}

export function bindDetail() {
  $("#detail").addEventListener("click", (e) => {
    const t = e.target.closest("[data-toggle]");
    if (t) return toggleSelection(t.dataset.toggle);
    if (e.target.closest("[data-bag]")) {
      closeAll();
      return openBag();
    }
    if (e.target.closest("[data-share]")) return sharePiece(state.currentNo);
    const ph = e.target.closest("[data-photo]");
    if (ph) return showPhoto(ph);
    const s = e.target.closest("[data-step]");
    if (s && !s.disabled) {
      const list = currentList();
      const next = list[list.findIndex((x) => x.no === state.currentNo) + Number(s.dataset.step)];
      if (next) {
        renderDetail(next.no);
        setHash(`peca-${next.no}`);
      }
    }
  });
  window.addEventListener("hashchange", syncWithHash);
}
