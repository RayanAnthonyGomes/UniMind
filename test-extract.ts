import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://chylxkncnjmtebooutpo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoeWx4a25jbmptdGVib291dHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1OTA0ODcsImV4cCI6MjA5NTE2NjQ4N30.4dT1TvauSTyc9pm853_5b5qxaCQwrZmPfg8F5uf-hFA"
);

async function main() {
  const { data, error } = await supabase.from("documents").select("name, type, url").limit(50);
  if (error) {
    console.error("DB error:", error);
    return;
  }
  data.forEach(d => console.log(d.name, d.type));
}
main().catch(console.error);
