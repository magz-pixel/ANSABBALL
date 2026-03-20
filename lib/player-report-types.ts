export interface PlayerReportPayload {
  player: {
    name: string;
    age: number | null;
    gender: string | null;
    school: string | null;
    position: string | null;
    status: string | null;
    payment_status: string | null;
    join_date: string | null;
    groupName: string | null;
  };
  generatedAtLabel: string;
  skills: { skill: string; value: number }[];
  progressLogs: {
    date: string;
    skill: string;
    value: number;
    coach_notes: string | null;
  }[];
  attendance: { session_date: string; present: boolean }[];
}
