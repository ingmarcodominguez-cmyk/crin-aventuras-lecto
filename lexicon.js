// =========================================================================
// CRIN AVENTURAS DE LECTOESCRITURA - BASE DE DATOS LÉXICA CANÓNICA
// Cada palabra cuenta con sus 5 cualidades esenciales:
// 1. escritura: Ortografía canónica con acentuación gráfica correcta (LÁMPARA, MELÓN)
// 2. pronunciacion: Fonética y acentuación prosódica natural (Lámpara, Melón)
// 3. letras: Desglose de grafemas incluyendo dígrafos CH, LL, RR (L-A-M-P-A-R-A)
// 4. silabas: Segmentación silábica fonológica (LÁM-PA-RA)
// 5. emoji: Pictograma o ilustración correspondiente
// =========================================================================

const CANONICAL_WORD_LEXICON = {
  // Palabras con L
  'LAMPARA': {
    escritura: 'LÁMPARA',
    pronunciacion: 'Lámpara',
    letras: ['L', 'A', 'M', 'P', 'A', 'R', 'A'],
    silabas: ['LÁM', 'PA', 'RA'],
    emoji: 'assets/lampara.png'
  },
  'LAPIZ': {
    escritura: 'LÁPIZ',
    pronunciacion: 'Lápiz',
    letras: ['L', 'A', 'P', 'I', 'Z'],
    silabas: ['LÁ', 'PIZ'],
    emoji: 'assets/lapiz.png'
  },
  'LATA': {
    escritura: 'LATA',
    pronunciacion: 'Lata',
    letras: ['L', 'A', 'T', 'A'],
    silabas: ['LA', 'TA'],
    emoji: 'assets/lata.png'
  },
  'LANA': {
    escritura: 'LANA',
    pronunciacion: 'Lana',
    letras: ['L', 'A', 'N', 'A'],
    silabas: ['LA', 'NA'],
    emoji: 'assets/lana.png'
  },
  'LECHE': {
    escritura: 'LECHE',
    pronunciacion: 'Leche',
    letras: ['L', 'E', 'CH', 'E'],
    silabas: ['LE', 'CHE'],
    emoji: 'assets/leche.png'
  },
  'LEON': {
    escritura: 'LEÓN',
    pronunciacion: 'León',
    letras: ['L', 'E', 'O', 'N'],
    silabas: ['LE', 'ÓN'],
    emoji: 'assets/leon.png'
  },
  'LENTA': {
    escritura: 'LENTA',
    pronunciacion: 'Lenta',
    letras: ['L', 'E', 'N', 'T', 'A'],
    silabas: ['LEN', 'TA'],
    emoji: '🐢'
  },
  'LINDA': {
    escritura: 'LINDA',
    pronunciacion: 'Linda',
    letras: ['L', 'I', 'N', 'D', 'A'],
    silabas: ['LIN', 'DA'],
    emoji: 'assets/linda.png'
  },
  'LIMON': {
    escritura: 'LIMÓN',
    pronunciacion: 'Limón',
    letras: ['L', 'I', 'M', 'O', 'N'],
    silabas: ['LI', 'MÓN'],
    emoji: 'assets/limon.png'
  },
  'LIMA': {
    escritura: 'LIMA',
    pronunciacion: 'Lima',
    letras: ['L', 'I', 'M', 'A'],
    silabas: ['LI', 'MA'],
    emoji: '🍏'
  },
  'LIBRO': {
    escritura: 'LIBRO',
    pronunciacion: 'Libro',
    letras: ['L', 'I', 'B', 'R', 'O'],
    silabas: ['LI', 'BRO'],
    emoji: 'assets/libro.png'
  },
  'LINTERNA': {
    escritura: 'LINTERNA',
    pronunciacion: 'Linterna',
    letras: ['L', 'I', 'N', 'T', 'E', 'R', 'N', 'A'],
    silabas: ['LIN', 'TER', 'NA'],
    emoji: 'assets/linterna.png'
  },
  'LOMA': {
    escritura: 'LOMA',
    pronunciacion: 'Loma',
    letras: ['L', 'O', 'M', 'A'],
    silabas: ['LO', 'MA'],
    emoji: 'assets/loma.png'
  },
  'LOBO': {
    escritura: 'LOBO',
    pronunciacion: 'Lobo',
    letras: ['L', 'O', 'B', 'O'],
    silabas: ['LO', 'BO'],
    emoji: '🐺'
  },
  'LUNA': {
    escritura: 'LUNA',
    pronunciacion: 'Luna',
    letras: ['L', 'U', 'N', 'A'],
    silabas: ['LU', 'NA'],
    emoji: 'assets/luna.png'
  },
  'LUNAR': {
    escritura: 'LUNAR',
    pronunciacion: 'Lunar',
    letras: ['L', 'U', 'N', 'A', 'R'],
    silabas: ['LU', 'NAR'],
    emoji: 'assets/lunar.png'
  },
  'LADRILLO': {
    escritura: 'LADRILLO',
    pronunciacion: 'Ladrillo',
    letras: ['L', 'A', 'D', 'R', 'I', 'LL', 'O'],
    silabas: ['LA', 'DRI', 'LLO'],
    emoji: 'assets/ladrillo.png'
  },
  'LAVARROPA': {
    escritura: 'LAVARROPA',
    pronunciacion: 'Lavarropa',
    letras: ['L', 'A', 'V', 'A', 'RR', 'O', 'P', 'A'],
    silabas: ['LA', 'VA', 'RRO', 'PA'],
    emoji: 'assets/lavarropa.png'
  },
  'LATIGO': {
    escritura: 'LÁTIGO',
    pronunciacion: 'Látigo',
    letras: ['L', 'A', 'T', 'I', 'G', 'O'],
    silabas: ['LÁ', 'TI', 'GO'],
    emoji: 'assets/latigo.png'
  },
  'LANGOSTA': {
    escritura: 'LANGOSTA',
    pronunciacion: 'Langosta',
    letras: ['L', 'A', 'N', 'G', 'O', 'S', 'T', 'A'],
    silabas: ['LAN', 'GOS', 'TA'],
    emoji: 'assets/langosta.png'
  },
  'LAGO': {
    escritura: 'LAGO',
    pronunciacion: 'Lago',
    letras: ['L', 'A', 'G', 'O'],
    silabas: ['LA', 'GO'],
    emoji: 'assets/lago.png'
  },
  'LENGUA': {
    escritura: 'LENGUA',
    pronunciacion: 'Lengua',
    letras: ['L', 'E', 'N', 'G', 'U', 'A'],
    silabas: ['LEN', 'GUA'],
    emoji: 'assets/lengua.png'
  },
  'LLAVE': {
    escritura: 'LLAVE',
    pronunciacion: 'Llave',
    letras: ['LL', 'A', 'V', 'E'],
    silabas: ['LLA', 'VE'],
    emoji: 'assets/llave.png'
  },

  // Palabras con M
  'MELON': {
    escritura: 'MELÓN',
    pronunciacion: 'Melón',
    letras: ['M', 'E', 'L', 'O', 'N'],
    silabas: ['ME', 'LÓN'],
    emoji: 'assets/melon.png'
  },
  'MAMA': {
    escritura: 'MAMÁ',
    pronunciacion: 'Mamá',
    letras: ['M', 'A', 'M', 'A'],
    silabas: ['MA', 'MÁ'],
    emoji: '👩'
  },
  'MANZANA': {
    escritura: 'MANZANA',
    pronunciacion: 'Manzana',
    letras: ['M', 'A', 'N', 'Z', 'A', 'N', 'A'],
    silabas: ['MAN', 'ZA', 'NA'],
    emoji: 'assets/manzana.png'
  },
  'MANO': {
    escritura: 'MANO',
    pronunciacion: 'Mano',
    letras: ['M', 'A', 'N', 'O'],
    silabas: ['MA', 'NO'],
    emoji: 'assets/mano.png'
  },
  'MAPA': {
    escritura: 'MAPA',
    pronunciacion: 'Mapa',
    letras: ['M', 'A', 'P', 'A'],
    silabas: ['MA', 'PA'],
    emoji: 'assets/mapa.png'
  },
  'MATE': {
    escritura: 'MATE',
    pronunciacion: 'Mate',
    letras: ['M', 'A', 'T', 'E'],
    silabas: ['MA', 'TE'],
    emoji: 'assets/mate.png'
  },
  'MARIPOSA': {
    escritura: 'MARIPOSA',
    pronunciacion: 'Mariposa',
    letras: ['M', 'A', 'R', 'I', 'P', 'O', 'S', 'A'],
    silabas: ['MA', 'RI', 'PO', 'SA'],
    emoji: 'assets/mariposa.png'
  },
  'MARGARITA': {
    escritura: 'MARGARITA',
    pronunciacion: 'Margarita',
    letras: ['M', 'A', 'R', 'G', 'A', 'R', 'I', 'T', 'A'],
    silabas: ['MAR', 'GA', 'RI', 'TA'],
    emoji: 'assets/margarita.png'
  },
  'MESA': {
    escritura: 'MESA',
    pronunciacion: 'Mesa',
    letras: ['M', 'E', 'S', 'A'],
    silabas: ['ME', 'SA'],
    emoji: 'assets/mesa.png'
  },
  'MEDIAS': {
    escritura: 'MEDIAS',
    pronunciacion: 'Medias',
    letras: ['M', 'E', 'D', 'I', 'A', 'S'],
    silabas: ['ME', 'DIAS'],
    emoji: 'assets/medias.png'
  },
  'MENSAJERO': {
    escritura: 'MENSAJERO',
    pronunciacion: 'Mensajero',
    letras: ['M', 'E', 'N', 'S', 'A', 'J', 'E', 'R', 'O'],
    silabas: ['MEN', 'SA', 'JE', 'RO'],
    emoji: 'assets/mensajero.png'
  },
  'MINUTO': {
    escritura: 'MINUTO',
    pronunciacion: 'Minuto',
    letras: ['M', 'I', 'N', 'U', 'T', 'O'],
    silabas: ['MI', 'NU', 'TO'],
    emoji: 'assets/minuto.png'
  },
  'MIRADA': {
    escritura: 'MIRADA',
    pronunciacion: 'Mirada',
    letras: ['M', 'I', 'R', 'A', 'D', 'A'],
    silabas: ['MI', 'RA', 'DA'],
    emoji: '👀'
  },
  'MONO': {
    escritura: 'MONO',
    pronunciacion: 'Mono',
    letras: ['M', 'O', 'N', 'O'],
    silabas: ['MO', 'NO'],
    emoji: 'assets/mono.png'
  },
  'MONITO': {
    escritura: 'MONITO',
    pronunciacion: 'Monito',
    letras: ['M', 'O', 'N', 'I', 'T', 'O'],
    silabas: ['MO', 'NI', 'TO'],
    emoji: 'assets/mono.png'
  },
  'MOTO': {
    escritura: 'MOTO',
    pronunciacion: 'Moto',
    letras: ['M', 'O', 'T', 'O'],
    silabas: ['MO', 'TO'],
    emoji: 'assets/moto.png'
  },
  'MOLINO': {
    escritura: 'MOLINO',
    pronunciacion: 'Molino',
    letras: ['M', 'O', 'L', 'I', 'N', 'O'],
    silabas: ['MO', 'LI', 'NO'],
    emoji: 'assets/molino.png'
  },
  'MONTANA': {
    escritura: 'MONTAÑA',
    pronunciacion: 'Montaña',
    letras: ['M', 'O', 'N', 'T', 'A', 'Ñ', 'A'],
    silabas: ['MON', 'TA', 'ÑA'],
    emoji: 'assets/montana.png'
  },
  'MONIO': {
    escritura: 'MOÑO',
    pronunciacion: 'Moño',
    letras: ['M', 'O', 'Ñ', 'O'],
    silabas: ['MO', 'ÑO'],
    emoji: 'assets/monio.png'
  },
  'MUSICA': {
    escritura: 'MÚSICA',
    pronunciacion: 'Música',
    letras: ['M', 'U', 'S', 'I', 'C', 'A'],
    silabas: ['MÚ', 'SI', 'CA'],
    emoji: 'assets/musica.png'
  },
  'MAMADERA': {
    escritura: 'MAMADERA',
    pronunciacion: 'Mamadera',
    letras: ['M', 'A', 'M', 'A', 'D', 'E', 'R', 'A'],
    silabas: ['MA', 'MA', 'DE', 'RA'],
    emoji: 'assets/mamadera.png'
  },
  'MAGO': {
    escritura: 'MAGO',
    pronunciacion: 'Mago',
    letras: ['M', 'A', 'G', 'O'],
    silabas: ['MA', 'GO'],
    emoji: 'assets/mago.png'
  },
  'MANGUERA': {
    escritura: 'MANGUERA',
    pronunciacion: 'Manguera',
    letras: ['M', 'A', 'N', 'G', 'U', 'E', 'R', 'A'],
    silabas: ['MAN', 'GUE', 'RA'],
    emoji: 'assets/manguera.png'
  },

  // Palabras con P
  'PAPA': {
    escritura: 'PAPÁ',
    pronunciacion: 'Papá',
    letras: ['P', 'A', 'P', 'A'],
    silabas: ['PA', 'PÁ'],
    emoji: '👨'
  },
  'PALA': {
    escritura: 'PALA',
    pronunciacion: 'Pala',
    letras: ['P', 'A', 'L', 'A'],
    silabas: ['PA', 'LA'],
    emoji: 'assets/pala.png'
  },
  'PATO': {
    escritura: 'PATO',
    pronunciacion: 'Pato',
    letras: ['P', 'A', 'T', 'O'],
    silabas: ['PA', 'TO'],
    emoji: 'assets/pato.png'
  },
  'PAN': {
    escritura: 'PAN',
    pronunciacion: 'Pan',
    letras: ['P', 'A', 'N'],
    silabas: ['PAN'],
    emoji: 'assets/pan.png'
  },
  'PAJARO': {
    escritura: 'PÁJARO',
    pronunciacion: 'Pájaro',
    letras: ['P', 'A', 'J', 'A', 'R', 'O'],
    silabas: ['PÁ', 'JA', 'RO'],
    emoji: 'assets/pajaro.png'
  },
  'PANTALON': {
    escritura: 'PANTALÓN',
    pronunciacion: 'Pantalón',
    letras: ['P', 'A', 'N', 'T', 'A', 'L', 'O', 'N'],
    silabas: ['PAN', 'TA', 'LÓN'],
    emoji: 'assets/pantalon.png'
  },
  'PELOTA': {
    escritura: 'PELOTA',
    pronunciacion: 'Pelota',
    letras: ['P', 'E', 'L', 'O', 'T', 'A'],
    silabas: ['PE', 'LO', 'TA'],
    emoji: 'assets/pelota.png'
  },
  'PERA': {
    escritura: 'PERA',
    pronunciacion: 'Pera',
    letras: ['P', 'E', 'R', 'A'],
    silabas: ['PE', 'RA'],
    emoji: 'assets/pera.png'
  },
  'PERRO': {
    escritura: 'PERRO',
    pronunciacion: 'Perro',
    letras: ['P', 'E', 'RR', 'O'],
    silabas: ['PE', 'RRO'],
    emoji: 'assets/perro.png'
  },
  'PEZ': {
    escritura: 'PEZ',
    pronunciacion: 'Pez',
    letras: ['P', 'E', 'Z'],
    silabas: ['PEZ'],
    emoji: 'assets/pez.png'
  },
  'PEINE': {
    escritura: 'PEINE',
    pronunciacion: 'Peine',
    letras: ['P', 'E', 'I', 'N', 'E'],
    silabas: ['PEI', 'NE'],
    emoji: 'assets/peine.png'
  },
  'PIE': {
    escritura: 'PIE',
    pronunciacion: 'Pie',
    letras: ['P', 'I', 'E'],
    silabas: ['PIE'],
    emoji: 'assets/pie.png'
  },
  'PILA': {
    escritura: 'PILA',
    pronunciacion: 'Pila',
    letras: ['P', 'I', 'L', 'A'],
    silabas: ['PI', 'LA'],
    emoji: 'assets/pila.png'
  },
  'PINO': {
    escritura: 'PINO',
    pronunciacion: 'Pino',
    letras: ['P', 'I', 'N', 'O'],
    silabas: ['PI', 'NO'],
    emoji: 'assets/pino.png'
  },
  'PINA': {
    escritura: 'PIÑA',
    pronunciacion: 'Piña',
    letras: ['P', 'I', 'Ñ', 'A'],
    silabas: ['PI', 'ÑA'],
    emoji: 'assets/pina.png'
  },
  'PIPA': {
    escritura: 'PIPA',
    pronunciacion: 'Pipa',
    letras: ['P', 'I', 'P', 'A'],
    silabas: ['PI', 'PA'],
    emoji: 'assets/pipa.png'
  },
  'PITO': {
    escritura: 'PITO',
    pronunciacion: 'Pito',
    letras: ['P', 'I', 'T', 'O'],
    silabas: ['PI', 'TO'],
    emoji: 'assets/silbato.png'
  },
  'POMELO': {
    escritura: 'POMELO',
    pronunciacion: 'Pomelo',
    letras: ['P', 'O', 'M', 'E', 'L', 'O'],
    silabas: ['PO', 'ME', 'LO'],
    emoji: 'assets/pomelo.png'
  },
  'POZO': {
    escritura: 'POZO',
    pronunciacion: 'Pozo',
    letras: ['P', 'O', 'Z', 'O'],
    silabas: ['PO', 'ZO'],
    emoji: 'assets/pozo.png'
  },
  'PUENTE': {
    escritura: 'PUENTE',
    pronunciacion: 'Puente',
    letras: ['P', 'U', 'E', 'N', 'T', 'E'],
    silabas: ['PUEN', 'TE'],
    emoji: 'assets/puente.png'
  },
  'PUERTA': {
    escritura: 'PUERTA',
    pronunciacion: 'Puerta',
    letras: ['P', 'U', 'E', 'R', 'T', 'A'],
    silabas: ['PUER', 'TA'],
    emoji: 'assets/puerta.png'
  },
  'PUMA': {
    escritura: 'PUMA',
    pronunciacion: 'Puma',
    letras: ['P', 'U', 'M', 'A'],
    silabas: ['PU', 'MA'],
    emoji: 'assets/puma.png'
  },
  'PLUMA': {
    escritura: 'PLUMA',
    pronunciacion: 'Pluma',
    letras: ['P', 'L', 'U', 'M', 'A'],
    silabas: ['PLU', 'MA'],
    emoji: 'assets/pluma.png'
  },
  'PLATO': {
    escritura: 'PLATO',
    pronunciacion: 'Plato',
    letras: ['P', 'L', 'A', 'T', 'O'],
    silabas: ['PLA', 'TO'],
    emoji: 'assets/plato.png'
  },
  'PINGUINO': {
    escritura: 'PINGÜINO',
    pronunciacion: 'Pingüino',
    letras: ['P', 'I', 'N', 'G', 'U', 'I', 'N', 'O'],
    silabas: ['PIN', 'GÜI', 'NO'],
    emoji: 'assets/pinguino.png'
  },

  // Palabras con J
  'JIRAFA': {
    escritura: 'JIRAFA',
    pronunciacion: 'Jirafa',
    letras: ['J', 'I', 'R', 'A', 'F', 'A'],
    silabas: ['JI', 'RA', 'FA'],
    emoji: 'assets/jirafa.png'
  },
  'JOVEN': {
    escritura: 'JOVEN',
    pronunciacion: 'Joven',
    letras: ['J', 'O', 'V', 'E', 'N'],
    silabas: ['JO', 'VEN'],
    emoji: '🧑'
  },
  'JEFE': {
    escritura: 'JEFE',
    pronunciacion: 'Jefe',
    letras: ['J', 'E', 'F', 'E'],
    silabas: ['JE', 'FE'],
    emoji: 'assets/jefe.png'
  },
  'JUGUETE': {
    escritura: 'JUGUETE',
    pronunciacion: 'Juguete',
    letras: ['J', 'U', 'G', 'U', 'E', 'T', 'E'],
    silabas: ['JU', 'GUE', 'TE'],
    emoji: 'assets/juguete.png'
  },
  'JAULA': {
    escritura: 'JAULA',
    pronunciacion: 'Jaula',
    letras: ['J', 'A', 'U', 'L', 'A'],
    silabas: ['JAU', 'LA'],
    emoji: 'assets/jaula.png'
  },
  'JERINGA': {
    escritura: 'JERINGA',
    pronunciacion: 'Jeringa',
    letras: ['J', 'E', 'R', 'I', 'N', 'G', 'A'],
    silabas: ['JE', 'RIN', 'GA'],
    emoji: 'assets/jeringa.png'
  },
  'JAGUAR': {
    escritura: 'JAGUAR',
    pronunciacion: 'Jaguar',
    letras: ['J', 'A', 'G', 'U', 'A', 'R'],
    silabas: ['JA', 'GUAR'],
    emoji: 'assets/jaguar.png'
  },

  // Palabras con S
  'SAPO': {
    escritura: 'SAPO',
    pronunciacion: 'Sapo',
    letras: ['S', 'A', 'P', 'O'],
    silabas: ['SA', 'PO'],
    emoji: 'assets/sapo.png'
  },
  'SABANA': {
    escritura: 'SÁBANA',
    pronunciacion: 'Sábana',
    letras: ['S', 'A', 'B', 'A', 'N', 'A'],
    silabas: ['SÁ', 'BA', 'NA'],
    emoji: 'assets/sabana.png'
  },
  'SEMAFORO': {
    escritura: 'SEMÁFORO',
    pronunciacion: 'Semáforo',
    letras: ['S', 'E', 'M', 'A', 'F', 'O', 'R', 'O'],
    silabas: ['SE', 'MÁ', 'FO', 'RO'],
    emoji: 'assets/semaforo.png'
  },
  'SENOR': {
    escritura: 'SEÑOR',
    pronunciacion: 'Señor',
    letras: ['S', 'E', 'Ñ', 'O', 'R'],
    silabas: ['SE', 'ÑOR'],
    emoji: '👨‍💼'
  },
  'SENORA': {
    escritura: 'SEÑORA',
    pronunciacion: 'Señora',
    letras: ['S', 'E', 'Ñ', 'O', 'R', 'A'],
    silabas: ['SE', 'ÑO', 'RA'],
    emoji: '👩‍🦳'
  },
  'SILLA': {
    escritura: 'SILLA',
    pronunciacion: 'Silla',
    letras: ['S', 'I', 'LL', 'A'],
    silabas: ['SI', 'LLA'],
    emoji: '🪑'
  },
  'SIRENA': {
    escritura: 'SIRENA',
    pronunciacion: 'Sirena',
    letras: ['S', 'I', 'R', 'E', 'N', 'A'],
    silabas: ['SI', 'RE', 'NA'],
    emoji: 'assets/sirena.png'
  },
  'SALA': {
    escritura: 'SALA',
    pronunciacion: 'Sala',
    letras: ['S', 'A', 'L', 'A'],
    silabas: ['SA', 'LA'],
    emoji: '📺'
  },
  'SOFA': {
    escritura: 'SOFÁ',
    pronunciacion: 'Sofá',
    letras: ['S', 'O', 'F', 'A'],
    silabas: ['SO', 'FÁ'],
    emoji: 'assets/sofa.png'
  },
  'SOL': {
    escritura: 'SOL',
    pronunciacion: 'Sol',
    letras: ['S', 'O', 'L'],
    silabas: ['SOL'],
    emoji: 'assets/sol.png'
  },
  'SOPA': {
    escritura: 'SOPA',
    pronunciacion: 'Sopa',
    letras: ['S', 'O', 'P', 'A'],
    silabas: ['SO', 'PA'],
    emoji: 'assets/sopa.png'
  },
  'SOMBRERO': {
    escritura: 'SOMBRERO',
    pronunciacion: 'Sombrero',
    letras: ['S', 'O', 'M', 'B', 'R', 'E', 'R', 'O'],
    silabas: ['SOM', 'BRE', 'RO'],
    emoji: 'assets/sombrero.png'
  },
  'SODA': {
    escritura: 'SODA',
    pronunciacion: 'Soda',
    letras: ['S', 'O', 'D', 'A'],
    silabas: ['SO', 'DA'],
    emoji: 'assets/soda.png'
  },
  'SERPIENTE': {
    escritura: 'SERPIENTE',
    pronunciacion: 'Serpiente',
    letras: ['S', 'E', 'R', 'P', 'I', 'E', 'N', 'T', 'E'],
    silabas: ['SER', 'PIEN', 'TE'],
    emoji: 'assets/serpiente.png'
  },

  // Palabras con C
  'CASA': {
    escritura: 'CASA',
    pronunciacion: 'Casa',
    letras: ['C', 'A', 'S', 'A'],
    silabas: ['CA', 'SA'],
    emoji: 'assets/casa.png'
  },
  'CASITA': {
    escritura: 'CASITA',
    pronunciacion: 'Casita',
    letras: ['C', 'A', 'S', 'I', 'T', 'A'],
    silabas: ['CA', 'SI', 'TA'],
    emoji: 'assets/casita.png'
  },
  'CAMA': {
    escritura: 'CAMA',
    pronunciacion: 'Cama',
    letras: ['C', 'A', 'M', 'A'],
    silabas: ['CA', 'MA'],
    emoji: 'assets/cama.png'
  },
  'CAJA': {
    escritura: 'CAJA',
    pronunciacion: 'Caja',
    letras: ['C', 'A', 'J', 'A'],
    silabas: ['CA', 'JA'],
    emoji: 'assets/caja.png'
  },
  'CAJITA': {
    escritura: 'CAJITA',
    pronunciacion: 'Cajita',
    letras: ['C', 'A', 'J', 'I', 'T', 'A'],
    silabas: ['CA', 'JI', 'TA'],
    emoji: 'assets/cajita.png'
  },
  'CAJON': {
    escritura: 'CAJÓN',
    pronunciacion: 'Cajón',
    letras: ['C', 'A', 'J', 'O', 'N'],
    silabas: ['CA', 'JÓN'],
    emoji: 'assets/cajon.png'
  },
  'CAFE': {
    escritura: 'CAFÉ',
    pronunciacion: 'Café',
    letras: ['C', 'A', 'F', 'E'],
    silabas: ['CA', 'FÉ'],
    emoji: 'assets/cafe.png'
  },
  'CARAMELO': {
    escritura: 'CARAMELO',
    pronunciacion: 'Caramelo',
    letras: ['C', 'A', 'R', 'A', 'M', 'E', 'L', 'O'],
    silabas: ['CA', 'RA', 'ME', 'LO'],
    emoji: 'assets/caramelo.png'
  },
  'CABALLO': {
    escritura: 'CABALLO',
    pronunciacion: 'Caballo',
    letras: ['C', 'A', 'B', 'A', 'LL', 'O'],
    silabas: ['CA', 'BA', 'LLO'],
    emoji: 'assets/caballo.png'
  },
  'CABRA': {
    escritura: 'CABRA',
    pronunciacion: 'Cabra',
    letras: ['C', 'A', 'B', 'R', 'A'],
    silabas: ['CA', 'BRA'],
    emoji: 'assets/cabra.png'
  },
  'CAMINO': {
    escritura: 'CAMINO',
    pronunciacion: 'Camino',
    letras: ['C', 'A', 'M', 'I', 'N', 'O'],
    silabas: ['CA', 'MI', 'NO'],
    emoji: 'assets/camino.png'
  },
  'CENA': {
    escritura: 'CENA',
    pronunciacion: 'Cena',
    letras: ['C', 'E', 'N', 'A'],
    silabas: ['CE', 'NA'],
    emoji: 'assets/cena.png'
  },
  'CEBRA': {
    escritura: 'CEBRA',
    pronunciacion: 'Cebra',
    letras: ['C', 'E', 'B', 'R', 'A'],
    silabas: ['CE', 'BRA'],
    emoji: 'assets/cebra.png'
  },
  'CINE': {
    escritura: 'CINE',
    pronunciacion: 'Cine',
    letras: ['C', 'I', 'N', 'E'],
    silabas: ['CI', 'NE'],
    emoji: 'assets/cine.png'
  },
  'CIGUENA': {
    escritura: 'CIGÜEÑA',
    pronunciacion: 'Cigüeña',
    letras: ['C', 'I', 'G', 'U', 'E', 'Ñ', 'A'],
    silabas: ['CI', 'GÜE', 'ÑA'],
    emoji: 'assets/ciguena.png'
  },
  'COPA': {
    escritura: 'COPA',
    pronunciacion: 'Copa',
    letras: ['C', 'O', 'P', 'A'],
    silabas: ['CO', 'PA'],
    emoji: 'assets/copa.png'
  },
  'COPITA': {
    escritura: 'COPITA',
    pronunciacion: 'Copita',
    letras: ['C', 'O', 'P', 'I', 'T', 'A'],
    silabas: ['CO', 'PI', 'TA'],
    emoji: 'assets/copita.png'
  },
  'COCO': {
    escritura: 'COCO',
    pronunciacion: 'Coco',
    letras: ['C', 'O', 'C', 'O'],
    silabas: ['CO', 'CO'],
    emoji: 'assets/coco.png'
  },
  'COCHE': {
    escritura: 'COCHE',
    pronunciacion: 'Coche',
    letras: ['C', 'O', 'CH', 'E'],
    silabas: ['CO', 'CHE'],
    emoji: 'assets/coche_bebe.png'
  },
  'COHETE': {
    escritura: 'COHETE',
    pronunciacion: 'Cohete',
    letras: ['C', 'O', 'H', 'E', 'T', 'E'],
    silabas: ['CO', 'HE', 'TE'],
    emoji: 'assets/cohete.png'
  },
  'CORAZON': {
    escritura: 'CORAZÓN',
    pronunciacion: 'Corazón',
    letras: ['C', 'O', 'R', 'A', 'Z', 'O', 'N'],
    silabas: ['CO', 'RA', 'ZÓN'],
    emoji: 'assets/corazon.png'
  },
  'CUENTO': {
    escritura: 'CUENTO',
    pronunciacion: 'Cuento',
    letras: ['C', 'U', 'E', 'N', 'T', 'O'],
    silabas: ['CUEN', 'TO'],
    emoji: 'assets/cuento.png'
  },
  'CUNA': {
    escritura: 'CUNA',
    pronunciacion: 'Cuna',
    letras: ['C', 'U', 'N', 'A'],
    silabas: ['CU', 'NA'],
    emoji: 'assets/cuna.png'
  },
  'CUCHARA': {
    escritura: 'CUCHARA',
    pronunciacion: 'Cuchara',
    letras: ['C', 'U', 'CH', 'A', 'R', 'A'],
    silabas: ['CU', 'CHA', 'RA'],
    emoji: 'assets/cuchara.png'
  },
  'CUCHILLO': {
    escritura: 'CUCHILLO',
    pronunciacion: 'Cuchillo',
    letras: ['C', 'U', 'CH', 'I', 'LL', 'O'],
    silabas: ['CU', 'CHI', 'LLO'],
    emoji: 'assets/cuchillo.png'
  },

  // Palabras con T
  'TAZA': {
    escritura: 'TAZA',
    pronunciacion: 'Taza',
    letras: ['T', 'A', 'Z', 'A'],
    silabas: ['TA', 'ZA'],
    emoji: 'assets/taza.png'
  },
  'TAPA': {
    escritura: 'TAPA',
    pronunciacion: 'Tapa',
    letras: ['T', 'A', 'P', 'A'],
    silabas: ['TA', 'PA'],
    emoji: '📦'
  },
  'TELA': {
    escritura: 'TELA',
    pronunciacion: 'Tela',
    letras: ['T', 'E', 'L', 'A'],
    silabas: ['TE', 'LA'],
    emoji: 'assets/tela.png'
  },
  'TECHO': {
    escritura: 'TECHO',
    pronunciacion: 'Techo',
    letras: ['T', 'E', 'CH', 'O'],
    silabas: ['TE', 'CHO'],
    emoji: 'assets/techo.png'
  },
  'TELEFONO': {
    escritura: 'TELÉFONO',
    pronunciacion: 'Teléfono',
    letras: ['T', 'E', 'L', 'E', 'F', 'O', 'N', 'O'],
    silabas: ['TE', 'LÉ', 'FO', 'NO'],
    emoji: 'assets/telefono.png'
  },
  'TENEDOR': {
    escritura: 'TENEDOR',
    pronunciacion: 'Tenedor',
    letras: ['T', 'E', 'N', 'E', 'D', 'O', 'R'],
    silabas: ['TE', 'NE', 'DOR'],
    emoji: 'assets/tenedor.png'
  },
  'TIJERA': {
    escritura: 'TIJERA',
    pronunciacion: 'Tijera',
    letras: ['T', 'I', 'J', 'E', 'R', 'A'],
    silabas: ['TI', 'JE', 'RA'],
    emoji: 'assets/tijera.png'
  },
  'TITERE': {
    escritura: 'TÍTERE',
    pronunciacion: 'Títere',
    letras: ['T', 'I', 'T', 'E', 'R', 'E'],
    silabas: ['TÍ', 'TE', 'RE'],
    emoji: 'assets/titere.png'
  },
  'TOPO': {
    escritura: 'TOPO',
    pronunciacion: 'Topo',
    letras: ['T', 'O', 'P', 'O'],
    silabas: ['TO', 'PO'],
    emoji: 'assets/topo.png'
  },
  'TOBOGAN': {
    escritura: 'TOBOGÁN',
    pronunciacion: 'Tobogán',
    letras: ['T', 'O', 'B', 'O', 'G', 'A', 'N'],
    silabas: ['TO', 'BO', 'GÁN'],
    emoji: 'assets/tobogan.png'
  },
  'TORTUGA': {
    escritura: 'TORTUGA',
    pronunciacion: 'Tortuga',
    letras: ['T', 'O', 'R', 'T', 'U', 'G', 'A'],
    silabas: ['TOR', 'TU', 'GA'],
    emoji: 'assets/tortuga.png'
  },
  'TUNEL': {
    escritura: 'TÚNEL',
    pronunciacion: 'Túnel',
    letras: ['T', 'U', 'N', 'E', 'L'],
    silabas: ['TÚ', 'NEL'],
    emoji: 'assets/tunel.png'
  },
  'TREN': {
    escritura: 'TREN',
    pronunciacion: 'Tren',
    letras: ['T', 'R', 'E', 'N'],
    silabas: ['TREN'],
    emoji: 'assets/tren.png'
  },

  // Palabras con B y V
  'BARCO': {
    escritura: 'BARCO',
    pronunciacion: 'Barco',
    letras: ['B', 'A', 'R', 'C', 'O'],
    silabas: ['BAR', 'CO'],
    emoji: 'assets/barco.png'
  },
  'BANANA': {
    escritura: 'BANANA',
    pronunciacion: 'Banana',
    letras: ['B', 'A', 'N', 'A', 'N', 'A'],
    silabas: ['BA', 'NA', 'NA'],
    emoji: 'assets/banana.png'
  },
  'BASTON': {
    escritura: 'BASTÓN',
    pronunciacion: 'Bastón',
    letras: ['B', 'A', 'S', 'T', 'O', 'N'],
    silabas: ['BAS', 'TÓN'],
    emoji: 'assets/baston.png'
  },
  'BARRIL': {
    escritura: 'BARRIL',
    pronunciacion: 'Barril',
    letras: ['B', 'A', 'RR', 'I', 'L'],
    silabas: ['BA', 'RRIL'],
    emoji: 'assets/barril.png'
  },
  'BEBE': {
    escritura: 'BEBÉ',
    pronunciacion: 'Bebé',
    letras: ['B', 'E', 'B', 'E'],
    silabas: ['BE', 'BÉ'],
    emoji: 'assets/bebe.png'
  },
  'BIBERON': {
    escritura: 'BIBERÓN',
    pronunciacion: 'Biberón',
    letras: ['B', 'I', 'B', 'E', 'R', 'O', 'N'],
    silabas: ['BI', 'BE', 'RÓN'],
    emoji: 'assets/biberon.png'
  },
  'BICI': {
    escritura: 'BICI',
    pronunciacion: 'Bici',
    letras: ['B', 'I', 'C', 'I'],
    silabas: ['BI', 'CI'],
    emoji: 'assets/bicicleta.png'
  },
  'BICICLETA': {
    escritura: 'BICICLETA',
    pronunciacion: 'Bicicleta',
    letras: ['B', 'I', 'C', 'I', 'C', 'L', 'E', 'T', 'A'],
    silabas: ['BI', 'CI', 'CLE', 'TA'],
    emoji: 'assets/bicicleta.png'
  },
  'BOTA': {
    escritura: 'BOTA',
    pronunciacion: 'Bota',
    letras: ['B', 'O', 'T', 'A'],
    silabas: ['BO', 'TA'],
    emoji: 'assets/bota.png'
  },
  'BOTON': {
    escritura: 'BOTÓN',
    pronunciacion: 'Botón',
    letras: ['B', 'O', 'T', 'O', 'N'],
    silabas: ['BO', 'TÓN'],
    emoji: 'assets/boton.png'
  },
  'BOCA': {
    escritura: 'BOCA',
    pronunciacion: 'Boca',
    letras: ['B', 'O', 'C', 'A'],
    silabas: ['BO', 'CA'],
    emoji: 'assets/boca.png'
  },
  'BOSQUE': {
    escritura: 'BOSQUE',
    pronunciacion: 'Bosque',
    letras: ['B', 'O', 'S', 'Q', 'U', 'E'],
    silabas: ['BOS', 'QUE'],
    emoji: 'assets/bosque.png'
  },
  'BUHO': {
    escritura: 'BÚHO',
    pronunciacion: 'Búho',
    letras: ['B', 'U', 'H', 'O'],
    silabas: ['BÚ', 'HO'],
    emoji: 'assets/buho.png'
  },
  'BLANCO': {
    escritura: 'BLANCO',
    pronunciacion: 'Blanco',
    letras: ['B', 'L', 'A', 'N', 'C', 'O'],
    silabas: ['BLAN', 'CO'],
    emoji: 'assets/blanco.png'
  },
  'BLUEY': {
    escritura: 'BLUEY',
    pronunciacion: 'Bluey',
    letras: ['B', 'L', 'U', 'E', 'Y'],
    silabas: ['BLU', 'EY'],
    emoji: 'assets/bluey.png'
  },
  'VACA': {
    escritura: 'VACA',
    pronunciacion: 'Vaca',
    letras: ['V', 'A', 'C', 'A'],
    silabas: ['VA', 'CA'],
    emoji: '🐮'
  },
  'VALIJA': {
    escritura: 'VALIJA',
    pronunciacion: 'Valija',
    letras: ['V', 'A', 'L', 'I', 'J', 'A'],
    silabas: ['VA', 'LI', 'JA'],
    emoji: 'assets/valija.png'
  },
  'VERDE': {
    escritura: 'VERDE',
    pronunciacion: 'Verde',
    letras: ['V', 'E', 'R', 'D', 'E'],
    silabas: ['VER', 'DE'],
    emoji: 'assets/verde.png'
  },
  'VELA': {
    escritura: 'VELA',
    pronunciacion: 'Vela',
    letras: ['V', 'E', 'L', 'A'],
    silabas: ['VE', 'LA'],
    emoji: 'assets/vela.png'
  },
  'VENTANA': {
    escritura: 'VENTANA',
    pronunciacion: 'Ventana',
    letras: ['V', 'E', 'N', 'T', 'A', 'N', 'A'],
    silabas: ['VEN', 'TA', 'NA'],
    emoji: 'assets/ventana.png'
  },
  'VESTIDO': {
    escritura: 'VESTIDO',
    pronunciacion: 'Vestido',
    letras: ['V', 'E', 'S', 'T', 'I', 'D', 'O'],
    silabas: ['VES', 'TI', 'DO'],
    emoji: 'assets/vestido.png'
  },
  'VIOLETA': {
    escritura: 'VIOLETA',
    pronunciacion: 'Violeta',
    letras: ['V', 'I', 'O', 'L', 'E', 'T', 'A'],
    silabas: ['VIO', 'LE', 'TA'],
    emoji: 'assets/violeta.png'
  },

  // Palabras con D
  'DADO': {
    escritura: 'DADO',
    pronunciacion: 'Dado',
    letras: ['D', 'A', 'D', 'O'],
    silabas: ['DA', 'DO'],
    emoji: 'assets/dado.png'
  },
  'DEDO': {
    escritura: 'DEDO',
    pronunciacion: 'Dedo',
    letras: ['D', 'E', 'D', 'O'],
    silabas: ['DE', 'DO'],
    emoji: 'assets/dedo.png'
  },
  'DEDAL': {
    escritura: 'DEDAL',
    pronunciacion: 'Dedal',
    letras: ['D', 'E', 'D', 'A', 'L'],
    silabas: ['DE', 'DAL'],
    emoji: 'assets/dedal.png'
  },
  'DELFIN': {
    escritura: 'DELFÍN',
    pronunciacion: 'Delfín',
    letras: ['D', 'E', 'L', 'F', 'I', 'N'],
    silabas: ['DEL', 'FÍN'],
    emoji: 'assets/delfin.png'
  },
  'DRAGON': {
    escritura: 'DRAGÓN',
    pronunciacion: 'Dragón',
    letras: ['D', 'R', 'A', 'G', 'O', 'N'],
    silabas: ['DRA', 'GÓN'],
    emoji: 'assets/dragon.png'
  },
  'DUENDE': {
    escritura: 'DUENDE',
    pronunciacion: 'Duende',
    letras: ['D', 'U', 'E', 'N', 'D', 'E'],
    silabas: ['DUEN', 'DE'],
    emoji: 'assets/duende.png'
  },
  'DOCTOR': {
    escritura: 'DOCTOR',
    pronunciacion: 'Doctor',
    letras: ['D', 'O', 'C', 'T', 'O', 'R'],
    silabas: ['DOC', 'TOR'],
    emoji: 'assets/doctor.png'
  },

  // Palabras con F
  'FARO': {
    escritura: 'FARO',
    pronunciacion: 'Faro',
    letras: ['F', 'A', 'R', 'O'],
    silabas: ['FA', 'RO'],
    emoji: 'assets/faro.png'
  },
  'FANTASMA': {
    escritura: 'FANTASMA',
    pronunciacion: 'Fantasma',
    letras: ['F', 'A', 'N', 'T', 'A', 'S', 'M', 'A'],
    silabas: ['FAN', 'TAS', 'MA'],
    emoji: 'assets/fantasma.png'
  },
  'FARMACIA': {
    escritura: 'FARMACIA',
    pronunciacion: 'Farmacia',
    letras: ['F', 'A', 'R', 'M', 'A', 'C', 'I', 'A'],
    silabas: ['FAR', 'MA', 'CIA'],
    emoji: 'assets/farmacia.png'
  },
  'FELINO': {
    escritura: 'FELINO',
    pronunciacion: 'Felino',
    letras: ['F', 'E', 'L', 'I', 'N', 'O'],
    silabas: ['FE', 'LI', 'NO'],
    emoji: '🐅'
  },
  'FICHA': {
    escritura: 'FICHA',
    pronunciacion: 'Ficha',
    letras: ['F', 'I', 'CH', 'A'],
    silabas: ['FI', 'CHA'],
    emoji: 'assets/ficha.png'
  },
  'FIDEO': {
    escritura: 'FIDEO',
    pronunciacion: 'Fideo',
    letras: ['F', 'I', 'D', 'E', 'O'],
    silabas: ['FI', 'DE', 'O'],
    emoji: 'assets/fideo.png'
  },
  'FIDEOS': {
    escritura: 'FIDEOS',
    pronunciacion: 'Fideos',
    letras: ['F', 'I', 'D', 'E', 'O', 'S'],
    silabas: ['FI', 'DE', 'OS'],
    emoji: 'assets/fideo.png'
  },
  'FOTO': {
    escritura: 'FOTO',
    pronunciacion: 'Foto',
    letras: ['F', 'O', 'T', 'O'],
    silabas: ['FO', 'TO'],
    emoji: 'assets/foto.png'
  },
  'FOCA': {
    escritura: 'FOCA',
    pronunciacion: 'Foca',
    letras: ['F', 'O', 'C', 'A'],
    silabas: ['FO', 'CA'],
    emoji: 'assets/foca.png'
  },
  'FUEGO': {
    escritura: 'FUEGO',
    pronunciacion: 'Fuego',
    letras: ['F', 'U', 'E', 'G', 'O'],
    silabas: ['FUE', 'GO'],
    emoji: 'assets/fuego.png'
  },
  'FUENTE': {
    escritura: 'FUENTE',
    pronunciacion: 'Fuente',
    letras: ['F', 'U', 'E', 'N', 'T', 'E'],
    silabas: ['FUEN', 'TE'],
    emoji: 'assets/fuente.png'
  },
  'FLOR': {
    escritura: 'FLOR',
    pronunciacion: 'Flor',
    letras: ['F', 'L', 'O', 'R'],
    silabas: ['FLOR'],
    emoji: 'assets/flor.png'
  },

  // Palabras con G
  'GATO': {
    escritura: 'GATO',
    pronunciacion: 'Gato',
    letras: ['G', 'A', 'T', 'O'],
    silabas: ['GA', 'TO'],
    emoji: 'assets/gato.png'
  },
  'GALLINA': {
    escritura: 'GALLINA',
    pronunciacion: 'Gallina',
    letras: ['G', 'A', 'LL', 'I', 'N', 'A'],
    silabas: ['GA', 'LLI', 'NA'],
    emoji: 'assets/gallina.png'
  },
  'GLOBO': {
    escritura: 'GLOBO',
    pronunciacion: 'Globo',
    letras: ['G', 'L', 'O', 'B', 'O'],
    silabas: ['GLO', 'BO'],
    emoji: 'assets/globo.png'
  },
  'GORRA': {
    escritura: 'GORRA',
    pronunciacion: 'Gorra',
    letras: ['G', 'O', 'RR', 'A'],
    silabas: ['GO', 'RRA'],
    emoji: 'assets/gorro.png'
  },
  'GORRO': {
    escritura: 'GORRO',
    pronunciacion: 'Gorro',
    letras: ['G', 'O', 'RR', 'O'],
    silabas: ['GO', 'RRO'],
    emoji: 'assets/gorro.png'
  },
  'GOMA': {
    escritura: 'GOMA',
    pronunciacion: 'Goma',
    letras: ['G', 'O', 'M', 'A'],
    silabas: ['GO', 'MA'],
    emoji: 'assets/goma.png'
  },
  'GORILA': {
    escritura: 'GORILA',
    pronunciacion: 'Gorila',
    letras: ['G', 'O', 'R', 'I', 'L', 'A'],
    silabas: ['GO', 'RI', 'LA'],
    emoji: 'assets/gorila.png'
  },
  'GUANTE': {
    escritura: 'GUANTE',
    pronunciacion: 'Guante',
    letras: ['G', 'U', 'A', 'N', 'T', 'E'],
    silabas: ['GUAN', 'TE'],
    emoji: 'assets/guante.png'
  },
  'GUITARRA': {
    escritura: 'GUITARRA',
    pronunciacion: 'Guitarra',
    letras: ['G', 'U', 'I', 'T', 'A', 'RR', 'A'],
    silabas: ['GUI', 'TA', 'RRA'],
    emoji: 'assets/guitarra.png'
  },

  // Palabras con R / RR
  'RANA': {
    escritura: 'RANA',
    pronunciacion: 'Rana',
    letras: ['R', 'A', 'N', 'A'],
    silabas: ['RA', 'NA'],
    emoji: '🐸'
  },
  'RATON': {
    escritura: 'RATÓN',
    pronunciacion: 'Ratón',
    letras: ['R', 'A', 'T', 'O', 'N'],
    silabas: ['RA', 'TÓN'],
    emoji: 'assets/raton.png'
  },
  'RELOJ': {
    escritura: 'RELOJ',
    pronunciacion: 'Reloj',
    letras: ['R', 'E', 'L', 'O', 'J'],
    silabas: ['RE', 'LOJ'],
    emoji: 'assets/reloj.png'
  },
  'REGALO': {
    escritura: 'REGALO',
    pronunciacion: 'Regalo',
    letras: ['R', 'E', 'G', 'A', 'L', 'O'],
    silabas: ['RE', 'GA', 'LO'],
    emoji: 'assets/regalo.png'
  },
  'RIFA': {
    escritura: 'RIFA',
    pronunciacion: 'Rifa',
    letras: ['R', 'I', 'F', 'A'],
    silabas: ['RI', 'FA'],
    emoji: 'assets/rifa.png'
  },
  'ROJO': {
    escritura: 'ROJO',
    pronunciacion: 'Rojo',
    letras: ['R', 'O', 'J', 'O'],
    silabas: ['RO', 'JO'],
    emoji: 'assets/rojo.png'
  },
  'ROSA': {
    escritura: 'ROSA',
    pronunciacion: 'Rosa',
    letras: ['R', 'O', 'S', 'A'],
    silabas: ['RO', 'SA'],
    emoji: 'assets/rosa.png'
  },

  // Otras palabras comunes
  'ZAPATO': {
    escritura: 'ZAPATO',
    pronunciacion: 'Zapato',
    letras: ['Z', 'A', 'P', 'A', 'T', 'O'],
    silabas: ['ZA', 'PA', 'TO'],
    emoji: 'assets/zapato.png'
  },
  'ZAPATILLA': {
    escritura: 'ZAPATILLA',
    pronunciacion: 'Zapatilla',
    letras: ['Z', 'A', 'P', 'A', 'T', 'I', 'LL', 'A'],
    silabas: ['ZA', 'PA', 'TI', 'LLA'],
    emoji: 'assets/zapatilla.png'
  },
  'ZORRO': {
    escritura: 'ZORRO',
    pronunciacion: 'Zorro',
    letras: ['Z', 'O', 'RR', 'O'],
    silabas: ['ZO', 'RRO'],
    emoji: 'assets/zorro.png'
  },
  'AGUA': {
    escritura: 'AGUA',
    pronunciacion: 'Agua',
    letras: ['A', 'G', 'U', 'A'],
    silabas: ['A', 'GUA'],
    emoji: 'assets/agua.png'
  },
  'ARBOL': {
    escritura: 'ÁRBOL',
    pronunciacion: 'Árbol',
    letras: ['A', 'R', 'B', 'O', 'L'],
    silabas: ['ÁR', 'BOL'],
    emoji: 'assets/arbol.png'
  },
  'AGUILA': {
    escritura: 'ÁGUILA',
    pronunciacion: 'Águila',
    letras: ['A', 'G', 'U', 'I', 'L', 'A'],
    silabas: ['Á', 'GUI', 'LA'],
    emoji: 'assets/aguila.png'
  },
  'ALGODON': {
    escritura: 'ALGODÓN',
    pronunciacion: 'Algodón',
    letras: ['A', 'L', 'G', 'O', 'D', 'O', 'N'],
    silabas: ['AL', 'GO', 'DÓN'],
    emoji: 'assets/algodon.png'
  },
  'AUTO': {
    escritura: 'AUTO',
    pronunciacion: 'Auto',
    letras: ['A', 'U', 'T', 'O'],
    silabas: ['AU', 'TO'],
    emoji: 'assets/auto.png'
  },
  'AZUL': {
    escritura: 'AZUL',
    pronunciacion: 'Azul',
    letras: ['A', 'Z', 'U', 'L'],
    silabas: ['A', 'ZUL'],
    emoji: 'assets/azul.png'
  },
  'AMARILLO': {
    escritura: 'AMARILLO',
    pronunciacion: 'Amarillo',
    letras: ['A', 'M', 'A', 'R', 'I', 'LL', 'O'],
    silabas: ['A', 'MA', 'RI', 'LLO'],
    emoji: 'assets/amarillo.png'
  },
  'ABUELO': {
    escritura: 'ABUELO',
    pronunciacion: 'Abuelo',
    letras: ['A', 'B', 'U', 'E', 'L', 'O'],
    silabas: ['A', 'BUE', 'LO'],
    emoji: 'assets/abuelo.png'
  },
  'ABUELA': {
    escritura: 'ABUELA',
    pronunciacion: 'Abuela',
    letras: ['A', 'B', 'U', 'E', 'L', 'A'],
    silabas: ['A', 'BUE', 'LA'],
    emoji: 'assets/abuela.png'
  },
  'ELEFANTE': {
    escritura: 'ELEFANTE',
    pronunciacion: 'Elefante',
    letras: ['E', 'L', 'E', 'F', 'A', 'N', 'T', 'E'],
    silabas: ['E', 'LE', 'FAN', 'TE'],
    emoji: 'assets/elefante.png'
  },
  'ESTRELLA': {
    escritura: 'ESTRELLA',
    pronunciacion: 'Estrella',
    letras: ['E', 'S', 'T', 'R', 'E', 'LL', 'A'],
    silabas: ['ES', 'TRE', 'LLA'],
    emoji: 'assets/estrella.png'
  },
  'HELADO': {
    escritura: 'HELADO',
    pronunciacion: 'Helado',
    letras: ['H', 'E', 'L', 'A', 'D', 'O'],
    silabas: ['HE', 'LA', 'DO'],
    emoji: 'assets/helado.png'
  },
  'HOJA': {
    escritura: 'HOJA',
    pronunciacion: 'Hoja',
    letras: ['H', 'O', 'J', 'A'],
    silabas: ['HO', 'JA'],
    emoji: 'assets/hoja.png'
  },
  'OSO': {
    escritura: 'OSO',
    pronunciacion: 'Oso',
    letras: ['O', 'S', 'O'],
    silabas: ['O', 'SO'],
    emoji: 'assets/oso.png'
  },
  'OVEJA': {
    escritura: 'OVEJA',
    pronunciacion: 'Oveja',
    letras: ['O', 'V', 'E', 'J', 'A'],
    silabas: ['O', 'VE', 'JA'],
    emoji: 'assets/oveja.png'
  }
};

// =========================================================================
// FUNCIONES DE CONSULTA Y CUALIDADES CANÓNICAS
// =========================================================================

function getCanonicalWord(wordOrId) {
  if (!wordOrId) return null;
  const cleanRaw = wordOrId.toString().trim();
  const normId = (typeof removeAccents === 'function') ? removeAccents(cleanRaw).toUpperCase() : cleanRaw.toUpperCase();
  
  // Revisar si el terapeuta / usuario personalizó esta palabra en el Gestor de Cualidades
  let customOverrides = {};
  try {
    const saved = localStorage.getItem('crin_lexicon_overrides');
    if (saved) customOverrides = JSON.parse(saved);
  } catch(e) {}

  const baseItem = (typeof CANONICAL_WORD_LEXICON !== 'undefined' && CANONICAL_WORD_LEXICON[normId]) ? CANONICAL_WORD_LEXICON[normId] : null;
  const overrideItem = customOverrides[normId] || null;

  if (baseItem || overrideItem) {
    const merged = Object.assign({}, baseItem || {}, overrideItem || {});
    let currentEmoji = merged.emoji;
    if (typeof getEmojiForWord === 'function') {
      const em = getEmojiForWord(merged.escritura || cleanRaw);
      if (em && em !== '⭐') currentEmoji = em;
    }
    return {
      id: normId,
      escritura: merged.escritura || cleanRaw,
      pronunciacion: merged.pronunciacion || merged.escritura || cleanRaw,
      letras: merged.letras ? [...merged.letras] : (typeof getWordLetterTokens === 'function' ? getWordLetterTokens(merged.escritura || cleanRaw) : (merged.escritura || cleanRaw).split('')),
      silabas: merged.silabas ? [...merged.silabas] : (typeof splitSpanishSyllables === 'function' ? splitSpanishSyllables(merged.escritura || cleanRaw) : [merged.escritura || cleanRaw]),
      emoji: currentEmoji,
      isCustomOverride: !!overrideItem
    };
  }
  return buildCanonicalWordEntry(cleanRaw);
}

function saveCanonicalWordOverride(wordOrId, updates) {
  if (!wordOrId || !updates) return;
  const normId = (typeof removeAccents === 'function') ? removeAccents(wordOrId.toString().trim()).toUpperCase() : wordOrId.toString().trim().toUpperCase();
  let overrides = {};
  try {
    overrides = JSON.parse(localStorage.getItem('crin_lexicon_overrides') || '{}');
  } catch(e) {}
  overrides[normId] = Object.assign({}, overrides[normId] || {}, updates);
  localStorage.setItem('crin_lexicon_overrides', JSON.stringify(overrides));
  if (typeof updateGameDatasetsFromCanonical === 'function') updateGameDatasetsFromCanonical();
  return overrides[normId];
}

function resetCanonicalWordOverride(wordOrId) {
  if (!wordOrId) return;
  const normId = (typeof removeAccents === 'function') ? removeAccents(wordOrId.toString().trim()).toUpperCase() : wordOrId.toString().trim().toUpperCase();
  let overrides = {};
  try {
    overrides = JSON.parse(localStorage.getItem('crin_lexicon_overrides') || '{}');
  } catch(e) {}
  if (overrides[normId]) {
    delete overrides[normId];
    localStorage.setItem('crin_lexicon_overrides', JSON.stringify(overrides));
  }
  if (typeof updateGameDatasetsFromCanonical === 'function') updateGameDatasetsFromCanonical();
}

function buildCanonicalWordEntry(rawWord) {
  const clean = (rawWord || '').toString().trim().toUpperCase();
  const tokens = (typeof getWordLetterTokens === 'function') ? getWordLetterTokens(clean) : clean.split('');
  const syllables = (typeof splitSpanishSyllables === 'function') ? splitSpanishSyllables(clean) : [clean];
  let emojiVal = '⭐';
  if (typeof getEmojiForWord === 'function') {
    emojiVal = getEmojiForWord(clean);
  }
  const pron = clean ? (clean.charAt(0) + clean.slice(1).toLowerCase()) : '';
  return {
    escritura: clean,
    pronunciacion: pron,
    letras: tokens,
    silabas: syllables,
    emoji: emojiVal
  };
}
