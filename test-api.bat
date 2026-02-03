@echo off
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo Testing Health Endpoint
echo ========================================
powershell -Command "try { $response = Invoke-RestMethod -Uri http://localhost:3000/health; Write-Host 'SUCCESS:' -ForegroundColor Green; $response | ConvertTo-Json } catch { Write-Host 'FAILED:' $_.Exception.Message -ForegroundColor Red }"

echo.
echo ========================================
echo Creating a Product
echo ========================================
powershell -Command "try { $body = @{name='Laptop';price=999.99;quantity=10} | ConvertTo-Json; $response = Invoke-RestMethod -Uri http://localhost:3000/api/products -Method POST -Body $body -ContentType 'application/json'; Write-Host 'SUCCESS:' -ForegroundColor Green; $response | ConvertTo-Json } catch { Write-Host 'FAILED:' $_.Exception.Message -ForegroundColor Red }"

echo.
echo ========================================
echo Getting All Products
echo ========================================
powershell -Command "try { $response = Invoke-RestMethod -Uri http://localhost:3000/api/products; Write-Host 'SUCCESS:' -ForegroundColor Green; $response | ConvertTo-Json } catch { Write-Host 'FAILED:' $_.Exception.Message -ForegroundColor Red }"

echo.
pause
