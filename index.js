const fs = require('fs')
const wdio = require('webdriverio')
const { groups } = require('./groups')
const { message } = require('./message')
const { configs } = require('./config')

const opts = {
    path: '/wd/hub',
    port: 4723,
    capabilities: {
        platformName: 'Android',
        platformVersion: '11',
        deviceName: 'OnePlus 8T',
        udid: '6cc4a982',
        automationName: 'UiAutomator2',
        ignoreHiddenApiPolicyError: true,
    },
}

let client
const date = new Date()
const { logId } = configs

fs.appendFile('logs.txt', `\nCreating log ${logId} at ${date.toString()}\n====================================================`, () => {})

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

const clearTextFieldValueAndLog = async (message) => {
    await clickOnButtonWithContentDesc('Clear query')
    fs.appendFile('logs.txt', message + '\n', () => {})
}

const selectFirstContactIfItExists = async (value, operation) => {
    let message
    const listView = await client.$('android.widget.ListView')
    try {
        await waitForElementToExist(listView)
        const firstContact = await listView.$('android.widget.RelativeLayout')
        if(['add', 'remove'].includes(operation)) {
            const selected = await firstContact.$('~Selected')
            if(!selected.error && operation === 'add') {
                message = `${value} is already in group`
            } else if(selected.error && operation === 'remove'){
                message = `${value} was not in group`
            }
        }
        if(message) throw new Error()
        await firstContact.click()
        if(operation === 'remove') {
            await clickOnButtonWithContentDesc('Clear query')
        }
    } catch(e) {
        if(!message) {
            message = `${value} doesn't exist in your contact`
        }
        clearTextFieldValueAndLog(message, operation)
    }
}


const sendValueToTextField = async (value) => {
    const textField = await getTextField(true)
    await textField.setValue(value)
}

const addContact = async (value, operation) => {
    await sendValueToTextField(value)
    await client.pause(2000)
    await selectFirstContactIfItExists(value, operation)
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
    fs.appendFile('logs.txt', `\ncan not find group with name ${value}`, () => {})
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
    }
    await navigateUp()
}

const main = async () => {
    client = await wdio.remote(opts)
    for(group of groups) {
        let { contacts, name, operation = '' } = group
        contacts = [... new Set(contacts)]
        fs.appendFile('logs.txt', `\nGroup - ${name}, operation - ${operation}\n`, () => {})
        switch(operation) {
            case 'add':
            case 'remove': {
                await modifyParticipantsToExistingGroup(contacts, name, operation)
                break
            }
            case 'create': {
                await createNewBroadCastGroup(contacts, name)
            }
        }
        // await sendMessage(message)
    }
    await client.deleteSession()
}

main()