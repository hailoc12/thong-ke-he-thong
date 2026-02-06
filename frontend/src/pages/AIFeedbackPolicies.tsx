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
  Table,
  Tabs,
  Empty,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
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
  SearchOutlined,
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
const { TabPane } = Tabs;

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
  const [feedbackDetailModalVisible, setFeedbackDetailModalVisible] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<ImprovementPolicy | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<AIResponseFeedback | null>(null);

  // Forms
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Feedback filters
  const [feedbackRatingFilter, setFeedbackRatingFilter] = useState<string>('all');

  // Check permissions
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    // Allow if user is leader (role='leader') OR is_staff
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
      const response = await getAllFeedbacks({ page_size: 1000 });
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
      title: 'Tạo lại Policies?',
      content: 'Hệ thống sẽ phân tích lại tất cả feedback tiêu cực và tạo policies mới. Tiếp tục?',
      okText: 'Có, tạo lại',
      cancelText: 'Hủy',
      onOk: async () => {
        setRegenerating(true);
        try {
          const response = await regeneratePolicies();
          message.success(`✅ ${response.message || 'Đã tạo lại policies thành công!'}`);
          await loadData();
        } catch (error: any) {
          message.error('Lỗi tạo lại policies: ' + (error.response?.data?.detail || error.message));
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
      message.error('Lỗi tạo policy: ' + (error.response?.data?.detail || error.message));
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
      message.success('✅ Đã cập nhật policy thành công!');
      setEditPolicyModalVisible(false);
      await loadData();
    } catch (error: any) {
      if (error.errorFields) return;
      message.error('Lỗi cập nhật: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeletePolicy = async (policy: ImprovementPolicy) => {
    if (!policy.id || !policy.is_custom) {
      message.warning('Chỉ có thể xóa custom policies');
      return;
    }

    try {
      await deleteCustomPolicy(policy.id);
      message.success('✅ Đã xóa policy thành công!');
      await loadData();
    } catch (error: any) {
      message.error('Lỗi xóa: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleViewFeedbackDetail = (feedback: AIResponseFeedback) => {
    setSelectedFeedback(feedback);
    setFeedbackDetailModalVisible(true);
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

  // Feedback table columns
  const feedbackColumns: ColumnsType<AIResponseFeedback> = [
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Câu hỏi',
      dataIndex: 'question',
      key: 'question',
      ellipsis: true,
      render: (text: string) => (
        <div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {text}
        </div>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 120,
      filters: [
        { text: 'Tích cực', value: 'positive' },
        { text: 'Tiêu cực', value: 'negative' },
      ],
      onFilter: (value, record) => record.rating === value,
      render: (rating: string) => (
        <Tag color={rating === 'positive' ? 'green' : 'red'} icon={rating === 'positive' ? <LikeOutlined /> : <DislikeOutlined />}>
          {rating === 'positive' ? 'Tích cực' : 'Tiêu cực'}
        </Tag>
      ),
    },
    {
      title: 'Feedback',
      dataIndex: 'feedback_text',
      key: 'feedback_text',
      ellipsis: true,
      render: (text: string) => text || <span style={{ color: '#999' }}>Không có</span>,
    },
    {
      title: 'User',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 100,
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      render: (_: any, record: AIResponseFeedback) => (
        <Button
          type="link"
          icon={<SearchOutlined />}
          onClick={() => handleViewFeedbackDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  // Filter feedbacks based on rating filter
  const filteredFeedbacks = feedbackRatingFilter === 'all'
    ? _feedbacks
    : _feedbacks.filter(f => f.rating === feedbackRatingFilter);

  if (loading && !policyStatus) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
          📊 Quản lý AI Feedback & Policies
        </h1>
        <p style={{ color: '#666', marginTop: 8 }}>
          Theo dõi chất lượng AI Assistant thông qua phản hồi người dùng và quản lý các chính sách cải tiến
        </p>
      </div>

      <Tabs defaultActiveKey="1">
        {/* Tab 1: Statistics & Policies */}
        <TabPane tab="📈 Thống kê & Policies" key="1">
          {/* Statistics Cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Phản hồi tích cực"
                  value={stats.positive}
                  prefix={<LikeOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Phản hồi tiêu cực"
                  value={stats.negative}
                  prefix={<DislikeOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng số phản hồi"
                  value={stats.total}
                  prefix={<MessageOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tỷ lệ hài lòng"
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
              message="Trạng thái Policy Injection"
              description={
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>✅ Policies đang được tích hợp vào AI prompts</div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    <strong>Điểm tích hợp:</strong>{' '}
                    {policyStatus.injection_points.map((point, idx) => (
                      <Tag key={idx} color="blue" style={{ marginTop: 4 }}>
                        {point}
                      </Tag>
                    ))}
                  </div>
                  {policyStatus.last_regeneration && (
                    <div style={{ fontSize: 12, color: '#666' }}>
                      Tạo lại gần nhất: {dayjs(policyStatus.last_regeneration).fromNow()}
                    </div>
                  )}
                  <div style={{ fontSize: 12 }}>
                    <Tag color="red">Cao: {policyStatus.policies_breakdown.high}</Tag>
                    <Tag color="orange">Trung bình: {policyStatus.policies_breakdown.medium}</Tag>
                    <Tag color="blue">Thấp: {policyStatus.policies_breakdown.low}</Tag>
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
                <span style={{ fontWeight: 600 }}>Các Policy Đang Hoạt Động</span>
                <Tag color="blue">{activePolicies.length} Active</Tag>
              </Space>
            }
            extra={
              <Space>
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => setViewPromptModalVisible(true)}
                >
                  Xem Prompt Hiện Tại
                </Button>
                <Button
                  type="primary"
                  icon={<ReloadOutlined spin={regenerating} />}
                  onClick={handleRegeneratePolicies}
                  loading={regenerating}
                >
                  Tạo Lại Policies
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreatePolicyModalVisible(true)}
                >
                  Tạo Policy Mới
                </Button>
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            {activePolicies.length === 0 ? (
              <Empty description="Chưa có policy nào. Tạo mới hoặc tạo lại từ feedback." />
            ) : (
              <Collapse accordion>
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
                        <Space onClick={(e) => e.stopPropagation()}>
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
                            description="Bạn có chắc chắn muốn xóa policy này?"
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
                    <div style={{ padding: '8px 0' }}>
                      <p><strong>Lý do:</strong> {policy.rationale}</p>
                      {policy.evidence_count > 0 && (
                        <p style={{ color: '#666', fontSize: 12 }}>
                          📊 Dựa trên {policy.evidence_count} feedback
                        </p>
                      )}
                    </div>
                  </Panel>
                ))}
              </Collapse>
            )}
          </Card>
        </TabPane>

        {/* Tab 2: Feedback List */}
        <TabPane tab={`💬 Danh sách Feedback (${_feedbacks.length})`} key="2">
          <Card
            title={
              <Space>
                <MessageOutlined />
                <span>Danh sách phản hồi từ người dùng</span>
              </Space>
            }
            extra={
              <Select
                value={feedbackRatingFilter}
                onChange={setFeedbackRatingFilter}
                style={{ width: 150 }}
              >
                <Option value="all">Tất cả</Option>
                <Option value="positive">Tích cực</Option>
                <Option value="negative">Tiêu cực</Option>
              </Select>
            }
          >
            <Table
              columns={feedbackColumns}
              dataSource={filteredFeedbacks}
              rowKey={(record) => record.id || record.created_at}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} feedback`,
              }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Create Policy Modal */}
      <Modal
        title="Tạo Policy Mới"
        open={createPolicyModalVisible}
        onOk={handleCreatePolicy}
        onCancel={() => {
          setCreatePolicyModalVisible(false);
          createForm.resetFields();
        }}
        okText="Tạo Policy"
        cancelText="Hủy"
        width={600}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select>
              <Option value="accuracy">Độ chính xác</Option>
              <Option value="clarity">Độ rõ ràng</Option>
              <Option value="completeness">Độ đầy đủ</Option>
              <Option value="performance">Hiệu suất</Option>
              <Option value="custom">Tùy chỉnh</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="rule"
            label="Quy tắc Policy"
            rules={[{ required: true, message: 'Vui lòng nhập quy tắc' }]}
          >
            <TextArea rows={3} placeholder="Ví dụ: Luôn kiểm tra kết quả SQL trước khi trả lời" />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Độ ưu tiên"
            rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên' }]}
            initialValue="medium"
          >
            <Select>
              <Option value="high">Cao</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="low">Thấp</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="rationale"
            label="Lý do"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
          >
            <TextArea rows={2} placeholder="Lý do tạo policy này" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Policy Modal */}
      <Modal
        title="Sửa Policy"
        open={editPolicyModalVisible}
        onOk={handleSaveEditPolicy}
        onCancel={() => {
          setEditPolicyModalVisible(false);
          editForm.resetFields();
        }}
        okText="Cập nhật"
        cancelText="Hủy"
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="category" label="Danh mục">
            <Select disabled>
              <Option value="accuracy">Độ chính xác</Option>
              <Option value="clarity">Độ rõ ràng</Option>
              <Option value="completeness">Độ đầy đủ</Option>
              <Option value="performance">Hiệu suất</Option>
              <Option value="custom">Tùy chỉnh</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="rule"
            label="Quy tắc Policy"
            rules={[{ required: true, message: 'Vui lòng nhập quy tắc' }]}
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Độ ưu tiên"
            rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên' }]}
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
        title="System Prompt Hiện Tại"
        open={viewPromptModalVisible}
        onCancel={() => setViewPromptModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setViewPromptModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        <div style={{ maxHeight: '60vh', overflow: 'auto', background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
            {`Bạn là AI Assistant hỗ trợ tra cứu thông tin về hệ thống.

IMPROVEMENT GUIDELINES:
${activePolicies.map((p, idx) => `${idx + 1}. [${getCategoryText(p.category)}] [${getPriorityText(p.priority)}] ${p.rule}
   Lý do: ${p.rationale}`).join('\n\n')}

Hãy tuân thủ các guidelines trên khi trả lời câu hỏi.`}
          </pre>
        </div>
      </Modal>

      {/* Feedback Detail Modal */}
      <Modal
        title="Chi tiết Feedback"
        open={feedbackDetailModalVisible}
        onCancel={() => setFeedbackDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setFeedbackDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedFeedback && (
          <div>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Tag color={selectedFeedback.rating === 'positive' ? 'green' : 'red'}>
                  {selectedFeedback.rating === 'positive' ? 'Tích cực' : 'Tiêu cực'}
                </Tag>
                <span style={{ color: '#666', marginLeft: 8 }}>
                  {dayjs(selectedFeedback.created_at).format('DD/MM/YYYY HH:mm:ss')}
                </span>
              </div>

              <div>
                <h4>Câu hỏi:</h4>
                <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                  {selectedFeedback.question}
                </div>
              </div>

              <div>
                <h4>Câu trả lời:</h4>
                <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: 300, overflow: 'auto' }}>
                  {selectedFeedback.answer}
                </div>
              </div>

              {selectedFeedback.feedback_text && (
                <div>
                  <h4>Feedback từ user:</h4>
                  <div style={{ background: '#fff7e6', padding: 12, borderRadius: 4, border: '1px solid #ffd591' }}>
                    {selectedFeedback.feedback_text}
                  </div>
                </div>
              )}

              <div>
                <h4>Thông tin thêm:</h4>
                <div style={{ fontSize: 12, color: '#666' }}>
                  <div>User ID: {selectedFeedback.user_id}</div>
                  <div>Mode: {selectedFeedback.mode}</div>
                  {selectedFeedback.conversation_context && (
                    <div>Context: Có {JSON.parse(selectedFeedback.conversation_context).length} messages</div>
                  )}
                </div>
              </div>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AIFeedbackPolicies;
