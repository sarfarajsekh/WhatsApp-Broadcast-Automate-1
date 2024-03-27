import waitForElementToExist from "./wait-for-element-to-exist.js";

export default async (resourceId, timeout) => {
    const selector = `new UiSelector().resourceId("${resourceId}")`
    const element = await client.$(`android=${selector}`)
    await waitForElementToExist(element, timeout)
    return element
}