// =========================================================================
// CRIN AVENTURAS DE LECTOESCRITURA - EL SAFARI DE LA ORIENTACIÓN ESPACIAL
// Módulo Psicopedagógico de Orientación y Relaciones Espaciales (Paso 3)
// Protocolo: dentro/fuera, encima/debajo, delante/detrás, abierto/cerrado,
//            ancho/estrecho, cerca/lejos, primero/en medio/último, izquierda/derecha.
// Metodología: DUA, Aprendizaje Sin Error, Andamiaje Escalonado, Memoria Anti-repetición.
// =========================================================================

(function() {
  'use strict';

  // Memoria entre partidas para no repetir desafíos de forma idéntica
  const SpatialSafariMemory = {
    usedChallengeKeys: []
  };

  const SpatialSafariGame = {
    isRunning: false,
    roundsSession: 6,
    currentRoundIndex: 0,
    roundDeck: [],
    currentRound: null,

    isSpeaking: false,
    isTransitioning: false,
    hintTimer: null,
    speechWatchdog: null,

    starsEarned: 0,
    coinsEarned: 0
  };

  window.SpatialSafariGame = SpatialSafariGame;

  // Catálogo integral de los 8 retos espaciales del protocolo
  const SPATIAL_CHALLENGES = [
    {
      key: 'dentro_fuera_dentro',
      type: 'pair',
      family: 'dentro_fuera',
      title: 'La Casita del Perrito',
      target: 'dentro',
      prompt: '¿Quién está DENTRO de la casita?',
      praise: '¡Exacto! ¡El perrito está dentro protegido en su casita!',
      help: 'Observa con atención: este perrito está fuera jugando en el pasto. ¡Busquemos al que está dentro!',
      items: [
        { id: 'dentro', name: 'Dentro de la casa', img: 'assets/espacial_dentro.png?v=323', isCorrect: true },
        { id: 'fuera', name: 'Fuera en el jardín', img: 'assets/espacial_fuera.png?v=323', isCorrect: false }
      ]
    },
    {
      key: 'dentro_fuera_fuera',
      type: 'pair',
      family: 'dentro_fuera',
      title: 'La Casita del Perrito',
      target: 'fuera',
      prompt: 'Toca al perrito que está FUERA jugando al sol.',
      praise: '¡Exacto! ¡Ese perrito está fuera corriendo libremente!',
      help: 'Observa bien: este perrito está dentro de su casita. ¡Busquemos al que está fuera!',
      items: [
        { id: 'dentro', name: 'Dentro de la casa', img: 'assets/espacial_dentro.png?v=323', isCorrect: false },
        { id: 'fuera', name: 'Fuera en el jardín', img: 'assets/espacial_fuera.png?v=323', isCorrect: true }
      ]
    },
    {
      key: 'encima_debajo_encima',
      type: 'table_interactive',
      family: 'encima_debajo',
      title: 'La Mesa de Juguetes',
      target: 'encima',
      prompt: 'Toca la pelota que está ENCIMA de la mesa.',
      praise: '¡Exacto! ¡Esa pelota está encima de la mesa!',
      help: 'Observa bien: esa pelota está debajo en el suelo. ¡Toquemos la que está encima!',
      bgImg: 'assets/espacial_mesa_pelotas.png?v=323'
    },
    {
      key: 'encima_debajo_debajo',
      type: 'table_interactive',
      family: 'encima_debajo',
      title: 'La Mesa de Juguetes',
      target: 'debajo',
      prompt: 'Toca la pelota que está DEBAJO de la mesa.',
      praise: '¡Exacto! ¡Esa pelota está debajo de la mesa en el suelo!',
      help: 'Observa bien: esa pelota está encima de la mesa. ¡Toquemos la que está debajo!',
      bgImg: 'assets/espacial_mesa_pelotas.png?v=323'
    },
    {
      key: 'delante_detras_delante',
      type: 'pair',
      family: 'delante_detras',
      title: 'El Árbol del Bosque',
      target: 'delante',
      prompt: '¿Quién está DELANTE del árbol saludando?',
      praise: '¡Exacto! ¡El osito está delante saludándote muy feliz!',
      help: 'Observa con atención: ese osito se esconde detrás. ¡Busquemos al que está delante!',
      items: [
        { id: 'delante', name: 'Delante del árbol', img: 'assets/espacial_delante.png?v=323', isCorrect: true },
        { id: 'detras', name: 'Detrás del árbol', img: 'assets/espacial_detras.png?v=323', isCorrect: false }
      ]
    },
    {
      key: 'delante_detras_detras',
      type: 'pair',
      family: 'delante_detras',
      title: 'El Árbol del Bosque',
      target: 'detras',
      prompt: 'Toca al osito que se esconde DETRÁS del árbol.',
      praise: '¡Exacto! ¡Lo encontraste jugando a las escondidas detrás del tronco!',
      help: 'Observa bien: ese osito está delante. ¡Busquemos al que se esconde detrás!',
      items: [
        { id: 'delante', name: 'Delante del árbol', img: 'assets/espacial_delante.png?v=323', isCorrect: false },
        { id: 'detras', name: 'Detrás del árbol', img: 'assets/espacial_detras.png?v=323', isCorrect: true }
      ]
    },
    {
      key: 'abierto_cerrado_abierto',
      type: 'pair',
      family: 'abierto_cerrado',
      title: 'Los Cofres Mágicos',
      target: 'abierto',
      prompt: 'Toca el cofre que está ABIERTO con destellos brillantes.',
      praise: '¡Exacto! ¡Ese cofre está abierto y lleno de magia!',
      help: 'Observa con atención: ese cofre está cerrado con su cinta dorada. ¡Busquemos el que está abierto!',
      items: [
        { id: 'abierto', name: 'Cofre abierto', img: 'assets/espacial_abierto.png?v=323', isCorrect: true },
        { id: 'cerrado', name: 'Cofre cerrado', img: 'assets/espacial_cerrado.png?v=323', isCorrect: false }
      ]
    },
    {
      key: 'abierto_cerrado_cerrado',
      type: 'pair',
      family: 'abierto_cerrado',
      title: 'Los Cofres Mágicos',
      target: 'cerrado',
      prompt: 'Toca el cofre que está CERRADO con su lazo dorado.',
      praise: '¡Exacto! ¡Ese cofre está cerrado guardando un secreto!',
      help: 'Observa bien: ese cofre está abierto. ¡Busquemos el que está cerrado!',
      items: [
        { id: 'abierto', name: 'Cofre abierto', img: 'assets/espacial_abierto.png?v=323', isCorrect: false },
        { id: 'cerrado', name: 'Cofre cerrado', img: 'assets/espacial_cerrado.png?v=323', isCorrect: true }
      ]
    },
    {
      key: 'ancho_estrecho_ancho',
      type: 'pair',
      family: 'ancho_estrecho',
      title: 'El Cruce del Río',
      target: 'ancho',
      prompt: '¿Cuál puente es más ANCHO para que pase el elefante?',
      praise: '¡Exacto! ¡Ese puente es muy ancho y fuerte!',
      help: 'Observa bien: ese caminito es estrecho y delgadito. ¡Busquemos el puente más ancho!',
      items: [
        { id: 'ancho', name: 'Puente ancho', img: 'assets/espacial_puente_ancho.png?v=323', isCorrect: true },
        { id: 'estrecho', name: 'Puente estrecho', img: 'assets/espacial_puente_estrecho.png?v=323', isCorrect: false }
      ]
    },
    {
      key: 'ancho_estrecho_estrecho',
      type: 'pair',
      family: 'ancho_estrecho',
      title: 'El Cruce del Río',
      target: 'estrecho',
      prompt: 'Toca el puente más ESTRECHO y delgadito.',
      praise: '¡Exacto! ¡Ese es el puente estrecho por donde pasa el patito!',
      help: 'Observa con atención: ese puente es muy ancho. ¡Busquemos el puente más estrecho!',
      items: [
        { id: 'ancho', name: 'Puente ancho', img: 'assets/espacial_puente_ancho.png?v=323', isCorrect: false },
        { id: 'estrecho', name: 'Puente estrecho', img: 'assets/espacial_puente_estrecho.png?v=323', isCorrect: true }
      ]
    },
    {
      key: 'cerca_lejos_cerca',
      type: 'cerca_lejos_interactive',
      family: 'cerca_lejos',
      title: 'El Valle de los Conejitos',
      target: 'cerca',
      prompt: 'Toca al conejito que está bien CERCA de nosotros.',
      praise: '¡Exacto! ¡Ese conejito está muy cerquita en primer plano!',
      help: 'Observa con atención: ese conejito está lejos en la montaña. ¡Busquemos al que está cerca!',
      bgImg: 'assets/espacial_cerca_lejos.png?v=323'
    },
    {
      key: 'cerca_lejos_lejos',
      type: 'cerca_lejos_interactive',
      family: 'cerca_lejos',
      title: 'El Valle de los Conejitos',
      target: 'lejos',
      prompt: 'Toca al conejito que está LEJOS en la colina.',
      praise: '¡Exacto! ¡Lo viste a lo lejos en la cima de la montaña!',
      help: 'Observa bien: ese conejito está aquí muy cerca. ¡Busquemos al que está lejos!',
      bgImg: 'assets/espacial_cerca_lejos.png?v=323'
    },
    {
      key: 'fila_primero',
      type: 'fila_interactive',
      family: 'serializacion',
      title: 'La Fila del Safari',
      target: 'primero',
      prompt: '¿Quién está PRIMERO en la fila del safari?',
      praise: '¡Exacto! ¡El simpático leoncito va primero guiando la fila!',
      help: 'Observa la fila de izquierda a derecha: ¡toquemos al que está en el primer lugar!',
      bgImg: 'assets/espacial_fila_animales.png?v=323'
    },
    {
      key: 'fila_medio',
      type: 'fila_interactive',
      family: 'serializacion',
      title: 'La Fila del Safari',
      target: 'en_medio',
      prompt: 'Toca al animalito que está EN MEDIO de sus amigos.',
      praise: '¡Exacto! ¡El monito travieso está justo en el medio!',
      help: 'Observa con atención: el león está primero y la jirafa de última. ¡Toquemos al que está en medio!',
      bgImg: 'assets/espacial_fila_animales.png?v=323'
    },
    {
      key: 'fila_ultimo',
      type: 'fila_interactive',
      family: 'serializacion',
      title: 'La Fila del Safari',
      target: 'ultimo',
      prompt: '¿Quién quedó ÚLTIMO al final de la fila?',
      praise: '¡Exacto! ¡La dulce jirafita está de última al final de la fila!',
      help: 'Observa el final de la fila: ¡toquemos al animalito que está en el último lugar!',
      bgImg: 'assets/espacial_fila_animales.png?v=323'
    },
    {
      key: 'izquierda_derecha_izquierda',
      type: 'pair',
      family: 'lateralidad',
      title: 'Las Direcciones',
      target: 'izquierda',
      prompt: 'Toca la manito que apunta a la IZQUIERDA 👈',
      praise: '¡Exacto! ¡Hacia la izquierda, muy bien ubicado!',
      help: 'Observa la flecha azul: esa apunta a la derecha. ¡Busquemos la que apunta a la izquierda!',
      items: [
        { id: 'izquierda', name: 'Izquierda 👈', img: 'assets/espacial_izquierda.png?v=323', isCorrect: true },
        { id: 'derecha', name: 'Derecha 👉', img: 'assets/espacial_derecha.png?v=323', isCorrect: false }
      ]
    },
    {
      key: 'izquierda_derecha_derecha',
      type: 'pair',
      family: 'lateralidad',
      title: 'Las Direcciones',
      target: 'derecha',
      prompt: 'Toca la manito que apunta a la DERECHA 👉',
      praise: '¡Exacto! ¡Hacia la derecha, excelente dirección!',
      help: 'Observa la flecha: esa apunta a la izquierda. ¡Busquemos la que apunta a la derecha!',
      items: [
        { id: 'izquierda', name: 'Izquierda 👈', img: 'assets/espacial_izquierda.png?v=323', isCorrect: false },
        { id: 'derecha', name: 'Derecha 👉', img: 'assets/espacial_derecha.png?v=323', isCorrect: true }
      ]
    }
  ];

  // Barajado aleatorio Fisher-Yates
  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Generador dinámico de sesión (6 rondas sin repetir conceptos entre partidas)
  function buildSpatialDeck(count = 6) {
    // Agrupar por familias para garantizar variedad
    const familyMap = {};
    SPATIAL_CHALLENGES.forEach(c => {
      if (!familyMap[c.family]) familyMap[c.family] = [];
      familyMap[c.family].push(c);
    });

    const families = Object.keys(familyMap);
    const shuffledFamilies = shuffleArray(families);

    // Evitar las familias de la partida inmediatamente anterior si es posible
    const lastKeys = SpatialSafariMemory.usedChallengeKeys.slice(-count);
    
    let picked = [];
    shuffledFamilies.forEach(fam => {
      if (picked.length >= count) return;
      const candidates = familyMap[fam];
      // Preferir el que no se haya usado recientemente
      let chosen = candidates.find(c => !lastKeys.includes(c.key));
      if (!chosen) chosen = candidates[Math.floor(Math.random() * candidates.length)];
      picked.push(chosen);
    });

    // Registrar en memoria
    picked.forEach(c => SpatialSafariMemory.usedChallengeKeys.push(c.key));
    if (SpatialSafariMemory.usedChallengeKeys.length > 24) {
      SpatialSafariMemory.usedChallengeKeys = SpatialSafariMemory.usedChallengeKeys.slice(-12);
    }

    return picked;
  }

  // --- AUDIO Y SÍNTESIS DE VOZ NATURAL ---
  function safeSpeak(text, onEnd) {
    SpatialSafariGame.isSpeaking = true;
    if (typeof stopAllAudio === 'function') stopAllAudio();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'es-ES';
      u.rate = 0.92;
      u.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const esVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Helena') || v.name.includes('Laura') || v.name.includes('Sabina')));
      if (esVoice) u.voice = esVoice;

      let called = false;
      const finish = () => {
        if (called) return;
        called = true;
        SpatialSafariGame.isSpeaking = false;
        if (SpatialSafariGame.speechWatchdog) clearTimeout(SpatialSafariGame.speechWatchdog);
        if (typeof onEnd === 'function') onEnd();
      };

      u.onend = finish;
      u.onerror = finish;
      SpatialSafariGame.speechWatchdog = setTimeout(finish, Math.max(3000, text.length * 90));
      window.speechSynthesis.speak(u);
    } else {
      setTimeout(() => {
        SpatialSafariGame.isSpeaking = false;
        if (typeof onEnd === 'function') onEnd();
      }, 1500);
    }
  }

  function playSuccessChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.24); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.38); // C6

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.52);
    } catch(e) {}
  }

  function playSoftNudgeSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
      osc.frequency.exponentialRampToValueAtTime(440.00, ctx.currentTime + 0.18); // A4
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch(e) {}
  }

  // --- APERTURA Y NAVEGACIÓN ---
  window.openSpatialSafariScreen = function() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));

    const screen = document.getElementById('screen-spatial-safari');
    if (!screen) {
      console.error('No se encontró #screen-spatial-safari');
      return;
    }
    screen.classList.add('active');

    SpatialSafariGame.isRunning = true;
    SpatialSafariGame.currentRoundIndex = 0;
    SpatialSafariGame.roundsSession = 6;
    SpatialSafariGame.roundDeck = buildSpatialDeck(SpatialSafariGame.roundsSession);
    SpatialSafariGame.starsEarned = 0;
    SpatialSafariGame.coinsEarned = 0;

    renderRound(0);
  };

  window.closeSpatialSafariAndReturnToMap = function() {
    SpatialSafariGame.isRunning = false;
    clearTimeout(SpatialSafariGame.hintTimer);
    clearTimeout(SpatialSafariGame.speechWatchdog);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    const screen = document.getElementById('screen-spatial-safari');
    if (screen) screen.classList.remove('active');

    const mapScreen = document.getElementById('screen-map') || document.getElementById('screen-welcome');
    if (mapScreen) mapScreen.classList.add('active');
  };

  window.repeatSpatialPrompt = function() {
    if (!SpatialSafariGame.currentRound) return;
    safeSpeak(SpatialSafariGame.currentRound.prompt);
  };

  // --- RENDERIZADO DE RONDA ---
  function renderRound(index) {
    if (index >= SpatialSafariGame.roundsSession || index >= SpatialSafariGame.roundDeck.length) {
      triggerSpatialSafariVictory();
      return;
    }

    SpatialSafariGame.currentRoundIndex = index;
    const round = SpatialSafariGame.roundDeck[index];
    SpatialSafariGame.currentRound = round;
    SpatialSafariGame.isTransitioning = false;

    // Actualizar HUD
    const badge = document.getElementById('spatial-safari-badge');
    if (badge) badge.innerText = `Reto ${index + 1} de ${SpatialSafariGame.roundsSession}`;

    const titleEl = document.getElementById('spatial-safari-title');
    if (titleEl) titleEl.innerText = round.title;

    const stage = document.getElementById('spatial-safari-stage');
    if (!stage) return;

    clearTimeout(SpatialSafariGame.hintTimer);

    if (round.type === 'pair') {
      renderPairRound(stage, round);
    } else if (round.type === 'table_interactive') {
      renderTableRound(stage, round);
    } else if (round.type === 'cerca_lejos_interactive') {
      renderCercaLejosRound(stage, round);
    } else if (round.type === 'fila_interactive') {
      renderFilaRound(stage, round);
    }

    // Hablar consigna
    safeSpeak(round.prompt, () => {
      // Temporizador de paciencia de 10s para guía suave sin frustración
      SpatialSafariGame.hintTimer = setTimeout(() => {
        highlightCorrectOption(round);
      }, 10000);
    });
  }

  // 1. Rondas de pares clásicos (Dentro/Fuera, Delante/Detrás, Abierto/Cerrado, Ancho/Estrecho, Izq/Der)
  function renderPairRound(stage, round) {
    // Barajamos visualmente el orden de los 2 items para que no siempre el correcto esté a la izquierda
    const shuffledItems = shuffleArray(round.items);

    stage.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 12px; box-sizing: border-box; width: 100%;">
        
        <!-- BANNER DE CONSIGNA CON VOZ -->
        <div style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); color: white; padding: 10px 16px; border-radius: 18px; width: 100%; max-width: 720px; box-shadow: 0 4px 14px rgba(49,46,129,0.25); display: flex; align-items: center; justify-content: space-between; gap: 10px; border: 2px solid #6366F1;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 26px;">🧭</div>
            <div>
              <div style="font-size: 11px; font-weight: 700; color: #A5B4FC; text-transform: uppercase; letter-spacing: 0.5px;">Observa con atención</div>
              <div id="spatial-prompt-text" style="font-size: 16px; font-weight: 900; color: #FEF08A; text-shadow: 0 1px 3px rgba(0,0,0,0.4);">
                ${round.prompt}
              </div>
            </div>
          </div>
          <button onclick="repeatSpatialPrompt()" style="background: rgba(255,255,255,0.18); border: 1.5px solid #A5B4FC; color: #E0E7FF; padding: 6px 10px; border-radius: 12px; font-weight: 800; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span>🔊 Oír</span>
          </button>
        </div>

        <!-- ESCENARIO COMPARATIVO DE DOS OPCIONES -->
        <div style="flex: 1; width: 100%; max-width: 760px; display: flex; align-items: center; justify-content: center; gap: 24px; padding: 12px 10px; flex-wrap: wrap;">
          ${shuffledItems.map(item => `
            <div id="spatial-opt-${item.id}" onclick="handleSpatialChoice('${item.id}', ${item.isCorrect})"
                 class="spatial-card"
                 style="background: #FFFFFF; border: 3.5px solid #E2E8F0; border-radius: 24px; padding: 14px; width: 260px; max-width: 44vw; min-height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 10px 25px rgba(0,0,0,0.08); transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s, border-color 0.22s; position: relative; user-select: none;"
                 onmouseover="this.style.transform='scale(1.04) translateY(-4px)'; this.style.borderColor='#818CF8';"
                 onmouseout="this.style.transform='scale(1) translateY(0)'; this.style.borderColor='#E2E8F0';">
              <div style="width: 100%; height: 160px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; border-radius: 16px; background: radial-gradient(circle at 50% 50%, rgba(241,245,249,0.8) 0%, rgba(226,232,240,0.3) 100%);">
                <img src="${item.img}" alt="${item.name}" style="max-width: 90%; max-height: 90%; object-fit: contain; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.18)); pointer-events: none;" />
              </div>
              <div style="margin-top: 10px; font-size: 15px; font-weight: 900; color: #1E293B; text-align: center;">
                ${item.name}
              </div>
            </div>
          `).join('')}
        </div>

        <div style="font-size: 12px; color: #64748B; font-weight: 700; text-align: center; padding-bottom: 2px;">
          Toca la imagen que responde a la pregunta
        </div>
      </div>
    `;
  }

  // 2. Ronda de mesa con pelotas (Encima / Debajo)
  function renderTableRound(stage, round) {
    stage.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 12px; box-sizing: border-box; width: 100%;">
        
        <!-- BANNER DE CONSIGNA -->
        <div style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); color: white; padding: 10px 16px; border-radius: 18px; width: 100%; max-width: 720px; box-shadow: 0 4px 14px rgba(49,46,129,0.25); display: flex; align-items: center; justify-content: space-between; gap: 10px; border: 2px solid #6366F1;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 26px;">🪑</div>
            <div>
              <div style="font-size: 11px; font-weight: 700; color: #A5B4FC; text-transform: uppercase;">La Mesa de Juguetes</div>
              <div id="spatial-prompt-text" style="font-size: 16px; font-weight: 900; color: #FEF08A; text-shadow: 0 1px 3px rgba(0,0,0,0.4);">
                ${round.prompt}
              </div>
            </div>
          </div>
          <button onclick="repeatSpatialPrompt()" style="background: rgba(255,255,255,0.18); border: 1.5px solid #A5B4FC; color: #E0E7FF; padding: 6px 10px; border-radius: 12px; font-weight: 800; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <span>🔊 Oír</span>
          </button>
        </div>

        <!-- ESCENARIO INTERACTIVO CON MESA Y DOS ZONAS TÁCTILES -->
        <div style="flex: 1; width: 100%; max-width: 500px; display: flex; align-items: center; justify-content: center; padding: 10px; position: relative;">
          <div style="position: relative; width: 340px; height: 300px; background: white; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 3px solid #E2E8F0; overflow: hidden; display: flex; align-items: center; justify-content: center;">
            <img src="${round.bgImg}" alt="Mesa con Pelotas" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;" />

            <!-- ZONA ENCIMA (Top) -->
            <div id="spatial-opt-encima" onclick="handleSpatialChoice('encima', ${round.target === 'encima'})"
                 style="position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 130px; height: 95px; border-radius: 20px; border: 3px dashed rgba(99,102,241,0.5); background: rgba(99,102,241,0.08); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
                 onmouseover="this.style.background='rgba(99,102,241,0.2)'; this.style.borderColor='#4F46E5';"
                 onmouseout="this.style.background='rgba(99,102,241,0.08)'; this.style.borderColor='rgba(99,102,241,0.5)';">
              <span style="font-size: 11px; font-weight: 900; background: rgba(255,255,255,0.9); color: #4338CA; padding: 2px 8px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">ENCIMA</span>
            </div>

            <!-- ZONA DEBAJO (Bottom) -->
            <div id="spatial-opt-debajo" onclick="handleSpatialChoice('debajo', ${round.target === 'debajo'})"
                 style="position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); width: 130px; height: 95px; border-radius: 20px; border: 3px dashed rgba(245,158,11,0.5); background: rgba(245,158,11,0.08); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
                 onmouseover="this.style.background='rgba(245,158,11,0.2)'; this.style.borderColor='#D97706';"
                 onmouseout="this.style.background='rgba(245,158,11,0.08)'; this.style.borderColor='rgba(245,158,11,0.5)';">
              <span style="font-size: 11px; font-weight: 900; background: rgba(255,255,255,0.9); color: #B45309; padding: 2px 8px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">DEBAJO</span>
            </div>
          </div>
        </div>

        <div style="font-size: 12px; color: #64748B; font-weight: 700; text-align: center; padding-bottom: 2px;">
          Toca la pelota indicada (arriba en la mesa o abajo en el suelo)
        </div>
      </div>
    `;
  }

  // 3. Ronda Cerca / Lejos
  function renderCercaLejosRound(stage, round) {
    stage.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 12px; box-sizing: border-box; width: 100%;">
        
        <!-- BANNER DE CONSIGNA -->
        <div style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); color: white; padding: 10px 16px; border-radius: 18px; width: 100%; max-width: 720px; box-shadow: 0 4px 14px rgba(49,46,129,0.25); display: flex; align-items: center; justify-content: space-between; gap: 10px; border: 2px solid #6366F1;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 26px;">🐇</div>
            <div>
              <div style="font-size: 11px; font-weight: 700; color: #A5B4FC; text-transform: uppercase;">La Pradera Mágica</div>
              <div id="spatial-prompt-text" style="font-size: 16px; font-weight: 900; color: #FEF08A; text-shadow: 0 1px 3px rgba(0,0,0,0.4);">
                ${round.prompt}
              </div>
            </div>
          </div>
          <button onclick="repeatSpatialPrompt()" style="background: rgba(255,255,255,0.18); border: 1.5px solid #A5B4FC; color: #E0E7FF; padding: 6px 10px; border-radius: 12px; font-weight: 800; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <span>🔊 Oír</span>
          </button>
        </div>

        <!-- ESCENARIO INTERACTIVO CERCA / LEJOS -->
        <div style="flex: 1; width: 100%; max-width: 540px; display: flex; align-items: center; justify-content: center; padding: 10px; position: relative;">
          <div style="position: relative; width: 380px; height: 260px; background: white; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 3px solid #E2E8F0; overflow: hidden;">
            <img src="${round.bgImg}" alt="Cerca y Lejos" style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;" />

            <!-- ZONA CERCA (Left foreground) -->
            <div id="spatial-opt-cerca" onclick="handleSpatialChoice('cerca', ${round.target === 'cerca'})"
                 style="position: absolute; bottom: 15px; left: 15px; width: 160px; height: 180px; border-radius: 20px; border: 3.5px dashed rgba(16,185,129,0.7); background: rgba(16,185,129,0.1); cursor: pointer; transition: all 0.2s; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 10px;"
                 onmouseover="this.style.background='rgba(16,185,129,0.25)';"
                 onmouseout="this.style.background='rgba(16,185,129,0.1)';">
              <span style="font-size: 12px; font-weight: 900; background: white; color: #047857; padding: 3px 10px; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">CERCA 🔍</span>
            </div>

            <!-- ZONA LEJOS (Right background) -->
            <div id="spatial-opt-lejos" onclick="handleSpatialChoice('lejos', ${round.target === 'lejos'})"
                 style="position: absolute; top: 20px; right: 20px; width: 140px; height: 140px; border-radius: 20px; border: 3.5px dashed rgba(99,102,241,0.7); background: rgba(99,102,241,0.1); cursor: pointer; transition: all 0.2s; display: flex; align-items: flex-start; justify-content: center; padding-top: 10px;"
                 onmouseover="this.style.background='rgba(99,102,241,0.25)';"
                 onmouseout="this.style.background='rgba(99,102,241,0.1)';">
              <span style="font-size: 12px; font-weight: 900; background: white; color: #4338CA; padding: 3px 10px; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">LEJOS 🏔️</span>
            </div>
          </div>
        </div>

        <div style="font-size: 12px; color: #64748B; font-weight: 700; text-align: center; padding-bottom: 2px;">
          Toca el conejito que está cerca o el que está lejos en la montaña
        </div>
      </div>
    `;
  }

  // 4. Ronda Fila del Safari (Primero, En medio, Último)
  function renderFilaRound(stage, round) {
    stage.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 12px; box-sizing: border-box; width: 100%;">
        
        <!-- BANNER DE CONSIGNA -->
        <div style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); color: white; padding: 10px 16px; border-radius: 18px; width: 100%; max-width: 720px; box-shadow: 0 4px 14px rgba(49,46,129,0.25); display: flex; align-items: center; justify-content: space-between; gap: 10px; border: 2px solid #6366F1;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 26px;">🦁</div>
            <div>
              <div style="font-size: 11px; font-weight: 700; color: #A5B4FC; text-transform: uppercase;">La Fila de Amigos</div>
              <div id="spatial-prompt-text" style="font-size: 16px; font-weight: 900; color: #FEF08A; text-shadow: 0 1px 3px rgba(0,0,0,0.4);">
                ${round.prompt}
              </div>
            </div>
          </div>
          <button onclick="repeatSpatialPrompt()" style="background: rgba(255,255,255,0.18); border: 1.5px solid #A5B4FC; color: #E0E7FF; padding: 6px 10px; border-radius: 12px; font-weight: 800; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <span>🔊 Oír</span>
          </button>
        </div>

        <!-- ESCENARIO INTERACTIVO: FILA DE 3 ANIMALITOS -->
        <div style="flex: 1; width: 100%; max-width: 600px; display: flex; align-items: center; justify-content: center; padding: 10px; position: relative;">
          <div style="position: relative; width: 440px; height: 260px; background: white; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 3px solid #E2E8F0; overflow: hidden; display: flex;">
            <img src="${round.bgImg}" alt="Fila de animales" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; pointer-events: none;" />

            <!-- ZONA PRIMERO (Leoncito, left) -->
            <div id="spatial-opt-primero" onclick="handleSpatialChoice('primero', ${round.target === 'primero'})"
                 style="position: absolute; top: 20px; left: 10px; width: 130px; height: 215px; border-radius: 18px; border: 3px dashed rgba(245,158,11,0.5); background: rgba(245,158,11,0.06); cursor: pointer; transition: all 0.2s; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px;"
                 onmouseover="this.style.background='rgba(245,158,11,0.2)';"
                 onmouseout="this.style.background='rgba(245,158,11,0.06)';">
              <span style="font-size: 11px; font-weight: 900; background: white; color: #B45309; padding: 2px 8px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">1º PRIMERO</span>
            </div>

            <!-- ZONA EN MEDIO (Monito, center) -->
            <div id="spatial-opt-en_medio" onclick="handleSpatialChoice('en_medio', ${round.target === 'en_medio'})"
                 style="position: absolute; top: 20px; left: 155px; width: 130px; height: 215px; border-radius: 18px; border: 3px dashed rgba(16,185,129,0.5); background: rgba(16,185,129,0.06); cursor: pointer; transition: all 0.2s; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px;"
                 onmouseover="this.style.background='rgba(16,185,129,0.2)';"
                 onmouseout="this.style.background='rgba(16,185,129,0.06)';">
              <span style="font-size: 11px; font-weight: 900; background: white; color: #047857; padding: 2px 8px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">EN MEDIO</span>
            </div>

            <!-- ZONA ÚLTIMO (Jirafita, right) -->
            <div id="spatial-opt-ultimo" onclick="handleSpatialChoice('ultimo', ${round.target === 'ultimo'})"
                 style="position: absolute; top: 20px; right: 10px; width: 130px; height: 215px; border-radius: 18px; border: 3px dashed rgba(99,102,241,0.5); background: rgba(99,102,241,0.06); cursor: pointer; transition: all 0.2s; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px;"
                 onmouseover="this.style.background='rgba(99,102,241,0.2)';"
                 onmouseout="this.style.background='rgba(99,102,241,0.06)';">
              <span style="font-size: 11px; font-weight: 900; background: white; color: #4338CA; padding: 2px 8px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">ÚLTIMO</span>
            </div>
          </div>
        </div>

        <div style="font-size: 12px; color: #64748B; font-weight: 700; text-align: center; padding-bottom: 2px;">
          Toca el animalito correspondiente en la fila (Primero, En medio o Último)
        </div>
      </div>
    `;
  }

  // --- INTERACCIÓN Y RESPUESTA ---
  window.handleSpatialChoice = function(choiceId, isCorrect) {
    if (SpatialSafariGame.isTransitioning) return;
    clearTimeout(SpatialSafariGame.hintTimer);

    const round = SpatialSafariGame.currentRound;
    if (!round) return;

    const optEl = document.getElementById(`spatial-opt-${choiceId}`);

    if (isCorrect) {
      // ¡Acierto!
      SpatialSafariGame.isTransitioning = true;
      playSuccessChime();
      if (typeof triggerConfettiEffect === 'function') triggerConfettiEffect();

      if (optEl) {
        optEl.style.transform = 'scale(1.08)';
        optEl.style.borderColor = '#10B981';
        optEl.style.boxShadow = '0 0 25px rgba(16, 185, 129, 0.55)';
      }

      safeSpeak(round.praise, () => {
        setTimeout(() => {
          renderRound(SpatialSafariGame.currentRoundIndex + 1);
        }, 350);
      });
    } else {
      // Intento no acertado -> Guía suave sin frustración
      playSoftNudgeSound();
      if (optEl) {
        optEl.style.transform = 'scale(0.96)';
        optEl.style.borderColor = '#CBD5E1';
        optEl.style.opacity = '0.65';
      }

      safeSpeak(round.help, () => {
        // Restaurar para permitir reintento inmediato
        if (optEl) {
          optEl.style.transform = 'none';
          optEl.style.opacity = '1';
        }
        // Guía visual suave en la correcta
        highlightCorrectOption(round);
      });
    }
  };

  function highlightCorrectOption(round) {
    let targetId = round.target;
    const targetEl = document.getElementById(`spatial-opt-${targetId}`);
    if (targetEl) {
      targetEl.style.borderColor = '#F59E0B';
      targetEl.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.7)';
      targetEl.style.animation = 'pulseGlow 1.2s infinite';
    }
  }

  // --- GRAN VICTORIA DEL SAFARI ESPACIAL ---
  function triggerSpatialSafariVictory() {
    SpatialSafariGame.isTransitioning = true;
    if (typeof triggerConfettiEffect === 'function') triggerConfettiEffect();
    playSuccessChime();

    if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
      activeChildProfile.coins = (activeChildProfile.coins || 0) + 25;
      activeChildProfile.stars = (activeChildProfile.stars || 0) + 15;
      if (typeof saveChildProfiles === 'function') saveChildProfiles();
      if (typeof updateProfileDisplay === 'function') updateProfileDisplay();
    }

    const modal = document.getElementById('spatial-victory-modal');
    if (modal) modal.style.display = 'flex';

    safeSpeak('¡Fantástico explorador! ¡Completaste todos los desafíos del Safari Espacial reconociendo cada posición!');
  }

  window.restartSpatialSafariQuest = function() {
    const modal = document.getElementById('spatial-victory-modal');
    if (modal) modal.style.display = 'none';

    SpatialSafariGame.isRunning = true;
    SpatialSafariGame.currentRoundIndex = 0;
    SpatialSafariGame.roundDeck = buildSpatialDeck(SpatialSafariGame.roundsSession);
    renderRound(0);
  };

  window.closeSpatialVictoryModal = function() {
    const modal = document.getElementById('spatial-victory-modal');
    if (modal) modal.style.display = 'none';
    closeSpatialSafariAndReturnToMap();
  };

})();
