import {
    logContact,
    selectMoreOptionsButtonWithText,
    searchAndOpenGroup,
    getNumberOfParticipants,
    getParticipantNumber,
    getParticipantName,
    swipeDown,
    scrollAndGetContacts,
    navigateUp,
    ResultLogger,
    getContactsStringFromSet
} from "../utils/index.js"

export default async (name, readNumber) => {
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
        const logger = new ResultLogger({groupName: `${currentGroupName}-${readNumber ? 'read-number' : 'read-name'}`});
        logger.log(`Number of participants: ${participantsCount}`);
        const operationCb = readNumber ? async (val) => {
            const num = await getParticipantNumber(val)
            await navigateUp()
            contacts.add(num)
            logger.log(num)
        } : async (val) => {
            const name = await getParticipantName(val)
            contacts.add(name)
            logger.log(name)
        }
        const swipeCb = async () => {
            await swipeDown(50, 95, 40)
        }
        await scrollAndGetContacts(conditionCb, operationCb, readNumber ? 'com.whatsapp:id/group_chat_info_layout' : 'com.whatsapp:id/name', swipeCb)
        await navigateUp()
        await navigateUp()
        const contactsString = getContactsStringFromSet(contacts);
        logger.logOverwrite(`Number of participants: ${participantsCount}\n${contactsString}`)
    }
}