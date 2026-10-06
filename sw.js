// Офлайн-режим: страница и иконки сохраняются на телефоне при первом открытии.
// Дальше «Мой день» открывается сразу из кэша — даже без интернета и VPN,
// а новая версия с сервера подтягивается в фоне и применяется при следующем запуске.
// Удаляем только свои старые кэши: у всех сайтов на github.io общий адрес,
// кэш «Моего зала» и других сайтов трогать нельзя.
const CACHE = 'moy-den-v1'
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('moy-den-') && k !== CACHE).map((k) => caches.delete(k))))
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
