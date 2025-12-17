# *Instruções críticas para o desenvolvimento do Frontend da TV.*

# Lógica do Player Web (Smart TV)

## Desafios Técnicos
Smart TVs (Tizen, WebOS) têm renderizadores web antigos. Evite sintaxes JS muito modernas (ES2022+) sem transpilação.

## Componentes Necessários

### 1. `Engine.tsx` (O Maestro)
Não use `setTimeout` simples. Use um hook customizado `useInterval` que seja consciente do estado do React.
A lógica de transição deve ser:
1. Carregar próximo asset no DOM (hidden).
2. Esperar evento `onCanPlay` (vídeo) ou `onLoad` (imagem).
3. Trocar visibilidade (Swap).
4. Descarregar asset anterior para liberar memória.

### 2. `OfflineManager.ts`
Implementar usando `Dexie.js`.
- Ao receber nova playlist:
  - Verificar quais arquivos já existem no Cache.
  - Baixar apenas os novos (Fetch Blob).
  - Salvar Blob no IndexedDB.
  - Gerar `URL.createObjectURL(blob)` apenas no momento da reprodução (para não estourar a RAM).
  - **Importante:** Revogar URLs de objeto (`URL.revokeObjectURL`) assim que o item sair da tela.

### 3. Tratamento de PDF
Não tente renderizar o PDF nativamente.
- Use `react-pdf` ou `pdfjs-dist`.
- O componente deve renderizar o PDF como `<canvas>`.
- Se o PDF tem 3 páginas e duração de 10s:
  - O Player trata internamente como se fossem 3 imagens de 10s cada.

### 4. Watchdog
Crie um script que roda a cada 5 segundos:
- Verifica se o vídeo travou (`video.currentTime` não mudou).
- Se travou por > 5s, força o `next()` da playlist.