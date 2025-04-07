import React from 'react';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'body-sm' | 'caption';
  className?: string;
  isGradient?: boolean;
  style?: React.CSSProperties;
}

const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  className = '',
  isGradient = false,
  style = {},
}) => {
  // Base styles for each variant
  const styles = {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-bold',
    h3: 'text-2xl font-semibold',
    h4: 'text-xl font-semibold',
    body: 'text-base',
    'body-sm': 'text-sm',
    caption: 'text-xs text-gray-500 dark:text-gray-400',
  };

  // Add gradient text if needed
  const gradientClass = isGradient ? 'gradient-text gradient-primary' : '';

  // Determine which HTML element to use
  const Component = variant.startsWith('h') 
    ? variant 
    : variant === 'body' || variant === 'body-sm' 
      ? 'p' 
      : 'span';

  return React.createElement(
    Component,
    {
      className: `${styles[variant]} ${gradientClass} ${className}`,
      style: style,
    },
    children
  );
};

export default Typography;