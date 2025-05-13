
# News API Documentation

Base URL: `https://c7e6f354-c368-4b25-9fcc-5750ab6dd01d-00-a5wp4x8axjzp.pike.replit.dev/api.php`

## GET
Retrieves news articles with optional filtering and sorting.

### Query Parameters
- `search` (optional): Search term to filter articles by title/content
- `category` (optional): Filter by category. Default: 'All Categories'
- `sort` (optional): Sort articles by specific criteria. Default: 'default'

### Response
```json
{
  "status": "success",
  "count": number,
  "data": [
    {
      "id": string,
      "title": string,
      "summary": string,
      "category": string,
      "popularity": number,
      "content": string
    }
  ]
}
```

## POST
Multiple operations are supported through the `type` parameter in the request body.

### 1. Create Article
Creates a new news article.

**Request Body:**
```json
{
  "type": "create",
  "title": string,
  "summary": string,
  "category": string,
  "popularity": number,
  "content": string
}
```

**Response:**
```json
{
  "status": "success",
  "message": "News item created successfully"
}
```

### 2. Add Comment
Adds a comment to an article.

**Request Body:**
```json
{
  "type": "comment",
  "article_id": string,
  "comment": string,
  "author_name": string (optional, defaults to "Anonymous")
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Comment added successfully"
}
```

### 3. Delete Comment
Deletes a specific comment.

**Request Body:**
```json
{
  "type": "delete_comment",
  "comment_id": string
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Comment deleted successfully"
}
```

### 4. Edit Comment
Modifies an existing comment.

**Request Body:**
```json
{
  "type": "edit_comment",
  "comment_id": string,
  "comment": string
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Comment edited successfully"
}
```

### 5. Delete Article
Deletes a specific article.

**Request Body:**
```json
{
  "type": "delete_article",
  "article_id": string
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Article deleted successfully"
}
```

### 6. Edit Article
Modifies an existing article.

**Request Body:**
```json
{
  "type": "edit_article",
  "article_id": string,
  "title": string,
  "summary": string,
  "category": string,
  "popularity": number,
  "content": string
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Article edited successfully"
}
```

### Error Response
For all endpoints, if an error occurs:
```json
{
  "status": "error",
  "message": string
}
```