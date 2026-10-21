

/* Resilience Industries - Full Audio Describer & Site Guide */
(function() {
  let synth = window.speechSynthesis;
  let currentUtterance = null;
  let isPaused = false;
  let isPlaying = false;
  let tourLang = "en"; // en, hi, hinglish
  let tourGender = "female"; // female, male
  let sections = [];
  let curSec = 0;
  let curItem = 0;
  let cachedVoices = [];

  // UI Feedback Sounds (Web Audio API Earcons)
  let sfxCtx = null;
  function playSFX(type) {
    try {
      if (!sfxCtx) sfxCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (sfxCtx.state === "suspended") sfxCtx.resume();
      let osc = sfxCtx.createOscillator();
      let gain = sfxCtx.createGain();
      osc.connect(gain);
      gain.connect(sfxCtx.destination);
      let now = sfxCtx.currentTime;

      if (type === "open") {
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
      } else if (type === "close") {
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
      } else {
        osc.frequency.setValueAtTime(520, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
        osc.start(now); osc.stop(now + 0.08);
      }
    } catch(e) {}
  }

  // Chill Lofi Guitar Track (12% optimal ambient)
  let bgMusic = new Audio("https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.12;

  function initVoices() {
    if ("speechSynthesis" in window) {
      cachedVoices = synth.getVoices();
    }
  }
  if ("speechSynthesis" in window) {
    initVoices();
    synth.onvoiceschanged = initVoices;
  }

  function getGoogleVoice(lang, gender) {
    let pool = cachedVoices.filter(v => !v.name.toLowerCase().includes("espeak"));
    if (pool.length === 0) pool = cachedVoices;

    let match = lang === "hi" ? "hi" : "en";
    let langList = pool.filter(v => v.lang.toLowerCase().replace("_", "-").startsWith(match));
    if (langList.length === 0) langList = pool;

    let googleList = langList.filter(v => v.name.toLowerCase().includes("google") || v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("india"));
    let target = googleList.length > 0 ? googleList : langList;

    if (gender === "female") {
      let f = target.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("swara") || v.name.toLowerCase().includes("zira") || (v.name.toLowerCase().includes("google") && !v.name.toLowerCase().includes("male")));
      return f || target[0];
    } else {
      let m = target.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("madhur") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("ravi"));
      return m || target[0];
    }
  }

  async function translateForVoice(text, target) {
    if (target === "en" || !text || text.length < 2) return text;
    try {
      let res = await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=" + encodeURIComponent(text));
      let json = await res.json();
      return json[0].map(item => item[0]).join("");
    } catch(e) {
      return text;
    }
  }

  // Deep Structural Scan with Visual Descriptions
  function scanDetailedDOM() {
    sections = [];
    const main = document.querySelector("main") || document.body;
    let currentSec = { heading: "Page Overview", items: [] };

    // Overview intro
    let title = document.title || "Resilience Industries";
    currentSec.items.push({
      type: "meta",
      en: "Currently browsing page: " + title + ". Layout contains top header banner, main content container, and bottom footer.",
      hi: "आप अभी देख रहे हैं पृष्ठ: " + title + "। इस पृष्ठ का लेआउट शीर्ष बैनर, मुख्य सामग्री और निचले फुटर में व्यवस्थित है।"
    });

    const nodes = main.querySelectorAll("h1, h2, h3, p, a, button, input, ul, ol");
    nodes.forEach(el => {
      if (el.closest(".smart-tour-wrapper") || el.closest("nav") && el.closest("header")) return;
      let text = el.innerText ? el.innerText.trim() : "";
      let tag = el.tagName.toLowerCase();

      if (tag === "h1" || tag === "h2" || tag === "h3") {
        if (currentSec.items.length > 0) sections.push(currentSec);
        let level = tag.replace("h", "");
        currentSec = {
          heading: text,
          items: [{
            type: "heading",
            en: "Heading level " + level + ": " + text,
            hi: "शीर्षक स्तर " + level + ": " + text
          }]
        };
      } else if (tag === "p" && text.length > 2) {
        currentSec.items.push({
          type: "text",
          en: text,
          hi: text // will translate dynamically
        });
      } else if (tag === "button" && text.length > 1) {
        currentSec.items.push({
          type: "button",
          en: "Interactive Button: " + text + ", visual cyan accent, keyboard clickable.",
          hi: "क्रियाशील बटन: " + text + ", नीले रंग में दृश्यमान, क्लिक करने योग्य।"
        });
      } else if (tag === "a" && text.length > 1) {
        currentSec.items.push({
          type: "link",
          en: "Navigation Link: " + text + ", opens related view.",
          hi: "नेविगेशन लिंक: " + text + ", संबंधित पृष्ठ पर ले जाने हेतु उपलब्ध।"
        });
      } else if (tag === "input") {
        let ph = el.getAttribute("placeholder") || "search or input field";
        currentSec.items.push({
          type: "input",
          en: "Text entry field: " + ph + ", highlighted for typing.",
          hi: "टेक्स्ट इनपुट बॉक्स: " + ph + ", टाइप करने के लिए उपलब्ध।"
        });
      }
    });

    if (currentSec.items.length > 0) sections.push(currentSec);
  }

  async function speakStep() {
    if (curSec >= sections.length) {
      stopTour();
      setLive("Finished");
      return;
    }
    let s = sections[curSec];
    if (curItem >= s.items.length) {
      curSec++;
      curItem = 0;
      speakStep();
      return;
    }

    synth.cancel();
    let itemObj = s.items[curItem];
    let textToSpeak = itemObj.en;

    if (tourLang === "hi" || tourLang === "hinglish") {
      if (itemObj.type === "text") {
        setLive("Translating...");
        textToSpeak = await translateForVoice(itemObj.en, "hi");
      } else {
        textToSpeak = itemObj.hi;
      }
    }

    currentUtterance = new SpeechSynthesisUtterance(textToSpeak);
    let voiceTarget = (tourLang === "hi" || tourLang === "hinglish") ? "hi" : "en";
    let v = getGoogleVoice(voiceTarget, tourGender);
    if (v) currentUtterance.voice = v;

    currentUtterance.rate = 0.94;
    currentUtterance.pitch = tourGender === "female" ? 1.05 : 0.88;

    currentUtterance.onend = function() {
      if (!isPaused && isPlaying) {
        curItem++;
        speakStep();
      }
    };

    currentUtterance.onerror = function() {
      if (!isPaused && isPlaying) {
        curItem++;
        speakStep();
      }
    };

    setLive("Heading " + (curSec + 1) + "/" + sections.length);
    synth.speak(currentUtterance);
  }

  function startTour() {
    isPlaying = true;
    isPaused = false;
    scanDetailedDOM();
    bgMusic.play().catch(e => {});
    speakStep();
    let pBtn = document.getElementById("smart-tour-play");
    if (pBtn) pBtn.textContent = "Pause";
  }

  function pauseTour() {
    isPaused = true;
    synth.pause();
    bgMusic.pause();
    let pBtn = document.getElementById("smart-tour-play");
    if (pBtn) pBtn.textContent = "Resume";
  }

  function resumeTour() {
    isPaused = false;
    bgMusic.play().catch(e => {});
    synth.resume();
    let pBtn = document.getElementById("smart-tour-play");
    if (pBtn) pBtn.textContent = "Pause";
  }

  function stopTour() {
    isPlaying = false;
    isPaused = false;
    synth.cancel();
    bgMusic.pause();
    bgMusic.currentTime = 0;
    let pBtn = document.getElementById("smart-tour-play");
    if (pBtn) pBtn.textContent = "Play";
  }

  function setLive(txt) {
    let l = document.getElementById("smart-tour-status");
    if (l) l.textContent = txt;
  }

  window.addEventListener("DOMContentLoaded", () => {
    const trigger = document.getElementById("smart-tour-trigger");
    const bar = document.getElementById("smart-tour-bar");
    const playBtn = document.getElementById("smart-tour-play");
    const prevBtn = document.getElementById("smart-tour-prev");
    const nextBtn = document.getElementById("smart-tour-next");
    const rewBtn = document.getElementById("smart-tour-rew");
    const fwdBtn = document.getElementById("smart-tour-fwd");
    const voiceBtn = document.getElementById("smart-tour-voice");
    const langBtn = document.getElementById("smart-tour-lang");

    if (trigger && bar) {
      trigger.addEventListener("click", () => {
        let isOpen = bar.classList.toggle("open");
        trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
        playSFX(isOpen ? "open" : "close");
        trigger.textContent = isOpen ? "❌ Close Tour" : "🔊 Explore Site by Voice";
      });

      playBtn.addEventListener("click", () => {
        playSFX("click");
        if (!isPlaying) {
          curSec = 0;
          curItem = 0;
          startTour();
        } else if (isPlaying && !isPaused) {
          pauseTour();
        } else if (isPaused) {
          resumeTour();
        }
      });

      nextBtn.addEventListener("click", () => {
        playSFX("click");
        scanDetailedDOM();
        if (curSec < sections.length - 1) {
          curSec++;
          curItem = 0;
          isPaused = false;
          isPlaying = true;
          bgMusic.play().catch(e => {});
          speakStep();
          playBtn.textContent = "Pause";
        }
      });

      prevBtn.addEventListener("click", () => {
        playSFX("click");
        scanDetailedDOM();
        if (curSec > 0) {
          curSec--;
          curItem = 0;
          isPaused = false;
          isPlaying = true;
          bgMusic.play().catch(e => {});
          speakStep();
          playBtn.textContent = "Pause";
        }
      });

      rewBtn.addEventListener("click", () => {
        playSFX("click");
        if (curItem > 0) curItem--;
        else if (curSec > 0) { curSec--; curItem = 0; }
        speakStep();
      });

      fwdBtn.addEventListener("click", () => {
        playSFX("click");
        let s = sections[curSec];
        if (s && curItem < s.items.length - 1) curItem++;
        else if (curSec < sections.length - 1) { curSec++; curItem = 0; }
        speakStep();
      });

      voiceBtn.addEventListener("click", () => {
        playSFX("click");
        tourGender = tourGender === "female" ? "male" : "female";
        voiceBtn.textContent = tourGender === "female" ? "Voice: Female" : "Voice: Male";
        if (isPlaying && !isPaused) speakStep();
      });

      langBtn.addEventListener("click", () => {
        playSFX("click");
        if (tourLang === "en") tourLang = "hi";
        else if (tourLang === "hi") tourLang = "hinglish";
        else tourLang = "en";

        langBtn.textContent = tourLang === "en" ? "Lang: English" : (tourLang === "hi" ? "Lang: Hindi" : "Lang: Hinglish");
        if (isPlaying && !isPaused) speakStep();
      });
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && isPlaying && !isPaused) {
      pauseTour();
    }
  });
})();
