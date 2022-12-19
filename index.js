const fs = require('fs')
const wdio = require('webdriverio')
const { groups } = require('./groups')
const { message } = require('./message')

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
//     },
// }

// const opts = {
//     path: '/wd/hub',
//     port: 4723,
//     capabilities: {
//         platformName: 'Android',
//         platformVersion: '10',
//         deviceName: 'OnePlus 5T',
//         udid: '2b0b4a8e',
//         automationName: 'UiAutomator2',
//         ignoreHiddenApiPolicyError: true,
//     },
// }

const opts = {
    path: '/wd/hub',
    port: 4723,
    capabilities: {
        platformName: 'Android',
        platformVersion: '10',
        deviceName: 'Redmi 9i',
        udid: 'RKFYGMSOZTDIBIUW',
        automationName: 'UiAutomator2',
        ignoreHiddenApiPolicyError: true,
    },
}

let client
let logString = ''
let currentGroupId
let currentGroupName
let currentNumber
let currentOperation

fs.appendFile('logs.csv', 'GroupId,GroupName,Operation,Contact Number,Success(1)/Failure(0),date,time\n', () => {})

const waitForElementToExist = async (element, timeout = 35000) => {
// delay for list load first time - optimization
    await element.waitForExist({ timeout })
}

const openMoreOptions = async () => {
    const moreOptions = await client.$('~More options')
    await moreOptions.click()
}

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
    const button = await client.$(`~${value}`)
    await waitForElementToExist(button)
    await button.click()
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
        await waitForElementToExist(listView)
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

const renameGroup = async (name) => {
    await selectMoreOptionsButtonWithText('Broadcast list info')
    await selectMoreOptionsButtonWithText('Change broadcast list name')
    await setNewName(name)
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
    fs.appendFile('logs.txt', `can not find group ${currentGroupId} with name ${currentGroupName} for operation ${currentOperation}, on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}\n`, () => {})
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
    await client.pause(25000)
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
        await selectMoreOptionsButtonWithText('Broadcast list info')
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
    fs.appendFile(`${fileName}.txt`, vals, () => {})
}
const readBroadCastGroup = async (name, readNumber) => {
    if(await searchAndOpenGroup(name)) {
        await selectMoreOptionsButtonWithText('Broadcast list info')
        const participantsCount = await getNumberOfParticipants()
        const contacts = new Set()
        let lastContactSize = -1
        const conditionCb = () => {
            if(lastContactSize === contacts.size) return false
            lastContactSize = contacts.size
            return true
        }
        const operationCb = readNumber ? async (val) => {
            const num = await getParticipantNumber(val)
            await navigateUp()
            contacts.add(num)
        } : async (val) => {
            const name = await getParticipantName(val)
            contacts.add(name)
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
    client = await wdio.remote(opts)
    for(group of groups) {
        let { contacts, name, operation = '', id, keyword } = group
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
            case 'read-by-keyword': {
                await readContactsByKeyWord(keyword)
                break
            }
        }
        // await sendMessage(message)
        if(logString) {
            fs.appendFile('logs.csv', logString, () => {})
        }
    }
    await client.deleteSession()
}

main()