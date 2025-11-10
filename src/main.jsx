import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';
import { subscribeToPushNotifications } from './services/notificationService'; // Import the service

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
        // Integrate notification service here
        subscribeToPushNotifications().then(subscribed => {
            if (subscribed) {
                console.log('Successfully subscribed to push notifications.');
            } else {
                console.log('Failed to subscribe to push notifications or permission denied.');
            }
        }).catch(error => {
            console.error('Error during push notification subscription:', error);
        });
    }
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
