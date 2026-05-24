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