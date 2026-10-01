import { isAvailable } from "./lib/catalog.js";
import { state, findProduct, saveSelection, emit } from "./state.js";
import { toast, track } from "./dom.js";

/** Adiciona ou remove uma peça da seleção. @param {string} no */
export function toggleSelection(no) {
  const p = findProduct(no);
  if (!p) return;
  if (state.selection.has(no)) {
    state.selection.delete(no);
    toast(`${p.name} saiu da seleção`);
  } else if (!isAvailable(p)) {
    return;
  } else {
    state.selection.add(no);
    toast(`${p.name} na seleção`);
    track("add_to_selection", { item_id: p.no, item_name: p.name, value: p.price, currency: "BRL" });
  }
  saveSelection();
  emit("selection");
}
