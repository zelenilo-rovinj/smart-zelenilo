const CACHE = 'smart-zelenilo-v1';
const FILES = ['./index.html','./manifest.json','./icon-192.png','./icon-512.png','./favicon.ico'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if(url.hostname.includes('firebase') || url.hostname.includes('googleapis') || 
     url.hostname.includes('gstatic') || e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached){
        fetch(e.request).then(r => { if(r&&r.status===200) caches.open(CACHE).then(c=>c.put(e.request,r)); }).catch(()=>{});
        return cached;
      }
      return fetch(e.request).then(r => {
        if(r&&r.status===200){ const cl=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,cl)); }
        return r;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

self.addEventListener('push', e => {
  if(!e.data) return;
  const d = e.data.json();
  e.waitUntil(self.registration.showNotification(d.title||'Smart Zelenilo', {
    body: d.body||'', icon: './icon-192.png', badge: './icon-192.png', tag: 'sz', renotify: true
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./index.html'));
});
