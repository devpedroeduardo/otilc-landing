# OTILC — guia para trabalhar neste repositório

Vitrine estática (sem build) da pré-venda OTILC. HTML + CSS + ES modules puros. Veja [README.md](README.md) para a visão de produto; isto aqui é o guia operacional.

## Ambiente (WSL / Ubuntu)

- Node 24 via nvm, Git nativo do Linux. Trabalhe sempre dentro de `~/otilc-landing` (sistema de arquivos do Linux), não em `/mnt/c/...` — é muito mais rápido e evita problemas de permissão.
- `node_modules` precisa ser instalado **no Linux** (`npm ci`). Se vier copiado do Windows, os binários dão `Permission denied` e o `sharp` quebra — apague e rode `npm ci` de novo.
- Os testes E2E precisam das bibliotecas de sistema do Chromium. Se o Playwright reclamar de `libnspr4.so` ou parecido: `sudo npx playwright install-deps chromium` (pede senha — peça para o usuário rodar).
- Arquivos `*:Zone.Identifier` são lixo do Windows ao copiar para o WSL; já estão no `.gitignore`. Pode apagar com `find . -name '*:Zone.Identifier' -not -path './node_modules/*' -delete`.

## Comandos

| Comando                     | Quando usar                                                                       |
| --------------------------- | --------------------------------------------------------------------------------- |
| `npm run dev`               | sobe o site em http://localhost:8080                                              |
| `npm run check`             | formato + lint + testes — rode isso antes de qualquer commit, é o que o CI roda   |
| `npm run test:unit`         | só os testes unitários (rápido, sem navegador)                                    |
| `npm run test:e2e`          | só Playwright; filtre com `-- -g "nome do teste" --project=desktop`               |
| `npm run lint` / `format`   | ESLint / Prettier                                                                 |
| `npm run images`            | gera WebP (400/800px) de fotos novas em `assets/img/*.jpg`                        |
| `npm run lighthouse:local`  | Lighthouse via Chromium do Playwright (o `lhci` sozinho não acha Chrome aqui)     |
| `npm run screenshots`       | regenera as imagens do README a partir do site rodando em `npm run dev`           |
| `npm run site-url -- <url>` | troca o endereço público em canonical/OG/JSON-LD/sitemap/robots/README de uma vez |

Playwright usa `workers: 2` (já configurado em `playwright.config.js`) — mais que isso trava em máquina modesta. Para iterar rápido, rode o teste específico em vez da suíte toda.

## Estrutura

```
data/products.json        as peças do drop — editar aqui, não no HTML
js/config.js              contato da LOJA (WhatsApp/Instagram) e chaves de analytics
js/lib/                   regras puras, sem DOM — testadas em tests/unit
js/views/                 catálogo, seleção, painel da peça, diálogos, contato
js/state.js, actions.js   estado reativo (publish/subscribe) e ações do usuário
scripts/                  imagens, screenshots, Lighthouse local, troca de URL
tests/unit                node:test — lib/ e validação de data/products.json
tests/e2e                 Playwright + axe-core (desktop + mobile)
.github/workflows/ci.yml  qualidade → E2E + Lighthouse → deploy no GitHub Pages
```

## Convenções

- **Sem build, sem framework.** Não introduzir bundler, TypeScript ou dependência de runtime sem discutir antes — é uma decisão deliberada (vitrine de 17 peças).
- **Dados fora do código.** Peça nova ou campo novo entra em `data/products.json`, não em JavaScript. Campo novo → atualizar a validação em `tests/unit/data.test.js`.
- **Lógica pura em `js/lib/`.** Qualquer função sem DOM que puder ser testada direto no Node deve morar lá, não dentro de uma view — e ganha teste em `tests/unit`.
- **Views não se chamam entre si.** Comunicação é via `emit`/`subscribe` em `js/state.js`.
- **Acessibilidade e performance são requisito**, não extra: o E2E roda axe-core e o CI roda Lighthouse (98–100). Mudança visual não pode regredir isso.
- **Textos do site, comentários e commits em português.**
- **Commits em Conventional Commits** (`feat:`, `fix:`, `perf:`, `test:`, `docs:`, `ci:`, `style:`, `refactor:`, `chore:`), corpo em `-` explicando o quê e por quê.
- **Nunca commitar sem rodar `npm run check` antes.**
- **Não confundir contatos:** `js/config.js` é o WhatsApp/Instagram da **loja OTILC** (onde o cliente recebe pedidos). O crédito "@devpedroeduardo" no rodapé do site é o Instagram do **desenvolvedor** — são coisas diferentes, não misturar.

## Pendências conhecidas do cliente (não é código)

- Preencher `CONTACT.whatsapp`/`CONTACT.instagram` da loja em `js/config.js` antes de divulgar.
- Confirmar respostas de pagamento/envio/trocas na seção "Dúvidas".
- Fotos de detalhe, medidas e tamanhos faltantes por peça.
- IDs de métricas (GA4 / Meta Pixel) em `js/config.js`, se a loja quiser medir.

Resolvido: autorização para publicar fotos/marca no GitHub foi dada (o código continua MIT; os ativos da marca seguem fora dela — ver `LICENSE`). A logo foi limpa do fundo residual; `assets/og.jpg` não tem script gerador — se a logo mudar de novo, ela fica em (80, 120) com 470px de largura.

## Deploy

Push na branch `main` dispara o workflow: qualidade → (E2E + Lighthouse em paralelo) → deploy no GitHub Pages. O deploy só roda se tudo passar. A URL pública atual está em `site.config.json` (trocar com `npm run site-url`, nunca à mão nos arquivos individuais).
