import clickOnMoreOptionsButtonWithText from "./click-on-more-options-button-with-text.js";
import openMoreOptions from "./open-more-options.js";

export default async (value) => {
    await openMoreOptions()
    await clickOnMoreOptionsButtonWithText(value)
}