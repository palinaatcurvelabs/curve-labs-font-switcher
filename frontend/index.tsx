import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Prevent browser from restoring scroll (can jump to bottom on refresh).
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}
// Ensure we never start at the end of the page on refresh.
// If there's a hash, App will scroll to it after mount.
window.scrollTo({ top: 0, left: 0 });

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

