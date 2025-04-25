document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'https://jsonplaceholder.typicode.com/users';
  const groupSection = document.querySelector('.group-cards');
  const searchInput = document.createElement('input');
  searchInput.classList.add("input-design")
  const loading = document.createElement('p');
  loading.textContent = 'Loading...';
  groupSection.before(searchInput);
  groupSection.before(loading);

  let groups = [];
  let currentPage = 1;
  const itemsPerPage = 6;

  const fetchGroups = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch data');
      groups = await res.json();
      loading.style.display = 'none';
      renderGroups();
    } catch (err) {
      loading.textContent = `Error: ${err.message}`;
    }
  };

  const renderGroups = () => {
    groupSection.innerHTML = '';
    const filtered = groups.filter(g =>
      g.name.toLowerCase().includes(searchInput.value.toLowerCase())
    );
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    paginated.forEach(group => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${group.name}</h3>
        <p>Time: ${group.address.suite}</p>
        <p>Location: ${group.address.city}</p>
        <button onclick="alert('Joining ${group.name}')">Join</button>
      `;
      groupSection.appendChild(card);
    });

    renderPagination(filtered.length);
  };

  const renderPagination = (total) => {
    let pagination = document.getElementById('pagination');
    if (!pagination) {
      pagination = document.createElement('div');
      pagination.id = 'pagination';
      groupSection.after(pagination);
    }
    pagination.innerHTML = '';
    const pageCount = Math.ceil(total / itemsPerPage);
    for (let i = 1; i <= pageCount; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.onclick = () => {
        currentPage = i;
        renderGroups();
      };
      pagination.appendChild(btn);
    }
  };

  searchInput.placeholder = 'Search groups...';
  searchInput.addEventListener('input', () => {
    currentPage = 1;
    renderGroups();
  });

  fetchGroups();
});
