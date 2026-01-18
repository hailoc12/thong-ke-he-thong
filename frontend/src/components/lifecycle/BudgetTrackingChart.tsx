import React from 'react';
import { Card, Typography, Row, Col, Statistic, Space, Tag, Progress } from 'antd';
import { Column } from '@ant-design/charts';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { mockBudgetTracking } from '../../mocks';

const { Title, Text } = Typography;

/**
 * Budget Tracking Chart - Quarterly budget execution tracking
 */
const BudgetTrackingChart: React.FC = () => {
  // Prepare chart data
  const chartData = mockBudgetTracking.flatMap((item) => [
    { quarter: item.quarter, category: 'Development', value: item.development, type: 'Actual' },
    { quarter: item.quarter, category: 'Maintenance', value: item.maintenance, type: 'Actual' },
    { quarter: item.quarter, category: 'Infrastructure', value: item.infrastructure, type: 'Actual' },
    { quarter: item.quarter, category: 'Licenses', value: item.licenses, type: 'Actual' },
    { quarter: item.quarter, category: 'Other', value: item.other, type: 'Actual' }
  ]);

  // Calculate totals and statistics
  const totalAllocated = mockBudgetTracking.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = mockBudgetTracking.reduce((sum, item) => sum + item.spent, 0);
  const utilizationRate = ((totalSpent / totalAllocated) * 100).toFixed(1);
  const remaining = totalAllocated - totalSpent;
  const avgSpendRate = (totalSpent / mockBudgetTracking.length).toFixed(2);

  // Latest quarter data
  const latestQuarter = mockBudgetTracking[mockBudgetTracking.length - 1];
  const latestUtilization = ((latestQuarter.spent / latestQuarter.allocated) * 100).toFixed(1);

  const config = {
    data: chartData,
    xField: 'quarter',
    yField: 'value',
    seriesField: 'category',
    isStack: true,
    color: ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#8c8c8c'],
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.8,
        fontSize: 11
      },
      formatter: (datum: any) => {
        return datum.value > 0.5 ? `${datum.value.toFixed(1)}B` : '';
      }
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${parseFloat(v).toFixed(0)}B VNĐ`
      }
    },
    legend: {
      position: 'bottom' as const
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: datum.category,
          value: `${datum.value.toFixed(2)}B VNĐ`
        };
      }
    }
  };

  return (
    <Card>
      <Title level={5} style={{ marginBottom: 24 }}>
        Budget Tracking & Execution
      </Title>

      {/* Statistics Dashboard */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Total Allocated"
              value={totalAllocated.toFixed(2)}
              suffix="B VNĐ"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Total Spent"
              value={totalSpent.toFixed(2)}
              suffix="B VNĐ"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Remaining"
              value={remaining.toFixed(2)}
              suffix="B VNĐ"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: remaining < 5 ? '#ff4d4f' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Utilization Rate</Text>
              <br />
              <Text strong style={{ fontSize: 24, color: parseFloat(utilizationRate) > 90 ? '#ff4d4f' : '#52c41a' }}>
                {utilizationRate}%
              </Text>
              <Progress
                percent={parseFloat(utilizationRate)}
                showInfo={false}
                strokeColor={parseFloat(utilizationRate) > 90 ? '#ff4d4f' : parseFloat(utilizationRate) > 75 ? '#faad14' : '#52c41a'}
                size="small"
                style={{ marginTop: 8 }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quarterly Breakdown Chart */}
      <Column {...config} height={350} />

      {/* Quarterly Details Table */}
      <div style={{ marginTop: 24 }}>
        <Title level={5} style={{ marginBottom: 12 }}>Quarterly Breakdown</Title>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {mockBudgetTracking.map((quarter) => {
            const utilization = ((quarter.spent / quarter.allocated) * 100).toFixed(1);
            const isOverBudget = quarter.spent > quarter.allocated;

            return (
              <Card key={quarter.quarter} size="small" style={{ background: '#fafafa' }}>
                <Row align="middle" gutter={16}>
                  <Col xs={24} sm={6}>
                    <Text strong>{quarter.quarter}</Text>
                  </Col>
                  <Col xs={12} sm={4}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>Allocated</Text>
                      <br />
                      <Text strong>{quarter.allocated.toFixed(2)}B</Text>
                    </div>
                  </Col>
                  <Col xs={12} sm={4}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>Spent</Text>
                      <br />
                      <Text strong style={{ color: isOverBudget ? '#ff4d4f' : '#52c41a' }}>
                        {quarter.spent.toFixed(2)}B
                      </Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={10}>
                    <Space>
                      <Progress
                        percent={parseFloat(utilization)}
                        strokeColor={isOverBudget ? '#ff4d4f' : parseFloat(utilization) > 90 ? '#faad14' : '#52c41a'}
                        size="small"
                        style={{ width: 120 }}
                      />
                      <Tag color={isOverBudget ? 'red' : parseFloat(utilization) > 90 ? 'orange' : 'green'}>
                        {utilization}%
                      </Tag>
                      {isOverBudget && (
                        <Tag icon={<ArrowUpOutlined />} color="red">
                          Over budget
                        </Tag>
                      )}
                    </Space>
                  </Col>
                </Row>
              </Card>
            );
          })}
        </Space>
      </div>
    </Card>
  );
};

export default BudgetTrackingChart;
