
let currentQuestionIndex = 0;
const userAnswers = {}; // Armazena o índice da opção selecionada para cada pergunta
let isJsPdfLoaded = false;

// Elementos do DOM
const quizContent = document.getElementById('quiz-content');
const messageBoxOverlay = document.getElementById('message-box-overlay');
const messageBoxTitle = document.getElementById('message-box-title');
const messageBoxText = document.getElementById('message-box-text');
const messageBoxCloseButton = document.getElementById('message-box-close');

// Função para exibir a caixa de mensagem
function showMessageBox(title, text) {
    messageBoxTitle.textContent = title;
    messageBoxText.textContent = text;
    messageBoxOverlay.style.display = 'flex';
}

// Função para esconder a caixa de mensagem
function hideMessageBox() {
    messageBoxOverlay.style.display = 'none';
}

// Event listener para fechar a caixa de mensagem
messageBoxCloseButton.addEventListener('click', hideMessageBox);

// Função para renderizar a pergunta atual
function renderQuestion() {
    quizContent.innerHTML = ''; // Limpa o conteúdo anterior

    if (currentQuestionIndex < quizData.length) {
        const questionData = quizData[currentQuestionIndex];

        const questionSection = document.createElement('div');
        questionSection.className = 'question-section';

        const questionText = document.createElement('p');
        questionText.className = 'question-text';
        questionText.textContent = `${currentQuestionIndex + 1}. ${questionData.question}`;
        questionSection.appendChild(questionText);

        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options-container';

        questionData.options.forEach((option, index) => {
            const optionButton = document.createElement('button');
            optionButton.className = 'option-button';
            optionButton.textContent = option;
            optionButton.addEventListener('click', () => {
                userAnswers[currentQuestionIndex] = index;
                // Remove a classe 'selected' de todos os botões e adiciona ao clicado
                optionsContainer.querySelectorAll('.option-button').forEach(btn => {
                    btn.classList.remove('selected');
                });
                optionButton.classList.add('selected');
            });

            // Marca a opção selecionada se já houver uma resposta
            if (userAnswers[currentQuestionIndex] === index) {
                optionButton.classList.add('selected');
            }
            optionsContainer.appendChild(optionButton);
        });
        questionSection.appendChild(optionsContainer);
        quizContent.appendChild(questionSection);

        // Adiciona botões de navegação
        const navButtons = document.createElement('div');
        navButtons.className = 'nav-buttons';

        const prevButton = document.createElement('button');
        prevButton.className = 'nav-button prev';
        prevButton.textContent = 'Anterior';
        prevButton.disabled = currentQuestionIndex === 0;
        prevButton.addEventListener('click', handlePrevious);
        navButtons.appendChild(prevButton);

        const nextButton = document.createElement('button');
        nextButton.className = `nav-button ${currentQuestionIndex === quizData.length - 1 ? 'finish' : 'next'}`;
        nextButton.textContent = currentQuestionIndex === quizData.length - 1 ? 'Finalizar Quiz' : 'Próxima';
        nextButton.addEventListener('click', handleNext);
        navButtons.appendChild(nextButton);

        quizContent.appendChild(navButtons);

    } else {
        // Renderiza a tela de resultados
        renderResultsScreen();
        }
}

// Função para lidar com o botão "Próxima" ou "Finalizar Quiz"
function handleNext() {
// Validação: verifica se a pergunta atual foi respondida
    if (userAnswers[currentQuestionIndex] === undefined) {
        showMessageBox('Pergunta Incompleta', 'Por favor, selecione uma opção antes de prosseguir.');
        return; // Impede o avanço se a pergunta não foi respondida
    }

    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        renderResultsScreen();
    }
}

// Função para lidar com o botão "Anterior"
function handlePrevious() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
}

// Função para renderizar a tela de resultados
function renderResultsScreen() {
    quizContent.innerHTML = ''; // Limpa o conteúdo do quiz

    const resultsScreen = document.createElement('div');
    resultsScreen.className = 'results-screen';

    const title = document.createElement('h2');
    title.textContent = 'Quiz Concluído!';
    resultsScreen.appendChild(title);

    const message = document.createElement('p');
    message.textContent = 'Obrigado por completar o quiz. Você pode exportar suas respostas para um PDF.';
    resultsScreen.appendChild(message);

    const exportButton = document.createElement('button');
    exportButton.className = 'export-button';
    exportButton.innerHTML = `
    <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>
    ${isJsPdfLoaded ? 'Exportar para PDF' : 'Carregando PDF...'}
    `;
    exportButton.disabled = !isJsPdfLoaded; // Desabilita se jsPDF não estiver carregado
    exportButton.addEventListener('click', exportToPdf);
    resultsScreen.appendChild(exportButton);

    const restartButton = document.createElement('button');
    restartButton.className = 'restart-button';
    restartButton.textContent = 'Reiniciar Quiz';
    restartButton.addEventListener('click', handleRestart);
    resultsScreen.appendChild(restartButton);

    quizContent.appendChild(resultsScreen);
}

// Função para reiniciar o quiz
function handleRestart() {
    currentQuestionIndex = 0;
    for (const key in userAnswers) {
        delete userAnswers[key]; // Limpa as respostas do usuário
    }
    renderQuestion();
}

// Modificação na função window.onload para verificar o jsPDF corretamente
window.onload = function() {
    renderQuestion();

    // Função para verificar se o jsPDF está carregado
    function checkJsPdfLoaded() {
        if (window.jspdf && window.jspdf.jsPDF) {
            isJsPdfLoaded = true;
            console.log("jsPDF carregado com sucesso.");
                    
            // Atualiza o botão de exportação se estiver na tela de resultados
            updateExportButton();
        } else {
            setTimeout(checkJsPdfLoaded, 100); // Tenta novamente após 100ms
        }
    }

    // Função para atualizar o botão de exportação
    function updateExportButton() {
        if (currentQuestionIndex >= quizData.length) {
            const exportButton = document.querySelector('.export-button');
                if (exportButton) {
                    exportButton.disabled = false;
                    exportButton.innerHTML = `
                    <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Exportar para PDF
                    `;
                }
        }
    }

    // Inicia a verificação do jsPDF
    checkJsPdfLoaded();
}
