"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ScholarshipForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get("name"),
      age: formData.get("age"),
      parentContact: formData.get("parentContact"),
      storyOfNeed: formData.get("storyOfNeed"),
    };
    console.log("Scholarship application:", data);
    // TODO: Submit to Supabase 'applications' table
    await new Promise((r) => setTimeout(r, 500));
    setSubmitted(true);
    setLoading(false);
    form.reset();
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="font-medium text-green-800">
          Thank you! Your application has been received. We will contact you
          soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm font-medium text-black/80"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-[#0066CC] focus:outline-none focus:ring-1 focus:ring-[#0066CC]"
          placeholder="Full name"
        />
      </div>
      <div>
        <label
          htmlFor="age"
          className="mb-1 block text-sm font-medium text-black/80"
        >
          Age
        </label>
        <input
          id="age"
          name="age"
          type="number"
          min={5}
          max={17}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-[#0066CC] focus:outline-none focus:ring-1 focus:ring-[#0066CC]"
          placeholder="5–17"
        />
      </div>
      <div>
        <label
          htmlFor="parentContact"
          className="mb-1 block text-sm font-medium text-black/80"
        >
          Parent / Guardian Contact
        </label>
        <input
          id="parentContact"
          name="parentContact"
          type="tel"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-[#0066CC] focus:outline-none focus:ring-1 focus:ring-[#0066CC]"
          placeholder="Phone number"
        />
      </div>
      <div>
        <label
          htmlFor="storyOfNeed"
          className="mb-1 block text-sm font-medium text-black/80"
        >
          Story of Need
        </label>
        <textarea
          id="storyOfNeed"
          name="storyOfNeed"
          rows={4}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-[#0066CC] focus:outline-none focus:ring-1 focus:ring-[#0066CC]"
          placeholder="Tell us about your situation and why you need scholarship support..."
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full bg-[#0066CC] text-white hover:bg-blue-700",
          loading && "opacity-70"
        )}
      >
        {loading ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
}
