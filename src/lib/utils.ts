// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour >= 1  && hour < 5)  return `Just another late night, ${name}? 🌙`;
  if (hour >= 5  && hour < 12) return `Good morning, ${name}! ☀️`;
  if (hour >= 12 && hour < 17) return `Good afternoon, ${name}! 👋`;
  if (hour >= 17 && hour < 21) return `Good evening, ${name}! 🌆`;
  return `Burning the midnight oil, ${name}? 🕯️`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
  }).format(new Date(date));
}

export function calculateSGPA(marks: number[]): number {
  if (!marks.length) return 0;
  return Math.round((marks.reduce((a, b) => a + b, 0) / marks.length) * 100) / 100;
}

export function calculateCGPA(sgpas: number[]): number {
  if (!sgpas.length) return 0;
  return Math.round((sgpas.reduce((a, b) => a + b, 0) / sgpas.length) * 100) / 100;
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + "..." : str;
}

export function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}
// Add to bottom of src/lib/utils.ts

// Grade point from percentage mark
// export function gradePoint(mark: number): number {
//   if (mark >= 80) return 4.00;
//   if (mark >= 75) return 3.75;
//   if (mark >= 70) return 3.50;
//   if (mark >= 65) return 3.25;
//   if (mark >= 60) return 3.00;
//   if (mark >= 55) return 2.75;
//   if (mark >= 50) return 2.50;
//   if (mark >= 45) return 2.25;
//   if (mark >= 40) return 2.00;
//   return 0.00;
// }

// Letter grade from percentage
// export function letterGrade(mark: number): string {
//   if (mark >= 80) return "A+";
//   if (mark >= 75) return "A";
//   if (mark >= 70) return "A-";
//   if (mark >= 65) return "B+";
//   if (mark >= 60) return "B";
//   if (mark >= 55) return "B-";
//   if (mark >= 50) return "C+";
//   if (mark >= 45) return "C";
//   if (mark >= 40) return "D";
//   return "F";
// }

// Grade color based on letter
// export function gradeColor(mark: number): string {
//   if (mark >= 75) return "#22c55e";
//   if (mark >= 60) return "#f59e0b";
//   if (mark >= 40) return "#f97316";
//   return "#ef4444";
// }

// Weighted SGPA from courses with credits
export function weightedSGPA(
  courses: { sgpa: number; credits: number }[]
): number {
  const valid = courses.filter((c) => c.sgpa > 0);
  if (!valid.length) return 0;
  const totalPoints  = valid.reduce((a, c) => a + c.sgpa * c.credits, 0);
  const totalCredits = valid.reduce((a, c) => a + c.credits, 0);
  if (!totalCredits) return 0;
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

//gemini bolse 
// src/lib/utils.ts

export function letterGrade(totalMarks: number): string {
  if (totalMarks >= 80) return "A+";
  if (totalMarks >= 75) return "A";
  if (totalMarks >= 70) return "A-";
  if (totalMarks >= 65) return "B+";
  if (totalMarks >= 60) return "B";
  if (totalMarks >= 55) return "B-";
  if (totalMarks >= 50) return "C+";
  if (totalMarks >= 45) return "C";
  if (totalMarks >= 40) return "D";
  return "F";
}

export function gradePoint(totalMarks: number): number {
  if (totalMarks >= 80) return 4.00;
  if (totalMarks >= 75) return 3.75;
  if (totalMarks >= 70) return 3.50;
  if (totalMarks >= 65) return 3.25;
  if (totalMarks >= 60) return 3.00;
  if (totalMarks >= 55) return 2.75;
  if (totalMarks >= 50) return 2.50;
  if (totalMarks >= 45) return 2.25;
  if (totalMarks >= 40) return 2.00;
  return 0.00;
}

export function gradeColor(totalMarks: number): string {
  if (totalMarks >= 70) return "#22c55e"; // Green for A-, A, A+
  if (totalMarks >= 55) return "#f59e0b"; // Yellow for B-, B, B+
  if (totalMarks >= 40) return "#f97316"; // Orange for C, C+, D
  return "#ef4444"; // Red for F
}