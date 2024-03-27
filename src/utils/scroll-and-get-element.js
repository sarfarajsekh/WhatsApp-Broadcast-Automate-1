import getElementByResourceId from "./get-element-by-resource-id.js";

export default async (resourceId) => {
    while(true) {
        await swipeDown(50, 95, 40)
        try {
            const resource = await getElementByResourceId(resourceId, 2000)
            return resource.getText()
        } catch (e) {
            continue;
        }
    }
}