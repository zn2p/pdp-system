@echo off
REM Deprecated wrapper. Please use start.bat.
setlocal
pushd "%~dp0" || exit /b 1
call "%~dp0start.bat"
popd
