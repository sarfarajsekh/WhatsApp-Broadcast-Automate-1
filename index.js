const fs = require('fs')
const wdio = require('webdriverio')
const { groups } = require('./src/groups')
const { message } = require('./message')

const opts = {
    path: '/wd/hub',
    port: 4723,
    capabilities: {
        platformName: 'Android',
        'appium:platformVersion': '13.1',
        'appium:udid': '8edf3315',
        'appium:automationName': 'UiAutomator2',
        'appium:useNewWDA': false,
        'appium:usePrebuiltWDA': true,
        'appium:noReset': true,
        'appium:fullReset': false,
    },
}

// const opts = {
//     path: '/wd/hub',
//     port: 4723,
//     capabilities: {
//         platformName: 'Android',
//         platformVersion: '11',
//         deviceName: 'realme5',
//         udid: '5d052763',
//         automationName: 'UiAutomator2',
//         ignoreHiddenApiPolicyError: true,
//         // keep screen on while charging.
//     },
// }


let client
let logString = ''
let currentGroupId
let currentGroupName
let currentNumber
let currentOperation

fs.appendFile('logs.csv', 'GroupId,GroupName,Operation,Contact Number,Success(1)/Failure(0),date,time\n', () => {})

const waitForElementToExist = async (element, timeout = 55000) => {
// delay for list load first time - optimization
// changed origin - 35000
    await element.waitForExist({ timeout })
}

const openMoreOptions = async () => await clickOnButtonWithContentDesc('More options')

const getMoreOptionButtonWithText = async (value) => {
    const selector = `new UiSelector().text("${value}").className("android.widget.TextView")`
    const button = await client.$(`android=${selector}`)
    await waitForElementToExist(button)
    return button
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
    const {x, y} = await client.$(`~${value}`).getLocation();
    await client.touchPerform([{
        action: 'tap',
        options: {x: x+10, y: y+10}
    }])
}

const openNewBroadcastView = async () => await selectMoreOptionsButtonWithText('New broadcast')

const clickOnSearch = async () => await clickOnButtonWithContentDesc('Search')

const getTextField = async (isAutoComplete) => {
    const textSelector = `new UiSelector().text("Search…").className(android.widget.${isAutoComplete ? "AutoCompleteTextView" : "EditText"})`
    const textField = await client.$(`android=${textSelector}`)
    await waitForElementToExist(textField)
    return textField
}

const clearTextField = async () => {
    await clickOnButtonWithContentDesc('Clear query')
    // fs.appendFile('logs.txt', message + '\n', () => {})
}

const addInLogString = (success) => {
    const date = new Date()
    logString += `${currentGroupId},${currentGroupName},${currentOperation},${currentNumber},${success},${date.toLocaleDateString()},${date.toLocaleTimeString()}\n`
}

const selectFirstContactIfItExists = async (operation) => {
    const listView = await client.$('android.widget.ListView')
    try {
        await waitForElementToExist(listView, 6000)
        const firstContact = await listView.$('android.widget.RelativeLayout')
        if(['add', 'remove'].includes(operation)) {
            const selected = await firstContact.$('~Selected')
            if((!selected.error && operation === 'add') || (selected.error && operation === 'remove')) {
                addInLogString('1')
                await clearTextField()
                return
            }
        }
        await firstContact.click()
        addInLogString('1')
        if(operation === 'remove') {
            await clearTextField()
        }
    } catch(e) {
        addInLogString('0')
        await clearTextField()
    }
}


const sendValueToTextField = async (value) => {
    const textField = await getTextField(false)
    await textField.setValue(value)
}

const addContact = async (value, operation) => {
    currentNumber = value
    await sendValueToTextField(value)
// delay for contact to appear - per contact - optimization
    await client.pause(10000)
    await selectFirstContactIfItExists(operation)
}

const clickOnButtonWithContentDisc = async (value) => {
    const button = await client.$(`~${value}`)
    await waitForElementToExist(button)
    await button.click()
}

const create = async () => await clickOnButtonWithContentDisc('Create')

const setNewName = async (value) => {
    const textBox = await client.$('android.widget.EditText')
    await waitForElementToExist(textBox)
    console.log('value', value)
    await textBox.setValue(value)
    const okButtonSelector = 'new UiSelector().text("OK").className("android.widget.Button")'
    const okButton = await client.$(`android=${okButtonSelector}`)
    await waitForElementToExist(okButton)
    await okButton.click()

}

const navigateUp = async () => {
    await clickOnButtonWithContentDesc('Navigate up')
    await client.pause(1000)
}

const renameGroup = async (name) => {
    await selectMoreOptionsButtonWithText('Broadcast list info')
    await selectMoreOptionsButtonWithText('Change broadcast list name')
    await setNewName(name)
    await client.pause(2000)
    await navigateUp()
}


const closeGroup = async () => await navigateUp()

const createNewBroadCastGroup = async (contacts, name) => {
    await openNewBroadcastView()
    await clickOnSearch()
    for(number of contacts) {
        await addContact(number, 'create')
    }
    await create()
    await renameGroup(name)
    await closeGroup()
}

const clearSearchAndLog = async (value) => {
    await clickOnButtonWithContentDesc('Clear')
    await clickOnButtonWithContentDisc('Back')
    const date = new Date()
    fs.appendFile(
        'logs.txt',
        `can not find group ${currentGroupId} with name ${currentGroupName} for operation ${currentOperation}, on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}\n`,
        () => {}
    )
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

    //changed - orginal 25000
    await client.pause(5000)
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
        // await selectMoreOptionsButtonWithText('Broadcast list info')
        const header = await getElementByResourceId('com.whatsapp:id/conversation_contact_name')
        await  header.click()
        await clickOnEditRecipients()
        // await clickOnSearch()
        const searchButton = await getElementByResourceId('com.whatsapp:id/menuitem_search')
        await searchButton.click()
        // fs.appendFileSync('log.txt', JSON.stringify(searchButton));
        // await searchButton.click()
        // fs.appendFileSync('log.txt', 'clicked')
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

const longPress = async (xAnchorPercent, yAnchorPercent) => {
    const { height, width } = await client.getWindowSize()
    const xAnchor = width * xAnchorPercent / 100
    const yAnchor = height * yAnchorPercent / 100
    await client.touchPerform([
        {
            action: 'press',
            options: {
                x: xAnchor,
                y: yAnchor
            }
        },
        {
            action: 'wait',
            options: {
                ms: '2000'
            }
        },
        {
            action: 'release',
            options: {}
        }
    ])
}

const press = async (xAnchorPercent, yAnchorPercent) => {
    const { height, width } = await client.getWindowSize()
    const xAnchor = width * xAnchorPercent / 100
    const yAnchor = height * yAnchorPercent / 100
    await client.touchPerform([
        {
            action: 'press',
            options: {
                x: xAnchor,
                y: yAnchor
            }
        },
        {
            action: 'release',
            options: {}
        }
    ])
}

const swipeDown = async (xAnchorPercent, startYAnchorPercent, endYAnchorPercent) => {
    const { height, width } = await client.getWindowSize()
    const anchor = width * xAnchorPercent / 100
    const startPoint = height * startYAnchorPercent / 100
    const endPoint = height * endYAnchorPercent / 100
    await client.performActions([
        {
            type: 'pointer',
            id: 'finger',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, x: anchor, y: startPoint },
                { type: 'pointerDown', button: 0 },
                { type: 'pause', duration: 100 },
                { type: 'pointerMove', duration: 3, x: anchor, y: endPoint },
                { type: 'pointerUp', button: 0 }
            ]
        }
    ])
}

const getPhoneNumber = async () => {
    const phoneNumberElement = await getElementByResourceId('com.whatsapp:id/contact_subtitle', 2000)
    return phoneNumberElement.getText()
}

const scrossAndGetElement = async (resourceId) => {
    while(true) {
        await swipeDown(50, 95, 40)
        try {
            const resource = await getElementByResourceId(resourceId, 2000)
            return resource.getText()
        } catch (e) {
            continue;
        }
    }
}

const getParticipantNumber = async (participant) => {
    try {
        await participant.click()
        const list = await getElementByResourceId('android:id/select_dialog_listview', 2000)
        const listItems = await list.$$('android.widget.LinearLayout')
        const viewElement = listItems[1]
        await viewElement.click()
        let phoneNumber
        try {
            phoneNumber = await getPhoneNumber()
            return phoneNumber;
        } catch(_) {
            return scrossAndGetElement('com.whatsapp:id/title_tv')
        }
    } catch(e) {
        throw new Error('cannot click');
    }
}

const scrollAndGetContacts = async (conditionCb, operationCb, resourceId, swipeCb) => {
    while(conditionCb()) {
        const visibleContacts = await getElementsByResourceId(resourceId)
        for await (let contact of visibleContacts) {
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
    fs.writeFileSync(`${fileName}.txt`, vals, () => {})
}

const logContact = (contact, fileName) => {
    fs.appendFileSync(`${fileName}.txt`, contact + '\n')
}


const readBroadCastGroup = async (name, readNumber) => {
    if(await searchAndOpenGroup(name)) {
        // await selectMoreOptionsButtonWithText('Broadcast list info')
        const header = await getElementByResourceId('com.whatsapp:id/conversation_contact_name')
        await  header.click()
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
            fs.appendFileSync(`${keyword}-live.txt`, phoneNumber+'\n')
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

const getContactNumber = async (contact) => {
    await contact.click()
    const contactNameOrNumber = await getElementByResourceId('com.whatsapp:id/conversation_contact_name', 2000)
    const nameOrNumber = await contactNameOrNumber.getText();
    if(phone(nameOrNumber).isValid) {
        return { number: nameOrNumber, navUp: false }
    }
    const contactHeader = await getElementByResourceId('com.whatsapp:id/conversation_contact', 2000)
    await contactHeader.click()
    try {
        const numberElement = await getElementByResourceId('com.whatsapp:id/contact_subtitle', 2000)
        const num = await numberElement.getText()
        return { number: num, navUp: true }
    } catch (e) {
        try {
            await getElementByResourceId('com.whatsapp:id/business_verification_status_text', 2000)
            const num = await scrossAndGetElement('com.whatsapp:id/title_tv')
            return { number: num, navUp: true }
        } catch (err) {
            return null
        }
    }
}

const readContactsNumber = async () => {
    const contacts = new Set()
    let lastContactsSize = -1
    const conditionCb = () => {
        if(lastContactsSize === contacts.size) return false
        lastContactsSize = contacts.size
        return true
    }
    const operationCb = async (val) => {
        const res = await getContactNumber(val)
        let navUp = true;
        console.log('res', res)
        if (res) {
            if(res.number) {
                contacts.add(res.number)
                fs.appendFileSync('total-contacts-number-live.txt', res.number+'\n')
            }
            navUp = res.navUp
        }
        if(navUp) {
            await navigateUp();
        }
        await navigateUp();
    }
    const swipeCb = async () => {
        await swipeDown(50, 95, 40)
    }
    await scrollAndGetContacts(conditionCb, operationCb, 'com.whatsapp:id/contact_row_container', swipeCb)
    exportSetIntoFile(contacts, 'total-contacts-number')
}

const selectContactIfItExists = async (contact) => {
    const listView = await client.$('android.widget.ListView')
    try {
        await waitForElementToExist(listView, 6000)
        const firstContact = await listView.$('android.widget.RelativeLayout')
        await firstContact.click()
    } catch(e) {
        for (let i=0; i<contact.length; i++) {
            await client.pressKeyCode(67)
        }
    }
}

const selectContact = async (value) => {
    const textField = await getElementByResourceId('com.whatsapp:id/search_src_text')
    await textField.setValue(value)
// delay for contact to appear - per contact - optimization
    await client.pause(2000)
    await selectContactIfItExists(value)
}

const sendMessage = async (from, to, lastTwo) => {
    await searchAndOpenGroup(from);
    await longPress(70, 70)
    if(lastTwo) {
        await press(70, 40)
    }
    await press(95, 10)
    await press(95, 10)
    for await(let contact of to) {
        await selectContact(contact)
    }
    const sendButton = await getElementByResourceId('com.whatsapp:id/send')
    await sendButton.click()
    await navigateUp()
}

const main = async () => {
    client = await wdio.remote(opts)
    console.log('client started')
    for(group of groups) {
        let { contacts, name, operation = '', id, keyword, from, to, lastTwo = false } = group
        currentGroupId = id
        currentGroupName = name
        contacts = [... new Set(contacts)]
        logString = ''
        currentOperation = ''
        let readNumber;
        switch(operation) {
            case 'add':
                currentOperation = '2'
            case 'remove': {
                if(!currentOperation) currentOperation = '3'
                await modifyParticipantsToExistingGroup(contacts, name, operation)
                break
            }
            case 'create': {
                currentOperation = '1'
                await createNewBroadCastGroup(contacts, name)
                break
            }
            case 'read-number':
                readNumber = true
                currentOperation = '4'
            case 'read-name':
                if(!currentOperation) currentOperation = '5'
                readNumber = !!readNumber
                await readBroadCastGroup(name, readNumber)
                break
            case 'read-contacts': {
                currentOperation = '6'
                await readContacts()
                break
            }
            case 'read-contacts-number': {
                currentOperation = '7'
                await readContactsNumber()
                break
            }
            case 'read-by-keyword': {
                await readContactsByKeyWord(keyword)
                break
            }
            // case 'send-message': {
            //     currentOperation = '8'
            //     await sendMessage(from, to, lastTwo)
            //     break
            // }
        }
        if(logString) {
            fs.appendFile('logs.csv', logString, () => {})
        }
    }
    await client.deleteSession()
}

main()
