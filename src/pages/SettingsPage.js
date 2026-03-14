import React from 'react';
import Card from '../components/ui/Card';

const SettingsPage = () => {
  return (
    <section className='page-block'>
      <Card>
        <h1 className='page-title'>Settings</h1>
        <p className='page-subtitle'>Notification, locale, and security settings are next.</p>
      </Card>
    </section>
  );
};

export default SettingsPage;
