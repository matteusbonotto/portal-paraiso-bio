const CACHE_NAME = 'paraisobio-v5.1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './assets/data.json',
    './assets/profile-placeholder.jpg',
    './assets/car.gif',
    './assets/favicon.png',
    './manifest.json'
];

// Install event
self.addEventListener('install', event => {
    console.log('Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cache aberto');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: Todos os arquivos foram cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Erro durante instalação:', error);
            })
    );
});

// Activate event
self.addEventListener('activate', event => {
    console.log('Service Worker: Ativando...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Ativado e controlando todas as páginas');
            return self.clients.claim();
        })
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    // Skip cross-origin requests and chrome-extension requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    console.log('Service Worker: Servindo do cache:', event.request.url);
                    return response;
                }

                // Fetch from network
                console.log('Service Worker: Buscando na rede:', event.request.url);
                return fetch(event.request)
                    .then(response => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache the fetched response
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Fallback to cached index.html for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});

// Message event for communication with main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
