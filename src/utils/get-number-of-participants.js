import getElementByResourceId from "./get-element-by-resource-id.js";
import waitForElementToExist from "./wait-for-element-to-exist.js";

export default async () => {
    const participantsElement = await getElementByResourceId('com.whatsapp:id/participants_title')
    waitForElementToExist(participantsElement)
    const participantsInfo = await participantsElement.getText()
    return Number(participantsInfo.split(' ')[0])
}