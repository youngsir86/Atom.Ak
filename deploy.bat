@echo off
echo ========================================
echo   构建并部署到 GitHub Pages
echo ========================================
echo.

echo [1/3] 清理旧的 dist 文件夹...
if exist dist rmdir /s /q dist

echo [2/3] 构建项目...
call npm run build:gh
if errorlevel 1 (
    echo.
    echo [错误] 构建失败！
    pause
    exit /b 1
)

echo.
echo [3/3] 同步到 GitHub...
echo.
echo 请选择部署方式：
echo   1. 使用 gh-pages 包自动部署（推荐）
echo   2. 手动推送到 gh-pages 分支
echo.
set /p choice="请输入选项 (1 或 2，默认 1): "

if "%choice%"=="2" goto manual

:auto
echo.
echo 使用 gh-pages 部署...
call npx gh-pages -d dist
if errorlevel 1 (
    echo.
    echo [提示] gh-pages 未安装，正在安装...
    call npm install -D gh-pages
    call npx gh-pages -d dist
)
goto end

:manual
echo.
echo 手动部署步骤：
echo   1. 将 dist 文件夹内容复制到临时位置
echo   2. 切换到 gh-pages 分支
echo   3. 清空当前目录并粘贴 dist 内容
echo   4. 提交并推送
echo.
echo 是否自动执行手动部署？(y/n)
set /p auto_deploy="选择: "
if /i "%auto_deploy%"=="y" (
    call :manual_deploy
) else (
    echo.
    echo dist 文件夹已更新，请手动上传到 GitHub
)
goto end

:manual_deploy
git checkout gh-pages 2>nul || git checkout --orphan gh-pages
git rm -rf .
xcopy /E /I /Y dist\* .
git add .
git commit -m "Deploy: 自动同步 %date% %time%"
git push -u origin gh-pages
git checkout main 2>nul || git checkout master 2>nul
goto end

:end
echo.
echo ========================================
echo   部署完成！
echo   GitHub Pages: https://你的用户名.github.io/Atom.Ak/
echo ========================================
pause
