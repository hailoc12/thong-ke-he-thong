import React from 'react';
import { Card, Typography, Space, Tag } from 'antd';
import { Column } from '@ant-design/charts';
import { mockCostForecast } from '../../mocks';
import { ArrowUpOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * Cost Forecast Chart - Biểu đồ dự báo chi phí CNTT
 */
const CostForecastChart: React.FC = () => {
  // Transform data for stacked column chart
  const chartData = mockCostForecast.flatMap((item) => [
    { year: item.year, category: 'Phát triển', value: item.development },
    { year: item.year, category: 'Bảo trì', value: item.maintenance },
    { year: item.year, category: 'Hạ tầng', value: item.infrastructure },
    { year: item.year, category: 'Giấy phép', value: item.license }
  ]);

  const config = {
    data: chartData,
    xField: 'year',
    yField: 'value',
    seriesField: 'category',
    isStack: true,
    columnStyle: {
      radius: [4, 4, 0, 0]
    },
    color: ['#1890ff', '#52c41a', '#faad14', '#722ed1'],
    legend: {
      position: 'top-right' as const
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${parseFloat(v).toFixed(0)}B`
      }
    },
    tooltip: {
      formatter: (datum: any) => ({
        name: datum.category,
        value: `${datum.value.toFixed(1)} tỷ VNĐ`
      })
    },
    label: false,
    height: 350,
    animation: {
      appear: {
        animation: 'scale-in-y',
        duration: 1000
      }
    }
  };

  // Calculate totals and trends
  const currentYear = mockCostForecast[0];
  const nextYear = mockCostForecast[1];
  const growthRate = ((nextYear.total - currentYear.total) / currentYear.total * 100).toFixed(1);

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Header */}
        <div>
          <Title level={5} style={{ marginBottom: 8 }}>
            Dự báo chi phí CNTT (Dự báo 5 năm)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Dự báo chi phí CNTT dựa trên xu hướng lịch sử và kế hoạch triển khai
          </Text>
        </div>

        {/* Key Metrics */}
        <Space size="large" wrap>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tổng {currentYear.year}
            </Text>
            <br />
            <Text strong style={{ fontSize: 20, color: '#1890ff' }}>
              {currentYear.total.toFixed(1)}B VNĐ
            </Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Dự báo {nextYear.year}
            </Text>
            <br />
            <Text strong style={{ fontSize: 20, color: '#52c41a' }}>
              {nextYear.total.toFixed(1)}B VNĐ
            </Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tăng trưởng hàng năm
            </Text>
            <br />
            <Tag
              icon={<ArrowUpOutlined />}
              color={parseFloat(growthRate) > 10 ? 'red' : 'green'}
              style={{ fontSize: 14, padding: '4px 12px' }}
            >
              +{growthRate}%
            </Tag>
          </div>
        </Space>

        {/* Chart */}
        <Column {...config} />

        {/* Category Breakdown for Latest Year */}
        <div>
          <Text strong style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
            Phân bổ {mockCostForecast[mockCostForecast.length - 1].year}:
          </Text>
          <Space wrap>
            <Tag color="blue">Phát triển: {mockCostForecast[mockCostForecast.length - 1].development}B</Tag>
            <Tag color="green">Bảo trì: {mockCostForecast[mockCostForecast.length - 1].maintenance}B</Tag>
            <Tag color="orange">Hạ tầng: {mockCostForecast[mockCostForecast.length - 1].infrastructure}B</Tag>
            <Tag color="purple">Giấy phép: {mockCostForecast[mockCostForecast.length - 1].license}B</Tag>
          </Space>
        </div>

        {/* Confidence Interval Note */}
        <Text type="secondary" style={{ fontSize: 11, fontStyle: 'italic' }}>
          📊 Dự báo bao gồm khoảng tin cậy 90%. Chi phí thực tế có thể dao động ±{(((currentYear.confidenceInterval?.high || 0) - (currentYear.confidenceInterval?.low || 0)) / 2).toFixed(1)}B VNĐ
        </Text>
      </Space>
    </Card>
  );
};

export default CostForecastChart;
