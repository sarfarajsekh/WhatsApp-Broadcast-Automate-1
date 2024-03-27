import getElementByResourceId from "./get-element-by-resource-id.js";
import getPhoneNumber from "./get-phone-number.js";
import scrollAndGetElement from "./scroll-and-get-element.js";

export default async (participant) => {
    try {
        await participant.click()
        const list = await getElementByResourceId('android:id/select_dialog_listview', 2000)
        const listItems = await list.$$('android.widget.LinearLayout')
        const viewElement = listItems[1]
        await viewElement.click()
        let phoneNumber
        try {
            phoneNumber = await getPhoneNumber()
            return phoneNumber;
        } catch(_) {
            return scrollAndGetElement('com.whatsapp:id/title_tv')
        }
    } catch(e) {
        throw new Error('cannot click');
    }
}