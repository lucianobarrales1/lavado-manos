// Service worker del panel: permite instalarlo como aplicación y abre el panel al tocar un aviso.
const CACHE = 'panel-v10';
const OFFLINE = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Panel Lavado de Manos</title><body style="font:17px system-ui;padding:24px;background:#F2F5F7;color:#13222D"><h2>Sin conexión</h2><p>El panel necesita internet para mostrar el estado del personal. Revisá la conexión y volvé a intentar.</p><button onclick="location.reload()" style="padding:12px 18px;border-radius:10px;border:0;background:#1F4E79;color:#fff;font-weight:700">Reintentar</button></body>';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));

// Siempre se usa la versión publicada (red primero). Sin internet, muestra un aviso en vez de una pantalla en blanco.
self.addEventListener('fetch', e => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(() => new Response(OFFLINE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })));
});

// Al tocar un aviso: enfoca el panel si ya está abierto; si no, lo abre.
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if (c.url.startsWith(self.registration.scope)) { try { await c.focus(); } catch (_) {} return; }
    }
    await self.clients.openWindow(url);
  })());
});
