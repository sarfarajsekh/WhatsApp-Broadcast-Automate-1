import fs from 'fs';

export default (set, fileName) => {
    const it = set.values()
    let done = false
    let vals = ''
    while(!done) {
        const val = it.next()
        if(!val.done)
        vals+=val.value+'\n'
        done = val.done
    }
    fs.writeFileSync(`${fileName}.txt`, vals, () => {})
}