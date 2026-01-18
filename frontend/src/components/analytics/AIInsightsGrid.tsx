import React from 'react';
import { Card, Row, Col, Typography, Tag, Space, Progress, Alert } from 'antd';
import {
  WarningOutlined,
  CheckCircleOutlined,
  BulbOutlined,
  ExclamationCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { mockAIInsights } from '../../mocks';

const { Title, Text, Paragraph } = Typography;

/**
 * AI Insights Grid - Display AI-generated insights about system landscape
 */
const AIInsightsGrid: React.FC = () => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk': return <ExclamationCircleOutlined />;
      case 'opportunity': return <ThunderboltOutlined />;
      case 'warning': return <WarningOutlined />;
      case 'recommendation': return <BulbOutlined />;
      default: return <CheckCircleOutlined />;
    }
  };

  const getInsightColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'gold';
      case 'low': return 'blue';
      default: return 'default';
    }
  };

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'risk': return 'error';
      case 'opportunity': return 'success';
      case 'warning': return 'warning';
      case 'recommendation': return 'processing';
      default: return 'default';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginBottom: 8 }}>
          Thông tin chi tiết từ AI
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Phân tích tự động từ AI engine dựa trên dữ liệu hệ thống
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        {mockAIInsights.map((insight) => (
          <Col xs={24} sm={12} lg={8} key={insight.id}>
            <Card
              size="small"
              hoverable
              style={{
                height: '100%',
                borderLeft: `4px solid ${getInsightColor(insight.severity)}`
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                {/* Header */}
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Tag
                    icon={getInsightIcon(insight.type)}
                    color={getInsightTypeColor(insight.type)}
                    style={{ fontSize: 11, marginRight: 0 }}
                  >
                    {insight.type.toUpperCase()}
                  </Tag>
                  <Tag color={getInsightColor(insight.severity)} style={{ fontSize: 11 }}>
                    {insight.severity.toUpperCase()}
                  </Tag>
                </Space>

                {/* Title */}
                <Text strong style={{ fontSize: 14 }}>
                  {insight.title}
                </Text>

                {/* Description */}
                <Paragraph
                  style={{
                    fontSize: 12,
                    marginBottom: 8,
                    color: '#595959'
                  }}
                  ellipsis={{ rows: 2, expandable: false }}
                >
                  {insight.description}
                </Paragraph>

                {/* Impact */}
                <div>
                  <Text strong style={{ fontSize: 11 }}>Tác động:</Text>
                  <Paragraph style={{ fontSize: 11, marginTop: 4, marginBottom: 8 }}>
                    {insight.impact}
                  </Paragraph>
                </div>

                {/* Recommendation */}
                <Alert
                  message={insight.recommendation}
                  type="info"
                  showIcon={false}
                  style={{
                    fontSize: 11,
                    padding: '6px 12px',
                    backgroundColor: '#f0f5ff',
                    border: '1px solid #adc6ff'
                  }}
                />

                {/* Confidence & Savings */}
                <Space style={{ justifyContent: 'space-between', width: '100%', marginTop: 8 }}>
                  <div>
                    <Text style={{ fontSize: 11, color: '#8c8c8c' }}>Độ tin cậy</Text>
                    <br />
                    <Progress
                      percent={insight.confidence}
                      size="small"
                      style={{ width: 80 }}
                      strokeColor={insight.confidence >= 80 ? '#52c41a' : insight.confidence >= 60 ? '#faad14' : '#ff4d4f'}
                    />
                  </div>
                  {insight.potentialSaving && (
                    <div style={{ textAlign: 'right' }}>
                      <Text style={{ fontSize: 11, color: '#8c8c8c' }}>Tiết kiệm tiềm năng</Text>
                      <br />
                      <Text strong style={{ fontSize: 13, color: '#52c41a' }}>
                        {(insight.potentialSaving / 1_000_000_000).toFixed(1)}B VNĐ
                      </Text>
                    </div>
                  )}
                </Space>

                {/* Affected Systems */}
                {insight.affectedSystems.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Text style={{ fontSize: 11, color: '#8c8c8c' }}>
                      Ảnh hưởng: {insight.affectedSystems.length} hệ thống
                    </Text>
                  </div>
                )}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AIInsightsGrid;
