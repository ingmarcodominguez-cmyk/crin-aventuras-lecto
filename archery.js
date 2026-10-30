/**
 * ============================================================================
 * 🏹 EL ARQUERO DE CRIN - NUEVA AVENTURA DE TIRO CON ARCO Y RAPIDEZ DE LECTURA
 * ============================================================================
 * Modo dinámico de rapidez de lectura donde las palabras de la tarea activa
 * se mueven, surgen y se desvanecen en la arena, y el niño debe cazar la
 * palabra objetivo disparando su flecha con la mascota arquera animada.
 */

(function(window) {
  'use strict';

  // --- CARGA DE ASSETS GRÁFICOS PERSONALIZADOS (3 ÁNGULOS REACTIVOS 3D) ---
  const unicornImages = {
    center: new Image(),
    left: new Image(),
    right: new Image()
  };
  unicornImages.center.src = 'assets/unicornio_tiro_delantero.png?v=242';
  unicornImages.left.src = 'assets/unicornio_tiro_izquierda.png?v=242';
  unicornImages.right.src = 'assets/unicornio_tiro_derecha.png?v=242';

  let unicornImagesLoaded = {
    center: false,
    left: false,
    right: false
  };
  unicornImages.center.onload = () => { unicornImagesLoaded.center = true; };
  unicornImages.left.onload = () => { unicornImagesLoaded.left = true; };
  unicornImages.right.onload = () => { unicornImagesLoaded.right = true; };

  // Selector de sprite reactivo según el ángulo de puntería en pantalla
  function getUnicornAimingSprite() {
    const px = ArcheryGame.pointer.x;
    const w = ArcheryGame.width;

    if (px < w * 0.40) {
      return { img: unicornImages.left, type: 'left', isLoaded: unicornImagesLoaded.left || unicornImages.left.complete };
    } else if (px > w * 0.60) {
      return { img: unicornImages.right, type: 'right', isLoaded: unicornImagesLoaded.right || unicornImages.right.complete };
    } else {
      return { img: unicornImages.center, type: 'center', isLoaded: unicornImagesLoaded.center || unicornImages.center.complete };
    }
  }


  // Helper universal de rectángulo redondeado (100% compatible con todos los navegadores)
  // Obtener la mascota elegida por el usuario (prioriza la elegida en la partida activa)
  function getActivePet() {
    if (typeof ArcheryGame !== 'undefined' && ArcheryGame.selectedPet) {
      return ArcheryGame.selectedPet;
    }
    if (typeof gameState !== 'undefined' && gameState && gameState.pet) {
      return gameState.pet;
    }
    if (typeof activeChildProfile !== 'undefined' && activeChildProfile && activeChildProfile.pet) {
      return activeChildProfile.pet;
    }
    return '🐶';
  }

  // --- SELECCIÓN Y CAMBIO DIRECTO DE MASCOTA ARQUERA ---
  window.setArcheryPet = function(petEmoji) {
    if (typeof ArcheryGame !== 'undefined') {
      ArcheryGame.selectedPet = petEmoji;
      if (ArcheryGame.archer) {
        ArcheryGame.archer.isCelebrating = true;
        ArcheryGame.archer.celebrateTimer = 80;
        ArcheryGame.archer.jumpVy = -8.5;
      }
    }
    if (typeof gameState !== 'undefined') {
      gameState.pet = petEmoji;
    }
    if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
      activeChildProfile.pet = petEmoji;
      if (typeof saveActiveChildProfile === 'function') saveActiveChildProfile();
    }
    const iconBtn = document.getElementById('archery-pet-btn-icon');
    if (iconBtn) iconBtn.innerText = petEmoji;
    const petDisplay = document.getElementById('pet-display');
    if (petDisplay) petDisplay.innerText = petEmoji;

    if (typeof closeArcheryPetModal === 'function') {
      closeArcheryPetModal();
    }

    if (typeof speakText === 'function') {
      const names = {
        '🐶': 'Perrito', '🐱': 'Gatito', '🦊': 'Zorrito', '🐰': 'Conejito',
        '🦄': 'Unicornio', '🐻': 'Osito', '🦁': 'León', '🐉': 'Dragón'
      };
      const name = names[petEmoji] || 'Mascota';
      speakText('¡Genial! Tu arquero ahora es el ' + name + '!');
    }
  };

  window.openArcheryPetModal = function() {
    const modal = document.getElementById('archery-pet-modal');
    if (modal) modal.style.display = 'flex';
  };

  window.closeArcheryPetModal = function() {
    const modal = document.getElementById('archery-pet-modal');
    if (modal) modal.style.display = 'none';
  };

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, Math.min(width / 2, height / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // Caché de imágenes de dibujos para no dibujar strings "assets/..."
  const imageAssetCache = {};

  function drawWordIcon(ctx, emojiOrPath, x, y, size) {
    if (!emojiOrPath) return;
    if (Array.isArray(emojiOrPath)) emojiOrPath = emojiOrPath[0] || '⭐';
    if (typeof emojiOrPath !== 'string') emojiOrPath = String(emojiOrPath || '⭐');

    const isPath = emojiOrPath.startsWith('assets/') || emojiOrPath.includes('.png') || emojiOrPath.includes('.jpg') || emojiOrPath.startsWith('data:image');
    
    if (isPath) {
      if (!imageAssetCache[emojiOrPath]) {
        const img = new Image();
        img.src = emojiOrPath;
        imageAssetCache[emojiOrPath] = img;
      }
      const img = imageAssetCache[emojiOrPath];
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
        return;
      }
      ctx.font = `${size}px "Segoe UI Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎯', x, y);
    } else {
      ctx.font = `${size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emojiOrPath, x, y);
    }
  }

  // AudioContext Singleton para no colapsar hilos de audio en Chrome
  let _sharedAudioCtx = null;
  function getSharedAudioContext() {
    try {
      if (!_sharedAudioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) _sharedAudioCtx = new AudioCtx();
      }
      if (_sharedAudioCtx && _sharedAudioCtx.state === 'suspended') {
        _sharedAudioCtx.resume().catch(() => {});
      }
      return _sharedAudioCtx;
    } catch(e) {
      return null;
    }
  }

  // --- ESTADO DEL JUEGO DE TIRO CON ARCO ---
  const ArcheryGame = {
    canvas: null,
    ctx: null,
    animId: null,
    isRunning: false,
    width: 800,
    height: 500,

    // Tarea, modo y progreso
    mode: 'task', // 'task' | 'random'
    taskWords: [],
    randomWords: [],
    randomHits: 0,
    targetWordIndex: 0,
    targetWord: '',
    targetEmoji: '🎯',
    score: 0,
    streak: 0,
    isAdvancing: false,
    advanceTimeout: null,
    missionVoiceTimeout: null,

    // Mascota arquera
    archer: {
      x: 120,
      y: 400,
      baseX: 120,
      baseY: 400,
      aimAngle: -0.32,
      targetAimAngle: -0.32,
      isAiming: false,
      drawProgress: 0,
      isShooting: false,
      shootCooldown: 0,
      recoil: 0,
      jumpY: 0,
      jumpVy: 0,
      isCelebrating: false,
      celebrateTimer: 0,
      blinkTimer: 160,
      isBlinking: false
    },

    // Entidades en la arena
    targets: [],
    arrows: [],
    particles: [],
    floatingTexts: [],
    bgClouds: [],

    // Escenario 3D del Bosque (Mismo entorno de El Cuento del Bosque)
    archeryTrees3D: [],
    archeryBirds3D: [],
    roadOffset: 0,
    lastBounceVoice: 0,

    // Control táctil / mouse
    pointer: {
      x: 450,
      y: 200,
      isDown: false
    },

    time: 0
  };

  let targetIdCounter = 0;

  // --- EFECTOS DE SONIDO WEB AUDIO API (REUTILIZAN SINGLETON AUDIO CONTEXT) ---
  function playBowTwangSound() {
    try {
      const ctx = getSharedAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(75, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.32, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch(e) {}
  }

  function playArrowBounceSound() {
    try {
      const ctx = getSharedAudioContext();
      if (!ctx) return;

      // Sonido de rebote: impacto metálico + boing elástico al golpear un obstáculo que tapa la palabra
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(560, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.16);
      gain1.gain.setValueAtTime(0.35, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.16);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(300, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.22);
      gain2.gain.setValueAtTime(0.28, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.22);
    } catch(e) {}
  }

  function playArrowHitSound() {
    try {
      const ctx = getSharedAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.09);
      gain.gain.setValueAtTime(0.38, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch(e) {}
  }

  function playArcherySuccessChime() {
    try {
      const ctx = getSharedAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.22, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
      });
    } catch(e) {}
  }

  function playArcheryWrongBoing() {
    try {
      const ctx = getSharedAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch(e) {}
  }

  // --- OBTENER PALABRAS DE LA TAREA ACTIVA ---
  function getArcheryTaskWords() {
    let words = [];
    if (typeof activeTaskPackId !== 'undefined' && typeof allTaskPacks !== 'undefined') {
      const pack = allTaskPacks[activeTaskPackId];
      if (pack && pack.words && pack.words.length > 0) {
        words = [...pack.words];
      }
    }
    if (typeof activeTaskPackId !== 'undefined' && activeTaskPackId === 'custom' && typeof customWordsList !== 'undefined' && customWordsList.length > 0) {
      words = customWordsList.map(item => item.word);
    }
    if (!words || words.length === 0) {
      words = ['ZAPATO', 'MARIPOSA', 'PELOTA', 'MAMÁ', 'GATO', 'PERRO', 'CASA', 'SOL'];
    }

    return words.filter(w => {
      const clean = w.toUpperCase().trim();
      return typeof isWordDeleted === 'function' ? !isWordDeleted(clean) : true;
    });
  }

  // --- OBTENER BANCO DE PALABRAS PARA MODO ALEATORIO (+200 PALABRAS) ---
  function getArcheryRandomWords() {
    const wordsSet = new Set();
    
    // 1. De la Base de Datos Léxica Canónica
    if (typeof CANONICAL_WORD_LEXICON !== 'undefined') {
      Object.keys(CANONICAL_WORD_LEXICON).forEach(k => {
        const item = CANONICAL_WORD_LEXICON[k];
        const w = (item && item.escritura) ? item.escritura : k;
        if (w && w.length >= 2 && w.length <= 11) {
          wordsSet.add(w.toUpperCase().trim());
        }
      });
    }

    // 2. De todas las tareas registradas en la aplicación
    if (typeof allTaskPacks !== 'undefined') {
      Object.values(allTaskPacks).forEach(pack => {
        if (pack && pack.words) {
          pack.words.forEach(w => {
            if (w && w.length >= 2) wordsSet.add(w.toUpperCase().trim());
          });
        }
      });
    }

    // 3. De la lista personalizada si existe
    if (typeof customWordsList !== 'undefined' && Array.isArray(customWordsList)) {
      customWordsList.forEach(item => {
        const w = item.word || item;
        if (w && typeof w === 'string') wordsSet.add(w.toUpperCase().trim());
      });
    }

    // Fallbacks robustos y variados
    if (wordsSet.size < 12) {
      ['ZAPATO', 'MARIPOSA', 'PELOTA', 'MAMA', 'PAPA', 'GATO', 'PERRO', 'CASA', 'SOL', 'LUNA', 'MESA', 'PATO', 'MONO', 'SAPO', 'BARCO', 'DADO', 'LEON', 'OSO', 'FLOR', 'TREN', 'AVION'].forEach(w => wordsSet.add(w));
    }

    const list = Array.from(wordsSet).filter(w => {
      const clean = w.toUpperCase().trim();
      return typeof isWordDeleted === 'function' ? !isWordDeleted(clean) : true;
    });

    return shuffleArrayLocal(list);
  }

  function getWordEmoji(word) {
    if (typeof getCanonicalWord === 'function') {
      const canon = getCanonicalWord(word);
      if (canon && canon.emoji) return canon.emoji;
    }
    if (typeof getEmojiForWord === 'function') {
      return getEmojiForWord(word);
    }
    return '⭐';
  }

  // --- CONTROL DE APERTURA Y CIERRE DE LA PANTALLA ---
  window.stopArcheryGame = function() {
    ArcheryGame.isRunning = false;
    if (ArcheryGame.animId) {
      cancelAnimationFrame(ArcheryGame.animId);
      ArcheryGame.animId = null;
    }
    if (ArcheryGame.advanceTimeout) {
      clearTimeout(ArcheryGame.advanceTimeout);
      ArcheryGame.advanceTimeout = null;
    }
    if (ArcheryGame.missionVoiceTimeout) {
      clearTimeout(ArcheryGame.missionVoiceTimeout);
      ArcheryGame.missionVoiceTimeout = null;
    }
    ArcheryGame.isAdvancing = false;
    ArcheryGame.arrows = [];
    ArcheryGame.targets = [];
    ArcheryGame.particles = [];
  };

  window.closeArcheryAndReturnToMap = function() {
    if (typeof window.stopArcheryGame === 'function') {
      window.stopArcheryGame();
    }
    if (typeof stopAllAudio === 'function') {
      stopAllAudio();
    }
    const modal = document.getElementById('archery-victory-modal');
    if (modal) modal.style.display = 'none';

    if (typeof switchScreen === 'function') {
      switchScreen('map');
    }
  };

  window.openArcheryQuestScreen = function(mode) {
    if (typeof stopAllAudio === 'function') stopAllAudio();
    if (typeof switchScreen === 'function') switchScreen('archery');

    const screen = document.getElementById('screen-archery');
    if (screen) screen.classList.add('active');

    ArcheryGame.mode = (mode === 'random') ? 'random' : 'task';

    initArcheryGame();
    setTimeout(resizeArcheryCanvas, 50);
    setTimeout(resizeArcheryCanvas, 150);
    setTimeout(resizeArcheryCanvas, 300);
  };

  window.toggleArcheryGameMode = function() {
    const nextMode = ArcheryGame.mode === 'task' ? 'random' : 'task';
    window.setArcheryGameMode(nextMode);
  };

  window.setArcheryGameMode = function(newMode) {
    ArcheryGame.mode = newMode;
    if (ArcheryGame.advanceTimeout) clearTimeout(ArcheryGame.advanceTimeout);
    if (ArcheryGame.missionVoiceTimeout) clearTimeout(ArcheryGame.missionVoiceTimeout);
    ArcheryGame.isAdvancing = false;
    ArcheryGame.arrows = [];
    ArcheryGame.targets = [];

    if (newMode === 'random') {
      ArcheryGame.randomWords = getArcheryRandomWords();
      ArcheryGame.randomHits = 0;
      setupNextRandomWord();
    } else {
      ArcheryGame.taskWords = getArcheryTaskWords();
      ArcheryGame.targetWordIndex = 0;
      setupTargetWord(0);
    }
    updateArcheryHUD();
  };

  function initArcheryGame() {
    ArcheryGame.canvas = document.getElementById('archery-game-canvas');
    if (!ArcheryGame.canvas) return;
    ArcheryGame.ctx = ArcheryGame.canvas.getContext('2d');

    resizeArcheryCanvas();

    ArcheryGame.taskWords = getArcheryTaskWords();
    ArcheryGame.randomWords = getArcheryRandomWords();
    ArcheryGame.score = 0;
    ArcheryGame.streak = 0;
    ArcheryGame.isAdvancing = false;
    ArcheryGame.arrows = [];
    ArcheryGame.particles = [];
    ArcheryGame.floatingTexts = [];
    ArcheryGame.targets = [];

    ArcheryGame.bgClouds = [
      { x: 40, y: 35, scale: 0.9, speed: 0.25 },
      { x: 280, y: 55, scale: 0.65, speed: 0.18 },
      { x: 540, y: 30, scale: 0.8, speed: 0.22 },
      { x: 740, y: 60, scale: 0.55, speed: 0.15 }
    ];

    // Árboles y Pájaros en Perspectiva 3D (Cuento del Bosque)
    ArcheryGame.roadOffset = 0;
    ArcheryGame.archeryTrees3D = [];
    for (let i = 0; i < 16; i++) {
      ArcheryGame.archeryTrees3D.push({
        z: (i / 16) + Math.random() * 0.04,
        side: i % 2 === 0 ? -1 : 1,
        type: Math.random() > 0.4 ? '🌲' : (Math.random() > 0.5 ? '🌳' : '🌲')
      });
    }

    ArcheryGame.archeryBirds3D = [
      { x: 40, y: 26, speed: 0.9, flapOffset: 0, icon: '🕊️' },
      { x: 260, y: 18, speed: 1.2, flapOffset: 1.5, icon: '🦅' },
      { x: 480, y: 32, speed: 0.75, flapOffset: 3.0, icon: '🐦' }
    ];

    setupArcheryEventListeners();

    if (ArcheryGame.mode === 'random') {
      ArcheryGame.randomHits = 0;
      setupNextRandomWord();
    } else {
      ArcheryGame.targetWordIndex = 0;
      setupTargetWord(0);
    }

    ArcheryGame.isRunning = true;
    if (ArcheryGame.animId) cancelAnimationFrame(ArcheryGame.animId);
    ArcheryGame.animId = requestAnimationFrame(archeryGameLoop);

    updateArcheryHUD();
  }

  function resizeArcheryCanvas() {
    if (!ArcheryGame.canvas) return;
    const container = ArcheryGame.canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const w = Math.max(320, Math.floor(rect.width) || window.innerWidth || 800);
    const h = Math.max(340, Math.floor(rect.height) || (window.innerHeight - 170) || 500);

    ArcheryGame.width = w;
    ArcheryGame.height = h;

    ArcheryGame.canvas.width = w;
    ArcheryGame.canvas.height = h;

    // Centrar al arquero en el camino en perspectiva 3D
    ArcheryGame.archer.baseX = w * 0.50;
    ArcheryGame.archer.baseY = h - 52;
    ArcheryGame.archer.x = ArcheryGame.archer.baseX;
    ArcheryGame.archer.y = ArcheryGame.archer.baseY;
  }

  function setupTargetWord(index) {
    if (ArcheryGame.taskWords.length === 0) {
      ArcheryGame.taskWords = ['ZAPATO', 'MARIPOSA', 'PELOTA', 'MAMA'];
    }

    if (index >= ArcheryGame.taskWords.length) {
      triggerArcheryVictory();
      return;
    }

    ArcheryGame.isAdvancing = false;
    ArcheryGame.targetWordIndex = index;
    ArcheryGame.targetWord = ArcheryGame.taskWords[index].toUpperCase().trim();
    ArcheryGame.targetEmoji = getWordEmoji(ArcheryGame.targetWord);

    spawnInitialTargets();
    updateArcheryHUD();

    // 🔊 DECIR CADA PALABRA OBJETIVO AL COMENZAR
    if (ArcheryGame.missionVoiceTimeout) clearTimeout(ArcheryGame.missionVoiceTimeout);
    ArcheryGame.missionVoiceTimeout = setTimeout(() => {
      speakCurrentArcheryMission();
    }, 300);
  }

  // --- SELECCIÓN Y PROPUESTA DE NUEVA PALABRA EN MODO ALEATORIO ---
  function setupNextRandomWord() {
    ArcheryGame.isAdvancing = false;
    if (!ArcheryGame.randomWords || ArcheryGame.randomWords.length < 5) {
      ArcheryGame.randomWords = getArcheryRandomWords();
    }

    // Elegir una palabra aleatoria distinta de la anterior
    const candidateList = ArcheryGame.randomWords.filter(w => w !== ArcheryGame.targetWord);
    const chosen = candidateList.length > 0
      ? candidateList[Math.floor(Math.random() * candidateList.length)]
      : ArcheryGame.randomWords[0];

    ArcheryGame.targetWord = chosen.toUpperCase().trim();
    ArcheryGame.targetEmoji = getWordEmoji(ArcheryGame.targetWord);

    spawnInitialTargets();
    updateArcheryHUD();

    // 🔊 DECIR LA NUEVA PALABRA OBJETIVO AL PROPONERLA
    if (ArcheryGame.missionVoiceTimeout) clearTimeout(ArcheryGame.missionVoiceTimeout);
    ArcheryGame.missionVoiceTimeout = setTimeout(() => {
      speakCurrentArcheryMission();
    }, 300);
  }

  function updateArcheryHUD() {
    const wordDisplay = document.getElementById('archery-target-word-display');
    const emojiDisplay = document.getElementById('archery-target-emoji-display');
    const progressDisplay = document.getElementById('archery-progress-badge');
    const taskNameDisplay = document.getElementById('archery-task-name');

    if (wordDisplay) wordDisplay.innerText = ArcheryGame.targetWord;
    if (emojiDisplay) {
      const emojiVal = ArcheryGame.targetEmoji;
      const isPath = (typeof emojiVal === 'string') && (emojiVal.startsWith('assets/') || emojiVal.includes('.png') || emojiVal.startsWith('data:image'));
      if (isPath) {
        emojiDisplay.innerHTML = `<img src="${emojiVal}" style="width: 28px; height: 28px; object-fit: contain; vertical-align: middle;">`;
      } else {
        emojiDisplay.innerText = emojiVal;
      }
    }
    if (progressDisplay) {
      if (ArcheryGame.mode === 'random') {
        progressDisplay.innerText = `🎲 Aciertos: ${ArcheryGame.randomHits || 0}`;
        progressDisplay.style.background = '#8B5CF6';
      } else {
        progressDisplay.innerText = `Palabra ${ArcheryGame.targetWordIndex + 1} de ${ArcheryGame.taskWords.length}`;
        progressDisplay.style.background = '#059669';
      }
    }

    if (taskNameDisplay) {
      if (ArcheryGame.mode === 'random') {
        taskNameDisplay.innerText = '🎲 Vocabulario Aleatorio (+200 Palabras)';
        taskNameDisplay.style.color = '#7C3AED';
      } else if (typeof allTaskPacks !== 'undefined' && typeof activeTaskPackId !== 'undefined') {
        const pack = allTaskPacks[activeTaskPackId];
        taskNameDisplay.innerText = pack ? pack.name : 'Tarea Activa';
        taskNameDisplay.style.color = '#047857';
      }
    }

    updateArcheryModeUI();
  }

  function updateArcheryModeUI() {
    const modeBtn = document.getElementById('archery-mode-btn');
    if (!modeBtn) return;
    if (ArcheryGame.mode === 'random') {
      modeBtn.innerHTML = '<span>🎯 Modo Tarea</span>';
      modeBtn.style.background = 'linear-gradient(135deg, #059669, #047857)';
      modeBtn.title = 'Cambiar a palabras de la Tarea Activa';
    } else {
      modeBtn.innerHTML = '<span>🎲 Modo Aleatorio</span>';
      modeBtn.style.background = 'linear-gradient(135deg, #8B5CF6, #6D28D9)';
      modeBtn.title = 'Cambiar a Modo Aleatorio con más de 200 palabras';
    }
  }

  window.speakCurrentArcheryMission = function() {
    if (typeof speakText === 'function') {
      const canon = (typeof getCanonicalWord === 'function') ? getCanonicalWord(ArcheryGame.targetWord) : null;
      const pronWord = canon ? canon.pronunciacion : ArcheryGame.targetWord;
      speakText(`¡Apunta y dispara a: ${pronWord}!`);
    }
  };

  // --- GESTIÓN DE PALABRAS MÓVILES EN EL HORIZONTE LEJANO (3 CAPAS DE PROFUNDIDAD) ---
  function spawnInitialTargets() {
    ArcheryGame.targets = [];

    const activePool = (ArcheryGame.mode === 'random')
      ? (ArcheryGame.randomWords && ArcheryGame.randomWords.length > 5 ? ArcheryGame.randomWords : getArcheryRandomWords())
      : ArcheryGame.taskWords;

    // 1. Objetivo principal en capa lejana o media (z=2 o z=3)
    const targetZ = Math.random() > 0.5 ? 2 : 3;
    const targetBaseY = targetZ === 3 ? 55 : 88;
    spawnTarget(ArcheryGame.targetWord, true, ArcheryGame.width * 0.50, targetBaseY, targetZ);

    // 2. Distractores únicos distribuidos en las 3 capas de profundidad
    const availablePool = activePool.filter(w => w !== ArcheryGame.targetWord);
    const shuffled = shuffleArrayLocal(availablePool);
    const distractors = [];
    for (let w of shuffled) {
      if (!distractors.includes(w) && w !== ArcheryGame.targetWord) {
        distractors.push(w);
        if (distractors.length >= 4) break;
      }
    }

    if (distractors.length < 4) {
      const fallbacks = ['SOL', 'LUNA', 'CASA', 'FLOR', 'PELOTA', 'GATO', 'MESA', 'PATO', 'BARCO', 'DADO', 'LEON', 'OSO', 'RANA', 'TREN'];
      for (let f of fallbacks) {
        if (f !== ArcheryGame.targetWord && !distractors.includes(f)) {
          distractors.push(f);
          if (distractors.length >= 4) break;
        }
      }
    }

    // Capas alternadas para que se crucen por delante y detrás continuamente
    const layerDist = [1, 3, 2, 1];
    const xPositions = [
      ArcheryGame.width * 0.16,
      ArcheryGame.width * 0.35,
      ArcheryGame.width * 0.65,
      ArcheryGame.width * 0.84
    ];

    distractors.forEach((dw, idx) => {
      const lz = layerDist[idx % layerDist.length];
      const sy = lz === 3 ? 55 : (lz === 2 ? 88 : 122);
      spawnTarget(dw, false, xPositions[idx], sy, lz);
    });
  }

  function spawnTarget(word, isTarget, initialX, initialY, forcedZ) {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const emoji = getWordEmoji(word);

    // Asignar capa de profundidad z (1 = frente, 2 = medio, 3 = fondo lejano)
    let z = forcedZ;
    if (!z) {
      const c1 = ArcheryGame.targets.filter(t => t.z === 1).length;
      const c2 = ArcheryGame.targets.filter(t => t.z === 2).length;
      const c3 = ArcheryGame.targets.filter(t => t.z === 3).length;
      if (c3 <= c2 && c3 <= c1) z = 3;
      else if (c2 <= c1) z = 2;
      else z = 1;
    }

    // Ajuste de escala, altura y velocidad según la lejanía (z)
    // Las palabras flotan AL FONDO, muy lejos de la mascota (sin encimársele)
    let baseScale = 0.66;
    let defaultY = 88;
    let speed = 1.05;

    if (z === 3) {
      baseScale = 0.56; // Más lejana y compacta
      defaultY = 48 + Math.random() * 16;
      speed = 0.82 + Math.random() * 0.20;
    } else if (z === 2) {
      baseScale = 0.66; // Capa intermedia
      defaultY = 78 + Math.random() * 18;
      speed = 1.05 + Math.random() * 0.25;
    } else {
      baseScale = 0.76; // Capa frontal (pasa por delante)
      defaultY = 112 + Math.random() * 18;
      speed = 1.28 + Math.random() * 0.30;
    }

    const spawnY = initialY !== undefined ? initialY : defaultY;
    const spawnX = initialX !== undefined ? initialX : (direction > 0 ? 70 : (ArcheryGame.width - 70));

    ArcheryGame.targets.push({
      id: ++targetIdCounter,
      word: word,
      emoji: emoji,
      isTarget: isTarget,
      z: z,
      baseScale: baseScale,
      scale: initialX !== undefined ? baseScale : 0.1,
      targetScale: baseScale,
      alpha: initialX !== undefined ? 1 : 0,
      targetAlpha: 1,
      x: spawnX,
      y: spawnY,
      baseY: spawnY,
      vx: direction * speed,
      vy: 0,
      radius: 26,
      lastBadgeW: 80,
      lastBadgeH: 28,
      waveOffset: Math.random() * Math.PI * 2,
      waveSpeed: 0.025 + Math.random() * 0.02,
      waveAmp: 5 + Math.random() * 5, // Oscilación suave y contenida en el horizonte
      life: 580 + Math.random() * 250,
      isFading: false,
      wobble: 0
    });

    createSparkleBurst(spawnX, spawnY, '#93C5FD', 6);
  }

  function updateTargets() {
    let hasTargetWord = false;

    for (let i = ArcheryGame.targets.length - 1; i >= 0; i--) {
      const t = ArcheryGame.targets[i];

      t.scale += (t.targetScale - t.scale) * 0.14;
      t.alpha += (t.targetAlpha - t.alpha) * 0.1;
      if (t.wobble > 0) t.wobble *= 0.88;

      t.x += t.vx;
      t.waveOffset += t.waveSpeed;
      t.y = t.baseY + Math.sin(t.waveOffset) * t.waveAmp;

      const minX = 65;
      const maxX = ArcheryGame.width - 65;
      if (t.x < minX) {
        t.x = minX;
        t.vx = Math.abs(t.vx);
      } else if (t.x > maxX) {
        t.x = maxX;
        t.vx = -Math.abs(t.vx);
      }

      t.life--;
      if (t.life <= 45 && !t.isFading) {
        t.isFading = true;
        t.targetAlpha = 0;
        t.targetScale = 0.2;
      }

      if (t.isTarget && t.alpha > 0.2 && !t.isFading) {
        hasTargetWord = true;
      }

      if (t.isFading && t.alpha <= 0.05) {
        ArcheryGame.targets.splice(i, 1);
      }
    }

    // --- REPOSICIÓN CONTINUA EN EL HORIZONTE ---
    const TARGET_FLYING_COUNT = 5;

    // 1. Reposición de la palabra objetivo si desapareció
    if (!hasTargetWord && !ArcheryGame.isAdvancing) {
      const rz = Math.random() > 0.5 ? 2 : 3;
      const ry = rz === 3 ? (48 + Math.random() * 16) : (78 + Math.random() * 18);
      const rx = 80 + Math.random() * (ArcheryGame.width - 160);
      spawnTarget(ArcheryGame.targetWord, true, rx, ry, rz);
      hasTargetWord = true;
    }

    // 2. Reposición de distractores únicos hasta mantener 4 o 5 palabras volando
    const activeTargets = ArcheryGame.targets.filter(t => !t.isFading);
    if (activeTargets.length < TARGET_FLYING_COUNT && !ArcheryGame.isAdvancing) {
      const activePool = (ArcheryGame.mode === 'random')
        ? (ArcheryGame.randomWords || getArcheryRandomWords())
        : ArcheryGame.taskWords;

      const flyingWords = activeTargets.map(t => t.word);
      const candidates = activePool.filter(w => !flyingWords.includes(w) && w !== ArcheryGame.targetWord);

      let newWord = null;
      if (candidates.length > 0) {
        newWord = candidates[Math.floor(Math.random() * candidates.length)];
      } else {
        const fallbacks = ['SOL', 'LUNA', 'CASA', 'FLOR', 'PELOTA', 'GATO', 'MESA', 'PATO', 'BARCO', 'DADO', 'LEON', 'OSO', 'RANA', 'TREN', 'AVION'];
        const fallbackCandidates = fallbacks.filter(f => !flyingWords.includes(f) && f !== ArcheryGame.targetWord);
        if (fallbackCandidates.length > 0) {
          newWord = fallbackCandidates[Math.floor(Math.random() * fallbackCandidates.length)];
        }
      }

      if (newWord) {
        const rx = 80 + Math.random() * (ArcheryGame.width - 160);
        spawnTarget(newWord, false, rx);
      }
    }
  }

  // --- DISPARO INSTANTÁNEO Y BALÍSTICA DE FLECHAS ---
  function shootArrowAt(targetX, targetY) {
    const a = ArcheryGame.archer;
    const spriteChoice = getUnicornAimingSprite();

    let ax = a.x;
    let ay = a.y - 45;
    if (spriteChoice.type === 'left') {
      ax = a.x - 22;
      ay = a.y - 50;
    } else if (spriteChoice.type === 'right') {
      ax = a.x + 22;
      ay = a.y - 50;
    }

    const dx = targetX - ax;
    const dy = targetY - ay;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 10) return;

    const angle = Math.atan2(dy, dx);

    // Flecha balística con profundidad 3D
    ArcheryGame.arrows.push({
      startX: ax,
      startY: ay,
      targetX: targetX,
      targetY: targetY,
      x: ax,
      y: ay,
      progress: 0,
      speed: 0.055, // Llega al objetivo en ~18 frames (300ms)
      angle: angle,
      scale: 1.0,
      life: 50
    });

    a.aimAngle = angle;
    a.targetAimAngle = angle;
    a.isShooting = true;
    a.recoil = 18;
    a.shootCooldown = 10;

    playBowTwangSound();
    createSparkleBurst(ax, ay, '#FDE047', 10);
  }

  function isTargetOccludedByFrontWord(target) {
    for (let k = 0; k < ArcheryGame.targets.length; k++) {
      const other = ArcheryGame.targets[k];
      if (other === target || other.alpha < 0.35 || other.isFading) continue;

      // 'other' está por delante si tiene menor z (más cerca del arquero)
      // O si están en la misma capa pero 'other' fue dibujado por encima (id mayor)
      const isFront = (other.z < target.z) || (other.z === target.z && other.id > target.id);
      if (isFront) {
        const dx = Math.abs(other.x - target.x);
        const dy = Math.abs(other.y - target.y);

        const tScale = target.scale || 0.68;
        const oScale = other.scale || 0.68;

        const wOther = (other.lastBadgeW || 80) * oScale;
        const wTarget = (target.lastBadgeW || 80) * tScale;
        const hOther = ((other.lastBadgeH || 28) + other.radius * 2) * oScale;
        const hTarget = ((target.lastBadgeH || 28) + target.radius * 2) * tScale;

        // Si hay solapamiento geométrico que tapa la palabra
        if (dx < (wOther + wTarget) * 0.44 && dy < (hOther + hTarget) * 0.44) {
          return other;
        }
      }
    }
    return null;
  }

  function triggerArrowBounce(arrow, target, blockingWord) {
    playArrowBounceSound();

    target.wobble = 18;
    if (blockingWord) blockingWord.wobble = 18;

    // Física de rebote de la flecha al chocar contra un obstáculo frontal
    arrow.isBouncing = true;
    const bounceDir = arrow.x < (blockingWord ? blockingWord.x : target.x) ? -1 : 1;
    arrow.vx = bounceDir * (2.8 + Math.random() * 2.2);
    arrow.vy = -3.8;
    arrow.gravity = 0.36;
    arrow.spin = bounceDir * 0.22;
    arrow.bounceLife = 28;

    // Efecto visual: chispas y escudo de rebote
    createSparkleBurst(arrow.x, arrow.y, '#F59E0B', 12);
    ArcheryGame.particles.push({
      type: 'shield_ring',
      x: arrow.x,
      y: arrow.y,
      radius: 12,
      maxRadius: 42,
      alpha: 1.0,
      decay: 0.065,
      color: '#F59E0B'
    });

    createFloatingText(arrow.x, arrow.y - 22, '¡Rebotó! 🛡️ ¡Tiro tapado!', '#D97706');

    if (typeof speakText === 'function') {
      if (!ArcheryGame.lastBounceVoice || (Date.now() - ArcheryGame.lastBounceVoice > 5000)) {
        ArcheryGame.lastBounceVoice = Date.now();
        speakText('¡Rebotó! Espera que pase la otra palabra para un tiro pleno.');
      }
    }
  }

  function updateArrows() {
    for (let i = ArcheryGame.arrows.length - 1; i >= 0; i--) {
      const arr = ArcheryGame.arrows[i];

      // Flechas rebotadas por choque
      if (arr.isBouncing) {
        arr.x += arr.vx;
        arr.y += arr.vy;
        arr.vy += arr.gravity;
        arr.angle += arr.spin;
        arr.bounceLife--;
        if (arr.bounceLife <= 0 || arr.y > ArcheryGame.height + 60) {
          ArcheryGame.arrows.splice(i, 1);
        }
        continue;
      }

      arr.progress += arr.speed;
      const t = Math.min(1.0, arr.progress);

      // Trayectoria en perspectiva hacia el horizonte
      const curX = arr.startX + (arr.targetX - arr.startX) * t;
      const arcHeight = Math.sin(t * Math.PI) * 22;
      const curY = arr.startY + (arr.targetY - arr.startY) * t - arcHeight;

      arr.x = curX;
      arr.y = curY;
      arr.scale = 1.0 - t * 0.46; // Se reduce con la profundidad 3D

      // Estela mágica
      ArcheryGame.particles.push({
        x: arr.x + (Math.random() - 0.5) * 4,
        y: arr.y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        color: Math.random() > 0.5 ? '#FDE047' : '#EF4444',
        size: Math.max(1.5, 3.5 * arr.scale),
        alpha: 0.9,
        decay: 0.06
      });

      if (arr.progress >= 1.0) {
        let hit = false;
        const candidates = [];

        for (let j = 0; j < ArcheryGame.targets.length; j++) {
          const target = ArcheryGame.targets[j];
          if (target.alpha < 0.35 || target.isFading) continue;

          const tdx = arr.x - target.x;
          const tdy = arr.y - target.y;
          const dist = Math.sqrt(tdx * tdx + tdy * tdy);
          const tScale = target.scale || 0.68;

          const hitRadius = (target.radius + 16) * tScale;
          const halfBadgeW = ((target.lastBadgeW || 80) * 0.5 + 10) * tScale;
          const badgeH = ((target.lastBadgeH || 28) + 14) * tScale;
          const inBadge = Math.abs(tdx) < halfBadgeW && tdy > 0 && tdy < (badgeH + target.radius * tScale);

          if (dist < hitRadius || inBadge) {
            candidates.push({ target, dist, z: target.z });
          }
        }

        // Ordenar candidatos por profundidad (los más cercanos tienen prioridad física)
        candidates.sort((a, b) => a.z - b.z);

        if (candidates.length > 0) {
          const chosen = candidates[0].target;

          // REGLA CRUCIAL PEDAGÓGICA Y FÍSICA:
          // El tiro a la palabra debe ser PLENO.
          // Si está tapada por otra palabra por delante, DEBE REBOTAR la flecha.
          const blockingWord = isTargetOccludedByFrontWord(chosen);

          if (blockingWord) {
            triggerArrowBounce(arr, chosen, blockingWord);
            hit = true;
          } else {
            handleArrowHitTarget(arr, chosen);
            hit = true;
            ArcheryGame.arrows.splice(i, 1);
          }
        }

        if (!hit) {
          createSparkleBurst(arr.x, arr.y, '#CBD5E1', 6);
          ArcheryGame.arrows.splice(i, 1);
        }
      }
    }
  }

  function handleArrowHitTarget(arrow, target) {
    if (target.isTarget) {
      // ✅ ACIERTO EN LA PALABRA CORRECTA (TIRO PLENO)
      playArrowHitSound();
      playArcherySuccessChime();

      createConfettiBurst(target.x, target.y, 30);
      createFloatingText(target.x, target.y - 25, '¡TIRO PLENO! +10 🪙', '#059669');

      ArcheryGame.archer.isCelebrating = true;
      ArcheryGame.archer.celebrateTimer = 90;
      ArcheryGame.archer.jumpVy = -8.5;

      ArcheryGame.score += 10;
      if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
        activeChildProfile.coins = (activeChildProfile.coins || 0) + 10;
        activeChildProfile.stars = (activeChildProfile.stars || 0) + 2;
        if (typeof saveActiveChildProfile === 'function') saveActiveChildProfile();
      }

      const canon = (typeof getCanonicalWord === 'function') ? getCanonicalWord(target.word) : null;
      const pronWord = canon ? canon.pronunciacion : target.word;
      if (typeof speakText === 'function') {
        speakText(`¡Tiro pleno! ¡Excelente! ¡Le diste a ${pronWord}!`);
      }

      target.isFading = true;
      target.targetScale = 1.35;
      target.targetAlpha = 0;

      // Evitar avanzar múltiples veces si varias flechas impactan a la vez
      if (!ArcheryGame.isAdvancing) {
        ArcheryGame.isAdvancing = true;
        if (ArcheryGame.advanceTimeout) clearTimeout(ArcheryGame.advanceTimeout);
        ArcheryGame.advanceTimeout = setTimeout(() => {
          if (ArcheryGame.mode === 'random') {
            ArcheryGame.randomHits = (ArcheryGame.randomHits || 0) + 1;
            setupNextRandomWord();
          } else {
            setupTargetWord(ArcheryGame.targetWordIndex + 1);
          }
        }, 1300);
      }

    } else {
      // ❌ IMPACTO EN OTRA PALABRA
      playArcheryWrongBoing();
      target.wobble = 18;
      createFloatingText(target.x, target.y - 20, '¡Casi!', '#D97706');

      const canon = (typeof getCanonicalWord === 'function') ? getCanonicalWord(target.word) : null;
      const targetCanon = (typeof getCanonicalWord === 'function') ? getCanonicalWord(ArcheryGame.targetWord) : null;
      const pronHit = canon ? canon.pronunciacion : target.word;
      const pronTarget = targetCanon ? targetCanon.pronunciacion : ArcheryGame.targetWord;

      if (typeof speakText === 'function') {
        speakText(`Casi. Esa es ${pronHit}. Busca ${pronTarget}.`);
      }
    }
  }

  function triggerArcheryVictory() {
    ArcheryGame.isRunning = false;
    if (ArcheryGame.animId) cancelAnimationFrame(ArcheryGame.animId);

    playArcherySuccessChime();
    createConfettiBurst(ArcheryGame.width * 0.5, ArcheryGame.height * 0.4, 60);

    if (typeof speakText === 'function') {
      const childName = (typeof getStudentFirstName === 'function') ? getStudentFirstName() : 'gran arquero';
      speakText(`¡Misión cumplida ${childName}! ¡Completaste todas las palabras de la tarea con tu arco!`);
    }

    const modal = document.getElementById('archery-victory-modal');
    if (modal) modal.style.display = 'flex';
  }

  window.closeArcheryVictoryModal = function() {
    window.closeArcheryAndReturnToMap();
  };

  window.replayArcheryQuest = function() {
    const modal = document.getElementById('archery-victory-modal');
    if (modal) modal.style.display = 'none';
    initArcheryGame();
  };

  // --- RENDERIZADO DEL ARQUERO (ADAPTADO A LA MASCOTA ELEGIDA POR EL USUARIO) ---
  function drawMascotArcher(ctx, time) {
    const a = ArcheryGame.archer;
    const petType = getActivePet();

    const breathing = Math.sin(time * 0.0035) * 2.8;
    const tailWag = Math.sin(time * 0.007) * 0.32;

    if (a.isCelebrating) {
      a.jumpY += a.jumpVy;
      a.jumpVy += 0.55;
      if (a.jumpY > 0) {
        a.jumpY = 0;
        a.jumpVy = -7.5;
      }
      a.celebrateTimer--;
      if (a.celebrateTimer <= 0) {
        a.isCelebrating = false;
        a.jumpY = 0;
      }
    }

    a.aimAngle += (a.targetAimAngle - a.aimAngle) * 0.22;
    if (a.recoil > 0) a.recoil *= 0.82;
    if (a.shootCooldown > 0) a.shootCooldown--;

    a.blinkTimer--;
    if (a.blinkTimer <= 0) {
      a.isBlinking = true;
      if (a.blinkTimer < -8) {
        a.isBlinking = false;
        a.blinkTimer = 160 + Math.random() * 120;
      }
    }

        const isUnicorn = petType.includes('🦄') || petType.includes('unicorn');

    // 🌟 RENDERIZADO DEL UNICORNIO ARQUERO EN PERSPECTIVA 3D (3 ÁNGULOS REACTIVOS)
    if (isUnicorn) {
      const spriteChoice = getUnicornAimingSprite();
      const currentImg = spriteChoice.img;
      const isLoaded = spriteChoice.isLoaded || currentImg.complete || currentImg.naturalWidth > 0;

      if (isLoaded) {
        ctx.save();
        try {
          const recoilOffset = a.recoil;
          const breathY = Math.sin(time * 0.0035) * 2.5;

          // Centrado en el camino con retroceso y salto de victoria
          ctx.translate(a.x, a.y + a.jumpY + breathY + recoilOffset * 0.5);

          // Sombra en el suelo bajo las pezuñas
          ctx.beginPath();
          ctx.ellipse(0, 32, 52, 13, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.fill();

          // Tamaño del sprite en primer plano
          const spriteSize = Math.max(135, Math.min(170, ArcheryGame.height * 0.38));
          const spriteX = -spriteSize * 0.50;
          const spriteY = -spriteSize + 32;

          ctx.drawImage(currentImg, spriteX, spriteY, spriteSize, spriteSize);

        } finally {
          ctx.restore();
        }
        return;
      }
    }
    const isDragon = petType.includes('🐉') || petType.includes('dragon');
    const isBear = petType.includes('🐻') || petType.includes('bear');
    const isLion = petType.includes('🦁') || petType.includes('lion');
    const isDog = (!isBunny && !isCat && !isFox && !isUnicorn && !isDragon && !isBear && !isLion);

    // Paleta de colores distintiva por animal
    let coatColor = '#E0A96D';
    let coatStroke = '#B87333';
    let headColor = '#FFFBEB';
    let chestColor = '#FFFFFF';

    if (isCat) {
      coatColor = '#FED7AA'; // Naranja melocotón atigrado
      coatStroke = '#EA580C';
      headColor = '#FFF7ED';
      chestColor = '#FFFFFF';
    } else if (isFox) {
      coatColor = '#EA580C'; // Naranja zorro intenso
      coatStroke = '#9A3412';
      headColor = '#FFEDD5';
      chestColor = '#FFFFFF';
    } else if (isBunny) {
      coatColor = '#FFFFFF'; // Conejo blanco puro
      coatStroke = '#94A3B8';
      headColor = '#FFFFFF';
      chestColor = '#F8FAFC';
    } else if (isUnicorn) {
      coatColor = '#FFFFFF'; // Unicornio perla
      coatStroke = '#818CF8';
      headColor = '#FEF3C7';
      chestColor = '#FFFFFF';
    } else if (isDragon) {
      coatColor = '#10B981'; // Dragón verde esmeralda
      coatStroke = '#047857';
      headColor = '#D1FAE5';
      chestColor = '#6EE7B7';
    } else if (isBear) {
      coatColor = '#78350F'; // Oso marrón chocolate
      coatStroke = '#451A03';
      headColor = '#92400E';
      chestColor = '#D97706';
    } else if (isLion) {
      coatColor = '#D97706'; // León dorado sabana
      coatStroke = '#92400E';
      headColor = '#FEF3C7';
      chestColor = '#FDE68A';
    } else {
      // 🐶 Perrito
      coatColor = '#E0A96D';
      coatStroke = '#92400E';
      headColor = '#FFFBEB';
      chestColor = '#FFFFFF';
    }

    ctx.save();
    try {
      ctx.translate(a.x, a.y + a.jumpY);

      // Sombra en el suelo
      ctx.beginPath();
      ctx.ellipse(0, 32, 40, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fill();

      // Carcaj de flechas en la espalda
      ctx.save();
      ctx.rotate(0.35);
      ctx.fillStyle = '#78350F';
      ctx.fillRect(-38, -35, 14, 38);
      for (let k = 0; k < 3; k++) {
        ctx.fillStyle = k === 1 ? '#FDE047' : '#10B981';
        ctx.beginPath();
        ctx.moveTo(-35 + k * 4, -35);
        ctx.lineTo(-37 + k * 4, -48);
        ctx.lineTo(-33 + k * 4, -48);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // ALAS PEQUEÑAS DE DRAGÓN (SI ES DRAGÓN)
      if (isDragon) {
        ctx.save();
        ctx.translate(-15, -6 + breathing);
        ctx.fillStyle = '#059669';
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-24, -20);
        ctx.lineTo(-12, -10);
        ctx.lineTo(-18, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // COLA ESPECÍFICA DE CADA ANIMAL
      ctx.save();
      ctx.translate(-26, 6);
      ctx.rotate(-0.25 + tailWag);

      if (isBunny) {
        // Pompón blanco de conejito
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-8, 2, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (isFox) {
        // Enorme cola tupida de zorro con punta blanca
        ctx.fillStyle = '#EA580C';
        ctx.beginPath();
        ctx.ellipse(-20, 2, 25, 12, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(-38, -2, 10, 8, -0.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (isCat) {
        // Cola esbelta y curvada de gatito
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.strokeStyle = coatColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-18, -12, -22, -28);
        ctx.stroke();
      } else if (isUnicorn) {
        // Cola mágica ondeante de unicornio (capas pastel)
        ctx.fillStyle = '#F472B6';
        ctx.beginPath();
        ctx.ellipse(-18, 2, 20, 10, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#60A5FA';
        ctx.beginPath();
        ctx.ellipse(-16, 6, 16, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (isDragon) {
        // Cola de dragón con púas y punta de flecha
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.strokeStyle = coatColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-18, 4, -28, -6);
        ctx.stroke();
        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.moveTo(-28, -6);
        ctx.lineTo(-36, -2);
        ctx.lineTo(-34, -12);
        ctx.closePath();
        ctx.fill();
      } else if (isLion) {
        // Cola de león con mechón oscuro en la punta
        ctx.lineWidth = 5;
        ctx.strokeStyle = coatColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-16, -10, -26, -18);
        ctx.stroke();
        ctx.fillStyle = '#78350F';
        ctx.beginPath();
        ctx.arc(-26, -18, 7, 0, Math.PI * 2);
        ctx.fill();
      } else if (isBear) {
        // Colita redondeada de osito
        ctx.fillStyle = coatColor;
        ctx.beginPath();
        ctx.arc(-8, 4, 8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Cola batiente de perrito
        ctx.fillStyle = coatColor;
        ctx.beginPath();
        ctx.ellipse(-15, 0, 17, 8, -0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = coatStroke;
        ctx.stroke();
      }
      ctx.restore();

      // CUERPO
      ctx.save();
      ctx.translate(0, breathing);
      ctx.fillStyle = coatColor;
      ctx.beginPath();
      ctx.ellipse(-5, 8, 28, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = coatStroke;
      ctx.stroke();

      // Pecho esponjoso
      ctx.fillStyle = chestColor;
      ctx.beginPath();
      ctx.ellipse(8, 10, 14, 16, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Medalla dorada en el pecho con el emoji de la mascota elegida
      ctx.beginPath();
      ctx.arc(6, 14, 13, 0, Math.PI * 2);
      ctx.fillStyle = '#FEF08A';
      ctx.fill();
      ctx.strokeStyle = '#CA8A04';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '16px "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(petType, 6, 14);

      ctx.restore();

      // Patitas
      ctx.fillStyle = coatColor;
      ctx.beginPath();
      ctx.ellipse(-15, 28, 9, 6, 0, 0, Math.PI * 2);
      ctx.ellipse(8, 28, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // CABEZA Y RASGOS FACIALES
      ctx.save();
      const headRot = a.aimAngle * 0.22;
      ctx.translate(2, -14 + breathing);
      ctx.rotate(headRot);

      // MELENA GIGANTE DE LEÓN (SI ES LEÓN)
      if (isLion) {
        ctx.fillStyle = '#B45309';
        ctx.beginPath();
        ctx.arc(0, 0, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // CRÁNEO
      ctx.fillStyle = headColor;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = coatStroke;
      ctx.stroke();

      // MEJILLAS BLANCAS SI ES ZORRO
      if (isFox) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(-14, 8, 8, 6, -0.2, 0, Math.PI * 2);
        ctx.ellipse(14, 8, 8, 6, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // MEJILLAS SONROJADAS
      ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
      ctx.beginPath();
      ctx.arc(-11, 7, 5, 0, Math.PI * 2);
      ctx.arc(11, 7, 5, 0, Math.PI * 2);
      ctx.fill();

      // HOCICO Y NARIZ SEGÚN LA ESPECIE
      ctx.fillStyle = (isCat || isBunny || isUnicorn) ? '#FFFFFF' : '#FEF3C7';
      ctx.beginPath();
      ctx.ellipse(4, 6, 11, 8.5, 0, 0, Math.PI * 2);
      ctx.fill();

      if (isCat || isBunny) {
        // Nariz rosita
        ctx.fillStyle = '#F472B6';
        ctx.beginPath();
        ctx.arc(5, 3, 3.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (isDragon) {
        // Fosas nasales de dragón
        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.arc(2, 3, 1.8, 0, Math.PI * 2);
        ctx.arc(7, 3, 1.8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Nariz negra de perrito / zorrito / osito
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(5, 2.5, 3.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // LENGÜITA DE PERRITO FELIZ
      if (isDog) {
        ctx.fillStyle = '#FB7185';
        ctx.beginPath();
        ctx.ellipse(6, 11, 4, 5, 0, 0, Math.PI);
        ctx.fill();
      }

      // DIENTES DE CONEJITO
      if (isBunny) {
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1;
        ctx.fillRect(3, 7, 3, 4);
        ctx.strokeRect(3, 7, 3, 4);
        ctx.fillRect(6, 7, 3, 4);
        ctx.strokeRect(6, 7, 3, 4);
      }

      // BIGOTES SI ES GATO
      if (isCat) {
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(13, 3); ctx.lineTo(26, 1);
        ctx.moveTo(13, 6); ctx.lineTo(25, 8);
        ctx.moveTo(-5, 3); ctx.lineTo(-18, 1);
        ctx.moveTo(-5, 6); ctx.lineTo(-17, 8);
        ctx.stroke();
      }

      // OJOS EXPRESIVOS
      if (a.isBlinking) {
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(-4, -4, 4, Math.PI, 0);
        ctx.arc(10, -4, 4, Math.PI, 0);
        ctx.stroke();
      } else {
        const eyeLookX = Math.cos(a.aimAngle) * 2;
        const eyeLookY = Math.sin(a.aimAngle) * 2;

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(-4, -4, 5.5, 7.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.arc(-4 + eyeLookX, -4 + eyeLookY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-5 + eyeLookX, -6 + eyeLookY, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(10, -4, 5.5, 7.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.arc(10 + eyeLookX, -4 + eyeLookY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(9 + eyeLookX, -6 + eyeLookY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // OREJAS Y RASGOS SUPERIORES VISIBLES (SIN SOMBRERO QUE LAS TAPE)
      if (isBunny) {
        // Orejas largas y erguidas de conejito (32px de alto)
        ctx.fillStyle = coatColor;
        ctx.beginPath();
        ctx.ellipse(-8, -32, 6.5, 20, -0.15, 0, Math.PI * 2);
        ctx.ellipse(8, -32, 6.5, 20, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = coatStroke;
        ctx.stroke();

        ctx.fillStyle = '#FBCFE8';
        ctx.beginPath();
        ctx.ellipse(-8, -32, 3.8, 15, -0.15, 0, Math.PI * 2);
        ctx.ellipse(8, -32, 3.8, 15, 0.15, 0, Math.PI * 2);
        ctx.fill();

      } else if (isCat) {
        // Orejas puntiagudas triangulares de gatito con interior rosa
        ctx.fillStyle = coatColor;
        ctx.beginPath();
        ctx.moveTo(-16, -14); ctx.lineTo(-20, -32); ctx.lineTo(-6, -20); ctx.closePath();
        ctx.moveTo(16, -14); ctx.lineTo(20, -32); ctx.lineTo(6, -20); ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = coatStroke;
        ctx.stroke();

        ctx.fillStyle = '#F472B6';
        ctx.beginPath();
        ctx.moveTo(-14, -16); ctx.lineTo(-17, -28); ctx.lineTo(-8, -20); ctx.closePath();
        ctx.moveTo(14, -16); ctx.lineTo(17, -28); ctx.lineTo(8, -20); ctx.closePath();
        ctx.fill();

      } else if (isFox) {
        // Orejas de zorro con punta negra
        ctx.fillStyle = '#EA580C';
        ctx.beginPath();
        ctx.moveTo(-16, -14); ctx.lineTo(-21, -34); ctx.lineTo(-6, -20); ctx.closePath();
        ctx.moveTo(16, -14); ctx.lineTo(21, -34); ctx.lineTo(6, -20); ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = coatStroke;
        ctx.stroke();

        // Puntas oscuras
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.moveTo(-19, -28); ctx.lineTo(-21, -34); ctx.lineTo(-14, -28); ctx.closePath();
        ctx.moveTo(19, -28); ctx.lineTo(21, -34); ctx.lineTo(14, -28); ctx.closePath();
        ctx.fill();

      } else if (isBear) {
        // Orejas redondas de osito
        ctx.fillStyle = coatColor;
        ctx.beginPath();
        ctx.arc(-16, -18, 10, 0, Math.PI * 2);
        ctx.arc(16, -18, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = coatStroke;
        ctx.stroke();

        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.arc(-16, -18, 5.5, 0, Math.PI * 2);
        ctx.arc(16, -18, 5.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (isDragon) {
        // Cuernos de dragón dorados y cresta
        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.moveTo(-12, -18); ctx.lineTo(-18, -34); ctx.lineTo(-6, -22); ctx.closePath();
        ctx.moveTo(12, -18); ctx.lineTo(18, -34); ctx.lineTo(6, -22); ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#D97706';
        ctx.stroke();

      } else if (isUnicorn) {
        // Orejitas de unicornio
        ctx.fillStyle = coatColor;
        ctx.beginPath();
        ctx.ellipse(-14, -18, 6, 12, -0.3, 0, Math.PI * 2);
        ctx.ellipse(14, -18, 6, 12, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Melena arcoíris pastel
        ctx.fillStyle = '#F472B6';
        ctx.beginPath();
        ctx.ellipse(-4, -24, 7, 10, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#60A5FA';
        ctx.beginPath();
        ctx.ellipse(4, -24, 7, 10, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // CUERNO MÁGICO DORADO BRILLANTE
        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.lineTo(6, -42);
        ctx.lineTo(12, -22);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#CA8A04';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Destello mágico
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(6, -42, 3, 0, Math.PI * 2);
        ctx.fill();

      } else if (isLion) {
        // Orejas redondeadas de león dentro de la melena
        ctx.fillStyle = coatColor;
        ctx.beginPath();
        ctx.arc(-16, -18, 8, 0, Math.PI * 2);
        ctx.arc(16, -18, 8, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // Orejas caídas y tiernas de perrito
        ctx.fillStyle = coatColor;
        ctx.beginPath();
        ctx.ellipse(-16, -12, 8, 16, -0.4, 0, Math.PI * 2);
        ctx.ellipse(16, -12, 8, 16, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = coatStroke;
        ctx.stroke();
      }

      // DISTINTIVO DE ARQUERO: Pluma heroica lateral (sin tapar cabeza ni orejas)
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.moveTo(-16, -20);
      ctx.quadraticCurveTo(-28, -32, -24, -40);
      ctx.quadraticCurveTo(-18, -30, -14, -22);
      ctx.fill();
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.moveTo(-14, -20);
      ctx.quadraticCurveTo(-22, -28, -20, -34);
      ctx.quadraticCurveTo(-16, -26, -12, -21);
      ctx.fill();

      ctx.restore();

      // ARCO Y FLECHA MAGICA
      ctx.save();
      const recoilOffset = a.recoil;
      ctx.translate(14 - recoilOffset * Math.cos(a.aimAngle), -10 - recoilOffset * Math.sin(a.aimAngle));
      ctx.rotate(a.aimAngle);

      const bowRadius = 38;
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(0, 0, bowRadius, -Math.PI * 0.38, Math.PI * 0.38, false);
      ctx.stroke();

      // Extremos dorados del arco
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(Math.cos(-Math.PI * 0.38) * bowRadius, Math.sin(-Math.PI * 0.38) * bowRadius, 4, 0, Math.PI * 2);
      ctx.arc(Math.cos(Math.PI * 0.38) * bowRadius, Math.sin(Math.PI * 0.38) * bowRadius, 4, 0, Math.PI * 2);
      ctx.fill();

      // Cuerda
      const pull = ArcheryGame.pointer.isDown ? 14 : (a.shootCooldown > 0 ? -6 : 2);
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.moveTo(Math.cos(-Math.PI * 0.38) * bowRadius, Math.sin(-Math.PI * 0.38) * bowRadius);
      ctx.lineTo(-pull, 0);
      ctx.lineTo(Math.cos(Math.PI * 0.38) * bowRadius, Math.sin(Math.PI * 0.38) * bowRadius);
      ctx.stroke();

      // Flecha tensada
      if (a.shootCooldown <= 2) {
        ctx.lineWidth = 2.8;
        ctx.strokeStyle = '#92400E';
        ctx.beginPath();
        ctx.moveTo(-pull, 0);
        ctx.lineTo(34, 0);
        ctx.stroke();

        // Punta de flecha dorada resplandeciente
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.moveTo(34, -5);
        ctx.lineTo(44, 0);
        ctx.lineTo(34, 5);
        ctx.closePath();
        ctx.fill();

        // Plumas traseras
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.moveTo(-pull, -4);
        ctx.lineTo(-pull + 7, -2);
        ctx.lineTo(-pull + 4, 0);
        ctx.lineTo(-pull + 7, 2);
        ctx.lineTo(-pull, 4);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

    } finally {
      ctx.restore();
    }
  }

  function drawTargetWord(ctx, t, time) {
    if (t.alpha <= 0.01) return;

    ctx.save();
    try {
      ctx.translate(t.x, t.y);
      ctx.scale(t.scale, t.scale);
      ctx.globalAlpha = t.alpha;

      if (t.wobble > 0) {
        ctx.rotate(Math.sin(time * 0.05) * (t.wobble * 0.025));
      }

      // Diana de tiro con arco
      ctx.beginPath();
      ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#78350F';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, t.radius - 3, 0, Math.PI * 2);
      ctx.fillStyle = '#F8FAFC';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, t.radius - 9, 0, Math.PI * 2);
      ctx.fillStyle = '#EF4444';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, t.radius - 15, 0, Math.PI * 2);
      ctx.fillStyle = '#FACC15';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#D97706';
      ctx.stroke();

      // Dibujo / Icono arriba de la diana
      drawWordIcon(ctx, t.emoji, 0, -t.radius - 10, 26);

      // Cartel con la palabra en letras grandes y legibles en la distancia
      const fontSize = Math.min(18, Math.max(13, 210 / (t.word.length + 3)));
      ctx.font = `900 ${fontSize}px "Comic Sans MS", "Nunito", sans-serif`;
      const textWidth = ctx.measureText(t.word).width;
      const badgeW = Math.max(76, textWidth + 20);
      const badgeH = 28;
      const badgeY = t.radius + 4;

      t.lastBadgeW = badgeW;
      t.lastBadgeH = badgeH;

      // Sombra que da relieve y separación cuando una palabra pasa por delante de otra
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      drawRoundedRect(ctx, -badgeW / 2, badgeY, badgeW, badgeH, 10);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = '#64748B'; // Borde neutro idéntico en todas
      ctx.stroke();

      ctx.fillStyle = '#0F172A'; // Texto en azul oscuro de alto contraste idéntico en todas
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.word, 0, badgeY + badgeH / 2 + 1);

    } finally {
      ctx.restore();
    }
  }

  // --- FLECHAS, ESTELAS Y PARTÍCULAS ---
  function drawArrow(ctx, arr) {
    ctx.save();
    try {
      ctx.translate(arr.x, arr.y);
      ctx.rotate(arr.angle);
      const arrowScale = arr.scale || 0.6;
      ctx.scale(arrowScale, arrowScale);

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#78350F';
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(16, 0);
      ctx.stroke();

      ctx.fillStyle = arr.isBouncing ? '#F59E0B' : '#E2E8F0';
      ctx.beginPath();
      ctx.moveTo(16, -4.5);
      ctx.lineTo(26, 0);
      ctx.lineTo(16, 4.5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = arr.isBouncing ? '#EF4444' : '#10B981';
      ctx.beginPath();
      ctx.moveTo(-22, -4);
      ctx.lineTo(-12, 0);
      ctx.lineTo(-22, 4);
      ctx.closePath();
      ctx.fill();
    } finally {
      ctx.restore();
    }
  }

  function drawTrajectoryDots(ctx) {
    const a = ArcheryGame.archer;
    const startX = a.x + 25;
    const startY = a.y - 30;

    const angle = a.aimAngle;
    const speed = 26;
    let simX = startX;
    let simY = startY;
    let simVy = Math.sin(angle) * speed;
    let simVx = Math.cos(angle) * speed;

    ctx.save();
    try {
      for (let k = 1; k <= 9; k++) {
        simX += simVx * 1.2;
        simY += simVy * 1.2;
        simVy += 0.06 * 1.2;

        const alpha = 1 - (k / 10);
        const size = 3.5 * alpha;
        ctx.fillStyle = `rgba(253, 224, 71, ${alpha * 0.85})`;
        ctx.beginPath();
        ctx.arc(simX, simY, size, 0, Math.PI * 2);
        ctx.fill();
      }
    } finally {
      ctx.restore();
    }
  }

  function drawParticles(ctx) {
    for (let i = ArcheryGame.particles.length - 1; i >= 0; i--) {
      const p = ArcheryGame.particles[i];

      // Onda expansiva de rebote / escudo protector
      if (p.type === 'shield_ring') {
        p.radius += (p.maxRadius - p.radius) * 0.18;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          ArcheryGame.particles.splice(i, 1);
          continue;
        }
        ctx.save();
        try {
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.strokeStyle = p.color || '#F59E0B';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.stroke();
        } finally {
          ctx.restore();
        }
        continue;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        ArcheryGame.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      try {
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } finally {
        ctx.restore();
      }
    }
  }

  function drawFloatingTexts(ctx) {
    for (let i = ArcheryGame.floatingTexts.length - 1; i >= 0; i--) {
      const ft = ArcheryGame.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= ft.decay;

      if (ft.alpha <= 0) {
        ArcheryGame.floatingTexts.splice(i, 1);
        continue;
      }

      ctx.save();
      try {
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = '900 20px "Comic Sans MS", "Nunito", sans-serif';
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 6;
        ctx.fillText(ft.text, ft.x, ft.y);
      } finally {
        ctx.restore();
      }
    }
  }

  function createSparkleBurst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 3.5;
      ArcheryGame.particles.push({
        x: x,
        y: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color: color || '#FDE047',
        size: 3 + Math.random() * 3,
        alpha: 1,
        decay: 0.04 + Math.random() * 0.03
      });
    }
  }

  function createConfettiBurst(x, y, count) {
    const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#EF4444', '#FDE047'];
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 3 + Math.random() * 6;
      ArcheryGame.particles.push({
        x: x,
        y: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 4,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.02
      });
    }
  }

  function createFloatingText(x, y, text, color) {
    ArcheryGame.floatingTexts.push({
      x: x,
      y: y,
      text: text,
      color: color || '#059669',
      vy: -1.8,
      alpha: 1,
      decay: 0.022
    });
  }

  // --- DIBUJADO DEL ESCENARIO 3D (DEL CUENTO DEL BOSQUE) ---
  function drawArcheryEnvironment(ctx, w, h, time) {
    const horizonY = h * 0.44;
    const vanishingX = w * 0.50;

    // 1. CIELO ATMOSFÉRICO 3D (DEL CUENTO DEL BOSQUE)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#74B9FF');
    skyGrad.addColorStop(0.65, '#A8E6CF');
    skyGrad.addColorStop(1, '#55EFC4');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY);

    // Sol Dorado en el Horizonte con Resplandor Mágico
    ctx.save();
    const sunGlow = ctx.createRadialGradient(vanishingX, horizonY - 12, 6, vanishingX, horizonY - 12, 75);
    sunGlow.addColorStop(0, 'rgba(255, 234, 167, 0.95)');
    sunGlow.addColorStop(0.5, 'rgba(255, 200, 100, 0.4)');
    sunGlow.addColorStop(1, 'rgba(255, 234, 167, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(vanishingX, horizonY - 12, 75, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(vanishingX, horizonY - 12, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#FEF08A';
    ctx.fill();
    ctx.restore();

    // Nubes y Pájaros 3D del Bosque
    ctx.save();
    ArcheryGame.bgClouds.forEach(c => {
      c.x += c.speed * 0.4;
      if (c.x > w + 100) c.x = -120;
      ctx.font = `${Math.round(26 * c.scale)}px "Segoe UI Emoji", serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText('☁️', c.x, c.y);
    });

    if (ArcheryGame.archeryBirds3D) {
      ArcheryGame.archeryBirds3D.forEach(b => {
        b.x += b.speed;
        if (b.x > w + 60) b.x = -60;
        const flapY = Math.sin(time * 0.006 + b.flapOffset) * 5;
        ctx.font = '20px "Segoe UI Emoji", serif';
        ctx.fillText(b.icon, b.x, b.y + flapY);
      });
    }
    ctx.restore();

    // Montañas lejanas en el horizonte
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.quadraticCurveTo(w * 0.25, horizonY - 35, w * 0.48, horizonY);
    ctx.quadraticCurveTo(w * 0.72, horizonY - 42, w, horizonY);
    ctx.lineTo(w, horizonY);
    ctx.lineTo(0, horizonY);
    ctx.closePath();
    ctx.fill();

    // 2. TERRENO DE CÉSPED EN PERSPECTIVA (DEL CUENTO DEL BOSQUE)
    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    groundGrad.addColorStop(0, '#26AF5F');
    groundGrad.addColorStop(1, '#1E8449');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // 3. CAMINO DE TIERRA EN PERSPECTIVA 3D (DEL CUENTO DEL BOSQUE)
    const roadTopWidth = Math.max(34, w * 0.07);
    const roadBottomWidth = Math.min(w * 0.74, 580);

    ctx.save();
    const roadGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    roadGrad.addColorStop(0, '#FFEAA7');
    roadGrad.addColorStop(1, '#FDCB6E');
    ctx.fillStyle = roadGrad;

    ctx.beginPath();
    ctx.moveTo(vanishingX - roadTopWidth / 2, horizonY);
    ctx.lineTo(vanishingX + roadTopWidth / 2, horizonY);
    ctx.lineTo(vanishingX + roadBottomWidth / 2, h);
    ctx.lineTo(vanishingX - roadBottomWidth / 2, h);
    ctx.closePath();
    ctx.fill();

    // Bordes del camino de tierra
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(vanishingX - roadTopWidth / 2, horizonY);
    ctx.lineTo(vanishingX - roadBottomWidth / 2, h);
    ctx.moveTo(vanishingX + roadTopWidth / 2, horizonY);
    ctx.lineTo(vanishingX + roadBottomWidth / 2, h);
    ctx.stroke();

    // Franjas de movimiento 3D en el camino (avanzando hacia el bosque)
    ArcheryGame.roadOffset = (ArcheryGame.roadOffset || 0) + 0.008;
    ctx.strokeStyle = 'rgba(211, 84, 0, 0.32)';
    ctx.lineWidth = 3;
    const stripeCount = 7;
    for (let i = 0; i < stripeCount; i++) {
      let stripeZ = (i / stripeCount + (ArcheryGame.roadOffset % (1 / stripeCount))) % 1.0;
      let sy = horizonY + (1 - stripeZ) * (h - horizonY);
      let sw = roadTopWidth + (1 - stripeZ) * (roadBottomWidth - roadTopWidth);
      ctx.beginPath();
      ctx.moveTo(vanishingX - sw / 2, sy);
      ctx.lineTo(vanishingX + sw / 2, sy);
      ctx.stroke();
    }
    ctx.restore();

    // 4. ÁRBOLES EN PERSPECTIVA 3D A AMBOS LADOS DEL CAMINO
    if (ArcheryGame.archeryTrees3D) {
      const sortedTrees = [...ArcheryGame.archeryTrees3D].sort((a, b) => b.z - a.z);
      sortedTrees.forEach(t => {
        let treeY = horizonY + (1 - t.z) * (h - horizonY - 15);
        let scale = 0.22 + (1 - t.z) * 1.05;
        let roadWAtZ = roadTopWidth + (1 - t.z) * (roadBottomWidth - roadTopWidth);
        let treeX = vanishingX + t.side * (roadWAtZ / 2 + 28 * scale + 14);

        ctx.save();
        ctx.font = `${Math.round(52 * scale)}px "Segoe UI Emoji", serif`;
        ctx.textAlign = 'center';
        ctx.fillText(t.type, treeX, treeY);
        ctx.restore();
      });
    }
  }

  // --- BUCLE PRINCIPAL (CON RESETEO DE TRANSFORMACIÓN INCONDICIONAL) ---
  function archeryGameLoop(timestamp) {
    if (!ArcheryGame.isRunning) return;

    try {
      ArcheryGame.time = timestamp || 0;
      const ctx = ArcheryGame.ctx;
      const w = ArcheryGame.width;
      const h = ArcheryGame.height;

      // Resetear matriz a identidad siempre
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // 1. Entorno 3D del Bosque
      drawArcheryEnvironment(ctx, w, h, ArcheryGame.time);

      // 2. Objetivos móviles ordenados por profundidad (z mayor = fondo se dibuja primero, z menor = frente se dibuja encima)
      updateTargets();
      const sortedTargets = [...ArcheryGame.targets].sort((a, b) => (b.z - a.z) || (a.id - b.id));
      sortedTargets.forEach(t => drawTargetWord(ctx, t, ArcheryGame.time));

      // 3. Flechas (vuelo y rebote)
      updateArrows();
      ArcheryGame.arrows.forEach(arr => drawArrow(ctx, arr));

      // 4. Guía de trayectoria
      if (ArcheryGame.pointer.isDown || ArcheryGame.archer.isAiming) {
        drawTrajectoryDots(ctx);
      }

      // 5. Partículas, ondas de rebote y textos flotantes
      drawParticles(ctx);
      drawFloatingTexts(ctx);

      // 6. Mascota arquera animada en primer plano
      drawMascotArcher(ctx, ArcheryGame.time);

    } catch (err) {
      // Proteger bucle silenciosamente
    }

    if (ArcheryGame.isRunning) {
      ArcheryGame.animId = requestAnimationFrame(archeryGameLoop);
    }
  }

  // --- CONTROLES RESPONSIVOS (DISPARO DIRECTO AL TOQUE Y ARRASTRE) ---
  function setupArcheryEventListeners() {
    const canvas = ArcheryGame.canvas;
    if (!canvas) return;

    function getCanvasPos(e) {
      const rect = canvas.getBoundingClientRect();
      let clientX = e.clientX;
      let clientY = e.clientY;

      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      }

      const scaleX = canvas.width / (rect.width || 1);
      const scaleY = canvas.height / (rect.height || 1);

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    function onPointerMove(e) {
      const pos = getCanvasPos(e);
      ArcheryGame.pointer.x = pos.x;
      ArcheryGame.pointer.y = pos.y;

      const ax = ArcheryGame.archer.x + 25;
      const ay = ArcheryGame.archer.y - 30;
      ArcheryGame.archer.targetAimAngle = Math.atan2(pos.y - ay, pos.x - ax);
    }

    function onPointerDown(e) {
      const pos = getCanvasPos(e);
      ArcheryGame.pointer.isDown = true;
      ArcheryGame.pointer.x = pos.x;
      ArcheryGame.pointer.y = pos.y;
      ArcheryGame.archer.isAiming = true;

      const ax = ArcheryGame.archer.x + 25;
      const ay = ArcheryGame.archer.y - 30;
      ArcheryGame.archer.targetAimAngle = Math.atan2(pos.y - ay, pos.x - ax);

      shootArrowAt(pos.x, pos.y);
    }

    function onPointerUp(e) {
      ArcheryGame.pointer.isDown = false;
      ArcheryGame.archer.isAiming = false;
    }

    canvas.onmousemove = onPointerMove;
    canvas.onmousedown = onPointerDown;
    window.onmouseup = onPointerUp;

    canvas.ontouchstart = function(e) {
      e.preventDefault();
      onPointerDown(e);
    };
    canvas.ontouchmove = function(e) {
      e.preventDefault();
      onPointerMove(e);
    };
    window.ontouchend = function(e) {
      onPointerUp(e);
    };
  }

  function shuffleArrayLocal(arr) {
    if (!Array.isArray(arr)) return [];
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

})(window);
