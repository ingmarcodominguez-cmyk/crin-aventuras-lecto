// =========================================================================
// CRIN AVENTURAS DE LECTOESCRITURA - EL TREN DE LOS SONIDOS
// Módulo Psicopedagógico de Conciencia Fonémica y Cajas de Elkonin (DUA)
// =========================================================================

(function() {
  'use strict';

  const TrainGame = {
    canvas: null,
    ctx: null,
    width: 800,
    height: 520,
    isRunning: false,
    animId: null,
    time: 0,

    // Modo: 'task' o 'random'
    mode: 'task',

    // Palabra objetivo actual y cola
    wordList: [],
    currentWordIndex: 0,
    currentWordObj: null,
    currentLetters: [],
    currentLetterIndex: 0, // Siguiente casilla/vagón a completar

    // Elementos en escena
    balloons: [],
    steamPuffs: [],
    sparkles: [],
    floatingTexts: [],

    // Estado del tren
    train: {
      x: 120,
      y: 380,
      targetX: 120,
      isDeparting: false,
      departSpeed: 0,
      wheelAngle: 0,
      whistleSteam: 0
    },

    // Arrastre e interacción
    draggedBalloon: null,
    pointer: { x: 0, y: 0, isDown: false },

    isSpeaking: false,
    isAdvancing: false,
    voiceTimeout: null
  };

  // BANCO CANÓNICO DE PALABRAS DE RESPALDO (3 y 4 fonemas de alta frecuencia)
  const FALLBACK_WORDS = [
    { word: 'SOL', letras: ['S', 'O', 'L'], emoji: 'assets/sol.png', pron: 'sol' },
    { word: 'PAN', letras: ['P', 'A', 'N'], emoji: 'assets/pan.png', pron: 'pan' },
    { word: 'PEZ', letras: ['P', 'E', 'Z'], emoji: 'assets/pez.png', pron: 'pez' },
    { word: 'PATO', letras: ['P', 'A', 'T', 'O'], emoji: 'assets/pato.png', pron: 'pato' },
    { word: 'GATO', letras: ['G', 'A', 'T', 'O'], emoji: 'assets/gato.png', pron: 'gato' },
    { word: 'SOPA', letras: ['S', 'O', 'P', 'A'], emoji: 'assets/sopa.png', pron: 'sopa' },
    { word: 'CASA', letras: ['C', 'A', 'S', 'A'], emoji: 'assets/casa.png', pron: 'casa' },
    { word: 'LUNA', letras: ['L', 'U', 'N', 'A'], emoji: 'assets/luna.png', pron: 'luna' },
    { word: 'MANO', letras: ['M', 'A', 'N', 'O'], emoji: 'assets/mano.png', pron: 'mano' },
    { word: 'BOLA', letras: ['B', 'O', 'L', 'A'], emoji: 'assets/bola.png', pron: 'bola' }
  ];

  // PALETAS DE COLOR PARA GLOBOS DE FONEMAS
  const BALLOON_PALETTES = [
    { main: '#EF4444', light: '#FCA5A5', border: '#B91C1C' }, // Rojo
    { main: '#3B82F6', light: '#93C5FD', border: '#1D4ED8' }, // Azul
    { main: '#10B981', light: '#6EE7B7', border: '#047857' }, // Verde
    { main: '#F59E0B', light: '#FCD34D', border: '#B45309' }, // Ámbar
    { main: '#8B5CF6', light: '#C084FC', border: '#6D28D9' }, // Violeta
    { main: '#EC4899', light: '#F472B6', border: '#BE185D' }  // Rosa
  ];

  // CACHE DE IMÁGENES
  const imageCache = {};
  function getCachedImage(src) {
    if (!src) return null;
    if (imageCache[src]) return imageCache[src];
    const img = new Image();
    img.src = src;
    imageCache[src] = img;
    return img;
  }

  // Comprueba si una palabra está permitida
  function isWordPermitted(wordText) {
    if (!wordText) return false;
    const clean = wordText.trim().toUpperCase();
    try {
      if (typeof isWordDeleted === 'function' && isWordDeleted(clean)) return false;
      const raw = localStorage.getItem('crin_deleted_words');
      if (raw) {
        const deleted = JSON.parse(raw);
        if (Array.isArray(deleted) && deleted.includes(clean)) return false;
      }
    } catch(e) {}
    return true;
  }

  function getActivePetCardSrc() {
    let pet = '🦄';
    try {
      if (typeof activeChildProfile !== 'undefined' && activeChildProfile && activeChildProfile.activePet) {
        pet = activeChildProfile.activePet;
      }
    } catch(e) {}
    const map = {
      '🦄': 'assets/card_unicornio_arquero.png?v=250',
      '🦊': 'assets/card_zorro_arquero.png?v=250',
      '🐰': 'assets/card_conejo_arquero.png?v=250',
      '🐶': 'assets/card_perro_arquero.png?v=250'
    };
    return map[pet] || map['🦄'];
  }

  // --- CONTROL DE PANTALLA ---
  window.openTrainQuestScreen = function(mode) {
    TrainGame.mode = mode || 'task';
    if (typeof stopAllAudio === 'function') stopAllAudio();
    if (typeof switchScreen === 'function') switchScreen('train');

    const screen = document.getElementById('screen-train');
    if (screen) screen.classList.add('active');

    TrainGame.isRunning = true;
    initTrainGame();

    setTimeout(resizeTrainCanvas, 50);
    setTimeout(resizeTrainCanvas, 150);
    setTimeout(resizeTrainCanvas, 300);
  };

  window.closeTrainAndReturnToMap = function() {
    TrainGame.isRunning = false;
    if (TrainGame.animId) cancelAnimationFrame(TrainGame.animId);
    if (TrainGame.voiceTimeout) clearTimeout(TrainGame.voiceTimeout);
    if (typeof stopAllAudio === 'function') stopAllAudio();

    if (typeof switchScreen === 'function') {
      switchScreen('map');
    }
  };

  window.stopTrainGame = function() {
    TrainGame.isRunning = false;
    if (TrainGame.animId) cancelAnimationFrame(TrainGame.animId);
    if (TrainGame.voiceTimeout) clearTimeout(TrainGame.voiceTimeout);
  };

  // --- INICIALIZACIÓN ---
  function initTrainGame() {
    TrainGame.canvas = document.getElementById('train-game-canvas');
    if (!TrainGame.canvas) return;
    TrainGame.ctx = TrainGame.canvas.getContext('2d');

    buildWordQueue();
    setupTrainEventListeners();
    resizeTrainCanvas();

    TrainGame.currentWordIndex = 0;
    setupTrainWord(TrainGame.currentWordIndex);

    if (TrainGame.animId) cancelAnimationFrame(TrainGame.animId);
    TrainGame.animId = requestAnimationFrame(trainGameLoop);
  }

  function buildWordQueue() {
    const list = [];
    if (TrainGame.mode === 'task') {
      try {
        if (typeof activeChildProfile !== 'undefined' && activeChildProfile && activeChildProfile.taskWords && activeChildProfile.taskWords.length > 0) {
          activeChildProfile.taskWords.forEach(wText => {
            const clean = (typeof removeAccents === 'function') ? removeAccents(wText) : wText.toUpperCase();
            if (isWordPermitted(clean)) {
              if (typeof CANONICAL_WORD_LEXICON !== 'undefined' && CANONICAL_WORD_LEXICON[clean]) {
                const item = CANONICAL_WORD_LEXICON[clean];
                list.push({
                  word: item.escritura,
                  letras: item.letras || clean.split(''),
                  emoji: item.emoji,
                  pron: item.pronunciacion || item.escritura
                });
              } else {
                list.push({
                  word: clean,
                  letras: clean.split(''),
                  emoji: 'assets/' + clean.toLowerCase() + '.png',
                  pron: clean.toLowerCase()
                });
              }
            }
          });
        }
      } catch(e) {}
    }

    if (list.length === 0) {
      if (typeof CANONICAL_WORD_LEXICON !== 'undefined') {
        const keys = Object.keys(CANONICAL_WORD_LEXICON).filter(k => isWordPermitted(k) && k.length <= 5);
        keys.sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(10, keys.length); i++) {
          const item = CANONICAL_WORD_LEXICON[keys[i]];
          list.push({
            word: item.escritura,
            letras: item.letras || item.escritura.split(''),
            emoji: item.emoji,
            pron: item.pronunciacion || item.escritura
          });
        }
      }
    }

    if (list.length === 0) {
      FALLBACK_WORDS.forEach(fb => {
        if (isWordPermitted(fb.word)) list.push(fb);
      });
    }

    TrainGame.wordList = list;
  }

  function resizeTrainCanvas() {
    if (!TrainGame.canvas) return;
    const container = TrainGame.canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const w = Math.max(320, Math.floor(rect.width) || window.innerWidth || 800);
    const h = Math.max(360, Math.floor(rect.height) || (window.innerHeight - 170) || 520);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    TrainGame.canvas.width = w * dpr;
    TrainGame.canvas.height = h * dpr;
    TrainGame.ctx.scale(dpr, dpr);

    TrainGame.width = w;
    TrainGame.height = h;

    TrainGame.train.y = h * 0.72;
    TrainGame.train.x = Math.max(70, w * 0.12);
    TrainGame.train.targetX = TrainGame.train.x;
  }

  // --- CONFIGURACIÓN DE PALABRA / TREN ---
  function setupTrainWord(index) {
    if (TrainGame.wordList.length === 0) return;
    const wObj = TrainGame.wordList[index % TrainGame.wordList.length];
    TrainGame.currentWordObj = wObj;
    TrainGame.currentLetters = wObj.letras;
    TrainGame.currentLetterIndex = 0;
    TrainGame.isAdvancing = false;
    TrainGame.sparkles = [];
    TrainGame.floatingTexts = [];
    TrainGame.steamPuffs = [];
    TrainGame.train.isDeparting = false;
    TrainGame.train.departSpeed = 0;
    TrainGame.train.x = Math.max(70, TrainGame.width * 0.12);

    spawnLetterBalloons(wObj);
    updateTrainHUD();

    if (TrainGame.voiceTimeout) clearTimeout(TrainGame.voiceTimeout);
    TrainGame.voiceTimeout = setTimeout(() => {
      speakCurrentTrainMission();
    }, 450);
  }

  function spawnLetterBalloons(wObj) {
    TrainGame.balloons = [];
    const letters = wObj.letras;
    const w = TrainGame.width;
    const h = TrainGame.height;
    const skyTop = 50;
    const skyBottom = h * 0.44;

    // Fonemas objetivo
    letters.forEach((letra, idx) => {
      const pal = BALLOON_PALETTES[idx % BALLOON_PALETTES.length];
      TrainGame.balloons.push(createBalloon(letra, true, idx, pal, skyTop, skyBottom));
    });

    // 2 letras distractoras
    const alphabet = 'ABCDEFGLMNPRSTUVZ'.split('').filter(l => !letters.includes(l));
    alphabet.sort(() => Math.random() - 0.5);
    for (let i = 0; i < 2; i++) {
      const letra = alphabet[i];
      const pal = BALLOON_PALETTES[(letters.length + i) % BALLOON_PALETTES.length];
      TrainGame.balloons.push(createBalloon(letra, false, -1, pal, skyTop, skyBottom));
    }

    // Mezclar posiciones en el cielo
    const total = TrainGame.balloons.length;
    TrainGame.balloons.forEach((b, idx) => {
      b.x = 45 + ((w - 90) / total) * idx + (Math.random() - 0.5) * 20;
      b.y = skyTop + 30 + (idx % 2) * 55 + Math.random() * 20;
      b.initialY = b.y;
    });
  }

  function createBalloon(letter, isTarget, targetOrder, pal, skyTop, skyBottom) {
    return {
      letter: letter,
      isTarget: isTarget,
      targetOrder: targetOrder,
      palette: pal,
      x: 200,
      y: 120,
      initialY: 120,
      radius: 28,
      floatPhase: Math.random() * Math.PI * 2,
      floatSpeed: 1.2 + Math.random() * 0.8,
      isPlaced: false,
      isFlyingToWagon: false,
      targetWagonX: 0,
      targetWagonY: 0,
      flyProgress: 0
    };
  }

  // --- LOCUCIÓN PROSÓDICA ---
  window.speakCurrentTrainMission = function() {
    if (!TrainGame.isRunning || !TrainGame.currentWordObj) return;
    const targetLetter = TrainGame.currentLetters[TrainGame.currentLetterIndex];
    if (!targetLetter) return;

    let textToSpeak = '';
    if (TrainGame.currentLetterIndex === 0) {
      const spelled = TrainGame.currentLetters.join(' - ');
      textToSpeak = `¡Llenemos el tren de la palabra ${TrainGame.currentWordObj.pron}! Los sonidos son: ${spelled}. ¡Busca la primera letra: ${targetLetter}!`;
    } else {
      textToSpeak = `¡Muy bien! Ahora busca el siguiente sonido: ${targetLetter}`;
    }

    if (typeof speakText === 'function') {
      TrainGame.isSpeaking = true;
      speakText(textToSpeak, () => {
        TrainGame.isSpeaking = false;
      });
    }
  };

  function updateTrainHUD() {
    const wObj = TrainGame.currentWordObj;
    if (!wObj) return;

    const titleEl = document.getElementById('train-word-title');
    if (titleEl) titleEl.innerText = `Palabra ${TrainGame.currentWordIndex + 1} de ${TrainGame.wordList.length}`;

    const targetWordEl = document.getElementById('train-target-word');
    if (targetWordEl) targetWordEl.innerText = wObj.word;

    const imgEl = document.getElementById('train-target-img');
    if (imgEl) imgEl.src = wObj.emoji;

    const elkoninSlots = document.getElementById('train-elkonin-slots');
    if (elkoninSlots) {
      elkoninSlots.innerHTML = TrainGame.currentLetters.map((letter, idx) => {
        const isPlaced = idx < TrainGame.currentLetterIndex;
        const isCurrent = idx === TrainGame.currentLetterIndex;

        let bg = '#F1F5F9';
        let color = '#64748B';
        let border = '2px solid #CBD5E1';

        if (isPlaced) {
          bg = '#10B981';
          color = '#FFFFFF';
          border = '2px solid #059669';
        } else if (isCurrent) {
          bg = '#FEF08A';
          color = '#854D0E';
          border = '2px solid #EAB308';
        }

        return `
          <div style="background: ${bg}; color: ${color}; border: ${border}; border-radius: 12px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 900; box-shadow: 0 2px 6px rgba(0,0,0,0.08);">
            ${isPlaced ? letter : (isCurrent ? '?' : '—')}
          </div>
        `;
      }).join('');
    }
  }

  // --- BUCLE PRINCIPAL DE JUEGO ---
  function trainGameLoop() {
    if (!TrainGame.isRunning) return;
    TrainGame.time += 0.02;

    updateTrainPhysics();
    renderTrainGraphics();

    TrainGame.animId = requestAnimationFrame(trainGameLoop);
  }

  // --- FÍSICA Y ACTUALIZACIÓN ---
  function updateTrainPhysics() {
    const w = TrainGame.width;
    const h = TrainGame.height;

    // 1. Oscilación suave de los globos en el cielo
    TrainGame.balloons.forEach(b => {
      if (b.isPlaced) return;

      if (b.isFlyingToWagon) {
        b.flyProgress += 0.055;
        if (b.flyProgress >= 1.0) {
          b.flyProgress = 1.0;
          b.isFlyingToWagon = false;
          b.isPlaced = true;
          finishPlacingLetter(b);
        }
        b.x = b.startX + (b.targetWagonX - b.startX) * b.flyProgress;
        b.y = b.startY + (b.targetWagonY - b.startY) * b.flyProgress - Math.sin(b.flyProgress * Math.PI) * 50;
      } else if (b !== TrainGame.draggedBalloon) {
        b.floatPhase += b.floatSpeed * 0.03;
        b.y = b.initialY + Math.sin(b.floatPhase) * 7;
      }
    });

    // 2. Avance del tren cuando parte
    const t = TrainGame.train;
    if (t.isDeparting) {
      t.departSpeed += 0.12;
      t.x += t.departSpeed;
      t.wheelAngle += t.departSpeed * 0.08;

      // Vapor festivo constante
      if (Math.random() < 0.6) {
        createSteamPuff(t.x + 85, t.y - 65, '#FFFFFF', 18 + Math.random() * 12);
      }
    } else {
      // Vapor suave en ralentí
      if (Math.random() < 0.15) {
        createSteamPuff(t.x + 85, t.y - 65, 'rgba(255,255,255,0.7)', 10 + Math.random() * 8);
      }
    }

    // 3. Vapor y humo
    for (let i = TrainGame.steamPuffs.length - 1; i >= 0; i--) {
      const sp = TrainGame.steamPuffs[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.radius += 0.35;
      sp.alpha -= 0.015;
      if (sp.alpha <= 0) {
        TrainGame.steamPuffs.splice(i, 1);
      }
    }

    // 4. Destellos
    for (let i = TrainGame.sparkles.length - 1; i >= 0; i--) {
      const s = TrainGame.sparkles[i];
      s.x += s.vx;
      s.y += s.vy;
      s.alpha -= 0.03;
      if (s.alpha <= 0) {
        TrainGame.sparkles.splice(i, 1);
      }
    }

    // 5. Textos flotantes
    for (let i = TrainGame.floatingTexts.length - 1; i >= 0; i--) {
      const ft = TrainGame.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      if (ft.alpha <= 0) {
        TrainGame.floatingTexts.splice(i, 1);
      }
    }
  }

  // --- RENDERIZADO GRÁFICO (CANVAS) ---
  function renderTrainGraphics() {
    const ctx = TrainGame.ctx;
    const w = TrainGame.width;
    const h = TrainGame.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Cielo de tarde/mañana con degradado suave
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.68);
    sky.addColorStop(0, '#60A5FA');
    sky.addColorStop(1, '#E0F2FE');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h * 0.68);

    // Nubes
    drawCloud(ctx, w * 0.15, 60, 35);
    drawCloud(ctx, w * 0.78, 80, 48);

    // Colinas verdes al fondo
    drawRollingHills(ctx, w, h * 0.68);

    // 2. Terreno y vías del ferrocarril
    drawRailway(ctx, w, h, TrainGame.train.y + 35);

    // 3. Vapor de la locomotora
    drawSteamPuffs(ctx);

    // 4. El Tren (Locomotora + Vagones de Elkonin)
    drawTrainAndWagons(ctx);

    // 5. Globos aerostáticos con fonemas
    TrainGame.balloons.forEach(b => {
      if (!b.isPlaced) drawBalloon(ctx, b);
    });

    // 6. Destellos y textos flotantes
    drawSparkles(ctx);
    drawFloatingTexts(ctx);
  }

  // --- DIBUJO DE ELEMENTOS ESCÉNICOS ---
  function drawCloud(ctx, cx, cy, r) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.7, cy - r * 0.2, r * 0.8, 0, Math.PI * 2);
    ctx.arc(cx + r * 1.3, cy, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawRollingHills(ctx, w, groundY) {
    ctx.save();
    ctx.fillStyle = '#86EFAC';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.quadraticCurveTo(w * 0.3, groundY - 60, w * 0.65, groundY);
    ctx.quadraticCurveTo(w * 0.85, groundY - 40, w, groundY);
    ctx.lineTo(w, groundY);
    ctx.lineTo(0, groundY);
    ctx.fill();

    // Pasto primer plano
    ctx.fillStyle = '#4ADE80';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.quadraticCurveTo(w * 0.45, groundY - 25, w, groundY);
    ctx.lineTo(w, groundY);
    ctx.lineTo(0, groundY);
    ctx.fill();
    ctx.restore();
  }

  function drawRailway(ctx, w, h, railY) {
    ctx.save();

    // Suelo de balasto (grava)
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(0, railY - 10, w, h - railY + 10);

    // Traviesas de madera
    ctx.fillStyle = '#78350F';
    for (let x = 0; x < w; x += 22) {
      ctx.fillRect(x, railY - 4, 12, 28);
    }

    // Dos rieles de acero brillante
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(0, railY, w, 4);
    ctx.fillRect(0, railY + 14, w, 4);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, railY, w, 1.5);
    ctx.fillRect(0, railY + 14, w, 1.5);

    ctx.restore();
  }

  // --- DIBUJO DEL TREN Y VAGONES DE ELKONIN ---
  function drawTrainAndWagons(ctx) {
    const t = TrainGame.train;
    const lx = t.x;
    const ly = t.y;

    // 1. Locomotora a vapor estilizada
    drawLocomotive(ctx, lx, ly, t.wheelAngle);

    // 2. Vagones de Elkonin (tantos como fonemas tenga la palabra)
    const letters = TrainGame.currentLetters;
    const wagonWidth = 72;
    const wagonSpacing = 82;

    letters.forEach((letra, idx) => {
      // Cada vagón va acoplado detrás de la locomotora (hacia la izquierda o derecha)
      // Locomotora avanza hacia la derecha, vagones cuelgan hacia la izquierda
      const wx = lx - 40 - (idx + 1) * wagonSpacing;
      const wy = ly;

      drawElkoninWagon(ctx, wx, wy, letra, idx);
    });
  }

  function drawLocomotive(ctx, x, y, wheelAngle) {
    ctx.save();

    // Caldera de la locomotora
    ctx.fillStyle = '#DC2626'; // Rojo llamativo
    ctx.beginPath();
    ctx.roundRect(x, y - 48, 95, 48, 10);
    ctx.fill();

    // Franja dorada decorativa
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(x + 10, y - 44, 6, 44);
    ctx.fillRect(x + 50, y - 44, 6, 44);

    // Cabina del conductor
    ctx.fillStyle = '#B91C1C';
    ctx.beginPath();
    ctx.roundRect(x - 35, y - 72, 45, 72, 8);
    ctx.fill();

    // Techo curvo de la cabina
    ctx.fillStyle = '#7F1D1D';
    ctx.beginPath();
    ctx.roundRect(x - 42, y - 78, 58, 12, 4);
    ctx.fill();

    // Ventanilla con la mascota activa asomada
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.roundRect(x - 28, y - 62, 30, 26, 6);
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 2;
    ctx.stroke();

    const petCard = getCachedImage(getActivePetCardSrc());
    if (petCard && petCard.complete && petCard.naturalWidth > 0) {
      ctx.drawImage(petCard, x - 26, y - 60, 26, 26);
    }

    // Chimenea de vapor
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.moveTo(x + 68, y - 48);
    ctx.lineTo(x + 65, y - 72);
    ctx.lineTo(x + 85, y - 72);
    ctx.lineTo(x + 82, y - 48);
    ctx.closePath();
    ctx.fill();

    // Corona de la chimenea
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.roundRect(x + 62, y - 76, 26, 6, 2);
    ctx.fill();

    // Foco delantero brillante
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(x + 95, y - 24, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ruedas de la locomotora (grandes con radios)
    drawTrainWheel(ctx, x - 15, y + 4, 18, wheelAngle);
    drawTrainWheel(ctx, x + 30, y + 4, 18, wheelAngle);
    drawTrainWheel(ctx, x + 72, y + 4, 18, wheelAngle);

    // Barra de transmisión de las ruedas
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 15 + Math.cos(wheelAngle) * 10, y + 4 + Math.sin(wheelAngle) * 10);
    ctx.lineTo(x + 72 + Math.cos(wheelAngle) * 10, y + 4 + Math.sin(wheelAngle) * 10);
    ctx.stroke();

    ctx.restore();
  }

  function drawElkoninWagon(ctx, wx, wy, letter, slotIdx) {
    ctx.save();

    const w = 72;
    const h = 42;
    const isCompleted = slotIdx < TrainGame.currentLetterIndex;
    const isCurrent = slotIdx === TrainGame.currentLetterIndex;

    // Enganche entre vagones
    ctx.fillStyle = '#475569';
    ctx.fillRect(wx + w, wy - 14, 14, 6);

    // Cuerpo del vagón
    const grad = ctx.createLinearGradient(wx, wy - h, wx, wy);
    if (isCompleted) {
      grad.addColorStop(0, '#10B981');
      grad.addColorStop(1, '#047857');
    } else if (isCurrent) {
      grad.addColorStop(0, '#F59E0B');
      grad.addColorStop(1, '#D97706');
    } else {
      grad.addColorStop(0, '#64748B');
      grad.addColorStop(1, '#475569');
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(wx, wy - h, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = isCompleted ? '#34D399' : (isCurrent ? '#FCD34D' : '#94A3B8');
    ctx.lineWidth = 2;
    ctx.stroke();

    // Caja de Elkonin (recuadro central donde encaja la letra)
    ctx.fillStyle = isCompleted ? '#ECFDF5' : (isCurrent ? '#FEFCE8' : 'rgba(255,255,255,0.2)');
    ctx.beginPath();
    ctx.roundRect(wx + 10, wy - h + 6, w - 20, h - 14, 6);
    ctx.fill();
    ctx.strokeStyle = isCompleted ? '#10B981' : (isCurrent ? '#EAB308' : '#CBD5E1');
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Contenido del vagón: Letra si ya fue encajada
    if (isCompleted) {
      ctx.fillStyle = '#065F46';
      ctx.font = '900 24px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, wx + w / 2, wy - h / 2 - 1);
    } else if (isCurrent) {
      // Indicador pulsante "?"
      ctx.fillStyle = '#854D0E';
      ctx.font = '900 20px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', wx + w / 2, wy - h / 2 - 1);
    }

    // Ruedas del vagón
    drawTrainWheel(ctx, wx + 16, wy + 4, 12, TrainGame.train.wheelAngle);
    drawTrainWheel(ctx, wx + w - 16, wy + 4, 12, TrainGame.train.wheelAngle);

    ctx.restore();
  }

  function drawTrainWheel(ctx, cx, cy, r, angle) {
    ctx.save();
    ctx.translate(cx, cy);

    // Neumático de acero
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Llanta interior
    ctx.fillStyle = '#64748B';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
    ctx.fill();

    // Radios giratorios
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a + angle) * r * 0.7, Math.sin(a + angle) * r * 0.7);
      ctx.stroke();
    }

    // Eje central
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- DIBUJO DE GLOBOS CON FONEMAS ---
  function drawBalloon(ctx, b) {
    ctx.save();
    ctx.translate(b.x, b.y);

    const r = b.radius;
    const p = b.palette;

    // Cuerda del globo colgante
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, r + 4);
    ctx.quadraticCurveTo(Math.sin(b.floatPhase) * 6, r + 18, 0, r + 30);
    ctx.stroke();

    // Nudo del globo
    ctx.fillStyle = p.border;
    ctx.beginPath();
    ctx.moveTo(-4, r + 4);
    ctx.lineTo(4, r + 4);
    ctx.lineTo(0, r);
    ctx.closePath();
    ctx.fill();

    // Cuerpo esférico del globo aerostático
    const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r);
    grad.addColorStop(0, p.light);
    grad.addColorStop(0.7, p.main);
    grad.addColorStop(1, p.border);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Brillo superior
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.35, r * 0.3, r * 0.15, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // LETRA / FONEMA en alto contraste
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 4;
    ctx.fillText(b.letter, 0, 1);

    ctx.restore();
  }

  function drawSteamPuffs(ctx) {
    ctx.save();
    TrainGame.steamPuffs.forEach(sp => {
      ctx.fillStyle = sp.color;
      ctx.globalAlpha = Math.max(0, sp.alpha);
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawSparkles(ctx) {
    ctx.save();
    TrainGame.sparkles.forEach(s => {
      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0, s.alpha);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawFloatingTexts(ctx) {
    ctx.save();
    TrainGame.floatingTexts.forEach(ft => {
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = '900 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 5;
      ctx.fillText(ft.text, ft.x, ft.y);
    });
    ctx.restore();
  }

  // --- EVENTOS TÁCTILES Y SELECCIÓN DE GLOBO ---
  function setupTrainEventListeners() {
    const canvas = TrainGame.canvas;
    if (!canvas) return;

    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (TrainGame.width / rect.width),
        y: (clientY - rect.top) * (TrainGame.height / rect.height)
      };
    }

    function onPointerDown(e) {
      if (TrainGame.isAdvancing || TrainGame.train.isDeparting) return;
      const pos = getCoords(e);
      TrainGame.pointer.x = pos.x;
      TrainGame.pointer.y = pos.y;
      TrainGame.pointer.isDown = true;

      for (let i = TrainGame.balloons.length - 1; i >= 0; i--) {
        const b = TrainGame.balloons[i];
        if (b.isPlaced || b.isFlyingToWagon) continue;
        const dx = pos.x - b.x;
        const dy = pos.y - b.y;
        if (Math.hypot(dx, dy) < b.radius + 14) {
          handleBalloonSelected(b);
          break;
        }
      }
    }

    function onPointerMove(e) {
      if (!TrainGame.pointer.isDown) return;
      const pos = getCoords(e);
      TrainGame.pointer.x = pos.x;
      TrainGame.pointer.y = pos.y;
    }

    function onPointerUp() {
      TrainGame.pointer.isDown = false;
      TrainGame.draggedBalloon = null;
    }

    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });
  }

  // --- LÓGICA DE ACIERTO O ERROR ---
  function handleBalloonSelected(b) {
    if (b.isPlaced || b.isFlyingToWagon || TrainGame.isAdvancing) return;

    const targetLetter = TrainGame.currentLetters[TrainGame.currentLetterIndex];
    const isCorrect = (b.letter === targetLetter);

    if (isCorrect) {
      // ¡ACIERTO! El globo viaja mágicamente hacia su vagón
      const slotIdx = TrainGame.currentLetterIndex;
      const wagonSpacing = 82;
      const targetX = TrainGame.train.x - 40 - (slotIdx + 1) * wagonSpacing + 36;
      const targetY = TrainGame.train.y - 20;

      b.isFlyingToWagon = true;
      b.startX = b.x;
      b.startY = b.y;
      b.targetWagonX = targetX;
      b.targetWagonY = targetY;
      b.flyProgress = 0;

      playChimeNote();
    } else {
      // ERROR AMIGABLE: Sacudida suave y feedback verbal constructivo
      playBoingSound();
      createFloatingText(b.x, b.y - 30, `¡Esa es ${b.letter}!`, '#F43F5E');

      if (typeof speakText === 'function') {
        TrainGame.isSpeaking = true;
        speakText(`Esa es ${b.letter}. ¡Sigue buscando ${targetLetter}!`, () => {
          TrainGame.isSpeaking = false;
        });
      }
    }
  }

  function finishPlacingLetter(b) {
    createSparklesExplosion(b.targetWagonX, b.targetWagonY, '#10B981', 16);
    createFloatingText(b.targetWagonX, b.targetWagonY - 40, `¡${b.letter}! ✨`, '#10B981');
    playSuccessDing();

    TrainGame.currentLetterIndex++;
    updateTrainHUD();

    // ¿Completó todos los vagones?
    if (TrainGame.currentLetterIndex >= TrainGame.currentLetters.length) {
      handleTrainCompleted();
    } else {
      const nextLetter = TrainGame.currentLetters[TrainGame.currentLetterIndex];
      if (typeof speakText === 'function') {
        TrainGame.isSpeaking = true;
        speakText(`¡Excelente! ¡${b.letter}! Ahora busca el siguiente sonido: ${nextLetter}`, () => {
          TrainGame.isSpeaking = false;
        });
      }
    }
  }

  // --- PALABRA COMPLETA: MARCHA TRIUNFAL DEL TREN ---
  function handleTrainCompleted() {
    TrainGame.isAdvancing = true;
    const wObj = TrainGame.currentWordObj;

    // Silbato alegre del tren
    playTrainWhistleSound();
    createSteamPuff(TrainGame.train.x + 85, TrainGame.train.y - 70, '#FFFFFF', 30);

    createFloatingText(TrainGame.width * 0.5, TrainGame.height * 0.35, `¡${wObj.word}! 🚂💨`, '#F59E0B');
    createSparklesExplosion(TrainGame.width * 0.5, TrainGame.height * 0.45, '#FBBF24', 50);

    // Arrancar el tren
    TrainGame.train.isDeparting = true;

    // Recompensas en el perfil
    if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
      activeChildProfile.coins = (activeChildProfile.coins || 0) + 12;
      activeChildProfile.stars = (activeChildProfile.stars || 0) + 2;
      if (typeof saveActiveChildProfile === 'function') saveActiveChildProfile();
    }

    const onTrainDone = () => {
      setTimeout(() => {
        TrainGame.currentWordIndex++;
        if (TrainGame.currentWordIndex >= TrainGame.wordList.length) {
          showTrainVictoryModal();
        } else {
          setupTrainWord(TrainGame.currentWordIndex);
        }
      }, 900);
    };

    if (typeof speakText === 'function') {
      TrainGame.isSpeaking = true;
      speakText(`¡Chuu chuu! ¡Completaste todos los sonidos de ${wObj.pron}! ¡El tren está en marcha!`, () => {
        TrainGame.isSpeaking = false;
        onTrainDone();
      });
    } else {
      onTrainDone();
    }
  }

  function showTrainVictoryModal() {
    const modal = document.getElementById('train-victory-modal');
    if (modal) {
      modal.style.display = 'flex';
    } else {
      alert('¡Misión Cumplida! ¡El tren recorrió todo el camino!');
      window.closeTrainAndReturnToMap();
    }
  }

  window.closeTrainVictoryModal = function() {
    const modal = document.getElementById('train-victory-modal');
    if (modal) modal.style.display = 'none';
    window.closeTrainAndReturnToMap();
  };

  window.replayTrainQuest = function() {
    const modal = document.getElementById('train-victory-modal');
    if (modal) modal.style.display = 'none';
    TrainGame.currentWordIndex = 0;
    setupTrainWord(0);
  };

  // --- EFECTOS VISUALES ---
  function createSteamPuff(x, y, color, radius) {
    TrainGame.steamPuffs.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 1.5 - 2.5,
      vy: -1.8 - Math.random() * 2.0,
      radius: radius || 12,
      alpha: 0.85,
      color: color || '#FFFFFF'
    });
  }

  function createSparklesExplosion(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 5.0;
      TrainGame.sparkles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 4,
        alpha: 1.0,
        color: color
      });
    }
  }

  function createFloatingText(x, y, text, color) {
    TrainGame.floatingTexts.push({
      x: x,
      y: y,
      vy: -1.2,
      text: text,
      color: color || '#FFFFFF',
      alpha: 1.0
    });
  }

  // --- SÍNTESIS DE SONIDOS (WEB AUDIO) ---
  function playTrainWhistleSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();

      // Dos silbatos afinados (acorde de tren de vapor: F5 y A5)
      [698.46, 880.00].forEach(freq => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, actx.currentTime);
        osc.frequency.linearRampToValueAtTime(freq + 15, actx.currentTime + 0.15);
        osc.frequency.linearRampToValueAtTime(freq, actx.currentTime + 0.5);

        gain.gain.setValueAtTime(0, actx.currentTime);
        gain.gain.linearRampToValueAtTime(0.22, actx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.22, actx.currentTime + 0.45);
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.7);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start();
        osc.stop(actx.currentTime + 0.7);
      });
    } catch(e) {}
  }

  function playChimeNote() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, actx.currentTime); // E5

      gain.gain.setValueAtTime(0.2, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.25);
    } catch(e) {}
  }

  function playSuccessDing() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, actx.currentTime); // A5
      osc.frequency.setValueAtTime(1046.50, actx.currentTime + 0.08); // C6

      gain.gain.setValueAtTime(0.25, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.35);
    } catch(e) {}
  }

  function playBoingSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, actx.currentTime);
      osc.frequency.linearRampToValueAtTime(140, actx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.2, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.2);
    } catch(e) {}
  }

})();
