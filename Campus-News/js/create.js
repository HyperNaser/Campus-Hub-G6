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

const API_CONFIG = {
    baseUrl: 'https://c7e6f354-c368-4b25-9fcc-5750ab6dd01d-00-a5wp4x8axjzp.pike.replit.dev/api.php'
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


function setSubmitButtonState(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" 
                  role="status" 
                  style="width: 1rem; height: 1rem;">
            </span>Submitting...`;
    } else {
        button.disabled = false;
        button.innerHTML = 'Submit Article';
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
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            let isValid = true;
            const submitButton = form.querySelector('button[type="submit"]');

            try {
                // Reset any previous error messages
                const previousError = form.querySelector('.alert-danger');
                if (previousError) previousError.remove();

                // Validate all inputs
                Object.entries(inputs).forEach(([field, input]) => {
                    const error = formValidation[`validate_${field}`](input.value);
                    if (error) {
                        showError(input, error);
                        isValid = false;
                    }
                });

                if (isValid) {
                    setSubmitButtonState(submitButton, true);

                    try {
                        const formData = {
                            type: 'create',
                            title: inputs.title.value.trim(),
                            summary: inputs.summary.value.trim(),
                            category: inputs.category.value.trim(),
                            content: inputs.content.value.trim()
                        };

                        const response = await fetch(API_CONFIG.baseUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(formData)
                        });

                        const responseText = await response.text();
                        let result;
                        
                        if (responseText) {
                            try {
                                result = JSON.parse(responseText);
                            } catch (e) {
                                throw new Error(`Invalid server response`);
                            }
                        } else {
                            throw new Error('No response from server');
                        }

                        if (!response.ok) {
                            throw new Error(result.message || `Request failed`);
                        }

                        form.innerHTML = `
                            <div class="alert alert-success" role="alert">
                                <h4 class="alert-heading">Article Created Successfully!</h4>
                                <p>Your article has been submitted.</p>
                                <hr>
                                <div class="d-flex justify-content-between align-items-center">
                                    <a href="index.html" class="btn btn-primary">Back to Articles</a>
                                    <button type="button" class="btn btn-outline-primary" onclick="location.reload()">Create Another</button>
                                </div>
                            </div>`;

                    } catch (error) {
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'alert alert-danger mt-3';
                        errorDiv.textContent = `Failed to submit article: ${error.message}`;
                        form.insertBefore(errorDiv, form.firstChild);
                        setSubmitButtonState(submitButton, false);
                    }
                } else {
                    setSubmitButtonState(submitButton, false);
                }
            } catch (error) {
                console.error('Form validation failed:', error);
                alert('There was an error validating the form. Please try again.');
                setSubmitButtonState(submitButton, false);
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