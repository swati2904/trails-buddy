import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const plans = [
  {
    id: 'free',
    name: 'Explorer',
    price: '$0',
    cadence: '/month',
    features: [
      'Trail discovery and search',
      'Save favorites and build lists',
      'Public reviews and conditions',
    ],
  },
  {
    id: 'plus',
    name: 'Trailbuddy Plus',
    price: '$7.99',
    cadence: '/month',
    featured: true,
    features: [
      'Offline map regions',
      'Advanced route planner and export',
      'Weather risk and timing guidance',
      'Priority support',
    ],
  },
  {
    id: 'pro',
    name: 'Trailbuddy Pro',
    price: '$14.99',
    cadence: '/month',
    features: [
      'Team and guide collaboration',
      'Bulk list management',
      'Shared trip planning workspaces',
      'API access for integrations',
    ],
  },
];

const PricingPage = () => {
  return (
    <section className='page-block'>
      <Card>
        <h1 className='page-title'>Pricing</h1>
        <p className='page-subtitle'>
          Choose a plan that matches your trail planning workflow.
        </p>
      </Card>

      <div className='cards-grid'>
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={
              plan.featured
                ? 'pricing-card pricing-card--featured'
                : 'pricing-card'
            }
          >
            <h2>{plan.name}</h2>
            <p className='pricing-price'>
              {plan.price}
              <span>{plan.cadence}</span>
            </p>
            <ul className='pricing-list'>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Button variant={plan.featured ? 'primary' : 'ghost'}>
              {plan.id === 'free' ? 'Start Free' : 'Choose Plan'}
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default PricingPage;
