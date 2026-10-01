import { isAvailable, photoOriginal } from "./catalog.js";

/**
 * Dados estruturados (schema.org) da vitrine: uma lista de produtos com preço,
 * condição de usado e disponibilidade. Função pura para poder ser testada.
 * @param {import("./catalog.js").Product[]} products
 * @param {string} baseUrl endereço da página, ex.: "https://otilc.com.br/"
 */
export function productListSchema(products, baseUrl) {
  const abs = (path) => new URL(path, baseUrl).href;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "OTILC · Pré-venda",
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: abs(`#peca-${p.no}`),
      item: {
        "@type": "Product",
        sku: `OTILC-${p.no}`,
        name: p.name,
        brand: { "@type": "Brand", name: p.brand },
        image: [p.img, ...(p.imgs || [])].map((n) => abs(photoOriginal(n))),
        ...(p.size ? { size: p.size } : {}),
        offers: {
          "@type": "Offer",
          price: p.price.toFixed(2),
          priceCurrency: "BRL",
          itemCondition: "https://schema.org/UsedCondition",
          availability: isAvailable(p) ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
          url: abs(`#peca-${p.no}`),
        },
      },
    })),
  };
}
