import React from 'react';
import { Button } from '@adobe/react-spectrum';

const CustomButton = ({
  variant = 'accent',
  onPress,
  children,
  style = {},
  ...props
}) => {
  return (
    <Button
      variant={variant}
      onPress={onPress}
      UNSAFE_style={{ ...style, borderRadius: '5px', padding: '10px 20px' }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
