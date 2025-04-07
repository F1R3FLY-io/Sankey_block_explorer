import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  isHoverable?: boolean;
  isGradientBorder?: boolean;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  isHoverable = false,
  isGradientBorder = false,
  style = {},
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
      className={`relative rounded-lg shadow-md overflow-hidden ${hoverableStyles} ${isGradientBorder ? '' : gradientBorderStyles} ${className}`}
      style={{ 
        backgroundColor: 'rgb(22, 30, 38)', 
        boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1)',
        ...style
      }}
    >
      {title && (
        <div style={{ 
          padding: '16px 24px', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 500, 
            color: 'white', 
            margin: 0 
          }}>{title}</h3>
        </div>
      )}
      <div style={{ padding: '24px' }}>
        {children}
      </div>
    </motion.div>
  );
};

export default Card;