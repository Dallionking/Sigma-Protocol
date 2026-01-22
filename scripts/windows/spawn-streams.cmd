@echo off
REM =============================================================================
REM Sigma Stream Spawner - Windows Wrapper
REM =============================================================================
REM Spawns multiple parallel agent streams using tmux (via WSL) or Windows Terminal.
REM
REM Usage:
REM   spawn-streams.cmd --streams=4 --workspace=C:\path\to\project
REM
REM Requirements:
REM   - WSL with tmux OR Windows Terminal installed
REM   - claude or opencode CLI installed
REM =============================================================================

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "BASH_SCRIPT=%SCRIPT_DIR%..\orchestrator\spawn-streams.sh"
set "ALL_ARGS=%*"

REM Check for WSL first (preferred for tmux)
where wsl >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Running via WSL with tmux...

    REM Convert paths for WSL
    set "BASH_SCRIPT_UNIX=%BASH_SCRIPT:\=/%"
    set "BASH_SCRIPT_UNIX=!BASH_SCRIPT_UNIX:C:=/mnt/c!"
    set "BASH_SCRIPT_UNIX=!BASH_SCRIPT_UNIX:D:=/mnt/d!"

    REM Convert workspace path if provided
    set "CONVERTED_ARGS="
    for %%A in (%ALL_ARGS%) do (
        set "ARG=%%A"
        set "ARG=!ARG:\=/!"
        set "ARG=!ARG:C:=/mnt/c!"
        set "ARG=!ARG:D:=/mnt/d!"
        set "CONVERTED_ARGS=!CONVERTED_ARGS! !ARG!"
    )

    wsl bash "!BASH_SCRIPT_UNIX!" !CONVERTED_ARGS!
    goto :end
)

REM Fallback: Windows Terminal tabs (if installed)
where wt >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] WSL not found. Using Windows Terminal tabs...
    echo.
    echo This mode provides basic multi-tab support but lacks tmux features.
    echo For full functionality, install WSL: wsl --install
    echo.

    REM Parse stream count from arguments
    set "STREAMS=3"
    for %%A in (%ALL_ARGS%) do (
        echo %%A | findstr /C:"--streams=" >nul
        if not errorlevel 1 (
            for /f "tokens=2 delims==" %%B in ("%%A") do set "STREAMS=%%B"
        )
    )

    REM Open Windows Terminal with multiple tabs
    echo Opening !STREAMS! terminal tabs...
    set "TABS="
    for /L %%i in (1,1,!STREAMS!) do (
        if %%i equ 1 (
            set "TABS=new-tab --title Stream-%%i"
        ) else (
            set "TABS=!TABS! ; new-tab --title Stream-%%i"
        )
    )
    wt !TABS!

    echo.
    echo Opened !STREAMS! Windows Terminal tabs.
    echo You'll need to manually start agents in each tab.
    echo.
    echo In each tab, run:
    echo   sigma orchestrate --stream=N
    echo.
    goto :end
)

REM No suitable environment found
echo.
echo ============================================================
echo  Sigma Stream Spawner requires additional setup on Windows
echo ============================================================
echo.
echo Please install one of the following:
echo.
echo 1. WSL (Recommended for full tmux support):
echo    wsl --install
echo    Then: wsl -d Ubuntu -e sudo apt install tmux
echo.
echo 2. Windows Terminal (Basic multi-tab):
echo    Install from Microsoft Store
echo.
echo 3. Use the Node.js CLI:
echo    npm install -g sigma-protocol
echo    sigma orchestrate --streams=4
echo.
echo ============================================================
exit /b 1

:end
endlocal
