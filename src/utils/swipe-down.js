export default async (xAnchorPercent, startYAnchorPercent, endYAnchorPercent) => {
    const { height, width } = await client.getWindowSize()
    const anchor = width * xAnchorPercent / 100
    const startPoint = height * startYAnchorPercent / 100
    const endPoint = height * endYAnchorPercent / 100
    await client.performActions([
        {
            type: 'pointer',
            id: 'finger',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, x: anchor, y: startPoint },
                { type: 'pointerDown', button: 0 },
                { type: 'pause', duration: 100 },
                { type: 'pointerMove', duration: 3, x: anchor, y: endPoint },
                { type: 'pointerUp', button: 0 }
            ]
        }
    ])
}