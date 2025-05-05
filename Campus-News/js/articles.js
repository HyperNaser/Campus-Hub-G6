export async function deleteArticle(baseUrl, articleId) {
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'delete_article',
            article_id: articleId
        })
    });

    if (!response.ok) throw new Error('Failed to delete article');
    return response.json();
}

export async function editArticle(baseUrl, articleId, articleData) {
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'edit_article',
            article_id: articleId,
            ...articleData
        })
    });

    if (!response.ok) throw new Error('Failed to edit article');
    return response.json();
}