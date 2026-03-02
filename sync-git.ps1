# Sync main and gh-pages branches to GitHub
Write-Host "========================================"
Write-Host "Sync to GitHub"
Write-Host "========================================"
Write-Host ""

# Check network connection
Write-Host "Checking network connection..."
try {
    $ping = Test-Connection -ComputerName github.com -Count 1 -Quiet
    if (-not $ping) {
        Write-Host "[ERROR] Cannot connect to GitHub, please check network connection"
        pause
        exit 1
    }
    Write-Host "[SUCCESS] Network connection is normal"
} catch {
    Write-Host "[ERROR] Cannot connect to GitHub"
    pause
    exit 1
}
Write-Host ""

# Push main branch
Write-Host "========================================"
Write-Host "[1/2] Push main branch"
Write-Host "========================================"
git checkout main
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to push main branch"
    pause
    exit 1
}
Write-Host "[SUCCESS] Main branch pushed"
Write-Host ""

# Build and deploy gh-pages
Write-Host "========================================"
Write-Host "[2/2] Build and deploy gh-pages"
Write-Host "========================================"
Write-Host "Building project..."
npm run build:gh
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build failed"
    pause
    exit 1
}

Write-Host "Deploying to gh-pages..."
npm run deploy:gh
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] gh-pages deployment failed"
    pause
    exit 1
}
Write-Host "[SUCCESS] gh-pages branch deployed"
Write-Host ""

Write-Host "========================================"
Write-Host "[COMPLETED] All branches synced to GitHub"
Write-Host "========================================"
Write-Host ""
Write-Host "Branch status:"
Write-Host "  - main: Source code branch"
Write-Host "  - gh-pages: GitHub Pages deployment"
Write-Host ""
Write-Host "GitHub Pages URL:"
Write-Host "  https://youngsir86.github.io/Atom.Ak/"
Write-Host ""
pause
