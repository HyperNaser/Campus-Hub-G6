import { showArticleDetail } from './modal.js';

const DEFAULT_STATE = {
    currentPage: 1,
    itemsPerPage: 6,
    currentFilter: 'All Categories',
    searchQuery: '',
    currentSort: 'Most Recent'
};

const state = { ...DEFAULT_STATE }; // Initialize state with default values

function resetState() { // Reset state to default values
    Object.assign(state, DEFAULT_STATE);
    updateUI();
}

function updateUI() { // Update UI elements based on the current state
    document.querySelector('.filter').value = state.currentFilter;
    document.querySelector('.search input[type="search"]').value = state.searchQuery;
    document.querySelector('.sort').value = state.currentSort;
    fetchArticles();
}

state.baseUrl = 'https://c7e6f354-c368-4b25-9fcc-5750ab6dd01d-00-a5wp4x8axjzp.pike.replit.dev/api.php';

async function fetchArticles() {
    showLoadingState();
    
    try {
        const url = new URL(state.baseUrl);

        if (state.searchQuery) {
            url.searchParams.append('search', state.searchQuery);
        }
        
        if (state.currentSort !== 'Most Recent') {
            url.searchParams.append('sort', state.currentSort);
        }
        
        if (state.currentFilter !== 'All Categories') {
            url.searchParams.append('category', state.currentFilter.toLowerCase());
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const result = await response.json();

        // Check if the response is not empty
        const articles = Array.isArray(result.data) ? result.data : [];

        state.allArticles = articles;
        
        // Calculate the start index for pagination (1-based index to 0-based index)
        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const endIndex = startIndex + state.itemsPerPage;
        const paginatedArticles = articles.slice(startIndex, endIndex);
        
        renderArticles(paginatedArticles, articles.length);

    } catch (error) {
        console.error('Fetch error:', error);
        const articleSection = document.getElementById("articles");
        articleSection.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Error Loading Articles</h4>
                <p>${error.message}</p>
                <hr>
                <button class="btn btn-outline-danger" onclick="window.location.reload()">
                    <i class="fa fa-refresh"></i> Retry
                </button>
            </div>
        `;
        updatePagination(0); // Reset pagination when there's an error
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

function renderArticles(articles, totalItems) {
    const articleSection = document.getElementById("articles");
    
    if (articles.length === 0) {
        articleSection.innerHTML = `
            <div class="text-center my-5">
                <div class="alert alert-info" role="alert">
                    <h4 class="alert-heading">No Articles Found</h4>
                    <p>No articles match your current search criteria.</p>
                    <hr>
                    <p class="mb-0">Try adjusting your filters or search terms.</p>
                </div>
            </div>`;
        updatePagination(0);
        return;
    }

    // Map through the articles and create HTML for each
    articleSection.innerHTML = articles.map(article => `
        <article class="card mb-3">
            <div class="card-body">
                <h2 class="card-title">${article.title}</h2>
                <p class="card-text">${article.summary}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <button class="btn btn-primary view-article" data-article-id="${article.id}">Read More</button>
                    <span class="badge bg-secondary">${article.category}</span>
                </div>
            </div>
        </article>
    `).join('');

    updatePagination(totalItems);
}

function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / state.itemsPerPage);
    const pagination = document.querySelector('.pagination');
    
    // define the Previous button
    let paginationHTML = `
        <li class="page-item ${state.currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${state.currentPage - 1}">Previous</a>
        </li>`;

    // Generate page numbers
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === state.currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>`;
    }

    // define the Next button
    paginationHTML += `
        <li class="page-item ${state.currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${state.currentPage + 1}">Next</a>
        </li>`;

    pagination.innerHTML = paginationHTML;
}

// Add event listener for filter
document.querySelector('.filter').addEventListener('change', (e) => {
    state.currentFilter = e.target.value;
    state.currentPage = 1;
    fetchArticles();
});

// Add event listener for search input
document.querySelector('.search input[type="search"]').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        state.searchQuery = e.target.value.trim();
        state.currentPage = 1;
        fetchArticles();
    }
});

// Add event listener for reset filters button
document.querySelector('#reset-filters').addEventListener('click', resetState);

// Add event listener for pagination
document.querySelector('.pagination').addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.classList.contains('page-link')) { // Check if the clicked element is a page link
        const newPage = parseInt(e.target.dataset.page); // Get the new page number from the data attribute
        if (newPage && newPage !== state.currentPage) {
            state.currentPage = newPage;
            fetchArticles();
        }
    }
});

// Add event listener for sorting
document.querySelector('.sort').addEventListener('change', (e) => {
    state.currentSort = e.target.value;
    state.currentPage = 1;
    fetchArticles();
});

// Add event listener for article detail modal
document.getElementById('articles').addEventListener('click', (e) => {
    const viewButton = e.target.closest('.view-article'); 
    if (viewButton) {
        const articleId = viewButton.dataset.articleId;
        const article = state.allArticles.find(a => a.id === articleId);
        if (article) {
            showArticleDetail(article, state.baseUrl);
        }
    }
});

document.addEventListener('ArticleListModification', () => {
    fetchArticles();
});

fetchArticles();
