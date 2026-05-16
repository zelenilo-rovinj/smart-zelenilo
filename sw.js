importScripts('./config.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp(APP_CONFIG.firebase);

const messaging = firebase.messaging();

// Background push - kad je app zatvorena ili minimizirana
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || APP_CONFIG.appName;
  const body = payload.notification?.body || 'Nova obavijest';
  return self.registration.showNotification(title, {
    body: body,
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: 'sz-push',
    renotify: true,
    vibrate: [300, 100, 300, 100, 300],
    data: { url: './' }
  });
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || APP_CONFIG.appName, {
      body: data.body || '',
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: 'sz-push',
      renotify: true,
      vibrate: [300, 100, 300]
    })
  );
});

const CACHE = APP_CONFIG.cacheVersion;
const FILES = ['./index.html','./config.js','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if(url.hostname.includes('firebase')||url.hostname.includes('googleapis')||
     url.hostname.includes('gstatic')||e.request.method!=='GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).catch(() => caches.match('./index.html'));
    })
  );
});

// Klik na notifikaciju
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(list => {
      for(const c of list){
        if(c.url.includes(APP_CONFIG.appUrlPattern)) return c.focus();
      }
      return clients.openWindow('./index.html');
    })
  );
});

// Poruke od app
self.addEventListener('message', e => {
  if(e.data && e.data.type==='SHOW_NOTIFICATION'){
    self.registration.showNotification(e.data.title, {
      body: e.data.body,
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [300, 100, 300, 100, 300],
      tag: 'sz-msg-'+Date.now(),
      renotify: true
    });
  }
});
