import getElementsByResourceId from "./get-elements-by-resource-id.js";
import waitForElementToExist from "./wait-for-element-to-exist.js";

export default async (conditionCb, operationCb, resourceId, swipeCb) => {
    while(conditionCb()) {
        const visibleContacts = await getElementsByResourceId(resourceId)
        for await (let contact of visibleContacts) {
            try {
                await waitForElementToExist(contact, 3000)
                await operationCb(contact)
            } catch (_) {
                continue
            }
        }
        await swipeCb()
    }
}
