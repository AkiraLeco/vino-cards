# HANDOFF — Vino Cards

Resumo para retomar o trabalho depois de um `/clear`. **Leia este arquivo, o `CLAUDE.md` e o `AGENTS.md` no início da sessão.**

Última atualização: 2026-10-10.

## 1. Projeto
- **Vino Cards**: vitrine online/presencial (celular + QR) de cartas, produtos selados e acessórios à venda, para o cliente do usuário.
- Referências: LigaPokémon (modelo de dados e preços) e Virados Games (layout claro de loja).
- Stack: Next.js 16.4 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4, Supabase (Postgres + RLS + Auth + Storage), Vercel.
- Repositório (público): https://github.com/AkiraLeco/vino-cards (branch `main`; a Vercel publica a cada push).
- Idioma da conversa e da interface: português do Brasil.

## 2. Regras fixas
- **CLAUDE.md**: após qualquer alteração, validar (`npx tsc --noEmit` e `npm run lint`), fazer `git add` só dos arquivos da mudança, `git commit` e `git push` para `main`, sem pedir confirmação. Nunca commitar `.env.local`. Se o push falhar, informar o motivo.
- **AGENTS.md**: esta versão do Next.js tem mudanças incompatíveis. Ler `node_modules/next/dist/docs/` antes de escrever código. Exemplos: `params`/`searchParams` são Promises, `proxy.ts` substitui o middleware, o tipo global `LayoutProps` é gerado em `.next/types`.
- Commits terminam com a linha de coautoria exigida pelo ambiente.
- Sem licença no repositório (decisão do usuário: "pode deixar como está").

## 3. Estado atual (tudo no GitHub, último commit conhecido: `58c4f0e`)
**Público**
- Topo: sidebar (☰, com Início, Pokémon, Riftbound, Acessórios, QR), logo, busca, conta (`/conta`, placeholder) e carrinho. Home: faixa de anúncios rotativa (`PromoBanner`), carrossel de cards, cartas avulsas e rodapé de atendimento/contato/endereço/horário (WhatsApp, e-mail, endereço e horário com dados fictícios (trocar pelos reais) em `lib/site.ts`, `CONTACT`).
- Catálogo com filtros, busca, paginação (30/60/90) e estado vazio. Vendidas ficam escondidas por padrão. Reservadas aparecem com selo.
- Página do item com galeria, preço, avisos de reservada/vendida e prévia de link (`generateMetadata`).
- Home com hero, cards de entrada por jogo e Novidades. Os cards de entrada ficam num carrossel horizontal com encaixe e setas (`components/TileCarousel.tsx` + `components/GameTile.tsx`); cada card abre **só por clique** (o deslizar foi removido a pedido do usuário). As imagens de terceiros (Pikachu, Jinx) foram **removidas** (direitos autorais); os cards usam só degradê e ícone até o usuário enviar artes próprias/licenciadas (`image`/`imagePosition`/`cutout` em `TILES` de `app/page.tsx`, arquivos em `public/tiles/`).
- `/qr`: QR do site com baixar PNG e imprimir. Rodapé sem link para o admin.
- Layout responsivo para celular e desktop.
- `components/SiteShell.tsx` esconde topo, rodapé e WhatsApp da loja em `/admin/*`; o admin tem o próprio topo (logo → `/admin`, Produtos, + Novo produto, Sair) e nenhum link para a loja.

**Admin** (`/admin`, login por e-mail e senha; cadastro público desativado)
- Lista com totais (itens, unidades, valor em estoque), busca e filtros por jogo, tipo e status, botões de status em um toque (Disponível/Reservada/Vendida), "Vendi 1", editar, excluir e exportar CSV.
- Formulário em 4 seções com botão Salvar fixo: tipo/jogo + busca na API do Pokémon TCG, dados, preço e estoque (botão de preço da Liga só para cartas avulsas de Pokémon), fotos e observações.
- Fotos: comprimidas no navegador (canvas, 1600px, JPEG 0.82) e enviadas direto ao bucket `card-photos`.
- Quantidade 0 marca o item como vendido automaticamente.

**Infra**
- `vercel.json` com cron diário em `/api/keepalive` para o Supabase gratuito não pausar.
- README bilíngue (PT/EN) com aviso claro de projeto em andamento.

## 4. Mapa de arquivos
- `lib/types.ts` — tipos `Card`, `Game`, `Category`, `Status`, `cardImage()`.
- `lib/features.ts` — flags `FLOATING_WHATSAPP` e `WHATSAPP_ORDER` (ambas `true`).
- `lib/auth.ts` — `requireAdmin()`.
- `lib/liga.ts`, `app/admin/liga.ts` — consulta de preço na Liga.
- `lib/pokemontcg.ts`, `lib/image.ts`, `lib/format.ts`, `lib/whatsapp.ts`, `lib/supabase/{client,server}.ts`.
- `app/admin/actions.ts` — `saveCard`, `setStatus`, `sellOne`, `deleteCard`, `login`, `logout`.
- `app/admin/(panel)/{page,nova/page,[id]/page,layout}.tsx`, `app/admin/login/page.tsx`, `app/admin/export/route.ts`.
- `components/`: `Catalog`, `Filters`, `CardItem`, `Header`, `Gallery`, `AddToCart`, `CartProvider`, `CardForm`, `StatusButtons`.
- Páginas públicas: `app/page.tsx`, `app/[game]/{cartas,selados,colecoes}`, `app/acessorios`, `app/busca`, `app/cartas/[id]`, `app/carrinho`, `app/qr`, `app/api/keepalive`.
- `supabase/schema.sql`, `supabase/migrations/001_game_category.sql` (já executada), `supabase/migrations/002_fix_empty_stock.sql` (opcional).

## 5. Decisões e armadilhas
- **Desempenho**: imagens de cartas usam `components/CardImage.tsx` (`next/image`; hosts liberados em `next.config.ts`: images.pokemontcg.io e o host do Supabase; outros hosts caem em `unoptimized`). A home é estática com `revalidate = 60` e usa `lib/supabase/public.ts` (sem cookies); o admin renova ao salvar.
- **Admin e redirecionamento**: layout e página renderizam em paralelo, e com `app/loading.tsx` o redirect chega depois do HTML. Por isso **toda página do admin chama `requireAdmin()` antes de buscar dados**. Manter assim em páginas novas.
- **WhatsApp desativado**: para reativar, editar `lib/features.ts` (`FLOATING_WHATSAPP` e `WHATSAPP_ORDER` para `true`) e dar push. Precisa de `NEXT_PUBLIC_WHATSAPP_NUMBER` só com dígitos (ex.: `5511932506668`) na Vercel. Com a flag desligada, o carrinho mostra "O envio de pedidos está indisponível no momento".
- **Liga**: a consulta é raspagem não oficial e provavelmente é bloqueada pelo Cloudflare nos IPs da Vercel. O erro mostra o motivo e há link para busca manual. Alternativas: preço manual ou rodar o admin localmente.
- **Upload de fotos**: precisa ser direto do navegador, porque a Vercel limita o corpo das Server Actions a ~4,5 MB.
- **Dados**: `game` é `null` para acessórios; itens que não são cartas avulsas limpam número, raridade e foil, e a condição vira `NM`.
- **Variáveis de ambiente**: ficam em `.env.local` (fora do git) e na Vercel. `.env.example` tem os nomes com valores vazios.
- **Verificação visual**: Chrome headless com caminhos em barras normais (`C:/Program Files/Google/Chrome/Application/chrome.exe --headless=new --window-size=W,H --screenshot=<caminho>`); viewport mínimo de ~500 px.
- Se aparecerem erros de tipos antigos (`LayoutProps`, rotas removidas), apagar `.next` e rebuildar.

## 6. Pendências e próximos passos
- Aguardando o usuário enviar as artes dos cards da home (Pokémon, Riftbound, Acessórios).
- Definir `NEXT_PUBLIC_SITE_URL` na Vercel (sitemap/robots usam `lib/site.ts`).
- Rodar `002_fix_empty_stock.sql` no SQL Editor do Supabase (ou editar à mão o Pikachu ex, que está "disponível" com quantidade 0). Ainda não confirmado.
- **O admin logado não foi testado por mim** (não consigo autenticar no meu ambiente). Pedir ao usuário que teste cadastrar e editar um item após o deploy.
- **Decisão do usuário (2026-10-10): as compras não serão mais por WhatsApp; serão por pagamento via banco (a integração fica para o final).** O carrinho segue com o envio desativado até lá.
- Logo e cores da marca do cliente.
- Otimização das demais imagens, itens relacionados, SEO/sitemap, domínio próprio, testes automatizados.
- Fonte de dados para cartas de Riftbound (hoje cadastro manual) e alternativa estável à Liga.

## 7. Como retomar
1. Ler este arquivo, `CLAUDE.md` e `AGENTS.md`.
2. `git status` e `git log --oneline -5` para ver se algo mudou depois de 2026-10-10.
3. Perguntar ao usuário qual pendência da seção 6 atacar, ou seguir o que ele pedir.
4. Atualizar este arquivo ao final de cada bloco grande de trabalho.

## Tema premium (tinta + dourado)
- `app/globals.css` remapeia a escala `violet-*` do Tailwind para tinta escura/marfim e define `gold`, `gold-soft`, `gold-deep` e `ink`. Títulos usam `font-display` (Cormorant Garamond).
- Textos institucionais (contato e diferenciais da home) ficam em `lib/site.ts`; rodapé em `components/Footer.tsx`.
- Cards têm adicionar rápido (`QuickAdd`) e selo de estoque baixo; o carrinho mostra aviso (toast) ao adicionar; a página da carta tem zoom, relacionadas, barra de compra fixa no celular e JSON-LD.
- Após atualizar o Next, reinicie o `npm run dev` (servidor antigo dá erro 500).
- `npm test` roda testes simples de `lib/` (node:test).
