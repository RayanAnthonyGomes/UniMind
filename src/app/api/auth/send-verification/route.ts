// src/app/api/auth/send-verification/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, firstName } = await request.json();

    if (!email || !firstName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from:    "UNIMIND <noreply@mail.ryangomes.space>",
      to: process.env.NODE_ENV === "production" ? email : process.env.RESEND_TEST_EMAIL!,
      subject: "Welcome to UNIMIND — Verify your email 🎓",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style="margin:0;padding:0;background:#faf9f7;font-family:Inter,system-ui,sans-serif;">
          <div style="max-width:520px;margin:40px auto;padding:0 16px;">

            <!-- Logo -->
            <div style="text-align:center;margin-bottom:32px;">
              <div style="display:inline-flex;align-items:center;gap:8px;">
                <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#4f46e5);display:inline-flex;align-items:center;justify-content:center;">
                  <span style="color:white;font-weight:700;font-size:16px;">U</span>
                </div>
                <span style="font-weight:700;font-size:20px;color:#1c1917;">UNI<span style="color:#4f46e5;">MIND</span></span>
              </div>
            </div>

            <!-- Card -->
            <div style="background:white;border-radius:20px;padding:40px;border:1px solid #ede9e3;box-shadow:0 4px 20px rgba(99,102,241,0.08);">
              <h1 style="font-size:22px;font-weight:700;color:#1c1917;margin:0 0 8px;">
                Welcome, ${firstName}! 👋
              </h1>
              <p style="color:#78716c;font-size:15px;line-height:1.6;margin:0 0 24px;">
                You're almost ready to start organizing your university life with UNIMIND.
                Just verify your email address and you're good to go.
              </p>

              <p style="color:#57534e;font-size:14px;margin:0 0 24px;line-height:1.6;">
                Check your inbox for the verification email from Supabase.
                If you don't see it within a few minutes, check your spam folder.
              </p>

              <!-- Features preview -->
              <div style="background:#f5f3ef;border-radius:12px;padding:20px;margin-bottom:24px;">
                <p style="font-size:13px;font-weight:600;color:#44403c;margin:0 0 12px;">
                  What's waiting for you:
                </p>
                ${[
                  ["📚", "Track all your courses and materials"],
                  ["🤖", "AI assistant that never forgets your context"],
                  ["📊", "Automatic CGPA tracking"],
                  ["✅", "Smart task manager with AI suggestions"],
                ].map(([icon, text]) => `
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                    <span style="font-size:16px;">${icon}</span>
                    <span style="font-size:13px;color:#57534e;">${text}</span>
                  </div>
                `).join("")}
              </div>

              <p style="color:#a8a29e;font-size:12px;margin:0;text-align:center;">
                If you didn't create a UNIMIND account, you can safely ignore this email.
              </p>
            </div>

            <p style="text-align:center;color:#a8a29e;font-size:12px;margin-top:24px;">
              © ${new Date().getFullYear()} UNIMIND · Built for students, free forever
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
    // Inside send-verification route — after sending email
// Seed a welcome notification via Supabase service role
const { createClient: createServiceClient } = await import("@supabase/supabase-js");
const adminSupabase = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Find user by email
const { data: { users } } = await adminSupabase.auth.admin.listUsers();
const newUser = users.find((u) => u.email === email);

if (newUser) {
  await adminSupabase.from("notifications").insert({
    user_id: newUser.id,
    title:   "Welcome to UNIMIND! 🎉",
    body:    `Hey ${firstName}! Your account is ready. Start by adding your courses for this semester.`,
    type:    "system",
    link:    "/courses",
  });
}
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Send verification error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}