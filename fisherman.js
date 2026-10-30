// =========================================================================
// CRIN AVENTURAS DE LECTOESCRITURA - EL PESCADOR DE SÍLABAS
// Módulo Psicopedagógico de Conciencia Silábica y Síntesis Fonológica (DUA)
// =========================================================================

(function() {
  'use strict';

  const FishermanGame = {
    canvas: null,
    ctx: null,
    width: 800,
    height: 520,
    isRunning: false,
    animId: null,
    time: 0,

    // Modo de juego: 'task' (palabras de la tarea semanal) o 'random' (banco canónico)
    mode: 'task',

    // Palabra objetivo actual
    wordList: [],
    currentWordIndex: 0,
    currentWordObj: null,
    currentSyllables: [],
    currentSyllableTargetIndex: 0, // Índice de la sílaba que debe pescar ahora

    // Estado del juego
    fishes: [],
    splashParticles: [],
    floatingTexts: [],
    waterRipples: [],
    lilies: [],

    // Caña de pescar mágica
    rod: {
      originX: 180,
      originY: 260,
      tipX: 230,
      tipY: 210,
      hookX: 230,
      hookY: 340,
      targetFish: null,
      isCasting: false,
      castProgress: 0,
      isRetracting: false
    },

    // Estado del pescador
    hero: {
      x: 140,
      y: 280,
      isCelebrating: false,
      celebrateTimer: 0,
      jumpY: 0
    },

    // Arrastre táctil
    draggedFish: null,
    pointer: { x: 0, y: 0, isDown: false },

    // Selección de avatar y calibración de inicio
    activePet: '🦄',
    hasStarted: false,

    isSpeaking: false,
    isAdvancing: false,
    voiceTimeout: null
  };

  // BANCO CANÓNICO DE PALABRAS DE RESPALDO (graduadas bisílabas y trisílabas con imágenes reales)
  const FALLBACK_WORDS = [
    { word: 'PATO', silabas: ['PA', 'TO'], emoji: 'assets/pato.png', pron: 'pato' },
    { word: 'GATO', silabas: ['GA', 'TO'], emoji: 'assets/gato.png', pron: 'gato' },
    { word: 'SOPA', silabas: ['SO', 'PA'], emoji: 'assets/sopa.png', pron: 'sopa' },
    { word: 'CASA', silabas: ['CA', 'SA'], emoji: 'assets/casa.png', pron: 'casa' },
    { word: 'PELOTA', silabas: ['PE', 'LO', 'TA'], emoji: 'assets/pelota.png', pron: 'pelota' },
    { word: 'ZAPATO', silabas: ['ZA', 'PA', 'TO'], emoji: 'assets/zapato.png', pron: 'zapato' },
    { word: 'TOMATE', silabas: ['TO', 'MA', 'TE'], emoji: 'assets/tomate.png', pron: 'tomate' },
    { word: 'BANANA', silabas: ['BA', 'NA', 'NA'], emoji: 'assets/banana.png', pron: 'banana' },
    { word: 'LÁMPARA', silabas: ['LÁM', 'PA', 'RA'], emoji: 'assets/lampara.png', pron: 'lámpara' },
    { word: 'CAMISA', silabas: ['CA', 'MI', 'SA'], emoji: 'assets/camisa.png', pron: 'camisa' }
  ];

  // COLORES VIBRANTES PARA LOS PECES
  const FISH_PALETTES = [
    { body: '#F97316', secondary: '#FDBA74', fin: '#EA580C', glow: 'rgba(249, 115, 22, 0.4)' }, // Naranja Nemo
    { body: '#06B6D4', secondary: '#67E8F9', fin: '#0891B2', glow: 'rgba(6, 182, 212, 0.4)' },  // Turquesa
    { body: '#EC4899', secondary: '#F472B6', fin: '#DB2777', glow: 'rgba(236, 72, 153, 0.4)' }, // Magenta
    { body: '#EAB308', secondary: '#FDE047', fin: '#CA8A04', glow: 'rgba(234, 179, 8, 0.4)' },   // Dorado
    { body: '#8B5CF6', secondary: '#C084FC', fin: '#7C3AED', glow: 'rgba(139, 92, 246, 0.4)' }, // Violeta
    { body: '#10B981', secondary: '#6EE7B7', fin: '#059669', glow: 'rgba(16, 185, 129, 0.4)' }  // Esmeralda
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

  // Comprueba si una palabra está eliminada en la configuración
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

  // --- REGISTRO DE PESCADORES OFICIALES Y CALIBRACIÓN DE CAÑA Y MUELLE ---
  const FISHERMAN_AVATARS = {
    '🦄': {
      id: 'unicornio',
      name: 'Unicornio Mágico',
      src: 'assets/unicornio_pescador.png?v=255',
      cardSrc: 'assets/card_unicornio_arquero.png?v=249',
      rodTipNormalizedX: 0.9466,
      rodTipNormalizedY: 0.1426,
      chairFeetNormalizedY: 0.9766,
      aspectRatio: 1.5
    },
    '🐰': {
      id: 'conejo',
      name: 'Conejito Pescador',
      src: 'assets/conejo_pescador.png?v=255',
      cardSrc: 'assets/card_conejo_arquero.png?v=249',
      rodTipNormalizedX: 0.9450,
      rodTipNormalizedY: 0.0350, // Ojo metálico terminal de la caña donde el usuario retiró la tanza
      chairFeetNormalizedY: 0.9531,
      aspectRatio: 1.5
    },
    '🐶': {
      id: 'perro',
      name: 'Perrito Pescador',
      src: 'assets/perro_pescador.png?v=255',
      cardSrc: 'assets/card_perro_arquero.png?v=249',
      rodTipNormalizedX: 0.9476,
      rodTipNormalizedY: 0.0322, // Ojo metálico terminal de la caña del perrito
      chairFeetNormalizedY: 0.9482,
      aspectRatio: 1.5
    }
  };

  // Pre-carga inmediata de los pescadores oficiales en memoria
  getCachedImage('assets/unicornio_pescador.png?v=255');
  getCachedImage('assets/conejo_pescador.png?v=255');
  getCachedImage('assets/perro_pescador.png?v=255');

  function getActiveFishermanPet() {
    if (FishermanGame.activePet && FISHERMAN_AVATARS[FishermanGame.activePet]) {
      return FishermanGame.activePet;
    }
    let pet = '🦄';
    try {
      if (typeof activeChildProfile !== 'undefined' && activeChildProfile && activeChildProfile.activePet) {
        if (FISHERMAN_AVATARS[activeChildProfile.activePet]) {
          pet = activeChildProfile.activePet;
        }
      }
    } catch(e) {}
    FishermanGame.activePet = pet;
    return pet;
  }

  // Obtiene la imagen del pescador en el muelle
  function getFishermanAvatarSrc() {
    const pet = getActiveFishermanPet();
    const def = FISHERMAN_AVATARS[pet] || FISHERMAN_AVATARS['🦄'];
    return def.src;
  }

  // Obtiene la imagen de la mascota activa (tarjeta)
  function getActivePetCardSrc() {
    const pet = getActiveFishermanPet();
    const def = FISHERMAN_AVATARS[pet] || FISHERMAN_AVATARS['🦄'];
    return def.cardSrc;
  }

  // --- MODAL DE SELECCIÓN DE PESCADOR ---
  window.openFishermanPetModal = function() {
    const modal = document.getElementById('fisherman-pet-modal');
    if (modal) modal.style.display = 'flex';
  };

  window.closeFishermanPetModal = function() {
    const modal = document.getElementById('fisherman-pet-modal');
    if (modal) modal.style.display = 'none';
    if (!FishermanGame.hasStarted) {
      startFishermanRounds();
    }
  };

  window.setFishermanPet = function(petEmoji) {
    FishermanGame.activePet = petEmoji;
    try {
      if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
        activeChildProfile.activePet = petEmoji;
        if (typeof saveActiveChildProfile === 'function') saveActiveChildProfile();
      }
    } catch(e) {}

    const modal = document.getElementById('fisherman-pet-modal');
    if (modal) modal.style.display = 'none';

    resizeFishermanCanvas();

    const def = FISHERMAN_AVATARS[petEmoji] || FISHERMAN_AVATARS['🦄'];
    const petName = def.name;

    // CALIBRADO PEDAGÓGICO: Elogio de elección completo y arranque sin apuros
    if (!FishermanGame.hasStarted) {
      let started = false;
      const startAfterPraise = () => {
        if (started) return;
        started = true;
        // Pausa respetuosa y natural (1.2s) para que el niño disfrute su elección antes de la palabra
        setTimeout(() => {
          startFishermanRounds();
        }, 1200);
      };

      if (typeof speakText === 'function') {
        FishermanGame.isSpeaking = true;
        speakText(`¡Excelente elección! ¡Tu pescador es el ${petName}!`, () => {
          FishermanGame.isSpeaking = false;
          startAfterPraise();
        });
      } else {
        startAfterPraise();
      }
      setTimeout(startAfterPraise, 8500); // 8.5s de respaldo para que NUNCA corte "Perrito Pescador"
    } else {
      if (typeof speakText === 'function') {
        FishermanGame.isSpeaking = true;
        speakText(`¡Genial! ¡Tu pescador ahora es el ${petName}!`, () => {
          FishermanGame.isSpeaking = false;
        });
      }
    }
  };

  // --- CONTROL DE NAVEGACIÓN Y PANTALLA ---
  window.openFishermanQuestScreen = function(mode) {
    FishermanGame.mode = mode || 'task';
    FishermanGame.hasStarted = false;
    if (typeof stopAllAudio === 'function') stopAllAudio();
    if (typeof switchScreen === 'function') switchScreen('fisherman');

    const screen = document.getElementById('screen-fisherman');
    if (screen) screen.classList.add('active');

    FishermanGame.isRunning = true;
    initFishermanGame();

    setTimeout(resizeFishermanCanvas, 50);
    setTimeout(resizeFishermanCanvas, 150);
    setTimeout(resizeFishermanCanvas, 300);

    // CALIBRADO CRUCIAL: Mostrar inmediatamente la selección de pescador al ingresar
    setTimeout(() => {
      openFishermanPetModal();
    }, 180);
  };

  window.closeFishermanAndReturnToMap = function() {
    FishermanGame.isRunning = false;
    FishermanGame.hasStarted = false;
    if (FishermanGame.animId) cancelAnimationFrame(FishermanGame.animId);
    if (FishermanGame.voiceTimeout) clearTimeout(FishermanGame.voiceTimeout);
    if (typeof stopAllAudio === 'function') stopAllAudio();

    if (typeof switchScreen === 'function') {
      switchScreen('map');
    }
  };

  window.stopFishermanGame = function() {
    FishermanGame.isRunning = false;
    FishermanGame.hasStarted = false;
    if (FishermanGame.animId) cancelAnimationFrame(FishermanGame.animId);
    if (FishermanGame.voiceTimeout) clearTimeout(FishermanGame.voiceTimeout);
  };

  // --- INICIALIZACIÓN DEL JUEGO ---
  function initFishermanGame() {
    FishermanGame.canvas = document.getElementById('fisherman-game-canvas');
    if (!FishermanGame.canvas) return;
    FishermanGame.ctx = FishermanGame.canvas.getContext('2d');

    buildWordQueue();
    setupFishermanEventListeners();
    resizeFishermanCanvas();

    FishermanGame.currentWordIndex = 0;

    if (FishermanGame.animId) cancelAnimationFrame(FishermanGame.animId);
    FishermanGame.animId = requestAnimationFrame(fishermanGameLoop);
  }

  // Inicia la ronda de pesca tras elegir avatar
  function startFishermanRounds() {
    if (FishermanGame.hasStarted) return;
    FishermanGame.hasStarted = true;
    setupWord(FishermanGame.currentWordIndex);
  }

  // Construye la cola de palabras permitidas
  function buildWordQueue() {
    const list = [];
    // 1. Si el modo es tarea, intentar cargar palabras de la tarea del perfil
    if (FishermanGame.mode === 'task') {
      try {
        if (typeof activeChildProfile !== 'undefined' && activeChildProfile && activeChildProfile.taskWords && activeChildProfile.taskWords.length > 0) {
          activeChildProfile.taskWords.forEach(wText => {
            const clean = (typeof removeAccents === 'function') ? removeAccents(wText) : wText.toUpperCase();
            if (isWordPermitted(clean)) {
              // Buscar en léxico canónico
              if (typeof CANONICAL_WORD_LEXICON !== 'undefined' && CANONICAL_WORD_LEXICON[clean]) {
                const item = CANONICAL_WORD_LEXICON[clean];
                list.push({
                  word: item.escritura,
                  silabas: item.silabas || [clean],
                  emoji: item.emoji,
                  pron: item.pronunciacion || item.escritura
                });
              } else {
                // Desglose silábico aproximado si no estuviera en léxico
                list.push({
                  word: clean,
                  silabas: approximateSyllables(clean),
                  emoji: 'assets/' + clean.toLowerCase() + '.png',
                  pron: clean.toLowerCase()
                });
              }
            }
          });
        }
      } catch(e) {}
    }

    // 2. Si la lista está vacía o es modo aleatorio, poblar desde CANONICAL_WORD_LEXICON
    if (list.length === 0) {
      if (typeof CANONICAL_WORD_LEXICON !== 'undefined') {
        const keys = Object.keys(CANONICAL_WORD_LEXICON).filter(k => isWordPermitted(k));
        // Mezclar aleatoriamente
        keys.sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(10, keys.length); i++) {
          const item = CANONICAL_WORD_LEXICON[keys[i]];
          if (item.silabas && item.silabas.length >= 2) {
            list.push({
              word: item.escritura,
              silabas: item.silabas,
              emoji: item.emoji,
              pron: item.pronunciacion || item.escritura
            });
          }
        }
      }
    }

    // 3. Fallback de emergencia
    if (list.length === 0) {
      FALLBACK_WORDS.forEach(fb => {
        if (isWordPermitted(fb.word)) list.push(fb);
      });
    }

    FishermanGame.wordList = list;
  }

  function approximateSyllables(word) {
    // Estimación simple si la palabra es externa
    const vowels = 'AEIOUÁÉÍÓÚ';
    const res = [];
    let cur = '';
    for (let i = 0; i < word.length; i++) {
      cur += word[i];
      if (vowels.includes(word[i]) && i < word.length - 1 && !vowels.includes(word[i + 1])) {
        if (i < word.length - 2) {
          res.push(cur);
          cur = '';
        }
      }
    }
    if (cur) res.push(cur);
    return res.length >= 2 ? res : [word];
  }

  // --- REDIMENSIONAMIENTO ---
  function resizeFishermanCanvas() {
    if (!FishermanGame.canvas) return;
    const container = FishermanGame.canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const w = Math.max(320, Math.floor(rect.width) || window.innerWidth || 800);
    const h = Math.max(360, Math.floor(rect.height) || (window.innerHeight - 170) || 520);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    FishermanGame.canvas.width = w * dpr;
    FishermanGame.canvas.height = h * dpr;
    FishermanGame.ctx.scale(dpr, dpr);

    FishermanGame.width = w;
    FishermanGame.height = h;

    // Dimensiones y calibración del muelle y del pescador activo
    const activePet = getActiveFishermanPet();
    const avatarDef = FISHERMAN_AVATARS[activePet] || FISHERMAN_AVATARS['🦄'];

    const pierLevel = Math.floor(h * 0.65);
    const pierW = Math.max(180, Math.floor(w * 0.38));

    const imgH = Math.min(250, Math.max(150, Math.floor(h * 0.44)));
    const imgW = Math.round(imgH * (avatarDef.aspectRatio || 1.5));
    const imgX = Math.max(-5, Math.floor(w * 0.02));
    const imgY = Math.round(pierLevel - imgH * (avatarDef.chairFeetNormalizedY || 0.96));

    FishermanGame.hero.x = imgX;
    FishermanGame.hero.y = imgY;
    FishermanGame.hero.width = imgW;
    FishermanGame.hero.height = imgH;
    FishermanGame.hero.pierLevel = pierLevel;
    FishermanGame.hero.pierW = pierW;
    FishermanGame.hero.avatarDef = avatarDef;

    // Punta de la caña calibrada con precisión para cada personaje
    FishermanGame.rod.originX = imgX + imgW * 0.60;
    FishermanGame.rod.originY = imgY + imgH * 0.55;
    FishermanGame.rod.tipX = imgX + imgW * avatarDef.rodTipNormalizedX;
    FishermanGame.rod.tipY = imgY + imgH * avatarDef.rodTipNormalizedY;

    if (!FishermanGame.rod.isCasting && !FishermanGame.rod.isRetracting) {
      FishermanGame.rod.hookX = FishermanGame.rod.tipX + 12;
      FishermanGame.rod.hookY = pierLevel + 32;
    }

    initLiliesAndDecorations();
  }

  function initLiliesAndDecorations() {
    FishermanGame.lilies = [];
    const w = FishermanGame.width;
    const h = FishermanGame.height;
    const waterTop = h * 0.42;

    for (let i = 0; i < 5; i++) {
      FishermanGame.lilies.push({
        x: w * 0.32 + Math.random() * (w * 0.62),
        y: waterTop + 20 + Math.random() * (h - waterTop - 50),
        radius: 18 + Math.random() * 12,
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 0.5,
        flowerColor: i % 2 === 0 ? '#F472B6' : '#FFFFFF'
      });
    }
  }

  // --- CONFIGURACIÓN DE UNA PALABRA ---
  function setupWord(index) {
    if (FishermanGame.wordList.length === 0) return;
    const wObj = FishermanGame.wordList[index % FishermanGame.wordList.length];
    FishermanGame.currentWordObj = wObj;
    FishermanGame.currentSyllables = wObj.silabas || [wObj.word];
    FishermanGame.currentSyllableTargetIndex = 0;
    FishermanGame.isAdvancing = false;
    FishermanGame.splashParticles = [];
    FishermanGame.floatingTexts = [];
    FishermanGame.draggedFish = null;
    FishermanGame.rod.targetFish = null;
    FishermanGame.rod.isCasting = false;

    // Generar banco de peces (sílabas objetivo + distractores)
    spawnFishesForWord(wObj);

    updateFishermanHUD();

    // Locución de la misión con pausa clara
    if (FishermanGame.voiceTimeout) clearTimeout(FishermanGame.voiceTimeout);
    FishermanGame.voiceTimeout = setTimeout(() => {
      speakCurrentFishermanMission();
    }, 450);
  }

  function spawnFishesForWord(wObj) {
    FishermanGame.fishes = [];
    const syllables = wObj.silabas;
    const w = FishermanGame.width;
    const h = FishermanGame.height;
    const waterTop = h * 0.45;
    const waterBottom = h - 40;

    // 1. Crear peces para cada sílaba objetivo
    syllables.forEach((syl, sIdx) => {
      const palette = FISH_PALETTES[sIdx % FISH_PALETTES.length];
      FishermanGame.fishes.push(createFishObject(syl, true, sIdx, palette, waterTop, waterBottom));
    });

    // 2. Crear 2 a 3 peces distractores con sílabas variadas
    const distractorSyllables = ['MA', 'SO', 'TO', 'LU', 'RA', 'PA', 'TI', 'NO', 'CA', 'LE']
      .filter(s => !syllables.includes(s));
    distractorSyllables.sort(() => Math.random() - 0.5);

    const numDistractors = Math.min(3, distractorSyllables.length);
    for (let i = 0; i < numDistractors; i++) {
      const syl = distractorSyllables[i];
      const palette = FISH_PALETTES[(syllables.length + i) % FISH_PALETTES.length];
      FishermanGame.fishes.push(createFishObject(syl, false, -1, palette, waterTop, waterBottom));
    }

    // Distribuir peces uniformemente en la zona del río
    const totalFishes = FishermanGame.fishes.length;
    FishermanGame.fishes.forEach((fish, idx) => {
      fish.x = (w * 0.35) + ((w * 0.58) / totalFishes) * idx + (Math.random() - 0.5) * 30;
      fish.y = waterTop + 30 + Math.random() * (waterBottom - waterTop - 60);
      fish.initialY = fish.y;
    });
  }

  function createFishObject(syllable, isTarget, targetOrder, palette, waterTop, waterBottom) {
    return {
      syllable: syllable,
      isTarget: isTarget,
      targetOrder: targetOrder, // Posición ordenada de la sílaba (0 para la 1ra, 1 para la 2da, etc.)
      palette: palette,
      x: 400,
      y: 350,
      initialY: 350,
      vx: (Math.random() > 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.7),
      swimPhase: Math.random() * Math.PI * 2,
      swimSpeed: 1.5 + Math.random() * 1.0,
      width: 72,
      height: 44,
      isHooked: false,
      isCaught: false,
      diveTimer: 0, // Animación de sumergirse cuando se equivoca
      alpha: 1.0
    };
  }

  // --- LOCUCIÓN PROSÓDICA PEDAGÓGICA ---
  window.speakCurrentFishermanMission = function() {
    if (!FishermanGame.isRunning || !FishermanGame.currentWordObj) return;
    const targetSyl = FishermanGame.currentSyllables[FishermanGame.currentSyllableTargetIndex];
    if (!targetSyl) return;

    FishermanGame.isSpeaking = true;
    const wObj = FishermanGame.currentWordObj;

    if (FishermanGame.currentSyllableTargetIndex === 0) {
      // 1. Decir la palabra de forma canónica
      speakText(`Vamos a pescar la palabra: ${wObj.pron}.`, () => {
        // Pausa respetuosa (400ms) antes de cantar las sílabas
        setTimeout(() => {
          // 2. Tocar la secuencia de sílabas usando los audios humanos pre-grabados
          if (typeof window.playSyllablesSequence === 'function') {
            window.playSyllablesSequence(FishermanGame.currentSyllables, () => {
              // Pausa de 500ms antes de pedir la sílaba objetivo
              setTimeout(() => {
                // 3. Pedir la primera sílaba con su audio canónico
                speakText('Pesca la primera sílaba:', () => {
                  setTimeout(() => {
                    if (typeof window.playSyllableSound === 'function') {
                      window.playSyllableSound(targetSyl, () => {
                        FishermanGame.isSpeaking = false;
                      });
                    } else {
                      FishermanGame.isSpeaking = false;
                    }
                  }, 250);
                });
              }, 500);
            });
          } else {
            FishermanGame.isSpeaking = false;
          }
        }, 400);
      });
      setTimeout(() => { FishermanGame.isSpeaking = false; }, 9500);
    } else {
      // Siguientes sílabas con audio canónico de estudio
      speakText('Ahora pesca la sílaba:', () => {
        setTimeout(() => {
          if (typeof window.playSyllableSound === 'function') {
            window.playSyllableSound(targetSyl, () => {
              FishermanGame.isSpeaking = false;
            });
          } else {
            FishermanGame.isSpeaking = false;
          }
        }, 250);
      });
      setTimeout(() => { FishermanGame.isSpeaking = false; }, 4800);
    }
  };

  // --- ACTUALIZACIÓN DE HUD ---
  function updateFishermanHUD() {
    const wObj = FishermanGame.currentWordObj;
    if (!wObj) return;

    const titleEl = document.getElementById('fisherman-word-title');
    if (titleEl) titleEl.innerText = `Palabra ${FishermanGame.currentWordIndex + 1} de ${FishermanGame.wordList.length}`;

    const targetWordEl = document.getElementById('fisherman-target-word');
    if (targetWordEl) targetWordEl.innerText = wObj.word;

    const imgEl = document.getElementById('fisherman-target-img');
    if (imgEl) imgEl.src = wObj.emoji;

    // Render de casillas de sílabas
    const slotsEl = document.getElementById('fisherman-syllables-slots');
    if (slotsEl) {
      slotsEl.innerHTML = FishermanGame.currentSyllables.map((syl, idx) => {
        const isCaught = idx < FishermanGame.currentSyllableTargetIndex;
        const isCurrent = idx === FishermanGame.currentSyllableTargetIndex;

        let bg = '#F1F5F9';
        let color = '#64748B';
        let border = '2px solid #CBD5E1';
        let extraStyle = '';

        if (isCaught) {
          bg = '#10B981';
          color = '#FFFFFF';
          border = '2px solid #059669';
        } else if (isCurrent) {
          bg = '#FEF08A';
          color = '#854D0E';
          border = '2px solid #EAB308';
          extraStyle = 'animation: pulseSlot 1s infinite alternate;';
        }

        return `
          <div style="background: ${bg}; color: ${color}; border: ${border}; border-radius: 12px; padding: 6px 14px; font-size: 15px; font-weight: 900; letter-spacing: 1px; min-width: 48px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.08); ${extraStyle}">
            ${isCaught ? syl : (isCurrent ? '?' : '—')}
          </div>
        `;
      }).join('');
    }
  }

  // --- BUCLE PRINCIPAL DE JUEGO (CANVAS RENDER) ---
  function fishermanGameLoop() {
    if (!FishermanGame.isRunning) return;
    FishermanGame.time += 0.02;

    updateGamePhysics();
    renderGameGraphics();

    FishermanGame.animId = requestAnimationFrame(fishermanGameLoop);
  }

  // --- FÍSICA Y ACTUALIZACIÓN ---
  function updateGamePhysics() {
    const w = FishermanGame.width;
    const h = FishermanGame.height;
    const waterTop = h * 0.44;
    const waterBottom = h - 35;
    const waterLeft = w * 0.28;

    // 1. Actualizar peces nadando
    FishermanGame.fishes.forEach(fish => {
      if (fish.isCaught) return;

      if (fish.diveTimer > 0) {
        fish.diveTimer -= 0.03;
      }

      if (!fish.isHooked && fish !== FishermanGame.draggedFish) {
        fish.x += fish.vx;
        fish.swimPhase += fish.swimSpeed * 0.04;
        fish.y = fish.initialY + Math.sin(fish.swimPhase) * 6;

        // Rebotar en los márgenes del agua
        if (fish.x < waterLeft + 20) {
          fish.x = waterLeft + 20;
          fish.vx = Math.abs(fish.vx);
        } else if (fish.x > w - 30) {
          fish.x = w - 30;
          fish.vx = -Math.abs(fish.vx);
        }
      }
    });

    // 2. Caña de pescar y animación de lance
    const rod = FishermanGame.rod;
    if (rod.isCasting && rod.targetFish) {
      rod.castProgress += 0.08;
      if (rod.castProgress >= 1.0) {
        rod.castProgress = 1.0;
        rod.isCasting = false;
        rod.isRetracting = true;
        // Enganchar pez
        rod.targetFish.isHooked = true;
        playSplashSound();
        createWaterSplash(rod.targetFish.x, rod.targetFish.y, 14);
      }
      rod.hookX = rod.tipX + (rod.targetFish.x - rod.tipX) * rod.castProgress;
      rod.hookY = rod.tipY + (rod.targetFish.y - rod.tipY) * rod.castProgress;
    } else if (rod.isRetracting && rod.targetFish) {
      rod.castProgress -= 0.05;
      const bucketX = (FishermanGame.hero.pierW || (w * 0.38)) - 38;
      const bucketY = (FishermanGame.hero.pierLevel || (h * 0.65)) - 10;

      if (rod.castProgress <= 0) {
        rod.castProgress = 0;
        rod.isRetracting = false;
        // Pez llegó exitosamente al balde en el muelle
        createWaterSplash(bucketX, bucketY, 8);
        finishCatchingFish(rod.targetFish);
        rod.targetFish = null;
      } else {
        // Trayectoria curva del pez en el aire hacia el balde
        const t = 1.0 - rod.castProgress;
        const startX = rod.targetFish.initialHookX || rod.targetFish.x;
        const startY = rod.targetFish.initialHookY || rod.targetFish.y;
        rod.hookX = startX + (bucketX - startX) * t;
        const arcHeight = Math.sin(t * Math.PI) * 65;
        rod.hookY = startY + (bucketY - startY) * t - arcHeight;
        rod.targetFish.x = rod.hookX;
        rod.targetFish.y = rod.hookY;
      }
    } else {
      // Movimiento natural del anzuelo y boya flotando suavemente en el agua junto al muelle
      const idleY = (FishermanGame.hero.pierLevel || (h * 0.65)) + 32;
      rod.hookX = rod.tipX + 12 + Math.sin(FishermanGame.time * 2) * 4;
      rod.hookY = idleY + Math.sin(FishermanGame.time * 2.5) * 5;
    }

    // 3. Partículas de salpicadura
    for (let i = FishermanGame.splashParticles.length - 1; i >= 0; i--) {
      const p = FishermanGame.splashParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // Gravedad
      p.alpha -= 0.025;
      if (p.alpha <= 0 || p.y > h) {
        FishermanGame.splashParticles.splice(i, 1);
      }
    }

    // 4. Textos flotantes
    for (let i = FishermanGame.floatingTexts.length - 1; i >= 0; i--) {
      const ft = FishermanGame.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      if (ft.alpha <= 0) {
        FishermanGame.floatingTexts.splice(i, 1);
      }
    }

    // 5. Salto festivo del héroe
    const hHero = FishermanGame.hero;
    if (hHero.isCelebrating) {
      hHero.celebrateTimer += 0.06;
      hHero.jumpY = -Math.abs(Math.sin(hHero.celebrateTimer * 6)) * 26;
      if (hHero.celebrateTimer > 2.2) {
        hHero.isCelebrating = false;
        hHero.celebrateTimer = 0;
        hHero.jumpY = 0;
      }
    }
  }

  // --- RENDERIZADO GRÁFICO (CANVAS) ---
  function renderGameGraphics() {
    const ctx = FishermanGame.ctx;
    const w = FishermanGame.width;
    const h = FishermanGame.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Cielo de ribera con degradado fresco
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
    skyGrad.addColorStop(0, '#7DD3FC');
    skyGrad.addColorStop(1, '#BAE6FD');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.45);

    // Nubes suaves al fondo
    drawCloud(ctx, w * 0.2, 50, 40);
    drawCloud(ctx, w * 0.7, 70, 55);

    // Colinas y árboles lejanos
    drawDistantHills(ctx, w, h * 0.45);

    // 2. Agua del río cristalino
    const waterTop = h * 0.42;
    const waterGrad = ctx.createLinearGradient(0, waterTop, 0, h);
    waterGrad.addColorStop(0, '#38BDF8');
    waterGrad.addColorStop(0.3, '#0284C7');
    waterGrad.addColorStop(1, '#0369A1');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, waterTop, w, h - waterTop);

    // Ondas y destellos de agua
    drawWaterWaves(ctx, w, waterTop, h);

    // Nenúfares y lirios flotantes
    drawWaterLilies(ctx);

    // 3. Orilla de hierba y muelle de madera a la izquierda
    drawShoreAndPier(ctx, w, h, waterTop);

    // 4. Balde de sílabas del pescador sobre los tablones del muelle
    const pierLevel = FishermanGame.hero.pierLevel || Math.floor(h * 0.65);
    const pierW = FishermanGame.hero.pierW || Math.max(180, Math.floor(w * 0.38));
    drawBucket(ctx, pierW - 38, pierLevel);

    // 5. El héroe pescador (Unicornio en su silla plegable sobre el muelle)
    drawHeroFisherman(ctx);

    // 6. Sedal y anzuelo dinámico desde la punta de la caña
    drawFishingRodAndLine(ctx);

    // 7. Peces nadando con sus sílabas
    FishermanGame.fishes.forEach(fish => {
      drawFish(ctx, fish);
    });

    // 8. Partículas y salpicaduras
    drawParticles(ctx);

    // 9. Textos flotantes
    drawFloatingTexts(ctx);
  }

  // --- DIBUJO DE ELEMENTOS DEL ESCENARIO ---
  function drawCloud(ctx, cx, cy, r) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.7, cy - r * 0.2, r * 0.8, 0, Math.PI * 2);
    ctx.arc(cx + r * 1.3, cy, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawDistantHills(ctx, w, horizonY) {
    ctx.save();
    ctx.fillStyle = '#86EFAC';
    ctx.beginPath();
    ctx.moveTo(w * 0.2, horizonY);
    ctx.quadraticCurveTo(w * 0.45, horizonY - 45, w * 0.75, horizonY);
    ctx.quadraticCurveTo(w * 0.88, horizonY - 35, w, horizonY);
    ctx.lineTo(w, horizonY);
    ctx.lineTo(w * 0.2, horizonY);
    ctx.fill();

    // Pequeños pinos lejanos
    for (let x = w * 0.35; x < w * 0.9; x += 45) {
      ctx.fillStyle = '#15803D';
      ctx.beginPath();
      ctx.moveTo(x, horizonY - 2);
      ctx.lineTo(x + 8, horizonY - 26);
      ctx.lineTo(x + 16, horizonY - 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawWaterWaves(ctx, w, top, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 2;
    for (let y = top + 25; y < h; y += 45) {
      ctx.beginPath();
      for (let x = 0; x < w; x += 40) {
        const offset = Math.sin((x * 0.02) + FishermanGame.time * 2 + y) * 4;
        if (x === 0) ctx.moveTo(x, y + offset);
        else ctx.lineTo(x, y + offset);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawWaterLilies(ctx) {
    FishermanGame.lilies.forEach(lily => {
      ctx.save();
      const wave = Math.sin(FishermanGame.time * lily.speed + lily.phase) * 3;
      const lx = lily.x;
      const ly = lily.y + wave;

      // Hoja de nenúfar
      ctx.fillStyle = '#15803D';
      ctx.beginPath();
      ctx.arc(lx, ly, lily.radius, 0.3, Math.PI * 1.85);
      ctx.lineTo(lx, ly);
      ctx.closePath();
      ctx.fill();

      // Flor de loto
      ctx.fillStyle = lily.flowerColor;
      ctx.beginPath();
      ctx.arc(lx + 2, ly - 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(lx + 2, ly - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  function drawShoreAndPier(ctx, w, h, waterTop) {
    ctx.save();

    const pierLevel = FishermanGame.hero.pierLevel || Math.floor(h * 0.65);
    const pierW = FishermanGame.hero.pierW || Math.max(180, Math.floor(w * 0.38));
    const pierH = 32;

    // 1. Orilla de hierba ribereña curva en la orilla izquierda
    const shoreWidth = w * 0.22;
    const grassGrad = ctx.createLinearGradient(0, waterTop, shoreWidth, h);
    grassGrad.addColorStop(0, '#15803D');
    grassGrad.addColorStop(0.5, '#22C55E');
    grassGrad.addColorStop(1, '#16A34A');
    ctx.fillStyle = grassGrad;
    ctx.beginPath();
    ctx.moveTo(0, waterTop - 30);
    ctx.bezierCurveTo(shoreWidth * 0.6, waterTop - 25, shoreWidth * 0.85, waterTop + 40, shoreWidth * 0.6, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Briznas de hierba decorativas
    ctx.strokeStyle = '#86EFAC';
    ctx.lineWidth = 2;
    for (let gx = 10; gx < shoreWidth * 0.55; gx += 18) {
      ctx.beginPath();
      ctx.moveTo(gx, pierLevel + 15);
      ctx.lineTo(gx + 4, pierLevel - 6);
      ctx.stroke();
    }

    // 2. Pilares de madera sumergidos en el río que sostienen el muelle
    const stilts = [
      { x: pierW * 0.22, w: 14 },
      { x: pierW * 0.55, w: 14 },
      { x: pierW * 0.88, w: 14 }
    ];

    stilts.forEach(stilt => {
      // Sombra del pilar
      ctx.fillStyle = '#451A03';
      ctx.fillRect(stilt.x, pierLevel + pierH, stilt.w, h - pierLevel - pierH);
      // Brillo del pilar
      ctx.fillStyle = '#78350F';
      ctx.fillRect(stilt.x + 2, pierLevel + pierH, stilt.w - 4, h - pierLevel - pierH);
      // Vetas de madera
      ctx.strokeStyle = '#92400E';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(stilt.x + 6, pierLevel + pierH);
      ctx.lineTo(stilt.x + 6, h);
      ctx.stroke();
    });

    // Viga transversal de soporte bajo las tablas
    ctx.fillStyle = '#78350F';
    ctx.fillRect(0, pierLevel + pierH - 6, pierW, 10);

    // 3. Tablones del muelle (Deck de madera sobre el agua)
    const plankGrad = ctx.createLinearGradient(0, pierLevel, 0, pierLevel + pierH);
    plankGrad.addColorStop(0, '#D97706');
    plankGrad.addColorStop(0.3, '#B45309');
    plankGrad.addColorStop(1, '#78350F');
    ctx.fillStyle = plankGrad;
    ctx.beginPath();
    ctx.roundRect(0, pierLevel, pierW, pierH, [0, 8, 8, 0]);
    ctx.fill();

    // Borde superior iluminado del muelle
    ctx.fillStyle = '#FDE68A';
    ctx.fillRect(0, pierLevel, pierW, 3);

    // Separaciones verticales entre tablones de madera
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 2.5;
    for (let tx = 24; tx < pierW; tx += 26) {
      ctx.beginPath();
      ctx.moveTo(tx, pierLevel);
      ctx.lineTo(tx, pierLevel + pierH);
      ctx.stroke();

      // Clavos de fijación en cada tablón
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(tx - 6, pierLevel + 7, 1.8, 0, Math.PI * 2);
      ctx.arc(tx - 6, pierLevel + pierH - 7, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Bolardo o poste de amarre en la punta del muelle
    const bollardX = pierW - 14;
    const bollardY = pierLevel - 20;
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.roundRect(bollardX - 6, bollardY, 14, 24, 4);
    ctx.fill();
    ctx.fillStyle = '#92400E';
    ctx.fillRect(bollardX - 4, bollardY + 2, 10, 20);
    // Tapa del bolardo
    ctx.fillStyle = '#B45309';
    ctx.beginPath();
    ctx.ellipse(bollardX + 1, bollardY, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Cuerda amarrada al bolardo
    ctx.strokeStyle = '#FDE68A';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(bollardX + 1, bollardY + 10, 7, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  function drawBucket(ctx, bx, by) {
    ctx.save();
    // Balde metálico rústico apoyado sobre los tablones del muelle (by = nivel del muelle)
    const bW = 28;
    const bH = 26;
    const topY = by - bH;

    // Cuerpo cónico del balde
    const bucketGrad = ctx.createLinearGradient(bx - bW / 2, topY, bx + bW / 2, by);
    bucketGrad.addColorStop(0, '#64748B');
    bucketGrad.addColorStop(0.5, '#94A3B8');
    bucketGrad.addColorStop(1, '#475569');
    ctx.fillStyle = bucketGrad;
    ctx.beginPath();
    ctx.moveTo(bx - bW / 2, topY);
    ctx.lineTo(bx + bW / 2, topY);
    ctx.lineTo(bx + (bW * 0.36), by);
    ctx.lineTo(bx - (bW * 0.36), by);
    ctx.closePath();
    ctx.fill();

    // Aros metálicos decorativos
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx - bW * 0.44, topY + bH * 0.4);
    ctx.lineTo(bx + bW * 0.44, topY + bH * 0.4);
    ctx.moveTo(bx - bW * 0.39, topY + bH * 0.8);
    ctx.lineTo(bx + bW * 0.39, topY + bH * 0.8);
    ctx.stroke();

    // Borde elíptico superior
    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.ellipse(bx, topY, bW / 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Agua limpia dentro del balde
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.ellipse(bx, topY, (bW / 2) - 2.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Si ya ha pescado alguna sílaba de la palabra actual, una colita de pez asomando
    if (FishermanGame.currentSyllableTargetIndex > 0) {
      ctx.fillStyle = '#F97316';
      ctx.beginPath();
      ctx.moveTo(bx - 3, topY);
      ctx.lineTo(bx - 9, topY - 8);
      ctx.lineTo(bx + 1, topY - 6);
      ctx.closePath();
      ctx.fill();
    }

    // Asa metálica del balde
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(bx, topY - 4, bW * 0.52, Math.PI, 0);
    ctx.stroke();

    ctx.restore();
  }

  function drawHeroFisherman(ctx) {
    const hero = FishermanGame.hero;
    const pet = getActiveFishermanPet();
    const avatarDef = FISHERMAN_AVATARS[pet] || FISHERMAN_AVATARS['🦄'];
    const img = getCachedImage(avatarDef.src);

    ctx.save();
    const drawX = hero.x;
    const drawY = hero.y + (hero.isCelebrating ? hero.jumpY : 0);
    const drawW = hero.width || 270;
    const drawH = hero.height || 180;

    if (img && img.complete && img.naturalWidth > 0) {
      // Sombra sutil de la silla sobre los tablones de madera del muelle
      ctx.fillStyle = 'rgba(69, 26, 3, 0.35)';
      ctx.beginPath();
      ctx.ellipse(drawX + drawW * 0.24, drawY + drawH * (avatarDef.chairFeetNormalizedY || 0.96), drawW * 0.18, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dibujo de alta resolución del pescador en su silla
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } else {
      // Mascota fallback si la imagen aún estuviese cargando
      const pierLevel = hero.pierLevel || 350;
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(drawX + 80, pierLevel - 40, 28, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawFishingRodAndLine(ctx) {
    const rod = FishermanGame.rod;
    ctx.save();

    // NOTA PEDAGÓGICA Y GRÁFICA:
    // El personaje ilustrado ya posee su caña de pescar realista integrada en el dibujo.
    // Aquí renderizamos el sedal dinámico (hilo de pesca transparente/luminoso)
    // que nace exactamente de la punta de la caña (rod.tipX, rod.tipY) y viaja hacia el anzuelo/boya.

    // 1. Sedal de nylon con brillo sutil
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.8;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(rod.tipX, rod.tipY);

    if (rod.isCasting || rod.isRetracting) {
      // Sedal en tensión cuando lanza o recoge
      const midX = (rod.tipX + rod.hookX) / 2;
      const midY = (rod.tipY + rod.hookY) / 2 - 15;
      ctx.quadraticCurveTo(midX, midY, rod.hookX, rod.hookY);
    } else {
      // Sedal en catenaria suave con la brisa del río
      const midX = (rod.tipX + rod.hookX) / 2 + Math.sin(FishermanGame.time * 2) * 4;
      const midY = Math.max(rod.tipY, rod.hookY) - 10 + Math.sin(FishermanGame.time * 1.5) * 6;
      ctx.quadraticCurveTo(midX, midY, rod.hookX, rod.hookY);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 2. Onditas concéntricas de agua alrededor de la boya cuando flota
    if (!rod.isCasting) {
      const wavePhase = (FishermanGame.time * 2) % (Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(rod.hookX, rod.hookY + 3, 12 + Math.sin(wavePhase) * 4, 4 + Math.sin(wavePhase) * 1.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 3. Boya de pesca (rojo coral / blanco perla)
    ctx.save();
    ctx.translate(rod.hookX, rod.hookY);
    // Mitad superior roja
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(0, -3, 6.5, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    // Mitad inferior blanca
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, -3, 6.5, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();
    // Borde de la boya
    ctx.strokeStyle = '#991B1B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -3, 6.5, 0, Math.PI * 2);
    ctx.stroke();
    // Antena de la boya
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-1, -12, 2, 7);
    ctx.restore();

    // 4. Anzuelo bajo el agua (si no está recogiendo pez grande)
    if (!rod.isRetracting) {
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rod.hookX, rod.hookY + 3);
      ctx.lineTo(rod.hookX, rod.hookY + 12);
      ctx.arc(rod.hookX - 4, rod.hookY + 12, 4, 0, Math.PI);
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- DIBUJO DE CADA PEZ CON SU SÍLABA ---
  function drawFish(ctx, fish) {
    if (fish.isCaught) return;

    ctx.save();
    ctx.translate(fish.x, fish.y);

    const facingRight = fish.vx >= 0;
    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    // Efecto de sumergirse cuando comete error
    if (fish.diveTimer > 0) {
      ctx.globalAlpha = 0.45;
      ctx.scale(0.85, 0.85);
    }

    const p = fish.palette;
    const w2 = fish.width / 2;
    const h2 = fish.height / 2;
    const tailWag = Math.sin(fish.swimPhase) * 6;

    // Cola del pez oscilante
    ctx.fillStyle = p.fin;
    ctx.beginPath();
    ctx.moveTo(-w2 + 8, 0);
    ctx.lineTo(-w2 - 18, -h2 + 4 + tailWag);
    ctx.quadraticCurveTo(-w2 - 10, 0, -w2 - 18, h2 - 4 + tailWag);
    ctx.closePath();
    ctx.fill();

    // Aleta dorsal superior
    ctx.fillStyle = p.fin;
    ctx.beginPath();
    ctx.moveTo(-6, -h2 + 2);
    ctx.quadraticCurveTo(0, -h2 - 10, 12, -h2 + 4);
    ctx.closePath();
    ctx.fill();

    // Cuerpo estilizado del pez
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.ellipse(0, 0, w2, h2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Franja decorativa secundaria
    ctx.fillStyle = p.secondary;
    ctx.beginPath();
    ctx.ellipse(4, 0, w2 * 0.45, h2 * 0.78, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ojo tierno del pez
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(w2 - 12, -6, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(w2 - 10.5, -6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Cartel blanco de alto contraste con la SÍLABA
    // Invertir escala si mira a la izquierda para que el texto NO quede espejado
    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(-24, -14, 48, 28, 8);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = p.fin;
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = '900 17px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fish.syllable, 0, 0);

    ctx.restore();
  }

  function drawParticles(ctx) {
    ctx.save();
    FishermanGame.splashParticles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawFloatingTexts(ctx) {
    ctx.save();
    FishermanGame.floatingTexts.forEach(ft => {
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = '900 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, ft.x, ft.y);
    });
    ctx.restore();
  }

  // --- INTERACCIÓN Y EVENTOS TÁCTILES / MOUSE ---
  function setupFishermanEventListeners() {
    const canvas = FishermanGame.canvas;
    if (!canvas) return;

    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (FishermanGame.width / rect.width),
        y: (clientY - rect.top) * (FishermanGame.height / rect.height)
      };
    }

    function onPointerDown(e) {
      if (FishermanGame.isSpeaking || FishermanGame.isAdvancing || FishermanGame.rod.isCasting || FishermanGame.rod.isRetracting) return;
      const pos = getCoords(e);
      FishermanGame.pointer.x = pos.x;
      FishermanGame.pointer.y = pos.y;
      FishermanGame.pointer.isDown = true;

      // Detectar si tocó un pez
      for (let i = FishermanGame.fishes.length - 1; i >= 0; i--) {
        const fish = FishermanGame.fishes[i];
        if (fish.isCaught) continue;
        const dx = pos.x - fish.x;
        const dy = pos.y - fish.y;
        if (Math.hypot(dx, dy) < 42) {
          handleFishSelected(fish);
          break;
        }
      }
    }

    function onPointerMove(e) {
      if (!FishermanGame.pointer.isDown) return;
      const pos = getCoords(e);
      FishermanGame.pointer.x = pos.x;
      FishermanGame.pointer.y = pos.y;
    }

    function onPointerUp() {
      FishermanGame.pointer.isDown = false;
      FishermanGame.draggedFish = null;
    }

    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });
  }

  // --- LÓGICA DE SELECCIÓN DE PEZ ---
  function handleFishSelected(fish) {
    if (fish.isCaught || fish.isHooked || FishermanGame.isSpeaking || FishermanGame.rod.isCasting || FishermanGame.rod.isRetracting) return;

    const targetSyl = FishermanGame.currentSyllables[FishermanGame.currentSyllableTargetIndex];
    const isCorrect = (fish.syllable === targetSyl);

    if (isCorrect) {
      // ¡ACIERTO! La caña lanza el anzuelo hacia el pez
      fish.initialHookX = fish.x;
      fish.initialHookY = fish.y;
      FishermanGame.rod.targetFish = fish;
      FishermanGame.rod.isCasting = true;
      FishermanGame.rod.castProgress = 0;
      playCastSound();
    } else {
      // ERROR AMIGABLE: El pez se sumerge un instante y la voz guía suavemente
      fish.diveTimer = 1.0;
      playPlopSound();
      createWaterSplash(fish.x, fish.y, 6);
      createFloatingText(fish.x, fish.y - 30, `¡Esa es ${fish.syllable}!`, '#F43F5E');

      FishermanGame.isSpeaking = true;
      speakText('Esa es:', () => {
        if (typeof window.playSyllableSound === 'function') {
          window.playSyllableSound(fish.syllable, () => {
            speakText('Sigue buscando:', () => {
              window.playSyllableSound(targetSyl, () => {
                FishermanGame.isSpeaking = false;
              });
            });
          });
        } else {
          FishermanGame.isSpeaking = false;
        }
      });
      setTimeout(() => { FishermanGame.isSpeaking = false; }, 3800);
    }
  }

  // Finaliza la pesca exitosa del pez y avanza la sílaba
  function finishCatchingFish(fish) {
    fish.isCaught = true;
    createFloatingText(fish.x, fish.y - 30, `¡MUY BIEN: ${fish.syllable}! ✨`, '#10B981');
    playSuccessChime();

    // Celebración del héroe pescador
    FishermanGame.hero.isCelebrating = true;
    FishermanGame.hero.celebrateTimer = 0;

    FishermanGame.currentSyllableTargetIndex++;
    updateFishermanHUD();

    // ¿Completó todas las sílabas de la palabra?
    if (FishermanGame.currentSyllableTargetIndex >= FishermanGame.currentSyllables.length) {
      handleWordCompleted();
    } else {
      // Siguiente sílaba con pronunciación canónica de estudio
      const nextSyl = FishermanGame.currentSyllables[FishermanGame.currentSyllableTargetIndex];
      FishermanGame.isSpeaking = true;
      speakText('Muy bien:', () => {
        if (typeof window.playSyllableSound === 'function') {
          window.playSyllableSound(fish.syllable, () => {
            speakText('Ahora busca:', () => {
              window.playSyllableSound(nextSyl, () => {
                FishermanGame.isSpeaking = false;
              });
            });
          });
        } else {
          FishermanGame.isSpeaking = false;
        }
      });
      setTimeout(() => { FishermanGame.isSpeaking = false; }, 4200);
    }
  }

  // --- PALABRA COMPLETA (SÍNTESIS FONOLÓGICA) ---
  function handleWordCompleted() {
    FishermanGame.isAdvancing = true;
    const wObj = FishermanGame.currentWordObj;
    playFullWordVictorySound();

    createRainbowExplosion(FishermanGame.width * 0.5, FishermanGame.height * 0.45, 50);
    createFloatingText(FishermanGame.width * 0.5, FishermanGame.height * 0.35, `¡${wObj.word}! 🎉`, '#F59E0B');

    // Recompensas en el perfil
    if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
      activeChildProfile.coins = (activeChildProfile.coins || 0) + 12;
      activeChildProfile.stars = (activeChildProfile.stars || 0) + 2;
      if (typeof saveActiveChildProfile === 'function') saveActiveChildProfile();
    }

    const onVictoryDone = () => {
      setTimeout(() => {
        FishermanGame.currentWordIndex++;
        if (FishermanGame.currentWordIndex >= FishermanGame.wordList.length) {
          // Completó todas las palabras de la ronda
          showFishermanVictoryModal();
        } else {
          setupWord(FishermanGame.currentWordIndex);
        }
      }, 800);
    };

    if (typeof speakText === 'function') {
      FishermanGame.isSpeaking = true;
      speakText(`¡Excelente pesca! ¡Formaste la palabra ${wObj.pron}!`, () => {
        FishermanGame.isSpeaking = false;
        onVictoryDone();
      });
    } else {
      onVictoryDone();
    }
  }

  function showFishermanVictoryModal() {
    const modal = document.getElementById('fisherman-victory-modal');
    if (modal) {
      modal.style.display = 'flex';
    } else {
      // Si no hay modal específico, volver con mensaje
      alert('¡Misión de Pesca Cumplida! ¡Pescaste todas las palabras!');
      window.closeFishermanAndReturnToMap();
    }
  }

  window.closeFishermanVictoryModal = function() {
    const modal = document.getElementById('fisherman-victory-modal');
    if (modal) modal.style.display = 'none';
    window.closeFishermanAndReturnToMap();
  };

  window.replayFishermanQuest = function() {
    const modal = document.getElementById('fisherman-victory-modal');
    if (modal) modal.style.display = 'none';
    FishermanGame.currentWordIndex = 0;
    setupWord(0);
  };

  // --- GENERACIÓN DE PARTÍCULAS Y TEXTOS ---
  function createWaterSplash(x, y, count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 0.8) + Math.random() * (Math.PI * 1.4);
      const speed = 2.5 + Math.random() * 5.0;
      FishermanGame.splashParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 4,
        alpha: 1.0,
        color: '#BAE6FD'
      });
    }
  }

  function createRainbowExplosion(x, y, count) {
    const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#FCD34D'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3.0 + Math.random() * 7.0;
      FishermanGame.splashParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        radius: 4 + Math.random() * 5,
        alpha: 1.0,
        color: colors[i % colors.length]
      });
    }
  }

  function createFloatingText(x, y, text, color) {
    FishermanGame.floatingTexts.push({
      x: x,
      y: y,
      vy: -1.2,
      text: text,
      color: color || '#FFFFFF',
      alpha: 1.0
    });
  }

  // --- EFECTOS DE SONIDO WEB AUDIO SINTETIZADOS ---
  function playSplashSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, actx.currentTime + 0.22);

      gain.gain.setValueAtTime(0.3, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.22);
    } catch(e) {}
  }

  function playCastSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, actx.currentTime);
      osc.frequency.linearRampToValueAtTime(750, actx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.2, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.18);
    } catch(e) {}
  }

  function playPlopSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, actx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, actx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.22, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.15);
    } catch(e) {}
  }

  function playSuccessChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      [587.33, 880].forEach((freq, idx) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, actx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0, actx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.25, actx.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(actx.currentTime + idx * 0.08);
        osc.stop(actx.currentTime + idx * 0.08 + 0.35);
      });
    } catch(e) {}
  }

  function playFullWordVictorySound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, actx.currentTime + idx * 0.09);

        gain.gain.setValueAtTime(0, actx.currentTime + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.28, actx.currentTime + idx * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + idx * 0.09 + 0.5);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(actx.currentTime + idx * 0.09);
        osc.stop(actx.currentTime + idx * 0.09 + 0.5);
      });
    } catch(e) {}
  }

})();
