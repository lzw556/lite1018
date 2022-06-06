@echo off
for /f "tokens=5" %%I in ('netstat -ano ^|findstr "0.0.0.0:8290"') do (
  echo killing pid %%I

  taskkill /pid %%I -f
)
pause