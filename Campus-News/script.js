const state = {
    currentPage: 1,
    itemsPerPage: 6,
    currentFilter: 'All Categories',
    searchQuery: '',
    currentSort: 'Most Recent',
    baseUrl: 'https://c7e6f354-c368-4b25-9fcc-5750ab6dd01d-00-a5wp4x8axjzp.pike.replit.dev/api.php'
};

async function fetchArticles() {
    try {
        showLoadingState();
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
        const articles = Array.isArray(result.data) ? result.data : [];
        state.allArticles = articles;
         
        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const endIndex = startIndex + state.itemsPerPage;
        const paginatedArticles = articles.slice(startIndex, endIndex);
        
        renderArticles(paginatedArticles, articles.length);
    } catch (error) {
        showErrorState(error);
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

document.querySelector('.filter').addEventListener('change', (e) => {
    state.currentFilter = e.target.value;
    state.currentPage = 1;
    fetchArticles();
});

document.querySelector('.search input[type="search"]').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        state.searchQuery = e.target.value.trim();
        state.currentPage = 1;
        fetchArticles();
    }
});

function resetFilters() {
    state.currentFilter = 'All Categories';
    state.searchQuery = '';
    state.currentPage = 1;
    state.currentSort = 'Most Recent';
    
    document.querySelector('.filter').value = state.currentFilter;
    document.querySelector('.search input[type="search"]').value = '';
    document.querySelector('.sort').value = state.currentSort;
    
    fetchArticles();
}

document.querySelector('.search-container').insertAdjacentHTML('beforeend', `
    <button class="btn btn-outline-secondary" onclick="resetFilters()">
        Reset Filters
    </button>
`);

document.querySelector('.pagination').addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.classList.contains('page-link')) {
        const newPage = parseInt(e.target.dataset.page);
        if (newPage && newPage !== state.currentPage) {
            state.currentPage = newPage;
            fetchArticles();
        }
    }
});

document.querySelector('.sort').addEventListener('change', (e) => {
    state.currentSort = e.target.value;
    state.currentPage = 1;
    fetchArticles();
});

document.getElementById('articles').addEventListener('click', (e) => {
    const viewButton = e.target.closest('.view-article');
    if (viewButton) {
        const articleId = viewButton.dataset.articleId;
        const article = state.articles.find(a => a.id === articleId);
        if (article) {
            showArticleDetail(article);
        }
    }
});

function showArticleDetail(article) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'articleModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${article.title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <span class="badge bg-secondary mb-3">${article.category}</span>
                    <p class="lead">${article.summary}</p>
                    <hr>
                    <div class="article-content">${article.content}</div>
                    <div class="mt-3 text-muted">
                        <small>Popularity: ${article.popularity}</small>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

fetchArticles();
