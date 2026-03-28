import React from 'react';
import Card from '../components/ui/Card';

const updates = [
  {
    title: 'Trail Buddy launches personalized collections',
    date: 'March 2026',
    body: 'Hikers can now save favorites and organize routes into shareable trip collections.',
  },
  {
    title: 'Map-first discovery experience now live',
    date: 'March 2026',
    body: 'Search, filters, and route browsing now run through a redesigned split map + list flow.',
  },
];

const PressPage = () => {
  return (
    <section className='page-block'>
      <Card>
        <h1 className='page-title'>Press</h1>
        <p className='page-subtitle'>
          Product updates, release highlights, and media notes.
        </p>
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
