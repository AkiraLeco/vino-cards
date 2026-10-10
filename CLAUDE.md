# ⚠️ Atualizar o GitHub a cada alteração

**Toda vez que houver qualquer alteração no projeto, ela deve ser enviada ao GitHub imediatamente.**

O site é publicado pelo Vercel, que só atualiza quando recebe um novo commit do GitHub. Alteração que fica apenas no computador não aparece no site.

## Como fazer

Depois de terminar e validar a mudança (`npx tsc --noEmit` e `npm run lint`):

1. `git add` apenas os arquivos da alteração
2. `git commit` com uma mensagem clara
3. `git push` para a branch `main` (`origin` = https://github.com/AkiraLeco/vino-cards.git)

Não é preciso pedir confirmação a cada push: isso já está autorizado para este projeto.

## Observações

- Não incluir no commit arquivos não relacionados, nem segredos (`.env.local`).
- Se o push falhar, informar o motivo em vez de ignorar.

@AGENTS.md
