@echo off
chcp 65001 >nul
echo ========================================
echo 同步所有分支到 GitHub
echo ========================================
echo.

:: 检查网络连接
echo 检查网络连接...
ping -n 1 github.com >nul 2>&1
if errorlevel 1 (
    echo [错误] 无法连接到 GitHub，请检查网络连接
    pause
    exit /b 1
)
echo [成功] 网络连接正常
echo.

:: 当前分支操作
echo ========================================
echo [1/3] 推送 master 分支
echo ========================================
git checkout master
git push origin master
if errorlevel 1 (
    echo [错误] master 分支推送失败
    pause
    exit /b 1
)
echo [成功] master 分支已推送
echo.

:: 切换到 main 分支并同步
echo ========================================
echo [2/3] 同步 main 分支
echo ========================================
git checkout main
git merge master --no-edit
if errorlevel 1 (
    echo [警告] main 分支合并可能有冲突，请手动解决
    pause
)
git push origin main
if errorlevel 1 (
    echo [错误] main 分支推送失败
    pause
    exit /b 1
)
echo [成功] main 分支已同步并推送
echo.

:: 构建并推送到 gh-pages 分支
echo ========================================
echo [3/3] 构建并推送 gh-pages 分支
echo ========================================
git checkout master
npm run build:gh
if errorlevel 1 (
    echo [错误] 构建失败
    pause
    exit /b 1
)

:: 使用 gh-pages 包推送
echo 正在部署到 gh-pages 分支...
npm run deploy:gh
if errorlevel 1 (
    echo [错误] gh-pages 部署失败
    pause
    exit /b 1
)
echo [成功] gh-pages 分支已推送
echo.

:: 返回 master 分支
git checkout master

echo ========================================
echo [完成] 所有分支已成功同步到 GitHub
echo ========================================
echo.
echo 分支状态:
echo - master: Zeabur/Vercel 部署
echo - main: GitHub Pages 部署 (通过 gh-pages 分支)
echo - gh-pages: GitHub Pages 实际部署分支
echo.
pause
