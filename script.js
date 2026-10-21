



/* Resilience Industries - Google Cloud TTS Audio Describer Engine */
(function() {
  let isPaused = false;
  let isPlaying = false;
  let tourLang = "en"; // en, hi
  let tourGender = "female"; // female, male
  let sections = [];
  let curSec = 0;
  let curItem = 0;

  // Cloud TTS Audio Element (Bypasses local eSpeak completely)
  let cloudVoiceAudio = new Audio();
  cloudVoiceAudio.preload = "auto";

  // Romantic Acoustic Ambient Melody (Volume at 18%)
  let bgMusic = new Audio("https://cdn.pixabay.com/download/audio/2022/11/06/audio_c9735d568c.mp3?filename=romantic-ambient-126298.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.18;

  // Instant Reliable SFX
  function playSFX(freq, duration) {
    try {
      let AContext = window.AudioContext || window.webkitAudioContext;
      if (!AContext) return;
      let ctx = new AContext();
      ctx.resume().then(() => {
        let osc = ctx.createOscillator();
        let gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      });
    } catch(e) {}
  }

  async function translateForVoice(text) {
    if (tourLang === "en" || !text || text.length < 2) return text;
    try {
      let res = await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=" + encodeURIComponent(text));
      let json = await res.json();
      return json[0].map(item => item[0]).join("");
    } catch(e) {
      return text;
    }
  }

  // Stream Google Cloud Natural Voice
  function playGoogleCloudTTS(text, lang, gender) {
    let tl = lang === "hi" ? "hi" : "en-IN";
    // Google TTS Cloud Endpoint
    let cleanText = encodeURIComponent(text.substring(0, 200));
    let voiceUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${cleanText}&tl=${tl}&client=tw-ob`;

    cloudVoiceAudio.src = voiceUrl;
    cloudVoiceAudio.playbackRate = gender === "female" ? 1.0 : 0.92;
    cloudVoiceAudio.play().catch(e => {
      // Graceful fallback without eSpeak
      setLive("Audio play error");
    });

    cloudVoiceAudio.onended = function() {
      if (!isPaused && isPlaying) {
        curItem++;
        speakStep();
      }
    };

    cloudVoiceAudio.onerror = function() {
      if (!isPaused && isPlaying) {
        curItem++;
        speakStep();
      }
    };
  }

  function scanDetailedDOM() {
    sections = [];
    const main = document.querySelector("main") || document.body;
    let currentSec = { heading: "Page Overview", items: [] };

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
          hi: text
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

    let itemObj = s.items[curItem];
    let textToSpeak = itemObj.en;

    if (tourLang === "hi") {
      if (itemObj.type === "text") {
        setLive("Translating...");
        textToSpeak = await translateForVoice(itemObj.en);
      } else {
        textToSpeak = itemObj.hi;
      }
    }

    setLive("Heading " + (curSec + 1) + "/" + sections.length);
    playGoogleCloudTTS(textToSpeak, tourLang, tourGender);
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
    cloudVoiceAudio.pause();
    bgMusic.pause();
    let pBtn = document.getElementById("smart-tour-play");
    if (pBtn) pBtn.textContent = "Resume";
  }

  function resumeTour() {
    isPaused = false;
    bgMusic.play().catch(e => {});
    cloudVoiceAudio.play().catch(e => {});
    let pBtn = document.getElementById("smart-tour-play");
    if (pBtn) pBtn.textContent = "Pause";
  }

  function stopTour() {
    isPlaying = false;
    isPaused = false;
    cloudVoiceAudio.pause();
    cloudVoiceAudio.currentTime = 0;
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
    const prevBtn = document.getElementById("smart-tour-prev");
    const rewBtn = document.getElementById("smart-tour-rew");
    const playBtn = document.getElementById("smart-tour-play");
    const fwdBtn = document.getElementById("smart-tour-fwd");
    const nextBtn = document.getElementById("smart-tour-next");
    const voiceBtn = document.getElementById("smart-tour-voice");
    const langBtn = document.getElementById("smart-tour-lang");

    if (trigger && bar) {
      trigger.addEventListener("click", () => {
        let isOpen = bar.classList.toggle("open");
        trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
        playSFX(isOpen ? 650 : 350, 0.12);
        trigger.textContent = isOpen ? "❌ Close Tour" : "🔊 Explore Site by Voice";
        
        // Stop everything immediately if user collapses without pausing
        if (!isOpen) {
          stopTour();
        }
      });

      playBtn.addEventListener("click", () => {
        playSFX(520, 0.08);
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

      prevBtn.addEventListener("click", () => {
        playSFX(440, 0.08);
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
        playSFX(480, 0.08);
        if (curItem > 0) curItem--;
        else if (curSec > 0) { curSec--; curItem = 0; }
        speakStep();
      });

      fwdBtn.addEventListener("click", () => {
        playSFX(560, 0.08);
        let s = sections[curSec];
        if (s && curItem < s.items.length - 1) curItem++;
        else if (curSec < sections.length - 1) { curSec++; curItem = 0; }
        speakStep();
      });

      nextBtn.addEventListener("click", () => {
        playSFX(600, 0.08);
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

      voiceBtn.addEventListener("click", () => {
        playSFX(500, 0.08);
        tourGender = tourGender === "female" ? "male" : "female";
        voiceBtn.textContent = tourGender === "female" ? "Voice: Female" : "Voice: Male";
        if (isPlaying && !isPaused) speakStep();
      });

      langBtn.addEventListener("click", () => {
        playSFX(500, 0.08);
        tourLang = tourLang === "en" ? "hi" : "en";
        langBtn.textContent = tourLang === "en" ? "Lang: English" : "Lang: Hindi";
        if (isPlaying && !isPaused) speakStep();
      });
    }
  });

  // Strict lifecycle hooks for all background/exit events
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && isPlaying) {
      pauseTour();
    }
  });
  window.addEventListener("pagehide", stopTour);
  window.addEventListener("beforeunload", stopTour);
})();
