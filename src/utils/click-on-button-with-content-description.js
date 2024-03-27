
export default async (value) => {
    const {x, y} = await client.$(`~${value}`).getLocation();
    await client.touchPerform([{
        action: 'tap',
        options: {x: x+10, y: y+10}
    }])
}