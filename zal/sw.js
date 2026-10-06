// «Мой зал» без интернета: при первом открытии страница и иконки сохраняются
// на телефоне, дальше открываются сразу из кэша, а новая версия подтягивается в фоне.
// Удаляем только свои старые кэши: у всех сайтов на github.io общий адрес,
// чужие кэши («Мой день» и другие) трогать нельзя.
const CACHE = 'moy-zal-v2'
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('moy-zal-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  e.respondWith((async () => {
    const cache = await caches.open(CACHE)
    const cached = await cache.match(e.request, { ignoreSearch: true })
    const update = fetch(e.request)
      .then((res) => { if (res.ok) cache.put(e.request, res.clone()); return res })
      .catch(() => cached)
    e.waitUntil(update.then(() => {}, () => {}))
    return cached || update
  })())
})
