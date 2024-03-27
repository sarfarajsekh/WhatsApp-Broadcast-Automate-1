export default async (resourceId) => {
    const selector = `new UiSelector().resourceId("${resourceId}")`
    const elements = await client.$$(`android=${selector}`)
    return elements
}