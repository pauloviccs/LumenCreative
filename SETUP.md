# Guia de Setup - DS-System

## Pré-requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0

## Passo 1: Instalar Dependências

As dependências já foram instaladas no workspace raiz. Se necessário, execute:

```bash
npm install
```

## Passo 2: Configurar Prisma (Electron App)

Navegue para o diretório `electron-app` e execute:

```bash
cd electron-app
npx prisma generate
npx prisma migrate dev --name init
```

Isso irá:
- Gerar o cliente Prisma
- Criar a migração inicial do banco de dados SQLite
- Criar o arquivo `local_signage.db` no diretório `prisma/`

## Passo 3: Configurar Firebase

### Para o Electron App (Dashboard)

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative o **Firebase Realtime Database** e o **Firebase Storage**
3. Baixe a chave de service account (JSON) do projeto
4. Salve o arquivo JSON em um local seguro (ex: `electron-app/firebase-service-account.json`)
5. Configure as variáveis de ambiente em `electron-app/.env`:

```env
FIREBASE_DATABASE_URL=https://seu-projeto.firebaseio.com
FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
```

6. No código, você precisará inicializar o Firebase passando o caminho do arquivo JSON da service account.

### Para o Web Player

1. No mesmo projeto Firebase, obtenha as credenciais da web app
2. Configure as variáveis de ambiente em `web-player/.env`:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://seu-projeto.firebaseio.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

## Passo 4: Executar em Desenvolvimento

### Dashboard (Electron App)

```bash
cd electron-app
npm run dev
```

Isso irá iniciar o Vite dev server e o Electron em modo de desenvolvimento.

### Web Player

```bash
cd web-player
npm run dev
```

Acesse `http://localhost:5173` no navegador ou Smart TV.

## Estrutura de Dados

O sistema usa Firebase Realtime Database com a seguinte estrutura:

```
/screens/{screenId}/
  - screen_settings
    - orientation: "landscape" | "portrait"
    - refresh_rate_ms: number
    - version_hash: string
  - playlist: Array<PlaylistItem>
```

## Troubleshooting

### Erro ao gerar Prisma Client

Certifique-se de estar no diretório `electron-app` ao executar os comandos do Prisma.

### Firebase não inicializado

- Verifique se as variáveis de ambiente estão configuradas corretamente
- Certifique-se de que o arquivo de service account existe e o caminho está correto
- Para o Electron App, você precisa inicializar o Firebase através da UI antes de usar

### Problemas com IndexedDB no Web Player

- Verifique se o navegador/Smart TV suporta IndexedDB
- No DevTools, verifique se há erros de quota ou permissões

