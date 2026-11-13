// =========================================================================
// CRIN AVENTURAS DE LECTOESCRITURA - EL ESPEJO MÁGICO DEL ESQUEMA CORPORAL
// Módulo Psicopedagógico de Somatognosia, Esquema Corporal y Partes de la Cara/Cuerpo
// Protocolo: Distinguir Niño/Niña, Ojos, Nariz, Boca, Orejas, Pelo, Cabeza, Brazos, Barriga, Piernas
// =========================================================================

(function() {
  'use strict';

  const BodyMirrorGame = {
    isRunning: false,
    selectedCharacter: 'boy', // 'boy' o 'girl'
    currentPhase: 'intro', // 'intro' | 'face' | 'body' | 'victory'
    
    // Lista de ítems para la cara y para el cuerpo
    faceItems: ['ojos', 'nariz', 'boca', 'orejas', 'pelo'],
    bodyItems: ['cabeza', 'brazos', 'barriga', 'piernas'],
    
    currentItemIndex: 0,
    currentTarget: null,
    
    isSpeaking: false,
    isTransitioning: false,
    
    hintTimer: null,
    speechWatchdog: null,
    
    // Contadores de progreso de la sesión
    starsEarned: 0,
    coinsEarned: 0
  };

  window.BodyMirrorGame = BodyMirrorGame;

  // Metadata pedagógica de las partes de la cara
  const FACE_TARGETS_DATA = {
    'ojos': {
      label: 'Ojos',
      icon: '👁️',
      color: '#3B82F6',
      prompt: '¿Dónde están los ojos? ¡Toca los ojos para mirar las estrellas!',
      praise: '¡Excelente! ¡Esos son los ojos para ver todo lo que nos rodea!',
      box: { top: 22, left: 34, width: 32, height: 12 }, // coordenadas relativas en zoom facial (%)
      altBoxes: [
        { top: 22, left: 32, width: 17, height: 12 },
        { top: 22, left: 51, width: 17, height: 12 }
      ]
    },
    'nariz': {
      label: 'Nariz',
      icon: '👃',
      color: '#F59E0B',
      prompt: '¡Toca la nariz para oler las flores del bosque!',
      praise: '¡Genial! ¡Esa es la nariz para oler y respirar aire fresco!',
      box: { top: 33, left: 42, width: 16, height: 10 }
    },
    'boca': {
      label: 'Boca',
      icon: '👄',
      color: '#EF4444',
      prompt: '¡Toca la boca para cantar y sonreír!',
      praise: '¡Muy bien! ¡Esa es la boca para hablar, comer y sonreír!',
      box: { top: 43, left: 38, width: 24, height: 12 }
    },
    'orejas': {
      label: 'Orejas',
      icon: '👂',
      color: '#8B5CF6',
      prompt: '¡Toca las orejas para escuchar los sonidos de la naturaleza!',
      praise: '¡Súper! ¡Esas son las orejas para escuchar cuentos y música!',
      box: { top: 25, left: 16, width: 68, height: 16 },
      altBoxes: [
        { top: 25, left: 18, width: 15, height: 16 },
        { top: 25, left: 67, width: 15, height: 16 }
      ]
    },
    'pelo': {
      label: 'Pelo',
      icon: '💇',
      color: '#D97706',
      prompt: '¡Toca el pelo del explorador arriba de la cara!',
      praise: '¡Fantástico! ¡Ese es el pelo que peinamos y cuidamos!',
      box: { top: 4, left: 24, width: 52, height: 18 }
    }
  };

  // Metadata pedagógica de las partes del cuerpo
  const BODY_TARGETS_DATA = {
    'cabeza': {
      label: 'Cabeza',
      icon: '🧠',
      color: '#0284C7',
      prompt: '¡Toca la cabeza, arriba de todo!',
      praise: '¡Muy bien! ¡Esa es la cabeza, donde pensamos y soñamos!',
      box: { top: 8, left: 30, width: 40, height: 26 }
    },
    'brazos': {
      label: 'Brazos',
      icon: '💪',
      color: '#10B981',
      prompt: '¡Toca los brazos para dar un gran abrazo!',
      praise: '¡Eso es! ¡Los brazos fuertes para abrazar y alcanzar cosas!',
      box: { top: 35, left: 14, width: 72, height: 22 },
      altBoxes: [
        { top: 35, left: 14, width: 22, height: 22 },
        { top: 35, left: 64, width: 22, height: 22 }
      ]
    },
    'barriga': {
      label: 'Barriga',
      icon: '🤗',
      color: '#F59E0B',
      prompt: '¡Hazle cosquillas en la barriga!',
      praise: '¡Jajaja, qué cosquillas! ¡Esa es la barriga!',
      box: { top: 36, left: 35, width: 30, height: 20 }
    },
    'piernas': {
      label: 'Piernas',
      icon: '🦵',
      color: '#6366F1',
      prompt: '¡Toca las piernas para saltar y correr por el bosque!',
      praise: '¡Excelente! ¡Esas son las piernas que nos llevan a todas partes!',
      box: { top: 58, left: 28, width: 44, height: 35 }
    }
  };

  // Barajado Fisher-Yates
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Locución con protección de habla
  function safeSpeak(text, onComplete) {
    if (typeof stopAllAudio === 'function') stopAllAudio('body_mirror_prompt');
    BodyMirrorGame.isSpeaking = true;
    
    if (BodyMirrorGame.speechWatchdog) clearTimeout(BodyMirrorGame.speechWatchdog);
    
    const finish = () => {
      BodyMirrorGame.isSpeaking = false;
      if (BodyMirrorGame.speechWatchdog) clearTimeout(BodyMirrorGame.speechWatchdog);
      if (typeof onComplete === 'function') onComplete();
    };

    if (typeof speakText === 'function') {
      speakText(text, finish);
      // Watchdog de respaldo generoso para que nada se congele
      const duration = Math.max(2500, Math.round(text.length * 85) + 1200);
      BodyMirrorGame.speechWatchdog = setTimeout(finish, duration);
    } else {
      setTimeout(finish, 1200);
    }
  }

  // --- APERTURA Y CIERRE DE PANTALLA ---
  window.openBodyMirrorScreen = function() {
    if (typeof stopAllAudio === 'function') stopAllAudio('open_body_mirror');
    if (typeof switchScreen === 'function') switchScreen('body-mirror');

    const screen = document.getElementById('screen-body-mirror');
    if (screen) screen.classList.add('active');

    BodyMirrorGame.isRunning = true;
    BodyMirrorGame.currentPhase = 'intro';
    BodyMirrorGame.isTransitioning = false;

    renderIntroScreen();
  };

  window.closeBodyMirrorAndReturnToMap = function() {
    BodyMirrorGame.isRunning = false;
    if (BodyMirrorGame.hintTimer) clearTimeout(BodyMirrorGame.hintTimer);
    if (BodyMirrorGame.speechWatchdog) clearTimeout(BodyMirrorGame.speechWatchdog);
    if (typeof stopAllAudio === 'function') stopAllAudio('exit_body_mirror');

    const modal = document.getElementById('body-mirror-victory-modal');
    if (modal) modal.style.display = 'none';

    if (typeof switchScreen === 'function') switchScreen('map');
  };

  // --- FASE 1: INTRODUCCIÓN Y DISTINCIÓN NIÑO / NIÑA ---
  function renderIntroScreen() {
    const stage = document.getElementById('body-mirror-stage');
    if (!stage) return;

    if (BodyMirrorGame.hintTimer) clearTimeout(BodyMirrorGame.hintTimer);

    stage.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; padding: 12px; box-sizing: border-box;">
        
        <!-- Cartel de instrucción amigable -->
        <div style="background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); border: 2.5px solid #F59E0B; border-radius: 20px; padding: 12px 24px; text-align: center; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); max-width: 520px;">
          <div style="font-size: 13px; font-weight: 900; color: #FBBF24; text-transform: uppercase; letter-spacing: 1px;">
            ✨ Protocolo de Esquema Corporal
          </div>
          <div style="font-size: 18px; font-weight: 900; color: #FFFFFF; margin-top: 4px;">
            ¿Quién quieres ser hoy? ¿Al Niño o a la Niña?
          </div>
        </div>

        <!-- Selector Niño y Niña con ilustraciones de alta resolución -->
        <div style="display: flex; gap: 24px; align-items: center; justify-content: center; flex-wrap: wrap; max-width: 700px; width: 100%;">
          
          <!-- TARJETA NIÑO -->
          <div id="card-select-boy" onclick="selectCharacter('boy')" style="flex: 1; min-width: 180px; max-width: 250px; background: linear-gradient(135deg, #1E3A8A 0%, #0284C7 100%); border: 3.5px solid #38BDF8; border-radius: 26px; padding: 16px 12px; display: flex; flex-direction: column; align-items: center; cursor: pointer; box-shadow: 0 10px 25px rgba(2, 132, 199, 0.35); transition: transform 0.2s, box-shadow 0.2s; position: relative;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
            <div style="width: 150px; height: 190px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
              <img src="assets/nino_explorador.png?v=315" alt="Niño" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.4));" />
            </div>
            <div style="background: #FFFFFF; color: #0284C7; font-size: 16px; font-weight: 900; padding: 6px 20px; border-radius: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 6px;">
              <span>👦</span>
              <span>EL NIÑO</span>
            </div>
          </div>

          <!-- TARJETA NIÑA -->
          <div id="card-select-girl" onclick="selectCharacter('girl')" style="flex: 1; min-width: 180px; max-width: 250px; background: linear-gradient(135deg, #831843 0%, #DB2777 100%); border: 3.5px solid #F472B6; border-radius: 26px; padding: 16px 12px; display: flex; flex-direction: column; align-items: center; cursor: pointer; box-shadow: 0 10px 25px rgba(219, 39, 119, 0.35); transition: transform 0.2s, box-shadow 0.2s; position: relative;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
            <div style="width: 150px; height: 190px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
              <img src="assets/nina_exploradora.png?v=315" alt="Niña" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.4));" />
            </div>
            <div style="background: #FFFFFF; color: #DB2777; font-size: 16px; font-weight: 900; padding: 6px 20px; border-radius: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 6px;">
              <span>👧</span>
              <span>LA NIÑA</span>
            </div>
          </div>

        </div>

      </div>
    `;

    updateMirrorHeader('El Espejo Mágico: Identidad', 'Distinguir Niño y Niña');
    safeSpeak('¡Hola explorador! Bienvenido al Espejo Mágico de CRIN. ¿Quién eres tú? ¿Quieres jugar con el niño o con la niña?');
  }

  // Selección de personaje y paso a Fase 2 (Cara)
  window.selectCharacter = function(gender) {
    if (BodyMirrorGame.isTransitioning) return;
    BodyMirrorGame.isTransitioning = true;
    BodyMirrorGame.selectedCharacter = gender;

    const chosenText = (gender === 'boy') ? '¡Excelente! ¡Vamos a explorar con el niño!' : '¡Excelente! ¡Vamos a explorar con la niña!';
    
    // Sonido festivo
    if (typeof playGameAudioEffect === 'function') playGameAudioEffect('correct');

    safeSpeak(chosenText, () => {
      startFacePhase();
    });
  };

  // --- FASE 2: LAS PARTES DE LA CARA ---
  function startFacePhase() {
    BodyMirrorGame.currentPhase = 'face';
    BodyMirrorGame.isTransitioning = false;
    BodyMirrorGame.faceItems = shuffle(['ojos', 'nariz', 'boca', 'orejas', 'pelo']);
    BodyMirrorGame.currentItemIndex = 0;

    renderMirrorInteractiveStage();
    loadNextFaceItem();
  }

  function loadNextFaceItem() {
    if (BodyMirrorGame.currentItemIndex >= BodyMirrorGame.faceItems.length) {
      // Fin de la cara: pasamos a las partes del cuerpo
      safeSpeak('¡Súper bien! ¡Identificaste todas las partes de la cara! Ahora vamos a explorar todo el cuerpo.', () => {
        startBodyPhase();
      });
      return;
    }

    const key = BodyMirrorGame.faceItems[BodyMirrorGame.currentItemIndex];
    BodyMirrorGame.currentTarget = FACE_TARGETS_DATA[key];
    
    updatePromptUI(BodyMirrorGame.currentTarget.prompt, BodyMirrorGame.currentTarget.icon);
    clearAllHighlights();

    // Locución guiada
    safeSpeak(BodyMirrorGame.currentTarget.prompt);

    // Andamiaje: tras 4.5 segundos de duda, activar pulso de luz guiada sin penalización
    if (BodyMirrorGame.hintTimer) clearTimeout(BodyMirrorGame.hintTimer);
    BodyMirrorGame.hintTimer = setTimeout(() => {
      triggerGuidedHint(key);
    }, 4500);
  }

  // --- FASE 3: LAS PARTES DEL CUERPO ---
  function startBodyPhase() {
    BodyMirrorGame.currentPhase = 'body';
    BodyMirrorGame.isTransitioning = false;
    BodyMirrorGame.bodyItems = shuffle(['cabeza', 'brazos', 'barriga', 'piernas']);
    BodyMirrorGame.currentItemIndex = 0;

    renderMirrorInteractiveStage();
    loadNextBodyItem();
  }

  function loadNextBodyItem() {
    if (BodyMirrorGame.currentItemIndex >= BodyMirrorGame.bodyItems.length) {
      // Fin de la aventura: victoria y evaluación completada
      triggerVictoryScreen();
      return;
    }

    const key = BodyMirrorGame.bodyItems[BodyMirrorGame.currentItemIndex];
    BodyMirrorGame.currentTarget = BODY_TARGETS_DATA[key];

    updatePromptUI(BodyMirrorGame.currentTarget.prompt, BodyMirrorGame.currentTarget.icon);
    clearAllHighlights();

    // Locución guiada
    safeSpeak(BodyMirrorGame.currentTarget.prompt);

    // Andamiaje suave ante duda
    if (BodyMirrorGame.hintTimer) clearTimeout(BodyMirrorGame.hintTimer);
    BodyMirrorGame.hintTimer = setTimeout(() => {
      triggerGuidedHint(key);
    }, 4500);
  }

  // --- RENDERIZADO DEL ESCENARIO DEL ESPEJO INTERACTIVO ---
  function renderMirrorInteractiveStage() {
    const stage = document.getElementById('body-mirror-stage');
    if (!stage) return;

    const isFace = (BodyMirrorGame.currentPhase === 'face');
    const imgSrc = (BodyMirrorGame.selectedCharacter === 'boy') 
      ? 'assets/nino_explorador.png?v=315' 
      : 'assets/nina_exploradora.png?v=315';

    const charTitle = (BodyMirrorGame.selectedCharacter === 'boy') ? 'El Niño Explorador' : 'La Niña Exploradora';
    const subTitle = isFace ? 'Explorando las Partes de la Cara' : 'Explorando las Partes del Cuerpo';

    updateMirrorHeader(charTitle, subTitle);

    stage.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: space-between; position: relative; padding: 8px 12px; box-sizing: border-box;">
        
        <!-- BARRA SUPERIOR DE CONSIGNAS CON ALTO CONTRASTE -->
        <div id="body-mirror-prompt-box" style="background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 2.5px solid #F59E0B; border-radius: 18px; padding: 10px 18px; display: flex; align-items: center; gap: 12px; max-width: 620px; width: 100%; box-shadow: 0 6px 18px rgba(0,0,0,0.3); z-index: 10;">
          <div id="body-prompt-icon" style="font-size: 30px; background: rgba(245, 158, 11, 0.2); border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
            ✨
          </div>
          <div style="flex: 1; text-align: left;">
            <div id="body-prompt-text" style="font-size: 15px; font-weight: 900; color: #FFFFFF; line-height: 1.25;">
              Cargando desafío...
            </div>
          </div>
          <button onclick="repeatCurrentPrompt()" style="background: rgba(255,255,255,0.15); border: 1.5px solid #FDE68A; color: #FEF08A; padding: 6px 12px; border-radius: 12px; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Volver a escuchar">
            <span>🔊</span>
            <span>Oír</span>
          </button>
        </div>

        <!-- EL ESPEJO MÁGICO CON MARCO DORADO -->
        <div id="mirror-frame-container" style="flex: 1; width: 100%; max-width: 480px; min-height: 320px; display: flex; align-items: center; justify-content: center; position: relative; margin: 8px 0;">
          
          <div style="position: relative; width: 340px; height: 420px; max-width: 90vw; max-height: 60vh; background: linear-gradient(180deg, #1E293B 0%, #0B1329 100%); border: 8px solid #F59E0B; border-radius: 50% 50% 40% 40% / 40% 40% 30% 30%; box-shadow: 0 0 35px rgba(245, 158, 11, 0.4), inset 0 0 25px rgba(254, 240, 138, 0.25); overflow: hidden; display: flex; align-items: center; justify-content: center;">
            
            <!-- Destello de espejo -->
            <div style="position: absolute; top: -50px; left: -50px; width: 120px; height: 500px; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%); transform: rotate(25deg); pointer-events: none; z-index: 5;"></div>

            <!-- CONTENEDOR DEL PERSONAJE CON ZOOM DINÁMICO -->
            <div id="mirror-character-wrapper" style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); ${isFace ? 'transform: scale(2.4) translateY(24%);' : 'transform: scale(1.0) translateY(4%);'}">
              
              <img id="mirror-character-img" src="${imgSrc}" alt="${charTitle}" style="width: auto; height: 92%; max-width: 90%; object-fit: contain; user-select: none; pointer-events: none;" />

              <!-- CAPA DE HITBOXES INTERACTIVAS -->
              <div id="mirror-hitbox-layer" style="position: absolute; inset: 0; width: 100%; height: 100%;">
                ${renderHitboxes(isFace)}
              </div>

            </div>

          </div>

        </div>

        <!-- BARRA INFERIOR DE APOYO PEDAGÓGICO -->
        <div style="display: flex; gap: 8px; align-items: center; justify-content: center; width: 100%; padding-bottom: 4px;">
          <button onclick="switchScreen('map')" style="background: #F1F5F9; border: 1px solid #CBD5E1; color: #475569; padding: 6px 14px; border-radius: 12px; font-size: 11px; font-weight: bold; cursor: pointer;">
            🗺️ Volver al Mapa
          </button>
          <button onclick="openTherapistGuideModal('body_mirror')" style="background: #F0FDF4; border: 1px solid #A7F3D0; color: #047857; padding: 6px 14px; border-radius: 12px; font-size: 11px; font-weight: bold; cursor: pointer;">
            ℹ️ Guía Clínica (Somatognosia)
          </button>
        </div>

      </div>
    `;
  }

  // Generación de hitboxes táctiles
  function renderHitboxes(isFace) {
    if (isFace) {
      let html = '';
      Object.keys(FACE_TARGETS_DATA).forEach(key => {
        const item = FACE_TARGETS_DATA[key];
        if (item.altBoxes) {
          item.altBoxes.forEach((ab, idx) => {
            html += `<div id="hitbox-${key}-${idx}" class="body-hitbox" onclick="handlePartClick('${key}')" style="position: absolute; top: ${ab.top}%; left: ${ab.left}%; width: ${ab.width}%; height: ${ab.height}%; cursor: pointer; border-radius: 50%; z-index: 20;"></div>`;
          });
        } else {
          html += `<div id="hitbox-${key}" class="body-hitbox" onclick="handlePartClick('${key}')" style="position: absolute; top: ${item.box.top}%; left: ${item.box.left}%; width: ${item.box.width}%; height: ${item.box.height}%; cursor: pointer; border-radius: 50%; z-index: 20;"></div>`;
        }
      });
      return html;
    } else {
      let html = '';
      Object.keys(BODY_TARGETS_DATA).forEach(key => {
        const item = BODY_TARGETS_DATA[key];
        if (item.altBoxes) {
          item.altBoxes.forEach((ab, idx) => {
            html += `<div id="hitbox-${key}-${idx}" class="body-hitbox" onclick="handlePartClick('${key}')" style="position: absolute; top: ${ab.top}%; left: ${ab.left}%; width: ${ab.width}%; height: ${ab.height}%; cursor: pointer; border-radius: 30px; z-index: 20;"></div>`;
          });
        } else {
          html += `<div id="hitbox-${key}" class="body-hitbox" onclick="handlePartClick('${key}')" style="position: absolute; top: ${item.box.top}%; left: ${item.box.left}%; width: ${item.box.width}%; height: ${item.box.height}%; cursor: pointer; border-radius: 30px; z-index: 20;"></div>`;
        }
      });
      return html;
    }
  }

  // Manejo de clic o toque en una parte anatómica
  window.handlePartClick = function(clickedPartKey) {
    if (BodyMirrorGame.isTransitioning) return;

    const isFace = (BodyMirrorGame.currentPhase === 'face');
    const expectedKey = isFace 
      ? BodyMirrorGame.faceItems[BodyMirrorGame.currentItemIndex]
      : BodyMirrorGame.bodyItems[BodyMirrorGame.currentItemIndex];

    const targetData = isFace ? FACE_TARGETS_DATA[expectedKey] : BODY_TARGETS_DATA[expectedKey];
    const clickedData = isFace ? FACE_TARGETS_DATA[clickedPartKey] : BODY_TARGETS_DATA[clickedPartKey];

    if (BodyMirrorGame.hintTimer) clearTimeout(BodyMirrorGame.hintTimer);

    if (clickedPartKey === expectedKey) {
      // ¡ACIERTO!
      BodyMirrorGame.isTransitioning = true;
      if (typeof playGameAudioEffect === 'function') playGameAudioEffect('correct');
      triggerSuccessVisual(clickedPartKey);

      // Recompensa progresiva
      if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
        activeChildProfile.coins = (activeChildProfile.coins || 0) + 5;
        activeChildProfile.stars = (activeChildProfile.stars || 0) + 1;
        if (typeof saveActiveChildProfile === 'function') saveActiveChildProfile();
        if (typeof updateStatsUI === 'function') updateStatsUI();
      }

      safeSpeak(targetData.praise, () => {
        BodyMirrorGame.currentItemIndex++;
        BodyMirrorGame.isTransitioning = false;
        if (isFace) {
          loadNextFaceItem();
        } else {
          loadNextBodyItem();
        }
      });

    } else {
      // Duda o toque en otra parte: refuerzo amable sin castigo
      if (typeof playGameAudioEffect === 'function') playGameAudioEffect('running');
      triggerGentleFeedback(clickedPartKey);

      const clickedName = clickedData ? clickedData.label.toLowerCase() : clickedPartKey;
      const expectedName = targetData ? targetData.label.toLowerCase() : expectedKey;
      
      safeSpeak(`Esa es la ${clickedName}... ¡Ahora busquemos la ${expectedName}!`, () => {
        // Re-activar la pista visual tras la aclaración
        triggerGuidedHint(expectedKey);
      });
    }
  };

  // Pista guiada luminosa (Aprendizaje sin error)
  function triggerGuidedHint(partKey) {
    clearAllHighlights();
    const hitboxes = document.querySelectorAll(`[id^="hitbox-${partKey}"]`);
    hitboxes.forEach(hb => {
      hb.style.boxShadow = '0 0 20px 8px rgba(245, 158, 11, 0.85)';
      hb.style.border = '2.5px dashed #FBBF24';
      hb.style.animation = 'pulseRing 1.2s infinite ease-in-out';
    });
  }

  function clearAllHighlights() {
    const hitboxes = document.querySelectorAll('.body-hitbox');
    hitboxes.forEach(hb => {
      hb.style.boxShadow = 'none';
      hb.style.border = 'none';
      hb.style.animation = 'none';
    });
  }

  function triggerSuccessVisual(partKey) {
    const hitboxes = document.querySelectorAll(`[id^="hitbox-${partKey}"]`);
    hitboxes.forEach(hb => {
      hb.style.boxShadow = '0 0 25px 12px rgba(16, 185, 129, 0.9)';
      hb.style.border = '3px solid #34D399';
    });

    // Pequeño efecto de rebote en el personaje
    const char = document.getElementById('mirror-character-wrapper');
    if (char) {
      char.style.transition = 'transform 0.15s ease-out';
      char.style.transform += ' scale(1.05)';
      setTimeout(() => {
        char.style.transition = 'transform 0.3s ease-in';
      }, 180);
    }
  }

  function triggerGentleFeedback(partKey) {
    const hitboxes = document.querySelectorAll(`[id^="hitbox-${partKey}"]`);
    hitboxes.forEach(hb => {
      hb.style.boxShadow = '0 0 15px 4px rgba(245, 158, 11, 0.6)';
      setTimeout(() => { hb.style.boxShadow = 'none'; }, 600);
    });
  }

  function updatePromptUI(text, icon) {
    const promptTextEl = document.getElementById('body-prompt-text');
    const promptIconEl = document.getElementById('body-prompt-icon');
    if (promptTextEl) promptTextEl.innerText = text;
    if (promptIconEl) promptIconEl.innerText = icon || '✨';
  }

  function updateMirrorHeader(title, subtitle) {
    const tEl = document.getElementById('body-mirror-title');
    const sEl = document.getElementById('body-mirror-subtitle');
    if (tEl) tEl.innerText = title;
    if (sEl) sEl.innerText = subtitle;
  }

  window.repeatCurrentPrompt = function() {
    if (BodyMirrorGame.currentTarget && BodyMirrorGame.currentTarget.prompt) {
      safeSpeak(BodyMirrorGame.currentTarget.prompt);
    }
  };

  // --- FASE 4: VICTORIA FINAL ---
  function triggerVictoryScreen() {
    BodyMirrorGame.currentPhase = 'victory';
    if (typeof triggerConfettiEffect === 'function') triggerConfettiEffect();
    if (typeof playGameAudioEffect === 'function') playGameAudioEffect('correct');

    if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
      activeChildProfile.coins = (activeChildProfile.coins || 0) + 50;
      activeChildProfile.stars = (activeChildProfile.stars || 0) + 10;
      if (typeof saveActiveChildProfile === 'function') saveActiveChildProfile();
      if (typeof updateStatsUI === 'function') updateStatsUI();
    }

    const modal = document.getElementById('body-mirror-victory-modal');
    if (modal) modal.style.display = 'flex';

    const kidName = (typeof getStudentFirstName === 'function') ? getStudentFirstName() : 'Campeón';
    safeSpeak(`¡Felicidades ${kidName}! Completaste el Espejo Mágico. ¡Conoces a la perfección tu cuerpo y tu cara!`);
  }

  window.replayBodyMirror = function() {
    const modal = document.getElementById('body-mirror-victory-modal');
    if (modal) modal.style.display = 'none';
    BodyMirrorGame.currentPhase = 'intro';
    renderIntroScreen();
  };

})();
