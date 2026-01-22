# Fix: "data_classification_type: Not a valid string" Error

## Problem Summary

User encountered error when saving data in "Dữ liệu" tab:
```
data_classification_type: Not a valid string
```

## Root Cause

**Data Type Mismatch Between Frontend and Backend**:

1. **Frontend** (SystemCreate.tsx, SystemEdit.tsx):
   - Uses `CheckboxGroupWithOther` component
   - Returns: `string[]` (array of strings)
   - Example: `['Public', 'Internal', 'Confidential']`

2. **Backend Model** (models.py):
   - `data_classification_type = CharField(max_length=500)`
   - Expects: comma-separated string, not array
   - Example: `'Public,Internal,Confidential'`

3. **Serializer**:
   - No conversion logic between array ↔ string
   - DRF CharField field rejects array input

## Affected Fields

Multiple CharField fields were affected by this issue:

**System model**:
- `data_classification_type` - Data classification levels
- `authentication_method` - Authentication methods
- `data_exchange_method` - Data exchange methods
- `backup_plan` - Backup strategies

**SystemArchitecture model**:
- `architecture_type` - Architecture types
- `backend_tech` - Backend technologies
- `frontend_tech` - Frontend technologies

**SystemIntegration model**:
- `api_standard` - API standards

## Solution Implemented

### 1. Created Custom Serializer Field

Created `CommaSeparatedListField` in `backend/apps/systems/serializers.py`:

```python
class CommaSeparatedListField(serializers.Field):
    """
    Custom field to handle conversion between:
    - Frontend: array of strings ['value1', 'value2']
    - Backend CharField: comma-separated string 'value1,value2'
    """

    def to_representation(self, value):
        """Convert DB string to array for frontend"""
        if not value:
            return []
        return [v.strip() for v in value.split(',') if v.strip()]

    def to_internal_value(self, data):
        """Convert frontend array to DB string"""
        if not data:
            return ''
        if isinstance(data, list):
            return ','.join(str(v).strip() for v in data if v)
        return str(data)
```

### 2. Applied to Serializers

**SystemCreateUpdateSerializer** (for Create/Update operations):
```python
data_classification_type = CommaSeparatedListField(required=False, allow_blank=True)
authentication_method = CommaSeparatedListField(required=False, allow_blank=True)
data_exchange_method = CommaSeparatedListField(required=False, allow_blank=True)
backup_plan = CommaSeparatedListField(required=False, allow_blank=True)
```

**SystemDetailSerializer** (for Read operations):
```python
data_classification_type = CommaSeparatedListField(required=False, allow_blank=True)
authentication_method = CommaSeparatedListField(required=False, allow_blank=True)
data_exchange_method = CommaSeparatedListField(required=False, allow_blank=True)
backup_plan = CommaSeparatedListField(required=False, allow_blank=True)
```

**SystemArchitectureSerializer**:
```python
architecture_type = CommaSeparatedListField(required=False, allow_blank=True)
backend_tech = CommaSeparatedListField(required=False, allow_blank=True)
frontend_tech = CommaSeparatedListField(required=False, allow_blank=True)
```

**SystemIntegrationSerializer**:
```python
api_standard = CommaSeparatedListField(required=False, allow_blank=True)
```

## How It Works

### Data Flow: Frontend → Backend (Create/Update)

1. User selects checkboxes: `['Public', 'Internal']`
2. Frontend sends: `{"data_classification_type": ["Public", "Internal"]}`
3. Serializer `to_internal_value()` converts: `["Public", "Internal"]` → `"Public,Internal"`
4. Database stores: `"Public,Internal"`

### Data Flow: Backend → Frontend (Read)

1. Database has: `"Public,Internal"`
2. Serializer `to_representation()` converts: `"Public,Internal"` → `["Public", "Internal"]`
3. Frontend receives: `{"data_classification_type": ["Public", "Internal"]}`
4. CheckboxGroupWithOther displays selected checkboxes correctly

## Testing Steps

1. **Restart Backend Server**:
   ```bash
   cd backend
   # If using Docker
   docker compose restart backend

   # If using manual Django
   python manage.py runserver
   ```

2. **Test Create System**:
   - Go to "Tạo hệ thống mới"
   - Navigate to "Dữ liệu" tab
   - Select multiple "Phân loại dữ liệu" checkboxes (e.g., Public + Internal)
   - Click "Lưu"
   - Should save successfully without error

3. **Test Edit System**:
   - Open existing system
   - Go to "Dữ liệu" tab
   - Modify "Phân loại dữ liệu" selections
   - Click "Cập nhật"
   - Should update successfully

4. **Test Display**:
   - Open system detail page
   - Verify "Phân loại dữ liệu" shows correct values as comma-separated string
   - Edit system
   - Verify checkboxes are pre-selected correctly

## Files Modified

1. `/backend/apps/systems/serializers.py`:
   - Added `CommaSeparatedListField` class
   - Modified `SystemCreateUpdateSerializer`
   - Modified `SystemDetailSerializer`
   - Modified `SystemArchitectureSerializer`
   - Modified `SystemIntegrationSerializer`

## No Database Migration Required

This fix only modifies serializer logic (data conversion layer). No database schema changes needed.

## Verification Checklist

- [ ] Backend server restarted
- [ ] Can create new system with multiple data classification types
- [ ] Can edit existing system and change data classification types
- [ ] Data saves correctly in database as comma-separated string
- [ ] Frontend displays data correctly as selected checkboxes
- [ ] No validation errors when submitting form
- [ ] Other affected fields (authentication_method, etc.) also work correctly

## Additional Notes

- The fix is backward-compatible:
  - Empty arrays → empty strings
  - Single values → single values
  - Already-saved comma-separated strings → correctly parsed to arrays
- No data loss or corruption
- Frontend code remains unchanged
- Only backend serializer logic modified

## Contact

If issues persist after restart:
1. Check Django logs for errors
2. Verify serializer changes were applied
3. Clear browser cache and retry
4. Check network tab for actual request/response payload
