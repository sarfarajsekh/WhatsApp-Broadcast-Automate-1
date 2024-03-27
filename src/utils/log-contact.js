import fs from 'fs';

export default (contact, fileName) => {
    fs.appendFileSync(`${fileName}.txt`, contact + '\n')
}