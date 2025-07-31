// Device Configuration Helper
// Update these settings according to your Android device

module.exports = {
    // Basic device information
    device: {
        'appium:platformName': 'Android',
        'appium:platformVersion': '13', // Updated to match your vivo Y73 Android version
        'appium:deviceName': 'vivo Y73', // Updated to match your device
        'appium:udid': '1363098100000NH', // Your specific device UDID for reliable connection
        'appium:automationName': 'UiAutomator2',
    },
    
    // Appium server settings
    appium: {
        host: 'localhost',
        port: 4723,
        path: '/',  // Updated for newer Appium versions
    },
    
    // WhatsApp app settings - We'll launch WhatsApp manually
    whatsapp: {
        // No app-specific settings - user will open WhatsApp manually
    },
    
    // Additional capabilities for better compatibility
    capabilities: {
        'appium:ignoreHiddenApiPolicyError': true,
        'appium:noReset': true,
        'appium:fullReset': false,
        'appium:autoGrantPermissions': true,
        'appium:newCommandTimeout': 300,
        // Uncomment the line below if you want to use a specific app
        // 'appium:app': '/path/to/whatsapp.apk', // Only needed if installing fresh WhatsApp
    },
    
    // Setup instructions
    setupInstructions: {
        step1: 'Install Android SDK and add platform-tools to PATH',
        step2: 'Enable Developer Options and USB Debugging on your Android device',
        step3: 'Connect device via USB and run: adb devices',
        step4: 'Install Appium Server globally: npm install -g appium',
        step5: 'Start Appium Server: appium',
        step6: 'Install WhatsApp on your device and log in',
        step7: 'Update platformVersion in this file to match your Android version',
        step8: 'Run the automation: node index.js'
    }
} 