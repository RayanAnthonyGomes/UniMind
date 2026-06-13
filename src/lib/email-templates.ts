// src/lib/email-templates.ts

const BASE_STYLE = `
  font-family: Inter, system-ui, sans-serif;
  background: #0f0e17;
  margin: 0;
  padding: 0;
`;

const CARD_STYLE = `
  background: #1a1928;
  border-radius: 24px;
  padding: 40px;
  border: 1px solid rgba(99,102,241,0.2);
  box-shadow: 0 8px 40px rgba(0,0,0,0.4);
`;

function logo() {
  return `
    <div style="text-align:center; margin-bottom:32px;">
      <div style="display:inline-flex; align-items:center; gap:10px;">
        <div style="width:40px;height:40px;border-radius:12px;
          background:linear-gradient(135deg,#6366f1,#4f46e5);
          display:inline-flex;align-items:center;justify-content:center;
          box-shadow:0 4px 16px rgba(99,102,241,0.4);">
          <span style="color:white;font-weight:800;font-size:18px;">U</span>
        </div>
        <span style="font-weight:800;font-size:22px;color:#ffffff;letter-spacing:-0.5px;">
          Uni<span style="color:#818cf8;">Mind</span>
        </span>
      </div>
    </div>
  `;
}

function footer() {
  return `
    <p style="text-align:center;color:#374151;font-size:12px;margin-top:28px;line-height:1.8;">
      © ${new Date().getFullYear()} UniMind · Free forever for students<br/>
      <span style="font-size:11px;">You're receiving this because you have an account with UniMind.</span>
    </p>
  `;
}

// ── Deadline reminder ──────────────────────────────────────────────────
export function deadlineReminderTemplate({
  firstName,
  tasks,
}: {
  firstName: string;
  tasks: {
    title:    string;
    type:     string;
    due_date: string;
    priority: string;
    course?:  string;
  }[];
}) {
  const TYPE_LABELS: Record<string, string> = {
    homework:     "Homework",
    assignment:   "Assignment",
    lab_report:   "Lab Report",
    presentation: "Presentation",
    quiz:         "Quiz",
    other:        "Task",
  };

  const PRIORITY_COLORS: Record<string, string> = {
    high:   "#ef4444",
    medium: "#f59e0b",
    low:    "#22c55e",
  };

  const taskRows = tasks.map((t) => {
    const due    = new Date(t.due_date);
    const now    = new Date();
    const diff   = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const dueStr = diff === 0 ? "Due TODAY" :
                   diff === 1 ? "Due Tomorrow" :
                   diff < 0   ? `${Math.abs(diff)} days overdue` :
                   `Due in ${diff} days`;
    const color  = diff <= 0 ? "#ef4444" : diff <= 1 ? "#f59e0b" : "#9ca3af";

    return `
      <div style="padding:14px 16px; border-radius:12px;
        background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <p style="font-size:14px;font-weight:600;color:#f3f4f6;margin:0 0 4px;">
              ${t.title}
            </p>
            <p style="font-size:12px;color:#6b7280;margin:0;">
              ${TYPE_LABELS[t.type] ?? "Task"}
              ${t.course ? ` · ${t.course}` : ""}
            </p>
          </div>
          <div style="text-align:right;flex-shrink:0;margin-left:12px;">
            <p style="font-size:12px;font-weight:700;color:${color};margin:0 0 4px;">
              ${dueStr}
            </p>
            <span style="font-size:10px;font-weight:700;
              padding:2px 7px; border-radius:4px;
              background:${PRIORITY_COLORS[t.priority] ?? "#ccc"}20;
              color:${PRIORITY_COLORS[t.priority] ?? "#ccc"};">
              ${t.priority?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
    <body style="${BASE_STYLE}">
      <div style="max-width:560px;margin:48px auto;padding:0 20px;">
        ${logo()}
        <div style="${CARD_STYLE}">
          <h1 style="font-size:22px;font-weight:800;color:#ffffff;margin:0 0 10px;letter-spacing:-0.5px;">
            ⏰ Heads up, ${firstName}!
          </h1>
          <p style="font-size:14px;color:#9ca3af;margin:0 0 28px;line-height:1.7;">
            You have <strong style="color:#f3f4f6;">${tasks.length} task${tasks.length > 1 ? "s" : ""}</strong>
            coming up soon. Here's a quick look so nothing slips through the cracks.
          </p>

          ${taskRows}

          <div style="margin-top:24px;padding:18px;border-radius:14px;
            background:linear-gradient(135deg,rgba(99,102,241,0.12),rgba(34,197,94,0.06));
            border:1px solid rgba(99,102,241,0.25);">
            <p style="font-size:13px;color:#a5b4fc;font-weight:700;margin:0 0 6px;">
              💡 Quick tip
            </p>
            <p style="font-size:13px;color:#9ca3af;margin:0;line-height:1.6;">
              Start with your highest-priority task for just 10 minutes.
              You'll almost always keep going once you begin.
            </p>
          </div>
        </div>
        ${footer()}
      </div>
    </body>
    </html>
  `;
}

// ── Daily digest ───────────────────────────────────────────────────────
export function dailyDigestTemplate({
  firstName,
  greeting,
  cgpa,
  coursesCount,
  pendingTasks,
  overdueTasks,
  upcomingTasks,
  motivationalLine,
}: {
  firstName:       string;
  greeting:        string;
  cgpa:            string;
  coursesCount:    number;
  pendingTasks:    number;
  overdueTasks:    number;
  upcomingTasks:   { title: string; due_date: string; type: string }[];
  motivationalLine: string;
}) {
  const taskRows = upcomingTasks.slice(0, 5).map((t) => {
    const due = new Date(t.due_date);
    return `
      <tr>
        <td style="padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.06);">
          <span style="font-size:13px;font-weight:600;color:#f3f4f6;">${t.title}</span><br/>
          <span style="font-size:11px;color:#6b7280;text-transform:capitalize;">${t.type}</span>
        </td>
        <td style="padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.06);
          text-align:right; font-size:12px; color:#9ca3af;">
          ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </td>
      </tr>
    `;
  }).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
    <body style="${BASE_STYLE}">
      <div style="max-width:560px;margin:48px auto;padding:0 20px;">
        ${logo()}
        <div style="${CARD_STYLE}">
          <h1 style="font-size:22px;font-weight:800;color:#ffffff;margin:0 0 6px;letter-spacing:-0.5px;">
            ${greeting}
          </h1>
          <p style="font-size:14px;color:#6b7280;margin:0 0 32px;">
            Here's your daily UniMind snapshot.
          </p>

          <!-- Stats row -->
          <div style="display:flex;gap:10px;margin-bottom:32px;">
            ${[
              { label: "CGPA",    value: cgpa,                 color: "#34d399" },
              { label: "Courses", value: String(coursesCount), color: "#818cf8" },
              { label: "Pending", value: String(pendingTasks), color: "#fbbf24" },
              { label: "Overdue", value: String(overdueTasks), color: "#f87171" },
            ].map((s) => `
              <div style="flex:1;text-align:center;padding:16px 8px;
                border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);">
                <p style="font-size:22px;font-weight:800;color:${s.color};margin:0 0 4px;">
                  ${s.value}
                </p>
                <p style="font-size:11px;color:#6b7280;margin:0;text-transform:uppercase;letter-spacing:0.05em;">${s.label}</p>
              </div>
            `).join("")}
          </div>

          <!-- Upcoming tasks -->
          ${upcomingTasks.length > 0 ? `
            <h3 style="font-size:13px;font-weight:700;color:#4b5563;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.08em;">
              📋 Upcoming deadlines
            </h3>
            <table style="width:100%;border-collapse:collapse;">
              ${taskRows}
            </table>
          ` : `
            <p style="font-size:14px;color:#6b7280;font-style:italic;text-align:center;padding:20px 0;">
              No upcoming deadlines — enjoy the breathing room! 🎉
            </p>
          `}

          <!-- Motivational line -->
          <div style="margin-top:28px;padding:20px;border-radius:14px;
            background:linear-gradient(135deg,rgba(99,102,241,0.12),rgba(251,191,36,0.06));
            border:1px solid rgba(99,102,241,0.2);text-align:center;">
            <p style="font-size:14px;color:#a5b4fc;font-style:italic;
              font-weight:500;margin:0;line-height:1.7;">
              "${motivationalLine}"
            </p>
          </div>
        </div>
        ${footer()}
      </div>
    </body>
    </html>
  `;
}