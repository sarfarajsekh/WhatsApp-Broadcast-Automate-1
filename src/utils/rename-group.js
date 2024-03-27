import selectMoreOptionsButtonWithText from "./select-more-options-button-with-text.js";
import setNewName from "./set-new-name.js";
import navigateUp from "./navigate-up.js";

export default async (name) => {
    await selectMoreOptionsButtonWithText('Broadcast list info')
    await selectMoreOptionsButtonWithText('Change broadcast list name')
    await setNewName(name)
    await client.pause(2000)
    await navigateUp()
}