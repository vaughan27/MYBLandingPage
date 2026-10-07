-- ---------- CONTENT TABLES ----------

CREATE TABLE quick_links (
    id          serial PRIMARY KEY,
    label       text NOT NULL,
    href        text NOT NULL,
    img_url     text,
    icon        text DEFAULT 'link',
    sort_order  int NOT NULL DEFAULT 0,
    enabled     boolean NOT NULL DEFAULT true
);

CREATE TABLE feature_tiles (
    id          serial PRIMARY KEY,
    title       text NOT NULL,
    href        text NOT NULL,
    img_url     text,
    icon        text DEFAULT 'doc',
    sort_order  int NOT NULL DEFAULT 0,
    enabled     boolean NOT NULL DEFAULT true
);

CREATE TABLE gallery_images (
    id          serial PRIMARY KEY,
    caption     text,
    img_url     text NOT NULL,
    sort_order  int NOT NULL DEFAULT 0,
    enabled     boolean NOT NULL DEFAULT true
);

CREATE TABLE events (
    id          serial PRIMARY KEY,
    title       text NOT NULL,
    description text,
    starts_at   timestamptz NOT NULL,
    location    text,
    enabled     boolean NOT NULL DEFAULT true
);

CREATE TABLE news_items (
    id           serial PRIMARY KEY,
    title        text NOT NULL,
    summary      text,
    url          text,
    published_at timestamptz NOT NULL DEFAULT now(),
    enabled      boolean NOT NULL DEFAULT true
);

CREATE TABLE whats_new (
    id          serial PRIMARY KEY,
    title       text NOT NULL,
    body        text NOT NULL,
    url         text,
    active      boolean NOT NULL DEFAULT true,
    published_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE search_items (
    id          serial PRIMARY KEY,
    name        text NOT NULL,
    href        text NOT NULL,
    category    text,
    keywords    text,
    active      boolean NOT NULL DEFAULT true
);

CREATE TABLE newsletter_subscribers (
    id          serial PRIMARY KEY,
    email       text NOT NULL UNIQUE,
    subscribed_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- ANALYTICS TABLES ----------

CREATE TABLE visitors (
    visitor_id   uuid PRIMARY KEY,
    first_seen   timestamptz NOT NULL DEFAULT now(),
    last_seen    timestamptz NOT NULL DEFAULT now(),
    visit_count  int NOT NULL DEFAULT 1
);

-- ---------- SEED DATA ----------

INSERT INTO quick_links
    (label, href, icon, img_url, sort_order)
VALUES
    ('MYB Internal Site',
     'http://192.0.15.99/#/d/home',
     'doc',
     '/assets/internal_site_2.webp',
     1),

    ('H.O. Meeting Room Booking',
     'http://192.0.15.36/mrbs/day.php',
     'meeting',
     '/assets/meetingRoom.webp',
     2),

    ('IT Support Ticket',
     'http://192.0.15.99:8055/assets/5aa69f40-3e08-490d-8eab-c20f7d4116e5',
     'ticket',
     '/assets/itSupport.webp',
     3),

    ('ESS Portal',
     'https://hrms.behbehanimotors.com/Ess',
     'user',
     '/assets/ESSPortal.webp',
     4),

    ('ERP Portal',
     'https://myb.oneerpcloud.com/oneerp/',
     'database',
     '/assets/oneERP.webp',
     5),

    ('POS System',
     'https://myb-pos.eshopaid.com/mshopaid_myb/',
     'shopping-cart',
     '/assets/POS.webp',
     6),

    ('Payment link',
     'https://Luxury.moradbehbehani.com',
     'card',
     '/assets/paymentLink.webp',
     7),

    ('Telephone List',
     'http://192.0.15.99:8055/assets/a927b897-884a-4e3a-b817-bdb37d9158a1',
     'phone',
     '/assets/StaffDir.webp',
     8),

    ('Customer Wishlist',
     'http://192.0.15.19/lead-enquiries',
     'star',
     '/assets/wishlist.webp',
     9),

    ('Workshop Portal',
     'http://192.0.15.19/workshop/',
     'shield',
     '/assets/workshopTracker.webp',
     10);


INSERT INTO feature_tiles
    (title, href, icon, img_url, sort_order)
VALUES
    ('Employee Handbook',
     'http://192.0.15.99:8055/assets/c629a334-8179-4444-a416-de32bac11fcb',
     'book',
     '/assets/handbook.webp',
     1),

    ('ESS Portal Guide',
     'http://192.0.15.99:8055/assets/a498407b-c2f4-4ed9-bccd-34648af26a21',
     'user',
     '/assets/ESS.webp',
     2),

    ('Money Laundering Prevention & Control',
     'http://192.0.15.99:8055/assets/195a8c26-bef3-405b-9afc-4ac9c22390be',
     'shield',
     '/assets/money_laundering.webp',
     3),

    ('Document Management System',
     'http://192.0.15.99:8055/assets/227edf31-a6f5-4606-a7c5-5dda9844a6c7',
     'folder',
     '/assets/document_management.webp',
     4),

    ('Organizational Flowchart',
     'http://192.0.15.99:8055/assets/6b335a62-84e1-4f28-a89d-858afe00e9eb',
     'chart',
     '/assets/organizational_flow.webp',
     5),

    ('Pay by Link',
     'http://192.0.15.99:8055/assets/d513c5cb-fde7-4aca-9ee2-b89ed5ad9d40',
     'card',
     '/assets/pay_by_link.webp',
     6);


INSERT INTO events
    (title, description, starts_at, location)
VALUES
    ('Annual Staff Townhall',
     'Company-wide update from senior management.',
     now() + interval '7 days',
     'HQ Auditorium'),

    ('Ramadan Working Hours Begin',
     'Adjusted hours across all divisions.',
     now() + interval '20 days',
     'All Branches');


INSERT INTO news_items
    (title, summary, url)
VALUES
    ('April Newsletter',
     'Leave requests and payslips now available on mobile.',
     '/news/ess-update'),

    ('June Newsletter',
     'A look back at nine decades of the group''s history.',
     '/news/90-years');


INSERT INTO whats_new
    (title, body, url)
VALUES
    ('New intranet, same shortcuts',
     'We''ve refreshed the homepage. All your usual links are still here — just look nicer and load faster.',
     NULL);


INSERT INTO search_items
    (name, href, category, keywords)
VALUES
    -- Quick Links
    ('MYB Internal Site',
     'http://192.0.15.99/#/d/home',
     'system',
     'internal site home myb'),

    ('H.O. Meeting Room Booking',
     'http://192.0.15.36/mrbs/day.php',
     'system',
     'room booking calendar meeting conference room'),

    ('IT Support Ticket',
     'http://192.0.15.99:8055/assets/5aa69f40-3e08-490d-8eab-c20f7d4116e5',
     'system',
     'helpdesk it support issue ticket bug technical support'),

    ('ESS Portal',
     'https://hrms.behbehanimotors.com/Ess',
     'system',
     'leave payslip attendance employee self service ess hr'),

    ('ERP Portal',
     'https://myb.oneerpcloud.com/oneerp/',
     'system',
     'erp oneerp enterprise resource planning system'),

    ('POS System',
     'https://myb-pos.eshopaid.com/mshopaid_myb/',
     'system',
     'pos point of sale sales cashier retail shop'),

    ('Payment Link',
     'https://Luxury.moradbehbehani.com',
     'system',
     'payment payments online payment luxury invoice'),

    ('Telephone List',
     'http://192.0.15.99:8055/assets/a927b897-884a-4e3a-b817-bdb37d9158a1',
     'contact',
     'phone telephone extension directory staff contact'),

    ('Customer Wishlist',
     'http://192.0.15.19/lead-enquiries',
     'system',
     'customer wishlist leads enquiries customer requests'),

    ('Workshop Portal',
     'http://192.0.15.19/workshop/',
     'system',
     'workshop portal vehicle service repair workshop tracker'),

    -- Feature Tiles
    ('Employee Handbook',
     'http://192.0.15.99:8055/assets/c629a334-8179-4444-a416-de32bac11fcb',
     'policy',
     'employee handbook hr rules policy conduct procedures'),

    ('ESS Portal Guide',
     'http://192.0.15.99:8055/assets/a498407b-c2f4-4ed9-bccd-34648af26a21',
     'guide',
     'ess portal guide employee self service instructions help'),

    ('Money Laundering Prevention & Control',
     'http://192.0.15.99:8055/assets/195a8c26-bef3-405b-9afc-4ac9c22390be',
     'policy',
     'aml anti money laundering compliance kyc money laundering prevention'),

    ('Document Management System',
     'http://192.0.15.99:8055/assets/227edf31-a6f5-4606-a7c5-5dda9844a6c7',
     'system',
     'dms document management documents files records'),

    ('Organizational Flowchart',
     'http://192.0.15.99:8055/assets/6b335a62-84e1-4f28-a89d-858afe00e9eb',
     'information',
     'organization organizational flowchart org chart structure hierarchy departments'),

    ('Pay by Link',
     'http://192.0.15.99:8055/assets/d513c5cb-fde7-4aca-9ee2-b89ed5ad9d40',
     'system',
     'pay payment payment link invoice online payment');