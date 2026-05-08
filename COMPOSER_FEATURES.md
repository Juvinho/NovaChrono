# Composer Enhanced Features - Chrono

## 🎯 Overview
Os três botões do composer (Foto, Enquete, Emoji) agora são totalmente funcionais com estado local e renderização em tempo real.

---

## 📸 Foto (Photo Button)

### Como funciona:
1. **Clicar no botão foto** (ícone de imagem)
2. **Selecionar imagem** (PNG, JPEG, WebP, GIF)
3. **Preview aparece** abaixo do textarea
4. **Remover?** Clique no botão "×" da preview
5. **Publicar** com a imagem anexada

### Características:
- ✅ Preview com border radius 14px
- ✅ Botão remover com efeito hover
- ✅ Armazenamento em dataURL (memory)
- ✅ Imagem renderizada no post publicado com classe `.post-image`
- ✅ Responsivo e otimizado
- ✅ FadeIn/fadeOut animado

### Estado no Post:
```javascript
{
  image: "data:image/png;base64,..." // dataURL
}
```

---

## 😊 Emoji (Emoji Button)

### Como funciona:
1. **Clicar no botão emoji** (ícone smile)
2. **Picker flutuante aparece** com grid de emojis
3. **Clicar emoji** para inserir no textarea
4. **Fechar picker**: click fora, ESC, ou clicar emoji novamente

### Características:
- ✅ 18 emojis curados: 😀 😎 🔥 💀 🚀 🧠 👁️ ⚡ ❤️ 🫠 👀 🤖 🌌 🕳️ 🧵 📡 🌀 🫀
- ✅ Grid responsivo 6 colunas
- ✅ Insere na posição atual do cursor
- ✅ Popup com efeito visual (popUp animation)
- ✅ Sem bibliotecas, código puro
- ✅ Escape key para fechar

### Visual:
- Background escuro com border
- Botões com hover sutil
- Animação de entrada suave
- Alinhado ao botão emoji

---

## 📊 Enquete (Poll Button)

### Como funciona:
1. **Clicar no botão enquete** (ícone bar-chart)
2. **Builder expandido** dentro do composer
3. **Preencher:**
   - Pergunta (opcional)
   - Opção 1, Opção 2 (mínimo)
   - Adicionar até 5 opções total
   - Toggle "Encerrar em 24h" (opcional)
4. **Publicar** post com enquete

### Criação de Enquete:

**Regras:**
- ✅ Mínimo 2 opções válidas (trim + não-vazio)
- ✅ Máximo 5 opções
- ✅ Sem opções vazias entre válidas
- ✅ Sem duplicatas (case-insensitive)
- ✅ Pergunta é opcional
- ✅ Auto-encerramento em 24h é opcional

**Validação:**
```javascript
// Sempre valida antes de publicar:
if (options.length < 2 || options.some(o => !o.trim())) {
  alert('A enquete precisa de pelo menos 2 opções.');
  return;
}
```

### Votação em Enquete Publicada:

**Como votar:**
1. **Ver post com enquete** no feed
2. **Clicar em uma opção** para votar
3. **UI atualiza instantaneamente** com:
   - % de votos para cada opção
   - Barra de preenchimento roxo
   - Opção votada com destaque

**Características:**
- ✅ Apenas 1 voto por usuário por enquete
- ✅ Após votar, opção fica com destaque roxo
- ✅ Porcentagem atualiza em tempo real
- ✅ Bloqueia voto se enquete encerrada
- ✅ Mostra status: "Enquete ativa" ou "Encerrada"
- ✅ Countdown se auto-encerramento em 24h

### Estado no Post:
```javascript
{
  poll: {
    question: "Qual título fica melhor?",
    options: [
      { id: 'opt-0', text: 'Cidade vertical', votes: 5 },
      { id: 'opt-1', text: 'Megacorp', votes: 3 },
      { id: 'opt-2', text: 'Ruína sintética', votes: 8 }
    ],
    totalVotes: 16,
    userVote: 'opt-2',          // Seu voto
    closed: false,               // Status
    closesAt: 1744329600000      // Timestamp 24h depois
  }
}
```

---

## 🎨 Visual & Interactions

### Botões do Composer:
- **Normal**: cinza neutro
- **Hover**: background roxo sutil, ícone mais claro
- **Ativo**: glow roxo (rgba(124,90,240,0.3)), background roxo (rgba(124,90,240,0.12))

### Preview de Foto:
- Margem 12px top
- Border 1px solid rgba(255,255,255,0.06)
- Border radius 14px
- Botão remover com X vermelho no canto superior direito
- Animação de entrada: slideUp

### Emoji Picker:
- Posição: absolute, flutuante acima dos botões
- Width: 260px
- Padding: 12px
- Border radius: 16px
- Background translúcido com backdrop-filter blur
- Grid 6 colunas com gap 6px
- Botões emoji 36x36 com hover scale

### Poll Builder:
- Margin-top: 12px
- Padding: 14px
- Border-radius: 16px
- Background rgba(255,255,255,0.02)
- Border 1px solid rgba(255,255,255,0.06)
- Inputs com focus state roxo
- Botões com cores temáticas (roxo para adicionar, vermelho para remover)

### Poll Card (Votável):
- Opções como cards interativas
- Barra de preenchimento roxo com transição suave (280ms)
- Opção votada com highlight roxo + pulse animation
- Percentual à direita
- Status no rodapé: "X votos • Enquete ativa" ou "Encerrada"

---

## 🔧 Integração Técnica

### Módulos Principais:

**ComposerController**
```javascript
ComposerController.getState()    // { text, image, poll }
ComposerController.reset()       // Limpa tudo
ComposerController.insertEmoji() // Insere emoji no textarea
```

**EmojiPicker**
```javascript
EmojiPicker.render(container)   // Renderiza picker
EmojiPicker.close()              // Fecha picker
```

**PollSystem**
```javascript
PollSystem.vote(postId, optionId)      // Registra voto
PollSystem.hasUserVoted(postId)        // Checka se votou
PollSystem.getUserVote(postId)         // Retorna seu voto
PollSystem.updateUI(postEl)            // Atualiza visualmente
```

### Functions Override:
- `updatePublishState()` → agora sensível a foto/enquete
- `addNewPost()` → agora suporta foto e poll
- `renderPoll()` → agora renderiza votável com % em tempo real
- `createPostCardElement()` → configura votação de enquetes

---

## 📱 Exemplo de Fluxo Completo

### Fluxo 1: Publicar com Foto
```
1. Digita: "Neon refletido na chuva"
2. Clica botão foto
3. Seleciona imagem.jpg
4. Preview aparece
5. Clica "Publicar"
6. Post publicado com imagem no feed
```

### Fluxo 2: Publicar com Enquete
```
1. Clica botão enquete
2. Pergunta: "Qual conceito combina mais?"
3. Opção 1: "Cidade vertical"
4. Opção 2: "Megacorp"
5. Opção 3: "Ruína sintética"
6. Toggle 24h ON
7. Clica "Publicar"
8. Post publicado com enquete
9. Alguém clica em "Cidade vertical"
10. Votos atualizam: 33% | 0% | 0% | 1 voto
```

### Fluxo 3: Emoji no Meio
```
1. Digita: "Adoro esse tema"
2. Clica botão emoji
3. Picker abre
4. Clica 🔥
5. Texto fica: "Adoro esse tema🔥"
6. Clica "Publicar"
```

---

## ⚙️ Configurações

### Máximo de Opções de Enquete:
Editar em `ComposerController` → renderPollBuilder():
```javascript
state.poll.options.length >= 5 ? 'disabled' : ''
```

### Auto-encerramento de Enquete:
Atualmente: 24 horas (86.400.000 ms)
```javascript
closesAt: pollData.autoClose24h ? Date.now() + (24 * 60 * 60 * 1000) : null
```

### Emojis Disponíveis:
Editar em `EmojiPicker`:
```javascript
var emojis = ['😀', '😎', '🔥', ...]; // Customize aqui
```

### Cores do Tema:
Usar CSS variables no `:root`:
```css
--color-primary: #7c5af0
--color-primary-hover: #9370ff
```

---

## ✨ Recursos Futuros Possíveis

- [ ] Upload de múltiplas fotos (galeria)
- [ ] Filtro/efeito de imagens
- [ ] GIF picker customizado
- [ ] Enquetes comAnime de resultados
- [ ] Integração com backend para persistência
- [ ] Undo/Redo no composer
- [ ] Draft auto-save
- [ ] Preview em tempo real
- [ ] Anexos variados (vídeo, áudio)

---

## 🐛 Troubleshooting

**Botão foto não funciona:**
- Verificar se `#composerPhotoInput` existe no HTML
- Console deve estar limpo
- Suporta: PNG, JPEG, WebP, GIF

**Emoji picker não aparece:**
- Verificar se `#composerEmojiBtn` tem ID correto
- ESC deve fechar
- Click fora deve fechar

**Enquete não publica:**
- Validação: mínimo 2 opções
- Opções não podem ser vazias
- Trim() remove espaços

**Voto não funciona:**
- Verificar se post tem `poll` Object
- UserVote registra em `PollSystem._userVotes`
- UI atualiza via `PollSystem.updateUI(postEl)`

---

## 📝 Notas Técnicas

- Tudo é **memory state**, sem backend
- Cada browser session resets os votos
- Posts são armazenados em `postStore` global array
- Imagens são dataURL (base64)
- Nenhuma biblioteca externa (Vanilla JS puro)
- Compatível com renderização existente
- Customizável via CSS variables

---

**Última atualização:** 14/04/2026
**Status:** ✅ Fully Functional
**Teste em:** http://localhost ou file:// local
