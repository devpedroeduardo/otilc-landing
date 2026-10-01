# OTILC: vitrine da pré-venda (Drop 00)

Landing page estática da pré-venda da OTILC. É o primeiro esboço visual do site da marca.

## Rodar local

Abrir o `index.html` direto (duplo clique) **não carrega as imagens** em alguns navegadores/visualizadores.
Use um servidor local:

    powershell -ExecutionPolicy Bypass -File serve.ps1      # http://localhost:8080 (não precisa de Node/Python)
    npx serve .                                              # alternativa, se tiver Node
    python -m http.server 8080                               # alternativa, se tiver Python

## Antes de publicar (obrigatório)

1. **Contato**: no `index.html`, preencha `CONTACT.whatsapp` (55 + DDD + número, só dígitos) e
   `CONTACT.instagram` (sem @). Isso liga o botão "Enviar pelo WhatsApp", a lista de espera e os links do rodapé.
2. **Domínio**: troque `https://SEU-DOMINIO.com.br` nas tags do `<head>` (canonical, og:url, og:image, twitter:image)
   pelo domínio real. Sem isso a prévia do link no WhatsApp/Instagram não mostra a imagem.
3. **Dúvidas**: confira as respostas da seção "Dúvidas" (pagamento, frete, reserva) com a política real da loja.
4. **Métricas (opcional)**: cole o snippet do GA4 e/ou Meta Pixel no `<head>`. A página já dispara os eventos
   `add_to_selection`, `view_item`, `whatsapp_click`, `copy_message`, `share` e `waitlist_click`.

## Estrutura

    index.html         página completa (HTML + CSS + JS, sem build)
    serve.ps1          servidor local
    assets/            logo, olho, estrela, ícones (favicon), og.jpg (prévia de link) e fotos (assets/img/*.jpg)

## Editar as peças

No final do `index.html`, a constante `PRODUCTS` guarda todas as peças:

| campo                    | o que é                                                            |
| ------------------------ | ------------------------------------------------------------------ |
| `no`                     | número da peça (também vira o link: `#peca-01`)                    |
| `cat`                    | categoria (`tenis`, `camisetas`, `calcas`, `casacos`, `bones`)     |
| `name`, `brand`, `price` | nome, marca e preço                                                |
| `size`                   | tamanho (sem ele aparece "Consultar")                              |
| `cond`                   | condição 0–10, ou `null` para "sem nota"                           |
| `img`                    | foto principal (nome do arquivo em `assets/img`, sem `.jpg`)       |
| `imgs`                   | fotos extras da galeria, ex.: `["jordan-sola", "jordan-etiqueta"]` |
| `measures`               | medidas, ex.: `"Largura 56 cm · Comprimento 72 cm"`                |
| `note`                   | anotação à mão                                                     |
| `status`                 | `"reservado"` ou `"vendido"` (sem status = disponível)             |
| `feature`                | `true` para o card grande de destaque                              |

Peças vendidas/reservadas continuam visíveis (em cinza, no fim da grade) e não podem ser adicionadas.

## Link de cada peça

Cada peça abre direto por `seudominio.com.br/#peca-01`. No painel da peça há o botão "Compartilhar esta peça".

## Publicar com domínio próprio

Por ser estático, dá para subir em Vercel, Netlify, Cloudflare Pages ou GitHub Pages
e apontar o domínio da OTILC.

## Próximos passos sugeridos

- Tirar fotos de detalhe (sola, etiqueta, defeitos) e preencher `imgs`
- Preencher `size` e `measures` das peças que estão sem tamanho
- Lista de espera com cadastro próprio (Formspree, Google Forms ou a plataforma da loja)
- Migrar `PRODUCTS` para a plataforma/banco do e-commerce
