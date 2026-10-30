// =========================================================================
// CRIN AVENTURAS DE LECTOESCRITURA - EL CALDERO MÁGICO DE LAS RIMAS
// Módulo Psicopedagógico de Conciencia Fonológica e Intrasilábica (DUA/SAAC)
// =========================================================================

(function() {
  'use strict';

  const CauldronGame = {
    canvas: null,
    ctx: null,
    width: 800,
    height: 500,
    isRunning: false,
    animId: null,
    time: 0,

    // Estado de la poción activa
    currentPotionIndex: 0,
    currentPotion: null,
    potionDeck: [],
    collectedIngredients: [],
    bubbles: [],
    particles: [],
    floatingTexts: [],
    steamBubbles: [],

    // Arrastre táctil / mouse
    draggedBubble: null,
    pointer: { x: 0, y: 0, isDown: false },

    // Geometría del caldero
    cauldron: {
      x: 400,
      y: 350,
      width: 220,
      height: 150,
      liquidY: 310,
      potionColor: '#8B5CF6',
      potionSecondary: '#C084FC',
      isSplashing: false,
      splashTimer: 0
    },

    // Estado del héroe alquimista
    hero: {
      x: 180,
      y: 370,
      jumpY: 0,
      jumpVy: 0,
      isCelebrating: false,
      celebrateTimer: 0
    },

    isAdvancing: false,
    isSpeaking: false,
    voiceTimeout: null
  };

  // BANCO EXPANDIDO DE FAMILIAS DE RIMAS NATURALES CON IMÁGENES REALES
  const RHYME_FAMILIES = [
    {
      id: 'on',
      rhymeSound: 'ÓN',
      potionName: 'Poción del Dragón Mágico',
      potionColor: '#8B5CF6',
      potionSecondary: '#C084FC',
      words: [
        { word: 'BOTÓN', image: 'assets/boton.png', pron: 'botón' },
        { word: 'RATÓN', image: 'assets/raton.png', pron: 'ratón' },
        { word: 'LEÓN', image: 'assets/leon.png', pron: 'león' },
        { word: 'DRAGÓN', image: 'assets/dragon.png', pron: 'dragón' },
        { word: 'LIMÓN', image: 'assets/limon.png', pron: 'limón' },
        { word: 'CORAZÓN', image: 'assets/corazon.png', pron: 'corazón' }
      ]
    },
    {
      id: 'ato',
      rhymeSound: 'ATO',
      potionName: 'Elixir de la Velocidad',
      potionColor: '#10B981',
      potionSecondary: '#34D399',
      words: [
        { word: 'PATO', image: 'assets/pato.png', pron: 'pato' },
        { word: 'GATO', image: 'assets/gato.png', pron: 'gato' },
        { word: 'ZAPATO', image: 'assets/zapato.png', pron: 'zapato' },
        { word: 'PLATO', image: 'assets/plato.png', pron: 'plato' }
      ]
    },
    {
      id: 'ana',
      rhymeSound: 'ANA',
      potionName: 'Poción de la Luz Matutina',
      potionColor: '#F59E0B',
      potionSecondary: '#FCD34D',
      words: [
        { word: 'MANZANA', image: 'assets/manzana.png', pron: 'manzana' },
        { word: 'BANANA', image: 'assets/banana.png', pron: 'banana' },
        { word: 'LANA', image: 'assets/lana.png', pron: 'lana' },
        { word: 'VENTANA', image: 'assets/ventana.png', pron: 'ventana' }
      ]
    },
    {
      id: 'esa',
      rhymeSound: 'ESA',
      potionName: 'Brebaje del Bosque Encantado',
      potionColor: '#EC4899',
      potionSecondary: '#F472B6',
      words: [
        { word: 'MESA', image: 'assets/mesa.png', pron: 'mesa' },
        { word: 'FRAMBUESA', image: 'assets/frambuesa.png', pron: 'frambuesa' },
        { word: 'HAMBURGUESA', image: 'assets/hamburguesa.png', pron: 'hamburguesa' }
      ]
    },
    {
      id: 'ita',
      rhymeSound: 'ITA',
      potionName: 'Poción de Flores Mágicas',
      potionColor: '#06B6D4',
      potionSecondary: '#67E8F9',
      words: [
        { word: 'CASITA', image: 'assets/casita.png', pron: 'casita' },
        { word: 'MARGARITA', image: 'assets/margarita.png', pron: 'margarita' },
        { word: 'CAJITA', image: 'assets/cajita.png', pron: 'cajita' },
        { word: 'COPITA', image: 'assets/copita.png', pron: 'copita' }
      ]
    },
    {
      id: 'illo',
      rhymeSound: 'ILLO',
      potionName: 'Fórmula de la Fuerza Dorada',
      potionColor: '#EAB308',
      potionSecondary: '#FEF08A',
      words: [
        { word: 'CUCHILLO', image: 'assets/cuchillo.png', pron: 'cuchillo' },
        { word: 'LADRILLO', image: 'assets/ladrillo.png', pron: 'ladrillo' },
        { word: 'AMARILLO', image: 'assets/amarillo.png', pron: 'amarillo' }
      ]
    },
    {
      id: 'ino',
      rhymeSound: 'INO',
      potionName: 'Esencia de la Montaña Nevada',
      potionColor: '#3B82F6',
      potionSecondary: '#93C5FD',
      words: [
        { word: 'PINO', image: 'assets/pino.png', pron: 'pino' },
        { word: 'CAMINO', image: 'assets/camino.png', pron: 'camino' },
        { word: 'MOLINO', image: 'assets/molino.png', pron: 'molino' },
        { word: 'PINGÜINO', image: 'assets/pinguino.png', pron: 'pingüino' }
      ]
    },
    {
      id: 'opa',
      rhymeSound: 'OPA',
      potionName: 'Brebaje de la Alegría',
      potionColor: '#F97316',
      potionSecondary: '#FDBA74',
      words: [
        { word: 'SOPA', image: 'assets/sopa.png', pron: 'sopa' },
        { word: 'COPA', image: 'assets/copa.png', pron: 'copa' },
        { word: 'LAVARROPA', image: 'assets/lavarropa.png', pron: 'lavarropa' }
      ]
    },
    {
      id: 'rro',
      rhymeSound: 'RRO',
      potionName: 'Elixir de la Valentía',
      potionColor: '#EF4444',
      potionSecondary: '#FCA5A5',
      words: [
        { word: 'PERRO', image: 'assets/perro.png', pron: 'perro' },
        { word: 'GORRO', image: 'assets/gorro.png', pron: 'gorro' },
        { word: 'ZORRO', image: 'assets/zorro.png', pron: 'zorro' }
      ]
    },
    {
      id: 'nte',
      rhymeSound: 'ENTE / ANTE',
      potionName: 'Fórmula del Río Encantado',
      potionColor: '#6366F1',
      potionSecondary: '#A5B4FC',
      words: [
        { word: 'PUENTE', image: 'assets/puente.png', pron: 'puente' },
        { word: 'FUENTE', image: 'assets/fuente.png', pron: 'fuente' },
        { word: 'SERPIENTE', image: 'assets/serpiente.png', pron: 'serpiente' },
        { word: 'GUANTE', image: 'assets/guante.png', pron: 'guante' },
        { word: 'ELEFANTE', image: 'assets/elefante.png', pron: 'elefante' }
      ]
    },
    {
      id: 'ela',
      rhymeSound: 'ELA',
      potionName: 'Poción de las Estrellas',
      potionColor: '#84CC16',
      potionSecondary: '#BEF264',
      words: [
        { word: 'TELA', image: 'assets/tela.png', pron: 'tela' },
        { word: 'VELA', image: 'assets/vela.png', pron: 'vela' },
        { word: 'ABUELA', image: 'assets/abuela.png', pron: 'abuela' },
        { word: 'ESTRELLA', image: 'assets/estrella.png', pron: 'estrella' }
      ]
    },
    {
      id: 'ila',
      rhymeSound: 'ILA',
      potionName: 'Elixir de las Alturas',
      potionColor: '#0EA5E9',
      potionSecondary: '#7DD3FC',
      words: [
        { word: 'PILA', image: 'assets/pila.png', pron: 'pila' },
        { word: 'GORILA', image: 'assets/gorila.png', pron: 'gorila' },
        { word: 'ÁGUILA', image: 'assets/aguila.png', pron: 'águila' }
      ]
    },
    {
      id: 'or',
      rhymeSound: 'OR',
      potionName: 'Fórmula de la Sabiduría Mágica',
      potionColor: '#A855F7',
      potionSecondary: '#D8B4FE',
      words: [
        { word: 'DOCTOR', image: 'assets/doctor.png', pron: 'doctor' },
        { word: 'TENEDOR', image: 'assets/tenedor.png', pron: 'tenedor' },
        { word: 'FLOR', image: 'assets/flor.png', pron: 'flor' }
      ]
    }
  ];

  // GENERADOR ULTRA-DINÁMICO DE POCIONES DE RIMAS (TOTALMENTE ALEATORIO Y SIN REPETICIONES)
  function generateDynamicRhymePotions() {
    const shuffledFamilies = [...RHYME_FAMILIES].sort(() => Math.random() - 0.5);

    return shuffledFamilies.map(fam => {
      // Barajar palabras dentro de la familia para alternar base y targets
      const famWords = [...fam.words].sort(() => Math.random() - 0.5);
      const baseWord = famWords[0];
      const targetWords = famWords.slice(1, 3); // 2 ingredientes que riman con la base

      // Elegir 2 distractores de otras familias con rima diferente
      const otherWords = [];
      shuffledFamilies.forEach(otherFam => {
        if (otherFam.id !== fam.id) {
          otherFam.words.forEach(w => otherWords.push(w));
        }
      });
      otherWords.sort(() => Math.random() - 0.5);
      const distractors = otherWords.slice(0, 2);

      return {
        id: fam.id,
        rhymeSound: fam.rhymeSound,
        potionName: fam.potionName,
        potionColor: fam.potionColor,
        potionSecondary: fam.potionSecondary,
        base: baseWord,
        targets: targetWords,
        distractors: distractors
      };
    });
  }

  // Caché de imágenes
  const cauldronImgCache = {};
  function getCachedImg(src) {
    if (!src) return null;
    if (!cauldronImgCache[src]) {
      const img = new Image();
      img.src = src;
      cauldronImgCache[src] = img;
    }
    return cauldronImgCache[src];
  }

  // Obtener héroe arquero actual
  function getCauldronHeroPet() {
    if (typeof ArcheryGame !== 'undefined' && ArcheryGame.selectedPet) {
      return ArcheryGame.selectedPet;
    }
    try {
      const saved = localStorage.getItem('crin_archery_pet');
      if (saved && ['🦄', '🦊', '🐰', '🐶'].includes(saved)) return saved;
    } catch(e) {}
    return '🦄';
  }

  function getCauldronHeroCardImg() {
    const pet = getCauldronHeroPet();
    const map = {
      '🦄': 'assets/card_unicornio_arquero.png?v=248',
      '🦊': 'assets/card_zorro_arquero.png?v=248',
      '🐰': 'assets/card_conejo_arquero.png?v=248',
      '🐶': 'assets/card_perro_arquero.png?v=248'
    };
    return map[pet] || map['🦄'];
  }

  // --- APERTURA Y CONTROL DE PANTALLA ---
  window.openCauldronQuestScreen = function() {
    if (typeof stopAllAudio === 'function') stopAllAudio();
    if (typeof switchScreen === 'function') switchScreen('cauldron');

    const screen = document.getElementById('screen-cauldron');
    if (screen) screen.classList.add('active');

    CauldronGame.isRunning = true;
    CauldronGame.hasStarted = false;
    CauldronGame.potionDeck = generateDynamicRhymePotions();
    CauldronGame.currentPotionIndex = 0;
    initCauldronGame();

    setTimeout(resizeCauldronCanvas, 50);
    setTimeout(resizeCauldronCanvas, 150);
    setTimeout(resizeCauldronCanvas, 300);
  };

  window.closeCauldronAndReturnToMap = function() {
    CauldronGame.isRunning = false;
    if (CauldronGame.animId) cancelAnimationFrame(CauldronGame.animId);
    if (CauldronGame.voiceTimeout) clearTimeout(CauldronGame.voiceTimeout);
    if (typeof stopAllAudio === 'function') stopAllAudio();

    if (typeof switchScreen === 'function') {
      switchScreen('map');
    }
  };

  window.stopCauldronGame = function() {
    CauldronGame.isRunning = false;
    if (CauldronGame.animId) cancelAnimationFrame(CauldronGame.animId);
    if (CauldronGame.voiceTimeout) clearTimeout(CauldronGame.voiceTimeout);
  };

  // Inicialización de la partida
  function initCauldronGame() {
    CauldronGame.canvas = document.getElementById('cauldron-game-canvas');
    if (!CauldronGame.canvas) return;
    CauldronGame.ctx = CauldronGame.canvas.getContext('2d');

    resizeCauldronCanvas();
    setupCauldronEventListeners();
    setupPotion(CauldronGame.currentPotionIndex);

    if (CauldronGame.animId) cancelAnimationFrame(CauldronGame.animId);
    CauldronGame.animId = requestAnimationFrame(cauldronGameLoop);
  }

  function resizeCauldronCanvas() {
    if (!CauldronGame.canvas) return;
    const container = CauldronGame.canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const w = Math.max(320, Math.floor(rect.width) || window.innerWidth || 800);
    const h = Math.max(360, Math.floor(rect.height) || (window.innerHeight - 170) || 520);

    CauldronGame.width = w;
    CauldronGame.height = h;
    CauldronGame.canvas.width = w;
    CauldronGame.canvas.height = h;

    // Posición del caldero centrado abajo
    CauldronGame.cauldron.x = w * 0.50;
    CauldronGame.cauldron.y = h * 0.72;
    CauldronGame.cauldron.width = Math.min(260, w * 0.46);
    CauldronGame.cauldron.height = Math.min(160, h * 0.32);
    CauldronGame.cauldron.liquidY = CauldronGame.cauldron.y - CauldronGame.cauldron.height * 0.28;

    // Posición del héroe a la izquierda
    CauldronGame.hero.x = Math.max(70, w * 0.16);
    CauldronGame.hero.y = CauldronGame.cauldron.y + 10;

    repositionBubbles();
  }

  // Configuración de una poción
  function setupPotion(index) {
    if (!CauldronGame.potionDeck || CauldronGame.potionDeck.length === 0) {
      CauldronGame.potionDeck = generateDynamicRhymePotions();
    }
    // Re-barajar si se completan todas las pociones del mazo
    if (index >= CauldronGame.potionDeck.length) {
      CauldronGame.potionDeck = generateDynamicRhymePotions();
    }
    const p = CauldronGame.potionDeck[index % CauldronGame.potionDeck.length];
    CauldronGame.currentPotion = p;
    CauldronGame.collectedIngredients = [];
    CauldronGame.isAdvancing = false;
    CauldronGame.isSpeaking = false;
    if (typeof window.isAppSpeaking !== 'undefined') window.isAppSpeaking = false;
    if (typeof window.updateNarrationLockUI === 'function') window.updateNarrationLockUI();
    CauldronGame.particles = [];
    CauldronGame.floatingTexts = [];
    CauldronGame.draggedBubble = null;

    CauldronGame.cauldron.potionColor = p.potionColor;
    CauldronGame.cauldron.potionSecondary = p.potionSecondary;

    // Crear burbujas flotantes de ingredientes (2 rimas + 2 distractores)
    const items = [
      ...p.targets.map(t => ({ ...t, isTarget: true })),
      ...p.distractors.map(d => ({ ...d, isTarget: false }))
    ];

    // Barajar aleatoriamente
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }

    CauldronGame.bubbles = items.map((item, idx) => ({
      id: idx,
      word: item.word,
      image: item.image,
      pron: item.pron,
      isTarget: item.isTarget,
      radius: 46,
      x: 0,
      y: 0,
      baseX: 0,
      baseY: 0,
      floatOffset: idx * 1.5,
      scale: 1.0,
      alpha: 1.0,
      isDragging: false,
      isPopping: false
    }));

    repositionBubbles();
    updateCauldronHUD();

    // Relato inicial guiado y pausado (espera y entonación limpia)
    if (CauldronGame.voiceTimeout) clearTimeout(CauldronGame.voiceTimeout);
    CauldronGame.voiceTimeout = setTimeout(() => {
      speakCauldronMission();
    }, 600);
  }

  function repositionBubbles() {
    const w = CauldronGame.width;
    const h = CauldronGame.height;
    const bubbles = CauldronGame.bubbles;
    if (!bubbles || bubbles.length === 0) return;

    // Distribuir en arco sobre el caldero
    const startY = h * 0.22;
    const spreadX = Math.min(w * 0.78, 560);
    const stepX = spreadX / (bubbles.length - 1);
    const leftX = (w - spreadX) * 0.50;

    bubbles.forEach((b, idx) => {
      if (!b.isDragging) {
        b.baseX = leftX + idx * stepX;
        b.baseY = startY + (idx % 2 === 0 ? -12 : 12);
        b.x = b.baseX;
        b.y = b.baseY;
      }
    });
  }

  function updateCauldronHUD() {
    const p = CauldronGame.currentPotion;
    if (!p) return;

    const nameEl = document.getElementById('cauldron-potion-title');
    if (nameEl) nameEl.innerText = p.potionName;

    const baseWordEl = document.getElementById('cauldron-base-word');
    if (baseWordEl) baseWordEl.innerText = p.base.word;

    const baseImgEl = document.getElementById('cauldron-base-img');
    if (baseImgEl) baseImgEl.src = p.base.image;

    const rhymeBadge = document.getElementById('cauldron-rhyme-badge');
    if (rhymeBadge) rhymeBadge.innerText = `Termina en -${p.rhymeSound}`;

    // Slots de ingredientes recolectados
    const slotsEl = document.getElementById('cauldron-slots-container');
    if (slotsEl) {
      slotsEl.innerHTML = `
        <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
          <div style="background: ${CauldronGame.collectedIngredients.length >= 1 ? '#10B981' : '#F1F5F9'}; color: ${CauldronGame.collectedIngredients.length >= 1 ? 'white' : '#64748B'}; border: 2px solid ${CauldronGame.collectedIngredients.length >= 1 ? '#059669' : '#CBD5E1'}; border-radius: 12px; padding: 4px 10px; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 5px;">
            <span>${CauldronGame.collectedIngredients.length >= 1 ? '✨ ' + CauldronGame.collectedIngredients[0].word : '🧪 Ingrediente 1'}</span>
          </div>
          <div style="background: ${CauldronGame.collectedIngredients.length >= 2 ? '#10B981' : '#F1F5F9'}; color: ${CauldronGame.collectedIngredients.length >= 2 ? 'white' : '#64748B'}; border: 2px solid ${CauldronGame.collectedIngredients.length >= 2 ? '#059669' : '#CBD5E1'}; border-radius: 12px; padding: 4px 10px; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 5px;">
            <span>${CauldronGame.collectedIngredients.length >= 2 ? '✨ ' + CauldronGame.collectedIngredients[1].word : '🧪 Ingrediente 2'}</span>
          </div>
        </div>
      `;
    }
  }

  // --- LOCUCIÓN PEDAGÓGICA Y CALIBRADA ---
  window.speakCauldronMission = function() {
    const p = CauldronGame.currentPotion;
    if (!p) return;
    if (typeof speakText === 'function') {
      CauldronGame.isSpeaking = true;

      let missionText = '';
      if (!CauldronGame.hasStarted && CauldronGame.currentPotionIndex === 0) {
        CauldronGame.hasStarted = true;
        missionText = `¡Bienvenido al Caldero de las Rimas! Busca las palabras que riman con: ${p.base.pron}. ¡La palabra a rimar es ${p.base.pron}!`;
      } else if (CauldronGame.collectedIngredients.length === 0) {
        missionText = `¡Nueva poción! Busca las palabras que riman con: ${p.base.pron}. ¡La palabra a rimar es ${p.base.pron}!`;
      } else {
        missionText = `Busca el otro ingrediente que también rime con: ${p.base.pron}. ¡La palabra a rimar es ${p.base.pron}!`;
      }

      speakText(missionText, () => {
        CauldronGame.isSpeaking = false;
      });
      setTimeout(() => { CauldronGame.isSpeaking = false; }, 9500);
    }
  };

  // --- DIBUJADO DEL LABORATORIO Y CALDERO ---
  function drawCauldronEnvironment(ctx, w, h, time) {
    // 1. Fondo de pared de piedra mágica del castillo / laboratorio
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#1E1B4B');
    bgGrad.addColorStop(0.55, '#312E81');
    bgGrad.addColorStop(1, '#1E293B');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Ventana gótica con luna y estrellas
    const winX = w * 0.82;
    const winY = h * 0.22;
    ctx.save();
    ctx.beginPath();
    ctx.arc(winX, winY, 48, Math.PI, 0, false);
    ctx.lineTo(winX + 48, winY + 60);
    ctx.lineTo(winX - 48, winY + 60);
    ctx.closePath();
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#475569';
    ctx.stroke();

    // Luna creciente
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(winX - 6, winY + 6, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(winX + 2, winY + 4, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Estantería con frascos mágicos a la izquierda
    ctx.fillStyle = '#451A03';
    ctx.fillRect(20, h * 0.32, 130, 10);
    ctx.fillRect(20, h * 0.48, 130, 10);
    // Frascos de colores en la estantería
    drawPotionBottle(ctx, 45, h * 0.32 - 24, '#EC4899');
    drawPotionBottle(ctx, 80, h * 0.32 - 28, '#10B981');
    drawPotionBottle(ctx, 115, h * 0.32 - 22, '#F59E0B');
    drawPotionBottle(ctx, 50, h * 0.48 - 26, '#3B82F6');
    drawPotionBottle(ctx, 95, h * 0.48 - 25, '#8B5CF6');

    // 3. Suelo de baldosas de piedra
    const floorY = h * 0.70;
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
    floorGrad.addColorStop(0, '#334155');
    floorGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, w, h - floorY);

    // 4. Fogata mágica bajo el caldero
    const cx = CauldronGame.cauldron.x;
    const cy = CauldronGame.cauldron.y;
    drawFirewood(ctx, cx, cy + 50, time);

    // 5. El Caldero Mágico
    drawCauldronPot(ctx, cx, cy, time);

    // 6. El Héroe Alquimista a la izquierda
    drawAlchemistHero(ctx, time);
  }

  function drawPotionBottle(ctx, x, y, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x - 10, y + 6, 20, 18, [4]);
    ctx.fill();
    // Cuello
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillRect(x - 5, y, 10, 8);
    // Tapón de corcho
    ctx.fillStyle = '#92400E';
    ctx.fillRect(x - 6, y - 4, 12, 5);
    ctx.restore();
  }

  function drawFirewood(ctx, x, y, time) {
    ctx.save();
    // Leños cruzados
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.ellipse(x - 25, y, 32, 7, 0.25, 0, Math.PI * 2);
    ctx.ellipse(x + 25, y, 32, 7, -0.25, 0, Math.PI * 2);
    ctx.fill();

    // Llamas mágicas parpadeantes
    const flicker1 = Math.sin(time * 0.015) * 6;
    const flicker2 = Math.cos(time * 0.018) * 5;

    ctx.fillStyle = 'rgba(249, 115, 22, 0.85)';
    ctx.beginPath();
    ctx.moveTo(x - 30, y);
    ctx.quadraticCurveTo(x - 15, y - 28 + flicker1, x, y - 42 + flicker2);
    ctx.quadraticCurveTo(x + 15, y - 28 + flicker1, x + 30, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(253, 224, 71, 0.9)';
    ctx.beginPath();
    ctx.moveTo(x - 18, y);
    ctx.quadraticCurveTo(x - 8, y - 18 + flicker2, x, y - 28 + flicker1);
    ctx.quadraticCurveTo(x + 8, y - 18 + flicker2, x + 18, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawCauldronPot(ctx, cx, cy, time) {
    const cw = CauldronGame.cauldron.width;
    const ch = CauldronGame.cauldron.height;
    const p = CauldronGame.currentPotion;
    const potColor = p ? p.potionColor : '#8B5CF6';
    const potSecondary = p ? p.potionSecondary : '#C084FC';

    ctx.save();

    // Sombra del caldero en el suelo
    ctx.beginPath();
    ctx.ellipse(cx, cy + 42, cw * 0.58, 18, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Patas de hierro del caldero
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(cx - cw * 0.42, cy + 18, 16, 26, [4]);
    ctx.roundRect(cx + cw * 0.42 - 16, cy + 18, 16, 26, [4]);
    ctx.fill();

    // Cuerpo del caldero (panza redonda de hierro)
    ctx.beginPath();
    ctx.arc(cx, cy, cw * 0.46, 0, Math.PI, false);
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    // Resplandor metálico en el costado izquierdo
    ctx.beginPath();
    ctx.arc(cx, cy, cw * 0.44, Math.PI * 0.65, Math.PI * 0.95, false);
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.stroke();

    // Asas doradas en los lados
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(cx - cw * 0.45, cy - 8, 16, Math.PI * 0.5, Math.PI * 1.5, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + cw * 0.45, cy - 8, 16, Math.PI * 1.5, Math.PI * 0.5, false);
    ctx.stroke();

    // Boca elíptica del caldero (borde metálico)
    const rimY = cy - ch * 0.28;
    ctx.beginPath();
    ctx.ellipse(cx, rimY, cw * 0.48, 22, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#64748B';
    ctx.stroke();

    // Líquido mágico de la poción (elipse interior brillante)
    ctx.beginPath();
    ctx.ellipse(cx, rimY + 4, cw * 0.42, 17, 0, 0, Math.PI * 2);
    const liqGrad = ctx.createRadialGradient(cx, rimY + 4, 6, cx, rimY + 4, cw * 0.42);
    liqGrad.addColorStop(0, '#FFFFFF');
    liqGrad.addColorStop(0.35, potSecondary);
    liqGrad.addColorStop(1, potColor);
    ctx.fillStyle = liqGrad;
    ctx.fill();

    // Burbujas mágicas subiendo del caldero
    if (Math.random() < 0.28) {
      CauldronGame.steamBubbles.push({
        x: cx + (Math.random() - 0.5) * (cw * 0.65),
        y: rimY,
        vy: -(1.2 + Math.random() * 1.8),
        vx: (Math.random() - 0.5) * 0.8,
        radius: 4 + Math.random() * 6,
        alpha: 0.9,
        color: potSecondary
      });
    }

    // Actualizar y dibujar vapor / burbujas de poción
    for (let i = CauldronGame.steamBubbles.length - 1; i >= 0; i--) {
      const sb = CauldronGame.steamBubbles[i];
      sb.y += sb.vy;
      sb.x += sb.vx;
      sb.alpha -= 0.015;
      if (sb.alpha <= 0) {
        CauldronGame.steamBubbles.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(sb.x, sb.y, sb.radius, 0, Math.PI * 2);
      ctx.fillStyle = sb.color;
      ctx.globalAlpha = sb.alpha;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  }

  // Dibujado del héroe alquimista
  function drawAlchemistHero(ctx, time) {
    const h = CauldronGame.hero;
    const cardImgSrc = getCauldronHeroCardImg();
    const img = getCachedImg(cardImgSrc);

    if (h.isCelebrating) {
      h.jumpY += h.jumpVy;
      h.jumpVy += 0.55;
      if (h.jumpY > 0) {
        h.jumpY = 0;
        h.jumpVy = -7.5;
      }
      h.celebrateTimer--;
      if (h.celebrateTimer <= 0) {
        h.isCelebrating = false;
        h.jumpY = 0;
      }
    }

    const breathing = Math.sin(time * 0.0035) * 3;

    ctx.save();
    ctx.translate(h.x, h.y + h.jumpY + breathing);

    // Sombra en el suelo
    ctx.beginPath();
    ctx.ellipse(0, 30, 42, 11, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fill();

    // Ilustración del héroe
    if (img && img.complete && img.naturalWidth > 0) {
      const size = Math.max(130, Math.min(160, CauldronGame.height * 0.36));
      ctx.drawImage(img, -size * 0.5, -size + 30, size, size);
    }

    // Sombrero de alquimista mágico / varita mágica en la mano
    ctx.fillStyle = '#8B5CF6';
    ctx.beginPath();
    ctx.moveTo(35, -40);
    ctx.lineTo(65, -80);
    ctx.lineTo(45, -35);
    ctx.closePath();
    ctx.fill();
    // Destello de la varita
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(65, -80, 5 + Math.sin(time * 0.02) * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- DIBUJADO DE LAS BURBUJAS DE INGREDIENTES FLOTANTES ---
  function drawIngredientBubbles(ctx, time) {
    const bubbles = CauldronGame.bubbles;
    if (!bubbles) return;

    bubbles.forEach(b => {
      if (b.alpha <= 0.01) return;

      // Movimiento flotante suave si no se está arrastrando
      if (!b.isDragging) {
        const floatY = Math.sin(time * 0.0035 + b.floatOffset) * 8;
        const floatX = Math.cos(time * 0.0025 + b.floatOffset) * 4;
        b.x = b.baseX + floatX;
        b.y = b.baseY + floatY;
      }

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.scale(b.scale, b.scale);
      ctx.globalAlpha = b.alpha;

      const r = b.radius;

      // Sombra suave bajo la burbuja
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.shadowColor = b.isDragging ? 'rgba(139, 92, 246, 0.65)' : 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = b.isDragging ? 22 : 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Anillo iridiscente de la burbuja
      ctx.lineWidth = b.isDragging ? 4.5 : 3.5;
      const ringGrad = ctx.createLinearGradient(-r, -r, r, r);
      ringGrad.addColorStop(0, '#C084FC');
      ringGrad.addColorStop(0.5, '#60A5FA');
      ringGrad.addColorStop(1, '#34D399');
      ctx.strokeStyle = ringGrad;
      ctx.stroke();

      // Reflejo blanco curvo de cristal
      ctx.beginPath();
      ctx.ellipse(-r * 0.38, -r * 0.40, r * 0.30, r * 0.14, -0.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fill();

      // Imagen real del ingrediente dentro de la burbuja
      const img = getCachedImg(b.image);
      if (img && img.complete && img.naturalWidth > 0) {
        const imgSize = r * 1.25;
        ctx.drawImage(img, -imgSize * 0.5, -imgSize * 0.55, imgSize, imgSize);
      }

      // Etiqueta legible en mayúsculas al pie de la burbuja
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 12px "Comic Neue", "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Píldora de fondo para el texto
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.beginPath();
      ctx.roundRect(-38, r * 0.45, 76, 20, [8]);
      ctx.fill();
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#1E1B4B';
      ctx.fillText(b.word, 0, r * 0.45 + 10);

      ctx.restore();
    });
  }

  // --- FÍSICA DE IMPACTO EN EL CALDERO Y VALIDACIÓN ---
  function checkCauldronDrop(bubble) {
    const c = CauldronGame.cauldron;
    const dx = bubble.x - c.x;
    const dy = bubble.y - c.liquidY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Si la burbuja se soltó sobre la boca del caldero
    if (dist < c.width * 0.48) {
      handleIngredientDropped(bubble);
      return true;
    }
    return false;
  }

  function handleIngredientDropped(bubble) {
    const c = CauldronGame.cauldron;
    const p = CauldronGame.currentPotion;

    if (bubble.isTarget) {
      // ✅ ACIERTO EN LA RIMA
      playCauldronSplashSound();
      createMagicSplashParticles(c.x, c.liquidY, p.potionSecondary, 35);
      createFloatingText(c.x, c.liquidY - 40, `¡RIMA! ${p.base.word} y ${bubble.word} ✨`, '#10B981');

      // Animación de celebración del héroe
      CauldronGame.hero.isCelebrating = true;
      CauldronGame.hero.celebrateTimer = 90;
      CauldronGame.hero.jumpVy = -8.5;

      // Agregar ingrediente
      CauldronGame.collectedIngredients.push(bubble);
      bubble.alpha = 0; // Se disuelve en el caldero

      // Desactivar temporalmente interacción durante el relato
      CauldronGame.isAdvancing = true;
      updateCauldronHUD();

      // Premio de monedas
      if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
        activeChildProfile.coins = (activeChildProfile.coins || 0) + 5;
        if (typeof saveActiveChildProfile === 'function') saveActiveChildProfile();
      }

      // Locución pedagógica prosódica: ¡Súper! Bo-TÓN rima con Ra-TÓN
      const basePron = p.base.pron;
      const targetPron = bubble.pron;

      let praiseHandled = false;
      const onPraiseEnded = () => {
        if (praiseHandled) return;
        praiseHandled = true;

        // Pausa pedagógica respetuosa (1.3s) para que el niño procese el elogio antes de que comience el siguiente relato
        setTimeout(() => {
          CauldronGame.isAdvancing = false;
          CauldronGame.isSpeaking = false;
          if (typeof window.isAppSpeaking !== 'undefined') window.isAppSpeaking = false;
          if (typeof window.updateNarrationLockUI === 'function') window.updateNarrationLockUI();

          // ¿Completó los 2 ingredientes de la poción?
          if (CauldronGame.collectedIngredients.length >= 2) {
            handlePotionCompleted();
          } else {
            // Guía constructiva para el segundo ingrediente
            if (typeof speakText === 'function') {
              CauldronGame.isSpeaking = true;
              speakText(`¡Genial! Ahora busca el otro ingrediente que también rime con ${basePron}. ¡La palabra a rimar es ${basePron}!`, () => {
                CauldronGame.isSpeaking = false;
              });
              setTimeout(() => { CauldronGame.isSpeaking = false; }, 4500);
            }
          }
        }, 1300);
      };

      if (typeof speakText === 'function') {
        CauldronGame.isSpeaking = true;
        speakText(`¡Súper! ¡${basePron} y ${targetPron}! ¡Suenan igual al final!`, () => {
          CauldronGame.isSpeaking = false;
          onPraiseEnded();
        });
      } else {
        onPraiseEnded();
      }
      setTimeout(onPraiseEnded, 8500); // Respaldo de seguridad amplio (8.5s) para NUNCA cortar el relato

    } else {
      // ❌ DISTRACTOR (NO RIMA)
      playCauldronBoingSound();
      createFloatingText(bubble.x, bubble.y - 30, '¡No rima!', '#F59E0B');

      // Rebote suave hacia arriba
      bubble.isDragging = false;
      bubble.y = bubble.baseY - 40;
      setTimeout(() => {
        bubble.x = bubble.baseX;
        bubble.y = bubble.baseY;
      }, 400);

      const basePron = p.base.pron;
      const distractorPron = bubble.pron;

      if (typeof speakText === 'function') {
        speakText(`${basePron} y ${distractorPron} no suenan igual. ¡Busca una que rime con ${basePron}!`);
      }
    }
  }

  function handlePotionCompleted() {
    const c = CauldronGame.cauldron;
    playCauldronVictoryChime();
    createRainbowExplosion(c.x, c.liquidY, 60);

    createFloatingText(c.x, c.liquidY - 60, '¡POCIÓN MÁGICA COMPLETA! 🌟', '#F59E0B');

    if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
      activeChildProfile.coins = (activeChildProfile.coins || 0) + 10;
      activeChildProfile.stars = (activeChildProfile.stars || 0) + 2;
      if (typeof saveActiveChildProfile === 'function') saveActiveChildProfile();
    }

    let victoryHandled = false;
    const onVictoryEnded = () => {
      if (victoryHandled) return;
      victoryHandled = true;
      CauldronGame.isAdvancing = false;
      CauldronGame.isSpeaking = false;
      if (typeof window.isAppSpeaking !== 'undefined') window.isAppSpeaking = false;
      if (typeof window.updateNarrationLockUI === 'function') window.updateNarrationLockUI();

      setTimeout(() => {
        // Avanzar a la siguiente poción mágica
        CauldronGame.currentPotionIndex++;
        setupPotion(CauldronGame.currentPotionIndex);
      }, 400);
    };

    if (typeof speakText === 'function') {
      CauldronGame.isSpeaking = true;
      speakText('¡Poción mágica completada! ¡Excelente trabajo con las rimas!', onVictoryEnded);
    } else {
      onVictoryEnded();
    }
    setTimeout(onVictoryEnded, 7500);
  }

  // --- SISTEMA DE PARTÍCULAS Y TEXTOS FLOTANTES ---
  function createMagicSplashParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 0.8) + Math.random() * (Math.PI * 1.4);
      const speed = 3.5 + Math.random() * 6.0;
      CauldronGame.particles.push({
        x: x + (Math.random() - 0.5) * 60,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 5,
        alpha: 1.0,
        decay: 0.022 + Math.random() * 0.015,
        color: color,
        isStar: Math.random() > 0.4
      });
    }
  }

  function createRainbowExplosion(x, y, count) {
    const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#FCD34D'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 7.5;
      CauldronGame.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        radius: 3 + Math.random() * 6,
        alpha: 1.0,
        decay: 0.018,
        color: colors[i % colors.length],
        isStar: true
      });
    }
  }

  function createFloatingText(x, y, text, color) {
    CauldronGame.floatingTexts.push({
      x: x,
      y: y,
      text: text,
      color: color,
      alpha: 1.0,
      vy: -1.2
    });
  }

  function updateAndDrawEffects(ctx) {
    // Partículas
    for (let i = CauldronGame.particles.length - 1; i >= 0; i--) {
      const p = CauldronGame.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18; // gravedad
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        CauldronGame.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      if (p.isStar) {
        ctx.font = `${Math.round(p.radius * 2.8)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✨', p.x, p.y);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Textos flotantes
    for (let i = CauldronGame.floatingTexts.length - 1; i >= 0; i--) {
      const ft = CauldronGame.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.016;

      if (ft.alpha <= 0) {
        CauldronGame.floatingTexts.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = '900 16px "Comic Neue", "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  // --- BUCLE PRINCIPAL DE ANIMACIÓN ---
  function cauldronGameLoop(timestamp) {
    if (!CauldronGame.isRunning) return;

    try {
      CauldronGame.time = timestamp || 0;
      const ctx = CauldronGame.ctx;
      const w = CauldronGame.width;
      const h = CauldronGame.height;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);

      drawCauldronEnvironment(ctx, w, h, CauldronGame.time);
      drawIngredientBubbles(ctx, CauldronGame.time);
      updateAndDrawEffects(ctx);

    } catch(err) {
      // Proteger bucle silenciosamente
    }

    if (CauldronGame.isRunning) {
      CauldronGame.animId = requestAnimationFrame(cauldronGameLoop);
    }
  }

  // --- CONTROLES TÁCTILES Y DE ARRASTRE (DRAG & DROP + TAP TO CAST) ---
  function setupCauldronEventListeners() {
    const canvas = CauldronGame.canvas;
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

    function onPointerDown(e) {
      if (CauldronGame.isAdvancing || CauldronGame.isSpeaking) return;

      const pos = getCanvasPos(e);
      CauldronGame.pointer.x = pos.x;
      CauldronGame.pointer.y = pos.y;
      CauldronGame.pointer.isDown = true;

      // Buscar si tocó alguna burbuja (radio generoso para niños y pantallas táctiles)
      const bubbles = CauldronGame.bubbles;
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        if (b.alpha <= 0.01 || b.isPopping) continue;

        const dx = pos.x - b.x;
        const dy = pos.y - b.y;
        if (Math.sqrt(dx * dx + dy * dy) < b.radius * 1.45) {
          CauldronGame.draggedBubble = b;
          b.isDragging = true;
          b.pointerDownX = pos.x;
          b.pointerDownY = pos.y;
          b.dragOffsetX = b.x - pos.x;
          b.dragOffsetY = b.y - pos.y;
          break;
        }
      }
    }

    function onPointerMove(e) {
      const pos = getCanvasPos(e);
      CauldronGame.pointer.x = pos.x;
      CauldronGame.pointer.y = pos.y;

      if (CauldronGame.draggedBubble && CauldronGame.pointer.isDown) {
        const b = CauldronGame.draggedBubble;
        b.x = pos.x + (b.dragOffsetX || 0);
        b.y = pos.y + (b.dragOffsetY || 0);
      }
    }

    function onPointerUp(e) {
      CauldronGame.pointer.isDown = false;
      const b = CauldronGame.draggedBubble;
      if (!b) return;

      b.isDragging = false;
      CauldronGame.draggedBubble = null;

      // 1. Verificar si cayó en el caldero mediante arrastre
      const droppedInCauldron = checkCauldronDrop(b);

      // 2. Si no cayó por arrastre, verificar si fue un toque/clic ("Tap to Cast" ultra accesible)
      if (!droppedInCauldron) {
        const pos = getCanvasPos(e);
        const touchDist = Math.hypot(pos.x - (b.pointerDownX || b.baseX), pos.y - (b.pointerDownY || b.baseY));
        const baseDist = Math.hypot(b.x - b.baseX, b.y - b.baseY);

        // Si se movió menos de 45px (es un toque o clic en la burbuja): ¡vuelo mágico directo al caldero!
        if (touchDist < 45 || baseDist < 45) {
          animateBubbleToCauldron(b);
        } else {
          // Volver suavemente a su posición base si se soltó en el aire lejos del caldero
          b.x = b.baseX;
          b.y = b.baseY;
        }
      }
    }

    function animateBubbleToCauldron(bubble) {
      const c = CauldronGame.cauldron;
      const startX = bubble.x;
      const startY = bubble.y;
      const targetX = c.x;
      const targetY = c.liquidY;
      let progress = 0;

      function step() {
        progress += 0.08;
        if (progress >= 1.0) {
          bubble.x = targetX;
          bubble.y = targetY;
          handleIngredientDropped(bubble);
        } else {
          bubble.x = startX + (targetX - startX) * progress;
          bubble.y = startY + (targetY - startY) * progress - Math.sin(progress * Math.PI) * 45;
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    }

    // Registrar eventos táctiles y de mouse
    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });
  }

  // --- EFECTOS DE SONIDO WEB AUDIO SINTETIZADOS (SIN DEPENDENCIAS EXTERNAS) ---
  function playCauldronSplashSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, actx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.35, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.25);
    } catch(e) {}
  }

  function playCauldronBoingSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, actx.currentTime);
      osc.frequency.linearRampToValueAtTime(240, actx.currentTime + 0.1);
      osc.frequency.linearRampToValueAtTime(130, actx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.25, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.28);
    } catch(e) {}
  }

  function playCauldronVictoryChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, actx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0, actx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.28, actx.currentTime + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + idx * 0.08 + 0.45);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(actx.currentTime + idx * 0.08);
        osc.stop(actx.currentTime + idx * 0.08 + 0.45);
      });
    } catch(e) {}
  }

})();
