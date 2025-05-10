import { formatDate } from './utils.js';

export async function postComment(baseUrl, articleId, comment, authorName) {
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'comment',
            article_id: articleId,
            comment: comment,
            author_name: authorName || 'Anonymous'
        })
    });

    if (!response.ok) throw new Error('Failed to post comment');
    
    const text = await response.text();
    
    try {
        return text ? JSON.parse(text) : {};
    } catch (e) {
        throw new Error('Invalid response from server');
    }
}

export function renderComments(comments) {
    if (!comments || !comments.length) {
        return '<p class="text-muted">No comments yet. Be the first to comment!</p>';
    }
    return comments.map(comment => renderComment(comment)).join('');
}

export function renderComment(comment) {
    return `
        <div class="comment mb-3" data-comment-id="${comment.id}">
            <div class="d-flex justify-content-between align-items-start mb-1">
                <div>
                    <strong class="me-2">${comment.author_name || 'Anonymous'}</strong>
                    <small class="text-muted">${formatDate(comment.commented_at)}</small>
                </div>
                <div class="comment-actions">
                    <button class="btn btn-link btn-sm edit-comment" data-comment-id="${comment.id}">Edit</button>
                    <button class="btn btn-link btn-sm text-danger delete-comment" data-comment-id="${comment.id}">Delete</button>
                </div>
            </div>
            <p class="mb-1 comment-text">${comment.comment}</p>
            <form class="edit-comment-form d-none" data-comment-id="${comment.id}">
                <textarea class="form-control mb-2">${comment.comment}</textarea>
                <div>
                    <button type="submit" class="btn btn-primary btn-sm">Save</button>
                    <button type="button" class="btn btn-secondary btn-sm cancel-edit">Cancel</button>
                </div>
            </form>
            <hr>
        </div>
    `;
}

export async function deleteComment(baseUrl, articleId, commentId) {
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'delete_comment',
            news_id: articleId,
            comment_id: commentId
        })
    });

    if (!response.ok) throw new Error('Failed to delete comment');
    return response.json();
}

export async function editComment(baseUrl, articleId, commentId, newText) {
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'edit_comment',
            news_id: articleId,
            comment_id: commentId,
            comment: newText
        })
    });

    if (!response.ok) throw new Error('Failed to edit comment');
    return response.json();
}