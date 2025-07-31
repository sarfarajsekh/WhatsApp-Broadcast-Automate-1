# CSV Group Configuration Guide

## 📊 CSV File Format

The automation now uses a CSV file (`groups.csv`) to manage group configurations. This makes it easy to add, modify, or remove groups without changing code.

## 📋 CSV Structure

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| `group_id` | ✅ | Unique identifier for the group | `001`, `002`, `003` |
| `group_name` | ✅ | Name of the group | `My First Group`, `Family Group` |
| `contacts` | ⚠️ | Comma-separated phone numbers (required for create/add/remove) | `"8250472237,9932647806"` |
| `operation` | ✅ | Type of operation to perform | `create`, `add`, `remove`, etc. |
| `keyword` | ⚠️ | Search keyword (required for read-by-keyword) | `John`, `Work` |

## 🔧 Available Operations

| Operation | Description | Required Fields |
|-----------|-------------|-----------------|
| `create` | Create new WhatsApp group | `group_id`, `group_name`, `contacts` |
| `add` | Add contacts to existing group | `group_id`, `group_name`, `contacts` |
| `remove` | Remove contacts from existing group | `group_id`, `group_name`, `contacts` |
| `read-number` | Read phone numbers from group | `group_id`, `group_name` |
| `read-name` | Read contact names from group | `group_id`, `group_name` |
| `read-contacts` | Read all contacts from device | `group_id` |
| `read-by-keyword` | Search contacts by keyword | `group_id`, `keyword` |

## 📝 CSV Examples

### Create Multiple Groups
```csv
group_id,group_name,contacts,operation
001,My First Group,"8250472237,9932647806",create
002,Family Group,"8250472237,9932647806",create
003,Work Team,"8250472237,9932647806",create
```

### Mixed Operations
```csv
group_id,group_name,contacts,operation,keyword
001,My Group,"8250472237,9932647806",create,
002,Add More,"8250472237",add,
003,Remove Contact,"8250472237",remove,
004,Read Numbers,My Group,,read-number,
005,Search John,,,read-by-keyword,John
```

## ⚠️ Important Notes

1. **Phone Numbers**: Use international format without '+' (e.g., `8250472237`)
2. **Contacts**: Multiple contacts should be comma-separated and in quotes: `"phone1,phone2,phone3"`
3. **Group Names**: Must be unique for create operations
4. **Group IDs**: Must be unique across all operations
5. **Empty Fields**: Leave empty for operations that don't need them

## 🚀 How to Use

1. **Edit the CSV file**: Modify `groups.csv` with your desired groups
2. **Run the automation**: Execute `npm run start`
3. **Check logs**: Review the console output and `logs.csv` for results

## 📁 File Structure

```
WhatsApp-Broadcast-Automate/
├── groups.csv          # Main group configuration file
├── groups-sample.csv   # Sample file with examples
├── csv-reader.js       # CSV parsing module
├── index.js           # Main automation script
└── CSV-README.md      # This guide
```

## 🔍 Validation

The automation automatically validates your CSV file and will show errors if:
- Required fields are missing
- Invalid operations are specified
- Phone numbers are in wrong format
- Group IDs are not unique

## 💡 Tips

- **Backup your CSV**: Keep a backup of your working configurations
- **Test small**: Start with 2-3 groups to test before running large batches
- **Check phone numbers**: Ensure all phone numbers are correct and in your contacts
- **Unique names**: Use descriptive, unique group names
- **Comments**: Add comments in the CSV file for organization (lines starting with #) 