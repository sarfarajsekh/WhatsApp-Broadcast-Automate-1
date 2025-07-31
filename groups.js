// WhatsApp Group Automate - Groups Configuration
// ==============================================
// 
// Available Operations:
// 1. 'create' - Create new WhatsApp group with contacts
// 2. 'add' - Add contacts to existing group
// 3. 'remove' - Remove contacts from existing group
// 4. 'read-number' - Read phone numbers from group
// 5. 'read-name' - Read contact names from group
// 6. 'read-contacts' - Read all contacts from device
// 7. 'read-by-keyword' - Search contacts by keyword
// 
// Contact numbers should be in international format without '+' (e.g., '1234567890')
// Group names should be unique and descriptive

module.exports = {
    groups: [
        // Group 1: My First Group
        {
            id: '001',
            name: 'My First Group',
            contacts: ['8250472237', '9932647806'],
            operation: 'create',
        },
        
        // Group 2: Family Group
        {
            id: '002',
            name: 'Family Group',
            contacts: ['8250472237', '9932647806'],
            operation: 'create',
        },
        
        // Group 3: Work Team
        {
            id: '003',
            name: 'Work Team',
            contacts: ['8250472237', '9932647806'],
            operation: 'create',
        },
        
        // Group 4: Friends Circle
        {
            id: '004',
            name: 'Friends Circle',
            contacts: ['8250472237', '9932647806'],
            operation: 'create',
        },
        
        // Group 5: Study Group
        {
            id: '005',
            name: 'Study Group',
            contacts: ['8250472237', '9932647806'],
            operation: 'create',
        },
        
        // Group 6: Project Team
        {
            id: '006',
            name: 'Project Team',
            contacts: ['8250472237', '9932647806'],
            operation: 'create',
        },
        
        // Group 7: Social Club
        {
            id: '007',
            name: 'Social Club',
            contacts: ['8250472237', '9932647806'],
            operation: 'create',
        },
        
        // Group 8: Business Network
        {
            id: '008',
            name: 'Business Network',
            contacts: ['8250472237', '9932647806'],
            operation: 'create',
        },
        
        // Group 9: Hobby Group
        {
            id: '009',
            name: 'Hobby Group',
            contacts: ['8250472237', '9932647806'],
            operation: 'create',
        },
        
        // Group 10: Support Group
        {
            id: '010',
            name: 'Support Group',
            contacts: ['8250472237', '9932647806'],
            operation: 'create',
        }
        
        // ================================================
        // TEMPLATE - Copy and modify these examples:
        // ================================================
        
        /*
        // Add to existing group
        {
            id: 'your-add-id',
            name: 'Your Group Name',
            contacts: ['new-phone1', 'new-phone2'],
            operation: 'add',
        },
        
        // Remove from existing group
        {
            id: 'your-remove-id',
            name: 'Your Group Name',
            contacts: ['phone-to-remove'],
            operation: 'remove',
        },
        
        // Read group information
        {
            id: 'your-read-id',
            name: 'Your Group Name',
            operation: 'read-number' // or 'read-name'
        },
        
        // Search contacts
        {
            id: 'your-search-id',
            operation: 'read-by-keyword',
            keyword: 'search-term'
        }
        */
    ],
}