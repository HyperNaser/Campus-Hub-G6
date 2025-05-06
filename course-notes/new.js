document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
  
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const title = form.querySelector("#title").value.trim();
      const course = form.querySelector("#course").value.trim();
      const description = form.querySelector("#description").value.trim();
  
      const coursePattern = /^[A-Z]{2,4}[0-9]{3}$/;
  
      if (!title || !coursePattern.test(course)) {
        alert("Please provide a valid title and course code (e.g., CS101).");
        return;
      }
  
      const newNote = {
        id: Date.now(),
        title,
        course,
        description,
        date: new Date().toISOString().split("T")[0],
      };
  
      const savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
      savedNotes.push(newNote);
      localStorage.setItem("notes", JSON.stringify(savedNotes));
  
      alert("Note added successfully!");
  
      window.location.href = "index.html";
    });
  });
  