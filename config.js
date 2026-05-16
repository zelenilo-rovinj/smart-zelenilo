// White-label configuration — update this file to deploy for a different client.
// NOTE: also update manifest.json (name, short_name, description, theme_color)
//       and replace icon-*.png files with client-specific icons.
const APP_CONFIG = {

  // --- Branding ---
  appName:     'Smart Zelenilo',
  appShortName:'Zelenilo',
  orgName:     'OJ Zelenilo • Rovinj',      // shown in app header
  orgSubtitle: 'Komunalni Servis • Rovinj', // shown on login screen
  logoEmoji:   '🌿',                   // 🌿
  footerText:  'Rovinj, Hrvatska • 2026.',

  // --- Theme colors ---
  colors: {
    navy:  '#1a3a1a',
    green: '#2d6a2d',
    gl:    '#4a9e4a',
    gold:  '#c8960c',
    goldL: '#f0b929',
    bg:    '#f0f4f0',
    gw:    '#e8f0e8',
    tx:    '#1a2e1a',
    ts:    '#4a6a4a',
    tm:    '#7a9a7a',
    bo:    '#c8dcc8',
  },

  // --- Firebase project ---
  firebase: {
    apiKey:            'AIzaSyBSbUaG8Mz5bkZgl-KGaiQx3AtzvjCDPLE',
    authDomain:        'zelenilo-rovinj.firebaseapp.com',
    databaseURL:       'https://zelenilo-rovinj-default-rtdb.europe-west1.firebasedatabase.app',
    projectId:         'zelenilo-rovinj',
    storageBucket:     'zelenilo-rovinj.firebasestorage.app',
    messagingSenderId: '1050602141317',
    appId:             '1:1050602141317:web:ad083652b2254eedf89bec',
  },

  // Firebase Cloud Messaging VAPID key — from Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
  vapidPublicKey: 'BOvQF3MNXQqEdWxqAZNCcR0mNlh2QgrGswgxcGfebztlWbwLlYGC6xsjqVb07YnFCEz9Fj2fy_TxOCDhgmPM2SU',

  // --- Realtime Database paths ---
  dbPaths: {
    kanban:        'zelenilo/kanban',
    archive:       'zelenilo/arhiva',
    pushSubs:      'zelenilo/push_subs',
    notifications: 'zelenilo/notifications',
  },

  // --- Users & auth ---
  users: {
    morris:    { name: 'Morris Peruško',    av: 'MP', admin: true },
    dean:      { name: 'Dean Vaci',         av: 'DV' },
    ervino:    { name: 'Ervino Rudan',      av: 'ER' },
    kristijan: { name: 'Kristijan Laginja', av: 'KL' },
  },
  password: 'ZELENILORV!',

  // --- Service worker ---
  cacheVersion:  'smart-zelenilo-v2',
  appUrlPattern: 'zelenilo-rovinj', // matched against window location in SW notificationclick
};

// Expose on window (browser) or global scope (service worker via importScripts)
if (typeof window !== 'undefined') window.APP_CONFIG = APP_CONFIG;
