/* courseReviews.js - JavaScript for Phase 2 */
/* Hussain Ali Ahmed Ali, 202208704 */
document.addEventListener('DOMContentLoaded', async function() {
    await loadCourses();
    setupEventListeners();
});

const elements = {
    courseListing: document.getElementById('course-listing'),
    searchInput: document.querySelector('#course-listing input[type="text"]'),
    searchButton: document.querySelector('#course-listing .btn-primary'),
    departmentFilter: document.querySelector('#course-listing select:first-of-type'),
    sortFilter: document.querySelector('#course-listing select:last-of-type'),
    reviewForm: document.querySelector('#add-review form'),
    coursesContainer: null
};
const state = {
    courses: [],
    filteredCourses: [],
    currentPage: 1,
    coursesPerPage: 6
};
async function loadCourses() {
    try {
        showLoading();
        const response = await fetch('courses.json');
        if (!response.ok) throw new Error('Failed to fetch courses');
        
        state.courses = await response.json();
        state.filteredCourses = [...state.courses];
        renderCourses();
    } catch (error) {
        console.error('Error loading courses:', error);
        showError();
    }
}
function showLoading() {
    elements.courseListing.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading courses...</p>
        </div>`;
}
function showError() {
    elements.courseListing.innerHTML = `
        <div class="alert alert-danger">
            <h4>Error Loading Courses</h4>
            <p>Please check:</p>
            <ul>
                <li>You're using Live Server (right-click HTML → Open with Live Server)</li>
                <li>courses.json exists in the same folder</li>
                <li>Check browser console (F12) for errors</li>
            </ul>
        </div>`;
}
function renderCourses() {
    if (state.filteredCourses.length === 0) {
        elements.courseListing.innerHTML = `
            <div class="alert alert-info">
                No courses found matching your criteria.
            </div>`;
        return;
    }
    const startIndex = (state.currentPage - 1) * state.coursesPerPage;
    const endIndex = startIndex + state.coursesPerPage;
    const coursesToShow = state.filteredCourses.slice(startIndex, endIndex);
    const coursesHTML = coursesToShow.map(course => `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <h3 class="card-title h5">${course.name}</h3>
                        <span class="badge bg-primary">${course.code}</span>
                    </div>
                    <p class="text-muted">Instructor: ${course.professor}</p>
                    <div class="mb-2">
                        ${renderStars(course.rating)}
                        <small class="text-muted">${course.rating.toFixed(1)}/5.0 (${course.reviews} reviews)</small>
                    </div>
                    <p class="card-text">${course.description}</p>
                    <button class="btn btn-outline-primary btn-sm view-details" 
                            data-id="${course.id}">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    const totalPages = Math.ceil(state.filteredCourses.length / state.coursesPerPage);
    const paginationHTML = totalPages > 1 ? generatePaginationHTML(totalPages) : '';
    elements.courseListing.innerHTML = `
        <h2 class="mb-3">Course Listings</h2>
        <div class="row" id="courses-container">
            ${coursesHTML}
        </div>
        ${paginationHTML}
    `;
    elements.coursesContainer = document.getElementById('courses-container');
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return `
        <div class="stars">
            ${Array.from({length: 5}, (_, i) => 
                i < fullStars ? 
                    '<span class="star filled">★</span>' : 
                    (i === fullStars && hasHalfStar) ? 
                    '<span class="star half">★</span>' : 
                    '<span class="star">★</span>'
            ).join('')}
        </div>`;
}

function generatePaginationHTML(totalPages) {
    return `
        <div class="row mt-4">
            <div class="col-12">
                <nav aria-label="Course pagination">
                    <ul class="pagination justify-content-center">
                        <li class="page-item ${state.currentPage === 1 ? 'disabled' : ''}">
                            <button class="page-link" id="prev-page">Previous</button>
                        </li>
                        ${Array.from({length: totalPages}, (_, i) => `
                            <li class="page-item ${i + 1 === state.currentPage ? 'active' : ''}">
                                <button class="page-link page-number">${i + 1}</button>
                            </li>
                        `).join('')}
                        <li class="page-item ${state.currentPage === totalPages ? 'disabled' : ''}">
                            <button class="page-link" id="next-page">Next</button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>`;
}

function setupEventListeners() {
    elements.searchButton.addEventListener('click', filterCourses);
    elements.searchInput.addEventListener('keyup', e => {
        if (e.key === 'Enter') filterCourses();
    });
    elements.departmentFilter.addEventListener('change', filterCourses);
    elements.sortFilter.addEventListener('change', sortCourses);
    elements.reviewForm.addEventListener('submit', handleFormSubmit);
    document.addEventListener('click', function(e) {
        if (e.target.id === 'prev-page') {
            state.currentPage--;
            renderCourses();
        }
        else if (e.target.id === 'next-page') {
            state.currentPage++;
            renderCourses();
        }
        else if (e.target.classList.contains('page-number')) {
            state.currentPage = parseInt(e.target.textContent);
            renderCourses();
        }
        else if (e.target.classList.contains('view-details')) {
            showCourseDetails(e.target.dataset.id);
        }
    });
}

function filterCourses() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const department = elements.departmentFilter.value;

    state.filteredCourses = state.courses.filter(course => {
        const matchesSearch = course.name.toLowerCase().includes(searchTerm) || 
                             course.code.toLowerCase().includes(searchTerm) ||
                             course.professor.toLowerCase().includes(searchTerm);
        const matchesDepartment = department === 'All Departments' || course.department === department;
        
        return matchesSearch && matchesDepartment;
    });

    state.currentPage = 1;
    sortCourses();
}

function sortCourses() {
    const sortBy = elements.sortFilter.value;
    
    state.filteredCourses.sort((a, b) => {
        switch(sortBy) {
            case 'Highest Rated': return b.rating - a.rating;
            case 'Lowest Rated': return a.rating - b.rating;
            case 'Newest':
            default: return new Date(b.date) - new Date(a.date);
        }
    });
    
    renderCourses();
}

function showCourseDetails(courseId) {
    const course = state.courses.find(c => c.id == courseId);
    if (!course) return;

    alert(`Course Details:\n\n` +
          `Name: ${course.name}\n` +
          `Code: ${course.code}\n` +
          `Professor: ${course.professor}\n` +
          `Rating: ${course.rating}/5.0\n` +
          `Reviews: ${course.reviews}\n\n` +
          `Description:\n${course.description}`);
}
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (validateForm()) {
        alert('Thank you for your review! It has been submitted successfully.');
        elements.reviewForm.reset();
    }
}

function validateForm() {
    let isValid = true;
    const fields = [
        { id: 'courseName', message: 'Course name is required' },
        { id: 'courseCode', message: 'Course code is required' },
        { id: 'professor', message: 'Professor name is required' },
        { id: 'department', message: 'Please select a department' },
        { id: 'reviewTitle', message: 'Review title is required' },
        { id: 'reviewText', message: 'Review details are required', 
          extraValidation: (value) => value.length >= 20 || 'Review must be at least 20 characters' }
    ];

    document.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
    document.querySelectorAll('.invalid-feedback').forEach(el => {
        el.remove();
    });

    if (!document.querySelector('input[name="rating"]:checked')) {
        const ratingContainer = document.querySelector('.rating-input');
        const errorElement = document.createElement('div');
        errorElement.className = 'invalid-feedback d-block';
        errorElement.textContent = 'Please select a rating';
        ratingContainer.appendChild(errorElement);
        isValid = false;
    }

    fields.forEach(field => {
        const element = document.getElementById(field.id);
        const value = field.id === 'department' ? element.value : element.value.trim();
        
        if (!value) {
            showError(element, field.message);
            isValid = false;
        } 
        else if (field.extraValidation) {
            const validationResult = field.extraValidation(value);
            if (validationResult !== true) {
                showError(element, validationResult);
                isValid = false;
            }
        }
    });

    return isValid;
}

function showError(field, message) {
    field.classList.add('is-invalid');
    const errorElement = document.createElement('div');
    errorElement.className = 'invalid-feedback';
    errorElement.textContent = message;
    field.parentNode.appendChild(errorElement);
}