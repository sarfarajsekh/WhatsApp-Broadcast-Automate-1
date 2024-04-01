export default async (element, timeout = 300000) => {
    // delay for list load first time - optimization
    // changed origin - 35000
    await element.waitForExist({ timeout })
}