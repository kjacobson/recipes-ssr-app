const CACHE_NAME = '';
const CACHED_FILES = [];

/* -------------------- */
const errorPage = (error) => {
    return new Response(`<html lang="en"><head><meta charset="utf8" /></head><body><h1>Error: ${error}</h1></body></html>`);
};

const fromNetwork = (request, timeout) => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(reject, timeout);
        fetch(request).then((response) => {
            console.log("Retrieved " + request.url + " from network");
            clearTimeout(timeoutId);
            caches.open(CACHE_NAME).then((cache) => {
                const responseClone = response.clone();
                cache.put(request.url, response).then(() => {
                    console.log("Cached resource " + request.url);
                    resolve(responseClone);
                }, resolve);
            });
        }, (error) => {
            console.log(error);
            reject();
        });
    });
};
const fromCache = (request) => {
    return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((matching) => {
            console.log("Retrieved " + request.url + " from cache");
            return matching || Promise.reject('Requested resource (' + request.url + ') not found in service worker cache.');
        });
    });
};

const checkForNewDocument = (response) => {
    return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
            // alternately, write to and read from
            // IndexedDB from this file
            const message = {
                type: 'refresh',
                url: response.url,
                etag: response.headers.get('ETag')
            };
            client.postMessage(JSON.stringify(message));
        });
    });
};

self.addEventListener('fetch', (event) => {
    const path = new URL(event.request.url).pathname;
    event.respondWith(
        fromCache(event.request).catch(() => {
            console.log("Failed to retrieve " + event.request.url + " from cache. Fetching from network.");
            return fromNetwork(event.request, 3000);
        }).catch(errorPage)
    );

    if (navigator.onLine && ['/', '/index.html', '/index'].includes(path)) {
        event.waitUntil(
            fromNetwork(event.request, 3000).then(checkForNewDocument)
        );
    }
});


self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            let uncachedFiles = [
                '/',
                '/index.html'
            ];
            return Promise.all(
                CACHED_FILES.map((url) => {
                    return caches.match(url).then((response) => {
                        if (response) {
                            return cache.put(url, response);
                        } else {
                            uncachedFiles.push(url);
                            return Promise.resolve();
                        }
                    });
                })
            ).then(() => {
                return cache.addAll(uncachedFiles).catch(console.log);
            });
        }, (err) => {})
    );
});


const deleteOldCache = (cacheName) => {
    if (CACHE_NAME !== cacheName && cacheName.startsWith('topwords')) {
        return caches.delete(cacheName);
    }
};
    
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map(deleteOldCache)
            );
        })
    );
});
