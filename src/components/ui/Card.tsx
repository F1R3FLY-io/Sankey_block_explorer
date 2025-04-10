import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  isHoverable?: boolean;
  isGradientBorder?: boolean;
  style?: React.CSSProperties;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  'data-testid'?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  isHoverable = false,
  isGradientBorder = false,
  style = {},
  onClick,
  'data-testid': testId,
}) => {
  const hoverableStyles = isHoverable
    ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1'
    : '';

  const gradientBorderStyles = isGradientBorder
    ? 'border-0 before:absolute before:inset-0 before:p-[2px] before:rounded-lg before:gradient-primary before:-z-10'
    : 'border border-gray-200 dark:border-gray-700';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative rounded-lg overflow-hidden bg-neutral-900 shadow-[0_0_0_1px_rgba(255,255,255,0.1)] ${hoverableStyles} ${isGradientBorder ? '' : gradientBorderStyles} ${className}`}
      style={style}
      onClick={onClick}
      data-testid={testId}
    >
      {title && (
        <div className="py-4 px-6 border-b border-white/10">
          <h3 className="text-lg font-medium text-white m-0">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
};

export default Card;