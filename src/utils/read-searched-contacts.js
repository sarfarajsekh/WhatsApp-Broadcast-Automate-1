import swipeDown from "./swipe-down.js";
import selectMoreOptionsButtonWithText from "./select-more-options-button-with-text.js";
import navigateUp from "./navigate-up.js";
import getPhoneNumber from "./get-phone-number.js";
import waitForElementToExist from "./wait-for-element-to-exist.js";
import getElementByResourceId from "./get-element-by-resource-id.js";
import scrollAndGetContacts from "./scroll-and-get-contacts.js";
import { getContactsStringFromSet } from "./export-set-into-file.js";
import { ResultLogger } from "./logger.js";

export default async (keyword) => {
    const logger = new ResultLogger({ groupName: keyword });
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
            logger.log(phoneNumber);
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
    const contactsString = getContactsStringFromSet(contacts);
    logger.logOverwrite(contactsString);
}