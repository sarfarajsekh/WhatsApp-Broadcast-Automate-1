import { openNewBroadcastView, addContact, clickOnSearch, renameGroup, clickOnCreate, navigateUp } from "../utils/index.js"

export default async (contacts, name) => {
    await openNewBroadcastView()
    await clickOnSearch()
    for(let number of contacts) {
        await addContact(number, 'create')
    }
    await clickOnCreate()
    await renameGroup(name)
    await navigateUp()
}
