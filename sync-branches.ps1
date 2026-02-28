# 同步所有分支到 GitHub
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "同步所有分支到 GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Git 连接
Write-Host "检查网络连接..." -ForegroundColor Yellow
try {
    $ping = Test-Connection -ComputerName github.com -Count 1 -Quiet
    if (-not $ping) {
        Write-Host "[错误] 无法连接到 GitHub，请检查网络连接" -ForegroundColor Red
        pause
        exit 1
    }
    Write-Host "[成功] 网络连接正常" -ForegroundColor Green
} catch {
    Write-Host "[错误] 无法连接到 GitHub" -ForegroundColor Red
    pause
    exit 1
}
Write-Host ""

# 推送到 master
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[1/3] 推送 master 分支" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
git checkout master
git push origin master
if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] master 分支推送失败" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "[成功] master 分支已推送" -ForegroundColor Green
Write-Host ""

# 切换到 main 并同步
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[2/3] 同步 main 分支" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
git checkout main
git merge master --no-edit
if ($LASTEXITCODE -ne 0) {
    Write-Host "[警告] main 分支合并可能有冲突" -ForegroundColor Yellow
}
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] main 分支推送失败" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "[成功] main 分支已同步并推送" -ForegroundColor Green
Write-Host ""

# 构建并推送到 gh-pages
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[3/3] 构建并推送 gh-pages 分支" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
git checkout master
npm run build:gh
if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] 构建失败" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "正在部署到 gh-pages 分支..." -ForegroundColor Yellow
npm run deploy:gh
if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] gh-pages 部署失败" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "[成功] gh-pages 分支已推送" -ForegroundColor Green
Write-Host ""

# 返回 master
git checkout master

Write-Host "========================================" -ForegroundColor Green
Write-Host "[完成] 所有分支已成功同步到 GitHub" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "分支状态:" -ForegroundColor Cyan
Write-Host "  - master: Zeabur/Vercel 部署" -ForegroundColor White
Write-Host "  - main: GitHub 源代码主分支" -ForegroundColor White
Write-Host "  - gh-pages: GitHub Pages 部署分支" -ForegroundColor White
Write-Host ""
pause
