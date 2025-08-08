@echo off
echo ========================================
echo WhatsApp Group Automation Tool
echo ========================================
echo.

echo Setting up environment variables...
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
set ANDROID_SDK_ROOT=%LOCALAPPDATA%\Android\Sdk

echo.
echo Environment variables set:
echo ANDROID_HOME=%ANDROID_HOME%
echo ANDROID_SDK_ROOT=%ANDROID_SDK_ROOT%
echo.

echo Starting WhatsApp Group Automation...
echo.
echo Make sure:
echo 1. Your Android device is connected via USB
echo 2. USB Debugging is enabled
echo 3. WhatsApp Business is open on your device
echo 4. Appium server is running (run: appium)
echo.

pause

echo.
echo Running automation...
npm run start

echo.
echo Automation completed!
pause 