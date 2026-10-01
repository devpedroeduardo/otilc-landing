import { CONTACT } from "../config.js";
import {
  escapeHTML as esc,
  formatBRL,
  instagramLink,
  orderMessage,
  photoSrc,
  totalOf,
  whatsappLink,
} from "../lib/catalog.js";
import { state, selectedProducts } from "../state.js";
import { $, toast, track } from "../dom.js";
import { toggleSelection } from "../actions.js";
import { rememberFocus, showLayer } from "./dialogs.js";

const message = () => orderMessage(selectedProducts(), state.drop);

export function renderBag() {
  const items = selectedProducts();
  const total = totalOf(items);
  const wa = whatsappLink(CONTACT.whatsapp, message());
  const ig = instagramLink(CONTACT.instagram);
  $("#bag").innerHTML = `
    <button class="x" type="button" data-close aria-label="Fechar seleção">✕</button>
    <header><span class="label">Pré-venda · Drop ${esc(state.drop)}</span><h2 id="bag-title">Sua seleção</h2></header>
    <div class="items">${
      items.length
        ? items
            .map(
              (p) => `
      <div class="item">
        <img src="${photoSrc(p.img, 400)}" alt="" width="64" height="80">
        <div><span class="label">Nº${p.no} · ${esc(p.brand)}</span><h4>${esc(p.name)}</h4><div class="p">R$ ${formatBRL(p.price)}${p.size ? ` · TAM ${esc(p.size)}` : ""}</div></div>
        <button type="button" data-toggle="${p.no}">Remover</button>
      </div>`,
            )
            .join("")
        : `
      <div class="none"><p>Sua seleção está vazia. Toque no + de uma peça para adicioná-la aqui.</p><a class="btn btn-ghost" href="#pecas" data-close>Ver as peças</a></div>`
    }
    </div>
    ${
      items.length
        ? `<footer>
      <div class="total"><span class="label">${items.length} ${items.length > 1 ? "peças" : "peça"}</span><span class="price"><small>R$</small>${formatBRL(total)}</span></div>
      <label class="label" for="msg">Mensagem do pedido</label>
      <textarea id="msg" readonly>${esc(message())}</textarea>
      ${wa ? `<a class="btn btn-solid" id="send-wa" href="${wa}" target="_blank" rel="noopener">Enviar pelo WhatsApp <span class="arr" aria-hidden="true">→</span></a>` : ""}
      <button class="btn ${wa ? "btn-ghost" : "btn-solid"}" type="button" id="copy-msg">Copiar mensagem</button>
      ${ig ? `<p class="warn">Prefere o Instagram? Copie a mensagem e mande no direct do <a href="${ig}" target="_blank" rel="noopener">@${esc(CONTACT.instagram.replace(/^@/, ""))}</a>.</p>` : ""}
    </footer>`
        : ""
    }`;
}

function copyMessage() {
  const ta = $("#msg");
  const fallback = () => {
    ta.focus();
    ta.select();
    toast("Mensagem selecionada. Copie com Ctrl+C ou segure para copiar.");
  };
  track("begin_checkout", { products: selectedProducts(), method: "copy_message" });
  try {
    navigator.clipboard.writeText(message()).then(() => toast("Mensagem copiada"), fallback);
  } catch {
    fallback();
  }
}

export function openBag() {
  rememberFocus();
  renderBag();
  showLayer("bag");
}

export function updateCount(animate = true) {
  const c = $("#bag-count");
  c.textContent = state.selection.size;
  if (!animate) return;
  c.classList.remove("bump");
  void c.offsetWidth;
  c.classList.add("bump");
}

export function bindBag() {
  $("#open-bag").addEventListener("click", openBag);
  $("#bag").addEventListener("click", (e) => {
    const t = e.target.closest("[data-toggle]");
    if (t) return toggleSelection(t.dataset.toggle);
    if (e.target.closest("#copy-msg")) copyMessage();
    if (e.target.closest("#send-wa")) {
      track("begin_checkout", { products: selectedProducts(), method: "whatsapp" });
    }
  });
}
