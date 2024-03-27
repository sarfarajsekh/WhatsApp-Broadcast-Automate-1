import fs from 'fs';
import {
    getParticipantName,
    exportSetIntoFile,
    scrollAndGetContacts,
    swipeDown
} from "../utils/index.js"

export default async () => {
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
        await swipeDown(50, 80, 20)
    }
    await scrollAndGetContacts(conditionCb, operationCb, 'com.whatsapp:id/conversations_row_contact_name', swipeCb)
    exportSetIntoFile(contacts, 'total-contacts-names')
}