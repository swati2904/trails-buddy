import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const SETTINGS_KEY = 'tb.ui.settings';

const defaultSettings = {
  defaultExploreView: 'split',
  defaultRadiusKm: '50',
};

const SettingsPage = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [savedNotice, setSavedNotice] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      setSettings((current) => ({ ...current, ...parsed }));
    } catch (error) {
      // Ignore invalid stored settings and keep defaults.
    }
  }, []);

  const updateSettings = (next) => {
    setSettings(next);
    setSavedNotice('');
  };

  const saveSettings = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSavedNotice('Settings saved.');
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    setSavedNotice('Preferences reset to defaults.');
  };

  return (
    <section className='page-block settings-page page-shell'>
      <Card className='settings-page__intro'>
        <h1 className='page-title'>Explore defaults</h1>
        <p className='page-subtitle'>
          Only real settings live here. These preferences are used directly on
          the Explore page.
        </p>
      </Card>

      <Card className='auth-form settings-page__form'>
        <label>
          <span>Default Explore layout</span>
          <select
            value={settings.defaultExploreView}
            onChange={(event) =>
              updateSettings({
                ...settings,
                defaultExploreView: event.target.value,
              })
            }
          >
            <option value='split'>Split (list + map)</option>
            <option value='list'>List only</option>
            <option value='map'>Map only</option>
          </select>
        </label>

        <label>
          <span>Default search radius</span>
          <select
            value={settings.defaultRadiusKm}
            onChange={(event) =>
              updateSettings({
                ...settings,
                defaultRadiusKm: event.target.value,
              })
            }
          >
            <option value='25'>25 km</option>
            <option value='50'>50 km</option>
            <option value='100'>100 km</option>
            <option value='200'>200 km</option>
            <option value='300'>300 km</option>
          </select>
        </label>

        <div className='feature-actions'>
          <Button onClick={saveSettings}>Save preferences</Button>
          <Button variant='secondary' onClick={resetSettings}>
            Reset
          </Button>
        </div>
        {savedNotice ? <p className='success-copy'>{savedNotice}</p> : null}
      </Card>
    </section>
  );
};

export default SettingsPage;
