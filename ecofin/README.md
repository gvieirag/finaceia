# EcoFin — como publicar e usar no celular

App de finanças por conversa. Front-end estático (sem build) + uma função serverless que guarda sua chave da Anthropic no servidor. Os dados ficam **no seu aparelho** (localStorage do navegador).

## Estrutura
```
ecofin/
├─ index.html        ← o app inteiro
├─ api/parse.js      ← função serverless (proxy da API; segura a chave)
├─ manifest.json     ← config do PWA
├─ sw.js             ← service worker (abre offline)
├─ icon-192.png / icon-512.png / apple-touch-icon.png
```

## Pré-requisitos
1. Conta grátis no Vercel (vercel.com). O plano Hobby cobre uso pessoal de sobra.
2. Uma chave de API da Anthropic, criada em console.anthropic.com → seção de API Keys.
   **Importante:** defina um limite de gasto na sua conta da Anthropic antes de usar. Mesmo barato, é a sua chave.

## Publicar — caminho mais simples (CLI)
1. Instale o Node.js (nodejs.org) se não tiver.
2. No terminal, dentro da pasta `ecofin`:
   ```
   npm i -g vercel
   vercel
   ```
   Faça login quando pedir. Quando perguntar o framework, escolha **Other**. Não há comando de build.
3. Configure a chave (uma vez):
   ```
   vercel env add ANTHROPIC_API_KEY
   ```
   Cole a chave e marque os ambientes (Production etc.). Depois rode `vercel --prod` para publicar a versão final com a chave ativa.

## Publicar — alternativa (sem terminal)
1. Suba a pasta `ecofin` para um repositório no GitHub.
2. Em vercel.com → **Add New → Project** → importe o repositório. Framework Preset: **Other**.
3. Em **Settings → Environment Variables**, adicione `ANTHROPIC_API_KEY` com o valor da sua chave.
4. Faça **Redeploy** (a função só enxerga a variável depois de um deploy novo).

## Instalar no celular
Abra a URL que o Vercel te deu, no navegador do celular:
- **iPhone (Safari):** botão Compartilhar → "Adicionar à Tela de Início".
- **Android (Chrome):** menu (⋮) → "Adicionar à tela inicial" / "Instalar app".

Vira um ícone e abre em tela cheia, como um app.

## Coisas que você deve saber
- **Dados são locais.** Ficam só nesse navegador/aparelho. Limpar os dados do site, ou trocar de celular, apaga o histórico. Não há sincronização entre dispositivos (isso exigiria um backend de verdade — dá pra adicionar depois).
- **Modelo.** Em `api/parse.js` está usando `claude-haiku-4-5-20251001` (rápido e barato). Se o parsing errar muito, troque por `claude-sonnet-4-6` na mesma linha e faça redeploy.
- **Offline.** O app abre offline e registra gastos pelo parser local de reserva; a interpretação mais esperta (LLM) só funciona com internet.
- **Voz** depende do navegador (vai bem no Chrome; pode não existir em outros).
