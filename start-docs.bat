@echo off
echo ===============================================
echo    QuizApp - Uruchamianie Dokumentacji
echo ===============================================
echo.

cd docs-vitepress

if not exist node_modules (
    echo Installing dependencies...
    npm install
    echo.
)

echo Starting VitePress documentation server...
echo Documentation will be available at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause 