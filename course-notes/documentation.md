
# Notes API Documentation

## Base URL
All endpoints are relative to the server root URL.

## Authentication
Currently, no authentication is required to access the API endpoints.

## Notes Endpoints

### Get All Notes
**GET** `/notes.php`
- Returns all notes ordered by date descending
- Response: Array of note objects
```json
[
  {
    "id": "number",
    "title": "string",
    "course_code": "string",
    "description": "string",
    "note_date": "string (YYYY-MM-DD)"
  }
]
```

### Get Single Note
**GET** `/notes.php?id={id}`
- Returns a specific note by ID
- Required Query Params: `id`
- Response: Note object or empty array if not found

### Create Note
**POST** `/notes.php`
- Creates a new note
- Required Body:
```json
{
  "title": "string",
  "course_code": "string"
}
```
- Optional Body:
```json
{
  "description": "string",
  "date": "string (YYYY-MM-DD)"
}
```
- Response: `{"message": "Note created successfully"}`

### Update Note
**PUT** `/notes.php?id={id}`
- Updates an existing note
- Required Query Params: `id`
- Required Body: Same as Create Note
- Response: `{"message": "Note updated successfully"}`

### Delete Note
**DELETE** `/notes.php`
- Deletes a note
- Required Body: `{"id": number}`
- Response: `{"message": "Note deleted successfully"}`

## Comments Endpoints

### Get Comments
**GET** `/comment.php?note_id={id}`
- Returns all comments for a specific note
- Required Query Params: `note_id`
- Response: Array of comment objects
```json
[
  {
    "id": "number",
    "note_id": "number",
    "author": "string",
    "text": "string",
    "comment_date": "string (YYYY-MM-DD HH:MM:SS)"
  }
]
```

### Create Comment
**POST** `/comment.php`
- Creates a new comment
- Required Body:
```json
{
  "note_id": "number",
  "text": "string"
}
```
- Optional Body:
```json
{
  "author": "string" // defaults to "Anonymous"
}
```
- Response: `{"message": "Comment added successfully"}`

## Error Responses
All endpoints return error responses in the following format:
```json
{
  "error": "Error message description"
}
```
Status codes:
- 400: Bad Request (missing or invalid parameters)
- 405: Method Not Allowed
- 500: Server Error
