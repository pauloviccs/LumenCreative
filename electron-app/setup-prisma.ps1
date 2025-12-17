# Script de Setup do Prisma
# Execute este script no diretório electron-app

Write-Host "Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "Prisma Client generated successfully!" -ForegroundColor Green
    
    Write-Host "`nCreating database migration..." -ForegroundColor Cyan
    npx prisma migrate dev --name init
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database migration created successfully!" -ForegroundColor Green
        Write-Host "`nSetup complete! You can now run 'npm run dev' to start the app." -ForegroundColor Green
    } else {
        Write-Host "Error creating migration. Please check the error above." -ForegroundColor Red
    }
} else {
    Write-Host "Error generating Prisma Client. Please check the error above." -ForegroundColor Red
}

