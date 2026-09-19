@echo off
title MindBridge-RAG Launcher
echo ========================================================
echo   Launching MindBridge-RAG (Safety-Aware Student Chatbot)
echo ========================================================
echo.

py -3.12 run.py
if errorlevel 1 (
    echo Trying python run.py...
    python run.py
)
if errorlevel 1 (
    echo Trying direct Python 3.12 path...
    "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" run.py
)
pause
