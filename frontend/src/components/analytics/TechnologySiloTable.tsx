import React from 'react';
import { Card, Table, Typography, Tag, Space, Tooltip } from 'antd';
import { WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { mockTechnologySilos } from '../../mocks';
import type { TechnologySilo } from '../../mocks';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

/**
 * Bảng Cô lập Công nghệ - Hiển thị các nhóm công nghệ cô lập và vấn đề phân mảnh
 */
const TechnologySiloTable: React.FC = () => {
  const columns: ColumnsType<TechnologySilo> = [
    {
      title: 'Cô lập / Phân mảnh',
      dataIndex: 'technology',
      key: 'technology',
      width: 200,
      render: (text: string, record: TechnologySilo) => (
        <Space direction="vertical" size={2}>
          <Text strong style={{ fontSize: 13 }}>
            {text}
          </Text>
          <Tag color="orange" style={{ fontSize: 10 }}>
            {record.systemCount} hệ thống ảnh hưởng
          </Tag>
        </Space>
      )
    },
    {
      title: 'Vấn đề',
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
          Đề xuất
          <Tooltip title="Đề xuất từ AI dựa trên thực tiễn tốt nhất ngành">
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
      title: 'Tiết kiệm tiềm năng',
      dataIndex: 'potentialSaving',
      key: 'potentialSaving',
      width: 150,
      align: 'right',
      render: (value?: number) => {
        if (!value) return <Text type="secondary">-</Text>;
        return (
          <Text strong style={{ color: '#52c41a', fontSize: 13 }}>
            {(value / 1_000_000_000).toFixed(1)}B VNĐ/năm
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
                Cô lập & Phân mảnh Công nghệ
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {mockTechnologySilos.length} nhóm cô lập phát hiện gây kém hiệu quả và tăng chi phí
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
                Tổng tiết kiệm tiềm năng hàng năm:
              </Text>
              <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                {(totalSavings / 1_000_000_000).toFixed(1)}B VNĐ
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                (bằng cách giải quyết tất cả nhóm cô lập)
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
          💡 Cô lập công nghệ dẫn đến công sức trùng lặp, bị phụ thuộc nhà cung cấp, và tăng chi phí vận hành. Hợp nhất có thể cải thiện hiệu quả đáng kể.
        </Text>
      </Space>
    </Card>
  );
};

export default TechnologySiloTable;
