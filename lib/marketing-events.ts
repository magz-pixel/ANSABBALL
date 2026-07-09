import type { UpcomingEvent } from "@/lib/upcoming-events";
import { UPCOMING_EVENTS } from "@/lib/upcoming-events";
import type { SupabaseClient } from "@supabase/supabase-js";

type MarketingEventRow = {
  id: string;
  title: string;
  schedule_days: string;
  date_range: string;
  time_range: string;
  venue: string;
  requirement: string;
  registration_kes: string;
  session_fee_kes: string;
  session_fee_note: string | null;
  phones: string[] | null;
  social_label: string;
  poster_path: string | null;
  ends_on: string | null;
  sort_order: number;
};

function rowToEvent(row: MarketingEventRow): UpcomingEvent {
  return {
    id: row.id,
    title: row.title,
    posterSrc: row.poster_path,
    scheduleDays: row.schedule_days,
    dateRange: row.date_range,
    timeRange: row.time_range,
    venue: row.venue,
    requirement: row.requirement,
    registrationKes: row.registration_kes,
    sessionFeeKes: row.session_fee_kes,
    sessionFeeNote: row.session_fee_note ?? undefined,
    phones: row.phones ?? [],
    socialLabel: row.social_label,
  };
}

/** Published events for the public Programs page (DB with static fallback). */
export async function getPublishedMarketingEvents(
  client: SupabaseClient
): Promise<UpcomingEvent[]> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await client
    .from("marketing_events")
    .select(
      "id, title, schedule_days, date_range, time_range, venue, requirement, registration_kes, session_fee_kes, session_fee_note, phones, social_label, poster_path, ends_on, sort_order"
    )
    .eq("is_published", true)
    .or(`ends_on.is.null,ends_on.gte.${today}`)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return UPCOMING_EVENTS;
  }

  return data.map((row) => rowToEvent(row as MarketingEventRow));
}
