import React from 'react';

const Chip = ({ children, tone = 'default', className = '' }) => {
  return (
    <span className={`ui-chip ui-chip--${tone} ${className}`.trim()}>
      {children}
    </span>
  );
};

export default Chip;
