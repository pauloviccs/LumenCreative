# Database Schema (Prisma/SQLite) - Host App

1. Use este schema como fonte da verdade para o banco de dados local do Electron.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
    provider = "sqlite"
    url      = "file:./local_signage.db"
    }

    model Screen {
    id          String   @id @default(uuid())
    name        String
    pairingCode String   @unique // Código curto de 6 dígitos
    firebaseId  String?  // ID correspondente no Firebase
    status      String   @default("unpaired") // unpaired, online, offline
    playlistId  String?
    playlist    Playlist? @relation(fields: [playlistId], references: [id])
    updatedAt   DateTime @updatedAt
    }

    model Playlist {
    id        String      @id @default(uuid())
    name      String
    screens   Screen[]
    items     PlaylistItem[]
    createdAt DateTime    @default(now())
    }

    model PlaylistItem {
    id         String   @id @default(uuid())
    playlistId String
    playlist   Playlist @relation(fields: [playlistId], references: [id])
    
    type       String   // VIDEO, IMAGE, PDF
    localPath  String   // Caminho no PC do usuário
    remoteUrl  String?  // URL do Firebase Storage (após upload)
    
    duration   Int      @default(10) // Em segundos
    order      Int      // Posição na playlist (0, 1, 2...)
    
    // Metadados para evitar processamento na TV
    fileSize   Int      // Em bytes
    md5Hash    String?  // Para verificação de integridade
}