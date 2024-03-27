import searchAndOpenGroup from "../utils/search-and-open-group.js";
import clickOnSearch from "../utils/click-on-search.js";
import addContact from "../utils/add-contact.js";
import clickOnDone from "../utils/click-on-done.js";
import navigateUp from "../utils/navigate-up.js";
import clickOnEditRecipients from "../utils/click-on-edit-recipients.js";
import selectMoreOptionsButtonWithText from "../utils/select-more-options-button-with-text.js";

export default async (contacts, name, operation) => {
    if(await searchAndOpenGroup(name)){
        await selectMoreOptionsButtonWithText('Broadcast list info')
        await clickOnEditRecipients()
        await clickOnSearch()
        for(number of contacts) {
            await addContact(number, operation)
        }
        await clickOnDone()
        await navigateUp()
        await navigateUp()
    }
}