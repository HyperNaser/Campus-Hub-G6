document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://9fe7eed7-4ecf-4809-b752-f8e8e6039397-00-2h1jkabbnlubw.pike.replit.dev/notes.php"
  const form = document.querySelector("form")

  if (!form) {
    return
  }

  form.addEventListener("submit", async e => {
    e.preventDefault()

    const title = document.getElementById("title").value.trim()
    const course = document.getElementById("course").value.trim()
    const description = document.getElementById("description").value.trim()

    const coursePattern = /^[A-Z]{2,4}[0-9]{3}$/

    if (!title || !coursePattern.test(course)) {
      alert("Please enter a valid title and course code (e.g., CS101)")
      return
    }

    const newNote = {
      title: title,
      course_code: course,
      description: description,
      date: new Date().toISOString().split("T")[0]
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newNote)
      })

      if (!res.ok) {
        throw new Error("Failed to create note")
      }

      alert("Note created successfully")
      window.location.href = "index.html"
    } catch (err) {
      alert("Error: " + err.message)
    }
  })
})
