/* ============================================
   EDUVAULT — Main Script (Vercel KV Backend)
   ============================================ */

/* --- Smooth Scroll Animation (optimized) --- */
const section = document.querySelector('.cinema-scroll');
const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const track = document.querySelector('.sights-track');
const sightsControls = document.querySelector('.sights-controls');
const prevBtn = document.querySelector('.sight-prev');
const nextBtn = document.querySelector('.sight-next');

let targetMouseX = 0, targetMouseY = 0;
let mouseX = 0, mouseY = 0;
let targetScroll = 0, smoothScroll = 0;
let initialized = false, rafPending = false;
let sightCards = [];
let originalSightCount = 0;
let activeSight = 0;

function clamp(v, min = 0, max = 1) { return Math.min(max, Math.max(min, v)); }
function smoothstep(e0, e1, v) { const x = clamp((v - e0) / (e1 - e0)); return x * x * (3 - 2 * x); }
function lerp(a, b, t) { return a + (b - a) * t; }
function segmentInOut(s, a, b, c, d) {
  const enter = smoothstep(a, b, s);
  const exit = smoothstep(c, d, s);
  return { enter, exit, active: enter * (1 - exit) };
}
function getScrollDistance() {
  return clamp(-section.getBoundingClientRect().top, 0, section.offsetHeight - window.innerHeight);
}
function set(prop, val) { root.style.setProperty(prop, val); }

function update() {
  rafPending = false;
  targetScroll = getScrollDistance();
  if (!initialized || reduceMotion.matches) { smoothScroll = targetScroll; initialized = true; }
  else { smoothScroll = lerp(smoothScroll, targetScroll, 0.12); }
  if (Math.abs(smoothScroll - targetScroll) < 0.5) smoothScroll = targetScroll;

  mouseX = lerp(mouseX, targetMouseX, 0.1);
  mouseY = lerp(mouseY, targetMouseY, 0.1);

  const frame2 = segmentInOut(smoothScroll, 560, 900, 1300, 1620);
  const frame3 = segmentInOut(smoothScroll, 1760, 2140, 2540, 2700);
  const progress = clamp(smoothScroll / 2700);
  const introExit = smoothstep(0, 800, smoothScroll); // Title visible first, then fades
  const sightsEnterRaw = smoothstep(2760, 3560, smoothScroll);
  const sightsEnter = Math.pow(sightsEnterRaw, 1.55);
  const sightsControlsEnter = smoothstep(3360, 3660, smoothScroll);
  const blurActive = clamp(frame2.active + frame3.active);
  const frame2Opacity = frame2.active * (1 - frame3.enter);
  const splitDrift = Math.pow(frame2.enter, 1.5);
  const panel2Opacity = frame2.active * (1 - frame2.exit);
  const panel3Opacity = frame3.active * (1 - frame3.exit);
  const backScale = 0.76 + progress * 0.2 + frame2.enter * 0.18 + frame3.enter * 0.16;
  const sharedHeroY = progress * -74;
  const sharedHeroScale = progress * 0.23;
  const sightsScreenTop = Math.min(220, Math.max(112, window.innerHeight * 0.19)) - 50;
  const sightsParentTop = window.innerHeight - (window.innerHeight - sightsScreenTop) / backScale;
  const mx = reduceMotion.matches ? 0 : mouseX;
  const my = reduceMotion.matches ? 0 : mouseY;

  set('--mx', mx.toFixed(4)); set('--my', my.toFixed(4));
  set('--back-opacity', (1 - frame2.active * 0.06).toString());
  set('--back-x', `${mx * -12}px`); set('--back-y', `${my * -4}px`);
  set('--back-scale', backScale.toString());
  set('--four-y', `${10 + progress * 10}vh`);
  set('--four-scale', (0.78 + progress * 0.16).toString());
  set('--bazaar-y', `${20 - progress * 8}vh`);
  set('--blur-px', `${blurActive * 14}px`);
  set('--back-brightness', (1 - blurActive * 0.255).toString());
  set('--bazaar-blur-px', `${frame2.active * 14}px`);
  set('--bazaar-brightness', (1 - frame2.active * 0.255 - frame3.active * 0.06).toString());
  set('--bazaar-saturation', (1 + frame3.active * 0.18).toString());
  set('--shade-opacity', '1');
  set('--shade-z', frame2.active > 0.02 ? '2' : '0');
  set('--shade-top-alpha', (blurActive * 0.465).toString());
  set('--shade-mid-alpha', (blurActive * 0.42).toString());
  set('--shade-bottom-alpha', (blurActive * 0.51).toString());
  set('--title-y', `${introExit * 150}px`); // Title moves down instead of up
  set('--title-scale', (1 + introExit * 0.15).toString()); // Title scales up
  set('--title-opacity', (1 - introExit * 0.8).toString()); // Title fades out slower
  set('--title-z-index', (3 - introExit * 2).toString()); // Title goes behind other elements
  set('--bridge-x', `calc(-50% + ${mx * 18}px)`);
  set('--bridge-y', `${my * 8 + sharedHeroY - frame2.exit * 760}px`);
  set('--bridge-bottom', `${5 - frame2.enter * 13}vh`);
  set('--bridge-width', `${67.2 + frame2.enter * 37.8}vw`);
  set('--bridge-scale', (1.02 + sharedHeroScale + frame2.exit * 0.46).toString());
  set('--split-left-x', `calc(-50% + ${-splitDrift * 46}vw + ${mx * 22}px)`);
  set('--split-left-y', `${my * 10 + sharedHeroY - splitDrift * 180}px`);
  set('--split-left-scale', (1 + sharedHeroScale + frame2.enter * 0.74).toString());
  set('--split-right-x', `calc(-50% + ${splitDrift * 46}vw + ${mx * 22}px)`);
  set('--split-right-y', `${my * 10 + sharedHeroY - splitDrift * 180}px`);
  set('--split-right-scale', (1 + sharedHeroScale + frame2.enter * 0.74).toString());
  set('--frame2-opacity', frame2Opacity.toString());
  set('--frame2-x', `calc(-50% + ${mx * 10}px)`);
  set('--frame2-y', `calc(-50% + ${my * 8 - frame2.exit * 150}px)`);
  set('--frame2-scale', (1.06 + frame2.enter * 0.08 + frame2.exit * 0.08).toString());
  set('--intro-copy-y', `${introExit * 90}px`);
  set('--intro-copy-opacity', (1 - introExit).toString());
  set('--panel2-opacity', panel2Opacity.toString());
  set('--panel2-y', `calc(-50% + ${-frame2.exit * 86 + (1 - frame2.enter) * 58}px)`);
  set('--panel3-opacity', panel3Opacity.toString());
  set('--panel3-y', `calc(-50% + ${-frame3.exit * 86 + (1 - frame3.enter) * 58}px)`);
  set('--sights-opacity', sightsEnter.toString());
  set('--sights-controls-opacity', sightsControlsEnter.toString());
  sightsControls.classList.toggle('is-ready', sightsControlsEnter > 0.98);
  set('--sights-visibility', sightsEnter > 0.01 ? 'visible' : 'hidden');
  set('--sights-y', '0px');
  set('--sights-enter-x', `${(1 - sightsEnter) * 420}vw`);
  set('--sights-scale', (1 / backScale).toString());
  set('--sights-top', `${sightsParentTop}px`);
  set('--sights-screen-top', `${sightsScreenTop}px`);

  const stillMoving = Math.abs(smoothScroll - targetScroll) > 0.5 || Math.abs(mouseX - targetMouseX) > 0.001 || Math.abs(mouseY - targetMouseY) > 0.001;
  if (stillMoving) requestTick();
}

function requestTick() { if (!rafPending) { rafPending = true; requestAnimationFrame(update); } }

/* --- Slider --- */
function updateSightSlider() {
  if (!sightCards.length || !track) return;
  const cardWidth = sightCards[0].offsetWidth;
  const gap = parseFloat(getComputedStyle(track).columnGap || '0');
  set('--sights-shift', `${-(cardWidth + gap) * activeSight}px`);
  sightCards.forEach(card => card.classList.toggle('is-active', Number(card.dataset.sightIndex) === activeSight));
}
function jumpSightSlider(i) {
  track.classList.add('is-jumping'); activeSight = i; updateSightSlider();
  requestAnimationFrame(() => { requestAnimationFrame(() => { track.classList.remove('is-jumping'); }); });
}
function normalizeSightSlider() {
  if (originalSightCount === 0) return;
  if (activeSight >= originalSightCount * 2) jumpSightSlider(activeSight - originalSightCount);
  else if (activeSight < originalSightCount) jumpSightSlider(activeSight + originalSightCount);
}
function moveSightSlider(dir) { activeSight += dir; updateSightSlider(); }
function selectSightCard(card) { const idx = Number(card.dataset.sightIndex); if (isFinite(idx)) { activeSight = idx; updateSightSlider(); } }

function setupSightSlider() {
  if (!track) return;
  const cards = Array.from(track.querySelectorAll('.sight-card'));
  if (!cards.length) return;
  originalSightCount = cards.length;
  track.replaceChildren();
  for (let si = 0; si < 3; si++) {
    cards.forEach((card, ci) => {
      const clone = card.cloneNode(true);
      clone.dataset.sightIndex = si * originalSightCount + ci;
      track.appendChild(clone);
    });
  }
  sightCards = Array.from(track.querySelectorAll('.sight-card'));
  activeSight = originalSightCount;
  sightCards.forEach(card => {
    card.addEventListener('click', () => selectSightCard(card));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectSightCard(card); } });
  });
  track.addEventListener('transitionend', normalizeSightSlider);
  updateSightSlider();
}

window.addEventListener('scroll', requestTick, { passive: true });
window.addEventListener('resize', () => { updateSightSlider(); requestTick(); });
window.addEventListener('pointermove', e => {
  targetMouseX = e.clientX / window.innerWidth - 0.5;
  targetMouseY = e.clientY / window.innerHeight - 0.5;
  requestTick();
}, { passive: true });
if (prevBtn) prevBtn.addEventListener('click', () => moveSightSlider(-1));
if (nextBtn) nextBtn.addEventListener('click', () => moveSightSlider(1));

/* ============================================
   API HELPERS (Vercel KV Backend)
   ============================================ */
async function apiGet(endpoint) {
  try {
    const res = await fetch('/api/' + endpoint);
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch (err) {
    console.error('API GET error:', err);
    return null;
  }
}

async function apiPost(endpoint, data) {
  try {
    const res = await fetch('/api/' + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to save');
    return await res.json();
  } catch (err) {
    console.error('API POST error:', err);
    return null;
  }
}

/* LocalStorage fallback for cart (user-specific) */
function getLocalData(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
function setLocalData(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function showToast(msg) {
  let t = document.querySelector('.save-toast');
  if (!t) { t = document.createElement('div'); t.className = 'save-toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}
function fileToBase64(file) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = (e) => resolve(e.target.result);
    r.readAsDataURL(file);
  });
}

/* ============================================
   DEFAULT DATA
   ============================================ */
const DEFAULT_PRODUCTS = [
  { id: 'p1', title: 'Online Courses', desc: 'Structured video lessons, quizzes and certificates.', price: 999, img: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230438_d526b8b6-8a2e-4e3b-9993-3908acae03a7.png', kicker: 'Best Seller' },
  { id: 'p2', title: 'E-books & PDFs', desc: 'Instant download guides and reference PDFs.', price: 299, img: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230442_140bc25b-b165-4249-904a-f708bff6970e.png', kicker: 'Digital Books' },
  { id: 'p3', title: 'Templates', desc: 'Plug-and-play design and document templates.', price: 499, img: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230448_825949c9-ccdb-4857-b4a6-e349eccc9010.png', kicker: 'Ready to Use' },
  { id: 'p4', title: 'Software & Tools', desc: 'Scripts, SaaS tools and productivity software.', price: 1499, img: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230438_d526b8b6-8a2e-4e3b-9993-3908acae03a7.png', kicker: 'Lifetime Access' },
  { id: 'p5', title: 'Memberships', desc: 'Premium content, live sessions and community.', price: 1999, img: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230442_140bc25b-b165-4249-904a-f708bff6970e.png', kicker: 'Community' },
];

/* ============================================
   GLOBAL DATA
   ============================================ */
let products = [];
let courses = [];
let cart = getLocalData('eduvault_cart', []);

/* ============================================
   INIT ON LOAD
   ============================================ */
window.addEventListener('load', async () => {
  await loadAllData();
  updateCartCount();
  setupSightSlider();
  requestTick();
});

async function loadAllData() {
  // Fetch all data from API in parallel
  const [productsData, coursesData, contactData, footerData, socialData, heroBannerData, featuresData] = await Promise.all([
    apiGet('products'),
    apiGet('courses'),
    apiGet('contact'),
    apiGet('footer'),
    apiGet('social'),
    apiGet('hero-banner'),
    apiGet('features')
  ]);

  products = productsData || DEFAULT_PRODUCTS;
  courses = coursesData || [];
  features = featuresData || [];

  initProducts();
  initCourses();
  initFeatures();
  if (contactData) applyContactToSite(contactData);
  if (footerData) applyFooterToSite(footerData);
  renderSocialIcons(socialData || []);
  if (heroBannerData) applyHeroBannerToSite(heroBannerData);
}

/* ============================================
   PRODUCTS — Slider + Catalog + Admin CRUD
   ============================================ */
function initProducts() {
  renderSliderCards();
  renderCatalogModal();
  renderAdminProductsList();
}

function renderSliderCards() {
  if (!track) return;
  track.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('article');
    card.className = 'sight-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.innerHTML = '<span class="sight-kicker">' + (p.kicker || 'Product') + '</span><img class="sight-pin" src="' + p.img + '" alt="" /><h3>' + p.title + '</h3><p>' + p.description + '</p>';
    track.appendChild(card);
  });
}

function renderCatalogModal() {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!products.length) {
    grid.innerHTML = '<p class="catalog-empty">No products yet. Add from admin portal.</p>';
    return;
  }
  products.forEach(p => {
    const item = document.createElement('div');
    item.className = 'catalog-item';
    item.dataset.productId = p.id;
    item.dataset.productName = p.title;
    item.dataset.productPrice = p.price;
    item.innerHTML = '<img src="' + p.img + '" alt="' + p.title + '" /><h3>' + p.title + '</h3><p>' + p.description + '</p><div class="catalog-price">₹' + p.price + '</div><button class="add-to-cart-btn">Add to Cart</button>';
    grid.appendChild(item);
  });
  attachCartBtns(grid);
}

function renderAdminProductsList() {
  const list = document.getElementById('admin-products-list');
  if (!list) return;
  list.innerHTML = '';
  if (!products.length) { list.innerHTML = '<p class="admin-list-empty">No products yet. Add your first product above.</p>'; return; }
  products.forEach(p => {
    const item = document.createElement('div');
    item.className = 'admin-list-item';
    item.innerHTML = '<img src="' + p.img + '" alt="" /><div class="admin-list-item-info"><h4>' + p.title + '</h4><p>₹' + p.price + ' — ' + p.description.slice(0, 50) + '...</p></div><div class="admin-list-item-actions"><button class="admin-edit-btn" data-id="' + p.id + '">Edit</button><button class="admin-delete-btn" data-id="' + p.id + '">Delete</button></div>';
    list.appendChild(item);
  });
  list.querySelectorAll('.admin-edit-btn').forEach(btn => btn.addEventListener('click', () => editProduct(btn.dataset.id)));
  list.querySelectorAll('.admin-delete-btn').forEach(btn => btn.addEventListener('click', () => deleteProduct(btn.dataset.id)));
}

/* Product form */
let productTempImg = '';
const productImgTrigger = document.getElementById('product-img-trigger');
const productImgInput = document.getElementById('product-img-input');
const productImgPreview = document.getElementById('product-img-preview');

if (productImgTrigger) productImgTrigger.addEventListener('click', () => productImgInput.click());
if (productImgInput) {
  productImgInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) { productTempImg = await fileToBase64(file); productImgPreview.src = productTempImg; productImgPreview.style.display = 'block'; }
    productImgInput.value = '';
  });
}

// Product PDF upload
let productTempPdf = '';
const productPdfTrigger = document.getElementById('product-pdf-trigger');
const productPdfInput = document.getElementById('product-pdf-input');
const productPdfName = document.getElementById('product-pdf-name');

if (productPdfTrigger) productPdfTrigger.addEventListener('click', () => productPdfInput.click());
if (productPdfInput) {
  productPdfInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      productTempPdf = await fileToBase64(file);
      productPdfName.textContent = file.name;
    }
    productPdfInput.value = '';
  });
}

const saveProductBtn = document.getElementById('save-product');
const cancelProductEdit = document.getElementById('cancel-product-edit');

if (saveProductBtn) {
  saveProductBtn.addEventListener('click', async () => {
    const editId = document.getElementById('product-edit-id').value;
    const title = document.getElementById('product-title').value.trim();
    const desc = document.getElementById('product-desc').value.trim();
    const price = parseInt(document.getElementById('product-price').value) || 0;
    if (!title) { showToast('Title is required'); return; }

    if (editId) {
      const idx = products.findIndex(p => p.id === editId);
      if (idx >= 0) {
        products[idx].title = title;
        products[idx].description = desc;
        products[idx].price = price;
        if (productTempImg) products[idx].img = productTempImg;
        if (productTempPdf) products[idx].pdf = productTempPdf;
      }
    } else {
      products.push({ id: genId(), title, description: desc, price, img: productTempImg || 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230438_d526b8b6-8a2e-4e3b-9993-3908acae03a7.png', pdf: productTempPdf || '', kicker: 'Product' });
    }
    
    await apiPost('products', { products });
    resetProductForm();
    initProducts();
    showToast(editId ? 'Product updated!' : 'Product added!');
  });
}

if (cancelProductEdit) cancelProductEdit.addEventListener('click', resetProductForm);

function resetProductForm() {
  document.getElementById('product-edit-id').value = '';
  document.getElementById('product-title').value = '';
  document.getElementById('product-desc').value = '';
  document.getElementById('product-price').value = '';
  document.getElementById('product-form-title').textContent = 'Add New Product';
  productTempImg = '';
  productTempPdf = '';
  productImgPreview.style.display = 'none';
  if (productPdfName) productPdfName.textContent = '';
  cancelProductEdit.style.display = 'none';
}

function editProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  document.getElementById('product-edit-id').value = p.id;
  document.getElementById('product-title').value = p.title;
  document.getElementById('product-desc').value = p.description;
  document.getElementById('product-price').value = p.price;
  productTempImg = p.img;
  productImgPreview.src = p.img;
  productImgPreview.style.display = 'block';
  document.getElementById('product-form-title').textContent = 'Edit Product';
  cancelProductEdit.style.display = 'inline-block';
  document.getElementById('product-form-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  products = products.filter(p => p.id !== id);
  await apiPost('products', { products });
  initProducts();
  showToast('Product deleted');
}

/* ============================================
   COURSES — Website Display + Admin CRUD
   ============================================ */
function initCourses() { renderCoursesGrid(); renderAdminCoursesList(); }

function renderCoursesGrid() {
  const grid = document.getElementById('courses-grid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!courses.length) { grid.innerHTML = '<p class="courses-empty">No courses added yet.</p>'; return; }
  courses.forEach(c => {
    const finalPrice = c.discount > 0 ? Math.round(c.price * (1 - c.discount / 100)) : c.price;
    const card = document.createElement('div');
    card.className = 'course-card';
    let priceHtml = '<span class="price">₹' + finalPrice + '</span>';
    if (c.discount > 0) priceHtml += '<span class="original-price">₹' + c.price + '</span><span class="discount-badge">' + c.discount + '% OFF</span>';
    card.innerHTML = '<img class="course-card-img" src="' + c.img + '" alt="' + c.title + '" /><div class="course-card-body"><h3>' + c.title + '</h3><p>' + c.description + '</p><div class="course-card-price">' + priceHtml + '</div><button class="add-to-cart-btn" data-id="' + c.id + '" data-name="' + c.title + '" data-price="' + finalPrice + '" data-img="' + c.img + '">Add to Cart</button></div>';
    grid.appendChild(card);
  });
  grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart(btn.dataset.id, btn.dataset.name, parseInt(btn.dataset.price), btn.dataset.img);
      btn.textContent = 'Added!'; btn.classList.add('added');
      setTimeout(() => { btn.textContent = 'Add to Cart'; btn.classList.remove('added'); }, 1500);
    });
  });
}

function renderAdminCoursesList() {
  const list = document.getElementById('admin-courses-list');
  if (!list) return;
  list.innerHTML = '';
  if (!courses.length) { list.innerHTML = '<p class="admin-list-empty">No courses yet. Add your first course above.</p>'; return; }
  courses.forEach(c => {
    const finalPrice = c.discount > 0 ? Math.round(c.price * (1 - c.discount / 100)) : c.price;
    const discText = c.discount > 0 ? ' (' + c.discount + '% off from ₹' + c.price + ')' : '';
    const item = document.createElement('div');
    item.className = 'admin-list-item';
    item.innerHTML = '<img src="' + c.img + '" alt="" /><div class="admin-list-item-info"><h4>' + c.title + '</h4><p>₹' + finalPrice + discText + '</p></div><div class="admin-list-item-actions"><button class="admin-edit-btn" data-id="' + c.id + '">Edit</button><button class="admin-delete-btn" data-id="' + c.id + '">Delete</button></div>';
    list.appendChild(item);
  });
  list.querySelectorAll('.admin-edit-btn').forEach(btn => btn.addEventListener('click', () => editCourse(btn.dataset.id)));
  list.querySelectorAll('.admin-delete-btn').forEach(btn => btn.addEventListener('click', () => deleteCourse(btn.dataset.id)));
}

/* Course form */
let courseTempImg = '';
let courseTempPdf = '';
const courseImgTrigger = document.getElementById('course-img-trigger');
const courseImgInput = document.getElementById('course-img-input');
const courseImgPreview = document.getElementById('course-img-preview');

if (courseImgTrigger) courseImgTrigger.addEventListener('click', () => courseImgInput.click());
if (courseImgInput) {
  courseImgInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) { courseTempImg = await fileToBase64(file); courseImgPreview.src = courseTempImg; courseImgPreview.style.display = 'block'; }
    courseImgInput.value = '';
  });
}

// Course PDF upload
const coursePdfTrigger = document.getElementById('course-pdf-trigger');
const coursePdfInput = document.getElementById('course-pdf-input');
const coursePdfName = document.getElementById('course-pdf-name');

if (coursePdfTrigger) coursePdfTrigger.addEventListener('click', () => coursePdfInput.click());
if (coursePdfInput) {
  coursePdfInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      courseTempPdf = await fileToBase64(file);
      coursePdfName.textContent = file.name;
    }
    coursePdfInput.value = '';
  });
}

const saveCourseBtn = document.getElementById('save-course');
const cancelCourseEdit = document.getElementById('cancel-course-edit');

if (saveCourseBtn) {
  saveCourseBtn.addEventListener('click', async () => {
    const editId = document.getElementById('course-edit-id').value;
    const title = document.getElementById('course-title').value.trim();
    const desc = document.getElementById('course-desc').value.trim();
    const price = parseInt(document.getElementById('course-price').value) || 0;
    const discount = parseInt(document.getElementById('course-discount').value) || 0;
    if (!title) { showToast('Title is required'); return; }

    if (editId) {
      const idx = courses.findIndex(c => c.id === editId);
      if (idx >= 0) {
        courses[idx].title = title;
        courses[idx].description = desc;
        courses[idx].price = price;
        courses[idx].discount = Math.min(100, Math.max(0, discount));
        if (courseTempImg) courses[idx].img = courseTempImg;
        if (courseTempPdf) courses[idx].pdf = courseTempPdf;
      }
    } else {
      courses.push({ id: genId(), title, description: desc, price, discount: Math.min(100, Math.max(0, discount)), img: courseTempImg || 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230438_d526b8b6-8a2e-4e3b-9993-3908acae03a7.png', pdf: courseTempPdf || '' });
    }
    
    await apiPost('courses', { courses });
    resetCourseForm();
    initCourses();
    showToast(editId ? 'Course updated!' : 'Course added!');
  });
}

if (cancelCourseEdit) cancelCourseEdit.addEventListener('click', resetCourseForm);

function resetCourseForm() {
  document.getElementById('course-edit-id').value = '';
  document.getElementById('course-title').value = '';
  document.getElementById('course-desc').value = '';
  document.getElementById('course-price').value = '';
  document.getElementById('course-discount').value = '';
  document.getElementById('course-form-title').textContent = 'Add New Course';
  courseTempImg = '';
  courseTempPdf = '';
  courseImgPreview.style.display = 'none';
  if (coursePdfName) coursePdfName.textContent = '';
  cancelCourseEdit.style.display = 'none';
}

function editCourse(id) {
  const c = courses.find(x => x.id === id);
  if (!c) return;
  document.getElementById('course-edit-id').value = c.id;
  document.getElementById('course-title').value = c.title;
  document.getElementById('course-desc').value = c.description;
  document.getElementById('course-price').value = c.price;
  document.getElementById('course-discount').value = c.discount || 0;
  courseTempImg = c.img;
  courseImgPreview.src = c.img;
  courseImgPreview.style.display = 'block';
  document.getElementById('course-form-title').textContent = 'Edit Course';
  cancelCourseEdit.style.display = 'inline-block';
  document.getElementById('course-form-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function deleteCourse(id) {
  if (!confirm('Delete this course?')) return;
  courses = courses.filter(c => c.id !== id);
  await apiPost('courses', { courses });
  initCourses();
  showToast('Course deleted');
}

/* ============================================
   FEATURES — Admin CRUD
   ============================================ */
let features = [];

function initFeatures() { renderFeaturesGrid(); renderAdminFeaturesList(); }

function renderFeaturesGrid() {
  const grid = document.getElementById('features-grid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!features.length) { grid.innerHTML = ''; return; }
  features.forEach(f => {
    const card = document.createElement('div');
    card.className = 'feature-card';
    card.innerHTML = '<span class="feature-icon">' + (f.icon || '✓') + '</span><h3>' + f.title + '</h3><p>' + f.description + '</p>';
    grid.appendChild(card);
  });
}

function renderAdminFeaturesList() {
  const list = document.getElementById('admin-features-list');
  if (!list) return;
  list.innerHTML = '';
  if (!features.length) { list.innerHTML = '<p class="admin-list-empty">No features yet. Add your first feature above.</p>'; return; }
  features.forEach(f => {
    const item = document.createElement('div');
    item.className = 'admin-list-item';
    item.innerHTML = '<div style="font-size: 2rem; margin-right: 12px;">' + (f.icon || '✓') + '</div><div class="admin-list-item-info"><h4>' + f.title + '</h4><p>' + f.description.slice(0, 50) + '...</p></div><div class="admin-list-item-actions"><button class="admin-edit-btn" data-id="' + f.id + '">Edit</button><button class="admin-delete-btn" data-id="' + f.id + '">Delete</button></div>';
    list.appendChild(item);
  });
  list.querySelectorAll('.admin-edit-btn').forEach(btn => btn.addEventListener('click', () => editFeature(btn.dataset.id)));
  list.querySelectorAll('.admin-delete-btn').forEach(btn => btn.addEventListener('click', () => deleteFeature(btn.dataset.id)));
}

const saveFeatureBtn = document.getElementById('save-feature');
const cancelFeatureEdit = document.getElementById('cancel-feature-edit');

if (saveFeatureBtn) {
  saveFeatureBtn.addEventListener('click', async () => {
    const editId = document.getElementById('feature-edit-id').value;
    const icon = document.getElementById('feature-icon').value.trim();
    const title = document.getElementById('feature-title').value.trim();
    const description = document.getElementById('feature-description').value.trim();
    if (!title) { showToast('Title is required'); return; }

    if (editId) {
      const idx = features.findIndex(f => f.id === editId);
      if (idx >= 0) {
        features[idx].icon = icon;
        features[idx].title = title;
        features[idx].description = description;
      }
    } else {
      features.push({ id: genId(), icon: icon || '✓', title, description });
    }
    
    await apiPost('features', { features });
    resetFeatureForm();
    initFeatures();
    showToast(editId ? 'Feature updated!' : 'Feature added!');
  });
}

if (cancelFeatureEdit) cancelFeatureEdit.addEventListener('click', resetFeatureForm);

function resetFeatureForm() {
  document.getElementById('feature-edit-id').value = '';
  document.getElementById('feature-icon').value = '';
  document.getElementById('feature-title').value = '';
  document.getElementById('feature-description').value = '';
  document.getElementById('feature-form-title').textContent = 'Add New Feature';
  cancelFeatureEdit.style.display = 'none';
}

function editFeature(id) {
  const f = features.find(x => x.id === id);
  if (!f) return;
  document.getElementById('feature-edit-id').value = f.id;
  document.getElementById('feature-icon').value = f.icon || '';
  document.getElementById('feature-title').value = f.title;
  document.getElementById('feature-description').value = f.description;
  document.getElementById('feature-form-title').textContent = 'Edit Feature';
  cancelFeatureEdit.style.display = 'inline-block';
  document.getElementById('feature-form-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function deleteFeature(id) {
  if (!confirm('Delete this feature?')) return;
  features = features.filter(f => f.id !== id);
  await apiPost('features', { features });
  initFeatures();
  showToast('Feature deleted');
}

// Save features section title
const saveFeaturesTitleBtn = document.getElementById('save-features-title');
if (saveFeaturesTitleBtn) {
  saveFeaturesTitleBtn.addEventListener('click', async () => {
    const title = document.getElementById('features-section-title').value.trim();
    const featuresTitle = document.querySelector('.features-title');
    if (featuresTitle) featuresTitle.textContent = title || 'Why Choose EduVault?';
    await apiPost('features-title', { title });
    showToast('Section title saved!');
  });
}

/* ============================================
   CATALOG MODAL
   ============================================ */
const catalogModal = document.getElementById('catalog-modal');
const catalogNavBtn = document.getElementById('catalog-nav-btn');
const catalogClose = document.getElementById('catalog-close');
if (catalogNavBtn) catalogNavBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(catalogModal); });
if (catalogClose) catalogClose.addEventListener('click', () => closeModal(catalogModal));
if (catalogModal) catalogModal.addEventListener('click', (e) => { if (e.target === catalogModal) closeModal(catalogModal); });
function openModal(m) { m.classList.add('is-open'); }
function closeModal(m) { m.classList.remove('is-open'); }

/* ============================================
   CART (localStorage - user specific)
   ============================================ */
const cartIconBtn = document.getElementById('cart-icon-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const cartCloseBtn = document.getElementById('cart-close');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountEl = document.getElementById('cart-count');
const cartTotalAmount = document.getElementById('cart-total-amount');
const checkoutBtn = document.getElementById('checkout-btn');

if (cartIconBtn) cartIconBtn.addEventListener('click', () => { cartSidebar.classList.add('is-open'); cartOverlay.classList.add('is-open'); renderCart(); });
if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
function closeCart() { cartSidebar.classList.remove('is-open'); cartOverlay.classList.remove('is-open'); }

function attachCartBtns(container) {
  container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.catalog-item');
      if (!item) return;
      addToCart(item.dataset.productId, item.dataset.productName, parseInt(item.dataset.productPrice), item.querySelector('img').src);
      btn.textContent = 'Added!'; btn.classList.add('added');
      setTimeout(() => { btn.textContent = 'Add to Cart'; btn.classList.remove('added'); }, 1500);
    });
  });
}

function addToCart(id, name, price, img) {
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, name, price, img, qty: 1 });
  setLocalData('eduvault_cart', cart);
  updateCartCount();
  showToast('Added to cart!');
}
function removeFromCart(id) { cart = cart.filter(i => i.id !== id); setLocalData('eduvault_cart', cart); updateCartCount(); renderCart(); }
function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (item) { item.qty += delta; if (item.qty <= 0) removeFromCart(id); else { setLocalData('eduvault_cart', cart); updateCartCount(); renderCart(); } }
}
function updateCartCount() { if (cartCountEl) cartCountEl.textContent = cart.reduce((s, i) => s + i.qty, 0); }
function renderCart() {
  if (!cartItemsContainer) return;
  if (!cart.length) { cartItemsContainer.innerHTML = '<p class="cart-empty">Your cart is empty</p>'; if (cartTotalAmount) cartTotalAmount.textContent = '₹0'; if (checkoutBtn) checkoutBtn.disabled = true; return; }
  cartItemsContainer.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = '<img src="' + item.img + '" alt="" class="cart-item-img" /><div class="cart-item-info"><h4 class="cart-item-name">' + item.name + '</h4><p class="cart-item-price">₹' + item.price + ' × ' + item.qty + ' = ₹' + (item.price * item.qty) + '</p><div class="cart-item-controls"><button class="qty-btn" data-id="' + item.id + '" data-action="decrease">−</button><span class="cart-item-qty">' + item.qty + '</span><button class="qty-btn" data-id="' + item.id + '" data-action="increase">+</button><button class="remove-item-btn" data-id="' + item.id + '">Remove</button></div></div>';
    cartItemsContainer.appendChild(el);
  });
  if (cartTotalAmount) cartTotalAmount.textContent = '₹' + total;
  if (checkoutBtn) checkoutBtn.disabled = false;
  cartItemsContainer.querySelectorAll('.qty-btn').forEach(btn => btn.addEventListener('click', () => updateQty(btn.dataset.id, btn.dataset.action === 'increase' ? 1 : -1)));
  cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(btn => btn.addEventListener('click', () => removeFromCart(btn.dataset.id)));
}

/* ============================================
   RAZORPAY CHECKOUT
   ============================================ */
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', async () => {
    if (!cart.length) return;
    
    // Check if customer is logged in
    const isLoggedIn = sessionStorage.getItem('customer_logged_in') === 'true';
    const customerData = JSON.parse(sessionStorage.getItem('customer_data') || 'null');
    
    if (!isLoggedIn || !customerData) {
      showToast('Please login or register to continue');
      closeCart();
      openModal(loginModal);
      return;
    }
    
    const customerEmail = customerData.email;
    const customerName = customerData.full_name;
    
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const options = {
      key: 'rzp_test_YOUR_KEY_ID',
      amount: total * 100,
      currency: 'INR',
      name: 'EduVault',
      description: 'Digital Products Purchase',
      handler: async function(response) {
        // Create order in database
        const order = {
          razorpayPaymentId: response.razorpay_payment_id,
          customerEmail: customerEmail,
          customerName: customerName,
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            qty: item.qty,
            img: item.img,
            description: item.description || ''
          })),
          total: total
        };
        
        const result = await apiPost('orders', { order });
        
        if (result && result.success) {
          // Save email for future access
          localStorage.setItem('customer_email', customerEmail);
          
          // Show success message with account link
          showToast('Payment successful! Check your email for access links.');
          
          // Clear cart
          cart = []; 
          setLocalData('eduvault_cart', cart); 
          updateCartCount(); 
          renderCart(); 
          closeCart();
          
          // Show order confirmation
          setTimeout(() => {
            if (confirm('Order placed successfully! Order ID: ' + result.order.id + '\n\nView your orders and download products now?')) {
              window.location.href = '/account.html?email=' + encodeURIComponent(customerEmail);
            }
          }, 500);
        } else {
          showToast('Payment successful but order creation failed. Contact support.');
        }
      },
      prefill: { name: customerName, email: customerEmail, contact: customerData.contact || '' },
      theme: { color: '#fdf1e1' },
      modal: { ondismiss: () => showToast('Payment cancelled') }
    };
    if (typeof Razorpay !== 'undefined') new Razorpay(options).open();
    else showToast('Razorpay not loaded. Add your API key.');
  });
}

/* ============================================
   UNIFIED LOGIN SYSTEM
   ============================================ */
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const loginOpenBtn = document.getElementById('admin-login-open');
const loginCloseBtn = document.getElementById('login-close');
const registerCloseBtn = document.getElementById('register-close');
const adminPortal = document.getElementById('admin-portal');
const logoutBtn = document.getElementById('admin-logout');
const userLogoutBtn = document.getElementById('user-logout-btn');
const userNameDisplay = document.getElementById('user-name-display');

// Show register modal
document.getElementById('show-register')?.addEventListener('click', (e) => {
  e.preventDefault();
  closeModal(loginModal);
  openModal(registerModal);
});

// Show login modal
document.getElementById('show-login')?.addEventListener('click', (e) => {
  e.preventDefault();
  closeModal(registerModal);
  openModal(loginModal);
});

// Open login modal
if (loginOpenBtn) {
  loginOpenBtn.addEventListener('click', () => {
    if (sessionStorage.getItem('admin_logged_in') === 'true') {
      openAdminPortal();
    } else if (sessionStorage.getItem('customer_logged_in') === 'true') {
      // Customer is logged in, show logout
    } else {
      openModal(loginModal);
    }
  });
}

// Close modals
if (loginCloseBtn) loginCloseBtn.addEventListener('click', () => { closeModal(loginModal); });
if (registerCloseBtn) registerCloseBtn.addEventListener('click', () => { closeModal(registerModal); });
if (loginModal) loginModal.addEventListener('click', (e) => { if (e.target === loginModal) closeModal(loginModal); });
if (registerModal) registerModal.addEventListener('click', (e) => { if (e.target === registerModal) closeModal(registerModal); });

// Get admin credentials
async function getCredentials() {
  const creds = await apiGet('credentials');
  return creds || { user: 'admin', pass: 'admin123' };
}

// Unified Login Form
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    // First check if it's admin
    const creds = await getCredentials();
    if (username === creds.user && password === creds.pass) {
      // Admin login successful
      sessionStorage.setItem('admin_logged_in', 'true');
      closeModal(loginModal);
      loginForm.reset();
      loginError.textContent = '';
      openAdminPortal();
      showToast('Welcome Admin!');
      return;
    }
    
    // If not admin, try customer login
    const result = await apiPost('customers', { action: 'login', email: username, password });
    
    if (result && result.success) {
      // Customer login successful
      sessionStorage.setItem('customer_logged_in', 'true');
      sessionStorage.setItem('customer_data', JSON.stringify(result.customer));
      closeModal(loginModal);
      loginForm.reset();
      loginError.textContent = '';
      updateCustomerUI();
      showToast('Welcome back, ' + result.customer.full_name + '!');
    } else {
      // Both failed
      loginError.textContent = 'Invalid credentials. Please check your email/username and password.';
    }
  });
}

// Customer Register
const registerForm = document.getElementById('register-form');
const registerError = document.getElementById('register-error');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const full_name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const contact = document.getElementById('register-contact').value.trim();
    const state = document.getElementById('register-state').value.trim();
    const city = document.getElementById('register-city').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (password !== confirmPassword) {
      registerError.textContent = 'Passwords do not match.';
      return;
    }
    
    const result = await apiPost('customers', { 
      action: 'register', 
      full_name, 
      email, 
      contact, 
      state, 
      city, 
      password 
    });
    
    if (result && result.success) {
      sessionStorage.setItem('customer_logged_in', 'true');
      sessionStorage.setItem('customer_data', JSON.stringify(result.customer));
      closeModal(registerModal);
      registerForm.reset();
      registerError.textContent = '';
      updateCustomerUI();
      showToast('Registration successful! Welcome, ' + result.customer.full_name + '!');
    } else {
      registerError.textContent = result?.error || 'Registration failed. Please try again.';
    }
  });
}

// Logout handlers
if (logoutBtn) logoutBtn.addEventListener('click', () => { 
  sessionStorage.removeItem('admin_logged_in'); 
  adminPortal.classList.remove('is-open'); 
});

if (userLogoutBtn) userLogoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('customer_logged_in');
  sessionStorage.removeItem('customer_data');
  updateCustomerUI();
  showToast('Logged out successfully');
});

// Update UI based on customer login status
function updateCustomerUI() {
  const isLoggedIn = sessionStorage.getItem('customer_logged_in') === 'true';
  const customerData = JSON.parse(sessionStorage.getItem('customer_data') || 'null');
  
  if (isLoggedIn && customerData) {
    loginOpenBtn.style.display = 'none';
    userLogoutBtn.style.display = 'inline-block';
    userNameDisplay.style.display = 'inline-block';
    userNameDisplay.textContent = 'Hi, ' + customerData.full_name.split(' ')[0];
  } else {
    loginOpenBtn.style.display = 'inline-block';
    userLogoutBtn.style.display = 'none';
    userNameDisplay.style.display = 'none';
  }
}

// Check login status on page load
updateCustomerUI();

async function openAdminPortal() { 
  await loadAdminData(); 
  await loadAdminOrders();
  await loadAdminCustomers();
  adminPortal.classList.add('is-open'); 
}

/* Admin Tabs */
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

/* ============================================
   CREDENTIALS CHANGE
   ============================================ */
const saveCredsBtn = document.getElementById('save-credentials');
const credsError = document.getElementById('credentials-error');
if (saveCredsBtn) {
  saveCredsBtn.addEventListener('click', async () => {
    const newUser = document.getElementById('admin-new-username').value.trim();
    const newPass = document.getElementById('admin-new-password').value;
    const confirmPass = document.getElementById('admin-confirm-password').value;
    credsError.textContent = '';
    if (!newUser || !newPass) { credsError.textContent = 'Username and password required.'; return; }
    if (newPass !== confirmPass) { credsError.textContent = 'Passwords do not match.'; return; }
    await apiPost('credentials', { credentials: { user: newUser, pass: newPass } });
    document.getElementById('admin-new-username').value = '';
    document.getElementById('admin-new-password').value = '';
    document.getElementById('admin-confirm-password').value = '';
    showToast('Credentials updated! Use new credentials next login.');
  });
}

/* ============================================
   ORDERS — Admin
   ============================================ */
async function loadAdminOrders() {
  const ordersList = document.getElementById('admin-orders-list');
  if (!ordersList) return;
  
  const orders = await apiGet('orders');
  
  if (!orders || orders.length === 0) {
    ordersList.innerHTML = '<p class="admin-list-empty">No orders yet.</p>';
    return;
  }
  
  ordersList.innerHTML = orders.map(order => `
    <div class="admin-list-item" style="flex-direction: column; align-items: stretch;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <div>
          <h4 style="margin: 0 0 4px;">Order #${order.id}</h4>
          <p style="margin: 0; font-size: 0.85rem; color: rgba(253,241,225,0.5);">
            ${order.customerName} (${order.customerEmail})<br>
            ${new Date(order.createdAt).toLocaleString('en-IN')}
          </p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 1.1rem; font-weight: 700; color: #2d7a4f;">₹${order.total}</div>
          <div style="font-size: 0.8rem; color: rgba(253,241,225,0.4);">${order.status}</div>
        </div>
      </div>
      <div style="border-top: 1px solid rgba(253,241,225,0.08); padding-top: 12px;">
        ${order.items.map(item => `
          <div style="display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px solid rgba(253,241,225,0.04);">
            <img src="${item.img}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;" />
            <div style="flex: 1;">
              <div style="font-size: 0.9rem; font-weight: 600;">${item.name}</div>
              <div style="font-size: 0.8rem; color: rgba(253,241,225,0.5);">₹${item.price} × ${item.qty}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(253,241,225,0.08);">
        <details style="font-size: 0.85rem;">
          <summary style="cursor: pointer; color: rgba(253,241,225,0.6); margin-bottom: 8px;">View Access Links</summary>
          ${order.items.map(item => `
            <div style="padding: 6px 0; font-size: 0.8rem; word-break: break-all;">
              <strong>${item.name}:</strong><br>
              <a href="${item.downloadLink}" target="_blank" style="color: #7fb4d4;">${item.downloadLink}</a>
            </div>
          `).join('')}
        </details>
      </div>
    </div>
  `).join('');
}

/* ============================================
   CUSTOMERS — Admin
   ============================================ */
async function loadAdminCustomers() {
  const customersList = document.getElementById('admin-customers-list');
  if (!customersList) return;
  
  const customers = await apiGet('customers');
  
  if (!customers || customers.length === 0) {
    customersList.innerHTML = '<p class="admin-list-empty">No customers registered yet.</p>';
    return;
  }
  
  customersList.innerHTML = customers.map(customer => `
    <div class="admin-list-item" style="flex-direction: column; align-items: stretch;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <div>
          <h4 style="margin: 0 0 4px;">${customer.full_name}</h4>
          <p style="margin: 0; font-size: 0.85rem; color: rgba(253,241,225,0.5);">
            ${customer.email}<br>
            ${customer.contact}
          </p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.85rem; color: rgba(253,241,225,0.6);">
            ${customer.city || ''}${customer.state ? ', ' + customer.state : ''}
          </div>
          <div style="font-size: 0.75rem; color: rgba(253,241,225,0.4); margin-top: 4px;">
            Joined: ${new Date(customer.created_at).toLocaleDateString('en-IN')}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ============================================
   CONTACT US — Admin
   ============================================ */
const saveContactBtn = document.getElementById('save-contact');
if (saveContactBtn) {
  saveContactBtn.addEventListener('click', async () => {
    const data = {
      heading: document.getElementById('admin-contact-heading').value,
      description: document.getElementById('admin-contact-desc').value,
      email: document.getElementById('admin-contact-email').value,
      phone: document.getElementById('admin-contact-phone').value,
      address: document.getElementById('admin-contact-address').value,
    };
    await apiPost('contact', { contact: data });
    applyContactToSite(data);
    showToast('Contact info saved!');
  });
}
function applyContactToSite(data) {
  if (!data) return;
  const h = document.getElementById('contact-heading');
  const d = document.getElementById('contact-description');
  const em = document.getElementById('contact-email');
  const ph = document.getElementById('contact-phone');
  const ad = document.getElementById('contact-address');
  if (h) h.textContent = data.heading || 'Get in Touch';
  if (d) d.textContent = data.description || '';
  if (em) em.textContent = data.email ? 'Email: ' + data.email : '';
  if (ph) ph.textContent = data.phone ? 'Phone: ' + data.phone : '';
  if (ad) ad.textContent = data.address ? 'Address: ' + data.address : '';
}

/* ============================================
   FOOTER — Admin
   ============================================ */
const saveFooterBtn = document.getElementById('save-footer');
if (saveFooterBtn) {
  saveFooterBtn.addEventListener('click', async () => {
    const data = {
      col1Title: document.getElementById('admin-footer-col1-title').value,
      col1Desc: document.getElementById('admin-footer-col1-desc').value,
      email: document.getElementById('admin-footer-email').value,
      phone: document.getElementById('admin-footer-phone').value,
      copyright: document.getElementById('admin-footer-copyright').value,
      social: document.getElementById('admin-footer-social').value,
    };
    await apiPost('footer', { footer: data });
    applyFooterToSite(data);
    showToast('Footer saved!');
  });
}
function applyFooterToSite(data) {
  if (!data) return;
  const col1 = document.getElementById('footer-col-1');
  if (col1) { col1.querySelector('h4').textContent = data.col1Title || 'EduVault'; col1.querySelector('p').textContent = data.col1Desc || ''; }
  const fe = document.getElementById('footer-email');
  const fp = document.getElementById('footer-phone');
  if (fe) fe.textContent = data.email || '';
  if (fp) fp.textContent = data.phone || '';
  const fc = document.getElementById('footer-copyright');
  if (fc) fc.textContent = data.copyright || '';
}

/* ============================================
   HERO BANNER
   ============================================ */
function applyHeroBannerToSite(data) {
  if (!data) return;
  const title = document.getElementById('hero-banner-title');
  const desc = document.getElementById('hero-banner-desc');
  const buttons = document.getElementById('hero-banner-buttons');
  const image = document.querySelector('#hero-banner-image img');
  
  if (title) title.textContent = data.title || 'Transform Your Learning Journey';
  if (desc) desc.textContent = data.description || '';
  
  if (buttons) {
    buttons.innerHTML = '';
    if (data.btn1_text && data.btn1_link) {
      const btn1 = document.createElement('a');
      btn1.href = data.btn1_link;
      btn1.className = 'hero-btn hero-btn-primary';
      btn1.textContent = data.btn1_text;
      buttons.appendChild(btn1);
    }
    if (data.btn2_text && data.btn2_link) {
      const btn2 = document.createElement('a');
      btn2.href = data.btn2_link;
      btn2.className = 'hero-btn hero-btn-secondary';
      btn2.textContent = data.btn2_text;
      buttons.appendChild(btn2);
    }
  }
  
  if (image && data.image) image.src = data.image;
}

// Hero banner admin handlers
let heroTempImg = '';
const heroImgTrigger = document.getElementById('hero-img-trigger');
const heroImgInput = document.getElementById('hero-img-input');
const heroImgPreview = document.getElementById('hero-img-preview');

if (heroImgTrigger) heroImgTrigger.addEventListener('click', () => heroImgInput.click());
if (heroImgInput) {
  heroImgInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      heroTempImg = await fileToBase64(file);
      heroImgPreview.src = heroTempImg;
      heroImgPreview.style.display = 'block';
    }
    heroImgInput.value = '';
  });
}

const saveHeroBannerBtn = document.getElementById('save-hero-banner');
if (saveHeroBannerBtn) {
  saveHeroBannerBtn.addEventListener('click', async () => {
    const heroBanner = {
      title: document.getElementById('admin-hero-title').value,
      description: document.getElementById('admin-hero-desc').value,
      btn1_text: document.getElementById('admin-hero-btn1-text').value,
      btn1_link: document.getElementById('admin-hero-btn1-link').value,
      btn2_text: document.getElementById('admin-hero-btn2-text').value,
      btn2_link: document.getElementById('admin-hero-btn2-link').value,
      image: heroTempImg || document.querySelector('#hero-banner-image img')?.src || ''
    };
    
    await apiPost('hero-banner', { heroBanner });
    applyHeroBannerToSite(heroBanner);
    showToast('Hero banner saved!');
  });
}

/* ============================================
   SOCIAL MEDIA ICONS
   ============================================ */
const socialIcons = {
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
  custom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
};

function renderSocialIcons(socialLinks) {
  const container = document.getElementById('footer-social');
  if (!container) return;
  
  container.innerHTML = '';
  container.className = 'footer-social-icons';
  
  socialLinks.forEach(link => {
    const a = document.createElement('a');
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'social-icon-link';
    a.title = link.name;
    a.innerHTML = socialIcons[link.platform] || socialIcons.custom;
    container.appendChild(a);
  });
}

/* ============================================
   SOCIAL MEDIA ADMIN
   ============================================ */
let socialLinks = [];

async function initSocialMedia() {
  socialLinks = await apiGet('social') || [];
  renderAdminSocialList();
}

function renderAdminSocialList() {
  const list = document.getElementById('admin-social-list');
  if (!list) return;
  
  if (socialLinks.length === 0) {
    list.innerHTML = '<p class="admin-list-empty">No social links added yet.</p>';
    return;
  }
  
  list.innerHTML = socialLinks.map((link, idx) => `
    <div class="admin-list-item">
      <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        ${socialIcons[link.platform] || socialIcons.custom}
      </div>
      <div class="admin-list-item-info">
        <h4>${link.name}</h4>
        <p>${link.url}</p>
      </div>
      <div class="admin-list-item-actions">
        <button class="admin-delete-btn" data-idx="${idx}">Delete</button>
      </div>
    </div>
  `).join('');
  
  list.querySelectorAll('.admin-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.idx);
      socialLinks.splice(idx, 1);
      await apiPost('social', { social: socialLinks });
      renderAdminSocialList();
      renderSocialIcons(socialLinks);
      showToast('Social link deleted');
    });
  });
}

// Social media form handlers
document.addEventListener('DOMContentLoaded', () => {
  const platformSelect = document.getElementById('social-platform');
  const customNameLabel = document.getElementById('custom-platform-label');
  const customNameInput = document.getElementById('social-custom-name');
  
  if (platformSelect) {
    platformSelect.addEventListener('change', () => {
      if (platformSelect.value === 'custom') {
        customNameLabel.style.display = 'block';
        customNameInput.style.display = 'block';
      } else {
        customNameLabel.style.display = 'none';
        customNameInput.style.display = 'none';
      }
    });
  }
  
  const addSocialBtn = document.getElementById('add-social-link');
  if (addSocialBtn) {
    addSocialBtn.addEventListener('click', async () => {
      const platform = document.getElementById('social-platform').value;
      const url = document.getElementById('social-url').value.trim();
      
      if (!url) {
        showToast('Please enter a URL');
        return;
      }
      
      let name = platform.charAt(0).toUpperCase() + platform.slice(1);
      if (platform === 'custom') {
        name = document.getElementById('social-custom-name').value.trim() || 'Custom';
      }
      
      socialLinks.push({ platform, name, url });
      await apiPost('social', { social: socialLinks });
      
      // Reset form
      document.getElementById('social-url').value = '';
      document.getElementById('social-custom-name').value = '';
      
      renderAdminSocialList();
      renderSocialIcons(socialLinks);
      showToast('Social link added!');
    });
  }
});

/* ============================================
   LOAD ADMIN DATA
   ============================================ */
async function loadAdminData() {
  const [contactData, footerData, heroBannerData] = await Promise.all([
    apiGet('contact'),
    apiGet('footer'),
    apiGet('hero-banner')
  ]);

  if (contactData) {
    document.getElementById('admin-contact-heading').value = contactData.heading || '';
    document.getElementById('admin-contact-desc').value = contactData.description || '';
    document.getElementById('admin-contact-email').value = contactData.email || '';
    document.getElementById('admin-contact-phone').value = contactData.phone || '';
    document.getElementById('admin-contact-address').value = contactData.address || '';
  }
  if (footerData) {
    document.getElementById('admin-footer-col1-title').value = footerData.col1Title || '';
    document.getElementById('admin-footer-col1-desc').value = footerData.col1Desc || '';
    document.getElementById('admin-footer-email').value = footerData.email || '';
    document.getElementById('admin-footer-phone').value = footerData.phone || '';
    document.getElementById('admin-footer-copyright').value = footerData.copyright || '';
  }
  if (heroBannerData) {
    document.getElementById('admin-hero-title').value = heroBannerData.title || '';
    document.getElementById('admin-hero-desc').value = heroBannerData.description || '';
    document.getElementById('admin-hero-btn1-text').value = heroBannerData.btn1_text || '';
    document.getElementById('admin-hero-btn1-link').value = heroBannerData.btn1_link || '';
    document.getElementById('admin-hero-btn2-text').value = heroBannerData.btn2_text || '';
    document.getElementById('admin-hero-btn2-link').value = heroBannerData.btn2_link || '';
    if (heroBannerData.image) {
      heroImgPreview.src = heroBannerData.image;
      heroImgPreview.style.display = 'block';
    }
  }
  
  // Load social media data
  await initSocialMedia();
}
