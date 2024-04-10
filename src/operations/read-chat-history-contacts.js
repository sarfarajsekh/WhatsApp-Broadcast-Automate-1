import {
    getParticipantName,
    exportSetIntoFile,
    scrollAndGetContacts,
    swipeDown,
    ResultLogger,
    getContactsStringFromSet
} from "../utils/index.js"

export default async () => {
    const logger = new ResultLogger({groupName: 'total-contacts-names'});
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
        logger.log(name+'\n');
    }
    const swipeCb = async () => {
        await swipeDown(50, 80, 20)
    }
    await scrollAndGetContacts(conditionCb, operationCb, 'com.whatsapp:id/conversations_row_contact_name', swipeCb)
    const contactsString = getContactsStringFromSet(contacts);
    logger.logOverwrite(contactsString);
}