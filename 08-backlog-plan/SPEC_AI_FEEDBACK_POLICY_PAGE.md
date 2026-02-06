# SPEC: AI Feedback & Policy Management Page

## 1. OVERVIEW

### Purpose
Tạo page mới cho lanhdaobo account để:
- Xem tất cả ratings (thumbs up/down) từ users về AI responses
- Đọc detailed feedback text từ users
- Xem generated improvement policies tự động tạo từ feedback
- **✨ EDIT & REGENERATE policies thủ công**
- **✨ VERIFY policies đã được inject vào system prompt**
- Monitor AI quality metrics và trends

### Target User
- **Role**: `lanhdaobo` (Lãnh đạo Bộ)
- **Permission**: Read + Edit policies (not feedback data)
- **Goal**: Strategic monitoring và điều chỉnh AI quality

---

## 2. BACKEND - DATA STRUCTURE (ĐÃ CÓ SẴN)

### Model: AIResponseFeedback
```python
{
    id: number,
    user: User,                          # User đã submit feedback
    query: string,                       # Câu hỏi gốc
    mode: 'quick' | 'deep',             # AI mode
    response_data: JSON,                 # Full AI response
    conversation_context: JSON | null,   # Context nếu là follow-up
    rating: 'positive' | 'negative',    # Thumbs up/down
    feedback_text: string | null,        # Chi tiết feedback
    created_at: datetime,                # Thời gian submit
    analyzed: boolean,                   # Đã phân tích chưa
    generated_policies: JSON | null      # Policies từ feedback này
}
```

### Backend API Endpoints (ĐÃ CÓ)
```
GET /api/ai-feedback/                   # List all feedback (admin only)
POST /api/ai-feedback/                  # Submit new feedback
GET /api/ai-feedback/stats/             # Statistics (admin only)
GET /api/ai-feedback/active_policies/   # Active policies (all users)
```

### Generated Policy Structure
```typescript
{
    category: 'accuracy' | 'clarity' | 'completeness' | 'performance',
    rule: string,              # Policy rule description
    priority: 'high' | 'medium' | 'low',
    evidence_count: number,    # Số feedback dẫn đến policy này
    examples?: string[]        # Example feedback
}
```

---

## 3. FRONTEND - PAGE DESIGN

### 3.1 Route & Navigation
```
Path: /ai-feedback
Menu item: "AI Feedback & Policies" (trong Admin section)
Icon: CommentOutlined hoặc BulbOutlined
Show only for: lanhdaobo role
```

### 3.2 Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  📊 AI Feedback & Policy Management                         │
│  Theo dõi chất lượng AI Assistant thông qua user feedback   │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────── Statistics Cards ─────────────────────┐
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ 👍 125   │  │ 👎 23    │  │ 📝 45    │  │ 📈 84.5% │     │
│  │ Positive │  │ Negative │  │ Detailed │  │ Positive │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└────────────────────────────────────────────────────────────────┘

┌──────────────────── Active Policies (Alert) ──────────────────┐
│  🔴 HIGH Priority Policies (2)                                │
│  • CRITICAL: Always verify SQL query results...               │
│  • Evidence: 5 negative feedbacks                             │
│                                                               │
│  🟡 MEDIUM Priority Policies (3)                              │
│  • Always structure responses clearly...                      │
│  • Evidence: 4 negative feedbacks                             │
└────────────────────────────────────────────────────────────────┘

┌──────────────────────── Tabs Interface ────────────────────────┐
│  [All Feedback] [Positive] [Negative] [With Details]         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Feedback List (Table with pagination)                        │
│  ┌──────┬────────┬─────────────┬────────────┬──────────────┐  │
│  │ Date │ User   │ Query       │ Rating     │ Details      │  │
│  ├──────┼────────┼─────────────┼────────────┼──────────────┤  │
│  │ 5/2  │ vu...  │ Có bao n... │ 👍         │ [View]       │  │
│  │ 5/2  │ ptit   │ Hệ thống... │ 👎         │ [View]       │  │
│  │ 4/2  │ vnnic  │ Tổng số...  │ 👍         │ -            │  │
│  └──────┴────────┴─────────────┴────────────┴──────────────┘  │
│                                                                │
│  [Previous] 1 2 3 ... [Next]                                  │
└────────────────────────────────────────────────────────────────┘

┌────────────────── Policy Generation History ──────────────────┐
│  Timeline of generated policies                               │
│  Shows when policies were generated and from what feedback    │
└────────────────────────────────────────────────────────────────┘
```

### 3.3 Component Breakdown

#### A. Statistics Section (Row of Cards)
```tsx
<Row gutter={16}>
  <Col span={6}>
    <Card>
      <Statistic
        title="Positive Feedback"
        value={stats.positive}
        prefix={<LikeOutlined />}
        valueStyle={{ color: '#3f8600' }}
      />
    </Card>
  </Col>
  <Col span={6}>
    <Card>
      <Statistic
        title="Negative Feedback"
        value={stats.negative}
        prefix={<DislikeOutlined />}
        valueStyle={{ color: '#cf1322' }}
      />
    </Card>
  </Col>
  <Col span={6}>
    <Card>
      <Statistic
        title="With Details"
        value={stats.with_text}
        prefix={<MessageOutlined />}
      />
    </Card>
  </Col>
  <Col span={6}>
    <Card>
      <Statistic
        title="Satisfaction Rate"
        value={stats.positive_percentage}
        suffix="%"
        prefix={<RiseOutlined />}
      />
    </Card>
  </Col>
</Row>
```

#### B. Active Policies Alert
```tsx
<Alert
  type="warning"
  showIcon
  message={`🔴 ${highPriorityCount} High Priority Policies Active`}
  description={
    <Collapse>
      {activePolicies.map(policy => (
        <Panel header={policy.rule} key={policy.category}>
          <p>Priority: {policy.priority}</p>
          <p>Evidence: {policy.evidence_count} feedbacks</p>
        </Panel>
      ))}
    </Collapse>
  }
/>
```

#### C. Feedback Table
```tsx
<Table
  dataSource={feedbacks}
  columns={[
    {
      title: 'Date',
      dataIndex: 'created_at',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'User',
      dataIndex: ['user', 'username'],
    },
    {
      title: 'Question',
      dataIndex: 'query',
      ellipsis: true,
      width: 300
    },
    {
      title: 'Mode',
      dataIndex: 'mode',
      render: (mode) => (
        <Tag color={mode === 'deep' ? 'blue' : 'green'}>
          {mode === 'deep' ? '🧠 Deep' : '⚡ Quick'}
        </Tag>
      )
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      render: (rating) => (
        rating === 'positive'
          ? <Tag color="success">👍 Helpful</Tag>
          : <Tag color="error">👎 Not Helpful</Tag>
      )
    },
    {
      title: 'Details',
      dataIndex: 'feedback_text',
      render: (text, record) => (
        text
          ? <Button size="small" onClick={() => showDetails(record)}>
              View Details
            </Button>
          : <Text type="secondary">-</Text>
      )
    }
  ]}
  pagination={{
    pageSize: 20,
    showTotal: (total) => `Total ${total} feedbacks`
  }}
/>
```

#### D. Feedback Detail Modal
```tsx
<Modal
  title={
    <Space>
      {feedback.rating === 'positive'
        ? <LikeOutlined style={{color: 'green'}} />
        : <DislikeOutlined style={{color: 'red'}} />
      }
      <Text>Feedback Detail</Text>
    </Space>
  }
  visible={modalVisible}
  onCancel={() => setModalVisible(false)}
  footer={null}
  width={800}
>
  <Descriptions column={1} bordered>
    <Item label="User">{feedback.user.username}</Item>
    <Item label="Date">{dayjs(feedback.created_at).format('LLLL')}</Item>
    <Item label="Mode">
      <Tag color={feedback.mode === 'deep' ? 'blue' : 'green'}>
        {feedback.mode === 'deep' ? '🧠 Deep Mode' : '⚡ Quick Mode'}
      </Tag>
    </Item>
    <Item label="Question">
      <Paragraph copyable>{feedback.query}</Paragraph>
    </Item>
    <Item label="Feedback Text">
      <Paragraph>{feedback.feedback_text}</Paragraph>
    </Item>
    <Item label="AI Response">
      <Collapse>
        <Panel header="View Full Response">
          <pre>{JSON.stringify(feedback.response_data, null, 2)}</pre>
        </Panel>
      </Collapse>
    </Item>
  </Descriptions>
</Modal>
```

### 3.5 ✨ NEW: Policy Management UI Components

#### E. Enhanced Active Policies Section
```tsx
<Card
  title={
    <Space>
      <BulbOutlined />
      <Text strong>Active Improvement Policies</Text>
      <Tag color="blue">{activePolicies.length} Active</Tag>
    </Space>
  }
  extra={
    <Space>
      <Button
        icon={<EyeOutlined />}
        onClick={showPromptModal}
      >
        View Current Prompt
      </Button>
      <Button
        type="primary"
        icon={<ReloadOutlined />}
        onClick={handleRegeneratePolicies}
        loading={regenerating}
      >
        🔄 Regenerate Policies
      </Button>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setCreatePolicyModalVisible(true)}
      >
        + Create Policy
      </Button>
    </Space>
  }
>
  {/* Policy Status Banner */}
  <Alert
    type="info"
    showIcon
    message="Policy Injection Status"
    description={
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text>✅ Policies are actively being injected into AI prompts</Text>
        <Text type="secondary">
          Injection points: Quick Mode, Deep Mode Phase 1, Deep Mode Enhancement
        </Text>
        {policyStatus?.last_regeneration && (
          <Text type="secondary">
            Last regeneration: {dayjs(policyStatus.last_regeneration).fromNow()}
          </Text>
        )}
      </Space>
    }
    style={{ marginBottom: 16 }}
  />

  {/* Policy List with Edit Buttons */}
  <Collapse>
    {activePolicies.map((policy, index) => (
      <Panel
        key={index}
        header={
          <Space>
            <Badge
              status={
                policy.priority === 'high' ? 'error' :
                policy.priority === 'medium' ? 'warning' : 'processing'
              }
            />
            <Text strong>{policy.category.toUpperCase()}</Text>
            <Text>{policy.rule}</Text>
          </Space>
        }
        extra={
          <Space>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEditPolicy(policy);
              }}
            >
              Edit
            </Button>
            <Popconfirm
              title="Delete this policy?"
              description="This will remove the policy from system prompts."
              onConfirm={(e) => {
                e.stopPropagation();
                handleDeletePolicy(policy);
              }}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
              >
                Delete
              </Button>
            </Popconfirm>
          </Space>
        }
      >
        <Descriptions column={2} size="small">
          <Item label="Priority">
            <Tag color={
              policy.priority === 'high' ? 'red' :
              policy.priority === 'medium' ? 'orange' : 'blue'
            }>
              {policy.priority.toUpperCase()}
            </Tag>
          </Item>
          <Item label="Evidence Count">
            <Badge count={policy.evidence_count} showZero />
          </Item>
          <Item label="Rule" span={2}>
            <Paragraph>{policy.rule}</Paragraph>
          </Item>
        </Descriptions>
      </Panel>
    ))}
  </Collapse>
</Card>
```

#### F. Edit Policy Modal
```tsx
<Modal
  title="Edit Policy"
  visible={editPolicyModalVisible}
  onOk={handleSavePolicy}
  onCancel={() => setEditPolicyModalVisible(false)}
  width={600}
>
  <Form form={policyForm} layout="vertical">
    <Form.Item
      label="Category"
      name="category"
    >
      <Input disabled />
    </Form.Item>

    <Form.Item
      label="Priority"
      name="priority"
      rules={[{ required: true }]}
    >
      <Select>
        <Option value="high">🔴 High Priority</Option>
        <Option value="medium">🟡 Medium Priority</Option>
        <Option value="low">🔵 Low Priority</Option>
      </Select>
    </Form.Item>

    <Form.Item
      label="Policy Rule"
      name="rule"
      rules={[{ required: true, min: 10 }]}
    >
      <TextArea
        rows={4}
        placeholder="Describe the improvement policy..."
      />
    </Form.Item>

    <Form.Item label="Evidence Count">
      <Badge count={selectedPolicy?.evidence_count || 0} showZero />
      <Text type="secondary" style={{ marginLeft: 8 }}>
        negative feedbacks
      </Text>
    </Form.Item>
  </Form>

  <Alert
    type="warning"
    message="Note"
    description="Editing will update the policy in memory. To persist changes permanently, create a custom policy instead."
    showIcon
  />
</Modal>
```

#### G. Create Custom Policy Modal
```tsx
<Modal
  title="Create Custom Policy"
  visible={createPolicyModalVisible}
  onOk={handleCreateCustomPolicy}
  onCancel={() => setCreatePolicyModalVisible(false)}
  width={700}
>
  <Form form={customPolicyForm} layout="vertical">
    <Form.Item
      label="Category"
      name="category"
      rules={[{ required: true }]}
    >
      <Select placeholder="Select category">
        <Option value="accuracy">🎯 Accuracy</Option>
        <Option value="clarity">💡 Clarity</Option>
        <Option value="completeness">📋 Completeness</Option>
        <Option value="performance">⚡ Performance</Option>
        <Option value="custom">🔧 Custom</Option>
      </Select>
    </Form.Item>

    <Form.Item
      label="Priority"
      name="priority"
      rules={[{ required: true }]}
      initialValue="medium"
    >
      <Radio.Group>
        <Radio.Button value="high">🔴 High</Radio.Button>
        <Radio.Button value="medium">🟡 Medium</Radio.Button>
        <Radio.Button value="low">🔵 Low</Radio.Button>
      </Radio.Group>
    </Form.Item>

    <Form.Item
      label="Policy Rule"
      name="rule"
      rules={[{ required: true, min: 20 }]}
      tooltip="Describe what the AI should or shouldn't do"
    >
      <TextArea
        rows={5}
        placeholder="Example: Always verify SQL results before answering. Cross-check with database schema."
      />
    </Form.Item>

    <Form.Item
      label="Rationale"
      name="rationale"
      rules={[{ required: true, min: 10 }]}
      tooltip="Explain why this policy is needed"
    >
      <TextArea
        rows={3}
        placeholder="Example: Users reported incorrect counts when querying systems. Need to ensure SQL is correct."
      />
    </Form.Item>
  </Form>

  <Alert
    type="info"
    message="Custom policies will be merged with auto-generated policies"
    description="They will be injected into system prompts immediately after creation."
    showIcon
  />
</Modal>
```

#### H. View Current Prompt Modal
```tsx
<Modal
  title="Current System Prompt with Active Policies"
  visible={viewPromptModalVisible}
  onCancel={() => setViewPromptModalVisible(false)}
  footer={null}
  width={900}
>
  <Tabs>
    <TabPane tab="Quick Mode" key="quick">
      <Alert
        type="success"
        message="Policies Injected"
        description={`${activePolicies.length} active policies are included in this prompt`}
        style={{ marginBottom: 16 }}
      />
      <pre style={{
        background: '#f5f5f5',
        padding: 16,
        borderRadius: 8,
        maxHeight: 500,
        overflow: 'auto'
      }}>
        {generatePromptPreview('quick', activePolicies)}
      </pre>
    </TabPane>

    <TabPane tab="Deep Mode" key="deep">
      <Alert
        type="success"
        message="Policies Injected"
        description={`${activePolicies.length} active policies are included in deep mode prompts`}
        style={{ marginBottom: 16 }}
      />
      <pre style={{
        background: '#f5f5f5',
        padding: 16,
        borderRadius: 8,
        maxHeight: 500,
        overflow: 'auto'
      }}>
        {generatePromptPreview('deep', activePolicies)}
      </pre>
    </TabPane>
  </Tabs>

  <Divider />

  <Space direction="vertical" style={{ width: '100%' }}>
    <Text strong>Policy Injection Details:</Text>
    <ul>
      <li>Quick Mode: Policies injected once before SQL generation</li>
      <li>Deep Mode Phase 1: Policies guide SQL and thinking process</li>
      <li>Deep Mode Enhancement: Policies ensure quality in final answer</li>
    </ul>
  </Space>
</Modal>
```

---

## 4. FEATURES & FUNCTIONALITY

### 4.1 Core Features
✅ **Statistics Dashboard**
- Real-time metrics: total, positive, negative, detailed feedback count
- Satisfaction rate calculation
- Breakdown by mode (quick vs deep)

✅ **Active Policies Display**
- Show HIGH priority policies prominently (Alert component)
- Show MEDIUM priority policies (collapsible)
- Display evidence count for each policy

✅ **Feedback List with Filters**
- Tab filters: All | Positive | Negative | With Details
- Sort by: Date (newest first), Rating, Mode
- Search: By user, query text
- Pagination: 20 items per page

✅ **Feedback Detail View**
- Modal popup with full information
- Copy-able question text
- Collapsible AI response (JSON)
- Timestamp with full date format

✅ **Data Refresh**
- Auto-refresh every 5 minutes
- Manual refresh button
- Loading states

### 4.2 ✨ NEW: Policy Management Features

✅ **Edit Policy**
- Click "Edit" button trên mỗi policy
- Open modal with form to edit:
  - Rule text (textarea)
  - Priority (select: high, medium, low)
  - Category (readonly - auto-generated)
  - Evidence count (readonly)
- Save → Update policy in memory
- Show success notification

✅ **Delete Policy**
- Click "Delete" button (danger button) trên mỗi policy
- Confirm dialog: "Are you sure? This will remove the policy from system prompts."
- Delete types:
  - Auto-generated policies: Remove from active list (won't be injected)
  - Custom policies: Delete from database permanently
- Show success notification
- Refresh policy list

✅ **Regenerate All Policies**
- Button "🔄 Regenerate Policies" ở đầu Active Policies section
- Confirm dialog: "Regenerate sẽ phân tích lại tất cả negative feedback. Continue?"
- Call backend API to regenerate
- Show progress indicator
- Reload policies after completion
- Show toast: "Policies regenerated successfully! X policies created."

✅ **Policy Injection Verification**
- Section "Policy Status" shows:
  - ✅ "Policies are currently being injected into AI prompts"
  - Injection points: Quick Mode, Deep Mode Phase 1, Deep Mode Enhancement
  - Last regeneration time
  - Number of active policies vs total policies
- Button "View Current Prompt" → Modal showing actual prompt with policies highlighted

✅ **Manual Policy Creation**
- Button "+ Create Policy"
- Form to manually create a policy:
  - Category (select)
  - Rule text (textarea)
  - Priority (select)
  - Rationale (textarea) - why this policy is needed
- Save → Add to active policies
- Persist to database (new model: CustomPolicy)

### 4.3 Permission & Access Control
```typescript
// Only show menu item for lanhdaobo
{user.role === 'lanhdaobo' && (
  <Menu.Item key="/ai-feedback" icon={<CommentOutlined />}>
    AI Feedback & Policies
  </Menu.Item>
)}

// Page level protection
useEffect(() => {
  if (user.role !== 'lanhdaobo') {
    navigate('/dashboard');
    message.error('Bạn không có quyền truy cập trang này');
  }
}, [user]);
```

---

## 5. TECHNICAL IMPLEMENTATION

### 5.1 Frontend Files to Create/Modify

**New Files:**
```
frontend/src/pages/AIFeedbackPolicies.tsx       # Main page
frontend/src/components/AIFeedback/
  ├── FeedbackStatistics.tsx                    # Stats cards
  ├── ActivePoliciesAlert.tsx                   # Policy alert
  ├── FeedbackTable.tsx                         # Table component
  └── FeedbackDetailModal.tsx                   # Detail modal
```

**Modify Files:**
```
frontend/src/App.tsx                            # Add route
frontend/src/components/Layout/Sidebar.tsx      # Add menu item
frontend/src/config/api.ts                      # Add API functions (đã có)
```

### 5.2 API Integration (Frontend)

Already exists in `/frontend/src/config/api.ts`:
```typescript
// GET /api/ai-feedback/stats/
export const getFeedbackStats = async (): Promise<FeedbackStats>

// GET /api/ai-feedback/active_policies/
export const getActivePolicies = async (): Promise<ImprovementPolicy[]>
```

Need to add:
```typescript
// GET /api/ai-feedback/
export const getAllFeedbacks = async (params?: {
  rating?: 'positive' | 'negative';
  has_text?: boolean;
  page?: number;
  page_size?: number;
}): Promise<{
  count: number;
  results: AIResponseFeedback[];
}>
```

### 5.3 Backend Changes Needed

**Modify**: `backend/apps/systems/views.py`
- Add pagination to `AIResponseFeedbackViewSet.list()`
- Add filtering: `rating`, `has_text`, `mode`
- Add ordering: `-created_at`

```python
class AIResponseFeedbackViewSet(viewsets.ModelViewSet):
    # ... existing code ...

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['rating', 'mode']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def with_text(self, request):
        """Get only feedbacks with detailed text"""
        queryset = self.get_queryset().exclude(
            feedback_text__isnull=True
        ).exclude(feedback_text='')

        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def regenerate_policies(self, request):
        """
        Regenerate all policies from negative feedback
        Returns: { policies: [...], count: X }
        """
        policies = AIResponseFeedback.generate_improvement_policies()

        # Mark all feedback as analyzed
        AIResponseFeedback.objects.filter(
            rating='negative'
        ).exclude(
            feedback_text__isnull=True
        ).exclude(
            feedback_text=''
        ).update(analyzed=True)

        return Response({
            'policies': policies,
            'count': len(policies),
            'timestamp': timezone.now()
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def policy_status(self, request):
        """
        Get policy injection status and statistics
        Returns info about where and how policies are being used
        """
        policies = AIResponseFeedback.generate_improvement_policies()
        active = [p for p in policies if p['priority'] in ['high', 'medium']]

        return Response({
            'total_policies': len(policies),
            'active_policies': len(active),
            'injection_points': [
                'Quick Mode Prompt',
                'Deep Mode Phase 1 Prompt',
                'Deep Mode Enhancement Prompt'
            ],
            'last_regeneration': AIResponseFeedback.objects.filter(
                analyzed=True
            ).order_by('-created_at').values_list('created_at', flat=True).first(),
            'policies_breakdown': {
                'high': len([p for p in policies if p['priority'] == 'high']),
                'medium': len([p for p in policies if p['priority'] == 'medium']),
                'low': len([p for p in policies if p['priority'] == 'low']),
            }
        })
```

**NEW Model**: `backend/apps/systems/models_feedback.py`
```python
class CustomPolicy(models.Model):
    """Manually created policies by admin"""

    CATEGORY_CHOICES = [
        ('accuracy', 'Accuracy'),
        ('clarity', 'Clarity'),
        ('completeness', 'Completeness'),
        ('performance', 'Performance'),
        ('custom', 'Custom'),
    ]

    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]

    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    rule = models.TextField(verbose_name='Policy Rule')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES)
    rationale = models.TextField(verbose_name='Rationale', help_text='Why this policy is needed')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'systems_custom_policy'
        verbose_name = 'Custom Policy'
        verbose_name_plural = 'Custom Policies'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.priority.upper()}] {self.category}: {self.rule[:50]}"
```

**NEW ViewSet**: `backend/apps/systems/views.py`
```python
class CustomPolicyViewSet(viewsets.ModelViewSet):
    """CRUD for custom policies"""
    queryset = CustomPolicy.objects.all()
    serializer_class = CustomPolicySerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
```

**NEW Endpoints**:
```
POST   /api/ai-feedback/regenerate_policies/   # Regenerate from feedback
GET    /api/ai-feedback/policy_status/         # Get injection status
GET    /api/custom-policies/                   # List custom policies
POST   /api/custom-policies/                   # Create custom policy
PATCH  /api/custom-policies/{id}/              # Update custom policy
DELETE /api/custom-policies/{id}/              # Delete custom policy
```

### 5.4 State Management
```typescript
interface AIFeedbackPageState {
  // Feedback data
  feedbacks: AIResponseFeedback[];
  stats: FeedbackStats;

  // Policy data
  activePolicies: ImprovementPolicy[];
  customPolicies: CustomPolicy[];
  policyStatus: {
    total_policies: number;
    active_policies: number;
    injection_points: string[];
    last_regeneration: string | null;
    policies_breakdown: {
      high: number;
      medium: number;
      low: number;
    };
  } | null;

  // UI state
  loading: boolean;
  regenerating: boolean;
  currentTab: 'all' | 'positive' | 'negative' | 'with_text';

  // Modals
  selectedFeedback: AIResponseFeedback | null;
  feedbackModalVisible: boolean;
  editPolicyModalVisible: boolean;
  selectedPolicy: ImprovementPolicy | null;
  createPolicyModalVisible: boolean;
  viewPromptModalVisible: boolean;

  // Pagination
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}
```

---

## 6. UI/UX CONSIDERATIONS

### Color Scheme
```
Positive: #52c41a (green)
Negative: #ff4d4f (red)
High Priority: #ff4d4f (red)
Medium Priority: #faad14 (yellow)
Low Priority: #1890ff (blue)
```

### Responsive Design
- Desktop: Full layout with all sections
- Tablet: Stack statistics cards 2x2
- Mobile: Single column, collapsible sections

### Loading States
- Skeleton for statistics cards
- Table skeleton during data fetch
- Refresh button with spinning icon

---

## 7. TESTING CHECKLIST

### Frontend Tests
- [ ] Page loads without errors for lanhdaobo
- [ ] Non-lanhdaobo users are redirected
- [ ] Statistics display correctly
- [ ] Active policies show with correct priorities
- [ ] Feedback table renders with data
- [ ] Tab filtering works (All, Positive, Negative, With Details)
- [ ] Pagination works correctly
- [ ] Detail modal opens and displays full data
- [ ] Auto-refresh works every 5 minutes
- [ ] Manual refresh button works

### Backend Tests
- [ ] `/api/ai-feedback/` returns paginated data
- [ ] Filtering by rating works
- [ ] Filtering by mode works
- [ ] Ordering by created_at works
- [ ] `/with_text/` endpoint returns only feedbacks with text
- [ ] Stats endpoint returns correct calculations
- [ ] Active policies endpoint returns correct policies

### Integration Tests
- [ ] Submit feedback from Strategic Dashboard → appears in Feedback page
- [ ] Negative feedback with text → generates policy → shows in Active Policies
- [ ] Multiple feedbacks of same type → policy evidence count increases

---

## 8. DEPLOYMENT PLAN

### Phase 1: Backend (5-10 minutes)
1. Add filtering and pagination to AIResponseFeedbackViewSet
2. Test API endpoints with Postman/curl
3. Commit and push to develop

### Phase 2: Frontend (30-45 minutes)
1. Create page component structure
2. Implement Statistics section
3. Implement Active Policies alert
4. Implement Feedback table with tabs
5. Implement Detail modal
6. Add route and menu item
7. Test all functionality

### Phase 3: Testing & Deployment (10-15 minutes)
1. Test on local
2. Commit and push to develop
3. Merge to main
4. Deploy to UAT server
5. Verify on UAT
6. Deploy to Production

---

## 9. EXAMPLE DATA (for Testing)

### Sample Feedbacks
```json
[
  {
    "user": "vu-buuchinh",
    "query": "Có bao nhiêu hệ thống đang hoạt động?",
    "mode": "quick",
    "rating": "positive",
    "feedback_text": null,
    "created_at": "2026-02-05T10:30:00Z"
  },
  {
    "user": "ptit",
    "query": "Hệ thống nào có số lượng user cao nhất?",
    "mode": "deep",
    "rating": "negative",
    "feedback_text": "Câu trả lời sai, kết quả không đúng với database",
    "created_at": "2026-02-05T11:45:00Z"
  }
]
```

### Sample Active Policies
```json
[
  {
    "category": "accuracy",
    "rule": "CRITICAL: Always verify SQL query results before generating answer",
    "priority": "high",
    "evidence_count": 5
  },
  {
    "category": "clarity",
    "rule": "Always structure responses clearly with bullet points",
    "priority": "medium",
    "evidence_count": 3
  }
]
```

---

## 10. SUCCESS CRITERIA

✅ **Functional - Feedback Viewing**
- lanhdaobo can view all user feedbacks
- Statistics display accurately
- Active policies are visible and clear
- Feedback detail modal shows complete information

✅ **Functional - Policy Management** ✨ NEW
- Can edit policy rule and priority
- Can regenerate all policies from feedback
- Can create custom policies manually
- Can view current system prompt with policies
- Policy injection status is visible
- Custom policies persist to database

✅ **Performance**
- Page loads in < 2 seconds
- Table pagination smooth (< 500ms per page)
- Auto-refresh doesn't interrupt user interaction
- Policy regeneration completes in < 3 seconds
- Edit/create policy saves in < 1 second

✅ **UX**
- Clear visual hierarchy
- Easy to distinguish positive/negative feedback
- Policy priorities are obvious (color coding)
- Responsive on all devices
- Edit/Create modals are intuitive
- Confirmation dialogs for destructive actions
- Toast notifications for all actions

✅ **Verification - Policy Injection** ✨ NEW
- Policies confirmed to be in Quick Mode prompt
- Policies confirmed to be in Deep Mode prompts
- View Prompt modal shows actual prompt with policies
- Policy status shows correct injection points

---

## 11. ✨ NEW FEATURES SUMMARY

### What's Been Added:
1. **Edit Policy** - Modify rule text and priority of any generated policy
2. **Regenerate Policies** - Re-analyze all negative feedback to generate fresh policies
3. **Create Custom Policy** - Manually create policies outside of feedback analysis
4. **View Current Prompt** - See actual system prompts with policies injected
5. **Policy Injection Status** - Dashboard showing where policies are being used
6. **Custom Policy Persistence** - Save custom policies to database (new model)

### New Backend:
- `POST /api/ai-feedback/regenerate_policies/` - Regenerate from feedback
- `GET /api/ai-feedback/policy_status/` - Get injection status
- `CustomPolicy` model with CRUD endpoints
- Policy merging logic (auto-generated + custom)

### New Frontend Components:
- `EditPolicyModal.tsx` - Edit existing policies
- `CreatePolicyModal.tsx` - Create custom policies
- `ViewPromptModal.tsx` - View system prompts with policies
- `PolicyStatusBanner.tsx` - Show injection status

---

## 12. FUTURE ENHANCEMENTS (Not in this phase)

- Export feedback to CSV/Excel
- Trend analysis charts (feedback over time)
- Policy effectiveness tracking
- Feedback response rate by organization
- Email notifications when negative feedback submitted
- AI-powered feedback categorization

---

**END OF SPEC**

Review spec này và cho tôi biết:
1. Có điều gì cần thay đổi không?
2. Có feature nào cần thêm/bớt không?
3. UI layout có ổn không?
4. Ready để implement chưa?
