import { DATA_URL } from "./config.js";
import { pieceFromHash } from "./lib/catalog.js";
import { state, subscribe, loadSelection } from "./state.js";
import { $ } from "./dom.js";
import { bindCatalog, renderChips, renderGrid } from "./views/catalog.js";
import { bindBag, renderBag, updateCount } from "./views/bag.js";
import { bindDetail, renderDetail, syncWithHash } from "./views/detail.js";
import { bindDialogs, isBagOpen, isDetailOpen } from "./views/dialogs.js";
import { bindContacts, renderContacts } from "./views/contacts.js";
import { renderTicker, startEye } from "./effects.js";

/** Redesenha o que depende do estado sempre que algo muda. */
subscribe((reason) => {
  if (reason === "filter") renderChips();
  renderGrid();
  if (reason === "selection") {
    updateCount();
    if (isDetailOpen()) renderDetail(state.currentNo);
    if (isBagOpen()) renderBag();
  }
});

async function loadData() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`Falha ao carregar ${DATA_URL}: ${res.status}`);
  const data = await res.json();
  state.drop = data.drop;
  state.categories = data.categories;
  state.products = data.products;
}

async function boot() {
  startEye();
  bindDialogs();
  bindCatalog();
  bindBag();
  bindDetail();
  bindContacts();
  renderContacts();

  try {
    await loadData();
  } catch (err) {
    console.error(err);
    $("#grid").innerHTML = `<p class="empty">Não foi possível carregar as peças. Atualize a página.</p>`;
    return;
  }

  loadSelection();
  $("#fact-count").textContent = state.products.length;
  renderTicker(state.products.length, state.drop);
  updateCount(false);

  const hash = location.hash.slice(1);
  if (state.categories.some((c) => c.id === hash)) state.filter = hash;
  renderChips();
  renderGrid();
  document.documentElement.dataset.ready = "true";

  if (state.filter !== "todas" || pieceFromHash(location.hash)) $("#pecas").scrollIntoView();
  syncWithHash();
}

boot();
