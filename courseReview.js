/* courseReviews.js - JavaScript for Phase 2 */
/* Hussain Ali Ahmed Ali, 202208704 */
document.addEventListener('DOMContentLoaded', function() {
    const courseListContainer = document.querySelector('#course-listing .row');
    const searchInput = document.querySelector('input[type="text"]');
    const searchButton = document.querySelector('.btn-primary');
    const departmentFilter = document.querySelector('select.form-select:first-of-type');
    const sortFilter = document.querySelector('select.form-select:last-of-type');
    const reviewForm = document.querySelector('form');
    const loadingIndicator = document.createElement('div');
    
    let courses = [];
    let filteredCourses = [];
    let currentPage = 1;
    const coursesPerPage = 6;
        init();
    function init() {
        setupLoadingIndicator();
        fetchCourses();
        setupEventListeners();
    }
    
    function setupLoadingIndicator() {
        loadingIndicator.className = 'text-center my-5';
        loadingIndicator.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading courses...</p>
        `;
    }
    
    function fetchCourses() {
        courseListContainer.innerHTML = '';
        courseListContainer.appendChild(loadingIndicator);
    
        const apiUrl = 'Course-Review/courses.json'; //  your GitHub JSON file URL
        
        fetch(apiUrl)
            .then(response => {
                courseListContainer.innerHTML = '';
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error('Invalid data format received from server');
                } 
                courses = data.map(course => ({
                    id: course.id || 0,
                    name: course.name || 'Unknown Course',
                    code: course.code || 'N/A',
                    department: course.department || 'General',
                    professor: course.professor || 'Staff',
                    rating: parseFloat(course.rating) || 0,
                    reviewCount: parseInt(course.reviewCount) || 0,
                    description: course.description || 'No description available',
                    difficulty: course.difficulty || 'moderate'
                }));
                
                filteredCourses = [...courses];
                renderCourses();
            })
            .catch(error => {
                courseListContainer.innerHTML = '';
                
                showError(`Failed to load courses: ${error.message}`);
                
                const errorContainer = document.createElement('div');
                errorContainer.className = 'col-12 text-center py-5';
                errorContainer.innerHTML = `
                    <h4>Error loading courses</h4>
                    <p>${error.message}</p>
                    <button class="btn btn-primary mt-3" id="retryButton">Try Again</button>
                `;
                courseListContainer.appendChild(errorContainer);
                
                document.getElementById('retryButton').addEventListener('click', fetchCourses);
            });
    }

    function setupEventListeners() {
        searchButton.addEventListener('click', handleSearch);
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
        
        departmentFilter.addEventListener('change', filterAndSortCourses);
        sortFilter.addEventListener('change', filterAndSortCourses);
        
        reviewForm.addEventListener('submit', handleFormSubmit);
    }
    
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        filterAndSortCourses(searchTerm);
    }
    
    function filterAndSortCourses(searchTerm = '') {
        const department = departmentFilter.value;
        let filtered = courses.filter(course => 
            department === 'All Departments' || course.department === department
        );
        
        if (searchTerm) {
            filtered = filtered.filter(course => 
                course.name.toLowerCase().includes(searchTerm) ||
                course.code.toLowerCase().includes(searchTerm) ||
                course.professor.toLowerCase().includes(searchTerm)
            );
        }
        
        const sortOption = sortFilter.value;
        switch(sortOption) {
            case 'Highest Rated':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'Lowest Rated':
                filtered.sort((a, b) => a.rating - b.rating);
                break;
            case 'Newest':
            default:
                filtered.sort((a, b) => b.id - a.id);
                break;
        }
        
        filteredCourses = filtered;
        currentPage = 1; 
        renderCourses();
    }
    
    function renderCourses() {
        courseListContainer.innerHTML = '';
        
        if (filteredCourses.length === 0) {
            courseListContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <h4>No courses found</h4>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }
        
        const startIndex = (currentPage - 1) * coursesPerPage;
        const endIndex = startIndex + coursesPerPage;
        const paginatedCourses = filteredCourses.slice(startIndex, endIndex);
        
        paginatedCourses.forEach(course => {
            const courseCard = createCourseCard(course);
            courseListContainer.appendChild(courseCard);
        });
        
        renderPagination();
    }
    
    function createCourseCard(course) {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-3';
        
        const stars = Array(5).fill().map((_, i) => 
            i < Math.floor(course.rating) ? 
            '<span class="star filled">★</span>' : 
            '<span class="star">★</span>'
        ).join('');
        
        card.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <h3 class="card-title h5">${course.name}</h3>
                        <span class="badge bg-primary">${course.code}</span>
                    </div>
                    <p class="text-muted">Instructor: ${course.professor}</p>
                    <div class="mb-2">
                        <div class="stars">
                            ${stars}
                        </div>
                        <small class="text-muted">${course.rating.toFixed(1)}/5.0 (${course.reviewCount} reviews)</small>
                    </div>
                    <p class="card-text">${course.description}</p>
                    <button class="btn btn-outline-primary btn-sm view-details" data-id="${course.id}">View Details</button>
                </div>
            </div>
        `;
        
        card.querySelector('.view-details').addEventListener('click', () => showCourseDetails(course.id));
        
        return card;
    }
    
    function renderPagination() {
        const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
        if (totalPages <= 1) return;
        
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'col-12 mt-4';
        paginationContainer.innerHTML = `
            <nav aria-label="Course pagination">
                <ul class="pagination justify-content-center">
                    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                        <a class="page-link" href="#" aria-label="Previous" data-page="${currentPage - 1}">
                            <span aria-hidden="true">&laquo;</span>
                        </a>
                    </li>
                    ${Array.from({length: totalPages}, (_, i) => `
                        <li class="page-item ${i + 1 === currentPage ? 'active' : ''}">
                            <a class="page-link" href="#" data-page="${i + 1}">${i + 1}</a>
                        </li>
                    `).join('')}
                    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                        <a class="page-link" href="#" aria-label="Next" data-page="${currentPage + 1}">
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
                </ul>
            </nav>
        `;
        
        paginationContainer.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(link.dataset.page);
                if (page !== currentPage) {
                    currentPage = page;
                    renderCourses();
                    window.scrollTo({top: courseListContainer.offsetTop, behavior: 'smooth'});
                }
            });
        });
        
        courseListContainer.appendChild(paginationContainer);
    }
    
    function showCourseDetails(courseId) {
        const course = courses.find(c => c.id === courseId);
        if (!course) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'courseDetailsModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${course.name} (${course.code})</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Instructor:</strong> ${course.professor}</p>
                                <p><strong>Department:</strong> ${course.department}</p>
                                <p><strong>Difficulty:</strong> ${formatDifficulty(course.difficulty)}</p>
                            </div>
                            <div class="col-md-6 text-end">
                                <div class="large-stars mb-2">
                                    ${Array(5).fill().map((_, i) => 
                                        i < Math.floor(course.rating) ? 
                                        '<span class="star filled">★</span>' : 
                                        '<span class="star">★</span>'
                                    ).join('')}
                                </div>
                                <p>${course.rating.toFixed(1)}/5.0 (${course.reviewCount} reviews)</p>
                            </div>
                        </div>
                        <hr>
                        <h6>Course Description</h6>
                        <p>${course.description}</p>
                        <hr>
                        <h6>Reviews</h6>
                        <div id="courseReviews" class="mt-3">
                            <div class="text-center py-3">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading reviews...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        setTimeout(() => {
            const reviewsContainer = modal.querySelector('#courseReviews');
            reviewsContainer.innerHTML = `
                <div class="alert alert-info">
                    Review functionality would be implemented in a full application. 
                    This would display actual reviews fetched from the server.
                </div>
            `;
        }, 1000);
        
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }
    
    function formatDifficulty(difficulty) {
        const difficultyMap = {
            'very_easy': 'Very Easy',
            'easy': 'Easy',
            'moderate': 'Moderate',
            'difficult': 'Hard',
            'very_difficult': 'Very Hard'
        };
        return difficultyMap[difficulty] || 'Not specified';
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const submitButton = reviewForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Submitting...
        `;
        
        setTimeout(() => {
            alert('Review submitted successfully! (This would be a real submission in a full application)');
            reviewForm.reset();
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }, 1500);
    }
    
    function validateForm() {
        let isValid = true;
        
        document.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
        document.querySelectorAll('.invalid-feedback').forEach(el => {
            el.remove();
        });
        
        const requiredFields = [
            'courseName',
            'courseCode',
            'professor',
            'department',
            'rating',
            'reviewTitle',
            'reviewText'
        ];
        
        requiredFields.forEach(fieldName => {
            const field = reviewForm.elements[fieldName];
            if (!field.value.trim()) {
                markFieldAsInvalid(field, 'This field is required');
                isValid = false;
            }
        });
        
        const ratingSelected = reviewForm.querySelector('input[name="rating"]:checked');
        if (!ratingSelected) {
            const ratingContainer = reviewForm.querySelector('.rating-input');
            const errorElement = document.createElement('div');
            errorElement.className = 'invalid-feedback d-block';
            errorElement.textContent = 'Please select a rating';
            ratingContainer.appendChild(errorElement);
            isValid = false;
        }
        
        return isValid;
    }
    
    function markFieldAsInvalid(field, message) {
        field.classList.add('is-invalid');
        const errorElement = document.createElement('div');
        errorElement.className = 'invalid-feedback';
        errorElement.textContent = message;
        field.parentNode.appendChild(errorElement);
    }
    
    function showError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show';
        alert.innerHTML = `
            <strong>Error:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        const main = document.querySelector('main');
        main.insertBefore(alert, main.firstChild);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
});