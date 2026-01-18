import React from 'react';
import { Card, Timeline, Typography, Tag, Progress, Space, Row, Col, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  EyeOutlined,
  WarningOutlined,
  TeamOutlined,
  DollarOutlined,
  ToolOutlined
} from '@ant-design/icons';
import { mockSystemRoadmaps } from '../../mocks';

const { Title, Text } = Typography;

/**
 * Lifecycle Roadmap - Visual timeline of system lifecycles
 */
const LifecycleRoadmap: React.FC = () => {
  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'completed': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'in_progress': return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      case 'upcoming': return <ExperimentOutlined style={{ color: '#8c8c8c' }} />;
      default: return <ToolOutlined />;
    }
  };

  const getPhaseColor = (currentPhase: string) => {
    switch (currentPhase) {
      case 'planning': return 'blue';
      case 'development': return 'cyan';
      case 'production': return 'green';
      case 'maintenance': return 'orange';
      case 'sunset': return 'red';
      default: return 'default';
    }
  };

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'gold';
      case 'low': return 'blue';
      default: return 'default';
    }
  };

  return (
    <Card>
      <Title level={5} style={{ marginBottom: 24 }}>
        System Lifecycle Roadmaps ({mockSystemRoadmaps.length} Systems)
      </Title>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {mockSystemRoadmaps.map((roadmap) => {
          const budgetUsed = ((roadmap.budget.spent / roadmap.budget.allocated) * 100).toFixed(1);
          const budgetRemaining = roadmap.budget.remaining / 1_000_000_000;

          return (
            <Card
              key={roadmap.id}
              size="small"
              style={{
                borderLeft: `4px solid ${getPhaseColor(roadmap.currentPhase) === 'green' ? '#52c41a' :
                  getPhaseColor(roadmap.currentPhase) === 'orange' ? '#faad14' :
                  getPhaseColor(roadmap.currentPhase) === 'red' ? '#ff4d4f' : '#1890ff'}`
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <Text strong style={{ fontSize: 16 }}>{roadmap.systemName}</Text>
                    <br />
                    <Tag color={getPhaseColor(roadmap.currentPhase)} style={{ marginTop: 4 }}>
                      {roadmap.currentPhase}
                    </Tag>
                    <Tag icon={<EyeOutlined />}>
                      Health: {roadmap.healthScore}%
                    </Tag>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Next Milestone</Text>
                    <br />
                    <Text strong>{roadmap.nextMilestone}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>{roadmap.nextMilestoneDate}</Text>
                  </div>
                </div>

                {/* Budget & Team */}
                <Row gutter={[16, 8]}>
                  <Col xs={24} md={12}>
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Space>
                        <DollarOutlined />
                        <Text strong>Budget</Text>
                      </Space>
                      <Progress
                        percent={parseFloat(budgetUsed)}
                        strokeColor={parseFloat(budgetUsed) > 90 ? '#ff4d4f' : parseFloat(budgetUsed) > 75 ? '#faad14' : '#52c41a'}
                        size="small"
                      />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Spent: {(roadmap.budget.spent / 1_000_000_000).toFixed(2)}B / {(roadmap.budget.allocated / 1_000_000_000).toFixed(2)}B VNĐ
                        (Remaining: {budgetRemaining.toFixed(2)}B)
                      </Text>
                    </Space>
                  </Col>
                  <Col xs={24} md={12}>
                    <Space>
                      <TeamOutlined />
                      <Text strong>Team Size:</Text>
                      <Tag color="blue">{roadmap.team.technical} Tech</Tag>
                      <Tag color="green">{roadmap.team.business} Business</Tag>
                      <Tag color="purple">{roadmap.team.external} External</Tag>
                    </Space>
                  </Col>
                </Row>

                {/* Risks */}
                {roadmap.risks.length > 0 && (
                  <div>
                    <Space style={{ marginBottom: 8 }}>
                      <WarningOutlined style={{ color: '#faad14' }} />
                      <Text strong>Active Risks:</Text>
                    </Space>
                    <Space wrap>
                      {roadmap.risks.map((risk, idx) => (
                        <Tooltip key={idx} title={risk.description}>
                          <Tag color={getRiskColor(risk.severity)} icon={<WarningOutlined />}>
                            {risk.severity}: {risk.description.length > 40 ? risk.description.substring(0, 40) + '...' : risk.description}
                          </Tag>
                        </Tooltip>
                      ))}
                    </Space>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 12 }}>Project Timeline</Text>
                  <Timeline>
                    {roadmap.timeline.map((phase, phaseIdx) => (
                      <Timeline.Item
                        key={phaseIdx}
                        color={phase.phase === roadmap.currentPhase ? 'blue' : 'gray'}
                      >
                        <div>
                          <Text strong>{phase.phase.toUpperCase()} Phase</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {phase.startDate} - {phase.endDate || 'In Progress'}
                          </Text>
                          {phase.milestones.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              {phase.milestones.map((milestone, idx) => (
                                <div key={idx} style={{ marginLeft: 16, marginTop: 4 }}>
                                  {getPhaseIcon(milestone.status)}
                                  <Text style={{ marginLeft: 8, fontSize: 12 }}>
                                    {milestone.name} ({milestone.date})
                                  </Text>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </div>
              </Space>
            </Card>
          );
        })}
      </Space>
    </Card>
  );
};

export default LifecycleRoadmap;
