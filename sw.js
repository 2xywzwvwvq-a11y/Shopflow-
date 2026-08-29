const SHELL_CACHE = 'shopflow-shell-v2';
const RUNTIME_CACHE = 'shopflow-runtime-v2';
const KEEP = [SHELL_CACHE, RUNTIME_CACHE];

const SHELL = [
  './',
  './index.html',
  './shopflow.html',
  './manifest.webmanifest',
  './shopflow-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    // One unreachable file must not stop the worker from installing.
    await Promise.all(SHELL.map(url => cache.add(url).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => !KEEP.includes(k)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Script tags are no-cors requests, so gstatic replies are opaque: status 0
// and ok false, but still storable and replayable.
function storable(response) {
  return !!response && (response.ok || response.type === 'opaque');
}

async function staleWhileRevalidate(event, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(event.request);
  const network = fetch(event.request).then(response => {
    if (storable(response)) cache.put(event.request, response.clone());
    return response;
  });

  if (cached) {
    event.waitUntil(network.catch(() => {}));
    return cached;
  }
  try {
    return await network;
  } catch (err) {
    if (event.request.mode === 'navigate') {
      const shell = await cache.match('./shopflow.html');
      if (shell) return shell;
    }
    throw err;
  }
}

async function cacheFirst(event, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(event.request);
  if (cached) return cached;
  const response = await fetch(event.request);
  if (storable(response)) cache.put(event.request, response.clone());
  return response;
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  if (url.origin === self.location.origin) {
    // Serve instantly from cache, refresh in the background, so a deploy
    // lands on the next open instead of blocking this one.
    event.respondWith(staleWhileRevalidate(event, SHELL_CACHE));
    return;
  }

  if (url.hostname === 'www.gstatic.com' && url.pathname.includes('/firebasejs/')) {
    event.respondWith(cacheFirst(event, RUNTIME_CACHE));
    return;
  }

  // Database traffic goes straight to the network, cache untouched.
});
