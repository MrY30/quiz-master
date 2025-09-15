// Quiz Application Class
class QuizApp {
    constructor() {
        this.quizData = null;
        this.questions = [];
        this.currentIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.timeStarted = null;
        
        this.initializeEventListeners();
        this.loadQuiz();
    }

    // Utility function to shuffle array
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Load quiz data
    async loadQuiz() {
        try {
            // Since we can't fetch the actual file, let's use the sample data you provided
            const response = await fetch("quiz_files/ccna.json");
            this.quizData = await response.json();

            // Fill modal info
            document.getElementById("modal-title").textContent = this.quizData.title;
            document.getElementById("modal-description").textContent = this.quizData.description;
            
            // Set max questions
            const questionCountInput = document.getElementById("question-count");
            questionCountInput.max = this.quizData.questions.length;
            questionCountInput.value = Math.min(10, this.quizData.questions.length);
            
        } catch (error) {
            console.error("Error loading quiz:", error);
            alert("Error loading quiz data. Please check the console for details.");
        }
    }

    // Initialize event listeners
    initializeEventListeners() {
        document.getElementById("startButton").addEventListener("click", () => this.startQuiz());
        document.getElementById("submitButton").addEventListener("click", () => this.submitAnswer());
        document.getElementById("nextButton").addEventListener("click", () => this.nextQuestion());
    }

    // Start the quiz
    startQuiz() {
        const count = parseInt(document.getElementById("question-count").value, 10) || this.quizData.questions.length;
        
        // Prepare questions
        this.questions = this.shuffle([...this.quizData.questions]).slice(0, count);
        this.currentIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.timeStarted = new Date();

        // Hide modal and show quiz
        document.getElementById("startModal").classList.add("hidden");
        document.querySelector(".quiz-container").classList.remove("hidden");

        this.showQuestion();
    }

    // Start the quiz SPECIFIC QUESTION
    // startQuiz() {
    //     const count = parseInt(document.getElementById("question-count").value, 10) || this.quizData.questions.length;
        
    //     // FOR TESTING: Show only question with ID 89
    //     const testQuestionId = 102;
    //     const specificQuestion = this.quizData.questions.find(q => q.id === testQuestionId);
        
    //     if (specificQuestion) {
    //         this.questions = [specificQuestion]; // Show only this question
    //     } else {
    //         console.error(`Question with ID ${testQuestionId} not found!`);
    //         // Fallback to normal behavior
    //         this.questions = this.shuffle([...this.quizData.questions]).slice(0, count);
    //     }
        
    //     this.currentIndex = 0;
    //     this.userAnswers = [];
    //     this.score = 0;
    //     this.timeStarted = new Date();

    //     // Hide modal and show quiz
    //     document.getElementById("startModal").classList.add("hidden");
    //     document.querySelector(".quiz-container").classList.remove("hidden");

    //     this.showQuestion();
    // }

    // Display current question
    showQuestion() {
        const question = this.questions[this.currentIndex];
        const container = document.getElementById("quiz-question");
        container.innerHTML = "";

        // Update progress
        document.getElementById("quiz-progress").textContent = 
            `Question ${this.currentIndex + 1} of ${this.questions.length}`;
        
        const progressPercent = ((this.currentIndex + 1) / this.questions.length) * 100;
        document.getElementById("progress-fill").style.width = `${progressPercent}%`;

        // Question title
        const questionTitle = document.createElement("h3");
        questionTitle.className = "question-title";
        questionTitle.textContent = question.question;
        container.appendChild(questionTitle);

        // Question image (if any)
        if (question.image) {
            const img = document.createElement("img");
            img.src = question.image;
            img.alt = "Question image";
            img.className = "question-image";
            container.appendChild(img);
        }

        // Render question based on type
        if (question.type === "multiple_choice") {
            this.renderMultipleChoice(question, container);
        } else if (question.type === "matching") {
            this.renderMatching(question, container);
        }

        // Reset buttons
        document.getElementById("submitButton").classList.remove("hidden");
        document.getElementById("nextButton").classList.add("hidden");
    }

    // Render multiple choice question
    renderMultipleChoice(question, container) {
        const choicesDiv = document.createElement("div");
        choicesDiv.className = "choices";

        const shuffledChoices = this.shuffle([...question.details.choices]);

        shuffledChoices.forEach((choice, index) => {
            const choiceItem = document.createElement("div");
            choiceItem.className = "choice-item";

            const input = document.createElement("input");
            input.type = question.details.correct.length > 1 ? "checkbox" : "radio";
            input.name = `question-${question.id}`;
            input.value = choice;
            input.id = `choice-${index}`;

            const label = document.createElement("label");
            label.textContent = choice;
            label.setAttribute("for", `choice-${index}`);

            choiceItem.appendChild(input);
            choiceItem.appendChild(label);
            
            // Make entire div clickable
            choiceItem.addEventListener("click", (e) => {
                if (e.target !== input) {
                    input.click();
                }
            });

            choicesDiv.appendChild(choiceItem);
        });

        container.appendChild(choicesDiv);
    }

    // Render matching question
    renderMatching(question, container) {
        const matchingDiv = document.createElement("div");
        matchingDiv.className = "matching-container";

        if (question.details.pairs) {
            // Pair-based matching
            const shuffledOptions = this.shuffle([...question.details.pairs.map(p => p.right)]);
            
            question.details.pairs.forEach((pair, index) => {
                const matchingItem = document.createElement("div");
                matchingItem.className = "matching-item";

                const textSpan = document.createElement("span");
                textSpan.className = "matching-text";
                textSpan.textContent = pair.left;

                const arrow = document.createElement("span");
                arrow.className = "matching-arrow";
                arrow.textContent = "→";

                const select = document.createElement("select");
                select.className = "matching-select";
                select.dataset.correctAnswer = pair.right;

                // Add default option
                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "Select an option...";
                select.appendChild(defaultOption);

                // Add all options
                shuffledOptions.forEach(option => {
                    const optionElement = document.createElement("option");
                    optionElement.value = option;
                    optionElement.textContent = option;
                    select.appendChild(optionElement);
                });

                matchingItem.appendChild(textSpan);
                matchingItem.appendChild(arrow);
                matchingItem.appendChild(select);
                matchingDiv.appendChild(matchingItem);
            });
        } else if (question.details.groups) {
            // Group-based matching
            question.details.items.forEach(item => {
                const matchingItem = document.createElement("div");
                matchingItem.className = "matching-item";

                const textSpan = document.createElement("span");
                textSpan.className = "matching-text";
                textSpan.textContent = item.text;

                const arrow = document.createElement("span");
                arrow.className = "matching-arrow";
                arrow.textContent = "→";

                const select = document.createElement("select");
                select.className = "matching-select";
                select.dataset.correctAnswer = item.group;

                // Add default option
                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "Select a group...";
                select.appendChild(defaultOption);

                // Add group options
                question.details.groups.forEach(group => {
                    const option = document.createElement("option");
                    option.value = group;
                    option.textContent = group;
                    select.appendChild(option);
                });

                matchingItem.appendChild(textSpan);
                matchingItem.appendChild(arrow);
                matchingItem.appendChild(select);
                matchingDiv.appendChild(matchingItem);
            });
        }

        container.appendChild(matchingDiv);
    }

    // Submit current answer
    submitAnswer() {
        const question = this.questions[this.currentIndex];
        const container = document.getElementById("quiz-question");
        let userAnswer = null;
        let isCorrect = false;

        if (question.type === "multiple_choice") {
            isCorrect = this.checkMultipleChoice(question, container);
        } else if (question.type === "matching") {
            isCorrect = this.checkMatching(question, container);
        }

        // Store user answer
        this.userAnswers[this.currentIndex] = {
            questionId: question.id,
            isCorrect: isCorrect,
            userAnswer: userAnswer
        };

        if (isCorrect) {
            this.score++;
        }

        // Switch buttons
        document.getElementById("submitButton").classList.add("hidden");
        document.getElementById("nextButton").classList.remove("hidden");
    }

    // Check multiple choice answer
    checkMultipleChoice(question, container) {
        const inputs = container.querySelectorAll("input");
        const selectedChoices = [];
        let isCorrect = true;

        inputs.forEach((input, index) => {
            const choiceItem = input.closest('.choice-item');
            const originalChoiceIndex = question.details.choices.indexOf(input.value);
            
            if (input.checked) {
                selectedChoices.push(originalChoiceIndex);
            }

            // Show correct answers
            if (question.details.correct.includes(originalChoiceIndex)) {
                choiceItem.classList.add("correct");
            } else if (input.checked) {
                choiceItem.classList.add("incorrect");
                isCorrect = false;
            }
        });

        // Check if all correct answers were selected and no incorrect ones
        const correctSet = new Set(question.details.correct);
        const selectedSet = new Set(selectedChoices);
        
        if (correctSet.size !== selectedSet.size) {
            isCorrect = false;
        } else {
            for (let choice of correctSet) {
                if (!selectedSet.has(choice)) {
                    isCorrect = false;
                    break;
                }
            }
        }

        return isCorrect;
    }

    // Check matching answer
    checkMatching(question, container) {
        const selects = container.querySelectorAll("select");
        let allCorrect = true;

        selects.forEach(select => {
            const correctAnswer = select.dataset.correctAnswer;
            if (select.value === correctAnswer) {
                select.classList.add("correct");
            } else {
                select.classList.add("incorrect");
                allCorrect = false;
            }
        });

        return allCorrect;
    }

    // Move to next question or show results
    nextQuestion() {
        this.currentIndex++;
        if (this.currentIndex < this.questions.length) {
            this.showQuestion();
        } else {
            this.showResults();
        }
    }

    // Show final results
    showResults() {
        const container = document.getElementById("quiz-question");
        const timeElapsed = new Date() - this.timeStarted;
        const minutes = Math.floor(timeElapsed / 60000);
        const seconds = Math.floor((timeElapsed % 60000) / 1000);
        
        const percentage = Math.round((this.score / this.questions.length) * 100);
        
        container.innerHTML = `
            <div class="results-container">
                <h2 class="results-title">🎉 Quiz Complete!</h2>
                <div class="score-display">${percentage}%</div>
                <div class="score-breakdown">
                    <div class="score-item">
                        <div class="score-value">${this.score}</div>
                        <div class="score-label">Correct</div>
                    </div>
                    <div class="score-item">
                        <div class="score-value">${this.questions.length - this.score}</div>
                        <div class="score-label">Incorrect</div>
                    </div>
                    <div class="score-item">
                        <div class="score-value">${this.questions.length}</div>
                        <div class="score-label">Total</div>
                    </div>
                    <div class="score-item">
                        <div class="score-value">${minutes}:${seconds.toString().padStart(2, '0')}</div>
                        <div class="score-label">Time</div>
                    </div>
                </div>
                <button class="btn" onclick="location.reload()">Take Quiz Again</button>
            </div>
        `;

        // Hide controls
        document.getElementById("submitButton").classList.add("hidden");
        document.getElementById("nextButton").classList.add("hidden");
        document.querySelector(".quiz-controls").style.display = "none";
    }
}

// Initialize the quiz app when the page loads
document.addEventListener("DOMContentLoaded", () => {
    new QuizApp();
});