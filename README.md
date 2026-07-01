# UniMind

Welcome to **UniMind**, your intelligent, all-in-one academic companion! UniMind leverages cutting-edge AI to help university students manage their courses, understand complex materials, track grades, and stay on top of deadlines with interactive active recall.

This project is a massive feature update ("Vamp Update") over the original repository, introducing `.docx` support and dynamic class logs system for studying.

---

## ✨ Key Features

- **🤖 Context-Aware AI Assistant**: Chat with an AI (powered by Groq & Llama 3.3) that already knows your courses, tasks, grades, and uploaded documents.
- **👁️ Vision AI Integration**: Upload photos of math problems or handwritten notes, and our Vision AI (Llama 4 Scout) will solve and explain them step-by-step.
- **📚 Smart Course Management**: Track credits, semesters, and upload course materials directly to your dashboard.
- **📄 Advanced Document Parsing**: Upload PDFs or `.docx` files. UniMind extracts the text and uses it to answer your questions and generate study materials.
- **📅 Class Logs & Timelines**: Tell the AI what you learned today, and it will automatically log it to your course timeline so you never lose track of syllabus pacing.
- **📊 Grade & GPA Tracking**: Enter your quiz, midterm, and final marks. UniMind visualizes your semester GPA trends.
- **✅ Task Management**: A built-in Kanban/List system for assignments and exams, complete with priority flags.
- **📧 Automated Email Reminders**: Get daily digests and deadline reminders directly to your inbox via Resend.

---

## 🛠️ Technology Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), React 19, TypeScript
- **Styling**: Vanilla CSS (Glassmorphism & Claymorphism aesthetic), Framer Motion (Animations), TailwindCSS (Utility classes)
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth)
- **AI Integration**: [Groq API](https://groq.com/) (Llama 3.3 70B & Llama 4 Vision 17B)
- **Document Processing**: `pdf-parse`, `mammoth` (for DOCX), `jszip`
- **Emails**: [Resend](https://resend.com/) API

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm, yarn, pnpm, or bun
- A [Supabase](https://supabase.com/) account
- A [Groq](https://console.groq.com/) API Key

### 2. Clone the Repository

```bash
git clone https://github.com/RayanAnthonyGomes/UniMind.git
cd UniMind
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Environment Variables

Create a `.env.local` file in the root of the project and add the following keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
RESEND_API_KEY=your_resend_api_key
```

### 5. Database Setup (Supabase)

You will need to set up the following tables in your Supabase SQL editor:

- `profiles`
- `courses`
- `tasks`
- `grades`
- `semester_gpas`
- `documents`
- `lectures`
- `class_logs`

_(Note: If you have `.sql` schema files included in the project like `flashcards_schema.sql` or `class_logs.sql`, simply copy and paste them into the Supabase SQL Editor and hit run to automatically create the tables and security policies)._

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app running!

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/RayanAnthonyGomes/UniMind/issues) if you want to contribute.
