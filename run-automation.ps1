# WhatsApp Group Automation Tool - PowerShell Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "WhatsApp Group Automation Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set environment variables
Write-Host "Setting up environment variables..." -ForegroundColor Yellow
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = "$env:LOCALAPPDATA\Android\Sdk"

Write-Host ""
Write-Host "Environment variables set:" -ForegroundColor Green
Write-Host "ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor White
Write-Host "ANDROID_SDK_ROOT: $env:ANDROID_SDK_ROOT" -ForegroundColor White
Write-Host ""

# Check if Android SDK exists
if (Test-Path $env:ANDROID_HOME) {
    Write-Host "✅ Android SDK found at: $env:ANDROID_HOME" -ForegroundColor Green
} else {
    Write-Host "❌ Android SDK not found at: $env:ANDROID_HOME" -ForegroundColor Red
    Write-Host "Please install Android SDK or update the path." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Starting WhatsApp Group Automation..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Make sure:" -ForegroundColor Cyan
Write-Host "1. Your Android device is connected via USB" -ForegroundColor White
Write-Host "2. USB Debugging is enabled" -ForegroundColor White
Write-Host "3. WhatsApp Business is open on your device" -ForegroundColor White
Write-Host "4. Appium server is running (run: appium)" -ForegroundColor White
Write-Host ""

$confirmation = Read-Host "Press Enter to continue or 'N' to cancel"
if ($confirmation -eq 'N' -or $confirmation -eq 'n') {
    Write-Host "Automation cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Running automation..." -ForegroundColor Green
Write-Host ""

try {
    npm run start
    Write-Host ""
    Write-Host "✅ Automation completed successfully!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Automation failed with error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit" 