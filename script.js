(() => {
'use strict';

/* ====== SETTINGS ====== */
const SB_URL = 'https://mxeqgqqaquqqjrxrmsgb.supabase.co/rest/v1/';
const SB_KEY = 'sb_publishable_38_AodqGZlFMYfurCZLZaA_0XAwys_z';
const DELIVERY_QAR = 10;   // delivery fee in Qatari Riyal (converted automatically per country)
const WA_NUMBER = '';      // WhatsApp number for orders, with country code and no +  (e.g. '97455123456')

/* ====== CURRENCIES: code -> [fallback rate per 1 QAR, decimals, Arabic label] ====== */
const CD = {
  QAR:[1,2,'ر.ق'], SAR:[1.03,2,'ر.س'], AED:[1.009,2,'د.إ'], KWD:[.0845,3,'د.ك'], BHD:[.1033,3,'د.ب'], OMR:[.1056,3,'ر.ع'], JOD:[.1948,3,'د.أ'],
  EGP:[13.5,2,'ج.م'], IQD:[360,0,'د.ع'], LBP:[24600,0,'ل.ل'], SYP:[3500,0,'ل.س'], YER:[68,0,'ر.ي'], LYD:[1.5,3,'د.ل'], TND:[.8,3,'د.ت'],
  DZD:[36,2,'د.ج'], MAD:[2.5,2,'د.م'], SDG:[165,2,'ج.س'], MRU:[11,2,'أ.م'], SOS:[157,0,'ش.ص'], DJF:[48.8,0,'ف.ج'], KMF:[120,0,'ف.ق'],
  USD:[.2747,2,'$'], GBP:[.21,2,'£'], EUR:[.25,2,'€'], TRY:[11.5,2,'₺'], CAD:[.38,2,'C$'], AUD:[.42,2,'A$'], INR:[23,2,'₹'], PKR:[77,0,'Rs'],
  JPY:[41,0,'¥'], CNY:[1.97,2,'CN¥'], KRW:[380,0,'₩'], RUB:[22,2,'₽'], BRL:[1.5,2,'R$'], MXN:[5,2,'MX$'], CHF:[.22,2,'CHF'], SEK:[2.6,2,'kr'],
  NOK:[2.8,2,'kr'], DKK:[1.87,2,'kr'], ZAR:[4.9,2,'R'], MYR:[1.16,2,'RM'], SGD:[.36,2,'S$'], IDR:[4400,0,'Rp'], PHP:[15.5,2,'₱'], THB:[9,2,'฿'],
  NZD:[.46,2,'NZ$'], NGN:[400,0,'₦']
};
/* code, English name, Arabic name, currency  (Palestine intentionally not included) */
const COUNTRIES = [
  ['QA','Qatar','قطر','QAR'],['SA','Saudi Arabia','السعودية','SAR'],['AE','UAE','الإمارات','AED'],['KW','Kuwait','الكويت','KWD'],
  ['BH','Bahrain','البحرين','BHD'],['OM','Oman','عُمان','OMR'],['JO','Jordan','الأردن','JOD'],['EG','Egypt','مصر','EGP'],
  ['IQ','Iraq','العراق','IQD'],['LB','Lebanon','لبنان','LBP'],['SY','Syria','سوريا','SYP'],['YE','Yemen','اليمن','YER'],
  ['LY','Libya','ليبيا','LYD'],['TN','Tunisia','تونس','TND'],['DZ','Algeria','الجزائر','DZD'],['MA','Morocco','المغرب','MAD'],
  ['SD','Sudan','السودان','SDG'],['MR','Mauritania','موريتانيا','MRU'],['SO','Somalia','الصومال','SOS'],['DJ','Djibouti','جيبوتي','DJF'],
  ['KM','Comoros','جزر القمر','KMF'],
  ['US','United States','أمريكا','USD'],['GB','United Kingdom','بريطانيا','GBP'],['DE','Germany','ألمانيا','EUR'],['FR','France','فرنسا','EUR'],
  ['IT','Italy','إيطاليا','EUR'],['ES','Spain','إسبانيا','EUR'],['NL','Netherlands','هولندا','EUR'],['BE','Belgium','بلجيكا','EUR'],
  ['AT','Austria','النمسا','EUR'],['IE','Ireland','أيرلندا','EUR'],['PT','Portugal','البرتغال','EUR'],['GR','Greece','اليونان','EUR'],
  ['FI','Finland','فنلندا','EUR'],['TR','Türkiye','تركيا','TRY'],['CA','Canada','كندا','CAD'],['AU','Australia','أستراليا','AUD'],
  ['NZ','New Zealand','نيوزيلندا','NZD'],['IN','India','الهند','INR'],['PK','Pakistan','باكستان','PKR'],['JP','Japan','اليابان','JPY'],
  ['CN','China','الصين','CNY'],['KR','South Korea','كوريا الجنوبية','KRW'],['RU','Russia','روسيا','RUB'],['BR','Brazil','البرازيل','BRL'],
  ['MX','Mexico','المكسيك','MXN'],['CH','Switzerland','سويسرا','CHF'],['SE','Sweden','السويد','SEK'],['NO','Norway','النرويج','NOK'],
  ['DK','Denmark','الدنمارك','DKK'],['ZA','South Africa','جنوب أفريقيا','ZAR'],['MY','Malaysia','ماليزيا','MYR'],['SG','Singapore','سنغافورة','SGD'],
  ['ID','Indonesia','إندونيسيا','IDR'],['PH','Philippines','الفلبين','PHP'],['TH','Thailand','تايلاند','THB'],['NG','Nigeria','نيجيريا','NGN'],
  ['XX','International','دولي','USD']
];

/* ====== HELPERS ====== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} };
const ss = (k, v) => { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) {} };

const T = {
  en: { nav_shop: 'Shop', eyebrow: 'Authentic brands · Street ready', sub: 'The biggest names in clothing and sneakers, all in one place.', cta: 'Start shopping', brands: 'Brands', all: 'All', empty: 'Nothing here yet.', oos: 'Out of stock', instock: 'In stock', loadErr: 'Could not load data',
    cart: 'Cart', cartEmpty: 'Your cart is empty', add: 'Add to cart', added: 'Added to cart', subtotal: 'Subtotal', delivery: 'Delivery fee', total: 'Total', checkout: 'Checkout', soon: 'Checkout will be available soon', deliveryNote: 'Delivery fee per order' },
  ar: { nav_shop: 'تسوّق', eyebrow: 'ماركات أصلية · ستايل الشارع', sub: 'أشهر الماركات بالملابس والأحذية بمكان واحد.', cta: 'ابدأ التسوق', brands: 'الماركات', all: 'الكل', empty: 'ما في شي هون لسا.', oos: 'نفذت الكمية', instock: 'متوفر', loadErr: 'تعذر تحميل البيانات',
    cart: 'السلة', cartEmpty: 'سلتك فاضية', add: 'أضف للسلة', added: 'انضاف للسلة', subtotal: 'المجموع', delivery: 'سعر التوصيل', total: 'الإجمالي', checkout: 'إتمام الطلب', soon: 'إتمام الطلب رح يتفعّل قريباً', deliveryNote: 'سعر التوصيل لكل طلب' }
};
let cartSaved = {}; try { cartSaved = JSON.parse(ls('dh_cart') || '{}') || {}; } catch (e) {}
const S = { brands: [], cats: [], prods: [], brand: null, cat: null, theme: ls('dh_theme') || 'light', lang: ls('dh_lang') || 'en', img: null,
  country: ls('dh_country') || ss('dh_det') || 'QA', rates: {}, cart: cartSaved, mid: null };
const t = k => T[S.lang][k] || k;

/* ====== COUNTRY / MONEY ====== */
const cinfo = () => COUNTRIES.find(c => c[0] === S.country) || COUNTRIES[0];
const flag = c => c === 'XX' ? '🌍' : String.fromCodePoint(...[...c].map(x => 127397 + x.charCodeAt(0)));
function money(qar) {
  const cur = cinfo()[3], d = CD[cur], rate = S.rates[cur] ?? d[0];
  const x = Number((qar * rate).toFixed(d[1]));
  const n = x.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(x) ? 0 : d[1], maximumFractionDigits: d[1] });
  return S.lang === 'ar' ? `${n} ${d[2]}` : `${cur} ${n}`;
}
function renderCountryUI() {
  const sel = $('#cSel');
  sel.innerHTML = COUNTRIES.map(c => `<option value="${c[0]}">${flag(c[0])} ${S.lang === 'ar' ? c[2] : c[1]} (${c[3]})</option>`).join('');
  sel.value = S.country;
  $('#cLabel').textContent = `${flag(S.country)} ${cinfo()[3]}`;
}
function setCountry(code, manual) {
  S.country = COUNTRIES.some(c => c[0] === code) ? code : 'XX';
  if (manual) ls('dh_country', S.country);
  renderCountryUI(); renderGrid(); renderCart();
  if (S.mid && $('#modal').classList.contains('open')) $('#mPrice').textContent = money(S.prods.find(x => x.id === S.mid)?.price || 0);
}
async function fj(url, ms = 4500) {
  const c = new AbortController(), id = setTimeout(() => c.abort(), ms);
  try { const r = await fetch(url, { signal: c.signal }); return r; } finally { clearTimeout(id); }
}
async function loadRates() {
  try {
    const c = JSON.parse(ls('dh_rates') || 'null');
    if (c && Date.now() - c.t < 43200000) { S.rates = c.r; return; }
    const j = await (await fj('https://open.er-api.com/v6/latest/QAR')).json();
    if (j.result === 'success') { S.rates = j.rates; ls('dh_rates', JSON.stringify({ t: Date.now(), r: j.rates })); }
  } catch (e) { /* fallback rates are used */ }
}
async function detectCountry() {
  try { const j = await (await fj('https://api.country.is/')).json(); if (j.country) return j.country; } catch (e) {}
  try { const r = await (await fj('https://ipapi.co/country/')).text(); if (/^[A-Z]{2}$/.test(r.trim())) return r.trim(); } catch (e) {}
  return null;
}
async function initCountry() {
  await loadRates();
  if (!ls('dh_country') && !ss('dh_det')) {
    const c = await detectCountry();
    if (c) { const code = COUNTRIES.some(x => x[0] === c) ? c : 'XX'; ss('dh_det', code); S.country = code; }
  }
  setCountry(S.country, false);
}

async function api(path, method = 'GET', body) {
  const r = await fetch(SB_URL + path, {
    method,
    headers: { apikey: SB_KEY, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!r.ok) throw new Error(await r.text());
  const txt = await r.text();
  return txt ? JSON.parse(txt) : null;
}

function toast(msg, type) {
  const d = document.createElement('div');
  d.className = 'toast ' + (type || '');
  d.textContent = msg;
  $('#toasts').appendChild(d);
  setTimeout(() => d.remove(), 3400);
}

/* ====== STARS ====== */
const cv = $('#stars'), cx = cv.getContext('2d');
let W, H, stars = [], shoots = [], raf = null;
const mouse = { x: -9999, y: -9999, nx: 0, ny: 0 };
const sprite = document.createElement('canvas');
sprite.width = sprite.height = 64;
(() => {
  const g = sprite.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(205,205,212,.45)'); gr.addColorStop(1, 'rgba(160,160,170,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
})();

function sizeCanvas() {
  const d = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cv.width = W * d; cv.height = H * d;
  cx.setTransform(d, 0, 0, d, 0, 0);
  const n = Math.min(320, Math.floor(W * H / 6500));
  stars = Array.from({ length: n }, () => ({
    x: Math.random() * W, y: Math.random() * H, z: Math.random() * .9 + .1,
    r: Math.random() * 1.4 + .4, p: Math.random() * 6.28, s: Math.random() * .003 + .001,
    vx: (Math.random() - .5) * .15, vy: (Math.random() - .5) * .15
  }));
}
function loop(t0) {
  cx.clearRect(0, 0, W, H);
  for (const s of stars) {
    s.x += s.vx * s.z; s.y += s.vy * s.z;
    if (s.x < -10) s.x = W + 10; if (s.x > W + 10) s.x = -10;
    if (s.y < -10) s.y = H + 10; if (s.y > H + 10) s.y = -10;
    let px = s.x + mouse.nx * s.z * 40, py = s.y + mouse.ny * s.z * 40;
    const dx = px - mouse.x, dy = py - mouse.y, dist = Math.hypot(dx, dy) || 1;
    let boost = 0;
    if (dist < 150) { boost = 1 - dist / 150; px += dx / dist * boost * 14; py += dy / dist * boost * 14; }
    const tw = .5 + .5 * Math.sin(t0 * s.s * 6 + s.p);
    const a = Math.min(1, .2 + tw * .6 * s.z + boost);
    const r = s.r * (1 + boost * 1.6) * (.65 + tw * .5);
    cx.globalAlpha = a * .6; cx.drawImage(sprite, px - r * 5, py - r * 5, r * 10, r * 10);
    cx.globalAlpha = a; cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(px, py, r, 0, 6.283); cx.fill();
  }
  if (Math.random() < .004 && shoots.length < 2) shoots.push({ x: Math.random() * W, y: Math.random() * H * .5, vx: 9 + Math.random() * 5, vy: 4 + Math.random() * 3, life: 1 });
  shoots = shoots.filter(o => o.life > 0);
  for (const o of shoots) {
    o.x += o.vx; o.y += o.vy; o.life -= .018;
    const g = cx.createLinearGradient(o.x, o.y, o.x - o.vx * 9, o.y - o.vy * 9);
    g.addColorStop(0, 'rgba(255,255,255,' + o.life + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
    cx.globalAlpha = 1; cx.strokeStyle = g; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(o.x, o.y); cx.lineTo(o.x - o.vx * 9, o.y - o.vy * 9); cx.stroke();
  }
  raf = requestAnimationFrame(loop);
}
function starsOn(on) {
  if (on && !raf) raf = requestAnimationFrame(loop);
  if (!on && raf) { cancelAnimationFrame(raf); raf = null; }
}
addEventListener('resize', sizeCanvas);

/* ====== THEME / LANG ====== */
function applyTheme(th) {
  S.theme = th;
  document.documentElement.dataset.theme = th;
  ls('dh_theme', th);
  $('#themeBtn .ico').textContent = th === 'dark' ? '☀' : '☾';
  starsOn(th === 'dark');
  adminVis();
}
function toggleTheme(e) {
  const th = S.theme === 'dark' ? 'light' : 'dark';
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const r = e.currentTarget.getBoundingClientRect(), st = document.documentElement.style;
    st.setProperty('--vx', (r.left + r.width / 2) + 'px'); st.setProperty('--vy', (r.top + r.height / 2) + 'px');
    document.startViewTransition(() => applyTheme(th));
  } else applyTheme(th);
}
function applyLang() {
  document.documentElement.lang = S.lang;
  document.documentElement.dir = S.lang === 'ar' ? 'rtl' : 'ltr';
  $$('[data-i18n]').forEach(n => n.textContent = t(n.dataset.i18n));
  $('#langBtn').textContent = S.lang === 'en' ? 'عربي' : 'EN';
  ls('dh_lang', S.lang);
  renderCountryUI(); renderBrandBar(); renderCatBar(); renderGrid(); renderCart(); adminVis();
  if ($('#modal').classList.contains('open')) openModal(S.mid);
}
// Dashboard button: ONLY in dark mode + English
function adminVis() { $('#adminEntry').classList.toggle('hidden', !(S.theme === 'dark' && S.lang === 'en')); }

/* ====== CART ====== */
const saveCart = () => ls('dh_cart', JSON.stringify(S.cart));
function cartItems() { return Object.entries(S.cart).map(([id, q]) => ({ p: S.prods.find(x => x.id === id), q })).filter(x => x.p && x.p.in_stock); }
function renderCart() {
  const items = cartItems(), count = items.reduce((a, x) => a + x.q, 0), sub = items.reduce((a, x) => a + x.p.price * x.q, 0);
  const cc = $('#cartCount'); cc.textContent = count; cc.classList.toggle('on', count > 0);
  $('#cartItems').innerHTML = items.length ? items.map(({ p, q }, i) => `<div class="ci" style="animation-delay:${i * 60}ms">
      <img src="${esc(p.image)}" alt="">
      <div class="inf"><h4>${esc(p.name)}</h4><div class="u">${money(p.price)}</div>
        <div class="qty"><button data-q="dec" data-id="${p.id}">−</button><b>${q}</b><button data-q="inc" data-id="${p.id}">+</button></div></div>
      <button class="rm" data-q="rm" data-id="${p.id}" aria-label="remove">✕</button></div>`).join('') : `<p class="cempty">${t('cartEmpty')}</p>`;
  $('#cartFoot').innerHTML = items.length ? `
    <div class="tr"><span>${t('subtotal')}</span><span>${money(sub)}</span></div>
    <div class="tr"><span>${t('delivery')}</span><span>${money(DELIVERY_QAR)}</span></div>
    <p class="dnote">${t('delivery')}: ${money(DELIVERY_QAR)} · ${t('deliveryNote')}</p>
    <div class="tr tot"><span>${t('total')}</span><span>${money(sub + DELIVERY_QAR)}</span></div>
    <button class="btn" data-q="checkout">${t('checkout')}</button>` : '';
}
function fly(from) {
  const img = from.closest?.('.card')?.querySelector('img') || $('#mImg');
  const cb = $('#cartBtn'); if (!img || !img.src || !cb) return;
  const a = img.getBoundingClientRect(), b = cb.getBoundingClientRect();
  const c = document.createElement('img'); c.src = img.src; c.className = 'fly';
  c.style.cssText = `left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px`;
  document.body.appendChild(c);
  c.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${b.left + b.width / 2 - a.left - a.width / 2}px,${b.top + b.height / 2 - a.top - a.height / 2}px) scale(.08)`, opacity: .3 }],
    { duration: 800, easing: 'cubic-bezier(.5,0,.8,.4)' }).onfinish = () => c.remove();
}
function addToCart(id, el) {
  const p = S.prods.find(x => x.id === id); if (!p || !p.in_stock) return;
  S.cart[id] = (S.cart[id] || 0) + 1; saveCart(); renderCart();
  const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  toast(`${t('added')} ✓ · ${t('delivery')}: ${money(DELIVERY_QAR)}`);
  if (el) fly(el);
}
function openCart() { renderCart(); $('#cart').classList.add('open'); $('#cartOv').classList.add('open'); }
function closeCart() { $('#cart').classList.remove('open'); $('#cartOv').classList.remove('open'); }
function checkout() {
  const items = cartItems(); if (!items.length) return;
  const sub = items.reduce((a, x) => a + x.p.price * x.q, 0);
  const text = ['Drip Hub order', '', ...items.map(({ p, q }) => `${q}x ${p.name} - ${money(p.price * q)}`), '',
    `${t('subtotal')}: ${money(sub)}`, `${t('delivery')}: ${money(DELIVERY_QAR)}`, `${t('total')}: ${money(sub + DELIVERY_QAR)}`, '', `Country: ${cinfo()[1]}`].join('\n');
  if (WA_NUMBER) window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text), '_blank');
  else toast(t('soon'));
}

/* ====== STOREFRONT RENDER ====== */
function renderMarquee() {
  const names = S.brands.length ? S.brands.map(b => b.name) : ['DRIP HUB', 'NEW DROPS', 'STREETWEAR', 'SNEAKERS'];
  const row = names.map(n => `<span>${esc(n)}</span><span>✦</span>`).join('');
  $('#marquee').innerHTML = row.repeat(Math.max(2, Math.ceil(12 / names.length)));
  $('#marquee').innerHTML += $('#marquee').innerHTML; // seamless loop
}
function renderBrandBar() {
  $('#brandBar').innerHTML = `<button class="chip ${!S.brand ? 'active' : ''}" data-id="">${t('all')}</button>` +
    S.brands.map(b => `<button class="chip ${S.brand === b.id ? 'active' : ''}" data-id="${b.id}">${esc(b.name)}</button>`).join('');
}
function renderCatBar() {
  const bar = $('#catBar');
  if (!S.brand) { bar.classList.remove('open'); return; }
  const cs = S.cats.filter(c => c.brand_id === S.brand);
  bar.innerHTML = `<button class="chip ${!S.cat ? 'active' : ''}" data-id="">${t('all')}</button>` +
    cs.map(c => `<button class="chip ${S.cat === c.id ? 'active' : ''}" data-id="${c.id}">${esc(c.name)}</button>`).join('');
  requestAnimationFrame(() => bar.classList.add('open'));
}
function renderGrid() {
  const list = S.prods.filter(p => (!S.brand || p.brand_id === S.brand) && (!S.cat || p.category_id === S.cat));
  $('#grid').innerHTML = list.map((p, i) => {
    const b = S.brands.find(x => x.id === p.brand_id), c = S.cats.find(x => x.id === p.category_id);
    return `<article class="card ${p.in_stock ? '' : 'oos'}" style="--i:${Math.min(i, 12)}" data-id="${p.id}">
      <div class="img"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">${p.in_stock ? `<button class="add" data-add="${p.id}" aria-label="${t('add')}">+</button>` : `<span class="badge">${t('oos')}</span>`}</div>
      <div class="meta"><small>${esc(b?.name)} · ${esc(c?.name)}</small><h3>${esc(p.name)}</h3><div class="price">${money(p.price)}</div></div>
    </article>`;
  }).join('');
  $('#empty').classList.toggle('hidden', list.length > 0);
}
function openModal(id) {
  const p = S.prods.find(x => x.id === id); if (!p) return;
  S.mid = id;
  const b = S.brands.find(x => x.id === p.brand_id), c = S.cats.find(x => x.id === p.category_id);
  $('#mImg').src = p.image; $('#mName').textContent = p.name; $('#mPrice').textContent = money(p.price);
  $('#mDesc').textContent = p.description || ''; $('#mMeta').textContent = `${b?.name || ''} · ${c?.name || ''}`;
  const st = $('#mStock'); st.textContent = p.in_stock ? t('instock') : t('oos'); st.className = 'status ' + (p.in_stock ? 'in' : 'out');
  $('#mAdd').disabled = !p.in_stock;
  $('#modal').classList.add('open');
}

/* ====== DASHBOARD RENDER ====== */
function renderDash() {
  $('#brandList').innerHTML = S.brands.length ? S.brands.map(b => {
    const cs = S.cats.filter(c => c.brand_id === b.id);
    return `<div class="bitem"><div class="bhead"><strong>${esc(b.name)}</strong><button class="btn sm danger" data-act="del-brand" data-id="${b.id}">Delete</button></div>
      <div class="mini">${cs.map(c => `<span class="tag">${esc(c.name)}<button data-act="del-cat" data-id="${c.id}" aria-label="remove">✕</button></span>`).join('') || '<em>No categories yet</em>'}</div>
      <form class="row catForm" data-brand="${b.id}"><input placeholder="Add category (Clothes, Shoes, Caps...)" required><button class="btn sm">Add</button></form></div>`;
  }).join('') : '<p class="muted">No brands yet. Add your first one above.</p>';
  fillSelects();
  $('#prodList').innerHTML = S.prods.length ? S.prods.map(p => {
    const b = S.brands.find(x => x.id === p.brand_id), c = S.cats.find(x => x.id === p.category_id);
    return `<div class="prow"><img src="${esc(p.image)}" alt="" loading="lazy">
      <div class="pinfo"><strong>${esc(p.name)}</strong><br><small>${esc(b?.name)} · ${esc(c?.name)} · ${esc(p.price)} QAR</small><br>
      <span class="status ${p.in_stock ? 'in' : 'out'}">${p.in_stock ? 'In stock' : 'Out of stock'}</span></div>
      <div class="acts"><button class="btn sm ghost" data-act="toggle" data-id="${p.id}">${p.in_stock ? 'Mark out of stock' : 'Back in stock'}</button>
      <button class="btn sm danger" data-act="del-prod" data-id="${p.id}">Delete</button></div></div>`;
  }).join('') : '<p class="muted">No products yet.</p>';
}
function fillSelects() {
  const pb = $('#pBrand'), cur = pb.value;
  pb.innerHTML = S.brands.length ? S.brands.map(b => `<option value="${b.id}">${esc(b.name)}</option>`).join('') : '<option value="">Add a brand first</option>';
  if (S.brands.some(b => b.id === cur)) pb.value = cur;
  fillCats();
}
function fillCats() {
  const pc = $('#pCat'), cur = pc.value, cs = S.cats.filter(c => c.brand_id === $('#pBrand').value);
  pc.innerHTML = cs.length ? cs.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('') : '<option value="">Add a category to this brand first</option>';
  if (cs.some(c => c.id === cur)) pc.value = cur;
}
function openDash() { renderDash(); $('#dash').classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeDash() { $('#dash').classList.remove('open'); document.body.style.overflow = ''; renderAll(); }

/* ====== IMAGE (file -> compressed data) ====== */
function fileToData(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const M = 900, s = Math.min(1, M / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s;
        const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', .82));
      };
      img.onerror = rej; img.src = fr.result;
    };
    fr.onerror = rej; fr.readAsDataURL(file);
  });
}
async function takeFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  S.img = await fileToData(file);
  const pv = $('#pPrev'); pv.src = S.img; pv.classList.remove('hidden'); $('#dropTxt').classList.add('hidden');
}

/* ====== DATA ====== */
function renderAll() { renderMarquee(); renderBrandBar(); renderCatBar(); renderGrid(); renderCart(); }
async function load() {
  $('#grid').innerHTML = '<div class="sk"></div>'.repeat(6);
  try {
    const [b, c, p] = await Promise.all([
      api('brands?select=*&order=created_at.asc'),
      api('categories?select=*&order=created_at.asc'),
      api('products?select=*&order=created_at.desc')
    ]);
    S.brands = b; S.cats = c; S.prods = p;
  } catch (e) { console.error(e); toast(t('loadErr'), 'err'); }
  renderAll();
}

/* ====== EVENTS ====== */
$('#themeBtn').addEventListener('click', toggleTheme);
$('#langBtn').addEventListener('click', () => { S.lang = S.lang === 'en' ? 'ar' : 'en'; applyLang(); });
$('#cSel').addEventListener('change', e => setCountry(e.target.value, true));
$('#adminEntry').addEventListener('click', openDash);
$('#dashClose').addEventListener('click', closeDash);
$('#mClose').addEventListener('click', () => $('#modal').classList.remove('open'));
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') $('#modal').classList.remove('open'); });
$('#mAdd').addEventListener('click', e => addToCart(S.mid, e.currentTarget));
$('#cartBtn').addEventListener('click', openCart);
$('#cartClose').addEventListener('click', closeCart);
$('#cartOv').addEventListener('click', closeCart);
$('#cart').addEventListener('click', e => {
  const b = e.target.closest('[data-q]'); if (!b) return;
  const id = b.dataset.id, a = b.dataset.q;
  if (a === 'checkout') return checkout();
  if (a === 'inc') S.cart[id] = (S.cart[id] || 0) + 1;
  if (a === 'dec') { S.cart[id] = (S.cart[id] || 1) - 1; if (S.cart[id] <= 0) delete S.cart[id]; }
  if (a === 'rm') delete S.cart[id];
  saveCart(); renderCart();
});
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  $('#modal').classList.remove('open'); closeCart();
  if ($('#dash').classList.contains('open')) closeDash();
});

$('#brandBar').addEventListener('click', e => { const c = e.target.closest('.chip'); if (!c) return; S.brand = c.dataset.id || null; S.cat = null; renderBrandBar(); renderCatBar(); renderGrid(); });
$('#catBar').addEventListener('click', e => { const c = e.target.closest('.chip'); if (!c) return; S.cat = c.dataset.id || null; renderCatBar(); renderGrid(); });
$('#grid').addEventListener('click', e => {
  const a = e.target.closest('[data-add]'); if (a) return addToCart(a.dataset.add, a);
  const c = e.target.closest('.card'); if (c) openModal(c.dataset.id);
});

// dashboard actions
$('#brandForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name = $('#brandName').value.trim(); if (!name) return;
  try { const [row] = await api('brands', 'POST', { name }); S.brands.push(row); $('#brandName').value = ''; renderDash(); toast('Brand added ✓'); }
  catch (er) { console.error(er); toast(String(er.message).slice(0, 140), 'err'); }
});
$('#dash').addEventListener('submit', async e => {
  const f = e.target.closest('.catForm'); if (!f) return;
  e.preventDefault();
  const inp = $('input', f), name = inp.value.trim(); if (!name) return;
  try { const [row] = await api('categories', 'POST', { brand_id: f.dataset.brand, name }); S.cats.push(row); renderDash(); toast('Category added ✓'); }
  catch (er) { console.error(er); toast(String(er.message).slice(0, 140), 'err'); }
});
$('#pBrand').addEventListener('change', fillCats);
$('#drop').addEventListener('click', e => { if (e.target.id !== 'pImg') $('#pImg').click(); });
$('#pImg').addEventListener('change', e => takeFile(e.target.files[0]));
$('#drop').addEventListener('dragover', e => { e.preventDefault(); $('#drop').classList.add('over'); });
$('#drop').addEventListener('dragleave', () => $('#drop').classList.remove('over'));
$('#drop').addEventListener('drop', e => { e.preventDefault(); $('#drop').classList.remove('over'); takeFile(e.dataTransfer.files[0]); });

$('#prodForm').addEventListener('submit', async e => {
  e.preventDefault();
  if (!S.img) return toast('Please choose a product image', 'err');
  if (!$('#pBrand').value || !$('#pCat').value) return toast('Choose a brand and a category', 'err');
  const body = { image: S.img, name: $('#pName').value.trim(), price: Number($('#pPrice').value), description: $('#pDesc').value.trim(), brand_id: $('#pBrand').value, category_id: $('#pCat').value, in_stock: true };
  try {
    const [row] = await api('products', 'POST', body); S.prods.unshift(row);
    e.target.reset(); S.img = null; $('#pPrev').classList.add('hidden'); $('#dropTxt').classList.remove('hidden');
    renderDash(); toast('Product added ✓');
  } catch (er) { console.error(er); toast(String(er.message).slice(0, 140), 'err'); }
});

$('#dash').addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const id = b.dataset.id, act = b.dataset.act;
  try {
    if (act === 'toggle') {
      const p = S.prods.find(x => x.id === id);
      await api('products?id=eq.' + id, 'PATCH', { in_stock: !p.in_stock }); p.in_stock = !p.in_stock;
    } else if (act === 'del-prod') {
      if (!confirm('Delete this product?')) return;
      await api('products?id=eq.' + id, 'DELETE'); S.prods = S.prods.filter(x => x.id !== id); delete S.cart[id]; saveCart();
    } else if (act === 'del-cat') {
      if (!confirm('Delete this category and its products?')) return;
      await api('categories?id=eq.' + id, 'DELETE'); S.cats = S.cats.filter(x => x.id !== id); S.prods = S.prods.filter(x => x.category_id !== id);
      if (S.cat === id) S.cat = null;
    } else if (act === 'del-brand') {
      if (!confirm('Delete this brand with all its categories and products?')) return;
      await api('brands?id=eq.' + id, 'DELETE');
      S.brands = S.brands.filter(x => x.id !== id); S.cats = S.cats.filter(x => x.brand_id !== id); S.prods = S.prods.filter(x => x.brand_id !== id);
      if (S.brand === id) { S.brand = null; S.cat = null; }
    }
    renderDash(); toast('Done ✓');
  } catch (er) { console.error(er); toast('Something went wrong', 'err'); }
});

/* ====== MOTION: ripple, magnetic, tilt, glow ====== */
document.addEventListener('click', e => {
  const el = e.target.closest('.btn,.pill,.chip'); if (!el) return;
  const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height), s = document.createElement('span');
  s.className = 'ripple'; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  el.appendChild(s); setTimeout(() => s.remove(), 700);
});

const glow = $('#glow'); let lastM = null;
document.addEventListener('pointermove', e => {
  mouse.x = e.clientX; mouse.y = e.clientY;
  mouse.nx = -(e.clientX / innerWidth - .5); mouse.ny = -(e.clientY / innerHeight - .5);
  glow.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;

  const m = e.target.closest?.('.magnetic');
  if (lastM && lastM !== m) lastM.style.transform = '';
  if (m) { const r = m.getBoundingClientRect(); m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .28}px,${(e.clientY - r.top - r.height / 2) * .28}px)`; }
  lastM = m;

  const c = e.target.closest?.('.card');
  if (c) { const r = c.getBoundingClientRect(); c.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 14 + 'deg'); c.style.setProperty('--rx', -((e.clientY - r.top) / r.height - .5) * 14 + 'deg'); }

  if (e.target.closest?.('#hero')) $('#heroTitle').style.transform = `rotateY(${(e.clientX / innerWidth - .5) * 14}deg) rotateX(${-(e.clientY / innerHeight - .5) * 10}deg)`;
});
$('#grid').addEventListener('mouseleave', e => { if (e.target.classList?.contains('card')) { e.target.style.setProperty('--rx', '0deg'); e.target.style.setProperty('--ry', '0deg'); } }, true);
$('#hero').addEventListener('pointerleave', () => $('#heroTitle').style.transform = '');
document.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });

const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) en.target.classList.add('in'); }), { threshold: .2 });
$$('.reveal').forEach(el => io.observe(el));

/* ====== INIT ====== */
$$('.w').forEach((w, wi) => { w.innerHTML = [...w.textContent].map((ch, i) => `<span class="l" style="--d:${wi * 350 + i * 90}ms">${ch}</span>`).join(''); });
sizeCanvas();
applyTheme(S.theme);
applyLang();
load();
initCountry();
})();