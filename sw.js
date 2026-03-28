const CACHE = 'smart-zelenilo-v2';
const FILES = ['./index.html','./manifest.json','./icon-192.png','./icon-512.png','./favicon.ico'];

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
     url.hostname.includes('gstatic')||url.hostname.includes('fonts')||
     e.request.method!=='GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached){
        fetch(e.request).then(r=>{if(r&&r.status===200)caches.open(CACHE).then(c=>c.put(e.request,r));}).catch(()=>{});
        return cached;
      }
      return fetch(e.request).then(r=>{
        if(r&&r.status===200){const cl=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cl));}
        return r;
      }).catch(()=>caches.match('./index.html'));
    })
  );
});

// Push kad je app zatvorena
self.addEventListener('push', e => {
  let data = {title:'Smart Zelenilo', body:'Nova obavijest'};
  try { if(e.data) data = e.data.json(); } catch(err) { if(e.data) data.body = e.data.text(); }
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: 'sz-push',
      renotify: true,
      vibrate: [300, 100, 300, 100, 300],
      requireInteraction: false,
      data: { url: './' }
    })
  );
});

// Klik na notifikaciju - otvori app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(list => {
      for(const c of list){
        if(c.url.includes('index')||c.url.includes('smart-zelenilo')) return c.focus();
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
      tag: 'sz-msg-'+Date.now(),
      renotify: true,
      vibrate: [300, 100, 300, 100, 300],
      data: { url: './' }
    });
  }
});
