import React from 'react';
import { Card, Row, Col, Tag, Typography, Space, Button, Rate } from 'antd';
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
      case 'authentication': return <SafetyOutlined />;
      case 'payment': return <DollarOutlined />;
      case 'notification': return <ThunderboltOutlined />;
      case 'analytics': return <CloudOutlined />;
      case 'ai': return <StarOutlined />;
      default: return <ApiOutlined />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'authentication': return 'red';
      case 'payment': return 'green';
      case 'notification': return 'blue';
      case 'analytics': return 'purple';
      case 'ai': return 'orange';
      case 'mapping': return 'cyan';
      case 'data': return 'geekblue';
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
                <Button
                  key="docs"
                  type="link"
                  size="small"
                  icon={<LinkOutlined />}
                  href={api.documentation}
                  target="_blank"
                >
                  Documentation
                </Button>,
                <Button key="access" type="primary" size="small">
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
                    {api.featured && <StarOutlined style={{ color: '#faad14' }} />}
                  </Space>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>{api.provider}</Text>
                </div>

                {/* Category & Pricing */}
                <Space wrap>
                  <Tag color={getCategoryColor(api.category)} icon={getCategoryIcon(api.category)}>
                    {api.category}
                  </Tag>
                  <Tag color={api.pricing === 'free' ? 'green' : api.pricing === 'freemium' ? 'blue' : 'orange'}>
                    {api.pricing}
                  </Tag>
                </Space>

                {/* Description */}
                <Paragraph
                  ellipsis={{ rows: 3 }}
                  style={{ fontSize: 12, marginBottom: 8 }}
                >
                  {api.description}
                </Paragraph>

                {/* Popularity Rating */}
                <div>
                  <Rate disabled value={api.popularity} style={{ fontSize: 14 }} />
                  <Text type="secondary" style={{ marginLeft: 8, fontSize: 11 }}>
                    ({api.popularity}/5)
                  </Text>
                </div>

                {/* Use Case */}
                <div>
                  <Text strong style={{ fontSize: 11 }}>Use Case:</Text>
                  <br />
                  <Text style={{ fontSize: 11 }}>{api.useCase}</Text>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default APIMarketplace;
