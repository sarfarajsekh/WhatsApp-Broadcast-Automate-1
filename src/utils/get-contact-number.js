import getElementByResourceId from "./get-element-by-resource-id.js";
import scrollAndGetElement from "./scroll-and-get-element.js";

export default async (contact) => {
    await contact.click()
    const contactNameOrNumber = await getElementByResourceId('com.whatsapp:id/conversation_contact_name', 2000)
    const nameOrNumber = await contactNameOrNumber.getText();
    if(phone(nameOrNumber).isValid) {
        return { number: nameOrNumber, navUp: false }
    }
    const contactHeader = await getElementByResourceId('com.whatsapp:id/conversation_contact', 2000)
    await contactHeader.click()
    try {
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