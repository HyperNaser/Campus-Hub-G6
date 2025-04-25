const FORM_CONFIG = {
    required_fields: ['title', 'category', 'summary', 'content'],
    form_id: 'article-form',
    field_config: {
        title: { id: 'title', minLength: 3, maxLength: 50 },
        category: { id: 'category', options: ['academic', 'sports', 'events', 'student-life'] },
        summary: { id: 'summary', minLength: 20, maxLength: 70 },
        content: { id: 'content', minLength: 100 }
    }
};

const formValidation = {
    validate_title: (value) => {
        if (!value.trim()) return 'Title is required';
        if (value.length < 3) return 'Title must be at least 3 characters';
        if (value.length > 50) return 'Title must be less than 50 characters';
        return null;
    },
    validate_category: (value) => {
        if (!value) return 'Please select a category';
        return null;
    },
    validate_summary: (value) => {
        if (!value.trim()) return 'Summary is required';
        if (value.length < 20) return 'Summary must be at least 20 characters';
        if (value.length > 70) return 'Summary must be less than 70 characters';
        return null;
    },
    validate_content: (value) => {
        if (!value.trim()) return 'Content is required';
        if (value.length < 100) return 'Content must be at least 100 characters';
        return null;
    }
};

function showError(input, message) {
    const formGroup = input.closest('.form-group');
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message text-danger';
    errorDiv.textContent = message;
    input.classList.add('is-invalid');
    formGroup.appendChild(errorDiv);
}

function clearError(input) {
    const formGroup = input.closest('.form-group');
    const errorDiv = formGroup.querySelector('.error-message');
    if (errorDiv) errorDiv.remove();
    input.classList.remove('is-invalid');
}

function validateFormStructure(form) {
    if (!form) {
        throw new Error(`Form with class '${FORM_CONFIG.form_id}' not found`);
    }

    const missingFields = [];
    FORM_CONFIG.required_fields.forEach(fieldName => {
        const field = form.querySelector(`#${FORM_CONFIG.field_config[fieldName].id}`);
        if (!field) {
            missingFields.push(fieldName);
        }
    });

    if (missingFields.length > 0) {
        throw new Error(`Required form fields missing: ${missingFields.join(', ')}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        const form = document.querySelector('.article-form');
        validateFormStructure(form);

        const inputs = {};
        FORM_CONFIG.required_fields.forEach(fieldName => {
            const field = form.querySelector(`#${FORM_CONFIG.field_config[fieldName].id}`);
            if (field) {
                inputs[fieldName] = field;
            }
        });

        // Real-time validation
        Object.entries(inputs).forEach(([field, input]) => {
            input.addEventListener('input', () => {
                try {
                    const error = formValidation[`validate_${field}`](input.value);
                    if (error) {
                        showError(input, error);
                    } else {
                        clearError(input);
                    }
                } catch (error) {
                    console.error(`Validation error for ${field}:`, error);
                }
            });
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;

            try {
                Object.entries(inputs).forEach(([field, input]) => {
                    const error = formValidation[`validate_${field}`](input.value);
                    if (error) {
                        showError(input, error);
                        isValid = false;
                    }
                });

                if (isValid) {
                    // this makes it ready for API's, better than the regular html submission because it doesn't reload the page
                    const formData = Object.entries(inputs).reduce((acc, [field, input]) => {
                        acc[field] = input.value;
                        return acc;
                    }, {});
                    console.log('Form is valid!', formData);
                }
            } catch (error) {
                console.error('Form validation failed:', error);
                alert('There was an error validating the form. Please try again.');
            }
        });
    } catch (error) {
        console.error('Form initialization failed:', error);
        document.body.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Form Error</h4>
                <p>${error.message}</p>
                <hr>
                <p class="mb-0">Please contact the administrator.</p>
            </div>`;
    }
});