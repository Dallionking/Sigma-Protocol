@echo off
REM =============================================================================
REM Sigma-Ralph Loop Runner - Windows Wrapper
REM =============================================================================
REM This wrapper runs the bash script via WSL, Git Bash, or provides guidance.
REM
REM Usage:
REM   sigma-ralph.cmd --workspace=C:\path\to\project --mode=prototype
REM
REM Requirements:
REM   - WSL (Windows Subsystem for Linux) OR Git Bash installed
REM   - claude or opencode CLI installed
REM   - jq for JSON parsing
REM =============================================================================

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "BASH_SCRIPT=%SCRIPT_DIR%..\ralph\sigma-ralph.sh"
set "ALL_ARGS=%*"

REM Convert Windows paths to Unix paths for WSL
set "BASH_SCRIPT_UNIX=%BASH_SCRIPT:\=/%"
set "BASH_SCRIPT_UNIX=%BASH_SCRIPT_UNIX:C:=/mnt/c%"
set "BASH_SCRIPT_UNIX=%BASH_SCRIPT_UNIX:D:=/mnt/d%"
set "BASH_SCRIPT_UNIX=%BASH_SCRIPT_UNIX:E:=/mnt/e%"

REM Check for WSL first (preferred)
where wsl >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Running via WSL...

    REM Convert workspace path if provided
    set "CONVERTED_ARGS="
    for %%A in (%ALL_ARGS%) do (
        set "ARG=%%A"
        REM Convert Windows paths in arguments
        set "ARG=!ARG:\=/!"
        set "ARG=!ARG:C:=/mnt/c!"
        set "ARG=!ARG:D:=/mnt/d!"
        set "ARG=!ARG:E:=/mnt/e!"
        set "CONVERTED_ARGS=!CONVERTED_ARGS! !ARG!"
    )

    wsl bash "%BASH_SCRIPT_UNIX%" !CONVERTED_ARGS!
    goto :end
)

REM Check for Git Bash
where bash >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Running via Git Bash...
    bash "%BASH_SCRIPT%" %ALL_ARGS%
    goto :end
)

REM No bash environment found
echo.
echo ============================================================
echo  Sigma-Ralph requires a Unix-like environment on Windows
echo ============================================================
echo.
echo The Ralph loop requires bash and Unix tools (jq, etc).
echo.
echo Please install one of the following:
echo.
echo 1. WSL (Recommended):
echo    wsl --install
echo    Then restart your computer
echo.
echo 2. Git Bash:
echo    Download from https://git-scm.com/download/win
echo.
echo 3. Use the Node.js CLI instead:
echo    npm install -g sigma-protocol
echo    sigma orchestrate --mode ralph
echo.
echo ============================================================
exit /b 1

:end
endlocal
