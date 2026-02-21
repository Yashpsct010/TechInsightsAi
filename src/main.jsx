import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';

// Register service worker with immediate update check
const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
        // Show a prompt to the user to refresh for new content
        if (confirm('New content available. Reload?')) {
            updateSW(true);
        }
    },
    onOfflineReady() {
        console.log('App ready to work offline');
        // Push notification subscription should be triggered by a user action
        // (e.g., a button click), not automatically on load, to prevent browsers 
        // from blocking the permission prompt.
    }
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
