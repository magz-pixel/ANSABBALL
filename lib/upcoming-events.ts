/** Public marketing: upcoming camps / trainings (Programs page). */

export type UpcomingEvent = {
  id: string;
  title: string;
  /** Optional poster in /public/posters/ */
  posterSrc: string | null;
  scheduleDays: string;
  dateRange: string;
  timeRange: string;
  venue: string;
  requirement: string;
  registrationKes: string;
  sessionFeeKes: string;
  sessionFeeNote?: string;
  phones: string[];
  socialLabel: string;
};

export const UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id: "april-basketball-training-2026",
    title: "April Basketball Training",
    posterSrc: "/posters/april-basketball-training.png",
    scheduleDays: "Monday – Saturday",
    dateRange: "6 April – 25 April",
    timeRange: "10:30 AM – 12:30 PM",
    venue: "Marist College, Karen",
    requirement: "Own basketball",
    registrationKes: "KES 2,500",
    sessionFeeKes: "KES 10,500",
    sessionFeeNote: "for 3 weeks",
    phones: ["0718082452", "0740406721"],
    socialLabel: "Ansa Basketball (Facebook & Instagram)",
  },
];
