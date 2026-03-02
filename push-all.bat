@echo off
chcp 65001 >nul
echo ========================================
echo 推送所有分支到 GitHub
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

:: 1. 推送 master 分支
echo 推送 master 分支...
git push origin master
if errorlevel 1 (
    echo [错误] master 分支推送失败
    pause
    exit /b 1
)
echo [成功] master 分支已推送
echo.

:: 2. 推送 main 分支
echo 切换到 main 分支...
git checkout main
git merge master --no-edit
echo 推送 main 分支...
git push origin main
if errorlevel 1 (
    echo [错误] main 分支推送失败
    pause
    exit /b 1
)
echo [成功] main 分支已推送
echo.

:: 3. 构建并推送 gh-pages
echo 切换到 master 分支...
git checkout master
echo 构建项目...
npm run build:gh
if errorlevel 1 (
    echo [错误] 构建失败
    pause
    exit /b 1
)
echo 部署到 gh-pages...
npm run deploy:gh
if errorlevel 1 (
    echo [错误] gh-pages 部署失败
    pause
    exit /b 1
)
echo [成功] gh-pages 已部署
echo.

:: 4. 返回 master 分支
git checkout master

echo ========================================
echo 所有分支推送完成！
echo ========================================
echo 分支状态:
echo - master: 已推送
echo - main: 已推送
echo - gh-pages: 已部署
echo.
pause
