// 1. create 2. add 3. remove 4. read-number 5. read-name 6. read-contacts
module.exports = {
    groups: [
        {
            id: '1243',
            name: 'RPE-01',
            contacts: ['82103243234231','233434234235',],
            operation: 'create',
        },
        {
            id: '1111',
            name: 'RPE-01',
            contacts: ['5694930322'],
            operation: 'add',
        },
        {
            id: '1344',
            name: 'RPE-01',
            contacts: ['5694930322','1000002030'],
            operation: 'remove',
        },
        {
            id: '13664',
            name: 'RPE-001',
            contacts: ['1000002030'],
            operation: 'remove',
        },
        {
            id: '123',
            name: 'RPE1',
            operation: 'read-number'
        },
        {
            id: '134',
            operation: 'read-contacts'
        }
    ],
}