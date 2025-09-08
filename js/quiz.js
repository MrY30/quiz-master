document.addEventListener("DOMContentLoaded", () => {
  const quizContainer = document.getElementById("quiz-container");
  const addCard = document.getElementById("add-card");

  // Fetch quizzes list (manifest)
  fetch("/json/quizzes.json")
    .then(res => res.json())
    .then(quizzes => {
      // Remove any demo cards (like "Hello", "World")
      quizContainer.innerHTML = "";
      quizContainer.appendChild(addCard);

      quizzes.forEach(q => {
        const card = document.createElement("div");
        card.classList.add("quiz-card");
        card.textContent = q.title;

        // Load quiz JSON when clicked
        card.addEventListener("click", () => {
          fetch(`/json/${q.file}`)
            .then(r => r.json())
            .then(data => {
              console.log("Loaded quiz:", data);

              // Example: Show quiz title in an alert
              alert(`Loaded ${data.title} with ${data.questions.length} questions`);

              // TODO: Replace alert with your modal start logic
            })
            .catch(err => console.error("Error loading quiz:", err));
        });

        quizContainer.appendChild(card);
      });
    })
    .catch(err => console.error("Error loading quizzes manifest:", err));
});
