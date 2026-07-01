/* ==========================================================================
   RACO TERMINAL — script.js
   Lógica de la consola: encendido, escritura tipo máquina, navegación por
   comandos (BASES / PROGRAMA / POSTULAR), efectos de sonido y ruido CRT.
   Sin frameworks. JavaScript nativo (vanilla).
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. CONTENIDO DE LA CONVOCATORIA
     ------------------------------------------------------------------------ */

  var BASES_TEXT = [
    '2DO ENCUENTRO RACO 2026',
    'ARTE Y COMUNIDADES PARA LA INNOVACIÓN Y DIÁLOGO SOCIO-CULTURAL',
    '',
    'Martes 27 al viernes 30 de octubre',
    '',
    'Sedes:',
    '- Biblioteca Nicanor Parra UDP',
    '- Centro Cultural La Moneda',
    '- Centro Cultural de España',
    '',
    '====================================',
    '',
    'PARTICIPACIÓN Y CONDICIONES PARA LOS ARTISTAS',
    '',
    'A) Dirigido a artistas de todo el país, chilenos o extranjeros con residencia en Chile, con formación académica o trayectoria autodidacta, cuyas prácticas desarrollen metodologías colaborativas, participativas y de trabajo situado junto a comunidades. La convocatoria está orientada a creadores provenientes de distintas disciplinas y cruces contemporáneos, tales como performance, artes visuales, nuevos medios, música y fotografía y otras formas de creación vinculadas a contextos sociales, culturales y territoriales.',
    '',
    'B) En el caso de colectivos, la postulación deberá realizarse a través de un representante, quien será la persona encargada de participar en las actividades.',
    '',
    'C) Cada artista seleccionado recibirá honorarios de $200.000 (monto bruto) por su participación.',
    '',
    'D) Para quienes residan fuera de la región Metropolitana, se cubrirán los costos de pasajes y alojamiento. Además, todos los participantes contarán con alimentación durante las actividades presenciales.',
    '',
    'E) Para postular, te pediremos compartir un portafolio digital con hasta 3 proyectos vinculados a trabajo colaborativo y/o comunitario. Cada proyecto puede incluir imágenes y/o videos y/o audios, además de textos breves si fuese necesario.',
    '',
    'En caso de ser seleccionado/a, contarás con un máximo de 20 minutos en tiempo real para presentar tu portafolio durante la instancia de visionado frente a invitados/as y participantes del encuentro.',
    '',
    'Es importante considerar que el mismo portafolio enviado en la postulación será el material utilizado posteriormente en la presentación pública del visionado, por lo que recomendamos prepararlo desde ya pensando en la exposición.',
    '',
    'F) En caso de ser seleccionado/a, solicitaremos la firma de una carta de autorización de uso de imagen y material audiovisual, la cual permitirá utilizar registros vinculados a tu postulación, participación y portafolio para fines de difusión, comunicación y archivo del encuentro, tanto en formatos impresos como digitales, en actividades asociadas al proyecto y futuras instancias de difusión.',
    '',
    '====================================',
    '',
    'FIN DE TRANSMISIÓN.'
  ].join('\n');

  var PROGRAMA_TEXT = [
    '2DO ENCUENTRO RACO 2026',
    'ARTE Y COMUNIDADES PARA LA INNOVACIÓN Y DIÁLOGO SOCIO-CULTURAL',
    '',
    'Fecha: martes 27 al viernes 30 de octubre',
    'Lugar: Biblioteca Nicanor Parra UDP, Centro Cultural La Moneda y Centro Cultural de España',
    '',
    '====================================',
    '',
    'DÍA 1 — MARTES 27 DE OCTUBRE',
    'Conferencia abierta al público e inauguración',
    'Sede: Biblioteca Nicanor Parra UDP (Auditorio, 260 personas)',
    '',
    '16:00 — Presentación Encuentro RACO',
    '16:30 — Denise Elphick, Directora Museo Violeta Parra',
    '17:00 — Nicolas Bourriaud, Escritor y Curador de arte contemporáneo',
    '18:00 — Espacio de preguntas del público',
    '18:30 a 20:00 — Inauguración del encuentro',
    '',
    '------------------------------------',
    '',
    'DÍAS 2 y 3 — MIÉRCOLES 28 Y JUEVES 29',
    'Visionado de portafolios',
    'Sede: Centro Cultural La Moneda',
    '',
    'Equipo visionador:',
    '- Nathalie Goffard, ensayista, investigadora y curadora especializada en arte contemporáneo y fotografía.',
    '- Loreto González Barra, curadora independiente, investigadora enfocada en procesos artísticos vinculados a metodologías creativas, colaborativas y arte-contexto.',
    '- Nicolas Bourriaud selecciona 3 portafolios.',
    '',
    '10:00 a 13:30 — Sesión AM',
    '13:30 a 15:00 — Almuerzo',
    '15:00 a 18:00 — Sesión PM',
    '',
    '------------------------------------',
    '',
    'DÍA 4 — VIERNES 30 DE OCTUBRE',
    'Workshop de co-diseño',
    'Sede: Centro Cultural de España',
    '',
    'Mesas de trabajo orientadas al diseño de soluciones frente a problemáticas territoriales, desarrolladas entre los artistas y representantes municipales, DIDECO y/o encargados culturales y organizaciones vecinales.',
    '',
    'Comunas participantes: Monte Patria, La Reina, San Vicente de Tagua Tagua y Quemchi.',
    '',
    '10:00 a 14:00 — Sesión AM',
    '14:00 a 15:00 — Almuerzo',
    '15:00 a 18:00 — Sesión PM',
    '18:00 a 20:00 — Plenario y cierre',
    '',
    '====================================',
    '',
    'FIN DE TRANSMISIÓN.'
  ].join('\n');

  /* ------------------------------------------------------------------------
     2. REFERENCIAS AL DOM
     ------------------------------------------------------------------------ */

  var consoleEl = document.getElementById('console');
  var screenEl = document.getElementById('screen');
  var outputEl = document.getElementById('terminal-output');
  var btnBases = document.getElementById('btn-bases');
  var btnPrograma = document.getElementById('btn-programa');
  var btnPostular = document.getElementById('btn-postular');

  /* ------------------------------------------------------------------------
     3. ESTADO INTERNO
     ------------------------------------------------------------------------ */

  var terminalBuffer = '';   // texto ya impreso en pantalla (permanente)
  var typeGeneration = 0;    // token para poder cancelar una escritura en curso
  var audioCtx = null;       // contexto de audio, creado tras la 1ª interacción
  var soundEnabled = true;

  /* ------------------------------------------------------------------------
     4. UTILIDADES
     ------------------------------------------------------------------------ */

  /** Espera N milisegundos (Promise). */
  function wait(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  /** Devuelve un retardo aleatorio alrededor de una velocidad base,
   *  para que la escritura "tipo máquina" no sea perfectamente uniforme. */
  function randomSpeed(base) {
    var jitter = base * 0.6;
    return base + (Math.random() * jitter - jitter / 2);
  }

  /** Escapa caracteres especiales de HTML para volcarlos de forma segura
   *  dentro de innerHTML (el cursor se agrega aparte como nodo real). */
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ------------------------------------------------------------------------
     5. RENDERIZADO DE PANTALLA
     ------------------------------------------------------------------------ */

  /** Vuelca el buffer actual a la pantalla, con el cursor parpadeante
   *  al final, y mantiene el scroll pegado al último renglón. */
  function renderScreen() {
    outputEl.innerHTML = escapeHtml(terminalBuffer) + '<span class="cursor">█</span>';
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  /** Limpia la pantalla del terminal y vuelve al tamaño de letra normal
   *  (por si la pantalla anterior quedó en modo "mensaje grande"). */
  function clearScreen() {
    terminalBuffer = '';
    outputEl.classList.remove('is-big');
    renderScreen();
  }

  /* ------------------------------------------------------------------------
     6. SONIDO DE TECLADO (Web Audio API, sin archivos externos)
     ------------------------------------------------------------------------ */

  /** Crea el AudioContext en el primer gesto del usuario (requisito de los
   *  navegadores). Si no está disponible, el terminal sigue funcionando
   *  igual, simplemente en silencio. */
  function ensureAudio() {
    if (audioCtx || !soundEnabled) { return; }
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) { audioCtx = new Ctx(); }
    } catch (err) {
      soundEnabled = false;
    }
  }

  /** Sonido grave de palanca/switch, usado al presionar botones.
   *  (La escritura letra por letra es muda a pedido: sin clic de tecleo.) */
  function playSwitchSound() {
    if (!soundEnabled || !audioCtx) { return; }
    try {
      var now = audioCtx.currentTime;
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (err) {
      /* silencioso */
    }
  }

  /* ------------------------------------------------------------------------
     7. MOTOR DE ESCRITURA "TIPO MÁQUINA"
     ------------------------------------------------------------------------ */

  /** Escribe `text` letra por letra al final del buffer actual.
   *  `speed` es el retardo base entre caracteres (ms).
   *  Cancelable: si se invoca una nueva escritura mientras ésta corre,
   *  el generador queda obsoleto y la función corta silenciosamente. */
  function typeAppend(text, speed) {
    speed = speed || 24;
    var gen = ++typeGeneration;

    return new Promise(function (resolve) {
      var i = 0;

      function step() {
        if (gen !== typeGeneration) { resolve(); return; } // cancelado
        if (i >= text.length) { resolve(); return; }

        var ch = text.charAt(i);
        terminalBuffer += ch;
        renderScreen();

        i++;
        setTimeout(step, randomSpeed(speed));
      }
      step();
    });
  }

  /** Cancela cualquier escritura en curso (usado al cambiar de comando). */
  function cancelTyping() {
    typeGeneration++;
  }

  /* ------------------------------------------------------------------------
     8. SECUENCIA DE ENCENDIDO
     ------------------------------------------------------------------------ */

  function powerOn() {
    screenEl.classList.remove('is-off');
    screenEl.classList.add('is-powering-on');

    setTimeout(function () {
      screenEl.classList.remove('is-powering-on');
      screenEl.classList.add('is-on');
      runBootSequence();
    }, 480);
  }

  function runBootSequence() {
    consoleEl.classList.add('is-booting');
    clearScreen();

    typeAppend('RACO TERMINAL\n', 58)
      .then(function () { return typeAppend('Version 2.026\n\n', 58); })
      .then(function () { return wait(250); })
      .then(function () { return typeAppend('Inicializando...\n\n', 50); })
      .then(function () { return wait(200); })
      .then(function () { return typeAppend(bar(20) + '\n\n', 18); })
      .then(function () { return wait(250); })
      .then(function () { return typeAppend('Sistema listo.\n\n', 50); })
      .then(function () { return typeAppend('Esperando comando...', 50); })
      .then(function () {
        consoleEl.classList.remove('is-booting');
      });
  }

  /** Genera una barra de progreso de bloques sólidos. */
  function bar(length) {
    var blocks = '';
    for (var i = 0; i < length; i++) { blocks += '█'; }
    return blocks;
  }

  /* ------------------------------------------------------------------------
     9. COMANDOS DE LOS BOTONES
     ------------------------------------------------------------------------ */

  function runBases() {
    ensureAudio();
    playSwitchSound();
    cancelTyping();
    clearScreen();

    typeAppend('Abriendo BASES.TXT...\n\n', 36)
      .then(function () { return typeAppend(bar(18) + '\n\n', 16); })
      .then(function () { return typeAppend('Acceso autorizado.\n\n', 38); })
      .then(function () { return wait(400); })
      .then(function () { return typeAppend(BASES_TEXT + '\n\n', 32); })
      .then(function () { return typeAppend('Esperando comando...', 42); });
  }

  function runPrograma() {
    ensureAudio();
    playSwitchSound();
    cancelTyping();
    clearScreen();

    typeAppend('Abriendo PROGRAMA.TXT...\n\n', 36)
      .then(function () { return typeAppend(bar(15) + '\n\n', 16); })
      .then(function () { return wait(300); })
      .then(function () { return typeAppend(PROGRAMA_TEXT + '\n\n', 32); })
      .then(function () { return typeAppend('Esperando comando...', 42); });
  }

  function runPostular() {
    ensureAudio();
    playSwitchSound();
    cancelTyping();
    clearScreen();

    typeAppend('Abriendo POSTULAR...\n\n', 36)
      .then(function () { return typeAppend(bar(14) + '\n\n', 16); })
      .then(function () { return wait(400); })
      .then(function () {
        // Cambia a modo "mensaje grande": pantalla tipo cartel, centrada.
        // Velocidad bien lenta para que la revelación sea dramática.
        clearScreen();
        outputEl.classList.add('is-big');
        return typeAppend('LINK DE\nPOSTULACIÓN\nEN BIO', 160);
      });
  }

  /* ------------------------------------------------------------------------
     10. FLICKER ALEATORIO (inestabilidad sutil de un tubo viejo, sin ruido
         estático: sólo una variación de brillo muy breve y poco frecuente)
     ------------------------------------------------------------------------ */

  function scheduleRandomGlitch() {
    var delay = 7000 + Math.random() * 9000;
    setTimeout(function () {
      screenEl.classList.add('glitch');
      setTimeout(function () {
        screenEl.classList.remove('glitch');
        scheduleRandomGlitch();
      }, 140);
    }, delay);
  }

  /* ------------------------------------------------------------------------
     11. BOTONES — feedback visual de presión física
     ------------------------------------------------------------------------ */

  function bindPressFeedback(button) {
    var press = function () { button.classList.add('is-pressed'); };
    var release = function () { button.classList.remove('is-pressed'); };

    button.addEventListener('mousedown', press);
    button.addEventListener('touchstart', press, { passive: true });
    button.addEventListener('mouseup', release);
    button.addEventListener('mouseleave', release);
    button.addEventListener('touchend', release);
    button.addEventListener('touchcancel', release);
  }

  /* ------------------------------------------------------------------------
     12. INICIALIZACIÓN
     ------------------------------------------------------------------------ */

  function init() {
    // La pantalla arranca apagada (definido también en CSS: .is-off)
    screenEl.classList.add('is-off');

    // Listeners de los tres únicos comandos del terminal
    btnBases.addEventListener('click', runBases);
    btnPrograma.addEventListener('click', runPrograma);
    btnPostular.addEventListener('click', runPostular);

    bindPressFeedback(btnBases);
    bindPressFeedback(btnPrograma);
    bindPressFeedback(btnPostular);

    // Cualquier primer toque habilita el audio (política de autoplay)
    document.addEventListener('pointerdown', ensureAudio, { once: true });

    scheduleRandomGlitch();

    // Efecto de encendido tras una breve pausa, como si alguien
    // hubiese accionado el interruptor general de la consola.
    setTimeout(powerOn, 700);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
