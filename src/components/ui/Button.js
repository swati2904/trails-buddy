import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  return (
    <button
      type='button'
      className={`ui-btn ui-btn--${variant} ui-btn--${size} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
