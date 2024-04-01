import waitForElementToExist from "./wait-for-element-to-exist.js";

export default async (value, shouldClickTwice) => {
    let element = await client.$(`~${value}`);
    await waitForElementToExist(element);
    element = await client.$(`~${value}`);
    // if(pauseBeforeTap) {
    //     await client.pause(pauseBeforeTap);
    // }
    const {x, y } = await element.getLocation();
    await client.touchPerform([{
        action: 'tap',
        options: {x: x+10, y: y+10}
    }])
    if(shouldClickTwice) {
        await client.touchPerform([{
            action: 'tap',
            options: {x: x+10, y: y+10}
        }])
    }
    // await client.action('pointer').move(x+10, y+10).down().up().perform();
    
}