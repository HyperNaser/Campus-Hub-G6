class CourseReviewApp {
    constructor() {
        this.config = {
            apiUrl: 'https://680d01702ea307e081d5b46a.mockapi.io/courses',
            itemsPerPage: 6
        };

        this.elements = {
            coursesContainer: document.getElementById('coursesContainer'),
            loadingState: document.getElementById('loadingState'),
            errorState: document.getElementById('errorState'),
            retryButton: document.getElementById('retryButton'),
            searchInput: document.getElementById('searchInput'),
            searchButton: document.getElementById('searchButton'),
            resetSearchButton: document.getElementById('resetSearchButton'),
            departmentFilter: document.getElementById('departmentFilter'),
            sortBy: document.getElementById('sortBy'),
            reviewForm: document.getElementById('reviewForm'),
            paginationContainer: document.getElementById('paginationContainer'),
            deleteButton: document.getElementById('deleteButton'),
            courseModal: this.createModalElement()
        };

        this.state = {
            courses: [],
            filteredCourses: [],
            currentPage: 1,
            isLoading: false,
            error: null,
            filters: {
                searchQuery: '',
                department: 'all',
                sortBy: 'newest'
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCourses();
        document.body.appendChild(this.elements.courseModal);
    }

    setupEventListeners() {
        this.elements.searchButton.addEventListener('click', () => this.handleSearch());
        this.elements.resetSearchButton.addEventListener('click', () => this.resetSearch());
        this.elements.searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        this.elements.departmentFilter.addEventListener('change', (e) => {
            this.state.filters.department = e.target.value;
            this.applyFilters();
        });
        this.elements.sortBy.addEventListener('change', (e) => {
            this.state.filters.sortBy = e.target.value;
            this.applyFilters();
        });

        this.elements.retryButton.addEventListener('click', () => this.loadCourses());

        this.elements.reviewForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.elements.deleteButton.addEventListener('click', () => this.deleteAllCourses());

        const formInputs = this.elements.reviewForm.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.validateField(e.target);
            });
        });
    }

    createModalElement() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'courseModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalTitle"></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="modalBody"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    async loadCourses() {
        try {
            this.setLoadingState(true);
            this.state.error = null;

            const response = await fetch(this.config.apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.state.courses = await response.json();
            this.state.currentPage = 1;
            this.applyFilters();
            
        } catch (error) {
            console.error('Failed to load courses:', error);
            this.state.error = error;
            this.showErrorState();
        } finally {
            this.setLoadingState(false);
        }
    }

    handleSearch() {
        this.state.filters.searchQuery = this.elements.searchInput.value.trim().toLowerCase();
        this.state.currentPage = 1;
        this.applyFilters();
    }

    resetSearch() {
        this.elements.searchInput.value = '';
        this.state.filters.searchQuery = '';
        this.state.currentPage = 1;
        this.applyFilters();
    }

    applyFilters() {
        let filteredCourses = [...this.state.courses];

        if (this.state.filters.department !== 'all') {
            filteredCourses = filteredCourses.filter(course => 
                course.department.toLowerCase() === this.state.filters.department.toLowerCase()
            );
        }

        if (this.state.filters.searchQuery) {
            filteredCourses = filteredCourses.filter(course => 
                course.name.toLowerCase().includes(this.state.filters.searchQuery) || 
                course.code.toLowerCase().includes(this.state.filters.searchQuery) ||
                course.instructor.toLowerCase().includes(this.state.filters.searchQuery)
            );
        }

        switch(this.state.filters.sortBy) {
            case 'highest':
                filteredCourses.sort((a, b) => b.rating - a.rating);
                break;
            case 'lowest':
                filteredCourses.sort((a, b) => a.rating - b.rating);
                break;
            case 'newest':
            default:
                filteredCourses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }

        this.state.filteredCourses = filteredCourses;
        this.renderCourses();
        this.renderPagination();
    }

    renderCourses() {
        this.elements.coursesContainer.innerHTML = '';

        if (this.state.filteredCourses.length === 0) {
            this.elements.coursesContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">No courses found matching your criteria.</div>
                </div>
            `;
            return;
        }

        const startIndex = (this.state.currentPage - 1) * this.config.itemsPerPage;
        const paginatedCourses = this.state.filteredCourses.slice(
            startIndex, 
            startIndex + this.config.itemsPerPage
        );

        paginatedCourses.forEach(course => {
            const courseElement = document.createElement('div');
            courseElement.className = 'col-md-6 col-lg-4 mb-3';
            courseElement.innerHTML = this.generateCourseCardHTML(course);
            this.elements.coursesContainer.appendChild(courseElement);
            courseElement.querySelector('.view-details').addEventListener('click', () => {
                this.showCourseDetails(course);
            });
        });
    }

    renderPagination() {
        this.elements.paginationContainer.innerHTML = '';
        
        const totalPages = Math.ceil(this.state.filteredCourses.length / this.config.itemsPerPage);
        if (totalPages <= 1) return;

        const pagination = document.createElement('ul');
        pagination.className = 'pagination';
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${this.state.currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#">&laquo;</a>`;
        prevLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.state.currentPage > 1) {
                this.state.currentPage--;
                this.renderCourses();
                this.renderPagination();
            }
        });
        pagination.appendChild(prevLi);
        for (let i = 1; i <= totalPages; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === this.state.currentPage ? 'active' : ''}`;
            pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageLi.addEventListener('click', (e) => {
                e.preventDefault();
                this.state.currentPage = i;
                this.renderCourses();
                this.renderPagination();
            });
            pagination.appendChild(pageLi);
        }

        // Next button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${this.state.currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#">&raquo;</a>`;
        nextLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.state.currentPage < totalPages) {
                this.state.currentPage++;
                this.renderCourses();
                this.renderPagination();
            }
        });
        pagination.appendChild(nextLi);

        this.elements.paginationContainer.appendChild(pagination);
    }

    generateCourseCardHTML(course) {
        return `
            <div class="card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <h3 class="card-title h5">${course.name}</h3>
                        <span class="badge bg-primary">${course.code}</span>
                    </div>
                    <p class="text-muted">Instructor: ${course.instructor}</p>
                    <div class="mb-2">
                        <div class="stars">
                            ${this.renderStars(course.rating)}
                        </div>
                        <small class="text-muted">${course.rating.toFixed(1)}/5.0 (${course.reviewCount || 0} reviews)</small>
                    </div>
                    ${course.difficulty ? `
                    <div class="mb-2">
                        <span class="badge badge-difficulty ${this.getDifficultyClass(course.difficulty)}">
                            ${this.getDifficultyText(course.difficulty)}
                        </span>
                    </div>` : ''}
                    <p class="card-text">${course.description}</p>
                    <button class="btn btn-sm btn-outline-primary view-details" data-course-id="${course.id}">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }

    showCourseDetails(course) {
        const modalTitle = this.elements.courseModal.querySelector('#modalTitle');
        const modalBody = this.elements.courseModal.querySelector('#modalBody');
        
        modalTitle.textContent = `${course.code} - ${course.name}`;
        
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Instructor:</strong> ${course.instructor}</p>
                    <p><strong>Department:</strong> ${course.department}</p>
                    <div class="mb-3">
                        <strong>Rating:</strong>
                        <div class="stars large-stars">
                            ${this.renderStars(course.rating)}
                        </div>
                        <span>${course.rating.toFixed(1)}/5.0 (${course.reviewCount || 0} reviews)</span>
                    </div>
                    ${course.difficulty ? `
                    <p><strong>Difficulty:</strong>
                        <span class="badge ${this.getDifficultyClass(course.difficulty)}">
                            ${this.getDifficultyText(course.difficulty)}
                        </span>
                    </p>` : ''}
                </div>
                <div class="col-md-6">
                    <h5>Course Description</h5>
                    <p>${course.description}</p>
                    
                    <h5 class="mt-4">Recent Reviews</h5>
                    ${this.generateRecentReviewsHTML(course.reviews || [])}
                </div>
            </div>
        `;
        const modal = new bootstrap.Modal(this.elements.courseModal);
        modal.show();
    }
    generateRecentReviewsHTML(reviews) {
        if (reviews.length === 0) {
            return '<p>No reviews yet. Be the first to review!</p>';
        }
        return `
            <div class="list-group">
                ${reviews.slice(0, 3).map(review => `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between">
                            <strong>${review.title}</strong>
                            <small class="text-muted">${new Date(review.date).toLocaleDateString()}</small>
                        </div>
                        <div class="stars">
                            ${this.renderStars(review.rating)}
                        </div>
                        <p class="mb-1">${review.text}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
    async handleFormSubmit(event) {
        event.preventDefault(); 
        if (!this.validateForm()) {
            return;
        }
        const formData = new FormData(this.elements.reviewForm);
        const reviewData = {
            name: formData.get('courseName'),
            code: formData.get('courseCode'),
            instructor: formData.get('professor'),
            department: formData.get('department'),
            rating: parseInt(formData.get('rating')),
            description: formData.get('reviewText'),
            difficulty: formData.get('difficulty'),
            reviewTitle: formData.get('reviewTitle'),
            createdAt: new Date().toISOString(),
            reviewCount: 1
        };
        try {
            this.setLoadingState(true);
            
            const response = await fetch(this.config.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit review');
            }

            this.elements.reviewForm.reset();
            this.loadCourses();
            
            this.showToast('Review submitted successfully!');
            
        } catch (error) {
            console.error('Failed to submit review:', error);
            this.showToast('Failed to submit review. Please try again.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }
    async deleteAllCourses() {
        if (!confirm('Are you sure you want to delete all courses? This cannot be undone.')) {
            return;
        }

        try {
            this.setLoadingState(true);
            this.state.courses = [];
            this.state.filteredCourses = [];
            this.renderCourses();
            this.renderPagination();
            
            this.showToast('All courses deleted successfully!');
            
        } catch (error) {
            console.error('Failed to delete courses:', error);
            this.showToast('Failed to delete courses. Please try again.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }
    validateField(field) {
        const errorElement = field.nextElementSibling;
        if (field.validity.valid) {
            field.classList.remove('is-invalid');
            if (errorElement && errorElement.classList.contains('invalid-feedback')) {
                errorElement.textContent = '';
            }
            return true;
        }
        field.classList.add('is-invalid');
        if (!errorElement || !errorElement.classList.contains('invalid-feedback')) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            field.parentNode.insertBefore(errorDiv, field.nextSibling);
        }
        let message = '';
        if (field.validity.valueMissing) {
            message = 'This field is required';
        } else if (field.validity.typeMismatch) {
            message = 'Please enter a valid value';
        } else if (field.validity.tooShort) {
            message = `Should be at least ${field.minLength} characters`;
        }

        field.nextElementSibling.textContent = message;
        return false;
    }
    validateForm() {
        let isValid = true;
        const requiredFields = this.elements.reviewForm.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        const ratingSelected = this.elements.reviewForm.querySelector('[name="rating"]:checked');
        const ratingContainer = this.elements.reviewForm.querySelector('.rating-input');
        let ratingError = ratingContainer.querySelector('.invalid-feedback');
        if (!ratingSelected) {
            if (!ratingError) {
                ratingError = document.createElement('div');
                ratingError.className = 'invalid-feedback';
                ratingContainer.appendChild(ratingError);
            }
            ratingError.textContent = 'Please select a rating';
            isValid = false;
        } else if (ratingError) {
            ratingError.remove();
        }
        return isValid;
    }
    renderStars(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<span class="star filled">★</span>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars += '<span class="star half-filled">★</span>';
            } else {
                stars += '<span class="star">★</span>';
            }
        }
        
        return stars;
    }
    getDifficultyClass(difficulty) {
        const classes = {
            'very_easy': 'badge-very-easy',
            'easy': 'badge-easy',
            'moderate': 'badge-moderate',
            'difficult': 'badge-difficult',
            'very_difficult': 'badge-very-difficult'
        };
        return classes[difficulty] || '';
    }
    getDifficultyText(difficulty) {
        const texts = {
            'very_easy': 'Very Easy',
            'easy': 'Easy',
            'moderate': 'Moderate',
            'difficult': 'Hard',
            'very_difficult': 'Very Hard'
        };
        return texts[difficulty] || '';
    }
    setLoadingState(isLoading) {
        this.state.isLoading = isLoading;
        if (isLoading) {
            this.elements.loadingState.classList.remove('d-none');
            this.elements.errorState.classList.add('d-none');
        } else {
            this.elements.loadingState.classList.add('d-none');
        }
    }
    showErrorState() {
        this.elements.errorState.classList.remove('d-none');
    }
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast show position-fixed bottom-0 end-0 m-3 bg-${type === 'success' ? 'success' : 'danger'} text-white`;
        toast.innerHTML = `
            <div class="toast-body">
                ${message}
                <button type="button" class="btn-close btn-close-white ms-2" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new CourseReviewApp();
});