import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Alert,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Radio,
  message,
  Collapse,
  Descriptions,
  Popconfirm,
  Spin,
} from 'antd';
import {
  LikeOutlined,
  DislikeOutlined,
  MessageOutlined,
  RiseOutlined,
  BulbOutlined,
  ReloadOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  getActivePolicies,
  getPolicyStatus,
  getAllFeedbacks,
  regeneratePolicies,
  createCustomPolicy,
  updateCustomPolicy,
  deleteCustomPolicy,
  type ImprovementPolicy,
  type AIResponseFeedback,
} from '../config/api';

dayjs.extend(relativeTime);

const { TextArea } = Input;
const { Panel } = Collapse;
const { Option } = Select;
const { Item } = Descriptions;

interface PolicyStatus {
  total_policies: number;
  auto_generated: number;
  custom: number;
  active_policies: number;
  injection_points: string[];
  last_regeneration: string | null;
  policies_breakdown: {
    high: number;
    medium: number;
    low: number;
  };
  status: string;
  message: string;
}

const AIFeedbackPolicies: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Data state
  const [activePolicies, setActivePolicies] = useState<ImprovementPolicy[]>([]);
  const [policyStatus, setPolicyStatus] = useState<PolicyStatus | null>(null);
  const [_feedbacks, setFeedbacks] = useState<AIResponseFeedback[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    positive: 0,
    negative: 0,
    positive_percentage: 0,
  });

  // Modal state
  const [createPolicyModalVisible, setCreatePolicyModalVisible] = useState(false);
  const [editPolicyModalVisible, setEditPolicyModalVisible] = useState(false);
  const [viewPromptModalVisible, setViewPromptModalVisible] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<ImprovementPolicy | null>(null);

  // Forms
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Check permissions
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.role !== 'lanhdaobo' && !user.is_staff) {
      message.error('Bạn không có quyền truy cập trang này');
      navigate('/dashboard');
    } else {
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadActivePolicies(),
        loadPolicyStatus(),
        loadFeedbacks(),
      ]);
    } catch (error: any) {
      message.error('Lỗi tải dữ liệu: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadActivePolicies = async () => {
    try {
      const response = await getActivePolicies();
      setActivePolicies(response.policies || []);
    } catch (error) {
      console.error('Load active policies error:', error);
    }
  };

  const loadPolicyStatus = async () => {
    try {
      const response = await getPolicyStatus();
      setPolicyStatus(response);
    } catch (error) {
      console.error('Load policy status error:', error);
    }
  };

  const loadFeedbacks = async () => {
    try {
      const response = await getAllFeedbacks({ page_size: 100 });
      setFeedbacks(response.results || []);

      // Calculate stats
      const total = response.count || 0;
      const positive = response.results?.filter(f => f.rating === 'positive').length || 0;
      const negative = response.results?.filter(f => f.rating === 'negative').length || 0;

      setStats({
        total,
        positive,
        negative,
        positive_percentage: total > 0 ? Math.round((positive / total) * 100) : 0,
      });
    } catch (error) {
      console.error('Load feedbacks error:', error);
    }
  };

  const handleRegeneratePolicies = async () => {
    Modal.confirm({
      title: 'Regenerate Policies?',
      content: 'This will re-analyze all negative feedback and generate new policies. Continue?',
      okText: 'Yes, Regenerate',
      cancelText: 'Cancel',
      onOk: async () => {
        setRegenerating(true);
        try {
          const response = await regeneratePolicies();
          message.success(`✅ ${response.message || 'Policies regenerated successfully!'}`);
          await loadData(); // Reload all data
        } catch (error: any) {
          message.error('Lỗi regenerate: ' + (error.response?.data?.detail || error.message));
        } finally {
          setRegenerating(false);
        }
      },
    });
  };

  const handleCreatePolicy = async () => {
    try {
      const values = await createForm.validateFields();
      await createCustomPolicy(values);
      message.success('✅ Policy created successfully!');
      createForm.resetFields();
      setCreatePolicyModalVisible(false);
      await loadData();
    } catch (error: any) {
      if (error.errorFields) return; // Form validation error
      message.error('Lỗi tạo policy: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEditPolicy = (policy: ImprovementPolicy) => {
    setSelectedPolicy(policy);
    editForm.setFieldsValue({
      category: policy.category,
      priority: policy.priority,
      rule: policy.rule,
      evidence_count: policy.evidence_count,
    });
    setEditPolicyModalVisible(true);
  };

  const handleSaveEditPolicy = async () => {
    if (!selectedPolicy?.id || !selectedPolicy.is_custom) {
      message.warning('Can only edit custom policies');
      return;
    }

    try {
      const values = await editForm.validateFields();
      await updateCustomPolicy(selectedPolicy.id, values);
      message.success('✅ Policy updated successfully!');
      setEditPolicyModalVisible(false);
      await loadData();
    } catch (error: any) {
      if (error.errorFields) return;
      message.error('Lỗi update: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeletePolicy = async (policy: ImprovementPolicy) => {
    if (!policy.id || !policy.is_custom) {
      message.warning('Can only delete custom policies');
      return;
    }

    try {
      await deleteCustomPolicy(policy.id);
      message.success('✅ Policy deleted successfully!');
      await loadData();
    } catch (error: any) {
      message.error('Lỗi xóa: ' + (error.response?.data?.detail || error.message));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'blue';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🔵';
      default: return '⚪';
    }
  };

  if (loading && !policyStatus) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
          📊 AI Feedback & Policy Management
        </h1>
        <p style={{ color: '#666', marginTop: 8 }}>
          Theo dõi chất lượng AI Assistant thông qua user feedback và quản lý improvement policies
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Positive Feedback"
              value={stats.positive}
              prefix={<LikeOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Negative Feedback"
              value={stats.negative}
              prefix={<DislikeOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Feedbacks"
              value={stats.total}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Satisfaction Rate"
              value={stats.positive_percentage}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: stats.positive_percentage >= 80 ? '#3f8600' : '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Policy Injection Status Banner */}
      {policyStatus && (
        <Alert
          type="info"
          showIcon
          message="Policy Injection Status"
          description={
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>✅ Policies are actively being injected into AI prompts</div>
              <div style={{ fontSize: 12, color: '#666' }}>
                <strong>Injection points:</strong>{' '}
                {policyStatus.injection_points.map((point, idx) => (
                  <Tag key={idx} color="blue" style={{ marginTop: 4 }}>
                    {point}
                  </Tag>
                ))}
              </div>
              {policyStatus.last_regeneration && (
                <div style={{ fontSize: 12, color: '#666' }}>
                  Last regeneration: {dayjs(policyStatus.last_regeneration).fromNow()}
                </div>
              )}
              <div style={{ fontSize: 12 }}>
                <Tag color="red">High: {policyStatus.policies_breakdown.high}</Tag>
                <Tag color="orange">Medium: {policyStatus.policies_breakdown.medium}</Tag>
                <Tag color="blue">Low: {policyStatus.policies_breakdown.low}</Tag>
              </div>
            </Space>
          }
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Active Policies Card */}
      <Card
        title={
          <Space>
            <BulbOutlined />
            <span style={{ fontWeight: 600 }}>Active Improvement Policies</span>
            <Tag color="blue">{activePolicies.length} Active</Tag>
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<EyeOutlined />}
              onClick={() => setViewPromptModalVisible(true)}
            >
              View Current Prompt
            </Button>
            <Button
              type="primary"
              icon={<ReloadOutlined spin={regenerating} />}
              onClick={handleRegeneratePolicies}
              loading={regenerating}
            >
              Regenerate Policies
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreatePolicyModalVisible(true)}
            >
              Create Policy
            </Button>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        {activePolicies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            No active policies yet. Create one or regenerate from feedback.
          </div>
        ) : (
          <Collapse>
            {activePolicies.map((policy, index) => (
              <Panel
                key={index}
                header={
                  <Space>
                    <span style={{ fontSize: 16 }}>{getPriorityIcon(policy.priority)}</span>
                    <Tag color={getPriorityColor(policy.priority)}>
                      {policy.priority.toUpperCase()}
                    </Tag>
                    <strong>{policy.category.toUpperCase()}</strong>
                    <span>{policy.rule}</span>
                    {policy.is_custom && <Tag color="purple">Custom</Tag>}
                  </Space>
                }
                extra={
                  <Space onClick={(e) => e.stopPropagation()}>
                    {policy.is_custom && policy.id && (
                      <>
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEditPolicy(policy)}
                        >
                          Edit
                        </Button>
                        <Popconfirm
                          title="Delete this policy?"
                          description="This will remove the policy from system prompts."
                          onConfirm={() => handleDeletePolicy(policy)}
                          okText="Yes, Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                        >
                          <Button size="small" danger icon={<DeleteOutlined />}>
                            Delete
                          </Button>
                        </Popconfirm>
                      </>
                    )}
                  </Space>
                }
              >
                <Descriptions column={2} size="small">
                  <Item label="Priority">
                    <Tag color={getPriorityColor(policy.priority)}>
                      {policy.priority.toUpperCase()}
                    </Tag>
                  </Item>
                  <Item label="Evidence Count">
                    <Tag>{policy.evidence_count} feedbacks</Tag>
                  </Item>
                  <Item label="Category">{policy.category}</Item>
                  <Item label="Type">
                    {policy.is_custom ? (
                      <Tag color="purple">Custom Policy</Tag>
                    ) : (
                      <Tag color="green">Auto-generated</Tag>
                    )}
                  </Item>
                  <Item label="Rule" span={2}>
                    {policy.rule}
                  </Item>
                </Descriptions>
              </Panel>
            ))}
          </Collapse>
        )}
      </Card>

      {/* Create Policy Modal */}
      <Modal
        title="Create Custom Policy"
        open={createPolicyModalVisible}
        onOk={handleCreatePolicy}
        onCancel={() => {
          setCreatePolicyModalVisible(false);
          createForm.resetFields();
        }}
        width={700}
        okText="Create"
        cancelText="Cancel"
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: 'Please select category' }]}
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
            rules={[
              { required: true, message: 'Please enter policy rule' },
              { min: 20, message: 'Rule must be at least 20 characters' },
            ]}
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
            rules={[
              { required: true, message: 'Please explain why this policy is needed' },
              { min: 10, message: 'Rationale must be at least 10 characters' },
            ]}
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
          style={{ marginTop: 16 }}
        />
      </Modal>

      {/* Edit Policy Modal */}
      <Modal
        title="Edit Custom Policy"
        open={editPolicyModalVisible}
        onOk={handleSaveEditPolicy}
        onCancel={() => setEditPolicyModalVisible(false)}
        width={600}
        okText="Save"
        cancelText="Cancel"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="Category" name="category">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Priority" name="priority" rules={[{ required: true }]}>
            <Select>
              <Option value="high">🔴 High Priority</Option>
              <Option value="medium">🟡 Medium Priority</Option>
              <Option value="low">🔵 Low Priority</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Policy Rule"
            name="rule"
            rules={[
              { required: true },
              { min: 10, message: 'Rule must be at least 10 characters' },
            ]}
          >
            <TextArea rows={4} placeholder="Describe the improvement policy..." />
          </Form.Item>

          <Form.Item label="Evidence Count" name="evidence_count">
            <Input disabled suffix="negative feedbacks" />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Prompt Modal */}
      <Modal
        title="Current System Prompt with Active Policies"
        open={viewPromptModalVisible}
        onCancel={() => setViewPromptModalVisible(false)}
        footer={null}
        width={900}
      >
        <Alert
          type="success"
          message="Policies Injected"
          description={`${activePolicies.length} active policies are included in AI prompts`}
          style={{ marginBottom: 16 }}
        />

        <div
          style={{
            background: '#f5f5f5',
            padding: 16,
            borderRadius: 8,
            maxHeight: 500,
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: 12,
            whiteSpace: 'pre-wrap',
          }}
        >
          {`=== IMPROVEMENT POLICIES (Based on User Feedback) ===
Những chính sách này được tạo ra từ feedback của người dùng để cải thiện chất lượng câu trả lời:

${activePolicies
  .map(
    (p, i) =>
      `${i + 1}. ${getPriorityIcon(p.priority)} [${p.priority.toUpperCase()}] ${p.category.toUpperCase()}:
   ${p.rule}
   Evidence: ${p.evidence_count} feedbacks${p.is_custom ? ' (Custom Policy)' : ''}`
  )
  .join('\n\n')}

=== END POLICIES ===`}
        </div>

        <div style={{ marginTop: 16 }}>
          <strong>Policy Injection Details:</strong>
          <ul style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
            <li>Quick Mode: Policies injected once before SQL generation</li>
            <li>Deep Mode Phase 1: Policies guide SQL and thinking process</li>
            <li>Deep Mode Enhancement: Policies ensure quality in final answer</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default AIFeedbackPolicies;
