import fs from 'fs';

export const getContactsStringFromSet = (set) => {
    const it = set.values()
    let done = false
    let vals = ''
    while(!done) {
        const val = it.next()
        if(!val.done)
        vals+=val.value+'\n'
        done = val.done
    }
    return vals;
}
export default (set, fileName) => {
    const contacts = getContactsStringFromSet(set);
    fs.writeFileSync(`${fileName}.txt`, contacts, () => {})
}