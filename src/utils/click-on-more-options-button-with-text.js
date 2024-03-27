import getMoreOptionButtonWithText from './get-more-option-button-with-text.js';

export default async (value) => {
    const button = await getMoreOptionButtonWithText(value)
    await button.click()
}