# Sync all branches to GitHub
Write-Host "========================================"
Write-Host "Sync all branches to GitHub"
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

# Push to master
Write-Host "========================================"
Write-Host "[1/3] Push master branch"
Write-Host "========================================"
git checkout master
git push origin master
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to push master branch"
    pause
    exit 1
}
Write-Host "[SUCCESS] Master branch pushed"
Write-Host ""

# Sync main branch
Write-Host "========================================"
Write-Host "[2/3] Sync main branch"
Write-Host "========================================"
git checkout main
git merge master --no-edit
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Main branch merge may have conflicts"
}
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to push main branch"
    pause
    exit 1
}
Write-Host "[SUCCESS] Main branch synced and pushed"
Write-Host ""

# Build and deploy gh-pages
Write-Host "========================================"
Write-Host "[3/3] Build and deploy gh-pages branch"
Write-Host "========================================"
git checkout master
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

# Return to master
git checkout master

Write-Host "========================================"
Write-Host "[COMPLETED] All branches synced to GitHub"
Write-Host "========================================"
Write-Host ""
Write-Host "Branch status:"
Write-Host "  - master: Zeabur/Vercel deployment"
Write-Host "  - main: GitHub source main branch"
Write-Host "  - gh-pages: GitHub Pages deployment branch"
Write-Host ""
pause
