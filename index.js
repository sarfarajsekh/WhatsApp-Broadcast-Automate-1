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
//     },
// }

const opts = {
    path: '/wd/hub',
    port: 4723,
    capabilities: {
        platformName: 'Android',
        platformVersion: '10',
        deviceName: 'OnePlus 5T',
        udid: '2b0b4a8e',
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

const waitForElementToExist = async (element) => {
    await element.waitForExist({ timeout : 5000 })
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
    const textField = await getTextField(true)
    await textField.setValue(value)
}

const addContact = async (value, operation) => {
    currentNumber = value
    await sendValueToTextField(value)
    await client.pause(2000)
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

const searchAndOpenGroup = async (name) => {
    await clickOnSearch()
    const textField = await getTextField(false)
    await textField.setValue(name)
    await client.pause(2000)
    return await selectGroupIfItExists(name)
}

const clickOnEditRecipients = async () => {
    const selector = `new UiSelector().resourceId("com.whatsapp:id/add_participant_button")`
    const button = await client.$(`android=${selector}`)
    await waitForElementToExist(button)
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

const main = async () => {
    client = await wdio.remote(opts)
    for(group of groups) {
        let { contacts, name, operation = '', id } = group
        currentGroupId = id
        currentGroupName = name
        contacts = [... new Set(contacts)]
        logString = ''
        currentOperation = ''
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
            }
        }
        // await sendMessage(message)
        fs.appendFile('logs.csv', logString, () => {})
    }
    await client.deleteSession()
}

main()