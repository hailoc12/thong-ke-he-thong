import React from 'react';
import { Tag } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';

interface BetaBadgeProps {
  size?: 'small' | 'default' | 'large';
  style?: React.CSSProperties;
}

/**
 * BETA badge component for features in demonstration mode
 */
const BetaBadge: React.FC<BetaBadgeProps> = ({ size = 'default', style }) => {
  const fontSize = size === 'small' ? 10 : size === 'large' ? 14 : 12;

  return (
    <Tag
      icon={<ExperimentOutlined />}
      color="purple"
      style={{
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.5px',
        ...style
      }}
    >
      BETA
    </Tag>
  );
};

export default BetaBadge;
