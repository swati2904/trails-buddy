import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';

const NotFoundPage = () => {
  return (
    <section className='page-block'>
      <Card>
        <h1 className='page-title'>Page Not Found</h1>
        <p className='page-subtitle'>The route you requested does not exist.</p>
        <Link to='/explore'>Go to Explore</Link>
      </Card>
    </section>
  );
};

export default NotFoundPage;
