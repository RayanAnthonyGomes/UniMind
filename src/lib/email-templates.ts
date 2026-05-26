// src/lib/email-templates.ts

const BASE_STYLE = `
  font-family: Inter, system-ui, sans-serif;
  background: #faf9f7;
  margin: 0;
  padding: 0;
`;

const CARD_STYLE = `
  background: white;
  border-radius: 20px;
  padding: 36px;
  border: 1px solid #ede9e3;
  box-shadow: 0 4px 20px rgba(99,102,241,0.08);
`;

function logo() {
  return `
    <div style="text-align:center; margin-bottom:28px;">
      <div style="display:inline-flex; align-items:center; gap:8px;">
        <div style="width:36px;height:36px;border-radius:10px;
          background:linear-gradient(135deg,#6366f1,#4f46e5);
          display:inline-flex;align-items:center;justify-content:center;">
          <span style="color:white;font-weight:700;font-size:16px;">U</span>
        </div>
        <span style="font-weight:700;font-size:20px;color:#1c1917;">
          UNI<span style="color:#4f46e5;">MIND</span>
        </span>
      </div>
    </div>
  `;
}

function footer() {
  return `
    <p style="text-align:center;color:#a8a29e;font-size:12px;margin-top:28px;">
      © ${new Date().getFullYear()} UNIMIND · Free forever for students<br/>
      <span style="font-size:11px;">You're receiving this because you have an account with UNIMIND.</span>
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
    const color  = diff <= 0 ? "#ef4444" : diff <= 1 ? "#f59e0b" : "#78716c";

    return `
      <div style="padding:14px 16px; border-radius:12px;
        background:#faf9f7; border:1px solid #ede9e3; margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <p style="font-size:14px;font-weight:600;color:#1c1917;margin:0 0 4px;">
              ${t.title}
            </p>
            <p style="font-size:12px;color:#78716c;margin:0;">
              ${TYPE_LABELS[t.type] ?? "Task"}
              ${t.course ? ` · ${t.course}` : ""}
            </p>
          </div>
          <div style="text-align:right;flex-shrink:0;margin-left:12px;">
            <p style="font-size:12px;font-weight:700;color:${color};margin:0 0 2px;">
              ${dueStr}
            </p>
            <span style="font-size:10px;font-weight:700;
              padding:2px 6px; border-radius:4px;
              background:${PRIORITY_COLORS[t.priority] ?? "#ccc"}18;
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
      <div style="max-width:520px;margin:40px auto;padding:0 16px;">
        ${logo()}
        <div style="${CARD_STYLE}">
          <h1 style="font-size:20px;font-weight:700;color:#1c1917;margin:0 0 8px;">
            ⏰ Deadline Reminder, ${firstName}
          </h1>
          <p style="font-size:14px;color:#78716c;margin:0 0 24px;line-height:1.6;">
            You have <strong>${tasks.length} task${tasks.length > 1 ? "s" : ""}</strong>
            coming up that need your attention.
            Don't let them sneak up on you!
          </p>

          ${taskRows}

          <div style="margin-top:24px;padding:16px;border-radius:12px;
            background:linear-gradient(135deg,#eef2ff,#f0fdf4);
            border:1px solid #c7d2fe;">
            <p style="font-size:13px;color:#4338ca;font-weight:600;margin:0 0 4px;">
              💡 Quick tip
            </p>
            <p style="font-size:13px;color:#57534e;margin:0;line-height:1.5;">
              Start with your highest priority task for just 10 minutes.
              You'll almost always keep going past the timer.
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
        <td style="padding:10px 0; border-bottom:1px solid #f5f3ef;">
          <span style="font-size:13px;font-weight:600;color:#1c1917;">${t.title}</span><br/>
          <span style="font-size:11px;color:#a8a29e;">${t.type}</span>
        </td>
        <td style="padding:10px 0; border-bottom:1px solid #f5f3ef;
          text-align:right; font-size:12px; color:#78716c;">
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
      <div style="max-width:520px;margin:40px auto;padding:0 16px;">
        ${logo()}
        <div style="${CARD_STYLE}">
          <h1 style="font-size:20px;font-weight:700;color:#1c1917;margin:0 0 4px;">
            ${greeting}
          </h1>
          <p style="font-size:14px;color:#78716c;margin:0 0 28px;">
            Here's your daily UNIMIND snapshot.
          </p>

          <!-- Stats row -->
          <div style="display:flex;gap:12px;margin-bottom:28px;">
            ${[
              { label: "CGPA",         value: cgpa,                        color: "#22c55e" },
              { label: "Courses",      value: String(coursesCount),        color: "#6366f1" },
              { label: "Pending",      value: String(pendingTasks),        color: "#f59e0b" },
              { label: "Overdue",      value: String(overdueTasks),        color: "#ef4444" },
            ].map((s) => `
              <div style="flex:1;text-align:center;padding:14px 8px;
                border-radius:12px;background:#faf9f7;border:1px solid #ede9e3;">
                <p style="font-size:20px;font-weight:700;color:${s.color};margin:0 0 2px;">
                  ${s.value}
                </p>
                <p style="font-size:11px;color:#a8a29e;margin:0;">${s.label}</p>
              </div>
            `).join("")}
          </div>

          <!-- Upcoming tasks -->
          ${upcomingTasks.length > 0 ? `
            <h3 style="font-size:14px;font-weight:700;color:#1c1917;margin:0 0 12px;">
              📋 Upcoming deadlines
            </h3>
            <table style="width:100%;border-collapse:collapse;">
              ${taskRows}
            </table>
          ` : `
            <p style="font-size:14px;color:#78716c;font-style:italic;">
              No upcoming deadlines — enjoy the breathing room! 🎉
            </p>
          `}

          <!-- Motivational line -->
          <div style="margin-top:24px;padding:16px;border-radius:12px;
            background:linear-gradient(135deg,#eef2ff,#fffbeb);
            border:1px solid #c7d2fe;text-align:center;">
            <p style="font-size:14px;color:#4338ca;font-style:italic;
              font-weight:500;margin:0;line-height:1.6;">
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