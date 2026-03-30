import React, { useEffect, useState } from 'react';
import i18n from '../i18n';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const SETTINGS_KEY = 'tb.ui.settings';

const defaultSettings = {
  language: i18n.language?.startsWith('es') ? 'es' : 'en',
  units: 'metric',
  notifications: true,
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
      if (parsed?.language) {
        i18n.changeLanguage(parsed.language);
      }
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
    i18n.changeLanguage(settings.language);
    setSavedNotice('Settings saved.');
  };

  return (
    <section className='page-block settings-page'>
      <Card className='settings-page__intro'>
        <h1 className='page-title'>Trail preferences</h1>
        <p className='page-subtitle'>
          Personalize language, units, and alerts for your next adventure.
        </p>
      </Card>

      <Card className='auth-form settings-page__form'>
        <label>
          <span>Language</span>
          <select
            value={settings.language}
            onChange={(event) =>
              updateSettings({ ...settings, language: event.target.value })
            }
          >
            <option value='en'>English</option>
            <option value='es'>Spanish</option>
          </select>
        </label>

        <label>
          <span>Distance Units</span>
          <select
            value={settings.units}
            onChange={(event) =>
              updateSettings({ ...settings, units: event.target.value })
            }
          >
            <option value='metric'>Metric (km, m)</option>
            <option value='imperial'>Imperial (mi, ft)</option>
          </select>
        </label>

        <label className='checkbox-row'>
          <input
            type='checkbox'
            checked={settings.notifications}
            onChange={(event) =>
              updateSettings({
                ...settings,
                notifications: event.target.checked,
              })
            }
          />
          <span>
            Enable notifications for trail updates and review activity
          </span>
        </label>

        <Button onClick={saveSettings}>Save preferences</Button>
        {savedNotice ? <p className='success-copy'>{savedNotice}</p> : null}
      </Card>
    </section>
  );
};

export default SettingsPage;
