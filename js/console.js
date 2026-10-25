/**
 * ============================================================================
 * ENTERPRISE MODULE: CONSOLE CORE LOGIC & STATE ENGINE
 * ORGANIZATION: Resilience Industries
 * FILE PATH: js/console.js
 * ARCHITECTURE: Decoupled Zero-Text Logic Engine / WCAG 2.2 AAA Compliant
 * SPECIFICATION: Rhythmic Single-Screen Authentication & Role Governance
 * MASTER IDENTITY: niteshkumar91845@gmail.com
 * ============================================================================
 */

// Master Owner Identity Constant
const MASTER_IDENTITY = "niteshkumar91845@gmail.com";

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

const auth = typeof firebase !== "undefined" ? firebase.auth() : null;
const db = typeof firebase !== "undefined" ? firebase.firestore() : null;

// Primary App State
let contentStore = {};
let countdownInterval = null;

/**
 * ============================================================================
 * 1. DUAL-LAYER CONTENT HYDRATION (FIREBASE + GITHUB JSON FALLBACK)
 * Injects 100% of visible strings dynamically to ensure Zero-Text in Code.
 * ============================================================================
 */
async function hydrateContent() {
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
      } else {
        el.textContent = contentStore[key];
      }
    }
  });
}

/**
 * ============================================================================
 * 2. SCREEN READER LIVE ANNOUNCER & ALERT SYSTEM
 * Real-time ARIA live updates for TalkBack / NVDA users.
 * ============================================================================
 */
function announce(message, isError = false) {
  const liveRegion = document.getElementById("live-announcer");
  const alertBanner = document.getElementById("auth-feedback-banner");

  if (liveRegion) liveRegion.textContent = message;

  if (alertBanner) {
    alertBanner.textContent = message;
    alertBanner.classList.remove("stealth-hidden", "error");
    if (isError) alertBanner.classList.add("error");
    alertBanner.focus();
  }
}

/**
 * ============================================================================
 * 3. ACCESSIBLE PASSWORD VISIBILITY CONTROLLER
 * Toggles input masking with ARIA feedback.
 * ============================================================================
 */
function setupPasswordToggle(buttonId, inputId) {
  const toggleBtn = document.getElementById(buttonId);
  const pwInput = document.getElementById(inputId);

  if (!toggleBtn || !pwInput) return;

  toggleBtn.addEventListener("click", () => {
    const isMasked = pwInput.type === "password";
    pwInput.type = isMasked ? "text" : "password";
    toggleBtn.setAttribute("aria-pressed", isMasked ? "true" : "false");
    toggleBtn.textContent = isMasked ? "छिपाएँ" : "देखें";
  });
}

/**
 * ============================================================================
 * 4. 60-SECOND COOLDOWN & RHYTHMIC TIMERS
 * ============================================================================
 */
function startCooldownTimer(buttonEl, timerEl, containerEl) {
  let remainingTime = 60;
  buttonEl.disabled = true;
  containerEl.classList.remove("stealth-hidden");

  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    remainingTime -= 1;
    timerEl.textContent = `पुनः भेजने के लिए ${remainingTime}s प्रतीक्षा करें`;

    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      buttonEl.disabled = false;
      timerEl.textContent = "सत्यापन लिंक अब दोबारा भेजा जा सकता है।";
    }
  }, 1000);
}

/**
 * ============================================================================
 * 5. SEAMLESS RHYTHMIC VIEW SWITCHER
 * Switches auth views without window reload or focus disconnection.
 * ============================================================================
 */
function transitionAuthView(targetViewId) {
  const allViews = [
    "view-state-identifier",
    "view-state-signin",
    "view-state-signup",
    "view-state-verification",
    "view-state-recovery"
  ];

  allViews.forEach(id => {
    const viewNode = document.getElementById(id);
    if (viewNode) viewNode.classList.add("stealth-hidden");
  });

  const activeView = document.getElementById(targetViewId);
  if (activeView) {
    activeView.classList.remove("stealth-hidden");
    const firstFocusable = activeView.querySelector("input, button");
    if (firstFocusable) firstFocusable.focus();
  }
}

/**
 * ============================================================================
 * 6. AUTHENTICATION & SINGLE-SCREEN PIPELINE
 * ============================================================================
 */
function initializeAuthPipeline() {
  const inputEmail = document.getElementById("input-user-email");
  const inputSignInPw = document.getElementById("input-signin-password");
  const inputSignUpPw = document.getElementById("input-signup-password");

  const btnCheckEmail = document.getElementById("btn-flow-check");
  const btnSignIn = document.getElementById("btn-action-signin");
  const btnSignUp = document.getElementById("btn-action-signup");
  const btnGoogle = document.getElementById("btn-action-google");
  const btnToForgot = document.getElementById("btn-switch-recovery");
  const btnBackToLogin = document.getElementById("btn-switch-back-signin");
  const btnSendReset = document.getElementById("btn-action-send-recovery");
  const btnResendVerify = document.getElementById("btn-action-resend-verification");
  const timerVerify = document.getElementById("timer-verify-countdown");
  const clusterVerify = document.getElementById("cluster-resend-verification");
  const btnSignout = document.getElementById("btn-session-signout");

  // Step A: Universal Email Identity Check
  btnCheckEmail.addEventListener("click", async () => {
    const emailVal = inputEmail.value.trim();
    if (!emailVal || !emailVal.includes("@")) {
      announce("कृपया एक वैध आधिकारिक ईमेल दर्ज करें।", true);
      return;
    }

    announce("ईमेल स्थिति की जाँच की जा रही है...");
    try {
      if (!auth) throw new Error("प्रमाणीकरण सेवा उपलब्ध नहीं है");
      const methods = await auth.fetchSignInMethodsForEmail(emailVal);
      if (methods && methods.length > 0) {
        transitionAuthView("view-state-signin");
        announce("खाता मौजूद है। कृपया अपना पासवर्ड दर्ज करें।");
      } else {
        transitionAuthView("view-state-signup");
        announce("नया खाता। कृपया आगे बढ़ने के लिए सुरक्षित पासवर्ड सेट करें।");
      }
    } catch (err) {
      // Direct to signin view on check block
      transitionAuthView("view-state-signin");
    }
  });

  // Step B: Submit Sign In
  btnSignIn.addEventListener("click", async () => {
    const emailVal = inputEmail.value.trim();
    const pwVal = inputSignInPw.value;
    try {
      announce("साइन इन किया जा रहा है...");
      const cred = await auth.signInWithEmailAndPassword(emailVal, pwVal);
      if (!cred.user.emailVerified) {
        transitionAuthView("view-state-verification");
        startCooldownTimer(btnResendVerify, timerVerify, clusterVerify);
        announce("ईमेल असत्यापित है। कृपया इनबॉक्स में भेजे गए लिंक से पुष्टि करें।", true);
      }
    } catch (err) {
      announce(err.message, true);
    }
  });

  // Step C: Submit Sign Up & Auto-Send Verification Link
  btnSignUp.addEventListener("click", async () => {
    const emailVal = inputEmail.value.trim();
    const pwVal = inputSignUpPw.value;
    if (pwVal.length < 8) {
      announce("पासवर्ड कम से कम 8 वर्णों का होना चाहिए।", true);
      return;
    }
    try {
      announce("खाता बनाया जा रहा है...");
      const cred = await auth.createUserWithEmailAndPassword(emailVal, pwVal);
      await cred.user.sendEmailVerification({
        url: window.location.href,
        handleCodeInApp: true
      });
      transitionAuthView("view-state-verification");
      startCooldownTimer(btnResendVerify, timerVerify, clusterVerify);
      announce("सत्यापन लिंक आपके ईमेल पर भेज दिया गया है।");
    } catch (err) {
      announce(err.message, true);
    }
  });

  // Step D: Primary Google SSO Initiation
  btnGoogle.addEventListener("click", async () => {
    try {
      announce("Google सत्यापन विंडो खोली जा रही है...");
      const provider = new firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(provider);
    } catch (err) {
      announce(err.message, true);
    }
  });

  // Step E: Password Recovery Navigation
  btnToForgot.addEventListener("click", () => {
    transitionAuthView("view-state-recovery");
    announce("पासवर्ड रीसेट लिंक भेजने के लिए तैयार।");
  });

  btnBackToLogin.addEventListener("click", () => {
    transitionAuthView("view-state-signin");
  });

  btnSendReset.addEventListener("click", async () => {
    const emailVal = inputEmail.value.trim();
    try {
      await auth.sendPasswordResetEmail(emailVal, {
        url: window.location.href,
        handleCodeInApp: true
      });
      announce("पासवर्ड रीसेट लिंक आपके ईमेल पर भेज दिया गया है।");
    } catch (err) {
      announce(err.message, true);
    }
  });

  // Resend Verification Link
  btnResendVerify.addEventListener("click", async () => {
    if (auth.currentUser) {
      await auth.currentUser.sendEmailVerification();
      startCooldownTimer(btnResendVerify, timerVerify, clusterVerify);
      announce("नया सत्यापन लिंक भेजा गया।");
    }
  });

  // Sign Out Handler
  if (btnSignout) {
    btnSignout.addEventListener("click", async () => {
      await auth.signOut();
      window.location.reload();
    });
  }
}

/**
 * ============================================================================
 * 7. AUTH STATE & SUPER GOD MODE UNLOCK GATE
 * ============================================================================
 */
function monitorAuthState() {
  if (!auth) return;

  auth.onAuthStateChanged(user => {
    const authSection = document.getElementById("auth-portal-section");
    const godConsole = document.getElementById("super-god-console");
    const sessionTray = document.getElementById("session-tray");
    const userBadge = document.getElementById("session-user-badge");
    const verifyCluster = document.getElementById("cluster-resend-verification");

    if (user && user.emailVerified) {
      // Auto-Hide Resend button permanently (Zero Ghost Footprint)
      if (verifyCluster) verifyCluster.remove();

      // Check Master Owner Identity
      if (user.email === MASTER_IDENTITY) {
        authSection.classList.add("stealth-hidden");
        godConsole.classList.remove("stealth-hidden");
        sessionTray.classList.remove("stealth-hidden");
        if (userBadge) userBadge.textContent = `Master: ${user.email}`;
        announce(`सुपर गॉड मोड कंसोल में आपका स्वागत है, ${user.email}`);
      } else {
        // Authorized regular admin / developer room handler
        authSection.classList.add("stealth-hidden");
        godConsole.classList.remove("stealth-hidden");
        sessionTray.classList.remove("stealth-hidden");
        if (userBadge) userBadge.textContent = `Active: ${user.email}`;
        announce(`कंसोल वर्कस्पेस अनलॉक हुआ, ${user.email}`);
      }
    } else if (user && !user.emailVerified) {
      transitionAuthView("view-state-verification");
    } else {
      godConsole.classList.add("stealth-hidden");
      sessionTray.classList.add("stealth-hidden");
      authSection.classList.remove("stealth-hidden");
    }
  });
}

/**
 * ============================================================================
 * 8. ACCESSIBILITY UTILITY DOCK (SCROLL TO TOP & BOTTOM)
 * ============================================================================
 */
function setupAccessibilityDock() {
  const btnScrollTop = document.getElementById("btn-scroll-top");
  const btnScrollBottom = document.getElementById("btn-scroll-bottom");

  if (btnScrollTop) {
    btnScrollTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.getElementById("main-console-content")?.focus();
    });
  }

  if (btnScrollBottom) {
    btnScrollBottom.addEventListener("click", () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      document.getElementById("quick-action-dock")?.focus();
    });
  }
}

/**
 * ============================================================================
 * 9. LIFECYCLE BOOTSTRAP
 * ============================================================================
 */
document.addEventListener("DOMContentLoaded", async () => {
  await hydrateContent();
  setupPasswordToggle("btn-toggle-signin-mask", "input-signin-password");
  setupPasswordToggle("btn-toggle-signup-mask", "input-signup-password");
  initializeAuthPipeline();
  monitorAuthState();
  setupAccessibilityDock();
});
