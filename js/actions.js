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
    track("remove_from_cart", { products: [p] });
  } else if (!isAvailable(p)) {
    return;
  } else {
    state.selection.add(no);
    toast(`${p.name} na seleção`);
    track("add_to_cart", { products: [p] });
  }
  saveSelection();
  emit("selection");
}
