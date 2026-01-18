import React from 'react';
import { Card, Typography } from 'antd';
import { Radar } from '@ant-design/charts';
import { mockBenchmarkMetrics } from '../../mocks';

const { Title } = Typography;

/**
 * Benchmark Radar Chart - Compare Bộ KH&CN against industry averages
 */
const BenchmarkRadarChart: React.FC = () => {
  // Group metrics by category and calculate averages
  const categories = ['IT Governance', 'Architecture', 'Security', 'Operations', 'Innovation', 'Cost Efficiency'];

  const chartData = categories.flatMap(category => {
    const categoryMetrics = mockBenchmarkMetrics.filter(m => m.category === category);

    // Calculate average scores for the category
    const boKHCNAvg = categoryMetrics.reduce((sum, m) => sum + m.boKHCN, 0) / categoryMetrics.length;
    const industryAvg = categoryMetrics.reduce((sum, m) => sum + m.average, 0) / categoryMetrics.length;
    const topPerformerAvg = categoryMetrics.reduce((sum, m) => sum + m.topPerformer, 0) / categoryMetrics.length;

    return [
      { category, value: boKHCNAvg, type: 'Bộ KH&CN' },
      { category, value: industryAvg, type: 'Industry Average' },
      { category, value: topPerformerAvg, type: 'Top Performer' }
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
        alias: 'Score',
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
        Performance Benchmarking - Multi-Dimensional Comparison
      </Title>
      <Radar {...config} height={400} />
    </Card>
  );
};

export default BenchmarkRadarChart;
