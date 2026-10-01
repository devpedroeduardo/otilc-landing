import {
  escapeHTML as esc,
  formatBRL,
  isAvailable,
  photoSrc,
  photoSrcset,
  photosOf,
  statusText,
} from "../lib/catalog.js";
import { state, emit } from "../state.js";
import { $ } from "../dom.js";
import { toggleSelection } from "../actions.js";
import { condHTML, currentList } from "./shared.js";
import { openDetail } from "./detail.js";

export function renderChips() {
  const all = [
    { id: "todas", name: "Todas", n: state.products.length },
    ...state.categories.map((c) => ({ ...c, n: state.products.filter((p) => p.cat === c.id).length })),
  ];
  $("#chips").innerHTML = all
    .map(
      (c) =>
        `<button class="chip" type="button" data-cat="${c.id}" aria-pressed="${state.filter === c.id}">${esc(c.name)} <sup>${c.n}</sup></button>`,
    )
    .join("");
}

/** @param {import("../lib/catalog.js").Product} p @param {number} idx @param {boolean} showFeature */
function cardHTML(p, idx, showFeature) {
  const on = state.selection.has(p.no);
  const free = isAvailable(p);
  const extra = photosOf(p).length - 1;
  const big = p.feature && showFeature;
  const classes = ["card", big && "feature", !free && "out"].filter(Boolean).join(" ");
  // largura real do card em cada faixa do layout (4, 3 ou 2 colunas; destaque ocupa 2)
  const sizes = big
    ? "(max-width: 860px) 100vw, (max-width: 1100px) 66vw, 640px"
    : "(max-width: 860px) 50vw, (max-width: 1100px) 33vw, 320px";
  return `<article class="${classes}" data-no="${p.no}">
    <div class="media">
      <button class="shot" type="button" data-open="${p.no}" aria-label="Ver ${esc(p.name)}, Nº${p.no}${p.size ? `, tamanho ${esc(p.size)}` : ""}${free ? "" : `, ${esc(statusText(p))}`}${free && extra > 0 ? `, ${extra + 1} fotos` : ""}">
        <img src="${photoSrc(p.img)}" srcset="${photoSrcset(p.img)}" sizes="${sizes}" alt="${esc(p.name)} — ${esc(p.brand)}" width="800" height="1000" loading="${idx < 4 ? "eager" : "lazy"}" decoding="async">
        <span class="pill no" aria-hidden="true">Nº${p.no}</span>
        ${p.size ? `<span class="pill size" aria-hidden="true">TAM ${esc(p.size)}</span>` : ""}
        ${free ? "" : `<span aria-hidden="true" class="pill status${p.status === "reservado" ? " res" : ""}">${esc(statusText(p))}</span>`}
        ${free && extra > 0 ? `<span class="pill more" aria-hidden="true">+${extra} foto${extra > 1 ? "s" : ""}</span>` : ""}
      </button>
      ${
        free
          ? `<button class="add" type="button" data-toggle="${p.no}" aria-pressed="${on}" aria-label="${on ? "Remover" : "Adicionar"} ${esc(p.name)} ${on ? "da" : "à"} seleção">${on ? "✓" : "+"}</button>`
          : ""
      }
    </div>
    <div class="meta">
      <span class="brand-name">${esc(p.brand)}</span>
      <h3>${esc(p.name)}</h3>
      ${p.note ? `<span class="note">${esc(p.note)}</span>` : ""}
      <div class="foot"><span class="price"><small>R$</small>${formatBRL(p.price)}</span>${condHTML(p.cond)}</div>
    </div>
  </article>`;
}

export function renderGrid() {
  const list = currentList();
  const showFeature = state.filter === "todas" && state.sort === "drop";
  $("#grid").innerHTML = list.length
    ? list.map((p, idx) => cardHTML(p, idx, showFeature)).join("")
    : `<p class="empty">Nenhuma peça nesta categoria.</p>`;
}

export function bindCatalog() {
  $("#chips").addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    state.filter = b.dataset.cat;
    emit("filter");
  });
  $("#sort").addEventListener("change", (e) => {
    state.sort = e.target.value;
    emit("filter");
  });
  $("#grid").addEventListener("click", (e) => {
    const t = e.target.closest("[data-toggle]");
    if (t) return toggleSelection(t.dataset.toggle);
    const o = e.target.closest("[data-open]");
    if (o) openDetail(o.dataset.open, o);
  });
}
