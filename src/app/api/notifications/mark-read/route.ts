// src/app/api/notifications/mark-read/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await request.json();

    if (id === "all") {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("user_id", user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}