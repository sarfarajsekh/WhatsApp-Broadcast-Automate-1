import getTextField from "./get-text-field.js";

export default async (value) => {
    const textField = await getTextField(false)
    await textField.setValue(value)
}