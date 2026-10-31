// =========================================================================
// CRIN AVENTURAS DE LECTOESCRITURA - EL TOBOGÁN DE FUSIÓN SUAVE
// Módulo de Continuous Blending / Síntesis Fonémica sin Sobrecarga (Science of Reading)
// =========================================================================

(function() {
  'use strict';

  const SlideGame = {
    canvas: null,
    ctx: null,
    width: 800,
    height: 520,
    isRunning: false,
    animId: null,
    time: 0,

    cases: [],
    currentCaseIndex: 0,
    currentCase: null,

    // Estado del cohete y la rampa
    rocketProgress: 0, // 0.0 (arriba) a 1.0 (abajo/lanzamiento)
    isDraggingRocket: false,
    hasLanded: false,

    cards: [],
    selectedCard: null,
    isAdvancing: false,
    isSpeaking: false,
    voiceTimeout: null,
    speechWatchdog: null,

    stars: [],
    floatingTexts: []
  };

  window.SlideGame = SlideGame;

  // BANCO CANÓNICO DE PALABRAS DE FUSIÓN CONTINUA
  const SLIDE_CASES = [
    {
      word: 'SOPA',
      phonemes: ['S', 'O', 'P', 'A'],
      pron: 'sopa',
      image: 'assets/sopa.png',
      distractors: [
        { word: 'COPA', image: 'assets/copa.png', pron: 'copa' },
        { word: 'LUNA', image: 'assets/luna.png', pron: 'luna' }
      ]
    },
    {
      word: 'MESA',
      phonemes: ['M', 'E', 'S', 'A'],
      pron: 'mesa',
      image: 'assets/mesa.png',
      distractors: [
        { word: 'PESA', image: 'assets/pato.png', pron: 'pato' },
        { word: 'CASA', image: 'assets/casa.png', pron: 'casa' }
      ]
    },
    {
      word: 'LUNA',
      phonemes: ['L', 'U', 'N', 'A'],
      pron: 'luna',
      image: 'assets/luna.png',
      distractors: [
        { word: 'CUNA', image: 'assets/cuna.png', pron: 'cuna' },
        { word: 'LANA', image: 'assets/lana.png', pron: 'lana' }
      ]
    },
    {
      word: 'PATO',
      phonemes: ['P', 'A', 'T', 'O'],
      pron: 'pato',
      image: 'assets/pato.png',
      distractors: [
        { word: 'GATO', image: 'assets/gato.png', pron: 'gato' },
        { word: 'PLATO', image: 'assets/plato.png', pron: 'plato' }
      ]
    },
    {
      word: 'PINO',
      phonemes: ['P', 'I', 'N', 'O'],
      pron: 'pino',
      image: 'assets/pino.png',
      distractors: [
        { word: 'PILA', image: 'assets/pila.png', pron: 'pila' },
        { word: 'MOLINO', image: 'assets/molino.png', pron: 'molino' }
      ]
    },
    {
      word: 'VELA',
      phonemes: ['V', 'E', 'L', 'A'],
      pron: 'vela',
      image: 'assets/vela.png',
      distractors: [
        { word: 'TELA', image: 'assets/tela.png', pron: 'tela' },
        { word: 'BOLA', image: 'assets/bola.png', pron: 'bola' }
      ]
    }
  ];

  const imgCache = {};
  function getCachedImg(src) {
    if (!src) return null;
    if (imgCache[src]) return imgCache[src];
    const img = new Image();
    img.src = src;
    imgCache[src] = img;
    return img;
  }

  // --- CONTROL DE PANTALLA ---
  window.openSlideScreen = function() {
    if (typeof stopAllAudio === 'function') stopAllAudio();
    if (typeof switchScreen === 'function') switchScreen('slide');

    const screen = document.getElementById('screen-slide');
    if (screen) screen.classList.add('active');

    SlideGame.isRunning = true;
    initSlideGame();

    setTimeout(resizeSlideCanvas, 50);
    setTimeout(resizeSlideCanvas, 150);
    setTimeout(resizeSlideCanvas, 300);
  };

  window.closeSlideAndReturnToMap = function() {
    SlideGame.isRunning = false;
    if (SlideGame.animId) cancelAnimationFrame(SlideGame.animId);
    if (SlideGame.voiceTimeout) clearTimeout(SlideGame.voiceTimeout);
    if (SlideGame.speechWatchdog) clearTimeout(SlideGame.speechWatchdog);
    SlideGame.isSpeaking = false;
    SlideGame.isAdvancing = false;
    if (typeof stopAllAudio === 'function') stopAllAudio();

    if (typeof switchScreen === 'function') switchScreen('map');
  };

  // --- INICIALIZACIÓN ---
  function initSlideGame() {
    SlideGame.canvas = document.getElementById('slide-canvas');
    if (!SlideGame.canvas) return;
    SlideGame.ctx = SlideGame.canvas.getContext('2d');

    // Inicializar estrellas de fondo
    SlideGame.stars = [];
    for (let i = 0; i < 40; i++) {
      SlideGame.stars.push({
        x: Math.random(),
        y: Math.random(),
        size: 1 + Math.random() * 2,
        twinkle: Math.random() * Math.PI * 2
      });
    }

    const shuffled = SLIDE_CASES.slice().sort(() => Math.random() - 0.5);
    SlideGame.cases = shuffled.slice(0, 5);
    SlideGame.currentCaseIndex = 0;

    setupSlideEventListeners();
    resizeSlideCanvas();
    setupSlideCase(0);

    if (SlideGame.animId) cancelAnimationFrame(SlideGame.animId);
    SlideGame.animId = requestAnimationFrame(slideLoop);
  }

  function resizeSlideCanvas() {
    if (!SlideGame.canvas) return;
    const container = SlideGame.canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const w = Math.max(320, Math.floor(rect.width) || window.innerWidth || 800);
    const h = Math.max(360, Math.floor(rect.height) || (window.innerHeight - 170) || 520);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    SlideGame.canvas.width = w * dpr;
    SlideGame.canvas.height = h * dpr;
    SlideGame.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    SlideGame.width = w;
    SlideGame.height = h;

    repositionSlideCards();
  }

  function setupSlideCase(index) {
    if (!SlideGame.isRunning || SlideGame.cases.length === 0) return;
    const c = SlideGame.cases[index % SlideGame.cases.length];
    SlideGame.currentCase = c;
    SlideGame.isAdvancing = false;
    SlideGame.selectedCard = null;
    SlideGame.rocketProgress = 0;
    SlideGame.hasLanded = false;
    SlideGame.floatingTexts = [];

    // Opciones ilustradas para cuando el cohete aterrice
    const opts = [
      { word: c.word, image: c.image, pron: c.pron, isTarget: true },
      ...c.distractors.map(d => ({ ...d, isTarget: false }))
    ].sort(() => Math.random() - 0.5);

    SlideGame.cards = opts.map((opt, i) => ({
      id: i,
      word: opt.word,
      image: opt.image,
      pron: opt.pron,
      isTarget: opt.isTarget,
      x: 0,
      y: 0,
      w: 135,
      h: 155,
      scale: 1.0,
      shake: 0
    }));

    repositionSlideCards();
    updateSlideHUD();

    if (SlideGame.voiceTimeout) clearTimeout(SlideGame.voiceTimeout);
    SlideGame.voiceTimeout = setTimeout(() => {
      speakSlideIntro();
    }, 300);
  }

  function repositionSlideCards() {
    const w = SlideGame.width;
    const h = SlideGame.height;
    const cards = SlideGame.cards;
    if (!cards || cards.length === 0) return;

    const cardW = Math.min(140, Math.floor(w * 0.28));
    const cardH = Math.min(160, Math.floor(h * 0.35));
    const startX = w * 0.5 - ((cards.length * cardW + (cards.length - 1) * 16) / 2);
    const posY = h * 0.65;

    cards.forEach((c, i) => {
      c.w = cardW;
      c.h = cardH;
      c.x = startX + i * (cardW + 16);
      c.y = posY;
    });
  }

  function updateSlideHUD() {
    const titleEl = document.getElementById('slide-case-title');
    if (titleEl) titleEl.innerText = `Misión Espacial ${SlideGame.currentCaseIndex + 1} de ${SlideGame.cases.length}`;
  }

  function speakSlideIntro() {
    if (!SlideGame.isRunning) return;
    if (typeof speakText === 'function') {
      speakText('Desliza el cohete por el tobogán para unir los sonidos.');
    }
  }

  // --- DIBUJADO DE LA ESCENA ESPACIAL Y TOBOGÁN ---
  function slideLoop() {
    if (!SlideGame.isRunning) return;
    SlideGame.time += 0.02;

    renderSlideScene();
    SlideGame.animId = requestAnimationFrame(slideLoop);
  }

  function renderSlideScene() {
    const ctx = SlideGame.ctx;
    const w = SlideGame.width;
    const h = SlideGame.height;
    const c = SlideGame.currentCase;

    ctx.clearRect(0, 0, w, h);

    // 1. Cielo cósmico con estrellas parpadeantes
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0F172A');
    bgGrad.addColorStop(0.6, '#1E1B4B');
    bgGrad.addColorStop(1, '#312E81');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#FFFFFF';
    SlideGame.stars.forEach(st => {
      const alpha = 0.3 + 0.7 * Math.abs(Math.sin(SlideGame.time * 2 + st.twinkle));
      ctx.globalAlpha = alpha;
      ctx.fillRect(st.x * w, st.y * h, st.size, st.size);
    });
    ctx.globalAlpha = 1.0;

    if (!c) return;

    // 2. Curva del tobogán espacial (Rampa luminosa)
    const startX = w * 0.15;
    const startY = h * 0.18;
    const endX = w * 0.85;
    const endY = h * 0.48;

    // Tubo del tobogán
    ctx.save();
    ctx.shadowColor = '#38BDF8';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(w * 0.5, startY + 40, endX, endY);
    ctx.stroke();

    // Riel brillante interior
    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(w * 0.5, startY + 40, endX, endY);
    ctx.stroke();
    ctx.restore();

    // 3. Estaciones de letras a lo largo de la rampa
    const phonemes = c.phonemes;
    phonemes.forEach((letter, i) => {
      const t = (i + 0.5) / phonemes.length;
      const lx = getQuadraticBezierPoint(startX, w * 0.5, endX, t);
      const ly = getQuadraticBezierPoint(startY, startY + 40, endY, t);

      // Círculo luminoso para cada letra
      const isPassed = (SlideGame.rocketProgress >= t);
      ctx.fillStyle = isPassed ? '#10B981' : '#1E293B';
      ctx.beginPath();
      ctx.arc(lx, ly - 28, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isPassed ? '#6EE7B7' : '#38BDF8';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = '900 20px "Comic Neue", "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isPassed ? '#FFFFFF' : '#BAE6FD';
      ctx.fillText(letter, lx, ly - 27);
    });

    // 4. Cohete deslizándose por la curva
    const rx = getQuadraticBezierPoint(startX, w * 0.5, endX, SlideGame.rocketProgress);
    const ry = getQuadraticBezierPoint(startY, startY + 40, endY, SlideGame.rocketProgress);

    // Fuego del cohete si está deslizándose
    if (SlideGame.rocketProgress > 0.05 && SlideGame.rocketProgress < 0.98) {
      ctx.save();
      ctx.translate(rx - 25, ry);
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(0, 0, 10 + Math.random() * 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Dibujar cohete emoji estilizado
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚀', rx, ry - 10);

    // 5. Dibujar opciones ilustradas abajo
    SlideGame.cards.forEach(card => {
      ctx.save();
      ctx.translate(card.x + card.w / 2 + (card.shake ? Math.sin(SlideGame.time * 30) * card.shake : 0), card.y + card.h / 2);
      ctx.scale(card.scale, card.scale);

      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, -card.w / 2, -card.h / 2, card.w, card.h, 16);
      ctx.fill();
      ctx.strokeStyle = (card === SlideGame.selectedCard) ? '#10B981' : '#38BDF8';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.shadowBlur = 0;

      const img = getCachedImg(card.image);
      if (img && img.complete && img.naturalWidth > 0) {
        const ih = card.h * 0.54;
        const iw = (img.naturalWidth / img.naturalHeight) * ih;
        ctx.drawImage(img, -iw / 2, -card.h / 2 + 10, iw, ih);
      }

      ctx.font = '900 16px "Comic Neue", "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(card.word, 0, card.h / 2 - 16);

      ctx.restore();
    });

    // 6. Textos flotantes
    updateAndDrawSlideEffects(ctx);
  }

  function getQuadraticBezierPoint(p0, p1, p2, t) {
    return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function updateAndDrawSlideEffects(ctx) {
    for (let i = SlideGame.floatingTexts.length - 1; i >= 0; i--) {
      const ft = SlideGame.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      if (ft.alpha <= 0) {
        SlideGame.floatingTexts.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = '900 18px "Comic Neue", "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  // --- CONTROLES Y EVENTOS ---
  function setupSlideEventListeners() {
    const canvas = SlideGame.canvas;
    if (!canvas) return;

    function getCoords(e) {
      const r = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - r.left) * (SlideGame.width / r.width),
        y: (clientY - r.top) * (SlideGame.height / r.height)
      };
    }

    function onPointerDown(e) {
      if (SlideGame.isAdvancing) return;
      const pos = getCoords(e);

      // Si toca el cohete en la parte superior, iniciar deslizamiento
      if (pos.y < SlideGame.height * 0.55) {
        startRocketSlide();
        return;
      }

      // Si toca una de las tarjetas de abajo
      SlideGame.cards.forEach(card => {
        if (pos.x >= card.x && pos.x <= card.x + card.w &&
            pos.y >= card.y && pos.y <= card.y + card.h) {
          handleSlideCardClick(card);
        }
      });
    }

    canvas.onmousedown = onPointerDown;
    canvas.ontouchstart = function(e) {
      e.preventDefault();
      onPointerDown(e);
    };
  }

  function startRocketSlide() {
    if (SlideGame.isAdvancing || SlideGame.rocketProgress > 0.05) return;

    const c = SlideGame.currentCase;
    if (!c) return;

    // Locución continua de fusión suave sin cortes
    if (typeof speakText === 'function') {
      speakText(`${c.word}`, () => {});
    }

    // Animación fluida de deslizamiento
    const startTime = performance.now();
    const duration = 1400; // ms

    function animateSlide(now) {
      const elapsed = now - startTime;
      const p = Math.min(1.0, elapsed / duration);
      SlideGame.rocketProgress = p;

      if (p < 1.0) {
        requestAnimationFrame(animateSlide);
      } else {
        SlideGame.rocketProgress = 1.0;
        SlideGame.hasLanded = true;
        playRocketWhoosh();
      }
    }
    requestAnimationFrame(animateSlide);
  }

  function handleSlideCardClick(card) {
    if (SlideGame.isAdvancing) return;

    if (card.isTarget) {
      SlideGame.isAdvancing = true;
      SlideGame.selectedCard = card;
      card.scale = 1.1;

      playSuccessSound();

      SlideGame.floatingTexts.push({
        x: card.x + card.w / 2,
        y: card.y - 20,
        text: `¡DESPEGUE! ¡Es ${card.word}! 🚀`,
        color: '#10B981',
        alpha: 1.0,
        vy: -1.2
      });

      if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
        activeChildProfile.coins = (activeChildProfile.coins || 0) + 10;
        if (typeof saveActiveChildProfile === 'function') saveActiveChildProfile();
      }

      if (typeof speakText === 'function') {
        speakText(`¡Súper, tarea lograda! ¡${card.pron}!`, () => {});
      }

      setTimeout(() => {
        if (!SlideGame.isRunning) return;
        SlideGame.currentCaseIndex++;
        if (SlideGame.currentCaseIndex >= SlideGame.cases.length) {
          showSlideVictoryModal();
        } else {
          setupSlideCase(SlideGame.currentCaseIndex);
        }
      }, 1600);

    } else {
      card.shake = 8;
      playErrorSound();

      SlideGame.floatingTexts.push({
        x: card.x + card.w / 2,
        y: card.y - 20,
        text: '¡Intenta de nuevo!',
        color: '#F59E0B',
        alpha: 1.0,
        vy: -1.2
      });

      setTimeout(() => { card.shake = 0; }, 400);

      if (typeof speakText === 'function') {
        speakText(`Esa es ${card.pron}. Desliza el cohete para escuchar la palabra.`);
      }
    }
  }

  function showSlideVictoryModal() {
    const modal = document.getElementById('slide-victory-modal');
    if (modal) modal.style.display = 'flex';
  }

  window.replaySlideQuest = function() {
    const modal = document.getElementById('slide-victory-modal');
    if (modal) modal.style.display = 'none';
    initSlideGame();
  };

  window.closeSlideVictoryModal = function() {
    const modal = document.getElementById('slide-victory-modal');
    if (modal) modal.style.display = 'none';
    window.closeSlideAndReturnToMap();
  };

  function playRocketWhoosh() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ac.currentTime + 0.3);
      gain.gain.setValueAtTime(0.25, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.3);
      osc.start();
      osc.stop(ac.currentTime + 0.3);
    } catch(e) {}
  }

  function playSuccessSound() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ac.currentTime + 0.25);
      gain.gain.setValueAtTime(0.3, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.35);
      osc.start();
      osc.stop(ac.currentTime + 0.35);
    } catch(e) {}
  }

  function playErrorSound() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ac.currentTime);
      gain.gain.setValueAtTime(0.2, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.25);
      osc.start();
      osc.stop(ac.currentTime + 0.25);
    } catch(e) {}
  }

})();
