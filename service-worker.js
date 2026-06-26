const CACHE="lista-v1";

const ficheiros=[
"./",
"./index.html",
"./manifest.json"
];

self.addEventListener(
"install",
e=>{

e.waitUntil(

caches.open(CACHE)
.then(
cache=>cache.addAll(ficheiros)
)

);

});

self.addEventListener(
"fetch",
e=>{

e.respondWith(

caches.match(
e.request
)
.then(
r=>r || fetch(e.request)
)

);

});
