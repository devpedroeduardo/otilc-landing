import { CONTACT } from "../config.js";
import { instagramLink, whatsappLink } from "../lib/catalog.js";
import { $, track } from "../dom.js";

const EXT = `target="_blank" rel="noopener"`;

/** Lista de espera, rodapé e links "fale com a gente" conforme o contato configurado. */
export function renderContacts() {
  const wa = (text) => whatsappLink(CONTACT.whatsapp, text);
  const ig = instagramLink(CONTACT.instagram);
  const waitlist = wa(
    "Olá! Quero entrar na lista de espera da loja OTILC e ser avisado(a) do lançamento e dos próximos drops.",
  );

  $("#waitlist-ctas").innerHTML =
    [
      waitlist
        ? `<a class="btn btn-solid" href="${waitlist}" ${EXT}>Entrar na lista pelo WhatsApp <span class="arr" aria-hidden="true">→</span></a>`
        : "",
      ig ? `<a class="btn ${waitlist ? "btn-ghost" : "btn-solid"}" href="${ig}" ${EXT}>Seguir no Instagram</a>` : "",
    ].join("") || `<span class="label">Contato em breve</span>`;

  $("#contacts").innerHTML = [
    ig ? `<a href="${ig}" ${EXT}>Instagram</a>` : "",
    wa("") ? `<a href="${wa("Olá, OTILC!")}" ${EXT}>WhatsApp</a>` : "",
  ].join("");

  // links fixos do HTML com data-wa: WhatsApp se houver, senão Instagram, senão texto simples
  document.querySelectorAll("a[data-wa]").forEach((a) => {
    if (wa("")) Object.assign(a, { href: wa(a.dataset.wa), target: "_blank", rel: "noopener" });
    else if (ig) {
      Object.assign(a, { href: ig, target: "_blank", rel: "noopener" });
      a.removeAttribute("data-wa");
    } else a.replaceWith(document.createTextNode(a.textContent));
  });
}

export function bindContacts() {
  $("#waitlist-ctas").addEventListener("click", (e) => {
    if (e.target.closest("a")) track("waitlist_click");
  });
  // links data-wa criados depois (ex.: "Consultar" tamanho no painel)
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-wa]");
    const link = a && whatsappLink(CONTACT.whatsapp, a.dataset.wa);
    if (!link) return;
    e.preventDefault();
    track("whatsapp_click", { source: "link" });
    window.open(link, "_blank", "noopener");
  });
}
