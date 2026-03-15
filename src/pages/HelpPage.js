import React from 'react';
import Card from '../components/ui/Card';

const faqs = [
  {
    q: 'How do I save a trail?',
    a: 'Open Explore or Trail Detail and use Save or Add To List while signed in.',
  },
  {
    q: 'Can I plan trips with multiple routes?',
    a: 'Yes. Create custom lists and assign trails into each list from Explore or Trail Detail.',
  },
  {
    q: 'Why do I not see some trail data?',
    a: 'Some trail metrics depend on backend availability and source completeness.',
  },
];

const HelpPage = () => {
  return (
    <section className='page-block'>
      <Card>
        <h1 className='page-title'>Help Center</h1>
        <p className='page-subtitle'>Guides for core workflows and common troubleshooting.</p>
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
