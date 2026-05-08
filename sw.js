const CACHE_NAME = 'champions-v1';
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalação e Cache (com proteção contra erros)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Usamos um map para tentar baixar um por um
      // Assim, se um ícone faltar, o resto do App ainda funciona
      return Promise.all(
        assets.map(url => {
          return cache.add(url).catch(err => console.log('Erro ao cachear:', url, err));
        })
      );
    })
  );
});

// Ativação: Limpa caches antigos se você mudar o nome da versão
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

// Intercepta as requisições para rodar offline
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request).catch(() => {
        // Fallback caso falhe o fetch e não tenha no cache
      });
    })
  );
});