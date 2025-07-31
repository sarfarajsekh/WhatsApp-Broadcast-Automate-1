const wdio = require('webdriverio');
const deviceConfig = require('./device-config');

// Test to check available buttons after contact selection
const testAvailableButtons = async () => {
    console.log('🔍 Testing available buttons after contact selection...');
    
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
        
        // Look for all available buttons
        console.log('🔍 Looking for all available buttons...');
        
        try {
            const buttons = await client.$$('android.widget.Button');
            const textViews = await client.$$('android.widget.TextView');
            const allElements = [...buttons, ...textViews];
            
            console.log(`Found ${allElements.length} potential button elements`);
            
            for (let i = 0; i < Math.min(allElements.length, 20); i++) {
                try {
                    const text = await allElements[i].getText();
                    const contentDesc = await allElements[i].getAttribute('content-desc');
                    const isClickable = await allElements[i].getAttribute('clickable');
                    const isEnabled = await allElements[i].getAttribute('enabled');
                    
                    if ((text || contentDesc) && isClickable === 'true' && isEnabled === 'true') {
                        console.log(`  Button ${i + 1}: Text="${text}", ContentDesc="${contentDesc}", Clickable=${isClickable}, Enabled=${isEnabled}`);
                    }
                } catch (e) {
                    // Skip elements that can't be read
                }
            }
        } catch (e) {
            console.log('Could not read available buttons:', e.message);
        }
        
        // Look specifically for create-related buttons
        console.log('🔍 Looking for create-related buttons...');
        const createKeywords = ['Create', 'Create group', 'Next', 'Continue', 'Done', 'OK', 'Confirm', 'Finish'];
        
        for (const keyword of createKeywords) {
            try {
                const element = await client.$(`android=new UiSelector().text("${keyword}")`);
                await element.waitForExist({ timeout: 2000 });
                console.log(`✅ Found button: "${keyword}"`);
            } catch (error) {
                console.log(`❌ Not found: "${keyword}"`);
            }
        }
        
        console.log('✅ Test completed. Check the output above to see available buttons!');
        
    } catch (error) {
        console.error('❌ Error during test:', error.message);
    } finally {
        if (client) {
            await client.deleteSession();
        }
    }
};

testAvailableButtons(); 