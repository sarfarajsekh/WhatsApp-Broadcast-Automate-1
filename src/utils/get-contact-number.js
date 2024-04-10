import getElementByResourceId from "./get-element-by-resource-id.js";
import scrollAndGetElement from "./scroll-and-get-element.js";
import {phone} from 'phone';

export default async (contact) => {
    await contact.click()
    let contactNameOrNumber;
    try {
        contactNameOrNumber = await getElementByResourceId('com.whatsapp:id/conversation_contact_name', 2000)
    } catch(_) {
        return { navUp: false }
    }
    try {
        const nameOrNumber = await contactNameOrNumber.getText();
        const isValidPhone = phone(nameOrNumber).isValid;
        console.log("isValidPhone", isValidPhone);
        if(isValidPhone) {
            return { number: nameOrNumber, navUp: false }
        }
        const contactHeader = await getElementByResourceId('com.whatsapp:id/conversation_contact', 2000)
        await contactHeader.click()
        const numberElement = await getElementByResourceId('com.whatsapp:id/contact_subtitle', 2000)
        const num = await numberElement.getText()
        return { number: num, navUp: true }
    } catch (e) {
        try {
            await getElementByResourceId('com.whatsapp:id/business_verification_status_text', 2000)
            const num = await scrollAndGetElement('com.whatsapp:id/title_tv')
            return { number: num, navUp: true }
        } catch (err) {
            return null
        }
    }
}