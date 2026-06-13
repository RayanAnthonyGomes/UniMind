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
      from:    "UniMind <noreply@mail.ryangomes.space>",
      to:      email,
      subject: "Welcome to UniMind — Verify your email 🎓",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style="margin:0;padding:0;background:#0f0e17;font-family:Inter,system-ui,sans-serif;">
          <div style="max-width:560px;margin:48px auto;padding:0 20px;">

            <!-- Logo -->
            <div style="text-align:center;margin-bottom:36px;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#4f46e5);display:inline-flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(99,102,241,0.4);">
                  <span style="color:white;font-weight:800;font-size:18px;">U</span>
                </div>
                <span style="font-weight:800;font-size:22px;color:#ffffff;letter-spacing:-0.5px;">Uni<span style="color:#818cf8;">Mind</span></span>
              </div>
            </div>

            <!-- Card -->
            <div style="background:#1a1928;border-radius:24px;padding:44px 40px;border:1px solid rgba(99,102,241,0.2);box-shadow:0 8px 40px rgba(0,0,0,0.4);">

              <!-- Greeting -->
              <h1 style="font-size:26px;font-weight:800;color:#ffffff;margin:0 0 12px;letter-spacing:-0.5px;">
                Hey ${firstName}! 👋
              </h1>
              <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 28px;">
                Your UniMind account has been created. Just one more step — verify your email address to unlock your full academic toolkit.
              </p>

              <!-- CTA banner -->
              <div style="background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(79,70,229,0.08));border:1px solid rgba(99,102,241,0.3);border-radius:16px;padding:20px 24px;margin-bottom:28px;text-align:center;">
                <p style="font-size:14px;color:#a5b4fc;margin:0 0 6px;font-weight:600;">📬 Check your inbox</p>
                <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.6;">
                  We've sent a separate verification link to <strong style="color:#c4b5fd;">${email}</strong>.<br/>
                  Click it to activate your account. Check your spam folder if it's not there.
                </p>
              </div>

              <!-- Feature previews -->
              <p style="font-size:13px;font-weight:700;color:#4b5563;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.08em;">
                What you're unlocking
              </p>
              <div style="display:grid;gap:10px;">
                ${[
                  ["📚", "Track all your courses & materials in one place"],
                  ["🤖", "AI assistant with full academic context"],
                  ["📊", "Automatic CGPA calculation & tracking"],
                  ["✅", "Smart task manager with AI deadline suggestions"],
                ].map(([icon, text]) => `
                  <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.06);">
                    <span style="font-size:18px;flex-shrink:0;">${icon}</span>
                    <span style="font-size:13px;color:#9ca3af;line-height:1.4;">${text}</span>
                  </div>
                `).join("")}
              </div>

              <p style="color:#4b5563;font-size:12px;margin:28px 0 0;text-align:center;line-height:1.6;">
                Didn't create a UniMind account? You can safely ignore this email.
              </p>
            </div>

            <!-- Footer -->
            <p style="text-align:center;color:#374151;font-size:12px;margin-top:28px;line-height:1.8;">
              © ${new Date().getFullYear()} UniMind · Built for students, free forever<br/>
              <span style="font-size:11px;">You're receiving this because someone signed up with this email.</span>
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
        title:   "Welcome to UniMind! 🎉",
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