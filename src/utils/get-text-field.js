import waitForElementToExist from "./wait-for-element-to-exist.js";

export default async (isAutoComplete) => {
    const textSelector = `new UiSelector().text("Search…").className(android.widget.${isAutoComplete ? "AutoCompleteTextView" : "EditText"})`
    const textField = await client.$(`android=${textSelector}`)
    await waitForElementToExist(textField)
    return textField
}