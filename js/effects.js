import { $ } from "./dom.js";

/** O olho do hero: segue o mouse, passeia sozinho e pisca. Desligado com prefers-reduced-motion. */
export function startEye() {
  const stage = $("#eye");
  const iris = $("#iris");
  if (!stage || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const look = (dx, dy) => {
    const r = stage.getBoundingClientRect();
    iris.style.setProperty("--px", `${dx * r.width * 0.045}px`);
    iris.style.setProperty("--py", `${dy * r.height * 0.075}px`);
  };
  let idle;
  const wander = () => {
    clearTimeout(idle);
    idle = setTimeout(function step() {
      look(Math.random() * 2 - 1, Math.random() * 1.6 - 0.8);
      idle = setTimeout(step, 1600 + Math.random() * 1800);
    }, 2400);
  };
  const clamp = (v) => Math.max(-1, Math.min(1, v));

  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      const r = stage.getBoundingClientRect();
      look(
        clamp((e.clientX - (r.left + r.width * 0.51)) / (innerWidth * 0.5)),
        clamp((e.clientY - (r.top + r.height * 0.49)) / (innerHeight * 0.5)),
      );
      wander();
    },
    { passive: true },
  );
  setInterval(() => {
    if (document.hidden) return;
    stage.classList.remove("open", "blink");
    void stage.offsetWidth;
    stage.classList.add("blink");
  }, 6200);
  wander();
}

/** Faixa corrida abaixo do hero. @param {number} count @param {string} drop */
export function renderTicker(count, drop) {
  const star = `<img src="assets/star.webp" alt="" width="200" height="322">`;
  const chunk = [`Pré-venda <i>aberta</i>`, `Drop ${drop}`, `Uma de cada`, `Veja <i>além</i>`, `${count} peças`]
    .map((t) => `<span>${t} ${star}</span>`)
    .join("");
  $("#ticker-row").innerHTML = chunk.repeat(4);
}
