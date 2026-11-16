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
  SpatialSafariGame.challenges = null; // Asignado abajo

  // Catálogo integral de los 8 retos espaciales del protocolo
  const SPATIAL_CHALLENGES = [
  // Colección de retos
    // VARIANTE 1 (ADENTRO / AFUERA): LA CASITA DEL PERRITO
    {
      key: 'dentro_fuera_perrito_dentro',
      type: 'pair',
      family: 'dentro_fuera',
      variantId: 'perrito',
      title: 'La Casita del Perrito',
      target: 'dentro',
      prompt: 'Toca al perrito que está adentro.',
      praise: '¡Exacto! ¡El perrito está adentro protegido en su casita!',
      help: 'Observa con atención: este perrito está afuera jugando en el pasto. ¡Busquemos al que está adentro!',
      items: [
        { id: 'dentro', name: 'Adentro de la casita', img: 'assets/espacial_dentro.png?v=335', isCorrect: true },
        { id: 'fuera', name: 'Afuera en el pasto', img: 'assets/espacial_fuera.png?v=335', isCorrect: false }
      ]
    },
    {
      key: 'dentro_fuera_perrito_fuera',
      type: 'pair',
      family: 'dentro_fuera',
      variantId: 'perrito',
      title: 'La Casita del Perrito',
      target: 'fuera',
      prompt: 'Toca al perrito que está afuera.',
      praise: '¡Exacto! ¡Ese perrito está afuera corriendo libremente!',
      help: 'Observa bien: este perrito está adentro de su casita. ¡Busquemos al que está afuera!',
      items: [
        { id: 'dentro', name: 'Adentro de la casita', img: 'assets/espacial_dentro.png?v=335', isCorrect: false },
        { id: 'fuera', name: 'Afuera en el pasto', img: 'assets/espacial_fuera.png?v=335', isCorrect: true }
      ]
    },
    // VARIANTE 2 (ADENTRO / AFUERA): LA CUEVA DEL OSITO
    {
      key: 'dentro_fuera_cueva_dentro',
      type: 'pair',
      family: 'dentro_fuera',
      variantId: 'cueva',
      title: 'La Cueva del Osito',
      target: 'dentro',
      prompt: 'Toca al osito que está adentro.',
      praise: '¡Exacto! ¡El osito está adentro acostado en su cueva!',
      help: 'Observa bien: este osito está afuera en el pasto. ¡Busquemos al que está adentro!',
      items: [
        { id: 'dentro', name: 'Adentro de la cueva', img: 'assets/espacial_adentro_cueva.png?v=335', isCorrect: true },
        { id: 'fuera', name: 'Afuera en la pradera', img: 'assets/espacial_afuera_cueva.png?v=335', isCorrect: false }
      ]
    },
    {
      key: 'dentro_fuera_cueva_fuera',
      type: 'pair',
      family: 'dentro_fuera',
      variantId: 'cueva',
      title: 'La Cueva del Osito',
      target: 'fuera',
      prompt: 'Toca al osito que está afuera.',
      praise: '¡Exacto! ¡El osito está afuera caminando feliz!',
      help: 'Observa con atención: este osito está adentro durmiendo. ¡Busquemos al que está afuera!',
      items: [
        { id: 'dentro', name: 'Adentro de la cueva', img: 'assets/espacial_adentro_cueva.png?v=335', isCorrect: false },
        { id: 'fuera', name: 'Afuera en la pradera', img: 'assets/espacial_afuera_cueva.png?v=335', isCorrect: true }
      ]
    },
    // VARIANTE 3 (ADENTRO / AFUERA): EL AVESTRUZ Y EL POZO
    {
      key: 'dentro_fuera_avestruz_dentro',
      type: 'pair',
      family: 'dentro_fuera',
      variantId: 'avestruz',
      title: 'El Avestruz y el Pozo',
      target: 'dentro',
      prompt: 'Toca al avestruz que está adentro.',
      praise: '¡Exacto! ¡El avestruz tiene la cabeza adentro del pozo de agua!',
      help: 'Observa bien: este avestruz tiene su cabeza afuera sonriendo. ¡Busquemos al que la tiene adentro!',
      items: [
        { id: 'dentro', name: 'Cabeza adentro del pozo', img: 'assets/espacial_adentro_avestruz.png?v=335', isCorrect: true },
        { id: 'fuera', name: 'Cabeza afuera mirando', img: 'assets/espacial_afuera_avestruz.png?v=335', isCorrect: false }
      ]
    },
    {
      key: 'dentro_fuera_avestruz_fuera',
      type: 'pair',
      family: 'dentro_fuera',
      variantId: 'avestruz',
      title: 'El Avestruz y el Pozo',
      target: 'fuera',
      prompt: 'Toca al avestruz que está afuera.',
      praise: '¡Exacto! ¡Ese avestruz tiene su cabeza afuera bien despierto!',
      help: 'Observa con atención: este avestruz metió su cabeza adentro. ¡Busquemos al que la tiene afuera!',
      items: [
        { id: 'dentro', name: 'Cabeza adentro del pozo', img: 'assets/espacial_adentro_avestruz.png?v=335', isCorrect: false },
        { id: 'fuera', name: 'Cabeza afuera mirando', img: 'assets/espacial_afuera_avestruz.png?v=335', isCorrect: true }
      ]
    },
    // ==========================================
    // FAMILIA: ENCIMA DE / SOBRE DE / DEBAJO DE
    // ==========================================
    // VARIANTE 1 (ENCIMA / DEBAJO): LA MESA DE JUGUETES
    {
      key: 'encima_debajo_mesa_encima',
      type: 'table_interactive',
      family: 'encima_debajo',
      variantId: 'mesa',
      title: 'La Mesa de Juguetes',
      icon: '🪑',
      target: 'encima',
      prompt: 'Toca la pelota que está encima de la mesa.',
      praise: '¡Exacto! ¡Esa pelota está encima de la mesa!',
      help: 'Observa bien: esa pelota está debajo en el suelo. ¡Toquemos la que está encima!',
      bgImg: 'assets/espacial_mesa_pelotas.png?v=335',
      topLabel: 'ENCIMA',
      bottomLabel: 'DEBAJO',
      topStyle: 'top: 12px; left: 50%; transform: translateX(-50%); width: 130px; height: 95px;',
      bottomStyle: 'bottom: 12px; left: 50%; transform: translateX(-50%); width: 130px; height: 95px;',
      instruction: 'Toca la pelota que está encima de la mesa o debajo en el suelo'
    },
    {
      key: 'encima_debajo_mesa_debajo',
      type: 'table_interactive',
      family: 'encima_debajo',
      variantId: 'mesa',
      title: 'La Mesa de Juguetes',
      icon: '🪑',
      target: 'debajo',
      prompt: 'Toca la pelota que está debajo de la mesa.',
      praise: '¡Exacto! ¡Esa pelota está debajo de la mesa en el suelo!',
      help: 'Observa bien: esa pelota está encima de la mesa. ¡Toquemos la que está debajo!',
      bgImg: 'assets/espacial_mesa_pelotas.png?v=335',
      topLabel: 'ENCIMA',
      bottomLabel: 'DEBAJO',
      topStyle: 'top: 12px; left: 50%; transform: translateX(-50%); width: 130px; height: 95px;',
      bottomStyle: 'bottom: 12px; left: 50%; transform: translateX(-50%); width: 130px; height: 95px;',
      instruction: 'Toca la pelota que está encima de la mesa o debajo en el suelo'
    },
    // VARIANTE 2 (ENCIMA / DEBAJO): EL FLORERO Y LA MESA
    {
      key: 'encima_debajo_florero_encima',
      type: 'pair',
      family: 'encima_debajo',
      variantId: 'florero',
      title: 'El Florero y la Mesa',
      target: 'encima',
      prompt: 'Toca el florero que está encima de la mesa.',
      praise: '¡Exacto! ¡El florero colorido está apoyado encima de la mesa!',
      help: 'Observa con atención: en esta imagen el florero está debajo. ¡Busquemos el que está encima!',
      items: [
        { id: 'encima', name: 'Florero encima', img: 'assets/espacial_florero_encima.png?v=335', isCorrect: true },
        { id: 'debajo', name: 'Florero debajo', img: 'assets/espacial_florero_debajo.png?v=335', isCorrect: false }
      ]
    },
    {
      key: 'encima_debajo_florero_debajo',
      type: 'pair',
      family: 'encima_debajo',
      variantId: 'florero',
      title: 'El Florero y la Mesa',
      target: 'debajo',
      prompt: 'Toca el florero que está debajo de la mesa.',
      praise: '¡Muy bien! ¡El florero está guardado debajo de la mesa!',
      help: 'Observa bien: aquí el florero está encima. ¡Busquemos donde está debajo!',
      items: [
        { id: 'encima', name: 'Florero encima', img: 'assets/espacial_florero_encima.png?v=335', isCorrect: false },
        { id: 'debajo', name: 'Florero debajo', img: 'assets/espacial_florero_debajo.png?v=335', isCorrect: true }
      ]
    },
    // VARIANTE 3 (ENCIMA / DEBAJO): EL GATITO Y LA SILLA
    {
      key: 'encima_debajo_gato_encima',
      type: 'pair',
      family: 'encima_debajo',
      variantId: 'gato',
      title: 'El Gatito y la Silla',
      target: 'encima',
      prompt: 'Toca al gatito que está encima de la silla.',
      praise: '¡Exacto! ¡El gatito duerme cómodo sobre el asiento azul de la silla!',
      help: 'Observa bien: en esta imagen el gatito duerme debajo. ¡Busquemos donde está encima!',
      items: [
        { id: 'encima', name: 'Gatito encima', img: 'assets/espacial_gato_encima.png?v=335', isCorrect: true },
        { id: 'debajo', name: 'Gatito debajo', img: 'assets/espacial_gato_debajo.png?v=335', isCorrect: false }
      ]
    },
    {
      key: 'encima_debajo_gato_debajo',
      type: 'pair',
      family: 'encima_debajo',
      variantId: 'gato',
      title: 'El Gatito y la Silla',
      target: 'debajo',
      prompt: 'Toca al gatito que está debajo de la silla.',
      praise: '¡Muy bien! ¡El gatito encontró un lugarcito calentito debajo de las patas de la silla!',
      help: 'Observa con atención: aquí el gatito está encima de la silla. ¡Busquemos donde está debajo!',
      items: [
        { id: 'encima', name: 'Gatito encima', img: 'assets/espacial_gato_encima.png?v=335', isCorrect: false },
        { id: 'debajo', name: 'Gatito debajo', img: 'assets/espacial_gato_debajo.png?v=335', isCorrect: true }
      ]
    },

    // ==========================================
    // FAMILIA: ARRIBA / ABAJO
    // ==========================================
    // VARIANTE 1 (ARRIBA / ABAJO): EL CUADRO Y LA SILLA
    {
      key: 'arriba_abajo_cuadro_arriba',
      type: 'table_interactive',
      family: 'arriba_abajo',
      variantId: 'cuadro_silla',
      title: 'La Habitación',
      icon: '🖼️',
      target: 'arriba',
      prompt: 'Indica qué está arriba en la pared.',
      praise: '¡Exacto! ¡El cuadro con el sol y el árbol está colgado arriba!',
      help: 'Observa bien: la silla está abajo en el suelo. ¡Toquemos el cuadro que está arriba!',
      bgImg: 'assets/espacial_arriba_cuadro_silla.png?v=335',
      topLabel: 'ARRIBA 🖼️',
      bottomLabel: 'ABAJO 🪑',
      topStyle: 'top: 10px; left: 50%; transform: translateX(-50%); width: 200px; height: 115px;',
      bottomStyle: 'bottom: 10px; left: 50%; transform: translateX(-50%); width: 150px; height: 145px;',
      instruction: 'Toca lo que está ARRIBA o lo que está ABAJO'
    },
    {
      key: 'arriba_abajo_cuadro_abajo',
      type: 'table_interactive',
      family: 'arriba_abajo',
      variantId: 'cuadro_silla',
      title: 'La Habitación',
      icon: '🪑',
      target: 'abajo',
      prompt: 'Indica qué está abajo en el piso.',
      praise: '¡Muy bien! ¡La silla de madera está abajo en el piso!',
      help: 'Observa con atención: el cuadro está arriba. ¡Toquemos la silla que está abajo!',
      bgImg: 'assets/espacial_arriba_cuadro_silla.png?v=335',
      topLabel: 'ARRIBA 🖼️',
      bottomLabel: 'ABAJO 🪑',
      topStyle: 'top: 10px; left: 50%; transform: translateX(-50%); width: 200px; height: 115px;',
      bottomStyle: 'bottom: 10px; left: 50%; transform: translateX(-50%); width: 150px; height: 145px;',
      instruction: 'Toca lo que está ARRIBA o lo que está ABAJO'
    },
    // VARIANTE 2 (ARRIBA / ABAJO): EL PAJARITO Y EL PERRITO
    {
      key: 'arriba_abajo_pajaro_arriba',
      type: 'table_interactive',
      family: 'arriba_abajo',
      variantId: 'pajaro_perro',
      title: 'El Árbol del Parque',
      icon: '🐦',
      target: 'arriba',
      prompt: 'Indica quién está arriba en la rama.',
      praise: '¡Exacto! ¡El pajarito azul está arriba en la rama cantando feliz!',
      help: 'Observa bien: el perrito está abajo en el pasto. ¡Busquemos al pajarito que está arriba!',
      bgImg: 'assets/espacial_arriba_pajaro_perro.png?v=335',
      topLabel: 'ARRIBA 🐦',
      bottomLabel: 'ABAJO 🐶',
      topStyle: 'top: 25px; right: 25px; width: 135px; height: 110px;',
      bottomStyle: 'bottom: 15px; right: 25px; width: 145px; height: 130px;',
      instruction: 'Toca quién está ARRIBA o quién está ABAJO'
    },
    {
      key: 'arriba_abajo_pajaro_abajo',
      type: 'table_interactive',
      family: 'arriba_abajo',
      variantId: 'pajaro_perro',
      title: 'El Árbol del Parque',
      icon: '🐶',
      target: 'abajo',
      prompt: 'Indica quién está abajo en el pasto.',
      praise: '¡Muy bien! ¡El perrito alegre está abajo esperando jugar!',
      help: 'Observa con atención: el pajarito está arriba en la rama. ¡Busquemos al que está abajo!',
      bgImg: 'assets/espacial_arriba_pajaro_perro.png?v=335',
      topLabel: 'ARRIBA 🐦',
      bottomLabel: 'ABAJO 🐶',
      topStyle: 'top: 25px; right: 25px; width: 135px; height: 110px;',
      bottomStyle: 'bottom: 15px; right: 25px; width: 145px; height: 130px;',
      instruction: 'Toca quién está ARRIBA o quién está ABAJO'
    },
    // VARIANTE 3 (ARRIBA / ABAJO): EL SOL Y EL ÁRBOL
    {
      key: 'arriba_abajo_sol_arriba',
      type: 'table_interactive',
      family: 'arriba_abajo',
      variantId: 'sol_arbol',
      title: 'El Día Soleado',
      icon: '☀️',
      target: 'arriba',
      prompt: 'Indica qué está arriba en el cielo.',
      praise: '¡Exacto! ¡El sol sonriente está arriba en el cielo!',
      help: 'Observa bien: el árbol está abajo en la tierra. ¡Busquemos al sol que está arriba!',
      bgImg: 'assets/espacial_arriba_sol_arbol.png?v=335',
      topLabel: 'ARRIBA ☀️',
      bottomLabel: 'ABAJO 🌳',
      topStyle: 'top: 10px; left: 50%; transform: translateX(-50%); width: 140px; height: 110px;',
      bottomStyle: 'bottom: 15px; left: 50%; transform: translateX(-50%); width: 220px; height: 140px;',
      instruction: 'Toca lo que está ARRIBA o lo que está ABAJO'
    },
    {
      key: 'arriba_abajo_sol_abajo',
      type: 'table_interactive',
      family: 'arriba_abajo',
      variantId: 'sol_arbol',
      title: 'El Día Soleado',
      icon: '🌳',
      target: 'abajo',
      prompt: 'Indica qué está abajo en la tierra.',
      praise: '¡Muy bien! ¡El árbol verde está abajo en el pasto!',
      help: 'Observa con atención: el sol está arriba. ¡Busquemos al árbol que está abajo!',
      bgImg: 'assets/espacial_arriba_sol_arbol.png?v=335',
      topLabel: 'ARRIBA ☀️',
      bottomLabel: 'ABAJO 🌳',
      topStyle: 'top: 10px; left: 50%; transform: translateX(-50%); width: 140px; height: 110px;',
      bottomStyle: 'bottom: 15px; left: 50%; transform: translateX(-50%); width: 220px; height: 140px;',
      instruction: 'Toca lo que está ARRIBA o lo que está ABAJO'
    },
    // VARIANTE 1 (DELANTE / DETRÁS): EL OSITO Y EL ÁRBOL
    {
      key: 'delante_detras_arbol_delante',
      type: 'pair',
      family: 'delante_detras',
      variantId: 'arbol',
      title: 'El Árbol del Bosque',
      target: 'delante',
      prompt: 'Toca al osito que está adelante.',
      praise: '¡Exacto! ¡El osito está delante saludándote muy feliz!',
      help: 'Observa con atención: ese osito se esconde detrás. ¡Busquemos al que está delante!',
      items: [
        { id: 'delante', name: 'Delante del árbol', img: 'assets/espacial_delante.png?v=335', isCorrect: true },
        { id: 'detras', name: 'Detrás del árbol', img: 'assets/espacial_detras.png?v=335', isCorrect: false }
      ]
    },
    {
      key: 'delante_detras_arbol_detras',
      type: 'pair',
      family: 'delante_detras',
      variantId: 'arbol',
      title: 'El Árbol del Bosque',
      target: 'detras',
      prompt: 'Toca al osito que está detrás.',
      praise: '¡Exacto! ¡Lo encontraste jugando a las escondidas detrás del tronco!',
      help: 'Observa bien: ese osito está delante. ¡Busquemos al que se esconde detrás!',
      items: [
        { id: 'delante', name: 'Delante del árbol', img: 'assets/espacial_delante.png?v=335', isCorrect: false },
        { id: 'detras', name: 'Detrás del árbol', img: 'assets/espacial_detras.png?v=335', isCorrect: true }
      ]
    },
    // VARIANTE 2 (DELANTE / DETRÁS): EL NIÑO Y LA BICICLETA
    {
      key: 'delante_detras_bici_delante',
      type: 'pair',
      family: 'delante_detras',
      variantId: 'bicicleta',
      title: 'El Niño y la Bicicleta',
      target: 'delante',
      prompt: 'Toca al niño que está adelante.',
      praise: '¡Exacto! ¡El niño está adelante, listo para pasear en su bicicleta!',
      help: 'Observa con atención: en esta imagen el niño está detrás. ¡Busquemos al que está delante!',
      items: [
        { id: 'delante', name: 'Delante de la bici', img: 'assets/espacial_delante_bici.png?v=335', isCorrect: true },
        { id: 'detras', name: 'Detrás de la bici', img: 'assets/espacial_detras_bici.png?v=335', isCorrect: false }
      ]
    },
    {
      key: 'delante_detras_bici_detras',
      type: 'pair',
      family: 'delante_detras',
      variantId: 'bicicleta',
      title: 'El Niño y la Bicicleta',
      target: 'detras',
      prompt: 'Toca al niño que está detrás.',
      praise: '¡Muy bien! ¡El niño está parado detrás de su bicicleta!',
      help: 'Observa bien: aquí el niño está delante. ¡Busquemos donde está detrás!',
      items: [
        { id: 'delante', name: 'Delante de la bici', img: 'assets/espacial_delante_bici.png?v=335', isCorrect: false },
        { id: 'detras', name: 'Detrás de la bici', img: 'assets/espacial_detras_bici.png?v=335', isCorrect: true }
      ]
    },
    // VARIANTE 3 (DELANTE / DETRÁS): EL NIÑO Y LA PELOTA
    {
      key: 'delante_detras_pelota_delante',
      type: 'pair',
      family: 'delante_detras',
      variantId: 'pelota',
      title: 'El Niño y la Pelota',
      target: 'delante',
      prompt: 'Toca la pelota que está adelante.',
      praise: '¡Exacto! ¡La pelota está adelante en el pasto, lista para patear!',
      help: 'Observa bien: en esta imagen la pelota quedó detrás del niño. ¡Busquemos donde está delante!',
      items: [
        { id: 'delante', name: 'Pelota delante', img: 'assets/espacial_delante_pelota.png?v=335', isCorrect: true },
        { id: 'detras', name: 'Pelota detrás', img: 'assets/espacial_detras_pelota.png?v=335', isCorrect: false }
      ]
    },
    {
      key: 'delante_detras_pelota_detras',
      type: 'pair',
      family: 'delante_detras',
      variantId: 'pelota',
      title: 'El Niño y la Pelota',
      target: 'detras',
      prompt: 'Toca la pelota que está detrás.',
      praise: '¡Muy bien! ¡La pelota está guardada detrás de su espalda!',
      help: 'Observa con atención: aquí la pelota está delante. ¡Busquemos donde está detrás!',
      items: [
        { id: 'delante', name: 'Pelota delante', img: 'assets/espacial_delante_pelota.png?v=335', isCorrect: false },
        { id: 'detras', name: 'Pelota detrás', img: 'assets/espacial_detras_pelota.png?v=335', isCorrect: true }
      ]
    },
    // VARIANTE 1 (ABIERTO / CERRADO): LOS COFRES MÁGICOS
    {
      key: 'abierto_cerrado_cofres_abierto',
      type: 'pair',
      family: 'abierto_cerrado',
      variantId: 'cofres',
      title: 'Los Cofres Mágicos',
      target: 'abierto',
      prompt: 'Toca el cofre que está abierto.',
      praise: '¡Exacto! ¡Ese cofre está abierto y lleno de magia!',
      help: 'Observa con atención: ese cofre está cerrado con su cinta dorada. ¡Busquemos el que está abierto!',
      items: [
        { id: 'abierto', name: 'Cofre abierto', img: 'assets/espacial_abierto.png?v=335', isCorrect: true },
        { id: 'cerrado', name: 'Cofre cerrado', img: 'assets/espacial_cerrado.png?v=335', isCorrect: false }
      ]
    },
    {
      key: 'abierto_cerrado_cofres_cerrado',
      type: 'pair',
      family: 'abierto_cerrado',
      variantId: 'cofres',
      title: 'Los Cofres Mágicos',
      target: 'cerrado',
      prompt: 'Toca el cofre que está cerrado.',
      praise: '¡Exacto! ¡Ese cofre está cerrado guardando un secreto!',
      help: 'Observa bien: ese cofre está abierto. ¡Busquemos el que está cerrado!',
      items: [
        { id: 'abierto', name: 'Cofre abierto', img: 'assets/espacial_abierto.png?v=335', isCorrect: false },
        { id: 'cerrado', name: 'Cofre cerrado', img: 'assets/espacial_cerrado.png?v=335', isCorrect: true }
      ]
    },
    // VARIANTE 2 (ABIERTO / CERRADO): LAS MANITOS
    {
      key: 'abierto_cerrado_manos_abierta',
      type: 'pair',
      family: 'abierto_cerrado',
      variantId: 'manos',
      title: 'Las Manitos',
      target: 'abierto',
      prompt: 'Toca la mano que está abierta.',
      praise: '¡Exacto! ¡Esa mano está bien abierta saludándote!',
      help: 'Observa con atención: esta mano está cerrada en un puño. ¡Busquemos la que está abierta!',
      items: [
        { id: 'abierto', name: 'Mano abierta', img: 'assets/espacial_manos_abierta.png?v=335', isCorrect: true },
        { id: 'cerrado', name: 'Mano cerrada', img: 'assets/espacial_manos_cerrada.png?v=335', isCorrect: false }
      ]
    },
    {
      key: 'abierto_cerrado_manos_cerrada',
      type: 'pair',
      family: 'abierto_cerrado',
      variantId: 'manos',
      title: 'Las Manitos',
      target: 'cerrado',
      prompt: 'Toca la mano que está cerrada.',
      praise: '¡Muy bien! ¡Esa manito está cerrada con energía!',
      help: 'Observa bien: esta mano tiene los dedos abiertos. ¡Busquemos la que está cerrada!',
      items: [
        { id: 'abierto', name: 'Mano abierta', img: 'assets/espacial_manos_abierta.png?v=335', isCorrect: false },
        { id: 'cerrado', name: 'Mano cerrada', img: 'assets/espacial_manos_cerrada.png?v=335', isCorrect: true }
      ]
    },
    // VARIANTE 3 (ABIERTO / CERRADO): LA PUERTA DE LA CASITA
    {
      key: 'abierto_cerrado_puerta_abierta',
      type: 'pair',
      family: 'abierto_cerrado',
      variantId: 'puerta',
      title: 'La Puerta de la Casita',
      target: 'abierto',
      prompt: 'Toca la puerta que está abierta.',
      praise: '¡Exacto! ¡La puerta está abierta de par en par, podemos pasar!',
      help: 'Observa con atención: aquí la puerta está cerrada. ¡Busquemos la casita con la puerta abierta!',
      items: [
        { id: 'abierto', name: 'Puerta abierta', img: 'assets/espacial_puerta_abierta.png?v=335', isCorrect: true },
        { id: 'cerrado', name: 'Puerta cerrada', img: 'assets/espacial_puerta_cerrada.png?v=335', isCorrect: false }
      ]
    },
    {
      key: 'abierto_cerrado_puerta_cerrada',
      type: 'pair',
      family: 'abierto_cerrado',
      variantId: 'puerta',
      title: 'La Puerta de la Casita',
      target: 'cerrado',
      prompt: 'Toca la puerta que está cerrada.',
      praise: '¡Muy bien! ¡La puerta de madera está bien cerrada!',
      help: 'Observa bien: en esta casita la puerta está abierta. ¡Busquemos donde está cerrada!',
      items: [
        { id: 'abierto', name: 'Puerta abierta', img: 'assets/espacial_puerta_abierta.png?v=335', isCorrect: false },
        { id: 'cerrado', name: 'Puerta cerrada', img: 'assets/espacial_puerta_cerrada.png?v=335', isCorrect: true }
      ]
    },
    // VARIANTE 1 (ANCHO / ESTRECHO): EL CRUCE DEL RÍO (PUENTES)
    {
      key: 'ancho_estrecho_puente_ancho',
      type: 'pair',
      family: 'ancho_estrecho',
      variantId: 'puente',
      title: 'El Cruce del Río',
      target: 'ancho',
      prompt: 'Toca cuál puente es más ancho.',
      praise: '¡Exacto! ¡Ese puente es muy ancho y fuerte!',
      help: 'Observa bien: ese caminito es estrecho y delgadito. ¡Busquemos el puente más ancho!',
      items: [
        { id: 'ancho', name: 'Puente ancho', img: 'assets/espacial_puente_ancho.png?v=335', isCorrect: true },
        { id: 'estrecho', name: 'Puente estrecho', img: 'assets/espacial_puente_estrecho.png?v=335', isCorrect: false }
      ]
    },
    {
      key: 'ancho_estrecho_puente_estrecho',
      type: 'pair',
      family: 'ancho_estrecho',
      variantId: 'puente',
      title: 'El Cruce del Río',
      target: 'estrecho',
      prompt: 'Toca cuál puente es más estrecho o angosto.',
      praise: '¡Exacto! ¡Ese es el puente estrecho por donde pasa el patito!',
      help: 'Observa con atención: ese puente es muy ancho. ¡Busquemos el puente más estrecho!',
      items: [
        { id: 'ancho', name: 'Puente ancho', img: 'assets/espacial_puente_ancho.png?v=335', isCorrect: false },
        { id: 'estrecho', name: 'Puente estrecho', img: 'assets/espacial_puente_estrecho.png?v=335', isCorrect: true }
      ]
    },
    // VARIANTE 2 (ANCHO / ESTRECHO): LAS CAMAS
    {
      key: 'ancho_estrecho_camas_ancho',
      type: 'pair',
      family: 'ancho_estrecho',
      variantId: 'camas',
      title: 'La Habitación',
      target: 'ancho',
      prompt: 'Toca cuál cama es más ancha.',
      praise: '¡Exacto! ¡Esa cama es muy ancha y tiene mucho espacio!',
      help: 'Observa bien: esa cama es angosta para una sola persona. ¡Busquemos la cama más ancha!',
      items: [
        { id: 'ancho', name: 'Cama ancha', img: 'assets/espacial_cama_ancha.png?v=335', isCorrect: true },
        { id: 'estrecho', name: 'Cama estrecha', img: 'assets/espacial_cama_estrecha.png?v=335', isCorrect: false }
      ]
    },
    {
      key: 'ancho_estrecho_camas_estrecho',
      type: 'pair',
      family: 'ancho_estrecho',
      variantId: 'camas',
      title: 'La Habitación',
      target: 'estrecho',
      prompt: 'Toca cuál cama es más angosta o estrecha.',
      praise: '¡Muy bien! ¡Esa es la camita angosta con estrellas!',
      help: 'Observa con atención: esa cama es muy ancha. ¡Busquemos la camita más estrecha!',
      items: [
        { id: 'ancho', name: 'Cama ancha', img: 'assets/espacial_cama_ancha.png?v=335', isCorrect: false },
        { id: 'estrecho', name: 'Cama estrecha', img: 'assets/espacial_cama_estrecha.png?v=335', isCorrect: true }
      ]
    },
    // VARIANTE 3 (ANCHO / ESTRECHO): LOS CAMINOS
    {
      key: 'ancho_estrecho_caminos_ancho',
      type: 'pair',
      family: 'ancho_estrecho',
      variantId: 'caminos',
      title: 'Los Caminos',
      target: 'ancho',
      prompt: 'Toca cuál camino es más ancho.',
      praise: '¡Exacto! ¡Esa carretera es ancha y espaciosa para vehículos grandes!',
      help: 'Observa bien: ese sendero es estrecho para bicicletas. ¡Busquemos el camino más ancho!',
      items: [
        { id: 'ancho', name: 'Camino ancho', img: 'assets/espacial_camino_ancho.png?v=335', isCorrect: true },
        { id: 'estrecho', name: 'Camino estrecho', img: 'assets/espacial_camino_estrecho.png?v=335', isCorrect: false }
      ]
    },
    {
      key: 'ancho_estrecho_caminos_estrecho',
      type: 'pair',
      family: 'ancho_estrecho',
      variantId: 'caminos',
      title: 'Los Caminos',
      target: 'estrecho',
      prompt: 'Toca cuál camino es más estrecho o angosto.',
      praise: '¡Muy bien! ¡Ese sendero de tierra es estrecho y angosto!',
      help: 'Observa con atención: esa carretera es ancha. ¡Busquemos el sendero más estrecho!',
      items: [
        { id: 'ancho', name: 'Camino ancho', img: 'assets/espacial_camino_ancho.png?v=335', isCorrect: false },
        { id: 'estrecho', name: 'Camino estrecho', img: 'assets/espacial_camino_estrecho.png?v=335', isCorrect: true }
      ]
    },
    // VARIANTE 1 (CERCA / LEJOS): EL VALLE DE LOS CONEJITOS
    {
      key: 'cerca_lejos_conejos_cerca',
      type: 'cerca_lejos_interactive',
      family: 'cerca_lejos',
      variantId: 'conejos',
      title: 'El Valle de los Conejitos',
      icon: '🐇',
      target: 'cerca',
      prompt: 'Indica cuál conejito está cerca.',
      praise: '¡Exacto! ¡Ese conejito está muy cerquita en primer plano!',
      help: 'Observa con atención: ese conejito está lejos en la montaña. ¡Busquemos al que está cerca!',
      bgImg: 'assets/espacial_cerca_lejos.png?v=335',
      instruction: 'Toca el conejito que está cerca o el que está lejos en la montaña'
    },
    {
      key: 'cerca_lejos_conejos_lejos',
      type: 'cerca_lejos_interactive',
      family: 'cerca_lejos',
      variantId: 'conejos',
      title: 'El Valle de los Conejitos',
      icon: '🐇',
      target: 'lejos',
      prompt: 'Indica cuál conejito está lejos.',
      praise: '¡Exacto! ¡Lo viste a lo lejos en la cima de la montaña!',
      help: 'Observa bien: ese conejito está aquí muy cerca. ¡Busquemos al que está lejos!',
      bgImg: 'assets/espacial_cerca_lejos.png?v=335',
      instruction: 'Toca el conejito que está cerca o el que está lejos en la montaña'
    },
    // VARIANTE 2 (CERCA / LEJOS): EL CABALLO Y LA VACA
    {
      key: 'cerca_lejos_caballo_cerca',
      type: 'cerca_lejos_interactive',
      family: 'cerca_lejos',
      variantId: 'caballo_vaca',
      title: 'El Prado de la Granja',
      icon: '🐴',
      target: 'cerca',
      prompt: 'Indica cuál animalito está cerca.',
      praise: '¡Exacto! ¡El caballo está aquí muy cerquita en primer plano!',
      help: 'Observa bien: la vaca está allá lejos al fondo. ¡Busquemos al caballo que está cerca!',
      bgImg: 'assets/espacial_cerca_caballo_vaca.png?v=335',
      instruction: 'Toca quién está CERCA o quién está LEJOS'
    },
    {
      key: 'cerca_lejos_caballo_lejos',
      type: 'cerca_lejos_interactive',
      family: 'cerca_lejos',
      variantId: 'caballo_vaca',
      title: 'El Prado de la Granja',
      icon: '🐮',
      target: 'lejos',
      prompt: 'Indica cuál animalito está lejos.',
      praise: '¡Muy bien! ¡La vaca está lejos pastando en el fondo del prado!',
      help: 'Observa con atención: el caballo está aquí bien cerca. ¡Busquemos a la vaca que está lejos!',
      bgImg: 'assets/espacial_cerca_caballo_vaca.png?v=335',
      instruction: 'Toca quién está CERCA o quién está LEJOS'
    },
    // VARIANTE 3 (CERCA / LEJOS): EL HUERTO Y LA CARRETILLA
    {
      key: 'cerca_lejos_huerto_cerca',
      type: 'cerca_lejos_interactive',
      family: 'cerca_lejos',
      variantId: 'pala_carretilla',
      title: 'El Huerto de la Granja',
      icon: '👨‍🌾',
      target: 'cerca',
      prompt: 'Indica quién está cerca en el huerto.',
      praise: '¡Exacto! ¡El granjero con su pala está aquí muy cerquita!',
      help: 'Observa bien: la carretilla roja está allá lejos. ¡Busquemos al granjero que está cerca!',
      bgImg: 'assets/espacial_cerca_pala_carretilla.png?v=335',
      instruction: 'Toca lo que está CERCA o lo que está LEJOS'
    },
    {
      key: 'cerca_lejos_huerto_lejos',
      type: 'cerca_lejos_interactive',
      family: 'cerca_lejos',
      variantId: 'pala_carretilla',
      title: 'El Huerto de la Granja',
      icon: '🚜',
      target: 'lejos',
      prompt: 'Indica qué está lejos al fondo.',
      praise: '¡Muy bien! ¡La carretilla roja está lejos junto a la cerca de madera!',
      help: 'Observa con atención: el granjero está aquí cerca. ¡Busquemos la carretilla que está lejos!',
      bgImg: 'assets/espacial_cerca_pala_carretilla.png?v=335',
      instruction: 'Toca lo que está CERCA o lo que está LEJOS'
    },
    // VARIANTE 1 (SERIALIZACIÓN 1º/2º/3º): CARRERA DE ANIMALES
    {
      key: 'fila_animales_primero',
      type: 'fila_interactive',
      family: 'serializacion',
      variantId: 'animales',
      title: 'La Carrera de los Animales',
      target: 'primero',
      prompt: 'Indica cuál animalito va primero.',
      praise: '¡Exacto! ¡La jirafita va en primer lugar, liderando con su medalla de oro!',
      help: 'Observa las medallas: la jirafita va al frente con la medalla de 1º. ¡Toquemos a quien va primero!',
      bgImg: 'assets/espacial_carrera_animales.png?v=335'
    },
    {
      key: 'fila_animales_segundo',
      type: 'fila_interactive',
      family: 'serializacion',
      variantId: 'animales',
      title: 'La Carrera de los Animales',
      target: 'segundo',
      prompt: 'Indica cuál animalito va segundo.',
      praise: '¡Exacto! ¡El monito con su banana va en segundo lugar con su medalla de plata!',
      help: 'Observa bien: el monito va en el medio con la medalla de 2º. ¡Toquemos al que va segundo!',
      bgImg: 'assets/espacial_carrera_animales.png?v=335'
    },
    {
      key: 'fila_animales_tercero',
      type: 'fila_interactive',
      family: 'serializacion',
      variantId: 'animales',
      title: 'La Carrera de los Animales',
      target: 'tercero',
      prompt: 'Indica cuál animalito va tercero.',
      praise: '¡Exacto! ¡El valiente leoncito va en tercer lugar con su medalla de bronce!',
      help: 'Observa la fila: el leoncito va detrás con la medalla de 3º. ¡Toquemos al que va tercero!',
      bgImg: 'assets/espacial_carrera_animales.png?v=335'
    },
    // VARIANTE 2 (SERIALIZACIÓN 1º/2º/3º): CARRERA DE AUTOS
    {
      key: 'fila_autos_primero',
      type: 'fila_interactive',
      family: 'serializacion',
      variantId: 'autos',
      title: 'La Carrera de Autos',
      target: 'primero',
      prompt: 'Indica cuál auto va primero.',
      praise: '¡Exacto! ¡El auto rojo va en primer lugar con su medalla de oro!',
      help: 'Observa las medallas: el auto rojo lidera la pista con el número 1. ¡Toquemos al que va primero!',
      bgImg: 'assets/espacial_carrera_autos.png?v=335'
    },
    {
      key: 'fila_autos_segundo',
      type: 'fila_interactive',
      family: 'serializacion',
      variantId: 'autos',
      title: 'La Carrera de Autos',
      target: 'segundo',
      prompt: 'Indica cuál auto va segundo.',
      praise: '¡Exacto! ¡El veloz auto azul va en segundo lugar con su medalla de plata!',
      help: 'Observa bien: el auto azul corre en el medio con el número 2. ¡Toquemos al que va segundo!',
      bgImg: 'assets/espacial_carrera_autos.png?v=335'
    },
    {
      key: 'fila_autos_tercero',
      type: 'fila_interactive',
      family: 'serializacion',
      variantId: 'autos',
      title: 'La Carrera de Autos',
      target: 'tercero',
      prompt: 'Indica cuál auto va tercero.',
      praise: '¡Exacto! ¡El auto amarillo va en tercer lugar con su medalla de bronce!',
      help: 'Observa la pista: el auto amarillo va detrás con el número 3. ¡Toquemos al que va tercero!',
      bgImg: 'assets/espacial_carrera_autos.png?v=335'
    },
    // VARIANTE 3 (SERIALIZACIÓN 1º/2º/3º): CARRERA EN LA GRANJA
    {
      key: 'fila_gallinas_primero',
      type: 'fila_interactive',
      family: 'serializacion',
      variantId: 'gallinas',
      title: 'La Carrera de la Granja',
      target: 'primero',
      prompt: 'Indica cuál va primero en la carrera.',
      praise: '¡Exacto! ¡El alegre gallito va en primer lugar con su medalla de oro!',
      help: 'Observa las medallas: el gallito corre al frente con la medalla de 1º. ¡Toquemos al que va primero!',
      bgImg: 'assets/espacial_carrera_gallinas.png?v=335'
    },
    {
      key: 'fila_gallinas_segundo',
      type: 'fila_interactive',
      family: 'serializacion',
      variantId: 'gallinas',
      title: 'La Carrera de la Granja',
      target: 'segundo',
      prompt: 'Indica cuál va segundo en la carrera.',
      praise: '¡Exacto! ¡La gallinita colorada va en segundo lugar con su medalla de plata!',
      help: 'Observa bien: la gallinita del medio lleva la medalla de 2º. ¡Toquemos a la que va segunda!',
      bgImg: 'assets/espacial_carrera_gallinas.png?v=335'
    },
    {
      key: 'fila_gallinas_tercero',
      type: 'fila_interactive',
      family: 'serializacion',
      variantId: 'gallinas',
      title: 'La Carrera de la Granja',
      target: 'tercero',
      prompt: 'Indica cuál va tercero en la carrera.',
      praise: '¡Exacto! ¡La gallinita copetuda va en tercer lugar con su medalla de bronce!',
      help: 'Observa el camino: la gallinita blanca va detrás con la medalla de 3º. ¡Toquemos a la que va tercera!',
      bgImg: 'assets/espacial_carrera_gallinas.png?v=335'
    },
    // VARIANTE 1 (LATERALIDAD IZQUIERDA / DERECHA): LAS FLECHAS
    {
      key: 'izquierda_derecha_flechas_izq',
      type: 'pair',
      family: 'lateralidad',
      variantId: 'flechas',
      title: 'Las Direcciones',
      target: 'izquierda',
      prompt: 'Indica cuál es la izquierda.',
      praise: '¡Exacto! ¡Hacia la izquierda, muy bien ubicado!',
      help: 'Observa la flecha azul: esa apunta a la derecha. ¡Busquemos la que apunta a la izquierda!',
      items: [
        { id: 'izquierda', name: 'Izquierda 👈', img: 'assets/espacial_izquierda.png?v=335', isCorrect: true },
        { id: 'derecha', name: 'Derecha 👉', img: 'assets/espacial_derecha.png?v=335', isCorrect: false }
      ]
    },
    {
      key: 'izquierda_derecha_flechas_der',
      type: 'pair',
      family: 'lateralidad',
      variantId: 'flechas',
      title: 'Las Direcciones',
      target: 'derecha',
      prompt: 'Indica cuál es la derecha.',
      praise: '¡Exacto! ¡Hacia la derecha, excelente dirección!',
      help: 'Observa la flecha: esa apunta a la izquierda. ¡Busquemos la que apunta a la derecha!',
      items: [
        { id: 'izquierda', name: 'Izquierda 👈', img: 'assets/espacial_izquierda.png?v=335', isCorrect: false },
        { id: 'derecha', name: 'Derecha 👉', img: 'assets/espacial_derecha.png?v=335', isCorrect: true }
      ]
    },
    // VARIANTE 2 (LATERALIDAD IZQUIERDA / DERECHA): EL NIÑO Y SUS MANOS
    {
      key: 'izquierda_derecha_nino_izq',
      type: 'pair',
      family: 'lateralidad',
      variantId: 'nino',
      title: 'El Niño y sus Manos',
      target: 'izquierda',
      prompt: 'Indica cuál es la izquierda.',
      praise: '¡Exacto! ¡El niño levanta su mano izquierda hacia ese lado!',
      help: 'Observa bien: este niño levanta su mano derecha. ¡Busquemos al que levanta la izquierda!',
      items: [
        { id: 'izquierda', name: 'Mano izquierda', img: 'assets/espacial_nino_mano_izquierda.gif?v=335', isCorrect: true },
        { id: 'derecha', name: 'Mano derecha', img: 'assets/espacial_nino_mano_derecha.gif?v=335', isCorrect: false }
      ]
    },
    {
      key: 'izquierda_derecha_nino_der',
      type: 'pair',
      family: 'lateralidad',
      variantId: 'nino',
      title: 'El Niño y sus Manos',
      target: 'derecha',
      prompt: 'Indica cuál es la derecha.',
      praise: '¡Muy bien! ¡El niño levanta su mano derecha en alto!',
      help: 'Observa con atención: este niño levanta la mano izquierda. ¡Busquemos al que levanta la derecha!',
      items: [
        { id: 'izquierda', name: 'Mano izquierda', img: 'assets/espacial_nino_mano_izquierda.gif?v=335', isCorrect: false },
        { id: 'derecha', name: 'Mano derecha', img: 'assets/espacial_nino_mano_derecha.gif?v=335', isCorrect: true }
      ]
    },
    // VARIANTE 3 (LATERALIDAD IZQUIERDA / DERECHA): EL PERRITO JUGUETÓN
    {
      key: 'izquierda_derecha_perrito_izq',
      type: 'pair',
      family: 'lateralidad',
      variantId: 'perrito',
      title: 'El Perrito Juguetón',
      target: 'izquierda',
      prompt: 'Indica cuál es la izquierda.',
      praise: '¡Exacto! ¡El perrito levanta su patita hacia el lado izquierdo!',
      help: 'Observa bien: este perrito la levanta a la derecha. ¡Busquemos al que va a la izquierda!',
      items: [
        { id: 'izquierda', name: 'Patita a la izquierda', img: 'assets/espacial_perrito_izquierda.gif?v=335', isCorrect: true },
        { id: 'derecha', name: 'Patita a la derecha', img: 'assets/espacial_perrito_derecha.gif?v=335', isCorrect: false }
      ]
    },
    {
      key: 'izquierda_derecha_perrito_der',
      type: 'pair',
      family: 'lateralidad',
      variantId: 'perrito',
      title: 'El Perrito Juguetón',
      target: 'derecha',
      prompt: 'Indica cuál es la derecha.',
      praise: '¡Muy bien! ¡El perrito levanta su patita hacia la derecha!',
      help: 'Observa con atención: este perrito la levanta hacia la izquierda. ¡Busquemos al de la derecha!',
      items: [
        { id: 'izquierda', name: 'Patita a la izquierda', img: 'assets/espacial_perrito_izquierda.gif?v=335', isCorrect: false },
        { id: 'derecha', name: 'Patita a la derecha', img: 'assets/espacial_perrito_derecha.gif?v=335', isCorrect: true }
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

  // Filtros clínicos activos del terapeuta
  SpatialSafariGame.selectedFamilyFilter = 'all';
  SpatialSafariGame.selectedVariantFilter = 'all';

  SpatialSafariGame.challenges = SPATIAL_CHALLENGES;

  // Generador dinámico de sesión (adaptativo o filtrado por terapeuta)
  function buildSpatialDeck(count = 6) {
    // Caso 1: Enfoque clínico específico fijado por el terapeuta
    if (SpatialSafariGame.selectedFamilyFilter !== 'all') {
      let filtered = SPATIAL_CHALLENGES.filter(c => c.family === SpatialSafariGame.selectedFamilyFilter);
      if (SpatialSafariGame.selectedVariantFilter !== 'all') {
        filtered = filtered.filter(c => c.variantId === SpatialSafariGame.selectedVariantFilter);
      }
      return shuffleArray(filtered);
    }

    // Caso 2: Modo automático generalizado (rotación dinámica de familias y variantes)
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
      // Barajar los candidatos para que TODAS las variantes (1, 2, 3) tengan igual probabilidad de salir
      const candidates = shuffleArray(familyMap[fam]);
      let chosen = candidates.find(c => !lastKeys.includes(c.key));
      if (!chosen) chosen = candidates[0];
      picked.push(chosen);
    });

    // Registrar en memoria de sesión
    picked.forEach(c => SpatialSafariMemory.usedChallengeKeys.push(c.key));
    if (SpatialSafariMemory.usedChallengeKeys.length > 24) {
      SpatialSafariMemory.usedChallengeKeys = SpatialSafariMemory.usedChallengeKeys.slice(-12);
    }

    return picked;
  }

  // --- AUDIO Y SÍNTESIS CON GOOGLE TTS (MOTOR OFICIAL CRIN) ---
  function safeSpeak(text, onComplete) {
    if (!text) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }
    // Sanitizar texto: quitar emojis para que Google TTS nunca lea sus nombres de diccionario
    const cleanText = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, '').replace(/\s+/g, ' ').trim();
    if (SpatialSafariGame.speechWatchdog) clearTimeout(SpatialSafariGame.speechWatchdog);
    SpatialSafariGame.isSpeaking = true;

    SpatialSafariGame.speechWatchdog = setTimeout(() => {
      SpatialSafariGame.isSpeaking = false;
    }, 9000);

    const finish = () => {
      SpatialSafariGame.isSpeaking = false;
      if (SpatialSafariGame.speechWatchdog) clearTimeout(SpatialSafariGame.speechWatchdog);
      if (typeof onComplete === 'function') onComplete();
    };

    if (typeof speakText === 'function') {
      speakText(cleanText, finish);
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(cleanText);
      u.lang = 'es-ES';
      u.rate = 0.92;
      u.pitch = 1.05;
      u.onend = finish;
      u.onerror = finish;
      window.speechSynthesis.speak(u);
    } else {
      finish();
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
    if (typeof stopAllAudio === 'function') stopAllAudio('open_spatial_safari');

    if (typeof switchScreen === 'function') {
      switchScreen('spatial-safari');
    } else {
      const screens = document.querySelectorAll('.screen');
      screens.forEach(s => s.classList.remove('active'));
      const screen = document.getElementById('screen-spatial-safari');
      if (screen) screen.classList.add('active');
    }

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
    if (typeof stopAllAudio === 'function') stopAllAudio('close_spatial_safari');

    if (typeof switchScreen === 'function') {
      switchScreen('map');
    } else {
      const screen = document.getElementById('screen-spatial-safari');
      if (screen) screen.classList.remove('active');
      const mapScreen = document.getElementById('screen-map') || document.getElementById('screen-welcome');
      if (mapScreen) mapScreen.classList.add('active');
    }
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
      }, 6000);
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

        <!-- ESCENARIO COMPARATIVO DE DOS OPCIONES (AGRANDADO) -->
        <div style="flex: 1; width: 100%; max-width: 840px; display: flex; align-items: center; justify-content: center; gap: 24px; padding: 10px; flex-wrap: wrap;">
          ${shuffledItems.map(item => `
            <div id="spatial-opt-${item.id}" onclick="handleSpatialChoice('${item.id}', ${item.isCorrect})"
                 class="spatial-card"
                 style="background: #FFFFFF; border: 3.5px solid #E2E8F0; border-radius: 24px; padding: 12px; width: 330px; max-width: 46vw; min-height: 290px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 10px 25px rgba(0,0,0,0.08); transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s, border-color 0.22s; position: relative; user-select: none;"
                 onmouseover="this.style.transform='scale(1.04) translateY(-4px)'; this.style.borderColor='#818CF8';"
                 onmouseout="this.style.transform='scale(1) translateY(0)'; this.style.borderColor='#E2E8F0';">
              <div style="width: 100%; height: 260px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; border-radius: 18px; background: radial-gradient(circle at 50% 50%, rgba(241,245,249,0.8) 0%, rgba(226,232,240,0.3) 100%);">
                <img src="${item.img}" alt="${item.name}" style="max-width: 98%; max-height: 98%; object-fit: contain; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.18)); pointer-events: none;" />
              </div>
            </div>
          `).join('')}
        </div>

        
      </div>
    `;
  }

  // 2. Ronda interactiva vertical (Arriba / Abajo - Encima / Debajo)
  function renderTableRound(stage, round) {
    const isEncimaDebajo = round.target === 'encima' || round.target === 'debajo';
    const topId = isEncimaDebajo ? 'encima' : 'arriba';
    const bottomId = isEncimaDebajo ? 'debajo' : 'abajo';
    const topLabel = round.topLabel || (isEncimaDebajo ? 'ENCIMA' : 'ARRIBA');
    const bottomLabel = round.bottomLabel || (isEncimaDebajo ? 'DEBAJO' : 'ABAJO');
    const topStyle = round.topStyle || 'top: 12px; left: 50%; transform: translateX(-50%); width: 140px; height: 100px;';
    const bottomStyle = round.bottomStyle || 'bottom: 12px; left: 50%; transform: translateX(-50%); width: 140px; height: 110px;';
    const sceneIcon = round.icon || '🏠';
    const instruction = round.instruction || 'Toca lo que está arriba o lo que está abajo';

    stage.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 12px; box-sizing: border-box; width: 100%;">
        
        <!-- BANNER DE CONSIGNA -->
        <div style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); color: white; padding: 10px 16px; border-radius: 18px; width: 100%; max-width: 720px; box-shadow: 0 4px 14px rgba(49,46,129,0.25); display: flex; align-items: center; justify-content: space-between; gap: 10px; border: 2px solid #6366F1;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 26px;">${sceneIcon}</div>
            <div>
              <div style="font-size: 11px; font-weight: 700; color: #A5B4FC; text-transform: uppercase;">${round.title || 'Arriba y Abajo'}</div>
              <div id="spatial-prompt-text" style="font-size: 16px; font-weight: 900; color: #FEF08A; text-shadow: 0 1px 3px rgba(0,0,0,0.4);">
                ${round.prompt}
              </div>
            </div>
          </div>
          <button onclick="repeatSpatialPrompt()" style="background: rgba(255,255,255,0.18); border: 1.5px solid #A5B4FC; color: #E0E7FF; padding: 6px 10px; border-radius: 12px; font-weight: 800; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <span>🔊 Oír</span>
          </button>
        </div>

        <!-- ESCENARIO INTERACTIVO CON DOS ZONAS TÁCTILES (ARRIBA Y ABAJO) -->
        <div style="flex: 1; width: 100%; max-width: 520px; display: flex; align-items: center; justify-content: center; padding: 10px; position: relative;">
          <div style="position: relative; width: 340px; height: 310px; background: white; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 3px solid #E2E8F0; overflow: hidden; display: flex; align-items: center; justify-content: center;">
            <img src="${round.bgImg}" alt="${round.title}" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;" />

            <!-- ZONA SUPERIOR (ARRIBA / ENCIMA) -->
            <div id="spatial-opt-${topId}" onclick="handleSpatialChoice('${topId}', ${round.target === topId})"
                 style="position: absolute; ${topStyle} border-radius: 20px; border: 3px solid transparent; background: transparent; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
                 onmouseover="this.style.background='rgba(99,102,241,0.2)'; this.style.borderColor='#4F46E5';"
                 onmouseout="this.style.background='rgba(99,102,241,0.08)'; this.style.borderColor='rgba(99,102,241,0.5)';">
              
            </div>

            <!-- ZONA INFERIOR (ABAJO / DEBAJO) -->
            <div id="spatial-opt-${bottomId}" onclick="handleSpatialChoice('${bottomId}', ${round.target === bottomId})"
                 style="position: absolute; ${bottomStyle} border-radius: 20px; border: 3px solid transparent; background: transparent; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
                 onmouseover="this.style.background='rgba(245,158,11,0.2)'; this.style.borderColor='#D97706';"
                 onmouseout="this.style.background='rgba(245,158,11,0.08)'; this.style.borderColor='rgba(245,158,11,0.5)';">
              
            </div>
          </div>
        </div>

        
      </div>
    `;
  }

  // 3. Ronda Cerca / Lejos
  function renderCercaLejosRound(stage, round) {
    const sceneIcon = round.icon || '🌾';
    const instruction = round.instruction || 'Toca lo que está cerca o lo que está lejos';

    stage.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 12px; box-sizing: border-box; width: 100%;">
        
        <!-- BANNER DE CONSIGNA -->
        <div style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); color: white; padding: 10px 16px; border-radius: 18px; width: 100%; max-width: 720px; box-shadow: 0 4px 14px rgba(49,46,129,0.25); display: flex; align-items: center; justify-content: space-between; gap: 10px; border: 2px solid #6366F1;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 26px;">${sceneIcon}</div>
            <div>
              <div style="font-size: 11px; font-weight: 700; color: #A5B4FC; text-transform: uppercase;">${round.title || 'Cerca y Lejos'}</div>
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
        <div style="flex: 1; width: 100%; max-width: 560px; display: flex; align-items: center; justify-content: center; padding: 10px; position: relative;">
          <div style="position: relative; width: 420px; height: 280px; max-width: 90vw; background: white; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 3px solid #E2E8F0; overflow: hidden;">
            <img src="${round.bgImg}" alt="${round.title}" style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;" />

            <!-- ZONA CERCA (Left foreground) -->
            <div id="spatial-opt-cerca" onclick="handleSpatialChoice('cerca', ${round.target === 'cerca'})"
                 style="position: absolute; bottom: 12px; left: 12px; width: 180px; height: 200px; border-radius: 20px; border: 3px solid transparent; background: transparent; cursor: pointer; transition: all 0.2s; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 10px;"
                 onmouseover="this.style.background='rgba(16,185,129,0.25)';"
                 onmouseout="this.style.background='rgba(16,185,129,0.1)';">
              
            </div>

            <!-- ZONA LEJOS (Right background) -->
            <div id="spatial-opt-lejos" onclick="handleSpatialChoice('lejos', ${round.target === 'lejos'})"
                 style="position: absolute; top: 15px; right: 15px; width: 160px; height: 150px; border-radius: 20px; border: 3px solid transparent; background: transparent; cursor: pointer; transition: all 0.2s; display: flex; align-items: flex-start; justify-content: center; padding-top: 10px;"
                 onmouseover="this.style.background='rgba(99,102,241,0.25)';"
                 onmouseout="this.style.background='rgba(99,102,241,0.1)';">
              
            </div>
          </div>
        </div>

        
      </div>
    `;
  }

  // 4. Ronda Carrera de Animales (Primero, Segundo, Tercero)
  function renderFilaRound(stage, round) {
    stage.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 12px; box-sizing: border-box; width: 100%;">
        
        <!-- BANNER DE CONSIGNA -->
        <div style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); color: white; padding: 10px 16px; border-radius: 18px; width: 100%; max-width: 720px; box-shadow: 0 4px 14px rgba(49,46,129,0.25); display: flex; align-items: center; justify-content: space-between; gap: 10px; border: 2px solid #6366F1;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 26px;">🏆</div>
            <div>
              <div style="font-size: 11px; font-weight: 700; color: #A5B4FC; text-transform: uppercase;">${round.title || 'La Carrera'}</div>
              <div id="spatial-prompt-text" style="font-size: 16px; font-weight: 900; color: #FEF08A; text-shadow: 0 1px 3px rgba(0,0,0,0.4);">
                ${round.prompt}
              </div>
            </div>
          </div>
          <button onclick="repeatSpatialPrompt()" style="background: rgba(255,255,255,0.18); border: 1.5px solid #A5B4FC; color: #E0E7FF; padding: 6px 10px; border-radius: 12px; font-weight: 800; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <span>🔊 Oír</span>
          </button>
        </div>

        <!-- ESCENARIO INTERACTIVO: CARRERA DE 3 ANIMALES (1º, 2º, 3º) -->
        <div style="flex: 1; width: 100%; max-width: 650px; display: flex; align-items: center; justify-content: center; padding: 8px; position: relative;">
          <div style="position: relative; width: 100%; max-width: 580px; aspect-ratio: 16/9; max-height: 330px; background: white; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border: 3px solid #E2E8F0; overflow: hidden;">
            <img src="${round.bgImg}" alt="Carrera de animales" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; pointer-events: none;" />

            <!-- ZONA 3º TERCERO (Leoncito, left) -->
            <div id="spatial-opt-tercero" onclick="handleSpatialChoice('tercero', ${round.target === 'tercero'})"
                 style="position: absolute; top: 12%; left: 3%; width: 29%; height: 82%; border-radius: 20px; border: 3px solid transparent; background: transparent; cursor: pointer; transition: all 0.2s; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px;"
                 onmouseover="this.style.background='rgba(217,119,6,0.22)';"
                 onmouseout="this.style.background='rgba(217,119,6,0.06)';">
              
            </div>

            <!-- ZONA 2º SEGUNDO (Monito, center) -->
            <div id="spatial-opt-segundo" onclick="handleSpatialChoice('segundo', ${round.target === 'segundo'})"
                 style="position: absolute; top: 12%; left: 33%; width: 25%; height: 82%; border-radius: 20px; border: 3px solid transparent; background: transparent; cursor: pointer; transition: all 0.2s; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px;"
                 onmouseover="this.style.background='rgba(59,130,246,0.22)';"
                 onmouseout="this.style.background='rgba(59,130,246,0.06)';">
              
            </div>

            <!-- ZONA 1º PRIMERO (Jirafita, right) -->
            <div id="spatial-opt-primero" onclick="handleSpatialChoice('primero', ${round.target === 'primero'})"
                 style="position: absolute; top: 4%; left: 59%; width: 38%; height: 92%; border-radius: 20px; border: 3px solid transparent; background: transparent; cursor: pointer; transition: all 0.2s; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px;"
                 onmouseover="this.style.background='rgba(234,179,8,0.22)';"
                 onmouseout="this.style.background='rgba(234,179,8,0.06)';">
              
            </div>
          </div>
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


  // --- SELECTOR CLÍNICO DE VARIANTES PARA TERAPEUTAS ---
  const FAMILY_VARIANT_CATALOG = {
    all: { name: '🎲 Todos los conceptos (Rotación Automática)', variants: [] },
    dentro_fuera: {
      name: '📦 Adentro / Afuera',
      variants: [
        { id: 'all', name: '🔄 Todas las variantes' },
        { id: 'perrito', name: '🐶 Casita del Perrito' },
        { id: 'cueva', name: '🐻 Cueva del Osito' },
        { id: 'avestruz', name: '🪶 Pozo del Avestruz' }
      ]
    },
    delante_detras: {
      name: '🌲 Delante / Detrás',
      variants: [
        { id: 'all', name: '🔄 Todas las variantes' },
        { id: 'arbol', name: '🐻 Osito y el Árbol' },
        { id: 'bicicleta', name: '🚲 Niño y la Bicicleta' },
        { id: 'pelota', name: '⚽ Niño y la Pelota' }
      ]
    },
    serializacion: {
      name: '🏁 Primero / Segundo / Tercero',
      variants: [
        { id: 'all', name: '🔄 Todas las variantes' },
        { id: 'animales', name: '🦒 Carrera de Animales' },
        { id: 'autos', name: '🏎️ Carrera de Autos' },
        { id: 'gallinas', name: '🐓 Carrera de la Granja' }
      ]
    },
    abierto_cerrado: {
      name: '🚪 Abierto / Cerrado',
      variants: [
        { id: 'all', name: '🔄 Todas las variantes' },
        { id: 'cofres', name: '💎 Cofres Mágicos' },
        { id: 'manos', name: '🖐️ Manitos (Abierta / Puño)' },
        { id: 'puerta', name: '🏡 Puerta de la Casita' }
      ]
    },
    ancho_estrecho: {
      name: '🌉 Ancho / Estrecho',
      variants: [
        { id: 'all', name: '🔄 Todas las variantes' },
        { id: 'puente', name: '🐘 Puentes (Elefante / Patito)' },
        { id: 'camas', name: '🛏️ Camas (Ancha / Estrecha)' },
        { id: 'caminos', name: '🛣️ Caminos (Camión / Bici)' }
      ]
    },
    lateralidad: {
      name: '👈👉 Izquierda / Derecha',
      variants: [
        { id: 'all', name: '🔄 Todas las variantes' },
        { id: 'flechas', name: '👆 Flechas Direccionales' },
        { id: 'nino', name: '🙋‍♂️ Niño Levantando Mano' },
        { id: 'perrito', name: '🐶 Perrito Levantando Patita' }
      ]
    },
    encima_debajo: {
      name: '🪑 Encima de / Debajo de',
      variants: [
        { id: 'all', name: '🔄 Todas las variantes' },
        { id: 'mesa', name: '⚽ Pelota y la Mesa' },
        { id: 'florero', name: '💐 Florero y la Mesa' },
        { id: 'gato', name: '🐱 Gatito y la Silla' }
      ]
    },
    arriba_abajo: {
      name: '⬆️⬇️ Arriba / Abajo',
      variants: [
        { id: 'all', name: '🔄 Todas las variantes' },
        { id: 'cuadro_silla', name: '🖼️ Cuadro y la Silla' },
        { id: 'pajaro_perro', name: '🐦 Pajarito y Perrito' },
        { id: 'sol_arbol', name: '☀️ Sol y el Árbol' }
      ]
    },
    cerca_lejos: {
      name: '🔍 Cerca / Lejos',
      variants: [
        { id: 'all', name: '🔄 Todas las variantes' },
        { id: 'conejos', name: '🐇 Valle de Conejitos' },
        { id: 'caballo_vaca', name: '🐴 Caballo y Vaca' },
        { id: 'pala_carretilla', name: '👨‍🌾 Huerto y Carretilla' }
      ]
    }
  };

  window.openSpatialTherapistSelector = function() {
    let modal = document.getElementById('spatial-therapist-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'spatial-therapist-modal';
      modal.style.cssText = 'display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); z-index: 10001; align-items: center; justify-content: center; padding: 16px;';
      modal.innerHTML = `
        <div style="background: white; border-radius: 24px; max-width: 480px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 3px solid #6366F1; overflow: hidden; animation: popIn 0.25s ease-out;">
          <div style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); color: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 24px;">⚙️</span>
              <div>
                <div style="font-size: 15px; font-weight: 900; color: #FEF08A;">Control Clínico de Variantes</div>
                <div style="font-size: 11px; color: #C7D2FE;">Orientación Espacial (Paso 3)</div>
              </div>
            </div>
            <button onclick="closeSpatialTherapistSelector()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-weight: bold; font-size: 16px;">✕</button>
          </div>
          
          <div style="padding: 20px; display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label style="font-size: 12px; font-weight: 800; color: #334155; display: block; margin-bottom: 6px;">1. Concepto Espacial a Trabajar:</label>
              <select id="spatial-filter-family" onchange="onSpatialFamilySelectChange()" style="width: 100%; padding: 10px; border-radius: 12px; border: 2px solid #CBD5E1; font-weight: 700; color: #1E293B; font-size: 13px; background: #F8FAFC;">
                ${Object.keys(FAMILY_VARIANT_CATALOG).map(k => `<option value="${k}">${FAMILY_VARIANT_CATALOG[k].name}</option>`).join('')}
              </select>
            </div>

            <div id="spatial-variant-group" style="display: none;">
              <label style="font-size: 12px; font-weight: 800; color: #334155; display: block; margin-bottom: 6px;">2. Variante Ilustrada:</label>
              <select id="spatial-filter-variant" style="width: 100%; padding: 10px; border-radius: 12px; border: 2px solid #CBD5E1; font-weight: 700; color: #1E293B; font-size: 13px; background: #F8FAFC;">
              </select>
            </div>

            <div style="background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 14px; padding: 10px 12px; font-size: 12px; color: #1E40AF; line-height: 1.4;">
              💡 <strong>Recomendación Clínica:</strong> La <em>Rotación Automática</em> alterna familias y variantes sin repetición, previniendo la monotonía y fomentando la generalización cognitiva del niño.
            </div>

            <div style="display: flex; gap: 10px; margin-top: 6px;">
              <button onclick="applySpatialTherapistFilter()" style="flex: 1; background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%); color: white; border: none; padding: 12px; border-radius: 14px; font-weight: 900; font-size: 13px; cursor: pointer; box-shadow: 0 4px 12px rgba(79,70,229,0.3);">
                ✅ Aplicar y Comenzar Reto
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    // Set initial select values
    const famSelect = document.getElementById('spatial-filter-family');
    if (famSelect) famSelect.value = SpatialSafariGame.selectedFamilyFilter || 'all';
    onSpatialFamilySelectChange();
    modal.style.display = 'flex';
  };

  window.closeSpatialTherapistSelector = function() {
    const modal = document.getElementById('spatial-therapist-modal');
    if (modal) modal.style.display = 'none';
  };

  window.onSpatialFamilySelectChange = function() {
    const famSelect = document.getElementById('spatial-filter-family');
    const varGroup = document.getElementById('spatial-variant-group');
    const varSelect = document.getElementById('spatial-filter-variant');
    if (!famSelect || !varGroup || !varSelect) return;

    const fam = famSelect.value;
    if (fam === 'all' || !FAMILY_VARIANT_CATALOG[fam] || FAMILY_VARIANT_CATALOG[fam].variants.length === 0) {
      varGroup.style.display = 'none';
    } else {
      varGroup.style.display = 'block';
      const variants = FAMILY_VARIANT_CATALOG[fam].variants;
      varSelect.innerHTML = variants.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
      varSelect.value = SpatialSafariGame.selectedVariantFilter || 'all';
    }
  };

  window.applySpatialTherapistFilter = function() {
    const famSelect = document.getElementById('spatial-filter-family');
    const varSelect = document.getElementById('spatial-filter-variant');
    if (famSelect) {
      SpatialSafariGame.selectedFamilyFilter = famSelect.value;
    }
    if (varSelect && famSelect.value !== 'all') {
      SpatialSafariGame.selectedVariantFilter = varSelect.value;
    } else {
      SpatialSafariGame.selectedVariantFilter = 'all';
    }

    closeSpatialTherapistSelector();

    // Reiniciar partida con el filtro
    SpatialSafariGame.isRunning = true;
    SpatialSafariGame.currentRoundIndex = 0;
    SpatialSafariGame.roundDeck = buildSpatialDeck(SpatialSafariGame.roundsSession);
    SpatialSafariGame.roundsSession = SpatialSafariGame.roundDeck.length >= 6 ? 6 : SpatialSafariGame.roundDeck.length;
    renderRound(0);
  };

  window.closeSpatialVictoryModal = function() {
    const modal = document.getElementById('spatial-victory-modal');
    if (modal) modal.style.display = 'none';
    closeSpatialSafariAndReturnToMap();
  };

})();
