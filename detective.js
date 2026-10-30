// =========================================================================
// CRIN AVENTURAS DE LECTOESCRITURA - EL DETECTIVE DE SONIDOS GEMELOS
// Módulo Psicopedagógico de Discriminación Auditiva y Pares Mínimos (DUA)
// =========================================================================

(function() {
  'use strict';

  const DetectiveGame = {
    canvas: null,
    ctx: null,
    width: 800,
    height: 520,
    isRunning: false,
    animId: null,
    time: 0,

    // Casos a resolver
    cases: [],
    currentCaseIndex: 0,
    currentCase: null,

    // Cartas de sospechosos (las dos opciones del par mínimo)
    cards: [],
    selectedCard: null,

    // Lupa del detective
    magnifier: {
      x: 400,
      y: 260,
      targetX: 400,
      targetY: 260,
      radius: 46,
      angle: 0.35,
      isInspecting: false,
      flashAlpha: 0
    },

    // Efectos
    sparkles: [],
    floatingTexts: [],

    isSpeaking: false,
    isAdvancing: false,
    voiceTimeout: null,
    speechWatchdog: null,
    listenersAttached: false
  };

  // BANCO CANÓNICO DE CASOS DE PARES MÍNIMOS CON IMÁGENES REALES
  const MINIMAL_PAIR_CASES = [
    {
      id: 'pato_gato',
      contrastDescription: 'Sonido /P/ vs Sonido /G/',
      clueHint: 'Presta atención al inicio de la palabra',
      optionA: { word: 'PATO', image: 'assets/pato.png', pron: 'pato', startLetter: 'P' },
      optionB: { word: 'GATO', image: 'assets/gato.png', pron: 'gato', startLetter: 'G' },
      target: 'A' // PATO
    },
    {
      id: 'casa_taza',
      contrastDescription: 'Sonido /K/ vs Sonido /T/',
      clueHint: 'Escucha bien la primera letra',
      optionA: { word: 'CASA', image: 'assets/casa.png', pron: 'casa', startLetter: 'C' },
      optionB: { word: 'TAZA', image: 'assets/taza.png', pron: 'taza', startLetter: 'T' },
      target: 'B' // TAZA
    },
    {
      id: 'luna_cuna',
      contrastDescription: 'Sonido /L/ vs Sonido /K/',
      clueHint: 'Fíjate cómo suena al empezar',
      optionA: { word: 'LUNA', image: 'assets/luna.png', pron: 'luna', startLetter: 'L' },
      optionB: { word: 'CUNA', image: 'assets/cuna.png', pron: 'cuna', startLetter: 'C' },
      target: 'A' // LUNA
    },
    {
      id: 'pala_sala',
      contrastDescription: 'Sonido /P/ vs Sonido /S/',
      clueHint: 'Diferencia el golpe del aire al inicio',
      optionA: { word: 'PALA', image: 'assets/pala.png', pron: 'pala', startLetter: 'P' },
      optionB: { word: 'SALA', image: 'assets/sala.png', pron: 'sala', startLetter: 'S' },
      target: 'A' // PALA
    },
    {
      id: 'bota_bola',
      contrastDescription: 'Sonido final /TA/ vs /LA/',
      clueHint: 'Escucha atentamente el final de la palabra',
      optionA: { word: 'BOTA', image: 'assets/bota.png', pron: 'bota', startLetter: 'B' },
      optionB: { word: 'BOLA', image: 'assets/bola.png', pron: 'bola', startLetter: 'B' },
      target: 'A' // BOTA
    },
    {
      id: 'gato_pato_2',
      contrastDescription: 'Sonido /G/ vs Sonido /P/',
      clueHint: 'Escucha el rugido suave o el toque suave',
      optionA: { word: 'GATO', image: 'assets/gato.png', pron: 'gato', startLetter: 'G' },
      optionB: { word: 'PATO', image: 'assets/pato.png', pron: 'pato', startLetter: 'P' },
      target: 'A' // GATO
    }
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
  window.openDetectiveQuestScreen = function() {
    if (typeof stopAllAudio === 'function') stopAllAudio();
    if (typeof switchScreen === 'function') switchScreen('detective');

    const screen = document.getElementById('screen-detective');
    if (screen) screen.classList.add('active');

    DetectiveGame.isRunning = true;
    initDetectiveGame();

    setTimeout(resizeDetectiveCanvas, 50);
    setTimeout(resizeDetectiveCanvas, 150);
    setTimeout(resizeDetectiveCanvas, 300);
  };

  window.closeDetectiveAndReturnToMap = function() {
    DetectiveGame.isRunning = false;
    if (DetectiveGame.animId) cancelAnimationFrame(DetectiveGame.animId);
    if (DetectiveGame.voiceTimeout) clearTimeout(DetectiveGame.voiceTimeout);
    if (DetectiveGame.speechWatchdog) clearTimeout(DetectiveGame.speechWatchdog);
    DetectiveGame.voiceTimeout = null;
    DetectiveGame.speechWatchdog = null;
    DetectiveGame.isSpeaking = false;
    DetectiveGame.isAdvancing = false;
    if (typeof stopAllAudio === 'function') stopAllAudio();

    if (typeof switchScreen === 'function') {
      switchScreen('map');
    }
  };

  window.stopDetectiveGame = function() {
    DetectiveGame.isRunning = false;
    if (DetectiveGame.animId) cancelAnimationFrame(DetectiveGame.animId);
    if (DetectiveGame.voiceTimeout) clearTimeout(DetectiveGame.voiceTimeout);
    if (DetectiveGame.speechWatchdog) clearTimeout(DetectiveGame.speechWatchdog);
    DetectiveGame.voiceTimeout = null;
    DetectiveGame.speechWatchdog = null;
    DetectiveGame.isSpeaking = false;
    DetectiveGame.isAdvancing = false;
    if (typeof stopAllAudio === 'function') stopAllAudio();
  };

  // --- INICIALIZACIÓN ---
  function initDetectiveGame() {
    DetectiveGame.canvas = document.getElementById('detective-game-canvas');
    if (!DetectiveGame.canvas) return;
    DetectiveGame.ctx = DetectiveGame.canvas.getContext('2d');

    DetectiveGame.cases = MINIMAL_PAIR_CASES.slice();
    // Barajar casos
    DetectiveGame.cases.sort(() => Math.random() - 0.5);

    setupDetectiveEventListeners();
    resizeDetectiveCanvas();

    DetectiveGame.currentCaseIndex = 0;
    setupCase(0);

    if (DetectiveGame.animId) cancelAnimationFrame(DetectiveGame.animId);
    DetectiveGame.animId = requestAnimationFrame(detectiveGameLoop);
  }

  function resizeDetectiveCanvas() {
    if (!DetectiveGame.canvas) return;
    const container = DetectiveGame.canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const w = Math.max(320, Math.floor(rect.width) || window.innerWidth || 800);
    const h = Math.max(360, Math.floor(rect.height) || (window.innerHeight - 170) || 520);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    DetectiveGame.canvas.width = w * dpr;
    DetectiveGame.canvas.height = h * dpr;
    DetectiveGame.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    DetectiveGame.width = w;
    DetectiveGame.height = h;

    repositionDetectiveCards();
  }

  function setupCase(index) {
    if (DetectiveGame.cases.length === 0) return;
    const c = DetectiveGame.cases[index % DetectiveGame.cases.length];
    DetectiveGame.currentCase = c;
    DetectiveGame.isAdvancing = false;
    DetectiveGame.selectedCard = null;
    DetectiveGame.sparkles = [];
    DetectiveGame.floatingTexts = [];
    DetectiveGame.magnifier.flashAlpha = 0;

    const targetObj = (c.target === 'A') ? c.optionA : c.optionB;
    const otherObj = (c.target === 'A') ? c.optionB : c.optionA;

    DetectiveGame.cards = [
      {
        id: 'A',
        word: c.optionA.word,
        image: c.optionA.image,
        pron: c.optionA.pron,
        isTarget: (c.target === 'A'),
        x: 0,
        y: 0,
        width: 150,
        height: 190,
        scale: 1.0,
        shakeOffset: 0
      },
      {
        id: 'B',
        word: c.optionB.word,
        image: c.optionB.image,
        pron: c.optionB.pron,
        isTarget: (c.target === 'B'),
        x: 0,
        y: 0,
        width: 150,
        height: 190,
        scale: 1.0,
        shakeOffset: 0
      }
    ];

    repositionDetectiveCards();
    updateDetectiveHUD();

    if (DetectiveGame.voiceTimeout) clearTimeout(DetectiveGame.voiceTimeout);
    DetectiveGame.voiceTimeout = setTimeout(() => {
      speakCurrentDetectiveClue();
    }, 450);
  }

  function repositionDetectiveCards() {
    const w = DetectiveGame.width;
    const h = DetectiveGame.height;
    if (DetectiveGame.cards.length < 2) return;

    const cardW = Math.min(160, Math.floor(w * 0.38));
    const cardH = Math.min(210, Math.floor(h * 0.48));
    const centerY = h * 0.54;

    DetectiveGame.cards[0].width = cardW;
    DetectiveGame.cards[0].height = cardH;
    DetectiveGame.cards[0].x = w * 0.31 - cardW / 2;
    DetectiveGame.cards[0].y = centerY - cardH / 2;

    DetectiveGame.cards[1].width = cardW;
    DetectiveGame.cards[1].height = cardH;
    DetectiveGame.cards[1].x = w * 0.69 - cardW / 2;
    DetectiveGame.cards[1].y = centerY - cardH / 2;

    DetectiveGame.magnifier.x = w * 0.5;
    DetectiveGame.magnifier.y = h * 0.22;
    DetectiveGame.magnifier.targetX = w * 0.5;
    DetectiveGame.magnifier.targetY = h * 0.22;
  }

  // --- LOCUCIÓN PROSÓDICA CON ÉNFASIS DISCRIMINATIVO ---
  window.speakCurrentDetectiveClue = function() {
    if (!DetectiveGame.isRunning || !DetectiveGame.currentCase) return;
    const c = DetectiveGame.currentCase;
    const targetObj = (c.target === 'A') ? c.optionA : c.optionB;

    const text = `Encuentra la palabra ${targetObj.pron}.`;

    if (typeof speakText === 'function') {
      DetectiveGame.isSpeaking = true;
      if (DetectiveGame.speechWatchdog) clearTimeout(DetectiveGame.speechWatchdog);
      speakText(text, () => {
        if (DetectiveGame.speechWatchdog) clearTimeout(DetectiveGame.speechWatchdog);
        DetectiveGame.isSpeaking = false;
      });
      DetectiveGame.speechWatchdog = setTimeout(() => {
        DetectiveGame.isSpeaking = false;
      }, 4000);
    } else {
      DetectiveGame.isSpeaking = false;
    }
  };

  function updateDetectiveHUD() {
    const c = DetectiveGame.currentCase;
    if (!c) return;

    const titleEl = document.getElementById('detective-case-title');
    if (titleEl) titleEl.innerText = `Caso ${DetectiveGame.currentCaseIndex + 1} de ${DetectiveGame.cases.length}`;

    const contrastEl = document.getElementById('detective-contrast-badge');
    if (contrastEl) contrastEl.innerText = c.contrastDescription;
  }

  // --- BUCLE PRINCIPAL DE JUEGO ---
  function detectiveGameLoop() {
    if (!DetectiveGame.isRunning) return;
    DetectiveGame.time += 0.02;

    updateDetectivePhysics();
    renderDetectiveGraphics();

    DetectiveGame.animId = requestAnimationFrame(detectiveGameLoop);
  }

  function updateDetectivePhysics() {
    const mag = DetectiveGame.magnifier;

    // Movimiento fluido de la lupa hacia la carta inspeccionada
    mag.x += (mag.targetX - mag.x) * 0.12;
    mag.y += (mag.targetY - mag.y) * 0.12;

    if (mag.flashAlpha > 0) {
      mag.flashAlpha -= 0.03;
    }

    // Efecto de sacudida en carta con error
    DetectiveGame.cards.forEach(card => {
      if (card.shakeOffset > 0) {
        card.shakeOffset -= 0.8;
      }
    });

    // Partículas y destellos
    for (let i = DetectiveGame.sparkles.length - 1; i >= 0; i--) {
      const s = DetectiveGame.sparkles[i];
      s.x += s.vx;
      s.y += s.vy;
      s.alpha -= 0.025;
      if (s.alpha <= 0) {
        DetectiveGame.sparkles.splice(i, 1);
      }
    }

    // Textos flotantes
    for (let i = DetectiveGame.floatingTexts.length - 1; i >= 0; i--) {
      const ft = DetectiveGame.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      if (ft.alpha <= 0) {
        DetectiveGame.floatingTexts.splice(i, 1);
      }
    }
  }

  // --- RENDERIZADO DEL ESCENARIO DE DETECTIVE ---
  function renderDetectiveGraphics() {
    const ctx = DetectiveGame.ctx;
    const w = DetectiveGame.width;
    const h = DetectiveGame.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Fondo de oficina misteriosa con degradado de medianoche / caoba
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#1E1B4B'); // Índigo noche profundo
    bg.addColorStop(0.5, '#312E81');
    bg.addColorStop(1, '#0F172A');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Haz de luz de detective cenital (foco de teatro)
    const spotlight = ctx.createRadialGradient(w * 0.5, 40, 20, w * 0.5, h * 0.5, w * 0.6);
    spotlight.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
    spotlight.addColorStop(0.6, 'rgba(254, 240, 138, 0.06)');
    spotlight.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spotlight;
    ctx.fillRect(0, 0, w, h);

    // 2. Cartel superior de la pista
    drawTopClueBoard(ctx, w, h);

    // 3. Cartas de sospechosos (par mínimo)
    DetectiveGame.cards.forEach(card => {
      drawSuspectCard(ctx, card);
    });

    // 4. Mascota detective en la esquina
    drawDetectiveHero(ctx, w * 0.1, h * 0.85);

    // 5. Lupa mágica del detective
    drawMagnifyingGlass(ctx);

    // 6. Destellos y textos flotantes
    drawSparkles(ctx);
    drawFloatingTexts(ctx);
  }

  function drawTopClueBoard(ctx, w, h) {
    ctx.save();
    const bx = w * 0.5;
    const by = 48;
    const bw = Math.min(480, w * 0.88);
    const bh = 54;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(bx - bw / 2, by - bh / 2, bw, bh, 16);
    ctx.fill();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Icono de bocina / pista
    ctx.font = '22px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔍 🔊', bx - bw / 2 + 35, by);

    ctx.fillStyle = '#FEF08A';
    ctx.font = '900 16px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('¡TOCA LA CARTA QUE ESCUCHASTE!', bx + 15, by - 6);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '700 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('Presiona la bocina superior si necesitas escucharla otra vez', bx + 15, by + 13);

    ctx.restore();
  }

  function drawSuspectCard(ctx, card) {
    ctx.save();
    const cx = card.x + card.width / 2 + (Math.sin(DetectiveGame.time * 20) * card.shakeOffset);
    const cy = card.y + card.height / 2;
    const cw = card.width;
    const ch = card.height;

    ctx.translate(cx, cy);

    // Sombra de carta
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.roundRect(-cw / 2 + 4, -ch / 2 + 6, cw, ch, 18);
    ctx.fill();

    // Fondo de la carta
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 18);
    ctx.fill();

    // Borde brillante
    const isChosenTarget = (DetectiveGame.selectedCard === card && card.isTarget);
    ctx.lineWidth = isChosenTarget ? 4.5 : 3;
    ctx.strokeStyle = isChosenTarget ? '#10B981' : '#CBD5E1';
    ctx.stroke();

    // Imagen real de la palabra
    const img = getCachedImage(card.image);
    const imgSize = Math.min(cw * 0.65, ch * 0.5);
    const imgY = -ch * 0.16;

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, -imgSize / 2, imgY - imgSize / 2, imgSize, imgSize);
    } else {
      ctx.fillStyle = '#F1F5F9';
      ctx.beginPath();
      ctx.arc(0, imgY, imgSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Recuadro para la palabra
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.roundRect(-cw * 0.44, ch * 0.22, cw * 0.88, ch * 0.22, 10);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Palabra en letras grandes y legibles
    ctx.fillStyle = '#0F172A';
    ctx.font = '900 20px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(card.word, 0, ch * 0.33);

    ctx.restore();
  }

  function drawDetectiveHero(ctx, x, y) {
    ctx.save();
    const petCard = getCachedImage(getActivePetCardSrc());
    const size = 68;

    if (petCard && petCard.complete && petCard.naturalWidth > 0) {
      ctx.drawImage(petCard, x - size / 2, y - size / 2, size, size);
    }

    // Placa de detective dorada
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(x + 18, y + 18, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 11px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', x + 18, y + 18);

    ctx.restore();
  }

  function drawMagnifyingGlass(ctx) {
    const mag = DetectiveGame.magnifier;
    ctx.save();
    ctx.translate(mag.x, mag.y);

    // Destello de investigación fotográfica
    if (mag.flashAlpha > 0) {
      ctx.fillStyle = `rgba(254, 240, 138, ${mag.flashAlpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, mag.radius * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mango de la lupa
    ctx.save();
    ctx.rotate(mag.angle);
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.roundRect(mag.radius - 4, -5, 52, 10, 4);
    ctx.fill();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Aro dorado de la lente
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, mag.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Reflejo de cristal de la lente
    const lensGrad = ctx.createLinearGradient(-mag.radius, -mag.radius, mag.radius, mag.radius);
    lensGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    lensGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
    lensGrad.addColorStop(1, 'rgba(186, 230, 253, 0.25)');
    ctx.fillStyle = lensGrad;
    ctx.beginPath();
    ctx.arc(0, 0, mag.radius - 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawSparkles(ctx) {
    ctx.save();
    DetectiveGame.sparkles.forEach(s => {
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
    DetectiveGame.floatingTexts.forEach(ft => {
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

  // --- INTERACCIÓN Y EVENTOS TÁCTILES ---
  function setupDetectiveEventListeners() {
    if (DetectiveGame.listenersAttached) return;
    const canvas = DetectiveGame.canvas;
    if (!canvas) return;
    DetectiveGame.listenersAttached = true;

    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
      const clientX = touch ? touch.clientX : e.clientX;
      const clientY = touch ? touch.clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (DetectiveGame.width / rect.width),
        y: (clientY - rect.top) * (DetectiveGame.height / rect.height)
      };
    }

    function onPointerDown(e) {
      if (!DetectiveGame.isRunning || DetectiveGame.isAdvancing) return;
      const pos = getCoords(e);
      if (!pos) return;

      // Detectar toque en alguna de las dos cartas
      DetectiveGame.cards.forEach(card => {
        if (pos.x >= card.x && pos.x <= card.x + card.width &&
            pos.y >= card.y && pos.y <= card.y + card.height) {
          handleCardSelected(card);
        }
      });
    }

    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('touchstart', onPointerDown, { passive: true });
  }

  // --- LÓGICA DE DECISIÓN DEL DETECTIVE ---
  function handleCardSelected(card) {
    if (!DetectiveGame.isRunning || DetectiveGame.isAdvancing) return;
    DetectiveGame.isSpeaking = false;
    if (DetectiveGame.speechWatchdog) clearTimeout(DetectiveGame.speechWatchdog);

    // Dirigir la lupa hacia la carta seleccionada
    DetectiveGame.magnifier.targetX = card.x + card.width / 2;
    DetectiveGame.magnifier.targetY = card.y + card.height / 2;

    if (card.isTarget) {
      // ¡CASO RESUELTO!
      DetectiveGame.isAdvancing = true;
      DetectiveGame.selectedCard = card;
      DetectiveGame.magnifier.flashAlpha = 0.9;

      playCameraFlashSound();
      createSparkles(card.x + card.width / 2, card.y + card.height / 2, 40);
      createFloatingText(card.x + card.width / 2, card.y - 20, `¡CORRECTO: ${card.word}! 🔍✨`, '#10B981');

      if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
        activeChildProfile.coins = (activeChildProfile.coins || 0) + 12;
        activeChildProfile.stars = (activeChildProfile.stars || 0) + 2;
        if (typeof saveActiveChildProfile === 'function') saveActiveChildProfile();
      }

      const onCaseDone = () => {
        setTimeout(() => {
          if (!DetectiveGame.isRunning) return;
          DetectiveGame.currentCaseIndex++;
          if (DetectiveGame.currentCaseIndex >= DetectiveGame.cases.length) {
            showDetectiveVictoryModal();
          } else {
            setupCase(DetectiveGame.currentCaseIndex);
          }
        }, 700);
      };

      if (typeof speakText === 'function') {
        DetectiveGame.isSpeaking = true;
        speakText('¡Súper, tarea lograda!', () => {
          DetectiveGame.isSpeaking = false;
          onCaseDone();
        });
        setTimeout(() => {
          DetectiveGame.isSpeaking = false;
          onCaseDone();
        }, 3500);
      } else {
        onCaseDone();
      }

    } else {
      // ERROR AMIGABLE: solo sonido y sacudida, SIN relato
      card.shakeOffset = 10;
      playSoftBoing();
      createFloatingText(card.x + card.width / 2, card.y - 20, `Esa es ${card.word}`, '#F43F5E');
      DetectiveGame.isSpeaking = false;
    }
  }

  function showDetectiveVictoryModal() {
    const modal = document.getElementById('detective-victory-modal');
    if (modal) {
      modal.style.display = 'flex';
    } else {
      alert('¡Misión de Detective Cumplida! ¡Resolviste todos los casos sonoros!');
      window.closeDetectiveAndReturnToMap();
    }
  }

  window.closeDetectiveVictoryModal = function() {
    const modal = document.getElementById('detective-victory-modal');
    if (modal) modal.style.display = 'none';
    window.closeDetectiveAndReturnToMap();
  };

  window.replayDetectiveQuest = function() {
    const modal = document.getElementById('detective-victory-modal');
    if (modal) modal.style.display = 'none';
    DetectiveGame.currentCaseIndex = 0;
    setupCase(0);
  };

  // --- EFECTOS VISUALES ---
  function createSparkles(x, y, count) {
    const colors = ['#F59E0B', '#10B981', '#60A5FA', '#FCD34D'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 5.0;
      DetectiveGame.sparkles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 4,
        alpha: 1.0,
        color: colors[i % colors.length]
      });
    }
  }

  function createFloatingText(x, y, text, color) {
    DetectiveGame.floatingTexts.push({
      x: x,
      y: y,
      vy: -1.2,
      text: text,
      color: color || '#FFFFFF',
      alpha: 1.0
    });
  }

  // --- SÍNTESIS DE SONIDOS (WEB AUDIO) ---
  function playCameraFlashSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, actx.currentTime);
      osc.frequency.linearRampToValueAtTime(1200, actx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.25, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.25);
    } catch(e) {}
  }

  function playSoftBoing() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, actx.currentTime);
      osc.frequency.linearRampToValueAtTime(140, actx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.2, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.18);
    } catch(e) {}
  }

})();
