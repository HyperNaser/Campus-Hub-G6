import { renderComments, postComment, deleteComment, editComment } from './comments.js';
import { deleteArticle, editArticle } from './articles.js';
import { showError, showSuccess} from './utils.js';

export function showArticleDetail(article, baseUrl) {
    let modal = document.getElementById('articleModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'articleModal';
    }

    modal.innerHTML = createModalContent(article);
    setupEventHandlers(modal, article, baseUrl);

    if (!document.getElementById('articleModal')) {
        document.body.appendChild(modal);
    }

    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

function createModalContent(article) {
    return `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${article.title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    ${createArticleContent(article)}
                    <form class="edit-article-form d-none">
                        <div class="form-group mb-3">
                            <input type="text" class="form-control" name="title" value="${article.title}">
                        </div>
                        <div class="form-group mb-3">
                            <select class="form-control" name="category">
                                <option value="Academic" ${article.category === 'Academic' ? 'selected' : ''}>Academic</option>
                                <option value="Sports" ${article.category === 'Sports' ? 'selected' : ''}>Sports</option>
                                <option value="Events" ${article.category === 'Events' ? 'selected' : ''}>Events</option>
                                <option value="Student Life" ${article.category === 'Student Life' ? 'selected' : ''}>Student Life</option>
                            </select>
                        </div>
                        <div class="form-group mb-3">
                            <textarea class="form-control" name="summary" rows="2">${article.summary}</textarea>
                        </div>
                        <div class="form-group mb-3">
                            <textarea class="form-control" name="content" rows="5">${article.content}</textarea>
                        </div>
                        <div>
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                            <button type="button" class="btn btn-secondary cancel-edit">Cancel</button>
                        </div>
                    </form>
                    ${createCommentsSection(article)}
                </div>
            </div>
        </div>
    `;
}

function createArticleContent(article) {
    return `
        <div class="article-header d-flex justify-content-between align-items-center mb-3">
            <span class="badge bg-secondary">${article.category}</span>
            <div class="article-actions">
                <button class="btn btn-link edit-article">Edit</button>
                <button class="btn btn-link text-danger delete-article">Delete</button>
            </div>
            <small class="text-muted">Popularity: ${article.popularity || 0}</small>
        </div>
        <p class="lead">${article.summary}</p>
        <hr>
        <div class="article-content mb-4">${article.content}</div>
    `;
}

function createCommentsSection(article) {
    
    let comments = article.comments || [];

    return `
        <div class="comments-section mt-4">
            <h6 class="comments-title mb-3">Comments</h6>
            <form class="comment-form mb-4" autocomplete="off">
                <div class="form-group mb-3">
                    <input type="text" 
                           class="form-control mb-2"
                           placeholder="Your name (optional)"
                           name="author_name">
                </div>
                <div class="form-group">
                    <textarea class="form-control mb-2" 
                              rows="3" 
                              placeholder="Add a comment..."
                              required></textarea>
                    <button type="submit" class="btn btn-primary btn-sm">Post Comment</button>
                </div>
            </form>
            <div class="comments-list">
                ${renderComments(comments)}
            </div>
        </div>
    `;
}

function setupCommentHandlers(modal, article, baseUrl) {
    const commentsList = modal.querySelector('.comments-list');
    const commentForm = modal.querySelector('.comment-form');
    
    // handle comment form submission
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const textarea = commentForm.querySelector('textarea');
        const authorInput = commentForm.querySelector('input[name="author_name"]');
        const submitButton = commentForm.querySelector('button[type="submit"]');
        
        const comment = textarea.value.trim();
        const authorName = authorInput.value.trim();
        
        if (comment) {
            submitButton.disabled = true;
            
            try {
                const result = await postComment(baseUrl, article.id, comment, authorName);
                
                const newComment = {
                    id: result.comment_id,
                    comment: comment,
                    author_name: authorName || 'Anonymous',
                    commented_at: new Date().toISOString().slice(0, -1) // Remove the 'Z' to reflect how the server stores it
                };
                
                if (!Array.isArray(article.comments)) {
                    article.comments = [];
                }
                article.comments.unshift(newComment);
                
                // Update comments list
                commentsList.innerHTML = renderComments(article.comments);
                
                // Clear form
                textarea.value = '';
                authorInput.value = '';
                
                // Show success message
                showSuccess(commentForm, 'Comment posted successfully');
                
            } catch (error) {
                showError(modal.querySelector('.modal-body'), 'Failed to post comment');
            } finally {
                submitButton.disabled = false;
            }
        }
    });

    // Handle comment edit
    commentsList.addEventListener('click', (e) => {
        if (e.target.matches('.edit-comment')) {
            const commentId = e.target.dataset.commentId;
            const commentDiv = e.target.closest('.comment');
            
            const commentText = commentDiv.querySelector('.comment-text');
            const editForm = commentDiv.querySelector(`.edit-comment-form[data-comment-id="${commentId}"]`);
            
            commentText.style.display = 'none';
            editForm.classList.remove('d-none');
        }
        
        if (e.target.matches('.cancel-edit')) {
            const commentDiv = e.target.closest('.comment');
            const commentText = commentDiv.querySelector('.comment-text');
            const editForm = commentDiv.querySelector('.edit-comment-form');
            commentText.style.display = '';
            editForm.classList.add('d-none');
        }
    });

    // Handle edit form submission
    commentsList.addEventListener('submit', async (e) => {
        if (e.target.matches('.edit-comment-form')) {
            e.preventDefault();
            const commentId = e.target.dataset.commentId;
            const textarea = e.target.querySelector('textarea');
            const submitButton = e.target.querySelector('button[type="submit"]');
            const newText = textarea.value.trim();
            
            if (newText) {
                submitButton.disabled = true;
                
                try {
                    await editComment(baseUrl, commentId, newText);
                    
                    // Update local comment data
                    const commentIndex = article.comments.findIndex(c => c.id === commentId);
                    if (commentIndex !== -1) {
                        article.comments[commentIndex].comment = newText;
                    }
                    
                    // Update UI
                    const commentText = e.target.closest('.comment').querySelector('.comment-text');
                    commentText.textContent = newText;
                    commentText.style.display = '';
                    e.target.classList.add('d-none');
                    
                    // Show success toast
                    const alertDiv = document.createElement('div');
                    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
                    alertDiv.style.zIndex = '9999';
                    alertDiv.innerHTML = `
                        <strong>Success!</strong> Comment updated successfully.
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    `;
                    document.body.appendChild(alertDiv);
                    setTimeout(() => alertDiv.remove(), 3000);
                    
                } catch (error) {
                    showError(e.target, 'Failed to edit comment');
                } finally {
                    submitButton.disabled = false;
                }
            }
        }
    });

    // Handle comment deletion
    commentsList.addEventListener('click', async (e) => {
        if (e.target.matches('.delete-comment')) {
            const commentId = e.target.dataset.commentId;
            
            if (confirm('Are you sure you want to delete this comment?')) {
                try {
                    await deleteComment(baseUrl, commentId);
                    e.target.closest('.comment').remove();
                    
                    // Update comments array
                    article.comments = article.comments.filter(c => c.id !== commentId);
                    
                    // Show "no comments" message if needed
                    if (article.comments.length === 0) {
                        commentsList.innerHTML = renderComments([]);
                    }
                } catch (error) {
                    showError(modal, 'Failed to delete comment');
                }
            }
        }
    });
}

function setupArticleHandlers(modal, article, baseUrl) {
    const editForm = modal.querySelector('.edit-article-form');
    const articleSection = modal.querySelector('.article-content').parentElement;
    
    // Edit button handler
    const editButton = modal.querySelector('.article-header .edit-article');
    editButton.addEventListener('click', () => {
        articleSection.style.display = 'none';
        editForm.classList.remove('d-none');
    });
    
    // Cancel edit handler
    editForm.querySelector('.cancel-edit').addEventListener('click', () => {
        articleSection.style.display = 'block';
        editForm.classList.add('d-none');
    });

    // Edit form submission
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(editForm);
        const submitButton = editForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        try {
            const articleData = {
                title: formData.get('title'),
                category: formData.get('category'),
                summary: formData.get('summary'),
                content: formData.get('content')
            };

            await editArticle(baseUrl, article.id, articleData);

            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();

            // Create and show success toast/alert
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
            alertDiv.style.zIndex = '9999';
            alertDiv.innerHTML = `
                <strong>Success!</strong> Article updated successfully.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.appendChild(alertDiv);
            
            // Auto-remove after 3 seconds
            setTimeout(() => alertDiv.remove(), 3000);
            
            document.dispatchEvent(new CustomEvent('ArticleListModification')); // Custom event to refresh the article list

        } catch (error) {
            showError(editForm, 'Failed to update article');
            console.error('Edit error:', error);
        } finally {
            submitButton.disabled = false;
        }
    });

    // Delete article handler
    const deleteButton = modal.querySelector('.article-header .delete-article');
    deleteButton.addEventListener('click', async () => {
        const confirmModal = document.createElement('div');
        confirmModal.className = 'modal fade';
        confirmModal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirm Deletion</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to delete this article?</p>
                        <p class="text-danger"><small>This action cannot be undone.</small></p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger confirm-delete">Delete</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmModal);
        const confirmInstance = new bootstrap.Modal(confirmModal);
        
        confirmModal.querySelector('.confirm-delete').addEventListener('click', async () => {
            try {
                await deleteArticle(baseUrl, article.id);
                confirmInstance.hide();
                modal.querySelector('[data-bs-dismiss="modal"]').click();
                document.dispatchEvent(new CustomEvent('ArticleListModification')); // Custom event to refresh the article list
            } catch (error) {
                console.error('Delete error:', error);
            }
        });
        
        confirmModal.addEventListener('hidden.bs.modal', () => {
            confirmModal.remove();
        });
        
        confirmInstance.show();
    });
}

function setupEventHandlers(modal, article, baseUrl) {
    setupArticleHandlers(modal, article, baseUrl);
    setupCommentHandlers(modal, article, baseUrl);
    
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}