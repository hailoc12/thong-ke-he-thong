import React, { useState } from 'react';
import { Card, Table, Tag, Typography, Space, Button, Modal, Descriptions, Badge } from 'antd';
import {
  ApiOutlined,
  CloudOutlined,
  LockOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  StopOutlined,
  CloseCircleOutlined,
  UserOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { mockAPIDefinitions, APIDefinition } from '../../mocks';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

/**
 * API Catalog Table - Central registry of all APIs
 */
const APICatalogTable: React.FC = () => {
  const [selectedAPI, setSelectedAPI] = useState<APIDefinition | null>(null);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'public': return 'green';
      case 'internal': return 'blue';
      case 'partner': return 'purple';
      case 'deprecated': return 'red';
      default: return 'default';
    }
  };

  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case 'REST': return 'blue';
      case 'GraphQL': return 'cyan';
      case 'SOAP': return 'orange';
      case 'gRPC': return 'purple';
      case 'WebSocket': return 'green';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleOutlined />;
      case 'beta': return <ExperimentOutlined />;
      case 'deprecated': return <StopOutlined />;
      case 'sunset': return <CloseCircleOutlined />;
      default: return <ApiOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'beta': return 'processing';
      case 'deprecated': return 'warning';
      case 'sunset': return 'error';
      default: return 'default';
    }
  };

  const columns: ColumnsType<APIDefinition> = [
    {
      title: 'API Name',
      dataIndex: 'apiName',
      key: 'apiName',
      width: 250,
      fixed: 'left',
      render: (text: string, record: APIDefinition) => (
        <div>
          <Space>
            <ApiOutlined />
            <Text strong>{text}</Text>
          </Space>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{record.apiCode}</Text>
          <br />
          <Tag color={getProtocolColor(record.protocol)} style={{ fontSize: 10, marginTop: 4 }}>
            {record.protocol}
          </Tag>
        </div>
      )
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      render: (version: string) => <Tag>{version}</Tag>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => (
        <Tag color={getCategoryColor(category)}>
          {category}
        </Tag>
      ),
      filters: [
        { text: 'Public', value: 'public' },
        { text: 'Internal', value: 'internal' },
        { text: 'Partner', value: 'partner' },
        { text: 'Deprecated', value: 'deprecated' }
      ],
      onFilter: (value, record) => record.category === value
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Badge status={getStatusColor(status) as any} text={status} />
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Beta', value: 'beta' },
        { text: 'Deprecated', value: 'deprecated' },
        { text: 'Sunset', value: 'sunset' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Auth Method',
      dataIndex: 'authMethod',
      key: 'authMethod',
      width: 150,
      render: (auth: string) => (
        <Space size={4}>
          <LockOutlined style={{ fontSize: 11 }} />
          <Text style={{ fontSize: 11 }}>{auth}</Text>
        </Space>
      )
    },
    {
      title: 'SLA Uptime',
      dataIndex: ['sla', 'uptime'],
      key: 'uptime',
      width: 100,
      render: (uptime: number) => (
        <Tag color={uptime >= 99.9 ? 'green' : uptime >= 99 ? 'blue' : 'orange'}>
          {uptime}%
        </Tag>
      ),
      sorter: (a, b) => a.sla.uptime - b.sla.uptime
    },
    {
      title: 'Endpoints',
      dataIndex: 'endpoints',
      key: 'endpoints',
      width: 100,
      render: (count: number) => <Text>{count}</Text>,
      sorter: (a, b) => a.endpoints - b.endpoints
    },
    {
      title: 'Consumers',
      dataIndex: 'consumers',
      key: 'consumers',
      width: 100,
      render: (count: number) => (
        <Space size={4}>
          <UserOutlined style={{ fontSize: 11 }} />
          <Text>{count}</Text>
        </Space>
      ),
      sorter: (a, b) => a.consumers - b.consumers
    },
    {
      title: 'Calls/Day',
      dataIndex: 'callsPerDay',
      key: 'callsPerDay',
      width: 120,
      render: (calls: number) => (
        <Space size={4}>
          <ThunderboltOutlined style={{ fontSize: 11 }} />
          <Text>{calls >= 1_000_000 ? `${(calls / 1_000_000).toFixed(1)}M` : `${(calls / 1_000).toFixed(0)}K`}</Text>
        </Space>
      ),
      sorter: (a, b) => a.callsPerDay - b.callsPerDay
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_: any, record: APIDefinition) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => setSelectedAPI(record)}
        >
          View
        </Button>
      )
    }
  ];

  return (
    <>
      <Card>
        <Title level={5} style={{ marginBottom: 16 }}>
          API Catalog ({mockAPIDefinitions.length} APIs)
        </Title>

        <Table
          columns={columns}
          dataSource={mockAPIDefinitions}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} APIs`
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <ApiOutlined />
            {selectedAPI?.apiName}
            <Tag color={getProtocolColor(selectedAPI?.protocol || '')}>
              {selectedAPI?.protocol}
            </Tag>
          </Space>
        }
        open={!!selectedAPI}
        onCancel={() => setSelectedAPI(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedAPI(null)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedAPI && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="API Code" span={2}>
              <Text code>{selectedAPI.apiCode}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Version">
              <Tag>{selectedAPI.version}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Badge status={getStatusColor(selectedAPI.status) as any} text={selectedAPI.status} />
            </Descriptions.Item>
            <Descriptions.Item label="Category">
              <Tag color={getCategoryColor(selectedAPI.category)}>
                {selectedAPI.category}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Protocol">
              <Tag color={getProtocolColor(selectedAPI.protocol)}>
                {selectedAPI.protocol}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Authentication">
              <Space size={4}>
                <LockOutlined />
                <Text>{selectedAPI.authMethod}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Endpoints">
              {selectedAPI.endpoints}
            </Descriptions.Item>
            <Descriptions.Item label="SLA Uptime">
              <Tag color="green">{selectedAPI.sla.uptime}%</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Response Time">
              {selectedAPI.sla.responseTime}ms (avg)
            </Descriptions.Item>
            <Descriptions.Item label="Error Rate">
              <Tag color={selectedAPI.sla.errorRate < 0.5 ? 'green' : 'orange'}>
                {selectedAPI.sla.errorRate}%
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Consumers">
              <Space size={4}>
                <UserOutlined />
                <Text>{selectedAPI.consumers}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Daily Calls">
              <Space size={4}>
                <ThunderboltOutlined />
                <Text>
                  {selectedAPI.callsPerDay >= 1_000_000
                    ? `${(selectedAPI.callsPerDay / 1_000_000).toFixed(2)}M`
                    : `${(selectedAPI.callsPerDay / 1_000).toFixed(0)}K`}
                </Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Documentation" span={2}>
              <Button type="link" icon={<CloudOutlined />} size="small">
                View API Documentation
              </Button>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default APICatalogTable;
