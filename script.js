(() => {
'use strict';

/* ====== SETTINGS ====== */
const SB_URL = 'https://mxeqgqqaquqqjrxrmsgb.supabase.co/rest/v1/';
const SB_KEY = 'sb_publishable_38_AodqGZlFMYfurCZLZaA_0XAwys_z';
const DELIVERY_QAR = 10;   // delivery fee in Qatari Riyal (converted automatically per country)
const WA_NUMBER = '97466989622';   // orders are sent to this WhatsApp number (country code, no +)
const LEAFLET = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet';   // free map library (OpenStreetMap, no API key)
const REFRACT = false;      // set to false if the dock glass looks odd on your phone
const PAGE = 16;           // products loaded per request

/* ====== LIGHT PROTECTION (deterrents only) ====== */
document.addEventListener('contextmenu', e => { if (!e.target.closest('input,textarea')) e.preventDefault(); });
document.addEventListener('dragstart', e => e.preventDefault());
document.addEventListener('keydown', e => {
  const k = (e.key || '').toLowerCase();
  const bad = e.key === 'F12' || (e.ctrlKey && ['u', 's'].includes(k)) || (e.ctrlKey && e.shiftKey && ['i', 'j', 'c', 'k'].includes(k)) || (e.metaKey && e.altKey && ['i', 'j', 'u', 'c'].includes(k));
  if (bad) { e.preventDefault(); e.stopPropagation(); }
}, true);

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
const sleep = ms => new Promise(r => setTimeout(r, ms));
const digits = s => String(s || '').replace(/\D/g, '');
const priceHtml = p => {
  const o = Number(p.old_price || 0), n = Number(p.price || 0);
  if (o > n && n >= 0) return `<span class="now">${money(n)}</span> <s class="was">${money(o)}</s> <em class="off">-${Math.round((1 - n / o) * 100)}%</em>`;
  return `<span class="now">${money(n)}</span>`;
};
const hasSizes = p => Array.isArray(p.sizes) && p.sizes.length > 0;

const T = {
  en: { nav_shop: 'Shop', eyebrow: 'Authentic brands · Street ready', sub: 'The biggest names in clothing and sneakers, all in one place.', cta: 'Start shopping', brands: 'Brands', all: 'All', empty: 'Nothing here yet.', oos: 'Out of stock', instock: 'In stock',
    cart: 'Cart', cartEmpty: 'Your cart is empty', add: 'Add to cart', added: 'Added to cart', subtotal: 'Subtotal', delivery: 'Delivery fee', total: 'Total', checkout: 'Checkout', deliveryNote: 'Delivery fee per order',
    home: 'Home', search: 'Search', searchPh: 'Search products, brands…', retry: 'Retry',
    size: 'Size', pickSize: 'Select a size',
    track: 'Track your order', trTitle: 'Track your order', phTrNo: 'Order number (e.g. DH-AB12CD)', phTrPhone: 'Phone number used in the order', trackBtn: 'Track',
    coTitle: 'Delivery details', phName: 'Full name', phPhone: 'Phone number (with country code)', phCity: 'City', phAddr: 'Full address', phNote: 'Notes (optional)', place: 'Order via WhatsApp', placing: 'Sending…',
    payNote: 'You will confirm the order and payment with us on WhatsApp.',
    orderOk: 'Almost done!', orderNo: 'Your order number', orderSave: 'Save this number. You can track your order with it.', copy: 'Copy', copied: 'Copied ✓', trackNow: 'Track this order', whatsapp: 'Open WhatsApp',
    reqFields: 'Please fill in all the required fields.', eOrder: 'Could not place the order. Please try again.', notFound: 'No order found. Check the order number and phone.', eTrack: 'Could not check the order right now.',
    st1: 'Received', st2: 'Delivery in progress', st3: 'It was received', preparing: 'We received your order and are preparing it.', orderedOn: 'Ordered on', totalPaid: 'Order total',
    eNet: 'Cannot reach the server. The Supabase project is probably paused, or your connection is down.', eTime: 'The server took too long to answer. Try again in a moment.',
    eAuth: 'The server refused the request. Check the API key and the access policies (RLS).', eTable: 'The database tables were not found. Run the SQL setup in Supabase first.', eGen: 'Could not load data.',
    mapTitle: 'Pin your location', locate: 'Use my location', locating: 'Locating…', mapHint: 'Tap the map or drag the pin to your exact spot.', mapFail: 'The map could not load. Use the “Use my location” button instead.',
    outQatar: 'This location is outside Qatar.', geoNo: 'Your browser cannot detect the location.', geoDenied: 'Location permission was denied. Tap the map to choose your spot.', needPin: 'Please pin your location on the map.',
    waNote: 'Press “Send” in WhatsApp to finish your order.', notSaved: 'Your order will be handled on WhatsApp. Online tracking is not available for it.',
    wOrder: 'Order', wDelivery: 'Delivery', wTotal: 'Total', wName: 'Name', wPhone: 'Phone', wPlace: 'Country / City', wAddr: 'Address', wNote: 'Notes', wLoc: 'Location' },
  ar: { nav_shop: 'تسوّق', eyebrow: 'ماركات أصلية · ستايل الشارع', sub: 'أشهر الماركات بالملابس والأحذية بمكان واحد.', cta: 'ابدأ التسوق', brands: 'الماركات', all: 'الكل', empty: 'ما في شي هون لسا.', oos: 'نفذت الكمية', instock: 'متوفر',
    cart: 'السلة', cartEmpty: 'سلتك فاضية', add: 'أضف للسلة', added: 'انضاف للسلة', subtotal: 'المجموع', delivery: 'سعر التوصيل', total: 'الإجمالي', checkout: 'إتمام الطلب', deliveryNote: 'سعر التوصيل لكل طلب',
    home: 'الرئيسية', search: 'بحث', searchPh: 'ابحث عن منتج أو براند…', retry: 'إعادة المحاولة',
    size: 'المقاس', pickSize: 'اختر المقاس',
    track: 'تتبّع طلبك', trTitle: 'تتبّع طلبك', phTrNo: 'رقم الطلب (مثال DH-AB12CD)', phTrPhone: 'رقم الهاتف المستخدم بالطلب', trackBtn: 'تتبّع',
    coTitle: 'بيانات التوصيل', phName: 'الاسم الكامل', phPhone: 'رقم الهاتف (مع رمز الدولة)', phCity: 'المدينة', phAddr: 'العنوان بالتفصيل', phNote: 'ملاحظات (اختياري)', place: 'اطلب عبر واتساب', placing: 'جاري الإرسال…',
    payNote: 'بتأكد الطلب والدفع معنا عبر واتساب.',
    orderOk: 'خلصنا تقريباً!', orderNo: 'رقم طلبك', orderSave: 'احتفظ بهالرقم، تقدر تتبّع طلبك فيه.', copy: 'نسخ', copied: 'تم النسخ ✓', trackNow: 'تتبّع هذا الطلب', whatsapp: 'افتح واتساب',
    reqFields: 'عبّي كل الخانات المطلوبة.', eOrder: 'ما قدرنا نرسل الطلب. جرّب مرة ثانية.', notFound: 'ما لقينا طلب. تأكد من رقم الطلب والهاتف.', eTrack: 'ما قدرنا نفحص الطلب هلأ.',
    st1: 'تم استلام الطلب', st2: 'جاري التوصيل', st3: 'تم الاستلام', preparing: 'استلمنا طلبك وعم نجهّزه.', orderedOn: 'تاريخ الطلب', totalPaid: 'إجمالي الطلب',
    eNet: 'ما قدرنا نوصل للسيرفر. غالباً مشروع Supabase موقوف (Paused) أو الإنترنت ضعيف.', eTime: 'السيرفر تأخر بالرد. جرّب مرة ثانية بعد شوي.',
    eAuth: 'السيرفر رفض الطلب. تأكد من الـ API key ومن صلاحيات الوصول (RLS).', eTable: 'جداول الداتابيز مش موجودة. شغّل كود الـ SQL بـ Supabase أولاً.', eGen: 'تعذر تحميل البيانات.',
    mapTitle: 'حدّد موقعك', locate: 'استخدم موقعي', locating: 'جاري التحديد…', mapHint: 'اضغط على الخريطة أو حرّك الدبوس لمكانك بالضبط.', mapFail: 'ما قدرنا نحمّل الخريطة. استخدم زر «استخدم موقعي».',
    outQatar: 'هذا الموقع خارج قطر.', geoNo: 'المتصفح ما بيقدر يحدد الموقع.', geoDenied: 'ما انسمح بالوصول للموقع. اضغط على الخريطة واختر مكانك.', needPin: 'حدّد موقعك على الخريطة من فضلك.',
    waNote: 'اضغط «إرسال» بالواتساب لتكمّل طلبك.', notSaved: 'طلبك رح يتابع عبر واتساب. التتبع من الموقع مش متاح له.',
    wOrder: 'طلب', wDelivery: 'التوصيل', wTotal: 'الإجمالي', wName: 'الاسم', wPhone: 'الهاتف', wPlace: 'الدولة / المدينة', wAddr: 'العنوان', wNote: 'ملاحظات', wLoc: 'الموقع' }
};
let cartSaved = {}; try { cartSaved = JSON.parse(ls('dh_cart2') || '{}') || {}; } catch (e) {}
const S = { brands: [], cats: [], prods: [], brand: null, cat: null, q: '', searching: false, loading: true, seen: new Set(), lastErr: null,
  theme: ls('dh_theme') || 'light', lang: ls('dh_lang') || 'en',
  country: ls('dh_country') || ss('dh_det') || 'QA', rates: {}, cart: cartSaved, mid: null, size: null, pin: null };
const t = k => T[S.lang][k] || T.en[k] || k;

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
  renderCountryUI(); renderGrid(true); renderCart();
  if (S.mid && $('#modal').classList.contains('open')) { const pp = S.prods.find(x => x.id === S.mid); if (pp) $('#mPrice').innerHTML = priceHtml(pp); }
}
async function fj(url, ms = 4500) {
  const c = new AbortController(), id = setTimeout(() => c.abort(), ms);
  try { return await fetch(url, { signal: c.signal }); } finally { clearTimeout(id); }
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

/* ====== API (with real error reasons + retry) ====== */
async function rest(path, o = {}) {
  const c = new AbortController(), id = setTimeout(() => c.abort(), o.ms || 25000);
  const headers = { apikey: SB_KEY, Accept: 'application/json' };
  if (o.body) headers['Content-Type'] = 'application/json';
  if (o.prefer) headers.Prefer = o.prefer;
  let r;
  try { r = await fetch(SB_URL + path, { method: o.method || 'GET', headers, body: o.body ? JSON.stringify(o.body) : undefined, signal: c.signal }); }
  catch (e) { const er = new Error(e.name === 'AbortError' ? 'timeout' : 'network'); er.kind = er.message; throw er; }
  finally { clearTimeout(id); }
  const txt = await r.text(); let j = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) {}
  if (!r.ok) { const er = new Error((j && (j.message || j.hint)) || txt.slice(0, 160) || ('HTTP ' + r.status)); er.kind = 'http'; er.status = r.status; er.code = j && j.code; throw er; }
  return j;
}
const api = path => rest(path).then(j => j || []);
async function retry(fn, n = 3) {
  for (let i = 1; ; i++) {
    try { return await fn(); }
    catch (e) {
      const transient = e.kind === 'network' || e.kind === 'timeout' || e.status >= 500;
      if (!transient || i >= n) throw e;
      await sleep(1200 * i);
    }
  }
}
function explain(e) {
  if (e.kind === 'network') return t('eNet');
  if (e.kind === 'timeout') return t('eTime');
  if (e.status === 401 || e.status === 403 || e.code === '42501') return t('eAuth');
  if (e.status === 404 || e.code === 'PGRST205' || e.code === '42P01') return t('eTable');
  return t('eGen');
}
function showErr(e) {
  console.error(e);
  $('#grid').innerHTML = ''; $('#empty').classList.add('hidden');
  $('#leMsg').textContent = explain(e);
  $('#leDet').textContent = [e.kind, e.status, e.code, e.kind === 'http' ? e.message : ''].filter(Boolean).join(' · ');
  $('#loadErr').classList.remove('hidden');
}

function toast(msg, type) {
  const d = document.createElement('div');
  d.className = 'toast glass ' + (type || '');
  d.textContent = msg;
  $('#toasts').appendChild(d);
  setTimeout(() => d.remove(), 3400);
}

/* ====== STARS ====== */
const cv = $('#stars'), cx = cv.getContext('2d');
let W, H, stars = [], shoots = [], pulses = [], raf = null, starScale = 1, fpsT = 0, fpsN = 0, lowHits = 0;
const mouse = { x: -9999, y: -9999, nx: 0, ny: 0 };
const sprite = document.createElement('canvas'); sprite.width = sprite.height = 64;
(() => { const g = sprite.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.12, 'rgba(255,255,255,.95)'); gr.addColorStop(.25, 'rgba(205,205,212,.45)'); gr.addColorStop(1, 'rgba(160,160,170,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); })();
function starPulse(x, y) { if (S.theme === 'dark' && pulses.length < 4) pulses.push({ x, y, r: 0 }); }
function sizeCanvas() {
  const d = 1;
  W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0);
  const n = Math.min(190, Math.floor(W * H / 9000)) * starScale;
  stars = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, z: Math.random() * .9 + .1, r: Math.random() * 1.4 + .4, p: Math.random() * 6.28, s: Math.random() * .003 + .001, vx: (Math.random() - .5) * .15, vy: (Math.random() - .5) * .15 }));
}
function loop(t0) {
  if (fpsT) { fpsN++; if (t0 - fpsT > 1500) { const fps = fpsN * 1000 / (t0 - fpsT); fpsT = t0; fpsN = 0; if (fps < 40 && lowHits < 3 && starScale > .3) { lowHits++; starScale *= .6; sizeCanvas(); } } } else fpsT = t0;
  cx.clearRect(0, 0, W, H);
  for (const s of stars) {
    s.x += s.vx * s.z; s.y += s.vy * s.z;
    if (s.x < -10) s.x = W + 10; if (s.x > W + 10) s.x = -10;
    if (s.y < -10) s.y = H + 10; if (s.y > H + 10) s.y = -10;
    let px = s.x + mouse.nx * s.z * 40, py = s.y + mouse.ny * s.z * 40;
    const dx = px - mouse.x, dy = py - mouse.y, dist = Math.sqrt(dx * dx + dy * dy) || 1;
    let boost = 0;
    if (dist < 150) { boost = 1 - dist / 150; px += dx / dist * boost * 14; py += dy / dist * boost * 14; }
    if (pulses.length) for (const p of pulses) {
      const ddx = px - p.x, ddy = py - p.y, dd = Math.hypot(ddx, ddy) || 1, w = Math.abs(dd - p.r);
      if (w < 70) { const k = 1 - w / 70; px += ddx / dd * k * 9; py += ddy / dd * k * 9; boost = Math.max(boost, k * .9); }
    }
    const tw = .5 + .5 * Math.sin(t0 * s.s * 6 + s.p);
    const a = Math.min(1, .2 + tw * .6 * s.z + boost), r = s.r * (1 + boost * 1.6) * (.65 + tw * .5);
    cx.globalAlpha = a; cx.drawImage(sprite, px - r * 4, py - r * 4, r * 8, r * 8);
  }
  for (const p of pulses) p.r += 11;
  pulses = pulses.filter(p => p.r < Math.max(W, H) * .7);
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
document.addEventListener('visibilitychange', () => { if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = null; } } else if (S.theme === 'dark' && !raf) { fpsT = 0; raf = requestAnimationFrame(loop); } });
function starsOn(on) { if (on && !raf) { fpsT = 0; raf = requestAnimationFrame(loop); } if (!on && raf) { cancelAnimationFrame(raf); raf = null; } }
addEventListener('resize', sizeCanvas);

/* ====== THEME / LANG ====== */
function applyTheme(th) {
  S.theme = th; document.documentElement.dataset.theme = th; ls('dh_theme', th);
  $('#themeBtn .ico').textContent = th === 'dark' ? '☀' : '☾';
  starsOn(th === 'dark');
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
  $$('[data-ph]').forEach(n => n.placeholder = t(n.dataset.ph));
  $('#q').placeholder = t('searchPh');
  $('#langBtn').textContent = S.lang === 'en' ? 'عربي' : 'EN';
  ls('dh_lang', S.lang);
  renderCountryUI(); renderBrandBar(); renderCatBar(); renderGrid(true); renderCart();
  if (!$('#loadErr').classList.contains('hidden') && S.lastErr) $('#leMsg').textContent = explain(S.lastErr);
  if ($('#modal').classList.contains('open')) openModal(S.mid, true);
  if ($('#co').classList.contains('open')) { coSummary(); renderPin(); if (!$('#coGo').disabled) $('#coGo').textContent = t('place'); }
}

/* ====== DOCK ====== */
const dock = $('#dock'), ORDER = ['home', 'search', 'cart'];
let pressing = false;
const cartOpen = () => $('#cart').classList.contains('open');
function lensTo(name) { dock.style.setProperty('--i', Math.max(0, ORDER.indexOf(name))); }
function setActive(name) { $$('.dk').forEach(b => b.classList.toggle('on', b.dataset.a === name)); lensTo(name); }
const baseActive = () => cartOpen() ? 'cart' : 'home';
function openSearch() { closeCart(true); S.searching = true; dock.classList.add('searching'); setTimeout(() => $('#q').focus(), 280); }
function closeSearch() {
  S.searching = false; dock.classList.remove('searching'); $('#q').value = ''; $('#q').blur();
  if (S.q) { S.q = ''; renderGrid(); } setActive(baseActive());
}
function goHome() {
  closeCart(true); closeModal(); if (S.searching) closeSearch();
  S.brand = null; S.cat = null; S.q = ''; renderBrandBar(); renderCatBar(); renderGrid();
  scrollTo({ top: 0, behavior: 'smooth' }); setActive('home');
}
function act(name) {
  const r = $('.dk[data-a="' + name + '"]')?.getBoundingClientRect();
  if (r) starPulse(r.left + r.width / 2, r.top + r.height / 2);
  if (name === 'home') goHome();
  else if (name === 'search') { setActive('search'); openSearch(); }
  else if (name === 'cart') { cartOpen() ? closeCart() : openCart(); }
}
const under = e => document.elementFromPoint(e.clientX, e.clientY)?.closest('.dk');
dock.addEventListener('pointerdown', e => { if (S.searching) return; const b = e.target.closest('.dk'); if (!b) return; pressing = true; dock.classList.add('press'); lensTo(b.dataset.a); });
addEventListener('pointermove', e => { if (!pressing) return; const b = under(e); if (b) lensTo(b.dataset.a); });
addEventListener('pointerup', e => { if (!pressing) return; pressing = false; dock.classList.remove('press'); const b = under(e); if (b) act(b.dataset.a); else lensTo(S.searching ? 'search' : baseActive()); });
addEventListener('pointercancel', () => { if (!pressing) return; pressing = false; dock.classList.remove('press'); lensTo(baseActive()); });
dock.addEventListener('click', e => { if (e.detail === 0) { const b = e.target.closest('.dk'); if (b) act(b.dataset.a); } });
$('#qClose').addEventListener('click', closeSearch);
$('#q').addEventListener('input', e => {
  S.q = e.target.value; renderGrid();
  const shop = $('#shop');
  if (S.q && scrollY < shop.offsetTop - 140) scrollTo({ top: shop.offsetTop - 120, behavior: 'smooth' });
});

/* liquid glass refraction map for the dock (Chrome / Android) */
function buildMap(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data, r = h / 2, bevel = Math.min(h * .45, 28);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const cx0 = Math.min(Math.max(x + .5, r), w - r), dx = x + .5 - cx0, dy = y + .5 - h / 2, dist = Math.hypot(dx, dy) || .0001, inside = r - dist;
    let ox = 0, oy = 0;
    if (inside < bevel) { const k = Math.pow(1 - Math.max(inside, 0) / bevel, 2); ox = dx / dist * k; oy = dy / dist * k; }
    const i = (y * w + x) * 4; d[i] = 128 + ox * 127; d[i + 1] = 0; d[i + 2] = 128 + oy * 127; d[i + 3] = 255;
  }
  g.putImageData(im, 0, 0); return c.toDataURL('image/png');
}
function updateRefraction() {
  const w = dock.offsetWidth, h = dock.offsetHeight; if (!w || !h) return;
  const img = $('#lgImg'); img.setAttribute('width', w); img.setAttribute('height', h); img.setAttribute('href', buildMap(w, h));
}
function initRefraction() {
  try {
    if (!REFRACT || !window.CSS || !CSS.supports('backdrop-filter', 'url(#lgf)')) return;
    dock.classList.add('refract'); updateRefraction();
    let tm; new ResizeObserver(() => { clearTimeout(tm); tm = setTimeout(updateRefraction, 140); }).observe(dock);
  } catch (e) { dock.classList.remove('refract'); }
}

/* ====== CART (items are keyed by product + size) ====== */
const saveCart = () => ls('dh_cart2', JSON.stringify(S.cart));
const keyOf = (id, size) => id + '|' + (size || '');
function cartItems() {
  return Object.entries(S.cart).map(([k, q]) => {
    const i = k.indexOf('|'), id = k.slice(0, i), size = k.slice(i + 1);
    return { k, id, size, q, p: S.prods.find(x => x.id === id) };
  }).filter(x => x.p && x.p.in_stock);
}
const cartSub = items => items.reduce((a, x) => a + x.p.price * x.q, 0);
function renderCart() {
  const items = cartItems(), count = items.reduce((a, x) => a + x.q, 0), sub = cartSub(items);
  const cc = $('#cartCount'); cc.textContent = count; cc.classList.toggle('on', count > 0);
  $('#cartItems').innerHTML = items.length ? items.map(({ k, p, size, q }, i) => `<div class="ci" style="animation-delay:${i * 60}ms">
      <img src="${esc(picOf(p))}" alt="">
      <div class="inf"><h4>${esc(p.name)}</h4><div class="u">${size ? esc(t('size')) + ': <b>' + esc(size) + '</b> · ' : ''}${money(p.price)}</div>
        <div class="qty"><button data-q="dec" data-k="${esc(k)}">−</button><b>${q}</b><button data-q="inc" data-k="${esc(k)}">+</button></div></div>
      <button class="rm" data-q="rm" data-k="${esc(k)}" aria-label="remove">✕</button></div>`).join('') : `<p class="cempty">${t('cartEmpty')}</p>`;
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
    { duration: 800, easing: 'cubic-bezier(.5,0,.8,.4)' }).onfinish = () => { c.remove(); starPulse(b.left + b.width / 2, b.top + b.height / 2); };
}
function addToCart(id, size, el) {
  const p = S.prods.find(x => x.id === id); if (!p || !p.in_stock) return;
  if (hasSizes(p) && !size) return toast(t('pickSize'), 'err');
  const k = keyOf(id, size);
  S.cart[k] = (S.cart[k] || 0) + 1; saveCart(); renderCart();
  const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  toast(`${t('added')} ✓${size ? ' · ' + t('size') + ' ' + size : ''}`);
  if (el) fly(el);
}
function openCart() {
  if (S.searching) { S.searching = false; dock.classList.remove('searching'); $('#q').value = ''; $('#q').blur(); if (S.q) { S.q = ''; renderGrid(); } }
  renderCart(); $('#cart').classList.add('open'); $('#cartOv').classList.add('open'); setActive('cart');
}
function closeCart(silent) {
  const was = cartOpen(); $('#cart').classList.remove('open'); $('#cartOv').classList.remove('open');
  if (was && !silent) setActive('home');
}

/* ====== CHECKOUT (saves the order in the database) ====== */
const NO_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function genNo() {
  const a = new Uint32Array(6); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => a[i] = Math.random() * 4e9);
  return 'DH-' + [...a].map(n => NO_CHARS[n % NO_CHARS.length]).join('');
}
function coSummary() {
  const items = cartItems(), sub = cartSub(items), total = sub + DELIVERY_QAR;
  $('#coSum').innerHTML = items.map(({ p, size, q }) => `<div class="tr"><span>${q}× ${esc(p.name)}${size ? ' · ' + esc(size) : ''}</span><span>${money(p.price * q)}</span></div>`).join('') +
    `<div class="tr"><span>${t('delivery')}</span><span>${money(DELIVERY_QAR)}</span></div>
     <div class="tr tot"><span>${t('total')}</span><span>${money(total)}</span></div>`;
}
function setCoErr(m) { $('#coErr').textContent = m || ''; }
/* --- map (Leaflet + OpenStreetMap: free, no API key) --- */
const QATAR = { c: [25.3, 51.2], b: [[24.3, 50.5], [26.4, 52]] };
const inQatar = (la, ln) => la >= 24.4 && la <= 26.3 && ln >= 50.6 && ln <= 51.8;
let leafletP = null, map = null, marker = null;
function loadLeaflet() {
  if (window.L) return Promise.resolve();
  if (leafletP) return leafletP;
  leafletP = new Promise((res, rej) => {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = LEAFLET + '.css'; document.head.appendChild(l);
    const s = document.createElement('script'); s.src = LEAFLET + '.js'; s.onload = res; s.onerror = () => { leafletP = null; rej(new Error('leaflet')); }; document.head.appendChild(s);
  });
  return leafletP;
}
function renderPin() { $('#coPin').textContent = S.pin ? '📍 ' + S.pin.lat + ', ' + S.pin.lng : t('mapHint'); }
function putMarker(la, ln, fly) {
  if (!map) return;
  if (!marker) {
    marker = L.marker([la, ln], { draggable: true, icon: L.divIcon({ className: 'pinwrap', html: '<div class="pin"></div>', iconSize: [30, 30], iconAnchor: [15, 36] }) }).addTo(map);
    marker.on('dragend', () => { const p = marker.getLatLng(); setPin(p.lat, p.lng); });
  } else marker.setLatLng([la, ln]);
  if (fly) map.setView([la, ln], 16);
}
function setPin(la, ln, fly) {
  if (!inQatar(la, ln)) { toast(t('outQatar'), 'err'); if (S.pin) putMarker(S.pin.lat, S.pin.lng); return; }
  S.pin = { lat: +la.toFixed(6), lng: +ln.toFixed(6) };
  putMarker(S.pin.lat, S.pin.lng, fly); renderPin(); setCoErr('');
}
async function initMap() {
  try { await loadLeaflet(); } catch (e) { $('#coPin').textContent = t('mapFail'); return; }
  if (!map) {
    map = L.map($('#coMap'), { center: QATAR.c, zoom: 8, minZoom: 7, maxBounds: QATAR.b, maxBoundsViscosity: .8, attributionControl: true });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
    map.on('click', e => setPin(e.latlng.lat, e.latlng.lng));
  }
  setTimeout(() => map.invalidateSize(), 500);
  if (S.pin) { putMarker(S.pin.lat, S.pin.lng); map.setView([S.pin.lat, S.pin.lng], 15); }
}
function syncMap() {
  const qa = $('#coCountry').value === 'QA';
  $('#coMapWrap').classList.toggle('hidden', !qa);
  if (qa) { renderPin(); initMap(); }
}
$('#coCountry').addEventListener('change', syncMap);
$('#coLocate').addEventListener('click', () => {
  const b = $('#coLocate');
  if (!navigator.geolocation) return toast(t('geoNo'), 'err');
  b.disabled = true; b.textContent = t('locating');
  const done = () => { b.disabled = false; b.textContent = t('locate'); };
  navigator.geolocation.getCurrentPosition(p => { done(); setPin(p.coords.latitude, p.coords.longitude, true); },
    () => { done(); toast(t('geoDenied'), 'err'); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
});

function openCheckout() {
  const items = cartItems(); if (!items.length) return;
  closeCart(true);
  const sel = $('#coCountry'), list = COUNTRIES.filter(c => c[0] !== 'XX');
  sel.innerHTML = list.map(c => `<option value="${c[0]}">${flag(c[0])} ${S.lang === 'ar' ? c[2] : c[1]}</option>`).join('');
  sel.value = list.some(c => c[0] === S.country) ? S.country : 'QA';
  setCoErr(''); coSummary(); syncMap();
  $('#coForm').classList.remove('hidden'); $('#coDone').classList.add('hidden');
  $('#coGo').disabled = false; $('#coGo').textContent = t('place');
  $('#co').classList.add('open');
}
function closeCo() { $('#co').classList.remove('open'); setActive(baseActive()); }
function waText(no, items, total, f) {
  const L = [`Drip Hub · ${t('wOrder')} ${no}`, ''];
  items.forEach(({ p, size, q }) => L.push(`${q}× ${p.name}${size ? ' (' + size + ')' : ''} — ${money(p.price * q)}`));
  L.push(`${t('wDelivery')} — ${money(DELIVERY_QAR)}`, '', `${t('wTotal')}: ${money(total)}${cinfo()[3] !== 'QAR' ? ' (QAR ' + total + ')' : ''}`, '',
    `${t('wName')}: ${f.name}`, `${t('wPhone')}: ${f.phone}`, `${t('wPlace')}: ${f.country} · ${f.city}`, `${t('wAddr')}: ${f.addr}`);
  if (f.note) L.push(`${t('wNote')}: ${f.note}`);
  if (f.loc) L.push('', `${t('wLoc')}: ${f.loc}`);
  return L.join('\n');
}
$('#coForm').addEventListener('submit', async e => {
  e.preventDefault();
  const items = cartItems(); if (!items.length) return closeCo();
  const name = $('#coName').value.trim(), phone = $('#coPhone').value.trim(), city = $('#coCity').value.trim(), addr = $('#coAddr').value.trim(), note = $('#coNote').value.trim();
  if (!name || digits(phone).length < 7 || !city || !addr) return setCoErr(t('reqFields'));
  const cc = $('#coCountry').value, cn = COUNTRIES.find(c => c[0] === cc);
  if (cc === 'QA' && !S.pin) return setCoErr(t('needPin'));
  const sub = cartSub(items), total = sub + DELIVERY_QAR, no = genNo(), pin = cc === 'QA' ? S.pin : null;
  const loc = pin ? 'https://www.google.com/maps?q=' + pin.lat + ',' + pin.lng : '';
  const wa = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(waText(no, items, total, { name, phone, country: cn ? cn[1] : cc, city, addr, note, loc }));
  const win = window.open('about:blank', '_blank');   // opened right now (inside the tap) so the browser does not block it
  const btn = $('#coGo'); btn.disabled = true; btn.textContent = t('placing'); setCoErr('');
  const body = { order_no: no, customer_name: name, phone, country: cn ? cn[1] : cc, city, address: addr, notes: note || null,
    lat: pin ? pin.lat : null, lng: pin ? pin.lng : null,
    items: items.map(({ p, size, q }) => ({ id: p.id, name: p.name, size: size || null, qty: q, price_qar: p.price })),
    subtotal_qar: sub, delivery_qar: DELIVERY_QAR, total_qar: total, display_total: money(total) };
  let saved = true;
  try { await rest('orders', { method: 'POST', body, prefer: 'return=minimal' }); }
  catch (er) { console.error(er); saved = false; }   // the WhatsApp message still carries the whole order
  if (saved) ls('dh_last', JSON.stringify({ no, phone }));
  S.cart = {}; saveCart(); renderCart(); S.pin = null; if (marker) { marker.remove(); marker = null; }
  $('#coForm').classList.add('hidden'); $('#coForm').reset();
  const d = $('#coDone');
  d.innerHTML = `<div class="okic">✓</div><h3>${t('orderOk')}</h3><p class="dnote"><b>${t('waNote')}</b></p>
    ${saved ? `<p class="muted">${t('orderNo')}</p><div class="ordno">${no}</div><p class="dnote">${t('orderSave')}</p>` : `<p class="dnote">${t('notSaved')}</p>`}
    <div class="acts2"><a class="btn sm waact" href="${wa}" target="_blank" rel="noopener">${t('whatsapp')}</a>${saved ? `<button type="button" class="btn sm ghostb" data-co="copy" data-no="${no}">${t('copy')}</button>
    <button type="button" class="btn sm ghostb" data-co="track">${t('trackNow')}</button>` : ''}</div>`;
  d.classList.remove('hidden');
  if (win) win.location.href = wa; else location.href = wa;
});
$('#coDone').addEventListener('click', e => {
  const b = e.target.closest('[data-co]'); if (!b) return;
  if (b.dataset.co === 'copy') {
    const done = () => { b.textContent = t('copied'); };
    if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.no).then(done, done); else done();
  } else { closeCo(); openTrack(); }
});
$('#coClose').addEventListener('click', closeCo);
$('#co').addEventListener('click', e => { if (e.target.id === 'co') closeCo(); });

/* ====== ORDER TRACKING ====== */
function openTrack() {
  let last = {}; try { last = JSON.parse(ls('dh_last') || '{}') || {}; } catch (er) {}
  if (!$('#trNo').value) $('#trNo').value = last.no || '';
  if (!$('#trPhone').value) $('#trPhone').value = last.phone || '';
  $('#trRes').innerHTML = ''; $('#trk').classList.add('open');
}
function closeTrack() { $('#trk').classList.remove('open'); }
$('#trackBtn').addEventListener('click', openTrack);
$('#trClose').addEventListener('click', closeTrack);
$('#trk').addEventListener('click', e => { if (e.target.id === 'trk') closeTrack(); });
$('#trForm').addEventListener('submit', async e => {
  e.preventDefault();
  const no = $('#trNo').value.trim(), ph = $('#trPhone').value.trim(), out = $('#trRes');
  if (!no || !ph) return;
  out.innerHTML = '<div class="sk" style="height:120px"></div>';
  try {
    const rows = await rest('rpc/track_order', { method: 'POST', body: { p_no: no, p_phone: ph } });
    const r = Array.isArray(rows) ? rows[0] : rows;
    if (!r) { out.innerHTML = `<p class="pwerr">${t('notFound')}</p>`; return; }
    const stage = r.status === 'done' ? 3 : (r.status === 'shipping' ? 2 : 1);
    const steps = [t('st1'), t('st2'), t('st3')].map((s, i) => `<div class="stp ${i < stage ? 'on' : ''}"><i></i><span>${s}</span></div>`).join('');
    const items = (Array.isArray(r.items) ? r.items : []).map(it => `<div class="tr"><span>${esc(it.qty)}× ${esc(it.name)}${it.size ? ' · ' + esc(it.size) : ''}</span></div>`).join('');
    const when = r.created_at ? new Date(r.created_at).toLocaleDateString(S.lang === 'ar' ? 'ar' : 'en-GB') : '';
    out.innerHTML = `<div class="steps">${steps}</div>
      <p class="dnote">${esc(r.order_no)} · ${t('orderedOn')} ${esc(when)}</p>
      ${stage === 1 ? `<p class="trmsg">${t('preparing')}</p>` : ''}
      <div class="trit">${items}</div>`;
  } catch (er) {
    console.error(er); out.innerHTML = `<p class="pwerr">${t('eTrack')}</p>`;
  }
});

/* ====== STOREFRONT RENDER ====== */
function renderMarquee() {
  const names = S.brands.length ? S.brands.map(b => b.name) : ['DRIP HUB', 'NEW DROPS', 'STREETWEAR', 'SNEAKERS'];
  const row = names.map(n => `<span>${esc(n)}</span><span>✦</span>`).join('');
  $('#marquee').innerHTML = row.repeat(Math.max(2, Math.ceil(12 / names.length)));
  $('#marquee').innerHTML += $('#marquee').innerHTML;
}
function renderBrandBar() {
  $('#brandBar').innerHTML = `<button class="chip glass lite ${!S.brand ? 'active' : ''}" data-id="">${t('all')}</button>` +
    S.brands.map(b => `<button class="chip glass lite ${S.brand === b.id ? 'active' : ''}" data-id="${b.id}">${esc(b.name)}</button>`).join('');
}
function renderCatBar() {
  const bar = $('#catBar');
  if (!S.brand) { bar.classList.remove('open'); return; }
  const cs = S.cats.filter(c => c.brand_id === S.brand);
  bar.innerHTML = `<button class="chip glass lite ${!S.cat ? 'active' : ''}" data-id="">${t('all')}</button>` +
    cs.map(c => `<button class="chip glass lite ${S.cat === c.id ? 'active' : ''}" data-id="${c.id}">${esc(c.name)}</button>`).join('');
  requestAnimationFrame(() => bar.classList.add('open'));
}
// keep=true: cards already shown once are not re-animated (used while products stream in)
const COLS = 'id,name,price,old_price,description,brand_id,category_id,in_stock,sizes,thumb,thumb_url,image_url,created_at';
const picOf = p => p.thumb_url || p.thumb || '';   // new products: a link to a file. Old ones: base64 until they are moved
const cardCache = new Map(), FULL = new Map();
function cardEl(p, i, still) {
  let el = cardCache.get(p.id);
  if (!el) {
    el = document.createElement('article'); el.dataset.id = p.id;
    el.innerHTML = '<div class="img"><img alt="" loading="lazy" decoding="async"></div><div class="meta"></div>';
    cardCache.set(p.id, el);
  }
  const box = el.firstChild, img = box.firstChild, src = picOf(p);
  if (el._src !== src) { el._src = src; if (src) img.src = src; }
  img.alt = p.name;
  const b = S.brands.find(x => x.id === p.brand_id), c = S.cats.find(x => x.id === p.category_id);
  el.className = 'card glass lite ' + (p.in_stock ? '' : 'oos');
  el.style.setProperty('--i', Math.min(i, 12));
  el.style.animation = still ? 'none' : '';
  const old = box.querySelector('.add,.badge'); if (old) old.remove();
  box.insertAdjacentHTML('beforeend', p.in_stock ? `<button class="add" data-add="${p.id}" aria-label="${t('add')}">+</button>` : `<span class="badge">${t('oos')}</span>`);
  el.lastChild.innerHTML = `<small>${esc(b?.name)} · ${esc(c?.name)}</small><h3>${esc(p.name)}</h3><div class="price">${priceHtml(p)}</div>`;
  return el;
}
// keep=true: cards already shown once are not re-animated (used while products stream in). Existing cards are reused, not rebuilt.
function renderGrid(keep) {
  const q = S.q.trim().toLowerCase();
  const list = S.prods.filter(p => {
    if (S.brand && p.brand_id !== S.brand) return false;
    if (S.cat && p.category_id !== S.cat) return false;
    if (!q) return true;
    const b = S.brands.find(x => x.id === p.brand_id)?.name || '', c = S.cats.find(x => x.id === p.category_id)?.name || '';
    return (p.name + ' ' + b + ' ' + c + ' ' + (p.description || '')).toLowerCase().includes(q);
  });
  $('#grid').replaceChildren(...list.map((p, i) => cardEl(p, i, keep && S.seen.has(p.id))));
  if (keep) list.forEach(p => S.seen.add(p.id));
  $('#empty').classList.toggle('hidden', list.length > 0 || S.loading);
}
// products saved before thumbnails existed: fetch their image one by one in the background
async function fillThumbs() {
  for (const p of S.prods) {
    if (picOf(p) || p._tried) continue; p._tried = true;
    try {
      const r = await api(`products?id=eq.${p.id}&select=image`), im = r[0] && r[0].image;
      if (im) { p.thumb = im; const el = cardCache.get(p.id); if (el) { el._src = im; el.firstChild.firstChild.src = im; } }
    } catch (e) {}
  }
}
function syncModal() {
  const p = S.prods.find(x => x.id === S.mid); if (!p) return;
  const has = hasSizes(p);
  $('#mSizeWrap').classList.toggle('hidden', !has);
  if (has) $('#mSizes').innerHTML = p.sizes.map(s => `<button type="button" class="chip glass lite sz ${S.size === s ? 'active' : ''}" data-s="${esc(s)}">${esc(s)}</button>`).join('');
  const b = $('#mAdd'); b.disabled = !p.in_stock;
  b.textContent = !p.in_stock ? t('oos') : (has && !S.size ? t('pickSize') : t('add'));
}
function openModal(id, keep) {
  const p = S.prods.find(x => x.id === id); if (!p) return;
  if (!keep || S.mid !== id) S.size = null;
  S.mid = id;
  const b = S.brands.find(x => x.id === p.brand_id), c = S.cats.find(x => x.id === p.category_id);
  $('#mImg').src = p.image_url || FULL.get(p.id) || picOf(p);
  if (!p.image_url && !FULL.has(p.id)) rest(`products?id=eq.${id}&select=image`).then(r => { const im = r && r[0] && r[0].image; if (im) { FULL.set(id, im); if (S.mid === id) $('#mImg').src = im; } }).catch(() => {});
  $('#mName').textContent = p.name; $('#mPrice').innerHTML = priceHtml(p);
  $('#mDesc').textContent = p.description || ''; $('#mMeta').textContent = `${b?.name || ''} · ${c?.name || ''}`;
  const st = $('#mStock'); st.textContent = p.in_stock ? t('instock') : t('oos'); st.className = 'status ' + (p.in_stock ? 'in' : 'out');
  syncModal();
  $('#modal').classList.add('open');
}
function closeModal() { $('#modal').classList.remove('open'); }

/* ====== DATA (progressive loading) ====== */
async function load() {
  S.loading = true; S.prods = []; S.seen = new Set(); S.lastErr = null; cardCache.clear();
  $('#loadErr').classList.add('hidden'); $('#empty').classList.add('hidden');
  $('#grid').innerHTML = '<div class="sk"></div>'.repeat(6);
  try {
    const [b, c] = await Promise.all([
      retry(() => api('brands?select=*&order=created_at.asc')),
      retry(() => api('categories?select=*&order=created_at.asc'))
    ]);
    S.brands = b; S.cats = c; renderBrandBar(); renderMarquee();
    for (let off = 0; ; off += PAGE) {
      const rows = await retry(() => api(`products?select=${COLS}&order=created_at.desc&limit=${PAGE}&offset=${off}`));
      S.prods.push(...rows);
      if (off === 0) S.loading = false;
      if (off === 0 || rows.length) { renderGrid(true); renderCart(); }
      if (rows.length < PAGE) break;
    }
    S.loading = false; renderGrid(true); fillThumbs();
  } catch (e) {
    S.loading = false; S.lastErr = e;
    if (S.prods.length) { console.error(e); toast(explain(e), 'err'); renderGrid(true); }
    else showErr(e);
  }
}

/* ====== EVENTS ====== */
$('#themeBtn').addEventListener('click', toggleTheme);
$('#langBtn').addEventListener('click', () => { S.lang = S.lang === 'en' ? 'ar' : 'en'; applyLang(); });
$('#cSel').addEventListener('change', e => setCountry(e.target.value, true));
$('#leRetry').addEventListener('click', load);
$('#mClose').addEventListener('click', closeModal);
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
$('#mSizes').addEventListener('click', e => { const b = e.target.closest('.sz'); if (!b) return; S.size = b.dataset.s; syncModal(); });
$('#mAdd').addEventListener('click', e => addToCart(S.mid, S.size || '', e.currentTarget));
$('#cartClose').addEventListener('click', () => closeCart());
$('#cartOv').addEventListener('click', () => closeCart());
$('#cart').addEventListener('click', e => {
  const b = e.target.closest('[data-q]'); if (!b) return;
  const k = b.dataset.k, a = b.dataset.q;
  if (a === 'checkout') return openCheckout();
  if (a === 'inc') S.cart[k] = (S.cart[k] || 0) + 1;
  if (a === 'dec') { S.cart[k] = (S.cart[k] || 1) - 1; if (S.cart[k] <= 0) delete S.cart[k]; }
  if (a === 'rm') delete S.cart[k];
  saveCart(); renderCart();
});
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if ($('#co').classList.contains('open')) return closeCo();
  if ($('#trk').classList.contains('open')) return closeTrack();
  closeModal(); closeCart(); if (S.searching) closeSearch();
});

$('#brandBar').addEventListener('click', e => { const c = e.target.closest('.chip'); if (!c) return; S.brand = c.dataset.id || null; S.cat = null; renderBrandBar(); renderCatBar(); renderGrid(); });
$('#catBar').addEventListener('click', e => { const c = e.target.closest('.chip'); if (!c) return; S.cat = c.dataset.id || null; renderCatBar(); renderGrid(); });
$('#grid').addEventListener('click', e => {
  const a = e.target.closest('[data-add]');
  if (a) {
    const p = S.prods.find(x => x.id === a.dataset.add);
    if (p && hasSizes(p)) return openModal(p.id);   // sizes: pick one in the product window first
    return addToCart(a.dataset.add, '', a);
  }
  const c = e.target.closest('.card'); if (c) openModal(c.dataset.id);
});

/* ====== MOTION: ripple, magnetic, tilt, glass light ====== */
document.addEventListener('click', e => {
  const el = e.target.closest('.btn,.pill,.chip'); if (!el) return;
  starPulse(e.clientX, e.clientY);
  const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height), s = document.createElement('span');
  s.className = 'ripple'; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  el.appendChild(s); setTimeout(() => s.remove(), 700);
});
function glassTrack(e) {
  const g = e.target.closest?.('.glass'); if (!g) return;
  const r = g.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  g.style.setProperty('--mx', x + 'px'); g.style.setProperty('--my', y + 'px');
  g.style.setProperty('--ang', (Math.atan2(y - r.height / 2, x - r.width / 2) * 180 / Math.PI + 90) + 'deg');
}
document.addEventListener('pointerdown', glassTrack);
const glow = $('#glow'); let lastM = null;
let pmE = null, pmRaf = 0;
function pmFrame() {
  pmRaf = 0; const e = pmE; if (!e) return;
  mouse.x = e.clientX; mouse.y = e.clientY;
  mouse.nx = -(e.clientX / innerWidth - .5); mouse.ny = -(e.clientY / innerHeight - .5);
  glow.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  glassTrack(e);
  const m = e.target.closest?.('.magnetic');
  if (lastM && lastM !== m) lastM.style.transform = '';
  if (m) { const r = m.getBoundingClientRect(); m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .28}px,${(e.clientY - r.top - r.height / 2) * .28}px)`; }
  lastM = m;
  const c = e.target.closest?.('.card');
  if (c) { const r = c.getBoundingClientRect(); c.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 14 + 'deg'); c.style.setProperty('--rx', -((e.clientY - r.top) / r.height - .5) * 14 + 'deg'); }
  if (e.target.closest?.('#hero')) $('#heroTitle').style.transform = `rotateY(${(e.clientX / innerWidth - .5) * 14}deg) rotateX(${-(e.clientY / innerHeight - .5) * 10}deg)`;
}
document.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch') return;      // no hover effects while scrolling on touch screens
  pmE = e; if (!pmRaf) pmRaf = requestAnimationFrame(pmFrame);
}, { passive: true });
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
setActive('home');
initRefraction();
renderMarquee();
load();
initCountry();
})();
