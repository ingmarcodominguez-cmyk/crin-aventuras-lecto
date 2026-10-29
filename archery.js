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

  // Helper universal de rectángulo redondeado (100% compatible con todos los navegadores)
    // Obtener la mascota elegida por el usuario
  function getActivePet() {
    if (typeof activeChildProfile !== 'undefined' && activeChildProfile && activeChildProfile.pet) {
      return activeChildProfile.pet;
    }
    if (typeof gameState !== 'undefined' && gameState && gameState.pet) {
      return gameState.pet;
    }
    return '🐶';
  }

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

    // Tarea y progreso
    taskWords: [],
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

    // Control táctil / mouse
    pointer: {
      x: 450,
      y: 200,
      isDown: false
    },

    time: 0
  };

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

  window.openArcheryQuestScreen = function() {
    if (typeof stopAllAudio === 'function') stopAllAudio();
    if (typeof switchScreen === 'function') switchScreen('archery');

    const screen = document.getElementById('screen-archery');
    if (screen) screen.classList.add('active');

    initArcheryGame();
    setTimeout(resizeArcheryCanvas, 50);
    setTimeout(resizeArcheryCanvas, 150);
    setTimeout(resizeArcheryCanvas, 300);
  };

  function initArcheryGame() {
    ArcheryGame.canvas = document.getElementById('archery-game-canvas');
    if (!ArcheryGame.canvas) return;
    ArcheryGame.ctx = ArcheryGame.canvas.getContext('2d');

    resizeArcheryCanvas();

    ArcheryGame.taskWords = getArcheryTaskWords();
    ArcheryGame.targetWordIndex = 0;
    ArcheryGame.score = 0;
    ArcheryGame.streak = 0;
    ArcheryGame.isAdvancing = false;
    ArcheryGame.arrows = [];
    ArcheryGame.particles = [];
    ArcheryGame.floatingTexts = [];
    ArcheryGame.targets = [];

    ArcheryGame.bgClouds = [
      { x: 40, y: 55, scale: 0.9, speed: 0.3 },
      { x: 280, y: 95, scale: 0.65, speed: 0.2 },
      { x: 540, y: 50, scale: 0.8, speed: 0.25 },
      { x: 740, y: 110, scale: 0.55, speed: 0.18 }
    ];

    setupArcheryEventListeners();
    setupTargetWord(0);

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

    ArcheryGame.archer.baseX = Math.max(70, Math.min(125, w * 0.14));
    ArcheryGame.archer.baseY = h - 68;
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
      progressDisplay.innerText = `Palabra ${ArcheryGame.targetWordIndex + 1} de ${ArcheryGame.taskWords.length}`;
    }

    if (taskNameDisplay && typeof allTaskPacks !== 'undefined' && typeof activeTaskPackId !== 'undefined') {
      const pack = allTaskPacks[activeTaskPackId];
      taskNameDisplay.innerText = pack ? pack.name : 'Tarea Activa';
    }
  }

  window.speakCurrentArcheryMission = function() {
    if (typeof speakText === 'function') {
      const canon = (typeof getCanonicalWord === 'function') ? getCanonicalWord(ArcheryGame.targetWord) : null;
      const pronWord = canon ? canon.pronunciacion : ArcheryGame.targetWord;
      speakText(`¡Apunta y dispara a: ${pronWord}!`);
    }
  };

  // --- GESTIÓN DE PALABRAS MÓVILES (RAPIDEZ DE LECTURA) ---
  function spawnInitialTargets() {
    ArcheryGame.targets = [];

    // Objetivo principal
    spawnTarget(ArcheryGame.targetWord, true, ArcheryGame.width * 0.55, 120);

    // Distractores de la tarea
    const pool = ArcheryGame.taskWords.filter(w => w !== ArcheryGame.targetWord);
    const distractors = shuffleArrayLocal(pool).slice(0, 3);
    if (distractors.length < 2) {
      const fallbacks = ['SOL', 'LUNA', 'CASA', 'FLOR', 'PELOTA', 'GATO'];
      fallbacks.forEach(f => {
        if (f !== ArcheryGame.targetWord && !distractors.includes(f) && distractors.length < 3) {
          distractors.push(f);
        }
      });
    }

    const ySlots = [80, 160, 240];
    distractors.forEach((dw, idx) => {
      const sx = ArcheryGame.width * (0.42 + idx * 0.18);
      const sy = ySlots[idx % ySlots.length];
      spawnTarget(dw, false, sx, sy);
    });
  }

  function spawnTarget(word, isTarget, initialX, initialY) {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const speed = 1.3 + Math.random() * 1.1;
    const emoji = getWordEmoji(word);

    const minSpawnY = 70;
    const maxSpawnY = Math.max(180, ArcheryGame.height - 180);
    const spawnY = initialY !== undefined ? initialY : (minSpawnY + Math.random() * (maxSpawnY - minSpawnY));
    const spawnX = initialX !== undefined ? initialX : (direction > 0 ? (ArcheryGame.width * 0.3) : (ArcheryGame.width - 60));

    ArcheryGame.targets.push({
      word: word,
      emoji: emoji,
      isTarget: isTarget,
      x: spawnX,
      y: spawnY,
      baseY: spawnY,
      vx: direction * speed,
      vy: 0,
      radius: 36,
      scale: initialX !== undefined ? 1 : 0.1,
      targetScale: 1,
      alpha: initialX !== undefined ? 1 : 0,
      targetAlpha: 1,
      waveOffset: Math.random() * Math.PI * 2,
      waveSpeed: 0.035 + Math.random() * 0.02,
      waveAmp: 18 + Math.random() * 14,
      life: 250 + Math.random() * 100,
      isFading: false,
      wobble: 0
    });

    createSparkleBurst(spawnX, spawnY, isTarget ? '#FDE047' : '#93C5FD', 8);
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

      const minX = ArcheryGame.width * 0.30;
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

    // Si la palabra objetivo desapareció y no estamos en transición de victoria/avance, reaparecerla
    if (!hasTargetWord && !ArcheryGame.isAdvancing && ArcheryGame.targets.length < 5) {
      const rx = ArcheryGame.width * (0.42 + Math.random() * 0.45);
      const ry = 80 + Math.random() * (ArcheryGame.height - 240);
      spawnTarget(ArcheryGame.targetWord, true, rx, ry);
    }

    if (ArcheryGame.targets.length < 3) {
      const pool = ArcheryGame.taskWords.filter(w => w !== ArcheryGame.targetWord);
      const randomWord = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : 'SOL';
      const rx = ArcheryGame.width * (0.42 + Math.random() * 0.45);
      const ry = 80 + Math.random() * (ArcheryGame.height - 240);
      spawnTarget(randomWord, false, rx, ry);
    }
  }

  // --- DISPARO INSTANTÁNEO Y BALÍSTICA DE FLECHAS ---
  function shootArrowAt(targetX, targetY) {
    const ax = ArcheryGame.archer.x + 25;
    const ay = ArcheryGame.archer.y - 30;

    const dx = targetX - ax;
    const dy = targetY - ay;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 10) return;

    const angle = Math.atan2(dy, dx);
    const speed = 26;

    ArcheryGame.arrows.push({
      x: ax,
      y: ay,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      angle: angle,
      life: 90
    });

    ArcheryGame.archer.aimAngle = angle;
    ArcheryGame.archer.targetAimAngle = angle;
    ArcheryGame.archer.isShooting = true;
    ArcheryGame.archer.recoil = 16;
    ArcheryGame.archer.shootCooldown = 8;

    playBowTwangSound();
    createSparkleBurst(ax + Math.cos(angle) * 32, ay + Math.sin(angle) * 32, '#F59E0B', 8);
  }

  function updateArrows() {
    for (let i = ArcheryGame.arrows.length - 1; i >= 0; i--) {
      const arr = ArcheryGame.arrows[i];

      arr.x += arr.vx;
      arr.y += arr.vy;
      arr.vy += 0.06;
      arr.angle = Math.atan2(arr.vy, arr.vx);

      ArcheryGame.particles.push({
        x: arr.x - Math.cos(arr.angle) * 16,
        y: arr.y - Math.sin(arr.angle) * 16,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        color: '#FDE047',
        size: 3,
        alpha: 0.9,
        decay: 0.05
      });

      let hit = false;
      for (let j = 0; j < ArcheryGame.targets.length; j++) {
        const target = ArcheryGame.targets[j];
        if (target.alpha < 0.35) continue;

        const tdx = arr.x - target.x;
        const tdy = arr.y - target.y;
        const dist = Math.sqrt(tdx * tdx + tdy * tdy);

        if (dist < target.radius + 20) {
          handleArrowHitTarget(arr, target);
          hit = true;
          break;
        }
      }

      if (hit) {
        ArcheryGame.arrows.splice(i, 1);
        continue;
      }

      if (arr.x > ArcheryGame.width + 60 || arr.y > ArcheryGame.height + 60 || arr.x < -60) {
        ArcheryGame.arrows.splice(i, 1);
      }
    }
  }

  function handleArrowHitTarget(arrow, target) {
    if (target.isTarget) {
      // ✅ ACIERTO EN LA PALABRA CORRECTA
      playArrowHitSound();
      playArcherySuccessChime();

      createConfettiBurst(target.x, target.y, 30);
      createFloatingText(target.x, target.y - 25, '¡EXCELENTE! +10 🪙', '#059669');

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
        speakText(`¡Muy bien! ¡Le diste a ${pronWord}!`);
      }

      target.isFading = true;
      target.targetScale = 1.35;
      target.targetAlpha = 0;

      // Evitar avanzar múltiples veces si varias flechas impactan a la vez
      if (!ArcheryGame.isAdvancing) {
        ArcheryGame.isAdvancing = true;
        if (ArcheryGame.advanceTimeout) clearTimeout(ArcheryGame.advanceTimeout);
        ArcheryGame.advanceTimeout = setTimeout(() => {
          setupTargetWord(ArcheryGame.targetWordIndex + 1);
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
    const tailWag = Math.sin(time * 0.007) * 0.28;

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

    // Colores y atributos por mascota elegida
    let coatColor = '#F59E0B';
    let coatStroke = '#D97706';
    let headColor = '#FEF3C7';
    let chestColor = '#FFFFFF';
    let isBunny = petType.includes('🐰') || petType.includes('rabbit');
    let isCat = petType.includes('🐱') || petType.includes('cat');
    let isFox = petType.includes('🦊') || petType.includes('fox');
    let isUnicorn = petType.includes('🦄') || petType.includes('unicorn');
    let isBear = petType.includes('🐻') || petType.includes('bear');
    let isLion = petType.includes('🦁') || petType.includes('lion');
    let isDog = petType.includes('🐶') || petType.includes('dog') || (!isBunny && !isCat && !isFox && !isUnicorn && !isBear && !isLion);

    if (isCat) {
      coatColor = '#FED7AA';
      coatStroke = '#F97316';
      headColor = '#FFF7ED';
      chestColor = '#FFFFFF';
    } else if (isFox) {
      coatColor = '#EA580C';
      coatStroke = '#C2410C';
      headColor = '#FFEDD5';
      chestColor = '#FFFFFF';
    } else if (isBunny) {
      coatColor = '#F8FAFC';
      coatStroke = '#CBD5E1';
      headColor = '#FFFFFF';
      chestColor = '#F1F5F9';
    } else if (isUnicorn) {
      coatColor = '#FFFFFF';
      coatStroke = '#FBBF24';
      headColor = '#FEF3C7';
      chestColor = '#FFFFFF';
    } else if (isBear) {
      coatColor = '#78350F';
      coatStroke = '#451A03';
      headColor = '#92400E';
      chestColor = '#D97706';
    } else if (isLion) {
      coatColor = '#D97706';
      coatStroke = '#B45309';
      headColor = '#FDE68A';
      chestColor = '#FEF3C7';
    }

    ctx.save();
    try {
      ctx.translate(a.x, a.y + a.jumpY);

      // Sombra en el suelo
      ctx.beginPath();
      ctx.ellipse(0, 32, 40, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fill();

      // Carcaj de arquero en la espalda
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

      // COLA ESPECÍFICA DE CADA MASCOTA
      ctx.save();
      ctx.translate(-28, 5);
      ctx.rotate(-0.3 + tailWag);

      if (isBunny) {
        // Cola redonda de pompón de conejito
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-6, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (isFox) {
        // Cola tupida de zorro con punta blanca
        ctx.fillStyle = '#EA580C';
        ctx.beginPath();
        ctx.ellipse(-18, 0, 22, 11, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(-32, -3, 8, 7, -0.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (isCat) {
        // Cola esbelta y curvada de gatito
        ctx.fillStyle = coatColor;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.strokeStyle = coatColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-18, -12, -22, -26);
        ctx.stroke();
      } else if (isUnicorn) {
        // Cola mágica ondeante de unicornio
        ctx.fillStyle = '#F472B6';
        ctx.beginPath();
        ctx.ellipse(-16, 2, 18, 9, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#60A5FA';
        ctx.beginPath();
        ctx.ellipse(-14, 5, 14, 7, -0.3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Cola de perrito / oso / estándar
        ctx.fillStyle = coatColor;
        ctx.beginPath();
        ctx.ellipse(-14, 0, 16, 8, -0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // CUERPO DE LA MASCOTA
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

      // Medallón dorado con el icono de la mascota elegida
      ctx.beginPath();
      ctx.arc(6, 14, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#FEF08A';
      ctx.fill();
      ctx.strokeStyle = '#CA8A04';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '14px "Segoe UI Emoji", sans-serif';
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

      // CABEZA
      ctx.save();
      const headRot = a.aimAngle * 0.25;
      ctx.translate(2, -14 + breathing);
      ctx.rotate(headRot);

      // Melena alrededor si es león
      if (isLion) {
        ctx.fillStyle = '#B45309';
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = headColor;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = coatStroke;
      ctx.stroke();

      // Mejillas tiernas
      ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
      ctx.beginPath();
      ctx.arc(-11, 6, 5, 0, Math.PI * 2);
      ctx.arc(11, 6, 5, 0, Math.PI * 2);
      ctx.fill();

      // Hocico
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(4, 5, 11, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isCat || isBunny ? '#F472B6' : '#78350F';
      ctx.beginPath();
      ctx.arc(5, 2, 3, 0, Math.PI * 2);
      ctx.fill();

      // Bigotes si es gato
      if (isCat) {
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(14, 3); ctx.lineTo(26, 1);
        ctx.moveTo(14, 6); ctx.lineTo(25, 8);
        ctx.moveTo(-6, 3); ctx.lineTo(-18, 1);
        ctx.moveTo(-6, 6); ctx.lineTo(-17, 8);
        ctx.stroke();
      }

      // Ojos
      if (a.isBlinking) {
        ctx.strokeStyle = '#78350F';
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

      // OREJAS ESPECÍFICAS DE CADA MASCOTA
      if (isBunny) {
        // Orejas largas de conejo
        ctx.fillStyle = coatColor;
        ctx.beginPath();
        ctx.ellipse(-7, -32, 6, 20, -0.15, 0, Math.PI * 2);
        ctx.ellipse(7, -32, 6, 20, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FBCFE8';
        ctx.beginPath();
        ctx.ellipse(-7, -32, 3.5, 15, -0.15, 0, Math.PI * 2);
        ctx.ellipse(7, -32, 3.5, 15, 0.15, 0, Math.PI * 2);
        ctx.fill();
      } else if (isCat) {
        // Orejas puntiagudas de gato
        ctx.fillStyle = coatColor;
        ctx.beginPath();
        ctx.moveTo(-16, -14); ctx.lineTo(-20, -32); ctx.lineTo(-6, -20); ctx.closePath();
        ctx.moveTo(16, -14); ctx.lineTo(20, -32); ctx.lineTo(6, -20); ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#F472B6';
        ctx.beginPath();
        ctx.moveTo(-14, -16); ctx.lineTo(-17, -28); ctx.lineTo(-8, -20); ctx.closePath();
        ctx.moveTo(14, -16); ctx.lineTo(17, -28); ctx.lineTo(8, -20); ctx.closePath();
        ctx.fill();
      } else if (isFox) {
        // Orejas de zorro con punta oscura
        ctx.fillStyle = '#EA580C';
        ctx.beginPath();
        ctx.moveTo(-16, -14); ctx.lineTo(-20, -34); ctx.lineTo(-6, -20); ctx.closePath();
        ctx.moveTo(16, -14); ctx.lineTo(20, -34); ctx.lineTo(6, -20); ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.moveTo(-19, -30); ctx.lineTo(-20, -34); ctx.lineTo(-15, -30); ctx.closePath();
        ctx.moveTo(19, -30); ctx.lineTo(20, -34); ctx.lineTo(15, -30); ctx.closePath();
        ctx.fill();
      } else if (isBear) {
        // Orejas redondas de osito
        ctx.fillStyle = coatColor;
        ctx.beginPath();
        ctx.arc(-16, -18, 9, 0, Math.PI * 2);
        ctx.arc(16, -18, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FEF3C7';
        ctx.beginPath();
        ctx.arc(-16, -18, 5, 0, Math.PI * 2);
        ctx.arc(16, -18, 5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Orejas caídas de perrito (o caballo si es unicornio)
        ctx.fillStyle = coatColor;
        ctx.beginPath();
        ctx.ellipse(-14, -18, 7, 13, -0.4, 0, Math.PI * 2);
        ctx.ellipse(14, -18, 7, 13, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cuerno mágico SOLO SI ES UNICORNIO
      if (isUnicorn) {
        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.moveTo(2, -22);
        ctx.lineTo(8, -40);
        ctx.lineTo(14, -22);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#EAB308';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Sombrero de arquero heroico con pluma
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.ellipse(0, -22, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-16, -22);
      ctx.lineTo(0, -34);
      ctx.lineTo(16, -22);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.moveTo(8, -26);
      ctx.quadraticCurveTo(24, -38, 20, -48);
      ctx.quadraticCurveTo(12, -40, 6, -26);
      ctx.fill();

      ctx.restore();

      // Arco y flecha
      ctx.save();
      const recoilOffset = a.recoil;
      ctx.translate(14 - recoilOffset * Math.cos(a.aimAngle), -10 - recoilOffset * Math.sin(a.aimAngle));
      ctx.rotate(a.aimAngle);

      const bowRadius = 38;
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(0, 0, bowRadius, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();

      ctx.fillStyle = '#F59E0B';
      const topTipX = Math.cos(-Math.PI * 0.45) * bowRadius;
      const topTipY = Math.sin(-Math.PI * 0.45) * bowRadius;
      const botTipX = Math.cos(Math.PI * 0.45) * bowRadius;
      const botTipY = Math.sin(Math.PI * 0.45) * bowRadius;
      ctx.beginPath();
      ctx.arc(topTipX, topTipY, 3.5, 0, Math.PI * 2);
      ctx.arc(botTipX, botTipY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      const drawDist = (a.isAiming || (ArcheryGame.pointer && ArcheryGame.pointer.isDown)) ? 22 : 4;
      const stringPullX = -drawDist;

      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#FDE047';
      ctx.beginPath();
      ctx.moveTo(topTipX, topTipY);
      ctx.lineTo(stringPullX, 0);
      ctx.lineTo(botTipX, botTipY);
      ctx.stroke();

      if (a.shootCooldown < 6) {
        ctx.save();
        ctx.translate(stringPullX, 0);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#D97706';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(44, 0);
        ctx.stroke();

        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.moveTo(44, -4);
        ctx.lineTo(52, 0);
        ctx.lineTo(44, 4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.moveTo(2, -3);
        ctx.lineTo(10, 0);
        ctx.lineTo(2, 3);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();

      if (a.isCelebrating) {
        for (let s = 0; s < 4; s++) {
          const starAng = time * 0.008 + s * (Math.PI / 2);
          const starX = Math.cos(starAng) * 35;
          const starY = -50 + Math.sin(starAng) * 12;
          ctx.fillStyle = '#FACC15';
          ctx.beginPath();
          ctx.arc(starX, starY, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } finally {
      ctx.restore();
    }
  }

  // --- DIBUJADO DE OBJETIVOS CON SUS PALABRAS ---
  function drawTargetWord(ctx, t, time) {
    if (t.alpha <= 0.01) return;

    ctx.save();
    try {
      ctx.translate(t.x, t.y);
      ctx.scale(t.scale, t.scale);
      ctx.globalAlpha = t.alpha;

      if (t.wobble > 0) {
        ctx.rotate(Math.sin(time * 0.04) * (t.wobble * 0.02));
      }

      // Sin aura para que todas las palabras luzcan iguales y el niño deba leerlas

      // Diana de tiro con arco
      ctx.beginPath();
      ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#78350F';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, t.radius - 4, 0, Math.PI * 2);
      ctx.fillStyle = '#F8FAFC';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, t.radius - 12, 0, Math.PI * 2);
      ctx.fillStyle = '#EF4444';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, t.radius - 20, 0, Math.PI * 2);
      ctx.fillStyle = '#FACC15';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#D97706';
      ctx.stroke();

      // Dibujo / Icono arriba de la diana
      drawWordIcon(ctx, t.emoji, 0, -t.radius - 12, 30);

      // Cartel con la palabra en letras grandes
      const fontSize = Math.min(20, Math.max(15, 230 / (t.word.length + 4)));
      ctx.font = `900 ${fontSize}px "Comic Sans MS", "Nunito", sans-serif`;
      const textWidth = ctx.measureText(t.word).width;
      const badgeW = Math.max(90, textWidth + 24);
      const badgeH = 34;
      const badgeY = t.radius + 6;

      // Todas las palabras tienen exactamente el mismo recuadro blanco y borde neutro (dificultad pedagógica real)
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;

      drawRoundedRect(ctx, -badgeW / 2, badgeY, badgeW, badgeH, 12);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#64748B'; // Borde neutro idéntico en todas

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

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#78350F';
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(16, 0);
      ctx.stroke();

      ctx.fillStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.moveTo(16, -4.5);
      ctx.lineTo(26, 0);
      ctx.lineTo(16, 4.5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#10B981';
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

  // --- DIBUJADO DEL PAISAJE ---
  function drawArcheryEnvironment(ctx, w, h, time) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#7DD3FC');
    skyGrad.addColorStop(0.65, '#E0F2FE');
    skyGrad.addColorStop(1, '#F0FDF4');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    try {
      ctx.beginPath();
      ctx.arc(80, 70, 48, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(80, 70, 32, 0, Math.PI * 2);
      ctx.fillStyle = '#FEF08A';
      ctx.fill();
    } finally {
      ctx.restore();
    }

    ArcheryGame.bgClouds.forEach(c => {
      c.x += c.speed;
      if (c.x > w + 100) c.x = -120;

      ctx.save();
      try {
        ctx.translate(c.x, c.y);
        ctx.scale(c.scale, c.scale);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.arc(24, -8, 22, 0, Math.PI * 2);
        ctx.arc(48, 0, 25, 0, Math.PI * 2);
        ctx.arc(24, 12, 20, 0, Math.PI * 2);
        ctx.fill();
      } finally {
        ctx.restore();
      }
    });

    // Colinas lejanas
    ctx.fillStyle = '#86EFAC';
    ctx.beginPath();
    ctx.moveTo(0, h - 90);
    ctx.quadraticCurveTo(w * 0.35, h - 160, w * 0.7, h - 110);
    ctx.quadraticCurveTo(w * 0.88, h - 80, w, h - 100);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Colina frontal
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.moveTo(0, h - 110);
    ctx.quadraticCurveTo(w * 0.22, h - 120, w * 0.45, h - 60);
    ctx.quadraticCurveTo(w * 0.75, h - 30, w, h - 50);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#16A34A';
    for (let fx = 20; fx < w; fx += 55) {
      const fy = h - 45 + Math.sin(fx * 0.05) * 15;
      ctx.beginPath();
      ctx.arc(fx, fy, 3, 0, Math.PI * 2);
      ctx.fill();
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

      // 1. Entorno
      drawArcheryEnvironment(ctx, w, h, ArcheryGame.time);

      // 2. Objetivos móviles
      updateTargets();
      ArcheryGame.targets.forEach(t => drawTargetWord(ctx, t, ArcheryGame.time));

      // 3. Flechas
      updateArrows();
      ArcheryGame.arrows.forEach(arr => drawArrow(ctx, arr));

      // 4. Guía de trayectoria
      if (ArcheryGame.pointer.isDown || ArcheryGame.archer.isAiming) {
        drawTrajectoryDots(ctx);
      }

      // 5. Partículas y textos
      drawParticles(ctx);
      drawFloatingTexts(ctx);

      // 6. Mascota arquera animada
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
