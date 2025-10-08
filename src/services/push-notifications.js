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
    const { supabase } = await import('../config/supabase');
    
    const subscriptionData = subscription.toJSON();
    
    // Detect device information
    const deviceInfo = detectDeviceInfo();
    
    // Save subscription to database
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint: subscriptionData.endpoint,
        expiration_time: subscriptionData.expirationTime 
          ? new Date(subscriptionData.expirationTime).toISOString() 
          : null,
        p256dh: subscriptionData.keys.p256dh,
        auth: subscriptionData.keys.auth,
        user_agent: navigator.userAgent,
        device_type: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        is_active: true,
        last_used_at: new Date().toISOString()
      }, {
        onConflict: 'endpoint'
      });
    
    if (error) throw error;
    
    console.log('[Notifications] Subscription saved to server');
  } catch (error) {
    console.error('[Notifications] Failed to save subscription:', error);
    throw error;
  }
}

/**
 * Detect device information
 * 
 * @returns {Object} Device info
 */
function detectDeviceInfo() {
  const ua = navigator.userAgent;
  
  // Detect device type
  let deviceType = 'desktop';
  if (/Mobile|Android|iPhone/i.test(ua)) {
    deviceType = 'mobile';
  } else if (/Tablet|iPad/i.test(ua)) {
    deviceType = 'tablet';
  }
  
  // Detect browser
  let browser = 'unknown';
  if (ua.indexOf('Firefox') > -1) {
    browser = 'Firefox';
  } else if (ua.indexOf('Chrome') > -1) {
    browser = 'Chrome';
  } else if (ua.indexOf('Safari') > -1) {
    browser = 'Safari';
  } else if (ua.indexOf('Edge') > -1) {
    browser = 'Edge';
  }
  
  // Detect OS
  let os = 'unknown';
  if (ua.indexOf('Win') > -1) {
    os = 'Windows';
  } else if (ua.indexOf('Mac') > -1) {
    os = 'macOS';
  } else if (ua.indexOf('Linux') > -1) {
    os = 'Linux';
  } else if (ua.indexOf('Android') > -1) {
    os = 'Android';
  } else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
    os = 'iOS';
  }
  
  return { deviceType, browser, os };
}

/**
 * Remove push subscription from server
 * 
 * @param {PushSubscription} subscription - Push subscription object
 * @returns {Promise<void>}
 */
async function removeSubscriptionFromServer(subscription) {
  try {
    const { supabase } = await import('../config/supabase');
    
    // Delete subscription from database
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', subscription.endpoint);
    
    if (error) throw error;
    
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
    const { supabase } = await import('../config/supabase');
    
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .single();
    
    if (error) {
      // If no preferences found, return defaults
      if (error.code === 'PGRST116') {
        return {
          push_enabled: true,
          friend_requests: true,
          friend_accepted: true,
          outfit_likes: true,
          outfit_comments: true,
          item_likes: true,
          friend_outfit_suggestions: true,
          daily_suggestions: false,
          daily_suggestion_time: '08:00:00',
          weather_alerts: false,
          quota_warnings: true,
          quiet_hours_enabled: false,
          quiet_hours_start: '22:00:00',
          quiet_hours_end: '08:00:00'
        };
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('[Notifications] Failed to get preferences:', error);
    // Return default preferences
    return {
      push_enabled: true,
      friend_requests: true,
      friend_accepted: true,
      outfit_likes: true,
      outfit_comments: true,
      item_likes: true,
      friend_outfit_suggestions: true,
      daily_suggestions: false,
      daily_suggestion_time: '08:00:00',
      weather_alerts: false,
      quota_warnings: true,
      quiet_hours_enabled: false,
      quiet_hours_start: '22:00:00',
      quiet_hours_end: '08:00:00'
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
    const { supabase } = await import('../config/supabase');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
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
