# Collaborative Code Platform API Documentation

## Introduction

This document provides comprehensive documentation for third-party integrations with the Collaborative Code Platform. Our API allows developers to interact with various features of the platform programmatically.

## Authentication

All API requests must be authenticated using JWT (JSON Web Tokens). Include the token in the Authorization header of your requests:

\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
\`\`\`

To obtain a JWT token, use the /api/auth/login endpoint.

## Base URL

All API endpoints are relative to: `https://api.collaborativecodeplatform.com/v1`

## Rate Limiting

API requests are rate limited to 100 requests per 15-minute window per IP address. If you exceed this limit, you'll receive a 429 Too Many Requests response with the message "Too many requests from this IP, please try again later."

## Endpoints

### Authentication

#### Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
  \`\`\`json
  {
  "email": "user@example.com",
  "password": "password123"
  }
  \`\`\`
- **Response**:
  \`\`\`json
  {
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
  "id": "user_id",
  "email": "user@example.com",
  "name": "John Doe"
  }
  }
  \`\`\`

### Projects

#### Get All Projects

- **URL**: `/projects`
- **Method**: `GET`
- **Response**:
  \`\`\`json
  {
  "projects": [
  {
  "id": "project_id",
  "name": "Project Name",
  "description": "Project Description",
  "created_at": "2023-05-20T12:00:00Z"
  }
  ]
  }
  \`\`\`

#### Create Project

- **URL**: `/projects`
- **Method**: `POST`
- **Body**:
  \`\`\`json
  {
  "name": "New Project",
  "description": "Project Description"
  }
  \`\`\`
- **Response**:
  \`\`\`json
  {
  "id": "new_project_id",
  "name": "New Project",
  "description": "Project Description",
  "created_at": "2023-05-20T12:00:00Z"
  }
  \`\`\`

### Files

#### Get Project Files

- **URL**: `/projects/{project_id}/files`
- **Method**: `GET`
- **Response**:
  \`\`\`json
  {
  "files": [
  {
  "id": "file_id",
  "name": "main.js",
  "path": "/main.js",
  "size": 1024,
  "last_modified": "2023-05-20T12:00:00Z"
  }
  ]
  }
  \`\`\`

#### Get File Content

- **URL**: `/projects/{project_id}/files/{file_id}/content`
- **Method**: `GET`
- **Response**:
  \`\`\`json
  {
  "content": "console.log('Hello, World!');"
  }
  \`\`\`

#### Update File Content

- **URL**: `/projects/{project_id}/files/{file_id}/content`
- **Method**: `PUT`
- **Body**:
  \`\`\`json
  {
  "content": "console.log('Updated content');"
  }
  \`\`\`
- **Response**:
  \`\`\`json
  {
  "id": "file_id",
  "name": "main.js",
  "path": "/main.js",
  "size": 1024,
  "last_modified": "2023-05-20T12:05:00Z"
  }
  \`\`\`

### Version Control

#### Get Version History

- **URL**: `/projects/{project_id}/versions`
- **Method**: `GET`
- **Response**:
  \`\`\`json
  {
  "versions": [
  {
  "id": "version_id",
  "message": "Initial commit",
  "created_at": "2023-05-20T12:00:00Z",
  "author": {
  "id": "user_id",
  "name": "John Doe"
  }
  }
  ]
  }
  \`\`\`

#### Create New Version

- **URL**: `/projects/{project_id}/versions`
- **Method**: `POST`
- **Body**:
  \`\`\`json
  {
  "message": "Update README.md",
  "files": [
  {
  "path": "/README.md",
  "content": "# Updated README"
  }
  ]
  }
  \`\`\`
- **Response**:
  \`\`\`json
  {
  "id": "new_version_id",
  "message": "Update README.md",
  "created_at": "2023-05-20T12:10:00Z",
  "author": {
  "id": "user_id",
  "name": "John Doe"
  }
  }
  \`\`\`

### Collaboration

#### Get Project Collaborators

- **URL**: `/projects/{project_id}/collaborators`
- **Method**: `GET`
- **Response**:
  \`\`\`json
  {
  "collaborators": [
  {
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "owner"
  }
  ]
  }
  \`\`\`

#### Add Collaborator

- **URL**: `/projects/{project_id}/collaborators`
- **Method**: `POST`
- **Body**:
  \`\`\`json
  {
  "email": "newcollaborator@example.com",
  "role": "editor"
  }
  \`\`\`
- **Response**:
  \`\`\`json
  {
  "id": "new_collaborator_id",
  "name": "Jane Smith",
  "email": "newcollaborator@example.com",
  "role": "editor"
  }
  \`\`\`

### Execution

#### Execute Code

- **URL**: `/execute`
- **Method**: `POST`
- **Body**:
  \`\`\`json
  {
  "language": "javascript",
  "code": "console.log('Hello, World!');"
  }
  \`\`\`
- **Response**:
  \`\`\`json
  {
  "output": "Hello, World!
  ",
  "execution_time": 0.05
  }
  \`\`\`

## Webhooks

You can set up webhooks to receive real-time updates about events in your projects. To set up a webhook, use the following endpoint:

#### Create Webhook

- **URL**: `/projects/{project_id}/webhooks`
- **Method**: `POST`
- **Body**:
  \`\`\`json
  {
  "url": "https://your-server.com/webhook",
  "events": ["file.created", "file.updated", "version.created"]
  }
  \`\`\`
- **Response**:
  \`\`\`json
  {
  "id": "webhook_id",
  "url": "https://your-server.com/webhook",
  "events": ["file.created", "file.updated", "version.created"],
  "created_at": "2023-05-20T12:15:00Z"
  }
  \`\`\`

## Errors

The API uses conventional HTTP response codes to indicate the success or failure of an API request. In general:

- Codes in the 2xx range indicate success
- Codes in the 4xx range indicate an error that failed given the information provided (e.g., a required parameter was omitted, etc.)
- Codes in the 5xx range indicate an error with our servers

Additionally:

- 429: Too Many Requests - You have exceeded the rate limit

## Changelog

- **2023-05-21**: Added rate limiting to all API endpoints
- **2023-05-20**: Initial API documentation release

## Support

If you have any questions or need assistance with the API, please contact our developer support team at api-support@collaborativecodeplatform.com.
