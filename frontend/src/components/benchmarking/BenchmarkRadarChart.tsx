import React from 'react';
import { Card, Typography } from 'antd';
import { Radar } from '@ant-design/charts';
import { mockBenchmarkMetrics } from '../../mocks';

const { Title } = Typography;

/**
 * Benchmark Radar Chart - So sánh Bộ KH&CN với trung bình ngành
 */
const BenchmarkRadarChart: React.FC = () => {
  // Nhóm các chỉ số theo danh mục và tính điểm trung bình
  const categories = ['Quản trị CNTT', 'Kiến trúc', 'Bảo mật', 'Vận hành', 'Đổi mới', 'Hiệu quả chi phí'];

  const chartData = categories.flatMap(category => {
    const categoryMetrics = mockBenchmarkMetrics.filter(m => m.category === category);

    // Tính điểm trung bình cho danh mục
    const boKHCNAvg = categoryMetrics.reduce((sum, m) => sum + m.boKHCN, 0) / categoryMetrics.length;
    const industryAvg = categoryMetrics.reduce((sum, m) => sum + m.average, 0) / categoryMetrics.length;
    const topPerformerAvg = categoryMetrics.reduce((sum, m) => sum + m.topPerformer, 0) / categoryMetrics.length;

    return [
      { category, value: boKHCNAvg, type: 'Bộ KH&CN' },
      { category, value: industryAvg, type: 'Trung bình ngành' },
      { category, value: topPerformerAvg, type: 'Tốt nhất ngành' }
    ];
  });

  const config = {
    data: chartData,
    xField: 'category',
    yField: 'value',
    seriesField: 'type',
    area: {},
    color: ['#1890ff', '#52c41a', '#722ed1'],
    meta: {
      value: {
        alias: 'Điểm số',
        min: 0,
        max: 100,
        nice: true
      }
    },
    xAxis: {
      line: null,
      tickLine: null,
      grid: {
        line: {
          style: {
            lineDash: null
          }
        }
      }
    },
    yAxis: {
      line: null,
      tickLine: null,
      grid: {
        line: {
          type: 'line',
          style: {
            lineDash: null
          }
        }
      }
    },
    point: {
      size: 3
    },
    legend: {
      position: 'bottom' as const
    }
  };

  return (
    <Card>
      <Title level={5} style={{ marginBottom: 24 }}>
        So sánh năng lực CNTT - Đa chiều
      </Title>
      <Radar {...config} height={400} />
    </Card>
  );
};

export default BenchmarkRadarChart;
