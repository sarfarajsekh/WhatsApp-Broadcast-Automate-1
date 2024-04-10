import waitForElementToExist from "./wait-for-element-to-exist.js";
import clearTextField from "./clear-text-field.js";
import {logger} from '../index.js';

export default async (operation, currentNumber) => {
    const listView = await client.$('android.widget.ListView')
    try {
        await waitForElementToExist(listView, 6000)
        const firstContact = await listView.$('android.widget.RelativeLayout')
        if(['add', 'remove'].includes(operation)) {
            const selected = await firstContact.$('~Selected')
            if((!selected.error && operation === 'add') || (selected.error && operation === 'remove')) {
                logger.logOperationResult({success: true, currentNumber})
                await clearTextField()
                return
            }
        }
        await firstContact.click()
        logger.logOperationResult({success: true, currentNumber})
        if(operation === 'remove') {
            await clearTextField()
        }
    } catch(e) {
        logger.logOperationResult({success: false, currentNumber})
        await clearTextField()
    }
}