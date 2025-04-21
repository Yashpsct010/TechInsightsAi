export const checkNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const subscribeToPushNotifications = async () => {
  try {
    const hasPermission = await checkNotificationPermission();

    if (!hasPermission) {
      console.log("Notification permission denied");
      return false;
    }

    const registration = await navigator.serviceWorker.ready;

    // Check if push is supported
    if (!registration.pushManager) {
      console.log("Push notifications not supported");
      return false;
    }

    // Get subscription
    let subscription = await registration.pushManager.getSubscription();

    // If not subscribed, create new subscription
    if (!subscription) {
      // You would get these keys from your push notification server
      const vapidPublicKey = "YOUR_VAPID_PUBLIC_KEY";

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to your server
      await sendSubscriptionToServer(subscription);
    }

    return true;
  } catch (error) {
    console.error("Error subscribing to push notifications:", error);
    return false;
  }
};

// Helper function to convert base64 to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Send the subscription to your backend
async function sendSubscriptionToServer(subscription) {
  // Replace with your API endpoint
  const response = await fetch("/api/notifications/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscription),
  });

  return response.json();
}
