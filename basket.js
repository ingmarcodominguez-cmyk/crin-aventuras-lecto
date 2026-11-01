// =========================================================================
// CRIN AVENTURAS DE LECTOESCRITURA - LA CANASTA DE LOS SECRETOS
// Módulo de Categorización Semántica y Detección del Intruso (Simple View of Reading)
// =========================================================================

(function() {
  'use strict';

  const BasketGame = {
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

    cards: [],
    selectedCard: null,
    isAdvancing: false,
    isSpeaking: false,
    voiceTimeout: null,
    speechWatchdog: null,

    floatingTexts: []
  };

  window.BasketGame = BasketGame;

  // BANCO CANÓNICO DE CATEGORIZACIÓN SEMÁNTICA E INTRUSOS
  const BASKET_CASES = [
    {
      id: 'frutas_zapato',
      categoryName: 'FRUTAS',
      categoryDescription: 'Cosas ricas y saludables que comemos',
      promptText: '¡Encuentra el intruso! Tres son frutas... ¿cuál NO es una fruta?!',
      items: [
        { word: 'MANZANA', image: 'assets/manzana.png', pron: 'manzana', isIntruder: false },
        { word: 'BANANA', image: 'assets/banana.png', pron: 'banana', isIntruder: false },
        { word: 'PERA', image: 'assets/pera.png', pron: 'pera', isIntruder: false },
        { word: 'ZAPATO', image: 'assets/zapato.png', pron: 'zapato', isIntruder: true }
      ]
    },
    {
      id: 'animales_mesa',
      categoryName: 'ANIMALES',
      categoryDescription: 'Seres vivos de la naturaleza',
      promptText: '¡Encuentra el intruso! Tres son animales... ¿cuál NO es un animal?!',
      items: [
        { word: 'PERRO', image: 'assets/perro.png', pron: 'perro', isIntruder: false },
        { word: 'GATO', image: 'assets/gato.png', pron: 'gato', isIntruder: false },
        { word: 'LEÓN', image: 'assets/leon.png', pron: 'león', isIntruder: false },
        { word: 'MESA', image: 'assets/mesa.png', pron: 'mesa', isIntruder: true }
      ]
    },
    {
      id: 'ropa_manzana',
      categoryName: 'ROPA Y VESTIMENTA',
      categoryDescription: 'Cosas que nos ponemos para vestir',
      promptText: '¡Encuentra el intruso! Tres son prendas de vestir... ¿cuál NO es ropa?!',
      items: [
        { word: 'BOTA', image: 'assets/bota.png', pron: 'bota', isIntruder: false },
        { word: 'GORRO', image: 'assets/gorro.png', pron: 'gorro', isIntruder: false },
        { word: 'PANTALÓN', image: 'assets/pantalon.png', pron: 'pantalón', isIntruder: false },
        { word: 'MANZANA', image: 'assets/manzana.png', pron: 'manzana', isIntruder: true }
      ]
    },
    {
      id: 'muebles_pato',
      categoryName: 'MUEBLES Y CASA',
      categoryDescription: 'Objetos que tenemos adentro del hogar',
      promptText: '¡Encuentra el intruso! Tres son cosas de la casa... ¿cuál NO pertenece?!',
      items: [
        { word: 'CAMA', image: 'assets/cama.png', pron: 'cama', isIntruder: false },
        { word: 'CUNA', image: 'assets/cuna.png', pron: 'cuna', isIntruder: false },
        { word: 'MESA', image: 'assets/mesa.png', pron: 'mesa', isIntruder: false },
        { word: 'PATO', image: 'assets/pato.png', pron: 'pato', isIntruder: true }
      ]
    },
    {
      id: 'herramientas_flor',
      categoryName: 'HERRAMIENTAS Y UTENSILIOS',
      categoryDescription: 'Objetos para trabajar o comer',
      promptText: '¡Encuentra el intruso! Tres son herramientas y cubiertos... ¿cuál NO es?!',
      items: [
        { word: 'TENEDOR', image: 'assets/tenedor.png', pron: 'tenedor', isIntruder: false },
        { word: 'CUCHILLO', image: 'assets/cuchillo.png', pron: 'cuchillo', isIntruder: false },
        { word: 'TIJERA', image: 'assets/tijera.png', pron: 'tijera', isIntruder: false },
        { word: 'FLOR', image: 'assets/flor.png', pron: 'flor', isIntruder: true }
      ]
    },
    {
      id: 'animales_luna',
      categoryName: 'ANIMALES',
      categoryDescription: 'Criaturas que caminan y nadan',
      promptText: '¡Encuentra el intruso! Tres son animales... ¿cuál NO es un animal?!',
      items: [
        { word: 'FOCA', image: 'assets/foca.png', pron: 'foca', isIntruder: false },
        { word: 'MONO', image: 'assets/mono.png', pron: 'mono', isIntruder: false },
        { word: 'PATO', image: 'assets/pato.png', pron: 'pato', isIntruder: false },
        { word: 'LUNA', image: 'assets/luna.png', pron: 'luna', isIntruder: true }
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
  window.openBasketScreen = function() {
    if (typeof stopAllAudio === 'function') stopAllAudio();
    if (typeof switchScreen === 'function') switchScreen('basket');

    const screen = document.getElementById('screen-basket');
    if (screen) screen.classList.add('active');

    BasketGame.isRunning = true;
    initBasketGame();

    setTimeout(resizeBasketCanvas, 50);
    setTimeout(resizeBasketCanvas, 150);
    setTimeout(resizeBasketCanvas, 300);
  };

  window.closeBasketAndReturnToMap = function() {
    BasketGame.isRunning = false;
    if (BasketGame.animId) cancelAnimationFrame(BasketGame.animId);
    if (BasketGame.voiceTimeout) clearTimeout(BasketGame.voiceTimeout);
    if (BasketGame.speechWatchdog) clearTimeout(BasketGame.speechWatchdog);
    BasketGame.isSpeaking = false;
    BasketGame.isAdvancing = false;
    if (typeof stopAllAudio === 'function') stopAllAudio();

    if (typeof switchScreen === 'function') switchScreen('map');
  };

  // --- INICIALIZACIÓN ---
  function initBasketGame() {
    BasketGame.canvas = document.getElementById('basket-canvas');
    if (!BasketGame.canvas) return;
    BasketGame.ctx = BasketGame.canvas.getContext('2d');

    const shuffled = BASKET_CASES.slice().sort(() => Math.random() - 0.5);
    BasketGame.cases = shuffled.slice(0, 5);
    BasketGame.currentCaseIndex = 0;

    setupBasketEventListeners();
    resizeBasketCanvas();
    setupBasketCase(0);

    if (BasketGame.animId) cancelAnimationFrame(BasketGame.animId);
    BasketGame.animId = requestAnimationFrame(basketLoop);
  }

  function resizeBasketCanvas() {
    if (!BasketGame.canvas) return;
    const container = BasketGame.canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const w = Math.max(320, Math.floor(rect.width) || window.innerWidth || 800);
    const h = Math.max(360, Math.floor(rect.height) || (window.innerHeight - 170) || 520);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    BasketGame.canvas.width = w * dpr;
    BasketGame.canvas.height = h * dpr;
    BasketGame.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    BasketGame.width = w;
    BasketGame.height = h;

    repositionBasketCards();
  }

  function setupBasketCase(index) {
    if (!BasketGame.isRunning || BasketGame.cases.length === 0) return;
    const c = BasketGame.cases[index % BasketGame.cases.length];
    BasketGame.currentCase = c;
    BasketGame.isAdvancing = false;
    BasketGame.selectedCard = null;
    BasketGame.floatingTexts = [];

    // Barajar los 4 elementos (3 categoría + 1 intruso)
    const shuffledItems = c.items.slice().sort(() => Math.random() - 0.5);

    BasketGame.cards = shuffledItems.map((item, i) => ({
      id: i,
      word: item.word,
      image: item.image,
      pron: item.pron,
      isIntruder: item.isIntruder,
      x: 0,
      y: 0,
      w: 130,
      h: 160,
      scale: 1.0,
      shake: 0
    }));

    repositionBasketCards();
    updateBasketHUD();

    if (BasketGame.voiceTimeout) clearTimeout(BasketGame.voiceTimeout);
    BasketGame.voiceTimeout = setTimeout(() => {
      speakBasketPrompt();
    }, 350);
  }

  function repositionBasketCards() {
    const w = BasketGame.width;
    const h = BasketGame.height;
    const cards = BasketGame.cards;
    if (!cards || cards.length === 0) return;

    const count = cards.length;
    const cardW = Math.min(135, Math.floor(w * 0.22));
    const cardH = Math.min(165, Math.floor(h * 0.36));
    const startX = w * 0.5 - ((count * cardW + (count - 1) * 14) / 2);
    const posY = h * 0.55;

    cards.forEach((c, i) => {
      c.w = cardW;
      c.h = cardH;
      c.x = startX + i * (cardW + 14);
      c.y = posY;
    });
  }

  function updateBasketHUD() {
    const c = BasketGame.currentCase;
    if (!c) return;

    const titleEl = document.getElementById('basket-case-title');
    if (titleEl) titleEl.innerText = `Picnic Semántico ${BasketGame.currentCaseIndex + 1} de ${BasketGame.cases.length}`;

    const catEl = document.getElementById('basket-category-badge');
    if (catEl) catEl.innerText = `Categoría: ${c.categoryName}`;
  }

  function speakBasketPrompt() {
    if (!BasketGame.isRunning || !BasketGame.currentCase) return;
    const c = BasketGame.currentCase;

    if (typeof speakText === 'function') {
      BasketGame.isSpeaking = true;
      if (BasketGame.speechWatchdog) clearTimeout(BasketGame.speechWatchdog);
      speakText(c.promptText, () => {
        if (BasketGame.speechWatchdog) clearTimeout(BasketGame.speechWatchdog);
        BasketGame.isSpeaking = false;
      });
      BasketGame.speechWatchdog = setTimeout(() => {
        BasketGame.isSpeaking = false;
      }, 5000);
    }
  }

  // --- DIBUJADO DE LA ESCENA CAMPESINA Y CANASTA ---
  function basketLoop() {
    if (!BasketGame.isRunning) return;
    BasketGame.time += 0.02;

    renderBasketScene();
    BasketGame.animId = requestAnimationFrame(basketLoop);
  }

  function renderBasketScene() {
    const ctx = BasketGame.ctx;
    const w = BasketGame.width;
    const h = BasketGame.height;
    const c = BasketGame.currentCase;

    ctx.clearRect(0, 0, w, h);

    // 1. Cielo campestre matutino
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
    skyGrad.addColorStop(0, '#BAE6FD');
    skyGrad.addColorStop(1, '#E0F2FE');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.5);

    // Colinas verdes
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(w * 0.25, h * 0.75, w * 0.45, Math.PI, 0, false);
    ctx.fill();

    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.arc(w * 0.8, h * 0.78, w * 0.5, Math.PI, 0, false);
    ctx.fill();

    // 2. Mantel de picnic a cuadros rojos y blancos
    const matW = Math.min(680, w * 0.92);
    const matH = h * 0.52;
    const matX = w * 0.5 - matW / 2;
    const matY = h * 0.48;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#FFF1F2';
    roundRect(ctx, matX, matY, matW, matH, 20);
    ctx.fill();
    ctx.strokeStyle = '#FECDD3';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // 3. Gran canasta de mimbre en la parte superior
    const basketX = w * 0.5;
    const basketY = h * 0.24;

    ctx.font = '54px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧺', basketX, basketY);

    if (c) {
      // Banner de la categoría
      ctx.font = '900 17px "Comic Neue", "Nunito", sans-serif';
      ctx.fillStyle = '#047857';
      ctx.fillText(`Todos pertenecen a: ${c.categoryName}`, basketX, basketY + 45);

      ctx.font = '700 12px sans-serif';
      ctx.fillStyle = '#D97706';
      ctx.fillText(`¡Toca el INTRUSO que no va en esta canasta!`, basketX, basketY + 68);
    }

    // 4. Dibujar las 4 cartas de objetos sobre el mantel
    BasketGame.cards.forEach(card => {
      ctx.save();
      ctx.translate(card.x + card.w / 2 + (card.shake ? Math.sin(BasketGame.time * 30) * card.shake : 0), card.y + card.h / 2);
      ctx.scale(card.scale, card.scale);

      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, -card.w / 2, -card.h / 2, card.w, card.h, 16);
      ctx.fill();
      ctx.strokeStyle = (card === BasketGame.selectedCard) ? '#10B981' : '#E2E8F0';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      const img = getCachedImg(card.image);
      if (img && img.complete && img.naturalWidth > 0) {
        const ih = card.h * 0.55;
        const iw = (img.naturalWidth / img.naturalHeight) * ih;
        ctx.drawImage(img, -iw / 2, -card.h / 2 + 10, iw, ih);
      }

      ctx.font = '900 15px "Comic Neue", "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1E293B';
      ctx.fillText(card.word, 0, card.h / 2 - 16);

      ctx.restore();
    });

    // 5. Textos flotantes
    updateAndDrawBasketEffects(ctx);
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

  function updateAndDrawBasketEffects(ctx) {
    for (let i = BasketGame.floatingTexts.length - 1; i >= 0; i--) {
      const ft = BasketGame.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      if (ft.alpha <= 0) {
        BasketGame.floatingTexts.splice(i, 1);
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

  // --- SELECCIÓN Y CONTROLES ---
  function setupBasketEventListeners() {
    const canvas = BasketGame.canvas;
    if (!canvas) return;

    function getCoords(e) {
      const r = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - r.left) * (BasketGame.width / r.width),
        y: (clientY - r.top) * (BasketGame.height / r.height)
      };
    }

    function onPointerDown(e) {
      if (BasketGame.isAdvancing) return;
      const pos = getCoords(e);

      BasketGame.cards.forEach(card => {
        if (pos.x >= card.x && pos.x <= card.x + card.w &&
            pos.y >= card.y && pos.y <= card.y + card.h) {
          handleBasketCardClick(card);
        }
      });
    }

    canvas.onmousedown = onPointerDown;
    canvas.ontouchstart = function(e) {
      e.preventDefault();
      onPointerDown(e);
    };
  }

  function handleBasketCardClick(card) {
    if (BasketGame.isAdvancing) return;

    if (card.isIntruder) {
      // ✅ ACIERTO: Descubrió el intruso
      BasketGame.isAdvancing = true;
      BasketGame.selectedCard = card;
      card.scale = 1.15;

      playSuccessChime();

      const c = BasketGame.currentCase;
      BasketGame.floatingTexts.push({
        x: card.x + card.w / 2,
        y: card.y - 25,
        text: `¡CORRECTO! ${card.word} no es ${c.categoryName} ✨`,
        color: '#10B981',
        alpha: 1.0,
        vy: -1.2
      });

      if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
        activeChildProfile.coins = (activeChildProfile.coins || 0) + 10;
        if (typeof saveActiveChildProfile === 'function') saveActiveChildProfile();
      }

      let advanced = false;
      const proceedToNextCase = () => {
        if (advanced) return;
        advanced = true;
        if (!BasketGame.isRunning) return;
        BasketGame.isSpeaking = false;
        BasketGame.isAdvancing = false;
        BasketGame.currentCaseIndex++;
        if (BasketGame.currentCaseIndex >= BasketGame.cases.length) {
          showBasketVictoryModal();
        } else {
          setupBasketCase(BasketGame.currentCaseIndex);
        }
      };

      // 🔒 REGLA UNIVERSAL: Esperar a que la locución termine completamente antes de avanzar
      if (typeof speakText === 'function') {
        BasketGame.isSpeaking = true;
        speakText(`¡Súper, tarea lograda! ¡${card.pron} es el intruso!`, () => {
          setTimeout(proceedToNextCase, 500);
        });
        setTimeout(proceedToNextCase, 6500);
      } else {
        setTimeout(proceedToNextCase, 1400);
      }

    } else {
      // ❌ NO ES EL INTRUSO
      card.shake = 8;
      playErrorTone();

      const c = BasketGame.currentCase;
      BasketGame.floatingTexts.push({
        x: card.x + card.w / 2,
        y: card.y - 25,
        text: `¡${card.word} sí pertenece al grupo!`,
        color: '#F59E0B',
        alpha: 1.0,
        vy: -1.2
      });

      setTimeout(() => { card.shake = 0; }, 400);

      if (typeof speakText === 'function') {
        speakText(`${card.pron} sí es parte de ${c.categoryName}. Busca la que no pertenece.`);
      }
    }
  }

  function showBasketVictoryModal() {
    const modal = document.getElementById('basket-victory-modal');
    if (modal) modal.style.display = 'flex';
  }

  window.replayBasketQuest = function() {
    const modal = document.getElementById('basket-victory-modal');
    if (modal) modal.style.display = 'none';
    initBasketGame();
  };

  window.closeBasketVictoryModal = function() {
    const modal = document.getElementById('basket-victory-modal');
    if (modal) modal.style.display = 'none';
    window.closeBasketAndReturnToMap();
  };

  function playSuccessChime() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ac.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ac.currentTime + 0.25); // G5
      gain.gain.setValueAtTime(0.3, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.35);
      osc.start();
      osc.stop(ac.currentTime + 0.35);
    } catch(e) {}
  }

  function playErrorTone() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ac.currentTime);
      gain.gain.setValueAtTime(0.2, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.25);
      osc.start();
      osc.stop(ac.currentTime + 0.25);
    } catch(e) {}
  }

})();
