<div align="center">

# ⚡ NovaChrono

**Plataforma de mídia social baseada em linha do tempo. Construída para a próxima era.**

[![Versão](https://img.shields.io/badge/versão-0.1.0-blueviolet?style=for-the-badge)](https://github.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-latest-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-6.16-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## O que é o NovaChrono?

NovaChrono é uma plataforma de mídia social com estética cyberpunk e tema escuro, centrada em um feed **cronológico** de postagens. Publique *Ecos*, vote em enquetes, mergulhe nos *Cordões* (tópicos encadeados) e navegue pelo seu histórico através de um calendário interativo — tudo embrulhado em uma interface imersiva e de alto contraste.

> Construído com Next.js 15 App Router no backend e um motor de feed standalone em JavaScript puro (EchoFrame) no frontend.

---

## Funcionalidades

| | Funcionalidade | Descrição |
|---|---|---|
| ⚡ | **Compositor de Ecos** | Publique texto, imagens, enquetes e emojis em um único fluxo |
| 🗳️ | **Votação em Tempo Real** | Contagem ao vivo nas enquetes com barras de porcentagem e encerramento automático |
| 📅 | **Calendário da Linha do Tempo** | Navegue pelo seu histórico de publicações dia a dia |
| 🧵 | **Cordões** | Canais de tópicos encadeados para conversas focadas |
| 👁️ | **Feed EchoFrame** | Modos de densidade: grade, compacto e padrão |
| 🔔 | **Notificações** | Alertas de atividade em tempo real |
| 💬 | **Mensagens Diretas** | Painel lateral de DMs |
| 👤 | **Perfis de Usuário** | Painel de estatísticas — visualizações, impulsos, ecos, respostas |
| 🔐 | **Autenticação** | Cadastro e login com upload de avatar (suporte a HEIC/HEIF) |
| 🌌 | **UI Aurora** | Fundo animado com efeito aurora e tema escuro cyberpunk |

---

## Stack Tecnológica

### Frontend
- **Next.js 15.3** — App Router, server components, rotas de API
- **React 19** — Recursos concorrentes mais recentes
- **TypeScript 5.6** — Modo strict em todo o projeto
- **Tailwind CSS 3.4** — Estilização utility-first com fonte Syne
- **Lucide React** — Biblioteca de ícones
- **EchoFrame** — Motor de feed standalone em JS/CSS puro (sem overhead de framework)

### Backend
- **PostgreSQL** — Banco de dados principal
- **Prisma 6.16** — ORM type-safe com migrações
- **bcryptjs** — Hash de senhas (12 rounds)
- **heic-convert** — Conversão de imagens HEIC/HEIF

### Testes
- **Playwright 1.59** — Testes de integração (Chromium)

---

## Começando

### Pré-requisitos

- Node.js 20+
- PostgreSQL rodando localmente
- npm ou gerenciador de pacotes compatível

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/novachrono.git
cd novachrono

# Instale as dependências
npm install
```

### Configuração do Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env
```

Edite o `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nova_chrono?schema=public"
```

### Configuração do Banco de Dados

```bash
# Execute as migrações e gere o cliente Prisma
npm run prisma:migrate
npm run prisma:generate
```

### Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Estrutura do Projeto

```
novachrono/
├── app/                    # Next.js App Router
│   ├── api/register/       # Endpoint de cadastro
│   ├── echoframe/          # Página do feed (EchoFrame)
│   ├── login/              # Página de login
│   ├── register/           # Página de cadastro
│   ├── layout.tsx          # Layout raiz
│   └── page.tsx            # Página inicial (landing)
│
├── components/
│   ├── landing/            # Fundo aurora, seção hero
│   ├── login/              # Card de login, cabeçalho, rodapé
│   └── register/           # Upload de avatar, força de senha, formulário
│
├── lib/
│   ├── prisma.ts           # Singleton do cliente Prisma
│   ├── server/             # Manipulação de avatar, validação server-side
│   └── shared/             # Lógica de validação compartilhada
│
├── prisma/
│   └── schema.prisma       # Modelo de usuário
│
├── chrono/                 # EchoFrame — app de feed standalone
│   ├── index.html          # UI completa do feed (JS puro)
│   ├── assets/             # Logos, imagens
│   ├── scripts/            # Motor JS modular
│   └── styles/             # 26 módulos CSS
│
└── tests/
    └── integration/        # Suite de testes Playwright
```

---

## Scripts Disponíveis

```bash
npm run dev                       # Inicia o servidor de desenvolvimento
npm run build                     # Build de produção
npm run start                     # Inicia o servidor de produção
npm run lint                      # Verificação com ESLint

npm run test:integration          # Executa testes Playwright (headless)
npm run test:integration:headed   # Executa testes Playwright (browser visível)
npm run test:integration:report   # Abre relatório HTML dos testes

npm run prisma:generate           # Regenera o cliente Prisma
npm run prisma:migrate            # Executa migrações (dev)
npm run prisma:deploy             # Aplica migrações (produção)
npm run prisma:studio             # Abre o Prisma Studio GUI
```

---

## Schema do Banco de Dados

```prisma
model User {
  id           String   @id @default(cuid())
  username     String   @unique
  email        String   @unique
  passwordHash String
  avatarUrl    String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

---

## Compositor de Ecos

O Compositor suporta criação rica de postagens em um único fluxo:

- **Fotos** — PNG, JPEG, WebP, GIF (máx. 5MB) com preview em tempo real
- **Emojis** — 18 escolhas curadas: `😀 😎 🔥 💀 🚀 🧠 👁️ ⚡ ❤️ 🫠 👀 🤖 🌌 🕳️ 🧵 📡 🌀 🫀`
- **Enquetes** — 2 a 5 opções, encerramento automático opcional em 24h, barras de porcentagem ao vivo
- **Validação** — Botão de publicar desabilitado até que o conteúdo esteja pronto

---

## Testes

Os testes de integração cobrem interações principais do feed:

```bash
npm run test:integration
```

Validações:
- Alternância de visualização em grade
- Gaveta de favoritos
- Dropdown de notificações
- Modal de configurações
- Menu de perfil e fluxo de logout

---

## Roadmap

- [ ] Autenticação completa com sessões/JWT
- [ ] Feed em tempo real via WebSockets
- [ ] Sistema de seguidores e aba "Seguindo"
- [ ] Busca e descoberta de usuários
- [ ] Aplicativo mobile (React Native)
- [ ] Integração com CDN de mídia
- [ ] Alternância entre tema claro e escuro

---

## Contribuindo

1. Faça um fork do repositório
2. Crie uma branch de feature: `git checkout -b feature/sua-feature`
3. Faça commit das alterações: `git commit -m 'feat: adiciona sua feature'`
4. Envie para a branch: `git push origin feature/sua-feature`
5. Abra um Pull Request

---

## Licença

MIT © Contribuidores NovaChrono

---

<div align="center">

Construído com obsessão. ⚡

</div>
