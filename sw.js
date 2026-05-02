const CACHE_NAME = 'chakrawan-v2';
const ASSETS = [
  '/Chakrawan/',
  '/Chakrawan/index.html',
  'https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&family=Prompt:wght@700;800&family=Oswald:wght@600;700&display=swap'
];

// Install — cache assets
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      console.log('[SW] Caching assets');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — Network first, fallback to cache
self.addEventListener('fetch', function(e){
  // ไม่ cache Firebase/Google APIs
  if(e.request.url.includes('firebasedatabase') ||
     e.request.url.includes('script.google.com') ||
     e.request.url.includes('googleapis.com')){
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(function(res){
        var clone = res.clone();
        caches.open(CACHE_NAME).then(function(cache){
          cache.put(e.request, clone);
        });
        return res;
      })
      .catch(function(){
        return caches.match(e.request);
      })
  );
});
