import React from 'react';
import Card from '../components/ui/Card';

const AboutPage = () => {
  return (
    <section className='page-block'>
      <Card>
        <h1 className='page-title'>About Trailbuddy</h1>
        <p className='page-subtitle'>
          Trailbuddy helps people discover, evaluate, and plan outdoor routes
          with confidence.
        </p>
      </Card>

      <div className='cards-grid'>
        <Card>
          <h2>Mission</h2>
          <p>
            Make trail planning safer and faster by combining route quality
            data, community conditions, and personal list management.
          </p>
        </Card>
        <Card>
          <h2>What We Build</h2>
          <p>
            A modern discovery platform with map-first search, detailed trail
            profiles, and personalized planning tools.
          </p>
        </Card>
        <Card>
          <h2>Community</h2>
          <p>
            Every review and condition update improves route confidence for the
            next person.
          </p>
        </Card>
      </div>
    </section>
  );
};

export default AboutPage;
