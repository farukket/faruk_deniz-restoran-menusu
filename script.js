/**
 * Deniz Restoran - QR Menu Controller (Vanilla JS)
 */

// UI Localization Dictionary
const UI_TRANSLATIONS = {
  tr: {
    greeting: "Çeşme'ye Hoş Geldiniz",
    subtitle: "Ege'nin En Taze Esintileri ve Eşsiz Deniz Lezzetleri",
    themeDay: "Güneşli Sahil",
    themeNight: "Mum Işığı",
    langTr: "TR",
    langEn: "EN",
    reserveBtn: "Rezervasyon",
    address: "Boyalık Mah. 3200. Sok. No: 12, Çeşme, İzmir",
    phone: "+90 (232) 712 00 00",
    loadingText: "Lezzet Denizi Hazırlanıyor...",
    errorText: "Menü yüklenirken bir hata oluştu. Lütfen tekrar deneyin.",
    currency: "₺",
    footerTitle: "Deniz Restoran",
    hours: "Her Gün 08:00 - 17:00"
  },
  en: {
    greeting: "Welcome to Çeşme",
    subtitle: "The Freshest Breezes and Unique Seafood of the Aegean",
    themeDay: "Sunny Beach",
    themeNight: "Candlelit Dinner",
    langTr: "TR",
    langEn: "EN",
    reserveBtn: "Reservation",
    address: "Boyalik District, 3200th St. No: 12, Cesme, Izmir",
    phone: "+90 (232) 712 00 00",
    loadingText: "Preparing Sea of Flavors...",
    errorText: "An error occurred while loading the menu. Please try again.",
    currency: "₺",
    footerTitle: "Deniz Restaurant",
    hours: "Open Daily 08:00 AM - 05:00 PM"
  }
};

// Global App State
const state = {
  language: localStorage.getItem('deniz_lang') || 'tr',
  theme: localStorage.getItem('deniz_theme') || 'light',
  menuData: null,
  isScrolling: false
};

// DOM References
const elements = {
  html: document.documentElement,
  themeToggleBtn: document.getElementById('theme-toggle'),
  themeLabel: document.getElementById('theme-label'),
  langToggleBtn: document.getElementById('lang-toggle'),
  langLabel: document.getElementById('lang-label'),
  heroGreeting: document.getElementById('hero-greeting'),
  heroSubtitle: document.getElementById('hero-subtitle'),
  categoryNav: document.getElementById('category-nav'),
  menuContainer: document.getElementById('menu-container'),
  footerAddress: document.getElementById('footer-address'),
  footerPhone: document.getElementById('footer-phone'),
  footerTitle: document.getElementById('footer-title'),
  footerHours: document.getElementById('footer-hours'),
  heroHours: document.getElementById('hero-hours')
};

// SVG Icon Helpers
const ICONS = {
  sun: `<svg viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37c-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.38.39-1.02 0-1.41zm-12.37 12.37c-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.38.39-1.02 0-1.41z"/></svg>`,
  moon: `<svg viewBox="0 0 24 24"><path d="M12.3 22c5.07 0 9.27-3.79 9.93-8.83-4.82.78-9.42-2.92-9.42-7.83 0-1.12.22-2.22.67-3.23C7.4 2.82 3 7.89 3 14c0 4.42 3.58 8 8 8h1.3z"/></svg>`,
  globe: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`
};

/**
 * Initialize Application
 */
async function init() {
  setupTheme();
  setupLanguageToggle();
  renderLoadingState();
  
  try {
    const response = await fetch('menu.json');
    if (!response.ok) throw new Error('Failed to fetch menu');
    state.menuData = await response.json();
    
    updateStaticUI();
    renderMenu();
    setupIntersectionObserver();
  } catch (error) {
    console.error('Menu Initialization Error:', error);
    renderErrorState();
  }
  
  setupEventListeners();
}

/**
 * Setup Light/Dark Theme
 */
function setupTheme() {
  elements.html.setAttribute('data-theme', state.theme);
  updateThemeUI();
}

function updateThemeUI() {
  const t = UI_TRANSLATIONS[state.language];
  if (state.theme === 'dark') {
    elements.themeToggleBtn.innerHTML = `${ICONS.sun}<span id="theme-label">${t.themeDay}</span>`;
  } else {
    elements.themeToggleBtn.innerHTML = `${ICONS.moon}<span id="theme-label">${t.themeNight}</span>`;
  }
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('deniz_theme', state.theme);
  elements.html.setAttribute('data-theme', state.theme);
  updateThemeUI();
}

/**
 * Setup Language Selection
 */
function setupLanguageToggle() {
  updateLanguageUI();
}

function updateLanguageUI() {
  const currentLangText = state.language === 'tr' ? 'EN' : 'TR';
  elements.langToggleBtn.innerHTML = `${ICONS.globe}<span id="lang-label">${currentLangText}</span>`;
}

function toggleLanguage() {
  state.language = state.language === 'tr' ? 'en' : 'tr';
  localStorage.setItem('deniz_lang', state.language);
  updateLanguageUI();
  updateThemeUI(); // Update theme toggle labels as well
  updateStaticUI();
  if (state.menuData) {
    renderMenu();
  }
}

/**
 * Update Static UI Text Components
 */
function updateStaticUI() {
  const t = UI_TRANSLATIONS[state.language];
  elements.heroGreeting.textContent = t.greeting;
  elements.heroSubtitle.textContent = t.subtitle;
  elements.footerAddress.innerHTML = `
    <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
    ${t.address}
  `;
  elements.footerPhone.innerHTML = `
    <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
    ${t.phone}
  `;
  elements.footerTitle.textContent = t.footerTitle;
  
  // Set Working Hours dynamically with icon
  const clockIcon = `<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`;
  elements.heroHours.innerHTML = `${clockIcon} ${t.hours}`;
  elements.footerHours.innerHTML = `${clockIcon} ${t.hours}`;
}

/**
 * Render Shimmer Skeleton Loader
 */
function renderLoadingState() {
  const t = UI_TRANSLATIONS[state.language];
  elements.menuContainer.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">${t.loadingText}</h2>
    </div>
    <div class="items-grid">
      ${Array(3).fill().map(() => `
        <div class="skeleton-card">
          <div class="shimmer"></div>
          <div class="skeleton-image"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text short"></div>
          <div class="skeleton-text paragraph"></div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Render Error Notification
 */
function renderErrorState() {
  const t = UI_TRANSLATIONS[state.language];
  elements.menuContainer.innerHTML = `
    <div class="section-header" style="padding: 4rem 1rem;">
      <svg style="width: 4rem; height: 4rem; fill: var(--accent-gold); margin-bottom: 1.5rem;" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <h2 class="section-title" style="font-size: 1.5rem;">${t.errorText}</h2>
    </div>
  `;
}

/**
 * Render Interactive Dynamic Menu Structure
 */
function renderMenu() {
  if (!state.menuData) return;

  const currentLang = state.language;
  const categories = state.menuData.categories;
  const items = state.menuData.items;

  // 1. Render Category Navigation Tabs
  elements.categoryNav.innerHTML = categories.map((cat, idx) => `
    <button class="category-tab ${idx === 0 ? 'active' : ''}" 
            data-target="${cat.id}"
            onclick="scrollToCategory('${cat.id}')">
      ${cat.name[currentLang]}
    </button>
  `).join('');

  // 2. Render Menu Sections & Food/Drink Cards
  elements.menuContainer.innerHTML = categories.map(cat => {
    const catItems = items.filter(item => item.categoryId === cat.id);
    
    return `
      <section id="${cat.id}" class="menu-section">
        <div class="section-header">
          <h2 class="section-title">${cat.name[currentLang]}</h2>
        </div>
        <div class="items-grid">
          ${catItems.map(item => renderMenuCard(item, currentLang)).join('')}
        </div>
      </section>
    `;
  }).join('');
}

/**
 * Render Individual Menu Item Card HTML
 */
function renderMenuCard(item, lang) {
  const name = item.name[lang];
  const description = item.description[lang];
  const price = item.price;
  const tags = item.tags[lang] || [];
  
  // Render tag pills
  const tagsHTML = tags.map(tag => {
    const isSpecial = tag.includes("Şef") || tag.includes("Chef") || tag.includes("Lüks") || tag.includes("Luxury") || tag.includes("Öneri") || tag.includes("Recommended");
    return `<span class="badge ${isSpecial ? 'chefs-choice' : ''}">${tag}</span>`;
  }).join('');

  return `
    <div class="menu-card" data-id="${item.id}">
      <div class="card-image-container">
        <div class="card-badges">${tagsHTML}</div>
        <img class="menu-item-img" 
             src="${item.image}" 
             alt="${name}" 
             loading="lazy">
      </div>
      <div class="card-content">
        <div class="card-header-row">
          <h3 class="item-name">${name}</h3>
          <span class="item-price">${price} ${UI_TRANSLATIONS[lang].currency}</span>
        </div>
        <p class="item-desc">${description}</p>
        <div class="card-footer">
          Deniz Restoran • Çeşme
        </div>
      </div>
    </div>
  `;
}

/**
 * Smooth Scroll to Target Category Section
 */
window.scrollToCategory = function(categoryId) {
  const section = document.getElementById(categoryId);
  if (!section) return;

  state.isScrolling = true;
  
  // Update navigation visual state immediately
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-target') === categoryId);
  });

  const scrollOffset = 78; // Sync with CSS scroll-margin-top
  const elementPosition = section.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - scrollOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });

  // Re-enable Intersection Observer updates after scrolling animation completes
  setTimeout(() => {
    state.isScrolling = false;
  }, 800);
};

/**
 * Setup Intersection Observer for Scroll Spy
 */
function setupIntersectionObserver() {
  const sections = document.querySelectorAll('.menu-section');
  const tabs = document.querySelectorAll('.category-tab');

  const options = {
    root: null,
    rootMargin: '-85px 0px -60% 0px', // Target trigger area
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    if (state.isScrolling) return; // Prevent scroll spy jump during click-to-scroll

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        // Highlight active tab
        tabs.forEach(tab => {
          const isTarget = tab.getAttribute('data-target') === id;
          tab.classList.toggle('active', isTarget);
          
          // Auto center category bar on mobile
          if (isTarget) {
            tab.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'center'
            });
          }
        });
      }
    });
  }, options);

  sections.forEach(section => observer.observe(section));
}

/**
 * Setup Click Event Listeners
 */
function setupEventListeners() {
  elements.themeToggleBtn.addEventListener('click', toggleTheme);
  elements.langToggleBtn.addEventListener('click', toggleLanguage);
}

// Start Initialization when DOM content has loaded
document.addEventListener('DOMContentLoaded', init);
