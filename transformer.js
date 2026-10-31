// =========================================================================
// CRIN AVENTURAS DE LECTOESCRITURA - LA MÁQUINA DE TRANSFORMAR PALABRAS
// Módulo de Manipulación y Elisión Fonémica Avanzada (Science of Reading / Kilpatrick)
// =========================================================================

(function() {
  'use strict';

  const TransformerGame = {
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

    // Efectos visuales de engranajes y alquimia
    gearsAngle: 0,
    steamParticles: [],
    floatingTexts: []
  };

  window.TransformerGame = TransformerGame;

  // BANCO CANÓNICO DE CASOS DE MANIPULACIÓN Y ELISIÓN FONÉMICA
  const TRANSFORMER_CASES = [
    {
      id: 'plato_pato',
      type: 'elision',
      base: { word: 'PLATO', image: 'assets/plato.png', pron: 'plato' },
      removedSound: '/L/',
      promptText: '¡Si a PLATO le quitamos la letra L... ¿qué palabra nos queda?!',
      target: { word: 'PATO', image: 'assets/pato.png', pron: 'pato' },
      distractors: [
        { word: 'GATO', image: 'assets/gato.png', pron: 'gato' },
        { word: 'LATA', image: 'assets/lata.png', pron: 'lata' }
      ]
    },
    {
      id: 'copa_sopa',
      type: 'substitution',
      base: { word: 'COPA', image: 'assets/copa.png', pron: 'copa' },
      changeDesc: 'Cambiamos /C/ por /S/',
      promptText: '¡Si a COPA le cambiamos la primera letra por la S... ¿qué palabra se forma?!',
      target: { word: 'SOPA', image: 'assets/sopa.png', pron: 'sopa' },
      distractors: [
        { word: 'BOTA', image: 'assets/bota.png', pron: 'bota' },
        { word: 'ROPA', image: 'assets/lavarropa.png', pron: 'ropa' }
      ]
    },
    {
      id: 'cuna_luna',
      type: 'substitution',
      base: { word: 'CUNA', image: 'assets/cuna.png', pron: 'cuna' },
      changeDesc: 'Cambiamos /C/ por /L/',
      promptText: '¡Si a CUNA le cambiamos la primera letra por la L... ¿qué palabra mágica nace?!',
      target: { word: 'LUNA', image: 'assets/luna.png', pron: 'luna' },
      distractors: [
        { word: 'LANA', image: 'assets/lana.png', pron: 'lana' },
        { word: 'CASA', image: 'assets/casa.png', pron: 'casa' }
      ]
    },
    {
      id: 'boca_foca',
      type: 'substitution',
      base: { word: 'BOCA', image: 'assets/boca.png', pron: 'boca' },
      changeDesc: 'Cambiamos /B/ por /F/',
      promptText: '¡Si a BOCA le cambiamos la B por la F... ¿qué animal aparece?!',
      target: { word: 'FOCA', image: 'assets/foca.png', pron: 'foca' },
      distractors: [
        { word: 'BOTA', image: 'assets/bota.png', pron: 'bota' },
        { word: 'FOTO', image: 'assets/foto.png', pron: 'foto' }
      ]
    },
    {
      id: 'dado_dedo',
      type: 'vowel_change',
      base: { word: 'DADO', image: 'assets/dado.png', pron: 'dado' },
      changeDesc: 'Cambiamos la vocal A por E',
      promptText: '¡Si a DADO le cambiamos la vocal A por la E... ¿qué parte del cuerpo es?!',
      target: { word: 'DEDO', image: 'assets/dedo.png', pron: 'dedo' },
      distractors: [
        { word: 'MANO', image: 'assets/mano.png', pron: 'mano' },
        { word: 'PATO', image: 'assets/pato.png', pron: 'pato' }
      ]
    },
    {
      id: 'mano_mono',
      type: 'vowel_change',
      base: { word: 'MANO', image: 'assets/mano.png', pron: 'mano' },
      changeDesc: 'Cambiamos la vocal A por O',
      promptText: '¡Si a MANO le cambiamos la vocal A por la O... ¿qué animal travieso es?!',
      target: { word: 'MONO', image: 'assets/mono.png', pron: 'mono' },
      distractors: [
        { word: 'MOTO', image: 'assets/moto.png', pron: 'moto' },
        { word: 'LOMA', image: 'assets/loma.png', pron: 'loma' }
      ]
    },
    {
      id: 'gorro_zorro',
      type: 'substitution',
      base: { word: 'GORRO', image: 'assets/gorro.png', pron: 'gorro' },
      changeDesc: 'Cambiamos la G por la Z',
      promptText: '¡Si a GORRO le cambiamos la primera letra por la Z... ¿en qué animal se transforma?!',
      target: { word: 'ZORRO', image: 'assets/zorro.png', pron: 'zorro' },
      distractors: [
        { word: 'PERRO', image: 'assets/perro.png', pron: 'perro' },
        { word: 'LOBEZNO', image: 'assets/lobo.png', pron: 'lobo' }
      ]
    },
    {
      id: 'pala_pila',
      type: 'vowel_change',
      base: { word: 'PALA', image: 'assets/pala.png', pron: 'pala' },
      changeDesc: 'Cambiamos la A por la I',
      promptText: '¡Si a PALA le cambiamos la primera vocal por la I... ¿qué objeto de energía es?!',
      target: { word: 'PILA', image: 'assets/pila.png', pron: 'pila' },
      distractors: [
        { word: 'PIPA', image: 'assets/pipa.png', pron: 'pipa' },
        { word: 'PIÑA', image: 'assets/pina.png', pron: 'piña' }
      ]
    },
    {
      id: 'cama_casa',
      type: 'substitution',
      base: { word: 'CAMA', image: 'assets/cama.png', pron: 'cama' },
      changeDesc: 'Cambiamos la M por la S',
      promptText: '¡Si a CAMA le cambiamos la M por la S... ¿dónde vivimos?!',
      target: { word: 'CASA', image: 'assets/casa.png', pron: 'casa' },
      distractors: [
        { word: 'CAJA', image: 'assets/caja.png', pron: 'caja' },
        { word: 'TAZA', image: 'assets/taza.png', pron: 'taza' }
      ]
    },
    {
      id: 'tela_vela',
      type: 'substitution',
      base: { word: 'TELA', image: 'assets/tela.png', pron: 'tela' },
      changeDesc: 'Cambiamos la T por la V',
      promptText: '¡Si a TELA le cambiamos la T por la V... ¿qué objeto que da luz aparece?!',
      target: { word: 'VELA', image: 'assets/vela.png', pron: 'vela' },
      distractors: [
        { word: 'TAPA', image: 'assets/tapa.png', pron: 'tapa' },
        { word: 'BOLA', image: 'assets/bola.png', pron: 'bola' }
      ]
    }
  ];

  // Caché de imágenes
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
  window.openTransformerScreen = function() {
    if (typeof stopAllAudio === 'function') stopAllAudio();
    if (typeof switchScreen === 'function') switchScreen('transformer');

    const screen = document.getElementById('screen-transformer');
    if (screen) screen.classList.add('active');

    TransformerGame.isRunning = true;
    initTransformerGame();

    setTimeout(resizeTransformerCanvas, 50);
    setTimeout(resizeTransformerCanvas, 150);
    setTimeout(resizeTransformerCanvas, 300);
  };

  window.closeTransformerAndReturnToMap = function() {
    TransformerGame.isRunning = false;
    if (TransformerGame.animId) cancelAnimationFrame(TransformerGame.animId);
    if (TransformerGame.voiceTimeout) clearTimeout(TransformerGame.voiceTimeout);
    if (TransformerGame.speechWatchdog) clearTimeout(TransformerGame.speechWatchdog);
    TransformerGame.isSpeaking = false;
    TransformerGame.isAdvancing = false;
    if (typeof stopAllAudio === 'function') stopAllAudio();

    if (typeof switchScreen === 'function') switchScreen('map');
  };

  // --- INICIALIZACIÓN ---
  function initTransformerGame() {
    TransformerGame.canvas = document.getElementById('transformer-canvas');
    if (!TransformerGame.canvas) return;
    TransformerGame.ctx = TransformerGame.canvas.getContext('2d');

    // Barajar banco y elegir 5 casos dinámicos por sesión
    const shuffled = TRANSFORMER_CASES.slice().sort(() => Math.random() - 0.5);
    TransformerGame.cases = shuffled.slice(0, 5);
    TransformerGame.currentCaseIndex = 0;

    setupTransformerEventListeners();
    resizeTransformerCanvas();
    setupTransformerCase(0);

    if (TransformerGame.animId) cancelAnimationFrame(TransformerGame.animId);
    TransformerGame.animId = requestAnimationFrame(transformerLoop);
  }

  function resizeTransformerCanvas() {
    if (!TransformerGame.canvas) return;
    const container = TransformerGame.canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const w = Math.max(320, Math.floor(rect.width) || window.innerWidth || 800);
    const h = Math.max(360, Math.floor(rect.height) || (window.innerHeight - 170) || 520);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    TransformerGame.canvas.width = w * dpr;
    TransformerGame.canvas.height = h * dpr;
    TransformerGame.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    TransformerGame.width = w;
    TransformerGame.height = h;

    repositionTransformerCards();
  }

  function setupTransformerCase(index) {
    if (!TransformerGame.isRunning || TransformerGame.cases.length === 0) return;
    const c = TransformerGame.cases[index % TransformerGame.cases.length];
    TransformerGame.currentCase = c;
    TransformerGame.isAdvancing = false;
    TransformerGame.selectedCard = null;
    TransformerGame.steamParticles = [];
    TransformerGame.floatingTexts = [];

    // Opciones a elegir: la palabra target + 2 distractores
    const options = [
      { ...c.target, isTarget: true },
      ...c.distractors.map(d => ({ ...d, isTarget: false }))
    ].sort(() => Math.random() - 0.5);

    TransformerGame.cards = options.map((opt, i) => ({
      id: i,
      word: opt.word,
      image: opt.image,
      pron: opt.pron,
      isTarget: opt.isTarget,
      x: 0,
      y: 0,
      w: 140,
      h: 170,
      scale: 1.0,
      shake: 0
    }));

    repositionTransformerCards();
    updateTransformerHUD();

    if (TransformerGame.voiceTimeout) clearTimeout(TransformerGame.voiceTimeout);
    TransformerGame.voiceTimeout = setTimeout(() => {
      speakTransformerMission();
    }, 350);
  }

  function repositionTransformerCards() {
    const w = TransformerGame.width;
    const h = TransformerGame.height;
    const cards = TransformerGame.cards;
    if (!cards || cards.length === 0) return;

    const count = cards.length;
    const cardW = Math.min(145, Math.floor(w * 0.28));
    const cardH = Math.min(180, Math.floor(h * 0.38));
    const startX = w * 0.5 - ((count * cardW + (count - 1) * 16) / 2);
    const posY = h * 0.62;

    cards.forEach((c, i) => {
      c.w = cardW;
      c.h = cardH;
      c.x = startX + i * (cardW + 16);
      c.y = posY;
    });
  }

  function updateTransformerHUD() {
    const c = TransformerGame.currentCase;
    if (!c) return;

    const titleEl = document.getElementById('transformer-case-title');
    if (titleEl) titleEl.innerText = `Misión ${TransformerGame.currentCaseIndex + 1} de ${TransformerGame.cases.length}`;

    const promptEl = document.getElementById('transformer-prompt-badge');
    if (promptEl) promptEl.innerText = c.changeDesc || (c.removedSound ? `Quitamos ${c.removedSound}` : 'Transformación');
  }

  window.speakTransformerMission = function() {
    if (!TransformerGame.isRunning || !TransformerGame.currentCase) return;
    const c = TransformerGame.currentCase;

    if (typeof speakText === 'function') {
      TransformerGame.isSpeaking = true;
      if (TransformerGame.speechWatchdog) clearTimeout(TransformerGame.speechWatchdog);
      speakText(c.promptText, () => {
        if (TransformerGame.speechWatchdog) clearTimeout(TransformerGame.speechWatchdog);
        TransformerGame.isSpeaking = false;
      });
      TransformerGame.speechWatchdog = setTimeout(() => {
        TransformerGame.isSpeaking = false;
      }, 5000);
    }
  };

  // --- DIBUJADO DE LA MÁQUINA DE TRANSFORMACIÓN ---
  function transformerLoop() {
    if (!TransformerGame.isRunning) return;
    TransformerGame.time += 0.02;
    TransformerGame.gearsAngle += 0.025;

    renderTransformerScene();
    TransformerGame.animId = requestAnimationFrame(transformerLoop);
  }

  function renderTransformerScene() {
    const ctx = TransformerGame.ctx;
    const w = TransformerGame.width;
    const h = TransformerGame.height;
    const c = TransformerGame.currentCase;

    ctx.clearRect(0, 0, w, h);

    // 1. Fondo de laboratorio alquímico / taller mecánico
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#1E1B4B');
    bgGrad.addColorStop(0.5, '#2E1065');
    bgGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Engranajes dorados decorativos en el fondo
    drawGear(ctx, w * 0.12, h * 0.25, 45, TransformerGame.gearsAngle, '#F59E0B');
    drawGear(ctx, w * 0.22, h * 0.32, 32, -TransformerGame.gearsAngle * 1.4, '#D97706');
    drawGear(ctx, w * 0.88, h * 0.25, 45, -TransformerGame.gearsAngle, '#F59E0B');
    drawGear(ctx, w * 0.78, h * 0.32, 32, TransformerGame.gearsAngle * 1.4, '#D97706');

    // 3. Contenedor de la palabra base original (en la parte superior central)
    if (c) {
      const baseW = Math.min(220, w * 0.45);
      const baseH = 135;
      const baseX = w * 0.5 - baseW / 2;
      const baseY = h * 0.18;

      // Glow de energía mágica
      ctx.save();
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, baseX, baseY, baseW, baseH, 18);
      ctx.fill();
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // Imagen base
      const bImg = getCachedImg(c.base.image);
      if (bImg && bImg.complete && bImg.naturalWidth > 0) {
        const imgH = 75;
        const imgW = (bImg.naturalWidth / bImg.naturalHeight) * imgH;
        ctx.drawImage(bImg, baseX + (baseW - imgW) / 2, baseY + 10, imgW, imgH);
      }

      // Nombre base con tipografía audaz
      ctx.font = '900 18px "Comic Neue", "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#78350F';
      ctx.fillText(c.base.word, baseX + baseW / 2, baseY + 115);

      // Flecha de transmutación apuntando hacia abajo
      ctx.font = '900 24px sans-serif';
      ctx.fillStyle = '#FBBF24';
      ctx.fillText('⬇️', w * 0.5, baseY + baseH + 30);
    }

    // 4. Dibujar tarjetas de opciones
    TransformerGame.cards.forEach(card => {
      ctx.save();
      ctx.translate(card.x + card.w / 2 + (card.shake ? Math.sin(TransformerGame.time * 30) * card.shake : 0), card.y + card.h / 2);
      ctx.scale(card.scale, card.scale);

      // Tarjeta
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, -card.w / 2, -card.h / 2, card.w, card.h, 16);
      ctx.fill();
      ctx.strokeStyle = (card === TransformerGame.selectedCard) ? '#10B981' : '#CBD5E1';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Imagen
      const img = getCachedImg(card.image);
      if (img && img.complete && img.naturalWidth > 0) {
        const ih = card.h * 0.52;
        const iw = (img.naturalWidth / img.naturalHeight) * ih;
        ctx.drawImage(img, -iw / 2, -card.h / 2 + 14, iw, ih);
      }

      // Texto de la palabra
      ctx.font = '900 16px "Comic Neue", "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1E293B';
      ctx.fillText(card.word, 0, card.h / 2 - 20);

      ctx.restore();
    });

    // 5. Partículas de vapor y textos flotantes
    updateAndDrawTransformerEffects(ctx);
  }

  function drawGear(ctx, x, y, radius, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.55;

    const teeth = 8;
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a1 = (i / teeth) * Math.PI * 2;
      const a2 = a1 + (Math.PI / teeth) * 0.6;
      ctx.lineTo(Math.cos(a1) * (radius + 8), Math.sin(a1) * (radius + 8));
      ctx.lineTo(Math.cos(a2) * (radius + 8), Math.sin(a2) * (radius + 8));
      ctx.lineTo(Math.cos(a2) * radius, Math.sin(a2) * radius);
    }
    ctx.closePath();
    ctx.fill();

    // Centro del engranaje
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#1E1B4B';
    ctx.fill();

    ctx.restore();
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

  function updateAndDrawTransformerEffects(ctx) {
    for (let i = TransformerGame.floatingTexts.length - 1; i >= 0; i--) {
      const ft = TransformerGame.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      if (ft.alpha <= 0) {
        TransformerGame.floatingTexts.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = '900 18px "Comic Neue", "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  // --- SELECCIÓN Y CONTROL DE EVENTOS ---
  function setupTransformerEventListeners() {
    const canvas = TransformerGame.canvas;
    if (!canvas) return;

    function getCoords(e) {
      const r = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - r.left) * (TransformerGame.width / r.width),
        y: (clientY - r.top) * (TransformerGame.height / r.height)
      };
    }

    function onPointerDown(e) {
      if (TransformerGame.isAdvancing) return;
      const pos = getCoords(e);

      TransformerGame.cards.forEach(card => {
        if (pos.x >= card.x && pos.x <= card.x + card.w &&
            pos.y >= card.y && pos.y <= card.y + card.h) {
          handleTransformerCardClick(card);
        }
      });
    }

    canvas.onmousedown = onPointerDown;
    canvas.ontouchstart = function(e) {
      e.preventDefault();
      onPointerDown(e);
    };
  }

  function handleTransformerCardClick(card) {
    if (TransformerGame.isAdvancing) return;

    if (card.isTarget) {
      // ✅ ACIERTO EN LA TRANSFORMACIÓN
      TransformerGame.isAdvancing = true;
      TransformerGame.selectedCard = card;
      card.scale = 1.1;

      // Sonido de magia / campana
      playSuccessChime();

      TransformerGame.floatingTexts.push({
        x: card.x + card.w / 2,
        y: card.y - 20,
        text: `¡EXCELENTE! ¡Es ${card.word}! ✨`,
        color: '#10B981',
        alpha: 1.0,
        vy: -1.2
      });

      if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
        activeChildProfile.coins = (activeChildProfile.coins || 0) + 10;
        if (typeof saveActiveChildProfile === 'function') saveActiveChildProfile();
      }

      if (typeof speakText === 'function') {
        TransformerGame.isSpeaking = true;
        speakText(`¡Súper, tarea lograda! ¡${card.pron}!`, () => {
          TransformerGame.isSpeaking = false;
        });
      }

      setTimeout(() => {
        if (!TransformerGame.isRunning) return;
        TransformerGame.currentCaseIndex++;
        if (TransformerGame.currentCaseIndex >= TransformerGame.cases.length) {
          showTransformerVictoryModal();
        } else {
          setupTransformerCase(TransformerGame.currentCaseIndex);
        }
      }, 1600);

    } else {
      // ❌ ERROR AMIGABLE
      card.shake = 8;
      playErrorTone();

      TransformerGame.floatingTexts.push({
        x: card.x + card.w / 2,
        y: card.y - 20,
        text: '¡Intenta con otra!',
        color: '#F59E0B',
        alpha: 1.0,
        vy: -1.2
      });

      setTimeout(() => { card.shake = 0; }, 400);

      if (typeof speakText === 'function') {
        speakText(`Esa es ${card.pron}. Escucha de nuevo la transformación.`);
      }
    }
  }

  function showTransformerVictoryModal() {
    const modal = document.getElementById('transformer-victory-modal');
    if (modal) modal.style.display = 'flex';
  }

  window.replayTransformerQuest = function() {
    const modal = document.getElementById('transformer-victory-modal');
    if (modal) modal.style.display = 'none';
    initTransformerGame();
  };

  window.closeTransformerVictoryModal = function() {
    const modal = document.getElementById('transformer-victory-modal');
    if (modal) modal.style.display = 'none';
    window.closeTransformerAndReturnToMap();
  };

  // Sonidos Web Audio
  function playSuccessChime() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ac.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ac.currentTime + 0.2); // G5
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
