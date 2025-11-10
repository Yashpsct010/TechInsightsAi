# TechInsightsAI

## AI-Powered Tech Blog with PWA and Automated Content Generation

TechInsightsAI is a modern, full-stack web application that leverages Artificial Intelligence to automatically generate and publish engaging blog posts on trending technology topics. Designed as a Progressive Web App (PWA), it offers a seamless user experience with offline capabilities and push notifications, ensuring users stay updated even without an internet connection.

The project features a robust backend that orchestrates content generation and serves a RESTful API, complemented by a dynamic React frontend for an intuitive user interface.

## Features

*   **AI-Powered Content Generation:** Automatically generates detailed blog posts on various tech topics (AI/ML, Cybersecurity, Coding, etc.) using the Gemini API.
*   **Automated Publishing:** Scheduled GitHub Actions workflow triggers new blog post generation every 3 hours, ensuring fresh content.
*   **Progressive Web App (PWA):** Installable on devices, offering an app-like experience with offline support and push notifications.
*   **Offline Data Access:** Blogs are cached using IndexedDB, allowing users to view content even when offline.
*   **Dynamic Blog Archive:** Browse all blog posts with server-side pagination, genre filtering, date filtering, and search functionality.
*   **Responsive Design:** Optimized for various screen sizes using Tailwind CSS.
*   **Robust API Handling:** Enhanced API service with retry mechanisms and exponential backoff using `APIMonitor` for improved resilience.
*   **User-Friendly Interface:** Built with React and `framer-motion` for smooth animations and transitions.

## Technology Stack

### Frontend
*   **Framework:** React.js
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **Animations:** Framer Motion
*   **Routing:** React Router DOM
*   **PWA:** `vite-plugin-pwa`
*   **Offline Storage:** IndexedDB (via `offlineDataService`)

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB (via Mongoose ODM)
*   **API Integration:** Axios (for external API calls like Gemini, Unsplash)
*   **Environment Variables:** `dotenv`

### DevOps & Deployment
*   **Frontend Deployment:** Vercel
*   **Backend Deployment:** Render
*   **CI/CD:** GitHub Actions (for automated blog generation)

## Key Improvements & Refactorings

During recent development cycles, the following significant improvements and refactorings have been implemented:

*   **Backend Database Optimization:** Refactored database connection logic for serverless environments, ensuring efficient connection reuse and retry mechanisms.
*   **Cleaned Backend API:** Consolidated API routing and controller logic, moving inline route handlers to dedicated controller functions for better separation of concerns.
*   **Optimized Database Indexing:** Enhanced MongoDB schema with optimized indexes for faster query performance, especially for fetching latest and filtered blog posts.
*   **Efficient CI/CD Workflow:** Re-architected the GitHub Actions workflow for automated blog generation to run tasks in parallel, drastically reducing execution time and improving efficiency.
*   **Frontend Filtering Fix:** Migrated date and search term filtering from inefficient client-side processing to robust server-side API handling, ensuring accurate results and improved performance for the blog archive.
*   **Component Logic Extraction:** Extracted complex data-fetching and state-management logic from `Blog.jsx` and `BlogDetailPage.jsx` into reusable custom hooks (`useLatestBlog`, `useBlogById`), making components cleaner and more focused on UI.
*   **Enhanced API Resilience:** Integrated `APIMonitor` into the frontend `blogService` to provide intelligent retry mechanisms with exponential backoff, making API calls more robust against transient failures.
*   **PWA Notification Integration:** Implemented push notification subscription logic into the PWA's main entry point, enabling users to receive updates.
*   **Codebase Cleanup:** Removed several redundant and unused files from the frontend, streamlining the project and reducing unnecessary code.

## Setup & Installation

To get a copy of the project up and running on your local machine for development and testing purposes, follow these steps.

### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm or Yarn
*   MongoDB instance (local or cloud-hosted)
*   Gemini API Key
*   Unsplash API Key (for image generation)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/TechInsightsAi.git
cd TechInsightsAi
```

### 2. Backend Setup
Navigate to the `server` directory and install dependencies:
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory based on `.env.example` and fill in your details:
```
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_URL=your_gemini_api_url
GEMINI_API_KEY=your_gemini_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
CRON_SECRET=a_secret_key_for_cron_job_authorization
```
Start the backend server:
```bash
npm start
```
The backend will run on `http://localhost:5000` by default.

### 3. Frontend Setup
Navigate back to the root directory and then into the frontend `src` directory:
```bash
cd ..
npm install
```
Create a `.env` file in the root directory based on `.env.example` and fill in your details:
```
VITE_API_BASE_URL=http://localhost:5000/api
```
Start the frontend development server:
```bash
npm run dev
```
The frontend will typically run on `http://localhost:5173`.

## Usage

*   Open your browser to the frontend URL (e.g., `http://localhost:5173`).
*   Explore the "Latest Blog" for the most recent AI-generated article.
*   Visit "All Blogs" to browse the archive, using the search, genre, and date filters.
*   Install the PWA to experience offline capabilities and receive notifications (ensure `VAPID_PUBLIC_KEY` is configured in `notificationService.js` and backend).

## License

This project is licensed under the MIT License.

