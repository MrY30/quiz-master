// Utility: shuffle an array
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

let quizData = null;
let currentIndex = 0;
let score = 0;

// Elements
const startBtn = document.getElementById("start-btn");
const quizBox = document.getElementById("quiz-box");
const questionBox = document.getElementById("question-box");
const answersBox = document.getElementById("answers-box");
const nextBtn = document.getElementById("next-btn");
const resultBox = document.getElementById("result-box");

// Load quiz JSON (you can replace with another file later)
async function loadQuiz() {
  const res = await fetch("/json/math.json");
  quizData = await res.json();

  // Shuffle questions
  quizData.questions = shuffle(quizData.questions);
}

// Render a question
function showQuestion() {
  const q = quizData.questions[currentIndex];

  questionBox.innerHTML = `
    <h2>${q.question}</h2>
    ${q.image ? `<img src="${q.image}" alt="question image" style="max-width:100%;"/>` : ""}
  `;

  answersBox.innerHTML = "";

  if (q.type === "multiple_choice") {
    const shuffledChoices = shuffle([...q.choices]);
    shuffledChoices.forEach(choice => {
      const btn = document.createElement("button");
      btn.textContent = choice;
      btn.addEventListener("click", () => selectAnswer(choice, q.correct));
      answersBox.appendChild(btn);
    });
  } else if (q.type === "matching") {
    // Matching UI: simple dropdowns
    q.pairs.forEach(pair => {
      const row = document.createElement("div");
      row.innerHTML = `
        <span>${pair.left}</span>
        <select>
          <option value="">--Select--</option>
          ${shuffle(q.pairs).map(p => `<option value="${p.right}">${p.right}</option>`).join("")}
        </select>
      `;
      answersBox.appendChild(row);
    });

    const btn = document.createElement("button");
    btn.textContent = "Submit Matching";
    btn.addEventListener("click", () => checkMatching(q));
    answersBox.appendChild(btn);
  }
}

function selectAnswer(choice, correctAnswers) {
  if (correctAnswers.includes(choice)) {
    score++;
  }
  nextBtn.classList.remove("hidden");
}

function checkMatching(q) {
  const rows = answersBox.querySelectorAll("div");
  let correctCount = 0;

  rows.forEach((row, idx) => {
    const select = row.querySelector("select");
    if (select.value === q.pairs[idx].right) {
      correctCount++;
    }
  });

  if (correctCount === q.pairs.length) {
    score++;
  }

  nextBtn.classList.remove("hidden");
}

function showResult() {
  quizBox.classList.add("hidden");
  resultBox.classList.remove("hidden");
  resultBox.innerHTML = `
    <h2>Quiz Finished!</h2>
    <p>You scored ${score} out of ${quizData.questions.length}</p>
  `;
}

nextBtn.addEventListener("click", () => {
  currentIndex++;
  if (currentIndex < quizData.questions.length) {
    nextBtn.classList.add("hidden");
    showQuestion();
  } else {
    showResult();
  }
});

startBtn.addEventListener("click", async () => {
  await loadQuiz();
  startBtn.classList.add("hidden");
  quizBox.classList.remove("hidden");
  showQuestion();
});
