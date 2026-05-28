// src/types/index.ts

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  university_name?: string;
  degree_program?: string;
  current_semester: number;
  completed_semesters: number;
  current_cgpa?: number;
  avatar_url?: string;
  created_at: string;
}

export interface Course {
  id: string;
  user_id: string;
  name: string;
  category: string;
  credits: number;
  semester: number;
  syllabus_url?: string;
  created_at: string;
  course_code?: string; // <-- Add this
  color?: string;       // <-- Add this
}

export interface Document {
  id:         string;
  course_id:  string;
  user_id:    string;
  name:       string;
  type:       "pdf" | "ppt" | "note" | "obe";
  url:        string;
  size:       number;
  content?:   string | null;   // ← add this
  created_at: string;
}
export interface Task {
  id: string;
  user_id: string;
  course_id?: string;
  title: string;
  type: "homework" | "assignment" | "lab_report" | "presentation" | "quiz" | "other";
  due_date?: string;
  status: "pending" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  ai_generated: boolean;
  created_at: string;
  description?: string;
}

export interface Grade {
  id: string;
  user_id: string;
  course_id: string;
  semester: number;
  quiz_marks: number[];
  midterm_mark?: number;
  final_mark?: number;
  sgpa?: number;
  attendance?: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  course_id?: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export type Priority   = "low" | "medium" | "high";
export type TaskStatus = "pending" | "in_progress" | "done";
export type TaskType   = "homework" | "assignment" | "lab_report" | "presentation" | "quiz" | "other";


