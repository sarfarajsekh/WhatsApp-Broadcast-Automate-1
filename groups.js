// 1. create 2. add 3. remove 4. read-number 5. read-name 6. read-contacts
module.exports = {
    groups: [
        {
            id: '1243',
            name: 'RPEx-01',
            contacts: ['6364024251','+918051844634'],
            operation: 'create',
        },
        {
            id: '1243',
            name: 'RPEx-01',
            contacts: ['7294953113'],
            operation: 'add',
        },
        {
            id: '1243',
            name: 'RPEx-01',
            contacts: ['6364024251'],
            operation: 'remove',
        },
        {
            id: '123',
            name: 'RPE1',
            operation: 'read-number'
        },
        {
            id: '1334',
            name: 'RPE-1',
            operation: 'read-name'
        },
        {
            id: '134',
            operation: 'read-contacts'
        },
        {
            id: '1335',
            operation: 'read-by-keyword',
            keyword: 'Aik'
        }
    ],
}