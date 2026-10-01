/**
 * CONTATO — preencher antes de publicar.
 * whatsapp: só números, com 55 + DDD (ex.: "5511999998888")
 * instagram: o @ sem o arroba (ex.: "otilc")
 * Sem WhatsApp, a seleção mostra só o botão "Copiar mensagem".
 */
export const CONTACT = {
  whatsapp: "",
  instagram: "",
};

/**
 * MÉTRICAS — opcional. Com algum ID preenchido, a página mostra o aviso de cookies (LGPD)
 * e só carrega GA4 / Meta Pixel depois que o visitante aceitar.
 * ga4: "G-XXXXXXXXXX" · metaPixel: só números
 */
export const ANALYTICS = {
  ga4: "",
  metaPixel: "",
};

/** Chave do localStorage onde fica a escolha de cookies. */
export const CONSENT_KEY = "otilc-consentimento";

/** Chave do localStorage onde a seleção do visitante fica salva. */
export const STORE_KEY = "otilc-selecao";

/** Arquivo com as peças do drop. */
export const DATA_URL = "data/products.json";
