// =========================================================================
// CRIN AVENTURAS DE LECTOESCRITURA - EL TECLADO PARLANTE DE PICTOGRAMAS
// Módulo de Comunicación Aumentativa y Alternativa (SAAC / CAA - Clave Fitzgerald)
// =========================================================================

(function() {
  'use strict';

  const AACKeyboard = {
    phraseTokens: [],
    currentTab: 'sujetos', // sujetos, verbos, objetos, cualidades, social
    isSpeaking: false,
    challengeMode: false,
    currentChallengeIndex: 0
  };

  // BANCO DE PICTOGRAMAS POR CATEGORÍAS (CÓDIGO FITZGERALD)
  const PICTOGRAM_DATABASE = {
    sujetos: [
      { text: 'YO', speech: 'Yo', emoji: '🙋', color: '#FEF08A', border: '#CA8A04' },
      { text: 'EL NIÑO', speech: 'El niño', emoji: '👦', color: '#FEF08A', border: '#CA8A04' },
      { text: 'LA NIÑA', speech: 'La niña', emoji: '👧', color: '#FEF08A', border: '#CA8A04' },
      { text: 'EL GATO', speech: 'El gato', image: 'assets/gato.png', color: '#FEF08A', border: '#CA8A04' },
      { text: 'EL PATO', speech: 'El pato', image: 'assets/pato.png', color: '#FEF08A', border: '#CA8A04' },
      { text: 'EL PERRO', speech: 'El perro', image: 'assets/perro.png', color: '#FEF08A', border: '#CA8A04' },
      { text: 'EL UNICORNIO', speech: 'El unicornio', emoji: '🦄', color: '#FEF08A', border: '#CA8A04' }
    ],
    verbos: [
      { text: 'QUIERO', speech: 'quiero', emoji: '🤲', color: '#DCFCE7', border: '#16A34A' },
      { text: 'VEO', speech: 'veo', emoji: '👀', color: '#DCFCE7', border: '#16A34A' },
      { text: 'JUEGO CON', speech: 'juego con', emoji: '🎮', color: '#DCFCE7', border: '#16A34A' },
      { text: 'COMO', speech: 'como', emoji: '🍽️', color: '#DCFCE7', border: '#16A34A' },
      { text: 'DIBUJO', speech: 'dibujo', emoji: '🎨', color: '#DCFCE7', border: '#16A34A' },
      { text: 'TIRO CON ARCO', speech: 'disparo mi arco hacia', emoji: '🏹', color: '#DCFCE7', border: '#16A34A' }
    ],
    objetos: [
      { text: 'PELOTA', speech: 'la pelota', image: 'assets/pelota.png', color: '#FFEDD5', border: '#EA580C' },
      { text: 'MANZANA', speech: 'la manzana', image: 'assets/manzana.png', color: '#FFEDD5', border: '#EA580C' },
      { text: 'SOPA', speech: 'la sopa', image: 'assets/sopa.png', color: '#FFEDD5', border: '#EA580C' },
      { text: 'CASA', speech: 'la casa', image: 'assets/casa.png', color: '#FFEDD5', border: '#EA580C' },
      { text: 'ZAPATO', speech: 'el zapato', image: 'assets/zapato.png', color: '#FFEDD5', border: '#EA580C' },
      { text: 'LUNA', speech: 'la luna', image: 'assets/luna.png', color: '#FFEDD5', border: '#EA580C' },
      { text: 'BANANA', speech: 'la banana', image: 'assets/banana.png', color: '#FFEDD5', border: '#EA580C' }
    ],
    cualidades: [
      { text: 'GRANDE', speech: 'grande', emoji: '🐘', color: '#E0F2FE', border: '#0284C7' },
      { text: 'PEQUEÑO', speech: 'pequeño', emoji: '🐭', color: '#E0F2FE', border: '#0284C7' },
      { text: 'LINDO', speech: 'lindo', emoji: '✨', color: '#E0F2FE', border: '#0284C7' },
      { text: 'FELIZ', speech: 'feliz', emoji: '😄', color: '#E0F2FE', border: '#0284C7' },
      { text: 'ROJO', speech: 'rojo', emoji: '🔴', color: '#E0F2FE', border: '#0284C7' },
      { text: 'AZUL', speech: 'azul', emoji: '🔵', color: '#E0F2FE', border: '#0284C7' }
    ],
    social: [
      { text: '¡HOLA!', speech: '¡Hola!', emoji: '👋', color: '#FCE7F3', border: '#DB2777' },
      { text: '¡GRACIAS!', speech: '¡Muchas gracias!', emoji: '🙏', color: '#FCE7F3', border: '#DB2777' },
      { text: 'POR FAVOR', speech: 'Por favor', emoji: '🤝', color: '#FCE7F3', border: '#DB2777' },
      { text: 'SÍ', speech: 'Sí', emoji: '👍', color: '#FCE7F3', border: '#DB2777' },
      { text: 'NO', speech: 'No', emoji: '👎', color: '#FCE7F3', border: '#DB2777' },
      { text: 'ME GUSTA', speech: '¡Me gusta mucho!', emoji: '❤️', color: '#FCE7F3', border: '#DB2777' }
    ]
  };

  // DESAFÍOS DE FRASES SAAC GUIADAS
  const AAC_CHALLENGES = [
    {
      prompt: 'Forma la frase: "EL PATO COME MANZANA"',
      targetTokens: ['EL PATO', 'COMO', 'MANZANA'],
      speechTarget: 'El pato come la manzana'
    },
    {
      prompt: 'Forma la frase: "YO JUEGO CON PELOTA"',
      targetTokens: ['YO', 'JUEGO CON', 'PELOTA'],
      speechTarget: 'Yo juego con la pelota'
    },
    {
      prompt: 'Forma la frase: "EL GATO VEO LINDO"',
      targetTokens: ['VEO', 'EL GATO', 'LINDO'],
      speechTarget: 'Veo el gato lindo'
    }
  ];

  // --- CONTROL DE PANTALLA ---
  window.openAACQuestScreen = function() {
    if (typeof stopAllAudio === 'function') stopAllAudio();
    if (typeof switchScreen === 'function') switchScreen('aac');

    const screen = document.getElementById('screen-aac');
    if (screen) screen.classList.add('active');

    AACKeyboard.phraseTokens = [];
    AACKeyboard.currentTab = 'sujetos';
    renderAACScreen();
  };

  window.closeAACAndReturnToMap = function() {
    if (typeof stopAllAudio === 'function') stopAllAudio();
    if (typeof switchScreen === 'function') {
      switchScreen('map');
    }
  };

  // --- RENDERIZADO DEL TECLADO SAAC ---
  window.renderAACScreen = function() {
    renderPhraseStrip();
    renderTabs();
    renderPictogramGrid();
  };

  function renderPhraseStrip() {
    const strip = document.getElementById('aac-phrase-strip');
    if (!strip) return;

    if (AACKeyboard.phraseTokens.length === 0) {
      strip.innerHTML = `
        <div style="color: #94A3B8; font-weight: 700; font-size: 14px; font-style: italic; display: flex; align-items: center; justify-content: center; height: 100%; gap: 6px;">
          <span>💬 Toca los pictogramas de abajo para armar tu frase...</span>
        </div>
      `;
      return;
    }

    strip.innerHTML = AACKeyboard.phraseTokens.map((item, idx) => {
      const visualContent = item.image 
        ? `<img src="${item.image}" alt="${item.text}" style="width: 32px; height: 32px; object-fit: contain;">`
        : `<span style="font-size: 26px;">${item.emoji || '💬'}</span>`;

      return `
        <div onclick="removeAACToken(${idx})" style="background: ${item.color}; border: 2.5px solid ${item.border}; border-radius: 14px; padding: 6px 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 68px; cursor: pointer; box-shadow: 0 4px 8px rgba(0,0,0,0.1); animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);" title="Toca para quitar">
          ${visualContent}
          <span style="font-size: 11px; font-weight: 900; color: #0F172A; margin-top: 3px; white-space: nowrap;">${item.text}</span>
        </div>
      `;
    }).join('');
  }

  function renderTabs() {
    const tabsContainer = document.getElementById('aac-tabs-container');
    if (!tabsContainer) return;

    const tabs = [
      { id: 'sujetos', label: '👤 Sujetos', bg: '#FEF08A', activeBorder: '#CA8A04' },
      { id: 'verbos', label: '⚡ Acciones', bg: '#DCFCE7', activeBorder: '#16A34A' },
      { id: 'objetos', label: '🍎 Cosas', bg: '#FFEDD5', activeBorder: '#EA580C' },
      { id: 'cualidades', label: '🎨 Cualidad', bg: '#E0F2FE', activeBorder: '#0284C7' },
      { id: 'social', label: '💬 Social', bg: '#FCE7F3', activeBorder: '#DB2777' }
    ];

    tabsContainer.innerHTML = tabs.map(tab => {
      const isActive = (AACKeyboard.currentTab === tab.id);
      return `
        <button onclick="setAACTab('${tab.id}')" style="background: ${tab.bg}; border: 2.5px solid ${isActive ? tab.activeBorder : 'transparent'}; padding: 7px 12px; border-radius: 12px; font-size: 12px; font-weight: 900; color: #0F172A; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: ${isActive ? '0 3px 8px rgba(0,0,0,0.15)' : 'none'}; transform: ${isActive ? 'scale(1.05)' : 'scale(1)'}; transition: all 0.15s;">
          ${tab.label}
        </button>
      `;
    }).join('');
  }

  function renderPictogramGrid() {
    const grid = document.getElementById('aac-pictogram-grid');
    if (!grid) return;

    const items = PICTOGRAM_DATABASE[AACKeyboard.currentTab] || [];

    grid.innerHTML = items.map(item => {
      const visualContent = item.image 
        ? `<img src="${item.image}" alt="${item.text}" style="width: 44px; height: 44px; object-fit: contain;">`
        : `<span style="font-size: 34px;">${item.emoji || '💬'}</span>`;

      return `
        <div onclick='addAACToken(${JSON.stringify(item)})' style="background: ${item.color}; border: 3px solid ${item.border}; border-radius: 18px; padding: 10px 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.08); transition: transform 0.15s; min-height: 84px;" onmouseover="this.style.transform='translateY(-3px) scale(1.03)'" onmouseout="this.style.transform='none'">
          ${visualContent}
          <span style="font-size: 12px; font-weight: 900; color: #0F172A; margin-top: 5px; text-align: center; line-height: 1.1;">${item.text}</span>
        </div>
      `;
    }).join('');
  }

  window.setAACTab = function(tabName) {
    AACKeyboard.currentTab = tabName;
    renderTabs();
    renderPictogramGrid();
  };

  window.addAACToken = function(token) {
    if (AACKeyboard.phraseTokens.length >= 7) {
      alert('La frase ya tiene suficientes palabras. ¡Escúchala o borra alguna!');
      return;
    }
    AACKeyboard.phraseTokens.push(token);
    playPopSound();
    renderPhraseStrip();

    // Locución inmediata del pictograma individual
    if (typeof speakText === 'function') {
      speakText(token.speech || token.text);
    }
  };

  window.removeAACToken = function(index) {
    if (index >= 0 && index < AACKeyboard.phraseTokens.length) {
      AACKeyboard.phraseTokens.splice(index, 1);
      renderPhraseStrip();
    }
  };

  window.clearAACPhrase = function() {
    AACKeyboard.phraseTokens = [];
    renderPhraseStrip();
  };

  // --- REPRODUCCIÓN DE LA FRASE COMPLETA CON PROSODIA NATURAL ---
  window.speakFullAACPhrase = function() {
    if (AACKeyboard.phraseTokens.length === 0) {
      if (typeof speakText === 'function') {
        speakText('¡Toca algunos pictogramas para armar tu frase!');
      }
      return;
    }

    const fullSpeech = AACKeyboard.phraseTokens.map(t => t.speech || t.text).join(' ');

    // Efecto festivo de estrellas sobre la franja
    playCelebrationDing();

    if (typeof activeChildProfile !== 'undefined' && activeChildProfile) {
      activeChildProfile.coins = (activeChildProfile.coins || 0) + 5;
      activeChildProfile.stars = (activeChildProfile.stars || 0) + 1;
      if (typeof saveActiveChildProfile === 'function') saveActiveChildProfile();
    }

    if (typeof speakText === 'function') {
      AACKeyboard.isSpeaking = true;
      speakText(fullSpeech, () => {
        AACKeyboard.isSpeaking = false;
      });
    }
  };

  // --- SÍNTESIS DE SONIDOS (WEB AUDIO) ---
  function playPopSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, actx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.25, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.12);
    } catch(e) {}
  }

  function playCelebrationDing() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, actx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0, actx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.22, actx.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(actx.currentTime + idx * 0.08);
        osc.stop(actx.currentTime + idx * 0.08 + 0.4);
      });
    } catch(e) {}
  }

})();
