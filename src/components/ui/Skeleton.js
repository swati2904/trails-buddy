import React from 'react';

const Skeleton = ({ lines = 3 }) => {
  return (
    <div className='ui-skeleton' aria-hidden='true'>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className='ui-skeleton__line' />
      ))}
    </div>
  );
};

export default Skeleton;
