// src/app/api/notifications/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — fetch notifications for current user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ notifications: data });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST — create a notification
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, body: msgBody, type, link } = body;

    if (!title || !msgBody || !type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: user.id,
        title,
        body:    msgBody,
        type,
        link:    link ?? null,
        is_read: false,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ notification: data });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}