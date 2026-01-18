import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel
} from 'reactflow';
import type { Node, Edge, NodeTypes } from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, Typography, Tag, Space } from 'antd';
import { mockSystemNodes, mockSystemLinks } from '../../mocks';

const { Title, Text } = Typography;

/**
 * Custom node component for systems
 */
const SystemNode: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: 8,
        background: data.color,
        border: '2px solid rgba(0,0,0,0.1)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        minWidth: 150,
        maxWidth: 200
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: '#fff' }}>
        {data.name}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)' }}>
        {data.tech}
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
        {data.orgName}
      </div>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  systemNode: SystemNode
};

interface SystemLandscapeGraphProps {
  height?: number;
}

/**
 * Interactive system landscape graph showing systems and their integrations
 */
const SystemLandscapeGraph: React.FC<SystemLandscapeGraphProps> = ({ height = 600 }) => {
  // Convert mock data to ReactFlow format
  const nodes: Node[] = useMemo(() => {
    return mockSystemNodes.map((node, index) => ({
      id: node.id,
      type: 'systemNode',
      position: {
        // Simple circular layout
        x: 400 + 350 * Math.cos((index / mockSystemNodes.length) * 2 * Math.PI),
        y: 300 + 300 * Math.sin((index / mockSystemNodes.length) * 2 * Math.PI)
      },
      data: {
        name: node.name,
        tech: node.tech,
        color: node.color,
        orgName: node.orgName
      }
    }));
  }, []);

  const edges: Edge[] = useMemo(() => {
    const edgeTypeLabelsMap: Record<string, string> = {
      'API': 'API',
      'SSO': 'SSO',
      'Database': 'Cơ sở dữ liệu',
      'Data Sync': 'Đồng bộ dữ liệu'
    };

    return mockSystemLinks.map((edge, index) => ({
      id: `edge-${index}`,
      source: edge.source,
      target: edge.target,
      label: edgeTypeLabelsMap[edge.type] || edge.type,
      type: 'smoothstep',
      animated: edge.type === 'API',
      style: {
        stroke: edge.type === 'API' ? '#1890ff' :
                edge.type === 'SSO' ? '#52c41a' :
                edge.type === 'Database' ? '#fa8c16' : '#722ed1',
        strokeWidth: edge.strength
      },
      labelStyle: { fontSize: 10, fill: '#666' },
      labelBgStyle: { fill: '#fff' }
    }));
  }, []);

  const edgeTypeColors = {
    'API': '#1890ff',
    'SSO': '#52c41a',
    'Cơ sở dữ liệu': '#fa8c16',
    'Đồng bộ dữ liệu': '#722ed1'
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <Title level={5} style={{ marginBottom: 8 }}>
            Bản đồ hệ thống & Tích hợp
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Trực quan hóa tương tác của {mockSystemNodes.length} hệ thống và {mockSystemLinks.length} điểm tích hợp
          </Text>
        </div>

        <Space wrap>
          <Text strong style={{ fontSize: 12 }}>Chú thích:</Text>
          {Object.entries(edgeTypeColors).map(([type, color]) => (
            <Tag key={type} color={color} style={{ fontSize: 11 }}>
              {type}
            </Tag>
          ))}
        </Space>

        <div style={{ height, border: '1px solid #d9d9d9', borderRadius: 8 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background />
            <Controls />
            <MiniMap
              nodeStrokeWidth={3}
              zoomable
              pannable
              style={{ height: 100, width: 150 }}
            />
            <Panel position="top-right" style={{ background: 'white', padding: 8, borderRadius: 4 }}>
              <Space direction="vertical" size={2}>
                <Text style={{ fontSize: 11 }}>
                  <strong>{mockSystemNodes.length}</strong> Hệ thống
                </Text>
                <Text style={{ fontSize: 11 }}>
                  <strong>{mockSystemLinks.length}</strong> Tích hợp
                </Text>
              </Space>
            </Panel>
          </ReactFlow>
        </div>

        <Text type="secondary" style={{ fontSize: 11, fontStyle: 'italic' }}>
          💡 Kéo thả để sắp xếp lại, cuộn để phóng to/thu nhỏ, kéo nền để di chuyển
        </Text>
      </Space>
    </Card>
  );
};

export default SystemLandscapeGraph;
