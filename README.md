# CashBack — Desafio dos 100 Depósitos

Aplicação web progressiva (PWA) para acompanhar o desafio dos 100 depósitos até alcançar a meta de **R$ 6.000,00**, com persistência local (`localStorage`), backup/restauração em JSON, exportação em CSV e suporte offline.

## Recursos

- **Grade de 100 depósitos** (`R$ 30` a `R$ 100`) totalizando `R$ 6.000`
- **Persistência automática** no navegador (`app_cashback_6k`)
- **Backup e restauração** via arquivo `.json` e exportação em `.csv`
- **Sorteio de próximo depósito** por faixa de valor e filtros por status/valor
- **PWA instalável** em Android, iOS e Desktop com funcionamento offline

## Desenvolvimento Local

```bash
npm install
npm run dev
```

Para gerar o build de produção e validar os tipos:

```bash
npm run lint
npm run build
```

## Deploy no GitHub + Netlify

1. Envie este repositório para o GitHub (`git init`, `git add .`, `git commit`, `git push`).
2. No painel do **Netlify**, clique em **Add new site > Import an existing project** e conecte o repositório do GitHub.
3. O arquivo `netlify.toml` já configura automaticamente:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `22`
   - **Cabeçalhos PWA** para `sw.js`, `manifest.webmanifest` e redirecionamento SPA.
