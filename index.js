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

const getTextField = async () => {
    const textSelector = 'new UiSelector().text("Search…").className("android.widget.EditText")'
    const textField = await client.$(`android=${textSelector}`)
    await waitForElementToExist(textField)
    return textField
}

const selectFirstContactIfItExists = async (value) => {
    const listView = await client.$$('android.widget.ListView')
    if(listView && listView[0]) {
        await waitForElementToExist(listView[0])
        const firstContact = listView[0].$$('android.widget.RelativeLayout')
        if(firstContact && firstContact[0]) {
            await waitForElementToExist(firstContact[0])
            await firstContact[0].click()
        } else {
            await clearTextFieldValueAndLog(value)
        }
    } else {
        await clearTextFieldValueAndLog(value)
    }
}

const clearTextFieldValueAndLog = async (value) => {
    await clickOnButtonWithContentDesc('Clear query')
    fs.appendFile('logs.txt', `\n${value} was not added in group`, () => {})
}

const sendValueToTextField = async (value) => {
    const textField = await getTextField()
    await textField.setValue(value)
}

const addContact = async (value) => {
    await sendValueToTextField(value)
    await selectFirstContactIfItExists(value)
}

const create = async () => {
    const createButton = await client.$('~Create')
    await waitForElementToExist(createButton)
    await createButton.click()
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

const renameGroup = async (name) => {
    await selectMoreOptionsButtonWithText('Broadcast list info')
    await clickOnButtonWithContentDesc('Change subject')
    await setNewName(name)
    await navigateUp()
}


const closeGroup = async () => await navigateUp()

const main = async () => {
    client = await wdio.remote(opts)
    for(group of groups) {
        const { contacts, name } = group
        fs.appendFile('logs.txt', `\nGroup - ${name}`, () => {})
        await openNewBroadcastView()
        await clickOnSearch()
        for(number of contacts) {
            await addContact(number)
        }
        await create()
        await renameGroup(name)
        await closeGroup()
        // await sendMessage(message)
    }
    await client.deleteSession()
}

main()