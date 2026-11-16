// =========================================================================
// CRIN AVENTURAS DE LECTOESCRITURA - EL VALLE DE LAS FORMAS Y COLORES
// Módulo Psicopedagógico de Percepción Visual, Formas Geométricas y Categorización
// Protocolo: Colores (Rojo, Verde, Amarillo, Azul), Formas (Círculo, Cuadrado, Triángulo)
//            y Discriminación Lógica (Igual / Diferente)
// Metodología: DUA, Aprendizaje Sin Error, Andamiaje Escalonado (Bruner/Piaget)
// =========================================================================

(function() {
  'use strict';

  const ShapesColorsGame = {
    isRunning: false,
    currentPhase: 'colors', // 'colors' | 'shapes' | 'compare' | 'victory'
    
    // Listas de rondas
    colorItems: ['rojo', 'azul', 'verde', 'amarillo'],
    shapeItems: ['circulo', 'cuadrado', 'triangulo'],
    compareItems: [],
    
    currentItemIndex: 0,
    currentTarget: null,
    
    isSpeaking: false,
    isTransitioning: false,
    
    hintTimer: null,
    speechWatchdog: null,
    
    starsEarned: 0,
    coinsEarned: 0
  };

  window.ShapesColorsGame = ShapesColorsGame;

  // Catálogo cromático y semántico
  const COLOR_DATA = {
    'rojo': {
      key: 'rojo',
      name: 'Rojo',
      article: 'el cofre rojo',
      icon: '🔴',
      img: 'assets/cofre_rojo.png?v=321',
      prompt: '¡Busquemos el cofre de color ROJO!',
      praise: '¡Excelente! ¡Ese es el cofre rojo lleno de brillantes rubíes!'
    },
    'azul': {
      key: 'azul',
      name: 'Azul',
      article: 'el cofre azul',
      icon: '🔵',
      img: 'assets/cofre_azul.png?v=321',
      prompt: '¡Toca el cofre de color AZUL!',
      praise: '¡Genial! ¡Ese es el cofre azul brillante como el cielo!'
    },
    'verde': {
      key: 'verde',
      name: 'Verde',
      article: 'el cofre verde',
      icon: '🟢',
      img: 'assets/cofre_verde.png?v=321',
      prompt: '¡Encuentra el cofre de color VERDE!',
      praise: '¡Súper! ¡Ese es el cofre verde de esmeraldas de la naturaleza!'
    },
    'amarillo': {
      key: 'amarillo',
      name: 'Amarillo',
      article: 'el cofre amarillo',
      icon: '🟡',
      img: 'assets/cofre_amarillo.png?v=321',
      prompt: '¡Busquemos el cofre de color AMARILLO!',
      praise: '¡Bravo! ¡Ese es el cofre amarillo luminoso como el sol!'
    }
  };

  // Catálogo de formas geométricas 3D
  const SHAPE_DATA = {
    'circulo': {
      key: 'circulo',
      name: 'Círculo',
      icon: '🔴',
      img: 'assets/forma_circulo.png?v=321',
      prompt: '¡Busquemos la figura redonda! ¡Toca el CÍRCULO!',
      praise: '¡Fantástico! ¡Ese es el círculo, redondo como una pelota o el sol!'
    },
    'cuadrado': {
      key: 'cuadrado',
      name: 'Cuadrado',
      icon: '🟦',
      img: 'assets/forma_cuadrado.png?v=321',
      prompt: '¡Busquemos la figura con cuatro lados rectos! ¡Toca el CUADRADO!',
      praise: '¡Muy bien! ¡Ese es el cuadrado, con sus cuatro esquinitas iguales!'
    },
    'triangulo': {
      key: 'triangulo',
      name: 'Triángulo',
      icon: '🔺',
      img: 'assets/forma_triangulo.png?v=321',
      prompt: '¡Busquemos la figura con tres puntitas! ¡Toca el TRIÁNGULO!',
      praise: '¡Excelente! ¡Ese es el triángulo, con sus tres lados y tres puntas!'
    }
  };

  // Desafíos de discriminación comparativa (Igual / Diferente)
  const COMPARE_ROUNDS = [
    {
      id: 1,
      itemA: { img: 'assets/forma_circulo.png?v=321', label: 'Círculo Rojo' },
      itemB: { img: 'assets/forma_circulo.png?v=321', label: 'Círculo Rojo' },
      isSame: true,
      praiseText: '¡Exacto! ¡Son iguales! Tienen la misma forma redonda y el mismo color rojo.',
      helpText: 'Observa bien: ambas figuras son círculos rojos, ¡son iguales! Toca el botón de Iguales.'
    },
    {
      id: 2,
      itemA: { img: 'assets/forma_cuadrado.png?v=321', label: 'Cuadrado Azul' },
      itemB: { img: 'assets/forma_triangulo.png?v=321', label: 'Triángulo Amarillo' },
      isSame: false,
      praiseText: '¡Exacto! ¡Son diferentes! Uno es un cuadrado azul y el otro un triángulo amarillo.',
      helpText: 'Observa bien: tienen formas y colores distintos, ¡son diferentes! Toca el botón de Diferentes.'
    },
    {
      id: 3,
      itemA: { img: 'assets/cofre_verde.png?v=321', label: 'Cofre Verde' },
      itemB: { img: 'assets/cofre_verde.png?v=321', label: 'Cofre Verde' },
      isSame: true,
      praiseText: '¡Exacto! ¡Son iguales! Los dos son cofres verdes brillantes.',
      helpText: 'Observa bien: los dos cofres son de color verde, ¡son iguales! Toca el botón de Iguales.'
    },
    {
      id: 4,
      itemA: { img: 'assets/cofre_rojo.png?v=321', label: 'Cofre Rojo' },
      itemB: { img: 'assets/cofre_azul.png?v=321', label: 'Cofre Azul' },
      isSame: false,
      praiseText: '¡Exacto! ¡Son diferentes! Un cofre es rojo y el otro es azul, tienen distinto color.',
      helpText: 'Observa bien: un cofre es rojo y el otro es azul, ¡son diferentes! Toca el botón de Diferentes.'
    },
    {
      id: 5,
      itemA: { img: 'assets/forma_cuadrado.png?v=321', label: 'Cuadrado Azul' },
      itemB: { img: 'assets/forma_cuadrado.png?v=321', label: 'Cuadrado Azul' },
      isSame: true,
      praiseText: '¡Exacto! ¡Son iguales! Los dos son cuadrados de color azul.',
      helpText: 'Observa bien: ambos son cuadrados azules idénticos, ¡son iguales! Toca el botón de Iguales.'
    }
  ];

  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Locución segura con watchdog
  function safeSpeak(text, onComplete) {
    if (ShapesColorsGame.speechWatchdog) clearTimeout(ShapesColorsGame.speechWatchdog);
    ShapesColorsGame.isSpeaking = true;

    ShapesColorsGame.speechWatchdog = setTimeout(() => {
      ShapesColorsGame.isSpeaking = false;
    }, 8500);

    const finish = () => {
      ShapesColorsGame.isSpeaking = false;
      if (ShapesColorsGame.speechWatchdog) clearTimeout(ShapesColorsGame.speechWatchdog);
      if (typeof onComplete === 'function') onComplete();
    };

    if (typeof speakText === 'function') {
      speakText(text, finish);
    } else {
      finish();
    }
  }

  // Temporizador paciente de andamiaje (10 segundos antes de sugerir)
  function startHintTimer(callback, delay = 10000) {
    if (ShapesColorsGame.hintTimer) clearTimeout(ShapesColorsGame.hintTimer);
    ShapesColorsGame.hintTimer = setTimeout(() => {
      if (!ShapesColorsGame.isTransitioning && ShapesColorsGame.isRunning) {
        if (typeof callback === 'function') callback();
      }
    }, delay);
  }

  // --- APERTURA Y CIERRE DE PANTALLA ---
  window.openShapesColorsScreen = function() {
    if (typeof stopAllAudio === 'function') stopAllAudio('open_shapes_colors');
    if (typeof switchScreen === 'function') switchScreen('shapes-colors');

    ShapesColorsGame.isRunning = true;
    ShapesColorsGame.currentPhase = 'colors';
    ShapesColorsGame.currentItemIndex = 0;
    ShapesColorsGame.starsEarned = 0;
    ShapesColorsGame.coinsEarned = 0;

    startColorsPhase();
  };

  window.closeShapesColorsAndReturnToMap = function() {
    ShapesColorsGame.isRunning = false;
    if (ShapesColorsGame.hintTimer) clearTimeout(ShapesColorsGame.hintTimer);
    if (ShapesColorsGame.speechWatchdog) clearTimeout(ShapesColorsGame.speechWatchdog);
    if (typeof stopAllAudio === 'function') stopAllAudio('exit_shapes_colors');

    const modal = document.getElementById('shapes-colors-victory-modal');
    if (modal) modal.style.display = 'none';

    if (typeof switchScreen === 'function') switchScreen('map');
  };

  // =========================================================================
  // FASE 1: LOS COFRES MÁGICOS (COLORES)
  // =========================================================================
  function startColorsPhase() {
    ShapesColorsGame.currentPhase = 'colors';
    ShapesColorsGame.isTransitioning = false;
    ShapesColorsGame.colorItems = shuffle(['rojo', 'azul', 'verde', 'amarillo']);
    ShapesColorsGame.currentItemIndex = 0;

    updateHeaderTitle('Valle de los Colores', 'Fase 1: Los Cofres Mágicos');
    renderColorsStage();
    loadNextColorItem();
  }

  function renderColorsStage() {
    const stage = document.getElementById('shapes-colors-stage');
    if (!stage) return;

    stage.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 12px; box-sizing: border-box;">
        
        <!-- BARRA SUPERIOR DE CONSIGNA CON ALTO CONTRASTE -->
        <div id="sc-prompt-box" style="background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 2.5px solid #10B981; border-radius: 18px; padding: 10px 18px; display: flex; align-items: center; gap: 12px; max-width: 620px; width: 100%; box-shadow: 0 6px 18px rgba(0,0,0,0.3); z-index: 10;">
          <div id="sc-prompt-icon" style="font-size: 30px; background: rgba(16, 185, 129, 0.2); border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
            🎨
          </div>
          <div style="flex: 1; text-align: left;">
            <div id="sc-prompt-text" style="font-size: 15px; font-weight: 900; color: #FFFFFF; line-height: 1.25;">
              Cargando colores...
            </div>
          </div>
          <button onclick="repeatShapesPrompt()" style="background: rgba(255,255,255,0.15); border: 1.5px solid #A7F3D0; color: #A7F3D0; padding: 6px 12px; border-radius: 12px; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Volver a escuchar">
            <span>🔊</span>
            <span>Oír</span>
          </button>
        </div>

        <!-- ESCENARIO PRINCIPAL: LOS 4 COFRES MÁGICOS 3D -->
        <div style="flex: 1; width: 100%; max-width: 820px; display: flex; align-items: center; justify-content: center; position: relative;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; width: 100%; max-width: 760px; padding: 10px;">
            ${['rojo', 'azul', 'verde', 'amarillo'].map(colorKey => {
              const data = COLOR_DATA[colorKey];
              return `
                <div id="chest-btn-${colorKey}" onclick="handleColorClick('${colorKey}')" 
                     class="sc-interactive-item"
                     style="background: rgba(255, 255, 255, 0.9); border: 3px solid #E2E8F0; border-radius: 22px; padding: 12px 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 8px 20px rgba(0,0,0,0.08); transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s, border-color 0.2s; position: relative; user-select: none;"
                     onmouseover="this.style.transform='scale(1.06) translateY(-4px)'" 
                     onmouseout="this.style.transform='scale(1) translateY(0)'">
                  <div style="width: 130px; height: 130px; display: flex; align-items: center; justify-content: center; position: relative;">
                    <img id="img-chest-${colorKey}" src="${data.img}" alt="Cofre ${data.name}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 6px 10px rgba(0,0,0,0.25)); pointer-events: none;" />
                  </div>
                  <div style="margin-top: 6px; font-size: 14px; font-weight: 900; color: #1E293B; letter-spacing: 0.5px; text-transform: uppercase;">
                    ${data.name}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- BARRA INFERIOR DE APOYO PEDAGÓGICO -->
        <div style="display: flex; gap: 8px; align-items: center; justify-content: center; width: 100%; padding-bottom: 4px;">
          <button onclick="closeShapesColorsAndReturnToMap()" style="background: #F1F5F9; border: 1px solid #CBD5E1; color: #475569; padding: 6px 14px; border-radius: 12px; font-size: 11px; font-weight: bold; cursor: pointer;">
            🗺️ Volver al Mapa
          </button>
          <button onclick="openTherapistGuideModal('shapes_colors')" style="background: #ECFDF5; border: 1px solid #A7F3D0; color: #047857; padding: 6px 14px; border-radius: 12px; font-size: 11px; font-weight: bold; cursor: pointer;">
            ℹ️ Guía Clínica (Percepción)
          </button>
        </div>

      </div>
    `;
  }

  function loadNextColorItem() {
    if (ShapesColorsGame.currentItemIndex >= ShapesColorsGame.colorItems.length) {
      // Fin de la fase de colores -> Pasamos a Formas
      safeSpeak('¡Fantástico! ¡Identificaste todos los colores de los cofres! Ahora entremos al Taller de las Formas.', () => {
        startShapesPhase();
      });
      return;
    }

    const key = ShapesColorsGame.colorItems[ShapesColorsGame.currentItemIndex];
    ShapesColorsGame.currentTarget = COLOR_DATA[key];

    updatePromptUI(ShapesColorsGame.currentTarget.prompt, ShapesColorsGame.currentTarget.icon);
    clearAllHints();

    safeSpeak(ShapesColorsGame.currentTarget.prompt, () => {
      startHintTimer(() => {
        highlightHint(`chest-btn-${key}`);
      }, 10000);
    });
  }

  window.handleColorClick = function(clickedColorKey) {
    if (ShapesColorsGame.isTransitioning) return;

    const expectedKey = ShapesColorsGame.colorItems[ShapesColorsGame.currentItemIndex];
    const targetData = COLOR_DATA[expectedKey];
    const clickedData = COLOR_DATA[clickedColorKey];

    if (ShapesColorsGame.hintTimer) clearTimeout(ShapesColorsGame.hintTimer);
    clearAllHints();

    if (clickedColorKey === expectedKey) {
      // ¡ACIERTO!
      ShapesColorsGame.isTransitioning = true;
      if (typeof playGameAudioEffect === 'function') playGameAudioEffect('correct');

      const card = document.getElementById(`chest-btn-${clickedColorKey}`);
      if (card) {
        card.style.transform = 'scale(1.15) translateY(-8px)';
        card.style.borderColor = '#10B981';
        card.style.boxShadow = '0 12px 28px rgba(16, 185, 129, 0.4)';
      }

      if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
        activeChildProfile.coins = (activeChildProfile.coins || 0) + 5;
        if (typeof updateProfileDisplay === 'function') updateProfileDisplay();
      }

      safeSpeak(targetData.praise, () => {
        setTimeout(() => {
          if (card) {
            card.style.transform = 'scale(1) translateY(0)';
            card.style.borderColor = '#E2E8F0';
            card.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
          }
          ShapesColorsGame.currentItemIndex++;
          ShapesColorsGame.isTransitioning = false;
          loadNextColorItem();
        }, 500);
      });
    } else {
      // Intento incorrecto - Andamiaje respetuoso sin error
      if (typeof playGameAudioEffect === 'function') playGameAudioEffect('running');

      const card = document.getElementById(`chest-btn-${clickedColorKey}`);
      if (card) {
        card.style.transform = 'translateX(-6px)';
        setTimeout(() => { card.style.transform = 'translateX(6px)'; }, 100);
        setTimeout(() => { card.style.transform = 'scale(1) translateY(0)'; }, 200);
      }

      safeSpeak(`Ese es ${clickedData.article}. ${targetData.prompt}`, () => {
        startHintTimer(() => {
          highlightHint(`chest-btn-${expectedKey}`);
        }, 10000);
      });
    }
  };

  // =========================================================================
  // FASE 2: EL TALLER DE LAS FORMAS GEOMÉTRICAS
  // =========================================================================
  function startShapesPhase() {
    ShapesColorsGame.currentPhase = 'shapes';
    ShapesColorsGame.isTransitioning = false;
    ShapesColorsGame.shapeItems = shuffle(['circulo', 'cuadrado', 'triangulo']);
    ShapesColorsGame.currentItemIndex = 0;

    updateHeaderTitle('Taller de las Formas', 'Fase 2: Círculo, Cuadrado y Triángulo');
    renderShapesStage();
    loadNextShapeItem();
  }

  function renderShapesStage() {
    const stage = document.getElementById('shapes-colors-stage');
    if (!stage) return;

    stage.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 12px; box-sizing: border-box;">
        
        <!-- BARRA SUPERIOR DE CONSIGNA CON ALTO CONTRASTE -->
        <div id="sc-prompt-box" style="background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 2.5px solid #3B82F6; border-radius: 18px; padding: 10px 18px; display: flex; align-items: center; gap: 12px; max-width: 620px; width: 100%; box-shadow: 0 6px 18px rgba(0,0,0,0.3); z-index: 10;">
          <div id="sc-prompt-icon" style="font-size: 30px; background: rgba(59, 130, 246, 0.2); border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
            📐
          </div>
          <div style="flex: 1; text-align: left;">
            <div id="sc-prompt-text" style="font-size: 15px; font-weight: 900; color: #FFFFFF; line-height: 1.25;">
              Cargando formas...
            </div>
          </div>
          <button onclick="repeatShapesPrompt()" style="background: rgba(255,255,255,0.15); border: 1.5px solid #BFDBFE; color: #BFDBFE; padding: 6px 12px; border-radius: 12px; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Volver a escuchar">
            <span>🔊</span>
            <span>Oír</span>
          </button>
        </div>

        <!-- ESCENARIO PRINCIPAL: LAS 3 FORMAS GEOMÉTRICAS 3D -->
        <div style="flex: 1; width: 100%; max-width: 820px; display: flex; align-items: center; justify-content: center; position: relative;">
          <div style="display: flex; gap: 24px; align-items: center; justify-content: center; flex-wrap: wrap; width: 100%; padding: 10px;">
            ${['circulo', 'cuadrado', 'triangulo'].map(shapeKey => {
              const data = SHAPE_DATA[shapeKey];
              return `
                <div id="shape-btn-${shapeKey}" onclick="handleShapeClick('${shapeKey}')" 
                     class="sc-interactive-item"
                     style="background: rgba(255, 255, 255, 0.95); border: 3.5px solid #E2E8F0; border-radius: 26px; padding: 18px 14px; min-width: 170px; max-width: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 10px 24px rgba(0,0,0,0.1); transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s, border-color 0.2s; position: relative; user-select: none;"
                     onmouseover="this.style.transform='scale(1.08) translateY(-6px)'" 
                     onmouseout="this.style.transform='scale(1) translateY(0)'">
                  <div style="width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; position: relative;">
                    <img id="img-shape-${shapeKey}" src="${data.img}" alt="${data.name}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 8px 14px rgba(0,0,0,0.22)); pointer-events: none;" />
                  </div>
                  <div style="margin-top: 10px; font-size: 15px; font-weight: 900; color: #1E293B; letter-spacing: 0.5px; text-transform: uppercase;">
                    ${data.name}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- BARRA INFERIOR DE APOYO PEDAGÓGICO -->
        <div style="display: flex; gap: 8px; align-items: center; justify-content: center; width: 100%; padding-bottom: 4px;">
          <button onclick="closeShapesColorsAndReturnToMap()" style="background: #F1F5F9; border: 1px solid #CBD5E1; color: #475569; padding: 6px 14px; border-radius: 12px; font-size: 11px; font-weight: bold; cursor: pointer;">
            🗺️ Volver al Mapa
          </button>
          <button onclick="openTherapistGuideModal('shapes_colors')" style="background: #EFF6FF; border: 1px solid #BFDBFE; color: #1D4ED8; padding: 6px 14px; border-radius: 12px; font-size: 11px; font-weight: bold; cursor: pointer;">
            ℹ️ Guía Clínica (Formas)
          </button>
        </div>

      </div>
    `;
  }

  function loadNextShapeItem() {
    if (ShapesColorsGame.currentItemIndex >= ShapesColorsGame.shapeItems.length) {
      // Fin de la fase de formas -> Pasamos a Igual / Diferente
      safeSpeak('¡Maravilloso! ¡Reconociste el círculo, el cuadrado y el triángulo! Ahora seremos detectives de Igual y Diferente.', () => {
        startComparePhase();
      });
      return;
    }

    const key = ShapesColorsGame.shapeItems[ShapesColorsGame.currentItemIndex];
    ShapesColorsGame.currentTarget = SHAPE_DATA[key];

    updatePromptUI(ShapesColorsGame.currentTarget.prompt, ShapesColorsGame.currentTarget.icon);
    clearAllHints();

    safeSpeak(ShapesColorsGame.currentTarget.prompt, () => {
      startHintTimer(() => {
        highlightHint(`shape-btn-${key}`);
      }, 10000);
    });
  }

  window.handleShapeClick = function(clickedShapeKey) {
    if (ShapesColorsGame.isTransitioning) return;

    const expectedKey = ShapesColorsGame.shapeItems[ShapesColorsGame.currentItemIndex];
    const targetData = SHAPE_DATA[expectedKey];
    const clickedData = SHAPE_DATA[clickedShapeKey];

    if (ShapesColorsGame.hintTimer) clearTimeout(ShapesColorsGame.hintTimer);
    clearAllHints();

    if (clickedShapeKey === expectedKey) {
      // ¡ACIERTO!
      ShapesColorsGame.isTransitioning = true;
      if (typeof playGameAudioEffect === 'function') playGameAudioEffect('correct');

      const card = document.getElementById(`shape-btn-${clickedShapeKey}`);
      if (card) {
        card.style.transform = 'scale(1.18) translateY(-10px)';
        card.style.borderColor = '#3B82F6';
        card.style.boxShadow = '0 14px 30px rgba(59, 130, 246, 0.45)';
      }

      if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
        activeChildProfile.coins = (activeChildProfile.coins || 0) + 5;
        if (typeof updateProfileDisplay === 'function') updateProfileDisplay();
      }

      safeSpeak(targetData.praise, () => {
        setTimeout(() => {
          if (card) {
            card.style.transform = 'scale(1) translateY(0)';
            card.style.borderColor = '#E2E8F0';
            card.style.boxShadow = '0 10px 24px rgba(0,0,0,0.1)';
          }
          ShapesColorsGame.currentItemIndex++;
          ShapesColorsGame.isTransitioning = false;
          loadNextShapeItem();
        }, 500);
      });
    } else {
      // Intento incorrecto - Andamiaje
      if (typeof playGameAudioEffect === 'function') playGameAudioEffect('running');

      const card = document.getElementById(`shape-btn-${clickedShapeKey}`);
      if (card) {
        card.style.transform = 'translateX(-6px)';
        setTimeout(() => { card.style.transform = 'translateX(6px)'; }, 100);
        setTimeout(() => { card.style.transform = 'scale(1) translateY(0)'; }, 200);
      }

      safeSpeak(`Ese es el ${clickedData.name}. ${targetData.prompt}`, () => {
        startHintTimer(() => {
          highlightHint(`shape-btn-${expectedKey}`);
        }, 10000);
      });
    }
  };

  // =========================================================================
  // FASE 3: EL DETECTIVE (IGUAL O DIFERENTE)
  // =========================================================================
  function startComparePhase() {
    ShapesColorsGame.currentPhase = 'compare';
    ShapesColorsGame.isTransitioning = false;
    ShapesColorsGame.compareItems = shuffle(COMPARE_ROUNDS);
    ShapesColorsGame.currentItemIndex = 0;

    updateHeaderTitle('El Detective de las Formas', 'Fase 3: ¿Igual o Diferente?');
    renderCompareStage();
    loadNextCompareItem();
  }

  function renderCompareStage() {
    const stage = document.getElementById('shapes-colors-stage');
    if (!stage) return;

    stage.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 12px; box-sizing: border-box;">
        
        <!-- BARRA SUPERIOR DE CONSIGNA CON ALTO CONTRASTE -->
        <div id="sc-prompt-box" style="background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 2.5px solid #8B5CF6; border-radius: 18px; padding: 10px 18px; display: flex; align-items: center; gap: 12px; max-width: 620px; width: 100%; box-shadow: 0 6px 18px rgba(0,0,0,0.3); z-index: 10;">
          <div id="sc-prompt-icon" style="font-size: 30px; background: rgba(139, 92, 246, 0.2); border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
            🔍
          </div>
          <div style="flex: 1; text-align: left;">
            <div id="sc-prompt-text" style="font-size: 15px; font-weight: 900; color: #FFFFFF; line-height: 1.25;">
              ¿Son iguales o diferentes?
            </div>
          </div>
          <button onclick="repeatShapesPrompt()" style="background: rgba(255,255,255,0.15); border: 1.5px solid #DDD6FE; color: #DDD6FE; padding: 6px 12px; border-radius: 12px; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Volver a escuchar">
            <span>🔊</span>
            <span>Oír</span>
          </button>
        </div>

        <!-- PEDESTAL MÁGICO CON LAS DOS FIGURAS -->
        <div style="flex: 1; width: 100%; max-width: 680px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
          
          <div id="sc-pedestal-card" style="background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(241,245,249,0.9) 100%); border: 3px solid #CBD5E1; border-radius: 28px; padding: 20px 24px; box-shadow: 0 12px 30px rgba(0,0,0,0.12); display: flex; align-items: center; justify-content: center; gap: 32px; width: 100%; max-width: 480px; transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s;">
            <!-- Elemento Izquierdo A -->
            <div style="width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.6); border-radius: 20px; box-shadow: inset 0 2px 6px rgba(0,0,0,0.06); padding: 8px;">
              <img id="sc-compare-img-a" src="" alt="Elemento 1" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.2));" />
            </div>

            <!-- Divisor Mágico -->
            <div style="font-size: 26px; font-weight: 900; color: #94A3B8; user-select: none;">
              ✨
            </div>

            <!-- Elemento Derecho B -->
            <div style="width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.6); border-radius: 20px; box-shadow: inset 0 2px 6px rgba(0,0,0,0.06); padding: 8px;">
              <img id="sc-compare-img-b" src="" alt="Elemento 2" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.2));" />
            </div>
          </div>

          <!-- BOTONES TÁCTILES GIGANTES: IGUAL Y DIFERENTE -->
          <div style="display: flex; gap: 20px; align-items: center; justify-content: center; margin-top: 24px; width: 100%; max-width: 520px;">
            
            <!-- BOTÓN IGUAL -->
            <button id="sc-btn-same" onclick="handleCompareAnswer(true)" 
                    style="flex: 1; min-height: 64px; background: linear-gradient(135deg, #059669 0%, #10B981 100%); border: 3px solid #6EE7B7; border-radius: 20px; color: white; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; box-shadow: 0 8px 18px rgba(16, 185, 129, 0.35); transition: transform 0.18s, box-shadow 0.18s; font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;"
                    onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
              <span style="font-size: 24px;">🟢</span>
              <span>IGUALES</span>
            </button>

            <!-- BOTÓN DIFERENTE -->
            <button id="sc-btn-diff" onclick="handleCompareAnswer(false)" 
                    style="flex: 1; min-height: 64px; background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); border: 3px solid #C4B5FD; border-radius: 20px; color: white; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; box-shadow: 0 8px 18px rgba(124, 58, 237, 0.35); transition: transform 0.18s, box-shadow 0.18s; font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;"
                    onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
              <span style="font-size: 24px;">🟣</span>
              <span>DIFERENTES</span>
            </button>

          </div>

        </div>

        <!-- BARRA INFERIOR DE APOYO PEDAGÓGICO -->
        <div style="display: flex; gap: 8px; align-items: center; justify-content: center; width: 100%; padding-bottom: 4px;">
          <button onclick="closeShapesColorsAndReturnToMap()" style="background: #F1F5F9; border: 1px solid #CBD5E1; color: #475569; padding: 6px 14px; border-radius: 12px; font-size: 11px; font-weight: bold; cursor: pointer;">
            🗺️ Volver al Mapa
          </button>
          <button onclick="openTherapistGuideModal('shapes_colors')" style="background: #F5F3FF; border: 1px solid #DDD6FE; color: #6D28D9; padding: 6px 14px; border-radius: 12px; font-size: 11px; font-weight: bold; cursor: pointer;">
            ℹ️ Guía Clínica (Igual/Diferente)
          </button>
        </div>

      </div>
    `;
  }

  function loadNextCompareItem() {
    if (ShapesColorsGame.currentItemIndex >= ShapesColorsGame.compareItems.length) {
      // Fin del juego -> Victoria
      triggerShapesVictoryScreen();
      return;
    }

    const round = ShapesColorsGame.compareItems[ShapesColorsGame.currentItemIndex];
    ShapesColorsGame.currentTarget = round;

    const imgA = document.getElementById('sc-compare-img-a');
    const imgB = document.getElementById('sc-compare-img-b');
    if (imgA) imgA.src = round.itemA.img;
    if (imgB) imgB.src = round.itemB.img;

    const promptText = 'Observa las dos figuras... ¿Son IGUALES o DIFERENTES?';
    updatePromptUI(promptText, '🔍');
    clearAllHints();

    safeSpeak(promptText, () => {
      startHintTimer(() => {
        const correctBtnId = round.isSame ? 'sc-btn-same' : 'sc-btn-diff';
        highlightHint(correctBtnId);
      }, 10000);
    });
  }

  window.handleCompareAnswer = function(chosenSame) {
    if (ShapesColorsGame.isTransitioning) return;

    const round = ShapesColorsGame.compareItems[ShapesColorsGame.currentItemIndex];
    if (ShapesColorsGame.hintTimer) clearTimeout(ShapesColorsGame.hintTimer);
    clearAllHints();

    const isCorrect = (chosenSame === round.isSame);

    if (isCorrect) {
      // ¡ACIERTO!
      ShapesColorsGame.isTransitioning = true;
      if (typeof playGameAudioEffect === 'function') playGameAudioEffect('correct');

      const pedestal = document.getElementById('sc-pedestal-card');
      if (pedestal) {
        pedestal.style.borderColor = '#10B981';
        pedestal.style.transform = 'scale(1.05)';
        pedestal.style.boxShadow = '0 16px 36px rgba(16, 185, 129, 0.3)';
      }

      if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
        activeChildProfile.coins = (activeChildProfile.coins || 0) + 5;
        if (typeof updateProfileDisplay === 'function') updateProfileDisplay();
      }

      safeSpeak(round.praiseText, () => {
        setTimeout(() => {
          if (pedestal) {
            pedestal.style.borderColor = '#CBD5E1';
            pedestal.style.transform = 'scale(1)';
            pedestal.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)';
          }
          ShapesColorsGame.currentItemIndex++;
          ShapesColorsGame.isTransitioning = false;
          loadNextCompareItem();
        }, 500);
      });
    } else {
      // Intento incorrecto - Andamiaje
      if (typeof playGameAudioEffect === 'function') playGameAudioEffect('running');

      const btnId = chosenSame ? 'sc-btn-same' : 'sc-btn-diff';
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.style.transform = 'translateX(-6px)';
        setTimeout(() => { btn.style.transform = 'translateX(6px)'; }, 100);
        setTimeout(() => { btn.style.transform = 'scale(1)'; }, 200);
      }

      safeSpeak(round.helpText, () => {
        startHintTimer(() => {
          const correctBtnId = round.isSame ? 'sc-btn-same' : 'sc-btn-diff';
          highlightHint(correctBtnId);
        }, 10000);
      });
    }
  };

  // =========================================================================
  // FASE 4: VICTORIA FINAL
  // =========================================================================
  function triggerShapesVictoryScreen() {
    ShapesColorsGame.currentPhase = 'victory';
    if (typeof triggerConfettiEffect === 'function') triggerConfettiEffect();
    if (typeof playGameAudioEffect === 'function') playGameAudioEffect('correct');

    if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
      activeChildProfile.stars = (activeChildProfile.stars || 0) + 15;
      activeChildProfile.coins = (activeChildProfile.coins || 0) + 25;
      if (typeof saveChildProfiles === 'function') saveChildProfiles();
      if (typeof updateProfileDisplay === 'function') updateProfileDisplay();
    }

    safeSpeak('¡Lo lograste! ¡Completaste todo el Valle de las Formas y Colores! ¡Eres un gran explorador!');

    const stage = document.getElementById('shapes-colors-stage');
    if (!stage) return;

    stage.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; text-align: center;">
        
        <div style="background: white; border-radius: 28px; padding: 28px 24px; max-width: 440px; width: 100%; box-shadow: 0 20px 45px rgba(0,0,0,0.18); border: 3.5px solid #10B981; animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
          
          <div style="font-size: 60px; margin-bottom: 8px;">🏆</div>
          
          <h2 style="font-size: 22px; font-weight: 900; color: #047857; margin: 0 0 6px 0;">
            ¡MISIÓN CUMPLIDA!
          </h2>
          
          <p style="font-size: 13px; font-weight: 700; color: #475569; margin: 0 0 16px 0; line-height: 1.4;">
            ¡Identificaste los 4 colores, las figuras geométricas y resolviste los desafíos de Igual y Diferente!
          </p>

          <div style="background: #F0FDF4; border: 2px dashed #A7F3D0; border-radius: 18px; padding: 12px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-around;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 22px;">⭐</span>
              <span style="font-size: 16px; font-weight: 900; color: #D97706;">+15 Estrellas</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 22px;">🪙</span>
              <span style="font-size: 16px; font-weight: 900; color: #2563EB;">+25 Monedas</span>
            </div>
          </div>

          <div style="display: flex; gap: 10px; width: 100%;">
            <button onclick="openShapesColorsScreen()" style="flex: 1; background: linear-gradient(135deg, #059669 0%, #10B981 100%); color: white; border: none; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
              🔄 Jugar de Nuevo
            </button>
            <button onclick="closeShapesColorsAndReturnToMap()" style="flex: 1; background: #F1F5F9; color: #334155; border: 1.5px solid #CBD5E1; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: 800; cursor: pointer;">
              🗺️ Ir al Mapa
            </button>
          </div>

        </div>

      </div>
    `;
  }

  // =========================================================================
  // UTILIDADES Y ANDAMIAJE VISUAL
  // =========================================================================
  function updatePromptUI(text, icon) {
    const promptTextEl = document.getElementById('sc-prompt-text');
    const promptIconEl = document.getElementById('sc-prompt-icon');
    if (promptTextEl) promptTextEl.textContent = text;
    if (promptIconEl) promptIconEl.textContent = icon || '✨';
  }

  function updateHeaderTitle(title, badge) {
    const tEl = document.getElementById('shapes-colors-title');
    const bEl = document.getElementById('shapes-colors-badge');
    if (tEl && title) tEl.textContent = title;
    if (bEl && badge) bEl.textContent = badge;
  }

  function highlightHint(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.style.boxShadow = '0 0 25px 8px rgba(245, 158, 11, 0.85)';
    el.style.borderColor = '#F59E0B';
  }

  function clearAllHints() {
    const items = document.querySelectorAll('.sc-interactive-item, #sc-btn-same, #sc-btn-diff');
    items.forEach(el => {
      el.style.boxShadow = '';
      el.style.borderColor = '';
    });
  }

  window.repeatShapesPrompt = function() {
    if (ShapesColorsGame.currentTarget && ShapesColorsGame.currentTarget.prompt) {
      clearAllHints();
      if (ShapesColorsGame.hintTimer) clearTimeout(ShapesColorsGame.hintTimer);
      safeSpeak(ShapesColorsGame.currentTarget.prompt, () => {
        // Reanudar andamiaje si tarda
        startHintTimer(() => {
          if (ShapesColorsGame.currentPhase === 'colors') {
            highlightHint(`chest-btn-${ShapesColorsGame.currentTarget.key}`);
          } else if (ShapesColorsGame.currentPhase === 'shapes') {
            highlightHint(`shape-btn-${ShapesColorsGame.currentTarget.key}`);
          } else if (ShapesColorsGame.currentPhase === 'compare') {
            const correctBtnId = ShapesColorsGame.currentTarget.isSame ? 'sc-btn-same' : 'sc-btn-diff';
            highlightHint(correctBtnId);
          }
        }, 10000);
      });
    }
  };

})();
