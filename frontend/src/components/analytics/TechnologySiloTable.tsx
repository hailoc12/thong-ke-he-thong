import React from 'react';
import { Card, Table, Typography, Tag, Space, Tooltip } from 'antd';
import { WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { mockTechnologySilos } from '../../mocks';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface TechnologySilo {
  id: number;
  siloName: string;
  affectedSystemsCount: number;
  issue: string;
  recommendation: string;
  potentialSaving?: number;
}

/**
 * Technology Silo Table - Display identified technology silos and fragmentation issues
 */
const TechnologySiloTable: React.FC = () => {
  const columns: ColumnsType<TechnologySilo> = [
    {
      title: 'Silo / Fragmentation',
      dataIndex: 'siloName',
      key: 'siloName',
      width: 200,
      render: (text: string, record: TechnologySilo) => (
        <Space direction="vertical" size={2}>
          <Text strong style={{ fontSize: 13 }}>
            {text}
          </Text>
          <Tag color="orange" style={{ fontSize: 10 }}>
            {record.affectedSystemsCount} systems affected
          </Tag>
        </Space>
      )
    },
    {
      title: 'Issue',
      dataIndex: 'issue',
      key: 'issue',
      render: (text: string) => (
        <Text style={{ fontSize: 12 }}>
          {text}
        </Text>
      )
    },
    {
      title: (
        <Space>
          Recommendation
          <Tooltip title="AI-generated recommendations based on industry best practices">
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'recommendation',
      key: 'recommendation',
      render: (text: string) => (
        <Text style={{ fontSize: 12, color: '#1890ff' }}>
          {text}
        </Text>
      )
    },
    {
      title: 'Potential Saving',
      dataIndex: 'potentialSaving',
      key: 'potentialSaving',
      width: 150,
      align: 'right',
      render: (value?: number) => {
        if (!value) return <Text type="secondary">-</Text>;
        return (
          <Text strong style={{ color: '#52c41a', fontSize: 13 }}>
            {(value / 1_000_000_000).toFixed(1)}B VNĐ/year
          </Text>
        );
      }
    }
  ];

  // Calculate total potential savings
  const totalSavings = mockTechnologySilos.reduce(
    (sum, silo) => sum + (silo.potentialSaving || 0),
    0
  );

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Header */}
        <div>
          <Space align="start">
            <WarningOutlined style={{ fontSize: 20, color: '#faad14', marginTop: 4 }} />
            <div>
              <Title level={5} style={{ marginBottom: 4 }}>
                Technology Silos & Fragmentation
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {mockTechnologySilos.length} identified silos causing inefficiency and increased costs
              </Text>
            </div>
          </Space>
        </div>

        {/* Total Savings */}
        {totalSavings > 0 && (
          <div
            style={{
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: 8,
              padding: '12px 16px'
            }}
          >
            <Space>
              <Text strong style={{ fontSize: 13 }}>
                Total Potential Annual Savings:
              </Text>
              <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                {(totalSavings / 1_000_000_000).toFixed(1)}B VNĐ
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                (by addressing all silos)
              </Text>
            </Space>
          </div>
        )}

        {/* Table */}
        <Table
          columns={columns}
          dataSource={mockTechnologySilos}
          rowKey="id"
          pagination={false}
          size="small"
          bordered
        />

        {/* Footer Note */}
        <Text type="secondary" style={{ fontSize: 11, fontStyle: 'italic' }}>
          💡 Technology silos lead to duplicated efforts, vendor lock-in, and increased maintenance costs. Consolidation can significantly improve efficiency.
        </Text>
      </Space>
    </Card>
  );
};

export default TechnologySiloTable;
