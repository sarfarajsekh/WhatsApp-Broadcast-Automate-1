const fs = require('fs');
const csv = require('csv-parser');

// CSV Reader Module for WhatsApp Group Automation
// ==============================================

const readGroupsFromCSV = (csvFilePath = './groups.csv') => {
    return new Promise((resolve, reject) => {
        const groups = [];
        
        if (!fs.existsSync(csvFilePath)) {
            console.error(`❌ CSV file not found: ${csvFilePath}`);
            console.log('💡 Please create a groups.csv file with the following format:');
            console.log('   group_id,group_name,contacts,operation');
            console.log('   001,My Group,"phone1,phone2",create');
            reject(new Error(`CSV file not found: ${csvFilePath}`));
            return;
        }

        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row) => {
                try {
                    // Parse contacts string into array
                    const contacts = row.contacts ? row.contacts.split(',').map(c => c.trim()) : [];
                    
                    // Create group object
                    const group = {
                        id: row.group_id ? row.group_id.trim() : '',
                        name: row.group_name ? row.group_name.trim() : '',
                        contacts: contacts,
                        operation: row.operation ? row.operation.trim() : 'create'
                    };
                    
                    // Add keyword if present (for search operations)
                    if (row.keyword) {
                        group.keyword = row.keyword.trim();
                    }
                    
                    groups.push(group);
                } catch (error) {
                    console.error(`❌ Error parsing row: ${JSON.stringify(row)}`);
                    console.error(`   Error: ${error.message}`);
                }
            })
            .on('end', () => {
                console.log(`📊 Successfully loaded ${groups.length} groups from CSV file`);
                resolve(groups);
            })
            .on('error', (error) => {
                console.error(`❌ Error reading CSV file: ${error.message}`);
                reject(error);
            });
    });
};

// Validate CSV data
const validateGroups = (groups) => {
    const errors = [];
    
    groups.forEach((group, index) => {
        // Check required fields
        if (!group.id) {
            errors.push(`Row ${index + 1}: Missing group_id`);
        }
        if (!group.name) {
            errors.push(`Row ${index + 1}: Missing group_name`);
        }
        if (!group.operation) {
            errors.push(`Row ${index + 1}: Missing operation`);
        }
        
        // Check operation types
        const validOperations = ['create', 'add', 'remove', 'read-number', 'read-name', 'read-contacts', 'read-by-keyword'];
        if (!validOperations.includes(group.operation)) {
            errors.push(`Row ${index + 1}: Invalid operation "${group.operation}". Valid operations: ${validOperations.join(', ')}`);
        }
        
        // Check contacts for create/add/remove operations
        if (['create', 'add', 'remove'].includes(group.operation)) {
            if (!group.contacts || group.contacts.length === 0) {
                errors.push(`Row ${index + 1}: Missing contacts for operation "${group.operation}"`);
            }
        }
        
        // Check keyword for read-by-keyword operation
        if (group.operation === 'read-by-keyword' && !group.keyword) {
            errors.push(`Row ${index + 1}: Missing keyword for read-by-keyword operation`);
        }
    });
    
    return errors;
};

module.exports = {
    readGroupsFromCSV,
    validateGroups
}; 