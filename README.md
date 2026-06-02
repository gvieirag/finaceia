EcoFin
Finanças pessoais no modo conversa. Você registra gastos escrevendo (ou falando) em linguagem natural — "almoço 30 reais", "uber 18 ontem" — e o app interpreta, categoriza e mostra para onde seu dinheiro está indo.
É um PWA (instala no celular como app), estático, sem etapa de build. A única parte com servidor é uma função pequena que guarda a chave da API e faz o proxy para a Anthropic. Os dados financeiros ficam no seu aparelho.
---
O que dá pra fazer
Conversa — registre gastos em linguagem natural. O app extrai valor, categoria e data ("gastei 45 com pizza ontem" → R$ 45, Alimentação, data de ontem). Também responde perguntas: "quanto gastei esse mês?", "quanto foi em transporte?".
Relatório — total do mês, gráfico de rosca por categoria, lista de lançamentos (com categoria editável e botão de excluir) e navegação entre meses.
Fixos — cadastre gastos recorrentes (aluguel, assinaturas) e marque como pago/não pago a cada mês.
Limites — defina um teto por categoria ou um limite geral do mês. Cada limite tem uma barra de progresso (verde → âmbar a partir de 80% → vermelho se estourar). Ao registrar um gasto no chat, a confirmação mostra a barra enchendo até onde você está. Limites também podem ser criados pela conversa: "não gastar mais de 500 com compras".
Voz — botão de microfone para ditar o lançamento (depende do navegador; vai bem no Chrome).
Offline — o app abre sem internet e, quando o interpretador inteligente (LLM) não responde, um parser local de reserva ainda registra o gasto.
---
Como funciona
```
Navegador (index.html)
   │  escreve "almoço 30 reais"
   ▼
/api/parse  (função serverless na Vercel)
   │  injeta a chave da Anthropic (variável de ambiente)
   ▼
API da Anthropic  → devolve JSON estruturado
   │
   ▼
Navegador aplica o resultado e salva no localStorage
```
A chave nunca chega ao navegador. Ela vive só no servidor, como variável de ambiente. O front-end fala apenas com `/api/parse`, na mesma origem.
Parser de reserva. Se a função falhar (sem internet, sem chave), `localParse()` extrai o valor por regex e registra como "Outros" no modo offline.
Service worker rede-primeiro. O `index.html` é sempre buscado da rede quando há internet (cai no cache só offline), então atualizações aparecem assim que você publica. Ícones e manifest ficam em cache para abrir rápido.
---
Estrutura
```
ecofin/
├─ index.html        ← o app inteiro (UI + lógica, sem dependências externas além das fontes)
├─ api/
│  └─ parse.js       ← função serverless: proxy da API, segura a chave
├─ manifest.json     ← configuração do PWA
├─ sw.js             ← service worker (offline + estratégia de cache)
├─ icon-192.png
├─ icon-512.png
├─ apple-touch-icon.png
└─ README.md
```
Categorias usadas: Alimentação, Transporte, Mercado, Moradia, Saúde, Lazer, Compras, Contas/Serviços, Educação, Outros.
---
Pré-requisitos
Conta gratuita na Vercel (vercel.com). O plano Hobby cobre uso pessoal de sobra.
Uma chave de API da Anthropic, criada em console.anthropic.com → API Keys.
Defina um limite de gasto na conta da Anthropic antes de usar (em dólar). Mesmo barato, é a sua chave.
Nunca exponha a chave em prints, commits ou mensagens. Se vazar, revogue e gere outra.
---
Publicar
Caminho mais simples (terminal)
Dentro da pasta `ecofin`:
```bash
npm i -g vercel
vercel                       # faça login; framework: Other (sem build)
vercel env add ANTHROPIC_API_KEY   # cole a chave SÓ no campo de valor
vercel --prod                # publica a versão final, já com a chave ativa
```
Detalhe do `env add`: ele pergunta primeiro o nome (digite `ANTHROPIC_API_KEY`) e depois o valor (cole a chave `sk-ant-...`). Não cole a chave no campo do nome.
Alternativa (sem terminal, via GitHub)
Suba a pasta para um repositório no GitHub.
Em vercel.com → Add New → Project → importe o repositório. Framework Preset: Other.
Em Settings → Environment Variables, adicione `ANTHROPIC_API_KEY`.
Faça Redeploy (a função só enxerga a variável depois de um deploy novo). Daí em diante, cada push no GitHub redeploya sozinho.
Atualizar depois de uma mudança
Substitua o arquivo alterado na pasta e rode `vercel --prod` (ou dê push no GitHub). Como o service worker é rede-primeiro, a versão nova aparece ao recarregar.
> Na **primeira** troca de service worker, o antigo ainda controla a página. Force uma vez: desktop `Ctrl + Shift + R`; celular, remova o ícone da tela inicial e adicione de novo. Depois disso, atualiza sozinho.
---
Instalar no celular
Abra a URL que a Vercel deu, no navegador do celular:
iPhone (Safari): Compartilhar → "Adicionar à Tela de Início".
Android (Chrome): menu ⋮ → "Instalar app" / "Adicionar à tela inicial".
Abre em tela cheia, com ícone próprio, como um app nativo.
---
Configuração
Modelo. Em `api/parse.js`, o padrão é `claude-haiku-4-5-20251001` (rápido e barato). Se o parsing errar categoria ou data com frequência, troque por `claude-sonnet-4-6` na mesma linha e faça redeploy.
Persistência. Dados ficam no `localStorage` sob a chave `ecofin-data-v1` (transações, limites e gastos fixos).
Cache. A versão do cache fica em `sw.js` (`ecofin-v2`). O cache antigo é descartado automaticamente quando o service worker novo assume.
---
Privacidade e segurança
Dados são locais. Ficam só nesse navegador/aparelho. Limpar os dados do site, ou trocar de celular, apaga o histórico. Não há sincronização entre dispositivos.
A chave fica no servidor, nunca no navegador.
URL pública. Depois de publicada, a URL é acessível por quem a tiver, e `/api/parse` aceita requisições de quem chamar. Para uso pessoal tudo bem, mas como chamadas consomem a sua chave, o limite de gasto na Anthropic é a sua rede de proteção. Para travar o acesso, dá pra exigir um token simples em `parse.js`.
O texto enviado ao registrar/perguntar trafega até a API da Anthropic para ser interpretado — ou seja, não é 100% local nesse ponto.
---
Limitações conhecidas
Sem conta e sem sincronização entre aparelhos (resolveria com um backend, ao custo de não ser mais "tudo no aparelho").
O interpretador inteligente exige internet; offline, só o parser de reserva (menos preciso, categoria "Outros").
Reconhecimento de voz depende do navegador e pode não existir em alguns.
---
Stack
HTML/CSS/JS puro (sem framework, sem build), função serverless em Node na Vercel, API da Anthropic para interpretação de linguagem natural. Fontes: Fraunces e Hanken Grotesk (Google Fonts).
