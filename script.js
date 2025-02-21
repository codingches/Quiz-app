// Selectors for quiz elements
const questionElement = document.getElementById('questions');
const answerButtons = document.getElementById('answer-buttons');
const offlineMessage = document.createElement('div'); // Offline message container
offlineMessage.id = 'offline-message'; // Set an ID for styling

let currentQuestionIndex = 0;
let score = 0;
let questions = []; // To store dynamically fetched questions

// Function to start the quiz
async function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    questions = await fetchQuestions(); // Fetch fresh questions from the API
    showQuestion();
}

// Function to fetch questions from an API
async function fetchQuestions() {
    try {
        const response = await fetch('https://opentdb.com/api.php?amount=5&category=9&type=multiple'); // Example API
        const data = await response.json();

        // Transform API data into your question format
        return data.results.map(q => ({
            question: q.question,
            answers: [
                ...q.incorrect_answers.map(ans => ({ text: ans, correct: false })),
                { text: q.correct_answer, correct: true }
            ].sort(() => Math.random() - 0.5) // Shuffle answers
        }));
    } catch (error) {
        console.error('Error fetching questions:', error);
        return [];
    }
}

// Function to show a question
function showQuestion() {
    clearAnswers();

    if (currentQuestionIndex >= questions.length) {
        showScore();
        return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    questionElement.innerHTML = currentQuestion.question;

    currentQuestion.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer.text;
        button.classList.add('btn');
        if (answer.correct) {
            button.dataset.correct = true; // Add a data attribute for correct answer
        }
        button.addEventListener('click', selectAnswer);
        answerButtons.appendChild(button);
    });
}

// Function to clear answers
function clearAnswers() {
    answerButtons.innerHTML = '';
}

// Function to handle answer selection
function selectAnswer(e) {
    const selectedButton = e.target;
    const isCorrect = selectedButton.dataset.correct === 'true';
    Array.from(answerButtons.children).forEach(button => {
        setStatusClass(button, button.dataset.correct === 'true');
        button.disabled = true;
    });
    if (isCorrect) score++;

    setTimeout(() => {
        currentQuestionIndex++;
        showQuestion();
    }, 2000);
}

// Function to set button status (correct or incorrect)
function setStatusClass(element, correct) {
    element.classList.add(correct ? 'correct' : 'incorrect');
}

// Function to show final score
function showScore() {
    clearAnswers();
    questionElement.innerHTML = `Your score: ${score} / ${questions.length}`;

    const restartButton = document.createElement('button');
    restartButton.innerText = 'Restart Quiz';
    restartButton.classList.add('btn');
    restartButton.addEventListener('click', startQuiz);
    answerButtons.appendChild(restartButton);
}

// Function to show offline message
function handleOfflineStatus() {
    if (!navigator.onLine) {
        offlineMessage.innerText = 'You are offline. Please check your internet connection.';
        offlineMessage.style.display = 'block';
        document.body.appendChild(offlineMessage);
    } else {
        offlineMessage.style.display = 'none';
    }
}

// Add event listeners for online and offline status
window.addEventListener('offline', handleOfflineStatus);
window.addEventListener('online', handleOfflineStatus);

// Start the quiz
startQuiz();
