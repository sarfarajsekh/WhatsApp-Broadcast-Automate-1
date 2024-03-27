import clickOnButtonWithContentDesc from "./click-on-button-with-content-description.js";

export default async () => {
    await clickOnButtonWithContentDesc('Navigate up')
    await client.pause(1000)
}