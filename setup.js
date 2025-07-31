const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 WhatsApp Broadcast Automate - Setup Script');
console.log('=============================================\n');

// Check prerequisites
function checkPrerequisites() {
    console.log('📋 Checking prerequisites...\n');
    
    // Check Node.js
    try {
        const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
        console.log(`✅ Node.js: ${nodeVersion}`);
    } catch (error) {
        console.log('❌ Node.js not found. Please install Node.js from https://nodejs.org/');
        return false;
    }
    
    // Check npm
    try {
        const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
        console.log(`✅ npm: ${npmVersion}`);
    } catch (error) {
        console.log('❌ npm not found. Please install npm.');
        return false;
    }
    
    // Check Appium
    try {
        const appiumVersion = execSync('appium --version', { encoding: 'utf8' }).trim();
        console.log(`✅ Appium: ${appiumVersion}`);
    } catch (error) {
        console.log('❌ Appium not found. Installing Appium globally...');
        try {
            execSync('npm install -g appium', { stdio: 'inherit' });
            console.log('✅ Appium installed successfully');
        } catch (installError) {
            console.log('❌ Failed to install Appium. Please run: npm install -g appium');
            return false;
        }
    }
    
    // Check ADB
    try {
        const adbVersion = execSync('adb version', { encoding: 'utf8' });
        console.log('✅ ADB (Android Debug Bridge) found');
    } catch (error) {
        console.log('⚠️  ADB not found. Please install Android SDK and add platform-tools to PATH');
        console.log('   Download from: https://developer.android.com/studio#command-tools');
    }
    
    return true;
}

// Install project dependencies
function installDependencies() {
    console.log('\n📦 Installing project dependencies...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed successfully');
        return true;
    } catch (error) {
        console.log('❌ Failed to install dependencies');
        return false;
    }
}

// Check device configuration
function checkDeviceConfig() {
    console.log('\n📱 Checking device configuration...');
    
    const deviceConfigPath = path.join(__dirname, 'device-config.js');
    if (!fs.existsSync(deviceConfigPath)) {
        console.log('❌ device-config.js not found');
        return false;
    }
    
    try {
        const deviceConfig = require('./device-config');
        console.log(`✅ Device config found`);
        console.log(`   Platform: ${deviceConfig.device.platformName}`);
        console.log(`   Android Version: ${deviceConfig.device.platformVersion}`);
        console.log(`   Device Name: ${deviceConfig.device.deviceName}`);
        return true;
    } catch (error) {
        console.log('❌ Error reading device configuration');
        return false;
    }
}

// Display setup instructions
function displayInstructions() {
    console.log('\n📖 Setup Instructions:');
    console.log('=====================');
    console.log('1. Enable Developer Options on your Android device:');
    console.log('   Settings > About Phone > Tap "Build Number" 7 times');
    console.log('');
    console.log('2. Enable USB Debugging:');
    console.log('   Settings > Developer Options > USB Debugging');
    console.log('');
    console.log('3. Connect your device via USB');
    console.log('');
    console.log('4. Check if device is detected:');
    console.log('   adb devices');
    console.log('');
    console.log('5. Install WhatsApp on your device and log in');
    console.log('');
    console.log('6. Update device-config.js with your Android version');
    console.log('');
    console.log('7. Start Appium server:');
    console.log('   node start-appium.js');
    console.log('');
    console.log('8. Run the automation:');
    console.log('   node index.js');
    console.log('');
}

// Main setup function
function main() {
    if (!checkPrerequisites()) {
        console.log('\n❌ Prerequisites check failed. Please fix the issues above.');
        process.exit(1);
    }
    
    if (!installDependencies()) {
        console.log('\n❌ Failed to install dependencies.');
        process.exit(1);
    }
    
    if (!checkDeviceConfig()) {
        console.log('\n❌ Device configuration check failed.');
        process.exit(1);
    }
    
    displayInstructions();
    
    console.log('🎉 Setup completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Connect your Android device');
    console.log('   2. Update device-config.js with your Android version');
    console.log('   3. Start Appium server: node start-appium.js');
    console.log('   4. Run automation: node index.js');
}

main(); 