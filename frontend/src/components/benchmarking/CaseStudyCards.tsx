import React, { useState } from 'react';
import { Card, Row, Col, Tag, Typography, Space, Button, Modal, Divider } from 'antd';
import {
  GlobalOutlined,
  BankOutlined,
  ShopOutlined,
  ReadOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  DollarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { mockCaseStudies } from '../../mocks';
import type { CaseStudy } from '../../mocks';

const { Title, Text, Paragraph } = Typography;

/**
 * Case Study Cards - Showcase successful implementations
 */
const CaseStudyCards: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);

  const getOrgTypeIcon = (type: string) => {
    switch (type) {
      case 'ministry': return <BankOutlined />;
      case 'department': return <BankOutlined />;
      case 'enterprise': return <ShopOutlined />;
      case 'international': return <GlobalOutlined />;
      default: return <BankOutlined />;
    }
  };

  const getOrgTypeColor = (type: string) => {
    switch (type) {
      case 'ministry': return 'blue';
      case 'department': return 'cyan';
      case 'enterprise': return 'green';
      case 'international': return 'purple';
      default: return 'default';
    }
  };

  return (
    <>
      <Card>
        <Title level={5} style={{ marginBottom: 16 }}>
          Case Studies ({mockCaseStudies.length} Success Stories)
        </Title>

        <Row gutter={[16, 16]}>
          {mockCaseStudies.map((caseStudy) => (
            <Col xs={24} sm={12} lg={8} key={caseStudy.id}>
              <Card
                hoverable
                size="small"
                onClick={() => setSelectedCase(caseStudy)}
                style={{ height: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  {/* Organization */}
                  <div>
                    <Tag
                      icon={getOrgTypeIcon(caseStudy.organizationType)}
                      color={getOrgTypeColor(caseStudy.organizationType)}
                    >
                      {caseStudy.organizationType}
                    </Tag>
                    <Text strong style={{ fontSize: 16, display: 'block', marginTop: 8 }}>
                      {caseStudy.organization}
                    </Text>
                  </div>

                  {/* Title */}
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {caseStudy.title}
                  </Text>

                  {/* Summary */}
                  <Paragraph
                    ellipsis={{ rows: 3 }}
                    style={{ fontSize: 12, marginBottom: 8 }}
                  >
                    {caseStudy.summary}
                  </Paragraph>

                  {/* Technologies */}
                  <div>
                    {caseStudy.technologies.slice(0, 3).map(tech => (
                      <Tag key={tech} style={{ fontSize: 10, marginBottom: 4 }}>
                        {tech}
                      </Tag>
                    ))}
                    {caseStudy.technologies.length > 3 && (
                      <Tag style={{ fontSize: 10 }}>+{caseStudy.technologies.length - 3}</Tag>
                    )}
                  </div>

                  {/* Meta */}
                  <Space size={4} style={{ fontSize: 11 }}>
                    <ClockCircleOutlined />
                    <Text type="secondary" style={{ fontSize: 11 }}>{caseStudy.timeline}</Text>
                    <Divider type="vertical" />
                    <DollarOutlined />
                    <Text type="secondary" style={{ fontSize: 11 }}>{caseStudy.budget}</Text>
                  </Space>

                  <Button type="link" size="small" style={{ padding: 0 }} icon={<ReadOutlined />}>
                    Read full case study
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Detail Modal */}
      <Modal
        title={selectedCase?.title}
        open={!!selectedCase}
        onCancel={() => setSelectedCase(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedCase(null)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedCase && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* Organization */}
            <div>
              <Tag
                icon={getOrgTypeIcon(selectedCase.organizationType)}
                color={getOrgTypeColor(selectedCase.organizationType)}
              >
                {selectedCase.organizationType}
              </Tag>
              <Text strong style={{ fontSize: 18, marginLeft: 8 }}>
                {selectedCase.organization}
              </Text>
            </div>

            {/* Summary */}
            <Paragraph>{selectedCase.summary}</Paragraph>

            {/* Challenge */}
            <div>
              <Title level={5}>Challenge</Title>
              <Paragraph>{selectedCase.challenge}</Paragraph>
            </div>

            {/* Solution */}
            <div>
              <Title level={5}>Solution</Title>
              <Paragraph>{selectedCase.solution}</Paragraph>
            </div>

            {/* Results */}
            <div>
              <Title level={5}>Results</Title>
              <Space direction="vertical" size="small">
                {selectedCase.results.map((result, idx) => (
                  <div key={idx}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    <Text>{result}</Text>
                  </div>
                ))}
              </Space>
            </div>

            {/* Technologies */}
            <div>
              <Title level={5}>Technologies Used</Title>
              {selectedCase.technologies.map(tech => (
                <Tag key={tech} icon={<RocketOutlined />} color="processing" style={{ marginBottom: 4 }}>
                  {tech}
                </Tag>
              ))}
            </div>

            {/* Key Takeaways */}
            <div>
              <Title level={5}>Key Takeaways</Title>
              <ul style={{ paddingLeft: 20 }}>
                {selectedCase.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx}>
                    <Text>{takeaway}</Text>
                  </li>
                ))}
              </ul>
            </div>

            {/* Meta Info */}
            <Row gutter={16}>
              <Col span={12}>
                <Space>
                  <ClockCircleOutlined />
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Timeline</Text>
                    <br />
                    <Text strong>{selectedCase.timeline}</Text>
                  </div>
                </Space>
              </Col>
              <Col span={12}>
                <Space>
                  <DollarOutlined />
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Budget</Text>
                    <br />
                    <Text strong>{selectedCase.budget}</Text>
                  </div>
                </Space>
              </Col>
            </Row>
          </Space>
        )}
      </Modal>
    </>
  );
};

export default CaseStudyCards;
