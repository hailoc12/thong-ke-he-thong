import React from 'react';
import { Card, Table, Tag, Typography, Space, Progress, Tooltip } from 'antd';
import {
  BulbOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { mockPlanningPipeline } from '../../mocks';
import type { PlanningPipeline } from '../../mocks';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

/**
 * Planning Pipeline Table - Shows upcoming system projects
 */
const PlanningPipelineTable: React.FC = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'idea': return <BulbOutlined />;
      case 'feasibility': return <FileSearchOutlined />;
      case 'approved': return <CheckCircleOutlined />;
      case 'budgeted': return <DollarOutlined />;
      case 'ready_to_start': return <RocketOutlined />;
      default: return <BulbOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idea': return 'default';
      case 'feasibility': return 'blue';
      case 'approved': return 'cyan';
      case 'budgeted': return 'green';
      case 'ready_to_start': return 'purple';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return 'red';
      case 'P1': return 'orange';
      case 'P2': return 'blue';
      case 'P3': return 'default';
      default: return 'default';
    }
  };

  const getBusinessValueColor = (value: string) => {
    switch (value) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const columns: ColumnsType<PlanningPipeline> = [
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 250,
      fixed: 'left',
      render: (text: string, record: PlanningPipeline) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Space size={4} style={{ marginTop: 4 }}>
            <Tag color={getPriorityColor(record.priority)}>{record.priority}</Tag>
            <Tag color={getBusinessValueColor(record.businessValue)} icon={<ThunderboltOutlined />}>
              {record.businessValue}
            </Tag>
          </Space>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status.replace('_', ' ')}
        </Tag>
      ),
      filters: [
        { text: 'Idea', value: 'idea' },
        { text: 'Feasibility', value: 'feasibility' },
        { text: 'Approved', value: 'approved' },
        { text: 'Budgeted', value: 'budgeted' },
        { text: 'Ready to Start', value: 'ready_to_start' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Budget (VNĐ)',
      dataIndex: 'estimatedBudget',
      key: 'estimatedBudget',
      width: 150,
      render: (budget: number) => (
        <Text>{(budget / 1_000_000_000).toFixed(2)}B</Text>
      ),
      sorter: (a, b) => a.estimatedBudget - b.estimatedBudget
    },
    {
      title: 'Duration',
      dataIndex: 'estimatedDuration',
      key: 'estimatedDuration',
      width: 120,
      render: (duration: string) => (
        <Space size={4}>
          <ClockCircleOutlined />
          <Text>{duration}</Text>
        </Space>
      )
    },
    {
      title: 'Expected Go-Live',
      dataIndex: 'expectedGoLive',
      key: 'expectedGoLive',
      width: 150,
      render: (date: string) => <Text>{date}</Text>,
      sorter: (a, b) => new Date(a.expectedGoLive).getTime() - new Date(b.expectedGoLive).getTime()
    },
    {
      title: 'ROI',
      dataIndex: 'roi',
      key: 'roi',
      width: 120,
      render: (roi: number) => {
        const color = roi >= 200 ? 'green' : roi >= 100 ? 'blue' : 'orange';
        return (
          <Tooltip title={`Return on Investment: ${roi}%`}>
            <Tag color={color}>{roi}%</Tag>
          </Tooltip>
        );
      },
      sorter: (a, b) => a.roi - b.roi
    }
  ];

  // Calculate statistics
  const stats = {
    total: mockPlanningPipeline.length,
    readyToStart: mockPlanningPipeline.filter(p => p.status === 'ready_to_start').length,
    budgeted: mockPlanningPipeline.filter(p => p.status === 'budgeted').length,
    totalBudget: mockPlanningPipeline.reduce((sum, p) => sum + p.estimatedBudget, 0) / 1_000_000_000,
    avgROI: (mockPlanningPipeline.reduce((sum, p) => sum + p.roi, 0) / mockPlanningPipeline.length).toFixed(0)
  };

  return (
    <Card>
      <Title level={5} style={{ marginBottom: 16 }}>
        Planning Pipeline ({stats.total} Projects)
      </Title>

      {/* Statistics */}
      <Space size="large" style={{ marginBottom: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>Ready to Start</Text>
          <br />
          <Text strong style={{ fontSize: 18, color: '#722ed1' }}>{stats.readyToStart}</Text>
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>Budgeted</Text>
          <br />
          <Text strong style={{ fontSize: 18, color: '#52c41a' }}>{stats.budgeted}</Text>
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>Total Budget</Text>
          <br />
          <Text strong style={{ fontSize: 18, color: '#1890ff' }}>{stats.totalBudget.toFixed(2)}B VNĐ</Text>
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>Avg. ROI</Text>
          <br />
          <Text strong style={{ fontSize: 18, color: '#faad14' }}>{stats.avgROI}%</Text>
        </div>
      </Space>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={mockPlanningPipeline}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} projects`
        }}
      />
    </Card>
  );
};

export default PlanningPipelineTable;
