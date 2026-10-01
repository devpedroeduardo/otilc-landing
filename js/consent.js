import { ANALYTICS, CONSENT_KEY } from "./config.js";
import { $ } from "./dom.js";

/** Há alguma ferramenta de métricas configurada? Sem ela, não há cookies e nem aviso. */
export const analyticsEnabled = () => Boolean(ANALYTICS.ga4 || ANALYTICS.metaPixel);

const readChoice = () => {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
};
const saveChoice = (v) => {
  try {
    localStorage.setItem(CONSENT_KEY, v);
  } catch {
    /* sem armazenamento: pergunta de novo na próxima visita */
  }
};

/** @param {string} src */
const addScript = (src) => {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.append(s);
};

let loaded = false;
function loadAnalytics() {
  if (loaded) return;
  loaded = true;
  if (ANALYTICS.ga4) {
    addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ANALYTICS.ga4)}`);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", ANALYTICS.ga4, { anonymize_ip: true });
  }
  if (ANALYTICS.metaPixel) {
    const q = [];
    window.fbq = function fbq(...args) {
      q.push(args);
    };
    window.fbq.queue = q;
    window.fbq.loaded = true;
    window.fbq.version = "2.0";
    window._fbq = window.fbq;
    addScript("https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", ANALYTICS.metaPixel);
    window.fbq("track", "PageView");
  }
}

function showBanner() {
  const el = $("#consent");
  el.hidden = false;
  el.querySelector("[data-consent='yes']").focus({ preventScroll: true });
}

/** Aplica a escolha salva ou pergunta ao visitante. */
export function initConsent() {
  if (!analyticsEnabled()) return;
  const el = $("#consent");
  el.addEventListener("click", (e) => {
    const b = e.target.closest("[data-consent]");
    if (!b) return;
    saveChoice(b.dataset.consent);
    el.hidden = true;
    if (b.dataset.consent === "yes") loadAnalytics();
  });
  document.querySelectorAll("[data-open-consent]").forEach((a) => {
    a.hidden = false;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showBanner();
    });
  });
  const choice = readChoice();
  if (choice === "yes") loadAnalytics();
  else if (choice !== "no") showBanner();
}
