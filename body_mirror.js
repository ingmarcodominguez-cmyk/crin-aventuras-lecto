// =========================================================================
// CRIN AVENTURAS DE LECTOESCRITURA - EL ESPEJO MÁGICO DEL ESQUEMA CORPORAL
// Módulo Psicopedagógico de Somatognosia, Esquema Corporal y Partes de la Cara/Cuerpo
// Protocolo: Distinguir Niño/Niña, Ojos, Nariz, Boca, Orejas, Pelo, Cabeza, Brazos, Barriga, Piernas
// Calibración Milimétrica de Hitboxes 1:1 sobre Imagen & Gramática Natural en Español
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

  // Gramática natural en español para refuerzo pedagógico sin error
  const ANATOMY_GRAMMAR = {
    'ojos': {
      thatIs: '¡Esos son los ojos!',
      withArticle: 'los ojos',
      icon: '👀',
      prompt: '¿Dónde están los ojos? ¡Toca los ojos para mirar las estrellas!',
      praise: '¡Excelente! ¡Esos son los ojos para ver todo lo que nos rodea!'
    },
    'nariz': {
      thatIs: '¡Esa es la nariz!',
      withArticle: 'la nariz',
      icon: '👃',
      prompt: '¡Toca la nariz para oler las flores del bosque!',
      praise: '¡Genial! ¡Esa es la nariz para oler y respirar aire fresco!'
    },
    'boca': {
      thatIs: '¡Esa es la boca!',
      withArticle: 'la boca',
      icon: '👄',
      prompt: '¡Toca la boca para cantar y sonreír!',
      praise: '¡Muy bien! ¡Esa es la boca para hablar, comer y sonreír!'
    },
    'orejas': {
      thatIs: '¡Esas son las orejas!',
      withArticle: 'las orejas',
      icon: '👂',
      prompt: '¡Toca las orejas para escuchar los sonidos de la naturaleza!',
      praise: '¡Súper! ¡Esas son las orejas para escuchar cuentos y música!'
    },
    'pelo': {
      thatIs: '¡Ese es el pelo!',
      withArticle: 'el pelo',
      icon: '💇',
      prompt: '¡Toca el pelo arriba de la cabeza!',
      praise: '¡Fantástico! ¡Ese es el pelo que peinamos y cuidamos!'
    },
    'cabeza': {
      thatIs: '¡Esa es la cabeza!',
      withArticle: 'la cabeza',
      icon: '👦',
      prompt: '¡Toca la cabeza, arriba de todo!',
      praise: '¡Muy bien! ¡Esa es la cabeza, donde pensamos y soñamos!'
    },
    'brazos': {
      thatIs: '¡Esos son los brazos!',
      withArticle: 'los brazos',
      icon: '💪',
      prompt: '¡Toca los brazos para trepar y dar abrazos!',
      praise: '¡Excelente! ¡Esos son los brazos para abrazar y jugar!'
    },
    'barriga': {
      thatIs: '¡Esa es la barriga!',
      withArticle: 'la barriga',
      icon: '🎽',
      prompt: '¡Toca la barriga en el medio del cuerpo!',
      praise: '¡Genial! ¡Esa es la pancita donde va la comida rica!'
    },
    'piernas': {
      thatIs: '¡Esas son las piernas!',
      withArticle: 'las piernas',
      icon: '👖',
      prompt: '¡Toca las piernas para saltar y correr!',
      praise: '¡Bravo! ¡Esas son las piernas para caminar, saltar y correr!'
    }
  };

  // Coordenadas milimétricas exactas sobre la imagen (896 x 1200) para la cara
  const CHARACTER_FACE_DATA = {
    boy: {
      ojos: {
        altBoxes: [
          { top: 20.0, left: 35.0, width: 13.0, height: 7.0 },
          { top: 20.0, left: 52.0, width: 13.0, height: 7.0 }
        ]
      },
      nariz: {
        box: { top: 25.5, left: 44.0, width: 12.0, height: 4.2 }
      },
      boca: {
        box: { top: 29.8, left: 37.0, width: 26.0, height: 6.0 }
      },
      orejas: {
        altBoxes: [
          { top: 24.0, left: 31.5, width: 9.0, height: 9.5 },
          { top: 24.0, left: 62.5, width: 9.0, height: 9.5 }
        ]
      },
      pelo: {
        box: { top: 7.0, left: 24.0, width: 52.0, height: 12.5 }
      }
    },
    girl: {
      ojos: {
        altBoxes: [
          { top: 18.5, left: 34.0, width: 13.0, height: 6.8 },
          { top: 18.5, left: 53.0, width: 13.0, height: 6.8 }
        ]
      },
      nariz: {
        box: { top: 23.5, left: 44.0, width: 12.0, height: 3.5 }
      },
      boca: {
        box: { top: 27.2, left: 38.0, width: 24.0, height: 5.5 }
      },
      orejas: {
        altBoxes: [
          { top: 18.5, left: 28.5, width: 9.0, height: 9.5 },
          { top: 18.5, left: 62.5, width: 9.0, height: 9.5 }
        ]
      },
      pelo: {
        altBoxes: [
          { top: 5.0, left: 24.0, width: 52.0, height: 13.0 },
          { top: 11.5, left: 8.5, width: 15.0, height: 26.0 },
          { top: 11.5, left: 76.5, width: 15.0, height: 26.0 }
        ]
      }
    }
  };

  // Coordenadas milimétricas exactas sobre la imagen (896 x 1200) para el cuerpo completo
  const CHARACTER_BODY_DATA = {
    boy: {
      cabeza: {
        box: { top: 7.0, left: 26.0, width: 48.0, height: 29.0 }
      },
      brazos: {
        altBoxes: [
          { top: 36.0, left: 18.0, width: 17.0, height: 20.0 },
          { top: 27.0, left: 66.0, width: 22.0, height: 25.0 }
        ]
      },
      barriga: {
        box: { top: 37.0, left: 37.0, width: 26.0, height: 18.0 }
      },
      piernas: {
        altBoxes: [
          { top: 56.0, left: 28.0, width: 21.0, height: 38.0 },
          { top: 56.0, left: 51.0, width: 21.0, height: 38.0 }
        ]
      }
    },
    girl: {
      cabeza: {
        box: { top: 5.0, left: 22.0, width: 56.0, height: 30.0 }
      },
      brazos: {
        altBoxes: [
          { top: 35.0, left: 14.0, width: 19.0, height: 22.0 },
          { top: 35.0, left: 67.0, width: 19.0, height: 22.0 }
        ]
      },
      barriga: {
        box: { top: 36.0, left: 36.0, width: 28.0, height: 18.0 }
      },
      piernas: {
        altBoxes: [
          { top: 56.0, left: 28.0, width: 21.0, height: 38.0 },
          { top: 56.0, left: 51.0, width: 21.0, height: 38.0 }
        ]
      }
    }
  };

  // Barajado Fisher-Yates
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = a[i];
      a[i] = a[j];
      a[j] = temp;
    }
    return a;
  }

  // Locución con protección de habla y watchdog
  function safeSpeak(text, onComplete) {
    if (typeof stopAllAudio === 'function') stopAllAudio('body_mirror_prompt');
    BodyMirrorGame.isSpeaking = true;

    if (BodyMirrorGame.speechWatchdog) clearTimeout(BodyMirrorGame.speechWatchdog);
    BodyMirrorGame.speechWatchdog = setTimeout(() => {
      BodyMirrorGame.isSpeaking = false;
    }, 9000);

    const finish = () => {
      BodyMirrorGame.isSpeaking = false;
      if (BodyMirrorGame.speechWatchdog) clearTimeout(BodyMirrorGame.speechWatchdog);
      if (typeof onComplete === 'function') onComplete();
    };

    if (typeof speakText === 'function') {
      speakText(text, finish);
    } else {
      finish();
    }
  }

  // --- APERTURA Y CIERRE DE PANTALLA ---
  window.openBodyMirrorScreen = function() {
    if (typeof stopAllAudio === 'function') stopAllAudio('open_body_mirror');
    if (typeof switchScreen === 'function') switchScreen('body-mirror');

    BodyMirrorGame.isRunning = true;
    BodyMirrorGame.currentPhase = 'intro';
    BodyMirrorGame.currentItemIndex = 0;
    BodyMirrorGame.starsEarned = 0;
    BodyMirrorGame.coinsEarned = 0;

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
              <img src="assets/nino_explorador.png?v=316" alt="Niño" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.4));" />
            </div>
            <div style="background: #FFFFFF; color: #0284C7; font-size: 16px; font-weight: 900; padding: 6px 20px; border-radius: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 6px;">
              <span>👦</span>
              <span>EL NIÑO</span>
            </div>
          </div>

          <!-- TARJETA NIÑA -->
          <div id="card-select-girl" onclick="selectCharacter('girl')" style="flex: 1; min-width: 180px; max-width: 250px; background: linear-gradient(135deg, #831843 0%, #DB2777 100%); border: 3.5px solid #F472B6; border-radius: 26px; padding: 16px 12px; display: flex; flex-direction: column; align-items: center; cursor: pointer; box-shadow: 0 10px 25px rgba(219, 39, 119, 0.35); transition: transform 0.2s, box-shadow 0.2s; position: relative;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
            <div style="width: 150px; height: 190px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
              <img src="assets/nina_exploradora.png?v=316" alt="Niña" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.4));" />
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
    BodyMirrorGame.currentTarget = ANATOMY_GRAMMAR[key];
    
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
    BodyMirrorGame.currentTarget = ANATOMY_GRAMMAR[key];

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
      ? 'assets/nino_explorador.png?v=316' 
      : 'assets/nina_exploradora.png?v=316';

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
            <div id="mirror-character-wrapper" style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); ${isFace ? 'transform: scale(2.6) translateY(26%);' : 'transform: scale(1.0) translateY(3%);'}">
              
              <!-- CAJA CON ASPECT RATIO EXACTO DE LA IMAGEN (896 / 1200) -->
              <div id="mirror-image-box" style="position: relative; height: 92%; aspect-ratio: 896 / 1200; display: inline-block;">
                <img id="mirror-character-img" src="${imgSrc}" alt="${charTitle}" style="width: 100%; height: 100%; object-fit: fill; user-select: none; pointer-events: none; display: block;" />

                <!-- CAPA DE HITBOXES INTERACTIVAS EXACTA 1:1 -->
                <div id="mirror-hitbox-layer" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: auto;">
                  ${renderHitboxes(isFace, BodyMirrorGame.selectedCharacter)}
                </div>
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

  // Generación de hitboxes táctiles exactas para el personaje seleccionado
  function renderHitboxes(isFace, gender) {
    const charKey = (gender === 'girl') ? 'girl' : 'boy';
    const source = isFace ? CHARACTER_FACE_DATA[charKey] : CHARACTER_BODY_DATA[charKey];
    let html = '';

    Object.keys(source).forEach(key => {
      const item = source[key];
      if (item.altBoxes) {
        item.altBoxes.forEach((ab, idx) => {
          html += `<div id="hitbox-${key}-${idx}" class="body-hitbox" onclick="handlePartClick('${key}')" style="position: absolute; top: ${ab.top}%; left: ${ab.left}%; width: ${ab.width}%; height: ${ab.height}%; cursor: pointer; border-radius: ${isFace ? '50%' : '24px'}; z-index: 20;"></div>`;
        });
      } else if (item.box) {
        html += `<div id="hitbox-${key}" class="body-hitbox" onclick="handlePartClick('${key}')" style="position: absolute; top: ${item.box.top}%; left: ${item.box.left}%; width: ${item.box.width}%; height: ${item.box.height}%; cursor: pointer; border-radius: ${isFace ? '50%' : '24px'}; z-index: 20;"></div>`;
      }
    });
    return html;
  }

  // Manejo de clic o toque en una parte anatómica
  window.handlePartClick = function(clickedPartKey) {
    if (BodyMirrorGame.isTransitioning) return;

    const isFace = (BodyMirrorGame.currentPhase === 'face');
    const expectedKey = isFace 
      ? BodyMirrorGame.faceItems[BodyMirrorGame.currentItemIndex]
      : BodyMirrorGame.bodyItems[BodyMirrorGame.currentItemIndex];

    const targetData = ANATOMY_GRAMMAR[expectedKey] || { praise: '¡Muy bien!' };
    const clickedData = ANATOMY_GRAMMAR[clickedPartKey] || { thatIs: 'Esa es esa parte', withArticle: clickedPartKey };

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
      // Duda o toque en otra parte: refuerzo amable sin castigo con concordancia gramatical perfecta
      if (typeof playGameAudioEffect === 'function') playGameAudioEffect('running');
      triggerGentleFeedback(clickedPartKey);

      // Locución natural y adaptativa (ej: "¡Esos son los ojos!... ¡Ahora busquemos las orejas!")
      safeSpeak(`${clickedData.thatIs} ¡Ahora busquemos ${clickedData.withArticle === targetData.withArticle ? 'bien' : targetData.withArticle}!`, () => {
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
      hb.style.boxShadow = '0 0 28px 12px rgba(16, 185, 129, 0.9)';
      hb.style.border = '3px solid #34D399';
    });
  }

  function triggerGentleFeedback(partKey) {
    const hitboxes = document.querySelectorAll(`[id^="hitbox-${partKey}"]`);
    hitboxes.forEach(hb => {
      hb.style.boxShadow = '0 0 16px 4px rgba(59, 130, 246, 0.7)';
      hb.style.border = '2px solid #60A5FA';
      setTimeout(() => {
        hb.style.boxShadow = 'none';
        hb.style.border = 'none';
      }, 700);
    });
  }

  function updatePromptUI(text, icon) {
    const promptTextEl = document.getElementById('body-prompt-text');
    const promptIconEl = document.getElementById('body-prompt-icon');
    if (promptTextEl) promptTextEl.textContent = text;
    if (promptIconEl) promptIconEl.textContent = icon || '✨';
  }

  function updateMirrorHeader(title, subtitle) {
    const tEl = document.getElementById('body-mirror-title');
    const bEl = document.getElementById('body-mirror-badge');
    if (tEl && title) tEl.textContent = title;
    if (bEl && subtitle) bEl.textContent = subtitle;
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

    const modal = document.getElementById('body-mirror-victory-modal');
    if (modal) modal.style.display = 'flex';

    if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
      activeChildProfile.coins = (activeChildProfile.coins || 0) + 50;
      activeChildProfile.stars = (activeChildProfile.stars || 0) + 10;
      if (typeof saveActiveChildProfile === 'function') saveActiveChildProfile();
      if (typeof updateStatsUI === 'function') updateStatsUI();
    }

    const kidName = (typeof getStudentFirstName === 'function') ? getStudentFirstName() : 'Campeón';
    safeSpeak(`¡Felicidades ${kidName}! Completaste el Espejo Mágico. ¡Conoces a la perfección tu cuerpo y tu cara!`);
  }

  window.replayBodyMirror = function() {
    const modal = document.getElementById('body-mirror-victory-modal');
    if (modal) modal.style.display = 'none';
    window.openBodyMirrorScreen();
  };

  window.closeBodyMirrorVictoryModal = function() {
    const modal = document.getElementById('body-mirror-victory-modal');
    if (modal) modal.style.display = 'none';
    if (typeof switchScreen === 'function') switchScreen('map');
  };

})();
