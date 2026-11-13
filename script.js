const questions = [
    {
        q: "1. ¿Qué es el mantenimiento preventivo?",
        options: [
            "Reparar el equipo cuando ya se descompuso.",
            "Dar mantenimiento programado antes de que el equipo falle.",
            "Comprar un equipo nuevo."
        ],
        correct: 1
    },
    {
        q: "2. ¿Cuál es el orden correcto del ciclo del mantenimiento preventivo?",
        options: [
            "Planear, programar, ejecutar, registrar y analizar.",
            "Ejecutar, analizar, planear, registrar y programar.",
            "Registrar, ejecutar, programar, analizar y planear."
        ],
        correct: 0
    },
    {
        q: "3. Un equipo con criticidad “A” es aquel que:",
        options: [
            "Es fácil de reemplazar.",
            "No necesita mantenimiento.",
            "Si se detiene, para la línea de producción."
        ],
        correct: 2
    },
    {
        q: "4. ¿De dónde salen las frecuencias del plan maestro?",
        options: [
            "Del manual del fabricante y del historial de fallas.",
            "De lo que recuerde cada técnico.",
            "Solo de lo que pida producción."
        ],
        correct: 0
    },
    {
        q: "5. ¿Cuándo está terminada una orden de trabajo?",
        options: [
            "Cuando se termina el trabajo físico.",
            "Cuando está cerrada, firmada y capturada.",
            "Cuando se le avisa al supervisor."
        ],
        correct: 1
    },
    {
        q: "6. ¿Cuál es el plazo máximo para capturar una orden de trabajo?",
        options: [
            "A fin de mes.",
            "Una semana.",
            "24 horas."
        ],
        correct: 2
    },
    {
        q: "7. Si producción no libera el equipo para el preventivo, ¿qué se hace?",
        options: [
            "Se registra el motivo y se reprograma.",
            "Se cancela el preventivo.",
            "Se hace con el equipo trabajando."
        ],
        correct: 0
    },
    {
        q: "8. ¿Con cuánta anticipación se piden las refacciones?",
        options: [
            "El mismo día.",
            "Una semana antes de la fecha programada.",
            "Después de hacer el trabajo."
        ],
        correct: 1
    },
    {
        q: "9. Toda pieza que sale del almacén:",
        options: [
            "No necesita registro.",
            "Se anota al final del mes.",
            "Se carga al folio de una orden de trabajo."
        ],
        correct: 2
    },
    {
        q: "10. Si en el mes se programaron 40 órdenes y se ejecutaron 36, el cumplimiento es:",
        options: [
            "90%.",
            "36%.",
            "40%."
        ],
        correct: 0
    }
];

let currentQuestionIndex = 0;
let score = 0;
let mainTimerInterval;
let readTimerInterval;
let timeLeft = 30; 
let readTimeLeft = 5; 
let participantName = "";
let examDate = "";
let userResults = [];

const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const timerDisplay = document.getElementById('timer-display');
const questionCounter = document.getElementById('question-counter');
const feedbackMessage = document.getElementById('feedback-message');
const readingMessage = document.getElementById('reading-message');
const downloadPdfBtn = document.getElementById('download-pdf-btn');
const restartBtn = document.getElementById('restart-btn');
const nameInput = document.getElementById('username');
const dateInput = document.getElementById('exam-date');
const progressFill = document.getElementById('progress-fill');
const timerText = document.getElementById('timer-text');
const scoreRing = document.getElementById('score-ring');
const scoreRingText = document.getElementById('score-ring-text');
const resultEmoji = document.getElementById('result-emoji');

// Por defecto la fecha es hoy, pero el participante puede cambiarla
dateInput.value = new Date().toISOString().slice(0, 10);

function formatoFechaLegible(iso) {
    if (!iso) return '—';
    const partes = iso.split('-');
    if (partes.length !== 3) return iso;
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${partes[2]} ${meses[parseInt(partes[1], 10) - 1]} ${partes[0]}`;
}

// Audio
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
    if (!audioCtx) audioCtx = new AudioContext();
}

function playSound(type) {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'correct') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
        oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); 
        oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); 
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
    } else {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(120, audioCtx.currentTime); 
        oscillator.frequency.setValueAtTime(100, audioCtx.currentTime + 0.2); 
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
    }
}

// Lógica de Emojis inyectados en el botón
function createEmojis(emojiArray, animationName, count, targetButton) {
    if (!targetButton) return; 

    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.classList.add('emoji-anim');
        el.innerText = emojiArray[Math.floor(Math.random() * emojiArray.length)];
        
        // Variable CSS para darle una dirección horizontal aleatoria al emoji
        el.style.setProperty('--x-dir', (Math.random() * 120 - 60) + 'px');
        
        el.style.animationName = animationName;
        el.style.animationDuration = (Math.random() * 1 + 1) + 's'; // Más rápido: de 1s a 2s
        el.style.fontSize = (Math.random() * 1.5 + 1.5) + 'rem'; 
        
        // Agregamos el emoji DENTRO del botón
        targetButton.appendChild(el);
        
        // Lo borramos del DOM después de animar
        setTimeout(() => el.remove(), 2500);
    }
}

function showBalloons(targetButton) {
    const balloons = ['🎈', '🎈', '🎈', '🎉', '🎊'];
    createEmojis(balloons, 'floatUpBtn', 20, targetButton);
}

function showSadFaces(targetButton) {
    const sadFaces = ['😢', '😭', '😞', '☹️', '👎'];
    createEmojis(sadFaces, 'fallDownBtn', 20, targetButton);
}

startBtn.addEventListener('click', () => {
    participantName = nameInput.value.trim();
    if (!participantName) {
        alert("Por favor, ingresa tu nombre completo para comenzar.");
        return;
    }
    examDate = dateInput.value || new Date().toISOString().slice(0, 10);
    initAudio();
    startScreen.classList.remove('active');
    quizScreen.classList.add('active');
    startQuestionCycle();
});

function startQuestionCycle() {
    const currentQ = questions[currentQuestionIndex];
    questionText.textContent = currentQ.q;
    questionCounter.textContent = `Pregunta ${currentQuestionIndex + 1} de ${questions.length}`;
    progressFill.style.width = `${(currentQuestionIndex / questions.length) * 100}%`;

    optionsContainer.innerHTML = '';
    optionsContainer.classList.add('hidden');
    feedbackMessage.classList.add('hidden');
    readingMessage.classList.remove('hidden');

    // Configurar temporizador de lectura (anillo circular)
    readTimeLeft = 5;
    timerDisplay.className = 'timer-ring reading-mode';
    timerDisplay.style.setProperty('--progress', 100);
    timerText.textContent = readTimeLeft;

    clearInterval(mainTimerInterval);
    clearInterval(readTimerInterval);

    readTimerInterval = setInterval(() => {
        readTimeLeft--;
        timerText.textContent = readTimeLeft;
        timerDisplay.style.setProperty('--progress', (readTimeLeft / 5) * 100);

        if (readTimeLeft <= 0) {
            clearInterval(readTimerInterval);
            showOptionsAndStartTimer(currentQ);
        }
    }, 1000);
}

function showOptionsAndStartTimer(currentQ) {
    readingMessage.classList.add('hidden');
    optionsContainer.classList.remove('hidden');
    
    const letters = ['A', 'B', 'C', 'D'];
    currentQ.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.innerHTML = `<span class="option-letter">${letters[index]}</span><span class="option-text">${option}</span>`;
        button.classList.add('option-btn');
        button.addEventListener('click', () => handleAnswer(index, button));
        optionsContainer.appendChild(button);
    });

    // Iniciar temporizador principal de 30s (anillo circular)
    timeLeft = 30;
    timerDisplay.className = 'timer-ring answering-mode';
    timerDisplay.style.setProperty('--progress', 100);
    timerText.textContent = timeLeft;

    mainTimerInterval = setInterval(() => {
        timeLeft--;
        timerText.textContent = timeLeft;
        timerDisplay.style.setProperty('--progress', (timeLeft / 30) * 100);
        timerDisplay.classList.toggle('urgent', timeLeft <= 8 && timeLeft > 0);

        if (timeLeft <= 0) {
            clearInterval(mainTimerInterval);
            handleAnswer(-1, null);
        }
    }, 1000);
}

function handleAnswer(selectedIndex, selectedButton) {
    clearInterval(mainTimerInterval); 
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = selectedIndex === currentQ.correct;
    
    const allButtons = optionsContainer.querySelectorAll('.option-btn');
    
    // Todos a gris
    allButtons.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('disabled-option');
    });

    userResults.push({
        pregunta: currentQ.q,
        respuestaUsuario: selectedIndex >= 0 ? currentQ.options[selectedIndex] : "Tiempo Agotado",
        respuestaCorrecta: currentQ.options[currentQ.correct],
        esCorrecto: isCorrect
    });

    feedbackMessage.classList.remove('hidden');
    feedbackMessage.className = 'feedback'; 

    // La correcta siempre verde
    const correctBtn = allButtons[currentQ.correct];
    correctBtn.classList.remove('disabled-option');
    correctBtn.classList.add('correct-answer');

    if (isCorrect) {
        playSound('correct'); 
        // Lanzamos globos desde el botón que cliqueó (que es el correcto)
        showBalloons(selectedButton || correctBtn); 
        
        feedbackMessage.textContent = "¡Correcto! Excelente trabajo.";
        feedbackMessage.classList.add('success');
        score++;
    } else {
        playSound('incorrect'); 
        
        // Lanzamos caritas tristes SOLO desde el botón equivocado que eligió
        if(selectedButton) {
            showSadFaces(selectedButton);
            selectedButton.classList.remove('disabled-option');
            selectedButton.classList.add('wrong-answer'); 
        }
        
        feedbackMessage.textContent = "Incorrecto. Revisa la respuesta marcada en verde.";
        feedbackMessage.classList.add('error');
    }

    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            startQuestionCycle(); 
        } else {
            showResults();
        }
    }, 4500); 
}

function showResults() {
    progressFill.style.width = '100%';
    quizScreen.classList.remove('active');
    resultScreen.classList.add('active');
    document.getElementById('final-score-text').textContent =
        `${participantName}, has obtenido ${score} aciertos de ${questions.length} preguntas.`;

    const percentage = (score / questions.length) * 100;
    scoreRingText.textContent = `${score}/${questions.length}`;
    setTimeout(() => scoreRing.style.setProperty('--progress', percentage), 100);

    if (percentage >= 80) {
        resultEmoji.textContent = '🏆';
    } else if (percentage >= 50) {
        resultEmoji.textContent = '👍';
    } else {
        resultEmoji.textContent = '💪';
    }
}

// DOCUMENTACIÓN: Genera un PDF con formato tipo "reporte profesional" con el logo de la
// empresa como membrete, tarjeta de resumen con insignia de puntuación y tarjetas de
// color por pregunta. El logo se usa desde LOGO_DATA_URL (definido en logo-data.js) en vez
// de descargarlo con fetch(), ya que los navegadores bloquean esas peticiones cuando la
// página se abre directamente con file:// (doble clic en el archivo, sin servidor).
downloadPdfBtn.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    const headerHeight = 34;

    const palette = {
        primaryDark: [10, 79, 122],
        dark: [20, 33, 61],
        muted: [107, 114, 128],
        success: [22, 163, 74],
        successBg: [220, 252, 231],
        warning: [180, 83, 9],
        warningBg: [254, 243, 199],
        danger: [220, 38, 38],
        dangerText: [153, 27, 27],
        dangerBg: [254, 226, 226],
        lightGray: [243, 244, 246],
        white: [255, 255, 255]
    };

    const percentage = Math.round((score / questions.length) * 100);
    const today = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    const logo = (typeof LOGO_DATA_URL !== 'undefined')
        ? { dataUrl: LOGO_DATA_URL, width: LOGO_WIDTH, height: LOGO_HEIGHT }
        : null; // Si logo-data.js no cargó, el reporte sigue sin membrete

    doc.setProperties({
        title: `Resultados - ${participantName}`,
        subject: 'Examen: Gestión del Mantenimiento Preventivo',
        author: participantName
    });

    function drawHeader() {
        doc.setFillColor(...palette.primaryDark);
        doc.rect(0, 0, pageWidth, headerHeight, 'F');
        doc.setTextColor(...palette.white);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('Reporte de Examen', margin, 15);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        doc.text('Gestión del Mantenimiento Preventivo', margin, 23);

        if (logo) {
            const boxW = 34, boxH = 15, pad = 2;
            const boxX = pageWidth - margin - boxW, boxY = 5;
            doc.setFillColor(...palette.white);
            doc.roundedRect(boxX, boxY, boxW, boxH, 2, 2, 'F');

            const availW = boxW - pad * 2, availH = boxH - pad * 2;
            const ratio = logo.width / logo.height;
            let imgW = availW, imgH = imgW / ratio;
            if (imgH > availH) { imgH = availH; imgW = imgH * ratio; }
            const imgX = boxX + (boxW - imgW) / 2;
            const imgY = boxY + (boxH - imgH) / 2;
            doc.addImage(logo.dataUrl, 'JPEG', imgX, imgY, imgW, imgH);

            doc.setFontSize(8);
            doc.setTextColor(...palette.white);
            doc.text(today, boxX + boxW, boxY + boxH + 5, { align: 'right' });
        } else {
            doc.setFontSize(9);
            doc.text(today, pageWidth - margin, 15, { align: 'right' });
        }
    }

    function drawFooter(pageIndex, totalPages) {
        doc.setDrawColor(...palette.lightGray);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...palette.muted);
        doc.text('Transfergraphic · Vulcanizable Labels', margin, pageHeight - 9);
        doc.text(`Página ${pageIndex} de ${totalPages}`, pageWidth - margin, pageHeight - 9, { align: 'right' });
    }

    // --- Página 1: encabezado + tarjeta de resumen ---
    drawHeader();
    let yPos = headerHeight + 12;

    doc.setFillColor(...palette.lightGray);
    doc.roundedRect(margin, yPos, contentWidth, 26, 3, 3, 'F');

    doc.setTextColor(...palette.dark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.text(participantName, margin + 6, yPos + 11);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...palette.muted);
    doc.text(`Participante · Fecha del examen: ${formatoFechaLegible(examDate)}`, margin + 6, yPos + 18);

    const tone = percentage >= 70 ? 'success' : (percentage >= 50 ? 'warning' : 'danger');
    const badgeColor = palette[tone];
    const badgeBg = palette[`${tone}Bg`];
    const badgeW = 48;
    const badgeX = margin + contentWidth - 6 - badgeW;

    doc.setFillColor(...badgeBg);
    doc.roundedRect(badgeX, yPos + 4, badgeW, 18, 3, 3, 'F');
    doc.setTextColor(...badgeColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`${score} / ${questions.length}`, badgeX + badgeW / 2, yPos + 12, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`${percentage}% de aciertos`, badgeX + badgeW / 2, yPos + 18, { align: 'center' });

    yPos += 36;

    doc.setTextColor(...palette.dark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Detalle de Respuestas', margin, yPos);
    yPos += 3;
    doc.setDrawColor(...palette.primaryDark);
    doc.setLineWidth(0.6);
    doc.line(margin, yPos, margin + 34, yPos);
    yPos += 9;

    // --- Tarjetas por pregunta ---
    const textPadding = 7;
    const qWrapWidth = contentWidth - 14 - 32; // deja espacio para la insignia de estado
    const answerWrapWidth = contentWidth - 14;

    userResults.forEach((result) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        const qLines = doc.splitTextToSize(result.pregunta, qWrapWidth);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        const ansLines = doc.splitTextToSize(`Tu respuesta: ${result.respuestaUsuario}`, answerWrapWidth);
        const corrLines = result.esCorrecto
            ? []
            : doc.splitTextToSize(`Respuesta correcta: ${result.respuestaCorrecta}`, answerWrapWidth);

        const boxHeight = 8 + qLines.length * 5.2 + ansLines.length * 5 + corrLines.length * 5 + 5;

        if (yPos + boxHeight > pageHeight - 20) {
            doc.addPage();
            drawHeader();
            yPos = headerHeight + 12;
        }

        const boxBg = result.esCorrecto ? palette.successBg : palette.dangerBg;
        const accent = result.esCorrecto ? palette.success : palette.danger;

        doc.setFillColor(...boxBg);
        doc.roundedRect(margin, yPos, contentWidth, boxHeight, 2.5, 2.5, 'F');
        doc.setFillColor(...accent);
        doc.rect(margin, yPos + 1.2, 2.2, boxHeight - 2.4, 'F');

        const statusText = result.esCorrecto ? 'CORRECTO' : 'INCORRECTO';
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        const pillW = doc.getTextWidth(statusText) + 6;
        const pillX = margin + contentWidth - pillW - 4;
        doc.setFillColor(...accent);
        doc.roundedRect(pillX, yPos + 4, pillW, 6, 2, 2, 'F');
        doc.setTextColor(...palette.white);
        doc.text(statusText, pillX + pillW / 2, yPos + 8, { align: 'center' });

        let innerY = yPos + 8;
        doc.setTextColor(...palette.dark);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text(qLines, margin + textPadding, innerY);
        innerY += qLines.length * 5.2 + 1.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(...palette.dark);
        doc.text(ansLines, margin + textPadding, innerY);
        innerY += ansLines.length * 5;

        if (corrLines.length) {
            doc.setTextColor(...palette.dangerText);
            doc.text(corrLines, margin + textPadding, innerY);
        }

        yPos += boxHeight + 6;
    });

    // --- Pie de página en todas las páginas, con numeración total ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(i, totalPages);
    }

    doc.save(`Examen_Mantenimiento_${participantName.replace(/\s+/g, '_')}.pdf`);
});

restartBtn.addEventListener('click', () => {
    currentQuestionIndex = 0;
    score = 0;
    userResults = [];
    nameInput.value = '';
    dateInput.value = new Date().toISOString().slice(0, 10);
    progressFill.style.width = '0%';
    scoreRing.style.setProperty('--progress', 0);
    resultScreen.classList.remove('active');
    startScreen.classList.add('active');
});