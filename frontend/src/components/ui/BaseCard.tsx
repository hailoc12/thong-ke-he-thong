import { Card, type CardProps } from 'antd';
import { colors, shadows, borderRadius, transitions } from '../../theme/tokens';

interface BaseCardProps extends Omit<CardProps, 'hoverable' | 'variant'> {
  cardVariant?: 'default' | 'bordered' | 'elevated' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  children: React.ReactNode;
}

/**
 * BaseCard - Consistent card component with enhanced design system
 *
 * Variants:
 * - default: Standard card with subtle shadow
 * - bordered: Card with border instead of shadow
 * - elevated: Card with stronger shadow for emphasis
 * - flat: Flat card with no shadow or border
 *
 * Padding options:
 * - none: No padding
 * - sm: 16px padding
 * - md: 24px padding (default)
 * - lg: 32px padding
 */
const BaseCard = ({
  cardVariant = 'default',
  padding = 'md',
  hoverable = false,
  children,
  style,
  className,
  ...props
}: BaseCardProps) => {
  // Variant styles
  const variantStyles = {
    default: {
      boxShadow: shadows.card,
      border: `1px solid ${colors.border.light}`,
    },
    bordered: {
      boxShadow: 'none',
      border: `1px solid ${colors.border.main}`,
    },
    elevated: {
      boxShadow: shadows.lg,
      border: 'none',
    },
    flat: {
      boxShadow: 'none',
      border: 'none',
    },
  };

  // Padding styles
  const paddingStyles = {
    none: { padding: 0 },
    sm: { padding: '16px' },
    md: { padding: '24px' },
    lg: { padding: '32px' },
  };

  // Hover effect
  const hoverStyle = hoverable
    ? {
        transition: transitions.default,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: shadows.cardHover,
          transform: 'translateY(-2px)',
        },
      }
    : {};

  return (
    <Card
      style={{
        borderRadius: borderRadius.lg,
        backgroundColor: colors.background.paper,
        ...variantStyles[cardVariant],
        ...paddingStyles[padding],
        ...hoverStyle,
        ...style,
      }}
      className={className}
      bordered={cardVariant === 'bordered'}
      {...props}
    >
      {children}
    </Card>
  );
};

export default BaseCard;
