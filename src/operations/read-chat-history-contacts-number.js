import { getContactNumber, scrollAndGetContacts, swipeDown, ResultLogger, getContactsStringFromSet, navigateUp } from "../utils/index.js";

export default async () => {
    const logger = new ResultLogger({groupName: 'total-contacts-numer'});
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
        if (res) {
            if(res.number) {
                contacts.add(res.number)
                logger.log(res.number+'\n')
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
    const contactsString = getContactsStringFromSet(contacts);
    logger.logOverwrite(contactsString);
}