# 📝 Pattern: FlexibleChoiceField for 'Other' Options

**Date:** 2026-01-27
**Issue:** Django CharField với `choices` parameter validates STRICT - chỉ chấp nhận values trong list predefined

---

## ⚠️ Problem

Khi user chọn "Khác" và nhập custom text (e.g., "ABC", "My Custom Platform"):

**Frontend gửi:**
```json
{
  "hosting_platform": "ABC"
}
```

**Backend response:**
```json
{
  "hosting_platform": [
    "\"ABC\" is not a valid choice."
  ]
}
```

**Root cause:**
Django Model CharField với `choices` parameter → DRF serializer tự động validate STRICT

---

## ✅ Solution: FlexibleChoiceField

### 1. Create Custom Field Class

```python
# backend/apps/systems/serializers.py

class FlexibleChoiceField(serializers.CharField):
    """
    Custom CharField that accepts both:
    1. Values from predefined choices (e.g., 'cloud', 'on_premise', 'hybrid', 'other')
    2. Custom text values (when user selects 'Khác' and types custom text)

    Used for SelectWithOther component fields.
    Bypasses strict choice validation to allow custom user input.
    """

    def __init__(self, **kwargs):
        # Remove choices from kwargs to prevent strict validation
        self.model_choices = kwargs.pop('choices', None)
        super().__init__(**kwargs)

    def to_internal_value(self, data):
        """Accept any string value within max_length"""
        if data == '' or data is None:
            if self.allow_blank or not self.required:
                return ''
            self.fail('blank')

        # Convert to string and strip whitespace
        value = str(data).strip()

        # Validate max_length if specified
        if self.max_length and len(value) > self.max_length:
            self.fail('max_length', max_length=self.max_length)

        return value
```

### 2. Apply to Serializer Fields

```python
class SystemCreateUpdateSerializer(serializers.ModelSerializer):
    # Fix: Allow custom text for fields with 'other' option
    hosting_platform = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)
```

### 3. Apply to Nested Serializers

```python
class SystemArchitectureSerializer(serializers.ModelSerializer):
    # Fix: Allow custom text for fields with 'other' option
    database_model = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)
    mobile_app = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)

class SystemOperationsSerializer(serializers.ModelSerializer):
    # Fix: Allow custom text for fields with 'other' option
    deployment_location = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)
    compute_type = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)
    dev_type = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)
    warranty_status = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)
    vendor_dependency = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)
```

---

## 📊 Applied to Fields

**Dự án này đã apply cho 8 fields:**

| Field | Model | Tab | Status |
|-------|-------|-----|--------|
| hosting_platform | System | Cơ bản | ✅ FIXED |
| deployment_location | SystemOperations | Hạ tầng | ✅ FIXED |
| compute_type | SystemOperations | Hạ tầng | ✅ FIXED |
| database_model | SystemArchitecture | Công nghệ | ✅ FIXED |
| mobile_app | SystemArchitecture | Công nghệ | ✅ FIXED |
| dev_type | SystemOperations | Hạ tầng | ✅ FIXED |
| warranty_status | SystemOperations | Hạ tầng | ✅ FIXED |
| vendor_dependency | SystemOperations | Hạ tầng | ✅ FIXED |

---

## 🔧 When to Use

**RULE:** Nếu gặp lỗi validation "is not a valid choice" cho field có option "Khác" → Dùng FlexibleChoiceField

### Indicators cần dùng FlexibleChoiceField:

1. ✅ Model field có `choices` parameter
2. ✅ Frontend dùng SelectWithOther component
3. ✅ User có thể nhập custom text
4. ✅ Backend reject custom text với error "is not a valid choice"

### How to Fix:

```python
# 1. Check if FlexibleChoiceField class exists
# In serializers.py, search for: class FlexibleChoiceField

# 2. If not exists, add the class (see above)

# 3. Apply to field in serializer:
field_name = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)
```

---

## 🎯 Key Points

1. **max_length=10000** - Cho phép custom text dài (mô tả chi tiết)
2. **required=False** - Field optional (match với model `blank=True`)
3. **allow_blank=True** - Cho phép empty string
4. **Removes strict validation** - Accept any string value, không chỉ values trong choices list

---

## 📝 Commits

- `748231d` - fix(serializer): Allow custom text for fields with 'other' option
- `d38aea3` - fix(serializer): Increase max_length to 10000 for custom text fields

---

## 🔄 Deployment Process

1. **Code change:** Add FlexibleChoiceField to serializers.py
2. **Commit & push:** Git commit → GitHub
3. **Pull on server:** `git pull origin main`
4. **Rebuild backend:** `docker compose build backend --no-cache`
5. **Restart backend:** `docker compose up -d backend`
6. **Verify:** Check logs, test API

---

## ⚠️ Remember

**Trong dự án này:** Nếu còn gặp lỗi "other is not a valid choice" lần nữa:
1. ✅ Nhớ dùng FlexibleChoiceField
2. ✅ Apply cho field đang bị lỗi
3. ✅ Rebuild backend container
4. ✅ Test lại

**Pattern này giải quyết root cause:** Bypass Django's strict choice validation cho fields có 'other' option.
