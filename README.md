# DS-System - Digital Signage System

Monorepo para o sistema de Digital Signage DS-System, contendo o Dashboard (Electron) e o Player Web (Smart TV).

## Estrutura do Projeto

```
.
├── electron-app/      # Host Application (Dashboard)
├── web-player/        # Client Application (Smart TV)
└── rules/            # Documentação e regras do projeto
```

## Workspaces

Este projeto usa npm workspaces (ou pnpm) para gerenciar múltiplos pacotes:

- **electron-app**: Aplicação Electron para o dashboard de gerenciamento
- **web-player**: Aplicação web React para execução em Smart TVs

## Instalação

```bash
npm install
```

## Setup Inicial

Consulte o arquivo [SETUP.md](./SETUP.md) para instruções detalhadas de configuração.

### Quick Start

1. **Configurar Prisma (Electron App):**
   ```bash
   cd electron-app
   npx prisma generate
   npx prisma migrate dev --name init
   ```
   Ou execute o script PowerShell: `.\setup-prisma.ps1`

2. **Configurar Firebase:**
   - Crie um projeto Firebase
   - Configure as variáveis de ambiente (veja SETUP.md)

## Desenvolvimento

### Dashboard (Electron)
```bash
npm run dev:electron
```

### Player Web
```bash
npm run dev:player
```

## Build

### Build de ambos os projetos
```bash
npm run build
```

### Build individual
```bash
npm run build:electron
npm run build:player
```

## Tech Stack

### Electron App
- Electron + React + Vite
- TailwindCSS + Shadcn/UI
- Prisma ORM + SQLite
- Firebase Admin SDK

### Web Player
- React + Vite
- Zustand (state management)
- Dexie.js (IndexedDB)
- Firebase SDK
- PDF.js / react-pdf

## Documentação

Consulte a pasta `rules/` para documentação detalhada sobre arquitetura, schema do banco de dados e lógica do player.

