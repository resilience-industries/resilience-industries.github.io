/**
 * ==============================================================================
 * ENTERPRISE PLATFORM: RESILIENCE INDUSTRIES
 * CORE LOGIC ENGINE (js/main.js)
 * SPECIFICATION: Full Keyboard & Click Interactivity / Secret 3-Tap Console
 * ==============================================================================
 */

// Global Search Directory Index across all corporate endpoints
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

// Execute immediately when DOM is ready
function onReady() {
  announceVoice("Resilience Industries official portal loaded successfully.");

  initNavigationPanel();
  initSearchPanel();
  initA11yPreferencesSuite();
  initAuthModal();
  initScrollUtilities();
  initSecretThreeTapConsole();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", onReady);
} else {
  onReady();
}

/**
 * 1. STRICT WAI-ARIA 1.2 LIVE VOICE ANNOUNCER (ENGLISH ONLY)
 */
function announceVoice(message) {
  const announcer = document.getElementById("live-announcer");
  if (announcer) {
    announcer.textContent = "";
    setTimeout(() => {
      announcer.textContent = message;
    }, 60);
  }
}

/**
 * 2. PRIMARY NAVIGATION DIRECTORY
 */
function initNavigationPanel() {
  const toggleBtn = document.getElementById("btn-toggle-menu");
  const panel = document.getElementById("main-navigation");
  const closeBtn = document.getElementById("btn-close-menu");
  const cancelBtn = document.getElementById("btn-cancel-menu");
  const menuIcon = document.getElementById("menu-icon-indicator");
  const menuText = document.getElementById("menu-text-indicator");

  if (!toggleBtn || !panel) return;

  function openMenu() {
    closeAllPanelsExcept(panel);
    panel.removeAttribute("hidden");
    toggleBtn.setAttribute("aria-expanded", "true");
    if (menuIcon) menuIcon.textContent = "✕";
    if (menuText) menuText.textContent = "Close";
    announceVoice("Corporate navigation directory expanded.");
    const firstLink = panel.querySelector("a");
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    panel.setAttribute("hidden", "");
    toggleBtn.setAttribute("aria-expanded", "false");
    if (menuIcon) menuIcon.textContent = "☰";
    if (menuText) menuText.textContent = "Menu";
    announceVoice("Corporate navigation directory collapsed.");
    toggleBtn.focus();
  }

  toggleBtn.onclick = () => {
    const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
    if (isExpanded) closeMenu(); else openMenu();
  };

  if (closeBtn) closeBtn.onclick = closeMenu;
  if (cancelBtn) cancelBtn.onclick = closeMenu;

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && toggleBtn.getAttribute("aria-expanded") === "true") {
      closeMenu();
    }
  });

  // Arrow key navigation inside menu
  panel.addEventListener("keydown", (e) => {
    const links = Array.from(panel.querySelectorAll("a.nav-link"));
    const idx = links.indexOf(document.activeElement);
    if (e.key === "ArrowDown" && idx !== -1) {
      e.preventDefault();
      links[(idx + 1) % links.length].focus();
    } else if (e.key === "ArrowUp" && idx !== -1) {
      e.preventDefault();
      links[(idx - 1 + links.length) % links.length].focus();
    }
  });
}

/**
 * 3. UNIVERSAL SEARCH ENGINE
 */
function initSearchPanel() {
  const toggleBtn = document.getElementById("btn-toggle-search");
  const panel = document.getElementById("universal-search-drawer");
  const closeBtn = document.getElementById("btn-close-search");
  const cancelBtn = document.getElementById("btn-cancel-search");
  const searchInput = document.getElementById("site-search-input");
  const resultsBox = document.getElementById("search-results-box");
  const execBtn = document.getElementById("btn-execute-search");

  if (!toggleBtn || !panel || !searchInput) return;

  function openSearch() {
    closeAllPanelsExcept(panel);
    panel.removeAttribute("hidden");
    toggleBtn.setAttribute("aria-expanded", "true");
    announceVoice("Universal search engine expanded.");
    searchInput.focus();
  }

  function closeSearch() {
    panel.setAttribute("hidden", "");
    toggleBtn.setAttribute("aria-expanded", "false");
    searchInput.value = "";
    if (resultsBox) resultsBox.innerHTML = "";
    announceVoice("Universal search engine collapsed.");
    toggleBtn.focus();
  }

  toggleBtn.onclick = () => {
    const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
    if (isExpanded) closeSearch(); else openSearch();
  };

  if (closeBtn) closeBtn.onclick = closeSearch;
  if (cancelBtn) cancelBtn.onclick = closeSearch;

  function executeSearchQuery() {
    const query = searchInput.value.trim().toLowerCase();
    if (!resultsBox) return;
    resultsBox.innerHTML = "";

    if (!query) {
      announceVoice("Search input cleared.");
      return;
    }

    const matches = SEARCH_DIRECTORY.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.desc.toLowerCase().includes(query) ||
      item.keywords.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
      resultsBox.innerHTML = `<p class="search-result-desc" style="padding: 0.75rem;">No matching endpoints found for "${query}".</p>`;
      announceVoice(`Zero results found for ${query}.`);
      return;
    }

    matches.forEach(item => {
      const a = document.createElement("a");
      a.className = "search-result-item";
      a.href = item.url;
      a.innerHTML = `
        <span class="search-result-title">${item.title}</span>
        <span class="search-result-desc">${item.desc}</span>
      `;
      resultsBox.appendChild(a);
    });

    announceVoice(`${matches.length} search results found.`);
  }

  searchInput.addEventListener("input", executeSearchQuery);
  if (execBtn) execBtn.onclick = executeSearchQuery;

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && toggleBtn.getAttribute("aria-expanded") === "true") {
      closeSearch();
    }
  });
}

/**
 * 4. MULTI-DISABILITY ACCESSIBILITY PREFERENCES SUITE
 */
function initA11yPreferencesSuite() {
  const toggleBtn = document.getElementById("btn-toggle-a11y");
  const panel = document.getElementById("a11y-preferences-panel");
  const closeBtn = document.getElementById("btn-close-a11y");
  const cancelBtn = document.getElementById("btn-cancel-a11y");
  const resetBtn = document.getElementById("btn-reset-a11y");

  if (!toggleBtn || !panel) return;

  function openA11y() {
    closeAllPanelsExcept(panel);
    panel.removeAttribute("hidden");
    toggleBtn.setAttribute("aria-expanded", "true");
    announceVoice("Accessibility customization suite expanded.");
  }

  function closeA11y() {
    panel.setAttribute("hidden", "");
    toggleBtn.setAttribute("aria-expanded", "false");
    announceVoice("Accessibility customization suite collapsed.");
    toggleBtn.focus();
  }

  toggleBtn.onclick = () => {
    const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
    if (isExpanded) closeA11y(); else openA11y();
  };

  if (closeBtn) closeBtn.onclick = closeA11y;
  if (cancelBtn) cancelBtn.onclick = closeA11y;

  // Font Scaling
  const btnFontDef = document.getElementById("btn-font-standard");
  const btnFontLg = document.getElementById("btn-font-large");
  const btnFontXl = document.getElementById("btn-font-xlarge");

  if (btnFontDef) btnFontDef.onclick = () => {
    document.documentElement.style.fontSize = "100%";
    announceVoice("Text sizing restored to default standard.");
  };
  if (btnFontLg) btnFontLg.onclick = () => {
    document.documentElement.style.fontSize = "125%";
    announceVoice("Text sizing increased to 125 percent.");
  };
  if (btnFontXl) btnFontXl.onclick = () => {
    document.documentElement.style.fontSize = "150%";
    announceVoice("Text sizing increased to 150 percent.");
  };

  // High Contrast Mode
  const btnContrast = document.getElementById("btn-toggle-contrast");
  if (btnContrast) btnContrast.onclick = () => {
    document.body.classList.toggle("high-contrast-active");
    announceVoice("WCAG AAA high contrast color mode toggled.");
  };

  // Monochrome Mode
  const btnMono = document.getElementById("btn-toggle-monochrome");
  if (btnMono) btnMono.onclick = () => {
    document.body.classList.toggle("monochrome-active");
    announceVoice("Monochrome grayscale display mode toggled.");
  };

  // Dyslexia Font
  const btnDyslexic = document.getElementById("btn-toggle-dyslexic");
  if (btnDyslexic) btnDyslexic.onclick = () => {
    document.body.classList.toggle("dyslexic-font-active");
    announceVoice("Dyslexia-friendly reading typeface toggled.");
  };

  // Text Spacing
  const btnSpacing = document.getElementById("btn-toggle-spacing");
  if (btnSpacing) btnSpacing.onclick = () => {
    document.body.classList.toggle("text-spacing-active");
    announceVoice("Enhanced line height and letter spacing toggled.");
  };

  // Sensory Motion Pause
  const btnMotion = document.getElementById("btn-toggle-motion");
  if (btnMotion) btnMotion.onclick = () => {
    document.body.classList.toggle("reduced-motion-active");
    announceVoice("Sensory animations and smooth scrolling toggled.");
  };

  // Reset to Defaults
  if (resetBtn) {
    resetBtn.onclick = () => {
      document.documentElement.style.fontSize = "100%";
      document.body.className = "";
      announceVoice("All accessibility preferences restored to system defaults.");
    };
  }
}

/**
 * 5. AUTHENTICATION MODAL DIALOG
 */
function initAuthModal() {
  const openBtn = document.getElementById("btn-open-auth-modal");
  const overlay = document.getElementById("auth-modal-overlay");
  const closeBtn = document.getElementById("btn-close-auth-modal");
  const cancelBtn = document.getElementById("btn-cancel-auth");
  const googleBtn = document.getElementById("btn-auth-google");

  if (!openBtn || !overlay) return;

  function openAuth() {
    overlay.removeAttribute("hidden");
    openBtn.setAttribute("aria-expanded", "true");
    announceVoice("Account authentication portal opened.");
    const email = document.getElementById("auth-email-input");
    if (email) email.focus();
  }

  function closeAuth() {
    overlay.setAttribute("hidden", "");
    openBtn.setAttribute("aria-expanded", "false");
    announceVoice("Account authentication portal closed.");
    openBtn.focus();
  }

  openBtn.onclick = openAuth;
  if (closeBtn) closeBtn.onclick = closeAuth;
  if (cancelBtn) cancelBtn.onclick = closeAuth;

  overlay.onclick = (e) => {
    if (e.target === overlay) closeAuth();
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hasAttribute("hidden")) {
      closeAuth();
    }
  });

  if (googleBtn) {
    googleBtn.onclick = () => {
      announceVoice("Redirecting to Google Cloud authentication conduit.");
      if (window.firebase && firebase.auth) {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).catch(err => {
          announceVoice("Authentication cancelled: " + err.message);
        });
      }
    };
  }
}

/**
 * 6. HELPER TO CLOSE ALL PANELS
 */
function closeAllPanelsExcept(activePanel) {
  const panels = [
    { p: document.getElementById("main-navigation"), t: document.getElementById("btn-toggle-menu") },
    { p: document.getElementById("universal-search-drawer"), t: document.getElementById("btn-toggle-search") },
    { p: document.getElementById("a11y-preferences-panel"), t: document.getElementById("btn-toggle-a11y") }
  ];

  panels.forEach(({ p, t }) => {
    if (p && p !== activePanel) {
      p.setAttribute("hidden", "");
      if (t) {
        t.setAttribute("aria-expanded", "false");
        const icon = t.querySelector("#menu-icon-indicator");
        const text = t.querySelector("#menu-text-indicator");
        if (icon) icon.textContent = "☰";
        if (text) text.textContent = "Menu";
      }
    }
  });
}

/**
 * 7. SCROLL UTILITIES
 */
function initScrollUtilities() {
  const btnFinalTop = document.getElementById("btn-scroll-top-final");
  const btnHeaderBottom = document.getElementById("btn-header-go-bottom");

  if (btnFinalTop) {
    btnFinalTop.onclick = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      announceVoice("Navigated back to top of page.");
      const mainLink = document.getElementById("link-skip-main");
      if (mainLink) mainLink.focus();
    };
  }

  if (btnHeaderBottom) {
    btnHeaderBottom.onclick = () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      announceVoice("Navigated directly to bottom of page.");
      if (btnFinalTop) btnFinalTop.focus();
    };
  }
}

/**
 * 8. INVISIBLE SECRET 3-TAP CONSOLE TRIGGER
 */
function initSecretThreeTapConsole() {
  // Secret Shortcut: Alt + Shift + C
  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.shiftKey && (e.key === "C" || e.key === "c")) {
      e.preventDefault();
      announceVoice("Redirecting to authorized console interface.");
      window.location.href = "console";
    }
  });

  // Invisible 3-Tap on normal copyright text
  const copyrightSlot = document.getElementById("copyright-text-slot");
  if (copyrightSlot) {
    let tapCount = 0;
    let tapResetTimer = null;

    const registerTap = () => {
      tapCount++;
      clearTimeout(tapResetTimer);
      tapResetTimer = setTimeout(() => {
        tapCount = 0;
      }, 1500); // 1.5 seconds window for 3 consecutive taps

      if (tapCount >= 3) {
        tapCount = 0;
        announceVoice("Three taps verified. Accessing console.");
        window.location.href = "console";
      }
    };

    copyrightSlot.addEventListener("click", registerTap);
    copyrightSlot.addEventListener("touchend", registerTap);
  }
}
