// Utility: shuffle an array
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

let quizData = null;
let currentIndex = 0;
let score = 0;
let selectedQuestions = [];

// Elements
const startBtn = document.getElementById("start-btn");
const questionCountBox = document.getElementById("question-count-box");
const confirmCountBtn = document.getElementById("confirm-count-btn");
const questionCountInput = document.getElementById("question-count");

const quizBox = document.getElementById("quiz-box");
const questionBox = document.getElementById("question-box");
const answersBox = document.getElementById("answers-box");
const nextBtn = document.getElementById("next-btn");
const resultBox = document.getElementById("result-box");

// Load quiz JSON
async function loadQuiz() {
  const res = await fetch("/json/math.json");
  quizData = await res.json();
  quizData.questions = shuffle(quizData.questions);
  questionCountInput.max = quizData.questions.length;
}

// Render a question
function showQuestion() {
  const q = selectedQuestions[currentIndex];

  questionBox.innerHTML = `
    <h2>${q.question}</h2>
    ${q.image ? `<img src="${q.image}" alt="question image" style="max-width:100%;"/>` : ""}
  `;

  answersBox.innerHTML = "";
  nextBtn.classList.add("hidden");

  if (q.type === "multiple_choice") {
    const shuffledChoices = shuffle([...q.choices]);
    shuffledChoices.forEach(choice => {
      const btn = document.createElement("button");
      btn.textContent = choice;

      btn.addEventListener("click", () => {
        const allBtns = answersBox.querySelectorAll("button");
        allBtns.forEach(b => (b.disabled = true));

        if (q.correct.includes(choice)) {
          btn.classList.add("correct");
          score++;
        } else {
          btn.classList.add("incorrect");
          allBtns.forEach(b => {
            if (q.correct.includes(b.textContent)) {
              b.classList.add("correct");
            }
          });
        }
        nextBtn.classList.remove("hidden");
      });

      answersBox.appendChild(btn);
    });
  } else if (q.type === "matching") {
    q.pairs.forEach(pair => {
      const row = document.createElement("div");
      row.classList.add("match-row");
      row.innerHTML = `
        <span>${pair.left}</span>
        <select>
          <option value="">--Select--</option>
          ${shuffle(q.pairs)
            .map(p => `<option value="${p.right}">${p.right}</option>`)
            .join("")}
        </select>
      `;
      answersBox.appendChild(row);
    });

    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit Matching";
    submitBtn.addEventListener("click", () => {
      const rows = answersBox.querySelectorAll(".match-row");
      let correctCount = 0;

      rows.forEach((row, idx) => {
        const select = row.querySelector("select");
        select.disabled = true;

        if (select.value === q.pairs[idx].right) {
          row.classList.add("correct");
          correctCount++;
        } else {
          row.classList.add("incorrect");

          // Show the correct answer next to the wrong one
          const correctAns = document.createElement("span");
          correctAns.textContent = ` (Correct: ${q.pairs[idx].right})`;
          correctAns.style.color = "#4caf50";
          row.appendChild(correctAns);
        }
      });

      if (correctCount === q.pairs.length) {
        score++;
      }

      nextBtn.classList.remove("hidden");
      submitBtn.disabled = true;
    });
    answersBox.appendChild(submitBtn);
  }
}

function showResult() {
  quizBox.classList.add("hidden");
  resultBox.classList.remove("hidden");
  resultBox.innerHTML = `
    <h2>Quiz Finished!</h2>
    <p>You scored ${score} out of ${selectedQuestions.length}</p>
  `;
}

nextBtn.addEventListener("click", () => {
  currentIndex++;
  if (currentIndex < selectedQuestions.length) {
    showQuestion();
  } else {
    showResult();
  }
});

// Step 1: Load quiz and ask for question count
startBtn.addEventListener("click", async () => {
  await loadQuiz();
  startBtn.classList.add("hidden");
  questionCountBox.classList.remove("hidden");
});

// Step 2: Confirm number of questions
confirmCountBtn.addEventListener("click", () => {
  const count = parseInt(questionCountInput.value);
  if (isNaN(count) || count < 1 || count > quizData.questions.length) {
    alert(`Please enter a number between 1 and ${quizData.questions.length}`);
    return;
  }

  selectedQuestions = shuffle(quizData.questions).slice(0, count);

  questionCountBox.classList.add("hidden");
  quizBox.classList.remove("hidden");
  currentIndex = 0;
  score = 0;
  showQuestion();
});
