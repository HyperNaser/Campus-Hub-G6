document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://jsonplaceholder.typicode.com/users";
    const notesSection = document.querySelector("main section");
    const searchInput = document.querySelector("input[name='search']");
    const filterSelect = document.querySelector("select[name='filter']");
    const sortSelect = document.querySelector("select[name='sort']");
    const paginationNav = document.querySelector(".pagination");
  
    let users = [];
    let filteredUsers = [];
    let currentPage = 1;
    const pageSize = 5;
  
    const courseOptions = ["CS101", "MATH202", "ENG103", "BIO104", "HIST205"];
  
    const mapCourseData = (data) => {
      return data.map((user) => ({
        id: user.id,
        title: `${user.name} (${user.username})`,
        course: courseOptions[Math.floor(Math.random() * courseOptions.length)],
        description: `${user.email} - ${user.company.name}`,
        date: new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000).toISOString().split("T")[0]
      }));
    };
  
    async function fetchUsers() {
      notesSection.innerHTML = "<p>Loading users...</p>";
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        users = mapCourseData(data);
        filteredUsers = users;
        renderUsers();
        renderPagination();
      } catch (err) {
        notesSection.innerHTML = `<p style='color:red;'>Error: ${err.message}</p>`;
      }
    }
  
    const renderUsers = () => {
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      const pageItems = filteredUsers.slice(start, end);
  
      if (pageItems.length === 0) {
        notesSection.innerHTML = "<p>No users found.</p>";
        return;
      }
  
      notesSection.innerHTML = pageItems.map(user => `
        <article>
          <h3><a href="detail.html?id=${user.id}">${user.title}</a></h3>
          <p><strong>Course:</strong> ${user.course}</p>
          <p>${user.description}</p>
          <small>Uploaded: ${user.date}</small>
        </article>
        <hr />
      `).join("");
    };
  
    function renderPagination() {
      const totalPages = Math.ceil(filteredUsers.length / pageSize);
      if (totalPages <= 1) return paginationNav.classList.add("hidden");
  
      paginationNav.innerHTML = `
        <li><a href="#" class="secondary" data-page="prev">Prev</a></li>
        ${Array.from({ length: totalPages }, (_, i) => `
          <li><a href="#" class="${currentPage === i + 1 ? 'contrast' : ''}" data-page="${i + 1}">${i + 1}</a></li>
        `).join('')}
        <li><a href="#" data-page="next">Next</a></li>
      `;
  
      paginationNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const target = e.target.getAttribute("data-page");
          const totalPages = Math.ceil(filteredUsers.length / pageSize);
          if (target === "prev" && currentPage > 1) currentPage--;
          else if (target === "next" && currentPage < totalPages) currentPage++;
          else if (!isNaN(target)) currentPage = Number(target);
          renderUsers();
          renderPagination();
        });
      });
    }
  
    function applyFilters() {
      const query = searchInput.value.toLowerCase();
      const courseFilter = filterSelect.value;
      const sortOrder = sortSelect.value;
  
      filteredUsers = users.filter(user => {
        const matchesSearch = user.title.toLowerCase().includes(query) ||
                              user.description.toLowerCase().includes(query);
        const matchesCourse = courseFilter === "All Courses" || user.course === courseFilter;
        return matchesSearch && matchesCourse;
      });
  
      if (sortOrder === "Newest First") {
        filteredUsers.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else {
        filteredUsers.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
  
      currentPage = 1;
      renderUsers();
      renderPagination();
    }
  
    searchInput.addEventListener("input", applyFilters);
    filterSelect.addEventListener("change", applyFilters);
    sortSelect.addEventListener("change", applyFilters);
  
    fetchUsers();
  });
  