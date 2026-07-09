"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emptyForm = {
  title: "",
  schedule_days: "",
  date_range: "",
  time_range: "",
  venue: "",
  requirement: "",
  registration_kes: "",
  session_fee_kes: "",
  session_fee_note: "",
  phones: "",
  social_label: "Ansa Basketball (Facebook & Instagram)",
  ends_on: "",
  is_published: true,
  sort_order: "0",
};

export function ManageEventButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [form, setForm] = useState(emptyForm);
  const router = useRouter();
  const supabase = createClient();

  async function uploadPoster(): Promise<string | null> {
    if (!posterFile) return null;
    const ext = posterFile.name.split(".").pop()?.toLowerCase() ?? "png";
    const path = `${Date.now()}-event.${ext}`;
    const { error } = await supabase.storage.from("event-posters").upload(path, posterFile, {
      cacheControl: "3600",
      upsert: true,
      contentType: posterFile.type || "image/png",
    });
    if (error) {
      alert(error.message);
      return null;
    }
    const { data } = supabase.storage.from("event-posters").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    let poster_path: string | null = null;
    if (posterFile) {
      poster_path = await uploadPoster();
      if (!poster_path) {
        setLoading(false);
        return;
      }
    }

    const phones = form.phones
      .split(/[,;]/)
      .map((p) => p.trim())
      .filter(Boolean);

    const { error } = await supabase.from("marketing_events").insert({
      title: form.title.trim(),
      schedule_days: form.schedule_days.trim(),
      date_range: form.date_range.trim(),
      time_range: form.time_range.trim(),
      venue: form.venue.trim(),
      requirement: form.requirement.trim(),
      registration_kes: form.registration_kes.trim(),
      session_fee_kes: form.session_fee_kes.trim(),
      session_fee_note: form.session_fee_note.trim() || null,
      phones,
      social_label: form.social_label.trim(),
      poster_path,
      is_published: form.is_published,
      sort_order: parseInt(form.sort_order, 10) || 0,
      ends_on: form.ends_on || null,
    });

    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }

    setForm(emptyForm);
    setPosterFile(null);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button className="bg-[#f97316] hover:bg-orange-600" onClick={() => setOpen(true)}>
        Add event
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow">
      <h3 className="text-lg font-semibold text-[#001F3F]">New upcoming event</h3>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="ev-title">Title *</Label>
          <Input id="ev-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
        </div>
        <div>
          <Label>Schedule days</Label>
          <Input value={form.schedule_days} onChange={(e) => setForm((f) => ({ ...f, schedule_days: e.target.value }))} />
        </div>
        <div>
          <Label>Date range</Label>
          <Input value={form.date_range} onChange={(e) => setForm((f) => ({ ...f, date_range: e.target.value }))} />
        </div>
        <div>
          <Label>Time</Label>
          <Input value={form.time_range} onChange={(e) => setForm((f) => ({ ...f, time_range: e.target.value }))} />
        </div>
        <div>
          <Label>Venue</Label>
          <Input value={form.venue} onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))} />
        </div>
        <div>
          <Label>Requirement</Label>
          <Input value={form.requirement} onChange={(e) => setForm((f) => ({ ...f, requirement: e.target.value }))} />
        </div>
        <div>
          <Label>Registration fee</Label>
          <Input value={form.registration_kes} onChange={(e) => setForm((f) => ({ ...f, registration_kes: e.target.value }))} />
        </div>
        <div>
          <Label>Session fee</Label>
          <Input value={form.session_fee_kes} onChange={(e) => setForm((f) => ({ ...f, session_fee_kes: e.target.value }))} />
        </div>
        <div>
          <Label>Session fee note</Label>
          <Input value={form.session_fee_note} onChange={(e) => setForm((f) => ({ ...f, session_fee_note: e.target.value }))} />
        </div>
        <div>
          <Label>Phones (comma-separated)</Label>
          <Input value={form.phones} onChange={(e) => setForm((f) => ({ ...f, phones: e.target.value }))} />
        </div>
        <div>
          <Label>Ends on (hide after)</Label>
          <Input type="date" value={form.ends_on} onChange={(e) => setForm((f) => ({ ...f, ends_on: e.target.value }))} />
        </div>
        <div className="sm:col-span-2">
          <Label>Poster image</Label>
          <Input type="file" accept="image/*" onChange={(e) => setPosterFile(e.target.files?.[0] ?? null)} />
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id="ev-published"
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
          />
          <Label htmlFor="ev-published">Published on Programs page</Label>
        </div>
        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" disabled={loading} className="bg-[#f97316] hover:bg-orange-600">
            {loading ? "Saving…" : "Save event"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
