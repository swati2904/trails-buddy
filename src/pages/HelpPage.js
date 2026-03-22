import React from 'react';
import Card from '../components/ui/Card';

const faqs = [
  {
    q: 'How do I save a trail for later?',
    a: 'Open Explore or a Trail Detail page, then use Save trail or Add To List while signed in.',
  },
  {
    q: 'Can I plan trips with multiple routes?',
    a: 'Yes. Create collections and add trails from Explore or Trail Detail to organize full-day adventures.',
  },
  {
    q: 'Why are some trail fields missing?',
    a: 'Some fields depend on source availability. When data is unavailable, Trail Buddy gracefully shows fallbacks instead of empty placeholders.',
  },
];

const HelpPage = () => {
  return (
    <section className='page-block'>
      <Card>
        <h1 className='page-title'>Help center</h1>
        <p className='page-subtitle'>
          Quick answers for searching, saving, and planning your next trail day.
        </p>
      </Card>

      {faqs.map((item) => (
        <Card key={item.q}>
          <h2>{item.q}</h2>
          <p>{item.a}</p>
        </Card>
      ))}
    </section>
  );
};

export default HelpPage;
