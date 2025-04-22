const state = {
    articles: [],
    currentPage: 1,
    itemsPerPage: 6,
    currentFilter: 'All Categories',
    searchQuery: '',
    currentSort: 'Most Recent'  // Add this line
};

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        throw new Error('Fetch error: ' + error.message);
    }
}

function showLoadingState() {
    const articleSection = document.getElementById("articles");
    articleSection.innerHTML = `
        <div class="text-center my-5">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Loading articles...</p>
        </div>`;
}

function showErrorState(error) {
    const articleSection = document.getElementById("articles");
    articleSection.innerHTML = `
        <div class="alert alert-danger" role="alert">
            Error loading articles: ${error.message}
        </div>`;
}

function renderArticles(filteredArticles) {
    const articleSection = document.getElementById("articles");
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    const articlesToShow = filteredArticles.slice(startIndex, endIndex);

    articleSection.innerHTML = articlesToShow.map(article => `
        <article class="card mb-3">
            <div class="card-body">
                <h2 class="card-title">${article.title}</h2>
                <p class="card-text">${article.summary}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <a href="#" class="btn btn-primary">Read More</a>
                    <span class="badge bg-secondary">${article.category}</span>
                </div>
            </div>
        </article>
    `).join('');

    updatePagination(filteredArticles.length);
}

function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / state.itemsPerPage);
    const pagination = document.querySelector('.pagination');
    
    let paginationHTML = `
        <li class="page-item ${state.currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${state.currentPage - 1}">Previous</a>
        </li>`;

    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === state.currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>`;
    }

    paginationHTML += `
        <li class="page-item ${state.currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${state.currentPage + 1}">Next</a>
        </li>`;

    pagination.innerHTML = paginationHTML;
}

function filterAndSearchArticles() {
    let filtered = [...state.articles];

    // Apply category filter
    if (state.currentFilter !== 'All Categories') {
        filtered = filtered.filter(article => article.category === state.currentFilter);
    }

    // Apply search
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(article => 
            article.title.toLowerCase().includes(query) || 
            article.summary.toLowerCase().includes(query)
        );
    }

    // Apply sorting
    return sortArticles(filtered);
}

function sortArticles(articles) {
    const sortedArticles = [...articles];
    
    switch(state.currentSort) {
        case 'Most Popular':
            return sortedArticles.sort((a, b) => b.popularity - a.popularity);
        case 'Alphabetical':
            return sortedArticles.sort((a, b) => a.title.localeCompare(b.title));
        case 'Most Recent':
        default:
            return sortedArticles; // Assuming articles are already sorted by date in the API
    }
}

// Event Listeners
document.querySelector('.filter').addEventListener('change', (e) => {
    state.currentFilter = e.target.value;
    state.currentPage = 1;
    renderArticles(filterAndSearchArticles());
});

document.querySelector('.search input[type="search"]').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        state.searchQuery = e.target.value;
        state.currentPage = 1;
        renderArticles(filterAndSearchArticles());
    }
});

document.querySelector('.pagination').addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.classList.contains('page-link')) {
        const newPage = parseInt(e.target.dataset.page);
        if (newPage && newPage !== state.currentPage) {
            state.currentPage = newPage;
            renderArticles(filterAndSearchArticles());
        }
    }
});

document.querySelector('.sort').addEventListener('change', (e) => {
    state.currentSort = e.target.value;
    state.currentPage = 1;
    renderArticles(filterAndSearchArticles());
});

async function initializeNews() {
    const URL = "https://my-json-server.typicode.com/HyperNaser/CampusNewsMockAPI/db";
    
    try {
        showLoadingState();
        state.articles = await fetchData(URL);
        state.articles = state.articles.news;
        renderArticles(state.articles);
    } catch (error) {
        showErrorState(error);
    }
}

// Initialize the page
initializeNews();
