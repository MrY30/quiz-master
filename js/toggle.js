// TOGGLE DARK MODE
const darkModeButton = document.getElementById('dm-button');
const body = document.getElementById('main-body');

darkModeButton.addEventListener('click', ()=>{
    body.classList.toggle('dark-theme');
    darkModeButton.classList.toggle('bxs-moon');
    darkModeButton.classList.toggle('bxs-sun-dim');
});

const transparentBg = document.querySelector('.transparent-bg');
const quizModal = document.querySelector('.quiz-modal');
const addQuiz = document.querySelector('.add-quiz');
const startQuiz = document.querySelector('.start-quiz');

// TOGGLE ADD BUTTON
const addCard = document.getElementById('add-card');
addCard.addEventListener('click', ()=>{
    transparentBg.classList.remove('hidden');
    quizModal.classList.remove('hidden');
    addQuiz.classList.remove('hidden');
    startQuiz.classList.add('hidden');
})

// TOGGLE CLOSE BUTTON
const closeButton = document.querySelector('.modal-close-button');
closeButton.addEventListener('click', ()=>{
    transparentBg.classList.add('hidden');
    quizModal.classList.add('hidden');
    addQuiz.classList.add('hidden');
    startQuiz.classList.add('hidden');
});

// TOGGLE SELECT BUTTON

// TOGGLE LET'S PLAY BUTTON
const takeQuizButton = document.getElementById('take-quiz-button');

takeQuizButton.addEventListener('click', ()=>{
    window.location.href = "quiz-page.html";
});