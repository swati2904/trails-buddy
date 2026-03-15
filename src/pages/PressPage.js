import React from 'react';
import Card from '../components/ui/Card';

const updates = [
  {
    title: 'Trailbuddy ships account and list workflows',
    date: 'March 2026',
    body: 'Users can now save favorites and organize route collections in personal lists.',
  },
  {
    title: 'Map-first explore experience launched',
    date: 'March 2026',
    body: 'Search, filter, and sorting for the explore route has moved to the new UI architecture.',
  },
];

const PressPage = () => {
  return (
    <section className='page-block'>
      <Card>
        <h1 className='page-title'>Press</h1>
        <p className='page-subtitle'>Product updates, announcements, and media resources.</p>
      </Card>

      <div className='cards-grid'>
        {updates.map((item) => (
          <Card key={item.title}>
            <p className='press-date'>{item.date}</p>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default PressPage;
