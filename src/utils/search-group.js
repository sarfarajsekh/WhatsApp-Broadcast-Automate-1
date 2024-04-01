import getTextField from "./get-text-field.js";
import clickOnSearch from "./click-on-search.js";

export default async (name) => {
    await clickOnSearch()
    const textField = await getTextField(false)
    await textField.setValue(name)
    // delay for group search - optimization
    // when modifying a existing group the group is searched on home screen
    //changed - orginal 25000
    await client.pause(5000)
}