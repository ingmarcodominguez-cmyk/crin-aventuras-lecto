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
    wagonBounce: [],

    // Estado del tren
    train: {
      departOffset: 0,
      departSpeed: 0,
      isDeparting: false,
      wheelAngle: 0,
      idleBob: 0,
      whistleSteam: 0
    },

    // Arrastre e interacción
    draggedBalloon: null,
    pointer: { x: 0, y: 0, isDown: false },

    isSpeaking: false,
    isAdvancing: false,
    hasStarted: false,
    speechWatchdog: null,
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

  // DICCIONARIO CANÓNICO DE NOMBRES DE LETRAS EN ESPAÑOL (FONÉTICA CLARA)
  const SPANISH_LETTER_NAMES = (typeof window !== 'undefined' && window.SPANISH_LETTER_NAMES) ? window.SPANISH_LETTER_NAMES : {
    'A': 'A', 'B': 'beh', 'C': 'Ce', 'D': 'De', 'E': 'E', 'F': 'Efe', 'G': 'Ge', 'H': 'Hache',
    'I': 'I', 'J': 'Jota', 'K': 'Ka', 'L': 'Ele', 'M': 'Eme', 'N': 'Ene', 'Ñ': 'Eñe', 'O': 'O',
    'P': 'Pe', 'Q': 'Cu', 'R': 'Erre', 'S': 'Ese', 'T': 'Te', 'U': 'U', 'V': 'Ve', 'W': 'Doble ve',
    'X': 'Equis', 'Y': 'I griega', 'Z': 'Zeta'
  };
  if (typeof window !== 'undefined') {
    window.SPANISH_LETTER_NAMES = SPANISH_LETTER_NAMES;
  }


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
      '🦄': 'assets/card_unicornio_arquero.png?v=252',
      '🦊': 'assets/card_zorro_arquero.png?v=252',
      '🐰': 'assets/card_conejo_arquero.png?v=252',
      '🐶': 'assets/card_perro_arquero.png?v=252'
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
    TrainGame.hasStarted = false;
    TrainGame.isSpeaking = true;
    TrainGame.isAdvancing = false;
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
  }

  // --- CÁLCULO GEOMÉTRICO EXACTO DEL TREN Y VAGONES ---
  // Organiza los vagones para que quepan SIEMPRE en pantalla y se lean estrictamente de IZQUIERDA a DERECHA
  function getTrainConvoyGeometry() {
    const w = TrainGame.width;
    const h = TrainGame.height;
    const letters = TrainGame.currentLetters || ['P', 'A', 'T', 'O'];
    const n = Math.max(1, letters.length);

    // Margen lateral cómodo para que nada quede pegado a los bordes
    const margin = Math.max(8, Math.min(16, Math.floor(w * 0.025)));
    const availW = w - (margin * 2);

    // Espacio de enganche entre unidades
    const gap = Math.max(4, Math.min(8, Math.floor(w * 0.012)));

    // Tamaño de la locomotora (proporcional pero legible)
    let locoW = Math.max(62, Math.min(92, Math.floor(availW * 0.22)));
    let wagonW = Math.floor((availW - locoW - (n * gap)) / n);

    if (wagonW < 44) {
      locoW = Math.max(50, locoW - 14);
      wagonW = Math.max(38, Math.floor((availW - locoW - (n * gap)) / n));
    }
    wagonW = Math.min(76, wagonW);
    const wagonH = Math.round(wagonW * 0.62);
    const locoH = Math.round(locoW * 0.60);

    const totalTrainW = n * wagonW + n * gap + locoW;

    // Posición X base (centrado en la pantalla) + desplazamiento cuando arranca
    const baseX = Math.max(margin, Math.floor((w - totalTrainW) / 2)) + (TrainGame.train.departOffset || 0);
    const baseY = h * 0.74 + (TrainGame.train.idleBob || 0);

    // VAGONES EN ORDEN CANÓNICO (DE IZQUIERDA A DERECHA):
    // wagons[0] es la PRIMERA LETRA (ej: 'C' en 'CINE') en el vagón de la izquierda
    // wagons[n-1] es la ÚLTIMA LETRA (ej: 'E' en 'CINE')
    // loco está al frente a la derecha, tirando de todos hacia la derecha
    const wagons = [];
    for (let i = 0; i < n; i++) {
      const wx = baseX + i * (wagonW + gap);
      const bounce = (TrainGame.wagonBounce && TrainGame.wagonBounce[i]) ? TrainGame.wagonBounce[i] : 0;
      wagons.push({
        index: i,
        letter: letters[i],
        x: wx,
        y: baseY - bounce,
        width: wagonW,
        height: wagonH,
        centerX: wx + wagonW / 2,
        centerY: baseY - bounce - wagonH / 2
      });
    }

    const locoX = baseX + n * (wagonW + gap);
    const loco = {
      x: locoX,
      y: baseY,
      width: locoW,
      height: locoH,
      centerX: locoX + locoW / 2,
      centerY: baseY - locoH / 2
    };

    return {
      baseX,
      baseY,
      wagonW,
      wagonH,
      locoW,
      locoH,
      gap,
      wagons,
      loco,
      totalTrainW
    };
  }

  // --- CONFIGURACIÓN DE PALABRA / TREN ---
  function setupTrainWord(index) {
    if (TrainGame.wordList.length === 0) return;
    const wObj = TrainGame.wordList[index % TrainGame.wordList.length];
    TrainGame.currentWordObj = wObj;
    TrainGame.currentLetters = wObj.letras;
    TrainGame.currentLetterIndex = 0;
    TrainGame.isAdvancing = false;
    TrainGame.isSpeaking = true;
    if (TrainGame.speechWatchdog) { clearTimeout(TrainGame.speechWatchdog); TrainGame.speechWatchdog = null; }
    TrainGame.sparkles = [];
    TrainGame.floatingTexts = [];
    TrainGame.steamPuffs = [];
    TrainGame.train.isDeparting = false;
    TrainGame.train.departSpeed = 0;
    TrainGame.train.departOffset = 0;
    TrainGame.wagonBounce = new Array(wObj.letras.length).fill(0);

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
    const w = TrainGame.width || 800;
    const h = TrainGame.height || 500;
    const skyTop = 45;
    const skyBottom = h * 0.44;

    // Fonemas objetivo
    letters.forEach((letra, idx) => {
      const pal = BALLOON_PALETTES[idx % BALLOON_PALETTES.length];
      TrainGame.balloons.push(createBalloon(letra, true, idx, pal, skyTop, skyBottom, idx));
    });

    // 2 letras distractoras
    const alphabet = 'ABCDEFGLMNPRSTUVZ'.split('').filter(l => !letters.includes(l));
    alphabet.sort(() => Math.random() - 0.5);
    for (let i = 0; i < 2; i++) {
      const letra = alphabet[i];
      const pal = BALLOON_PALETTES[(letters.length + i) % BALLOON_PALETTES.length];
      TrainGame.balloons.push(createBalloon(letra, false, -1, pal, skyTop, skyBottom, letters.length + i));
    }

    // Barajar orden de aparición y posicionar en el cielo con vuelo activo
    const total = TrainGame.balloons.length;
    TrainGame.balloons.sort(() => Math.random() - 0.5);

    TrainGame.balloons.forEach((b, idx) => {
      b.x = 45 + ((w - 90) / Math.max(1, total)) * idx + (Math.random() - 0.5) * 25;
      b.baseY = skyTop + 25 + (idx % 2) * 45 + (Math.random() - 0.5) * 15;
      b.y = b.baseY;
      b.initialY = b.baseY;
      const dir = (idx % 2 === 0) ? 1 : -1;
      b.vx = dir * (0.85 + Math.random() * 0.75);
    });
  }

  function createBalloon(letter, isTarget, targetOrder, pal, skyTop, skyBottom, indexOrder) {
    const dir = ((indexOrder !== undefined ? indexOrder : 0) % 2 === 0) ? 1 : -1;
    return {
      letter: letter,
      isTarget: isTarget,
      targetOrder: targetOrder,
      palette: pal,
      x: 200,
      y: 120,
      baseY: 120,
      initialY: 120,
      vx: dir * (0.85 + Math.random() * 0.75),
      waveOffset: Math.random() * Math.PI * 2,
      waveSpeed: 0.025 + Math.random() * 0.02,
      waveAmp: 9 + Math.random() * 8,
      wobble: 0,
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

  // --- LOCUCIÓN PROSÓDICA CON PAUSAS CLARAS Y CALIBRADAS ---
  function speakCurrentTrainMission() {
    try {
      if (!TrainGame.isRunning || !TrainGame.currentWordObj) return;
      const targetLetter = TrainGame.currentLetters[TrainGame.currentLetterIndex];
      if (!targetLetter) return;

      let textToSpeak = '';
      if (!TrainGame.hasStarted) {
        TrainGame.hasStarted = true;
        // Relato pedagógico inicial completo con consigna clara
        const letterNames = TrainGame.currentLetters.map(l => (SPANISH_LETTER_NAMES && SPANISH_LETTER_NAMES[l]) || l).join(' ... ');
        const targetName = (SPANISH_LETTER_NAMES && SPANISH_LETTER_NAMES[targetLetter]) || targetLetter;
        textToSpeak = `¡Bienvenido al Tren de los Sonidos! ... En esta aventura, armaremos cada palabra colocando sus letras en los vagones del tren. ... Para la palabra ${TrainGame.currentWordObj.pron}: ... Escucha sus letras: ... ${letterNames}. ... ¡Busca la primera: toca la letra ${targetName}!`;
      } else if (TrainGame.currentLetterIndex === 0) {
        const letterNames = TrainGame.currentLetters.map(l => (SPANISH_LETTER_NAMES && SPANISH_LETTER_NAMES[l]) || l).join(' ... ');
        const targetName = (SPANISH_LETTER_NAMES && SPANISH_LETTER_NAMES[targetLetter]) || targetLetter;
        textToSpeak = `¡Nueva palabra! ... Llenemos los vagones del tren para la palabra ${TrainGame.currentWordObj.pron}! ... Escucha sus letras: ... ${letterNames}. ... ¡Toca la primera letra: la letra ${targetName}!`;
      } else {
        const targetName = (SPANISH_LETTER_NAMES && SPANISH_LETTER_NAMES[targetLetter]) || targetLetter;
        textToSpeak = `Muy bien. Ahora busca la siguiente letra: ... ¡la letra ${targetName}!`;
      }

      if (typeof speakText === 'function') {
        TrainGame.isSpeaking = true;
        if (TrainGame.speechWatchdog) clearTimeout(TrainGame.speechWatchdog);
        speakText(textToSpeak, () => {
          if (TrainGame.speechWatchdog) clearTimeout(TrainGame.speechWatchdog);
          TrainGame.isSpeaking = false;
        });
        // Watchdog de seguridad adaptativo amplio para permitir que el relato termine completo
        const watchdogMs = Math.max(12000, textToSpeak.length * 90);
        TrainGame.speechWatchdog = setTimeout(() => {
          TrainGame.isSpeaking = false;
        }, watchdogMs);
      } else {
        TrainGame.isSpeaking = false;
      }
    } catch (err) {
      console.error('Error in speakCurrentTrainMission:', err);
      TrainGame.isSpeaking = false;
    }
  }
  window.speakCurrentTrainMission = speakCurrentTrainMission;

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

    try {
      updateTrainPhysics();
      renderTrainGraphics();
    } catch (loopErr) {
      console.error('Error in trainGameLoop frame:', loopErr);
    }

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
      } else {
        // Vuelo activo estilo arquero por el cielo
        b.x += b.vx;
        b.waveOffset += b.waveSpeed;
        b.floatPhase += 0.035;
        b.y = b.baseY + Math.sin(b.waveOffset) * b.waveAmp;

        if (b.wobble > 0) b.wobble *= 0.88;

        // Rebote elástico en los márgenes de la pantalla
        const minX = b.radius + 15;
        const maxX = w - (b.radius + 15);
        if (b.x < minX) {
          b.x = minX;
          b.vx = Math.abs(b.vx);
        } else if (b.x > maxX) {
          b.x = maxX;
          b.vx = -Math.abs(b.vx);
        }
      }
    });

    // 2. Movimiento y animación del tren
    const t = TrainGame.train;
    const geom = getTrainConvoyGeometry();

    if (t.isDeparting) {
      t.departSpeed += 0.25;
      t.departOffset += t.departSpeed;
      t.wheelAngle += t.departSpeed * 0.08;

      // Vapor festivo saliendo de la chimenea
      if (Math.random() < 0.65) {
        createSteamPuff(geom.loco.x + geom.loco.width * 0.7, geom.loco.y - geom.loco.height - 10, '#FFFFFF', 16 + Math.random() * 12);
      }
    } else {
      // Movimiento natural en ralentí (respiración del tren)
      t.idleBob = Math.sin(TrainGame.time * 4) * 2;
      t.wheelAngle += 0.005;

      // Vapor suave en ralentí
      if (Math.random() < 0.12) {
        createSteamPuff(geom.loco.x + geom.loco.width * 0.7, geom.loco.y - geom.loco.height - 10, 'rgba(255,255,255,0.7)', 10 + Math.random() * 6);
      }
    }

    // Amortiguación de rebote de los vagones
    if (TrainGame.wagonBounce) {
      for (let i = 0; i < TrainGame.wagonBounce.length; i++) {
        if (TrainGame.wagonBounce[i] > 0.1) {
          TrainGame.wagonBounce[i] *= 0.88;
        } else {
          TrainGame.wagonBounce[i] = 0;
        }
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
    const geom = getTrainConvoyGeometry();
    drawRailway(ctx, w, h, geom.baseY + 12);

    // 3. Vapor de la locomotora
    drawSteamPuffs(ctx);

    // 4. El Tren (Vagones en orden canónico + Locomotora al frente)
    drawTrainAndWagons(ctx);

    // 5. Globos aerostáticos con fonemas
    TrainGame.balloons.forEach(b => {
      if (!b.isPlaced) drawBalloon(ctx, b);
    });

    // 6. Destellos y textos flotantes
    drawSparkles(ctx);
    drawFloatingTexts(ctx);

    // 7. Cartel pedagógico indicador cuando la voz está narrando la consigna
    if (TrainGame.isSpeaking) {
      drawTrainListeningBanner(ctx, w, 24);
    }
  }

  // --- CARTEL DE ESCUCHA ACTIVA (BLOQUEO RESPETUOSO) ---
  function drawTrainListeningBanner(ctx, w, y) {
    ctx.save();
    const txt = '🎧 Escuchando al conductor...';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    const textWidth = ctx.measureText(txt).width;
    const pillW = textWidth + 32;
    const pillH = 28;
    const pillX = (w - pillW) / 2;
    const pillY = y;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 14);
    ctx.fill();

    ctx.strokeStyle = '#FCD34D';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt, w / 2, pillY + pillH / 2);
    ctx.restore();
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

  // --- DIBUJO DEL TREN Y VAGONES ---
  function drawTrainAndWagons(ctx) {
    const geom = getTrainConvoyGeometry();

    // 1. Dibujar los vagones en orden de izquierda a derecha (Vagón 0 = 1ª letra)
    geom.wagons.forEach(wagon => {
      drawElkoninWagon(ctx, wagon.x, wagon.y, wagon.width, wagon.height, wagon.letter, wagon.index, geom.gap);
    });

    // 2. Dibujar la locomotora a la derecha tirando del convoy
    drawLocomotive(ctx, geom.loco.x, geom.loco.y, geom.loco.width, geom.loco.height, TrainGame.train.wheelAngle);
  }

  function drawLocomotive(ctx, x, y, width, height, wheelAngle) {
    ctx.save();
    const scale = width / 90;

    // Enganche al último vagón
    ctx.fillStyle = '#475569';
    ctx.fillRect(x - 8, y - height * 0.35, 10, 5);

    // Caldera de la locomotora (frente hacia la derecha)
    ctx.fillStyle = '#DC2626'; // Rojo vibrante
    ctx.beginPath();
    ctx.roundRect(x + width * 0.28, y - height * 0.68, width * 0.72, height * 0.68, 8 * scale);
    ctx.fill();

    // Franja dorada decorativa en la caldera
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(x + width * 0.52, y - height * 0.65, 5 * scale, height * 0.62);
    ctx.fillRect(x + width * 0.82, y - height * 0.65, 5 * scale, height * 0.62);

    // Cabina del conductor (a la izquierda de la caldera)
    ctx.fillStyle = '#B91C1C';
    ctx.beginPath();
    ctx.roundRect(x, y - height, width * 0.36, height, 6 * scale);
    ctx.fill();

    // Techo de la cabina
    ctx.fillStyle = '#7F1D1D';
    ctx.beginPath();
    ctx.roundRect(x - 4 * scale, y - height - 6 * scale, width * 0.44, 8 * scale, 3 * scale);
    ctx.fill();

    // Ventanilla con la mascota activa
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.roundRect(x + 5 * scale, y - height * 0.85, width * 0.26, height * 0.42, 4 * scale);
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const petCard = getCachedImage(getActivePetCardSrc());
    if (petCard && petCard.complete && petCard.naturalWidth > 0) {
      ctx.drawImage(petCard, x + 6 * scale, y - height * 0.83, width * 0.24, height * 0.38);
    }

    // Chimenea de vapor (en la parte delantera de la caldera)
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.moveTo(x + width * 0.70, y - height * 0.68);
    ctx.lineTo(x + width * 0.68, y - height * 1.05);
    ctx.lineTo(x + width * 0.82, y - height * 1.05);
    ctx.lineTo(x + width * 0.80, y - height * 0.68);
    ctx.closePath();
    ctx.fill();

    // Corona dorada de la chimenea
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.roundRect(x + width * 0.65, y - height * 1.10, width * 0.20, 6 * scale, 2);
    ctx.fill();

    // Foco delantero brillante
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(x + width, y - height * 0.35, 6 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Quitapiedras delantero (cowcatcher)
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(x + width - 4, y);
    ctx.lineTo(x + width + 10 * scale, y + 6 * scale);
    ctx.lineTo(x + width - 4, y + 6 * scale);
    ctx.closePath();
    ctx.fill();

    // Ruedas de la locomotora (3 ruedas proporcionadas)
    const wheelR = Math.round(height * 0.28);
    drawTrainWheel(ctx, x + width * 0.18, y + 2, wheelR, wheelAngle);
    drawTrainWheel(ctx, x + width * 0.52, y + 2, wheelR, wheelAngle);
    drawTrainWheel(ctx, x + width * 0.82, y + 2, wheelR, wheelAngle);

    // Barra de transmisión
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.18 + Math.cos(wheelAngle) * (wheelR * 0.5), y + 2 + Math.sin(wheelAngle) * (wheelR * 0.5));
    ctx.lineTo(x + width * 0.82 + Math.cos(wheelAngle) * (wheelR * 0.5), y + 2 + Math.sin(wheelAngle) * (wheelR * 0.5));
    ctx.stroke();

    ctx.restore();
  }

  function drawElkoninWagon(ctx, wx, wy, w, h, letter, slotIdx, gap) {
    ctx.save();

    const isCompleted = slotIdx < TrainGame.currentLetterIndex;
    const isCurrent = slotIdx === TrainGame.currentLetterIndex;

    // Enganche hacia la siguiente unidad
    ctx.fillStyle = '#475569';
    ctx.fillRect(wx + w, wy - h * 0.35, gap + 2, 5);

    // Cuerpo del vagón de Elkonin
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

    // Recuadro interior (Caja de Elkonin donde se posa la letra)
    ctx.fillStyle = isCompleted ? '#ECFDF5' : (isCurrent ? '#FEFCE8' : 'rgba(255,255,255,0.22)');
    ctx.beginPath();
    ctx.roundRect(wx + 6, wy - h + 5, w - 12, h - 11, 6);
    ctx.fill();
    ctx.strokeStyle = isCompleted ? '#10B981' : (isCurrent ? '#EAB308' : '#CBD5E1');
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Letra o indicador
    const fontSize = Math.max(16, Math.min(26, Math.round(h * 0.58)));
    if (isCompleted) {
      ctx.fillStyle = '#065F46';
      ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, wx + w / 2, wy - h / 2);
    } else if (isCurrent) {
      ctx.fillStyle = '#854D0E';
      ctx.font = `900 ${fontSize - 2}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', wx + w / 2, wy - h / 2);
    } else {
      ctx.fillStyle = '#CBD5E1';
      ctx.font = `900 ${fontSize - 4}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('—', wx + w / 2, wy - h / 2);
    }

    // Ruedas del vagón
    const wheelR = Math.max(8, Math.round(h * 0.28));
    drawTrainWheel(ctx, wx + w * 0.25, wy + 2, wheelR, TrainGame.train.wheelAngle);
    drawTrainWheel(ctx, wx + w * 0.75, wy + 2, wheelR, TrainGame.train.wheelAngle);

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
    ctx.arc(0, 0, Math.max(2, r * 0.25), 0, Math.PI * 2);
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
      // Respetar que termine el relato antes de permitir accionar
      if (TrainGame.isAdvancing || TrainGame.train.isDeparting || TrainGame.isSpeaking) return;
      const pos = getCoords(e);
      TrainGame.pointer.x = pos.x;
      TrainGame.pointer.y = pos.y;
      TrainGame.pointer.isDown = true;

      for (let i = TrainGame.balloons.length - 1; i >= 0; i--) {
        const b = TrainGame.balloons[i];
        if (b.isPlaced || b.isFlyingToWagon) continue;
        const dx = pos.x - b.x;
        const dy = pos.y - b.y;
        // Hitbox generosa para tocar o hacer click directamente sobre el globo volador
        if (Math.hypot(dx, dy) < b.radius + 22) {
          handleBalloonSelected(b);
          break;
        }
      }
    }

    function onPointerMove(e) {
      if (TrainGame.isSpeaking || TrainGame.isAdvancing || TrainGame.train.isDeparting) {
        canvas.style.cursor = 'default';
        return;
      }
      const pos = getCoords(e);
      TrainGame.pointer.x = pos.x;
      TrainGame.pointer.y = pos.y;

      // Cursor pointer al sobrevolar globos con el mouse
      let hovering = false;
      for (let i = 0; i < TrainGame.balloons.length; i++) {
        const b = TrainGame.balloons[i];
        if (!b.isPlaced && !b.isFlyingToWagon && Math.hypot(pos.x - b.x, pos.y - b.y) < b.radius + 20) {
          hovering = true;
          break;
        }
      }
      canvas.style.cursor = hovering ? 'pointer' : 'default';
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
    try {
      if (b.isPlaced || b.isFlyingToWagon || TrainGame.isAdvancing || TrainGame.isSpeaking) return;

      const targetLetter = TrainGame.currentLetters[TrainGame.currentLetterIndex];
      const isCorrect = (b.letter === targetLetter);

      // Destello de toque directo sobre el globo volador
      createSparklesExplosion(b.x, b.y, b.palette.main, 10);

      if (isCorrect) {
        // Bloquear toques mientras el globo viaja hacia el vagón
        TrainGame.isSpeaking = true;

        const slotIdx = TrainGame.currentLetterIndex;
        const geom = getTrainConvoyGeometry();
        const targetWagon = (geom.wagons && geom.wagons[slotIdx]) ? geom.wagons[slotIdx] : null;

        b.isFlyingToWagon = true;
        b.startX = b.x;
        b.startY = b.y;
        b.targetWagonX = targetWagon ? targetWagon.centerX : b.x;
        b.targetWagonY = targetWagon ? targetWagon.centerY : (TrainGame.height * 0.74);
        b.flyProgress = 0;

        playChimeNote();
      } else {
        // ERROR AMIGABLE: Sacudida suave, rebote de dirección y feedback verbal constructivo
        b.wobble = 1.0;
        b.vx = -b.vx * 1.25;
        playBoingSound();
        createFloatingText(b.x, b.y - 30, `¡Esa es la letra ${b.letter}!`, '#F43F5E');

        if (typeof speakText === 'function') {
          TrainGame.isSpeaking = true;
          if (TrainGame.speechWatchdog) clearTimeout(TrainGame.speechWatchdog);
          const bName = (SPANISH_LETTER_NAMES && SPANISH_LETTER_NAMES[b.letter]) || b.letter;
          const targetName = (SPANISH_LETTER_NAMES && SPANISH_LETTER_NAMES[targetLetter]) || targetLetter;
          speakText(`Esa es la letra ${bName}. ... ¡Sigue buscando la letra ${targetName}!`, () => {
            if (TrainGame.speechWatchdog) clearTimeout(TrainGame.speechWatchdog);
            TrainGame.isSpeaking = false;
          });
          TrainGame.speechWatchdog = setTimeout(() => { TrainGame.isSpeaking = false; }, 6500);
        }
      }
    } catch (err) {
      console.error('Error in handleBalloonSelected:', err);
    }
  }

  function finishPlacingLetter(b) {
    try {
      const slotIdx = TrainGame.currentLetterIndex;
      if (TrainGame.wagonBounce && TrainGame.wagonBounce[slotIdx] !== undefined) {
        TrainGame.wagonBounce[slotIdx] = 12;
      }

      createSparklesExplosion(b.targetWagonX, b.targetWagonY, '#10B981', 18);
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
          if (TrainGame.speechWatchdog) clearTimeout(TrainGame.speechWatchdog);
          const bName = (SPANISH_LETTER_NAMES && SPANISH_LETTER_NAMES[b.letter]) || b.letter;
          const nextName = (SPANISH_LETTER_NAMES && SPANISH_LETTER_NAMES[nextLetter]) || nextLetter;
          speakText(`¡Muy bien! ... ¡La letra ${bName}! ... Ahora busca la siguiente: ... ¡la letra ${nextName}!`, () => {
            if (TrainGame.speechWatchdog) clearTimeout(TrainGame.speechWatchdog);
            TrainGame.isSpeaking = false;
          });
          TrainGame.speechWatchdog = setTimeout(() => { TrainGame.isSpeaking = false; }, 7500);
        } else {
          TrainGame.isSpeaking = false;
        }
      }
    } catch (err) {
      console.error('Error in finishPlacingLetter:', err);
    }
  }

  // --- PALABRA COMPLETA: MARCHA TRIUNFAL DEL TREN ---
  function handleTrainCompleted() {
    try {
      TrainGame.isAdvancing = true;
      const wObj = TrainGame.currentWordObj;

      // Silbato alegre del tren
      playTrainWhistleSound();
      const geom = getTrainConvoyGeometry();
      createSteamPuff(geom.loco.x + geom.loco.width * 0.7, geom.loco.y - geom.loco.height - 15, '#FFFFFF', 30);

      createFloatingText(TrainGame.width * 0.5, TrainGame.height * 0.35, `¡${wObj.word}! 🚂💨`, '#F59E0B');
      createSparklesExplosion(TrainGame.width * 0.5, TrainGame.height * 0.45, '#FBBF24', 50);

      // Arrancar el tren
      TrainGame.train.isDeparting = true;
      TrainGame.train.departSpeed = 2.0;

      // Recompensas en el perfil
      if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
        activeChildProfile.coins = (activeChildProfile.coins || 0) + 12;
        activeChildProfile.stars = (activeChildProfile.stars || 0) + 2;
        if (typeof saveActiveChildProfile === 'function') saveActiveChildProfile();
      }

      let trainDoneFired = false;
      const onTrainDone = () => {
        if (trainDoneFired) return;
        trainDoneFired = true;
        setTimeout(() => {
          TrainGame.currentWordIndex++;
          if (TrainGame.currentWordIndex >= TrainGame.wordList.length) {
            showTrainVictoryModal();
          } else {
            setupTrainWord(TrainGame.currentWordIndex);
          }
        }, 1000);
      };

      if (typeof speakText === 'function') {
        TrainGame.isSpeaking = true;
        if (TrainGame.speechWatchdog) clearTimeout(TrainGame.speechWatchdog);
        speakText(`¡Chuuu chuuu! ... ¡Formaste la palabra ${wObj.pron}! ... ¡El tren de los sonidos está viajando!`, () => {
          if (TrainGame.speechWatchdog) clearTimeout(TrainGame.speechWatchdog);
          TrainGame.isSpeaking = false;
          onTrainDone();
        });
        TrainGame.speechWatchdog = setTimeout(() => {
          TrainGame.isSpeaking = false;
          onTrainDone();
        }, 9000);
      } else {
        onTrainDone();
      }
    } catch (err) {
      console.error('Error in handleTrainCompleted:', err);
      TrainGame.currentWordIndex++;
      if (TrainGame.currentWordIndex >= TrainGame.wordList.length) {
        showTrainVictoryModal();
      } else {
        setupTrainWord(TrainGame.currentWordIndex);
      }
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

  window.TrainGame = TrainGame;
})();
