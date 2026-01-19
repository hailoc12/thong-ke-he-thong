import { Tag } from 'antd';
import { colors, borderRadius } from '../../theme/tokens';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'warning' | 'pending' | 'maintenance';
  text?: string;
  size?: 'default' | 'small';
  icon?: React.ReactNode;
}

/**
 * StatusBadge - Consistent status badge with accessibility-first design
 *
 * Provides color-coded status indicators with:
 * - High contrast colors for accessibility
 * - Clear text labels
 * - Optional icons
 * - Multiple sizes
 */
const statusConfig = {
  active: {
    color: colors.status.active,
    bgColor: colors.success.bg,
    label: 'Hoạt động',
  },
  inactive: {
    color: colors.status.inactive,
    bgColor: colors.error.bg,
    label: 'Ngừng hoạt động',
  },
  warning: {
    color: colors.status.warning,
    bgColor: colors.warning.bg,
    label: 'Cảnh báo',
  },
  pending: {
    color: colors.status.pending,
    bgColor: colors.warning.bg,
    label: 'Chờ xử lý',
  },
  maintenance: {
    color: colors.status.maintenance,
    bgColor: colors.secondary.bg,
    label: 'Bảo trì',
  },
};

const StatusBadge = ({
  status,
  text,
  size = 'default',
  icon,
}: StatusBadgeProps) => {
  const config = statusConfig[status];
  const displayText = text || config.label;

  return (
    <Tag
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        border: `1px solid ${config.color}20`,
        borderRadius: size === 'small' ? borderRadius.sm : borderRadius.base,
        fontSize: size === 'small' ? '12px' : '14px',
        fontWeight: 500,
        padding: size === 'small' ? '2px 8px' : '4px 12px',
        margin: 0,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      {icon}
      {displayText}
    </Tag>
  );
};

export default StatusBadge;
