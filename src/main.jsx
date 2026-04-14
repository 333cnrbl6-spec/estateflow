import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.css';
import { initializeErrorTracking } from '@/lib/errorTracking';

// Initialize error tracking
initializeErrorTracking();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);