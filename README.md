# WhatsApp Group Automation Tool

A powerful automation tool for creating WhatsApp groups using Appium and Node.js.

## 🚀 Features

- ✅ **Automated Group Creation**: Create multiple WhatsApp groups automatically
- ✅ **Contact Management**: Add multiple contacts to groups
- ✅ **CSV Configuration**: Easy group configuration via CSV files
- ✅ **Cross-Platform**: Works on Windows, macOS, and Linux
- ✅ **WhatsApp Business Support**: Optimized for WhatsApp Business
- ✅ **Error Handling**: Robust error handling and recovery
- ✅ **Logging**: Detailed logging for debugging and monitoring

## 📋 Prerequisites

Before running this tool, ensure you have the following installed:

### 1. Node.js and npm
- Download and install Node.js from [nodejs.org](https://nodejs.org/)
- Verify installation: `node --version` and `npm --version`

### 2. Android SDK
- Install Android Studio from [developer.android.com](https://developer.android.com/studio)
- Or download standalone Android SDK
- Add platform-tools to your system PATH

### 3. Appium
- Install Appium globally: `npm install -g appium`
- Verify installation: `appium --version`

### 4. Android Device Setup
- Enable Developer Options on your Android device
- Enable USB Debugging
- Connect device via USB cable
- Verify connection: `adb devices`

## 🛠️ Complete Setup Guide

### Step 1: Install Prerequisites

1. **Install Node.js**
   ```bash
   # Download from https://nodejs.org/
   # Verify installation
   node --version
   npm --version
   ```

2. **Install Android Studio**
   ```bash
   # Download from https://developer.android.com/studio
   # Install and set up Android SDK
   # Add to PATH: C:\Users\YourUsername\AppData\Local\Android\Sdk\platform-tools
   ```

3. **Install Appium**
   ```bash
   npm install -g appium
   appium --version
   ```

### Step 2: Device Setup

1. **Enable Developer Options**
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings > Developer Options
   - Enable "USB Debugging"

2. **Connect Device**
   ```bash
   # Connect via USB
   adb devices
   # Should show: List of devices attached
   # [device-id] device
   ```

3. **Install WhatsApp Business**
   - Install from Google Play Store
   - Log in to your account
   - Ensure you're on the main chat screen

### Step 3: Project Setup

1. **Clone/Download Project**
   ```bash
   # Navigate to project directory
   cd WhatsApp-AndroidStudio
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Device Settings**
   - Open `device-config.js`
   - Update with your device information:
   ```javascript
   device: {
       'appium:platformName': 'Android',
       'appium:platformVersion': '13', // Your Android version
       'appium:deviceName': 'Your Device Name',
       'appium:udid': 'Your Device UDID', // From adb devices
       'appium:automationName': 'UiAutomator2',
   }
   ```

4. **Configure Groups**
   - Edit `groups.csv`:
   ```csv
   id,name,contacts,operation
   1,Test Group 1,8250472237;9932647806,create
   2,Test Group 2,8250472237;9932647806,create
   ```

### Step 4: Run Automation

1. **Start Appium Server**
   ```bash
   # Terminal 1
   appium
   ```

2. **Run Automation**
   ```bash
   # Terminal 2
   npm run start
   ```

3. **Follow Instructions**
   - Wait for "Please make sure WhatsApp is open on your device!"
   - Open WhatsApp Business manually
   - Ensure you're on the main chat list screen
   - The automation will take control after 10 seconds

## 🔄 Detailed Workflow

The automation follows this exact sequence:

1. **Connection Setup**
   - Connects to Android device via Appium
   - Loads group configuration from CSV
   - Waits for WhatsApp to be ready

2. **Group Creation Process**
   - **Step 1a**: Click three dots menu (More options)
   - **Step 1b**: Select "New group" from menu
   - **Step 2**: Click search icon
   - **Step 3**: Add contacts by phone number
   - **Step 4**: Click arrow button to proceed
   - **Step 5**: Enter group name
   - **Step 6**: Click Create button
   - **Step 7**: Navigate back to main screen

3. **Contact Addition**
   - Enters phone number in search field
   - Waits for contact to appear
   - Selects contact from list
   - Repeats for all contacts

## 📜 Available Commands

```bash
# Setup and check prerequisites
npm run setup

# Start Appium server only
npm run start-appium

# Start automation only
npm run start

# Start both Appium and automation
npm run dev
```

## 🐛 Troubleshooting Guide

### Issue: Device Not Detected
```bash
# Check USB connection
adb devices

# If unauthorized, enable USB debugging on device
# Settings > Developer Options > USB Debugging
```

### Issue: Appium Connection Failed
```bash
# Check if Appium is running
appium --version

# Start Appium server
appium

# Check port 4723
netstat -an | findstr 4723
```

### Issue: WhatsApp Elements Not Found
- Ensure WhatsApp Business is installed and logged in
- Make sure you're on the main chat screen
- Check device configuration in `device-config.js`
- Verify Android version matches configuration

### Issue: Back Button Not Working
- The automation includes multiple fallback methods
- Check console logs for specific error messages
- Manual intervention may be required in some cases

### Issue: UiAutomator2 Server Crashed
```bash
# Kill existing processes
taskkill /f /im node.exe

# Restart Appium server
appium

# Run automation again
npm run start
```

## 🔧 Environment Variables

Set these for better debugging:
```bash
# Windows
set ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
set ANDROID_SDK_ROOT=C:\Users\YourUsername\AppData\Local\Android\Sdk

# macOS/Linux
export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
```

## 📁 Configuration Files

### device-config.js
```javascript
module.exports = {
    device: {
        'appium:platformName': 'Android',
        'appium:platformVersion': '13',
        'appium:deviceName': 'Your Device Name',
        'appium:udid': 'Your Device UDID',
        'appium:automationName': 'UiAutomator2',
    },
    appium: {
        host: 'localhost',
        port: 4723,
        path: '/',
    },
    capabilities: {
        'appium:ignoreHiddenApiPolicyError': true,
        'appium:noReset': true,
        'appium:fullReset': false,
        'appium:autoGrantPermissions': true,
        'appium:newCommandTimeout': 300,
    }
}
```

### groups.csv
```csv
id,name,contacts,operation
1,My Group 1,1234567890;9876543210,create
2,My Group 2,1234567890;9876543210,create
3,My Group 3,1234567890;9876543210,create
```

## 📊 Logs and Monitoring

### Console Output
- Real-time automation progress
- Step-by-step execution details
- Error messages and debugging info

### Log Files
- `logs.csv` - Group creation results
- Console logs - Detailed execution logs
- Error logs - Specific error information

### Debug Mode
```bash
# Enable detailed logging
DEBUG=appium* npm run start
```

## ❗ Common Error Solutions

### "Device unauthorized"
1. Enable USB debugging on device
2. Allow USB debugging when prompted
3. Check "Always allow from this computer"

### "Appium server not running"
1. Start Appium server: `appium`
2. Wait for "Appium REST http interface listener started"
3. Run automation in new terminal

### "WhatsApp not found"
1. Install WhatsApp Business
2. Log in to your account
3. Navigate to main chat screen
4. Ensure app is in foreground

### "Back button not working"
1. Check console logs for specific error
2. Manual intervention may be required
3. Use device back button if needed

## 🔄 Support and Maintenance

### Regular Maintenance
- Update Android SDK regularly
- Keep Appium updated: `npm update -g appium`
- Update device configuration when needed

### Getting Help
1. Check console logs for error messages
2. Verify all prerequisites are installed
3. Ensure device configuration is correct
4. Test with a single group first

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## ⚠️ Disclaimer

This tool is for educational and personal use only. Please respect WhatsApp's terms of service and use responsibly. The authors are not responsible for any misuse of this tool.


## 🚀 Quick Start Commands

### For Windows PowerShell:
```powershell
# Set environment variables and run automation
cd "C:\Users\Sarfaraj\Documents\GitHub\WhatsApp-Broadcast-Automate\WhatsApp-AndroidStudio"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = "$env:LOCALAPPDATA\Android\Sdk"
npm run start
```

### For Windows Command Prompt:
```cmd
# Set environment variables and run automation
cd "C:\Users\Sarfaraj\Documents\GitHub\WhatsApp-Broadcast-Automate\WhatsApp-AndroidStudio"
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
set ANDROID_SDK_ROOT=%LOCALAPPDATA%\Android\Sdk
npm run start
```

### For macOS/Linux:
```bash
# Set environment variables and run automation
cd "/path/to/WhatsApp-Broadcast-Automate/WhatsApp-AndroidStudio"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk"
npm run start
```

### One-Line Command (Windows PowerShell):
```powershell
cd "C:\Users\Sarfaraj\Documents\GitHub\WhatsApp-Broadcast-Automate\WhatsApp-AndroidStudio"; $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"; $env:ANDROID_SDK_ROOT = "$env:LOCALAPPDATA\Android\Sdk"; npm run start
```

### Using Scripts (Recommended):

#### Windows Batch Script:
```cmd
# Double-click or run from command line
run-automation.bat
```

#### Windows PowerShell Script:
```powershell
# Run from PowerShell
.\run-automation.ps1
```

**Note:** The scripts automatically set environment variables and provide helpful prompts.