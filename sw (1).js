// Service worker de la app del personal: recibe y muestra los avisos push.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }
  const red = d.level === 'red';
  e.waitUntil(self.registration.showNotification(d.title || 'Lavado de manos', {
    body: d.body || 'Te toca lavarte las manos.',
    tag: d.tag || 'lavado',
    renotify: true,
    requireInteraction: red,
    vibrate: red ? [500, 200, 500, 200, 900] : [300, 150, 300],
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    data: { url: './' }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    for (const w of ws) if ('focus' in w) return w.focus();
    return self.clients.openWindow('./');
  }));
});
