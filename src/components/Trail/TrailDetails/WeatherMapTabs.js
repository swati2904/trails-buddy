import React, { useState } from 'react';

const WeatherMapTabs = ({ lat, lon }) => {
  const [activeTab, setActiveTab] = useState('temperature');
  const zoomLevel = 11;

  const weatherLayers = [
    { key: 'temperature', label: 'Temperature' },
    { key: 'wind', label: 'Wind' },
    { key: 'rain', label: 'Rainfall' },
    { key: 'clouds', label: 'Clouds' },
    { key: 'pressure', label: 'Pressure' },
    { key: 'waves', label: 'Waves' },
    { key: 'snow', label: 'Snow' },
    { key: 'dewpoint', label: 'Dew Point' },
    { key: 'humidity', label: 'Humidity' },
    { key: 'thunderstorm', label: 'Thunderstorm' },
  ];

  return (
    <div className='trail-weather'>
      <h2 style={{ textTransform: 'capitalize', marginBottom: '2rem' }}>
        {' '}
        Weather updates{' '}
      </h2>
      <style>
        {`
          .tabs {
            display: flex;
            border-bottom: 1px solid #ccc;
          }
          .tab-button {
            padding: 10px 20px;
            cursor: pointer;
            background: none;
            border: none;
            border-bottom: 2px solid transparent;
            outline: none;
          }
          .tab-button.active {
            border-bottom: 2px solid #007bff;
            font-weight: bold;
          }
        `}
      </style>
      <div className='tabs'>
        {weatherLayers.map((layer) => (
          <button
            key={layer.key}
            className={`tab-button ${activeTab === layer.key ? 'active' : ''}`}
            onClick={() => setActiveTab(layer.key)}
          >
            {layer.label}
          </button>
        ))}
      </div>

      <div
        style={{
          marginTop: '2rem',
          position: 'relative',
          paddingBottom: '56.25%', // 16:9 aspect ratio
          height: 0,
          overflow: 'hidden',
        }}
      >
        <iframe
          title={`weather-map-${activeTab}`}
          width='100%'
          height='50%'
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            border: 'none',
          }}
          src={`https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=${zoomLevel}&level=surface&overlay=${activeTab}&menu=false`}
        />
      </div>
    </div>
  );
};

export default WeatherMapTabs;
