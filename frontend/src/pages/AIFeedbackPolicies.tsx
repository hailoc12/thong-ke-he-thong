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
  Typography,
  Divider,
} from 'antd';
import {
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
  RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  getActivePolicies,
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
const { Text, Paragraph } = Typography;

const AIFeedbackPolicies: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Data state
  const [activePolicies, setActivePolicies] = useState<ImprovementPolicy[]>([]);
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
      title: 'Tạo lại Giải pháp?',
      content: 'Hệ thống sẽ phân tích các phản hồi tiêu cực và tự động tạo giải pháp mới để cải thiện A.I. Tiếp tục?',
      okText: 'Tạo lại',
      cancelText: 'Hủy',
      onOk: async () => {
        setRegenerating(true);
        try {
          const response = await regeneratePolicies();
          message.success(`✅ ${response.message || 'Đã tạo lại giải pháp thành công!'}`);
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
      message.success('✅ Đã tạo giải pháp thành công!');
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
      rationale: policy.rationale || '',
    });
    setEditPolicyModalVisible(true);
  };

  const handleUpdatePolicy = async () => {
    if (!selectedPolicy || !selectedPolicy.id || !selectedPolicy.is_custom) {
      message.warning('Chỉ có thể sửa giải pháp tùy chỉnh');
      return;
    }

    try {
      const values = await editForm.validateFields();
      await updateCustomPolicy(selectedPolicy.id, values);
      message.success('✅ Đã cập nhật giải pháp!');
      setEditPolicyModalVisible(false);
      setSelectedPolicy(null);
      await loadData();
    } catch (error: any) {
      if (error.errorFields) return;
      message.error('Lỗi: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeletePolicy = async (policy: ImprovementPolicy) => {
    if (!policy.id || !policy.is_custom) {
      message.warning('Chỉ có thể xóa giải pháp tùy chỉnh');
      return;
    }

    Modal.confirm({
      title: 'Xóa giải pháp?',
      content: `Bạn có chắc muốn xóa giải pháp này?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          if (!policy.id) {
            message.error('Lỗi: Policy ID không hợp lệ');
            return;
          }
          await deleteCustomPolicy(policy.id);
          message.success('✅ Đã xóa giải pháp!');
          await loadData();
        } catch (error: any) {
          message.error('Lỗi: ' + (error.response?.data?.detail || error.message));
        }
      },
    });
  };

  // Priority & Category labels
  const getPriorityTag = (priority: string) => {
    const config = {
      high: { color: 'red', label: 'Cao' },
      medium: { color: 'orange', label: 'Trung bình' },
      low: { color: 'blue', label: 'Thấp' },
    };
    const p = config[priority as keyof typeof config] || config.low;
    return <Tag color={p.color}>{p.label}</Tag>;
  };

  const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
      accuracy: 'Độ chính xác',
      clarity: 'Độ rõ ràng',
      completeness: 'Đầy đủ',
      performance: 'Hiệu suất',
      custom: 'Tùy chỉnh',
    };
    return map[category] || category;
  };

  // Render AI response steps from response_data
  const renderResponseSteps = (responseData: any) => {
    if (!responseData) {
      return <Text type="secondary">Không có dữ liệu phản hồi</Text>;
    }

    try {
      // response_data structure can vary, handle different formats
      const steps = responseData.steps || [];
      const answer = responseData.answer || responseData.final_answer || '';
      const queries = responseData.queries || [];

      return (
        <div style={{ marginTop: 12 }}>
          {/* Display steps if available */}
          {steps.length > 0 && (
            <>
              <Text strong style={{ fontSize: 13 }}>📋 Các bước xử lý:</Text>
              <List
                size="small"
                dataSource={steps}
                renderItem={(step: any, index: number) => (
                  <List.Item style={{ padding: '8px 0', border: 'none' }}>
                    <div style={{ width: '100%' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Bước {index + 1}: {step.action || step.type || 'N/A'}
                      </Text>
                      {step.detail && (
                        <div style={{
                          fontSize: 12,
                          color: '#666',
                          marginTop: 4,
                          paddingLeft: 12,
                          borderLeft: '2px solid #e8e8e8',
                        }}>
                          {step.detail}
                        </div>
                      )}
                      {step.result && (
                        <div style={{
                          fontSize: 12,
                          color: '#52c41a',
                          marginTop: 4,
                          paddingLeft: 12,
                        }}>
                          ✓ {step.result}
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
                style={{ marginTop: 8, marginBottom: 12 }}
              />
            </>
          )}

          {/* Display queries if available */}
          {queries.length > 0 && (
            <>
              <Text strong style={{ fontSize: 13 }}>🔍 Truy vấn SQL:</Text>
              {queries.map((query: any, index: number) => (
                <div
                  key={index}
                  style={{
                    marginTop: 8,
                    padding: '8px 12px',
                    background: '#f5f5f5',
                    borderRadius: 4,
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}
                >
                  {query.sql || query}
                </div>
              ))}
              <Divider style={{ margin: '12px 0' }} />
            </>
          )}

          {/* Display final answer */}
          {answer && (
            <>
              <Text strong style={{ fontSize: 13 }}>💡 Câu trả lời:</Text>
              <Paragraph
                style={{
                  marginTop: 8,
                  padding: '12px',
                  background: '#e6f7ff',
                  borderLeft: '3px solid #1890ff',
                  borderRadius: 4,
                  fontSize: 13,
                  marginBottom: 0,
                }}
              >
                {answer}
              </Paragraph>
            </>
          )}
        </div>
      );
    } catch (error) {
      console.error('Error rendering response steps:', error);
      return <Text type="secondary">Lỗi hiển thị dữ liệu phản hồi</Text>;
    }
  };

  return (
    <Spin spinning={loading}>
      <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
            🤖 Tinh chỉnh Trợ lý A.I
          </h1>
          <p style={{ color: '#666', marginTop: 8 }}>
            Cải thiện hoạt động của Trợ lý AI thông qua phân tích phản hồi
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
                  color: stats.positive_percentage >= 80 ? '#52c41a' :
                         stats.positive_percentage >= 50 ? '#faad14' : '#cf1322',
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
                title="Giải pháp đang áp dụng"
                value={activePolicies.length}
                prefix={<BulbOutlined />}
                valueStyle={{ color: '#1677ff', fontSize: 32 }}
              />
              <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                Đang hoạt động
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng phản hồi"
                value={stats.total}
                prefix={<MessageOutlined />}
                valueStyle={{ color: '#666', fontSize: 32 }}
              />
              <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                Tất cả đánh giá
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
                <Collapse
                  bordered={false}
                  expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 90 : 0} />}
                  style={{ background: 'transparent' }}
                >
                  {negativeFeedbacks.map((feedback, index) => (
                    <Panel
                      key={feedback.id || index}
                      header={
                        <div style={{ width: '100%' }}>
                          <div style={{ marginBottom: 4 }}>
                            <Tag color="red" icon={<DislikeOutlined />} style={{ marginRight: 8 }}>
                              Tiêu cực
                            </Tag>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {dayjs(feedback.created_at).format('DD/MM/YYYY HH:mm')}
                            </Text>
                          </div>
                          <Text strong style={{ fontSize: 14 }}>
                            {feedback.query || feedback.question || 'N/A'}
                          </Text>
                        </div>
                      }
                      style={{
                        marginBottom: 8,
                        background: '#fafafa',
                        borderRadius: 4,
                        border: '1px solid #f0f0f0',
                      }}
                    >
                      <div style={{ padding: '12px 0' }}>
                        {/* User feedback text */}
                        {feedback.feedback_text && (
                          <>
                            <Text strong style={{ fontSize: 13 }}>💬 Phản hồi của người dùng:</Text>
                            <div style={{
                              marginTop: 8,
                              padding: '12px',
                              background: '#fff7e6',
                              borderLeft: '3px solid #faad14',
                              borderRadius: 4,
                              fontSize: 13,
                              marginBottom: 16,
                            }}>
                              {feedback.feedback_text}
                            </div>
                          </>
                        )}

                        {/* AI Response details */}
                        {renderResponseSteps(feedback.response_data)}
                      </div>
                    </Panel>
                  ))}
                </Collapse>
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
                  bordered={false}
                  defaultActiveKey={[]}
                  style={{ background: 'transparent' }}
                >
                  {activePolicies.map((policy, index) => (
                    <Panel
                      key={policy.id || index}
                      header={
                        <div style={{ width: '100%' }}>
                          <Space size="small">
                            {getPriorityTag(policy.priority)}
                            <Tag>{getCategoryLabel(policy.category)}</Tag>
                            {policy.is_custom && <Tag color="blue">Tùy chỉnh</Tag>}
                          </Space>
                          <div style={{ marginTop: 4, fontSize: 13, fontWeight: 500 }}>
                            {policy.rule}
                          </div>
                        </div>
                      }
                      extra={
                        policy.is_custom ? (
                          <Space size="small" onClick={(e) => e.stopPropagation()}>
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleEditPolicy(policy)}
                            />
                            <Popconfirm
                              title="Xóa giải pháp này?"
                              onConfirm={() => handleDeletePolicy(policy)}
                              okText="Xóa"
                              cancelText="Hủy"
                            >
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                              />
                            </Popconfirm>
                          </Space>
                        ) : null
                      }
                      style={{
                        marginBottom: 8,
                        background: '#fafafa',
                        borderRadius: 4,
                        border: '1px solid #f0f0f0',
                      }}
                    >
                      {policy.rationale && (
                        <div style={{
                          padding: '12px',
                          background: '#f5f5f5',
                          borderRadius: 4,
                          fontSize: 13,
                          color: '#666',
                        }}>
                          <Text strong style={{ fontSize: 13 }}>📝 Lý do:</Text>
                          <div style={{ marginTop: 6 }}>{policy.rationale}</div>
                        </div>
                      )}
                      {policy.evidence_count > 0 && (
                        <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                          Dựa trên {policy.evidence_count} phản hồi
                        </div>
                      )}
                      {policy.examples && policy.examples.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <Text strong style={{ fontSize: 12 }}>Ví dụ:</Text>
                          <ul style={{ marginTop: 4, paddingLeft: 20, fontSize: 12 }}>
                            {policy.examples.map((ex, i) => (
                              <li key={i} style={{ color: '#666' }}>{ex}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Panel>
                  ))}
                </Collapse>
              )}
            </Card>
          </Col>
        </Row>
      </div>

      {/* Modal: Create Policy */}
      <Modal
        title="➕ Thêm Giải pháp Mới"
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
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select placeholder="Chọn danh mục">
              <Option value="accuracy">Độ chính xác</Option>
              <Option value="clarity">Độ rõ ràng</Option>
              <Option value="completeness">Đầy đủ</Option>
              <Option value="performance">Hiệu suất</Option>
              <Option value="custom">Tùy chỉnh</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Độ ưu tiên"
            rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên' }]}
          >
            <Select placeholder="Chọn độ ưu tiên">
              <Option value="high">Cao</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="low">Thấp</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="rule"
            label="Nội dung giải pháp"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <TextArea
              rows={4}
              placeholder="Mô tả giải pháp cải tiến..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="rationale"
            label="Lý do / Giải thích"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
          >
            <TextArea
              rows={3}
              placeholder="Tại sao cần áp dụng giải pháp này?"
              showCount
              maxLength={300}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Edit Policy */}
      <Modal
        title="✏️ Chỉnh sửa Giải pháp"
        open={editPolicyModalVisible}
        onOk={handleUpdatePolicy}
        onCancel={() => {
          setEditPolicyModalVisible(false);
          setSelectedPolicy(null);
        }}
        okText="Cập nhật"
        cancelText="Hủy"
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="accuracy">Độ chính xác</Option>
              <Option value="clarity">Độ rõ ràng</Option>
              <Option value="completeness">Đầy đủ</Option>
              <Option value="performance">Hiệu suất</Option>
              <Option value="custom">Tùy chỉnh</Option>
            </Select>
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

          <Form.Item
            name="rule"
            label="Nội dung giải pháp"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} showCount maxLength={500} />
          </Form.Item>

          <Form.Item
            name="rationale"
            label="Lý do / Giải thích"
            rules={[{ required: true }]}
          >
            <TextArea rows={3} showCount maxLength={300} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: View System Prompt */}
      <Modal
        title="👁️ System Prompt Hiện Tại"
        open={viewPromptModalVisible}
        onCancel={() => setViewPromptModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewPromptModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        <Alert
          message="Prompt này được inject vào mỗi câu hỏi của AI Assistant"
          type="info"
          showIcon
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
            fontSize: 13,
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
          }}
        >
          {activePolicies.length > 0 ? (
            <>
              <div style={{ fontWeight: 'bold', marginBottom: 12 }}>
                HƯỚNG DẪN CẢI THIỆN CHO A.I:
              </div>
              {activePolicies.map((policy, index) => (
                <div key={index} style={{ marginBottom: 12 }}>
                  {index + 1}. [{getCategoryLabel(policy.category)}] [{policy.priority.toUpperCase()}] {policy.rule}
                  {policy.rationale && (
                    <div style={{ color: '#666', marginLeft: 16, marginTop: 4 }}>
                      Lý do: {policy.rationale}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div style={{ color: '#999' }}>Chưa có giải pháp nào được áp dụng</div>
          )}
        </div>
      </Modal>
    </Spin>
  );
};

export default AIFeedbackPolicies;
