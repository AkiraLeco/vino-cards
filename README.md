# Vino Cards 🃏

> 🚧 **Projeto em andamento / Work in progress** 🚧
>
> 🇧🇷 Este projeto **ainda está em desenvolvimento**. Funcionalidades podem mudar, quebrar ou estar incompletas, e algumas estão desativadas temporariamente.
>
> 🇺🇸 This project is **still under active development**. Features may change, break or be incomplete, and some are temporarily disabled.

**Idioma / Language:** [🇧🇷 Português](#-português) · [🇺🇸 English](#-english)

---

## 🇧🇷 Português

Vitrine online para um vendedor de cartas de **Pokémon TCG** e **Riftbound**, produtos selados e acessórios. O vendedor cadastra o estoque em um painel protegido por senha, e os clientes navegam, filtram e consultam preços, estado e disponibilidade (inclusive pessoalmente, pelo celular, usando um QR code).

### Funcionalidades

**Loja pública**
- Menu por jogo: **Pokémon** e **Riftbound**, cada um com *Produtos Selados*, *Cartas Avulsas* e *Coleções*, além da aba **Acessórios**
- Filtros por coleção, raridade, estado (M/NM/SP/MP/HP/D), idioma e faixa de preço, com ordenação e paginação
- Status de cada item: disponível, reservado ou vendido (reservados aparecem com etiqueta)
- Página da carta com foto grande, preço, estado e detalhes; prévia de link ao compartilhar
- Carrinho salvo no navegador
- Página `/qr` com QR code do site (baixar PNG e imprimir)
- Layout responsivo (celular e computador), com filtros recolhíveis no celular

**Painel do vendedor (`/admin`)**
- Login com e-mail e senha (Supabase Auth)
- Cadastro e edição de cartas, selados e acessórios
- Busca de cartas Pokémon na [Pokémon TCG API](https://pokemontcg.io/) (preenche nome, coleção, número, raridade e imagem)
- Botão de consulta de preço na LigaPokémon (leitura não oficial, veja as limitações)
- Upload de fotos direto do navegador, com compressão
- Troca de status em um toque, botão "Vendi 1", totais de estoque e exportação para CSV

### Estado atual

| Item | Situação |
|---|---|
| Loja, filtros, coleções, QR code, painel | ✅ Funcionando |
| Pokémon + Riftbound, selados e acessórios | ✅ Funcionando |
| Busca automática de cartas | ⚠️ Só Pokémon (Riftbound é manual) |
| Consulta de preço na LigaPokémon | ⚠️ Instável: pode ser bloqueada em servidores (ex.: Vercel) |
| Botão flutuante e envio de pedido por WhatsApp | ✅ Ativos (interruptores em `lib/features.ts`) |
| Testes automatizados | ❌ Ainda não existem |
| Pagamento online | ❌ Fora do escopo por enquanto |

### Tecnologias

[Next.js 16](https://nextjs.org/) (App Router) · React 19 · TypeScript · Tailwind CSS 4 · [Supabase](https://supabase.com/) (Postgres, Auth, Storage) · [Vercel](https://vercel.com/)

### Como rodar localmente

Requisitos: Node.js 20+ e um projeto no Supabase.

```bash
git clone https://github.com/AkiraLeco/vino-cards.git
cd vino-cards
npm install
cp .env.example .env.local   # no Windows PowerShell: Copy-Item .env.example .env.local
npm run dev
```

Abra http://localhost:3000.

**Variáveis de ambiente** (`.env.local`):

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública (*publishable/anon*) do Supabase. **Nunca** use a `service_role` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número do vendedor, só dígitos com DDI e DDD (ex.: `5511999999999`) |
| `NEXT_PUBLIC_STORE_NAME` | Nome da loja |
| `NEXT_PUBLIC_SITE_URL` | (Opcional) Endereço público usado no QR code |

### Configurando o Supabase

1. Crie um projeto e, no **SQL Editor**, execute [`supabase/schema.sql`](supabase/schema.sql) (tabela, políticas de segurança e bucket de fotos).
2. Se você já tinha uma versão antiga do banco, execute também [`supabase/migrations/001_game_category.sql`](supabase/migrations/001_game_category.sql).
3. Em **Authentication → Users**, crie o usuário do vendedor.
4. Em **Authentication → Sign In / Providers**, **desative** "Allow new users to sign up".

### Deploy

Importe o repositório na Vercel, cadastre as mesmas variáveis de ambiente e publique. O arquivo `vercel.json` agenda uma chamada diária a `/api/keepalive` para evitar que o plano gratuito do Supabase pause o banco por inatividade.

### Segurança

- Qualquer pessoa pode **ler** os itens; só usuários autenticados podem **escrever** (Row Level Security no Supabase).
- Nunca envie o `.env.local` ao Git (já está no `.gitignore`).

### Limitações e avisos

- A consulta de preço lê páginas públicas da LigaPokémon, que **não oferece API oficial**. Pode quebrar sem aviso e deve ser usada com moderação, respeitando os termos do site.
- Projeto independente, **sem vínculo** com The Pokémon Company, Riot Games/Riftbound ou LigaPokémon. Nomes e imagens de cartas pertencem aos seus respectivos donos.

### Roadmap

- [x] Reativar o envio de pedido por WhatsApp
- [ ] Domínio próprio
- [ ] Testes automatizados
- [ ] Fonte de dados para cartas de Riftbound
- [ ] Mais painéis de estoque e relatórios

---

## 🇺🇸 English

An online storefront for a seller of **Pokémon TCG** and **Riftbound** cards, sealed products and accessories. The seller manages the inventory in a password-protected admin panel, and customers can browse, filter and check prices, condition and availability (including in person, on their phone, via a QR code).

### Features

**Public store**
- Menu per game: **Pokémon** and **Riftbound**, each with *Sealed Products*, *Single Cards* and *Collections*, plus an **Accessories** tab
- Filters by set/collection, rarity, condition (M/NM/SP/MP/HP/D), language and price range, with sorting and pagination
- Item status: available, reserved or sold (reserved items show a badge)
- Card page with a large photo, price, condition and details; link previews when shared
- Cart saved in the browser
- `/qr` page with the site's QR code (download PNG and print)
- Responsive layout (phone and desktop), with collapsible filters on mobile

**Seller panel (`/admin`)**
- Email and password login (Supabase Auth)
- Create and edit cards, sealed products and accessories
- Pokémon card lookup through the [Pokémon TCG API](https://pokemontcg.io/) (fills name, set, number, rarity and image)
- Price lookup button for LigaPokémon (unofficial scraping, see limitations)
- Photo upload straight from the browser, with compression
- One-tap status change, a "Sold 1" button, stock totals and CSV export

### Current status

| Item | Status |
|---|---|
| Store, filters, collections, QR code, admin panel | ✅ Working |
| Pokémon + Riftbound, sealed products and accessories | ✅ Working |
| Automatic card lookup | ⚠️ Pokémon only (Riftbound is manual) |
| LigaPokémon price lookup | ⚠️ Unreliable: may be blocked from servers (e.g. Vercel) |
| Floating WhatsApp button and WhatsApp order | ✅ Enabled (switches in `lib/features.ts`) |
| Automated tests | ❌ None yet |
| Online payments | ❌ Out of scope for now |

### Tech stack

[Next.js 16](https://nextjs.org/) (App Router) · React 19 · TypeScript · Tailwind CSS 4 · [Supabase](https://supabase.com/) (Postgres, Auth, Storage) · [Vercel](https://vercel.com/)

### Running locally

Requirements: Node.js 20+ and a Supabase project.

```bash
git clone https://github.com/AkiraLeco/vino-cards.git
cd vino-cards
npm install
cp .env.example .env.local   # on Windows PowerShell: Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000.

**Environment variables** (`.env.local`):

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public (*publishable/anon*) key. **Never** use the `service_role` key |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Seller's number, digits only with country and area code (e.g. `5511999999999`) |
| `NEXT_PUBLIC_STORE_NAME` | Store name |
| `NEXT_PUBLIC_SITE_URL` | (Optional) Public address used for the QR code |

### Supabase setup

1. Create a project and, in the **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql) (table, security policies and photo bucket).
2. If you already had an older version of the database, also run [`supabase/migrations/001_game_category.sql`](supabase/migrations/001_game_category.sql).
3. In **Authentication → Users**, create the seller's user.
4. In **Authentication → Sign In / Providers**, **turn off** "Allow new users to sign up".

### Deploy

Import the repository into Vercel, add the same environment variables and deploy. `vercel.json` schedules a daily call to `/api/keepalive` so the free Supabase plan does not pause the database for inactivity.

### Security

- Anyone can **read** items; only authenticated users can **write** (Row Level Security in Supabase).
- Never commit `.env.local` to Git (it is already in `.gitignore`).

### Limitations and notices

- The price lookup reads public LigaPokémon pages. They **offer no official API**, so it may break without notice and should be used sparingly, respecting the site's terms.
- Independent project, **not affiliated** with The Pokémon Company, Riot Games/Riftbound or LigaPokémon. Card names and images belong to their respective owners.

### Roadmap

- [x] Re-enable WhatsApp ordering
- [ ] Custom domain
- [ ] Automated tests
- [ ] Data source for Riftbound cards
- [ ] More inventory dashboards and reports
