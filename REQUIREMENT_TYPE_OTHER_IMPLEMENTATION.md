# Requirement Type "Other" Input Implementation

## Problem
User reported: "phan nhu cau khi an Khac thi chua co input de nhap du lieu khac, bo sung toi phan nay"

Translation: In the requirement section, when clicking "Other", there was no input field to enter other data.

## Root Causes

### 1. SelectWithOther Component Race Condition
The SelectWithOther component had a bug where:
- When user selected "other", it set `showCustomInput = true`
- But then called `onChange(null)` if customValue was empty
- This triggered the useEffect which saw value is `null` and reset `showCustomInput = false`
- The custom input never appeared

### 2. Backend Missing Support
The backend had:
- `requirement_type` field with strict choices (no 'other' option)
- No field to store custom descriptions

## Solution Overview

Implemented a complete solution with:
1. Fixed SelectWithOther component bug
2. Added backend support for "other" option
3. Added data transformation logic in frontend
4. Applied changes to both SystemCreate and SystemEdit

## Changes Made

### Backend Changes

#### 1. Model Update (`backend/apps/systems/models.py`)
- Added 'other' choice to `REQUIREMENT_TYPE_CHOICES`
- Added new `requirement_type_other` TextField for custom descriptions

```python
REQUIREMENT_TYPE_CHOICES = [
    ('new_build', 'Xây mới'),
    ('upgrade', 'Nâng cấp'),
    ('integration', 'Tích hợp - Liên thông'),
    ('replacement', 'Thay thế hệ thống cũ'),
    ('expansion', 'Mở rộng module - chức năng'),
    ('other', 'Khác'),  # NEW
]

requirement_type_other = models.TextField(
    blank=True,
    verbose_name=_('Requirement Type (Other)'),
    help_text='Mô tả chi tiết nhu cầu khác (bắt buộc khi chọn "Khác")'
)
```

#### 2. Migration (`backend/apps/systems/migrations/0017_add_requirement_type_other.py`)
Created migration to:
- Update requirement_type choices to include 'other'
- Add requirement_type_other field

### Frontend Changes

#### 1. SelectWithOther Component Fix (`frontend/src/components/form/SelectWithOther.tsx`)

**Before (Buggy):**
```typescript
if (selected === otherValue) {
  setShowCustomInput(true);
  if (!customValue) {
    onChange?.(null);  // BUG: This triggered reset
  }
}
```

**After (Fixed):**
```typescript
if (selected === otherValue) {
  setShowCustomInput(true);
  // Keep the 'other' value to maintain selection state
  if (customValue) {
    onChange?.(customValue);
  } else {
    onChange?.(otherValue);  // FIX: Keep 'other' instead of null
  }
}
```

#### 2. SystemCreate.tsx Data Transformation

Added two functions:

**a) processRequirementType (Form to API)**
Splits single form value into two backend fields:
- Predefined value → requirement_type, clear requirement_type_other
- Custom text → requirement_type='other', requirement_type_other=<text>

```typescript
const processRequirementType = (values: any): any => {
  const predefinedTypes = ['new_build', 'upgrade', 'integration', 'replacement', 'expansion', 'other'];
  const requirementValue = values.requirement_type;

  if (requirementValue) {
    if (predefinedTypes.includes(requirementValue)) {
      processedValues.requirement_type = requirementValue;
      processedValues.requirement_type_other = '';
    } else {
      // Custom text
      processedValues.requirement_type = 'other';
      processedValues.requirement_type_other = requirementValue;
    }
  }

  return processedValues;
};
```

Applied in both save handlers:
- Draft save (line ~1089)
- Final save (line ~1187)

#### 3. SystemEdit.tsx Complete Integration

Added three functions:

**a) processRequirementType** (same as SystemCreate)

**b) combineRequirementTypeForDisplay (API to Form)**
Combines two backend fields into one form value:

```typescript
const combineRequirementTypeForDisplay = (data: any): any => {
  if (data.requirement_type === 'other' && data.requirement_type_other) {
    // Show the custom text
    displayData.requirement_type = data.requirement_type_other;
  } else if (data.requirement_type === 'other' && !data.requirement_type_other) {
    // 'other' selected but no custom text yet
    displayData.requirement_type = 'other';
  }
  // else: predefined value, keep as-is

  return displayData;
};
```

**c) Applied transformations:**
- fetchSystemData: Uses combineRequirementTypeForDisplay when loading
- Draft save: Uses processRequirementType before API call
- Final save: Uses processRequirementType before API call

## Data Flow

### Create/Edit Flow
1. User selects "Khác" → SelectWithOther shows TextArea
2. User types custom text (e.g., "Không có nhu cầu nâng cấp thêm")
3. On save → processRequirementType splits:
   - requirement_type = 'other'
   - requirement_type_other = "Không có nhu cầu nâng cấp thêm"
4. Backend saves both fields

### View/Edit Existing Flow
1. Backend returns:
   - requirement_type = 'other'
   - requirement_type_other = "Không có nhu cầu nâng cấp thêm"
2. combineRequirementTypeForDisplay combines to:
   - Form value = "Không có nhu cầu nâng cấp thêm"
3. SelectWithOther displays the custom text with TextArea visible

## Testing Checklist

### Frontend
- [ ] Select "Khác" shows TextArea input
- [ ] Enter custom text saves correctly
- [ ] Edit existing system with custom requirement shows correct text
- [ ] Edit existing system with predefined requirement works normally
- [ ] Clear requirement field works
- [ ] Switch from "Khác" to predefined value clears custom text

### Backend
- [ ] Migration runs successfully
- [ ] requirement_type='other' saves correctly
- [ ] requirement_type_other saves custom text
- [ ] API returns both fields correctly
- [ ] Existing systems still work (backward compatibility)

### Integration
- [ ] Create system with custom requirement
- [ ] Edit system with custom requirement
- [ ] View system detail page shows custom requirement
- [ ] Draft save preserves custom requirement
- [ ] Final save preserves custom requirement

## Files Modified

### Backend
1. `/backend/apps/systems/models.py` - Added field and choice
2. `/backend/apps/systems/migrations/0017_add_requirement_type_other.py` - Migration

### Frontend
1. `/frontend/src/components/form/SelectWithOther.tsx` - Fixed race condition bug
2. `/frontend/src/pages/SystemCreate.tsx` - Added data transformation
3. `/frontend/src/pages/SystemEdit.tsx` - Added data transformation

## Migration Command

To apply the backend changes:

```bash
cd backend
python manage.py migrate systems 0017
```

## Build Commands

Frontend build:
```bash
cd frontend
npm run build
```

## Notes

- The serializer automatically includes the new field (uses `fields = '__all__'`)
- No validation rules added yet (could add: require requirement_type_other when requirement_type='other')
- Backward compatible: Existing systems without requirement_type_other will work fine
- The SelectWithOther component is now more robust and won't have race conditions

## Future Enhancements

1. Add validation: Require requirement_type_other when requirement_type='other'
2. Add character limit for requirement_type_other (currently unlimited TextField)
3. Add admin UI support for requirement_type_other
4. Consider adding similar "other" support for other dropdown fields
