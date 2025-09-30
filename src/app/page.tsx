import { redirect } from "next/navigation";
import { createClientServer } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClientServer(); // 👈 precisa do await

  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/dashboard" : "/login");
}
