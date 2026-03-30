import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddChildForm } from "@/components/dashboard/add-child-form";

export default async function AddChildPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#001F3F]">Add child</h1>
        <p className="mt-1 text-black/70">
          Add a child profile to your parent account.
        </p>
      </div>
      <AddChildForm />
    </div>
  );
}

