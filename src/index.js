import fs from 'fs';
import { remote } from 'webdriverio';
import {groups} from './groups.js';
import {
    createNewBroadCastGroup,
    readBroadcastGroupParticipants,
    readChatHistoryContacts,
    readChatHistoryContactsNumber,
    readContactsByKeyWord,
    modifyParticipantsToExistingGroup
} from './operations/index.js';
import { OperationLogger, ResultLogger } from './utils/logger.js';

let logger;

const commonCapabilities = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:useNewWDA': false,
    'appium:usePrebuiltWDA': true,
    'appium:noReset': true,
    'appium:fullReset': false,
    'appium:ignoreHiddenApiPolicyError': true,
}

const capabilities = {
    'onePlus10T': {
        'appium:platformVersion': '14',
        'appium:udid': '8edf3315',
        ...commonCapabilities
    },
    'emulator-5554': {
        'appium:platformVersion': '13',
        'appium:udid': 'emulator-5554',
        ...commonCapabilities
    }
}

const opts = {
    path: '/wd/hub',
    port: 4723,
    capabilities: capabilities['emulator-5554']
}

const instantiateGlobalVariables = () => {
    global.client
    global.currentGroupId
    global.currentGroupName
    global.currentNumber
    global.currentOperation
}

const instantitateLogFile = () => fs.appendFileSync('logs.csv', 'GroupId,GroupName,Operation,Contact Number,Success(1)/Failure(0),date,time\n', () => {})
const instantiateClient = async () =>  global.client = await remote(opts);
const deleteClient = async () => await client.deleteSession();

const start = async () => {
    for(let group of groups) {
        let { contacts, name, operation = '', id, keyword } = group
        global.currentGroupId = id
        global.currentGroupName = name
        contacts = [... new Set(contacts)]
        global.currentOperation = ''
        let readNumber;
        if(['add', 'remove', 'create'].includes(operation)) {
            logger = new OperationLogger({operationName: operation, groupName: name})
        }
        switch(operation) {
            case 'add':
                global.currentOperation = '2'
            case 'remove': {
                if(!currentOperation) global.currentOperation = '3'
                await modifyParticipantsToExistingGroup(contacts, name, operation)
                break
            }
            case 'create': {
                global.currentOperation = '1'
                await createNewBroadCastGroup(contacts, name)
                break
            }
            case 'read-number':
                readNumber = true
                global.currentOperation = '4'
            case 'read-name':
                if(!currentOperation) global.currentOperation = '5'
                readNumber = !!readNumber
                await readBroadcastGroupParticipants(name, readNumber)
                break
            case 'read-contacts': {
                global.currentOperation = '6'
                await readChatHistoryContacts()
                break
            }
            case 'read-contacts-number': {
                global.currentOperation = '7'
                await readChatHistoryContactsNumber()
                break
            }
            case 'read-by-keyword': {
                await readContactsByKeyWord(keyword)
                break
            }
        }
    }
}

const main = async () => {
    instantiateGlobalVariables();
    instantitateLogFile()
    await instantiateClient();
    await start();
    await deleteClient()
}

main()

export { logger }
