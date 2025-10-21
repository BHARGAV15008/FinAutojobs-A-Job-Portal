import React from 'react';
import { theme } from '../../theme';

const Card = ({ 
  children, 
  variant = 'default', 
  className = '', 
  hover = true,
  ...props 
}) => {
  const baseClasses = theme.components.card.variants[variant] || theme.components.card.variants.default;
  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1' : '';
  
  const cardClasses = `
    ${baseClasses}
    ${hoverClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;