// Quiz Application Class
class QuizApp {
    constructor() {
        this.quizData = null;
        this.questions = [];
        this.currentIndex = 0;
        this.userAnswers = []; // This will now store detailed answer data
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

    // modified start quiz function
    // Start the quiz
    startQuiz(reuseQuestions = false) {
        if (!reuseQuestions) {
            // Only shuffle and select new questions if not reusing
            const count = parseInt(document.getElementById("question-count").value, 10) || this.quizData.questions.length;
            this.questions = this.shuffle([...this.quizData.questions]).slice(0, count);
        }
        // If reuseQuestions is true, keep the existing this.questions array
        
        this.currentIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.timeStarted = new Date();

        // Hide modal and show quiz
        document.getElementById("startModal").classList.add("hidden");
        document.querySelector(".quiz-container").classList.remove("hidden");

        this.showQuestion();
    }

    // START QUIZ WITH SPECIFIC QUESTION
    // startQuiz(reuseQuestions = false) {
    //     if (!reuseQuestions) {
    //         // Only shuffle and select new questions if not reusing
    //         const count = parseInt(document.getElementById("question-count").value, 10) || this.quizData.questions.length;
    //         // FOR TESTING: Show only question with ID 89
    //         const testQuestionId = 172;
    //         const specificQuestion = this.quizData.questions.find(q => q.id === testQuestionId);
            
    //         if (specificQuestion) {
    //             this.questions = [specificQuestion]; // Show only this question
    //         } else {
    //             console.error(`Question with ID ${testQuestionId} not found!`);
    //             // Fallback to normal behavior
    //             this.questions = this.shuffle([...this.quizData.questions]).slice(0, count);
    //         }
    //     }
    //     // If reuseQuestions is true, keep the existing this.questions array
        
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

        // UPDATE QUESTION ID IN CONTROLS (NEW!)
        const questionIdElement = document.querySelector(".question-id");
        if (questionIdElement) {
            questionIdElement.textContent = `ID: ${question.id}`;
        }

        // Question title (back to original simple approach)
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
            userAnswer = this.getUserMultipleChoiceAnswers(container);
            isCorrect = this.checkMultipleChoice(question, container);
        } else if (question.type === "matching") {
            userAnswer = this.getUserMatchingAnswers(container, question);
            isCorrect = this.checkMatching(question, container);
        }

        // Store detailed user answer
        this.userAnswers[this.currentIndex] = {
            question: question,
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

    // Get user's multiple choice answers
    getUserMultipleChoiceAnswers(container) {
        const inputs = container.querySelectorAll("input");
        const selectedChoices = [];
        
        inputs.forEach(input => {
            if (input.checked) {
                selectedChoices.push(input.value);
            }
        });
        
        return selectedChoices;
    }

    // Get user's matching answers
    getUserMatchingAnswers(container, question) {
        const selects = container.querySelectorAll("select");
        const answers = [];
        
        selects.forEach((select, index) => {
            if (question.details.pairs) {
                answers.push({
                    left: question.details.pairs[index].left,
                    userRight: select.value,
                    correctRight: question.details.pairs[index].right
                });
            } else if (question.details.groups) {
                answers.push({
                    item: question.details.items[index].text,
                    userGroup: select.value,
                    correctGroup: question.details.items[index].group
                });
            }
        });
        
        return answers;
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
        const incorrectCount = this.questions.length - this.score;
        
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
                        <div class="score-value">${incorrectCount}</div>
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
                <div class="results-actions">
                    <button class="btn" id="retakeSameButton">🔄 Retake Same Quiz</button>
                    <button class="btn" onclick="location.reload()">Take New Quiz</button>
                    <button class="btn" id="reviewButton">Review Answers</button>
                </div>
            </div>
        `;

        // Add event listener for retake same quiz button
        document.getElementById("retakeSameButton").addEventListener("click", () => this.retakeSameQuiz());

        // Add event listener for review button
        document.getElementById("reviewButton").addEventListener("click", () => this.showReview());

        // Hide controls
        document.getElementById("submitButton").classList.add("hidden");
        document.getElementById("nextButton").classList.add("hidden");
        document.querySelector(".quiz-controls").style.display = "none";
    }

    // Retake the same quiz with reshuffled choices
    retakeSameQuiz() {
        // Reset to quiz view
        document.querySelector(".quiz-controls").style.display = "flex";
        
        // Restart with the same questions (choices will be reshuffled when displayed)
        this.startQuiz(true);
    }

    showReview(filter = 'all') {
        const container = document.getElementById("quiz-question");
        const incorrectCount = this.questions.length - this.score;
        
        let questionsToShow = this.userAnswers;
        if (filter === 'incorrect') {
            questionsToShow = this.userAnswers.filter(answer => !answer.isCorrect);
        } else if (filter === 'correct') {
            questionsToShow = this.userAnswers.filter(answer => answer.isCorrect);
        }
        
        container.innerHTML = `
            <div class="review-container">
                <div class="review-header">
                    <h2 class="review-title">📋 Review Your Answers</h2>
                    <p style="color: var(--color-text-light); margin-bottom: var(--spacing-lg);">
                        ${this.score} correct, ${incorrectCount} incorrect out of ${this.questions.length} questions
                    </p>
                    <div class="review-filter">
                        <button class="filter-btn ${filter === 'all' ? 'active' : ''}" data-filter="all">
                            All Questions (${this.userAnswers.length})
                        </button>
                        <button class="filter-btn ${filter === 'incorrect' ? 'active' : ''}" data-filter="incorrect">
                            Incorrect Only (${incorrectCount})
                        </button>
                        <button class="filter-btn ${filter === 'correct' ? 'active' : ''}" data-filter="correct">
                            Correct Only (${this.score})
                        </button>
                    </div>
                </div>
                <div class="review-questions" id="review-content">
                    ${questionsToShow.map((answer, index) => this.renderReviewQuestion(answer, index)).join('')}
                </div>
                <div style="text-align: center; margin-top: var(--spacing-3xl); display: flex; gap: var(--spacing-md); justify-content: center; flex-wrap: wrap;">
                    <button class="btn" id="retakeSameFromReview">🔄 Retake Same Quiz</button>
                    <button class="btn" id="exportPdfButton">📄 Export to PDF</button>
                    <button class="btn btn-secondary" onclick="location.reload()">Take New Quiz</button>
                </div>
            </div>
        `;
        
        // Add event listener for retake same quiz from review
        document.getElementById('retakeSameFromReview').addEventListener('click', () => {
            this.retakeSameQuiz();
        });
        
        // Add event listeners for filter buttons
        container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newFilter = e.target.dataset.filter;
                this.showReview(newFilter);
            });
        });
        
        // Add event listener for PDF export
        document.getElementById('exportPdfButton').addEventListener('click', () => {
            this.exportToPDF();
        });
    }

    renderReviewQuestion(answer, index) {
        const question = answer.question;
        const isCorrect = answer.isCorrect;
        const statusClass = isCorrect ? 'correct' : 'incorrect';
        const statusText = isCorrect ? '✓ Correct' : '✗ Incorrect';
        const questionNumber = this.userAnswers.indexOf(answer) + 1;
        
        let choicesHtml = '';
        
        if (question.type === "multiple_choice") {
            choicesHtml = this.renderReviewMultipleChoice(question, answer);
        } else if (question.type === "matching") {
            choicesHtml = this.renderReviewMatching(question, answer);
        }
        
        return `
            <div class="review-question-card ${statusClass}">
                <div class="review-card-header">
                    <span class="review-question-number">Question ${questionNumber} • ID: ${question.id}</span>
                    <span class="review-status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="review-question-text">${question.question}</div>
                ${question.image ? `<img src="${question.image}" alt="Question image" class="review-question-image">` : ''}
                ${choicesHtml}
            </div>
        `;
    }

    renderReviewMultipleChoice(question, answer) {
        const userAnswers = answer.userAnswer || [];
        const correctIndices = question.details.correct;
        
        return `
            <div class="review-choices">
                ${question.details.choices.map((choice, index) => {
                    const isUserAnswer = userAnswers.includes(choice);
                    const isCorrectAnswer = correctIndices.includes(index);
                    
                    let choiceClass = '';
                    let icon = '';
                    let label = '';
                    
                    if (isCorrectAnswer && isUserAnswer) {
                        choiceClass = 'correct-answer';
                        icon = '✓';
                        label = '<span class="review-choice-label label-correct">Correct Answer</span>';
                    } else if (isCorrectAnswer && !isUserAnswer) {
                        choiceClass = 'correct-answer';
                        icon = '✓';
                        label = '<span class="review-choice-label label-correct">Correct Answer</span>';
                    } else if (!isCorrectAnswer && isUserAnswer) {
                        choiceClass = 'your-incorrect';
                        icon = '✗';
                        label = '<span class="review-choice-label label-incorrect">Your Answer</span>';
                    } else {
                        icon = '';
                    }
                    
                    return `
                        <div class="review-choice ${choiceClass}">
                            <span class="review-choice-icon">${icon}</span>
                            <span class="review-choice-text">${choice}</span>
                            ${label}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderReviewMatching(question, answer) {
        const userAnswers = answer.userAnswer || [];
        
        return `
            <div class="review-matching">
                ${userAnswers.map((item, index) => {
                    const isCorrect = item.userRight ? 
                        (item.userRight === item.correctRight) : 
                        (item.userGroup === item.correctGroup);
                    
                    const statusClass = isCorrect ? 'correct' : 'incorrect';
                    const statusIcon = isCorrect ? '✓' : '✗';
                    
                    let statusText = '';
                    if (!isCorrect) {
                        if (item.userRight) {
                            statusText = `Your answer: "${item.userRight}" | Correct: "${item.correctRight}"`;
                        } else {
                            statusText = `Your answer: "${item.userGroup}" | Correct: "${item.correctGroup}"`;
                        }
                    }
                    
                    return `
                        <div class="review-matching-item ${statusClass}">
                            <div class="review-matching-pair">
                                <div class="review-matching-left">
                                    <strong>${item.left || item.item}</strong>
                                </div>
                                <span class="review-matching-arrow">→</span>
                                <div class="review-matching-right">
                                    ${item.correctRight || item.correctGroup}
                                </div>
                                <span class="review-choice-icon">${statusIcon}</span>
                            </div>
                            ${statusText ? `<div class="review-matching-status ${statusClass}">${statusText}</div>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    async exportToPDF() {
        const button = document.getElementById('exportPdfButton');
        const originalText = button.textContent;
        
        // Show loading state
        button.textContent = '⏳ Generating PDF...';
        button.disabled = true;
        
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - (2 * margin);
            let yPosition = margin;
            
            // Add header
            pdf.setFontSize(18);
            pdf.setFont(undefined, 'bold');
            pdf.text(this.quizData.title || 'Quiz Review', margin, yPosition);
            yPosition += 10;
            
            // Add summary
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'normal');
            const percentage = Math.round((this.score / this.questions.length) * 100);
            const incorrectCount = this.questions.length - this.score;
            
            pdf.text(`Score: ${this.score}/${this.questions.length} (${percentage}%)`, margin, yPosition);
            yPosition += 7;
            pdf.text(`Correct: ${this.score} | Incorrect: ${incorrectCount}`, margin, yPosition);
            yPosition += 10;
            
            // Add separator line
            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 10;
            
            // Add each question
            for (let i = 0; i < this.userAnswers.length; i++) {
                const answer = this.userAnswers[i];
                const question = answer.question;
                
                // Check if we need a new page
                if (yPosition > pageHeight - 40) {
                    pdf.addPage();
                    yPosition = margin;
                }
                
                // Question number and status
                pdf.setFontSize(11);
                pdf.setFont(undefined, 'bold');
                const status = answer.isCorrect ? 'CORRECT' : 'INCORRECT';
                const statusColor = answer.isCorrect ? [40, 167, 69] : [220, 53, 69];
                
                pdf.text(`Question ${i + 1} (ID: ${question.id})`, margin, yPosition);
                pdf.setTextColor(...statusColor);
                pdf.text(status, pageWidth - margin - 30, yPosition);
                pdf.setTextColor(0, 0, 0);
                yPosition += 7;
                
                // Question text
                pdf.setFontSize(10);
                pdf.setFont(undefined, 'normal');
                const questionLines = pdf.splitTextToSize(question.question, contentWidth);
                pdf.text(questionLines, margin, yPosition);
                yPosition += questionLines.length * 5 + 5;
                
                // Add choices/answers
                if (question.type === "multiple_choice") {
                    yPosition = this.addMultipleChoiceToPDF(pdf, question, answer, margin, yPosition, contentWidth, pageHeight);
                } else if (question.type === "matching") {
                    yPosition = this.addMatchingToPDF(pdf, question, answer, margin, yPosition, contentWidth, pageHeight);
                }
                
                // Add spacing between questions
                yPosition += 10;
            }
            
            // Save the PDF
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `quiz-review-${timestamp}.pdf`;
            pdf.save(filename);
            
            // Reset button
            button.textContent = originalText;
            button.disabled = false;
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    addMultipleChoiceToPDF(pdf, question, answer, margin, yPosition, contentWidth, pageHeight) {
        const userAnswers = answer.userAnswer || [];
        const correctIndices = question.details.correct;
        
        pdf.setFontSize(9);
        
        question.details.choices.forEach((choice, index) => {
            const isUserAnswer = userAnswers.includes(choice);
            const isCorrectAnswer = correctIndices.includes(index);
            
            // Check if we need a new page
            if (yPosition > pageHeight - 30) {
                pdf.addPage();
                yPosition = margin;
            }
            
            let prefix = '  () ';
            let color = [0, 0, 0];
            
            if (isCorrectAnswer && isUserAnswer) {
                prefix = '  (/) ';
                color = [40, 167, 69]; // Green
            } else if (isCorrectAnswer && !isUserAnswer) {
                prefix = '  (/) ';
                color = [40, 167, 69]; // Green
            } else if (!isCorrectAnswer && isUserAnswer) {
                prefix = '  (X) ';
                color = [220, 53, 69]; // Red
            }
            
            pdf.setTextColor(...color);
            const choiceLines = pdf.splitTextToSize(prefix + choice, contentWidth - 5);
            pdf.text(choiceLines, margin + 2, yPosition);
            pdf.setTextColor(0, 0, 0);
            
            yPosition += choiceLines.length * 4 + 2;
        });
        
        return yPosition;
    }

    addMatchingToPDF(pdf, question, answer, margin, yPosition, contentWidth, pageHeight) {
        const userAnswers = answer.userAnswer || [];
        
        pdf.setFontSize(9);
        
        userAnswers.forEach((item) => {
            // Check if we need a new page
            if (yPosition > pageHeight - 30) {
                pdf.addPage();
                yPosition = margin;
            }
            
            const isCorrect = item.userRight ? 
                (item.userRight === item.correctRight) : 
                (item.userGroup === item.correctGroup);
            
            const prefix = isCorrect ? '  (/) ' : '  (X) ';
            const color = isCorrect ? [40, 167, 69] : [220, 53, 69];
            
            const leftText = item.left || item.item;
            const correctAnswer = item.correctRight || item.correctGroup;
            
            pdf.setTextColor(...color);
            pdf.text(prefix + leftText + ' -> ' + correctAnswer, margin + 2, yPosition);
            yPosition += 5;
            
            if (!isCorrect) {
                const userAnswer = item.userRight || item.userGroup;
                pdf.setFontSize(8);
                pdf.text(`    Your answer: ${userAnswer}`, margin + 2, yPosition);
                yPosition += 4;
                pdf.setFontSize(9);
            }
            
            pdf.setTextColor(0, 0, 0);
            yPosition += 2;
        });
        
        return yPosition;
    }
}

// Initialize the quiz app when the page loads
document.addEventListener("DOMContentLoaded", () => {
    new QuizApp();
});