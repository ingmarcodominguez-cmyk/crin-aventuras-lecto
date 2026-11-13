// =========================================================================
// CRIN AVENTURAS DE LECTOESCRITURA - EL FARO DEL ESPEJO
// Módulo de Inhibición de Simetría y Discriminación b / d / p / q (Dehaene)
// =========================================================================

(function() {
  'use strict';

  const MirrorGame = {
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

    boats: [],
    selectedBoat: null,
    isAdvancing: false,
    isSpeaking: false,
    voiceTimeout: null,
    speechWatchdog: null,

    beamAngle: 0,
    floatingTexts: []
  };

  window.MirrorGame = MirrorGame;

  // BANCO CANÓNICO DE CASOS DE DISCRIMINACIÓN DE LETRAS ESPEJO (b, d, p, q)
  const MIRROR_CASES = [
    {
      id: 'b_bota',
      targetLetter: 'b',
      contrastLetter: 'd',
      targetWord: 'BOTA',
      targetImage: 'assets/bota.png',
      ruleTip: 'La letra "b" tiene la pancita hacia adelante (👍 mano izquierda)',
      promptText: '¡Alumbra el barco que lleva la letra b de BOTA!'
    },
    {
      id: 'd_dado',
      targetLetter: 'd',
      contrastLetter: 'b',
      targetWord: 'DADO',
      targetImage: 'assets/dado.png',
      ruleTip: 'La letra "d" tiene la pancita hacia atrás (👍 mano derecha)',
      promptText: '¡Alumbra el barco con la letra d de DADO!'
    },
    {
      id: 'b_banana',
      targetLetter: 'b',
      contrastLetter: 'd',
      targetWord: 'BANANA',
      targetImage: 'assets/banana.png',
      ruleTip: 'La "b" mira hacia la derecha: ¡como en BANANA!',
      promptText: '¡Encuentra el barco con la letra b de BANANA!'
    },
    {
      id: 'd_dedo',
      targetLetter: 'd',
      contrastLetter: 'b',
      targetWord: 'DEDO',
      targetImage: 'assets/dedo.png',
      ruleTip: 'La "d" mira hacia la izquierda: ¡como en DEDO!',
      promptText: '¡Alumbra el barco con la letra d de DEDO!'
    },
    {
      id: 'p_pato',
      targetLetter: 'p',
      contrastLetter: 'q',
      targetWord: 'PATO',
      targetImage: 'assets/pato.png',
      ruleTip: 'La letra "p" tiene la pancita arriba a la derecha (👎)',
      promptText: '¡Alumbra el barco que lleva la letra p de PATO!'
    },
    {
      id: 'p_pino',
      targetLetter: 'p',
      contrastLetter: 'b',
      targetWord: 'PINO',
      targetImage: 'assets/pino.png',
      ruleTip: 'La "p" cuelga hacia abajo: ¡como en PINO!',
      promptText: '¡Encuentra el barco con la letra p de PINO!'
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
  window.openMirrorScreen = function() {
    if (typeof stopAllAudio === 'function') stopAllAudio();
    if (typeof switchScreen === 'function') switchScreen('mirror');

    const screen = document.getElementById('screen-mirror');
    if (screen) screen.classList.add('active');

    MirrorGame.isRunning = true;
    initMirrorGame();

    setTimeout(resizeMirrorCanvas, 50);
    setTimeout(resizeMirrorCanvas, 150);
    setTimeout(resizeMirrorCanvas, 300);
  };

  window.closeMirrorAndReturnToMap = function() {
    MirrorGame.isRunning = false;
    if (MirrorGame.animId) cancelAnimationFrame(MirrorGame.animId);
    if (MirrorGame.voiceTimeout) clearTimeout(MirrorGame.voiceTimeout);
    if (MirrorGame.speechWatchdog) clearTimeout(MirrorGame.speechWatchdog);
    MirrorGame.isSpeaking = false;
    MirrorGame.isAdvancing = false;
    if (typeof stopAllAudio === 'function') stopAllAudio();

    if (typeof switchScreen === 'function') switchScreen('map');
  };

  // Barajado Fisher-Yates genuino e insesgado
  function shuffleArray(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Generador de distribución equilibrada anti-racha para los barcos (0 = barco izquierdo, 1 = barco derecho)
  function generateBalancedBoatPositions(count) {
    let positions;
    do {
      const halfA = Math.floor(count / 2);
      const halfB = count - halfA;
      const base = Math.random() < 0.5 
        ? Array(halfA).fill(0).concat(Array(halfB).fill(1))
        : Array(halfB).fill(0).concat(Array(halfA).fill(1));
      
      for (let i = base.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [base[i], base[j]] = [base[j], base[i]];
      }
      positions = base;
    } while (
      count >= 3 && positions.some((val, idx) => idx <= count - 3 && val === positions[idx + 1] && val === positions[idx + 2])
    );
    return positions;
  }

  // --- INICIALIZACIÓN ---
  function initMirrorGame() {
    MirrorGame.canvas = document.getElementById('mirror-canvas');
    if (!MirrorGame.canvas) return;
    MirrorGame.ctx = MirrorGame.canvas.getContext('2d');

    MirrorGame.cases = shuffleArray(MIRROR_CASES).slice(0, 5);
    MirrorGame.currentCaseIndex = 0;
    MirrorGame.targetBoatSequence = generateBalancedBoatPositions(MirrorGame.cases.length);
    MirrorGame.lastTargetIndex = -1;

    // Pre-cargar inmediatamente todas las imágenes y locuciones de la sesión
    try {
      // Pre-cargar imágenes de alta resolución del faro y barquitos
    getCachedImg('assets/faro.png?v=313');
    getCachedImg('assets/faro_luz_barco1.png?v=313');
    getCachedImg('assets/faro_luz_barco2.png?v=313');
    getCachedImg('assets/barco.png?v=313');
    getCachedImg('assets/barco_oscuro.png?v=313');

    MirrorGame.cases.forEach(mc => {
        getCachedImg(mc.targetImage);
        if (typeof window.preloadTtsAudio === 'function' && mc.promptText) {
          window.preloadTtsAudio(mc.promptText);
        }
      });
    } catch(e) {}

    setupMirrorEventListeners();
    resizeMirrorCanvas();
    setupMirrorCase(0);

    if (MirrorGame.animId) cancelAnimationFrame(MirrorGame.animId);
    MirrorGame.animId = requestAnimationFrame(mirrorLoop);
  }

  function resizeMirrorCanvas() {
    if (!MirrorGame.canvas) return;
    const container = MirrorGame.canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const w = Math.max(320, Math.floor(rect.width) || window.innerWidth || 800);
    const h = Math.max(360, Math.floor(rect.height) || (window.innerHeight - 170) || 520);

    MirrorGame.canvas.width = w;
    MirrorGame.canvas.height = h;
    MirrorGame.ctx.setTransform(1, 0, 0, 1, 0, 0);

    MirrorGame.width = w;
    MirrorGame.height = h;

    repositionMirrorBoats();
  }

  function setupMirrorCase(index) {
    if (!MirrorGame.isRunning || MirrorGame.cases.length === 0) return;
    const c = MirrorGame.cases[index % MirrorGame.cases.length];
    MirrorGame.currentCase = c;
    MirrorGame.isAdvancing = false;
    MirrorGame.selectedBoat = null;
    MirrorGame.floatingTexts = [];

    // Alternancia equilibrada garantizada entre el barco izquierdo (0) y el derecho (1)
    let targetBoatIndex;
    if (MirrorGame.targetBoatSequence && MirrorGame.targetBoatSequence.length > index) {
      targetBoatIndex = MirrorGame.targetBoatSequence[index];
    } else {
      const last = (MirrorGame.lastTargetIndex !== undefined) ? MirrorGame.lastTargetIndex : -1;
      targetBoatIndex = (last === 0) ? 1 : ((last === 1) ? 0 : (Math.random() < 0.5 ? 0 : 1));
    }
    MirrorGame.lastTargetIndex = targetBoatIndex;

    const options = [null, null];
    options[targetBoatIndex] = { letter: c.targetLetter, isTarget: true };
    options[1 - targetBoatIndex] = { letter: c.contrastLetter, isTarget: false };

    MirrorGame.boats = options.map((opt, i) => ({
      id: i,
      letter: opt.letter,
      isTarget: opt.isTarget,
      x: 0,
      y: 0,
      w: 130,
      h: 130,
      scale: 1.0,
      waveOffset: i * 2.0,
      shake: 0
    }));

    repositionMirrorBoats();
    updateMirrorHUD();

    if (MirrorGame.voiceTimeout) clearTimeout(MirrorGame.voiceTimeout);
    MirrorGame.voiceTimeout = setTimeout(() => {
      speakMirrorPrompt();
    }, 50);
  }

  function repositionMirrorBoats() {
    const w = MirrorGame.width;
    const h = MirrorGame.height;
    if (MirrorGame.boats.length < 2) return;

    const horizonY = h * 0.50;
    // Dimensiones de los barquitos flotando en el agua
    const bw = Math.min(180, Math.floor(w * 0.24));
    const bh = Math.floor(bw * (935 / 1024));
    const waterY = horizonY + 20;

    // Barquito 0 (primer barquito, centrado en el mar)
    MirrorGame.boats[0].w = bw;
    MirrorGame.boats[0].h = bh;
    MirrorGame.boats[0].x = w * 0.44 - bw / 2;
    MirrorGame.boats[0].y = waterY;

    // Barquito 1 (segundo barquito, centrado a la derecha)
    MirrorGame.boats[1].w = bw;
    MirrorGame.boats[1].h = bh;
    MirrorGame.boats[1].x = w * 0.76 - bw / 2;
    MirrorGame.boats[1].y = waterY;
  }

  function updateMirrorHUD() {
    const c = MirrorGame.currentCase;
    if (!c) return;

    const titleEl = document.getElementById('mirror-case-title');
    if (titleEl) titleEl.innerText = `Faro Marino ${MirrorGame.currentCaseIndex + 1} de ${MirrorGame.cases.length}`;

    const tipEl = document.getElementById('mirror-tip-badge');
    if (tipEl) tipEl.innerText = c.ruleTip;
  }

  function speakMirrorPrompt() {
    if (!MirrorGame.isRunning || !MirrorGame.currentCase) return;
    const c = MirrorGame.currentCase;

    if (typeof speakText === 'function') {
      MirrorGame.isSpeaking = true;
      if (MirrorGame.speechWatchdog) clearTimeout(MirrorGame.speechWatchdog);
      speakText(c.promptText, () => {
        if (MirrorGame.speechWatchdog) clearTimeout(MirrorGame.speechWatchdog);
        MirrorGame.isSpeaking = false;
      });
      MirrorGame.speechWatchdog = setTimeout(() => {
        MirrorGame.isSpeaking = false;
      }, 5000);
    }
  }

  // --- DIBUJADO DEL FARO Y EL MAR ---
  function mirrorLoop() {
    if (!MirrorGame.isRunning) return;
    MirrorGame.time += 0.02;

    renderMirrorScene();
    MirrorGame.animId = requestAnimationFrame(mirrorLoop);
  }

  function renderMirrorScene() {
    const ctx = MirrorGame.ctx;
    const w = MirrorGame.width;
    const h = MirrorGame.height;
    const c = MirrorGame.currentCase;

    ctx.clearRect(0, 0, w, h);

    // 1. Horizonte que separa el cielo y el agua
    const horizonY = h * 0.50;

    // Cielo nocturno
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#020617');
    skyGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY);

    // 2. Mar oscuro en el horizonte
    const waterGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    waterGrad.addColorStop(0, '#0369A1');
    waterGrad.addColorStop(1, '#082F49');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // Olas animadas
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    for (let row = 0; row < 3; row++) {
      const oy = horizonY + 25 + row * 40;
      ctx.beginPath();
      for (let x = 0; x < w; x += 30) {
        const y = oy + Math.sin(x * 0.05 + MirrorGame.time * 2 + row) * 5;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 3. El Faro en el horizonte (donde se separa el agua y el cielo)
    const faroImg = getCachedImg('assets/faro.png?v=313');
    // Escala proporcionada al horizonte
    const faroH = Math.min(h * 0.48, Math.max(180, w * 0.28));
    const faroW = faroH * (1024 / 935);
    const faroX = w * 0.05; // En la costa izquierda sobre la línea del horizonte
    // La base de las rocas descansa exactamente sobre la línea divisoria del agua y el cielo
    const faroY = horizonY - faroH + (faroH * 0.16);

    if (faroImg && faroImg.complete && faroImg.naturalWidth > 0) {
      ctx.drawImage(faroImg, faroX, faroY, faroW, faroH);
    }

    // Coordenadas exactas de la linterna del faro
    const lanternX = faroX + faroW * 0.505;
    const lanternY = faroY + faroH * 0.235;

    // Haz de luz largo, cinemático y translúcido que llega directamente al barco iluminado
    if (MirrorGame.selectedBoat) {
      const boat = MirrorGame.selectedBoat;
      const targetX = boat.x + boat.w * 0.50;
      const targetY = boat.y + boat.h * 0.45;

      const dx = targetX - lanternX;
      const dy = targetY - lanternY;
      const angle = Math.atan2(dy, dx);

      // Ancho de apertura del haz al llegar al barco
      const beamHalfWidth = boat.w * 0.55;
      const perpX = -Math.sin(angle);
      const perpY = Math.cos(angle);

      // El haz se extiende hasta envolver completamente el barco
      const extX = targetX + Math.cos(angle) * (boat.w * 0.25);
      const extY = targetY + Math.sin(angle) * (boat.w * 0.25);

      ctx.save();

      // Reflejo luminoso en el agua debajo del barco iluminado
      const poolGrad = ctx.createRadialGradient(targetX, targetY + boat.h * 0.35, 10, targetX, targetY + boat.h * 0.35, boat.w * 0.70);
      poolGrad.addColorStop(0.0, 'rgba(254, 240, 138, 0.40)');
      poolGrad.addColorStop(0.6, 'rgba(254, 240, 138, 0.18)');
      poolGrad.addColorStop(1.0, 'rgba(254, 240, 138, 0.0)');
      ctx.fillStyle = poolGrad;
      ctx.beginPath();
      ctx.ellipse(targetX, targetY + boat.h * 0.35, boat.w * 0.70, boat.w * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();

      // Haz cónico largo con transparencia gradual y suave
      const beamGrad = ctx.createLinearGradient(lanternX, lanternY, extX, extY);
      beamGrad.addColorStop(0.0, 'rgba(255, 250, 180, 0.55)'); // Origen brillante en la linterna
      beamGrad.addColorStop(0.2, 'rgba(254, 240, 138, 0.32)'); // Cuerpo dorado translúcido
      beamGrad.addColorStop(0.7, 'rgba(254, 235, 120, 0.22)'); // Luz envolviendo el barco
      beamGrad.addColorStop(1.0, 'rgba(254, 230, 100, 0.0)');  // Desvanecimiento suave

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(lanternX, lanternY);
      ctx.lineTo(extX + perpX * beamHalfWidth, extY + perpY * beamHalfWidth);
      ctx.lineTo(extX - perpX * beamHalfWidth, extY - perpY * beamHalfWidth);
      ctx.closePath();
      ctx.fill();

      // Destello radiante en la linterna del faro
      const flareGrad = ctx.createRadialGradient(lanternX, lanternY, 2, lanternX, lanternY, 32);
      flareGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
      flareGrad.addColorStop(0.3, 'rgba(254, 240, 138, 0.70)');
      flareGrad.addColorStop(1.0, 'rgba(254, 240, 138, 0.0)');
      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(lanternX, lanternY, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 4. Palabra ancla ilustrada en la parte superior (ej. BOTA con su imagen)
    if (c) {
      const cardW = 190;
      const cardH = 95;
      const cardX = w * 0.52 - cardW / 2;
      const cardY = h * 0.12;

      ctx.save();
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, cardX, cardY, cardW, cardH, 14);
      ctx.fill();
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      const img = getCachedImg(c.targetImage);
      if (img && img.complete && img.naturalWidth > 0) {
        const ih = 55;
        const iw = (img.naturalWidth / img.naturalHeight) * ih;
        ctx.drawImage(img, cardX + 12, cardY + (cardH - ih) / 2, iw, ih);
      }

      ctx.font = '900 18px "Comic Neue", "Nunito", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(c.targetWord, cardX + 85, cardY + 45);

      ctx.font = '700 11px sans-serif';
      ctx.fillStyle = '#0284C7';
      ctx.fillText(`Letra inicial: ${c.targetLetter}`, cardX + 85, cardY + 65);
    }

    // 5. Barquitos navegando con su letra en la vela
    MirrorGame.boats.forEach(boat => {
      const bobY = boat.y + Math.sin(MirrorGame.time * 2.5 + boat.waveOffset) * 5;
      const isLit = (boat === MirrorGame.selectedBoat);
      const boatImgSrc = isLit ? 'assets/barco.png?v=313' : 'assets/barco_oscuro.png?v=313';
      const boatImg = getCachedImg(boatImgSrc);

      ctx.save();
      ctx.translate(boat.x + boat.w / 2 + (boat.shake ? Math.sin(MirrorGame.time * 30) * boat.shake : 0), bobY + boat.h / 2);
      ctx.scale(boat.scale, boat.scale);

      // Si está iluminado por el faro, halo de luz dorada
      if (isLit) {
        ctx.shadowColor = '#FBBF24';
        ctx.shadowBlur = 24;
      }

      if (boatImg && boatImg.complete && boatImg.naturalWidth > 0) {
        ctx.drawImage(boatImg, -boat.w / 2, -boat.h / 2, boat.w, boat.h);
      }

      // Suave línea de agua marina en el casco
      const hullWaterY = boat.h * 0.38;
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const waveW = boat.w * 0.44;
      ctx.moveTo(-waveW, hullWaterY);
      ctx.quadraticCurveTo(0, hullWaterY + 3 + Math.sin(MirrorGame.time * 3 + boat.waveOffset) * 2, waveW, hullWaterY);
      ctx.stroke();
      ctx.restore();

      // Letra clave sobre la vela (centro de la vela: X ~ 51%, Y ~ 41%)
      const sailX = -boat.w / 2 + boat.w * 0.51;
      const sailY = -boat.h / 2 + boat.h * 0.41;

      ctx.font = '900 ' + Math.round(boat.h * 0.22) + 'px "Comic Neue", "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (isLit) {
        ctx.shadowColor = '#FEF08A';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#0F172A';
      } else {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#0F172A';
      }
      ctx.fillText(boat.letter, sailX, sailY);

      ctx.restore();
    });

    // 6. Textos flotantes
    updateAndDrawMirrorEffects(ctx);
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

  function updateAndDrawMirrorEffects(ctx) {
    for (let i = MirrorGame.floatingTexts.length - 1; i >= 0; i--) {
      const ft = MirrorGame.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      if (ft.alpha <= 0) {
        MirrorGame.floatingTexts.splice(i, 1);
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
  function setupMirrorEventListeners() {
    const canvas = MirrorGame.canvas;
    if (!canvas) return;

    function getCoords(e) {
      const r = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - r.left) * (MirrorGame.width / r.width),
        y: (clientY - r.top) * (MirrorGame.height / r.height)
      };
    }

    function onPointerDown(e) {
      if (MirrorGame.isAdvancing) return;
      const pos = getCoords(e);

      MirrorGame.boats.forEach(boat => {
        if (pos.x >= boat.x && pos.x <= boat.x + boat.w &&
            pos.y >= boat.y - 40 && pos.y <= boat.y + boat.h + 20) {
          handleMirrorBoatClick(boat);
        }
      });
    }

    canvas.onmousedown = onPointerDown;
    canvas.ontouchstart = function(e) {
      e.preventDefault();
      onPointerDown(e);
    };
  }

  function handleMirrorBoatClick(boat) {
    if (MirrorGame.isAdvancing) return;
    if ((window.isNarratingNow && window.isNarratingNow() && Date.now() - (window.lastSpeechStartTime || 0) < 20000)) return; // no cortar la locución en curso

    if (boat.isTarget) {
      MirrorGame.isAdvancing = true;
      MirrorGame.selectedBoat = boat;
      boat.scale = 1.15;

      playSuccessChime();

      MirrorGame.floatingTexts.push({
        x: boat.x + boat.w / 2,
        y: boat.y - 30,
        text: `¡CORRECTO! ¡Letra ${boat.letter}! ⚓`,
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
        if (!MirrorGame.isRunning) return;
        MirrorGame.isSpeaking = false;
        MirrorGame.isAdvancing = false;
        MirrorGame.currentCaseIndex++;
        if (MirrorGame.currentCaseIndex >= MirrorGame.cases.length) {
          showMirrorVictoryModal();
        } else {
          setupMirrorCase(MirrorGame.currentCaseIndex);
        }
      };

      // 🔒 REGLA UNIVERSAL: Esperar a que la locución termine completamente antes de avanzar
      if (typeof speakText === 'function') {
        MirrorGame.isSpeaking = true;
        speakText(`¡Súper, tarea lograda! ¡Es la letra ${boat.letter}!`, () => {
          setTimeout(proceedToNextCase, 500);
        });
        setTimeout(proceedToNextCase, 6500);
      } else {
        setTimeout(proceedToNextCase, 1400);
      }

    } else {
      boat.shake = 8;
      playErrorTone();

      MirrorGame.floatingTexts.push({
        x: boat.x + boat.w / 2,
        y: boat.y - 30,
        text: `Esa es la letra ${boat.letter}`,
        color: '#F59E0B',
        alpha: 1.0,
        vy: -1.2
      });

      setTimeout(() => { boat.shake = 0; }, 400);

      const c = MirrorGame.currentCase;
      if (typeof speakText === 'function') {
        speakText(`Esa es la letra ${boat.letter}. Recuerda: ${c.ruleTip}`);
      }
    }
  }

  function showMirrorVictoryModal() {
    const modal = document.getElementById('mirror-victory-modal');
    if (modal) modal.style.display = 'flex';
  }

  window.replayMirrorQuest = function() {
    const modal = document.getElementById('mirror-victory-modal');
    if (modal) modal.style.display = 'none';
    initMirrorGame();
  };

  window.closeMirrorVictoryModal = function() {
    const modal = document.getElementById('mirror-victory-modal');
    if (modal) modal.style.display = 'none';
    window.closeMirrorAndReturnToMap();
  };

  let sharedMirrorAudioCtx = null;
  function getMirrorAudioCtx() {
    if (typeof window.getSharedAudioCtx === 'function') return window.getSharedAudioCtx();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedMirrorAudioCtx) sharedMirrorAudioCtx = new AudioCtx();
    if (sharedMirrorAudioCtx.state === 'suspended') sharedMirrorAudioCtx.resume().catch(() => {});
    return sharedMirrorAudioCtx;
  }

  function playSuccessChime() {
    try {
      const ac = getMirrorAudioCtx();
      if (!ac) return;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ac.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ac.currentTime + 0.25); // A5
      gain.gain.setValueAtTime(0.3, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.35);
      osc.start();
      osc.stop(ac.currentTime + 0.35);
    } catch(e) {}
  }

  function playErrorTone() {
    try {
      const ac = getMirrorAudioCtx();
      if (!ac) return;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, ac.currentTime);
      gain.gain.setValueAtTime(0.2, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.25);
      osc.start();
      osc.stop(ac.currentTime + 0.25);
    } catch(e) {}
  }

})();
