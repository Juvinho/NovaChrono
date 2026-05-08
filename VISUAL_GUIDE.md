# 🎬 Exemplos Visuais - UI/UX do Composer

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                        CHRONO FEED - COMPOSER ENHANCED                        ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

---

## 📸 Estado 1: Composer Vazio

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│ Avatar  [Escreva um post]                                   │
│         (textarea vazio)                                     │
│                                                              │
│ [🖼]  [📊]  [😊]              [ Publicar ]  ← DESABILITADO  │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Estado:
- Textarea: vazio
- Botões: cinza neutro, sem ativo
- Publicar: desabilitado (opacity 0.4)
- Nenhum preview, picker ou builder visível
```

---

## 📸 Estado 2: Composer com Foto

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│ Avatar  [A chuva neon refletida]                            │
│                                                              │
│ ┌────────────────────────────────────────────┐              │
│ │                                            │              │
│ │      [Imagem preview com radius 14px]  ×  │   ← remover  │
│ │                                            │  (hover: red)│
│ │                                            │              │
│ └────────────────────────────────────────────┘              │
│                                                              │
│ [🖼]  [📊]  [😊]              [ Publicar ]  ← HABILITADO   │
│  ↑                                                            │
│  hover: roxo claro                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Estado:
- Preview renderizado com slideUp anim
- Botão foto: hover state roxo
- Publicar: habilitado (opaco 1)
- Image armazenada em memory (dataURL)
```

---

## 📸 Estado 3: Emoji Picker Aberto

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│ Avatar  [Adoro esse tema]                                   │
│                                                              │
│          ┌─────────────────────┐                            │
│          │ 😀  😎  🔥  💀  🚀  🧠 │  ← Picker flutuante    │
│          │ 👁️  ⚡  ❤️  🫠  👀  🤖 │    (popover)          │
│          │ 🌌  🕳️  🧵  📡  🌀  🫀 │                        │
│          └─────────────────────┘                            │
│                                                              │
│ [🖼]  [📊]  [😊]  ← ATIVO (roxo brilho)                    │
│              Publicar   ← botão aqui                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Estado:
- Picker: absolute positioned above buttons
- Grid: 6 colunas × 3 linhas = 18 emojis
- Botão emoji: classe .active (roxo glow)
- Hover em emoji: scale 1.1, fundo roxo
- Close: ESC, click fora, ou clicar emoji
```

---

## 📸 Estado 4: Poll Builder Aberto

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│ Avatar  [qual tema combina mais?]                           │
│                                                              │
│  ┌──────────────────────────────────────────┐               │
│  │ NOVA ENQUETE                             │ ← Title       │
│  │                                          │               │
│  │ [Pergunta: Qual tema combina... ]        │ ← Input       │
│  │                                          │               │
│  │ [Opção 1: Cidade vertical             ] │ ← Removível?  │
│  │ [Opção 2: Megacorp                    ] │   (para opt3+)│
│  │ [Opção 3: Ruína sintética           ] − │ ← Removedor   │
│  │ [Opção 4: Conceito X                ] − │               │
│  │ [Opção 5: Y                          ] − │               │
│  │                                          │               │
│  │ [+ Adicionar opção]  ← Desabilitado    │               │
│  │                                          │               │
│  │ ☑ Encerrar automaticamente em 24h       │               │
│  │                                          │               │
│  │ [Remover enquete]  ← Vermelho           │               │
│  └──────────────────────────────────────────┘               │
│                                                              │
│ [🖼]  [📊]  [😊]  ← ATIVO (roxo brilho)                    │
│              [ Publicar ]  ← HABILITADO                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Estado:
- Builder: slideUp animation ao abrir
- Background: rgba(255,255,255,0.02) + border sutil
- Inputs: focus state roxo
- Removedor: vermelho (rgba(255,59,48))
- Auto-close: checkbox funcional
- Botão enquete: .active (roxo glow)
- Publicar: habilitado se 2+ opções
```

---

## 📸 Estado 5: Post com Enquete no Feed

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  Avatar  @usuario                    • há 2 min               │
│                                                                │
│  Qual tema combina mais?                                      │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Cidade vertical             ████████████░░░░░ 63%     │  │
│  │ Megacorp                    ████░░░░░░░░░░░░░░░░░░░░  25% │
│  │ Ruína sintética  ← VOTADO   ███░░░░░░░░░░░░░░░░░░░░░  12% │
│  │                                                        │  │
│  │ 12 votos • Enquete ativa                              │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  [❤️ 342] [💬 12] [↗ 8] [📑 3]                                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘

Estado:
- Pergunta renderizada no topo
- Opções eram clicáveis (não mais após votação)
- Barra de preenchimento roxo com % calculado
- Opção votada com highlight .voted + pulse animation
- Meta com status "Enquete ativa"
- Não há botão remover/editar (apenas view)
```

---

## 📸 Estado 6: Enquete Encerrada

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  Avatar  @usuario                    • há 1 dia               │
│                                                                │
│  Qual theme combina mais?                                     │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Cidade vertical             ████████████░░░░░ 63%     │  │
│  │ Megacorp                    ████░░░░░░░░░░░░░░░░░░░░  25% │
│  │ Ruína sintética             ███░░░░░░░░░░░░░░░░░░░░░  12% │
│  │                                                        │  │
│  │ 12 votos • Enquete encerrada    ← Status muda        │  │
│  └────────────────────────────────────────────────────────┘  │
│     ↑ Pointer-events: none (não clicável)                    │
│                                                                │
│  [❤️ 342] [💬 12] [↗ 8] [📑 3]                                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘

Estado:
- Opções desativadas
- CSS: pointer-events: none
- Status: "Enquete encerrada"
- Visual: mais opaco/desfocado
```

---

## 📸 Estado 7: Múltiplas Funcionalidades Combinadas

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│ Avatar  [Neon refletido na chuva 🔥]                           │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                                                        │  │
│  │     [Imagem foto preview com radius 14px]         ×  │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ NOVA ENQUETE                                           │  │
│  │ [Qual conceito? ]                                      │  │
│  │ [Conceito A ] [Conceito B ] [Conceito C ]          − │  │
│  │ [+ Adicionar opção]                                    │  │
│  │ ☑ Encerrar em 24h  [Remover enquete]                 │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│ [🖼]  [📊]  [😊]              [ Publicar ]  ← HABILITADO     │
│  ↑ Hover roxo              (texto + foto + enquete válida)   │
│                                                                │
└────────────────────────────────────────────────────────────────┘

Estado:
- 3 elementos simultâneos: foto + texto + enquete
- Botões: nenhum ativo (foi-se retrair)
- Publicar: habilitado (3 critérios atendidos)
- Tudo dentro do composer
- Layout limpo e não apertado
```

---

## 🎨 Paleta de Cores & Hover States

```
BOTÕES DO COMPOSER
──────────────────────────────────────────

Normal:
  Background: transparent
  Border: transparent
  Color: rgb(123, 128, 160) [--color-text-muted]

Hover:
  Background: rgba(124, 90, 240, 0.08)
  Border: 1px solid rgba(124, 90, 240, 0.2)
  Color: rgb(147, 112, 255) [--color-primary-hover]
  Transition: 0.2s ease

Ativo (builder/picker aberto):
  Background: rgba(124, 90, 240, 0.12)
  Border: 1px solid rgba(124, 90, 240, 0.4)
  Color: rgb(124, 90, 240) [--color-primary]
  Box-shadow: 0 0 8px rgba(124, 90, 240, 0.3)  ← roxo glow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMOJI PICKER
──────────────────────────────────────────

Background: rgba(10, 11, 20, 0.98)
Border: 1px solid rgba(255, 255, 255, 0.08)
Box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4)
Backdrop-filter: blur(10px)

Emoji Button Hover:
  Background: rgba(124, 90, 240, 0.15)
  Transform: scale(1.1)
  Transition: 0.2s ease

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POLL BUILDER
──────────────────────────────────────────

Background: rgba(255, 255, 255, 0.02)
Border: 1px solid rgba(255, 255, 255, 0.06)

Inputs (normal):
  Background: rgba(255, 255, 255, 0.02)
  Border: 1px solid rgba(255, 255, 255, 0.08)
  Color: var(--color-text)

Inputs (focus):
  Background: rgba(124, 90, 240, 0.08)
  Border: 1px solid rgba(124, 90, 240, 0.4)
  Outline: none

Add Option Button:
  Border: 1px dashed rgba(124, 90, 240, 0.3)
  Color: var(--color-primary)

Hover Add Option:
  Background: rgba(124, 90, 240, 0.08)
  Border-color: rgba(124, 90, 240, 0.5)

Remove Buttons (roxo → vermelho):
  Background: rgba(255, 59, 48, 0.08)
  Border: 1px solid rgba(255, 59, 48, 0.3)
  Color: rgb(255, 59, 48)

Hover Remove:
  Background: rgba(255, 59, 48, 0.2)
  Border-color: rgba(255, 59, 48, 0.6)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POLL CARD (FEED)
──────────────────────────────────────────

Option Normal:
  Background: rgba(255, 255, 255, 0.02)
  Border-radius: 8px
  Cursor: pointer

Option Hover:
  Background: rgba(124, 90, 240, 0.1)

Option Votada (.voted):
  Background: rgba(124, 90, 240, 0.15)
  Border: 1px solid rgba(124, 90, 240, 0.4)

Barra Preenchimento:
  Background: linear-gradient(90deg, 
    rgba(124, 90, 240, 0.95), 
    rgba(147, 112, 255, 0.95))
  Transition: width 280ms cubic-bezier(0.2, 0.9, 0.3, 1)

```

---

## ⌨️ Teclado & Atalhos

```
ESC
  → Se emoji picker aberto, fecha
  → Volta foco ao textarea

ENTER (no emoji picker)
  → Clica emoji automaticamente (implementável)

TAB
  → Navega entre inputs do poll builder
  → Sai do builder se no botão remover

CTRL+Enter (em textarea)
  → Poderia publicar (não implementado, deixar para o usuário)

CLIQUE FORA
  → Emoji picker fecha
  → Poll builder fica aberto (mantém estado)
```

---

## 🎬 Animações Timeline

```
FOTO PREVIEW ENTRA
──────────────────────────────────────────
   0ms  → opacity: 0, transform: translateY(8px)
 240ms  → opacity: 1, transform: translateY(0)
        → @keyframes slideUp
        → cubic-bezier(0.34, 1.56, 0.64, 1)

EMOJI PICKER ENTRA
──────────────────────────────────────────
   0ms  → opacity: 0, scale: 0.92, translateY(8px)
 200ms  → opacity: 1, scale: 1, translateY(0)
        → @keyframes popUp
        → cubic-bezier(0.34, 1.56, 0.64, 1)

POLL BUILDER ENTRA
──────────────────────────────────────────
   0ms  → opacity: 0, translateY(8px)
 240ms  → opacity: 1, translateY(0)
        → @keyframes slideUp

BARRA DE % ANIMA (AO VOTAR)
──────────────────────────────────────────
   0ms  → width: 0%
 280ms  → width: 63%
        → cubic-bezier(0.2, 0.9, 0.3, 1)
        → smooth easing

PULSE AO VOTAR
──────────────────────────────────────────
   0ms  → opacity: 1
 150ms  → opacity: 0.7
 300ms  → opacity: 1
        → @keyframes pulse (1 ciclo)

BOTÃO HOVER
──────────────────────────────────────────
   0ms  → background: transparent
 200ms  → background: rgba(124,90,240,0.08)
 200ms  → color: var(--color-primary-hover)
        → ease (padrão)
```

---

## 📊 Estrutura de Dados Visual

```
ComposerState
──────────────────────────────────────────
{
  text: string,           // "O que esta acontecendo?"
  image: string|null,     // "data:image/png;base64,..." ou null
  poll: {
    question: string,     // "Qual tema?" ou ""
    options: [            // min 2, max 5
      "Cidade vertical",
      "Megacorp",
      "Ruína"
    ],
    autoClose24h: bool    // true → closesAt = Date.now() + 24h
  } | null,
  emojiPickerOpen: bool,  // picker visível?
  pollBuilderOpen: bool   // builder visível?
}

PostStore Item (com poll)
──────────────────────────────────────────
{
  id: "new-123456",
  user: "@usuario",
  avatar: "url",
  time: "agora",
  text: "Qual tema combina?",
  image: "data:image/..." (optional),
  poll: {
    question: "Qual tema combina?",
    options: [
      { id: "opt-0", text: "Cidade", votes: 5 },
      { id: "opt-1", text: "Mega", votes: 3 },
      { id: "opt-2", text: "Ruína", votes: 8 }
    ],
    totalVotes: 16,
    userVote: "opt-2",      // seu voto
    closed: false,
    closesAt: 1744329600000 // timestamp
  },
  verified: true,
  source: "composer",
  metrics: { comments: 0, reposts: 0, likes: 0 },
  state: { repost: false, like: false, bookmark: false }
}

PollSystem Internal State
──────────────────────────────────────────
_userVotes: {
  "new-123456": "opt-2",  // postId → optionId
  "new-123457": "opt-0"
}
```

---

## 🔄 Logic Flow Diagrams

```
PUBLISH FLOW
──────────────────────────────────────────

 Clica "Publicar"
        ↓
 addNewPost()
        ↓
 Coleta state (text, image, poll)
        ↓
 if !text && !image && !poll → return
        ↓
 if poll && options.length < 2 → alert + return
        ↓
 Cria newPost com todos os campos
        ↓
 applyPostMetadata()
        ↓
 postStore.unshift(newPost)
        ↓
 createPostCardElement() renderiza
        ↓
 if poll → setupPollVoting()  (attach listeners)
        ↓
 feedList.prepend(newCard)
        ↓
 ComposerController.reset()  (limpa tudo)
        ↓
 updatePublishState()  (botão desabilita novamente)
        ↓
 Scroll para topo

VOTING FLOW
──────────────────────────────────────────

 User clica opção
        ↓
 .poll-option-interactive click listener
        ↓
 if already voted → return
        ↓
 if closed → return
        ↓
 post.poll.options[idx].votes++
        ↓
 post.poll.totalVotes++
        ↓
 post.poll.userVote = optionId
        ↓
 PollSystem.vote(postId, optionId)
        ↓
 PollSystem.updateUI(postEl)
        ↓
 Para cada opção:
   - Calcula %: (votes / totalVotes) * 100
   - Anima .poll-option-fill width
   - Atualiza .poll-option-percent
   - Adiciona classe .voted se this é o voto
        ↓
 Atualiza .poll-status-text
        ↓
 UI mostra nova % em tempo real

EMOJI INSERT FLOW
──────────────────────────────────────────

 User clica emoji button
        ↓
 toggleEmojiPicker()
        ↓
 openEmojiPicker()
        ↓
 EmojiPicker.render(container)
        ↓
 Para cada emoji:
   - Cria <button class="emoji-btn">
   - Attach click listener
        ↓
 Picker renderizado (popUp anim)
        ↓
 Botão emoji fica .active (roxo glow)
        ↓
 User clica emoji
        ↓
 emoji button click listener
        ↓
 ComposerController.insertEmoji()
        ↓
 Capta textarea.selectionStart/End
        ↓
 Monta novo texto: before + emoji + after
        ↓
 textarea.value = newText
        ↓
 textarea.focus()
        ↓
 setSelectionRange(newStart, newStart)
        ↓
 EmojiPicker.close()
        ↓
 updatePublishState() (talvez habilite botão publicar)
```

---

## 🎯 Checklist Visual para Testes

```
VISUAL ELEMENTS
✅ Botão foto: cinza normal, roxo hover
✅ Preview foto: radius 14px, border sutil
✅ Botão emoji: cinza normal, roxo hover
✅ Picker emoji: grid 6×3, popover elegante
✅ Botão enquete: cinza normal, roxo hover
✅ Builder enquete: inputs com focus roxo
✅ Poll card: opções clicáveis antes de votar
✅ Barra %: roxo gradiente, anima suave
✅ Opção votada: highlight roxo
✅ Status: "X votos • Status"

INTERACTIONS
✅ Foto: abre seletor, mostra preview, remove
✅ Emoji: picker abre flutuante, insere no cursor, fecha
✅ Enquete: builder abre, adiciona opções, remove opções
✅ Votação: clica opção, % atualiza, bloqueia 2º voto
✅ Publish: enable/disable conforme validação
✅ Reset: tudo limpa após publicar

ANIMATIONS
✅ Preview entra slideUp
✅ Picker entra popUp
✅ Builder entra slideUp
✅ Barra % anima 280ms
✅ Opção votada pulse
✅ Hover buttons fluido
```

---

**Tudo funcionando como no mockup! 🎨✨**
