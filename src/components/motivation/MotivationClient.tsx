// src/components/motivation/MotivationClient.tsx
"use client";

import { useState } from "react";
import {
  Sparkles, Heart, BookOpen, Play,
  RefreshCw, Loader2, ChevronRight,
  Star, Zap, Target, TrendingUp,
  Brain, Coffee, Sun, Moon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

// ── Static content ────────────────────────────────────────────────────

const TED_TALKS = [
  {
    title:    "The Power of Believing That You Can Improve",
    speaker:  "Carol Dweck",
    duration: "10 min",
    url:      "https://www.ted.com/talks/carol_dweck_the_power_of_believing_that_you_can_improve",
    topic:    "Growth Mindset",
    emoji:    "🧠",
    desc:     "Discover the power of 'not yet' and how a growth mindset transforms your relationship with challenges.",
  },
  {
    title:    "Inside the Mind of a Master Procrastinator",
    speaker:  "Tim Urban",
    duration: "14 min",
    url:      "https://www.ted.com/talks/tim_urban_inside_the_mind_of_a_master_procrastinator",
    topic:    "Productivity",
    emoji:    "⏰",
    desc:     "A hilarious and honest look at why we procrastinate and what to do about it.",
  },
  {
    title:    "How to Stop Screwing Yourself Over",
    speaker:  "Mel Robbins",
    duration: "21 min",
    url:      "https://www.ted.com/talks/mel_robbins_how_to_stop_screwing_yourself_over",
    topic:    "Motivation",
    emoji:    "🚀",
    desc:     "The 5-second rule that forces you into action even when you don't feel like it.",
  },
  {
    title:    "The Puzzle of Motivation",
    speaker:  "Dan Pink",
    duration: "18 min",
    url:      "https://www.ted.com/talks/dan_pink_the_puzzle_of_motivation",
    topic:    "Psychology",
    emoji:    "🎯",
    desc:     "Why traditional rewards don't work and what actually drives high performance.",
  },
  {
    title:    "Your Body Language May Shape Who You Are",
    speaker:  "Amy Cuddy",
    duration: "20 min",
    url:      "https://www.ted.com/talks/amy_cuddy_your_body_language_may_shape_who_you_are",
    topic:    "Confidence",
    emoji:    "💪",
    desc:     "How posture and body language can change your mindset before exams and presentations.",
  },
  {
    title:    "How to Make Stress Your Friend",
    speaker:  "Kelly McGonigal",
    duration: "14 min",
    url:      "https://www.ted.com/talks/kelly_mcgonigal_how_to_make_stress_your_friend",
    topic:    "Stress",
    emoji:    "🌊",
    desc:     "Rethink stress — it might actually be making you stronger and more resilient.",
  },
];

const SUCCESS_STORIES = [
  {
    name:    "Jack Ma",
    emoji:   "🚀",
    tagline: "Failed 30 times before building Alibaba",
    story:   "Rejected by Harvard 10 times. Failed his university entrance exam twice. Rejected from KFC when 24 people applied and 23 got jobs. Today he built one of the world's largest companies.",
    lesson:  "Persistence over perfection. Every rejection is redirection.",
    color:   "#fbbf24",
    bg:      "rgba(245, 158, 11, 0.1)",
  },
  {
    name:    "J.K. Rowling",
    emoji:   "✨",
    tagline: "Harry Potter rejected 12 times before being published",
    story:   "A single mother on welfare, clinically depressed, manuscript rejected by every major publisher. She kept writing anyway. Harry Potter became the best-selling book series in history.",
    lesson:  "Your lowest point can be the beginning of your greatest story.",
    color:   "#a78bfa",
    bg:      "rgba(124, 58, 237, 0.1)",
  },
  {
    name:    "Einstein",
    emoji:   "🧠",
    tagline: "Couldn't speak until age 4, failed his entrance exam",
    story:   "Teachers called him slow and mentally handicapped. Failed the Zurich Polytechnic entrance exam. Later developed the theory of relativity and won the Nobel Prize.",
    lesson:  "Intelligence is not fixed. Curiosity and persistence matter more.",
    color:   "#4ade80",
    bg:      "rgba(34, 197, 94, 0.1)",
  },
  {
    name:    "Steve Jobs",
    emoji:   "🎯",
    tagline: "Dropped out, then got fired from his own company",
    story:   "Dropped out of college. Got fired from Apple — the company he founded. Used that time to start Pixar and NeXT, then returned to Apple to make it the most valuable company on Earth.",
    lesson:  "Getting lost can lead you exactly where you need to be.",
    color:   "#38bdf8",
    bg:      "rgba(14, 165, 233, 0.1)",
  },
];

const FOCUS_TECHNIQUES = [
  {
    name:    "Pomodoro Technique",
    emoji:   "🍅",
    steps:   ["Work for 25 minutes — no distractions", "Take a 5-minute break", "After 4 rounds, take a 20-minute break", "Repeat — your brain thrives on rhythm"],
    good:    "Assignments, reading, problem sets",
    color:   "#f87171",
    bg:      "rgba(248, 113, 113, 0.1)",
  },
  {
    name:    "The 2-Minute Rule",
    emoji:   "⚡",
    steps:   ["If a task takes less than 2 minutes — do it NOW", "Otherwise, schedule it with a specific time", "This kills procrastination at the root", "Start with the smallest possible step"],
    good:    "Overcoming procrastination, task backlogs",
    color:   "#fbbf24",
    bg:      "rgba(245, 158, 11, 0.1)",
  },
  {
    name:    "Active Recall",
    emoji:   "🧩",
    steps:   ["Read a section of your notes", "Close the book — write everything you remember", "Check what you missed — fill the gaps", "Repeat until recall is effortless"],
    good:    "Exam prep, memorization, understanding",
    color:   "#a78bfa",
    bg:      "rgba(124, 58, 237, 0.1)",
  },
  {
    name:    "The Feynman Technique",
    emoji:   "💡",
    steps:   ["Pick a concept you're learning", "Explain it in simple words as if teaching a child", "Identify gaps in your explanation", "Go back to the source and simplify further"],
    good:    "Deep understanding, complex topics",
    color:   "#4ade80",
    bg:      "rgba(34, 197, 94, 0.1)",
  },
];

const RESET_STEPS = [
  { icon: "🌬️", title: "Breathe first",        desc: "Take 5 deep breaths. You cannot think clearly when overwhelmed. Reset your nervous system first." },
  { icon: "📋", title: "List everything",        desc: "Write down every single thing stressing you. Don't organize — just dump it all out. Seeing it on paper makes it manageable." },
  { icon: "🎯", title: "Pick ONE thing",          desc: "From your list, pick the single most important task. Not five things — one. Do only that today." },
  { icon: "⏱️", title: "Work for 10 minutes",    desc: "Set a timer for 10 minutes and start the one task. Just 10 minutes. You'll almost always continue past it." },
  { icon: "🏆", title: "Celebrate small wins",   desc: "Every finished task — no matter how small — is progress. Acknowledge it. You're building momentum." },
  { icon: "😴", title: "Sleep is non-negotiable", desc: "A rested brain learns 3x faster. One good night's sleep is worth more than an all-nighter before an exam." },
];

// ── Interfaces ─────────────────────────────────────────────────────────
interface Profile {
  first_name:       string;
  university_name:  string;
  degree_program:   string;
  current_semester: number;
  current_cgpa:     number;
}
interface Course  { id: string; name: string; color: string; category: string; }
interface SemGpa  { semester: number; sgpa: number; }
interface Summary { id: string; title: string; content: string; created_at: string; }

type Tab = "overview" | "ted" | "stories" | "focus" | "reset";

// ── Health score color ─────────────────────────────────────────────────
function healthColor(score: number) {
  if (score >= 75) return "#4ade80"; // green-400
  if (score >= 50) return "#fbbf24"; // amber-400
  if (score >= 25) return "#f97316"; // orange-500
  return "#f87171"; // red-400
}
function healthLabel(score: number) {
  if (score >= 75) return "Thriving 🌟";
  if (score >= 50) return "Doing OK 💪";
  if (score >= 25) return "Needs Attention ⚠️";
  return "Let's Reset 🔄";
}

// ── Main component ─────────────────────────────────────────────────────
export default function MotivationClient({
  profile, courses, semGpas, healthScore,
  completionRate, overdueTasks, totalTasks, doneTasks,
  pastSummaries, userId,
}: {
  profile:        Profile;
  courses:        Course[];
  semGpas:        SemGpa[];
  healthScore:    number;
  completionRate: number;
  overdueTasks:   number;
  totalTasks:     number;
  doneTasks:      number;
  pastSummaries:  Summary[];
  userId:         string;
}) {
  const supabase = createClient();

  const [tab,       setTab]       = useState<Tab>("overview");
  const [pepTalk,   setPepTalk]   = useState<string | null>(
    pastSummaries[0]?.content ?? null
  );
  const [loading,   setLoading]   = useState(false);
  const [checkin,   setCheckin]   = useState<number | null>(null);
  const [checkSent, setCheckSent] = useState(false);

  // ── Generate AI pep talk ───────────────────────────────────
  async function generatePepTalk() {
    setLoading(true);
    setPepTalk(null);

    try {
      const res = await fetch("/api/ai/motivation", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          userId,
          profile,
          courses,
          semGpas,
          healthScore,
          completionRate,
          overdueTasks,
          mood: checkin,
        }),
      });

      const data = await res.json();
      const text = data.message ?? "Keep going — you're doing better than you think!";
      setPepTalk(text);

      // Save to ai_summaries
      await supabase.from("ai_summaries").insert({
        user_id:  userId,
        type:     "motivation",
        title:    `Pep Talk — ${new Date().toLocaleDateString()}`,
        content:  text,
      });
    } catch {
      toast.error("Couldn't generate pep talk. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Mood check-in ──────────────────────────────────────────
  async function submitCheckin(score: number) {
    setCheckin(score);
    setCheckSent(true);

    if (score <= 2) {
      toast("Generating something encouraging for you... 💙", { icon: "💙" });
      setTimeout(() => generatePepTalk(), 500);
    } else {
      toast.success("Good to know! Keep up the great work 🌟");
    }
  }

  const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
    { value: "overview", label: "Overview",       icon: <TrendingUp size={15} /> },
    { value: "ted",      label: "TED Talks",      icon: <Play       size={15} /> },
    { value: "stories",  label: "Success Stories", icon: <Star      size={15} /> },
    { value: "focus",    label: "Focus Techniques",icon: <Brain      size={15} /> },
    { value: "reset",    label: "Start Over",      icon: <RefreshCw  size={15} /> },
  ];

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-display)", marginBottom: "0.25rem" }}>
          Motivation Hub 💪
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
          Your personal space to refocus, recharge and get back on track
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: "0.5rem", flexWrap: "wrap",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        paddingBottom: "0",
      }}>
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            style={{
              display: "flex", alignItems: "center", gap: "0.375rem",
              padding: "0.625rem 1.125rem",
              background: "none", border: "none", cursor: "pointer",
              fontSize: "0.875rem", fontWeight: 600,
              color: tab === t.value ? "var(--color-primary-400)" : "var(--color-text-muted)",
              borderBottom: `2px solid ${tab === t.value ? "var(--color-primary-400)" : "transparent"}`,
              marginBottom: "-1px",
              transition: "all 0.15s",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────────────── */}
      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Health score + mood check-in */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

            {/* Academic health */}
            <div className="glass-card-static" style={{ padding: "2rem", textAlign: "center" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)",
                          textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.25rem" }}>
                Academic Health Score
              </p>

              {/* Circle progress */}
              <div style={{ position: "relative", width: "120px", height: "120px", margin: "0 auto 1rem" }}>
                <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke="rgba(255, 255, 255, 0.1)" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke={healthColor(healthScore)} strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - healthScore / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                  />
                </svg>
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: "1.625rem", fontWeight: 700, color: healthColor(healthScore) }}>
                    {healthScore}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>/ 100</span>
                </div>
              </div>

              <p style={{ fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
                {healthLabel(healthScore)}
              </p>

              <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1rem" }}>
                {[
                  { label: "Tasks done",  value: `${completionRate}%` },
                  { label: "Overdue",     value: overdueTasks         },
                  { label: "CGPA",        value: profile.current_cgpa?.toFixed(2) ?? "—" },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-primary)" }}>{s.value}</p>
                    <p style={{ fontSize: "0.7rem",  color: "var(--color-text-muted)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood check-in */}
            <div className="glass-card-static" style={{ padding: "2rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)",
                          textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.875rem" }}>
                How are you feeling today?
              </p>

              {!checkSent ? (
                <>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
                    Be honest — your AI adjusts its advice based on your mood.
                  </p>
                  <div style={{ display: "flex", gap: "0.625rem" }}>
                    {[
                      { score: 1, emoji: "😞", label: "Struggling" },
                      { score: 2, emoji: "😕", label: "Meh"        },
                      { score: 3, emoji: "😐", label: "Okay"       },
                      { score: 4, emoji: "🙂", label: "Good"       },
                      { score: 5, emoji: "😄", label: "Great"      },
                    ].map((m) => (
                      <button
                        key={m.score}
                        onClick={() => submitCheckin(m.score)}
                        style={{
                          flex: 1, display: "flex", flexDirection: "column",
                          alignItems: "center", gap: "0.25rem",
                          padding: "0.875rem 0.25rem",
                          borderRadius: "12px",
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          cursor: "pointer", transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(124, 58, 237, 0.15)";
                          e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.3)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <span style={{ fontSize: "1.75rem" }}>{m.emoji}</span>
                        <span style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                  <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                    {checkin! <= 2 ? "💙" : checkin! <= 3 ? "👍" : "🌟"}
                  </p>
                  <p style={{ fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.375rem" }}>
                    {checkin! <= 2 ? "We've got you — hang tight"
                      : checkin! <= 3 ? "Keep pushing — you're doing fine"
                      : "Love the energy — keep it up!"}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                    {checkin! <= 2 ? "Your personal pep talk is being generated below..."
                      : "Come back anytime you need a boost."}
                  </p>
                  <button
                    onClick={() => { setCheckSent(false); setCheckin(null); }}
                    style={{
                      marginTop: "0.875rem", padding: "0.375rem 0.875rem",
                      borderRadius: "8px", background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      fontSize: "0.8rem", color: "var(--color-text-muted)", cursor: "pointer",
                    }}
                  >
                    Check in again
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* AI Pep talk */}
          <div className="glass-card-static" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Sparkles size={20} style={{ color: "white" }} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>Your Personal Pep Talk</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                    AI-generated just for you, based on your real data
                  </p>
                </div>
              </div>
              <button
                onClick={generatePepTalk}
                disabled={loading}
                className="btn-primary"
              >
                {loading
                  ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Generating...</>
                  : <><Sparkles size={15} /> {pepTalk ? "Regenerate" : "Generate"}</>
                }
              </button>
            </div>

            {loading && (
              <div style={{
                padding: "2rem", textAlign: "center",
                background: "rgba(255, 255, 255, 0.03)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.05)"
              }}>
                <div style={{ display: "flex", justifyContent: "center", gap: "5px", marginBottom: "0.75rem" }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} style={{
                      width: "10px", height: "10px", borderRadius: "50%",
                      background: "var(--color-primary-400)",
                      animation: `pulseDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                  Reading your academic journey and crafting something meaningful...
                </p>
              </div>
            )}

            {pepTalk && !loading && (
              <div style={{
                padding: "1.5rem",
                background: "linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(168, 85, 247, 0.1))",
                borderRadius: "12px",
                border: "1px solid rgba(124, 58, 237, 0.2)",
                lineHeight: 1.8,
                fontSize: "0.9375rem",
                color: "var(--color-text-primary)",
                whiteSpace: "pre-wrap",
              }}>
                {pepTalk}
              </div>
            )}

            {!pepTalk && !loading && (
              <div style={{
                padding: "2.5rem", textAlign: "center",
                background: "rgba(255, 255, 255, 0.02)", borderRadius: "12px",
                border: "1px dashed rgba(255, 255, 255, 0.1)",
              }}>
                <p style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>💙</p>
                <p style={{ fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.375rem" }}>
                  Your pep talk is waiting
                </p>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                  Click Generate — your AI reads your actual grades, tasks and progress
                  to write something genuinely personal.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TED TALKS TAB ─────────────────────────────────── */}
      {tab === "ted" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            Handpicked talks that students find genuinely life-changing. Each one is under 25 minutes.
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.25rem",
          }}>
            {TED_TALKS.map((talk) => (
              <a
                key={talk.title}
                href={talk.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <div className="glass-card" style={{ padding: "1.5rem", height: "100%", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", marginBottom: "0.875rem" }}>
                    <span style={{ fontSize: "2rem", flexShrink: 0 }}>{talk.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: 700,
                                  color: "var(--color-primary-400)", marginBottom: "0.25rem" }}>
                        {talk.topic} · {talk.duration}
                      </p>
                      <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--color-text-primary)",
                                  lineHeight: 1.3, marginBottom: "0.25rem" }}>
                        {talk.title}
                      </p>
                      <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>by {talk.speaker}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: "1rem" }}>
                    {talk.desc}
                  </p>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "0.375rem",
                    color: "var(--color-primary-400)", fontSize: "0.8125rem", fontWeight: 600,
                  }}>
                    <Play size={14} /> Watch on TED.com
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── SUCCESS STORIES TAB ───────────────────────────── */}
      {tab === "stories" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            Every person you look up to was once where you are right now. Here's proof.
          </p>
          {SUCCESS_STORIES.map((story) => (
            <div key={story.name} className="glass-card-static" style={{ padding: "1.75rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem" }}>
                <div style={{
                  width: "60px", height: "60px", borderRadius: "16px", flexShrink: 0,
                  background: story.bg, border: `1px solid ${story.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.75rem", boxShadow: `0 0 15px ${story.color}20`
                }}>
                  {story.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                      {story.name}
                    </h3>
                    <span className="clay-badge" style={{
                      background: story.bg, color: story.color, border: `1px solid ${story.color}40`
                    }}>
                      {story.tagline}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: "1rem" }}>
                    {story.story}
                  </p>
                  <div style={{
                    padding: "0.875rem 1rem", borderRadius: "10px",
                    background: story.bg,
                    border: `1px solid ${story.color}30`,
                    display: "flex", alignItems: "center", gap: "0.625rem",
                  }}>
                    <Zap size={16} style={{ color: story.color, flexShrink: 0 }} />
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, color: story.color }}>
                      {story.lesson}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── FOCUS TECHNIQUES TAB ──────────────────────────── */}
      {tab === "focus" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            Evidence-backed techniques used by top students and professionals worldwide.
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.25rem",
          }}>
            {FOCUS_TECHNIQUES.map((tech) => (
              <div key={tech.name} className="glass-card-static" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.125rem" }}>
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "12px",
                    background: tech.bg, border: `1px solid ${tech.color}40`, fontSize: "1.5rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, boxShadow: `0 0 15px ${tech.color}20`
                  }}>
                    {tech.emoji}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                      {tech.name}
                    </h3>
                    <p style={{ fontSize: "0.75rem", color: tech.color, fontWeight: 600 }}>
                      Best for: {tech.good}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {tech.steps.map((step, i) => (
                    <div key={i} style={{
                      display: "flex", gap: "0.625rem", alignItems: "flex-start",
                      padding: "0.5rem 0.75rem",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      borderRadius: "8px",
                    }}>
                      <span style={{
                        minWidth: "20px", height: "20px", borderRadius: "50%",
                        background: tech.bg, color: tech.color, border: `1px solid ${tech.color}40`,
                        fontSize: "0.7rem", fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        {i + 1}
                      </span>
                      <p style={{ fontSize: "0.8375rem", color: "var(--color-text-primary)", lineHeight: 1.5 }}>
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── START OVER / RESET TAB ────────────────────────── */}
      {tab === "reset" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Reset intro */}
          <div className="glass-card-static" style={{
            padding: "2rem",
            background: "linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(168, 85, 247, 0.1))",
            border: "1px solid rgba(124, 58, 237, 0.3)",
          }}>
            <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
              <span style={{ fontSize: "3rem", flexShrink: 0 }}>🌱</span>
              <div>
                <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                  Starting Over Is Not Giving Up
                </h2>
                <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                  Whether you've missed weeks of class, fallen behind on assignments,
                  or just completely lost the plot — this is your reset button.
                  No judgment. Just a clear path forward.
                </p>
              </div>
            </div>
          </div>

          {/* Course catch-up */}
          {courses.length > 0 && (
            <div className="glass-card-static" style={{ padding: "1.75rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
                📚 What you need to catch up on
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1.25rem" }}>
                Based on your enrolled courses — these are the priority areas
              </p>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "0.875rem",
              }}>
                {courses.map((course) => (
                  <div key={course.id} style={{
                    padding: "1rem", borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex", alignItems: "center", gap: "0.75rem",
                  }}>
                    <span style={{
                      width: "10px", height: "10px", borderRadius: "50%",
                      background: course.color, flexShrink: 0, boxShadow: `0 0 8px ${course.color}80`
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)",
                                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {course.name}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        {course.category}
                      </p>
                    </div>
                    
                    <a
                      href={`/courses/${course.id}`}
                      style={{
                        padding: "4px 8px", borderRadius: "6px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "var(--color-primary-400)",
                        fontSize: "0.75rem", fontWeight: 600,
                        textDecoration: "none",
                        display: "flex", alignItems: "center", gap: "0.25rem",
                        transition: "all 0.15s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"; }}
                    >
                      Open <ChevronRight size={11} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6-step reset plan */}
          <div className="glass-card-static" style={{ padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
              🔄 Your 6-Step Reset Plan
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
              Follow this in order. Don't skip steps.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {RESET_STEPS.map((step, i) => (
                <div key={i} style={{
                  display: "flex", gap: "1rem", alignItems: "flex-start",
                  padding: "1rem 1.25rem",
                  background: i % 2 === 0 ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                }}>
                  <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{step.icon}</span>
                  <div>
                    <p style={{ fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
                      Step {i + 1}: {step.title}
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency resources */}
          <div className="glass-card-static" style={{ padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "1.25rem" }}>
              🆘 If You're Really Struggling
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "0.875rem",
            }}>
              {[
                { icon: "🧘", title: "Headspace",      desc: "10 minutes of guided meditation",      url: "https://headspace.com"                  },
                { icon: "📚", title: "Khan Academy",   desc: "Free catch-up on any subject",         url: "https://khanacademy.org"                },
                { icon: "🎯", title: "Forest App",     desc: "Stay focused, grow a tree",            url: "https://forestapp.cc"                   },
                { icon: "💬", title: "7 Cups",         desc: "Free emotional support chat",          url: "https://7cups.com"                      },
              ].map((r) => (
                <a
                  key={r.title}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <div style={{
                    padding: "1rem", borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    transition: "all 0.15s", cursor: "pointer",
                  }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "rgba(124, 58, 237, 0.15)";
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(124, 58, 237, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "rgba(255, 255, 255, 0.03)";
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255, 255, 255, 0.08)";
                    }}
                  >
                    <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "0.5rem" }}>{r.icon}</span>
                    <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
                      {r.title}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{r.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}