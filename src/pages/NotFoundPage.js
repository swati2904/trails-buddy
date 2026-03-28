import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';

const NotFoundPage = () => {
  return (
    <section className='page-block'>
      <Card>
        <h1 className='page-title'>You wandered off the trail</h1>
        <p className='page-subtitle'>
          This page does not exist, but plenty of great trails still do.
        </p>
        <Link to='/explore'>Back to explore</Link>
      </Card>
    </section>
  );
};

export default NotFoundPage;
