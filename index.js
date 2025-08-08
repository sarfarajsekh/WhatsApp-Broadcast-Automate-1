const fs = require('fs')
const wdio = require('webdriverio')
const { message } = require('./message')
const deviceConfig = require('./device-config')
const { readGroupsFromCSV, validateGroups } = require('./csv-reader')

// Merge device configuration
const DEVICE_CONFIG = {
    ...deviceConfig.device,
    ...deviceConfig.whatsapp,
    ...deviceConfig.capabilities
}

const opts = {
    hostname: deviceConfig.appium.host,
    port: deviceConfig.appium.port,
    path: deviceConfig.appium.path,
    capabilities: DEVICE_CONFIG,
    logLevel: 'info',
    connectionRetryCount: 3,
    connectionRetryTimeout: 120000,
}

let client
let logString = ''
let currentGroupId
let currentGroupName
let currentNumber
let currentOperation

fs.appendFile('logs.csv', 'GroupId,GroupName,Operation,Contact Number,Success(1)/Failure(0),date,time\n', () => {})

const waitForElementToExist = async (element, timeout = 5000) => {
// delay for list load first time - optimization
    await element.waitForExist({ timeout })
}

const openMoreOptions = async () => {
    console.log('🔍 Looking for More options button...')
    
    // Try different selectors for the More options button (WhatsApp Business)
    const selectors = [
        '~More options',
        '~More',
        '~Options',
        '~Menu',
        '~More options menu',
        '~Three dots',
        '~Settings',
        '~Business tools',
        '~Business menu',
        '~New group',
        '~Create group',
        '~Add group'
    ]
    
    for (const selector of selectors) {
        try {
            console.log(`  Trying selector: ${selector}`)
            const element = await client.$(selector)
            await element.waitForExist({ timeout: 2000 })
            await element.click()
            console.log(`✅ Found and clicked: ${selector}`)
            return
        } catch (error) {
            console.log(`  ❌ Not found: ${selector}`)
            continue
        }
    }
    
    // If no accessibility ID works, try by text
    try {
        console.log('  Trying by text: "More options"')
        const textSelector = 'new UiSelector().text("More options").className("android.widget.TextView")'
        const element = await client.$(`android=${textSelector}`)
        await element.waitForExist({ timeout: 2000 })
        await element.click()
        console.log('✅ Found and clicked by text: "More options"')
        return
    } catch (error) {
        console.log('  ❌ Not found by text')
    }
    
    // If still not found, try by resource ID (WhatsApp Business)
    try {
        console.log('  Trying by resource ID: "menu"')
        const resourceSelector = 'new UiSelector().resourceId("com.whatsapp:id/menu")'
        const element = await client.$(`android=${resourceSelector}`)
        await element.waitForExist({ timeout: 2000 })
        await element.click()
        console.log('✅ Found and clicked by resource ID: "menu"')
        return
    } catch (error) {
        console.log('  ❌ Not found by resource ID')
    }
    
    // Try WhatsApp Business specific resource IDs
    try {
        console.log('  Trying WhatsApp Business resource ID: "business_tools"')
        const businessSelector = 'new UiSelector().resourceId("com.whatsapp.w4b:id/business_tools")'
        const element = await client.$(`android=${businessSelector}`)
        await element.waitForExist({ timeout: 2000 })
        await element.click()
        console.log('✅ Found and clicked by WhatsApp Business resource ID: "business_tools"')
        return
    } catch (error) {
        console.log('  ❌ Not found by WhatsApp Business resource ID')
    }
    
    throw new Error('Could not find More options button. Please make sure WhatsApp is open and you are on the main chat list screen.')
}

const getMoreOptionButtonWithText = async (value) => {
    console.log(`🔍 Looking for menu option: "${value}"`)
    
    // Try different approaches to find the menu option
    const selectors = [
        `new UiSelector().text("${value}").className("android.widget.TextView")`,
        `new UiSelector().text("${value}")`,
        `new UiSelector().textContains("${value}")`,
        `new UiSelector().description("${value}")`
    ]
    
    for (const selector of selectors) {
        try {
            console.log(`  Trying selector: ${selector}`)
    const button = await client.$(`android=${selector}`)
            await button.waitForExist({ timeout: 3000 })
            console.log(`✅ Found: "${value}" with selector: ${selector}`)
    return button
        } catch (error) {
            console.log(`  ❌ Not found with selector: ${selector}`)
            continue
        }
    }
    
    // If not found, let's see what menu options are available
    console.log('📋 Available menu options:')
    try {
        const allTextViews = await client.$$('android.widget.TextView')
        for (let i = 0; i < Math.min(allTextViews.length, 10); i++) {
            try {
                const text = await allTextViews[i].getText()
                if (text && text.trim()) {
                    console.log(`  - "${text}"`)
                }
            } catch (e) {
                // Skip elements that can't be read
            }
        }
    } catch (e) {
        console.log('  Could not read available options')
    }
    
    throw new Error(`Could not find menu option: "${value}". Please check the available options above.`)
}

const clickOnMoreOptionsButtonWithText = async (value) => {
    const button = await getMoreOptionButtonWithText(value)
    await button.click()
}

const selectMoreOptionsButtonWithText = async (value) => {
    await openMoreOptions()
    await clickOnMoreOptionsButtonWithText(value)
}

const clickOnButtonWithContentDesc = async (value) => {
    console.log(`🔍 Looking for button: "${value}"`)
    
    try {
    const button = await client.$(`~${value}`)
        await button.waitForExist({ timeout: 3000 })
    await button.click()
        console.log(`✅ Clicked button: "${value}"`)
    } catch (error) {
        console.log(`⚠️ Button "${value}" not found, continuing...`)
        // Continue without this button - it might not be needed
    }
}

const openNewGroupView = async () => await selectMoreOptionsButtonWithText('New group')

const clickOnSearch = async () => await clickOnButtonWithContentDesc('Search')

const getTextField = async (isAutoComplete) => {
    console.log('🔍 Looking for search text field...')
    
    // Try different approaches to find the search field (WhatsApp Business)
    const selectors = [
        `new UiSelector().resourceId("com.whatsapp.w4b:id/search_src_text")`,
        `new UiSelector().resourceId("com.whatsapp.w4b:id/search_input")`,
        `new UiSelector().resourceId("com.whatsapp.w4b:id/search_edit_text")`,
        `new UiSelector().text("Search name or number…").className(android.widget.${isAutoComplete ? "AutoCompleteTextView" : "EditText"})`,
        `new UiSelector().text("Search…").className(android.widget.${isAutoComplete ? "AutoCompleteTextView" : "EditText"})`,
        `new UiSelector().text("Search").className(android.widget.${isAutoComplete ? "AutoCompleteTextView" : "EditText"})`,
        `new UiSelector().textContains("Search").className(android.widget.${isAutoComplete ? "AutoCompleteTextView" : "EditText"})`,
        `new UiSelector().className(android.widget.${isAutoComplete ? "AutoCompleteTextView" : "EditText"})`,
        `new UiSelector().resourceId("com.whatsapp:id/search_input")`,
        `new UiSelector().resourceId("com.whatsapp:id/search_edit_text")`
    ]
    
    for (const selector of selectors) {
        try {
            console.log(`  Trying selector: ${selector}`)
            const textField = await client.$(`android=${selector}`)
            await textField.waitForExist({ timeout: 3000 })
            console.log(`✅ Found search field with selector: ${selector}`)
    return textField
        } catch (error) {
            console.log(`  ❌ Not found with selector: ${selector}`)
            continue
        }
    }
    
    // If not found, let's see what input fields are available
    console.log('📋 Available input fields:')
    try {
        const allEditTexts = await client.$$('android.widget.EditText')
        const allAutoCompleteTextViews = await client.$$('android.widget.AutoCompleteTextView')
        const allInputs = [...allEditTexts, ...allAutoCompleteTextViews]
        
        for (let i = 0; i < Math.min(allInputs.length, 5); i++) {
            try {
                const text = await allInputs[i].getText()
                const hint = await allInputs[i].getAttribute('hint')
                const resourceId = await allInputs[i].getAttribute('resource-id')
                console.log(`  - Text: "${text}", Hint: "${hint}", ResourceId: "${resourceId}"`)
            } catch (e) {
                // Skip elements that can't be read
            }
        }
    } catch (e) {
        console.log('  Could not read available input fields')
    }
    
    throw new Error('Could not find search text field. Please check the available input fields above.')
}

const clearTextField = async () => {
    try {
    await clickOnButtonWithContentDesc('Clear query')
    } catch (error) {
        console.log('⚠️ Clear query button not found, trying alternative methods...')
        // Try to clear the text field directly
        try {
            const textField = await getTextField(true)
            await textField.clearValue()
            console.log('✅ Cleared text field directly')
        } catch (clearError) {
            console.log('⚠️ Could not clear text field, continuing...')
        }
    }
}

const addInLogString = (success) => {
    const date = new Date()
    logString += `${currentGroupId},${currentGroupName},${currentOperation},${currentNumber},${success},${date.toLocaleDateString()},${date.toLocaleTimeString()}\n`
}

const selectFirstContactIfItExists = async (operation) => {
    console.log('🔍 Looking for contacts to select...')
    
    try {
        // Wait longer for the contact list to load
        await client.pause(3000)
        
        // Method 1: Try to find contact by phone number directly
        try {
            console.log('🔍 Method 1: Looking for contact by phone number...')
            const contactByNumber = await client.$(`~${currentNumber}`)
            await contactByNumber.waitForExist({ timeout: 3000 })
            console.log('✅ Found contact by phone number')
            await contactByNumber.click()
            addInLogString('1')
            console.log('✅ Successfully selected contact by phone number')
            return
        } catch (error) {
            console.log('⚠️ Contact not found by phone number, trying other methods...')
        }
        
        // Method 2: Try to find contact by text content (excluding search field)
        try {
            console.log('🔍 Method 2: Looking for contact by text content (excluding search field)...')
            
            // Get all elements with the phone number
            const allElements = await client.$$(`android=new UiSelector().textContains("${currentNumber}")`)
            console.log(`Found ${allElements.length} elements containing "${currentNumber}"`)
            
            for (let i = 0; i < allElements.length; i++) {
                try {
                    const element = allElements[i]
                    const text = await element.getText()
                    const resourceId = await element.getAttribute('resource-id')
                    const className = await element.getAttribute('class')
                    const isClickable = await element.getAttribute('clickable')
                    
                    console.log(`  Element ${i}: Text="${text}", ResourceId="${resourceId}", Class="${className}", Clickable=${isClickable}`)
                    
                    // Skip the search field itself
                    if (resourceId && resourceId.includes('search_src_text')) {
                        console.log(`  Skipping search field: ${resourceId}`)
                        continue
                    }
                    
                    // Skip if it's the search input field
                    if (className && className.includes('EditText')) {
                        console.log(`  Skipping EditText element: ${className}`)
                        continue
                    }
                    
                    // If it's clickable and not the search field, click it
                    if (isClickable === 'true' && text && text.includes(currentNumber)) {
                        console.log(`✅ Found clickable contact element: "${text}"`)
                        await element.click()
                        addInLogString('1')
                        console.log('✅ Successfully selected contact by text content')
                        return
                    }
                } catch (e) {
                    console.log(`  Error with element ${i}: ${e.message}`)
                    continue
                }
            }
            
            console.log('⚠️ No suitable contact found by text content')
        } catch (error) {
            console.log('⚠️ Contact not found by text content, trying other methods...')
        }
        
        // Method 3: Try to find contact by description
        try {
            console.log('🔍 Method 3: Looking for contact by description...')
            const contactByDescription = await client.$(`android=new UiSelector().descriptionContains("${currentNumber}")`)
            await contactByDescription.waitForExist({ timeout: 3000 })
            console.log('✅ Found contact by description')
            await contactByDescription.click()
            addInLogString('1')
            console.log('✅ Successfully selected contact by description')
            return
        } catch (error) {
            console.log('⚠️ Contact not found by description, trying other methods...')
        }
        
        // Method 4: Try to find contact list items specifically
        try {
            console.log('🔍 Method 4: Looking for contact list items...')
            
            // Wait a bit longer for the contact list to load
            await client.pause(2000)
            
            // Try different approaches to find and select contacts
            const contactSelectors = [
                'android.widget.ListView android.widget.RelativeLayout',
                'android.widget.ListView android.widget.LinearLayout',
                'androidx.recyclerview.widget.RecyclerView android.widget.RelativeLayout',
                'androidx.recyclerview.widget.RecyclerView android.widget.LinearLayout',
                'android.widget.RelativeLayout',
                'android.widget.LinearLayout'
            ]
            
            for (const selector of contactSelectors) {
                try {
                    console.log(`  Trying selector: ${selector}`)
                    
                    // Try to find the list container first
                    let listContainer
                    try {
                        listContainer = await client.$('android.widget.ListView')
                        await listContainer.waitForExist({ timeout: 3000 })
                    } catch (e) {
                        try {
                            listContainer = await client.$('androidx.recyclerview.widget.RecyclerView')
                            await listContainer.waitForExist({ timeout: 3000 })
                        } catch (e2) {
                            // If no list container, try direct selection
                            listContainer = client
                        }
                    }
                    
                    // Find contacts within the container
                    const contacts = await listContainer.$$(selector)
                    console.log(`  Found ${contacts.length} potential contacts`)
                    
                    if (contacts.length > 0) {
                        // Try to find the first clickable contact
                        for (let i = 0; i < Math.min(contacts.length, 5); i++) {
                            try {
                                const contact = contacts[i]
                                await contact.waitForExist({ timeout: 2000 })
                                
                                // Check if this contact is already selected (for add/remove operations)
                                if (['add', 'remove'].includes(operation)) {
                                    try {
                                        const selected = await contact.$('~Selected')
                                        const isSelected = !selected.error
                                        
                                        if ((isSelected && operation === 'add') || (!isSelected && operation === 'remove')) {
                                            console.log(`✅ Contact already in correct state for ${operation} operation`)
                addInLogString('1')
                await clearTextField()
                return
            }
                                    } catch (e) {
                                        // No selection indicator found, continue
                                    }
                                }
                                
                                // Click the contact
                                await contact.click()
                                console.log(`✅ Successfully clicked contact ${i + 1}`)
                                addInLogString('1')
                                
                                if (operation === 'remove') {
                                    await clearTextField()
                                }
                                return
                                
                            } catch (e) {
                                console.log(`  ❌ Could not click contact ${i + 1}: ${e.message}`)
                                continue
                            }
                        }
                    }
                    
                } catch (error) {
                    console.log(`  ❌ Selector failed: ${selector} - ${error.message}`)
                    continue
                }
            }
        } catch (error) {
            console.log(`❌ Method 4 failed: ${error.message}`)
        }
        
        // Method 5: Try to find any element with the phone number
        try {
            console.log('🔍 Method 5: Looking for any element with phone number...')
            const allElements = await client.$$('*')
            for (let i = 0; i < Math.min(allElements.length, 20); i++) {
                try {
                    const element = allElements[i]
                    const text = await element.getText()
                    const contentDesc = await element.getAttribute('content-desc')
                    
                    if ((text && text.includes(currentNumber)) || (contentDesc && contentDesc.includes(currentNumber))) {
                        console.log(`✅ Found element with phone number: Text="${text}", ContentDesc="${contentDesc}"`)
                        await element.click()
                        addInLogString('1')
                        console.log('✅ Successfully selected contact by element search')
                        return
                    }
                } catch (e) {
                    // Skip elements that can't be read
                }
            }
        } catch (error) {
            console.log(`❌ Method 5 failed: ${error.message}`)
        }
        
                // Method 6: Try to find contact items in the list view
        try {
            console.log('🔍 Method 6: Looking for contact items in list view...')
            
            // First, try to find the list container
            let listContainer = null
            try {
                listContainer = await client.$('android.widget.ListView')
                await listContainer.waitForExist({ timeout: 3000 })
                console.log('✅ Found ListView container')
            } catch (e) {
                try {
                    listContainer = await client.$('androidx.recyclerview.widget.RecyclerView')
                    await listContainer.waitForExist({ timeout: 3000 })
                    console.log('✅ Found RecyclerView container')
                } catch (e2) {
                    console.log('⚠️ No list container found, trying global search')
                }
            }
            
            // Look for contact items within the container or globally
            const searchElements = listContainer ? [listContainer] : await client.$$('*')
            
            for (const container of searchElements) {
                try {
                    // Look for contact items within this container
                    const contactItems = await container.$$('android.widget.RelativeLayout')
                    
                    if (contactItems.length === 0) {
                        // Try other common contact item selectors
                        const alternativeItems = await container.$$('android.widget.LinearLayout')
                        if (alternativeItems.length > 0) {
                            contactItems.push(...alternativeItems)
                        }
                    }
                    
                    console.log(`  Found ${contactItems.length} potential contact items`)
                    
                    for (let i = 0; i < Math.min(contactItems.length, 10); i++) {
                        try {
                            const item = contactItems[i]
                            
                            // Get element properties
                            const isClickable = await item.getAttribute('clickable')
                            const isEnabled = await item.getAttribute('enabled')
                            const text = await item.getText()
                            const contentDesc = await item.getAttribute('content-desc')
                            
                            console.log(`    Item ${i}: clickable=${isClickable}, enabled=${isEnabled}, text="${text}", contentDesc="${contentDesc}"`)
                            
                            // Check if this looks like a contact item
                            if (isClickable === 'true' && isEnabled === 'true' && (text || contentDesc)) {
                                // Check if it contains our phone numbers
                                const hasPhoneNumber = (text && (text.includes('8250472237') || text.includes('9932647806'))) ||
                                                      (contentDesc && (contentDesc.includes('8250472237') || contentDesc.includes('9932647806')))
                                
                                if (hasPhoneNumber) {
                                    console.log(`✅ Found contact with phone number: "${text || contentDesc}"`)
                                    
                                    // Check selection state for add/remove operations
                                    if (['add', 'remove'].includes(operation)) {
                                        try {
                                            const selectedIndicator = await item.$('~Selected')
                                            const isSelected = await selectedIndicator.isExisting()
                                            
                                            if ((isSelected && operation === 'add') || (!isSelected && operation === 'remove')) {
                                                console.log(`✅ Contact already in correct state for ${operation} operation`)
                                                addInLogString('1')
                                                await clearTextField()
                                                return
                                            }
                                        } catch (e) {
                                            console.log('No selection indicator found, proceeding with click')
                                        }
                                    }
                                    
                                    // Click the contact
                                    await item.click()
                                    addInLogString('1')
                                    console.log('✅ Successfully selected contact')
                                    return
                                }
                            }
                        } catch (e) {
                            console.log(`    Error with item ${i}: ${e.message}`)
                            continue
                        }
                    }
                } catch (e) {
                    console.log(`Error with container: ${e.message}`)
                    continue
                }
            }
        } catch (error) {
            console.log(`❌ Method 6 failed: ${error.message}`)
        }
        
        // Method 7: Try to find any clickable element that might be a contact (simplified)
        try {
            console.log('🔍 Method 7: Looking for any clickable element...')
            const allElements = await client.$$('*')
            
            for (let i = 0; i < Math.min(allElements.length, 30); i++) {
                try {
                    const element = allElements[i]
                    const isClickable = await element.getAttribute('clickable')
                    const isEnabled = await element.getAttribute('enabled')
                    const text = await element.getText()
                    const contentDesc = await element.getAttribute('content-desc')
                    
                    // Look for clickable elements that might be contacts
                    if (isClickable === 'true' && isEnabled === 'true' && (text || contentDesc)) {
                        console.log(`  Found clickable element: Text="${text}", ContentDesc="${contentDesc}"`)
                        
                        // If it contains our phone number, click it
                        if ((text && text.includes(currentNumber)) || (contentDesc && contentDesc.includes(currentNumber))) {
                            console.log(`✅ Found contact with phone number: "${text || contentDesc}"`)
                            await element.click()
                            addInLogString('1')
                            console.log('✅ Successfully selected contact')
                            return
                        }
                        
                        // If it looks like a contact name or has contact-like text, try clicking it
                        if (text && (text.length > 3 && text.length < 50) && !text.includes('Search') && !text.includes('Clear')) {
                            console.log(`✅ Trying to click potential contact: "${text}"`)
                            await element.click()
                            addInLogString('1')
                            console.log('✅ Successfully clicked potential contact')
                            return
                        }
                    }
                } catch (e) {
                    // Skip elements that can't be read
                }
            }
        } catch (error) {
            console.log(`❌ Method 7 failed: ${error.message}`)
        }
        
        // If no contacts found, let's see what elements are available
        console.log('📋 Available elements for contact selection:')
        try {
            const allElements = await client.$$('*')
            for (let i = 0; i < Math.min(allElements.length, 10); i++) {
                try {
                    const className = await allElements[i].getAttribute('class')
                    const text = await allElements[i].getText()
                    const resourceId = await allElements[i].getAttribute('resource-id')
                    const isClickable = await allElements[i].getAttribute('clickable')
                    if (className && (className.includes('RelativeLayout') || className.includes('LinearLayout')) && isClickable === 'true') {
                        console.log(`  - Class: "${className}", Text: "${text}", ResourceId: "${resourceId}", Clickable: ${isClickable}`)
                    }
                } catch (e) {
                    // Skip elements that can't be read
                }
            }
        } catch (e) {
            console.log('  Could not read available elements')
        }
        
        console.log('❌ No contacts found to select')
        addInLogString('0')
        await clearTextField()
        
    } catch (e) {
        console.log('❌ Error selecting contact:', e.message)
        addInLogString('0')
        await clearTextField()
    }
}


const sendValueToTextField = async (value) => {
    const textField = await getTextField(true)
    await textField.setValue(value)
}

const addContact = async (value, operation) => {
    console.log(`\n📱 Processing contact: ${value}`)
    console.log(`🎯 Operation type: ${operation}`)
    
    currentNumber = value
    
    console.log('  📝 Step 1: Entering phone number in search field...')
    await sendValueToTextField(value)
    console.log(`  ✅ Phone number "${value}" entered successfully`)
    
    // Wait longer for contact to appear and be clickable
    console.log('  ⏳ Step 2: Waiting for contact to load and appear in list...')
    await client.pause(4000)
    console.log('  ✅ Wait completed, contact should be visible now')
    
    // Try to select the contact
    console.log('  🔍 Step 3: Attempting to select contact from list...')
    await selectFirstContactIfItExists(operation)
    console.log('  ✅ Contact selection process completed')
    
    // If contact selection failed, try a different approach
    console.log('  🔄 Step 4: If contact selection failed, trying alternative approach...')
    await client.pause(2000)
    
    // Try to find and click any element that might be the contact
    try {
        console.log('  🔍 Alternative: Searching for any element with phone number...')
        const allElements = await client.$$('*')
        console.log(`  📊 Found ${allElements.length} total elements on screen`)
        
        for (let i = 0; i < Math.min(allElements.length, 20); i++) {
            try {
                const element = allElements[i]
                const text = await element.getText()
                const isClickable = await element.getAttribute('clickable')
                
                if (isClickable === 'true' && text && text.includes(value)) {
                    console.log(`  🔄 Alternative: Found clickable element with phone number: "${text}"`)
                    await element.click()
                    console.log('  ✅ Successfully selected contact via alternative method')
                    return
                }
            } catch (e) {
                // Skip elements that can't be read
            }
        }
        console.log('  ⚠️ Alternative approach did not find suitable contact element')
    } catch (e) {
        console.log('  ❌ Alternative approach failed:', e.message)
    }
    
    console.log(`  📊 Contact processing for "${value}" completed`)
}

const clickOnButtonWithContentDisc = async (value) => {
    const button = await client.$(`~${value}`)
    await waitForElementToExist(button)
    await button.click()
}

const clickArrowButton = async () => {
    console.log('\n➡️ Looking for arrow button to proceed to group name screen...')
    console.log('📱 Current screen: Contact selection screen (after adding contacts)')
    
    // Wait a moment for the screen to load
    console.log('⏳ Waiting for screen to stabilize...')
    await client.pause(2000)
    console.log('✅ Screen should be ready now')
    
    try {
        // Method 1: Try to find by accessibility ID
        console.log('\n🔍 Method 1: Looking for arrow button by accessibility ID "~Next"...')
        const arrowButton = await client.$('~Next')
        await arrowButton.waitForExist({ timeout: 5000 })
        console.log('✅ Found "Next" button by accessibility ID')
        await arrowButton.click()
        console.log('✅ Successfully clicked "Next" button via accessibility ID')
        console.log('📱 Proceeding to group name screen...')
        return
    } catch (error) {
        console.log('⚠️ Method 1 failed: "Next" button not found by accessibility ID')
        console.log(`   Error: ${error.message}`)
    }
    
    try {
        // Method 2: Try to find by text content
        console.log('\n🔍 Method 2: Looking for arrow button by text content "Next"...')
        const arrowButton = await client.$('android=new UiSelector().text("Next")')
        await arrowButton.waitForExist({ timeout: 3000 })
        console.log('✅ Found "Next" button by text content')
        await arrowButton.click()
        console.log('✅ Successfully clicked "Next" button via text content')
        console.log('📱 Proceeding to group name screen...')
        return
    } catch (error) {
        console.log('⚠️ Method 2 failed: "Next" button not found by text content')
        console.log(`   Error: ${error.message}`)
    }
    
    try {
        // Method 3: Try to find by resource ID (common for FAB buttons)
        console.log('\n🔍 Method 3: Looking for arrow button by resource ID "com.whatsapp:id/fab"...')
        const arrowButton = await client.$('android=new UiSelector().resourceId("com.whatsapp:id/fab")')
        await arrowButton.waitForExist({ timeout: 3000 })
        console.log('✅ Found FAB button by resource ID')
        await arrowButton.click()
        console.log('✅ Successfully clicked FAB button via resource ID')
        console.log('📱 Proceeding to group name screen...')
        return
    } catch (error) {
        console.log('⚠️ Method 3 failed: FAB button not found by resource ID')
        console.log(`   Error: ${error.message}`)
    }
    
    try {
        // Method 4: Try to find any clickable button with arrow-like content
        console.log('\n🔍 Method 4: Scanning all clickable elements for arrow/next buttons...')
        const allElements = await client.$$('*')
        console.log(`📊 Found ${allElements.length} total elements on screen`)
        
        let clickableCount = 0
        for (let i = 0; i < Math.min(allElements.length, 30); i++) {
            try {
                const element = allElements[i]
                const isClickable = await element.getAttribute('clickable')
                const isEnabled = await element.getAttribute('enabled')
                const contentDesc = await element.getAttribute('content-desc')
                const text = await element.getText()
                const className = await element.getAttribute('class')
                
                if (isClickable === 'true' && isEnabled === 'true') {
                    clickableCount++
                    console.log(`  🔘 Clickable element ${clickableCount}: Class="${className}", Text="${text}", ContentDesc="${contentDesc}"`)
                    
                    // Look for arrow, next, or proceed-like content
                    if (contentDesc && (contentDesc.includes('Next') || contentDesc.includes('arrow') || contentDesc.includes('proceed'))) {
                        console.log(`✅ Found potential arrow button: "${contentDesc}"`)
                        await element.click()
                        console.log('✅ Successfully clicked potential arrow button')
                        console.log('📱 Proceeding to group name screen...')
                        return
                    }
                    
                    // If it's a FAB or button class and has no text, it might be the arrow button
                    if ((className && className.includes('FloatingActionButton')) || (className && className.includes('Button'))) {
                        if (!text || text.length === 0) {
                            console.log(`✅ Found potential FAB/Button: Class="${className}"`)
                            await element.click()
                            console.log('✅ Successfully clicked potential FAB/Button')
                            console.log('📱 Proceeding to group name screen...')
                            return
                        }
                    }
                }
            } catch (e) {
                // Skip elements that can't be read
            }
        }
        console.log(`📊 Scanned ${clickableCount} clickable elements, no suitable arrow button found`)
    } catch (error) {
        console.log('⚠️ Method 4 failed: Could not scan elements')
        console.log(`   Error: ${error.message}`)
    }
    
    console.log('\n❌ Could not find arrow button to proceed to group name screen')
    console.log('💡 Available options on this screen:')
    console.log('   - Look for a "Next" button or arrow icon')
    console.log('   - Check if there\'s a floating action button (FAB)')
    console.log('   - Verify contacts are properly selected')
}

const enterGroupName = async (name) => {
    console.log(`\n📝 Entering group name: "${name}"`)
    console.log('📱 Current screen: Group name input screen (after clicking arrow button)')
    
    // Wait a moment for the screen to load
    console.log('⏳ Waiting for group name screen to load...')
    await client.pause(2000)
    console.log('✅ Group name screen should be ready now')
    
    try {
        // Method 1: Try to find by placeholder text
        console.log('\n🔍 Method 1: Looking for group name field by placeholder text "Group name (optional)"...')
        const groupNameField = await client.$('android=new UiSelector().text("Group name (optional)").className("android.widget.EditText")')
        await groupNameField.waitForExist({ timeout: 5000 })
        console.log('✅ Found group name field by placeholder text')
        await groupNameField.click()
        console.log('✅ Clicked on group name field')
        await groupNameField.setValue(name)
        console.log(`✅ Successfully entered group name: "${name}"`)
        return
    } catch (error) {
        console.log('⚠️ Method 1 failed: Group name field not found by placeholder text')
        console.log(`   Error: ${error.message}`)
    }
    
    try {
        // Method 2: Try to find by resource ID
        console.log('\n🔍 Method 2: Looking for group name field by resource ID "com.whatsapp:id/group_name_input"...')
        const groupNameField = await client.$('android=new UiSelector().resourceId("com.whatsapp:id/group_name_input")')
        await groupNameField.waitForExist({ timeout: 3000 })
        console.log('✅ Found group name field by resource ID')
        await groupNameField.click()
        console.log('✅ Clicked on group name field')
        await groupNameField.setValue(name)
        console.log(`✅ Successfully entered group name via resource ID: "${name}"`)
        return
    } catch (error) {
        console.log('⚠️ Method 2 failed: Group name field not found by resource ID')
        console.log(`   Error: ${error.message}`)
    }
    
    try {
        // Method 3: Try to find any EditText field
        console.log('\n🔍 Method 3: Scanning all EditText fields on screen...')
        const editTextFields = await client.$$('android.widget.EditText')
        console.log(`📊 Found ${editTextFields.length} EditText fields on screen`)
        
        for (let i = 0; i < editTextFields.length; i++) {
            try {
                const field = editTextFields[i]
                const text = await field.getText()
                const hint = await field.getAttribute('content-desc')
                const resourceId = await field.getAttribute('resource-id')
                
                console.log(`  📝 EditText ${i + 1}: Text="${text}", Hint="${hint}", ResourceId="${resourceId}"`)
                
                // Check if this looks like a group name field
                if ((text && text.includes('Group name')) || 
                    (hint && hint.includes('Group name')) ||
                    (resourceId && resourceId.includes('group_name')) ||
                    (text === '' && hint === '' && resourceId === '')) {
                    
                    console.log(`✅ Found potential group name field: "${text || hint || resourceId}"`)
                    await field.click()
                    console.log('✅ Clicked on potential group name field')
                    await field.setValue(name)
                    console.log(`✅ Successfully entered group name: "${name}"`)
                    return
                }
            } catch (e) {
                console.log(`  ❌ Error with EditText ${i + 1}: ${e.message}`)
                continue
            }
        }
        console.log('⚠️ No suitable EditText field found for group name')
    } catch (error) {
        console.log('⚠️ Method 3 failed: Could not scan EditText fields')
        console.log(`   Error: ${error.message}`)
    }
    
    try {
        // Method 4: Try to find by class name and click the first one
        console.log('\n🔍 Method 4: Looking for first available EditText field...')
        const firstEditText = await client.$('android.widget.EditText')
        await firstEditText.waitForExist({ timeout: 3000 })
        console.log('✅ Found first EditText field')
        await firstEditText.click()
        console.log('✅ Clicked on first EditText field')
        await firstEditText.setValue(name)
        console.log(`✅ Successfully entered group name via first EditText: "${name}"`)
        return
    } catch (error) {
        console.log('⚠️ Method 4 failed, trying alternative...')
    }
    
    try {
        // Method 5: Try to find by accessibility ID
        console.log('🔍 Method 5: Looking for group name field by accessibility ID...')
        const groupNameField = await client.$('~Group name')
        await groupNameField.waitForExist({ timeout: 3000 })
        await groupNameField.click()
        await groupNameField.setValue(name)
        console.log(`✅ Entered group name via accessibility ID: "${name}"`)
        return
    } catch (error) {
        console.log('⚠️ Method 5 failed, trying alternative...')
    }
    
    // Method 6: Try to find any input field and click it
    try {
        console.log('🔍 Method 6: Looking for any input field...')
        const allElements = await client.$$('*')
        
        for (let i = 0; i < Math.min(allElements.length, 30); i++) {
            try {
                const element = allElements[i]
                const className = await element.getAttribute('class')
                const text = await element.getText()
                const isClickable = await element.getAttribute('clickable')
                const isEnabled = await element.getAttribute('enabled')
                
                if (className && className.includes('EditText') && isClickable === 'true' && isEnabled === 'true') {
                    console.log(`✅ Found clickable EditText: "${text}"`)
                    await element.click()
                    await element.setValue(name)
                    console.log(`✅ Entered group name: "${name}"`)
                    return
                }
            } catch (e) {
                // Skip elements that can't be read
            }
        }
    } catch (error) {
        console.log('⚠️ Method 6 failed')
    }
    
    console.log('❌ Could not find or enter group name field')
}

const create = async () => {
    console.log('\n✅ Looking for Create/Next button to finalize group creation...')
    console.log('📱 Current screen: Group name input screen (after entering group name)')

    // First, try to find the checkmark button (most common on group creation screen)
    try {
        console.log('\n🔍 Method 1: Looking for checkmark button by accessibility ID "~check"...')
        const checkmarkButton = await client.$('~check')
        await checkmarkButton.waitForExist({ timeout: 3000 })
        console.log('✅ Found checkmark button by accessibility ID')
        await checkmarkButton.click()
        console.log('✅ Successfully clicked checkmark button')
        console.log('🎉 Group creation finalized!')
        return
    } catch (error) {
        console.log('⚠️ Method 1 failed: Checkmark button not found by accessibility ID')
        console.log(`   Error: ${error.message}`)
    }

    // Try different approaches to find the Create/Next button
    console.log('\n🔍 Method 2: Trying various accessibility ID selectors...')
    const createSelectors = [
        '~Create',
        '~Create group',
        '~Next',
        '~Continue',
        '~Done',
        '~OK',
        '~Confirm',
        '~check',
        '~Check',
        '~✓',
        '~✓'
    ]
    
    for (let i = 0; i < createSelectors.length; i++) {
        const selector = createSelectors[i]
        try {
            console.log(`  🔍 Trying selector ${i + 1}/${createSelectors.length}: ${selector}`)
            const button = await client.$(selector)
            await button.waitForExist({ timeout: 3000 })
            console.log(`✅ Found button with selector: ${selector}`)
            await button.click()
            console.log(`✅ Successfully clicked Create button: ${selector}`)
            console.log('🎉 Group creation finalized!')
            return
        } catch (error) {
            console.log(`  ❌ Not found: ${selector}`)
            continue
        }
    }

    // Try to find by resource ID (common for FAB buttons)
    try {
        console.log('\n🔍 Method 3: Looking for FAB button by resource ID "com.whatsapp:id/fab"...')
        const fabButton = await client.$('android=new UiSelector().resourceId("com.whatsapp:id/fab")')
        await fabButton.waitForExist({ timeout: 3000 })
        console.log('✅ Found FAB button by resource ID')
        await fabButton.click()
        console.log('✅ Successfully clicked FAB button')
        console.log('🎉 Group creation finalized!')
        return
    } catch (error) {
        console.log('⚠️ Method 3 failed: FAB button not found by resource ID')
        console.log(`   Error: ${error.message}`)
    }

    // Try to find any clickable button with checkmark-like content
    try {
        console.log('\n🔍 Method 4: Scanning all clickable elements for create/checkmark buttons...')
        const allElements = await client.$$('*')
        console.log(`📊 Found ${allElements.length} total elements on screen`)
        
        let clickableCount = 0
        for (let i = 0; i < Math.min(allElements.length, 20); i++) {
            try {
                const element = allElements[i]
                const isClickable = await element.getAttribute('clickable')
                const isEnabled = await element.getAttribute('enabled')
                const contentDesc = await element.getAttribute('content-desc')
                const text = await element.getText()
                const className = await element.getAttribute('class')
                
                if (isClickable === 'true' && isEnabled === 'true') {
                    clickableCount++
                    console.log(`  🔘 Clickable element ${clickableCount}: Class="${className}", Text="${text}", ContentDesc="${contentDesc}"`)
                    
                    // Look for checkmark, create, or next-like content
                    if (contentDesc && (contentDesc.includes('check') || contentDesc.includes('Create') || contentDesc.includes('Next') || contentDesc.includes('Done'))) {
                        console.log(`✅ Found potential create button: "${contentDesc}"`)
                        await element.click()
                        console.log('✅ Successfully clicked potential create button')
                        console.log('🎉 Group creation finalized!')
                        return
                    }
                    
                    // If it's a FAB or button class and has no text, it might be the create button
                    if ((className && className.includes('FloatingActionButton')) || (className && className.includes('Button'))) {
                        if (!text || text.length === 0) {
                            console.log(`✅ Found potential FAB/Button: Class="${className}"`)
                            await element.click()
                            console.log('✅ Successfully clicked potential FAB/Button')
                            console.log('🎉 Group creation finalized!')
                            return
                        }
                    }
                }
            } catch (e) {
                // Skip elements that can't be read
            }
        }
        console.log(`📊 Scanned ${clickableCount} clickable elements, no suitable create button found`)
    } catch (e) {
        console.log('⚠️ Method 4 failed: Could not scan clickable elements')
        console.log(`   Error: ${e.message}`)
    }
    
    // If no button found, let's see what buttons are available
    console.log('\n📋 Available buttons on screen:')
    try {
        const allButtons = await client.$$('android.widget.Button')
        const allTextViews = await client.$$('android.widget.TextView')
        const allClickables = [...allButtons, ...allTextViews]
        console.log(`📊 Found ${allClickables.length} potential button elements`)
        
        for (let i = 0; i < Math.min(allClickables.length, 10); i++) {
            try {
                const text = await allClickables[i].getText()
                const contentDesc = await allClickables[i].getAttribute('content-desc')
                const resourceId = await allClickables[i].getAttribute('resource-id')
                if (text || contentDesc) {
                    console.log(`  🔘 Button ${i + 1}: Text="${text}", ContentDesc="${contentDesc}", ResourceId="${resourceId}"`)
                }
            } catch (e) {
                // Skip elements that can't be read
            }
        }
    } catch (e) {
        console.log('  ❌ Could not read available buttons')
        console.log(`   Error: ${e.message}`)
    }
    
    console.log('\n❌ Could not find Create button to finalize group creation')
    console.log('💡 Troubleshooting tips:')
    console.log('   - Check if the group name was entered correctly')
    console.log('   - Look for a checkmark (✓) or "Next" button')
    console.log('   - Verify you are on the correct screen')
    console.log('   - Check the available buttons listed above')
    
    throw new Error('Could not find Create button. Please check the available buttons above.')
}

const getMessageInputField = async () => {
    const messageInputSelector = 'new UiSelector().text("Message").className("android.widget.EditText")'
    const messageInputField = await client.$(`android=${messageInputSelector}`)
    await waitForElementToExist(messageInputField)
    return messageInputField
}

const sendMessage = async (value) => {
    const messageInputField = await getMessageInputField()
    await messageInputField.setValue(value)
    await clickOnButtonWithContentDesc('Send')
}

const setNewName = async (value) => {
    const textBox = await client.$('android.widget.EditText')
    await waitForElementToExist(textBox)
    await textBox.setValue(value)
    const okButtonSelector = 'new UiSelector().text("OK").className("android.widget.Button")'
    const okButton = await client.$(`android=${okButtonSelector}`)
    await waitForElementToExist(okButton)
    await okButton.click()

}

const navigateUp = async () => await clickOnButtonWithContentDesc('Navigate up')

const navigateBackToMainScreen = async () => {
    console.log('🔙 Looking for back/navigate buttons to return to main screen...')
    
    // Wait a moment for the group chat screen to load
    await client.pause(3000)
    
    try {
        // Method 1: Try to find back button by accessibility ID
        console.log('🔍 Method 1: Looking for back button by accessibility ID...')
        const backButton = await client.$('~Navigate up')
        await backButton.waitForExist({ timeout: 5000 })
        console.log('✅ Found back button by accessibility ID')
        await backButton.click()
        console.log('✅ Successfully clicked back button')
        return
    } catch (error) {
        console.log('⚠️ Method 1 failed: Back button not found by accessibility ID')
        console.log(`   Error: ${error.message}`)
    }
    
    try {
        // Method 1.5: Try to find back button by different accessibility IDs
        console.log('🔍 Method 1.5: Looking for back button by alternative accessibility IDs...')
        const backSelectors = ['~Back', '~Navigate back', '~Arrow back', '~Up']
        for (const selector of backSelectors) {
            try {
                const backButton = await client.$(selector)
                await backButton.waitForExist({ timeout: 2000 })
                console.log(`✅ Found back button with selector: ${selector}`)
                await backButton.click()
                console.log('✅ Successfully clicked back button')
                return
            } catch (e) {
                console.log(`  ❌ Not found: ${selector}`)
            }
        }
    } catch (error) {
        console.log('⚠️ Method 1.5 failed: No alternative back buttons found')
    }
    
    try {
        // Method 2: Try to find back button by resource ID (more reliable)
        console.log('🔍 Method 2: Looking for back button by resource ID...')
        const resourceSelectors = [
            'android=new UiSelector().resourceId("com.whatsapp.w4b:id/back")',
            'android=new UiSelector().resourceId("com.whatsapp.w4b:id/back_button")',
            'android=new UiSelector().resourceId("com.whatsapp.w4b:id/navigate_up")',
            'android=new UiSelector().resourceId("com.whatsapp.w4b:id/arrow_back")',
            'android=new UiSelector().resourceId("android:id/up")'
        ]
        
        for (const selector of resourceSelectors) {
            try {
                const backButton = await client.$(selector)
                await backButton.waitForExist({ timeout: 2000 })
                console.log(`✅ Found back button with resource ID: ${selector}`)
                await backButton.click()
                console.log('✅ Successfully clicked back button')
                return
            } catch (e) {
                console.log(`  ❌ Not found: ${selector}`)
            }
        }
    } catch (error) {
        console.log('⚠️ Method 2 failed: Back button not found by resource ID')
        console.log(`   Error: ${error.message}`)
    }
    
    try {
        // Method 2.5: Try to find back button by text content
        console.log('🔍 Method 2.5: Looking for back button by text content...')
        const backButton = await client.$('android=new UiSelector().text("Back")')
        await backButton.waitForExist({ timeout: 3000 })
        console.log('✅ Found back button by text content')
        await backButton.click()
        console.log('✅ Successfully clicked back button')
        return
    } catch (error) {
        console.log('⚠️ Method 2.5 failed: Back button not found by text content')
        console.log(`   Error: ${error.message}`)
    }
    
    try {
        // Method 3: Try to find arrow back button
        console.log('🔍 Method 3: Looking for arrow back button...')
        const arrowBackButton = await client.$('~Navigate up')
        await arrowBackButton.waitForExist({ timeout: 3000 })
        console.log('✅ Found arrow back button')
        await arrowBackButton.click()
        console.log('✅ Successfully clicked arrow back button')
        return
    } catch (error) {
        console.log('⚠️ Method 3 failed: Arrow back button not found')
        console.log(`   Error: ${error.message}`)
    }
    
    try {
        // Method 4: Try to find any clickable element that might be a back button
        console.log('🔍 Method 4: Scanning for any potential back/navigate buttons...')
        const allElements = await client.$$('*')
        console.log(`📊 Found ${allElements.length} total elements on screen`)
        
        let clickableCount = 0
        for (let i = 0; i < Math.min(allElements.length, 30); i++) {
            try {
                const element = allElements[i]
                const isClickable = await element.getAttribute('clickable')
                const isEnabled = await element.getAttribute('enabled')
                const contentDesc = await element.getAttribute('content-desc')
                const text = await element.getText()
                const className = await element.getAttribute('class')
                
                if (isClickable === 'true' && isEnabled === 'true') {
                    clickableCount++
                    console.log(`  🔘 Clickable element ${clickableCount}: Class="${className}", Text="${text}", ContentDesc="${contentDesc}"`)
                    
                    // Look for back, navigate, or arrow-like content
                    if (contentDesc && (contentDesc.includes('Back') || contentDesc.includes('Navigate') || contentDesc.includes('arrow') || contentDesc.includes('up'))) {
                        console.log(`✅ Found potential back button: "${contentDesc}"`)
                        await element.click()
                        console.log('✅ Successfully clicked potential back button')
                        return
                    }
                    
                    // If it's an ImageView or ImageButton, it might be a back arrow
                    if ((className && className.includes('ImageView')) || (className && className.includes('ImageButton'))) {
                        if (!text || text.length === 0) {
                            console.log(`✅ Found potential image back button: Class="${className}"`)
                            await element.click()
                            console.log('✅ Successfully clicked potential image back button')
                            return
                        }
                    }
                }
            } catch (e) {
                // Skip elements that can't be read
            }
        }
        console.log(`📊 Scanned ${clickableCount} clickable elements, no suitable back button found`)
    } catch (error) {
        console.log('⚠️ Method 4 failed: Could not scan for back buttons')
        console.log(`   Error: ${error.message}`)
    }
    
    // Method 5: Try to use Android back button multiple times
    try {
        console.log('🔍 Method 5: Using Android back button multiple times...')
        await client.back()
        console.log('✅ Successfully used Android back button (1st time)')
        await client.pause(1000)
        
        // Try a second time if needed
        try {
            await client.back()
            console.log('✅ Successfully used Android back button (2nd time)')
        } catch (secondBackError) {
            console.log('✅ First back button press was sufficient')
        }
        return
    } catch (error) {
        console.log('⚠️ Method 5 failed: Android back button not available')
        console.log(`   Error: ${error.message}`)
    }
    
    console.log('\n❌ Could not find any back/navigate button')
    console.log('💡 The automation will continue, but you may need to manually navigate back')
    console.log('   - Look for a back arrow (←) or "Back" button')
    console.log('   - Or use your device\'s back button')
}

const renameGroup = async (name) => {
    await selectMoreOptionsButtonWithText('Group info')
    await selectMoreOptionsButtonWithText('Change group name')
    await setNewName(name)
    await navigateUp()
}


const closeGroup = async () => await navigateUp()

const checkIfGroupExists = async (groupName) => {
    console.log(`🔍 Checking if group "${groupName}" already exists...`)
    
    try {
        // Search for the group name
        console.log('  📝 Searching for existing group...')
        await searchGroup(groupName)
        await client.pause(2000)
        
        // Try to find the group in search results
        try {
            const groupElement = await client.$(`android=new UiSelector().text("${groupName}")`)
            await groupElement.waitForExist({ timeout: 3000 })
            
            console.log(`  ⚠️ Group "${groupName}" already exists!`)
            
            // Clear search and return to main screen
            console.log('  🧹 Clearing search and returning to main screen...')
            await clearSearchAndLog('')
            await client.pause(1000)
            
            return true
        } catch (notFoundError) {
            console.log(`  ✅ Group "${groupName}" does not exist, safe to create`)
            
            // Clear search and return to main screen
            console.log('  🧹 Clearing search and returning to main screen...')
            await clearSearchAndLog('')
            await client.pause(1000)
            
            return false
        }
        
    } catch (error) {
        console.log(`  ⚠️ Error checking group existence: ${error.message}`)
        console.log('  💡 Assuming group does not exist and proceeding with creation')
        return false
    }
}

const createNewGroup = async (contacts, name) => {
    console.log(`\n🆕 Starting group creation for "${name}"`)
    console.log(`👥 Adding ${contacts.length} contact(s): ${contacts.join(', ')}`)
    
    try {
        // Skip group existence check and go directly to creation
        console.log('\n🆕 Proceeding directly to group creation...')
        
        console.log('\n📋 Step 1: Opening New Group View...')
        console.log('🔍 Step 1a: Clicking three dots menu...')
        await openMoreOptions()
        console.log('✅ Three dots menu clicked successfully')
        
        console.log('🔍 Step 1b: Selecting "New group" from menu...')
        await clickOnMoreOptionsButtonWithText('New group')
        console.log('✅ "New group" selected successfully')
        
        console.log('✅ New Group View opened successfully')
        
        console.log('\n🔍 Step 2: Clicking search icon...')
        await clickOnSearch()
        console.log('✅ Search icon clicked successfully')
        
        console.log('\n👤 Step 3: Adding contacts...')
        for(let i = 0; i < contacts.length; i++) {
            const number = contacts[i]
            console.log(`  📱 Adding contact ${i + 1}/${contacts.length}: ${number}`)
            await addContact(number, 'create')
            console.log(`  ✅ Contact ${number} added successfully`)
        }
        
        console.log('\n➡️ Step 4: Clicking arrow button to proceed to group name screen...')
        await clickArrowButton()
        console.log('✅ Arrow button clicked, proceeding to group name screen')
        
        console.log('\n📝 Step 5: Entering group name...')
        await enterGroupName(name)
        console.log(`✅ Group name "${name}" entered successfully`)
        
        // Wait a moment for the group name to be entered
        console.log('\n⏳ Waiting for group name to be processed...')
        await client.pause(2000)
        
        console.log('\n✅ Step 6: Finalizing group creation...')
        await create()
        console.log('✅ Create button clicked successfully')
        
        // Group creation is complete! No need to rename since we already set the name
        console.log('\n🎉 Group creation completed successfully!')
        console.log(`✅ Group "${name}" has been created with ${contacts.length} contacts`)
        
        // Step 7: Navigate back to main chat screen
        console.log('\n🔙 Step 7: Navigating back to main chat screen...')
        await navigateBackToMainScreen()
        console.log('✅ Successfully navigated back to main chat screen')
        
        console.log('📊 Group creation process finished')
        
    } catch (error) {
        console.log(`❌ Error during group creation for "${name}": ${error.message}`)
        
        // Check if it's a UiAutomator2 crash
        if (error.message.includes('instrumentation process is not running') || 
            error.message.includes('cannot be proxied to UiAutomator2 server')) {
            console.log('⚠️ UiAutomator2 server crashed, this will be handled by the main loop')
        }
        
        throw error // Re-throw to be handled by the main loop
    }
}

const clearSearchAndLog = async (value) => {
    await clickOnButtonWithContentDesc('Clear')
    await clickOnButtonWithContentDisc('Back')
    const date = new Date()
    fs.appendFile('logs.txt', `can not find group ${currentGroupId} with name ${currentGroupName}, on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}\n`, () => {})
    return false
}

const selectGroupIfItExists = async (name) => {
    const recyclerView = await client.$('androidx.recyclerview.widget.RecyclerView')
    try {
        await waitForElementToExist(recyclerView)
        const firstContact = recyclerView.$('android.widget.RelativeLayout')
        await waitForElementToExist(firstContact)
        await firstContact.click()
        return true

    } catch (e) {
        return await clearSearchAndLog(name)
    }
}

const searchGroup = async (name) => {
    await clickOnSearch()
    const textField = await getTextField(false)
    await textField.setValue(name)
    // delay for group search - optimization
    await client.pause(2000)
}

const searchAndOpenGroup = async (name) => {
    await searchGroup(name)
    return await selectGroupIfItExists(name)
}

const getElementByResourceId = async (resourceId, timeout) => {
    const selector = `new UiSelector().resourceId("${resourceId}")`
    const element = await client.$(`android=${selector}`)
    await waitForElementToExist(element, timeout)
    return element
}

const getElementsByResourceId = async (resourceId) => {
    const selector = `new UiSelector().resourceId("${resourceId}")`
    const elements = await client.$$(`android=${selector}`)
    return elements
}

const clickOnEditRecipients = async () => {
    const button = await getElementByResourceId('com.whatsapp:id/add_participant_button')
    await button.click()
}

const clickDone = async () => await clickOnButtonWithContentDesc('Done')

const modifyParticipantsToExistingGroup = async (contacts, name, operation) => {
    if(await searchAndOpenGroup(name)){
        await selectMoreOptionsButtonWithText('Group info')
        await clickOnEditRecipients()
        await clickOnSearch()
        for(number of contacts) {
            await addContact(number, operation)
        }
        await clickDone()
        await navigateUp()
        await navigateUp()
    }
}

const getNumberOfParticipants = async () => {
    const participantsElement = await getElementByResourceId('com.whatsapp:id/participants_title')
    waitForElementToExist(participantsElement)
    const participantsInfo = await participantsElement.getText()
    return Number(participantsInfo.split(' ')[0])
}

const swipeDown = async (xAnchorPercent, startYAnchorPercent, endYAnchorPercent) => {
    const { height, width } = await client.getWindowSize()
    const anchor = width * xAnchorPercent / 100
    const startPoint = height * startYAnchorPercent / 100
    const endPoint = height * endYAnchorPercent / 100
    await client.touchPerform([
        {
            action: 'press',
            options: {
                x: anchor,
                y: startPoint
            }
        },
        {
            action: 'wait',
            options: {
                ms: '1000'
            }
        },
        {
            action: 'moveTo',
            options: {
                x: anchor,
                y: endPoint
            }
        },
        {
            action: 'release',
            options: {}
        }
    ])
}

const getPhoneNumber = async () => {
    const phoneNumberElement = await getElementByResourceId('com.whatsapp:id/contact_subtitle', 2000)
    return phoneNumberElement.getText()
}

const getParticipantNumber = async (participant) => {
    await participant.click()
    const list = await getElementByResourceId('android:id/select_dialog_listview', 2000)
    const listItems = await list.$$('android.widget.LinearLayout')
    const viewElement = listItems[1]
    await viewElement.click()
    let phoneNumber
    try {
        phoneNumber = await getPhoneNumber()
    } catch(_) {
        await swipeDown(50, 95, 40)
        const phoneNumberElement = await getElementByResourceId('com.whatsapp:id/title_tv')
        phoneNumber = phoneNumberElement.getText()
    }
    return phoneNumber
}

const scrollAndGetContacts = async (conditionCb, operationCb, resourceId, swipeCb) => {
    while(conditionCb()) {
        const visibleContacts = await getElementsByResourceId(resourceId)
        for(let contact of visibleContacts) {
            try {
                await waitForElementToExist(contact, 3000)
                await operationCb(contact)
            } catch (_) {
                continue
            }
        }
        await swipeCb()
    }
}

const getParticipantName = async (participant) => {
    return participant.getText()
}

const exportSetIntoFile = (set, fileName) => {
    const it = set.values()
    let done = false
    let vals = ''
    while(!done) {
        const val = it.next()
        if(!val.done)
        vals+=val.value+'\n'
        done = val.done
    }
    fs.writeFile(`${fileName}.txt`, vals, () => {})
}

const logContact = (contact, fileName) => {
    fs.appendFile(`${fileName}.txt`, contact)
}

const readGroup = async (name, readNumber) => {
    if(await searchAndOpenGroup(name)) {
        await selectMoreOptionsButtonWithText('Group info')
        const participantsCount = await getNumberOfParticipants()
        const contacts = new Set()
        let lastContactSize = -1
        const conditionCb = () => {
            if(lastContactSize === contacts.size) return false
            lastContactSize = contacts.size
            return true
        }
        const fileName = name+`-${participantsCount}`
        const operationCb = readNumber ? async (val) => {
            const num = await getParticipantNumber(val)
            await navigateUp()
            contacts.add(num)
            logContact(num, fileName)
        } : async (val) => {
            const name = await getParticipantName(val)
            contacts.add(name)
            logContact(num, fileName)
        }
        const swipeCb = async () => {
            await swipeDown(50, 95, 40)
        }
        await scrollAndGetContacts(conditionCb, operationCb, readNumber ? 'com.whatsapp:id/group_chat_info_layout' : 'com.whatsapp:id/name', swipeCb)
        await navigateUp()
        await navigateUp()
        exportSetIntoFile(contacts, name+`-${participantsCount}`)
    }
}

const readContacts = async () => {
    const contacts = new Set()
    let lastContactsSize = -1
    const conditionCb = () => {
        if(lastContactsSize === contacts.size) return false
        lastContactsSize = contacts.size
        return true
    }
    const operationCb = async (val) => {
        const name = await getParticipantName(val)
        contacts.add(name)
        fs.appendFileSync('total-contacts-names-live.txt', name+'\n')
    }
    const swipeCb = async () => {
        await swipeDown(50, 95, 40)
    }
    await scrollAndGetContacts(conditionCb, operationCb, 'com.whatsapp:id/conversations_row_contact_name', swipeCb)
    exportSetIntoFile(contacts, 'total-contacts-names')
}

const readSearchedContacts = async (keyword) => {
    const contacts = new Set()
    let lastContactsSize = -1
    const conditionCb = () => {
        if(lastContactsSize === contacts.size) return false
        lastContactsSize = contacts.size
        return true
    }

    const operationCb = async (contact) => {
        await contact.click()
        try {
            await selectMoreOptionsButtonWithText('View contact')
        } catch(e) {
            const { height, width } = await client.getWindowSize()
            await client.touchPerform([
                {
                    action: 'press',
                    options: {
                        x: width/4,
                        y: height/2
                    }
                },
                {
                    action: 'release',
                    options: {}
                }
            ])
            await navigateUp()
            return
        }
        try{
            const phoneNumber = await getPhoneNumber()
            contacts.add(phoneNumber)
        }catch(e) {}
        await navigateUp()
        await navigateUp()
        await waitForElementToExist(await getElementByResourceId('com.whatsapp:id/result_list'))
    }
    const swipeCb = async () => {
        await swipeDown(50, 95, 30)
    }
    await scrollAndGetContacts(conditionCb, operationCb, 'com.whatsapp:id/search_message_container_header', swipeCb)
    exportSetIntoFile(contacts, keyword)
}

const readContactsByKeyWord = async (keyword) => {
    await searchGroup(keyword)
    await client.hideKeyboard()
    await readSearchedContacts(keyword)
}

const main = async () => {
    console.log('🚀 Starting WhatsApp Group Automation...')
    console.log('📱 Connecting to Android device via Appium...')
    
    try {
        client = await wdio.remote(opts)
        console.log('✅ Successfully connected to Android device')
    } catch (error) {
        console.error('❌ Failed to connect to Android device:', error.message)
        console.log('💡 Make sure Appium server is running and device is connected')
        process.exit(1)
    }
    
    // Load groups from CSV file
    console.log('📊 Loading groups from CSV file...')
    let groups;
    try {
        groups = await readGroupsFromCSV('./groups.csv')
        
        // Validate the loaded groups
        const validationErrors = validateGroups(groups)
        if (validationErrors.length > 0) {
            console.error('❌ CSV validation errors:')
            validationErrors.forEach(error => console.error(`   ${error}`))
            process.exit(1)
        }
        
        console.log(`✅ Successfully loaded and validated ${groups.length} groups`)
    } catch (error) {
        console.error('❌ Failed to load groups from CSV:', error.message)
        process.exit(1)
    }
    
    console.log('📱 WhatsApp Group Automation Started')
    console.log('=====================================')
    console.log('')
    console.log('⚠️  IMPORTANT: Please make sure WhatsApp is open on your device!')
    console.log('   1. Open WhatsApp manually on your vivo Y73')
    console.log('   2. Make sure you are on the main chat list screen')
    console.log('   3. The automation will then take control')
    console.log('')
    console.log('⏳ Waiting 10 seconds for you to open WhatsApp...')
    
    // Wait for user to open WhatsApp manually
    await client.pause(10000)
    
    console.log('🚀 Starting automation...')
    console.log(`📋 Processing ${groups.length} group(s)...`)
    
    for(let i = 0; i < groups.length; i++) {
        const group = groups[i]
        console.log(`\n${'='.repeat(60)}`)
        console.log(`🎯 Processing Group ${i + 1}/${groups.length}: ${group.name}`)
        console.log(`📝 Operation: ${group.operation}`)
        console.log(`👥 Contacts: ${group.contacts.join(', ')}`)
        console.log(`🆔 Group ID: ${group.id}`)
        console.log(`${'='.repeat(60)}`)
        
        let { contacts, name, operation = '', id, keyword } = group
        currentGroupId = id
        currentGroupName = name
        contacts = [... new Set(contacts)]
        logString = ''
        currentOperation = ''
        let readNumber;
        
        // Check connection status before processing each group (except the first one)
        if (i > 0) {
            console.log('🔍 Checking connection status before processing next group...')
            try {
                await client.getPageSource()
                console.log('✅ Connection is stable, continuing...')
            } catch (connectionError) {
                console.log('⚠️ Connection lost, attempting to reconnect...')
                try {
                    await client.deleteSession()
                    console.log('🔄 Reconnecting to device...')
                    client = await wdio.remote(opts)
                    console.log('✅ Successfully reconnected')
                    
                    // Wait for WhatsApp to be ready
                    console.log('⏳ Waiting for WhatsApp to be ready...')
                    await client.pause(5000)
                } catch (reconnectError) {
                    console.log(`❌ Failed to reconnect: ${reconnectError.message}`)
                    console.log('🔄 Continuing to next group...')
                    continue
                }
            }
        }
        
        try {
            switch(operation) {
                case 'add':
                    currentOperation = '2'
                    console.log('➕ Starting add contacts process...')
                case 'remove': {
                    if(!currentOperation) {
                        currentOperation = '3'
                        console.log('➖ Starting remove contacts process...')
                    }
                    await modifyParticipantsToExistingGroup(contacts, name, operation)
                    break
                }
                case 'create': {
                    currentOperation = '1'
                    console.log('🆕 Starting group creation process...')
                    await createNewGroup(contacts, name)
                    break
                }
                case 'read-number':
                    readNumber = true
                    currentOperation = '4'
                    console.log('📞 Starting read phone numbers process...')
                case 'read-name':
                    if(!currentOperation) {
                        currentOperation = '5'
                        console.log('👤 Starting read contact names process...')
                    }
                    readNumber = !!readNumber
                    await readGroup(name, readNumber)
                    break
                case 'read-contacts': {
                    currentOperation = '6'
                    console.log('📱 Starting read all contacts process...')
                    await readContacts()
                    break
                }
                case 'read-by-keyword': {
                    console.log('🔍 Starting search contacts by keyword process...')
                    await readContactsByKeyWord(keyword)
                    break
                }
                default:
                    console.log(`❌ Unknown operation: ${operation}`)
            }
            console.log(`✅ Operation '${operation}' for group '${name}' completed successfully.`)
            
            // Add a small delay between groups to ensure stability
            if (i < groups.length - 1) {
                console.log('⏳ Waiting 3 seconds before processing next group...')
                await client.pause(3000)
            }
            
        } catch (error) {
            console.error(`❌ Error during operation '${operation}' for group '${name}':`, error.message)
            console.log('🔄 Continuing to next group...')
        }
        
        // await sendMessage(message)
        if(logString) {
            fs.appendFile('logs.csv', logString, () => {})
            console.log('📊 Log data saved to logs.csv')
        }
    }
    
    console.log('\n🎉 All operations completed!')
    console.log('🔚 Closing session...')
    await client.deleteSession()
    console.log('✅ Session closed successfully')
}

main()