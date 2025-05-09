import { renderComments, postComment, deleteComment, editComment } from './comments.js';
import { deleteArticle, editArticle } from './articles.js';

export function showArticleDetail(article, baseUrl) {
    let modal = document.getElementById('articleModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'articleModal';
    }

    modal.innerHTML = createModalContent(article);
    setupCommentHandlers(modal, article, baseUrl);
    setupArticleHandlers(modal, article, baseUrl);

    if (!document.getElementById('articleModal')) {
        document.body.appendChild(modal);
    }

    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
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
    // Parse comments if they're a JSON string
    let comments = [];
    try {
        comments = typeof article.comments === 'string' 
            ? JSON.parse(article.comments) 
            : article.comments || [];
    } catch (e) {
        console.error('Failed to parse comments:', e);
    }

    // Store comments in article object for later use
    article.parsedComments = comments;

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
                    commented_at: new Date().toISOString()
                };
                
                // Update article object with new comment
                if (!Array.isArray(article.parsedComments)) {
                    article.parsedComments = [];
                }
                article.parsedComments.unshift(newComment);
                
                // Update comments list
                commentsList.innerHTML = renderComments(article.parsedComments);
                
                // Clear form
                textarea.value = '';
                authorInput.value = '';
                
                // Show success message
                const successDiv = document.createElement('div');
                successDiv.className = 'alert alert-success mt-2';
                successDiv.textContent = 'Comment posted successfully';
                commentForm.appendChild(successDiv);
                setTimeout(() => successDiv.remove(), 3000);
                
            } catch (error) {
                console.error('Post comment error:', error);
                showError(modal, 'Failed to post comment');
            } finally {
                submitButton.disabled = false;
            }
        }
    });

    // Handle comment edit
    commentsList.addEventListener('click', async (e) => {
        if (e.target.matches('.edit-comment')) {
            const commentId = e.target.dataset.commentId;
            const commentDiv = e.target.closest('.comment');
            console.log('Editing comment with ID:', commentId); // Debug log
            
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
            console.log('Submitting edit for comment ID:', commentId); // Debug log
            
            const textarea = e.target.querySelector('textarea');
            const newText = textarea.value.trim();
            
            if (newText) {
                try {
                    await editComment(baseUrl, article.id, commentId, newText);
                    const commentText = e.target.closest('.comment').querySelector('.comment-text');
                    commentText.textContent = newText;
                    commentText.style.display = '';
                    e.target.classList.add('d-none');
                } catch (error) {
                    console.error('Edit comment error:', error); // Debug log
                    showError(modal, 'Failed to edit comment');
                }
            }
        }
    });

    // Handle comment deletion
    commentsList.addEventListener('click', async (e) => {
        if (e.target.matches('.delete-comment')) {
            const commentId = e.target.dataset.commentId;
            console.log('Deleting comment with ID:', commentId); // Debug log
            
            if (confirm('Are you sure you want to delete this comment?')) {
                try {
                    await deleteComment(baseUrl, article.id, commentId);
                    e.target.closest('.comment').remove();
                    
                    // Update comments array
                    article.parsedComments = article.parsedComments.filter(c => c.id !== commentId);
                    
                    // Show "no comments" message if needed
                    if (article.parsedComments.length === 0) {
                        commentsList.innerHTML = renderComments([]);
                    }
                } catch (error) {
                    console.error('Delete comment error:', error); // Debug log
                    showError(modal, 'Failed to delete comment');
                }
            }
        }
    });
}

function setupArticleHandlers(modal, article, baseUrl) {
    const editForm = modal.querySelector('.edit-article-form');
    const modalBody = modal.querySelector('.modal-body');
    const articleSection = modal.querySelector('.article-content').parentElement;
    
    // Ensure modal body is visible
    modalBody.style.display = 'block';
    
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
            // Prepare article data for API
            const articleData = {
                type: 'edit_article',
                news_id: article.id,
                title: formData.get('title'),
                category: formData.get('category'),
                summary: formData.get('summary'),
                content: formData.get('content')
            };

            // Send update request
            await editArticle(baseUrl, article.id, articleData);

            // Update local article data
            Object.assign(article, {
                title: articleData.title,
                category: articleData.category,
                summary: articleData.summary,
                content: articleData.content
            });

            // Update UI
            modal.querySelector('.modal-title').textContent = article.title;
            articleSection.innerHTML = createArticleContent(article);
            
            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'alert alert-success mt-2';
            successDiv.textContent = 'Article updated successfully';
            modal.querySelector('.modal-body').prepend(successDiv);
            setTimeout(() => successDiv.remove(), 3000);

            // Reset view
            articleSection.style.display = 'block';
            editForm.style.display = 'none';
            editForm.classList.add('d-none');

            // Reattach handlers since we replaced content
            setupArticleHandlers(modal, article, baseUrl);

        } catch (error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger mt-2';
            errorDiv.textContent = 'Failed to update article';
            editForm.prepend(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
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
                // Refresh the page to show updated article list
                window.location.reload();
            } catch (error) {
                showError(modal, 'Failed to delete article');
                console.error('Delete error:', error);
            }
        });
        
        confirmModal.addEventListener('hidden.bs.modal', () => {
            confirmModal.remove();
        });
        
        confirmInstance.show();
    });
}

function showError(modal, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-2';
    errorDiv.textContent = message;
    modal.querySelector('.modal-body').appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}