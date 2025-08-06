# WhatsApp Group Automate

A Node.js automation tool for WhatsApp Web using WebDriverIO and Appium to manage WhatsApp groups, contacts, and messages on Android devices.

## 🚀 Features

- **Create WhatsApp Groups** - Automatically create new WhatsApp groups
- **Manage Contacts** - Add/remove contacts from existing groups
- **Read Group Information** - Extract phone numbers and names from groups
- **Contact Search** - Search contacts by keyword
- **Comprehensive Logging** - Track all operations with detailed logs
- **Flexible Configuration** - Easy setup for different devices and use cases

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **Android Device** with USB debugging enabled
- **WhatsApp** installed and logged in on the device
- **Android SDK** with platform-tools in PATH

## 🛠️ Installation & Setup

### 1. Clone and Install

```bash
https://github.com/sarfarajsekh/WhatsApp-Broadcast-Automate
cd WhatsApp-Broadcast-Automate
npm install
```

### 2. Run Setup Script

```bash
npm run setup
```

This will:
- Check all prerequisites
- Install dependencies
- Verify device configuration
- Display setup instructions

### 3. Configure Your Device

Edit `device-config.js` and update:
- `platformVersion` - Your Android version (e.g., '11', '12', '13', '14')
- `udid` - Your device UDID (optional, leave empty for auto-detection)

### 4. Enable Developer Options

On your Android device:
1. Go to **Settings > About Phone**
2. Tap **"Build Number"** 7 times to enable Developer Options
3. Go to **Settings > Developer Options**
4. Enable **USB Debugging**
5. Connect device via USB

### 5. Verify Device Connection

```bash
adb devices
```

You should see your device listed.

## 🎯 Usage

### Quick Start

1. **Start Appium Server:**
   ```bash
   npm run start-appium
   ```

2. **Run Automation:**
   ```bash
   npm run start
   ```

### Configuration

Edit `groups.js` to define your operations:

```javascript
module.exports = {
    groups: [
        // Create new broadcast group
        {
            id: '001',
            name: 'My Group',
            contacts: ['1234567890', '0987654321'],
            operation: 'create',
        },
        
        // Add contacts to existing group
        {
            id: '002',
            name: 'My Group',
            contacts: ['5555555555'],
            operation: 'add',
        },
        
        // Read group information
        {
            id: '003',
            name: 'My Group',
            operation: 'read-number'
        }
    ]
}
```

### Available Operations

| Operation | Description | Required Fields |
|-----------|-------------|-----------------|
| `create` | Create new broadcast group | `id`, `name`, `contacts` |
| `add` | Add contacts to existing group | `id`, `name`, `contacts` |
| `remove` | Remove contacts from group | `id`, `name`, `contacts` |
| `read-number` | Read phone numbers from group | `id`, `name` |
| `read-name` | Read contact names from group | `id`, `name` |
| `read-contacts` | Read all device contacts | `id` |
| `read-by-keyword` | Search contacts by keyword | `id`, `keyword` |

## 📊 Logging

The tool creates detailed logs in `logs.csv` with the following format:
```
GroupId,GroupName,Operation,Contact Number,Success(1)/Failure(0),date,time
```

## 🔧 Scripts

- `npm run setup` - Run setup and check prerequisites
- `npm run start-appium` - Start Appium server
- `npm run start` - Run the automation
- `npm run dev` - Start both Appium server and automation

## 🐛 Troubleshooting

### Common Issues

1. **"ADB not found"**
   - Install Android SDK and add platform-tools to PATH
   - Download from: https://developer.android.com/studio#command-tools

2. **"Device not detected"**
   - Enable USB debugging on your device
   - Install proper USB drivers
   - Try different USB cable

3. **"Appium connection failed"**
   - Make sure Appium server is running
   - Check if port 4723 is available
   - Verify device is connected

4. **"WhatsApp not found"**
   - Install WhatsApp on your device
   - Make sure you're logged in
   - Check if app package name is correct

### Debug Mode

For detailed debugging, check the Appium server logs when running:
```bash
npm run start-appium
```

## 📱 Device Compatibility

- **Android**: 8.0+ (API level 26+)
- **WhatsApp**: Latest version
- **Automation**: UiAutomator2

## 🔒 Security Notes

- This tool requires physical access to your device
- WhatsApp data remains on your device
- No data is transmitted to external servers
- Use responsibly and in compliance with WhatsApp's terms of service

## 📄 License

ISC License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## ⚠️ Disclaimer

This tool is for educational and personal use only. Please respect WhatsApp's terms of service and use responsibly. The authors are not responsible for any misuse of this tool.
