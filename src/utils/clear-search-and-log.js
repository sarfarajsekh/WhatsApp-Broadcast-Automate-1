
import clickOnButtonWithContentDesc from "./click-on-button-with-content-description.js";
import fs from 'fs';

export default async (value) => {
    await clickOnButtonWithContentDesc('Clear')
    await clickOnButtonWithContentDesc('Back')
    const date = new Date()
    fs.appendFile(
        'logs.txt',
        `can not find group ${currentGroupId} with name ${currentGroupName} for operation ${currentOperation}, on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}\n`,
        () => {}
    )
    return false
}