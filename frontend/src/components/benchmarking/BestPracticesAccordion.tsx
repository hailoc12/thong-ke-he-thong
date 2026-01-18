import React from 'react';
import { Card, Collapse, Tag, Space, Typography, Row, Col, Button, Tooltip } from 'antd';
import {
  SafetyOutlined,
  ApiOutlined,
  CloudOutlined,
  DeploymentUnitOutlined,
  RocketOutlined,
  FileTextOutlined,
  LinkOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { mockBestPractices } from '../../mocks';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

/**
 * Best Practices Accordion - Library of industry best practices
 */
const BestPracticesAccordion: React.FC = () => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'governance': return <FileTextOutlined />;
      case 'architecture': return <ApiOutlined />;
      case 'security': return <SafetyOutlined />;
      case 'operations': return <DeploymentUnitOutlined />;
      case 'innovation': return <RocketOutlined />;
      default: return <CloudOutlined />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'governance': return 'blue';
      case 'architecture': return 'cyan';
      case 'security': return 'red';
      case 'operations': return 'green';
      case 'innovation': return 'purple';
      default: return 'default';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      default: return 'default';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'default';
      case 'medium': return 'blue';
      case 'high': return 'purple';
      default: return 'default';
    }
  };

  return (
    <Card>
      <Title level={5} style={{ marginBottom: 16 }}>
        Best Practices Library ({mockBestPractices.length} Practices)
      </Title>

      <Collapse accordion defaultActiveKey={['0']}>
        {mockBestPractices.map((practice, index) => (
          <Panel
            header={
              <Space>
                {getCategoryIcon(practice.category)}
                <Text strong>{practice.title}</Text>
              </Space>
            }
            key={index}
            extra={
              <Space>
                <Tag color={getCategoryColor(practice.category)} icon={getCategoryIcon(practice.category)}>
                  {practice.category}
                </Tag>
                <Tag color={getDifficultyColor(practice.difficulty)}>
                  {practice.difficulty}
                </Tag>
                <Tag color={getImpactColor(practice.impact)} icon={<ThunderboltOutlined />}>
                  {practice.impact} impact
                </Tag>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {/* Description */}
              <Paragraph>{practice.description}</Paragraph>

              {/* Metadata */}
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Space>
                    <ClockCircleOutlined />
                    <Text type="secondary">Implementation Time:</Text>
                    <Text strong>{practice.implementationTime}</Text>
                  </Space>
                </Col>
              </Row>

              {/* Tags */}
              <div>
                <Text type="secondary" style={{ marginRight: 8 }}>Tags:</Text>
                {practice.tags.map(tag => (
                  <Tag key={tag} style={{ marginBottom: 4 }}>
                    {tag}
                  </Tag>
                ))}
              </div>

              {/* Resources */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Resources:</Text>
                <Space direction="vertical" size="small">
                  {practice.resources.map((resource, idx) => (
                    <div key={idx}>
                      <Button
                        type="link"
                        icon={<LinkOutlined />}
                        href={resource.url}
                        target="_blank"
                        style={{ padding: 0 }}
                      >
                        {resource.title}
                      </Button>
                      <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                        ({resource.type})
                      </Text>
                    </div>
                  ))}
                </Space>
              </div>
            </Space>
          </Panel>
        ))}
      </Collapse>
    </Card>
  );
};

export default BestPracticesAccordion;
