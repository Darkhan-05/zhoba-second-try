# Six Thinking Hats Interactive Platform

A full-stack educational platform built with Next.js, NestJS, and Prisma. It facilitates interactive "Six Thinking Hats" discussions by automatically assigning roles to students and using AI to summarize dozens of responses into a high-level report for the teacher.

## Project Structure

- `frontend/`: Next.js (App Router) with Tailwind CSS and Lucide React.
- `backend/`: NestJS with Prisma ORM and Google Gemini AI integration.

---

## Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

---

## Environment Variables

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory with the following keys:

```env
# Database connection string (using SQLite by default)
DATABASE_URL="file:./dev.db"

# Google Gemini API Key for AI Analytics
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Server port (defaults to 3001)
PORT=3001
```

---

## Database Setup

The project uses Prisma with SQLite for ease of use.

1.  **Run Migrations:** Initialize the database and create tables.
    ```bash
    cd backend
    npx prisma migrate dev --name init
    ```
2.  **Generate Client:** Ensure the Prisma client is up to date.
    ```bash
    npx prisma generate
    ```

---

## How to Run

### Development Mode

**Start Backend:**
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:3001`.

### Production Build

**Build and Start Backend:**
```bash
cd backend
npm run build
npm run start:prod
```

**Build and Start Frontend:**
```bash
cd frontend
npm run build
npm run start
```

---

## Teacher Guide

1.  **Access Dashboard:** Open your browser and navigate to `http://localhost:3000/teacher`.
2.  **Create Session:**
    - Enter a **Discussion Topic** (e.g., "The impact of remote work on class culture").
    - Enter a unique **Room Code** (e.g., "CLASS101").
    - Click **Launch Session**.
3.  **Monitor Progress:** The dashboard will show a real-time counter of how many students have submitted their answers.
4.  **Generate AI Insight:** Once you have enough responses (the platform is optimized for 60-80 students), click the **Generate AI Insight** button.
5.  **Review Summary:** Read the structured summary covering factual data, emotional climate, critical risks, innovative ideas, and the final consensus.

---

## Student Guide

1.  **Join Session:** Go to `http://localhost:3000/` and enter your name and the Room Code provided by the teacher.
2.  **Assigned Hat:** You will be automatically assigned one of the Six Thinking Hats (White, Red, Black, Yellow, Green, or Blue).
3.  **Submit Response:** Read the topic and your role description. Enter your thoughts in the text area and click **Submit to Session**.
