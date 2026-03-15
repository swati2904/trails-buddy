import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  return (
    <button
      type='button'
      className={`ui-btn ui-btn--${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
