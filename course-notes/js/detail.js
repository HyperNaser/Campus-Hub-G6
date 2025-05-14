document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = "https://9fe7eed7-4ecf-4809-b752-f8e8e6039397-00-2h1jkabbnlubw.pike.replit.dev/notes.php"
  const params = new URLSearchParams(window.location.search)
  const noteId = params.get("id")

  const detailContainer = document.querySelector("main article")

  if (!noteId || !detailContainer) {
    return
  }

  detailContainer.innerHTML = "<p>Loading note details...</p>"

  try {
    const res = await fetch(`${API_URL}?id=${noteId}`)

    if (!res.ok) {
      throw new Error("Failed to fetch note details.")
    }

    const note = await res.json()

    if (!note || !note.id) {
      detailContainer.innerHTML = "<p>Note not found.</p>"
      return
    }

    detailContainer.innerHTML = `
      <h2>${note.title}</h2>
      <p><strong>Course:</strong> ${note.course_code}</p>
      <p><strong>Uploaded:</strong> ${note.note_date}</p>
      <p>${note.description || ''}</p>
      <div class="grid">
        <a href="new.html?id=${note.id}" role="button">Edit</a>
        <button class="secondary" id="deleteBtn">Delete</button>
      </div>
    `

    const commentForm = document.querySelector("form")
    const commentInput = document.getElementById("comment")
    const commentList = document.getElementById("comments")
    const COMMENTS_API = "https://9fe7eed7-4ecf-4809-b752-f8e8e6039397-00-2h1jkabbnlubw.pike.replit.dev/comment.php"

  if (commentInput && commentForm && commentList) {
  commentInput.disabled = false
  commentForm.querySelector("button").disabled = false

  commentForm.addEventListener("submit", async e => {
    e.preventDefault()

    const text = commentInput.value.trim()
    if (!text) {
      alert("Please enter a comment")
      return
    }

    try {
      const res = await fetch(COMMENTS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note_id: noteId,
          text: text
        })
      })

      if (!res.ok) {
        throw new Error("Failed to submit comment")
      }

      commentInput.value = ""
      loadComments()
    } catch (err) {
      alert("Error: " + err.message)
    }
  })

  async function loadComments() {
    try {
      const res = await fetch(`${COMMENTS_API}?note_id=${noteId}`)
      if (!res.ok) {
        throw new Error("Failed to fetch comments")
      }

      const comments = await res.json()
      if (!Array.isArray(comments) || comments.length === 0) {
        commentList.innerHTML = "<p>No comments yet.</p>"
        return
      }

      commentList.innerHTML = comments.map(c => `
        <article>
          <p><strong>${c.author}</strong> · ${c.comment_date}</p>
          <p>${c.text}</p>
        </article>
      `).join("")
    } catch (err) {
      commentList.innerHTML = `<p style="color:red;">${err.message}</p>`
    }
  }

  loadComments()
}


    const deleteBtn = document.getElementById("deleteBtn")

    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        const confirmDelete = confirm("Are you sure you want to delete this note?")
        if (!confirmDelete) {
          return
        }

        try {
          const res = await fetch(`${API_URL}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `id=${note.id}`
          })

          if (!res.ok) {
            throw new Error("Failed to delete note.")
          }

          alert("Note deleted successfully.")
          window.location.href = "index.html"
        } catch (err) {
          alert("Error: " + err.message)
        }
      })
    }
  } catch (err) {
    detailContainer.innerHTML = `<p style="color:red;">${err.message}</p>`
  }
})
