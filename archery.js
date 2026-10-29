/**
 * ============================================================================
 * 🏹 EL ARQUERO DE CRIN - NUEVA AVENTURA DE TIRO CON ARCO Y PALABRAS
 * ============================================================================
 * Modo de juego interactivo donde la mascota (CRIN o la elegida por el niño)
 * se convierte en un arquero con bow & arrow animados al estilo videojuego.
 * Las palabras de la tarea activa flotan, emergen y se desvanecen en la arena,
 * y el niño debe apuntar y disparar su flecha a la palabra objetivo.
 */

(function(window) {
  'use strict';

  // --- ESTADO DEL JUEGO DE TIRO CON ARCO ---
  const ArcheryGame = {
    canvas: null,
    ctx: null,
    animId: null,
    isRunning: false,
    width: 800,
    height: 520,

    // Tarea y progreso
    taskWords: [],
    targetWordIndex: 0,
    targetWord: '',
    targetEmoji: '🎯',
    score: 0,
    streak: 0,

    // Mascota arquera
    archer: {
      x: 140,
      y: 410,
      baseX: 140,
      baseY: 410,
      aimAngle: -0.35, // radianes
      targetAimAngle: -0.35,
      isAiming: false,
      drawProgress: 0, // 0 a 1 (tensión de la cuerda)
      isShooting: false,
      shootCooldown: 0,
      recoil: 0,
      jumpY: 0,
      jumpVy: 0,
      isCelebrating: false,
      celebrateTimer: 0,
      blinkTimer: 180,
      isBlinking: false,
      earWagTimer: 0,
      tailAngle: 0
    },

    // Entidades en el mundo
    targets: [],
    arrows: [],
    particles: [],
    floatingTexts: [],
    bgClouds: [],

    // Control táctil / mouse
    pointer: {
      x: 400,
      y: 200,
      isDown: false,
      dragStartX: 0,
      dragStartY: 0
    },

    time: 0
  };

  // --- EFECTOS DE SONIDO SINTETIZADOS WEB AUDIO API ---
  function playBowTwangSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch(e) {}
  }

  function playArrowHitSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch(e) {}
  }

  function playArcherySuccessChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.08);
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
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
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
    if (activeTaskPackId === 'custom' && typeof customWordsList !== 'undefined' && customWordsList.length > 0) {
      words = customWordsList.map(item => item.word);
    }
    if (!words || words.length === 0) {
      words = ['ZAPATO', 'MARIPOSA', 'PELOTA', 'MAMÁ', 'GATO', 'PERRO', 'CASA', 'SOL'];
    }

    // Filtrar palabras eliminadas y limpiar
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

  // --- INICIALIZACIÓN DE LA AVENTURA ---
  window.stopArcheryGame = function() {
    ArcheryGame.isRunning = false;
    if (ArcheryGame.animId) cancelAnimationFrame(ArcheryGame.animId);
  };

  window.openArcheryQuestScreen = function() {
    if (typeof stopAllAudio === 'function') stopAllAudio();
    if (typeof switchScreen === 'function') switchScreen('archery');

    const screen = document.getElementById('screen-archery');
    if (screen) screen.classList.add('active');

    initArcheryGame();
  };

  function initArcheryGame() {
    ArcheryGame.canvas = document.getElementById('archery-game-canvas');
    if (!ArcheryGame.canvas) return;
    ArcheryGame.ctx = ArcheryGame.canvas.getContext('2d');

    resizeArcheryCanvas();
    window.addEventListener('resize', resizeArcheryCanvas);

    // Cargar palabras de la tarea activa
    ArcheryGame.taskWords = getArcheryTaskWords();
    ArcheryGame.targetWordIndex = 0;
    ArcheryGame.score = 0;
    ArcheryGame.streak = 0;
    ArcheryGame.arrows = [];
    ArcheryGame.particles = [];
    ArcheryGame.floatingTexts = [];
    ArcheryGame.targets = [];

    // Nubes de fondo
    ArcheryGame.bgClouds = [
      { x: 50, y: 70, scale: 0.9, speed: 0.25 },
      { x: 300, y: 110, scale: 0.65, speed: 0.18 },
      { x: 580, y: 60, scale: 0.8, speed: 0.22 },
      { x: 750, y: 130, scale: 0.55, speed: 0.15 }
    ];

    setupArcheryEventListeners();
    setupTargetWord(0);

    ArcheryGame.isRunning = true;
    if (ArcheryGame.animId) cancelAnimationFrame(ArcheryGame.animId);
    ArcheryGame.animId = requestAnimationFrame(archeryGameLoop);

    // Mensaje de bienvenida narrado
    setTimeout(() => {
      speakCurrentArcheryMission();
    }, 400);

    updateArcheryHUD();
  }

  function resizeArcheryCanvas() {
    if (!ArcheryGame.canvas) return;
    const container = ArcheryGame.canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.max(380, Math.floor(window.innerHeight - 170));

    ArcheryGame.width = w;
    ArcheryGame.height = h;

    ArcheryGame.canvas.width = w;
    ArcheryGame.canvas.height = h;

    // Posición base del arquero (abajo a la izquierda)
    ArcheryGame.archer.baseX = Math.max(80, Math.min(130, w * 0.15));
    ArcheryGame.archer.baseY = h - 75;
    ArcheryGame.archer.x = ArcheryGame.archer.baseX;
    ArcheryGame.archer.y = ArcheryGame.archer.baseY;
  }

  function setupTargetWord(index) {
    if (ArcheryGame.taskWords.length === 0) {
      ArcheryGame.taskWords = ['ZAPATO', 'MARIPOSA', 'PELOTA', 'MAMA'];
    }

    if (index >= ArcheryGame.taskWords.length) {
      // Tarea completada con éxito
      triggerArcheryVictory();
      return;
    }

    ArcheryGame.targetWordIndex = index;
    ArcheryGame.targetWord = ArcheryGame.taskWords[index].toUpperCase().trim();
    ArcheryGame.targetEmoji = getWordEmoji(ArcheryGame.targetWord);

    // Repoblar objetivos en pantalla garantizando que esté el objetivo y 2-3 distractores
    spawnInitialTargets();
    updateArcheryHUD();
  }

  function updateArcheryHUD() {
    const wordDisplay = document.getElementById('archery-target-word-display');
    const emojiDisplay = document.getElementById('archery-target-emoji-display');
    const progressDisplay = document.getElementById('archery-progress-badge');
    const taskNameDisplay = document.getElementById('archery-task-name');

    if (wordDisplay) wordDisplay.innerText = ArcheryGame.targetWord;
    if (emojiDisplay) {
      const emojiVal = ArcheryGame.targetEmoji;
      if (emojiVal.startsWith('assets/') || emojiVal.startsWith('data:image')) {
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
      speakText(`¡Apunta y dispara a la palabra: ${pronWord}!`);
    }
  };

  // --- GESTIÓN DE OBJETIVOS MÓVILES (WORDS TARGETS) ---
  function spawnInitialTargets() {
    ArcheryGame.targets = [];

    // 1. Añadir el objetivo principal
    spawnTarget(ArcheryGame.targetWord, true, ArcheryGame.width * 0.55, 140);

    // 2. Añadir 2 o 3 distractores tomados de la misma tarea o vocabulario
    const pool = ArcheryGame.taskWords.filter(w => w !== ArcheryGame.targetWord);
    const distractors = shuffleArrayLocal(pool).slice(0, 3);

    // Si la tarea tiene pocas palabras, añadir palabras conocidas
    if (distractors.length < 2) {
      const extraDefaults = ['SOL', 'LUNA', 'CASA', 'FLOR', 'PELOTA', 'GATO'];
      extraDefaults.forEach(dw => {
        if (dw !== ArcheryGame.targetWord && !distractors.includes(dw) && distractors.length < 3) {
          distractors.push(dw);
        }
      });
    }

    const ySlots = [90, 180, 260];
    distractors.forEach((dw, idx) => {
      const startX = ArcheryGame.width * (0.45 + idx * 0.18) + (Math.random() * 40 - 20);
      const startY = ySlots[idx % ySlots.length] + (Math.random() * 30 - 15);
      spawnTarget(dw, false, startX, startY);
    });
  }

  function spawnTarget(word, isTarget, initialX, initialY) {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const speed = 0.55 + Math.random() * 0.45;
    const emoji = getWordEmoji(word);

    ArcheryGame.targets.push({
      word: word,
      emoji: emoji,
      isTarget: isTarget,
      x: initialX !== undefined ? initialX : (direction > 0 ? -80 : ArcheryGame.width + 80),
      y: initialY !== undefined ? initialY : 80 + Math.random() * (ArcheryGame.height - 230),
      baseY: initialY !== undefined ? initialY : 80 + Math.random() * (ArcheryGame.height - 230),
      vx: direction * speed,
      vy: 0,
      radius: 36,
      scale: initialX !== undefined ? 1 : 0.05,
      targetScale: 1,
      alpha: initialX !== undefined ? 1 : 0,
      targetAlpha: 1,
      waveOffset: Math.random() * Math.PI * 2,
      waveSpeed: 0.025 + Math.random() * 0.02,
      waveAmp: 16 + Math.random() * 12,
      life: 600 + Math.random() * 400, // frames antes de desvanecerse
      isFading: false,
      wobble: 0,
      hitState: null // 'correct' o 'wrong'
    });
  }

  function updateTargets() {
    let hasTargetWordOnScreen = false;

    for (let i = ArcheryGame.targets.length - 1; i >= 0; i--) {
      const t = ArcheryGame.targets[i];

      // Animación de escala y fade in/out
      t.scale += (t.targetScale - t.scale) * 0.1;
      t.alpha += (t.targetAlpha - t.alpha) * 0.08;
      if (t.wobble > 0) t.wobble *= 0.9;

      // Movimiento horizontal y oscilación sinusoidal
      t.x += t.vx;
      t.waveOffset += t.waveSpeed;
      t.y = t.baseY + Math.sin(t.waveOffset) * t.waveAmp;

      // Rebote suave en los bordes de la arena derecha/centro
      const minX = ArcheryGame.width * 0.32;
      const maxX = ArcheryGame.width - 70;
      if (t.x < minX) {
        t.x = minX;
        t.vx = Math.abs(t.vx);
      } else if (t.x > maxX) {
        t.x = maxX;
        t.vx = -Math.abs(t.vx);
      }

      // Ciclo de desvanecimiento natural ("surgen y se desvanecen")
      t.life--;
      if (t.life <= 60 && !t.isFading) {
        t.isFading = true;
        t.targetAlpha = 0;
        t.targetScale = 0.2;
      }

      if (t.isTarget && t.alpha > 0.2) {
        hasTargetWordOnScreen = true;
      }

      // Eliminar objetivos desvanecidos
      if (t.isFading && t.alpha <= 0.05) {
        ArcheryGame.targets.splice(i, 1);
      }
    }

    // Mantener siempre el objetivo principal en pantalla
    if (!hasTargetWordOnScreen && ArcheryGame.targets.length < 5) {
      const rx = ArcheryGame.width * (0.45 + Math.random() * 0.4);
      const ry = 90 + Math.random() * (ArcheryGame.height - 230);
      spawnTarget(ArcheryGame.targetWord, true, rx, ry);
    }

    // Mantener entre 3 y 4 objetivos activos
    if (ArcheryGame.targets.length < 3) {
      const pool = ArcheryGame.taskWords.filter(w => w !== ArcheryGame.targetWord);
      const randomWord = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : 'SOL';
      const rx = ArcheryGame.width * (0.45 + Math.random() * 0.4);
      const ry = 90 + Math.random() * (ArcheryGame.height - 230);
      spawnTarget(randomWord, false, rx, ry);
    }
  }

  // --- DISPARO DE FLECHAS Y FÍSICA ---
  function shootArrowAt(targetX, targetY) {
    if (ArcheryGame.archer.shootCooldown > 0) return;

    const ax = ArcheryGame.archer.x + 25;
    const ay = ArcheryGame.archer.y - 30;

    const dx = targetX - ax;
    const dy = targetY - ay;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 20) return;

    const angle = Math.atan2(dy, dx);
    const speed = 18;

    ArcheryGame.arrows.push({
      x: ax,
      y: ay,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      angle: angle,
      life: 120,
      active: true,
      stuck: null
    });

    // Animación de disparo en la mascota
    ArcheryGame.archer.aimAngle = angle;
    ArcheryGame.archer.targetAimAngle = angle;
    ArcheryGame.archer.drawProgress = 0;
    ArcheryGame.archer.isShooting = true;
    ArcheryGame.archer.recoil = 14;
    ArcheryGame.archer.shootCooldown = 18; // frames de recarga

    playBowTwangSound();

    // Partículas de disparo en la punta del arco
    createSparkleBurst(ax + Math.cos(angle) * 30, ay + Math.sin(angle) * 30, '#F59E0B', 6);
  }

  function updateArrows() {
    for (let i = ArcheryGame.arrows.length - 1; i >= 0; i--) {
      const arr = ArcheryGame.arrows[i];

      if (arr.stuck) {
        arr.life--;
        if (arr.life <= 0) ArcheryGame.arrows.splice(i, 1);
        continue;
      }

      // Trayectoria y gravedad suave
      arr.x += arr.vx;
      arr.y += arr.vy;
      arr.vy += 0.08; // ligera caída balística
      arr.angle = Math.atan2(arr.vy, arr.vx);

      // Partículas de estela mágica
      if (Math.random() > 0.3) {
        ArcheryGame.particles.push({
          x: arr.x - Math.cos(arr.angle) * 15,
          y: arr.y - Math.sin(arr.angle) * 15,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          color: '#FDE047',
          size: 2.5 + Math.random() * 2,
          alpha: 0.9,
          decay: 0.04
        });
      }

      // Comprobación de colisión con los objetivos
      let hit = false;
      for (let j = 0; j < ArcheryGame.targets.length; j++) {
        const target = ArcheryGame.targets[j];
        if (target.alpha < 0.4) continue;

        const tdx = arr.x - target.x;
        const tdy = arr.y - target.y;
        const dist = Math.sqrt(tdx * tdx + tdy * tdy);

        // Radio de colisión (blanco + cartel)
        if (dist < target.radius + 15) {
          handleArrowHitTarget(arr, target);
          hit = true;
          break;
        }
      }

      if (hit) {
        ArcheryGame.arrows.splice(i, 1);
        continue;
      }

      // Eliminar flecha si sale de la pantalla
      if (arr.x > ArcheryGame.width + 50 || arr.y > ArcheryGame.height + 50 || arr.x < -50) {
        ArcheryGame.arrows.splice(i, 1);
      }
    }
  }

  function handleArrowHitTarget(arrow, target) {
    if (target.isTarget) {
      // ✅ IMPACTO EN LA PALABRA CORRECTA
      playArrowHitSound();
      playArcherySuccessChime();

      createConfettiBurst(target.x, target.y, 25);
      createFloatingText(target.x, target.y - 20, '¡EXCELENTE! +10 🪙', '#059669');

      // Animación de celebración de la mascota
      ArcheryGame.archer.isCelebrating = true;
      ArcheryGame.archer.celebrateTimer = 90;
      ArcheryGame.archer.jumpVy = -8;

      // Puntos y monedas para el niño
      ArcheryGame.score += 10;
      if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
        activeChildProfile.coins = (activeChildProfile.coins || 0) + 10;
        activeChildProfile.stars = (activeChildProfile.stars || 0) + 2;
        if (typeof saveActiveChildProfile === 'function') saveActiveChildProfile();
      }

      // Pronunciar felicitación
      const canon = (typeof getCanonicalWord === 'function') ? getCanonicalWord(target.word) : null;
      const pronWord = canon ? canon.pronunciacion : target.word;
      if (typeof speakText === 'function') {
        speakText(`¡Excelente! ¡Le diste a ${pronWord}!`);
      }

      // Desvanecer el objetivo impactado
      target.isFading = true;
      target.targetScale = 1.3;
      target.targetAlpha = 0;

      // Avanzar a la siguiente palabra de la tarea tras una breve pausa triunfal
      setTimeout(() => {
        setupTargetWord(ArcheryGame.targetWordIndex + 1);
      }, 1400);

    } else {
      // ❌ IMPACTO EN UN DISTRACTOR
      playArcheryWrongBoing();
      target.wobble = 15;
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

  // --- CELEBRACIÓN DE VICTORIA AL COMPLETAR LA TAREA ---
  function triggerArcheryVictory() {
    ArcheryGame.isRunning = false;
    createConfettiBurst(ArcheryGame.width * 0.5, ArcheryGame.height * 0.4, 50);

    if (typeof speakText === 'function') {
      const childName = (typeof getStudentFirstName === 'function') ? getStudentFirstName() : 'gran arquero';
      speakText(`¡Misión cumplida ${childName}! ¡Completaste todas las palabras de la tarea con tu arco!`);
    }

    const modal = document.getElementById('archery-victory-modal');
    if (modal) modal.style.display = 'flex';
  }

  window.closeArcheryVictoryModal = function() {
    const modal = document.getElementById('archery-victory-modal');
    if (modal) modal.style.display = 'none';
    if (typeof switchScreen === 'function') switchScreen('map');
  };

  window.replayArcheryQuest = function() {
    const modal = document.getElementById('archery-victory-modal');
    if (modal) modal.style.display = 'none';
    initArcheryGame();
  };

  // --- RENDERIZADO DEL ARQUERO (MASCOTA VIDEOJUEGO) ---
  function drawMascotArcher(ctx, time) {
    const a = ArcheryGame.archer;
    const petType = (typeof gameState !== 'undefined' && gameState.pet) ? gameState.pet : '🦄';

    // Fisiología y oscilaciones
    const breathing = Math.sin(time * 0.003) * 2.5;
    const tailWag = Math.sin(time * 0.006) * 0.25;

    // Actualizar salto de celebración
    if (a.isCelebrating) {
      a.jumpY += a.jumpVy;
      a.jumpVy += 0.5; // gravedad
      if (a.jumpY > 0) {
        a.jumpY = 0;
        a.jumpVy = -7; // rebote alegre
      }
      a.celebrateTimer--;
      if (a.celebrateTimer <= 0) {
        a.isCelebrating = false;
        a.jumpY = 0;
      }
    }

    // Suavizado del ángulo de mira
    a.aimAngle += (a.targetAimAngle - a.aimAngle) * 0.2;
    if (a.recoil > 0) a.recoil *= 0.8;
    if (a.shootCooldown > 0) a.shootCooldown--;

    // Ciclo de parpadeo
    a.blinkTimer--;
    if (a.blinkTimer <= 0) {
      a.isBlinking = true;
      if (a.blinkTimer < -8) {
        a.isBlinking = false;
        a.blinkTimer = 180 + Math.random() * 120;
      }
    }

    ctx.save();
    ctx.translate(a.x, a.y + a.jumpY);

    // Sombra en el pasto
    ctx.beginPath();
    ctx.ellipse(0, 32, 38, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.fill();

    // 1. CARCAJ DE FLECHAS (EN LA ESPALDA)
    ctx.save();
    ctx.rotate(0.35);
    ctx.fillStyle = '#78350F';
    ctx.fillRect(-38, -35, 14, 38);
    ctx.fillStyle = '#B45309';
    ctx.fillRect(-37, -33, 12, 6);
    // Plumas de las flechas asomando del carcaj
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

    // 2. COLA DE LA MASCOTA
    ctx.save();
    ctx.translate(-28, 5);
    ctx.rotate(-0.3 + tailWag);
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.ellipse(-14, 0, 16, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. CUERPO DE LA MASCOTA
    ctx.save();
    ctx.translate(0, breathing);
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.ellipse(-5, 8, 28, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#D97706';
    ctx.stroke();

    // Pecho blanco esponjoso
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(8, 10, 14, 16, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. PATITAS DELANTERAS Y TRASERAS
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.ellipse(-15, 28, 9, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(8, 28, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. CABEZA DE LA MASCOTA (GIRA SUAVEMENTE HACIA LA MIRA)
    ctx.save();
    const headRot = a.aimAngle * 0.25;
    ctx.translate(2, -14 + breathing);
    ctx.rotate(headRot);

    // Cara principal
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#D97706';
    ctx.stroke();

    // Mejillas rosadas tiernas
    ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
    ctx.beginPath();
    ctx.arc(-11, 6, 5, 0, Math.PI * 2);
    ctx.arc(11, 6, 5, 0, Math.PI * 2);
    ctx.fill();

    // Hocico adorable
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(4, 5, 11, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.arc(5, 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Ojos expresivos con pupila que sigue el blanco
    if (a.isBlinking) {
      // Ojo cerrado feliz (^_^)
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-4, -4, 4, Math.PI, 0);
      ctx.arc(10, -4, 4, Math.PI, 0);
      ctx.stroke();
    } else {
      // Ojo abierto con brillo estilo animé
      const eyeLookX = Math.cos(a.aimAngle) * 2;
      const eyeLookY = Math.sin(a.aimAngle) * 2;

      // Ojo izquierdo
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

      // Ojo derecho
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

    // Orejas adorables
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.ellipse(-14, -18, 7, 13, -0.4, 0, Math.PI * 2);
    ctx.ellipse(14, -18, 7, 13, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Cuerno mágico de CRIN si es unicornio
    if (petType.includes('🦄') || petType.includes('unicorn') || true) {
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.moveTo(2, -22);
      ctx.lineTo(8, -38);
      ctx.lineTo(14, -22);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#EAB308';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Sombrero de arquero con pluma verde
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
    // Pluma blanca y dorada
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.moveTo(8, -26);
    ctx.quadraticCurveTo(24, -38, 20, -48);
    ctx.quadraticCurveTo(12, -40, 6, -26);
    ctx.fill();

    ctx.restore(); // fin cabeza

    // 6. ARCO Y FLECHA (PIVOTA DIRECTO AL ÁNGULO DE MIRA)
    ctx.save();
    const recoilOffset = a.recoil;
    ctx.translate(14 - recoilOffset * Math.cos(a.aimAngle), -10 - recoilOffset * Math.sin(a.aimAngle));
    ctx.rotate(a.aimAngle);

    // Dibujar el arco recurvo de madera noble
    const bowRadius = 38;
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = '#78350F';
    ctx.beginPath();
    ctx.arc(0, 0, bowRadius, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();

    // Puntas doradas del arco
    ctx.fillStyle = '#F59E0B';
    const topTipX = Math.cos(-Math.PI * 0.45) * bowRadius;
    const topTipY = Math.sin(-Math.PI * 0.45) * bowRadius;
    const botTipX = Math.cos(Math.PI * 0.45) * bowRadius;
    const botTipY = Math.sin(Math.PI * 0.45) * bowRadius;
    ctx.beginPath();
    ctx.arc(topTipX, topTipY, 3.5, 0, Math.PI * 2);
    ctx.arc(botTipX, botTipY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Cuerda del arco (tensada hacia atrás si está apuntando)
    const drawDist = (a.isAiming || a.pointer.isDown) ? 22 : 4;
    const stringPullX = -drawDist;

    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#FDE047';
    ctx.beginPath();
    ctx.moveTo(topTipX, topTipY);
    ctx.lineTo(stringPullX, 0);
    ctx.lineTo(botTipX, botTipY);
    ctx.stroke();

    // Flecha nockada en la cuerda lista para disparar
    if (a.shootCooldown < 12) {
      ctx.save();
      ctx.translate(stringPullX, 0);
      // Caña de la flecha
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#D97706';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(44, 0);
      ctx.stroke();
      // Punta metálica reluciente
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(44, -4);
      ctx.lineTo(52, 0);
      ctx.lineTo(44, 4);
      ctx.closePath();
      ctx.fill();
      // Brillo en la punta
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(52, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      // Plumas fletching
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.moveTo(2, -3);
      ctx.lineTo(10, 0);
      ctx.lineTo(2, 3);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore(); // fin arco

    // Estrellas de victoria orbitando si está celebrando
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

    ctx.restore(); // fin mascota
  }

  // --- DIBUJADO DE LOS OBJETIVOS CON SUS PALABRAS ---
  function drawTargetWord(ctx, t, time) {
    if (t.alpha <= 0.01) return;

    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.scale(t.scale, t.scale);
    ctx.globalAlpha = t.alpha;

    if (t.wobble > 0) {
      ctx.rotate(Math.sin(time * 0.04) * (t.wobble * 0.02));
    }

    // Aura mágica del objetivo principal
    if (t.isTarget) {
      const pulse = Math.sin(time * 0.006) * 4;
      ctx.beginPath();
      ctx.arc(0, 0, t.radius + 10 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.28)';
      ctx.fill();
    }

    // 1. BLANCO DE TIRO CON ARCO (CONCÉNTRICO PROFESIONAL)
    // Anillo exterior de madera
    ctx.beginPath();
    ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#78350F';
    ctx.fill();

    // Anillo blanco
    ctx.beginPath();
    ctx.arc(0, 0, t.radius - 4, 0, Math.PI * 2);
    ctx.fillStyle = '#F8FAFC';
    ctx.fill();

    // Anillo rojo
    ctx.beginPath();
    ctx.arc(0, 0, t.radius - 12, 0, Math.PI * 2);
    ctx.fillStyle = '#EF4444';
    ctx.fill();

    // Centro dorado (Diana)
    ctx.beginPath();
    ctx.arc(0, 0, t.radius - 20, 0, Math.PI * 2);
    ctx.fillStyle = '#FACC15';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#D97706';
    ctx.stroke();

    // 2. ICONO / EMOJI DEL OBJETO
    ctx.save();
    ctx.translate(0, -t.radius - 10);
    ctx.font = '24px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (t.emoji && (t.emoji.startsWith('assets/') || t.emoji.startsWith('data:image'))) {
      // Dibujar imagen pequeña si está cargada o emoji genérico
      ctx.fillText('🎯', 0, 0);
    } else {
      ctx.fillText(t.emoji || '⭐', 0, 0);
    }
    ctx.restore();

    // 3. CARTEL / PLACA CON LA PALABRA EN LETRAS GRANDES Y LEGIBLES
    const fontSize = Math.min(20, Math.max(15, 230 / (t.word.length + 4)));
    ctx.font = `900 ${fontSize}px "Comic Sans MS", "Nunito", sans-serif`;
    const textWidth = ctx.measureText(t.word).width;
    const badgeW = Math.max(88, textWidth + 24);
    const badgeH = 34;
    const badgeY = t.radius + 6;

    // Fondo del cartel de madera pulida
    ctx.fillStyle = t.isTarget ? '#FEF08A' : '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    ctx.beginPath();
    ctx.roundRect(-badgeW / 2, badgeY, badgeW, badgeH, 12);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.lineWidth = t.isTarget ? 3 : 2;
    ctx.strokeStyle = t.isTarget ? '#CA8A04' : '#94A3B8';
    ctx.stroke();

    // Texto de la palabra en alto contraste
    ctx.fillStyle = t.isTarget ? '#854D0E' : '#1E293B';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t.word, 0, badgeY + badgeH / 2 + 1);

    ctx.restore();
  }

  // --- DIBUJADO DE FLECHAS, ESTELAS Y PARTÍCULAS ---
  function drawArrow(ctx, arr) {
    ctx.save();
    ctx.translate(arr.x, arr.y);
    ctx.rotate(arr.angle);

    // Caña de madera
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#78350F';
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(16, 0);
    ctx.stroke();

    // Punta metálica
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.moveTo(16, -4.5);
    ctx.lineTo(26, 0);
    ctx.lineTo(16, 4.5);
    ctx.closePath();
    ctx.fill();

    // Plumas fletching
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.moveTo(-22, -4);
    ctx.lineTo(-12, 0);
    ctx.lineTo(-22, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawTrajectoryDots(ctx) {
    const a = ArcheryGame.archer;
    const startX = a.x + 25;
    const startY = a.y - 30;

    const angle = a.aimAngle;
    const speed = 18;
    let simX = startX;
    let simY = startY;
    let simVy = Math.sin(angle) * speed;
    let simVx = Math.cos(angle) * speed;

    ctx.save();
    for (let k = 1; k <= 10; k++) {
      simX += simVx * 1.5;
      simY += simVy * 1.5;
      simVy += 0.08 * 1.5;

      const alpha = 1 - (k / 11);
      const size = 3.5 * alpha;
      ctx.fillStyle = `rgba(253, 224, 71, ${alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(simX, simY, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
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
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = '900 20px "Comic Sans MS", "Nunito", sans-serif';
      ctx.fillStyle = ft.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
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

  // --- DIBUJADO DEL PAISAJE / ARENA ---
  function drawArcheryEnvironment(ctx, w, h, time) {
    // 1. Cielo con degradado suave mágico
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#7DD3FC');
    skyGrad.addColorStop(0.65, '#E0F2FE');
    skyGrad.addColorStop(1, '#F0FDF4');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Sol suave con rayos cálidos
    ctx.save();
    ctx.beginPath();
    ctx.arc(80, 70, 48, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(80, 70, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#FEF08A';
    ctx.fill();
    ctx.restore();

    // 3. Nubes flotantes
    ArcheryGame.bgClouds.forEach(c => {
      c.x += c.speed;
      if (c.x > w + 100) c.x = -120;

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.scale, c.scale);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.arc(24, -8, 22, 0, Math.PI * 2);
      ctx.arc(48, 0, 25, 0, Math.PI * 2);
      ctx.arc(24, 12, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 4. Colinas lejanas
    ctx.fillStyle = '#86EFAC';
    ctx.beginPath();
    ctx.moveTo(0, h - 90);
    ctx.quadraticCurveTo(w * 0.35, h - 160, w * 0.7, h - 110);
    ctx.quadraticCurveTo(w * 0.88, h - 80, w, h - 100);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // 5. Colina en primer plano donde se para la mascota
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.moveTo(0, h - 110);
    ctx.quadraticCurveTo(w * 0.22, h - 120, w * 0.45, h - 60);
    ctx.quadraticCurveTo(w * 0.75, h - 30, w, h - 50);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Pasto y flores decorativas
    ctx.fillStyle = '#16A34A';
    for (let fx = 20; fx < w; fx += 55) {
      const fy = h - 45 + Math.sin(fx * 0.05) * 15;
      ctx.beginPath();
      ctx.arc(fx, fy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- BUCLE PRINCIPAL DE ANIMACIÓN Y RENDER (60 FPS) ---
  function archeryGameLoop(timestamp) {
    if (!ArcheryGame.isRunning) return;

    ArcheryGame.time = timestamp || 0;
    const ctx = ArcheryGame.ctx;
    const w = ArcheryGame.width;
    const h = ArcheryGame.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Entorno / Paisaje
    drawArcheryEnvironment(ctx, w, h, ArcheryGame.time);

    // 2. Actualizar y dibujar objetivos
    updateTargets();
    ArcheryGame.targets.forEach(t => drawTargetWord(ctx, t, ArcheryGame.time));

    // 3. Actualizar y dibujar flechas
    updateArrows();
    ArcheryGame.arrows.forEach(arr => drawArrow(ctx, arr));

    // 4. Trayectoria de mira si el jugador está interactuando
    if (ArcheryGame.pointer.isDown || ArcheryGame.archer.isAiming) {
      drawTrajectoryDots(ctx);
    }

    // 5. Partículas y textos flotantes
    drawParticles(ctx);
    drawFloatingTexts(ctx);

    // 6. Mascota arquera animada
    drawMascotArcher(ctx, ArcheryGame.time);

    ArcheryGame.animId = requestAnimationFrame(archeryGameLoop);
  }

  // --- CONTROLES INTERACTIVOS (TOUCH & MOUSE) ---
  function setupArcheryEventListeners() {
    const canvas = ArcheryGame.canvas;
    if (!canvas) return;

    function getCanvasPos(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    // Al mover cursor o tocar: apuntar
    function onPointerMove(e) {
      const pos = getCanvasPos(e);
      ArcheryGame.pointer.x = pos.x;
      ArcheryGame.pointer.y = pos.y;

      const ax = ArcheryGame.archer.x + 25;
      const ay = ArcheryGame.archer.y - 30;
      ArcheryGame.archer.targetAimAngle = Math.atan2(pos.y - ay, pos.x - ax);
    }

    // Al presionar: tensar cuerda
    function onPointerDown(e) {
      const pos = getCanvasPos(e);
      ArcheryGame.pointer.isDown = true;
      ArcheryGame.pointer.dragStartX = pos.x;
      ArcheryGame.pointer.dragStartY = pos.y;
      ArcheryGame.archer.isAiming = true;

      onPointerMove(e);
    }

    // Al soltar: disparar flecha hacia la posición indicada
    function onPointerUp(e) {
      if (!ArcheryGame.pointer.isDown) return;
      ArcheryGame.pointer.isDown = false;
      ArcheryGame.archer.isAiming = false;

      // Disparar hacia donde apuntó
      shootArrowAt(ArcheryGame.pointer.x, ArcheryGame.pointer.y);
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

  // Utilidad de mezcla de arrays
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
