# Required Field Asterisk (*) Fix Guide

## Quick Reference: Missing Asterisks

**Total Fields to Fix: 13 fields across 2 tabs**

---

## Tab 2: Nghiệp vụ (Business) - 6 Fields

### File: `frontend/src/components/SystemForm/Tab2Business.tsx` (or equivalent)

#### 1. Số lượng người dùng hàng năm (annual_users)

```typescript
// FIND:
<Form.Item
  label="Số lượng người dùng hàng năm"
  name="annual_users"

// REPLACE WITH:
<Form.Item
  label={<><span style={{ color: 'red' }}>* </span>Số lượng người dùng hàng năm</>}
  name="annual_users"
```

#### 2. Tổng số tài khoản (total_accounts)

```typescript
// FIND:
<Form.Item
  label="Tổng số tài khoản"
  name="total_accounts"

// REPLACE WITH:
<Form.Item
  label={<><span style={{ color: 'red' }}>* </span>Tổng số tài khoản</>}
  name="total_accounts"
```

#### 3. MAU - Monthly Active Users (users_mau)

```typescript
// FIND:
<Form.Item
  label="MAU (Monthly Active Users)"
  name="users_mau"

// REPLACE WITH:
<Form.Item
  label={<><span style={{ color: 'red' }}>* </span>MAU (Monthly Active Users)</>}
  name="users_mau"
```

#### 4. DAU - Daily Active Users (users_dau)

```typescript
// FIND:
<Form.Item
  label="DAU (Daily Active Users)"
  name="users_dau"

// REPLACE WITH:
<Form.Item
  label={<><span style={{ color: 'red' }}>* </span>DAU (Daily Active Users)</>}
  name="users_dau"
```

#### 5. Số đơn vị/địa phương sử dụng (num_organizations)

```typescript
// FIND:
<Form.Item
  label="Số đơn vị/địa phương sử dụng"
  name="num_organizations"

// REPLACE WITH:
<Form.Item
  label={<><span style={{ color: 'red' }}>* </span>Số đơn vị/địa phương sử dụng</>}
  name="num_organizations"
```

#### 6. Ghi chú bổ sung Tab 2 (additional_notes_tab2)

```typescript
// FIND:
<Form.Item
  label="Ghi chú bổ sung"
  name="additional_notes_tab2"

// REPLACE WITH:
<Form.Item
  label={<><span style={{ color: 'red' }}>* </span>Ghi chú bổ sung</>}
  name="additional_notes_tab2"
```

---

## Tab 3: Công nghệ (Technology) - 7 Fields

### File: `frontend/src/components/SystemForm/Tab3Technology.tsx` (or equivalent)

#### 1. API Style (api_style)

```typescript
// FIND:
<Form.Item
  label="API Style"
  name="api_style"

// REPLACE WITH:
<Form.Item
  label={<><span style={{ color: 'red' }}>* </span>API Style</>}
  name="api_style"
```

#### 2. Messaging/Queue (messaging_queue)

```typescript
// FIND:
<Form.Item
  label="Messaging/Queue"
  name="messaging_queue"

// REPLACE WITH:
<Form.Item
  label={<><span style={{ color: 'red' }}>* </span>Messaging/Queue</>}
  name="messaging_queue"
```

#### 3. Cache System (cache_system)

```typescript
// FIND:
<Form.Item
  label="Cache System"
  name="cache_system"

// REPLACE WITH:
<Form.Item
  label={<><span style={{ color: 'red' }}>* </span>Cache System</>}
  name="cache_system"
```

#### 4. Search Engine (search_engine)

```typescript
// FIND:
<Form.Item
  label="Search Engine"
  name="search_engine"

// REPLACE WITH:
<Form.Item
  label={<><span style={{ color: 'red' }}>* </span>Search Engine</>}
  name="search_engine"
```

#### 5. Reporting/BI Tool (reporting_bi_tool)

```typescript
// FIND:
<Form.Item
  label="Reporting/BI Tool"
  name="reporting_bi_tool"

// REPLACE WITH:
<Form.Item
  label={<><span style={{ color: 'red' }}>* </span>Reporting/BI Tool</>}
  name="reporting_bi_tool"
```

#### 6. Source Repository (source_repository)

```typescript
// FIND:
<Form.Item
  label="Source Repository"
  name="source_repository"

// REPLACE WITH:
<Form.Item
  label={<><span style={{ color: 'red' }}>* </span>Source Repository</>}
  name="source_repository"
```

#### 7. Ghi chú bổ sung Tab 3 (additional_notes_tab3)

```typescript
// FIND:
<Form.Item
  label="Ghi chú bổ sung"
  name="additional_notes_tab3"

// REPLACE WITH:
<Form.Item
  label={<><span style={{ color: 'red' }}>* </span>Ghi chú bổ sung</>}
  name="additional_notes_tab3"
```

---

## Alternative: Using Ant Design's Built-in Required Marker

If your form uses Ant Design's `required` prop to automatically show asterisks:

```typescript
// Instead of manual span, use Ant Design's built-in required marker:
<Form.Item
  label="Field Label"
  name="field_name"
  required  // Add this prop
  rules={[{ required: true, message: 'Vui lòng nhập...' }]}
>
```

**Note:** Check if your `FormItem` wrapper component has `requiredMark` prop enabled. If not, manual asterisk is needed.

---

## Verification Checklist

After making changes, verify:

- [ ] All 6 Tab 2 fields show red asterisk (*)
- [ ] All 7 Tab 3 fields show red asterisk (*)
- [ ] Asterisk appears BEFORE the field label
- [ ] Asterisk color is red (#ff4d4f or similar)
- [ ] Form validation still works correctly
- [ ] Error messages display properly when fields are empty

---

## Testing Script

Run this after fixing:

```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Test locally
npm run dev

# 3. Navigate to create form
# URL: http://localhost:3000/systems/create

# 4. Visual verification:
#    - Check Tab 2 bottom section (6 fields)
#    - Check Tab 3 bottom section (7 fields)
#    - Try submitting empty form to verify validation
```

---

## Deployment Checklist

- [ ] Code changes committed to Git
- [ ] Pull request created and reviewed
- [ ] Frontend rebuilt (`npm run build`)
- [ ] Changes deployed to production
- [ ] Production verification completed
- [ ] Screenshots captured for documentation
- [ ] Test report updated with PASS status

---

**Fix Priority:** P0 - Critical (User Experience Issue)
**Estimated Fix Time:** 15-30 minutes
**Testing Time:** 15 minutes
**Total Time:** 30-45 minutes
