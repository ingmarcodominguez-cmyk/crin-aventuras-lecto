// =========================================================================
// CRIN AVENTURAS DE LECTOESCRITURA - GRABADOR DE VOZ HUMANA EN VIVO
// Permite a terapeutas, docentes y familias grabar fonemas, sílabas y palabras
// con micrófono nativo (MediaRecorder API) y persistencia en IndexedDB/localStorage.
// =========================================================================

(function() {
  'use strict';

  const CrinAudioRecorder = {
    db: null,
    recordings: {}, // Mapa en memoria: { 'syl_pi': dataUrl, 'word_leche': dataUrl }
    currentRecorder: null,
    currentStream: null,
    recordingTargetKey: null,
    audioChunks: [],
    isRecording: false
  };

  window.CrinAudioRecorder = CrinAudioRecorder;

  // --- INICIALIZACIÓN DE INDEXEDDB PARA ALMACENAR AUDIOS EN EL NAVEGADOR ---
  function initDB(callback) {
    if (CrinAudioRecorder.db) {
      if (callback) callback();
      return;
    }
    try {
      const request = indexedDB.open('CrinCustomVoicesDB', 1);
      request.onupgradeneeded = function(e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('recordings')) {
          db.createObjectStore('recordings', { keyPath: 'key' });
        }
      };
      request.onsuccess = function(e) {
        CrinAudioRecorder.db = e.target.result;
        loadAllRecordings(callback);
      };
      request.onerror = function() {
        loadFromLocalStorage();
        if (callback) callback();
      };
    } catch(e) {
      loadFromLocalStorage();
      if (callback) callback();
    }
  }

  function loadAllRecordings(onDone) {
    if (!CrinAudioRecorder.db) {
      loadFromLocalStorage();
      if (onDone) onDone();
      return;
    }
    try {
      const tx = CrinAudioRecorder.db.transaction('recordings', 'readonly');
      const store = tx.objectStore('recordings');
      const req = store.getAll();
      req.onsuccess = function() {
        const list = req.result || [];
        list.forEach(item => {
          CrinAudioRecorder.recordings[item.key] = item.dataUrl;
        });
        window.customVoiceRecordings = CrinAudioRecorder.recordings;
        if (onDone) onDone();
      };
      req.onerror = function() {
        loadFromLocalStorage();
        if (onDone) onDone();
      };
    } catch(e) {
      loadFromLocalStorage();
      if (onDone) onDone();
    }
  }

  function loadFromLocalStorage() {
    try {
      const saved = JSON.parse(localStorage.getItem('crin_custom_voices') || '{}');
      CrinAudioRecorder.recordings = saved;
      window.customVoiceRecordings = saved;
    } catch(e) {}
  }

  function saveRecording(key, dataUrl, callback) {
    CrinAudioRecorder.recordings[key] = dataUrl;
    window.customVoiceRecordings = CrinAudioRecorder.recordings;
    try {
      localStorage.setItem('crin_custom_voices', JSON.stringify(CrinAudioRecorder.recordings));
    } catch(e) {}

    if (CrinAudioRecorder.db) {
      try {
        const tx = CrinAudioRecorder.db.transaction('recordings', 'readwrite');
        const store = tx.objectStore('recordings');
        store.put({ key: key, dataUrl: dataUrl, timestamp: Date.now() });
        tx.oncomplete = function() {
          if (callback) callback();
        };
        tx.onerror = function() {
          if (callback) callback();
        };
      } catch(e) {
        if (callback) callback();
      }
    } else {
      if (callback) callback();
    }
  }

  function deleteRecording(key, callback) {
    delete CrinAudioRecorder.recordings[key];
    window.customVoiceRecordings = CrinAudioRecorder.recordings;
    try {
      localStorage.setItem('crin_custom_voices', JSON.stringify(CrinAudioRecorder.recordings));
    } catch(e) {}

    if (CrinAudioRecorder.db) {
      try {
        const tx = CrinAudioRecorder.db.transaction('recordings', 'readwrite');
        const store = tx.objectStore('recordings');
        store.delete(key);
        tx.oncomplete = function() {
          if (callback) callback();
        };
        tx.onerror = function() {
          if (callback) callback();
        };
      } catch(e) {
        if (callback) callback();
      }
    } else {
      if (callback) callback();
    }
  }

  // --- CONTROL DE MICRÓFONO Y GRABACIÓN ---
  window.startVoiceRecording = function(targetKey, onStarted, onError) {
    if (CrinAudioRecorder.isRecording) {
      window.stopVoiceRecording();
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Tu navegador no admite grabación de audio desde el micrófono.');
      if (onError) onError('No soportado');
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        CrinAudioRecorder.currentStream = stream;
        CrinAudioRecorder.audioChunks = [];
        CrinAudioRecorder.recordingTargetKey = targetKey;
        CrinAudioRecorder.isRecording = true;

        let options = {};
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            options = { mimeType: 'audio/webm;codecs=opus' };
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            options = { mimeType: 'audio/mp4' };
          }
        }

        const recorder = new MediaRecorder(stream, options);
        CrinAudioRecorder.currentRecorder = recorder;

        recorder.ondataavailable = function(e) {
          if (e.data && e.data.size > 0) {
            CrinAudioRecorder.audioChunks.push(e.data);
          }
        };

        recorder.start(100);
        if (onStarted) onStarted(targetKey);
      })
      .catch(err => {
        alert('No se pudo acceder al micrófono. Por favor permite el acceso en tu navegador: ' + err.message);
        if (onError) onError(err);
      });
  };

  window.stopVoiceRecording = function(onSaved) {
    if (!CrinAudioRecorder.isRecording || !CrinAudioRecorder.currentRecorder) return;

    const recorder = CrinAudioRecorder.currentRecorder;
    const targetKey = CrinAudioRecorder.recordingTargetKey;

    recorder.onstop = function() {
      const mime = recorder.mimeType || 'audio/webm';
      const audioBlob = new Blob(CrinAudioRecorder.audioChunks, { type: mime });

      if (CrinAudioRecorder.currentStream) {
        CrinAudioRecorder.currentStream.getTracks().forEach(t => t.stop());
        CrinAudioRecorder.currentStream = null;
      }
      CrinAudioRecorder.isRecording = false;
      CrinAudioRecorder.currentRecorder = null;
      CrinAudioRecorder.recordingTargetKey = null;

      const reader = new FileReader();
      reader.onloadend = function() {
        const dataUrl = reader.result;
        saveRecording(targetKey, dataUrl, function() {
          if (onSaved) onSaved(targetKey, dataUrl);
          if (typeof renderDictionaryEditorTable === 'function') {
            renderDictionaryEditorTable();
          }
        });
      };
      reader.readAsDataURL(audioBlob);
    };

    recorder.stop();
  };

  window.deleteVoiceRecording = function(targetKey, onDone) {
    deleteRecording(targetKey, function() {
      if (onDone) onDone();
      if (typeof renderDictionaryEditorTable === 'function') {
        renderDictionaryEditorTable();
      }
    });
  };

  window.hasCustomVoice = function(targetKey) {
    return !!(CrinAudioRecorder.recordings && CrinAudioRecorder.recordings[targetKey]);
  };

  window.getCustomVoiceDataUrl = function(targetKey) {
    return CrinAudioRecorder.recordings ? CrinAudioRecorder.recordings[targetKey] : null;
  };

  window.cleanAudioKey = function(text) {
    if (!text) return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  };

  initDB();

})();
