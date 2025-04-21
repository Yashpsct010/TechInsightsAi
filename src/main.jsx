import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';

// Register service worker
const updateSW = registerSW({
    onNeedRefresh() {
        // Show a prompt to the user to refresh for new content
        if (confirm('New content available. Reload?')) {
            updateSW(true);
        }
    },
    onOfflineReady() {
        console.log('App ready to work offline');
        // You can show a notification to the user
    }
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
