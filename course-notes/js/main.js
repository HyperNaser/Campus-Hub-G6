document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://9fe7eed7-4ecf-4809-b752-f8e8e6039397-00-2h1jkabbnlubw.pike.replit.dev/notes.php"
  const notesSection = document.querySelector("main section")
  const searchInput = document.querySelector("input[name='search']")
  const filterSelect = document.querySelector("select[name='filter']")
  const sortSelect = document.querySelector("select[name='sort']")
  const paginationNav = document.querySelector(".pagination")

  let notes = []
  let filteredNotes = []
  let currentPage = 1
  const pageSize = 5

  async function fetchNotes() {
    notesSection.innerHTML = "<p>Loading notes...</p>"

    try {
      const res = await fetch(`${API_URL}`)
      if (!res.ok) {
        throw new Error("Failed to fetch notes")
      }

      const data = await res.json()
      notes = data
      filteredNotes = [...notes]

      renderNotes()
      renderPagination()
      populateFilterOptions()
    } catch (err) {
      notesSection.innerHTML = `<p style="color:red;">${err.message}</p>`
    }
  }

  function renderNotes() {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    const pageItems = filteredNotes.slice(start, end)

    if (pageItems.length === 0) {
      notesSection.innerHTML = "<p>No notes found.</p>"
      return
    }

    notesSection.innerHTML = pageItems.map(note => `
      <article>
        <h3><a href="detail.html?id=${note.id}">${note.title}</a></h3>
        <p><strong>Course:</strong> ${note.course_code}</p>
        <p>${note.description || ''}</p>
        <small>Uploaded: ${note.note_date}</small>
      </article>
      <hr />
    `).join("")
  }

  function renderPagination() {
    const totalPages = Math.ceil(filteredNotes.length / pageSize)
    if (totalPages <= 1) {
      paginationNav.classList.add("hidden")
      return
    }

    paginationNav.classList.remove("hidden")
    paginationNav.innerHTML = `
      <li><a href="#" class="secondary" data-page="prev">Prev</a></li>
      ${Array.from({ length: totalPages }, (_, i) => `
        <li><a href="#" class="${currentPage === i + 1 ? 'contrast' : ''}" data-page="${i + 1}">${i + 1}</a></li>
      `).join('')}
      <li><a href="#" data-page="next">Next</a></li>
    `

    paginationNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault()
        const target = e.target.getAttribute("data-page")
        const totalPages = Math.ceil(filteredNotes.length / pageSize)

        if (target === "prev" && currentPage > 1) {
          currentPage--
        } else if (target === "next" && currentPage < totalPages) {
          currentPage++
        } else if (!isNaN(target)) {
          currentPage = Number(target)
        }

        renderNotes()
        renderPagination()
      })
    })
  }

  function applyFilters() {
    const query = searchInput.value.toLowerCase()
    const courseFilter = filterSelect.value
    const sortOrder = sortSelect.value

    filteredNotes = notes.filter(note => {
      const matchText = note.title.toLowerCase().includes(query) ||
                        (note.description && note.description.toLowerCase().includes(query))

      const matchCourse = courseFilter === "All Courses" || note.course_code === courseFilter

      return matchText && matchCourse
    })

    if (sortOrder === "Newest First") {
      filteredNotes.sort((a, b) => new Date(b.note_date) - new Date(a.note_date))
    } else {
      filteredNotes.sort((a, b) => new Date(a.note_date) - new Date(b.note_date))
    }

    currentPage = 1
    renderNotes()
    renderPagination()
  }

  function populateFilterOptions() {
    const courses = [...new Set(notes.map(n => n.course_code))]

    filterSelect.innerHTML = '<option>All Courses</option>'
    courses.forEach(c => {
      const opt = document.createElement("option")
      opt.textContent = c
      opt.value = c
      filterSelect.appendChild(opt)
    })
  }

  searchInput.addEventListener("input", applyFilters)
  filterSelect.addEventListener("change", applyFilters)
  sortSelect.addEventListener("change", applyFilters)

  fetchNotes()
})
