export function showError(container, message, duration = 3000) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-2';
    errorDiv.textContent = message;
    container.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), duration);
}

export function showSuccess(container, message, duration = 3000) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success mt-2';
    successDiv.textContent = message;
    container.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), duration);
}

export function formatDate(dateString) {
    let utcDate;
    // Parse the UTC date string
    if (dateString.charAt(dateString.length - 1) !== 'Z') {
        utcDate = new Date(dateString + 'Z'); // Append 'Z' to indicate UTC
    }else{
        utcDate = new Date(dateString);
    }

    // Format options for client's timezone
    const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    
    // Convert to local timezone and format
    return utcDate.toLocaleString('default', options);
}
