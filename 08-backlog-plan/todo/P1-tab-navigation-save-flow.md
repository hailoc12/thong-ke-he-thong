# P1: Tab Navigation Save Flow

**Priority:** P1
**Status:** In Progress
**Created:** 2026-01-20
**Component:** SystemCreate.tsx, SystemEdit.tsx

## Customer Requirement

Cải thiện UX form với save flow theo từng tab:

### Current State (Hiện tại):
- Nút "Lưu" và "Hủy" xuất hiện ở cuối form (dưới tất cả tabs)
- User có thể chuyển tabs tự do mà không lưu
- Không có warning khi data chưa lưu
- Không có cách nào lưu draft theo từng tab

### Desired State (Mong muốn):

**1. Tab 1-8 (Tabs trung gian):**
- Nút **"Lưu & Tiếp tục"** - Lưu data hiện tại + move sang tab tiếp theo
- Nút **"Lưu"** - Lưu data hiện tại (stay at current tab)
- Nếu user click tab khác mà chưa lưu → **Warning modal**: "Bạn cần hoàn thiện nhập thông tin ở tab hiện tại trước khi di chuyển sang hạng mục tiếp theo"

**2. Tab 9 (Tab cuối cùng):**
- Nút **"Lưu hệ thống"** - Submit final form
- Nút **"Lưu"** - Save draft (không submit)

**3. Dirty State Tracking:**
- Track form changes per tab
- Show warning only if tab has unsaved changes
- Allow navigation if tab data is saved or unchanged

## Technical Design

### 1. State Management

```typescript
interface TabSaveState {
  [tabKey: string]: {
    isDirty: boolean;      // Has unsaved changes
    isSaved: boolean;      // Has been saved at least once
    lastSavedAt: Date | null;
  };
}

const [tabStates, setTabStates] = useState<TabSaveState>({
  '1': { isDirty: false, isSaved: false, lastSavedAt: null },
  '2': { isDirty: false, isSaved: false, lastSavedAt: null },
  // ... for all 9 tabs
});

const [currentTab, setCurrentTab] = useState<string>('1');
const [pendingTab, setPendingTab] = useState<string | null>(null);
const [showWarningModal, setShowWarningModal] = useState(false);
```

### 2. Form Change Detection

```typescript
// Track form field changes
const handleFormChange = () => {
  setTabStates(prev => ({
    ...prev,
    [currentTab]: {
      ...prev[currentTab],
      isDirty: true,
    },
  }));
};

// Add to Form component
<Form
  form={form}
  onValuesChange={handleFormChange}
  ...
>
```

### 3. Tab Navigation Guard

```typescript
const handleTabChange = (newTabKey: string) => {
  const currentState = tabStates[currentTab];

  // Check if current tab has unsaved changes
  if (currentState.isDirty && !currentState.isSaved) {
    // Show warning modal
    setPendingTab(newTabKey);
    setShowWarningModal(true);
  } else {
    // Allow navigation
    setCurrentTab(newTabKey);
  }
};

// Add to Tabs component
<Tabs
  activeKey={currentTab}
  onChange={handleTabChange}
  items={tabItems}
/>
```

### 4. Save Functions

```typescript
// Save current tab (draft save)
const handleSaveCurrentTab = async () => {
  try {
    const values = form.getFieldsValue();

    // Call API to save draft
    if (systemId) {
      // Edit mode - PATCH existing
      await api.patch(`/systems/${systemId}/`, values);
    } else {
      // Create mode - POST new (returns ID for subsequent saves)
      const response = await api.post('/systems/', { ...values, is_draft: true });
      setSystemId(response.data.id); // Store ID for next saves
    }

    // Update tab state
    setTabStates(prev => ({
      ...prev,
      [currentTab]: {
        isDirty: false,
        isSaved: true,
        lastSavedAt: new Date(),
      },
    }));

    message.success('Đã lưu thông tin!');
  } catch (error) {
    message.error('Lỗi khi lưu thông tin');
  }
};

// Save & Continue (save + move to next tab)
const handleSaveAndContinue = async () => {
  await handleSaveCurrentTab();

  // Move to next tab
  const nextTabKey = (parseInt(currentTab) + 1).toString();
  setCurrentTab(nextTabKey);
};

// Final Save (submit form)
const handleFinalSave = async () => {
  try {
    // Validate all fields
    await form.validateFields();

    const values = form.getFieldsValue();

    if (systemId) {
      // Final update - mark as not draft
      await api.patch(`/systems/${systemId}/`, { ...values, is_draft: false });
      message.success('Lưu hệ thống thành công!');
    } else {
      // Create final
      await api.post('/systems/', { ...values, is_draft: false });
      message.success('Tạo hệ thống thành công!');
    }

    navigate('/systems');
  } catch (error) {
    message.error('Vui lòng kiểm tra lại thông tin');
  }
};
```

### 5. Warning Modal

```tsx
<Modal
  open={showWarningModal}
  title="Cảnh báo"
  onCancel={() => {
    setShowWarningModal(false);
    setPendingTab(null);
  }}
  footer={[
    <Button key="stay" onClick={() => setShowWarningModal(false)}>
      Ở lại tab hiện tại
    </Button>,
    <Button
      key="continue"
      type="primary"
      onClick={() => {
        setShowWarningModal(false);
        setCurrentTab(pendingTab!);
        setPendingTab(null);
      }}
    >
      Tiếp tục (không lưu)
    </Button>,
    <Button
      key="save"
      type="primary"
      onClick={async () => {
        await handleSaveCurrentTab();
        setShowWarningModal(false);
        setCurrentTab(pendingTab!);
        setPendingTab(null);
      }}
    >
      Lưu & Tiếp tục
    </Button>,
  ]}
>
  <p>Bạn cần hoàn thiện nhập thông tin ở tab hiện tại trước khi di chuyển sang hạng mục tiếp theo.</p>
  <p>Bạn có muốn lưu thông tin trước khi chuyển tab?</p>
</Modal>
```

### 6. Action Buttons Per Tab

```tsx
// Render buttons based on current tab
const renderActionButtons = () => {
  const isLastTab = currentTab === '9';

  return (
    <Space>
      <Button onClick={handleCancel}>Hủy</Button>

      {/* Save button (all tabs) */}
      <Button
        onClick={handleSaveCurrentTab}
        disabled={!tabStates[currentTab].isDirty}
      >
        Lưu
      </Button>

      {!isLastTab ? (
        // Tabs 1-8: Save & Continue
        <Button
          type="primary"
          onClick={handleSaveAndContinue}
          icon={<ArrowRightOutlined />}
        >
          Lưu & Tiếp tục
        </Button>
      ) : (
        // Tab 9: Final Save
        <Button
          type="primary"
          onClick={handleFinalSave}
          icon={<SaveOutlined />}
        >
          Lưu hệ thống
        </Button>
      )}
    </Space>
  );
};

// Replace current buttons
<div style={{ marginTop: 24, textAlign: 'right' }}>
  {renderActionButtons()}
</div>
```

## Implementation Steps

### Phase 1: State Management
- [ ] Add `tabStates` state
- [ ] Add `currentTab` and `pendingTab` state
- [ ] Add `systemId` state for draft saves
- [ ] Implement `handleFormChange` to track dirty state

### Phase 2: Navigation Guard
- [ ] Implement `handleTabChange` with dirty check
- [ ] Add `onChange` handler to Tabs component
- [ ] Create Warning Modal component

### Phase 3: Save Functions
- [ ] Implement `handleSaveCurrentTab` (draft save)
- [ ] Implement `handleSaveAndContinue`
- [ ] Implement `handleFinalSave`
- [ ] Add API endpoint handling for drafts

### Phase 4: UI Updates
- [ ] Replace button section with `renderActionButtons`
- [ ] Add visual indicators for saved/unsaved tabs
- [ ] Add loading states
- [ ] Test all save flows

### Phase 5: Backend Support (if needed)
- [ ] Add `is_draft` field to System model (if not exists)
- [ ] Ensure PATCH endpoint works for partial updates
- [ ] Test draft save/load flow

## User Experience

**Scenario 1: Normal flow**
1. User fills Tab 1 → Click "Lưu & Tiếp tục"
2. Data saved, moved to Tab 2
3. User fills Tab 2 → Click "Lưu & Tiếp tục"
4. Repeat until Tab 9
5. User clicks "Lưu hệ thống" → Form submitted

**Scenario 2: Navigate without saving**
1. User fills Tab 1 but doesn't save
2. User clicks Tab 3 directly
3. Warning modal appears
4. User can: Stay / Continue without saving / Save & Continue

**Scenario 3: Save draft and come back later**
1. User fills Tab 1-3 using "Lưu & Tiếp tục"
2. User clicks "Hủy" or leaves
3. System saved as draft
4. User comes back → Edit mode, continue from Tab 4

## Testing Checklist

- [ ] Tab 1-8 show "Lưu" and "Lưu & Tiếp tục" buttons
- [ ] Tab 9 shows "Lưu" and "Lưu hệ thống" buttons
- [ ] Warning appears when navigating away from unsaved tab
- [ ] "Lưu" button saves draft and stays on tab
- [ ] "Lưu & Tiếp tục" saves and moves to next tab
- [ ] "Lưu hệ thống" submits final form
- [ ] Draft can be loaded and continued
- [ ] No warning when tab has no changes
- [ ] No warning when tab was already saved

## Backend Requirements

### System Model
```python
class System(models.Model):
    # ... existing fields
    is_draft = models.BooleanField(default=False)  # Add if not exists

    # Partial save support - all fields should be nullable or have defaults
```

### API Endpoint
- `POST /api/systems/` - Create new system (support is_draft=True)
- `PATCH /api/systems/{id}/` - Partial update (for draft saves)
- `PUT /api/systems/{id}/` - Full update (for final save)

## Success Metrics

- ✅ Users can save progress at any tab
- ✅ No accidental data loss from tab navigation
- ✅ Clear feedback on save status
- ✅ Reduced form submission errors (save incrementally)
- ✅ Better UX for long forms

## Risks & Mitigation

**Risk 1:** Browser refresh loses unsaved changes
- Mitigation: Add beforeunload event listener with warning

**Risk 2:** API failures during draft save
- Mitigation: Retry logic, local storage backup

**Risk 3:** User confusion about "Lưu" vs "Lưu & Tiếp tục"
- Mitigation: Clear button labels, tooltips

**Risk 4:** Performance with frequent API calls
- Mitigation: Debounce saves, optimize PATCH payload

## Future Enhancements

- Auto-save every 30 seconds
- Visual tab completion indicators (✅ saved, ⚠️ has changes)
- Progress bar showing % completion
- Keyboard shortcuts (Ctrl+S to save)
