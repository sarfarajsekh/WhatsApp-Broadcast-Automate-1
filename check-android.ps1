# Android SDK Setup Check for WhatsApp Broadcast Automate

Write-Host "Android SDK Setup Check" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green
Write-Host ""

# Check if Android SDK is already installed
$androidHome = $env:ANDROID_HOME
$androidSdkRoot = $env:ANDROID_SDK_ROOT

if ($androidHome -or $androidSdkRoot) {
    Write-Host "SUCCESS: Android SDK environment variables found:" -ForegroundColor Green
    if ($androidHome) { Write-Host "   ANDROID_HOME: $androidHome" -ForegroundColor Yellow }
    if ($androidSdkRoot) { Write-Host "   ANDROID_SDK_ROOT: $androidSdkRoot" -ForegroundColor Yellow }
} else {
    Write-Host "ERROR: Android SDK environment variables not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "To fix this, you need to:" -ForegroundColor Cyan
    Write-Host "1. Download Android SDK Command Line Tools" -ForegroundColor White
    Write-Host "   From: https://developer.android.com/studio#command-tools" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Extract to a folder (e.g., C:\Android\Sdk)" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Set environment variables:" -ForegroundColor White
    Write-Host "   ANDROID_HOME = C:\Android\Sdk" -ForegroundColor Yellow
    Write-Host "   ANDROID_SDK_ROOT = C:\Android\Sdk" -ForegroundColor Yellow
    Write-Host "   Add to PATH: C:\Android\Sdk\platform-tools" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "4. Restart your terminal after setting variables" -ForegroundColor White
}

Write-Host ""
Write-Host "Quick Setup Instructions:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "1. Download Android SDK Command Line Tools" -ForegroundColor White
Write-Host "2. Extract to C:\Android\Sdk" -ForegroundColor White
Write-Host "3. Set environment variables in System Properties > Environment Variables:" -ForegroundColor White
Write-Host "   - ANDROID_HOME = C:\Android\Sdk" -ForegroundColor Yellow
Write-Host "   - ANDROID_SDK_ROOT = C:\Android\Sdk" -ForegroundColor Yellow
Write-Host "   - Add C:\Android\Sdk\platform-tools to PATH" -ForegroundColor Yellow
Write-Host "4. Restart terminal and run this script again" -ForegroundColor White
Write-Host "5. Connect your Android device with USB debugging enabled" -ForegroundColor White
Write-Host "6. Run: npm run start" -ForegroundColor White

Write-Host ""
Write-Host "Download Android SDK Command Line Tools:" -ForegroundColor Cyan
Write-Host "https://developer.android.com/studio#command-tools" -ForegroundColor Blue 