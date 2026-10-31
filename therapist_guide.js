// =========================================================================
// CRIN AVENTURAS DE LECTOESCRITURA - GUÍA CLÍNICA Y FUNDAMENTOS PARA EL TERAPEUTA
// Basado en la Ciencia de la Lectura (Science of Reading), Structured Literacy (IDA),
// Orton-Gillingham, Neurobiología del Lector (Dehaene) y Manipulación Fonémica (Kilpatrick).
// =========================================================================

(function() {
  'use strict';

  const CLINICAL_ACTIVITIES_GUIDE = {
    'cauldron': {
      id: 'cauldron',
      icon: '🧪',
      title: 'El Caldero Mágico de las Rimas',
      level: 'Conciencia Intrasilábica (Ataque y Rima)',
      neuroBasis: 'Entrena la sensibilidad fonológica a nivel de rima consonante (coincidencia de todos los fonemas desde la última vocal tónica). Activa la corteza temporoparietal izquierda responsable de la segmentación fonológica previa a la decodificación grafémica.',
      framework: 'Ciencia de la Lectura (SoR) / Conciencia Fonológica Temprana',
      objectives: [
        'Desarrollar la percepción del sonido final de las palabras a partir de la vocal acentuada.',
        'Discriminar rimas consonantes legítimas (ej. -ÓN, -ATO, -ERA) descartando distractores acústicos.',
        'Fortalecer la memoria auditiva inmediata y la sensibilidad rítmica del lenguaje oral.'
      ],
      interventionTips: [
        'Si el niño duda, enfatice la pronunciación de la sílaba tónica: "bo-TÓN... ra-TÓN".',
        'Pregúntele: "¿Suenan igual al final?" estimulando la metacognición.',
        'No penalice el error; permita que observe cómo la burbuja que no rima rebota suavemente.'
      ],
      progressIndicators: [
        'Reducción del tiempo de latencia al elegir la burbuja que rima.',
        'Verbalización espontánea de rimas con palabras cotidianas en el hogar o consultorio.'
      ]
    },
    'fisherman': {
      id: 'fisherman',
      icon: '🐟',
      title: 'El Pescador de Sílabas',
      level: 'Conciencia Silábica (Segmentación y Síntesis)',
      neuroBasis: 'Estimula el bucle fonológico y la secuenciación temporal auditiva en el giro temporal superior izquierdo. Enseña al niño que las palabras se componen de unidades rítmicas discretas (sílabas), reduciendo la impulsividad en la lectura.',
      framework: 'Structured Literacy (IDA) / Segmentación Silábica Canónica',
      objectives: [
        'Segmentar palabras bisílabas y polisílabas en sus componentes silábicos en orden secuencial.',
        'Integrar la síntesis silábica para formar la palabra completa requerida por la tarea.',
        'Mejorar la atención auditiva selectiva descartando sílabas distractoras en el agua.'
      ],
      interventionTips: [
        'Acompañe con palmas o toques rítmicos la palabra objetivo antes de pescar.',
        'Nombre la sílaba que falta: "Ya tenemos ZA... ¿cuál falta para ZA-PA-TO?".',
        'Utilice el apoyo táctil directo si el niño presenta dificultades motrices finas.'
      ],
      progressIndicators: [
        'Capacidad de anticipar la sílaba subsiguiente sin necesidad de releer desde el inicio.',
        'Disminución de omisiones de sílabas átonas intermedias en la escritura.'
      ]
    },
    'train': {
      id: 'train',
      icon: '🚂',
      title: 'El Tren de los Sonidos (Cajas de Elkonin)',
      level: 'Conciencia Fonémica Analítica (Aislamiento y Ensamblaje)',
      neuroBasis: 'Implementa el método neuropsicológico de D. B. Elkonin. Proporciona un andamiaje visoespacial concreto (vagones) para una entidad abstracta e invisible (el fonema). Activa la circunvolución angular para el mapeo sonido-grafema.',
      framework: 'Técnica de Cajas de Elkonin / Orton-Gillingham Multisensorial',
      objectives: [
        'Aislar cada fonema individual de la palabra en estricto orden izquierda-derecha.',
        'Comprender el principio alfabético: a cada sonido elemental le corresponde una casilla gráfica.',
        'Identificar dígrafos del español (CH, LL, RR) como fonemas únicos que ocupan un solo vagón.'
      ],
      interventionTips: [
        'Pronuncie el sonido aislado (fonema /m/, no el nombre de la letra "eme").',
        'Señale el vagón vacío correspondiente para guiar la atención espacial del niño.',
        'Celebre el ensamblaje completo cuando el tren parte con su bocina victoriosa.'
      ],
      progressIndicators: [
        'Superación de la omisión de consonantes en sílabas trabadas y complejas.',
        'Transición fluida de la etapa silábica a la etapa alfabética consolidada.'
      ]
    },
    'detective': {
      id: 'detective',
      icon: '🔍',
      title: 'El Detective de Sonidos Gemelos',
      level: 'Discriminación Auditiva Fina de Pares Mínimos',
      neuroBasis: 'Entrena la percepción categorial del habla y la discriminación de formantes acústicos sutiles en la corteza auditiva primaria y área de Wernicke. Fundamental para corregir errores de sustitución fonológica (p/b, t/k, c/s).',
      framework: 'Evaluación y Terapia de Pares Mínimos / Lingüística Clínica',
      objectives: [
        'Discriminar palabras que difieren en un único rasgo fonológico (sonoridad, punto de articulación o vocal).',
        'Inhibir la respuesta impulsiva provocada por la semejanza global de las palabras.',
        'Tomar conciencia del punto articulatorio: diferenciar PATO vs GATO, BOCA vs FOCA, MANO vs MONO.'
      ],
      interventionTips: [
        'Invite al niño a poner su mano frente a la boca para sentir la explosión de aire en /P/ vs la vibración en /G/.',
        'Diga la pista en voz baja para obligarlo a afinar la escucha activa.',
        'Si elige la errónea, pregunte: "¿Escuchaste Pato o Gato? Vamos a escuchar de nuevo".'
      ],
      progressIndicators: [
        'Eliminación de sustituciones de letras homorgánicas en el dictado y la lectura.',
        'Mayor seguridad y autorregulación antes de responder en pruebas de discriminación.'
      ]
    },
    'archery': {
      id: 'archery',
      icon: '🏹',
      title: 'El Arquero de Crin',
      level: 'Decodificación Grafema-Palabra y Puntería Léxica',
      neuroBasis: 'Estimula la vía ventral u ortográfica ("vía rápida de lectura") en el área de la forma visual de las palabras (VWFA). Conecta la decodificación visual rápida con la coordinación visomotriz ojo-pantalla.',
      framework: 'Dual-Route Reading Model / Gamificación Positiva DUA',
      objectives: [
        'Reconocer palabras objetivo mediante lectura visual y verificación auditiva simultánea.',
        'Fortalecer la motricidad fina y la orientación espacial mediante el apuntado de la flecha.',
        'Consolidar la autonomía lectora en un formato lúdico de alta motivación y bajo estrés.'
      ],
      interventionTips: [
        'Anime al niño a leer la palabra en la diana antes de soltar la cuerda del arco.',
        'Permita que cambie de mascota arquera según su preferencia afectiva.',
        'Use las palabras de la tarea escolar para transferir el aprendizaje del aula al juego.'
      ],
      progressIndicators: [
        'Aumento de la velocidad de lectura de palabras conocidas sin titubeos.',
        'Mayor confianza y entusiasmo hacia las tareas de lectura.'
      ]
    },
    'aac': {
      id: 'aac',
      icon: '💬',
      title: 'El Teclado Parlante de Pictogramas (SAAC)',
      level: 'Comunicación Aumentativa y Estructuración Sintáctica',
      neuroBasis: 'Aplica el Código Fitzgerald modificado para organizar el lenguaje en categorías cromáticas universales (Sujeto, Verbo, Objeto, Descriptores, Fórmulas Sociales). Activa el área de Broca para la planificación gramatical visual.',
      framework: 'Sistemas Aumentativos y Alternativos de Comunicación (SAAC) / Código Fitzgerald',
      objectives: [
        'Estructurar oraciones completas y funcionales (Sujeto + Verbo + Objeto).',
        'Facilitar la expresión verbal mediante síntesis de voz natural para niños no verbales o con habla poco inteligible.',
        'Fomentar la autonomía comunicativa en entornos terapéuticos, escolares y cotidianos.'
      ],
      interventionTips: [
        'Comience modelando oraciones de 2 palabras: "Yo quiero" + Objeto.',
        'Utilice los colores guía para explicar las funciones: "El amarillo dice quién, el verde dice qué hace".',
        'Presione el botón del megáfono parlante para que el niño escuche su propia oración completa.'
      ],
      progressIndicators: [
        'Construcción de enunciados de 3 o más elementos sintácticos independientes.',
        'Uso funcional del teclado para expresar deseos, estados de ánimo y necesidades.'
      ]
    },
    'transformer': {
      id: 'transformer',
      icon: '🪄',
      title: 'La Máquina de Transformar Palabras',
      level: 'Elisión, Inserción y Sustitución Fonémica Avanzada',
      neuroBasis: 'Basado en los estudios de David Kilpatrick. La manipulación fonémica avanzada (suprimir o cambiar un fonema mentalmente) es el disparador biológico del "mapeo ortográfico" que permite almacenar palabras en la memoria léxica permanente.',
      framework: 'Science of Reading (David Kilpatrick, 2015) / Advanced Phonemic Awareness',
      objectives: [
        'Suprimir un fonema inicial o medial para descubrir una nueva palabra (ej. PLATO sin /L/ = PATO).',
        'Sustituir el fonema inicial para transmutar significados (ej. RATA cambiando /R/ por /G/ = GATA).',
        'Desarrollar la flexibilidad cognitiva y la plasticidad fonológica mental sin soporte escrito previo.'
      ],
      interventionTips: [
        'Guíe al niño formulando la pregunta mágica: "Si a PLATO le quitamos la /L/... ¿qué nos queda?".',
        'Pídale que cierre los ojos e imagine quitar la pieza sonora de la palabra.',
        'Use las animaciones de engranajes mágicos para reforzar visualmente la transformación.'
      ],
      progressIndicators: [
        'Resolución rápida de tareas de elisión fonémica (Test de Bruce / Rosner).',
        'Drástica aceleración en la adquisición de vocabulario visual permanente.'
      ]
    },
    'slide': {
      id: 'slide',
      icon: '🚀',
      title: 'El Tobogán de Fusión Suave (Continuous Blending)',
      level: 'Fusión Fonémica Continua sin Sobrecarga de Memoria',
      neuroBasis: 'Resuelve la sobrecarga de memoria de trabajo fonológica. En idioma español, las consonantes no pueden articularse solas en el vacío sin distorsión o deletreo ("ese", "eme"); por ello, la neuropsicología hispanohablante (Cuetos, Defior) estructura la síntesis en torno a la fusión silábica fluida (SO + PA = SOPA) con audios humanos reales, facilitando el reconocimiento holístico de la palabra.',
      framework: 'Continuous Phonics / Successive Blending Intervention',
      objectives: [
        'Conectar fonemas de forma continua y prolongada sin interrupciones acústicas intermedias.',
        'Prevenir la fragmentación sonora que impide reconocer la palabra global al decodificar.',
        'Sincronizar el barrido visual de izquierda a derecha con la articulación vocal fluida.'
      ],
      interventionTips: [
        'Acompañe al niño a deslizar el cohete observando cómo se unen las estaciones silábicas sin pausas secas.',
        'Enfatice la unión sonora: "SO" con "PA" se abrazan y forman "¡SOPA!".',
        'Al llegar a la plataforma final, celebren juntos el aterrizaje espacial y la identificación de la imagen correspondiente.'
      ],
      progressIndicators: [
        'Desaparición del silabeo entrecortado e inconexo durante la lectura en voz alta.',
        'Menor fatiga cognitiva y mayor velocidad de decodificación en textos continuos.'
      ]
    },
    'mirror': {
      id: 'mirror',
      icon: '🪞',
      title: 'El Faro del Espejo (Discriminación b / d / p / q)',
      level: 'Inhibición de Simetría Visual y Orientación Espacial de Grafemas',
      neuroBasis: 'Basado en las investigaciones de Stanislas Dehaene sobre el reciclaje neuronal. El cerebro debe suprimir activamente su sesgo innato de "invariancia de punto de vista" para distinguir letras que son rotaciones o reflejos especulares de un mismo patrón básico (b, d, p, q).',
      framework: 'Neurobiología de la Lectura (Stanislas Dehaene) / Orton-Gillingham Multisensory',
      objectives: [
        'Superar la confusión y rotación especular entre los grafemas b, d, p y q.',
        'Integrar anclajes somatosensoriales y mnemotécnicos (regla del pulgar arriba / manos en cama).',
        'Consolidar la direccionalidad izquierda-derecha en el procesamiento visomotor de letras complejas.'
      ],
      interventionTips: [
        'Enseñe la regla mnemotécnica del faro: "La b tiene la pancita mirando hacia adelante, la d hacia atrás".',
        'Permita que el niño dibuje la letra en el aire con su dedo antes de encender la linterna del faro.',
        'Relacione la letra con su palabra ancla canónica (b de BOTA, d de DADO).'
      ],
      progressIndicators: [
        'Eliminación de inversiones estáticas en lectura y escritura de grafemas espejo.',
        'Identificación inmediata de la orientación correcta sin titubeo perceptual.'
      ]
    },
    'basket': {
      id: 'basket',
      icon: '🧺',
      title: 'La Canasta de los Secretos (Categorización Semántica)',
      level: 'Comprensión Semántica, Vocabulario y Detección del Intruso',
      neuroBasis: 'Basado en el Modelo Simple de Lectura (Simple View of Reading: Lectura = Decodificación × Comprensión del Lenguaje). Activa las redes semánticas distribuidas en los lóbulos temporal y frontal, facilitando la integración léxica profunda.',
      framework: 'Simple View of Reading (Gough & Tunmer) / Desarrollo Léxico Conceptual',
      objectives: [
        'Agrupar palabras bajo campos semánticos concretos (animales, frutas, prendas de vestir, herramientas).',
        'Detectar activamente el elemento intruso aplicando razonamiento deductivo y categorización lógica.',
        'Enriquecer el vocabulario receptivo y expresivo asociando representación gráfica, fonética y concepto.'
      ],
      interventionTips: [
        'Pregúntele al niño: "¿Qué tienen en común estas tres cosas? ¿Cuál no va en este paseo?".',
        'Invite al niño a justificar oralmente su elección: "El zapato no va porque es para vestir, y los otros se comen".',
        'Refuerce positivamente el vocabulario nuevo nombrando atributos y utilidades de los objetos.'
      ],
      progressIndicators: [
        'Capacidad de clasificar conceptos abstractos por encima de meras coincidencias visuales superficiales.',
        'Mejora notable en pruebas de comprensión lectora y razonamiento verbal.'
      ]
    }
  };

  // Exponer a nivel global
  window.CLINICAL_ACTIVITIES_GUIDE = CLINICAL_ACTIVITIES_GUIDE;

  // Función para abrir la guía del terapeuta para una actividad específica (o menú general)
  window.openTherapistGuideModal = function(activityId) {
    const modal = document.getElementById('therapist-guide-modal');
    if (!modal) return;

    const act = CLINICAL_ACTIVITIES_GUIDE[activityId] || CLINICAL_ACTIVITIES_GUIDE['cauldron'];
    renderTherapistGuideContent(act.id);
    modal.style.display = 'flex';
  };

  window.closeTherapistGuideModal = function() {
    const modal = document.getElementById('therapist-guide-modal');
    if (modal) modal.style.display = 'none';
  };

  // Renderizar el contenido dinámico del modal clínico
  window.renderTherapistGuideContent = function(activityId) {
    const act = CLINICAL_ACTIVITIES_GUIDE[activityId] || CLINICAL_ACTIVITIES_GUIDE['cauldron'];
    const container = document.getElementById('therapist-guide-content');
    if (!container) return;

    // Selector de pestañas superiores con iconos
    let tabsHtml = '<div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 12px; border-bottom: 1px solid #E2E8F0;">';
    Object.keys(CLINICAL_ACTIVITIES_GUIDE).forEach(key => {
      const item = CLINICAL_ACTIVITIES_GUIDE[key];
      const isSelected = (item.id === act.id);
      tabsHtml += `
        <button onclick="renderTherapistGuideContent('${item.id}')" style="background: ${isSelected ? '#0284C7' : '#F8FAFC'}; color: ${isSelected ? 'white' : '#475569'}; border: 1.5px solid ${isSelected ? '#0369A1' : '#CBD5E1'}; border-radius: 12px; padding: 6px 12px; font-size: 11px; font-weight: 800; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 5px; transition: all 0.2s;">
          <span>${item.icon}</span>
          <span>${item.title.split('(')[0].replace('El ', '').replace('La ', '')}</span>
        </button>
      `;
    });
    tabsHtml += '</div>';

    let objectivesList = act.objectives.map(o => `<li style="margin-bottom: 4px;">${o}</li>`).join('');
    let tipsList = act.interventionTips.map(t => `<li style="margin-bottom: 4px;">${t}</li>`).join('');
    let indicatorsList = act.progressIndicators.map(i => `<li style="margin-bottom: 4px;">${i}</li>`).join('');

    container.innerHTML = `
      ${tabsHtml}
      
      <div style="background: linear-gradient(135deg, #F0FDF4 0%, #E0F2FE 100%); border: 2px solid #0284C7; border-radius: 16px; padding: 14px; margin-bottom: 14px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 32px; background: white; border-radius: 14px; padding: 6px 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">${act.icon}</div>
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 900; color: #0369A1;">${act.title}</h3>
              <div style="font-size: 11px; font-weight: 800; color: #0284C7; margin-top: 2px;">Nivel: ${act.level}</div>
            </div>
          </div>
          <span style="font-size: 10px; background: #0284C7; color: white; padding: 3px 8px; border-radius: 8px; font-weight: 800;">${act.framework}</span>
        </div>
      </div>

      <!-- FUNDAMENTO NEUROCIENTÍFICO -->
      <div style="background: white; border: 1.5px solid #BAE6FD; border-radius: 14px; padding: 12px; margin-bottom: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
        <div style="font-size: 12px; font-weight: 900; color: #0369A1; display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
          <span>🧠 Fundamento Neurocognitivo y Evidencia Científica</span>
        </div>
        <p style="font-size: 11px; color: #334155; line-height: 1.45; margin: 0;">
          ${act.neuroBasis}
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; margin-bottom: 12px;">
        <!-- OBJETIVOS TERAPÉUTICOS -->
        <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 12px;">
          <div style="font-size: 12px; font-weight: 900; color: #1E293B; display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span>🎯 Objetivos de Intervención (PEI/DUA)</span>
          </div>
          <ul style="font-size: 11px; color: #475569; margin: 0; padding-left: 18px; line-height: 1.4;">
            ${objectivesList}
          </ul>
        </div>

        <!-- PAUTAS DE ANDAMIAJE -->
        <div style="background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 14px; padding: 12px;">
          <div style="font-size: 12px; font-weight: 900; color: #92400E; display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span>🤝 Pautas de Andamiaje Clínico y Familiar</span>
          </div>
          <ul style="font-size: 11px; color: #78350F; margin: 0; padding-left: 18px; line-height: 1.4;">
            ${tipsList}
          </ul>
        </div>
      </div>

      <!-- INDICADORES DE PROGRESO -->
      <div style="background: #ECFDF5; border: 1.5px solid #A7F3D0; border-radius: 14px; padding: 12px;">
        <div style="font-size: 12px; font-weight: 900; color: #065F46; display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
          <span>📈 Indicadores Clínicos de Logro</span>
        </div>
        <ul style="font-size: 11px; color: #047857; margin: 0; padding-left: 18px; line-height: 1.4;">
          ${indicatorsList}
        </ul>
      </div>
    `;
  };

})();
