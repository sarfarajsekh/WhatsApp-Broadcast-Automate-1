const wdio = require('webdriverio');
const deviceConfig = require('./device-config');

// Simple test to check if group was created
const testGroupCreation = async () => {
    console.log('🔍 Testing if WhatsApp group was created...');
    
    const opts = {
        hostname: deviceConfig.appium.host,
        port: deviceConfig.appium.port,
        path: deviceConfig.appium.path,
        capabilities: {
            ...deviceConfig.device,
            ...deviceConfig.capabilities
        },
        logLevel: 'info'
    };

    let client;
    try {
        client = await wdio.remote(opts);
        console.log('✅ Connected to device');
        
        // Wait a moment for WhatsApp to load
        await client.pause(3000);
        
        // Try to find any text that might indicate a group was created
        console.log('🔍 Looking for group creation indicators...');
        
        // Check for common group-related text
        const groupIndicators = [
            'My First Group',
            'Group',
            'participants',
            '8250472237',
            '9932647806'
        ];
        
        for (const indicator of groupIndicators) {
            try {
                const element = await client.$(`android=new UiSelector().textContains("${indicator}")`);
                await element.waitForExist({ timeout: 2000 });
                console.log(`✅ Found indicator: "${indicator}"`);
            } catch (error) {
                console.log(`❌ Not found: "${indicator}"`);
            }
        }
        
        // Try to find any buttons that might be available
        console.log('🔍 Looking for available buttons...');
        try {
            const buttons = await client.$$('android.widget.Button');
            const textViews = await client.$$('android.widget.TextView');
            const allElements = [...buttons, ...textViews];
            
            for (let i = 0; i < Math.min(allElements.length, 10); i++) {
                try {
                    const text = await allElements[i].getText();
                    const contentDesc = await allElements[i].getAttribute('content-desc');
                    if (text || contentDesc) {
                        console.log(`  - Text: "${text}", ContentDesc: "${contentDesc}"`);
                    }
                } catch (e) {
                    // Skip elements that can't be read
                }
            }
        } catch (e) {
            console.log('Could not read available elements');
        }
        
        console.log('✅ Test completed. Check the output above to see if your group was created!');
        
    } catch (error) {
        console.error('❌ Error during test:', error.message);
    } finally {
        if (client) {
            await client.deleteSession();
        }
    }
};

testGroupCreation(); 