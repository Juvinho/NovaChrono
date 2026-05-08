# 🧪 Testes de Validação - Composer Features

Siga este checklist para validar que tudo funciona corretamente.

---

## ✅ Teste 1: Foto

### Setup:
1. Abra `chrono-feed.html` no navegador
2. Localize o composer no topo do feed

### Teste:
- [ ] Clique no botão foto (ícone imagem)
- [ ] Seletor de arquivo abre
- [ ] Selecione uma imagem PNG/JPEG/WebP/GIF
- [ ] Preview aparece abaixo do textarea com suavidade
- [ ] Hover no preview mostra botão "×" em vermelho
- [ ] Clique "×" remove preview
- [ ] Botão "Publicar" fica **desabilitado sem texto**
- [ ] Digite texto qualquer
- [ ] Clique "Publicar"
- [ ] Post aparece no feed **com a imagem**
- [ ] Composer reseta (vazio)

### Validações:
- ✅ Apenas imagem sem texto = publicação bloqueada (botão desabilitado)
- ✅ Preview tem radius 14px e border sutil
- ✅ Fade animado ao entrar/sair
- ✅ Imagem renderiza no post como `.post-image`

---

## ✅ Teste 2: Emoji

### Setup:
1. Clique no campo do composer (textarea)

### Teste:
- [ ] Clique no botão emoji (ícone smile)
- [ ] Picker flutuante aparece com grid de emojis
- [ ] Picker tem grid 6 colunas
- [ ] Emojis: 😀 😎 🔥 💀 🚀 🧠 👁️ ⚡ ❤️ 🫠 👀 🤖 🌌 🕳️ 🧵 📡 🌀 🫀 (18 total)
- [ ] Hover em emoji muda cor/escala
- [ ] Digite texto: "teste"
- [ ] Clique emoji 🔥
- [ ] Texto muda para: "teste🔥"
- [ ] Picker fecha automático após clicar
- [ ] Click fora picker fecha
- [ ] Pressione ESC, abre picker novamente
- [ ] Pressione ESC, fecha picker

### Validações:
- ✅ Emoji inserido na posição correta
- ✅ Foco volta ao textarea após inserir
- ✅ PopUp animation ao abrir (zoom + fade)
- ✅ Botão emoji fica ativo (roxo brilho) quando picker aberto
- ✅ Sem lag ao renderizar

---

## ✅ Teste 3: Enquete - Criação

### Setup:
1. Limpe o composer

### Teste Criação:
- [ ] Clique botão enquete (ícone bar-chart)
- [ ] Bloco expandido aparece dentro composer (antes "Publicar")
- [ ] Botão enquete fica **ativo** (roxo brilho)
- [ ] Campo "Pergunta" vazio
- [ ] Campo Opção 1 e Opção 2 vazios
- [ ] Botão "+ adicionar opção" habilitado
- [ ] Preencha:
  - Pergunta: "Qual tema combina mais?"
  - Opção 1: "Cidade vertical"
  - Opção 2: "Megacorp"
- [ ] Clique "+ adicionar opção"
- [ ] Opção 3 aparece com removedor (−)
- [ ] Digite: "Ruína sintética"
- [ ] Adicione opção 4 e 5
- [ ] Botão "+ adicionar opção" fica **desabilitado** (máximo 5)
- [ ] Remova opção 4 (clique −)
- [ ] "+ adicionar opção" volta habilitado
- [ ] Toggle "Encerrar em 24h" ON
- [ ] Botão "Publicar" fica **habilitado**
- [ ] Clique "Publicar"
- [ ] Post publicado com enquete
- [ ] Botão enquete volta desativo (cinza)
- [ ] Bloco enquete desaparece

### Teste Validação:
- [ ] Abra enquete novamente
- [ ] Remova opção 2
- [ ] Tente publicar → alerta: "A enquete precisa de pelo menos 2 opções"
- [ ] Adicione opção 2 novamente
- [ ] Clique "Remover enquete"
- [ ] Bloco fecha, botão enquete desativo
- [ ] Publish button fica **desabilitado** (sem texto, imagem, ou enquete)

### Validações:
- ✅ Mínimo 2 opções para publicar
- ✅ Máximo 5 opções totalizado
- ✅ Removedor (−) aparece apenas em opções 3+
- ✅ Auto-close tem checkbox funcional
- ✅ Estado é "ativo" quando builder aberto

---

## ✅ Teste 4: Enquete - Votação

### Setup:
1. Publique po st com enquete (veja Teste 3)
2. Localize o post no feed

### Teste Votação:
- [ ] Enquete renderiza com:
  - [ ] Pergunta no topo (se preenchida)
  - [ ] 3+ opções como cards clicáveis
  - [ ] Cada opção tem label e porcentagem
  - [ ] Rodapé com "X votos • Enquete ativa"
- [ ] Clique opção "Cidade vertical"
- [ ] Porcentagem muda para 100% (1 voto)
- [ ] Opção fica com **highlight roxo**
- [ ] Barra de preenchimento roxo aparece
- [ ] Pulse animation na opção (flicker rápido)
- [ ] Status muda para "1 voto • Enquete ativa"
- [ ] **Tente clicar outra opção** → nada acontece (já votou)
- [ ] Opção votada permanece com destaque
- [ ] Refresh página → você ainda está votado naquela opção (memory state)

### Com Auto-close 24h:
- [ ] Status mostra: "Encerra em 23h" (aproximado, depende do timestamp)
- [ ] Após 24h (simulação), opções ficam desgatilhadas
- [ ] Status muda para "Enquete encerrada"
- [ ] Clique em opção → sem efeito

### Validações:
- ✅ Opção clicável antes de votar
- ✅ Após voto, seção desativa
- ✅ Porcentagem correta (votes/totalVotes)
- ✅ Uma opção com _highlighted_ state
- ✅ Barra anima suavemente
- ✅ Lógica de auto-close funciona

---

## ✅ Teste 5: Estados Combinados

### Setup:
1. Composer vazio

### Teste 5.1: Foto + Texto
- [ ] Foto attachada
- [ ] Texto digitado
- [ ] Botão "Publicar" **habilitado**
- [ ] Publicar → post com imagem
- [ ] Composer reseta

### Teste 5.2: Enquete + Texto + Foto
- [ ] Abra enquete, preencha 2 opções
- [ ] Anexe foto
- [ ] Digite texto
- [ ] Todos 3 elementos visíveis
- [ ] Botão publicar **habilitado**
- [ ] Publicar
- [ ] Post tem imagem + enquete + texto
- [ ] Enquete votável
- [ ] Imagem renderizada

### Teste 5.3: Apenas Emoji
- [ ] Apague composer
- [ ] Insira emoji 🔥 (nada mais)
- [ ] Botão publicar fica **desabilitado**
- [ ] Digite texto
- [ ] Botão publicar fica **habilitado**
- [ ] Publicar → post com emoji no texto

### Validações:
- ✅ Lógica AND: (texto OR imagem OR enquete válida) = habilitado
- ✅ Estados combinados funcionam independentemente
- ✅ Reset completo após publicar

---

## ✅ Teste 6: UX & Visual

### Teste Botões:
- [ ] Botão foto em hover = roxo sutil + ícone claro
- [ ] Botão foto ativo (sobre preview) = roxo brilho
- [ ] Botão emoji em hover = roxo sutil
- [ ] Botão emoji ativo (picker aberto) = roxo brilho
- [ ] Botão enquete em hover = roxo sutil
- [ ] Botão enquete ativo (builder aberto) = roxo brilho

### Teste Preview:
- [ ] Foto preview tem border 1px sutil
- [ ] Foto preview tem radius 14px
- [ ] Foto preview entra com slideUp animation
- [ ] Removeré X maior ao hover

### Teste Picker:
- [ ] Emoji picker popUp animation ao abrir
- [ ] Picker centrado e flutuante
- [ ] Botões emoji com hover scale (1.1)
- [ ] Picker fecha com suavidade (fade-out)

### Teste Poll Builder:
- [ ] Inputs com focus state roxo
- [ ] Inputs com background darkm ao focar
- [ ] Botão "+ adicionar" com border dashed roxo
- [ ] Botão "remover opção" vermelho
- [ ] Botão "remover enquete" vermelho

### Validações:
- ✅ Tema escuro coerente
- ✅ Nenhum elemento branco/claro demais
- ✅ Transições suaves (0.2s ease)
- ✅ Sem lag ao renderizar

---

## ✅ Teste 7: Edge Cases

### Foto:
- [ ] Selecione foto, depois remova
- [ ] Publicar novamente com o texto
- [ ] Foto input fica **vazio** (file.value = '')
- [ ] GIF animado funciona (mostra estático)
- [ ] Imagem muito grande renderiza responsiva

### Enquete:
- [ ] Digite opção com **só espaços**: " " → trim → inválida
- [ ] Digite: "Opção 1 " (com espaço final) → trim remove
- [ ] Opções "iGual" e "IGUAL" detecta como duplicata
- [ ] Enquete com 0 votos mostra 0% em todas opções
- [ ] Múltiplos posts com enquetes não conflitam

### Emoji:
- [ ] Inserir emoji **no meio** de palavra: "teste" + cursor no meio + emoji = "testeXte"
- [ ] Inserir emoji no **final** de textarea
- [ ] Inserir emoji em **textarea vazia**

### Geral:
- [ ] Abra DevTools → console limpo (sem erros)
- [ ] Nenhuma exceção ao clicar botões
- [ ] Memory usage não cresce após múltiplos posts

---

## 📊 Relatório de Teste

### Checklist Final:
```
FOTO
- [ ] Preview funciona
- [ ] Remove funciona
- [ ] Renderiza no post
- [ ] Visual correto

EMOJI
- [ ] Picker abre
- [ ] Emoji insere
- [ ] Fecha com ESC
- [ ] Fecho com click fora
- [ ] Visual correto

ENQUETE - CRIAÇÃO
- [ ] Builder abre
- [ ] Validação mín-2
- [ ] Validação máx-5
- [ ] Removedor funciona
- [ ] Auto-close funciona
- [ ] Remove enquete funciona

ENQUETE - VOTAÇÃO
- [ ] Click em opção vota
- [ ] Porcentagem atualiza
- [ ] Highlight aparece
- [ ] Bloqueia 2º voto
- [ ] Status atualiza
- [ ] Auto-encerramento funciona

COMBINAÇÕES
- [ ] Foto + Texto
- [ ] Enquete + Foto + Texto
- [ ] Emoji em todos

UX
- [ ] Estados visuais corretos
- [ ] Animações suaves
- [ ] Tema escuro coerente

EDGE CASES
- [ ] Espaços trim
- [ ] Duplicatas detectadas
- [ ] Sem erros no console
```

---

## 🐛 Se Algo Não Funcionar

### Foto não aparece:
1. Console: `ComposerController.getState()` → { image: ? }
2. Verificar suporte de FileReader
3. Limpar cache

### Enquete não vota:
1. Console: `window.PollSystem` → deve existir
2. Verificar se `.poll-card-interactive` renderizou
3. Clicar post e verificar `getPostById(postId).poll`

### Botões não ficam ativos:
1. Verificar CSS: `.icon-btn.active`
2. Console: `document.getElementById('composerPhotoBtn')` → deve existir
3. CSS class `.active` está sendo adicionado?

### Visual errado:
1. Limpar cache: Ctrl+Shift+Del
2. F12 → Desabilitar cache
3. Hard refresh: Ctrl+F5

---

**Todos os 7 grupos de testes devem passar ✅**

Se 100% passar, implementação é **SUCESSO TOTAL** 🎉
