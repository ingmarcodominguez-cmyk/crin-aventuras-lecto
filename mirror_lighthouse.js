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

  // --- INICIALIZACIÓN ---
  function initMirrorGame() {
    MirrorGame.canvas = document.getElementById('mirror-canvas');
    if (!MirrorGame.canvas) return;
    MirrorGame.ctx = MirrorGame.canvas.getContext('2d');

    const shuffled = MIRROR_CASES.slice().sort(() => Math.random() - 0.5);
    MirrorGame.cases = shuffled.slice(0, 5);
    MirrorGame.currentCaseIndex = 0;

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

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    MirrorGame.canvas.width = w * dpr;
    MirrorGame.canvas.height = h * dpr;
    MirrorGame.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

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

    // Dos barquitos en el mar: uno con la letra target y otro con la letra espejo
    const options = [
      { letter: c.targetLetter, isTarget: true },
      { letter: c.contrastLetter, isTarget: false }
    ].sort(() => Math.random() - 0.5);

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
    }, 350);
  }

  function repositionMirrorBoats() {
    const w = MirrorGame.width;
    const h = MirrorGame.height;
    if (MirrorGame.boats.length < 2) return;

    const bw = Math.min(140, Math.floor(w * 0.28));
    const bh = bw;
    const waterY = h * 0.62;

    MirrorGame.boats[0].w = bw;
    MirrorGame.boats[0].h = bh;
    MirrorGame.boats[0].x = w * 0.35 - bw / 2;
    MirrorGame.boats[0].y = waterY;

    MirrorGame.boats[1].w = bw;
    MirrorGame.boats[1].h = bh;
    MirrorGame.boats[1].x = w * 0.70 - bw / 2;
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

    // 1. Cielo nocturno
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    skyGrad.addColorStop(0, '#020617');
    skyGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.55);

    // 2. Mar oscuro y olas suaves
    const waterGrad = ctx.createLinearGradient(0, h * 0.55, 0, h);
    waterGrad.addColorStop(0, '#0369A1');
    waterGrad.addColorStop(1, '#082F49');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    // Olas animadas
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    for (let row = 0; row < 3; row++) {
      const oy = h * 0.58 + row * 40;
      ctx.beginPath();
      for (let x = 0; x < w; x += 30) {
        const y = oy + Math.sin(x * 0.05 + MirrorGame.time * 2 + row) * 5;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 3. El Faro en la costa izquierda
    const fX = w * 0.12;
    const fBaseY = h * 0.65;
    const fTopY = h * 0.18;

    // Torre del faro a rayas rojas y blancas
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(fX - 28, fBaseY);
    ctx.lineTo(fX + 28, fBaseY);
    ctx.lineTo(fX + 16, fTopY);
    ctx.lineTo(fX - 16, fTopY);
    ctx.closePath();
    ctx.fillStyle = '#E2E8F0';
    ctx.fill();

    // Rayas rojas
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(fX - 25, fBaseY - 45, 50, 22);
    ctx.fillRect(fX - 20, fBaseY - 95, 40, 20);

    // Linterna de luz en la cima
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(fX - 18, fTopY - 18, 36, 18);
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(fX, fTopY - 9, 12, 0, Math.PI * 2);
    ctx.fill();

    // Haz de luz del faro barriendo hacia el mar
    const targetBoat = MirrorGame.selectedBoat || MirrorGame.boats[0];
    const beamTargetX = targetBoat ? targetBoat.x + targetBoat.w / 2 : w * 0.5;
    const beamTargetY = targetBoat ? targetBoat.y + targetBoat.h / 2 : h * 0.7;

    const beamGrad = ctx.createRadialGradient(fX, fTopY - 9, 10, beamTargetX, beamTargetY, 350);
    beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.65)');
    beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0.0)');

    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(fX, fTopY - 9);
    ctx.lineTo(beamTargetX - 70, beamTargetY);
    ctx.lineTo(beamTargetX + 70, beamTargetY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

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
      const bobY = boat.y + Math.sin(MirrorGame.time * 2.5 + boat.waveOffset) * 6;

      ctx.save();
      ctx.translate(boat.x + boat.w / 2 + (boat.shake ? Math.sin(MirrorGame.time * 30) * boat.shake : 0), bobY);
      ctx.scale(boat.scale, boat.scale);

      // Casco del barco (madera)
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.moveTo(-boat.w * 0.45, 20);
      ctx.lineTo(boat.w * 0.45, 20);
      ctx.lineTo(boat.w * 0.32, 42);
      ctx.lineTo(-boat.w * 0.32, 42);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Mástil
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.lineTo(0, -boat.h * 0.45);
      ctx.stroke();

      // Vela blanca luminosa con la letra
      ctx.fillStyle = (boat === MirrorGame.selectedBoat) ? '#FEF08A' : '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(0, -boat.h * 0.45);
      ctx.lineTo(boat.w * 0.38, 8);
      ctx.lineTo(0, 16);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Letra clave de gran tamaño y tipografía clara sin ambigüedad
      ctx.font = '900 38px "Comic Neue", "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(boat.letter, 12, -10);

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

  function playSuccessChime() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
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
      const ac = new (window.AudioContext || window.webkitAudioContext)();
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
