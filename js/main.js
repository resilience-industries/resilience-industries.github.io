/**
 * ============================================================================
 * ENTERPRISE MODULE: GLOBAL CLIENT ENGINE & CONTENT HYDRATOR
 * ORGANIZATION: Resilience Industries
 * FILE PATH: js/main.js
 * ARCHITECTURE: Decoupled Zero-Text Logic Engine / WCAG 2.2 AAA Compliant
 * SPECIFICATION: Dual-Layer Dynamic Content Binding (Firestore + Local JSON)
 * MASTER IDENTITY: niteshkumar91845@gmail.com
 * ============================================================================
 */

// Firebase Infrastructure Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDummyKey-ForTemplateSetup",
  authDomain: "resilience-industries.firebaseapp.com",
  projectId: "resilience-industries",
  storageBucket: "resilience-industries.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:000000000000"
};

// Initialize Firebase SDK Safely
if (typeof firebase !== "undefined" && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = typeof firebase !== "undefined" ? firebase.firestore() : null;

// Global Content Repository
let contentStore = {};

/**
 * ============================================================================
 * 1. DUAL-LAYER CONTENT HYDRATION (FIREBASE + GITHUB JSON FALLBACK)
 * Injects 100% of visible strings dynamically to ensure Zero-Text in Code.
 * ============================================================================
 */
async function hydrateGlobalContent() {
  try {
    // Primary: Attempt Firebase Cloud Firestore Fetch
    if (db) {
      const docSnap = await db.collection("system_config").doc("content_store").get();
      if (docSnap.exists) {
        contentStore = docSnap.data();
      } else {
        throw new Error("Firestore doc not initialized, shifting to fallback");
      }
    } else {
      throw new Error("Database offline, shifting to fallback");
    }
  } catch (error) {
    // Secondary Fallback: Load directly from GitHub data/content.json
    try {
      const fallbackResponse = await fetch("data/content.json");
      contentStore = await fallbackResponse.json();
    } catch (fallbackError) {
      console.error("Critical: Failed to hydrate application content.", fallbackError);
      return;
    }
  }

  // Inject content into all mapped data-content-key slots
  document.querySelectorAll("[data-content-key]").forEach(el => {
    const key = el.getAttribute("data-content-key");
    if (contentStore[key]) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.setAttribute("placeholder", contentStore[key]);
      } else if (el.tagName === "TITLE") {
        document.title = contentStore[key];
      } else if (el.tagName === "META" && el.getAttribute("name") === "description") {
        el.setAttribute("content", contentStore[key]);
      } else {
        el.textContent = contentStore[key];
      }
    }
  });

  // Announce successful hydration to Screen Readers
  announceToScreenReader("पृष्ठ सामग्री सफलतापूर्वक लोड हो गई है।");
}

/**
 * ============================================================================
 * 2. SCREEN READER LIVE ANNOUNCER
 * Updates TalkBack & NVDA with auditory status feedback.
 * ============================================================================
 */
function announceToScreenReader(message) {
  const liveRegion = document.getElementById("live-announcer");
  if (liveRegion) {
    liveRegion.textContent = message;
  }
}

/**
 * ============================================================================
 * 3. ACCESSIBLE SCROLL DOCK CONTROLLERS (TOP & BOTTOM)
 * ============================================================================
 */
function setupScrollControllers() {
  const btnScrollTop = document.getElementById("btn-scroll-top");
  const btnScrollBottom = document.getElementById("btn-scroll-bottom");

  if (btnScrollTop) {
    btnScrollTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const mainContent = document.getElementById("main-home-content");
      if (mainContent) mainContent.focus();
    });
  }

  if (btnScrollBottom) {
    btnScrollBottom.addEventListener("click", () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      const footerDock = document.getElementById("quick-action-dock");
      if (footerDock) footerDock.focus();
    });
  }
}

/**
 * ============================================================================
 * 4. LIFECYCLE INITIALIZER
 * ============================================================================
 */
document.addEventListener("DOMContentLoaded", async () => {
  await hydrateGlobalContent();
  setupScrollControllers();
});
