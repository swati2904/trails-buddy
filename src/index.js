import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider, defaultTheme } from '@adobe/react-spectrum';
import { BrowserRouter as Router } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider theme={defaultTheme}>
      <Router>
        <App />
      </Router>
    </Provider>
  </React.StrictMode>
);
