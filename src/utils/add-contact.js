import sendValueToTextField from "./send-value-to-text-field.js";
import selectFirstContactIfItExists from "./select-first-contact.js";

export default async (value, operation) => {
    await sendValueToTextField(value)
    // delay for contact to appear - per contact - optimization
    // When number is entered in search to add into broadcast group.
    await client.pause(50000)
    await selectFirstContactIfItExists(operation, value)
}