import getElementByResourceId from "./get-element-by-resource-id.js";
import selectContactIfItExists from "./select-contact-if-it-exists.js";

export default async (value) => {
    const textField = await getElementByResourceId('com.whatsapp:id/search_src_text')
    await textField.setValue(value)
    // delay for contact to appear - per contact - optimization
    await client.pause(2000)
    await selectContactIfItExists(value)
}