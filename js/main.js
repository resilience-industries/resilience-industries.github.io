/**
 * ==============================================================================
 * ENTERPRISE PLATFORM: RESILIENCE INDUSTRIES
 * CORE LOGIC ENGINE (js/main.js)
 * ARCHITECTURE: Decoupled Headless Hydration / Strict 0% Inline Logic
 * ACCESSIBILITY: WCAG 2.2 AAA / Screen Reader Live Announcer / Arrow Navigation
 * MASTER OWNER: Nitesh Kumar (niteshkumar91845@gmail.com)
 * ==============================================================================
 */

// Global Search Index Directory across all corporate endpoints
const SEARCH_DIRECTORY = [
  { title: "Corporate Homepage", desc: "Digital accessibility engineering, A11yOmni overview, and compliance pillars.", url: "index.html", keywords: "home main resilience industries overview" },
  { title: "About Us & Corporate Ethos", desc: "Our mission, three architectural principles, and leadership credentials.", url: "about.html", keywords: "about mission ethos team founder nitesh kumar" },
  { title: "Founder's Living Chronicle", desc: "The inspiring journey of Nitesh Kumar from screen reader barriers to global architect.", url: "story.html", keywords: "story journey founder chronicle background inspiration" },
  { title: "Commercial Services Suite", desc: "WCAG 2.2 AAA digital audits, VPAT authoring, and native assistive user testing.", url: "services.html", keywords: "services audits consulting vpat testing remediation price" },
  { title: "A11yOmni Autonomous SaaS", desc: "Continuous DOM scanner, client-side auto-healer, and compliance telemetry hub.", url: "solutions.html", keywords: "solutions a11yomni saas engine automation real-time dom healer" },
  { title: "Accessibility Auditing Protocol", desc: "Scientific four-phase auditing methodology and multi-platform assistive testing matrix.", url: "accessible-audits.html", keywords: "auditing protocol methodology testing nvda talkback jaws matrix" },
  { title: "VPAT 2.5 & Section 508 Reports", desc: "Official ACR authoring across 508, WCAG, EU EN 301 549, and INT editions.", url: "vpat-acar.html", keywords: "vpat 508 acr section federal government compliance procurement" },
  { title: "Research & Engineering Blog", desc: "In-depth technical papers on WCAG 2.2 criteria, ARIA patterns, and headless systems.", url: "blog.html", keywords: "blog research insights articles papers technical tutorials" },
  { title: "Frequently Asked Questions", desc: "Answers regarding audit timelines, legal defense, pricing, and mobile evaluations.", url: "faq.html", keywords: "faq questions answers help support inquiry timeline" },
  { title: "Formal Accessibility Statement", desc: "Our binding corporate commitment to WCAG 2.2 Level AAA universal accessibility.", url: "accessibility-statement.html", keywords: "accessibility statement commitment conformance aaa standards" },
  { title: "Accessible HTML Sitemap", desc: "Hierarchical, screen reader-friendly index of all corporate endpoints.", url: "sitemap.html", keywords: "sitemap directory index links navigation structure" },
  { title: "Terms of Service", desc: "Commercial contractual provisions, A11yOmni software licenses, and legal venue.", url: "terms.html", keywords: "terms conditions service agreement license contract legal" },
  { title: "Privacy Policy", desc: "Zero-surveillance data protection standards, telemetry boundaries, and DPDP/GDPR rights.", url: "privacy.html", keywords: "privacy data protection gdpr dpdp policy telemetry security" },
  { title: "Refund & Cancellation Policy", desc: "Transparent commercial policies governing audit retainers and SaaS subscriptions.", url: "refund-policy.html", keywords: "refund cancellation billing dispute invoice razorpay money" },
  { title: "Enterprise Contact Desk", desc: "Official corporate email, direct hotlines, and enterprise audit proposal inquiry form.", url: "contact.html", keywords: "contact email phone hotline inquiry demo quote reach" }
];

document.addEventListener("DOMContentLoaded", () => {
  initContentHydration();
  initAccessibleNavigation();
  initUniversalSearch();
  initHiddenConsoleShortcut();
  initUtilityScrollButtons();
});

/**
 * 1. HYDRATES ALL DOM ELEMENTS FROM data/content.json
 */
async function initContentHydration() {
  try {
    const response = await fetch("data/content.json");
    if (!response.ok) throw new Error("Content payload failed to load");
    const content = await response.json();

    // Hydrate standard elements by data-content-key
    document.querySelectorAll("[data-content-key]").forEach(el => {
      const key = el.getAttribute("data-content-key");
      if (content[key]) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.setAttribute("placeholder", content[key]);
        } else if (el.tagName === "META") {
          el.setAttribute("content", content[key]);
        } else {
          el.textContent = content[key];
        }
      }
    });

    // Hydrate page title if present
    const pageTitle = document.getElementById("page-title");
    if (pageTitle && pageTitle.hasAttribute("data-content-key")) {
      const titleKey = pageTitle.getAttribute("data-content-key");
      if (content[titleKey]) {
        document.title = content[titleKey];
      }
    }
  } catch (err) {
    console.warn("Hydration notice:", err.message);
  }
}

/**
 * 2. ACCESSIBLE NAVIGATION DRAWER (EXPAND / COLLAPSE / ARROW KEYS)
 */
function initAccessibleNavigation() {
  const menuToggle = document.getElementById("btn-toggle-menu");
  const navDrawer = document.getElementById("main-navigation");
  const closeBtn = document.getElementById("btn-close-menu");
  const menuIcon = document.getElementById("menu-icon-indicator");
  const menuText = document.getElementById("menu-text-indicator");

  if (!menuToggle || !navDrawer) return;

  function openMenu() {
    navDrawer.removeAttribute("hidden");
    menuToggle.setAttribute("aria-expanded", "true");
    if (menuIcon) menuIcon.textContent = "✕";
    if (menuText) menuText.textContent = "Close";
    announceMessage("Navigation menu expanded");

    const firstLink = navDrawer.querySelector("a");
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    navDrawer.setAttribute("hidden", "");
    menuToggle.setAttribute("aria-expanded", "false");
    if (menuIcon) menuIcon.textContent = "☰";
    if (menuText) menuText.textContent = "Menu";
    announceMessage("Navigation menu closed");
    menuToggle.focus();
  }

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }

  // Escape key closes menu
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
    }
  });

  // Up/Down Arrow Key Navigation inside Menu
  navDrawer.addEventListener("keydown", (e) => {
    const navLinks = Array.from(navDrawer.querySelectorAll("a.nav-link"));
    const currentIndex = navLinks.indexOf(document.activeElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % navLinks.length;
      navLinks[nextIndex].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + navLinks.length) % navLinks.length;
      navLinks[prevIndex].focus();
    }
  });
}

/**
 * 3. UNIVERSAL SEARCH ENGINE (EXPAND / COLLAPSE / REAL-TIME FILTERING)
 */
function initUniversalSearch() {
  const searchToggle = document.getElementById("btn-toggle-search");
  const searchDrawer = document.getElementById("universal-search-drawer");
  const searchClose = document.getElementById("btn-close-search");
  const searchInput = document.getElementById("site-search-input");
  const resultsBox = document.getElementById("search-results-box");
  const submitBtn = document.getElementById("btn-execute-search");

  if (!searchToggle || !searchDrawer || !searchInput || !resultsBox) return;

  function openSearch() {
    searchDrawer.removeAttribute("hidden");
    searchToggle.setAttribute("aria-expanded", "true");
    announceMessage("Universal search drawer expanded");
    searchInput.focus();
  }

  function closeSearch() {
    searchDrawer.setAttribute("hidden", "");
    searchToggle.setAttribute("aria-expanded", "false");
    searchInput.value = "";
    resultsBox.innerHTML = "";
    announceMessage("Search drawer closed");
    searchToggle.focus();
  }

  searchToggle.addEventListener("click", () => {
    const isExpanded = searchToggle.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeSearch();
    } else {
      openSearch();
    }
  });

  if (searchClose) {
    searchClose.addEventListener("click", closeSearch);
  }

  // Escape closes search drawer
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchToggle.getAttribute("aria-expanded") === "true") {
      closeSearch();
    }
  });

  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    resultsBox.innerHTML = "";

    if (!query) {
      announceMessage("Search input cleared");
      return;
    }

    const matches = SEARCH_DIRECTORY.filter(item => {
      return item.title.toLowerCase().includes(query) ||
             item.desc.toLowerCase().includes(query) ||
             item.keywords.toLowerCase().includes(query);
    });

    if (matches.length === 0) {
      resultsBox.innerHTML = `<p class="search-result-desc" style="padding: 0.75rem;">No matching endpoints found for "${query}".</p>`;
      announceMessage(`No results found for ${query}`);
      return;
    }

    matches.forEach(item => {
      const link = document.createElement("a");
      link.className = "search-result-item";
      link.href = item.url;
      link.innerHTML = `
        <span class="search-result-title">${item.title}</span>
        <span class="search-result-desc">${item.desc}</span>
      `;
      resultsBox.appendChild(link);
    });

    announceMessage(`${matches.length} search results found`);
  }

  searchInput.addEventListener("input", performSearch);

  if (submitBtn) {
    submitBtn.addEventListener("click", performSearch);
  }

  // Arrow key navigation through search results
  resultsBox.addEventListener("keydown", (e) => {
    const items = Array.from(resultsBox.querySelectorAll("a.search-result-item"));
    const currentIndex = items.indexOf(document.activeElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % items.length;
      items[nextIndex].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (currentIndex === 0) {
        searchInput.focus();
      } else {
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        items[prevIndex].focus();
      }
    }
  });

  // Focus from input into results using ArrowDown
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      const firstItem = resultsBox.querySelector("a.search-result-item");
      if (firstItem) {
        e.preventDefault();
        firstItem.focus();
      }
    }
  });
}

/**
 * 4. HIDDEN & PRIVATE CONSOLE TRIGGER (Alt + Shift + C OR CLEAN URL)
 */
function initHiddenConsoleShortcut() {
  document.addEventListener("keydown", (e) => {
    // Secret shortcut: Alt + Shift + C
    if (e.altKey && e.shiftKey && (e.key === "C" || e.key === "c")) {
      e.preventDefault();
      announceMessage("Redirecting to authorized administration console");
      window.location.href = "console";
    }
  });

  // Mobile Easter-Egg: 5 consecutive taps on copyright triggers console
  const copyright = document.getElementById("copyright-text-slot");
  if (copyright) {
    let tapCount = 0;
    let tapTimer = null;

    copyright.addEventListener("click", () => {
      tapCount++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { tapCount = 0; }, 1500);

      if (tapCount >= 5) {
        tapCount = 0;
        announceMessage("Redirecting to authorized administration console");
        window.location.href = "console";
      }
    });
  }
}

/**
 * 5. UTILITY SCROLL BUTTONS
 */
function initUtilityScrollButtons() {
  const btnTop = document.getElementById("btn-scroll-top");
  const btnBottom = document.getElementById("btn-scroll-bottom");

  if (btnTop) {
    btnTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      announceMessage("Scrolled to top of page");
    });
  }

  if (btnBottom) {
    btnBottom.addEventListener("click", () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      announceMessage("Scrolled to bottom of page");
    });
  }
}

/**
 * 6. ACCESSIBLE LIVE ANNOUNCER
 */
function announceMessage(msg) {
  const announcer = document.getElementById("live-announcer");
  if (announcer) {
    announcer.textContent = "";
    setTimeout(() => {
      announcer.textContent = msg;
    }, 50);
  }
}
