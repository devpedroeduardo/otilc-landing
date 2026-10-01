import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { DATA, openHome } from "./helpers.js";

/** Auditoria automática (axe-core, WCAG 2.1 AA). Falha em qualquer violação séria ou crítica. */
async function audit(page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = violations.filter((v) => ["serious", "critical"].includes(v.impact));
  const report = serious.map((v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  expect(report, report.join("\n")).toEqual([]);
}

test.describe("acessibilidade", () => {
  test.use({ reducedMotion: "reduce" });

  test("página inicial", async ({ page }) => {
    await openHome(page);
    await audit(page);
  });

  test("painel da peça aberto", async ({ page }) => {
    await openHome(page, `/#peca-${DATA.products[0].no}`);
    await expect(page.getByRole("dialog")).toBeVisible();
    await audit(page);
  });

  test("seleção aberta com itens", async ({ page }) => {
    await openHome(page);
    await page.locator(`.card[data-no="${DATA.products[0].no}"] [data-toggle]`).click();
    await page.locator("#open-bag").click();
    await expect(page.getByRole("dialog", { name: "Sua seleção" })).toBeVisible();
    await audit(page);
  });

  test("privacidade", async ({ page }) => {
    await page.goto("/privacidade.html");
    await audit(page);
  });
});
