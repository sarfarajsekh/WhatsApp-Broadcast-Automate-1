import { readSearchedContacts, searchGroup } from "../utils/index.js";

export default async (keyword) => {
    await searchGroup(keyword)
    await client.hideKeyboard()
    await readSearchedContacts(keyword)
}