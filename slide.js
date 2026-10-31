// =========================================================================
// CRIN AVENTURAS DE LECTOESCRITURA - EL TOBOGÁN DE FUSIÓN SUAVE
// Módulo de Fusión Continua Dinámico y Fluido (Sin Frenos, Sonido Sostenido)
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
    slideAnimId: null,
    time: 0,

    cases: [],
    currentCaseIndex: 0,
    currentCase: null,

    // Estado del cohete y la rampa
    rocketProgress: 0, // 0.0 (arriba) a 1.0 (abajo/aterrizaje)
    isSliding: false,
    hasLanded: false,
    activeStation: -1,

    currentAudio: null,

    // Opciones inferiores
    cards: [],
    selectedCard: null,
    isAdvancing: false,
    isSpeaking: false,
    voiceTimeout: null,

    stars: [],
    floatingTexts: [],
    sparks: [],
    pulseTimer: 0
  };

  window.SlideGame = SlideGame;

  function sylToAudioPath(syl) {
    let s = (syl || '').trim().toLowerCase();
    s = s.replace(/á/g, 'a_tilde')
         .replace(/é/g, 'e_tilde')
         .replace(/í/g, 'i_tilde')
         .replace(/ó/g, 'o_tilde')
         .replace(/ú/g, 'u_tilde')
         .replace(/ñ/g, 'enie');
    s = s.replace(/[^a-z0-9_]/g, '');
    return `assets/audio/silabas_estiradas/${s}.mp3`;
  }

  function cleanWordKey(text) {
    if (!text) return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  }

  // --- GENERACIÓN DINÁMICA DE MISIONES DESDE EL LÉXICO CANÓNICO ---
  function buildSlideCasesFromLexicon() {
    if (typeof CANONICAL_WORD_LEXICON === 'undefined') {
      return getFallbackSlideCases();
    }

    const allKeys = Object.keys(CANONICAL_WORD_LEXICON).filter(k => {
      const item = CANONICAL_WORD_LEXICON[k];
      if (!item || !item.silabas || !item.emoji) return false;
      const silCount = item.silabas.length;
      return (silCount >= 2 && silCount <= 3);
    });

    if (allKeys.length < 3) {
      return getFallbackSlideCases();
    }

    const shuffled = allKeys.slice().sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);

    return selected.map(key => {
      const item = CANONICAL_WORD_LEXICON[key];
      const otherKeys = allKeys.filter(k => k !== key).sort(() => Math.random() - 0.5);
      const distractors = otherKeys.slice(0, 2).map(dk => {
        const dItem = CANONICAL_WORD_LEXICON[dk];
        return {
          word: dItem.escritura || dk,
          image: dItem.emoji,
          pron: dItem.pronunciacion || dk
        };
      });

      return {
        word: item.escritura || key,
        syllables: item.silabas,
        pron: item.pronunciacion || key,
        image: item.emoji,
        distractors: distractors
      };
    });
  }

  function getFallbackSlideCases() {
    return [
      {
        word: 'LECHE',
        syllables: ['LE', 'CHE'],
        pron: 'leche',
        image: 'assets/leche.png',
        distractors: [
          { word: 'LUNA', image: 'assets/luna.png', pron: 'luna' },
          { word: 'LATA', image: 'assets/lata.png', pron: 'lata' }
        ]
      },
      {
        word: 'MAMA',
        syllables: ['MA', 'MÁ'],
        pron: 'mamá',
        image: 'assets/mama.png',
        distractors: [
          { word: 'CASA', image: 'assets/casa.png', pron: 'casa' },
          { word: 'PATO', image: 'assets/pato.png', pron: 'pato' }
        ]
      },
      {
        word: 'SOPA',
        syllables: ['SO', 'PA'],
        pron: 'sopa',
        image: 'assets/sopa.png',
        distractors: [
          { word: 'COPA', image: 'assets/copa.png', pron: 'copa' },
          { word: 'LUNA', image: 'assets/luna.png', pron: 'luna' }
        ]
      },
      {
        word: 'PELOTA',
        syllables: ['PE', 'LO', 'TA'],
        pron: 'pelota',
        image: 'assets/pelota.png',
        distractors: [
          { word: 'PALETA', image: 'assets/pala.png', pron: 'pala' },
          { word: 'BOTELLA', image: 'assets/botella.png', pron: 'botella' }
        ]
      }
    ];
  }

  const imgCache = {};
  function getCachedImg(src) {
    if (!src) return null;
    if (imgCache[src]) return imgCache[src];
    const img = new Image();
    img.src = src;
    imgCache[src] = img;
    return img;
  }

  function playAudioFile(src, onComplete) {
    try {
      if (SlideGame.currentAudio) {
        try { SlideGame.currentAudio.pause(); } catch(e) {}
      }
      const audio = new Audio(src);
      SlideGame.currentAudio = audio;
      let done = false;
      const finish = () => {
        if (!done) {
          done = true;
          if (onComplete) onComplete();
        }
      };
      audio.onended = finish;
      audio.onerror = finish;
      setTimeout(finish, 2000);
      audio.play().catch(finish);
    } catch(e) {
      if (onComplete) onComplete();
    }
  }

  let slideAudioCtx = null;
  function getSlideAudioCtx() {
    try {
      if (!slideAudioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) slideAudioCtx = new AudioCtx();
      }
      if (slideAudioCtx && slideAudioCtx.state === 'suspended') {
        slideAudioCtx.resume();
      }
    } catch(e) {}
    return slideAudioCtx;
  }

  function playChimeNote(freq) {
    try {
      const ac = getSlideAudioCtx();
      if (!ac) return;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq || 440, ac.currentTime);
      gain.gain.setValueAtTime(0.28, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.45);
      osc.start();
      osc.stop(ac.currentTime + 0.45);
    } catch(e) {}
  }

  function playRocketWhoosh() {
    try {
      const ac = getSlideAudioCtx();
      if (!ac) return;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ac.currentTime + 0.45);
      gain.gain.setValueAtTime(0.35, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.45);
      osc.start();
      osc.stop(ac.currentTime + 0.45);
    } catch(e) {}
  }

  function playSuccessSound() {
    try {
      const ac = getSlideAudioCtx();
      if (!ac) return;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ac.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.35);
      osc.start();
      osc.stop(ac.currentTime + 0.35);
    } catch(e) {}
  }

  function playErrorSound() {
    try {
      const ac = getSlideAudioCtx();
      if (!ac) return;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ac.currentTime);
      gain.gain.setValueAtTime(0.2, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);
      osc.start();
      osc.stop(ac.currentTime + 0.25);
    } catch(e) {}
  }

  // --- CONTROL DE PANTALLA ---
  window.openSlideScreen = function() {
    getSlideAudioCtx();
    if (typeof stopAllAudio === 'function') stopAllAudio();
    if (typeof switchScreen === 'function') switchScreen('slide');

    const screen = document.getElementById('screen-slide');
    if (screen) screen.classList.add('active');

    SlideGame.isRunning = true;
    initSlideGame();

    setTimeout(resizeSlideCanvas, 60);
    setTimeout(resizeSlideCanvas, 200);
    setTimeout(resizeSlideCanvas, 350);
  };

  window.closeSlideAndReturnToMap = function() {
    SlideGame.isRunning = false;
    if (SlideGame.currentAudio) {
      try { SlideGame.currentAudio.pause(); SlideGame.currentAudio = null; } catch(e) {}
    }
    if (SlideGame.animId) cancelAnimationFrame(SlideGame.animId);
    if (SlideGame.slideAnimId) cancelAnimationFrame(SlideGame.slideAnimId);
    if (SlideGame.voiceTimeout) clearTimeout(SlideGame.voiceTimeout);
    SlideGame.isSpeaking = false;
    SlideGame.isAdvancing = false;
    SlideGame.isSliding = false;
    if (typeof stopAllAudio === 'function') stopAllAudio();

    if (typeof switchScreen === 'function') switchScreen('map');
  };

  // --- INICIALIZACIÓN ---
  function initSlideGame() {
    SlideGame.canvas = document.getElementById('slide-canvas');
    if (!SlideGame.canvas) return;
    SlideGame.ctx = SlideGame.canvas.getContext('2d');

    SlideGame.stars = [];
    for (let i = 0; i < 45; i++) {
      SlideGame.stars.push({
        x: Math.random(),
        y: Math.random(),
        size: 1 + Math.random() * 2.5,
        twinkle: Math.random() * Math.PI * 2
      });
    }

    SlideGame.cases = buildSlideCasesFromLexicon();
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
    SlideGame.isSliding = false;
    SlideGame.selectedCard = null;
    SlideGame.rocketProgress = 0;
    SlideGame.hasLanded = false;
    SlideGame.activeStation = -1;
    SlideGame.floatingTexts = [];
    SlideGame.sparks = [];

    if (SlideGame.currentAudio) {
      try { SlideGame.currentAudio.pause(); SlideGame.currentAudio = null; } catch(e) {}
    }

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
    }, 400);
  }

  function repositionSlideCards() {
    const w = SlideGame.width;
    const h = SlideGame.height;
    const cards = SlideGame.cards;
    if (!cards || cards.length === 0) return;

    const cardW = Math.min(145, Math.floor(w * 0.28));
    const cardH = Math.min(155, Math.floor(h * 0.33));
    const startX = w * 0.5 - ((cards.length * cardW + (cards.length - 1) * 14) / 2);
    const posY = h * 0.63;

    cards.forEach((c, i) => {
      c.w = cardW;
      c.h = cardH;
      c.x = startX + i * (cardW + 14);
      c.y = posY;
    });
  }

  function updateSlideHUD() {
    const titleEl = document.getElementById('slide-case-title');
    if (titleEl) {
      titleEl.innerText = `Misión ${SlideGame.currentCaseIndex + 1} de ${SlideGame.cases.length}`;
    }

    const bannerText = document.getElementById('slide-instruction-text');
    const actionBtn = document.getElementById('slide-action-btn');

    if (SlideGame.canvas) {
      SlideGame.canvas.style.cursor = SlideGame.isSpeaking ? 'wait' : 'pointer';
    }

    if (SlideGame.isSpeaking) {
      if (bannerText) {
        bannerText.innerHTML = '<span>👂</span><span style="color: #FBBF24;"><strong>Crin está hablando:</strong> Escucha con atención...</span>';
      }
      if (actionBtn) {
        actionBtn.style.opacity = '0.5';
        actionBtn.style.pointerEvents = 'none';
      }
      return;
    }

    if (actionBtn) {
      actionBtn.style.opacity = '1.0';
      actionBtn.style.pointerEvents = 'auto';
    }

    if (!SlideGame.hasLanded) {
      if (bannerText) {
        bannerText.innerHTML = '<span>👆</span><span><strong>Paso 1:</strong> ¡Toca el cohete para deslizar y unir los sonidos!</span>';
      }
      if (actionBtn) {
        actionBtn.style.display = 'flex';
        actionBtn.innerHTML = '<span>🚀 ¡DESLIZAR COHETE!</span>';
        actionBtn.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
      }
    } else {
      if (bannerText) {
        bannerText.innerHTML = `<span>👉</span><span><strong>Paso 2:</strong> ¡Cohete aterrizó! ¿Cuál es la imagen de <strong>${SlideGame.currentCase.word}</strong>?</span>`;
      }
      if (actionBtn) {
        actionBtn.style.display = 'flex';
        actionBtn.innerHTML = '<span>🔊 Repetir Sonidos</span>';
        actionBtn.style.background = 'linear-gradient(135deg, #0284C7, #0369A1)';
      }
    }
  }

  function speakSlideIntro() {
    if (!SlideGame.isRunning) return;
    SlideGame.isSpeaking = true;
    updateSlideHUD();

    const isFirst = (SlideGame.currentCaseIndex === 0);
    const msg = isFirst 
      ? 'Toca el cohete para unir los sonidos.' 
      : '¡Siguiente palabra! Toca el cohete.';

    if (typeof speakText === 'function') {
      speakText(msg, () => {
        SlideGame.isSpeaking = false;
        updateSlideHUD();
      });
    } else {
      SlideGame.isSpeaking = false;
      updateSlideHUD();
    }
  }

  window.triggerSlideFromButton = function() {
    getSlideAudioCtx();
    if (SlideGame.isSpeaking || SlideGame.isAdvancing || SlideGame.isSliding) return;
    if (SlideGame.hasLanded) {
      SlideGame.rocketProgress = 0;
      SlideGame.hasLanded = false;
      SlideGame.activeStation = -1;
      updateSlideHUD();
    }
    startContinuousBlendSequence();
  };

  // --- FUSIÓN CONTINUA REAL: EL COHETE NO FRENA, SOSTIENE EL SONIDO HASTA LA SIGUIENTE SÍLABA ---
  function startContinuousBlendSequence() {
    if (SlideGame.isSpeaking || SlideGame.isAdvancing || SlideGame.isSliding) return;

    const c = SlideGame.currentCase;
    if (!c) return;

    SlideGame.isSliding = true;
    SlideGame.hasLanded = false;
    SlideGame.rocketProgress = 0;
    SlideGame.activeStation = -1;

    const bannerText = document.getElementById('slide-instruction-text');
    if (bannerText) {
      bannerText.innerHTML = '<span>👂</span><span>Escucha con atención cómo se unen los sonidos...</span>';
    }

    const syllables = c.syllables || ['A', 'B'];
    const numStations = syllables.length;
    const pitches = [261.6, 329.6, 392.0, 523.2];

    // Duración fluida total y pausada: el cohete avanza de forma constante sin frenar
    // Para 2 sílabas: ~4.2 segundos. Para 3 sílabas: ~5.8 segundos.
    const totalDurationMs = (numStations <= 2) ? 4200 : 5800;
    const startTime = performance.now();

    const stationTriggered = new Array(numStations).fill(false);
    let landingTriggered = false;

    function step(now) {
      if (!SlideGame.isRunning) return;
      const elapsed = now - startTime;
      const p = Math.min(1.0, elapsed / totalDurationMs);
      SlideGame.rocketProgress = p;

      // Evaluar en tiempo real el paso del cohete por cada estación
      for (let i = 0; i < numStations; i++) {
        const stationT = getStationT(i, numStations);
        if (p >= stationT && !stationTriggered[i]) {
          stationTriggered[i] = true;
          SlideGame.activeStation = i;

          // Chispas festivas al tocar la estación
          const coords = getStationCoords(i, numStations);
          spawnSparks(coords.x, coords.y - 24, '#FBBF24', 24);
          playChimeNote(pitches[i % pitches.length]);

          // Reproducir la sílaba sostenida (ej. "LEEEEEE..." que sostiene mientras avanza hacia "CHE")
          const syl = syllables[i];
          const audioSrc = sylToAudioPath(syl);
          playAudioFile(audioSrc);
        }
      }

      // Aterrizaje en la meta al completar el recorrido (p >= 1.0)
      if (p >= 1.0 && !landingTriggered) {
        landingTriggered = true;
        SlideGame.rocketProgress = 1.0;
        SlideGame.hasLanded = true;
        SlideGame.isSliding = false;
        SlideGame.activeStation = -1;

        playRocketWhoosh();
        const endCoords = getLandingCoords(numStations);
        spawnSparks(endCoords.x, endCoords.y, '#34D399', 35);

        // Bloqueo respetuoso mientras proclama la palabra completa y hace la pregunta
        if (typeof speakText === 'function') {
          SlideGame.isSpeaking = true;
          updateSlideHUD();

          speakText(`¡${c.word}!`, () => {
            setTimeout(() => {
              if (!SlideGame.isRunning) return;
              // Consigna directa y sin error de artículo ("¿Cuál de estas imágenes es LECHE?")
              speakText(`¿Cuál de estas imágenes es ${c.pron}?`, () => {
                SlideGame.isSpeaking = false;
                updateSlideHUD();
              });
            }, 350);
          });
        } else {
          updateSlideHUD();
        }
      }

      if (p < 1.0) {
        SlideGame.slideAnimId = requestAnimationFrame(step);
      }
    }

    SlideGame.slideAnimId = requestAnimationFrame(step);
  }

  // --- GEOMETRÍA ADAPTABLE SEGÚN NÚMERO DE SÍLABAS ---
  function getRampGeometry(numSyllables) {
    const w = SlideGame.width;
    const h = SlideGame.height;
    const count = numSyllables || 2;

    if (count <= 2) {
      // Rampa espaciosa para 2 sílabas (LE - CHE)
      return {
        startX: w * 0.14,
        startY: h * 0.16,
        ctrlX: w * 0.44,
        ctrlY: h * 0.20 + 40,
        endX: w * 0.86,
        endY: h * 0.46
      };
    } else {
      // Rampa más extendida para 3 sílabas (PE - LO - TA)
      return {
        startX: w * 0.10,
        startY: h * 0.13,
        ctrlX: w * 0.46,
        ctrlY: h * 0.18 + 55,
        endX: w * 0.90,
        endY: h * 0.48
      };
    }
  }

  function getStationT(stationIdx, numSyllables) {
    const count = numSyllables || 2;
    if (count <= 2) {
      // Estación 0 al 22% (sostiene mientras viaja hasta el 62%)
      // Estación 1 al 62% (sostiene mientras viaja hasta el aterrizaje al 100%)
      return (stationIdx === 0) ? 0.22 : 0.62;
    } else {
      // Para 3 sílabas
      return [0.18, 0.48, 0.76][stationIdx] || ((stationIdx + 0.5) / count);
    }
  }

  function getStationCoords(stationIdx, numSyllables) {
    const geom = getRampGeometry(numSyllables);
    const t = getStationT(stationIdx, numSyllables);
    return {
      x: getQuadraticBezierPoint(geom.startX, geom.ctrlX, geom.endX, t),
      y: getQuadraticBezierPoint(geom.startY, geom.ctrlY, geom.endY, t)
    };
  }

  function getLandingCoords(numSyllables) {
    const geom = getRampGeometry(numSyllables);
    return { x: geom.endX, y: geom.endY };
  }

  // --- DIBUJADO DE LA ESCENA ---
  function slideLoop() {
    if (!SlideGame.isRunning) return;
    SlideGame.time += 0.02;
    SlideGame.pulseTimer += 0.04;

    renderSlideScene();
    SlideGame.animId = requestAnimationFrame(slideLoop);
  }

  function renderSlideScene() {
    const ctx = SlideGame.ctx;
    const w = SlideGame.width;
    const h = SlideGame.height;
    const c = SlideGame.currentCase;

    ctx.clearRect(0, 0, w, h);

    // 1. Fondo cósmico
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#090D16');
    bgGrad.addColorStop(0.5, '#1E1B4B');
    bgGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Estrellas titilantes
    ctx.fillStyle = '#FFFFFF';
    SlideGame.stars.forEach(st => {
      const alpha = 0.3 + 0.7 * Math.abs(Math.sin(SlideGame.time * 2 + st.twinkle));
      ctx.globalAlpha = alpha;
      ctx.fillRect(st.x * w, st.y * h, st.size, st.size);
    });
    ctx.globalAlpha = 1.0;

    if (!c) return;

    // 2. Geometría de la Rampa Adaptada
    const syllables = c.syllables || ['A', 'B'];
    const numStations = syllables.length;
    const geom = getRampGeometry(numStations);

    // Tubo base exterior con brillo de neón
    ctx.save();
    ctx.shadowColor = '#38BDF8';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(geom.startX, geom.startY);
    ctx.quadraticCurveTo(geom.ctrlX, geom.ctrlY, geom.endX, geom.endY);
    ctx.stroke();

    // Riel luminoso interior
    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(geom.startX, geom.startY);
    ctx.quadraticCurveTo(geom.ctrlX, geom.ctrlY, geom.endX, geom.endY);
    ctx.stroke();
    ctx.restore();

    // 3. Estaciones de sílabas
    const radius = numStations > 2 ? 26 : 30;

    syllables.forEach((syllable, i) => {
      const coords = getStationCoords(i, numStations);
      const isCurrent = (SlideGame.activeStation === i);
      const stationT = getStationT(i, numStations);
      const isPassed = (SlideGame.rocketProgress >= stationT);

      ctx.save();
      if (isCurrent) {
        ctx.shadowColor = '#FBBF24';
        ctx.shadowBlur = 24;
        ctx.fillStyle = '#F59E0B';
      } else if (isPassed) {
        ctx.shadowColor = '#34D399';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#10B981';
      } else {
        ctx.fillStyle = '#1E293B';
      }

      const rad = isCurrent ? radius + 5 : radius;
      ctx.beginPath();
      ctx.arc(coords.x, coords.y - 26, rad, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isCurrent ? '#FDE68A' : (isPassed ? '#6EE7B7' : '#38BDF8');
      ctx.lineWidth = isCurrent ? 4 : 3;
      ctx.stroke();

      ctx.font = `900 ${isCurrent ? 22 : 18}px "Comic Neue", "Nunito", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = (isCurrent || isPassed) ? '#FFFFFF' : '#BAE6FD';
      ctx.fillText(syllable, coords.x, coords.y - 25);
      ctx.restore();
    });

    // 4. Plataforma de aterrizaje
    ctx.save();
    ctx.fillStyle = SlideGame.hasLanded ? '#047857' : '#334155';
    ctx.strokeStyle = SlideGame.hasLanded ? '#34D399' : '#64748B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(geom.endX, geom.endY + 12, 34, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 5. Cohete deslizándose de forma fluida y continua
    const rx = getQuadraticBezierPoint(geom.startX, geom.ctrlX, geom.endX, SlideGame.rocketProgress);
    const ry = getQuadraticBezierPoint(geom.startY, geom.ctrlY, geom.endY, SlideGame.rocketProgress);

    if (SlideGame.isSliding && SlideGame.rocketProgress > 0.03 && SlideGame.rocketProgress < 0.98) {
      ctx.save();
      ctx.translate(rx - 28, ry - 6);
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(0, 0, 9 + Math.random() * 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(-8, 0, 6 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.font = '44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const angle = (SlideGame.rocketProgress < 0.95) ? 0.35 : 0;
    ctx.translate(rx, ry - 14);
    ctx.rotate(angle);
    ctx.fillText('🚀', 0, 0);
    ctx.restore();

    // 6. Flecha indicadora animada si está esperando
    if (!SlideGame.hasLanded && !SlideGame.isSliding) {
      const bounce = Math.sin(SlideGame.pulseTimer * 4) * 8;
      ctx.save();
      ctx.fillStyle = '#FBBF24';
      ctx.font = '900 13px "Comic Neue", "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText('¡Tócame! 👇', rx, ry - 42 + bounce);
      ctx.font = '22px sans-serif';
      ctx.fillText('👇', rx, ry - 24 + bounce);
      ctx.restore();
    }

    // 7. Cartel central de Palabra Fusionada al Aterrizar
    if (SlideGame.hasLanded) {
      ctx.save();
      const bannerW = Math.min(320, w * 0.7);
      const bannerH = 46;
      const bx = (w - bannerW) / 2;
      const by = h * 0.47;

      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 16;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      roundRect(ctx, bx, by, bannerW, bannerH, 20);
      ctx.fill();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.font = '900 22px "Comic Neue", "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FBBF24';
      ctx.fillText(`✨ ${c.word} ✨`, w / 2, by + bannerH / 2);
      ctx.restore();
    }

    // 8. Dibujar las 3 tarjetas inferiores
    SlideGame.cards.forEach(card => {
      ctx.save();
      ctx.translate(card.x + card.w / 2 + (card.shake ? Math.sin(SlideGame.time * 30) * card.shake : 0), card.y + card.h / 2);
      ctx.scale(card.scale, card.scale);

      if (!SlideGame.hasLanded) {
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#1E293B';
        roundRect(ctx, -card.w / 2, -card.h / 2, card.w, card.h, 16);
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = '36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔒', 0, -15);

        ctx.font = '800 11px "Comic Neue", "Nunito", sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('Desliza el cohete', 0, card.h / 2 - 28);
        ctx.fillText('para ver', 0, card.h / 2 - 14);

      } else {
        ctx.shadowColor = (card === SlideGame.selectedCard) ? '#34D399' : 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = (card === SlideGame.selectedCard) ? 16 : 8;
        ctx.fillStyle = '#FFFFFF';
        roundRect(ctx, -card.w / 2, -card.h / 2, card.w, card.h, 16);
        ctx.fill();

        ctx.strokeStyle = (card === SlideGame.selectedCard) ? '#10B981' : '#38BDF8';
        ctx.lineWidth = (card === SlideGame.selectedCard) ? 4 : 2.5;
        ctx.stroke();
        ctx.shadowBlur = 0;

        const img = getCachedImg(card.image);
        if (img && img.complete && img.naturalWidth > 0) {
          const ih = card.h * 0.52;
          const iw = (img.naturalWidth / img.naturalHeight) * ih;
          ctx.drawImage(img, -iw / 2, -card.h / 2 + 10, iw, ih);
        }

        ctx.font = '900 16px "Comic Neue", "Nunito", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#0F172A';
        ctx.fillText(card.word, 0, card.h / 2 - 14);
      }

      ctx.restore();
    });

    // 9. Indicador visual cuando el locutor está hablando (Respeto de turno)
    if (SlideGame.isSpeaking) {
      ctx.save();
      const badgeW = Math.min(300, w * 0.75);
      const badgeH = 34;
      const bx = (w - badgeW) / 2;
      const by = 16;
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 12;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.95)';
      roundRect(ctx, bx, by, badgeW, badgeH, 17);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.font = '900 13px "Comic Neue", "Nunito", sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👂 Crin está hablando... Escucha', w / 2, by + badgeH / 2);
      ctx.restore();
    }

    // 10. Partículas de estrellas y chispas
    updateAndDrawSparks(ctx);
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

  function spawnSparks(x, y, color, count) {
    const n = count || 20;
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4.5;
      SlideGame.sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: 3 + Math.random() * 4,
        color: color || '#FBBF24',
        alpha: 1.0,
        char: Math.random() > 0.4 ? '⭐' : '✨'
      });
    }
  }

  function updateAndDrawSparks(ctx) {
    for (let i = SlideGame.sparks.length - 1; i >= 0; i--) {
      const sp = SlideGame.sparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.vy += 0.08;
      sp.alpha -= 0.025;
      if (sp.alpha <= 0) {
        SlideGame.sparks.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, sp.alpha);
      ctx.font = `${Math.round(sp.size * 3.5)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sp.char, sp.x, sp.y);
      ctx.restore();
    }
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
      getSlideAudioCtx();
      // 🔒 REGLA UNIVERSAL: No se puede interactuar mientras el locutor esté hablando
      if (SlideGame.isSpeaking || SlideGame.isAdvancing) return;
      const pos = getCoords(e);

      // Si hace clic en la parte superior (cohete o rampa)
      if (pos.y < SlideGame.height * 0.55) {
        if (!SlideGame.isSliding) {
          if (SlideGame.hasLanded) {
            SlideGame.rocketProgress = 0;
            SlideGame.hasLanded = false;
            SlideGame.activeStation = -1;
            updateSlideHUD();
          }
          startContinuousBlendSequence();
        }
        return;
      }

      // Si hace clic en una de las tarjetas de abajo
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

  function handleSlideCardClick(card) {
    if (SlideGame.isAdvancing) return;

    // 🔒 BLOQUEO PEDAGÓGICO: Si aún no se deslizó el cohete, no se permite responder
    if (!SlideGame.hasLanded) {
      card.shake = 8;
      playErrorSound();

      SlideGame.floatingTexts.push({
        x: card.x + card.w / 2,
        y: card.y - 15,
        text: '¡Toca el cohete primero! 🚀',
        color: '#F59E0B',
        alpha: 1.0,
        vy: -1.2
      });

      if (typeof speakText === 'function') {
        speakText('Primero toca el cohete para unir los sonidos de las estrellas.', () => {});
      }

      setTimeout(() => { card.shake = 0; }, 400);
      return;
    }

    // 🎯 Cohete aterrizado: evaluar respuesta
    if (card.isTarget) {
      SlideGame.isAdvancing = true;
      SlideGame.selectedCard = card;
      card.scale = 1.12;

      playSuccessSound();

      SlideGame.floatingTexts.push({
        x: card.x + card.w / 2,
        y: card.y - 20,
        text: `¡CORRECTO! ¡Es ${card.word}! ⭐`,
        color: '#10B981',
        alpha: 1.0,
        vy: -1.2
      });

      if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
        activeChildProfile.coins = (activeChildProfile.coins || 0) + 10;
        if (typeof saveActiveChildProfile === 'function') saveActiveChildProfile();
      }

      if (typeof speakText === 'function') {
        speakText(`¡Excelente! ¡Esa es ${card.pron}!`, () => {});
      }

      setTimeout(() => {
        if (!SlideGame.isRunning) return;
        SlideGame.currentCaseIndex++;
        if (SlideGame.currentCaseIndex >= SlideGame.cases.length) {
          showSlideVictoryModal();
        } else {
          setupSlideCase(SlideGame.currentCaseIndex);
        }
      }, 1800);

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
        speakText(`Esa es ${card.pron}. Busca la imagen de ${SlideGame.currentCase.pron}.`);
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

})();
