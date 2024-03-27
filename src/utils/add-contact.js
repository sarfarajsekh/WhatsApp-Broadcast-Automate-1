import sendValueToTextField from "./send-value-to-text-field.js";
import selectFirstContactIfItExists from "./select-first-contact.js";

export default async (value, operation) => {
    await sendValueToTextField(value)
    // delay for contact to appear - per contact - optimization
    await client.pause(10000)
    await selectFirstContactIfItExists(operation, value)
}