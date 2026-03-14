import React from 'react';
import Card from '../components/ui/Card';

const SimplePage = ({ title, subtitle }) => {
  return (
    <section className='page-block'>
      <Card>
        <h1 className='page-title'>{title}</h1>
        <p className='page-subtitle'>{subtitle}</p>
      </Card>
    </section>
  );
};

export default SimplePage;
