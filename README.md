# AI Content Management System

AI-powered content generator and management system built with the MERN stack and Google Gemini.
Users can authenticate, generate content via an AI model with a **1-minute delayed job queue**, and manage the generated content in a dashboard.

---

## 1. Project Overview

This app lets users:

- **Register & log in** securely with JWT.
- **Generate AI content** (Blog Post Outline, Product Description, Social Media Caption) using Google Gemini.
- **Queue AI generation jobs** with a 1-minute delay using Redis + BullMQ.
- **Poll or receive real-time updates** on job status (via REST polling or WebSockets).
- **Store and manage content** in MongoDB (CRUD).
- **Analyze sentiment** of generated content (positive / neutral / negative).
- Use a **responsive React/Next.js UI** with a dashboard and content creation tools.

The project is structured as a **backend** (Express + MongoDB + BullMQ) and **frontend** (Next.js + Redux Toolkit Query), with **Docker** support for local development.

---

## 2. Tech Stack

- **Frontend**

  - Next.js (App Router) + TypeScript
  - React
  - Redux Toolkit + RTK Query
  - Socket.IO client

- **Backend**

  - Node.js + Express + TypeScript
  - MongoDB + Mongoose
  - BullMQ + Redis (job queue)
  - JWT + bcrypt
  - Socket.IO server

- **AI**

  - Google Gemini via `@google/genai` (content generation + sentiment analysis)

- **Tooling & Testing**
  - Jest (unit + integration tests on backend)
  - Docker & Docker Compose
  - ESLint, TypeScript

---

## 3. Architecture & Design Decisions

### 3.1 High-Level Architecture

- **Frontend** (Next.js)

  - Implements login/register, dashboard, content listing, content detail/editor, and AI generator UI.
  - Uses **Redux Toolkit Query** for data fetching and caching of:
    - Authentication
    - Content CRUD
    - AI content generation (enqueue job)
    - Job status polling

- **Backend** (Express)

  - Exposes REST APIs for:
    - Auth (`/api/auth`)
    - Content CRUD and AI job enqueue (`/api/content`)
    - Job status (`/api/jobs`)
  - Protects content and job routes with **JWT auth middleware**.
  - Uses **MongoDB** for users, content, and job documents.
  - Uses **BullMQ + Redis** for delayed job processing.

- **Worker**

  - Separate Node process consuming the BullMQ queue.
  - After 1-minute delay, calls Gemini to generate content and analyze sentiment.
  - Persists final content into MongoDB and updates job status.

- **Real-Time Updates**
  - **Status polling** via `/api/jobs/:jobId/status` for tracking job progress.
  - **Socket.IO** real-time `jobUpdate` events to notify the frontend, which can then refresh content.

### 3.2 Why These Choices?

- **Next.js + TypeScript**: Modern React framework with good DX, routing, and TypeScript support.
- **Redux Toolkit / RTK Query**: Provides a robust state management and data-fetching solution while simplifying API calls, caching, and loading/error states.
- **BullMQ + Redis**: Well-supported Node queue library with first-class delayed jobs and good integration with Redis.
- **MongoDB + Mongoose**: Natural fit for flexible content documents and easy relationships between users, jobs, and content.
- **Google Gemini (`@google/genai`)**: Simple library to consume Google’s Generative AI for content generation and sentiment analysis.

---

## 4. Features

### 4.1 Core MERN Functionality

- **User Accounts & Content Storage**

  - MongoDB collections for:
    - `User` (email, passwordHash)
    - `Content` (user, title, type, prompt, body, sentiment)
    - `Job` (user, prompt, contentType, status, resultContent, error)

- **Secure RESTful APIs (CRUD)**

  - `POST /api/content`
  - `GET /api/content`
  - `GET /api/content/:id`
  - `PUT /api/content/:id`
  - `DELETE /api/content/:id`

- **JWT Authentication**

  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `authMiddleware` protects content and jobs routes using `Authorization: Bearer <token>`.

- **Responsive UI**
  - Next.js pages for:
    - Login / Registration
    - Dashboard (content listing + search)
    - Content creation / AI generator panel

### 4.2 AI/ML Integration

- **Smart Content Generator**

  - User inputs:
    - `prompt`
    - `contentType` (blog outline / product description / social media caption)
  - Frontend calls `POST /api/content/generate` (via RTK Query `useGenerateContentMutation`).
  - Backend **does not** directly call the AI; it enqueues a job in Redis.

- **AI Processing (Backend Worker)**
  - Worker uses `generateContent` to call Gemini with the constructed prompt.
  - Parses Gemini output into `title` + `body`.
  - Runs `analyzeSentiment` using Gemini again.
  - Saves generated content + sentiment in MongoDB.

---

## 5. Queue, Worker & Status Flow

### 5.1 Queue & Delayed Job

- **Endpoint**: `POST /api/content/generate`
  - Validates `prompt` and `contentType`.
  - Creates a `Job` document with status `pending`.
  - Enqueues a BullMQ job in `generateQueue` with:
    - **delay**: `60000ms` (1 minute).
    - `jobId` mapped to the MongoDB `Job` record.
  - Responds **immediately** with `202 Accepted`:
    - `{ jobId, delayMs, message: "Job queued" }`.

### 5.2 Worker Process

- Separate script: `backend/src/worker.ts`
- Connects to MongoDB and Redis.
- After delay:
  - Updates job status to `processing`.
  - Calls Gemini to generate content and sentiment.
  - Creates `Content` document.
  - Updates job status to `completed` and links `resultContent`.
  - On errors, sets status to `failed` and stores an error message.

### 5.3 Status Polling

- **Endpoint**: `GET /api/jobs/:jobId/status`
  - Auth-protected.
  - Returns job `status`, `error` (if any), and `content` (once available).
- Frontend uses `useGetJobStatusQuery` with polling interval when in polling mode.

### 5.4 WebSockets / Real-Time Updates

- Backend integrates Socket.IO (`setupSocketAndQueueEvents`).
- Worker emits job completion events.
- Frontend:
  - Connects to Socket.IO.
  - Listens for `jobUpdate` events for the current job.
  - On update, refreshes content list / job status and clears the active job ID.

---

## 6. Additional Capabilities

- **Deployment**
  - Runs via `docker-compose.yml` with services: `backend`, `frontend`, `worker`, `mongo`, `redis`
  - Deployed on AWS EC2 using Docker Compose + Nginx reverse proxy + Let's Encrypt HTTPS
  - Live at: https://aicms.shehjad.dev

- **AI Enhancement**

  - Adds **sentiment analysis** on generated content via Gemini:
    - Classifies as `positive`, `neutral`, or `negative`.
    - Stored on each `Content` document.

- **Predictive Search**

  - `GET /api/content?q=<titleFragment>`:
    - Backend performs case-insensitive regex filtering on `title`.
    - Used by the dashboard search to approximate predictive search.

- **Testing**

  - Jest config and tests for:
    - Auth service & integration.
    - Content service & integration.
  - Run with `npm test` in the backend.

- **State Management**
  - Redux Toolkit & RTK Query in `frontend/redux`:
    - `baseApi` for configuration.
    - `contentApi` and `authApi` slices.
    - Centralized store and hooks: `useListContentQuery`, `useGenerateContentMutation`, etc.

---

## 7. Getting Started

### 7.1 Prerequisites

- Node.js (LTS)
- npm
- Docker & Docker Compose (recommended)
- A Google Gemini API key

### 7.2 Environment Variables

Create `backend/.env`:

```env
PORT=4000
MONGO_URI=mongodb://mongo:27017/ai_content_db
REDIS_URL=redis://redis:6379
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

For local (non-Docker) development you can also set:

```env
MONGO_URI=mongodb://localhost:27017/ai_content_db
REDIS_URL=redis://localhost:6379
```

Frontend uses:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

---

## 8. Running Locally

### 8.1 With Docker Compose (Recommended)

From `ai-content-management-system/`:

```bash
docker-compose up --build
```

Services:

- Backend: http://localhost:4000
- Frontend: http://localhost:3000
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

The worker and backend containers communicate with Redis and MongoDB internally.

### 8.2 Running Manually (Without Docker)

1. **Start MongoDB & Redis** locally (or via separate containers).
2. **Backend**

   ```bash
   cd backend
   npm install
   npm run dev      # or npm start for compiled build
   ```

3. **Worker**

   ```bash
   cd backend
   npm run worker
   ```

4. **Frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

---

## 9. API Documentation

### 9.1 Auth

- **POST `/api/auth/register`**

  - Body: `{ "email": string, "password": string }`
  - Response: `{ "id": string, "email": string }`

- **POST `/api/auth/login`**
  - Body: `{ "email": string, "password": string }`
  - Response:
    ```json
    {
      "token": "jwt-token",
      "user": { "id": "...", "email": "..." }
    }
    ```

Use the returned `token` as:

```http
Authorization: Bearer <token>
```

for all protected routes.

### 9.2 Content

All content endpoints require JWT.

- **GET `/api/content`**

  - Query params: `q?` (optional search by title)
  - Response: `Content[]`

- **GET `/api/content/:id`**

  - Response: `Content`

- **POST `/api/content`**

  - Body:
    ```json
    {
      "title": "string",
      "type": "blog_outline | product_description | social_caption",
      "prompt": "string",
      "body": "string"
    }
    ```

- **PUT `/api/content/:id`**

  - Body: `{ "title": string, "body": string }`

- **DELETE `/api/content/:id`**

  - Response: `204 No Content`

- **POST `/api/content/generate`**
  - Body:
    ```json
    {
      "prompt": "string",
      "contentType": "blog_outline | product_description | social_caption"
    }
    ```
  - Response `202 Accepted`:
    ```json
    {
      "jobId": "string",
      "delayMs": 60000,
      "message": "Job queued"
    }
    ```

### 9.3 Job Status

- **GET `/api/jobs/:jobId/status`**
  - Response:
    ```json
    {
      "status": "pending | processing | completed | failed",
      "error": "string | null",
      "content": {
        /* Content document or null */
      }
    }
    ```

---

## 10. Frontend UX Overview

- **Login / Register**
  - Simple forms that call the auth API and store JWT.
- **Dashboard**
  - Lists user content with search.
  - Clicking an item shows title/body/sentiment.
- **AI Generator**
  - Form for `prompt` + `contentType`.
  - On submit:
    - Calls `POST /api/content/generate`.
    - Stores `jobId` and:
      - Either **polls** `/api/jobs/:jobId/status` every few seconds, or
      - Listens for Socket.IO `jobUpdate` events.
  - On completion:
    - Refreshes content list.
    - Shows the latest generated content.

---

## 11. Testing

From `backend/` you can run unit tests and integration tests separately.

### 11.1 Unit Tests

```bash
npm test
```

This runs Jest against the module-level tests under `src/modules` (e.g., auth and content services).

### 11.2 Integration Tests

Integration tests exercise the HTTP endpoints using Supertest and require a running **MongoDB instance** (and appropriate `MONGO_URI` for the test environment).

```bash
npm run test:integration
```

These tests cover, for example:

- Authentication flows.
- Content CRUD over HTTP.

---

## 12. Deployment

This project is deployed on an AWS EC2 instance using Docker Compose:

- AWS EC2 instance with Docker and Docker Compose installed
- Elastic IP associated with the instance
- Domain (e.g., shehjad.dev) with an A record pointing the subdomain to the Elastic IP
- Nginx installed as reverse proxy
- Let's Encrypt certificate configured via Certbot for HTTPS

### Infrastructure Details
- **AWS EC2 instance** with Amazon Linux 2023  
- **Elastic IP** (static public IPv4 address) associated with the instance for reliable access  
- **Domain A record** pointing the subdomain `aicms` to the Elastic IP (managed via Namecheap Advanced DNS)

### How to Access
- **URL**: https://aicms.shehjad.dev  
- Protocol: HTTPS (secured with Let's Encrypt certificate)  
- All HTTP requests are automatically redirected to HTTPS  

---

## 13. Repository & Development Notes

- Follow commit messages showing iterative development (backend first, then frontend, then queue/worker, then tests).
- Linting and type-checking are encouraged before pushing:
  - `npm run lint` (frontend)
  - `npm run build` / `tsc` (backend)
