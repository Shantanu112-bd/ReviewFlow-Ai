# ReviewFlow AI - API Contract

This document outlines the API specifications for the ReviewFlow AI backend.

---

## 1. Authentication APIs

### GitHub OAuth Login
* **Method:** `POST`
* **Path:** `/api/auth/github`
* **Request:** 
  ```json
  {
    "code": "string"
  }
  ```
* **Response:** 
  ```json
  {
    "token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "githubUsername": "string"
    }
  }
  ```
* **Error Cases:** 
  - `400 Bad Request`: Missing OAuth code.
  - `401 Unauthorized`: Invalid or expired OAuth code.
* **Authorization Rules:** Public route.

### Get Current User
* **Method:** `GET`
* **Path:** `/api/auth/me`
* **Request:** None
* **Response:** 
  ```json
  {
    "id": "string",
    "email": "string",
    "githubId": "string",
    "githubUsername": "string",
    "createdAt": "string"
  }
  ```
* **Error Cases:** 
  - `401 Unauthorized`: Missing or invalid Bearer token.
* **Authorization Rules:** Requires a valid Bearer token.

---

## 2. Repository APIs

### List Repositories
* **Method:** `GET`
* **Path:** `/api/repositories`
* **Request:** Query parameters `?page=1&limit=20`
* **Response:** 
  ```json
  {
    "data": [
      {
        "id": "string",
        "githubId": "string",
        "name": "string",
        "fullName": "string",
        "url": "string"
      }
    ],
    "meta": {
      "total": 10,
      "page": 1,
      "limit": 20
    }
  }
  ```
* **Error Cases:** 
  - `401 Unauthorized`: Missing or invalid Bearer token.
* **Authorization Rules:** Requires a valid Bearer token. Only returns repositories owned by the authenticated user.

### Sync GitHub Repositories
* **Method:** `POST`
* **Path:** `/api/repositories/sync`
* **Request:** None
* **Response:** 
  ```json
  {
    "status": "success",
    "syncedCount": 5
  }
  ```
* **Error Cases:** 
  - `401 Unauthorized`: Missing or invalid Bearer token.
  - `502 Bad Gateway`: GitHub API is unreachable or rate-limited.
* **Authorization Rules:** Requires a valid Bearer token.

---

## 3. Pull Request APIs

### List Pull Requests for a Repository
* **Method:** `GET`
* **Path:** `/api/repositories/:repositoryId/pulls`
* **Request:** Query parameters `?status=OPEN&page=1`
* **Response:** 
  ```json
  {
    "data": [
      {
        "id": "string",
        "githubId": "string",
        "number": 12,
        "title": "string",
        "status": "OPEN",
        "createdAt": "string"
      }
    ],
    "meta": { "total": 5 }
  }
  ```
* **Error Cases:** 
  - `401 Unauthorized`: Missing or invalid Bearer token.
  - `403 Forbidden`: User does not own the requested repository.
  - `404 Not Found`: Repository ID does not exist.
* **Authorization Rules:** Requires a valid Bearer token. User must own the `repositoryId`.

### Get Pull Request Details
* **Method:** `GET`
* **Path:** `/api/pulls/:pullId`
* **Request:** None
* **Response:** 
  ```json
  {
    "id": "string",
    "number": 12,
    "title": "string",
    "status": "OPEN",
    "repositoryId": "string",
    "reviews": []
  }
  ```
* **Error Cases:** 
  - `401 Unauthorized`: Missing or invalid Bearer token.
  - `403 Forbidden`: User does not own the parent repository.
  - `404 Not Found`: Pull Request ID does not exist.
* **Authorization Rules:** Requires a valid Bearer token. User must own the parent repository.

---

## 4. Review APIs

### Trigger Manual Review
* **Method:** `POST`
* **Path:** `/api/pulls/:pullId/reviews`
* **Request:** 
  ```json
  {
    "agents": ["SecurityAnalyzer", "PerformanceScanner", "BestPractices"]
  }
  ```
* **Response:** 
  ```json
  {
    "reviewId": "string",
    "status": "PENDING"
  }
  ```
* **Error Cases:** 
  - `400 Bad Request`: Invalid payload (e.g., unrecognized agent name).
  - `401 Unauthorized`: Missing or invalid Bearer token.
  - `404 Not Found`: Pull Request ID does not exist.
* **Authorization Rules:** Requires a valid Bearer token. User must own the parent repository.

### Get Review Results
* **Method:** `GET`
* **Path:** `/api/reviews/:reviewId`
* **Request:** None
* **Response:** 
  ```json
  {
    "id": "string",
    "status": "COMPLETED",
    "pullRequestId": "string",
    "agentResults": [
      {
        "id": "string",
        "agentName": "SecurityAnalyzer",
        "status": "SUCCESS",
        "findings": [
          {
            "id": "string",
            "filePath": "src/auth.js",
            "line": 42,
            "severity": "CRITICAL",
            "message": "Potential SQL Injection vulnerability."
          }
        ]
      }
    ]
  }
  ```
* **Error Cases:** 
  - `401 Unauthorized`: Missing or invalid Bearer token.
  - `404 Not Found`: Review ID does not exist.
* **Authorization Rules:** Requires a valid Bearer token. User must own the parent repository.

---

## 5. SSE APIs

### Stream Review Progress
* **Method:** `GET`
* **Path:** `/api/reviews/:reviewId/stream`
* **Request:** None (Standard SSE connection)
* **Response:** `text/event-stream` stream of Server-Sent Events.
  ```text
  event: status_update
  data: {"agentName": "SecurityAnalyzer", "status": "RUNNING"}

  event: new_finding
  data: {"agentName": "SecurityAnalyzer", "finding": {"filePath": "app.js", "message": "..."}}
  ```
* **Error Cases:** 
  - `401 Unauthorized`: Invalid authentication (typically validated via HttpOnly cookie or secure token in URL parameters).
  - `404 Not Found`: Review ID does not exist.
* **Authorization Rules:** Requires a valid authentication token. User must own the parent repository.

---

## 6. History APIs

### Get Review History
* **Method:** `GET`
* **Path:** `/api/history/reviews`
* **Request:** Query parameters `?page=1&limit=20`
* **Response:** 
  ```json
  {
    "data": [
      {
        "id": "string",
        "pullRequestId": "string",
        "repositoryName": "string",
        "status": "COMPLETED",
        "createdAt": "string"
      }
    ],
    "meta": { "total": 50 }
  }
  ```
* **Error Cases:** 
  - `401 Unauthorized`: Missing or invalid Bearer token.
* **Authorization Rules:** Requires a valid Bearer token. Returns only historical reviews associated with the authenticated user's repositories.

---

## 7. GitHub Comment APIs

### Ingress Webhook (GitHub -> Backend)
* **Method:** `POST`
* **Path:** `/api/webhooks/github`
* **Request:** Standard GitHub App Webhook payload (e.g., `pull_request` opened/synchronize event). Headers contain `X-Hub-Signature-256`.
* **Response:** `202 Accepted` (Or `200 OK` for ping events).
* **Error Cases:** 
  - `401 Unauthorized`: Invalid webhook signature.
  - `400 Bad Request`: Malformed payload or unsupported event type.
* **Authorization Rules:** Validated exclusively via cryptographic hash matching using the `WEBHOOK_SECRET`.

### Publish Findings to GitHub
* **Method:** `POST`
* **Path:** `/api/reviews/:reviewId/publish`
* **Request:** None (Uses the finalized findings from the database for the given review ID).
* **Response:** 
  ```json
  {
    "status": "success",
    "publishedComments": 3
  }
  ```
* **Error Cases:** 
  - `400 Bad Request`: Review is not yet COMPLETED.
  - `401 Unauthorized`: Missing or invalid Bearer token.
  - `404 Not Found`: Review ID does not exist.
  - `502 Bad Gateway`: GitHub API rejected the comment submission (e.g., invalid PR line mapping).
* **Authorization Rules:** Requires a valid Bearer token. User must own the parent repository.
