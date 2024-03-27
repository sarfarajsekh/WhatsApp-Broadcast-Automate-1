import getElementByResourceId from "./get-element-by-resource-id.js";

export default async () => {
    const phoneNumberElement = await getElementByResourceId('com.whatsapp:id/contact_subtitle', 2000)
    return phoneNumberElement.getText()
}