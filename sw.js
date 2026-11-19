// 앱 껍데기(아이콘/로딩화면)만 저장해두는 서비스 워커입니다.
// 회원 데이터는 항상 구글 앱스크립트에서 실시간으로 불러오며, 여기에 저장되지 않습니다.
// 파일을 수정해서 다시 올릴 때는 아래 버전 숫자를 하나 올려주세요 (v1 → v2).
const CACHE = 'gl-shell-v2';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon-64.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 같은 주소(깃허브 페이지)의 파일만 처리: 인터넷 우선, 안 되면 저장해둔 것 사용
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
  );
});
