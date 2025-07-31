const { spawn } = require('child_process');
const deviceConfig = require('./device-config');

console.log('🚀 Starting Appium Server...');
console.log(`📍 Server will be available at: http://${deviceConfig.appium.host}:${deviceConfig.appium.port}${deviceConfig.appium.path}`);

// Start Appium server
const appium = spawn('appium', [
    '--host', deviceConfig.appium.host,
    '--port', deviceConfig.appium.port.toString(),
    '--base-path', deviceConfig.appium.path,
    '--log-level', 'info',
    '--log-timestamp',
    '--local-timezone'
], {
    stdio: 'inherit',
    shell: true
});

appium.on('error', (error) => {
    console.error('❌ Failed to start Appium server:', error.message);
    console.log('💡 Make sure Appium is installed globally: npm install -g appium');
    process.exit(1);
});

appium.on('close', (code) => {
    console.log(`📱 Appium server stopped with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping Appium server...');
    appium.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Stopping Appium server...');
    appium.kill('SIGTERM');
    process.exit(0);
}); 