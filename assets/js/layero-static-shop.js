/* ═══════════════════════════════════════════════════════════════════
   LAYERO SHOP — közös logika
   Fejléc/lábléc injektálás, kosár (localStorage), oldal-renderelők.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STATIC_CFG = window.LayeroShopStatic || {};

  var CART_KEY = 'layero_shop_cart_v1';
  var WISH_KEY = 'sh_wishlist';
  var HEART_SVG = '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.6-9.3-9.2A5.2 5.2 0 0 1 12 6.1a5.2 5.2 0 0 1 9.3 4.7C19 15.4 12 20 12 20Z"/></svg>';

  /* ── segédek ─────────────────────────────────────────────────── */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function normalizeAssetUrl(value) {
    if (!value || /^(https?:|data:|\/wp-content\/|\/uploads\/)/.test(value)) return value;
    if (value.indexOf('/wp-content/') === 0) return value;
    if (value.indexOf('assets/') === 0 && STATIC_CFG.assetBase) return STATIC_CFG.assetBase + value.slice(7);
    return value;
  }
  function normalizePageUrl(value) {
    if (!value || value.charAt(0) === '#' || /^(mailto:|tel:|https?:|data:)/.test(value)) return value;
    var clean = value.replace(/^\.?\//, '');
    var parts = clean.split('?');
    var mapped = STATIC_CFG.urls && STATIC_CFG.urls[parts[0]];
    if (!mapped) return value;
    return mapped + (parts[1] ? '?' + parts[1] : '');
  }
  function fixStaticUrls(root) {
    $all('img[src]', root).forEach(function (img) {
      var next = normalizeAssetUrl(img.getAttribute('src'));
      if (next && next !== img.getAttribute('src')) img.setAttribute('src', next);
    });
    $all('a[href]', root).forEach(function (link) {
      var next = normalizePageUrl(link.getAttribute('href'));
      if (next && next !== link.getAttribute('href')) link.setAttribute('href', next);
    });
  }
  function prodById(id) {
    for (var i = 0; i < SHOP_PRODUCTS.length; i++) if (SHOP_PRODUCTS[i].id === id) return SHOP_PRODUCTS[i];
    return null;
  }
  function catById(id) {
    for (var i = 0; i < SHOP_CATS.length; i++) if (SHOP_CATS[i].id === id) return SHOP_CATS[i];
    return null;
  }
  function fmtAr(ar) { return ar > 0 ? ar + ' RON' : 'Ajánlat alapján'; }
  /* determinisztikus demo-értékelés a termék id-jából */
  function ratingOf(p) {
    var h = 0;
    for (var i = 0; i < p.id.length; i++) h = (h * 31 + p.id.charCodeAt(i)) >>> 0;
    return { r: ((46 + (h % 5)) / 10).toFixed(1), n: 9 + (h % 48) };
  }
  function rateHtml(p, link) {
    var rt = ratingOf(p);
    var full = Math.round(parseFloat(rt.r));
    var stars = '';
    for (var i = 0; i < 5; i++) stars += i < full ? '★' : '☆';
    return '<span class="sh-rate"><span class="stars">' + stars + '</span><b>' + rt.r + '</b>' +
      (link ? '<a href="#sh-velemenyek">(' + rt.n + ' értékelés)</a>' : '<span>(' + rt.n + ')</span>') +
    '</span>';
  }
  /* ár-blokk: akciós (áthúzott régi + piros most) vagy sima */
  function priceHtml(p) {
    if (p.ar <= 0) return '<span class="now">' + fmtAr(p.ar) + '</span>';
    if (p.regi_ar && p.regi_ar > p.ar) {
      return '<span class="now on-sale">' + p.ar + ' RON</span><span class="was">' + p.regi_ar + ' RON</span>';
    }
    return '<span class="now">' + p.ar + ' RON</span><small>-tól</small>';
  }
  function discountPct(p) {
    if (p.regi_ar && p.regi_ar > p.ar && p.ar > 0) return Math.round((1 - p.ar / p.regi_ar) * 100);
    return 0;
  }
  /* (a generált „X-en nézik most" típusú ál-sürgetés eltávolítva —
     kitalált számok bizalmat rombolnak és megtévesztő gyakorlatnak minősülnek) */
  var CART_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1.3 10.5a1.5 1.5 0 0 1-1.5 1.7H6.2a1.5 1.5 0 0 1-1.5-1.7L6 7Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>';
  var HONAPOK = ['jan.', 'febr.', 'márc.', 'ápr.', 'máj.', 'jún.', 'júl.', 'aug.', 'szept.', 'okt.', 'nov.', 'dec.'];
  function addWorkdays(days) {
    var d = new Date();
    while (days > 0) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) days--;
    }
    return d;
  }
  function fmtDatum(d) { return HONAPOK[d.getMonth()] + ' ' + d.getDate() + '.'; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function param(name) { return new URLSearchParams(location.search).get(name); }
  var scrollLockDepth = 0;
  var scrollLockPrev = '';
  function lockScroll() {
    if (scrollLockDepth === 0) {
      scrollLockPrev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    scrollLockDepth++;
  }
  function unlockScroll() {
    scrollLockDepth = Math.max(0, scrollLockDepth - 1);
    if (scrollLockDepth === 0) document.body.style.overflow = scrollLockPrev || '';
  }

  /* ── kereskedelmi konstansok ─────────────────────────────────── */
  var MIN_ORDER = 50;
  var FREE_SHIP = 200;
  var SHIP_FEE = 25;
  var GIFTWRAP_FEE = 15;
  var COUPONS = {
    LAYERO10: { tipus: 'pct', ertek: 10, cimke: '10% kedvezmény' },
    NYAR20:   { tipus: 'pct', ertek: 20, cimke: '20% nyári kedvezmény' },
    INGYEN:   { tipus: 'ship', ertek: 0, cimke: 'ingyenes szállítás' }
  };

  /* ── kosár ───────────────────────────────────────────────────── */
  function cartGet() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
  }
  function cartSet(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateBadge();
  }
  function cartAdd(id, qty, variant) {
    var items = cartGet();
    var key = id + '|' + (variant || '');
    var found = null;
    items.forEach(function (it) { if (it.key === key) found = it; });
    if (found) found.qty += qty;
    else items.push({ key: key, id: id, qty: qty, variant: variant || '' });
    cartSet(items);
  }

  /* kupon + ajándékcsomagolás állapot */
  function couponGet() { return (localStorage.getItem('sh_coupon') || '').toUpperCase(); }
  function couponSet(c) { if (c) localStorage.setItem('sh_coupon', c.toUpperCase()); else localStorage.removeItem('sh_coupon'); }
  function giftGet() { return localStorage.getItem('sh_giftwrap') === '1'; }
  function giftSet(on) { localStorage.setItem('sh_giftwrap', on ? '1' : '0'); }

  /* központi összegszámítás — drawer, kosár és pénztár közösen ezt hívja */
  function cartTotals() {
    var items = cartGet().map(function (it) {
      var p = prodById(it.id);
      return p ? { it: it, p: p, sor: p.ar * it.qty } : null;
    }).filter(Boolean);
    var subtotal = items.reduce(function (s, r) { return s + r.sor; }, 0);
    var count = items.reduce(function (s, r) { return s + r.it.qty; }, 0);
    var code = couponGet();
    var coupon = COUPONS[code] ? { code: code, def: COUPONS[code] } : null;
    var discount = 0, freeByCoupon = false;
    if (coupon) {
      if (coupon.def.tipus === 'pct') discount = Math.round(subtotal * coupon.def.ertek / 100);
      if (coupon.def.tipus === 'ship') freeByCoupon = true;
    }
    var gift = giftGet() ? GIFTWRAP_FEE : 0;
    // ingyenes szállítás a részösszeg alapján (a progress bar-ral egyezően)
    var shipping = (subtotal >= FREE_SHIP || freeByCoupon || !items.length) ? 0 : SHIP_FEE;
    var total = subtotal - discount + shipping + gift;
    return { items: items, subtotal: subtotal, count: count, coupon: coupon,
             discount: discount, gift: gift, shipping: shipping, total: total,
             freeByCoupon: freeByCoupon, belowMin: subtotal > 0 && subtotal < MIN_ORDER };
  }
  function cartCount() {
    return cartGet().reduce(function (n, it) { return n + it.qty; }, 0);
  }
  function updateBadge() {
    var badge = $('.sh-cart-badge');
    if (!badge) return;
    var n = cartCount();
    badge.textContent = n;
    badge.classList.toggle('is-on', n > 0);
  }

  /* ── kívánságlista ───────────────────────────────────────────── */
  function wishGet() {
    try { return JSON.parse(localStorage.getItem(WISH_KEY)) || []; }
    catch (e) { return []; }
  }
  function wishHas(id) { return wishGet().indexOf(id) !== -1; }
  function wishToggle(id) {
    var w = wishGet();
    var i = w.indexOf(id);
    if (i === -1) w.push(id); else w.splice(i, 1);
    localStorage.setItem(WISH_KEY, JSON.stringify(w));
    updateWishBadge();
    return i === -1;
  }
  function updateWishBadge() {
    var badge = $('.sh-wish-badge');
    if (!badge) return;
    var n = wishGet().length;
    badge.textContent = n;
    badge.classList.toggle('is-on', n > 0);
  }

  /* ── toast ───────────────────────────────────────────────────── */
  var toastT;
  function toast(msg) {
    var el = $('.sh-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'sh-toast';
      el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg><span></span>';
      document.body.appendChild(el);
    }
    $('span', el).textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { el.classList.remove('is-on'); }, 2400);
  }

  /* ── konfetti-zápor (sikeres rendelés ünneplése) ─────────────────── */
  function launchConfetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var layer = document.createElement('div');
    layer.className = 'sh-confetti-layer';
    layer.setAttribute('aria-hidden', 'true');
    var colors = ['#00c2e0', '#ff9f2d', '#f0c27a', '#0a7c92', '#ffffff', '#3d9a50'];
    for (var i = 0; i < 110; i++) {
      var c = document.createElement('i');
      c.className = 'sh-confetti';
      c.style.setProperty('--x', (Math.random() * 100).toFixed(1) + 'vw');
      c.style.setProperty('--d', (2.4 + Math.random() * 2.6).toFixed(2) + 's');
      c.style.setProperty('--r', Math.round(Math.random() * 720 - 360) + 'deg');
      c.style.setProperty('--s', (0.55 + Math.random() * 0.9).toFixed(2));
      c.style.setProperty('--w', Math.round(Math.random() * 120 - 60) + 'px');
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = (Math.random() * 0.8).toFixed(2) + 's';
      layer.appendChild(c);
    }
    document.body.appendChild(layer);
    setTimeout(function () { layer.remove(); }, 6500);
  }

  /* ── cookie sáv (első látogatáskor + láblécből újranyitható) ───── */
  function showCookie(delay) {
    var old = $('.sh-cookie');
    if (old) old.remove();
    var ck = document.createElement('div');
    ck.className = 'sh-cookie';
    ck.setAttribute('role', 'dialog');
    ck.setAttribute('aria-label', 'Sütik kezelése');
    var saved = localStorage.getItem('sh_cookie_ok');
    ck.innerHTML =
      '<p>Sütiket használunk, hogy a kosarad megmaradjon és jobbá tegyük az élményt. Részletek az <a href="../adatvedelem.html">adatvédelmi tájékoztatóban</a>.' +
        (saved ? ' <span class="sh-cookie__cur">Jelenlegi beállítás: <b>' + (saved === 'all' ? 'minden süti' : 'csak a szükségesek') + '</b>.</span>' : '') +
      '</p>' +
      '<div class="sh-cookie__actions">' +
        '<button class="sh-btn sh-btn--ghost" type="button" data-ck="min">Csak a szükségesek</button>' +
        '<button class="sh-btn sh-btn--white" type="button" data-ck="all">Elfogadom</button>' +
      '</div>';
    document.body.appendChild(ck);
    setTimeout(function () { ck.classList.add('is-on'); }, delay || 60);
    ck.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ck]');
      if (!b) return;
      localStorage.setItem('sh_cookie_ok', b.getAttribute('data-ck'));
      ck.classList.remove('is-on');
      setTimeout(function () { ck.remove(); }, 500);
    });
  }

  /* ── determinisztikus demo-tartalom (vélemények, Q&A) ──────────── */
  // seedelt ál-véletlen generátor egy stringből — így a demo "adatok"
  // oldalújratöltéskor is ugyanazok maradnak
  function seedRng(str, salt) {
    var h = (salt || 0) >>> 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return function () { h = (h * 1103515245 + 12345) >>> 0; return h / 4294967296; };
  }
  function shuffled(arr, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function daysAgoLabel(days) {
    var d = new Date(); d.setDate(d.getDate() - days);
    return d.getFullYear() + '. ' + HONAPOK[d.getMonth()] + ' ' + d.getDate() + '.';
  }
  var THUMB_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3Zm0 0 4.5-7a2 2 0 0 1 2 1.9V8h5a2 2 0 0 1 2 2.3l-1.3 8A2 2 0 0 1 19.2 20H7"/></svg>';
  var CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  var REVIEW_NAMES = ['Nagy Andrea', 'Kovács Péter', 'Tóth Réka', 'Szabó Márton', 'Kiss Blanka',
    'Varga Zsolt', 'Molnár Enikő', 'Balogh Dávid', 'Farkas Tünde', 'Simon Gergő',
    'Fekete Orsolya', 'Lakatos Bence', 'Papp Krisztina', 'Oláh Attila'];
  var REVIEW_TEXTS = [
    'Sokkal jobb a minőség élőben, mint a fotókon. A rétegek szinte láthatatlanok, tényleg igényes munka.',
    'Pontosan olyan lett, amilyennek elképzeltem — a személyre szabásnál minden apró kérésemre figyeltek.',
    'A megbeszélt határidő előtt megérkezett, gondosan becsomagolva. Ajándéknak tökéletes volt.',
    'A digitális előnézetet gyártás előtt elküldték jóváhagyásra, így semmi meglepetés nem ért. Nagyon korrekt.',
    'A világítás meleg és kellemes, este hangulatfénynek is remek. A család odáig van érte.',
    'Másodjára rendelek tőlük, és megint nem okoztak csalódást. Erős, strapabíró darab.',
    'Az ügyfélszolgálat gyorsan és emberi hangon válaszolt minden kérdésemre. Ritka ez manapság.',
    'Az ár-érték arány kiváló. Kaptam már drágább, de gyengébb minőségű ajándékot boltból.',
    'A felirat pont a megfelelő méretű és helyre került. Látszik, hogy odafigyelnek a részletekre.',
    'Kicsit tartottam a rendeléstől online, de teljesen feleslegesen — profi volt az egész folyamat.',
    'A csomagolás is igényes volt, semmi sérülés. Bátran ajánlom mindenkinek.',
    'Egyedi ötlettel kerestem meg őket, és pontosan azt kaptam vissza, amit fejben elképzeltem.'
  ];
  var QA_POOL = [
    { q: 'Mennyi idő alatt készül el, ha most rendelem?', a: 'A gyártási idő a terméknél feltüntetett munkanapokon belül van; a rendelés után e-mailben egyeztetjük a részleteket, és a pontos dátumot a visszaigazolóban is megkapod.' },
    { q: 'Tudok saját nevet / feliratot kérni rá?', a: 'Igen, a személyre szabás az árban van. A rendelés után egyeztetjük a pontos szöveget, és komplexebb darabnál digitális előnézetet küldünk jóváhagyásra.' },
    { q: 'Milyen anyagból készül, biztonságos gyerekeknek?', a: 'PLA biopolimerből nyomtatjuk, ami növényi alapú, szagtalan anyag. A világító daraboknál a LED alacsony hőmérsékletű, így gyerekszobába is nyugodtan ajánljuk.' },
    { q: 'Mi van, ha sérülten érkezik?', a: 'Gyártási vagy szállítási hibára cserét vagy teljes visszatérítést adunk — elég egy fotó a sérülésről, a többit mi intézzük.' },
    { q: 'Lehet ajándékként, díszcsomagolással kérni?', a: 'Igen, a pénztárnál választható ajándékcsomagolás díszdobozzal és kézzel írt üzenettel.' }
  ];

  // determinisztikus vélemény-halmaz egy termékhez (a csillag-átlagból)
  function reviewsFor(p) {
    var rt = ratingOf(p);
    var n = rt.n;
    var five = Math.round(n * 0.74);
    var four = Math.round(n * 0.19);
    var three = Math.max(0, Math.round(n * 0.05));
    var two = Math.max(0, Math.floor(n * 0.012));
    var one = Math.max(0, n - five - four - three - two);
    var dist = [five, four, three, two, one]; // [5★,4★,3★,2★,1★]
    var recPct = Math.round((five + four) / n * 100);

    var rng = seedRng(p.id, 7);
    var names = shuffled(REVIEW_NAMES, rng);
    var texts = shuffled(REVIEW_TEXTS, rng);
    var starPat = [5, 5, 4, 5];
    var written = [];
    var k = Math.min(4, texts.length);
    for (var i = 0; i < k; i++) {
      written.push({
        name: names[i],
        text: texts[i],
        star: starPat[i % starPat.length],
        days: 6 + Math.floor(rng() * 200),
        helpful: 2 + Math.floor(rng() * 22),
        verified: rng() > 0.15
      });
    }
    written.sort(function (a, b) { return a.days - b.days; });
    return { r: rt.r, n: n, dist: dist, recPct: recPct, written: written };
  }

  function starRow(k) {
    var s = '';
    for (var i = 0; i < 5; i++) s += i < k ? '★' : '☆';
    return s;
  }

  // termékoldali vélemények + Q&A blokk HTML-je
  function reviewsHtml(p) {
    var rv = reviewsFor(p);
    var qaRng = seedRng(p.id, 3);
    var qaList = shuffled(QA_POOL, qaRng).slice(0, 2);
    var maxBar = Math.max.apply(null, rv.dist) || 1;

    var bars = rv.dist.map(function (cnt, i) {
      var star = 5 - i;
      return '<div class="sh-revbar"><span>' + star + '★</span>' +
        '<div class="sh-revbar__track"><i style="width:' + Math.round(cnt / maxBar * 100) + '%"></i></div>' +
        '<span class="sh-revbar__n">' + cnt + '</span></div>';
    }).join('');

    var cards = rv.written.map(function (w) {
      var initials = w.name.split(' ').map(function (x) { return x.charAt(0); }).join('');
      return '<article class="sh-rev">' +
        '<header class="sh-rev__top">' +
          '<span class="sh-rev__ava" aria-hidden="true">' + esc(initials) + '</span>' +
          '<div class="sh-rev__who"><b>' + esc(w.name) + '</b>' +
            (w.verified ? '<span class="sh-rev__ver">' + CHECK_SVG + 'Ellenőrzött vásárló</span>' : '') +
          '</div>' +
          '<time class="sh-rev__date">' + daysAgoLabel(w.days) + '</time>' +
        '</header>' +
        '<div class="sh-rev__stars" aria-label="' + w.star + ' csillag">' + starRow(w.star) + '</div>' +
        '<p>' + esc(w.text) + '</p>' +
        '<button class="sh-rev__helpful" type="button" data-helpful="' + w.helpful + '">' + THUMB_SVG +
          'Hasznos <b>(' + w.helpful + ')</b></button>' +
      '</article>';
    }).join('');

    var qa = qaList.map(function (item) {
      return '<div class="sh-qa__item">' +
        '<p class="sh-qa__q"><span>K</span>' + esc(item.q) + '</p>' +
        '<p class="sh-qa__a"><span>V</span>' + esc(item.a) + '</p>' +
      '</div>';
    }).join('');

    return '<section class="sh-band sh-band--tight" id="sh-velemenyek">' +
      '<div class="shop-wrap">' +
        '<div class="sh-section-hd"><h2 class="sh-h2">Vásárlói vélemények.</h2>' +
          '<button class="sh-link sh-link--btn" type="button" data-write-review>Írok véleményt ›</button>' +
        '</div>' +
        '<div class="sh-revwrap">' +
          '<aside class="sh-revsum">' +
            '<div class="sh-revsum__score"><b>' + rv.r + '</b>' +
              '<div class="sh-revsum__stars">' + starRow(Math.round(parseFloat(rv.r))) + '</div>' +
              '<span>' + rv.n + ' értékelés alapján</span>' +
              '<small>' + rv.recPct + '%-uk ajánlja másoknak</small>' +
            '</div>' +
            '<div class="sh-revsum__bars">' + bars + '</div>' +
          '</aside>' +
          '<div class="sh-revlist">' + cards +
            '<div class="sh-qa">' +
              '<h3>Kérdések és válaszok</h3>' + qa +
              '<form class="sh-qa__ask" data-qa-form>' +
                '<input type="text" required placeholder="Van kérdésed a termékről? Írd meg…" aria-label="Kérdés a termékről">' +
                '<button class="sh-btn sh-btn--dark" type="submit">Elküldöm</button>' +
              '</form>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  // vélemény/Q&A blokk eseménykötése
  function wireReviews(root) {
    $all('[data-helpful]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.classList.contains('is-on')) return;
        b.classList.add('is-on');
        var n = parseInt(b.getAttribute('data-helpful'), 10) + 1;
        $('b', b).textContent = '(' + n + ')';
        toast('Köszönjük a visszajelzést!');
      });
    });
    var form = $('[data-qa-form]', root);
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.innerHTML = '<p class="sh-qa__sent">' + CHECK_SVG + ' Köszönjük! A kérdésed megérkezett — 24 órán belül válaszolunk (demo).</p>';
    });
    var wr = $('[data-write-review]', root);
    if (wr) wr.addEventListener('click', function () {
      toast('Vásárlás után e-mailben küldjük a véleményező linket (demo).');
    });
  }

  /* ── mérettáblázat ─────────────────────────────────────────────── */
  var SIZE_GUIDE = [
    ['Kicsi',   '14–16 cm', '12–14 cm', 'Polc, íróasztal, éjjeliszekrény'],
    ['Közepes', '18–22 cm', '16–20 cm', 'Nappali, komód — a legnépszerűbb'],
    ['Nagy',    '24–30 cm', '22–28 cm', 'Kiemelt dísz, falidísz, üzlettér']
  ];
  function sizeGuideHtml() {
    return '<table class="sh-sizetable"><thead><tr>' +
        '<th>Méret</th><th>Kb. magasság</th><th>Kb. szélesség</th><th>Ajánlott hely</th>' +
      '</tr></thead><tbody>' +
      SIZE_GUIDE.map(function (row) {
        return '<tr>' + row.map(function (c, i) {
          return i === 0 ? '<td><b>' + c + '</b></td>' : '<td>' + c + '</td>';
        }).join('') + '</tr>';
      }).join('') +
      '</tbody></table>' +
      '<p class="sh-modal__note">A méretek tájékoztató jellegűek és terméktől függően eltérhetnek — a pontos méretet minden termék specifikációjában megtalálod. Egyedi méret is kérhető.</p>';
  }

  /* ── általános info-modal (mérettáblázat stb.) ─────────────────── */
  var infoModalEl = null;
  function openInfoModal(title, bodyHtml) {
    if (!infoModalEl) {
      infoModalEl = document.createElement('div');
      infoModalEl.className = 'sh-modal sh-modal--wide';
      infoModalEl.setAttribute('role', 'dialog');
      infoModalEl.setAttribute('aria-modal', 'true');
      document.body.appendChild(infoModalEl);
      infoModalEl.addEventListener('click', function (e) {
        if (e.target === infoModalEl || e.target.closest('[data-info-close]')) closeInfoModal();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && infoModalEl.classList.contains('is-open')) closeInfoModal();
      });
    }
    infoModalEl.innerHTML =
      '<div class="sh-modal__box sh-modal__box--wide">' +
        '<button class="sh-modal__close" type="button" data-info-close aria-label="Bezárás">✕</button>' +
        '<h2>' + title + '</h2>' +
        '<div class="sh-modal__body">' + bodyHtml + '</div>' +
      '</div>';
    requestAnimationFrame(function () { infoModalEl.classList.add('is-open'); });
    lockScroll();
  }
  function closeInfoModal() {
    if (!infoModalEl || !infoModalEl.classList.contains('is-open')) return;
    infoModalEl.classList.remove('is-open');
    unlockScroll();
  }

  /* ── összehasonlítás ───────────────────────────────────────────── */
  var CMP_KEY = 'sh_compare';
  var CMP_MAX = 4;
  var CMP_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8"/></svg>';
  function cmpGet() { try { return JSON.parse(localStorage.getItem(CMP_KEY)) || []; } catch (e) { return []; } }
  function cmpHas(id) { return cmpGet().indexOf(id) !== -1; }
  function cmpToggle(id) {
    var a = cmpGet();
    var i = a.indexOf(id);
    if (i !== -1) { a.splice(i, 1); }
    else {
      if (a.length >= CMP_MAX) { toast('Legfeljebb ' + CMP_MAX + ' terméket hasonlíthatsz össze'); return false; }
      a.push(id);
    }
    localStorage.setItem(CMP_KEY, JSON.stringify(a));
    syncCompareUI();
    return i !== -1 ? false : true;
  }
  var cmpBar = null;
  function syncCompareUI() {
    var ids = cmpGet().filter(function (id) { return prodById(id); });
    // kártyagombok állapota
    $all('[data-compare]').forEach(function (b) {
      var on = ids.indexOf(b.getAttribute('data-compare')) !== -1;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (!cmpBar) {
      cmpBar = document.createElement('div');
      cmpBar.className = 'sh-cmpbar';
      cmpBar.setAttribute('role', 'region');
      cmpBar.setAttribute('aria-label', 'Összehasonlítás');
      document.body.appendChild(cmpBar);
      cmpBar.addEventListener('click', function (e) {
        var rm = e.target.closest('[data-cmp-rm]');
        if (rm) { cmpToggle(rm.getAttribute('data-cmp-rm')); return; }
        if (e.target.closest('[data-cmp-clear]')) { localStorage.removeItem(CMP_KEY); syncCompareUI(); return; }
        if (e.target.closest('[data-cmp-open]')) { openCompare(); }
      });
    }
    if (!ids.length) { cmpBar.classList.remove('is-on'); return; }
    var thumbs = ids.map(function (id) {
      var p = prodById(id);
      return '<figure class="sh-cmpbar__thumb"><img src="' + p.kepek[0] + '" alt="' + esc(p.nev) + '">' +
        '<button type="button" data-cmp-rm="' + id + '" aria-label="Eltávolítás">✕</button></figure>';
    }).join('');
    cmpBar.innerHTML =
      '<div class="sh-cmpbar__inner shop-wrap">' +
        '<div class="sh-cmpbar__thumbs">' + thumbs + '</div>' +
        '<div class="sh-cmpbar__actions">' +
          '<button class="sh-link" type="button" data-cmp-clear>Törlés</button>' +
          '<button class="sh-btn sh-btn--primary" type="button" data-cmp-open' + (ids.length < 2 ? ' disabled' : '') + '>' +
            'Összehasonlítás (' + ids.length + ')</button>' +
        '</div>' +
      '</div>';
    cmpBar.classList.add('is-on');
  }
  function openCompare() {
    var ids = cmpGet().filter(function (id) { return prodById(id); });
    if (ids.length < 2) { toast('Válassz legalább 2 terméket az összehasonlításhoz'); return; }
    var prods = ids.map(prodById);
    // spec-címkék uniója, az első előfordulás sorrendjében
    var labels = [];
    prods.forEach(function (p) {
      (p.specs || []).forEach(function (row) { if (labels.indexOf(row[0]) === -1) labels.push(row[0]); });
    });
    function specVal(p, label) {
      var found = '—';
      (p.specs || []).forEach(function (row) { if (row[0] === label) found = row[1]; });
      return found;
    }
    var head = '<tr><th></th>' + prods.map(function (p) {
      return '<th><a href="termek.html?id=' + p.id + '"><img src="' + p.kepek[0] + '" alt="' + esc(p.nev) + '">' +
        '<span>' + esc(p.nev) + '</span></a>' +
        '<button class="sh-cmp__rm" type="button" data-cmp-rm="' + p.id + '" aria-label="Eltávolítás">✕</button></th>';
    }).join('') + '</tr>';
    var rows = '';
    rows += '<tr><td>Ár</td>' + prods.map(function (p) { return '<td class="sh-cmp__price">' + fmtAr(p.ar) + '</td>'; }).join('') + '</tr>';
    rows += '<tr><td>Értékelés</td>' + prods.map(function (p) {
      var rt = ratingOf(p);
      return '<td><span class="sh-cmp__stars">' + starRow(Math.round(parseFloat(rt.r))) + '</span> ' + rt.r + ' <small>(' + rt.n + ')</small></td>';
    }).join('') + '</tr>';
    labels.forEach(function (label) {
      rows += '<tr><td>' + esc(label) + '</td>' + prods.map(function (p) {
        return '<td>' + esc(specVal(p, label)) + '</td>';
      }).join('') + '</tr>';
    });
    rows += '<tr><td></td>' + prods.map(function (p) {
      return '<td>' + (p.ar > 0
        ? '<button class="sh-btn sh-btn--primary sh-cmp__add" type="button" data-add="' + p.id + '">Kosárba</button>'
        : '<a class="sh-btn sh-btn--primary sh-cmp__add" href="termek.html?id=' + p.id + '">Ajánlatot kérek</a>') + '</td>';
    }).join('') + '</tr>';

    openInfoModal('Termékek összehasonlítása',
      '<div class="sh-cmp__scroll"><table class="sh-cmp__table"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>');
    // eltávolítás a táblából → azonnali újrarajzolás
    $all('[data-cmp-rm]', infoModalEl).forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        cmpToggle(b.getAttribute('data-cmp-rm'));
        if (cmpGet().filter(function (id) { return prodById(id); }).length >= 2) openCompare();
        else closeInfoModal();
      });
    });
  }

  /* ── profil, rendelések, hűségprogram (demo, localStorage) ─────── */
  var PROFILE_KEY = 'sh_profile', ORDERS_KEY = 'sh_orders';
  var LOYALTY_TIERS = [
    { nev: 'Bronz', min: 0 },
    { nev: 'Ezüst', min: 500 },
    { nev: 'Arany', min: 1500 }
  ];
  function profileGet() { try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || null; } catch (e) { return null; } }
  function profileSet(p) {
    if (p) localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    else localStorage.removeItem(PROFILE_KEY);
    updateAcctBtn();
  }
  function ordersGet() { try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; } catch (e) { return []; } }
  function ordersAdd(o) {
    var a = ordersGet(); a.unshift(o);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(a.slice(0, 50)));
  }
  function loyaltyPoints() { return ordersGet().reduce(function (s, o) { return s + Math.floor(o.total || 0); }, 0); }
  function loyaltyTier(pts) {
    var cur = LOYALTY_TIERS[0], next = null;
    for (var i = 0; i < LOYALTY_TIERS.length; i++) {
      if (pts >= LOYALTY_TIERS[i].min) cur = LOYALTY_TIERS[i];
      else { next = LOYALTY_TIERS[i]; break; }
    }
    return { cur: cur, next: next };
  }
  function updateAcctBtn() {
    var b = $('.sh-acct-btn'); if (!b) return;
    var p = profileGet();
    if (p && p.nev) {
      b.innerHTML = '<span class="sh-acct-ava">' + esc(p.nev.trim().charAt(0).toUpperCase() || 'F') + '</span>';
      b.classList.add('is-in');
    } else {
      b.innerHTML = ICO.user;
      b.classList.remove('is-in');
    }
  }

  /* ── SEO: strukturált adatok + meta-leírás ─────────────────────── */
  function setMeta(desc) {
    if (!desc) return;
    var m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement('meta'); m.setAttribute('name', 'description'); document.head.appendChild(m); }
    m.setAttribute('content', desc);
  }
  function injectJsonLd(obj) {
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(obj);
    document.head.appendChild(s);
  }
  function absUrl(rel) { try { return new URL(rel, location.href).href; } catch (e) { return rel; } }

  /* ── fejléc + lábléc injektálás ──────────────────────────────── */
  var ICO = {
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.61a2 2 0 0 1-.45 2.11L8.09 9.63a16 16 0 0 0 6.28 6.28l1.19-1.19a2 2 0 0 1 2.11-.45c.84.29 1.71.5 2.61.62A2 2 0 0 1 22 16.92Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-3.6 8-10V5l-8-3-8 3v7c0 6.4 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
    retur: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M3.5 13a9 9 0 1 0 2.2-8.3L3 7"/></svg>',
    invoice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h9l4 4v16l-3-1.5L13 22l-3-1.5L7 22l-3-1.5V4a2 2 0 0 1 2-2Z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>'
  };

  function searchForm(mod) {
    return '<form class="sh-search sh-search--' + mod + '" action="kategoria.html" role="search" autocomplete="off">' +
      ICO.search +
      '<input type="search" name="q" placeholder="Keresés a termékek között…" aria-label="Keresés">' +
      '<div class="sh-search__results" hidden></div>' +
    '</form>';
  }

  // élő keresési javaslatok (autocomplete) minden keresőmezőhöz
  function initSearch() {
    $all('.sh-search').forEach(function (form) {
      var input = $('input', form);
      var box = $('.sh-search__results', form);
      if (!input || !box) return;
      function render() {
        var raw = input.value.trim();
        var q = raw.toLowerCase();
        if (q.length < 2) { box.hidden = true; box.innerHTML = ''; return; }
        var hits = SHOP_PRODUCTS.filter(function (p) {
          return (p.nev + ' ' + p.leiras).toLowerCase().indexOf(q) !== -1;
        }).slice(0, 6);
        if (!hits.length) {
          box.innerHTML = '<div class="sh-search__empty">Nincs találat erre: „' + esc(raw) + '”.<br><a href="termek.html?id=egyedi-otlet">Indíts egyedi rendelést ›</a></div>';
        } else {
          box.innerHTML = hits.map(function (p) {
            return '<a class="sh-search__hit" href="termek.html?id=' + p.id + '">' +
              '<img src="' + p.kepek[0] + '" alt="" loading="lazy">' +
              '<span class="sh-search__hit-name">' + esc(p.nev) + '</span>' +
              '<span class="sh-search__hit-price">' + fmtAr(p.ar) + '</span>' +
            '</a>';
          }).join('') +
          '<a class="sh-search__all" href="kategoria.html?q=' + encodeURIComponent(raw) + '">Összes találat megtekintése ›</a>';
        }
        box.hidden = false;
      }
      input.addEventListener('input', render);
      input.addEventListener('focus', render);
      input.addEventListener('keydown', function (e) { if (e.key === 'Escape') { box.hidden = true; input.blur(); } });
      document.addEventListener('click', function (e) { if (!form.contains(e.target)) box.hidden = true; });
    });
  }

  function renderChrome() {
    var page = document.body.getAttribute('data-page') || '';
    var header = document.createElement('header');
    header.className = 'sh-header';
    header.innerHTML =
      /* utility sáv */
      '<div class="sh-topbar"><div class="sh-topbar__inner">' +
        '<span class="sh-topbar__promo" data-rotate>' +
          '<span class="is-on" data-theme="eco">Napelemes műhelyben, közel nulla CO₂-kibocsátással gyártunk</span>' +
          '<span data-theme="teal">PLA biopolimerből nyomtatunk — növényi alapú, lebomló anyag</span>' +
          '<span data-theme="amber">Ingyenes szállítás 200 lej feletti rendelésre</span>' +
          '<span data-theme="navy">Minden darab rendelésre készül — nincs raktári túltermelés</span>' +
        '</span>' +
        '<nav class="sh-topbar__links">' +
          '<a href="tel:+40756642387">' + ICO.phone + '<span>+40 756 642 387</span></a>' +
          '<a href="mailto:layeroprint@gmail.com">' + ICO.mail + '<span>layeroprint@gmail.com</span></a>' +
          '<a href="kapcsolat.html"><span>Segítség</span></a>' +
        '</nav>' +
      '</div></div>' +
      /* fő sor */
      '<div class="sh-header__inner">' +
        '<a class="sh-logo" href="index.html">' +
          '<img src="assets/layero-asset-0251.webp" alt="">' +
          'Layero <small>Shop</small>' +
        '</a>' +
        '<nav class="sh-nav" id="sh-nav">' +
          searchForm('mobile') +
          '<a href="index.html"' + (page === 'home' ? ' aria-current="page"' : '') + '>Főoldal</a>' +
          '<div class="sh-nav__item">' +
            '<a href="kategoria.html"' + (page === 'kategoria' ? ' aria-current="page"' : '') + '>Termékek ' + ICO.chevron + '</a>' +
            '<div class="sh-mega">' +
              '<div class="sh-mega__cols">' +
                '<div class="sh-mega__cats">' +
                  '<span class="sh-mega__label">Kategóriák</span>' +
                  '<div class="sh-mega__grid">' +
                    SHOP_CATS.map(function (c) {
                      var count = SHOP_PRODUCTS.filter(function (p) { return p.cat === c.id; }).length;
                      return '<a href="kategoria.html?cat=' + c.id + '">' +
                        '<figure><img src="' + c.img + '" alt="" loading="lazy"></figure>' +
                        '<span><strong>' + esc(c.nev) + '</strong><small>' + count + ' termék</small></span>' +
                        '<i class="sh-mega__arr" aria-hidden="true">›</i>' +
                      '</a>';
                    }).join('') +
                  '</div>' +
                '</div>' +
                (function () {
                  var f = prodById('szam-lampa-nevvel');
                  if (!f) return '';
                  return '<a class="sh-mega__feat" href="termek.html?id=' + f.id + '">' +
                    '<figure><img src="' + f.kepek[0] + '" alt="" loading="lazy"></figure>' +
                    '<span class="sh-mega__label sh-mega__label--gold">Bestseller</span>' +
                    '<strong>' + esc(f.nev) + '</strong>' +
                    '<span class="sh-mega__feat-price">' + fmtAr(f.ar) +
                      (f.regi_ar && f.regi_ar > f.ar ? ' <s>' + f.regi_ar + ' RON</s>' : '') +
                    '</span>' +
                    '<b>Megnézem ›</b>' +
                  '</a>';
                })() +
              '</div>' +
              '<div class="sh-mega__foot">' +
                '<a href="kategoria.html">Összes termék ›</a>' +
                '<a href="kviz.html">Ajándékkereső kvíz ›</a>' +
                '<a href="termek.html?id=egyedi-otlet">Egyedi rendelést indítok ›</a>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<a href="kategoria.html?cat=ceges">Cégeknek</a>' +
          '<a href="termek.html?id=egyedi-otlet">Egyedi rendelés</a>' +
          '<a href="kapcsolat.html"' + (page === 'kapcsolat' ? ' aria-current="page"' : '') + '>Kapcsolat</a>' +
        '</nav>' +
        searchForm('desktop') +
        '<button class="sh-menu-btn" type="button" aria-label="Menü" aria-expanded="false">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' +
        '</button>' +
        '<a class="sh-acct-btn" href="fiok.html" aria-label="Fiókom">' + ICO.user + '</a>' +
        '<a class="sh-wish-btn" href="kedvencek.html" aria-label="Kedvencek">' +
          HEART_SVG +
          '<span class="sh-wish-badge">0</span>' +
        '</a>' +
        '<a class="sh-cart-btn" href="kosar.html" aria-label="Kosár">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1.5 12.5a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5L6 7Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>' +
          '<span class="sh-cart-badge">0</span>' +
        '</a>' +
      '</div>';
    document.body.insertBefore(header, document.body.firstChild);

    var menuBtn = $('.sh-menu-btn', header);
    menuBtn.addEventListener('click', function () {
      var nav = $('#sh-nav');
      var open = nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });

    var footer = document.createElement('footer');
    footer.className = 'sh-footer';
    footer.innerHTML =
      '<div class="shop-wrap sh-footer__cols">' +
        '<div class="sh-footer__brand">' +
          '<a class="sh-footer__logo" href="index.html"><img src="assets/layero-asset-0251.webp" alt="">Layero <small>Shop</small></a>' +
          '<p>Személyre szabott 3D nyomtatott ajándékok és dekorációk. Szatmárnémetiben tervezve és gyártva — rólad szól, rétegről rétegre.</p>' +
          '<div class="sh-social">' +
            '<a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5H16.5V5.1C16.2 5.1 15.2 5 14.1 5 11.7 5 10 6.5 10 9.2V11H7.5v3H10v7h3.5Z"/></svg></a>' +
            '<a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg></a>' +
            '<a href="#" aria-label="TikTok"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 3c.3 2 1.6 3.4 3.9 3.6v2.9c-1.5 0-2.8-.4-3.9-1.2v5.9c0 4-2.9 6.3-6 6.3A5.6 5.6 0 0 1 5 14.9c0-3.3 2.7-5.6 6.2-5.5v3c-.4-.1-.8-.2-1.2-.2-1.5 0-2.6 1.1-2.6 2.6 0 1.6 1.2 2.7 2.7 2.7 1.7 0 3-1.2 3-3.4V3h3.5Z"/></svg></a>' +
            '<a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.9C18.2 5 12 5 12 5s-6.2 0-7.8.3A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12c0 1.6.1 3.2.4 4.8a2.6 2.6 0 0 0 1.8 1.9c1.6.3 7.8.3 7.8.3s6.2 0 7.8-.3a2.6 2.6 0 0 0 1.8-1.9c.3-1.6.4-3.2.4-4.8s-.1-3.2-.4-4.8ZM10 15.2V8.8l5.4 3.2-5.4 3.2Z"/></svg></a>' +
          '</div>' +
        '</div>' +
        '<div><h4>Vásárlás</h4>' +
          '<a href="kategoria.html">Összes termék</a>' +
          SHOP_CATS.slice(0, 4).map(function (c) { return '<a href="kategoria.html?cat=' + c.id + '">' + esc(c.nev) + '</a>'; }).join('') +
          '<a href="kviz.html">Ajándékkereső</a>' +
          '<a href="kosar.html">Kosár</a>' +
        '</div>' +
        '<div><h4>Információk</h4>' +
          '<a href="gyik.html">Gyakori kérdések</a>' +
          '<a href="gyik.html#szallitas">Szállítás és fizetés</a>' +
          '<a href="gyik.html#visszakuldes">Visszaküldés és garancia</a>' +
          '<a href="../aszf.html">ÁSZF</a>' +
          '<a href="../adatvedelem.html">Adatvédelem</a>' +
        '</div>' +
        '<div><h4>Layero</h4>' +
          '<a href="rolunk.html">Rólunk</a>' +
          '<a href="fiok.html">Fiókom</a>' +
          '<a href="../galeria.html">Galéria</a>' +
          '<a href="kategoria.html?cat=ceges">Cégeknek</a>' +
          '<a href="termek.html?id=egyedi-otlet">Egyedi rendelés</a>' +
          '<a href="kapcsolat.html">Kapcsolat</a>' +
        '</div>' +
        '<div class="sh-footer__contact"><h4>Ügyfélszolgálat</h4><ul>' +
          '<li>' + ICO.phone + '<span><b>+40 756 642 387</b><br>hétköznap 9–17 óráig</span></li>' +
          '<li>' + ICO.mail + '<span><b>layeroprint@gmail.com</b><br>válasz 24 órán belül</span></li>' +
          '<li>' + ICO.pin + '<span>Szatmárnémeti, Románia</span></li>' +
        '</ul></div>' +
      '</div>' +
      '<div class="shop-wrap sh-footer__pay">' +
        '<span>Fizetési lehetőségek:</span>' +
        '<span class="sh-paybadge">VISA</span>' +
        '<span class="sh-paybadge">Mastercard</span>' +
        '<span class="sh-paybadge">Apple Pay</span>' +
        '<span class="sh-paybadge">Google Pay</span>' +
        '<span class="sh-paybadge">Utánvét</span>' +
        '<span class="sh-ssl">' + ICO.shield + 'SSL-titkosított, biztonságos fizetés</span>' +
      '</div>' +
      '<div class="shop-wrap sh-footer__trust">' +
        '<span>' + ICO.shield + '2 év törvényi jótállás</span>' +
        '<span>' + ICO.retur + '14 napos elállás¹</span>' +
        '<span>' + ICO.invoice + 'Számla minden rendeléshez</span>' +
        '<span>' + ICO.box + 'Csomag ellenőrzése átvételkor</span>' +
        '<small>¹ A nem személyre szabott termékekre. Az egyedi, névre/igényre készült darabokra a jogszabály szerint az elállási jog nem vonatkozik.</small>' +
      '</div>' +
      '<div class="shop-wrap sh-footer__bottom">' +
        '<span>© ' + new Date().getFullYear() + ' Layero 3D Design — demo webshop</span>' +
        '<nav>' +
          '<a href="../aszf.html">ÁSZF</a>' +
          '<a href="../adatvedelem.html">Adatvédelem</a>' +
          '<a href="gyik.html#visszakuldes">Elállás &amp; garancia</a>' +
          '<a href="https://anpc.ro" target="_blank" rel="noopener">ANPC</a>' +
          '<a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">SOL (vitarendezés)</a>' +
          '<a href="#" data-cookie-open>Cookie-beállítások</a>' +
        '</nav>' +
        '<span>Let’s print your world together, layer by layer</span>' +
      '</div>';
    document.body.appendChild(footer);
    footer.addEventListener('click', function (e) {
      var c = e.target.closest('[data-cookie-open]');
      if (c) { e.preventDefault(); showCookie(0); }
    });

    buildDrawer();
    initSearch();

    updateBadge();
    updateWishBadge();
    updateAcctBtn();
  }

  /* ── mini-kosár drawer ───────────────────────────────────────── */
  var drawerEl = null, drawerOv = null;
  function buildDrawer() {
    drawerOv = document.createElement('div');
    drawerOv.className = 'sh-drawer-ov';
    drawerEl = document.createElement('aside');
    drawerEl.className = 'sh-drawer';
    drawerEl.setAttribute('aria-label', 'Kosár');
    document.body.appendChild(drawerOv);
    document.body.appendChild(drawerEl);
    drawerOv.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawerEl.classList.contains('is-open')) closeDrawer(); });

    // fejléc kosár-ikon → drawer (kosároldalon marad a link)
    var cartBtn = $('.sh-cart-btn');
    if (cartBtn && document.body.getAttribute('data-page') !== 'kosar' && document.body.getAttribute('data-page') !== 'penztar') {
      cartBtn.addEventListener('click', function (e) { e.preventDefault(); openDrawer(); });
    }

    // delegált események a drawerben
    drawerEl.addEventListener('click', function (e) {
      var t = e.target;
      var rm = t.closest('[data-dr-rm]');
      if (rm) { var items = cartGet().filter(function (x) { return x.key !== rm.getAttribute('data-dr-rm'); }); cartSet(items); renderDrawer(); return; }
      var pm = t.closest('[data-dr-minus]'); var pl = t.closest('[data-dr-plus]');
      if (pm || pl) {
        var key = (pm || pl).getAttribute(pm ? 'data-dr-minus' : 'data-dr-plus');
        var arr = cartGet(); arr.forEach(function (x) { if (x.key === key) x.qty = Math.max(1, Math.min(99, x.qty + (pm ? -1 : 1))); });
        cartSet(arr); renderDrawer(); return;
      }
      var up = t.closest('[data-dr-add]');
      if (up) { cartAdd(up.getAttribute('data-dr-add'), 1, SHOP_VARIANSOK.meret[1] + ' · ' + SHOP_VARIANSOK.szin[0]); toast('Hozzáadva a kosárhoz'); renderDrawer(); return; }
      var gw = t.closest('[data-dr-gift]');
      if (gw) { giftSet(!giftGet()); renderDrawer(); return; }
      var cp = t.closest('[data-dr-coupon]');
      if (cp) { applyCouponFromInput($('[data-dr-coupon-input]', drawerEl)); return; }
      var chip = t.closest('[data-coupon-chip]');
      if (chip) { var inp = $('[data-dr-coupon-input]', drawerEl); if (inp) { inp.value = chip.getAttribute('data-coupon-chip'); applyCouponFromInput(inp); } }
    });
  }
  function openDrawer() {
    renderDrawer();
    if (!drawerEl.classList.contains('is-open')) lockScroll();
    drawerOv.classList.add('is-open');
    drawerEl.classList.add('is-open');
  }
  function closeDrawer() {
    if (drawerEl.classList.contains('is-open')) unlockScroll();
    drawerOv.classList.remove('is-open');
    drawerEl.classList.remove('is-open');
  }

  function applyCouponFromInput(inp) {
    if (!inp) return;
    var code = (inp.value || '').trim().toUpperCase();
    var msg = $('[data-coupon-msg]', drawerEl);
    if (!code) return;
    if (COUPONS[code]) { couponSet(code); if (msg) { msg.className = 'sh-coupon__msg ok'; msg.textContent = 'Kupon aktiválva: ' + COUPONS[code].cimke; } toast('Kupon aktiválva'); renderDrawer(); }
    else { couponSet(''); if (msg) { msg.className = 'sh-coupon__msg err'; msg.textContent = 'Érvénytelen kód.'; } }
  }

  function renderDrawer() {
    if (!drawerEl) return;
    var t = cartTotals();
    if (!t.items.length) {
      drawerEl.innerHTML =
        '<div class="sh-drawer__head"><h2>Kosár</h2><button class="sh-drawer__close" type="button" data-dr-close aria-label="Bezárás">✕</button></div>' +
        '<div class="sh-drawer__empty">' +
          '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1.3 10.5a1.5 1.5 0 0 1-1.5 1.7H6.2a1.5 1.5 0 0 1-1.5-1.7L6 7Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>' +
          '<p>A kosarad üres.</p>' +
          '<a class="sh-btn sh-btn--primary" href="kategoria.html" style="margin-top:14px;">Vásárlás</a>' +
        '</div>';
      wireDrawerClose();
      return;
    }
    var remaining = Math.max(0, FREE_SHIP - t.subtotal);
    var pct = Math.min(100, Math.floor(t.subtotal / FREE_SHIP * 100));
    // upsell: legolcsóbb, kosárban még nem lévő termék
    var inCart = t.items.map(function (r) { return r.p.id; });
    var up = SHOP_PRODUCTS.filter(function (x) { return x.ar > 0 && x.ar <= 150 && inCart.indexOf(x.id) === -1; }).sort(function (a, b) { return a.ar - b.ar; })[0];

    drawerEl.innerHTML =
      '<div class="sh-drawer__head"><h2>Kosár <span>· ' + t.count + ' db</span></h2><button class="sh-drawer__close" type="button" data-dr-close aria-label="Bezárás">✕</button></div>' +
      '<div class="sh-drawer__ship">' +
        (t.shipping === 0
          ? '<p><b>' + (t.freeByCoupon ? 'Ingyenes szállítás (kupon) 🎉' : 'Megvan az ingyenes szállítás! 🎉') + '</b></p>'
          : '<p>Még <b>' + remaining + ' RON</b> és ingyenes a szállítás</p>') +
        '<div class="sh-drawer__bar"><div class="sh-drawer__fill" style="width:' + pct + '%"></div></div>' +
      '</div>' +
      '<div class="sh-drawer__body">' +
        t.items.map(function (r) {
          return '<div class="sh-drawer-item">' +
            '<figure><img src="' + r.p.kepek[0] + '" alt=""></figure>' +
            '<div><b>' + esc(r.p.nev) + '</b>' + (r.it.variant ? '<small>' + esc(r.it.variant) + '</small>' : '<small></small>') +
              '<div class="sh-qty"><button type="button" data-dr-minus="' + r.it.key + '">−</button><output>' + r.it.qty + '</output><button type="button" data-dr-plus="' + r.it.key + '">+</button></div>' +
            '</div>' +
            '<div style="text-align:right"><div class="sh-drawer-item__price">' + r.sor + ' RON</div><button class="sh-drawer-item__rm" type="button" data-dr-rm="' + r.it.key + '">Törlés</button></div>' +
          '</div>';
        }).join('') +
        (up ? '<div class="sh-upsell"><h4>Tedd mellé</h4><div class="sh-upsell__item">' +
          '<figure><img src="' + up.kepek[0] + '" alt=""></figure>' +
          '<div><b>' + esc(up.nev) + '</b>' + rateHtml(up, false) + '</div>' +
          '<span class="pr">' + up.ar + ' RON</span>' +
          '<button class="sh-upsell__add" type="button" data-dr-add="' + up.id + '" aria-label="Kosárba">+</button>' +
        '</div></div>' : '') +
      '</div>' +
      '<div class="sh-drawer__foot">' +
        '<div class="sh-giftwrap' + (t.gift ? ' is-on' : '') + '" data-dr-gift role="button" tabindex="0">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7S10 2 7 3.5 9 7 12 7ZM12 7s2-5 5-3.5S15 7 12 7Z"/></svg>' +
          '<div><b>Ajándékcsomagolás</b><small>Díszdoboz + kézzel írt üzenet · +' + GIFTWRAP_FEE + ' lej</small></div>' +
          '<span class="sh-giftwrap__check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>' +
        '</div>' +
        '<div class="sh-coupon"><input type="text" placeholder="Kuponkód" data-dr-coupon-input aria-label="Kuponkód" value="' + (t.coupon ? t.coupon.code : '') + '"><button type="button" data-dr-coupon>Beváltás</button></div>' +
        '<p class="sh-coupon__msg' + (t.coupon ? ' ok' : '') + '" data-coupon-msg>' + (t.coupon ? 'Kupon: ' + t.coupon.def.cimke : '') + '</p>' +
        '<p class="sh-coupon-hint">Próbáld ki: <code data-coupon-chip="NYAR20">NYAR20</code> <code data-coupon-chip="LAYERO10">LAYERO10</code></p>' +
        '<div class="sh-sumrow"><span>Részösszeg</span><span>' + t.subtotal + ' RON</span></div>' +
        (t.discount ? '<div class="sh-sumrow disc"><span>Kedvezmény</span><span>−' + t.discount + ' RON</span></div>' : '') +
        (t.gift ? '<div class="sh-sumrow"><span>Ajándékcsomagolás</span><span>' + t.gift + ' RON</span></div>' : '') +
        '<div class="sh-sumrow"><span>Szállítás</span><span>' + (t.shipping === 0 ? 'Ingyenes' : t.shipping + ' RON') + '</span></div>' +
        '<div class="sh-sumrow total"><span>Összesen</span><span>' + t.total + ' RON</span></div>' +
        (t.belowMin ? '<p class="sh-coupon__msg err">Minimális rendelés ' + MIN_ORDER + ' RON — még ' + (MIN_ORDER - t.subtotal) + ' RON.</p>' : '') +
        '<a class="sh-btn sh-btn--primary' + (t.belowMin ? ' is-disabled' : '') + '" href="penztar.html"' + (t.belowMin ? ' aria-disabled="true" style="opacity:.45;pointer-events:none"' : '') + '>Tovább a pénztárhoz</a>' +
        '<a class="sh-btn sh-btn--ghost" href="kosar.html">Kosár megtekintése</a>' +
        '<p class="sh-drawer__secure">' + ICO.shield + ' Biztonságos, SSL-titkosított fizetés</p>' +
      '</div>';
    wireDrawerClose();
  }
  function wireDrawerClose() {
    var c = $('[data-dr-close]', drawerEl);
    if (c) c.addEventListener('click', closeDrawer);
  }

  /* ── globális: kívánságlista-gombok + gyorsnézet delegálás ────── */
  function initCardActions() {
    document.addEventListener('click', function (e) {
      var w = e.target.closest('[data-wish]');
      if (w) {
        e.preventDefault(); e.stopPropagation();
        var on = wishToggle(w.getAttribute('data-wish'));
        w.classList.toggle('is-on', on);
        w.setAttribute('aria-pressed', on ? 'true' : 'false');
        // minden azonos termékű szív frissítése az oldalon
        $all('[data-wish="' + w.getAttribute('data-wish') + '"]').forEach(function (b) {
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        if (on) toast('Kedvencekhez adva');
        return;
      }
      var cmp = e.target.closest('[data-compare]');
      if (cmp) {
        e.preventDefault(); e.stopPropagation();
        var wasOn = cmpHas(cmp.getAttribute('data-compare'));
        cmpToggle(cmp.getAttribute('data-compare'));
        if (!wasOn && cmpHas(cmp.getAttribute('data-compare'))) toast('Hozzáadva az összehasonlításhoz');
        return;
      }
      var q = e.target.closest('[data-qv]');
      if (q) {
        e.preventDefault(); e.stopPropagation();
        openQuickView(q.getAttribute('data-qv'));
        return;
      }
      var add = e.target.closest('[data-add]');
      if (add && add.hasAttribute('data-add')) {
        e.preventDefault(); e.stopPropagation();
        var ap = prodById(add.getAttribute('data-add'));
        if (ap) {
          // alap variáns: Közepes · Natúr — a kosárban módosítható
          cartAdd(ap.id, 1, SHOP_VARIANSOK.meret[1] + ' · ' + SHOP_VARIANSOK.szin[0]);
          openDrawer();  // pro AOV: azonnal megnyílik a kosár upsell-lel
        }
        return;
      }
      var quote = e.target.closest('[data-add-quote]');
      if (quote) {
        e.preventDefault(); e.stopPropagation();
        window.location.href = 'termek.html?id=' + quote.getAttribute('data-add-quote');
      }
    });
  }

  /* ── gyorsnézet-modal ────────────────────────────────────────── */
  var qvEl = null;
  function openQuickView(id) {
    var p = prodById(id);
    if (!p) return;
    var cat = catById(p.cat);
    if (!qvEl) {
      qvEl = document.createElement('div');
      qvEl.className = 'sh-qv';
      qvEl.setAttribute('role', 'dialog');
      qvEl.setAttribute('aria-modal', 'true');
      document.body.appendChild(qvEl);
      qvEl.addEventListener('click', function (e) { if (e.target === qvEl || e.target.closest('[data-qv-close]')) closeQuickView(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && qvEl.classList.contains('is-open')) closeQuickView(); });
    }
    var saved = wishHas(p.id) ? ' is-on' : '';
    qvEl.innerHTML =
      '<div class="sh-qv__box">' +
        '<button class="sh-qv__close" type="button" data-qv-close aria-label="Bezárás">✕</button>' +
        '<div class="sh-qv__grid">' +
          '<div class="sh-qv__media"><img src="' + p.kepek[0] + '" alt="' + esc(p.nev) + '">' +
            '<button class="sh-heart' + saved + '" type="button" data-wish="' + p.id + '" aria-label="Kedvencekhez">' + HEART_SVG + '</button>' +
          '</div>' +
          '<div class="sh-qv__info">' +
            '<span class="sh-qv__cat">' + (cat ? esc(cat.nev) : '') + '</span>' +
            '<h2>' + esc(p.nev) + '</h2>' +
            rateHtml(p, false) +
            '<div class="sh-qv__price">' + (p.regi_ar && p.regi_ar > p.ar ? '<span style="color:#e04726">' + p.ar + ' RON</span> <span style="text-decoration:line-through;color:var(--faint);font-weight:450;font-size:.85rem">' + p.regi_ar + ' RON</span>' : fmtAr(p.ar) + (p.ar > 0 ? '<small>-tól</small>' : '')) + '</div>' +
            '<p class="sh-qv__desc">' + esc(p.leiras) + '</p>' +
            (p.ar > 0
              ? '<div class="sh-opt"><span>Méret</span><div class="sh-opt__row" data-qv-meret>' +
                  SHOP_VARIANSOK.meret.map(function (m, i) { return '<button type="button" class="' + (i === 1 ? 'is-on' : '') + '">' + m + '</button>'; }).join('') +
                '</div></div>' +
                '<div class="sh-qv__foot">' +
                  '<button class="sh-btn sh-btn--primary" type="button" data-qv-add style="flex:1;">Kosárba teszem</button>' +
                  '<a class="sh-link" href="termek.html?id=' + p.id + '">Részletek ›</a>' +
                '</div>'
              : '<div class="sh-qv__foot"><a class="sh-btn sh-btn--primary" href="kapcsolat.html" style="flex:1;">Ajánlatot kérek</a><a class="sh-link" href="termek.html?id=' + p.id + '">Részletek ›</a></div>'
            ) +
          '</div>' +
        '</div>' +
      '</div>';

    if (p.ar > 0) {
      var mrow = $('[data-qv-meret]', qvEl);
      mrow.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        $all('button', mrow).forEach(function (x) { x.classList.remove('is-on'); });
        b.classList.add('is-on');
      });
      $('[data-qv-add]', qvEl).addEventListener('click', function () {
        var meret = $('[data-qv-meret] .is-on', qvEl);
        cartAdd(p.id, 1, meret ? meret.textContent : '');
        closeQuickView();
        openDrawer();
      });
    }
    requestAnimationFrame(function () { qvEl.classList.add('is-open'); });
    lockScroll();
  }
  function closeQuickView() {
    if (!qvEl || !qvEl.classList.contains('is-open')) return;
    qvEl.classList.remove('is-open');
    unlockScroll();
  }

  /* ── termékkártya HTML ───────────────────────────────────────── */
  function prodCard(p) {
    var cat = catById(p.cat);
    var img2 = p.kepek[1] ? '<img class="sh-pc-img2" src="' + p.kepek[1] + '" alt="" loading="lazy">' : '';
    var saved = wishHas(p.id) ? ' is-on' : '';
    var pct = discountPct(p);
    var badges = '';
    if (pct) badges += '<span class="sh-badge sh-badge--sale">-' + pct + '%</span>';
    if (p.badge === 'Bestseller') badges += '<span class="sh-badge sh-badge--best">Bestseller</span>';
    else if (p.badge === 'Új') badges += '<span class="sh-badge sh-badge--new">Új</span>';
    else if (p.badge) badges += '<span class="sh-badge sh-badge--info">' + esc(p.badge) + '</span>';
    return '<div class="sh-prod-card sh-reveal">' +
      '<figure>' +
        (badges ? '<div class="sh-badges">' + badges + '</div>' : '') +
        '<img src="' + p.kepek[0] + '" alt="' + esc(p.nev) + '" loading="lazy">' + img2 +
        '<button class="sh-heart' + saved + '" type="button" data-wish="' + p.id + '" aria-label="Kedvencekhez" aria-pressed="' + (saved ? 'true' : 'false') + '">' + HEART_SVG + '</button>' +
        '<button class="sh-compare-btn' + (cmpHas(p.id) ? ' is-on' : '') + '" type="button" data-compare="' + p.id + '" aria-label="Összehasonlításhoz" aria-pressed="' + (cmpHas(p.id) ? 'true' : 'false') + '" title="Összehasonlítás">' + CMP_ICON + '</button>' +
        (p.ar > 0 ? '<div class="sh-quickview"><button type="button" data-qv="' + p.id + '">Gyorsnézet</button></div>' : '') +
      '</figure>' +
      '<div class="sh-prod-card__body">' +
        '<a class="sh-card-link" href="termek.html?id=' + p.id + '" aria-label="' + esc(p.nev) + '"></a>' +
        '<span class="sh-prod-card__cat">' + (cat ? esc(cat.nev) : '') + '</span>' +
        '<span class="sh-prod-card__name">' + esc(p.nev) + '</span>' +
        rateHtml(p, false) +
        '<span class="sh-prod-card__price">' + priceHtml(p) + '</span>' +
        (p.ar > 0
          ? '<button class="sh-card-add" type="button" data-add="' + p.id + '">' + CART_ICON + 'Kosárba</button>'
          : '<button class="sh-card-add" type="button" data-add-quote="' + p.id + '">Ajánlatot kérek</button>') +
      '</div>' +
    '</div>';
  }

  /* ── FŐOLDAL ─────────────────────────────────────────────────── */
  function initSlider() {
    var slider = $('#sh-slider');
    if (!slider) return;
    var slides = $all('.sh-slide', slider);
    var dotsWrap = $('#sh-slider-dots');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cur = 0, timer = null;

    dotsWrap.innerHTML = slides.map(function (_, i) {
      return '<button type="button" role="tab" aria-label="' + (i + 1) + '. slide"' + (i === 0 ? ' class="is-on"' : '') + '></button>';
    }).join('');
    var dots = $all('button', dotsWrap);

    // lágy crossfade: a régi slide a helyén marad (is-leaving), amíg az új
    // teljesen rá nem úszik; a szöveg elemenként, finoman érkezik (is-entering)
    var transT = null;
    function transitionTo(next, prev) {
      clearTimeout(transT);
      slides.forEach(function (s) {
        s.classList.remove('is-on', 'is-leaving', 'is-entering');
      });
      void slides[next].offsetWidth; // a szöveg-animáció újraindul
      slides[next].classList.add('is-on');
      if (!reduceMotion) {
        if (prev >= 0 && prev !== next) slides[prev].classList.add('is-leaving');
        slides[next].classList.add('is-entering');
        transT = setTimeout(function () {
          if (prev >= 0) slides[prev].classList.remove('is-leaving');
          slides[next].classList.remove('is-entering');
        }, 1500);
      }
      dots.forEach(function (d, k) {
        var on = k === next;
        d.classList.toggle('is-on', on);
        d.setAttribute('aria-selected', on ? 'true' : 'false');
        d.setAttribute('tabindex', on ? '0' : '-1');
      });
    }

    function goTo(i) {
      var next = (i + slides.length) % slides.length;
      if (next === cur) return;
      var prev = cur;
      cur = next;
      transitionTo(next, prev);
    }
    // belépéskor a kép azonnal látszik, csak a szöveg úszik be finoman
    if (!reduceMotion) {
      slides[0].classList.add('is-entering');
      transT = setTimeout(function () { slides[0].classList.remove('is-entering'); }, 1600);
    }
    function start() { if (!reduceMotion && !timer) timer = setInterval(function () { goTo(cur + 1); }, 8000); }
    function stop() { clearInterval(timer); timer = null; }

    dots.forEach(function (d, i) { d.addEventListener('click', function () { stop(); goTo(i); start(); }); });
    $('[data-slide-prev]', slider).addEventListener('click', function () { stop(); goTo(cur - 1); start(); });
    $('[data-slide-next]', slider).addEventListener('click', function () { stop(); goTo(cur + 1); start(); });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);

    // swipe/drag minden nezetre
    var pointerId = null;
    var sx = 0;
    var sy = 0;
    var didDrag = false;
    function clearDrag() {
      slider.classList.remove('is-dragging');
      pointerId = null;
    }
    slider.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      if (e.target.closest('a, button, input, select, textarea')) return;
      pointerId = e.pointerId;
      sx = e.clientX;
      sy = e.clientY;
      didDrag = false;
      if (typeof slider.setPointerCapture === 'function') {
        try { slider.setPointerCapture(pointerId); } catch (error) {}
      }
    });
    slider.addEventListener('pointermove', function (e) {
      if (pointerId !== e.pointerId) return;
      var dx = e.clientX - sx;
      var dy = e.clientY - sy;
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        didDrag = true;
        slider.classList.add('is-dragging');
        stop();
        e.preventDefault();
      }
    });
    slider.addEventListener('pointerup', function (e) {
      if (pointerId !== e.pointerId) return;
      var dx = e.clientX - sx;
      var dy = e.clientY - sy;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
        goTo(dx < 0 ? cur + 1 : cur - 1);
      }
      clearDrag();
      start();
    });
    slider.addEventListener('pointercancel', function () {
      clearDrag();
      start();
    });
    slider.addEventListener('click', function (e) {
      if (!didDrag) return;
      e.preventDefault();
      e.stopPropagation();
      didDrag = false;
    }, true);

    start();
  }

  function renderHome() {
    initSlider();

    // SEO: szervezet + kereshető webhely
    injectJsonLd({
      '@context': 'https://schema.org', '@type': 'Organization',
      name: 'Layero Shop', url: location.href,
      logo: absUrl('assets/layero-asset-0251.webp'),
      description: 'Személyre szabott 3D nyomtatott ajándékok, világító lámpák, kulcstartók és dekorációk.',
      email: 'layeroprint@gmail.com', telephone: '+40756642387',
      address: { '@type': 'PostalAddress', addressLocality: 'Szatmárnémeti', addressCountry: 'RO' },
      sameAs: []
    });

    // kategóriák — bento-rács: az első csempe nagy (2×2), fotó-overlay stílus
    var cats = $('#sh-home-cats');
    if (cats) {
      cats.innerHTML = SHOP_CATS.map(function (c, i) {
        var count = SHOP_PRODUCTS.filter(function (p) { return p.cat === c.id; }).length;
        return '<a class="sh-bento sh-reveal' + (i === 0 ? ' sh-bento--hero' : '') + '" href="kategoria.html?cat=' + c.id + '">' +
          '<img src="' + c.img + '" alt="' + esc(c.nev) + '" loading="lazy">' +
          '<span class="sh-bento__body">' +
            '<strong>' + esc(c.nev) + '</strong>' +
            '<small>' + esc(c.leiras) + ' · ' + count + ' termék</small>' +
            '<i aria-hidden="true">Felfedezem ›</i>' +
          '</span>' +
        '</a>';
      }).join('');
    }

    // népszerű termékek — rács
    var pop = $('#sh-home-popular');
    if (pop) {
      var nepszeru = ['szam-lampa-nevvel', 'logos-kulcstarto', 'qr-nfc-display', 'tulipan-vaza', 'jurassic-lampa', 'bagoly-figura', 'holdfeny-lampa', 'camino-szobor'];
      pop.innerHTML = nepszeru.map(function (id) { return prodCard(prodById(id)); }).join('');
    }

    // újdonságok — carousel (a badge-elt / új termékek)
    var car = $('#sh-home-carousel');
    if (car) {
      var ujak = SHOP_PRODUCTS.filter(function (p) { return p.badge === 'Új'; });
      SHOP_PRODUCTS.forEach(function (p) { if (ujak.length < 8 && ujak.indexOf(p) === -1 && p.ar > 0) ujak.push(p); });
      car.innerHTML = ujak.slice(0, 8).map(function (p) { return prodCard(p); }).join('');
      // saját animáció: a natív smooth scroll és a snap ütközik,
      // ezért az animáció idejére kikapcsoljuk a snapet
      var glideToken = 0;
      function glide(delta) {
        var start = car.scrollLeft;
        var target = Math.max(0, Math.min(car.scrollWidth - car.clientWidth, start + delta));
        var t0 = null, dur = 420, token = ++glideToken;
        car.style.scrollSnapType = 'none';
        function stepFn(ts) {
          if (token !== glideToken) return;
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur);
          car.scrollLeft = start + (target - start) * (1 - Math.pow(1 - p, 3));
          if (p < 1) requestAnimationFrame(stepFn);
          else car.style.scrollSnapType = '';
        }
        requestAnimationFrame(stepFn);
        // ha a rAF nem futna (rejtett fül), akkor is érjen célba
        setTimeout(function () {
          if (token === glideToken && car.style.scrollSnapType === 'none') {
            car.scrollLeft = target;
            car.style.scrollSnapType = '';
          }
        }, dur + 160);
      }
      var step = 500;
      $('[data-car-prev]').addEventListener('click', function () { glide(-step); });
      $('[data-car-next]').addEventListener('click', function () { glide(step); });
    }

    // termék-spotlight (fekete sáv)
    var spot = $('#sh-home-spotlight');
    if (spot) {
      var p = prodById('karacsonyi-lampa');
      spot.innerHTML =
        '<div class="sh-spotlight__copy">' +
          '<span class="sh-spotlight__eyebrow">A hónap terméke</span>' +
          '<h2>' + esc(p.nev) + '</h2>' +
          '<p>' + esc(p.leiras) + '</p>' +
          '<div class="sh-spotlight__price">' + fmtAr(p.ar) + '<small>-tól, egyedi gyártással</small></div>' +
          '<a class="sh-btn sh-btn--white" href="termek.html?id=' + p.id + '">Megnézem a terméket</a>' +
        '</div>' +
        '<div class="sh-spotlight__media"><img src="' + p.kepek[0] + '" alt="' + esc(p.nev) + '" loading="lazy"></div>';
    }

    // hírlevél (demo)
    var nl = $('#sh-newsletter-form');
    if (nl) {
      nl.addEventListener('submit', function (e) {
        e.preventDefault();
        nl.reset();
        toast('Köszönjük! Feliratkoztál a hírlevélre (demo).');
      });
    }

    // Layero Lab — a 3D nyomtatás-szimulátort a lab-3d.js modul kezeli (Three.js)

    // számláló-animáció, amikor a statisztika-sáv látótérbe ér
    var counters = $all('[data-sh-count]');
    if (counters.length) {
      var runCount = function (el) {
        var target = parseInt(el.getAttribute('data-sh-count'), 10) || 0;
        var t0 = null, dur = 1400, done = false;
        var stepFn = function (ts) {
          if (done) return;
          if (!t0) t0 = ts;
          var pr = Math.min(1, (ts - t0) / dur);
          el.textContent = Math.round(target * (1 - Math.pow(1 - pr, 3)));
          if (pr < 1) requestAnimationFrame(stepFn); else done = true;
        };
        requestAnimationFrame(stepFn);
        // rejtett fülön a rAF nem fut — garantált végérték
        setTimeout(function () { if (!done) { done = true; el.textContent = target; } }, dur + 400);
      };
      if ('IntersectionObserver' in window) {
        var cio = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); }
          });
        }, { threshold: 0.4 });
        counters.forEach(function (el) { cio.observe(el); });
      } else {
        counters.forEach(runCount);
      }
    }
  }

  /* ── KATEGÓRIA OLDAL: fazettás szűrőrendszer ─────────────────── */
  function renderKategoria() {
    var grid = $('#sh-cat-products');
    var pillWrap = $('#sh-cat-pills');
    var sortSel = $('#sh-sort');
    var title = $('#sh-cat-title');
    if (!grid) return;

    var active = param('cat') || 'all';
    var query = (param('q') || '').trim();

    /* ár-határok a kínálatból (a 0 lejes = ajánlat-alapú termékek nélkül) */
    var arak = SHOP_PRODUCTS.filter(function (p) { return p.ar > 0; }).map(function (p) { return p.ar; });
    var PMIN = Math.min.apply(null, arak);
    var PMAX = Math.max.apply(null, arak);

    /* szűrő-fazetták: címke + predikátum */
    function hasSpec(p, re) {
      return (p.specs || []).some(function (row) { return re.test(row[0]); });
    }
    var FEAT = {
      sale:  { label: 'Akciós',              test: function (p) { return !!(p.regi_ar && p.regi_ar > p.ar); } },
      uj:    { label: 'Újdonság',            test: function (p) { return p.badge === 'Új'; } },
      best:  { label: 'Bestseller',          test: function (p) { return p.badge === 'Bestseller'; } },
      led:   { label: 'LED-világítás',       test: function (p) { return hasSpec(p, /világítás/i); } },
      persz: { label: 'Személyre szabható',  test: function (p) { return hasSpec(p, /személyre szabás|testreszabás|felirat|gravírozás|egyediesítés/i); } },
      retur: { label: '14 napos elállás',    test: function (p) { return p.visszakuldheto === true; } },
      top:   { label: '4.8★ és fölötte',     test: function (p) { return parseFloat(ratingOf(p).r) >= 4.8; } }
    };
    var F = { min: PMIN, max: PMAX };
    Object.keys(FEAT).forEach(function (k) { F[k] = false; });

    function priceActive() { return F.min > PMIN || F.max < PMAX; }
    function passPrice(p) {
      if (!priceActive()) return true; /* teljes sávnál az ajánlat-alapú (0 lej) is látszik */
      return p.ar > 0 && p.ar >= F.min && p.ar <= F.max;
    }
    function baseList() {
      var list = SHOP_PRODUCTS.filter(function (p) { return active === 'all' || p.cat === active; });
      if (query) {
        var ql = query.toLowerCase();
        list = list.filter(function (p) { return (p.nev + ' ' + p.leiras).toLowerCase().indexOf(ql) !== -1; });
      }
      return list;
    }
    function filtered() {
      return baseList().filter(function (p) {
        if (!passPrice(p)) return false;
        for (var k in FEAT) if (F[k] && !FEAT[k].test(p)) return false;
        return true;
      });
    }
    function activeCount() {
      var n = priceActive() ? 1 : 0;
      for (var k in FEAT) if (F[k]) n++;
      return n;
    }

    /* kategória-pillek */
    pillWrap.innerHTML =
      '<button class="sh-pill" data-cat="all">Mind</button>' +
      SHOP_CATS.map(function (c) {
        return '<button class="sh-pill" data-cat="' + c.id + '">' + esc(c.nev) + '</button>';
      }).join('');

    /* szűrőpanel felépítése */
    var panel = $('#sh-filters');
    var chipsEl = $('#sh-active-chips');
    var toggleBtn = $('#sh-filter-toggle');
    var toggleBadge = $('#sh-filter-badge');
    var overlay = $('#sh-filters-ov');
    if (panel) {
      var fcheck = function (k) {
        return '<label class="sh-fcheck"><input type="checkbox" data-f="' + k + '">' +
          '<i aria-hidden="true"></i><span>' + FEAT[k].label + '</span><b data-fc="' + k + '"></b></label>';
      };
      panel.innerHTML =
        '<div class="sh-filters__head">' +
          '<h3>Szűrők</h3>' +
          '<button type="button" id="sh-f-clear">Törlés</button>' +
          '<button type="button" class="sh-filters__close" id="sh-f-close" aria-label="Szűrők bezárása">✕</button>' +
        '</div>' +
        '<div class="sh-fgroup">' +
          '<h4>Ár</h4>' +
          '<div class="sh-range">' +
            '<div class="sh-range__track"><i id="sh-range-fill"></i></div>' +
            '<input type="range" id="sh-rmin" min="' + PMIN + '" max="' + PMAX + '" value="' + PMIN + '" step="5" aria-label="Minimum ár">' +
            '<input type="range" id="sh-rmax" min="' + PMIN + '" max="' + PMAX + '" value="' + PMAX + '" step="5" aria-label="Maximum ár">' +
          '</div>' +
          '<div class="sh-range__vals"><output id="sh-rmin-out"></output><output id="sh-rmax-out"></output></div>' +
        '</div>' +
        '<div class="sh-fgroup"><h4>Ajánlatok</h4>' + fcheck('sale') + fcheck('uj') + fcheck('best') + '</div>' +
        '<div class="sh-fgroup"><h4>Tulajdonságok</h4>' + fcheck('led') + fcheck('persz') + fcheck('retur') + '</div>' +
        '<div class="sh-fgroup"><h4>Értékelés</h4>' + fcheck('top') + '</div>' +
        '<button class="sh-btn sh-btn--primary sh-filters__apply" id="sh-f-apply" type="button">Mutasd a találatokat</button>';
    }

    /* ár-csúszka */
    var rmin = $('#sh-rmin'), rmax = $('#sh-rmax'), rfill = $('#sh-range-fill');
    var outMin = $('#sh-rmin-out'), outMax = $('#sh-rmax-out');
    function syncRange(which) {
      var a = parseInt(rmin.value, 10), b = parseInt(rmax.value, 10);
      if (a > b - 10) {
        if (which === 'min') { a = Math.max(PMIN, b - 10); rmin.value = a; }
        else { b = Math.min(PMAX, a + 10); rmax.value = b; }
      }
      F.min = a; F.max = b;
      var span = PMAX - PMIN || 1;
      rfill.style.left = ((a - PMIN) / span * 100) + '%';
      rfill.style.right = (100 - (b - PMIN) / span * 100) + '%';
      outMin.textContent = a + ' RON';
      outMax.textContent = b + ' RON';
    }

    /* mobil drawer nyit/zár */
    function openFilters() {
      panel.classList.add('is-open');
      if (overlay) overlay.classList.add('is-on');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('sh-flock');
    }
    function closeFilters() {
      panel.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-on');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('sh-flock');
    }

    function chipHtml(k, label) {
      return '<button class="sh-chip" type="button" data-chip="' + k + '">' + esc(label) + '<i aria-hidden="true">✕</i></button>';
    }

    function draw() {
      var list = filtered();
      var sort = sortSel.value;
      if (sort === 'ar-fel')    list = list.slice().sort(function (a, b) { return a.ar - b.ar; });
      if (sort === 'ar-le')     list = list.slice().sort(function (a, b) { return b.ar - a.ar; });
      if (sort === 'ertekeles') list = list.slice().sort(function (a, b) { return parseFloat(ratingOf(b).r) - parseFloat(ratingOf(a).r); });
      if (sort === 'nev')       list = list.slice().sort(function (a, b) { return a.nev.localeCompare(b.nev, 'hu'); });

      var cat = catById(active);
      title.textContent = query
        ? 'Találatok erre: „' + query + '”'
        : (cat ? cat.nev : 'Összes termék');
      $('#sh-cat-count').textContent = list.length + ' termék';
      document.title = (query ? 'Keresés: ' + query : (cat ? cat.nev : 'Összes termék')) + ' — Layero Shop';
      setMeta(cat ? cat.nev + ' — ' + cat.leiras + ' a Layero Shopban, egyedi 3D gyártásban.' : 'A Layero Shop teljes kínálata — személyre szabott 3D nyomtatott ajándékok és dekorációk.');

      grid.innerHTML = list.length
        ? list.map(prodCard).join('')
        : '<div class="sh-empty" style="grid-column:1/-1">Nincs a szűrőknek megfelelő termék. ' +
            '<button class="sh-empty__reset" type="button" data-f-reset>Szűrők törlése ›</button></div>';

      $all('.sh-pill', pillWrap).forEach(function (b) {
        b.classList.toggle('is-on', !query && b.getAttribute('data-cat') === active);
      });

      /* fazetta-darabszámok (kategória + keresés + ár alapján) */
      var base = baseList().filter(passPrice);
      $all('[data-fc]', panel).forEach(function (el) {
        var k = el.getAttribute('data-fc');
        var n = base.filter(FEAT[k].test).length;
        el.textContent = n;
        el.closest('.sh-fcheck').classList.toggle('is-off', n === 0 && !F[k]);
      });

      /* aktív chipek + szűrő-gomb jelvény */
      var chips = '';
      if (priceActive()) chips += chipHtml('__price', F.min + '–' + F.max + ' RON');
      for (var k in FEAT) if (F[k]) chips += chipHtml(k, FEAT[k].label);
      if (chips) chips += '<button class="sh-chip sh-chip--clear" type="button" data-chip="__all">Összes törlése</button>';
      if (chipsEl) { chipsEl.innerHTML = chips; chipsEl.hidden = !chips; }
      var n = activeCount();
      if (toggleBadge) { toggleBadge.textContent = n; toggleBadge.hidden = n === 0; }

      observeReveals();
    }

    function clearFilters() {
      Object.keys(FEAT).forEach(function (k) { F[k] = false; });
      rmin.value = PMIN; rmax.value = PMAX;
      syncRange('min');
      $all('input[data-f]', panel).forEach(function (i) { i.checked = false; });
      draw();
    }

    /* események */
    pillWrap.addEventListener('click', function (e) {
      var b = e.target.closest('.sh-pill');
      if (!b) return;
      active = b.getAttribute('data-cat');
      query = '';
      history.replaceState(null, '', active === 'all' ? 'kategoria.html' : 'kategoria.html?cat=' + active);
      draw();
    });
    sortSel.addEventListener('change', draw);
    if (panel) {
      panel.addEventListener('change', function (e) {
        var i = e.target.closest('input[data-f]');
        if (!i) return;
        F[i.getAttribute('data-f')] = i.checked;
        draw();
      });
      rmin.addEventListener('input', function () { syncRange('min'); draw(); });
      rmax.addEventListener('input', function () { syncRange('max'); draw(); });
      $('#sh-f-clear').addEventListener('click', clearFilters);
      $('#sh-f-close').addEventListener('click', closeFilters);
      $('#sh-f-apply').addEventListener('click', closeFilters);
    }
    if (toggleBtn) toggleBtn.addEventListener('click', function () {
      if (panel.classList.contains('is-open')) closeFilters(); else openFilters();
    });
    if (overlay) overlay.addEventListener('click', closeFilters);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel && panel.classList.contains('is-open')) closeFilters();
    });
    chipsEl.addEventListener('click', function (e) {
      var c = e.target.closest('[data-chip]');
      if (!c) return;
      var k = c.getAttribute('data-chip');
      if (k === '__all') { clearFilters(); return; }
      if (k === '__price') { rmin.value = PMIN; rmax.value = PMAX; syncRange('min'); }
      else { F[k] = false; var box = $('input[data-f="' + k + '"]', panel); if (box) box.checked = false; }
      draw();
    });
    grid.addEventListener('click', function (e) {
      if (e.target.closest('[data-f-reset]')) clearFilters();
    });

    syncRange('min');
    draw();
  }

  /* ── TERMÉK OLDAL ────────────────────────────────────────────── */
  function renderTermek() {
    var mount = $('#sh-product-mount');
    if (!mount) return;
    var p = prodById(param('id')) || SHOP_PRODUCTS[0];
    var cat = catById(p.cat);
    var kerheto = p.ar > 0;
    var returnable = p.visszakuldheto === true; // személyre szabott darab alapból NEM

    // román kötelező fogyasztóvédelem — konverzió-közeli garanciablokk
    function gItem(icon, cls, title, sub) {
      return '<div class="sh-guarantee__item' + (cls ? ' ' + cls : '') + '">' + icon +
        '<div><b>' + title + '</b><span>' + sub + '</span></div></div>';
    }
    var guaranteeBlock =
      '<div class="sh-guarantee">' +
        '<div class="sh-guarantee__grid">' +
          gItem(ICO.shield, '', '2 év jótállás', 'törvényi megfelelőségi garancia gyártási hibára') +
          (returnable
            ? gItem(ICO.retur, 'ok', '14 nap elállás', 'indoklás nélkül visszaküldheted')
            : gItem(ICO.retur, 'note', 'Egyedi, személyre szabott', 'a törvény szerint erre nem jár 14 napos elállás')) +
          gItem(ICO.invoice, '', 'Számla minden rendeléshez', 'elektronikus számla e-mailben') +
          gItem(ICO.box, '', 'Ellenőrzés átvételkor', 'kibonthatod a csomagot kézbesítéskor') +
        '</div>' +
        (returnable
          ? '<p class="sh-guarantee__legal">Ez egy nem személyre szabott darab, így <b>14 napon belül indoklás nélkül visszaküldheted</b>. Részletek a <a href="gyik.html#visszakuldes">visszaküldési tájékoztatóban</a>.</p>'
          : '<p class="sh-guarantee__legal">Mivel ez a darab a te kérésedre, egyedileg készül, a jogszabály szerint a 14 napos elállás nem alkalmazható — de <b>gyártási vagy nyomtatási hibára a 2 éves jótállás keretében cserét vagy teljes visszatérítést adunk</b>. Részletek a <a href="gyik.html#visszakuldes">visszaküldési tájékoztatóban</a>.</p>') +
      '</div>';

    document.title = p.nev + ' — Layero Shop';
    setMeta(p.leiras);

    // SEO: Product + morzsamenü strukturált adat
    var rtLd = ratingOf(p);
    var prodLd = {
      '@context': 'https://schema.org', '@type': 'Product',
      name: p.nev, description: p.leiras,
      image: p.kepek.map(absUrl),
      brand: { '@type': 'Brand', name: 'Layero' },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: rtLd.r, reviewCount: rtLd.n }
    };
    if (p.ar > 0) prodLd.offers = { '@type': 'Offer', price: p.ar, priceCurrency: 'RON', availability: 'https://schema.org/InStock', url: location.href };
    injectJsonLd(prodLd);
    injectJsonLd({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Shop', item: absUrl('index.html') },
        { '@type': 'ListItem', position: 2, name: cat ? cat.nev : 'Termékek', item: absUrl('kategoria.html?cat=' + p.cat) },
        { '@type': 'ListItem', position: 3, name: p.nev, item: location.href }
      ]
    });

    // várható kézbesítés a gyártási időből + szállítás
    var gyText = (p.specs && p.specs.length) ? p.specs[p.specs.length - 1][1] : '5–10 munkanap';
    var gyM = gyText.match(/(\d+)\D+(\d+)/);
    var etaTol = addWorkdays((gyM ? parseInt(gyM[1], 10) : 5) + 2);
    var etaIg  = addWorkdays((gyM ? parseInt(gyM[2], 10) : 10) + 3);

    mount.innerHTML =
      '<nav class="sh-crumbs shop-wrap" aria-label="Morzsamenü">' +
        '<a href="index.html">Shop</a><span aria-hidden="true">/</span>' +
        '<a href="kategoria.html?cat=' + p.cat + '">' + (cat ? esc(cat.nev) : '') + '</a><span aria-hidden="true">/</span>' +
        '<span>' + esc(p.nev) + '</span>' +
      '</nav>' +
      '<div class="sh-product shop-wrap">' +
        '<div class="sh-pgallery">' +
          '<div class="sh-pgallery__main"><img id="sh-pmain" src="' + p.kepek[0] + '" alt="' + esc(p.nev) + '">' +
            '<div class="sh-persz-preview" id="sh-persz-view" aria-hidden="true"></div>' +
          '</div>' +
          '<div class="sh-pgallery__thumbs">' +
            p.kepek.map(function (src, i) {
              return '<button type="button" class="' + (i === 0 ? 'is-on' : '') + '" data-src="' + src + '"><img src="' + src + '" alt=""></button>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="sh-pinfo">' +
          '<span class="sh-pinfo__cat">' + (cat ? esc(cat.nev) : '') + '</span>' +
          '<h1>' + esc(p.nev) + '</h1>' +
          rateHtml(p, true) +
          '<div class="sh-pinfo__price">' +
            (p.regi_ar && p.regi_ar > p.ar
              ? '<span style="color:#e04726">' + p.ar + ' RON</span> <span style="text-decoration:line-through;color:var(--faint);font-weight:450;font-size:.85rem">' + p.regi_ar + ' RON</span> <span class="sh-pdp-save">−' + discountPct(p) + '%</span>'
              : fmtAr(p.ar) + (kerheto ? '<small>egyedi gyártással</small>' : '')) +
          '</div>' +
          '<p class="sh-pinfo__desc">' + esc(p.leiras) + '</p>' +
          (kerheto ?
            '<div class="sh-opt"><span>Felirat / név — élő előnézet a fotón</span>' +
              '<input class="sh-persz-input" id="sh-persz" type="text" maxlength="18" placeholder="pl. Olivér" autocomplete="off">' +
              '<p class="sh-persz-hint">Ez csak illusztráció — a pontos elhelyezést a tervezéskor egyeztetjük.</p>' +
            '</div>' +
            '<div class="sh-opt"><span class="sh-opt__hd">Méret <button class="sh-sizeguide" type="button" data-sizeguide>Mérettáblázat</button></span><div class="sh-opt__row" id="sh-opt-meret">' +
              SHOP_VARIANSOK.meret.map(function (m, i) {
                return '<button type="button" class="' + (i === 1 ? 'is-on' : '') + '">' + m + '</button>';
              }).join('') + '</div></div>' +
            '<div class="sh-opt"><span>Szín</span><div class="sh-opt__row" id="sh-opt-szin">' +
              SHOP_VARIANSOK.szin.map(function (m, i) {
                return '<button type="button" class="' + (i === 0 ? 'is-on' : '') + '">' + m + '</button>';
              }).join('') + '</div></div>' +
            '<div class="sh-buy-row">' +
              '<div class="sh-qty">' +
                '<button type="button" id="sh-qty-minus" aria-label="Kevesebb">−</button>' +
                '<output id="sh-qty-val">1</output>' +
                '<button type="button" id="sh-qty-plus" aria-label="Több">+</button>' +
              '</div>' +
              '<button class="sh-btn sh-btn--primary" id="sh-add-btn" type="button">Kosárba teszem</button>' +
            '</div>' +
            '<div class="sh-delivery">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M1 8h13v9H1zM14 11h4l3 3v3h-7z"/><circle cx="5.5" cy="19" r="1.8"/><circle cx="17.5" cy="19" r="1.8"/></svg>' +
              '<span>Ha ma rendelsz, várhatóan <b>' + fmtDatum(etaTol) + ' – ' + fmtDatum(etaIg) + '</b> között kézbesítjük.</span>' +
            '</div>' +
            '<div class="sh-notify-wrap" id="sh-notify-wrap"></div>'
          :
            '<div class="sh-buy-row"><a class="sh-btn sh-btn--primary" href="kapcsolat.html">Ajánlatot kérek</a></div>'
          ) +
          '<ul class="sh-ptrust">' +
            '<li>' + ICO.clock + '<span><b>Gyártás: ' + (p.specs && p.specs.length ? esc(p.specs[p.specs.length - 1][1]) : '5–10 munkanap') + '</b> — minden darab rendelésre készül</span></li>' +
            '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M1 8h13v9H1zM14 11h4l3 3v3h-7z"/><circle cx="5.5" cy="19" r="1.8"/><circle cx="17.5" cy="19" r="1.8"/></svg><span><b>Ingyenes szállítás</b> 200 lej feletti rendelésnél</span></li>' +
            '<li>' + ICO.shield + '<span><b>Biztonságos fizetés</b> — kártya, Apple Pay, Google Pay vagy utánvét</span></li>' +
          '</ul>' +
          (kerheto ? guaranteeBlock : '') +
          '<div id="sh-bundle-mount"></div>' +
        '</div>' +
      '</div>' +
      /* hosszú leírás + specifikáció */
      '<section class="sh-band sh-band--gray">' +
        '<div class="shop-wrap sh-longdesc">' +
          '<div class="sh-longdesc__text">' +
            '<h2 class="sh-h2">Részletes leírás.</h2>' +
            (p.hosszu || [p.leiras]).map(function (bek) { return '<p>' + esc(bek) + '</p>'; }).join('') +
          '</div>' +
          '<aside class="sh-specs">' +
            '<h3>Specifikáció</h3>' +
            '<table>' +
              (p.specs || []).map(function (row) {
                return '<tr><td>' + esc(row[0]) + '</td><td>' + esc(row[1]) + '</td></tr>';
              }).join('') +
            '</table>' +
          '</aside>' +
        '</div>' +
      '</section>' +
      /* szállítás / garancia / személyre szabás accordion */
      '<section class="sh-band sh-band--tight">' +
        '<div class="shop-wrap" style="max-width: 860px;">' +
          '<div class="sh-acc">' +
            '<details><summary>Szállítás és fizetés</summary><div>' +
              '<p>A csomagokat futárszolgálattal küldjük Románia egész területére. A szállítási díj 25 lej, 200 lej feletti rendelésnél ingyenes. Fizethetsz bankkártyával, Apple Pay-jel, Google Pay-jel vagy utánvéttel.</p>' +
              '<p>A gyártási idő terméktől függően 3–15 munkanap — a pontos időt a termék specifikációjában és a visszaigazoló e-mailben is megtalálod.</p>' +
            '</div></details>' +
            '<details><summary>Visszaküldés és garancia</summary><div>' +
              '<p><b>2 éves törvényi jótállás (garanție legală de conformitate):</b> minden termékünkre kiterjed. Gyártási, anyag- vagy nyomtatási hibára cserét vagy teljes visszatérítést adunk — elég egy fotó a hibáról.</p>' +
              (returnable
                ? '<p><b>14 napos elállási jog:</b> ez a darab nem személyre szabott, így indoklás nélkül, 14 napon belül visszaküldheted (a termék bontatlan, sértetlen állapotában).</p>'
                : '<p><b>14 napos elállás — egyedi termék:</b> mivel ez a darab a te kérésedre (névre, feliratra, saját igényre) készül, a jogszabály (OUG 34/2014) szerint a 14 napos elállási jog erre nem alkalmazható. A gyártási hibára vonatkozó jótállás természetesen ekkor is érvényes.</p>') +
              '<p>Panasszal az <a href="https://anpc.ro" target="_blank" rel="noopener">ANPC</a>-hez vagy az <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">EU online vitarendezési platformhoz</a> is fordulhatsz.</p>' +
            '</div></details>' +
            '<details><summary>Így zajlik a személyre szabás</summary><div>' +
              '<p>A rendelés után e-mailben egyeztetjük a pontos szövegeket, neveket, logót. Komplexebb darabnál digitális előnézetet küldünk jóváhagyásra, és csak azután indítjuk a gyártást — módosítási kör az árban van.</p>' +
            '</div></details>' +
          '</div>' +
        '</div>' +
      '</section>' +
      /* vélemények + Q&A */
      (kerheto ? reviewsHtml(p) : '') +
      /* hasonló termékek */
      '<section class="sh-section shop-wrap">' +
        '<div class="sh-section-hd"><span class="sh-label sh-kicker">Ajánló</span><h2 class="sh-h2">Hasonló termékek.</h2><a class="sh-link" href="kategoria.html?cat=' + p.cat + '">Összes ›</a></div>' +
        '<div class="sh-prod-grid">' +
          SHOP_PRODUCTS.filter(function (x) { return x.cat === p.cat && x.id !== p.id; }).slice(0, 4).map(prodCard).join('') +
        '</div>' +
      '</section>';

    // galéria váltás
    $all('.sh-pgallery__thumbs button', mount).forEach(function (b) {
      b.addEventListener('click', function () {
        $all('.sh-pgallery__thumbs button', mount).forEach(function (x) { x.classList.remove('is-on'); });
        b.classList.add('is-on');
        var img = $('#sh-pmain');
        img.classList.add('fade');
        setTimeout(function () { img.src = b.getAttribute('data-src'); img.classList.remove('fade'); }, 180);
      });
    });

    if (kerheto) {
      // variánsok
      ['#sh-opt-meret', '#sh-opt-szin'].forEach(function (sel) {
        var row = $(sel, mount);
        row.addEventListener('click', function (e) {
          var b = e.target.closest('button');
          if (!b) return;
          $all('button', row).forEach(function (x) { x.classList.remove('is-on'); });
          b.classList.add('is-on');
        });
      });
      // mennyiség
      var qty = 1;
      var out = $('#sh-qty-val');
      $('#sh-qty-minus').addEventListener('click', function () { qty = Math.max(1, qty - 1); out.textContent = qty; });
      $('#sh-qty-plus').addEventListener('click', function () { qty = Math.min(99, qty + 1); out.textContent = qty; });

      // élő felirat-előnézet a fotón
      var persz = $('#sh-persz');
      var perszView = $('#sh-persz-view');
      persz.addEventListener('input', function () {
        var v = persz.value.trim();
        perszView.textContent = v;
        perszView.classList.toggle('is-on', v.length > 0);
      });
      // a főoldali Layero Lab-ból érkező név előtöltése
      var labNev = (param('nev') || '').trim().slice(0, 18);
      if (labNev) {
        persz.value = labNev;
        persz.dispatchEvent(new Event('input'));
      }

      // kosárba tétel (a sticky sáv is ezt hívja)
      function doAdd() {
        var variant = $('#sh-opt-meret .is-on').textContent + ' · ' + $('#sh-opt-szin .is-on').textContent;
        var felirat = persz.value.trim();
        if (felirat) variant += ' · „' + felirat + '”';
        cartAdd(p.id, qty, variant);
        openDrawer();
      }
      $('#sh-add-btn').addEventListener('click', doAdd);

      // áreséskori / elérhetőségi értesítés (retenció, demo)
      var nw = $('#sh-notify-wrap');
      if (nw) {
        nw.innerHTML = '<button class="sh-notify" type="button" id="sh-notify-btn">' + ICO.bell + 'Értesíts, ha akciós lesz</button>';
        $('#sh-notify-btn').addEventListener('click', function () {
          nw.innerHTML = '<form class="sh-notify-form"><input type="email" required placeholder="E-mail cím az értesítéshez" aria-label="E-mail az értesítéshez"><button class="sh-btn sh-btn--dark" type="submit">Kérem</button></form>';
          $('form', nw).addEventListener('submit', function (e) {
            e.preventDefault();
            try { var s = JSON.parse(localStorage.getItem('sh_notify') || '{}'); s[p.id] = 1; localStorage.setItem('sh_notify', JSON.stringify(s)); } catch (er) {}
            nw.innerHTML = '<p class="sh-notify-done">' + CHECK_SVG + ' Beállítottuk — szólunk e-mailben, ha ez a termék akcióba kerül (demo).</p>';
          });
        });
      }

      // gyakran veszik együtt
      var tars = SHOP_PRODUCTS
        .filter(function (x) { return x.id !== p.id && x.ar > 0 && x.ar <= p.ar; })
        .sort(function (a, b) { return a.ar - b.ar; })[0];
      if (tars) {
        $('#sh-bundle-mount').innerHTML =
          '<div class="sh-bundle">' +
            '<h3>Gyakran veszik együtt</h3>' +
            '<div class="sh-bundle__row">' +
              '<figure><img src="' + p.kepek[0] + '" alt=""></figure>' +
              '<span class="sh-bundle__plus">+</span>' +
              '<figure><a href="termek.html?id=' + tars.id + '"><img src="' + tars.kepek[0] + '" alt="' + esc(tars.nev) + '"></a></figure>' +
              '<div class="sh-bundle__info"><b>' + (p.ar + tars.ar) + ' RON együtt</b>' + esc(p.nev) + ' + ' + esc(tars.nev) + '</div>' +
              '<button class="sh-btn sh-btn--dark" type="button" id="sh-bundle-add">Mindkettőt kérem</button>' +
            '</div>' +
          '</div>';
        $('#sh-bundle-add').addEventListener('click', function () {
          doAdd();
          cartAdd(tars.id, 1, '');
          toast('Mindkettő a kosárban — ügyes párosítás!');
        });
      }

      // sticky kosárba-sáv, amikor a fő gomb kigördül a képből
      var bar = document.createElement('div');
      bar.className = 'sh-stickybar';
      bar.innerHTML =
        '<div class="sh-stickybar__inner">' +
          '<figure><img src="' + p.kepek[0] + '" alt=""></figure>' +
          '<div class="sh-stickybar__name"><b>' + esc(p.nev) + '</b><span>' + fmtAr(p.ar) + ' · kézbesítés: ' + fmtDatum(etaTol) + ' – ' + fmtDatum(etaIg) + '</span></div>' +
          '<button class="sh-btn sh-btn--primary" type="button">Kosárba</button>' +
        '</div>';
      document.body.appendChild(bar);
      $('button', bar).addEventListener('click', doAdd);
      if ('IntersectionObserver' in window) {
        var buyIO = new IntersectionObserver(function (entries) {
          bar.classList.toggle('is-on', !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0);
        }, { threshold: 0 });
        buyIO.observe($('.sh-buy-row', mount));
      }
    }

    // nemrég nézett termékek (localStorage)
    try {
      var recent = JSON.parse(localStorage.getItem('sh_recent') || '[]').filter(function (id) { return id !== p.id && prodById(id); });
      if (recent.length) {
        var strip = document.createElement('section');
        strip.className = 'sh-section shop-wrap';
        strip.innerHTML =
          '<div class="sh-section-hd"><h2 class="sh-h2">Nemrég nézted.</h2></div>' +
          '<div class="sh-prod-grid">' + recent.slice(0, 4).map(function (id) { return prodCard(prodById(id)); }).join('') + '</div>';
        mount.appendChild(strip);
      }
      recent.unshift(p.id);
      localStorage.setItem('sh_recent', JSON.stringify(recent.slice(0, 8)));
    } catch (e) { /* privát mód */ }

    // vélemények + Q&A eseménykötés
    if (kerheto) wireReviews(mount);
    // mérettáblázat modal
    var sg = $('[data-sizeguide]', mount);
    if (sg) sg.addEventListener('click', function () { openInfoModal('Mérettáblázat', sizeGuideHtml()); });
    // az imént kirenderelt kártyák (hasonló / nemrég nézett) össze­hasonlítás-gombjai
    syncCompareUI();

    observeReveals();
  }

  /* ── KOSÁR OLDAL ─────────────────────────────────────────────── */
  function renderKosar() {
    var mount = $('#sh-cart-mount');
    if (!mount) return;

    function draw() {
      var items = cartGet();
      if (!items.length) {
        mount.innerHTML =
          '<div class="sh-cart-empty shop-wrap">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1.5 12.5a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5L6 7Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>' +
            '<h2>A kosarad üres</h2>' +
            '<p>Nézz körül a termékek között — minden darab rendelésre, személyre szabva készül.</p>' +
            '<a class="sh-btn sh-btn--primary" href="kategoria.html">Vásárlás megkezdése</a>' +
          '</div>';
        return;
      }

      var osszeg = 0;
      var rows = items.map(function (it) {
        var p = prodById(it.id);
        if (!p) return '';
        var tetel = p.ar * it.qty;
        osszeg += tetel;
        return '<div class="sh-cart-item" data-key="' + it.key + '">' +
          '<figure><a href="termek.html?id=' + p.id + '"><img src="' + p.kepek[0] + '" alt="' + esc(p.nev) + '"></a></figure>' +
          '<div>' +
            '<div class="sh-cart-item__name">' + esc(p.nev) + '</div>' +
            (it.variant ? '<div class="sh-cart-item__meta">' + esc(it.variant) + '</div>' : '') +
            '<div class="sh-cart-item__actions">' +
              '<div class="sh-qty">' +
                '<button type="button" data-act="minus" aria-label="Kevesebb">−</button>' +
                '<output>' + it.qty + '</output>' +
                '<button type="button" data-act="plus" aria-label="Több">+</button>' +
              '</div>' +
              '<button class="sh-cart-item__remove" type="button" data-act="remove">Eltávolítás</button>' +
            '</div>' +
          '</div>' +
          '<div class="sh-cart-item__price">' + tetel + ' RON</div>' +
        '</div>';
      }).join('');

      var MIN_RENDELES = 50;
      var INGYENES_FELETT = 200;
      var szallitas = osszeg >= INGYENES_FELETT ? 0 : 25;
      var minHianyzik = osszeg < MIN_RENDELES;
      // keresztértékesítés: olcsó kiegészítők, amik még nincsenek a kosárban
      var cartIds = items.map(function (it) { return it.id; });
      var extrak = SHOP_PRODUCTS.filter(function (x) {
        return x.ar > 0 && x.ar <= 150 && cartIds.indexOf(x.id) === -1;
      }).sort(function (a, b) { return a.ar - b.ar; }).slice(0, 3);

      var shipPct = Math.min(100, Math.floor(osszeg / INGYENES_FELETT * 100));
      mount.innerHTML =
        '<div class="shop-wrap"><h1 class="sh-cart-title">Kosár<small>' + cartCount() + ' tétel</small></h1></div>' +
        '<div class="sh-cart-layout shop-wrap">' +
          '<div>' +
            '<div id="sh-cart-items">' + rows + '</div>' +
            (extrak.length ?
              '<div class="sh-crosssell"><h3>Tedd mellé — jól passzol a kosaradhoz</h3><div class="sh-crosssell__row">' +
                extrak.map(function (x) {
                  return '<div class="sh-crosssell__item">' +
                    '<figure><a href="termek.html?id=' + x.id + '"><img src="' + x.kepek[0] + '" alt="' + esc(x.nev) + '"></a></figure>' +
                    '<div><b>' + esc(x.nev) + '</b>' + x.ar + ' RON</div>' +
                    '<button type="button" data-add="' + x.id + '" aria-label="Kosárba: ' + esc(x.nev) + '">+</button>' +
                  '</div>';
                }).join('') +
              '</div></div>' : '') +
          '</div>' +
          '<aside class="sh-summary">' +
            '<h2>Összesítő</h2>' +
            '<div class="sh-shipbar">' +
              '<div class="sh-shipbar__label">' +
                (szallitas === 0
                  ? '<b>Ingyenes szállítás</b> — elérted a 200 lejt 🎉'
                  : 'Még <b>' + (INGYENES_FELETT - osszeg) + ' RON</b> az ingyenes szállításig') +
              '</div>' +
              '<div class="sh-shipbar__track"><div class="sh-shipbar__fill" style="width:' + shipPct + '%"></div></div>' +
            '</div>' +
            '<div class="sh-summary__row"><span>Részösszeg</span><span>' + osszeg + ' RON</span></div>' +
            '<div class="sh-summary__row"><span>Szállítás</span><span>' + (szallitas === 0 ? 'Ingyenes' : szallitas + ' RON') + '</span></div>' +
            '<div class="sh-summary__row total"><span>Összesen</span><span>' + (osszeg + szallitas) + ' RON</span></div>' +
            '<a class="sh-btn sh-btn--primary" href="penztar.html"' + (minHianyzik ? ' aria-disabled="true" style="opacity:.45;pointer-events:none"' : '') + '>Tovább a pénztárhoz</a>' +
            (minHianyzik ? '<p class="sh-summary__hint" style="color:var(--gold)">A minimális rendelési érték ' + MIN_RENDELES + ' RON — még ' + (MIN_RENDELES - osszeg) + ' RON hiányzik.</p>' : '') +
            '<p class="sh-summary__hint">Biztonságos fizetés · VISA · Mastercard · Apple Pay · utánvét</p>' +
          '</aside>' +
        '</div>';

      $all('[data-add]', mount).forEach(function (b) {
        b.addEventListener('click', function () {
          cartAdd(b.getAttribute('data-add'), 1, '');
          toast('A kosárba került!');
          draw();
        });
      });

      $('#sh-cart-items').addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-act]');
        if (!btn) return;
        var key = btn.closest('.sh-cart-item').getAttribute('data-key');
        var items2 = cartGet();
        var it = null;
        items2.forEach(function (x) { if (x.key === key) it = x; });
        if (!it) return;
        var act = btn.getAttribute('data-act');
        if (act === 'plus') it.qty = Math.min(99, it.qty + 1);
        if (act === 'minus') it.qty = Math.max(1, it.qty - 1);
        if (act === 'remove') items2 = items2.filter(function (x) { return x.key !== key; });
        cartSet(items2);
        draw();
      });

    }
    draw();
  }

  /* ── PÉNZTÁR (checkout) ──────────────────────────────────────── */
  function renderPenztar() {
    var mount = $('#sh-checkout-mount');
    if (!mount) return;
    var t = cartTotals();
    if (!t.items.length) {
      mount.innerHTML =
        '<div class="sh-cart-empty shop-wrap">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1.5 12.5a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5L6 7Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>' +
          '<h2>A kosarad üres</h2><p>Előbb tegyél be valamit a kosaradba.</p>' +
          '<a class="sh-btn sh-btn--primary" href="kategoria.html">Vásárlás</a>' +
        '</div>';
      return;
    }

    function summaryHtml() {
      var tt = cartTotals();
      return '<h3>Rendelésed</h3>' +
        tt.items.map(function (r) {
          return '<div class="sh-co-line">' +
            '<figure><img src="' + r.p.kepek[0] + '" alt=""><span class="qtb">' + r.it.qty + '</span></figure>' +
            '<div><b>' + esc(r.p.nev) + '</b>' + (r.it.variant ? '<small>' + esc(r.it.variant) + '</small>' : '') + '</div>' +
            '<span class="pr">' + r.sor + ' RON</span>' +
          '</div>';
        }).join('') +
        '<div style="height:12px"></div>' +
        '<div class="sh-sumrow"><span>Részösszeg</span><span>' + tt.subtotal + ' RON</span></div>' +
        (tt.discount ? '<div class="sh-sumrow disc"><span>Kedvezmény' + (tt.coupon ? ' (' + tt.coupon.code + ')' : '') + '</span><span>−' + tt.discount + ' RON</span></div>' : '') +
        (tt.gift ? '<div class="sh-sumrow"><span>Ajándékcsomagolás</span><span>' + tt.gift + ' RON</span></div>' : '') +
        '<div class="sh-sumrow"><span>Szállítás</span><span>' + (tt.shipping === 0 ? 'Ingyenes' : tt.shipping + ' RON') + '</span></div>' +
        '<div class="sh-sumrow total"><span>Fizetendő</span><span>' + tt.total + ' RON</span></div>' +
        '<button class="sh-btn sh-btn--primary" type="submit" form="sh-co-form">Megrendelés elküldése</button>' +
        '<ul class="sh-co-trust">' +
          '<li>' + ICO.shield + ' SSL-titkosított, biztonságos fizetés</li>' +
          '<li>' + ICO.shield + ' 2 év törvényi jótállás minden termékre</li>' +
          '<li>' + ICO.retur + ' 14 napos elállás a nem személyre szabott termékekre</li>' +
          '<li>' + ICO.invoice + ' Számlát adunk minden rendeléshez</li>' +
        '</ul>';
    }

    mount.innerHTML =
      '<div class="shop-wrap">' +
        '<h1 class="sh-checkout__title">Pénztár</h1>' +
        '<div class="sh-checkout__steps"><b>1. Adatok</b> › <b>2. Szállítás</b> › <b>3. Fizetés</b> › <span>4. Kész</span></div>' +
        '<div class="sh-checkout">' +
          '<form id="sh-co-form" novalidate>' +
            '<div class="sh-co-block"><h3><i>1</i> Kapcsolat és számlázás</h3>' +
              '<div class="sh-form__row"><div class="sh-field"><label>Teljes név</label><input required name="nev" autocomplete="name"></div>' +
              '<div class="sh-field"><label>E-mail</label><input required type="email" name="email" autocomplete="email"></div></div>' +
              '<div class="sh-form__row"><div class="sh-field"><label>Telefon</label><input required name="tel" autocomplete="tel"></div>' +
              '<div class="sh-field"><label>Irányítószám</label><input required name="zip" autocomplete="postal-code"></div></div>' +
              '<div class="sh-form__row"><div class="sh-field"><label>Város</label><input required name="varos" autocomplete="address-level2"></div>' +
              '<div class="sh-field"><label>Cím</label><input required name="cim" autocomplete="street-address"></div></div>' +
            '</div>' +
            '<div class="sh-co-block"><h3><i>2</i> Szállítási mód</h3><div class="sh-co-choice" data-co-ship>' +
              '<label class="sh-co-opt is-on" data-val="futar"><span class="sh-co-opt__radio"></span><div><b>Futárszolgálat — házhoz</b><small>1–2 munkanap a gyártás után</small></div><span class="pr" data-ship-futar>' + (t.shipping === 0 ? 'Ingyenes' : t.shipping + ' RON') + '</span></label>' +
              '<label class="sh-co-opt" data-val="csomagpont"><span class="sh-co-opt__radio"></span><div><b>Csomagpont átvétel</b><small>Easybox / posta, 2–3 munkanap</small></div><span class="pr">' + (t.shipping === 0 ? 'Ingyenes' : '19 RON') + '</span></label>' +
              '<label class="sh-co-opt" data-val="szemelyes"><span class="sh-co-opt__radio"></span><div><b>Személyes átvétel</b><small>Szatmárnémeti, műhelyünkben</small></div><span class="pr">Ingyenes</span></label>' +
            '</div></div>' +
            '<div class="sh-co-block"><h3><i>3</i> Fizetési mód</h3><div class="sh-co-choice" data-co-pay>' +
              '<label class="sh-co-opt is-on" data-val="kartya"><span class="sh-co-opt__radio"></span><div><b>Bankkártya</b><small>VISA, Mastercard, Apple Pay, Google Pay</small></div></label>' +
              '<label class="sh-co-opt" data-val="utanvet"><span class="sh-co-opt__radio"></span><div><b>Utánvét</b><small>Fizetés átvételkor a futárnál (+5 RON)</small></div></label>' +
              '<label class="sh-co-opt" data-val="atutalas"><span class="sh-co-opt__radio"></span><div><b>Banki átutalás</b><small>A visszaigazoló e-mailben küldjük az adatokat</small></div></label>' +
            '</div></div>' +
            '<div class="sh-co-block">' +
              '<div class="sh-giftwrap' + (t.gift ? ' is-on' : '') + '" data-co-gift role="button" tabindex="0">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7S10 2 7 3.5 9 7 12 7ZM12 7s2-5 5-3.5S15 7 12 7Z"/></svg>' +
                '<div><b>Ajándékcsomagolás</b><small>Díszdoboz + kézzel írt üzenet · +' + GIFTWRAP_FEE + ' lej</small></div>' +
                '<span class="sh-giftwrap__check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>' +
              '</div>' +
              '<div class="sh-coupon"><input type="text" placeholder="Kuponkód" data-co-coupon-input value="' + (t.coupon ? t.coupon.code : '') + '"><button type="button" data-co-coupon>Beváltás</button></div>' +
              '<p class="sh-coupon__msg' + (t.coupon ? ' ok' : '') + '" data-co-coupon-msg>' + (t.coupon ? 'Kupon: ' + t.coupon.def.cimke : '') + '</p>' +
            '</div>' +
          '</form>' +
          '<aside class="sh-co-summary" id="sh-co-summary">' + summaryHtml() + '</aside>' +
        '</div>' +
      '</div>';

    function refresh() { $('#sh-co-summary').innerHTML = summaryHtml(); }

    // választók
    $all('[data-co-ship] .sh-co-opt, [data-co-pay] .sh-co-opt', mount).forEach(function (opt) {
      opt.addEventListener('click', function (e) {
        e.preventDefault();
        var group = opt.parentNode;
        $all('.sh-co-opt', group).forEach(function (o) { o.classList.remove('is-on'); });
        opt.classList.add('is-on');
      });
    });
    // ajándékcsomagolás
    $('[data-co-gift]', mount).addEventListener('click', function () { giftSet(!giftGet()); this.classList.toggle('is-on', giftGet()); refresh(); });
    // kupon
    $('[data-co-coupon]', mount).addEventListener('click', function () {
      var code = ($('[data-co-coupon-input]', mount).value || '').trim().toUpperCase();
      var msg = $('[data-co-coupon-msg]', mount);
      if (COUPONS[code]) { couponSet(code); msg.className = 'sh-coupon__msg ok'; msg.textContent = 'Kupon: ' + COUPONS[code].cimke; refresh(); }
      else { couponSet(''); msg.className = 'sh-coupon__msg err'; msg.textContent = 'Érvénytelen kód.'; refresh(); }
    });
    // megrendelés
    $('#sh-co-form', mount).addEventListener('submit', function (e) {
      e.preventDefault();
      if (!this.checkValidity()) { this.reportValidity(); return; }
      var orderNo = 'LAY-' + String(Date.now()).slice(-6);
      var fd = new FormData(this);
      var tt = cartTotals();
      var earned = Math.floor(tt.total);
      // rendelés mentése a fiókhoz (demo, localStorage)
      ordersAdd({
        no: orderNo, date: Date.now(), total: tt.total,
        items: tt.items.map(function (r) { return { id: r.p.id, nev: r.p.nev, qty: r.it.qty, variant: r.it.variant, ar: r.p.ar, kep: r.p.kepek[0] }; })
      });
      if (!profileGet()) profileSet({ nev: fd.get('nev') || 'Vásárló', email: fd.get('email') || '' });
      cartSet([]); couponSet(''); giftSet(false);
      window.scrollTo(0, 0);
      mount.innerHTML =
        '<div class="sh-success shop-wrap">' +
          '<div class="sh-success__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>' +
          '<h1>Köszönjük a rendelésed!</h1>' +
          '<p>Rendelésszám: <b>' + orderNo + '</b>. Visszaigazoló e-mailt küldtünk a részletekkel. (Demo — valós fizetés még nincs mögötte.)</p>' +
          '<p class="sh-success__points">' + ICO.shield + ' <b>+' + earned + ' hűségpont</b> jóváírva a fiókodon ehhez a rendeléshez.</p>' +
          '<ol class="sh-nextsteps" aria-label="A rendelésed útja">' +
            '<li class="is-done"><i>✓</i><b>Visszaigazolás</b><span>e-mailben, most</span></li>' +
            '<li><i>2</i><b>Digitális terv</b><span>jóváhagyásra küldjük</span></li>' +
            '<li><i>3</i><b>Nyomtatás</b><span>napelemes műhelyben</span></li>' +
            '<li><i>4</i><b>Kézbesítés</b><span>futárral az ajtódig</span></li>' +
          '</ol>' +
          '<div class="sh-success__cta"><a class="sh-btn sh-btn--primary" href="fiok.html">Rendeléseim megtekintése</a>' +
          '<a class="sh-btn sh-btn--ghost" href="kategoria.html">Vásárlás folytatása</a></div>' +
        '</div>';
      launchConfetti();
    });
  }

  /* ── KAPCSOLAT OLDAL ─────────────────────────────────────────── */
  function renderKapcsolat() {
    var form = $('#sh-contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = document.createElement('div');
      ok.className = 'sh-form__ok';
      ok.textContent = 'Köszönjük! Az üzeneted megérkezett (demo) — hamarosan válaszolunk.';
      form.innerHTML = '';
      form.appendChild(ok);
    });
  }

  /* ── KÍVÁNSÁGLISTA OLDAL ─────────────────────────────────────── */
  function renderKedvencek() {
    var mount = $('#sh-wish-mount');
    if (!mount) return;
    function draw() {
      var items = wishGet().map(prodById).filter(Boolean);
      if (!items.length) {
        mount.innerHTML =
          '<div class="sh-wish-empty shop-wrap">' +
            HEART_SVG +
            '<h2>A kívánságlistád üres</h2>' +
            '<p>A termékeknél a szív ikonra kattintva bármit ide menthetsz későbbre.</p>' +
            '<a class="sh-btn sh-btn--primary" href="kategoria.html">Termékek böngészése</a>' +
          '</div>';
        return;
      }
      mount.innerHTML =
        '<div class="shop-wrap"><h1 class="sh-cart-title">Kívánságlista<small>' + items.length + ' mentett termék</small></h1></div>' +
        '<div class="sh-band sh-band--tight"><div class="shop-wrap"><div class="sh-prod-grid">' +
          items.map(prodCard).join('') +
        '</div></div></div>';
      observeReveals();
    }
    draw();
    // ha innen kiveszünk valamit, frissüljön a lista
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-wish]')) setTimeout(draw, 0);
    });
  }

  /* ── AJÁNDÉKKERESŐ KVÍZ ──────────────────────────────────────── */
  var QUIZ = [
    { q: 'Kinek keresel ajándékot?', opts: [
      { t: 'Gyereknek', cat: { lampak: 2, rajongoi: 1 }, ids: { 'jurassic-lampa': 3 } },
      { t: 'A páromnak', cat: { lampak: 2, dekoraciok: 1 }, ids: { 'holdfeny-lampa': 2, 'tulipan-vaza': 2 } },
      { t: 'Szülőnek / nagyszülőnek', cat: { dekoraciok: 2 }, ids: { 'eletfa-mecses-szett': 2, 'szarvas-bortarto': 2 } },
      { t: 'Barátnak / kollégának', cat: { kulcstartok: 2, rajongoi: 1 } },
      { t: 'Magamnak / otthonra', cat: { dekoraciok: 2, lampak: 1 } },
      { t: 'Céges partnernek', cat: { ceges: 3 } }
    ] },
    { q: 'Milyen alkalomra?', opts: [
      { t: 'Születésnap', cat: { lampak: 1, rajongoi: 1 } },
      { t: 'Ballagás / diploma', ids: { 'bagoly-figura': 3, 'programozo-lampa': 2 } },
      { t: 'Karácsony', cat: { lampak: 1 }, ids: { 'karacsonyi-lampa': 3 } },
      { t: 'Évforduló / szerelem', ids: { 'holdfeny-lampa': 2, 'tulipan-vaza': 2, 'sorozat-lampa': 1 } },
      { t: 'Céges rendezvény', cat: { ceges: 3 } },
      { t: 'Csak úgy, meglepetésnek', cat: { lampak: 1, dekoraciok: 1, kulcstartok: 1 } }
    ] },
    { q: 'Milyen stílus áll közel hozzá?', opts: [
      { t: 'Világító, hangulatos', cat: { lampak: 3 } },
      { t: 'Praktikus, apró', cat: { kulcstartok: 3 } },
      { t: 'Dekoratív lakásdísz', cat: { dekoraciok: 3 } },
      { t: 'Rajongói / gyűjtői', cat: { rajongoi: 3 } },
      { t: 'Valami teljesen egyedi', ids: { 'egyedi-otlet': 6 } }
    ] },
    { q: 'Nagyjából mennyit szánnál rá?', opts: [
      { t: '50–100 lej', maxAr: 100 },
      { t: '100–200 lej', maxAr: 200 },
      { t: '200 lej felett', minAr: 200 },
      { t: 'Az ár most mindegy' }
    ] }
  ];

  function quizResults(answers) {
    var scores = {};
    var priceOpt = null;
    answers.forEach(function (opt, step) {
      if (!opt) return;
      if (step === QUIZ.length - 1) priceOpt = opt; // ár-lépés
      SHOP_PRODUCTS.forEach(function (p) {
        var s = scores[p.id] || 0;
        if (opt.cat && opt.cat[p.cat]) s += opt.cat[p.cat];
        if (opt.ids && opt.ids[p.id]) s += opt.ids[p.id];
        scores[p.id] = s;
      });
    });
    var list = SHOP_PRODUCTS.map(function (p) { return { p: p, s: scores[p.id] || 0 }; });
    // ársáv: a nem illő árú termékek visszaesnek (de nem tűnnek el)
    if (priceOpt) list.forEach(function (r) {
      if (r.p.ar <= 0) return; // egyedi ajánlatkérős kimarad az árszűrésből
      if (priceOpt.maxAr && r.p.ar > priceOpt.maxAr) r.s -= 2;
      if (priceOpt.minAr && r.p.ar < priceOpt.minAr) r.s -= 2;
    });
    list.sort(function (a, b) { return b.s - a.s || b.p.ar - a.p.ar; });
    return list.filter(function (r) { return r.s > 0; }).slice(0, 4).map(function (r) { return r.p; });
  }

  function renderKviz() {
    var mount = $('#sh-quiz-mount');
    if (!mount) return;
    var step = 0;
    var answers = [];

    function drawStep() {
      var Q = QUIZ[step];
      var pct = Math.round(step / QUIZ.length * 100);
      mount.innerHTML =
        '<section class="sh-quiz shop-wrap">' +
          '<div class="sh-quiz__head">' +
            '<span class="sh-quiz__eyebrow">Ajándékkereső</span>' +
            '<div class="sh-quiz__prog"><i style="width:' + pct + '%"></i></div>' +
            '<span class="sh-quiz__count">' + (step + 1) + ' / ' + QUIZ.length + '</span>' +
          '</div>' +
          '<h1>' + esc(Q.q) + '</h1>' +
          '<div class="sh-quiz__opts">' +
            Q.opts.map(function (o, i) { return '<button type="button" class="sh-quiz__opt" data-i="' + i + '">' + esc(o.t) + '</button>'; }).join('') +
          '</div>' +
          (step > 0 ? '<button type="button" class="sh-quiz__back" data-back>‹ Vissza</button>' : '') +
        '</section>';
      $all('.sh-quiz__opt', mount).forEach(function (b) {
        b.addEventListener('click', function () {
          answers[step] = Q.opts[parseInt(b.getAttribute('data-i'), 10)];
          if (step < QUIZ.length - 1) { step++; drawStep(); }
          else drawResult();
        });
      });
      var back = $('[data-back]', mount);
      if (back) back.addEventListener('click', function () { step--; drawStep(); });
    }

    function drawResult() {
      var hits = quizResults(answers);
      if (!hits.length) hits = SHOP_PRODUCTS.filter(function (p) { return p.badge === 'Bestseller'; }).slice(0, 4);
      mount.innerHTML =
        '<section class="sh-quiz sh-quiz--result shop-wrap">' +
          '<span class="sh-quiz__eyebrow">Kész is!</span>' +
          '<h1>Ezt ajánljuk neki.</h1>' +
          '<p class="sh-quiz__lead">A válaszaid alapján ezek a darabok illenek a legjobban. Mindegyik személyre szabható — a pontos részleteket rendelés után egyeztetjük.</p>' +
          '<div class="sh-prod-grid">' + hits.map(prodCard).join('') + '</div>' +
          '<div class="sh-quiz__foot">' +
            '<button type="button" class="sh-btn sh-btn--ghost" data-restart>Újrakezdem</button>' +
            '<a class="sh-btn sh-btn--primary" href="kategoria.html">Összes termék böngészése</a>' +
          '</div>' +
        '</section>';
      $('[data-restart]', mount).addEventListener('click', function () { step = 0; answers = []; drawStep(); });
      syncCompareUI();
      observeReveals();
    }

    drawStep();
  }

  /* ── FIÓK OLDAL (demo) ───────────────────────────────────────── */
  function renderFiok() {
    var mount = $('#sh-account-mount');
    if (!mount) return;

    function drawLogin() {
      mount.innerHTML =
        '<div class="sh-auth shop-wrap">' +
          '<div class="sh-auth__card">' +
            '<span class="sh-auth__ico">' + ICO.user + '</span>' +
            '<h1>Belépés a fiókodba</h1>' +
            '<p>Kövesd a rendeléseid, gyűjts hűségpontot, és mentsd el az adataid a gyorsabb rendeléshez.</p>' +
            '<form id="sh-auth-form" class="sh-form">' +
              '<div class="sh-field"><label>Teljes név</label><input name="nev" required autocomplete="name"></div>' +
              '<div class="sh-field"><label>E-mail</label><input name="email" type="email" required autocomplete="email"></div>' +
              '<button class="sh-btn sh-btn--primary" type="submit">Belépés / regisztráció</button>' +
            '</form>' +
            '<small>Demo fiók — az adatok csak a böngésződben tárolódnak, nem küldjük el sehova.</small>' +
          '</div>' +
        '</div>';
      $('#sh-auth-form').addEventListener('submit', function (e) {
        e.preventDefault();
        if (!this.checkValidity()) { this.reportValidity(); return; }
        var fd = new FormData(this);
        profileSet({ nev: fd.get('nev'), email: fd.get('email') });
        toast('Üdv, ' + fd.get('nev').split(' ')[0] + '! Beléptél (demo).');
        drawDash();
      });
    }

    function drawDash() {
      var prof = profileGet();
      var pts = loyaltyPoints();
      var tier = loyaltyTier(pts);
      var orders = ordersGet();
      var progHtml = '';
      if (tier.next) {
        var span = tier.next.min - tier.cur.min;
        var pct = Math.min(100, Math.round((pts - tier.cur.min) / span * 100));
        progHtml = '<div class="sh-loyalty__track"><i style="width:' + pct + '%"></i></div>' +
          '<small>Még <b>' + (tier.next.min - pts) + ' pont</b> a(z) ' + tier.next.nev + ' szintig</small>';
      } else {
        progHtml = '<div class="sh-loyalty__track"><i style="width:100%"></i></div><small>Elérted a legmagasabb szintet 🎉</small>';
      }

      var ordersHtml = orders.length
        ? orders.map(function (o) {
            var d = new Date(o.date);
            var thumbs = o.items.slice(0, 4).map(function (it) {
              return '<img src="' + it.kep + '" alt="' + esc(it.nev) + '" title="' + esc(it.nev) + '">';
            }).join('');
            var qty = o.items.reduce(function (s, it) { return s + it.qty; }, 0);
            return '<article class="sh-order">' +
              '<div class="sh-order__hd"><div><b>' + o.no + '</b><span>' + d.getFullYear() + '. ' + HONAPOK[d.getMonth()] + ' ' + d.getDate() + '.</span></div>' +
                '<span class="sh-order__status">Feldolgozás alatt</span></div>' +
              '<div class="sh-order__body"><div class="sh-order__thumbs">' + thumbs + '</div>' +
                '<div class="sh-order__meta"><span>' + qty + ' tétel</span><b>' + o.total + ' RON</b></div></div>' +
            '</article>';
          }).join('')
        : '<div class="sh-order-empty"><p>Még nincs rendelésed.</p><a class="sh-btn sh-btn--primary" href="kategoria.html">Vásárlás megkezdése</a></div>';

      mount.innerHTML =
        '<section class="sh-page-hd"><div class="shop-wrap">' +
          '<nav class="sh-crumbs" aria-label="Morzsamenü"><a href="index.html">Shop</a><span aria-hidden="true">/</span><span>Fiókom</span></nav>' +
          '<h1>Szia, ' + esc(prof.nev.split(' ')[0]) + '!</h1>' +
          '<p>' + esc(prof.email) + '</p>' +
        '</div></section>' +
        '<div class="sh-band sh-band--tight"><div class="shop-wrap sh-account">' +
          '<aside class="sh-account__side">' +
            '<div class="sh-loyalty">' +
              '<span class="sh-loyalty__tier">' + tier.cur.nev + ' szint</span>' +
              '<b class="sh-loyalty__pts">' + pts + '<span> pont</span></b>' +
              progHtml +
            '</div>' +
            '<nav class="sh-account__nav">' +
              '<a href="kedvencek.html">' + HEART_SVG + ' Kívánságlista</a>' +
              '<a href="gyik.html">' + ICO.shield + ' Gyakori kérdések</a>' +
              '<a href="kapcsolat.html">' + ICO.mail + ' Ügyfélszolgálat</a>' +
              '<button type="button" id="sh-logout">' + ICO.user + ' Kijelentkezés</button>' +
            '</nav>' +
          '</aside>' +
          '<div class="sh-account__main">' +
            '<h2 class="sh-h2">Rendeléseim</h2>' +
            '<div class="sh-orders">' + ordersHtml + '</div>' +
            '<h2 class="sh-h2" style="margin-top:36px">Mentett adatok</h2>' +
            '<form class="sh-form sh-account__profile" id="sh-profile-form">' +
              '<div class="sh-form__row">' +
                '<div class="sh-field"><label>Név</label><input name="nev" value="' + esc(prof.nev) + '" required></div>' +
                '<div class="sh-field"><label>E-mail</label><input name="email" type="email" value="' + esc(prof.email) + '" required></div>' +
              '</div>' +
              '<div class="sh-form__row">' +
                '<div class="sh-field"><label>Telefon</label><input name="tel" value="' + esc(prof.tel || '') + '" autocomplete="tel"></div>' +
                '<div class="sh-field"><label>Szállítási cím</label><input name="cim" value="' + esc(prof.cim || '') + '" autocomplete="street-address"></div>' +
              '</div>' +
              '<button class="sh-btn sh-btn--dark" type="submit">Adatok mentése</button>' +
            '</form>' +
          '</div>' +
        '</div></div>';

      $('#sh-logout').addEventListener('click', function () {
        profileSet(null);
        toast('Kijelentkeztél. A rendeléseid a böngésződben maradnak.');
        drawLogin();
      });
      $('#sh-profile-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var fd = new FormData(this);
        profileSet({ nev: fd.get('nev'), email: fd.get('email'), tel: fd.get('tel'), cim: fd.get('cim') });
        toast('Adatok elmentve.');
      });
    }

    if (profileGet()) drawDash(); else drawLogin();
  }

  /* ── scroll reveal ───────────────────────────────────────────── */
  var revealIO = null;
  function observeReveals() {
    if (!('IntersectionObserver' in window)) {
      $all('.sh-reveal').forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    if (!revealIO) {
      revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            revealIO.unobserve(en.target);
          }
        });
      }, { rootMargin: '0px 0px -5% 0px', threshold: 0.05 });
    }
    $all('.sh-reveal:not(.is-in)').forEach(function (el) { revealIO.observe(el); });
  }

  /* ── globális extrák: forgó üzenet, cookie, popup, lebegők ────── */
  function renderExtras() {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // akció-szalag visszaszámlálóval a fejléc alatt
    var header = $('.sh-header');
    if (header && document.body.getAttribute('data-page') !== 'kosar') {
      // (a naponta újrainduló ál-visszaszámláló eltávolítva — az akció
      // üzenete marad, hamis határidő nélkül)
      var promo = document.createElement('div');
      promo.className = 'sh-promobar';
      promo.innerHTML =
        '<span><b>Nyári akció</b> — akár <b>-20%</b> kiemelt termékekre</span>' +
        '<a href="kategoria.html">Megnézem ›</a>';
      header.parentNode.insertBefore(promo, header.nextSibling);
    }

    // topbar üzenet-rotáció — nyugodt, fix háttéren (a 4,5 mp-enként
    // színt váltó háttér zavaró volt, kikerült)
    var rot = $('[data-rotate]');
    if (rot) {
      var topbarEl = $('.sh-topbar');
      if (topbarEl) topbarEl.className = 'sh-topbar sh-topbar--navy';
      var msgs = $all('span', rot);
      var mi = 0;
      if (!reduceMotion) {
        setInterval(function () {
          msgs[mi].classList.remove('is-on');
          mi = (mi + 1) % msgs.length;
          msgs[mi].classList.add('is-on');
        }, 6000);
      }
    }

    // fejléc: legörgetésnél a topbar elbújik, felfelé görgetésnél visszatér;
    // görgetett állapotban finom árnyék kerül a fejlécre
    var headerEl = $('.sh-header');
    if (headerEl) {
      var tbEl = $('.sh-topbar', headerEl);
      var lastY = window.scrollY, tbHidden = false, hdTick = false;
      window.addEventListener('scroll', function () {
        if (hdTick) return;
        hdTick = true;
        requestAnimationFrame(function () {
          hdTick = false;
          var y = window.scrollY;
          headerEl.classList.toggle('is-scrolled', y > 8);
          if (tbEl && Math.abs(y - lastY) > 4) {
            if (y > lastY && y > 90 && !tbHidden) {
              tbHidden = true;
              tbEl.style.height = tbEl.offsetHeight + 'px';
              void tbEl.offsetHeight; /* reflow, hogy a magasság-átmenet elinduljon */
              tbEl.style.height = '0px';
            } else if (y < lastY && tbHidden) {
              tbHidden = false;
              tbEl.style.height = tbEl.scrollHeight + 'px';
              tbEl.addEventListener('transitionend', function fn(ev) {
                if (ev.propertyName === 'height' && !tbHidden) tbEl.style.height = '';
                tbEl.removeEventListener('transitionend', fn);
              });
            }
          }
          lastY = y;
        });
      }, { passive: true });
    }

    // promó popup (–10% kupon) — ülésenként egyszer magától, a kuponjegyről bármikor
    var promoModal = document.createElement('div');
    promoModal.className = 'sh-modal';
    promoModal.setAttribute('role', 'dialog');
    promoModal.setAttribute('aria-modal', 'true');
    promoModal.innerHTML =
      '<div class="sh-modal__box">' +
        '<button class="sh-modal__close" type="button" aria-label="Bezárás">✕</button>' +
        '<span class="sh-modal__badge">Első rendelés</span>' +
        '<h2>–10% az első rendelésedre</h2>' +
        '<p>Iratkozz fel, és e-mailben küldjük a kuponkódot — mellé havonta egyszer újdonságokat, spam nélkül.</p>' +
        '<form><input type="email" required placeholder="E-mail címed" aria-label="E-mail cím"><button class="sh-btn sh-btn--dark" type="submit">Kérem a kupont</button></form>' +
        '<button class="sh-modal__skip" type="button">Most nem, köszönöm</button>' +
      '</div>';
    document.body.appendChild(promoModal);
    var closePromo = function () {
      promoModal.classList.remove('is-open');
      sessionStorage.setItem('sh_promo_seen', '1');
    };
    var openPromo = function () { promoModal.classList.add('is-open'); };
    $('.sh-modal__close', promoModal).addEventListener('click', closePromo);
    $('.sh-modal__skip', promoModal).addEventListener('click', closePromo);
    promoModal.addEventListener('click', function (e) { if (e.target === promoModal) closePromo(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && promoModal.classList.contains('is-open')) closePromo();
    });
    $('form', promoModal).addEventListener('submit', function (e) {
      e.preventDefault();
      closePromo();
      toast('Köszönjük! A kuponkód úton van (demo).');
    });
    // csak exit-intent trigger, ülésenként egyszer — az időzített felugrás
    // olvasás közben zavart, kikerült; mobilon így nincs automatikus popup
    if (!sessionStorage.getItem('sh_promo_seen')) {
      var autoPromo = function () {
        if (sessionStorage.getItem('sh_promo_seen') || promoModal.classList.contains('is-open')) return;
        openPromo();
      };
      document.addEventListener('mouseout', function (e) {
        if (e.clientY <= 0 && !e.relatedTarget && !e.toElement) autoPromo();
      });
    }

    // lebegő gomb-stack (jobb alul): vissza-fel, kupon, egyedi ötlet, segítség
    var fab = document.createElement('div');
    fab.className = 'sh-fab';
    document.body.appendChild(fab);

    var top = document.createElement('button');
    top.className = 'sh-totop';
    top.type = 'button';
    top.setAttribute('aria-label', 'Vissza a tetejére');
    top.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 14 7-7 7 7"/></svg>';
    top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });
    fab.appendChild(top);
    var topTick = false;
    window.addEventListener('scroll', function () {
      if (topTick) return;
      topTick = true;
      requestAnimationFrame(function () {
        topTick = false;
        top.classList.toggle('is-on', window.scrollY > 600);
      });
    }, { passive: true });

    // (a tekergő –10% kuponjegy eltávolítva — a kedvezményt a promobár,
    // az exit-popup és a hírlevél-sáv már így is hirdeti; a lebegő réteg
    // maradjon funkcionális: fel, egyedi ötlet, segítség)

    // egyedi ötlet + segítség — hoverre kinyíló pill
    var fabIdea = document.createElement('a');
    fabIdea.className = 'sh-fab__btn sh-fab__btn--idea';
    fabIdea.href = 'termek.html?id=egyedi-otlet';
    fabIdea.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V18h6v-1.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2Z"/><path d="M9.5 21h5"/></svg><i>Egyedi ötletem van</i>';
    fab.appendChild(fabIdea);

    var fabHelp = document.createElement('a');
    fabHelp.className = 'sh-fab__btn sh-fab__btn--help';
    fabHelp.href = 'kapcsolat.html';
    fabHelp.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-8 8H5.5L3 21l1-3.4A8 8 0 1 1 21 12Z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01"/></svg><i>Segítség</i>';
    fab.appendChild(fabHelp);

    // cookie sáv (első látogatáskor magától, később a láblécből újranyitható)
    if (!localStorage.getItem('sh_cookie_ok')) showCookie(900);

    // (a „valaki az imént rendelte" értesítések eltávolítva — kitalált
    // nevekkel és „ellenőrzött rendelés" felirattal megtévesztőek voltak,
    // az ilyen ál-social-proof bizalmat rombol és jogilag is aggályos;
    // a valódi bizalomépítést a vélemények és a garancia-blokk végzi)

  }

  /* ── indítás ─────────────────────────────────────────────────── */
  renderChrome();
  renderExtras();
  initCardActions();
  syncCompareUI();
  var marker = document.querySelector('[data-layero-page]');
  var page = document.body.getAttribute('data-page') || (marker ? marker.getAttribute('data-layero-page') : '');
  if (page === 'home') renderHome();
  if (page === 'kategoria') renderKategoria();
  if (page === 'termek') renderTermek();
  if (page === 'kosar') renderKosar();
  if (page === 'kapcsolat') renderKapcsolat();
  if (page === 'kedvencek') renderKedvencek();
  if (page === 'penztar') renderPenztar();
  if (page === 'fiok') renderFiok();
  if (page === 'kviz') renderKviz();
  if (page === '404') {
    var c404 = $('#sh-404-cats');
    if (c404) c404.innerHTML = '<span>Népszerű kategóriák:</span>' +
      SHOP_CATS.slice(0, 5).map(function (c) { return '<a href="kategoria.html?cat=' + c.id + '">' + esc(c.nev) + '</a>'; }).join('');
  }
  fixStaticUrls(document);
  if (window.MutationObserver) {
    new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        [].forEach.call(mutation.addedNodes || [], function (node) {
          if (node && node.nodeType === 1) fixStaticUrls(node);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }
  observeReveals();
})();


/* ═══════════════════════════════════════════════════════════════════
   ELEVATE 4.0 — „LIVING LIGHT" interaktív réteg
   Külön IIFE: a fő szkript már felépítette a fejlécet/kártyákat, mire
   ez lefut. Minden effekt tiszteletben tartja a prefers-reduced-motion-t
   és a mutató típusát; a fő logikát nem érinti.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function raf(fn) { return window.requestAnimationFrame ? requestAnimationFrame(fn) : setTimeout(fn, 16); }

  /* ── 1. görgetés-jelző fénysáv ──────────────────────────────────── */
  (function () {
    if (reduce) return;
    var bar = document.createElement('div');
    bar.className = 'sh-progress';
    document.body.appendChild(bar);
    var ticking = false;
    function upd() {
      ticking = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? (doc.scrollTop || document.body.scrollTop) / max : 0;
      bar.style.width = (pct * 100).toFixed(2) + '%';
    }
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true; raf(upd);
    }, { passive: true });
    upd();
  })();

  /* (A kártyák kurzort követő fény-foltja + 3D-dőlése eltávolítva —
     a felhasználó szerint remegett/„ugrált" a border. A kártyák hoverje
     most a tiszta, stabil CSS-emelés + árnyék.) */

  /* ── 3. HERO: görgetés-jelző ────────────────────────────────────── */
  /* (A kurzort követő fény-aura eltávolítva — a user kérésére a hero
     nyugodt maradjon, semmi ne kövesse az egeret.) */
  (function () {
    var slider = $('#sh-slider');
    if (!slider) return;
    // görgetés-jelző (csak a főoldali hero alján)
    if (!reduce) {
      var cue = document.createElement('div');
      cue.className = 'sh-scrollcue';
      cue.setAttribute('aria-hidden', 'true');
      slider.appendChild(cue);
      var hidden = false;
      window.addEventListener('scroll', function () {
        var sc = window.scrollY > 60;
        if (sc !== hidden) { hidden = sc; cue.classList.toggle('is-hidden', sc); }
      }, { passive: true });
    }
  })();

  /* ── 4. repülés a kosárba + jelvény-pukkanás ────────────────────── */
  (function () {
    var PRODS = window.SHOP_PRODUCTS || [];
    function prod(id) { for (var i = 0; i < PRODS.length; i++) if (PRODS[i].id === id) return PRODS[i]; return null; }

    // jelvény-pukkanás minden kosárszám-növekedéskor (kártya, drawer, upsell)
    var badge = $('.sh-cart-badge');
    if (badge && !reduce) {
      var prev = parseInt(badge.textContent, 10) || 0;
      var mo = new MutationObserver(function () {
        var n = parseInt(badge.textContent, 10) || 0;
        if (n > prev) {
          badge.classList.remove('is-bump'); void badge.offsetWidth; badge.classList.add('is-bump');
          var cb = $('.sh-cart-btn');
          if (cb) { cb.classList.remove('is-pulse'); void cb.offsetWidth; cb.classList.add('is-pulse'); }
        }
        prev = n;
      });
      mo.observe(badge, { childList: true, characterData: true, subtree: true });
    }

    if (reduce) return;
    // capture fázis: a fő „kosárba" kezelő előtt indítjuk a repülést
    document.addEventListener('click', function (e) {
      if (!e.target.closest) return;
      var src = null, imgUrl = null;
      var btn = e.target.closest('[data-add]');
      if (btn) {
        // rács- / gyorsnézet-kártya
        var p = prod(btn.getAttribute('data-add'));
        if (!p || !p.kepek || !p.kepek[0]) return;
        imgUrl = p.kepek[0];
        var host = btn.closest('.sh-prod-card') || btn.closest('.sh-qv__box') || document;
        src = host.querySelector ? (host.querySelector('figure img') || host.querySelector('img')) : null;
      } else if (e.target.closest('#sh-add-btn')) {
        // termékoldal fő „Kosárba" gombja
        var main = document.querySelector('#sh-pmain');
        if (!main) return;
        src = main; imgUrl = main.currentSrc || main.src;
      } else {
        return;
      }
      flyToCart(src || btn, imgUrl);
    }, true);

    function flyToCart(sourceEl, imgUrl) {
      var cart = $('.sh-cart-btn');
      if (!cart || !sourceEl) return;
      var s = sourceEl.getBoundingClientRect(), c = cart.getBoundingClientRect();
      if (!s.width) return;
      var size = Math.min(120, Math.max(58, s.width * 0.5));
      var fly = document.createElement('img');
      fly.src = imgUrl; fly.className = 'sh-fly'; fly.alt = '';
      fly.style.width = size + 'px'; fly.style.height = size + 'px';
      fly.style.left = (s.left + s.width / 2 - size / 2) + 'px';
      fly.style.top = (s.top + s.height / 2 - size / 2) + 'px';
      document.body.appendChild(fly);
      var dx = (c.left + c.width / 2) - (s.left + s.width / 2);
      var dy = (c.top + c.height / 2) - (s.top + s.height / 2);
      raf(function () {
        raf(function () {
          fly.style.transform = 'translate(' + dx.toFixed(0) + 'px,' + dy.toFixed(0) + 'px) scale(0.12) rotate(9deg)';
          fly.style.opacity = '0.25';
        });
      });
      var done = false;
      function fin() { if (done) return; done = true; if (fly.parentNode) fly.remove(); }
      fly.addEventListener('transitionend', fin);
      setTimeout(fin, 1050);
    }
  })();

  /* ── 5. gördülő számok ([data-count]) ───────────────────────────── */
  (function () {
    var els = [].slice.call(document.querySelectorAll('[data-count]'));
    if (!els.length) return;
    function run(el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduce) { el.textContent = target + suffix; return; }
      var dur = 1400, start = null;
      function step(ts) {
        if (start === null) start = ts;
        var t = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased).toLocaleString('hu-HU') + suffix;
        if (t < 1) raf(step);
      }
      raf(step);
    }
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ── 6. okos fejléc: legörgetésnél elbújik, felfelé visszaúszik ─── */
  (function () {
    var header = $('.sh-header');
    if (!header) return;
    var lastY = window.scrollY || 0;
    var acc = 0, pend = false;
    function upd() {
      pend = false;
      var y = window.scrollY || 0;
      var d = y - lastY;
      lastY = y;
      if (y < 320) { header.classList.remove('is-away'); acc = 0; return; }
      acc = (d > 0) === (acc > 0) ? acc + d : d;
      if (acc > 110) header.classList.add('is-away');
      else if (acc < -12) header.classList.remove('is-away');
    }
    window.addEventListener('scroll', function () {
      if (pend) return; pend = true; raf(upd);
    }, { passive: true });
    // billentyűzetes navigációnál sosem takarjuk el a fókuszt
    header.addEventListener('focusin', function () { header.classList.remove('is-away'); });
  })();

  /* ── 7. termékgaléria: lightbox + rámutatós pan-zoom ────────────── */
  (function () {
    var wrap = $('.sh-pgallery__main');
    if (!wrap) return;
    var mainImg = $('#sh-pmain');

    // pan-zoom: a kurzor alatti részletre nagyít
    if (fine && !reduce && mainImg) {
      var zPend = false, zE = null;
      wrap.addEventListener('pointermove', function (e) {
        zE = e;
        if (zPend) return; zPend = true;
        raf(function () {
          zPend = false;
          var r = wrap.getBoundingClientRect();
          mainImg.style.transformOrigin =
            (((zE.clientX - r.left) / r.width) * 100).toFixed(1) + '% ' +
            (((zE.clientY - r.top) / r.height) * 100).toFixed(1) + '%';
          wrap.classList.add('is-zooming');
        });
      }, { passive: true });
      wrap.addEventListener('pointerleave', function () {
        wrap.classList.remove('is-zooming');
        mainImg.style.transformOrigin = '';
      });
    }

    // lightbox
    var lbx = null, idx = 0, zoomed = false;
    function srcs() {
      var t = [].slice.call(document.querySelectorAll('.sh-pgallery__thumbs button'));
      return t.length ? t.map(function (b) { return b.getAttribute('data-src'); }) : (mainImg ? [mainImg.src] : []);
    }
    function build() {
      if (lbx) return;
      lbx = document.createElement('div');
      lbx.className = 'sh-lbx';
      lbx.setAttribute('role', 'dialog');
      lbx.setAttribute('aria-modal', 'true');
      lbx.setAttribute('aria-label', 'Képnézegető');
      var h1 = document.querySelector('.sh-pinfo h1');
      lbx.innerHTML =
        '<div class="sh-lbx__stage"><img src="" alt="' + (h1 ? h1.textContent.replace(/"/g, '&quot;') : 'Termékfotó') + '"></div>' +
        '<button class="sh-lbx__close" type="button" aria-label="Bezárás">✕</button>' +
        '<button class="sh-lbx__nav sh-lbx__nav--prev" type="button" aria-label="Előző kép">‹</button>' +
        '<button class="sh-lbx__nav sh-lbx__nav--next" type="button" aria-label="Következő kép">›</button>' +
        '<div class="sh-lbx__bar">' +
          '<span class="sh-lbx__cap">' + (h1 ? h1.textContent : '') + '</span>' +
          '<div class="sh-lbx__dots"></div>' +
        '</div>';
      document.body.appendChild(lbx);
      var stage = $('.sh-lbx__stage', lbx);
      $('.sh-lbx__close', lbx).addEventListener('click', close);
      $('.sh-lbx__nav--prev', lbx).addEventListener('click', function () { go(idx - 1); });
      $('.sh-lbx__nav--next', lbx).addEventListener('click', function () { go(idx + 1); });
      lbx.addEventListener('click', function (e) { if (e.target === lbx) close(); });
      // kattintásra 2× zoom a kattintás pontjára
      stage.addEventListener('click', function (e) {
        if (e.target.tagName !== 'IMG') return;
        zoomed = !zoomed;
        if (zoomed) {
          var r = e.target.getBoundingClientRect();
          e.target.style.transformOrigin =
            (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '% ' +
            (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%';
        }
        stage.classList.toggle('is-zoomed', zoomed);
      });
      // swipe mobilon
      var sx = null;
      lbx.addEventListener('pointerdown', function (e) { sx = e.clientX; }, { passive: true });
      lbx.addEventListener('pointerup', function (e) {
        if (sx === null || zoomed) return;
        var dx = e.clientX - sx; sx = null;
        if (Math.abs(dx) > 44) go(idx + (dx < 0 ? 1 : -1));
      }, { passive: true });
    }
    function go(i) {
      var list = srcs();
      if (!list.length) return;
      idx = (i + list.length) % list.length;
      zoomed = false;
      var stage = $('.sh-lbx__stage', lbx);
      stage.classList.remove('is-zoomed');
      var img = $('img', stage);
      img.style.transformOrigin = '';
      img.src = list[idx];
      var dots = $('.sh-lbx__dots', lbx);
      dots.innerHTML = list.map(function (_, n) {
        return '<button type="button"' + (n === idx ? ' class="is-on"' : '') + ' aria-label="' + (n + 1) + '. kép"></button>';
      }).join('');
      [].forEach.call(dots.children, function (b, n) {
        b.addEventListener('click', function () { go(n); });
      });
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(idx - 1);
      else if (e.key === 'ArrowRight') go(idx + 1);
    }
    function open(startSrc) {
      build();
      var list = srcs();
      var at = Math.max(0, list.indexOf(startSrc));
      go(at);
      lbx.classList.add('is-open');
      lockScroll();
      document.addEventListener('keydown', onKey);
      $('.sh-lbx__close', lbx).focus();
    }
    function close() {
      if (!lbx || !lbx.classList.contains('is-open')) return;
      lbx.classList.remove('is-open');
      unlockScroll();
      document.removeEventListener('keydown', onKey);
    }
    wrap.addEventListener('click', function () {
      open(mainImg ? (mainImg.currentSrc || mainImg.src) : null);
    });
  })();

  /* ── 8. szív-pukkanás a kedvencekhez adáskor ────────────────────── */
  (function () {
    var COLORS = ['#ff5b77', '#ff9f2d', '#f0c27a', '#00c2e0'];
    document.addEventListener('click', function (e) {
      if (!e.target.closest) return;
      var b = e.target.closest('[data-wish]');
      if (!b) return;
      // a fő kezelő már átbillentette az állapotot, mire ez lefut
      setTimeout(function () {
        if (!b.classList.contains('is-on')) return;
        b.classList.remove('is-pop'); void b.offsetWidth; b.classList.add('is-pop');
        if (reduce) return;
        var r = b.getBoundingClientRect();
        var burst = document.createElement('div');
        burst.className = 'sh-wishburst';
        burst.setAttribute('aria-hidden', 'true');
        burst.style.left = (r.left + r.width / 2) + 'px';
        burst.style.top = (r.top + r.height / 2) + 'px';
        for (var i = 0; i < 8; i++) {
          var p = document.createElement('i');
          var a = (Math.PI * 2 / 8) * i + Math.random() * 0.5;
          var d = 22 + Math.random() * 16;
          p.style.setProperty('--dx', (Math.cos(a) * d).toFixed(0) + 'px');
          p.style.setProperty('--dy', (Math.sin(a) * d).toFixed(0) + 'px');
          p.style.setProperty('--c', COLORS[i % COLORS.length]);
          burst.appendChild(p);
        }
        document.body.appendChild(burst);
        setTimeout(function () { burst.remove(); }, 720);
      }, 0);
    });
  })();

  /* ── 9. blur-up képbetöltés: a fotók fényből élesednek elő ──────── */
  (function () {
    if (reduce) return;
    var SEL = '.sh-prod-card figure img:not(.sh-pc-img2), .sh-bento img, .sh-gallery-strip img, .sh-pgallery__thumbs img, .sh-spotlight__media img';
    [].forEach.call(document.querySelectorAll(SEL), function (img) {
      if (!img.complete) img.classList.add('sh-imgwait');
    });
    document.addEventListener('load', function (e) {
      var t = e.target;
      if (!t || t.tagName !== 'IMG' || !t.matches || !t.matches(SEL)) return;
      t.classList.remove('sh-imgwait');
      t.classList.add('sh-imgin');
    }, true);
  })();
})();
