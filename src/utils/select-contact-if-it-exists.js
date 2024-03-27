import waitForElementToExist from "./wait-for-element-to-exist.js";

export default async (contact) => {
    const listView = await client.$('android.widget.ListView')
    try {
        await waitForElementToExist(listView, 6000)
        const firstContact = await listView.$('android.widget.RelativeLayout')
        await firstContact.click()
    } catch(e) {
        for (let i=0; i<contact.length; i++) {
            await client.pressKeyCode(67)
        }
    }
}
