import React from 'react';

const Chip = ({ children, tone = 'default', className = '' }) => {
  const toneClass = tone === 'default' ? '' : ` ui-chip--${tone}`;
  return (
    <span className={`ui-chip${toneClass} ${className}`.trim()}>
      {children}
    </span>
  );
};

export default Chip;
