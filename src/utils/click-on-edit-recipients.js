import getElementByResourceId from "./get-element-by-resource-id.js";

export default async () => {
    const button = await getElementByResourceId('com.whatsapp:id/add_participant_button')
    await button.click()
}