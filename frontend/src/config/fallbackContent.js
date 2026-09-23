// Used only when /content (PostgREST) can't be reached — e.g. first run
// before docker compose is up, or a static preview. Keeps the page from
// rendering empty. Shape matches the *_public views in db/schema.sql.

export const FALLBACK_QUICK_LINKS = [
  { id: 1, label: "IT Support Ticket", href: "/it-support", icon: "ticket" },
  { id: 2, label: "ESS Portal", href: "/ess", icon: "user" },
  { id: 3, label: "Telephone List", href: "/directory", icon: "phone" },
  { id: 4, label: "Employee Handbook", href: "/handbook", icon: "book" },
];

export const FALLBACK_FEATURE_TILES = [
  { id: 1, title: "MYB Internal Site", href: "/internal", icon: "doc" },
  { id: 2, title: "H.O. Meeting Room Booking", href: "/room-booking", icon: "meeting" },
  { id: 3, title: "Money Laundering Prevention & Control", href: "/aml", icon: "shield" },
  { id: 4, title: "Document Management System", href: "/dms", icon: "folder" },
  { id: 5, title: "Organizational Flowchart", href: "/org-chart", icon: "chart" },
  { id: 6, title: "Pay by Link", href: "/pay", icon: "card" },
];

export const FALLBACK_EVENTS = [
  {
    id: 1,
    title: "Annual Staff Townhall",
    description: "Company-wide update from senior management.",
    starts_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    location: "HQ Auditorium",
  },
  {
    id: 2,
    title: "Ramadan Working Hours Begin",
    description: "Adjusted hours across all divisions.",
    starts_at: new Date(Date.now() + 20 * 86400000).toISOString(),
    location: "All Branches",
  },
];

export const FALLBACK_NEWS = [
  {
    id: 1,
    title: "New ESS Portal Features Live",
    summary: "Leave requests and payslips now available on mobile.",
    url: "/news/ess-update",
  },
  {
    id: 2,
    title: "MYB Marks 90 Years",
    summary: "A look back at nine decades of the group's history.",
    url: "/news/90-years",
  },
];

export const FALLBACK_GALLERY = [
  { id: 1, caption: "Head Office, Kuwait City", image_url: "" },
  { id: 2, caption: "Retail division showroom", image_url: "" },
  { id: 3, caption: "Team townhall, 2025", image_url: "" },
];
