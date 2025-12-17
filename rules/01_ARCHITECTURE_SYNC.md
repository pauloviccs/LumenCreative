# Arquitetura de Sincronização e Dados

## O Problema
O PC do usuário está atrás de um NAT (rede doméstica). A TV pode estar em outra rede (4G/Outro Wi-Fi).

## A Solução: Arquitetura "Store & Forward" via Firebase
Não faremos streaming direto. Faremos sincronização de estado.

### Fluxo de Dados
1. **Upload:** O Usuário adiciona um vídeo no Dashboard (PC).
   - O arquivo é copiado para uma pasta local do Electron (Cache Host).
   - O arquivo é, em background, enviado para o **Firebase Storage**.
   - O link público (downloadURL) é salvo no SQLite local.

2. **Comando (Sinalização):**
   - O Dashboard atualiza um documento no **Firebase Realtime Database** (ou Firestore): `/screens/{screenId}/playlist`.
   - Este documento é um JSON leve contendo apenas a ordem e os URLs.

3. **Consumo (TV Player):**
   - A TV escuta mudanças em `/screens/{screenId}` via WebSocket (Firebase SDK).
   - Ao detectar mudança, a TV compara o "playlistVersion".
   - Se for nova, a TV baixa os arquivos novos para o **IndexedDB** e apaga os antigos.

## Diagrama de Dados (JSON Payload para a TV)
A TV deve receber exatamente este formato para evitar processamento lógico pesado no cliente.

```json
{
  "screen_settings": {
    "orientation": "landscape",
    "refresh_rate_ms": 30000,
    "version_hash": "a1b2c3d4"
  },
  "playlist": [
    {
      "id": "item_01",
      "type": "video",
      "url": "https://firebasestorage.../promo.mp4",
      "duration": 15, // Se for vídeo, o player ignora e usa o fim do vídeo
      "local_cache_key": "video_promo_v1.mp4"
    },
    {
      "id": "item_02",
      "type": "pdf",
      "url": "https://firebasestorage.../menu.pdf",
      "duration": 10, // Segundos por página
      "page_count": 3 // O backend deve pré-calcular isso
    }
  ]
}