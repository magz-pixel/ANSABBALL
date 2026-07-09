"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PendingUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

interface PlayerProfile {
  name: string;
  position: string | null;
  school: string | null;
}

interface PendingChild {
  id: string;
  name: string;
  age: number | null;
  school: string | null;
}

export function ApprovalsClient({
  initialUsers,
  profileMap = {},
  childrenByParent = {},
}: {
  initialUsers: PendingUser[];
  profileMap?: Record<string, PlayerProfile>;
  childrenByParent?: Record<string, PendingChild[]>;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

  async function handleApprove(userId: string, role: string) {
    setLoading(userId);
    await supabase
      .from("users")
      .update({ approval_status: "approved" })
      .eq("id", userId);

    if (role === "player") {
      await supabase
        .from("players")
        .update({ status: "active" })
        .eq("player_user_id", userId);
    }

    if (role === "parent") {
      await supabase
        .from("players")
        .update({ status: "active" })
        .eq("parent_id", userId)
        .eq("status", "pending");
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setLoading(null);
  }

  async function handleReject(userId: string) {
    setLoading(userId);
    await supabase
      .from("users")
      .update({ approval_status: "rejected" })
      .eq("id", userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setLoading(null);
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-black/70">No pending approvals.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((u) => {
        const children = u.role === "parent" ? childrenByParent[u.id] ?? [] : [];

        return (
          <Card key={u.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">{u.full_name || u.email}</CardTitle>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-black/70">
                {u.role}
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-black/70">{u.email}</p>
              {u.role === "player" && profileMap[u.id] && (
                <p className="mt-2 text-sm text-[#f97316]">
                  Profile: {profileMap[u.id].name}
                  {profileMap[u.id].position && ` • ${profileMap[u.id].position}`}
                  {profileMap[u.id].school && ` • ${profileMap[u.id].school}`}
                </p>
              )}
              {children.length > 0 && (
                <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#001F3F]">
                    Children awaiting approval
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-black/80">
                    {children.map((child) => (
                      <li key={child.id}>
                        {child.name}
                        {child.age != null && ` • age ${child.age}`}
                        {child.school && ` • ${child.school}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="mt-1 text-xs text-black/50">
                Joined {new Date(u.created_at).toLocaleDateString()}
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  className="bg-[#f97316] hover:bg-orange-600"
                  onClick={() => handleApprove(u.id, u.role)}
                  disabled={loading === u.id}
                >
                  {loading === u.id ? "..." : "Approve"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(u.id)}
                  disabled={loading === u.id}
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
