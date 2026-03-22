import React from 'react';
import Card from '../components/ui/Card';

const AboutPage = () => {
  return (
    <section className='page-block'>
      <Card>
        <h1 className='page-title'>About Trail Buddy</h1>
        <p className='page-subtitle'>
          Trail Buddy helps people discover, evaluate, and plan outdoor routes
          with confidence and curiosity.
        </p>
      </Card>

      <div className='cards-grid'>
        <Card>
          <h2>Mission</h2>
          <p>
            Make trail planning safer, simpler, and more inspiring by combining
            route quality data, real community notes, and personal planning
            tools.
          </p>
        </Card>
        <Card>
          <h2>What We Build</h2>
          <p>
            A map-first discovery experience with rich trail profiles and trip
            collections that feel ready for real weekends outside.
          </p>
        </Card>
        <Card>
          <h2>Community</h2>
          <p>
            Every review, condition update, and saved route helps the next hiker
            head out with better context.
          </p>
        </Card>
      </div>
    </section>
  );
};

export default AboutPage;
