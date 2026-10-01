import { test, expect } from "@playwright/test";
import { DATA, card, mockContact, mockProducts, openHome } from "./helpers.js";

test.describe("vitrine", () => {
  test("carrega todas as peças sem erros no console", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await openHome(page);
    await expect(page).toHaveTitle(/OTILC/);
    await expect(page.locator("#grid .card")).toHaveCount(DATA.products.length);
    await expect(page.locator("#fact-count")).toHaveText(String(DATA.products.length));
    expect(errors).toEqual([]);
  });

  test("filtra por categoria e ordena por preço", async ({ page }) => {
    await openHome(page);
    const bones = DATA.products.filter((p) => p.cat === "bones");
    await page.getByRole("button", { name: /^Bonés/ }).click();
    await expect(page.locator("#grid .card")).toHaveCount(bones.length);
    await expect(page.getByRole("button", { name: /^Bonés/ })).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: /^Todas/ }).click();
    await page.locator("#sort").selectOption("price-asc");
    const cheapest = [...DATA.products].sort((a, b) => a.price - b.price)[0];
    await expect(page.locator("#grid .card").first()).toHaveAttribute("data-no", cheapest.no);
  });

  test("abre a categoria pelo link #bones", async ({ page }) => {
    await openHome(page, "/#bones");
    await expect(page.getByRole("button", { name: /^Bonés/ })).toHaveAttribute("aria-pressed", "true");
  });

  test("peça vendida fica no fim, em cinza e sem botão de adicionar", async ({ page }) => {
    await mockProducts(page, (ps) => (ps[0].status = "vendido"));
    await openHome(page);
    const sold = card(page, DATA.products[0].no);
    await expect(sold).toHaveClass(/out/);
    await expect(sold.getByText("Vendido")).toBeVisible();
    await expect(sold.locator("[data-toggle]")).toHaveCount(0);
    await expect(page.locator("#grid .card").last()).toHaveAttribute("data-no", DATA.products[0].no);

    await sold.locator(".shot").click();
    await expect(page.getByRole("dialog").getByRole("button", { name: "Peça vendida" })).toBeDisabled();
  });
});

test.describe("seleção", () => {
  test("adiciona, persiste após recarregar e remove", async ({ page }) => {
    await openHome(page);
    const p = DATA.products[1];
    await card(page, p.no).locator("[data-toggle]").click();
    await expect(page.locator("#bag-count")).toHaveText("1");
    await expect(page.getByRole("status")).toContainText(p.name);

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-ready", "true");
    await expect(page.locator("#bag-count")).toHaveText("1");

    await page.locator("#open-bag").click();
    const bag = page.getByRole("dialog", { name: "Sua seleção" });
    await expect(bag.locator("#msg")).toHaveValue(new RegExp(`Nº${p.no} ${p.name}`));
    await bag.getByRole("button", { name: "Remover" }).click();
    await expect(page.locator("#bag-count")).toHaveText("0");
    await expect(bag.getByText("Sua seleção está vazia")).toBeVisible();
  });

  test("sem WhatsApp configurado, oferece só copiar a mensagem", async ({ page }) => {
    await openHome(page);
    await card(page, DATA.products[0].no).locator("[data-toggle]").click();
    await page.locator("#open-bag").click();
    await expect(page.locator("#send-wa")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Copiar mensagem" })).toBeVisible();
    await expect(page.locator("#waitlist-ctas")).toHaveText("Contato em breve");
  });

  test("com WhatsApp configurado, envia o pedido pronto", async ({ page }) => {
    await mockContact(page, { whatsapp: "5511999998888", instagram: "otilc" });
    await openHome(page);
    const [a, b] = DATA.products;
    await card(page, a.no).locator("[data-toggle]").click();
    await card(page, b.no).locator("[data-toggle]").click();
    await page.locator("#open-bag").click();

    const href = await page.getByRole("link", { name: /Enviar pelo WhatsApp/ }).getAttribute("href");
    const url = new URL(href);
    expect(url.origin + url.pathname).toBe("https://wa.me/5511999998888");
    const text = url.searchParams.get("text");
    expect(text).toContain(`Nº${a.no} ${a.name}`);
    expect(text).toContain(`Total: R$ ${(a.price + b.price).toLocaleString("pt-BR")}`);
    await expect(page.locator("#contacts").getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://instagram.com/otilc",
    );
  });
});

test.describe("painel da peça", () => {
  test("abre pelo link direto, navega e fecha com Esc devolvendo o foco", async ({ page }) => {
    const [first, second] = DATA.products;
    await openHome(page, `/#peca-${first.no}`);
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: first.name })).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(dialog.getByRole("heading", { name: second.name })).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`#peca-${second.no}$`));

    await page.keyboard.press("Escape");
    await expect(page.locator("#detail-layer")).toBeHidden();
    await expect(page).not.toHaveURL(/#peca-/);

    await card(page, first.no).locator(".shot").click();
    await page.keyboard.press("Escape");
    await expect(card(page, first.no).locator(".shot")).toBeFocused();
  });

  test("mantém o Tab dentro do painel aberto", async ({ page }) => {
    await openHome(page, `/#peca-${DATA.products[0].no}`);
    for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
    await expect(page.locator("#detail :focus")).toHaveCount(1);
  });

  test("galeria troca a foto principal", async ({ page }) => {
    const p = DATA.products[0];
    await mockProducts(page, (ps) => (ps[0].imgs = [ps[1].img, ps[2].img]));
    await openHome(page);
    await expect(card(page, p.no).getByText("+2 fotos")).toBeVisible();
    await card(page, p.no).locator(".shot").click();
    await page.getByRole("button", { name: "Foto 2 de 3" }).click();
    await expect(page.locator("#d-photo")).toHaveAttribute("src", new RegExp(`${DATA.products[1].img}-800\\.webp$`));
    await expect(page.getByRole("button", { name: "Foto 2 de 3" })).toHaveAttribute("aria-current", "true");
  });
});

test.describe("páginas de apoio", () => {
  test("404 com caminho para a vitrine", async ({ page }) => {
    const res = await page.goto("/nao-existe/qualquer");
    expect(res.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /Nem o olho/ })).toBeVisible();
    await page.getByRole("link", { name: /Ver as peças/ }).click();
    await expect(page.locator("html")).toHaveAttribute("data-ready", "true");
  });

  test("dados estruturados das peças estão no head", async ({ page }) => {
    await openHome(page);
    const ld = JSON.parse(await page.locator("#ld-products").textContent());
    expect(ld.itemListElement).toHaveLength(DATA.products.length);
  });
});
