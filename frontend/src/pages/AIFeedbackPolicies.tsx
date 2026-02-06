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
  message,
  Collapse,
  Popconfirm,
  Spin,
  List,
  Empty,
  Divider,
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
  WarningOutlined,
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
  const [negativeFeedbacks, setNegativeFeedbacks] = useState<AIResponseFeedback[]>([]);
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
    if (user.role !== 'leader' && !user.is_staff) {
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
      setActivePolicies(response.active_policies || []);
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
      const response = await getAllFeedbacks({ rating: 'negative', page_size: 100 });
      setNegativeFeedbacks(response.results || []);

      // Load all for stats
      const allResponse = await getAllFeedbacks({ page_size: 1000 });
      const total = allResponse.count || 0;
      const positive = allResponse.results?.filter(f => f.rating === 'positive').length || 0;
      const negative = allResponse.results?.filter(f => f.rating === 'negative').length || 0;

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
      title: 'Tạo lại Policies?',
      content: 'Hệ thống sẽ phân tích các phản hồi tiêu cực và tự động tạo policies mới để cải thiện A.I. Tiếp tục?',
      okText: 'Tạo lại',
      cancelText: 'Hủy',
      onOk: async () => {
        setRegenerating(true);
        try {
          const response = await regeneratePolicies();
          message.success(`✅ ${response.message || 'Đã tạo lại policies thành công!'}`);
          await loadData();
        } catch (error: any) {
          message.error('Lỗi: ' + (error.response?.data?.detail || error.message));
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
      message.success('✅ Đã tạo policy thành công!');
      createForm.resetFields();
      setCreatePolicyModalVisible(false);
      await loadData();
    } catch (error: any) {
      if (error.errorFields) return;
      message.error('Lỗi: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEditPolicy = (policy: ImprovementPolicy) => {
    setSelectedPolicy(policy);
    editForm.setFieldsValue({
      category: policy.category,
      priority: policy.priority,
      rule: policy.rule,
    });
    setEditPolicyModalVisible(true);
  };

  const handleSaveEditPolicy = async () => {
    if (!selectedPolicy?.id || !selectedPolicy.is_custom) {
      message.warning('Chỉ có thể sửa custom policies');
      return;
    }

    try {
      const values = await editForm.validateFields();
      await updateCustomPolicy(selectedPolicy.id, values);
      message.success('✅ Đã cập nhật!');
      setEditPolicyModalVisible(false);
      await loadData();
    } catch (error: any) {
      if (error.errorFields) return;
      message.error('Lỗi: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeletePolicy = async (policy: ImprovementPolicy) => {
    if (!policy.id || !policy.is_custom) {
      message.warning('Chỉ có thể xóa custom policies');
      return;
    }

    try {
      await deleteCustomPolicy(policy.id);
      message.success('✅ Đã xóa!');
      await loadData();
    } catch (error: any) {
      message.error('Lỗi: ' + (error.response?.data?.detail || error.message));
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

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return priority;
    }
  };

  const getCategoryText = (category: string) => {
    const mapping: Record<string, string> = {
      'accuracy': 'Độ chính xác',
      'clarity': 'Độ rõ ràng',
      'completeness': 'Độ đầy đủ',
      'performance': 'Hiệu suất',
      'custom': 'Tùy chỉnh',
    };
    return mapping[category] || category;
  };

  if (loading && !policyStatus) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
          🤖 Tinh chỉnh Trợ lý A.I
        </h1>
        <p style={{ color: '#666', marginTop: 8 }}>
          Giám sát chất lượng và cải thiện hiệu suất AI Assistant
        </p>
      </div>

      {/* Key Metrics - Simple Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tỷ lệ hài lòng"
              value={stats.positive_percentage}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{
                color: stats.positive_percentage >= 80 ? '#3f8600' :
                       stats.positive_percentage >= 60 ? '#faad14' : '#cf1322',
                fontSize: 32,
              }}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
              {stats.positive} tích cực / {stats.negative} tiêu cực
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Vấn đề cần xử lý"
              value={negativeFeedbacks.length}
              prefix={<WarningOutlined />}
              valueStyle={{
                color: negativeFeedbacks.length > 10 ? '#cf1322' :
                       negativeFeedbacks.length > 5 ? '#faad14' : '#52c41a',
                fontSize: 32,
              }}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
              Phản hồi tiêu cực chưa xử lý
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Policies đang áp dụng"
              value={activePolicies.length}
              prefix={<BulbOutlined />}
              valueStyle={{ color: '#1677ff', fontSize: 32 }}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
              {policyStatus?.policies_breakdown.high || 0} ưu tiên cao
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng phản hồi"
              value={stats.total}
              prefix={<MessageOutlined />}
              valueStyle={{ fontSize: 32 }}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
              Từ người dùng hệ thống
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Content - 2 Columns */}
      <Row gutter={16}>
        {/* Left Column: Vấn đề cần xử lý */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: '#faad14' }} />
                <span style={{ fontWeight: 600 }}>Vấn đề cần xử lý ({negativeFeedbacks.length})</span>
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={<ReloadOutlined spin={regenerating} />}
                onClick={handleRegeneratePolicies}
                loading={regenerating}
                size="small"
              >
                Tự động tạo giải pháp
              </Button>
            }
            style={{ marginBottom: 16, height: 'calc(100vh - 380px)', overflow: 'hidden' }}
            bodyStyle={{ padding: 0, height: 'calc(100% - 57px)', overflow: 'auto' }}
          >
            {negativeFeedbacks.length === 0 ? (
              <Empty
                description="Không có vấn đề nào cần xử lý"
                style={{ padding: '40px 0' }}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                dataSource={negativeFeedbacks}
                renderItem={(feedback) => (
                  <List.Item
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid #f0f0f0',
                      background: '#fafafa',
                    }}
                  >
                    <div style={{ width: '100%' }}>
                      <div style={{ marginBottom: 8 }}>
                        <Tag color="red" icon={<DislikeOutlined />}>Tiêu cực</Tag>
                        <span style={{ fontSize: 12, color: '#999' }}>
                          {dayjs(feedback.created_at).format('DD/MM HH:mm')}
                        </span>
                      </div>
                      <div style={{
                        fontWeight: 500,
                        marginBottom: 4,
                        color: '#333',
                      }}>
                        {feedback.query || 'N/A'}
                      </div>
                      {feedback.feedback_text && (
                        <div style={{
                          fontSize: 13,
                          color: '#666',
                          padding: '8px 12px',
                          background: '#fff',
                          borderLeft: '3px solid #faad14',
                          borderRadius: 4,
                          marginTop: 8,
                        }}>
                          💬 {feedback.feedback_text}
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* Right Column: Giải pháp đang áp dụng */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BulbOutlined style={{ color: '#52c41a' }} />
                <span style={{ fontWeight: 600 }}>Giải pháp đang áp dụng ({activePolicies.length})</span>
              </Space>
            }
            extra={
              <Space size="small">
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => setViewPromptModalVisible(true)}
                  size="small"
                >
                  Xem Prompt
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreatePolicyModalVisible(true)}
                  size="small"
                >
                  Thêm mới
                </Button>
              </Space>
            }
            style={{ marginBottom: 16, height: 'calc(100vh - 380px)', overflow: 'hidden' }}
            bodyStyle={{ padding: 0, height: 'calc(100% - 57px)', overflow: 'auto' }}
          >
            {activePolicies.length === 0 ? (
              <Empty
                description="Chưa có giải pháp nào"
                style={{ padding: '40px 0' }}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Collapse
                accordion
                bordered={false}
                style={{ background: 'transparent' }}
              >
                {activePolicies.map((policy, idx) => (
                  <Panel
                    key={policy.id || idx}
                    header={
                      <Space>
                        <Tag color={getPriorityColor(policy.priority)}>
                          {getPriorityText(policy.priority)}
                        </Tag>
                        <Tag color="cyan">{getCategoryText(policy.category)}</Tag>
                        {policy.is_custom && <Tag color="purple">Custom</Tag>}
                        <span style={{ fontWeight: 500 }}>{policy.rule}</span>
                      </Space>
                    }
                    extra={
                      policy.is_custom && (
                        <Space onClick={(e) => e.stopPropagation()} size="small">
                          <Button
                            type="link"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditPolicy(policy)}
                          >
                            Sửa
                          </Button>
                          <Popconfirm
                            title="Xóa policy này?"
                            onConfirm={() => handleDeletePolicy(policy)}
                            okText="Xóa"
                            cancelText="Hủy"
                          >
                            <Button
                              type="link"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                            >
                              Xóa
                            </Button>
                          </Popconfirm>
                        </Space>
                      )
                    }
                  >
                    {policy.rationale && (
                      <div style={{ padding: '8px 0', color: '#666' }}>
                        <strong>Lý do:</strong> {policy.rationale}
                      </div>
                    )}
                    {policy.evidence_count > 0 && (
                      <div style={{ fontSize: 12, color: '#999' }}>
                        📊 Dựa trên {policy.evidence_count} phản hồi
                      </div>
                    )}
                  </Panel>
                ))}
              </Collapse>
            )}
          </Card>
        </Col>
      </Row>

      {/* Create Policy Modal - Simplified */}
      <Modal
        title="Thêm giải pháp mới"
        open={createPolicyModalVisible}
        onOk={handleCreatePolicy}
        onCancel={() => {
          setCreatePolicyModalVisible(false);
          createForm.resetFields();
        }}
        okText="Tạo"
        cancelText="Hủy"
        width={600}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="rule"
            label="Giải pháp / Quy tắc"
            rules={[{ required: true, message: 'Vui lòng nhập giải pháp' }]}
          >
            <TextArea rows={3} placeholder="Ví dụ: Khi hỏi về số lượng user, luôn map sang cột total_users" />
          </Form.Item>

          <Form.Item
            name="rationale"
            label="Lý do áp dụng"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
          >
            <TextArea rows={2} placeholder="Giải thích tại sao cần giải pháp này" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Độ ưu tiên"
                rules={[{ required: true }]}
                initialValue="medium"
              >
                <Select>
                  <Option value="high">Cao</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="low">Thấp</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Danh mục"
                rules={[{ required: true }]}
                initialValue="accuracy"
              >
                <Select>
                  <Option value="accuracy">Độ chính xác</Option>
                  <Option value="clarity">Độ rõ ràng</Option>
                  <Option value="completeness">Độ đầy đủ</Option>
                  <Option value="custom">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Edit Policy Modal - Simplified */}
      <Modal
        title="Sửa giải pháp"
        open={editPolicyModalVisible}
        onOk={handleSaveEditPolicy}
        onCancel={() => {
          setEditPolicyModalVisible(false);
          editForm.resetFields();
        }}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="rule"
            label="Giải pháp / Quy tắc"
            rules={[{ required: true }]}
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Độ ưu tiên"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="high">Cao</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="low">Thấp</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Prompt Modal */}
      <Modal
        title="System Prompt - Đang áp dụng cho A.I"
        open={viewPromptModalVisible}
        onCancel={() => setViewPromptModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setViewPromptModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        <Alert
          message="Đây là những hướng dẫn đang được tích hợp vào A.I Assistant"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <div style={{ maxHeight: '60vh', overflow: 'auto', background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: 13 }}>
            {`HƯỚNG DẪN CẢI TIẾN:

${activePolicies.map((p, idx) => `${idx + 1}. [${getCategoryText(p.category)}] [Ưu tiên ${getPriorityText(p.priority)}]
   ${p.rule}
   ${p.rationale ? `→ Lý do: ${p.rationale}` : ''}`).join('\n\n')}

---
Tuân thủ các hướng dẫn trên khi trả lời câu hỏi.`}
          </pre>
        </div>
      </Modal>
    </div>
  );
};

export default AIFeedbackPolicies;
