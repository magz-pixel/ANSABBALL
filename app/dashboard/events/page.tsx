import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ManageEventButton } from "@/components/dashboard/manage-event-button";
import { DeleteEventButton } from "@/components/dashboard/delete-event-button";

export default async function EventsAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = user
    ? (await supabase.from("users").select("role").eq("id", user.id).single()).data
    : null;

  if (!profile) {
    const admin = createAdminClient();
    if (admin && user) {
      profile = (await admin.from("users").select("role").eq("id", user.id).single()).data;
    }
  }

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const client = createAdminClient() ?? supabase;
  const { data: events } = await client
    .from("marketing_events")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#001F3F]">Upcoming events</h1>
          <p className="mt-1 text-black/70">
            Manage trainings and camps shown on the public Programs page.
          </p>
        </div>
        <ManageEventButton />
      </div>

      <div className="space-y-4">
        {events?.map((ev) => (
          <Card key={ev.id}>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{ev.title}</CardTitle>
                <p className="text-sm text-black/60">
                  {ev.date_range} · {ev.venue}
                  {ev.is_published ? " · Published" : " · Draft"}
                </p>
              </div>
              <DeleteEventButton eventId={ev.id} title={ev.title} />
            </CardHeader>
            <CardContent className="text-sm text-black/80">
              <p>{ev.schedule_days} · {ev.time_range}</p>
              <p className="mt-1">
                {ev.registration_kes} registration · {ev.session_fee_kes}
                {ev.session_fee_note ? ` (${ev.session_fee_note})` : ""}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!events || events.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center text-black/60">
            No events yet. Add one to show on the Programs page.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
