import React from 'react';
import { Card, Row, Col, Tag, Typography, Space, Button, Rate, Divider } from 'antd';
import {
  ShopOutlined,
  StarOutlined,
  DollarOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  CloudOutlined,
  ApiOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { mockAPIMarketplace } from '../../mocks';
import type { APIMarketplace as APIMarketplaceType } from '../../mocks';

const { Title, Text, Paragraph } = Typography;

/**
 * API Marketplace - Discover and integrate third-party APIs
 */
const APIMarketplace: React.FC = () => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'identity': return <SafetyOutlined />;
      case 'payment': return <DollarOutlined />;
      case 'messaging': return <ThunderboltOutlined />;
      case 'infrastructure': return <CloudOutlined />;
      case 'ai_ml': return <StarOutlined />;
      default: return <ApiOutlined />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'identity': return 'red';
      case 'payment': return 'green';
      case 'messaging': return 'blue';
      case 'infrastructure': return 'purple';
      case 'ai_ml': return 'orange';
      default: return 'default';
    }
  };

  return (
    <Card>
      <Title level={5} style={{ marginBottom: 16 }}>
        <Space>
          <ShopOutlined />
          API Marketplace ({mockAPIMarketplace.length} Recommended APIs)
        </Space>
      </Title>

      <Paragraph type="secondary">
        Discover vetted third-party APIs for integration. Pre-approved vendors with SLA guarantees.
      </Paragraph>

      <Row gutter={[16, 16]}>
        {mockAPIMarketplace.map((api: APIMarketplaceType) => (
          <Col xs={24} sm={12} lg={8} key={api.id}>
            <Card
              hoverable
              size="small"
              style={{ height: '100%' }}
              actions={[
                <Button type="link" size="small" icon={<LinkOutlined />}>
                  Documentation
                </Button>,
                <Button type="primary" size="small">
                  Request Access
                </Button>
              ]}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {/* Header */}
                <div>
                  <Space>
                    {getCategoryIcon(api.category)}
                    <Text strong style={{ fontSize: 16 }}>{api.name}</Text>
                  </Space>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>{api.provider}</Text>
                </div>

                {/* Category & Pricing */}
                <Space wrap>
                  <Tag color={getCategoryColor(api.category)} icon={getCategoryIcon(api.category)}>
                    {api.category.replace('_', ' ')}
                  </Tag>
                  <Tag color={api.pricingModel === 'free' ? 'green' : api.pricingModel === 'freemium' ? 'blue' : 'orange'}>
                    {api.pricingModel}
                  </Tag>
                </Space>

                {/* Description */}
                <Paragraph
                  ellipsis={{ rows: 3 }}
                  style={{ fontSize: 12, marginBottom: 8 }}
                >
                  {api.description}
                </Paragraph>

                {/* Rating */}
                <div>
                  <Rate disabled defaultValue={api.rating} style={{ fontSize: 14 }} />
                  <Text type="secondary" style={{ marginLeft: 8, fontSize: 11 }}>
                    ({api.rating}/5)
                  </Text>
                </div>

                <Divider style={{ margin: '8px 0' }} />

                {/* Use Cases */}
                <div>
                  <Text strong style={{ fontSize: 11 }}>Use Cases:</Text>
                  <div style={{ marginTop: 4 }}>
                    {api.useCases.map((useCase, idx) => (
                      <Tag key={idx} style={{ fontSize: 10, marginBottom: 4 }}>
                        {useCase}
                      </Tag>
                    ))}
                  </div>
                </div>

                {/* Integration Complexity */}
                <div>
                  <Space>
                    <Text type="secondary" style={{ fontSize: 11 }}>Integration:</Text>
                    <Tag color={
                      api.integrationComplexity === 'easy' ? 'green' :
                      api.integrationComplexity === 'medium' ? 'blue' : 'orange'
                    }>
                      {api.integrationComplexity}
                    </Tag>
                  </Space>
                </div>

                {/* Key Features */}
                <div>
                  <Text strong style={{ fontSize: 11 }}>Key Features:</Text>
                  <ul style={{ paddingLeft: 20, margin: '4px 0 0 0' }}>
                    {api.keyFeatures.slice(0, 3).map((feature, idx) => (
                      <li key={idx} style={{ fontSize: 11 }}>{feature}</li>
                    ))}
                  </ul>
                </div>

                {/* Support Level */}
                <Space>
                  <Text type="secondary" style={{ fontSize: 11 }}>Support:</Text>
                  <Tag color={
                    api.supportLevel === 'enterprise' ? 'purple' :
                    api.supportLevel === 'business' ? 'blue' : 'default'
                  }>
                    {api.supportLevel}
                  </Tag>
                </Space>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default APIMarketplace;
