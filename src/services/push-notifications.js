/**
 * Push Notifications Service
 * 
 * Handles push notification subscriptions, permissions, and delivery
 * for StyleSnap PWA.
 * 
 * @module services/push-notifications
 */

// VAPID public key (generate at https://web-push-codelab.glitch.me/)
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  FRIEND_REQUEST: 'friend_request',
  FRIEND_ACCEPTED: 'friend_accepted',
  OUTFIT_LIKE: 'outfit_like',
  OUTFIT_COMMENT: 'outfit_comment',
  DAILY_SUGGESTION: 'daily_suggestion',
  WEATHER_ALERT: 'weather_alert',
  QUOTA_WARNING: 'quota_warning'
};

/**
 * Check if push notifications are supported
 * 
 * @returns {boolean} True if supported
 */
export function isPushNotificationSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Get current notification permission status
 * 
 * @returns {string} 'granted', 'denied', or 'default'
 */
export function getNotificationPermission() {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from user
 * 
 * @returns {Promise<string>} Permission status
 * 
 * @example
 * const permission = await requestNotificationPermission();
 * if (permission === 'granted') {
 *   console.log('Notifications enabled!');
 * }
 */
export async function requestNotificationPermission() {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications not supported');
  }
  
  // Request permission
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    console.log('[Notifications] Permission granted');
    await subscribeToPushNotifications();
  } else if (permission === 'denied') {
    console.log('[Notifications] Permission denied');
  }
  
  return permission;
}

/**
 * Convert VAPID key from base64 to Uint8Array
 * 
 * @param {string} base64String - VAPID public key in base64
 * @returns {Uint8Array} Key as Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * Subscribe to push notifications
 * 
 * @returns {Promise<PushSubscription>} Push subscription object
 * 
 * @example
 * const subscription = await subscribeToPushNotifications();
 * console.log('Subscribed:', subscription.endpoint);
 */
export async function subscribeToPushNotifications() {
  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      console.log('[Notifications] Already subscribed');
      return subscription;
    }
    
    // Subscribe to push notifications
    const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });
    
    console.log('[Notifications] Subscribed successfully');
    
    // Send subscription to server
    await sendSubscriptionToServer(subscription);
    
    return subscription;
  } catch (error) {
    console.error('[Notifications] Subscription failed:', error);
    throw error;
  }
}

/**
 * Unsubscribe from push notifications
 * 
 * @returns {Promise<boolean>} True if unsubscribed successfully
 */
export async function unsubscribeFromPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      return true;
    }
    
    // Unsubscribe
    await subscription.unsubscribe();
    
    // Remove subscription from server
    await removeSubscriptionFromServer(subscription);
    
    console.log('[Notifications] Unsubscribed successfully');
    return true;
  } catch (error) {
    console.error('[Notifications] Unsubscribe failed:', error);
    return false;
  }
}

/**
 * Send push subscription to server
 * 
 * @param {PushSubscription} subscription - Push subscription object
 * @returns {Promise<void>}
 */
async function sendSubscriptionToServer(subscription) {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({
        subscription: subscription.toJSON()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save subscription');
    }
    
    console.log('[Notifications] Subscription saved to server');
  } catch (error) {
    console.error('[Notifications] Failed to save subscription:', error);
    throw error;
  }
}

/**
 * Remove push subscription from server
 * 
 * @param {PushSubscription} subscription - Push subscription object
 * @returns {Promise<void>}
 */
async function removeSubscriptionFromServer(subscription) {
  try {
    const response = await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove subscription');
    }
    
    console.log('[Notifications] Subscription removed from server');
  } catch (error) {
    console.error('[Notifications] Failed to remove subscription:', error);
  }
}

/**
 * Show a local notification
 * 
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 * @returns {Promise<void>}
 * 
 * @example
 * await showNotification('New Friend Request', {
 *   body: 'Jane Doe wants to be your friend',
 *   icon: '/icons/icon-192x192.png',
 *   badge: '/icons/badge-96x96.png',
 *   tag: 'friend-request-123',
 *   data: { type: 'friend_request', id: '123' }
 * });
 */
export async function showNotification(title, options = {}) {
  if (!isPushNotificationSupported()) {
    console.warn('[Notifications] Not supported');
    return;
  }
  
  if (Notification.permission !== 'granted') {
    console.warn('[Notifications] Permission not granted');
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    const defaultOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-96x96.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      silent: false
    };
    
    await registration.showNotification(title, {
      ...defaultOptions,
      ...options
    });
    
    console.log('[Notifications] Notification shown:', title);
  } catch (error) {
    console.error('[Notifications] Failed to show notification:', error);
  }
}

/**
 * Get notification preferences for user
 * 
 * @returns {Promise<Object>} Notification preferences
 */
export async function getNotificationPreferences() {
  try {
    const response = await fetch('/api/user/notification-preferences', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get preferences');
    }
    
    return await response.json();
  } catch (error) {
    console.error('[Notifications] Failed to get preferences:', error);
    // Return default preferences
    return {
      friend_requests: true,
      outfit_likes: true,
      outfit_comments: true,
      daily_suggestions: true,
      weather_alerts: false,
      quota_warnings: true
    };
  }
}

/**
 * Update notification preferences
 * 
 * @param {Object} preferences - Notification preferences
 * @returns {Promise<Object>} Updated preferences
 * 
 * @example
 * await updateNotificationPreferences({
 *   friend_requests: true,
 *   outfit_likes: false,
 *   daily_suggestions: true
 * });
 */
export async function updateNotificationPreferences(preferences) {
  try {
    const response = await fetch('/api/user/notification-preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(preferences)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update preferences');
    }
    
    return await response.json();
  } catch (error) {
    console.error('[Notifications] Failed to update preferences:', error);
    throw error;
  }
}

/**
 * Schedule daily outfit suggestion notification
 * 
 * @param {string} time - Time in HH:MM format (e.g., '08:00')
 * @returns {Promise<void>}
 */
export async function scheduleDailySuggestion(time) {
  try {
    const response = await fetch('/api/notifications/schedule-daily', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ time })
    });
    
    if (!response.ok) {
      throw new Error('Failed to schedule notification');
    }
    
    console.log('[Notifications] Daily suggestion scheduled for', time);
  } catch (error) {
    console.error('[Notifications] Failed to schedule daily suggestion:', error);
    throw error;
  }
}

/**
 * Test notification (for settings page)
 * 
 * @returns {Promise<void>}
 */
export async function sendTestNotification() {
  await showNotification('StyleSnap Test', {
    body: 'Notifications are working! You\'ll receive updates about friend requests, likes, and more.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-96x96.png',
    tag: 'test-notification',
    requireInteraction: false
  });
}

/**
 * Initialize push notifications on app load
 * 
 * @returns {Promise<void>}
 */
export async function initializePushNotifications() {
  if (!isPushNotificationSupported()) {
    console.log('[Notifications] Push notifications not supported');
    return;
  }
  
  // Check current permission
  const permission = getNotificationPermission();
  
  if (permission === 'granted') {
    // Subscribe if not already subscribed
    try {
      await subscribeToPushNotifications();
    } catch (error) {
      console.error('[Notifications] Auto-subscribe failed:', error);
    }
  }
  
  // Listen for service worker messages
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        console.log('[Notifications] Notification clicked:', event.data);
        // Handle notification click (e.g., navigate to specific page)
        handleNotificationClick(event.data);
      }
    });
  }
}

/**
 * Handle notification click events
 * 
 * @param {Object} data - Notification data
 */
function handleNotificationClick(data) {
  const { type, url } = data;
  
  switch (type) {
    case NOTIFICATION_TYPES.FRIEND_REQUEST:
      window.location.href = '/friends?tab=requests';
      break;
      
    case NOTIFICATION_TYPES.OUTFIT_LIKE:
    case NOTIFICATION_TYPES.OUTFIT_COMMENT:
      if (url) {
        window.location.href = url;
      }
      break;
      
    case NOTIFICATION_TYPES.DAILY_SUGGESTION:
      window.location.href = '/suggestions?weather=true';
      break;
      
    default:
      console.log('[Notifications] Unknown notification type:', type);
  }
}
