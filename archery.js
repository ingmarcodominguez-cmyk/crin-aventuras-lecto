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
  // 1. Unicornio Arquero
  const unicornImages = {
    center: new Image(),
    left: new Image(),
    right: new Image()
  };
  unicornImages.center.src = 'assets/unicornio_tiro_delantero.png?v=245';
  unicornImages.left.src = 'assets/unicornio_tiro_izquierda.png?v=245';
  unicornImages.right.src = 'assets/unicornio_tiro_derecha.png?v=245';

  let unicornImagesLoaded = {
    center: false,
    left: false,
    right: false
  };
  unicornImages.center.onload = () => { unicornImagesLoaded.center = true; };
  unicornImages.left.onload = () => { unicornImagesLoaded.left = true; };
  unicornImages.right.onload = () => { unicornImagesLoaded.right = true; };

  // 2. Zorro Arquero
  const foxImages = {
    center: new Image(),
    left: new Image(),
    right: new Image()
  };
  foxImages.center.src = 'assets/zorro_tiro_delantero.png?v=245';
  foxImages.left.src = 'assets/zorro_tiro_izquierda.png?v=245';
  foxImages.right.src = 'assets/zorro_tiro_derecha.png?v=245';

  let foxImagesLoaded = {
    center: false,
    left: false,
    right: false
  };
  foxImages.center.onload = () => { foxImagesLoaded.center = true; };
  foxImages.left.onload = () => { foxImagesLoaded.left = true; };
  foxImages.right.onload = () => { foxImagesLoaded.right = true; };

  // 3. Conejito Arquero
  const bunnyImages = {
    center: new Image(),
    left: new Image(),
    right: new Image()
  };
  bunnyImages.center.src = 'assets/conejo_tiro_delantero.png?v=245';
  bunnyImages.left.src = 'assets/conejo_tiro_izquierda.png?v=245';
  bunnyImages.right.src = 'assets/conejo_tiro_derecha.png?v=245';

  let bunnyImagesLoaded = {
    center: false,
    left: false,
    right: false
  };
  bunnyImages.center.onload = () => { bunnyImagesLoaded.center = true; };
  bunnyImages.left.onload = () => { bunnyImagesLoaded.left = true; };
  bunnyImages.right.onload = () => { bunnyImagesLoaded.right = true; };

  // 4. Perrito Arquero
  const dogImages = {
    center: new Image(),
    left: new Image(),
    right: new Image()
  };
  dogImages.center.src = 'assets/perro_tiro_delantero.png?v=245';
  dogImages.left.src = 'assets/perro_tiro_izquierda.png?v=245';
  dogImages.right.src = 'assets/perro_tiro_derecha.png?v=245';

  let dogImagesLoaded = {
    center: false,
    left: false,
    right: false
  };
  dogImages.center.onload = () => { dogImagesLoaded.center = true; };
  dogImages.left.onload = () => { dogImagesLoaded.left = true; };
  dogImages.right.onload = () => { dogImagesLoaded.right = true; };

  // Selectores de sprites reactivos según el ángulo de puntería en pantalla
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

  function getFoxAimingSprite() {
    const px = ArcheryGame.pointer.x;
    const w = ArcheryGame.width;

    if (px < w * 0.40) {
      return { img: foxImages.left, type: 'left', isLoaded: foxImagesLoaded.left || foxImages.left.complete };
    } else if (px > w * 0.60) {
      return { img: foxImages.right, type: 'right', isLoaded: foxImagesLoaded.right || foxImages.right.complete };
    } else {
      return { img: foxImages.center, type: 'center', isLoaded: foxImagesLoaded.center || foxImages.center.complete };
    }
  }

  function getBunnyAimingSprite() {
    const px = ArcheryGame.pointer.x;
    const w = ArcheryGame.width;

    if (px < w * 0.40) {
      return { img: bunnyImages.left, type: 'left', isLoaded: bunnyImagesLoaded.left || bunnyImages.left.complete };
    } else if (px > w * 0.60) {
      return { img: bunnyImages.right, type: 'right', isLoaded: bunnyImagesLoaded.right || bunnyImages.right.complete };
    } else {
      return { img: bunnyImages.center, type: 'center', isLoaded: bunnyImagesLoaded.center || bunnyImages.center.complete };
    }
  }

  function getDogAimingSprite() {
    const px = ArcheryGame.pointer.x;
    const w = ArcheryGame.width;

    if (px < w * 0.40) {
      return { img: dogImages.left, type: 'left', isLoaded: dogImagesLoaded.left || dogImages.left.complete };
    } else if (px > w * 0.60) {
      return { img: dogImages.right, type: 'right', isLoaded: dogImagesLoaded.right || dogImages.right.complete };
    } else {
      return { img: dogImages.center, type: 'center', isLoaded: dogImagesLoaded.center || dogImages.center.complete };
    }
  }


  // Helper universal de rectángulo redondeado (100% compatible con todos los navegadores)
  // Obtener la mascota elegida por el usuario (prioriza la elegida en la partida activa)
  function getActivePet() {
    if (typeof ArcheryGame !== 'undefined' && ArcheryGame.selectedPet) {
      if (['🦄', '🦊', '🐰', '🐶'].includes(ArcheryGame.selectedPet)) {
        return ArcheryGame.selectedPet;
      }
    }
    try {
      const saved = localStorage.getItem('crin_archery_pet');
      if (saved && ['🦄', '🦊', '🐰', '🐶'].includes(saved)) {
        if (typeof ArcheryGame !== 'undefined') ArcheryGame.selectedPet = saved;
        return saved;
      }
    } catch (e) {}

    // Por defecto al héroe Unicornio Mágico
    if (typeof ArcheryGame !== 'undefined') ArcheryGame.selectedPet = '🦄';
    return '🦄';
  }

  // --- VALIDADOR DE PALABRAS PERMITIDAS (FILTRA ESTRICTAMENTE CUALQUIER PALABRA DESACTIVADA) ---
  function isArcheryWordAllowed(word) {
    if (!word || typeof word !== 'string') return false;
    const clean = word.toUpperCase().replace(/[¡!¿?.,]/g, '').trim();
    if (clean.length < 2) return false;

    // 1. Chequeo de función global del diccionario CRIN
    if (typeof isWordDeleted === 'function' && isWordDeleted(clean)) {
      return false;
    }

    // 2. Chequeo directo en localStorage crin_deleted_words
    try {
      const deletedStored = JSON.parse(localStorage.getItem('crin_deleted_words') || '[]');
      if (Array.isArray(deletedStored) && deletedStored.includes(clean)) {
        return false;
      }
    } catch (e) {}

    // 3. Chequeo de deletedWordsList en memoria si existe
    if (typeof deletedWordsList !== 'undefined' && Array.isArray(deletedWordsList) && deletedWordsList.includes(clean)) {
      return false;
    }

    return true;
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
    try {
      localStorage.setItem('crin_archery_pet', petEmoji);
    } catch (e) {}

    if (typeof gameState !== 'undefined') {
      gameState.pet = petEmoji;
    }
    if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
      activeChildProfile.pet = petEmoji;
      if (typeof saveActiveChildProfile === 'function') saveActiveChildProfile();
    }
    const iconBtn = document.getElementById('archery-pet-btn-icon');
    if (iconBtn) {
      const petThumbnails = {
        '🦄': 'assets/card_unicornio_arquero.png?v=248',
        '🦊': 'assets/card_zorro_arquero.png?v=248',
        '🐰': 'assets/card_conejo_arquero.png?v=248',
        '🐶': 'assets/card_perro_arquero.png?v=248'
      };
      if (petThumbnails[petEmoji]) {
        iconBtn.innerHTML = `<img src="${petThumbnails[petEmoji]}" style="width: 26px; height: 26px; object-fit: contain; vertical-align: middle;">`;
      } else {
        iconBtn.innerText = petEmoji;
      }
    }
    const petDisplay = document.getElementById('pet-display');
    if (petDisplay) petDisplay.innerText = petEmoji;

    const modal = document.getElementById('archery-pet-modal');
    if (modal) modal.style.display = 'none';

    const names = {
      '🦄': 'Unicornio Mágico',
      '🦊': 'Zorro Héroe',
      '🐰': 'Conejito Ágil',
      '🐶': 'Perrito Valiente'
    };
    const name = names[petEmoji] || 'Héroe Arquero';

    // CALIBRADO CRUCIAL: El juego NO comienza hasta que el niño elija su avatar.
    // El relato termina de decir el héroe y recién arranca el juego con calma.
    if (!ArcheryGame.hasStarted) {
      let started = false;
      const startAfterPraise = () => {
        if (started) return;
        started = true;
        setTimeout(() => {
          startArcheryMatch();
        }, 500);
      };

      if (typeof speakText === 'function') {
        speakText('¡Excelente elección! ¡Tu arquero es el ' + name + '!', startAfterPraise);
      } else {
        startAfterPraise();
      }
      setTimeout(startAfterPraise, 3200);
    } else {
      if (typeof speakText === 'function') {
        speakText('¡Genial! Tu arquero ahora es el ' + name + '!');
      }
    }
  };

  window.closeArcheryPetModal = function() {
    const modal = document.getElementById('archery-pet-modal');
    if (modal) modal.style.display = 'none';

    if (!ArcheryGame.hasStarted) {
      setTimeout(() => {
        startArcheryMatch();
      }, 400);
    }
  };

  window.openArcheryPetModal = function() {
    const modal = document.getElementById('archery-pet-modal');
    if (modal) modal.style.display = 'flex';
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

  // --- OBTENER PALABRAS DE LA TAREA ACTIVA (SOLO PERMITIDAS) ---
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
      words = ['ZAPATO', 'MARIPOSA', 'PELOTA', 'MAMA', 'GATO', 'PERRO', 'CASA', 'SOL'];
    }

    return words.filter(isArcheryWordAllowed);
  }

  // --- OBTENER BANCO DE PALABRAS PARA MODO ALEATORIO (SOLO PERMITIDAS, NO DESACTIVADAS) ---
  function getArcheryRandomWords() {
    const wordsSet = new Set();
    
    // 1. De la Base de Datos Léxica Canónica (filtrando solo palabras permitidas)
    if (typeof CANONICAL_WORD_LEXICON !== 'undefined') {
      Object.keys(CANONICAL_WORD_LEXICON).forEach(k => {
        const item = CANONICAL_WORD_LEXICON[k];
        const w = (item && item.escritura) ? item.escritura : k;
        if (w && w.length >= 2 && w.length <= 11) {
          const clean = w.toUpperCase().trim();
          if (isArcheryWordAllowed(clean)) {
            wordsSet.add(clean);
          }
        }
      });
    }

    // 2. De todas las tareas registradas en la aplicación (filtrando solo palabras permitidas)
    if (typeof allTaskPacks !== 'undefined') {
      Object.values(allTaskPacks).forEach(pack => {
        if (pack && pack.words) {
          pack.words.forEach(w => {
            if (w && w.length >= 2) {
              const clean = w.toUpperCase().trim();
              if (isArcheryWordAllowed(clean)) {
                wordsSet.add(clean);
              }
            }
          });
        }
      });
    }

    // 3. De la lista personalizada si existe (filtrando solo palabras permitidas)
    if (typeof customWordsList !== 'undefined' && Array.isArray(customWordsList)) {
      customWordsList.forEach(item => {
        const w = item.word || item;
        if (w && typeof w === 'string') {
          const clean = w.toUpperCase().trim();
          if (isArcheryWordAllowed(clean)) {
            wordsSet.add(clean);
          }
        }
      });
    }

    // Fallbacks robustos (únicamente los que estén permitidos)
    const baseFallbacks = ['ZAPATO', 'MARIPOSA', 'PELOTA', 'MAMA', 'PAPA', 'GATO', 'PERRO', 'CASA', 'SOL', 'LUNA', 'MESA', 'PATO', 'MONO', 'SAPO', 'BARCO', 'DADO', 'LEON', 'OSO', 'FLOR', 'TREN', 'AVION'];
    if (wordsSet.size < 12) {
      baseFallbacks.forEach(w => {
        if (isArcheryWordAllowed(w)) wordsSet.add(w);
      });
    }

    const list = Array.from(wordsSet).filter(isArcheryWordAllowed);
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
    ArcheryGame.hasStarted = false;
    ArcheryGame.isRunning = false;
    ArcheryGame.isAdvancing = false;
    ArcheryGame.targets = [];
    ArcheryGame.arrows = [];
    if (ArcheryGame.advanceTimeout) clearTimeout(ArcheryGame.advanceTimeout);
    if (ArcheryGame.missionVoiceTimeout) clearTimeout(ArcheryGame.missionVoiceTimeout);

    // Preparar lienzo y entorno estático sin iniciar el juego ni decir frases todavía
    ArcheryGame.canvas = document.getElementById('archery-game-canvas');
    if (ArcheryGame.canvas) {
      ArcheryGame.ctx = ArcheryGame.canvas.getContext('2d');
      resizeArcheryCanvas();
      drawArcheryEnvironment(ArcheryGame.ctx, ArcheryGame.width, ArcheryGame.height, 0);
    }
    setupArcheryEventListeners();
    setTimeout(resizeArcheryCanvas, 50);
    setTimeout(resizeArcheryCanvas, 150);

    // ABRIR DE INMEDIATO EL SELECTOR DE HÉROES: EL JUEGO NO ARRANCA HASTA ELEGIR
    setTimeout(function() {
      const modal = document.getElementById('archery-pet-modal');
      if (modal) modal.style.display = 'flex';
    }, 60);
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

  function startArcheryMatch() {
    ArcheryGame.canvas = document.getElementById('archery-game-canvas');
    if (!ArcheryGame.canvas) return;
    ArcheryGame.ctx = ArcheryGame.canvas.getContext('2d');

    resizeArcheryCanvas();

    ArcheryGame.hasStarted = true;
    ArcheryGame.isRunning = true;
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

    // Árboles Grandes y Variados en Perspectiva 3D a la orilla del camino (estáticos y firmes)
    ArcheryGame.roadOffset = 0;
    ArcheryGame.archeryTrees3D = [];
    const treeShapes = ['pine', 'oak', 'poplar', 'autumn', 'fir', 'flowering'];
    for (let i = 0; i < 20; i++) {
      const z = (i / 20) * 0.94 + 0.03;
      const side = (i % 2 === 0) ? -1 : 1;
      const shape = treeShapes[i % treeShapes.length];
      const heightVar = 0.90 + (i * 17 % 7) * 0.05;
      ArcheryGame.archeryTrees3D.push({
        z: z,
        side: side,
        shape: shape,
        heightVar: heightVar,
        xOffset: (i * 19 % 13) - 6
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

    if (ArcheryGame.animId) cancelAnimationFrame(ArcheryGame.animId);
    ArcheryGame.animId = requestAnimationFrame(archeryGameLoop);

    updateArcheryHUD();
  }

  function initArcheryGame() {
    startArcheryMatch();
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
    }, 600);
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

    // Actualizar miniatura del arquero actual en el HUD
    const iconBtn = document.getElementById('archery-pet-btn-icon');
    if (iconBtn) {
      const curPet = getActivePet();
      const petThumbnails = {
        '🦄': 'assets/card_unicornio_arquero.png?v=248',
        '🦊': 'assets/card_zorro_arquero.png?v=248',
        '🐰': 'assets/card_conejo_arquero.png?v=248',
        '🐶': 'assets/card_perro_arquero.png?v=248'
      };
      if (petThumbnails[curPet]) {
        iconBtn.innerHTML = `<img src="${petThumbnails[curPet]}" style="width: 28px; height: 28px; object-fit: contain; vertical-align: middle;">`;
      } else {
        iconBtn.innerText = curPet;
      }
    }
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
    if (!ArcheryGame.isRunning || !ArcheryGame.hasStarted) return;
    if (typeof speakText === 'function') {
      const canon = (typeof getCanonicalWord === 'function') ? getCanonicalWord(ArcheryGame.targetWord) : null;
      const pronWord = canon ? canon.pronunciacion : ArcheryGame.targetWord;
      speakText(`Apunta a: ${pronWord}`);
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
    const availablePool = activePool.filter(w => w !== ArcheryGame.targetWord && isArcheryWordAllowed(w));
    const shuffled = shuffleArrayLocal(availablePool);
    const distractors = [];
    for (let w of shuffled) {
      if (!distractors.includes(w) && w !== ArcheryGame.targetWord && isArcheryWordAllowed(w)) {
        distractors.push(w);
        if (distractors.length >= 4) break;
      }
    }

    if (distractors.length < 4) {
      const fallbacks = ['SOL', 'LUNA', 'CASA', 'FLOR', 'PELOTA', 'GATO', 'MESA', 'PATO', 'BARCO', 'DADO', 'LEON', 'OSO', 'RANA', 'TREN'];
      for (let f of fallbacks) {
        if (f !== ArcheryGame.targetWord && !distractors.includes(f) && isArcheryWordAllowed(f)) {
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
      const candidates = activePool.filter(w => !flyingWords.includes(w) && w !== ArcheryGame.targetWord && isArcheryWordAllowed(w));

      let newWord = null;
      if (candidates.length > 0) {
        newWord = candidates[Math.floor(Math.random() * candidates.length)];
      } else {
        const fallbacks = ['SOL', 'LUNA', 'CASA', 'FLOR', 'PELOTA', 'GATO', 'MESA', 'PATO', 'BARCO', 'DADO', 'LEON', 'OSO', 'RANA', 'TREN', 'AVION'];
        const fallbackCandidates = fallbacks.filter(f => !flyingWords.includes(f) && f !== ArcheryGame.targetWord && isArcheryWordAllowed(f));
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
    const petType = getActivePet();
    const isFox = petType.includes('🦊') || petType.includes('fox');
    const isBunny = petType.includes('🐰') || petType.includes('bunny') || petType.includes('conejo');
    const isUnicorn = petType.includes('🦄') || petType.includes('unicorn');

    let spriteChoice = null;
    if (isFox) {
      spriteChoice = getFoxAimingSprite();
    } else if (isBunny) {
      spriteChoice = getBunnyAimingSprite();
    } else if (isUnicorn) {
      spriteChoice = getUnicornAimingSprite();
    } else {
      // Por defecto o si es perrito (🐶)
      spriteChoice = getDogAimingSprite();
    }

    let ax = a.x;
    let ay = a.y - 45;
    if (spriteChoice && spriteChoice.type === 'left') {
      ax = a.x - 22;
      ay = a.y - 50;
    } else if (spriteChoice && spriteChoice.type === 'right') {
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
        speakText('¡Rebotó! Espera que pase la otra palabra para disparar.');
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
      // ✅ ACIERTO EN LA PALABRA CORRECTA (¡SÚPER!)
      playArrowHitSound();
      playArcherySuccessChime();

      createConfettiBurst(target.x, target.y, 30);
      createFloatingText(target.x, target.y - 25, '¡SÚPER! +10 🪙', '#059669');

      ArcheryGame.archer.isCelebrating = true;
      ArcheryGame.archer.celebrateTimer = 90;
      ArcheryGame.archer.jumpVy = -8.5;

      ArcheryGame.score += 10;
      if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
        activeChildProfile.coins = (activeChildProfile.coins || 0) + 10;
        activeChildProfile.stars = (activeChildProfile.stars || 0) + 2;
        if (typeof saveActiveChildProfile === 'function') saveActiveChildProfile();
      }

      target.isFading = true;
      target.targetScale = 1.35;
      target.targetAlpha = 0;

      // Evitar avanzar múltiples veces si varias flechas impactan a la vez
      if (!ArcheryGame.isAdvancing) {
        ArcheryGame.isAdvancing = true;
        if (ArcheryGame.advanceTimeout) clearTimeout(ArcheryGame.advanceTimeout);

        // FUNCIÓN SEGURA PARA AVANZAR A LA SIGUIENTE PALABRA
        let hasAdvanced = false;
        const proceedToNextWord = () => {
          if (hasAdvanced) return;
          hasAdvanced = true;
          if (ArcheryGame.advanceTimeout) clearTimeout(ArcheryGame.advanceTimeout);

          // Pausa suave de 350ms tras terminar completamente de decir ¡Súper! antes de proponer la siguiente
          ArcheryGame.advanceTimeout = setTimeout(() => {
            if (ArcheryGame.mode === 'random') {
              ArcheryGame.randomHits = (ArcheryGame.randomHits || 0) + 1;
              setupNextRandomWord();
            } else {
              setupTargetWord(ArcheryGame.targetWordIndex + 1);
            }
          }, 350);
        };

        // DECIR ¡SÚPER! Y ESPERAR A QUE TERMINE COMPLETAMENTE LA FRASE ANTES DE AVANZAR
        if (typeof speakText === 'function') {
          speakText('¡Súper!', proceedToNextWord);
        } else {
          proceedToNextWord();
        }

        // Temporizador de respaldo por si el audio está silenciado en el navegador
        ArcheryGame.advanceTimeout = setTimeout(proceedToNextWord, 2800);
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

  // --- RENDERIZADO DEL ARQUERO (EXCLUSIVAMENTE LOS 4 HÉROES OFICIALES CON SPRITES REACTIVOS 3D) ---
  function drawMascotArcher(ctx, time) {
    const a = ArcheryGame.archer;
    const petType = getActivePet();

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

    const isUnicorn = petType.includes('🦄') || petType.includes('unicorn');
    const isFox = petType.includes('🦊') || petType.includes('fox');
    const isBunny = petType.includes('🐰') || petType.includes('bunny') || petType.includes('conejo');
    // Si no es unicornio, zorro ni conejo, por defecto es perrito (🐶)
    const isDog = !isUnicorn && !isFox && !isBunny;

    let spriteChoice = null;
    let shadowWidth = 50;
    let shadowHeight = 12;

    if (isUnicorn) {
      spriteChoice = getUnicornAimingSprite();
      shadowWidth = 54;
      shadowHeight = 13;
    } else if (isFox) {
      spriteChoice = getFoxAimingSprite();
      shadowWidth = 50;
      shadowHeight = 12;
    } else if (isBunny) {
      spriteChoice = getBunnyAimingSprite();
      shadowWidth = 48;
      shadowHeight = 12;
    } else {
      spriteChoice = getDogAimingSprite();
      shadowWidth = 50;
      shadowHeight = 12;
    }

    const currentImg = spriteChoice ? spriteChoice.img : null;
    const isLoaded = currentImg && (currentImg.complete || currentImg.naturalWidth > 0);

    ctx.save();
    try {
      const recoilOffset = a.recoil;
      const breathY = Math.sin(time * 0.0035) * 2.5;

      // Posicionamiento centrado en el camino con respiración suave, retroceso de tiro y salto de victoria
      ctx.translate(a.x, a.y + a.jumpY + breathY + recoilOffset * 0.5);

      // Sombra suave bajo el héroe arquero
      ctx.beginPath();
      ctx.ellipse(0, 32, shadowWidth, shadowHeight, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fill();

      // Tamaño equilibrado y proporcionado del héroe en primer plano
      const spriteSize = Math.max(135, Math.min(170, ArcheryGame.height * 0.38));
      const spriteX = -spriteSize * 0.50;
      const spriteY = -spriteSize + 32;

      if (isLoaded) {
        ctx.drawImage(currentImg, spriteX, spriteY, spriteSize, spriteSize);
      }
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

  // --- DIBUJADO DE ÁRBOLES GRANDES Y DE DIFERENTES FORMAS A LA ORILLA DEL CAMINO ---
  function drawIllustratedTree(ctx, x, y, scale, tree) {
    const s = scale * (tree.heightVar || 1.0);
    const trunkW = Math.max(6, Math.round(14 * s));
    const trunkH = Math.max(16, Math.round(36 * s));
    const treeW = Math.max(28, Math.round(72 * s));
    const shape = tree.shape || 'pine';

    ctx.save();

    // 1. Sombra de contacto suave en el césped
    ctx.beginPath();
    ctx.ellipse(x, y + 2, treeW * 0.44, Math.max(4, treeW * 0.12), 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(6, 78, 59, 0.30)';
    ctx.fill();

    // 2. Tronco de madera con volumen
    ctx.fillStyle = (shape === 'autumn') ? '#713F12' : '#78350F';
    ctx.beginPath();
    ctx.moveTo(x - trunkW * 0.5, y);
    ctx.lineTo(x - trunkW * 0.35, y - trunkH);
    ctx.lineTo(x + trunkW * 0.35, y - trunkH);
    ctx.lineTo(x + trunkW * 0.5, y);
    ctx.closePath();
    ctx.fill();

    // 3. Copa con diferentes formas y colores
    if (shape === 'pine' || shape === 'fir') {
      // PINO / ABETO: 3 niveles triangulares escalonados
      const tiers = [
        { y: y - trunkH * 0.6, w: treeW * 0.95, h: trunkH * 1.05, col: '#065F46', hi: '#047857' },
        { y: y - trunkH * 1.35, w: treeW * 0.75, h: trunkH * 0.95, col: '#059669', hi: '#10B981' },
        { y: y - trunkH * 2.05, w: treeW * 0.52, h: trunkH * 0.90, col: '#10B981', hi: '#34D399' }
      ];
      tiers.forEach(t => {
        ctx.fillStyle = t.col;
        ctx.beginPath();
        ctx.moveTo(x - t.w * 0.5, t.y);
        ctx.lineTo(x, t.y - t.h);
        ctx.lineTo(x + t.w * 0.5, t.y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = t.hi;
        ctx.beginPath();
        ctx.moveTo(x - t.w * 0.5, t.y);
        ctx.lineTo(x, t.y - t.h);
        ctx.lineTo(x, t.y);
        ctx.closePath();
        ctx.fill();
      });

    } else if (shape === 'oak') {
      // ROBLE FRONDOSO: Copa esponjosa en nubes verdes
      const baseY = y - trunkH * 0.9;
      const r = treeW * 0.34;
      ctx.fillStyle = '#14532D';
      ctx.beginPath();
      ctx.arc(x - r * 0.7, baseY - r * 0.3, r * 0.85, 0, Math.PI * 2);
      ctx.arc(x + r * 0.7, baseY - r * 0.3, r * 0.85, 0, Math.PI * 2);
      ctx.arc(x, baseY - r * 1.1, r * 0.95, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#15803D';
      ctx.beginPath();
      ctx.arc(x - r * 0.6, baseY - r * 0.45, r * 0.75, 0, Math.PI * 2);
      ctx.arc(x + r * 0.6, baseY - r * 0.45, r * 0.75, 0, Math.PI * 2);
      ctx.arc(x, baseY - r * 1.15, r * 0.85, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.arc(x - r * 0.35, baseY - r * 0.95, r * 0.60, 0, Math.PI * 2);
      ctx.arc(x + r * 0.35, baseY - r * 0.95, r * 0.60, 0, Math.PI * 2);
      ctx.arc(x, baseY - r * 1.35, r * 0.65, 0, Math.PI * 2);
      ctx.fill();

    } else if (shape === 'poplar') {
      // ÁLAMO / CIPRÉS: Copa alta, esbelta y elegante
      ctx.fillStyle = '#065F46';
      ctx.beginPath();
      ctx.ellipse(x, y - trunkH * 1.5, treeW * 0.28, trunkH * 1.3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0D9488';
      ctx.beginPath();
      ctx.ellipse(x - treeW * 0.05, y - trunkH * 1.55, treeW * 0.22, trunkH * 1.15, -0.05, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#14B8A6';
      ctx.beginPath();
      ctx.ellipse(x - treeW * 0.08, y - trunkH * 1.6, treeW * 0.14, trunkH * 0.85, -0.05, 0, Math.PI * 2);
      ctx.fill();

    } else if (shape === 'autumn') {
      // ARCE OTOÑAL: Copa en tonos dorados, ámbar y cálidos
      const baseY = y - trunkH * 0.9;
      const r = treeW * 0.33;
      ctx.fillStyle = '#9A3412';
      ctx.beginPath();
      ctx.arc(x - r * 0.7, baseY - r * 0.3, r * 0.85, 0, Math.PI * 2);
      ctx.arc(x + r * 0.7, baseY - r * 0.3, r * 0.85, 0, Math.PI * 2);
      ctx.arc(x, baseY - r * 1.1, r * 0.95, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#D97706';
      ctx.beginPath();
      ctx.arc(x - r * 0.6, baseY - r * 0.45, r * 0.75, 0, Math.PI * 2);
      ctx.arc(x + r * 0.6, baseY - r * 0.45, r * 0.75, 0, Math.PI * 2);
      ctx.arc(x, baseY - r * 1.15, r * 0.85, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(x - r * 0.3, baseY - r * 0.9, r * 0.58, 0, Math.PI * 2);
      ctx.arc(x + r * 0.3, baseY - r * 0.9, r * 0.58, 0, Math.PI * 2);
      ctx.arc(x, baseY - r * 1.3, r * 0.62, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FCD34D';
      ctx.beginPath();
      ctx.arc(x, baseY - r * 1.38, r * 0.38, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // ÁRBOL FLORECIDO DE FANTASÍA: Copa esmeralda con flores mágicas
      const baseY = y - trunkH * 0.9;
      const r = treeW * 0.32;
      ctx.fillStyle = '#065F46';
      ctx.beginPath();
      ctx.arc(x - r * 0.6, baseY - r * 0.35, r * 0.8, 0, Math.PI * 2);
      ctx.arc(x + r * 0.6, baseY - r * 0.35, r * 0.8, 0, Math.PI * 2);
      ctx.arc(x, baseY - r * 1.1, r * 0.9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(x, baseY - r * 1.05, r * 0.78, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#F472B6';
      const flowers = [
        { dx: -r * 0.5, dy: -r * 0.4 },
        { dx: r * 0.4, dy: -r * 0.3 },
        { dx: -r * 0.2, dy: -r * 1.0 },
        { dx: r * 0.35, dy: -r * 0.9 },
        { dx: 0, dy: -r * 1.3 }
      ];
      flowers.forEach(fl => {
        ctx.beginPath();
        ctx.arc(x + fl.dx, baseY + fl.dy, Math.max(2, Math.round(3.5 * s)), 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore();
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

    // 3. CAMINO DE TIERRA EN PERSPECTIVA 3D (FIJO Y ESTÁTICO, SIN MOVIMIENTO)
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

    // Bordes cálidos del camino de tierra (fijo)
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(vanishingX - roadTopWidth / 2, horizonY);
    ctx.lineTo(vanishingX - roadBottomWidth / 2, h);
    ctx.moveTo(vanishingX + roadTopWidth / 2, horizonY);
    ctx.lineTo(vanishingX + roadBottomWidth / 2, h);
    ctx.stroke();
    ctx.restore();

    // 4. ÁRBOLES GRANDES Y DE DIFERENTES FORMAS A AMBOS LADOS DEL CAMINO
    if (ArcheryGame.archeryTrees3D) {
      const sortedTrees = [...ArcheryGame.archeryTrees3D].sort((a, b) => b.z - a.z);
      sortedTrees.forEach(t => {
        const treeY = horizonY + (1 - t.z) * (h - horizonY - 8);
        const scale = 0.32 + (1 - t.z) * 1.30;
        const roadWAtZ = roadTopWidth + (1 - t.z) * (roadBottomWidth - roadTopWidth);
        const marginOffset = (42 + (1 - t.z) * 36) * scale + (t.xOffset || 0);
        const treeX = vanishingX + t.side * (roadWAtZ / 2 + marginOffset);

        drawIllustratedTree(ctx, treeX, treeY, scale, t);
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
