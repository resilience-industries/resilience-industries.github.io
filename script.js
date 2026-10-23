











/* Resilience Industries - Production Audio Describer Engine */
(function() {
  let synth = window.speechSynthesis;
  let currentUtterance = null;
  let isPaused = false;
  let isPlaying = false;
  let tourLang = "en"; // Strictly only "en" or "hi"
  let tourGender = "female"; // female, male
  let sections = [];
  let curSec = 0;
  let curItem = 0;
  let voiceList = [];

  // Modern Romantic Ambient Melody (20% Loudness)
  let bgMusic = new Audio("https://cdn.pixabay.com/download/audio/2022/11/06/audio_c9735d568c.mp3?filename=romantic-ambient-126298.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.20;

  // Tactile SFX
  function playSFX(freq, duration) {
    try {
      let AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      let ctx = new AC();
      ctx.resume().then(() => {
        let osc = ctx.createOscillator();
        let gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      });
    } catch(e) {}
  }

  function loadVoices() {
    if ("speechSynthesis" in window) {
      // Completely Block eSpeak
      voiceList = synth.getVoices().filter(v => {
        let n = v.name.toLowerCase();
        return !n.includes("espeak") && !n.includes("espeak-ng");
      });
    }
  }
  if ("speechSynthesis" in window) {
    loadVoices();
    synth.onvoiceschanged = loadVoices;
  }

  function getPureGoogleVoice(lang, gender) {
    if (voiceList.length === 0) loadVoices();
    let targetCode = lang === "hi" ? "hi" : "en";
    
    let matches = voiceList.filter(v => v.lang.toLowerCase().replace("_", "-").startsWith(targetCode));
    if (matches.length === 0) matches = voiceList;

    let googleVoices = matches.filter(v => v.name.toLowerCase().includes("google") || v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("india"));
    let pool = googleVoices.length > 0 ? googleVoices : matches;

    if (gender === "female") {
      let f = pool.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("swara") || v.name.toLowerCase().includes("zira") || (v.name.toLowerCase().includes("google") && !v.name.toLowerCase().includes("male")));
      return f || pool[0];
    } else {
      let m = pool.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("madhur") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("ravi"));
      return m || pool[0];
    }
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

  function scanDetailedDOM() {
    sections = [];
    const main = document.querySelector("main") || document.body;
    let currentSec = { heading: "Page Overview", items: [] };

    let title = document.title || "Resilience Industries";
    currentSec.items.push({
      type: "meta",
      en: "Currently browsing: " + title + ". Layout structured into Header Banner, Main Landmark, and Page Footer.",
      hi: "वर्तमान पृष्ठ: " + title + "। पृष्ठ का ढाँचा हेडर बैनर, मुख्य सामग्री और फ़ूटर में संरचित है।"
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
            en: "Heading Level " + level + ": " + text,
            hi: "शीर्षक स्तर " + level + ": " + text
          }]
        };
      } else if (tag === "p" && text.length > 2) {
        currentSec.items.push({ type: "text", en: text, hi: text });
      } else if (tag === "button" && text.length > 1) {
        currentSec.items.push({
          type: "button",
          en: "Action Button: " + text + ", visual cyan accent.",
          hi: "एक्शन बटन: " + text + ", नीले रंग में दृश्यमान।"
        });
      } else if (tag === "a" && text.length > 1) {
        currentSec.items.push({
          type: "link",
          en: "Link: " + text + ", opens section.",
          hi: "लिंक: " + text + ", अनुभाग खोलने हेतु।"
        });
      } else if (tag === "input") {
        let ph = el.getAttribute("placeholder") || "Search field";
        currentSec.items.push({
          type: "input",
          en: "Text Box: " + ph,
          hi: "टेक्स्ट बॉक्स: " + ph
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

    if (tourLang === "hi") {
      if (itemObj.type === "text") {
        setLive("Translating...");
        textToSpeak = await translateForVoice(itemObj.en);
      } else {
        textToSpeak = itemObj.hi;
      }
    }

    currentUtterance = new SpeechSynthesisUtterance(textToSpeak);
    let pickedVoice = getPureGoogleVoice(tourLang, tourGender);
    if (pickedVoice) currentUtterance.voice = pickedVoice;

    currentUtterance.rate = 0.95;
    currentUtterance.pitch = tourGender === "female" ? 1.08 : 0.88;

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

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && isPlaying) pauseTour();
  });
  window.addEventListener("pagehide", stopTour);
  window.addEventListener("beforeunload", stopTour);
})();
