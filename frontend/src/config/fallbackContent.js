// Used only when /content (PostgREST) can't be reached — e.g. first run
// before docker compose is up, or a static preview. Keeps the page from
// rendering empty. Shape matches the *_public views in db/schema.sql.

export const FALLBACK_QUICK_LINKS = [
  { id: 1, label: "MYB Internal Site", href: "http://192.0.15.99/#/d/home", icon: "doc", img_url: "/assets/internal_site_2.webp" },
  { id: 2, label: "H.O. Meeting Room Booking", href: "http://192.0.15.36/mrbs/day.php", icon: "meeting", img_url: "/assets/meetingRoom.webp" },
  { id: 3, label: "IT Support Ticket", href: "http://192.0.15.99:8055/assets/5aa69f40-3e08-490d-8eab-c20f7d4116e5", icon: "ticket", img_url: "/assets/itSupport.webp"  },
  { id: 4, label: "ESS Portal", href: "https://hrms.behbehanimotors.com/Ess", icon: "user", img_url: "/assets/ESSPortal.webp"  },
  { id: 5, label: "ERP Portal", href: "https://myb.oneerpcloud.com/oneerp/", icon: "database", img_url: "/assets/oneERP.webp"  },
  { id: 6, label: "POS System", href: "https://myb-pos.eshopaid.com/mshopaid_myb/", icon: "shopping-cart", img_url: "/assets/POS.webp"  },
  { id: 7, label: "Payment link", href: "https://Luxury.moradbehbehani.com", icon: "card", img_url: "/assets/paymentLink.webp"  },
  { id: 8, label: "Telephone List", href: "http://192.0.15.99:8055/assets/a927b897-884a-4e3a-b817-bdb37d9158a1", icon: "phone", img_url: "/assets/StaffDir.webp"  },
  { id: 9, label: "Customer Wishlist", href: "http://192.0.15.19/lead-enquiries", icon: "star", img_url: "/assets/wishlist.webp"  },
  { id: 10, label: "Workshop Portal", href: "http://192.0.15.19/workshop/", icon: "shield", img_url: "/assets/workshopTracker.webp"  },
];

export const FALLBACK_FEATURE_TILES = [
  { id: 1, title: "Employee Handbook", href: "http://192.0.15.99:8055/assets/c629a334-8179-4444-a416-de32bac11fcb", icon: "book", img_url: "/assets/handbook.webp"  },
  { id: 2, title: "ESS Portal Guide", href: "http://192.0.15.99:8055/assets/a498407b-c2f4-4ed9-bccd-34648af26a21", icon: "user", img_url: "/assets/ESS.webp" },
  { id: 3, title: "Money Laundering Prevention & Control", href: "http://192.0.15.99:8055/assets/195a8c26-bef3-405b-9afc-4ac9c22390be", icon: "shield", img_url: "/assets/money_laundering.webp" },
  { id: 4, title: "Document Management System", href: "http://192.0.15.99:8055/assets/227edf31-a6f5-4606-a7c5-5dda9844a6c7", icon: "folder", img_url: "/assets/document_management.webp" },
  { id: 5, title: "Organizational Flowchart", href: "http://192.0.15.99:8055/assets/6b335a62-84e1-4f28-a89d-858afe00e9eb", icon: "chart", img_url: "/assets/organizational_flow.webp" },
  { id: 6, title: "Pay by Link", href: "http://192.0.15.99:8055/assets/d513c5cb-fde7-4aca-9ee2-b89ed5ad9d40", icon: "card", img_url: "/assets/pay_by_link.webp" },
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
    title: "April Newsletter",
    summary: "Leave requests and payslips now available on mobile.",
    url: "/news/ess-update",
  },
  {
    id: 2,
    title: "June Newsletter",
    summary: "A look back at nine decades of the group's history.",
    url: "/news/90-years",
  },
];

export const FALLBACK_WHATS_NEW = [
  {
    id: 1,
    title: "New intranet, same shortcuts",
    body: "We've refreshed the homepage. All your usual links are still here — just look nicer and load faster.",
    url: "",
    published_at: new Date().toISOString(),
  },
];

export const FALLBACK_GALLERY = [
  { id: 1, caption: "Head Office, Kuwait City", img_url: "" },
  { id: 2, caption: "Retail division showroom", img_url: "" },
  { id: 3, caption: "Team townhall, 2025", img_url: "" },
];
