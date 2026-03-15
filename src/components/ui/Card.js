import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <article className={`ui-card ${className}`.trim()}>{children}</article>
  );
};

export default Card;
