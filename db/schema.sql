-- =============================================================
-- MYB Intranet — schema
-- Plain Postgres, default "public" schema. FastAPI is the ONLY thing that
-- ever connects to this database, and it enforces what's public (the
-- `enabled` flag, future-only events, etc.) in its own queries — see
-- backend/app/routers/content.py. There is no separate read-only role or
-- view layer here; if you're looking for that, this project used to run
-- PostgREST in front of Postgres and it's been removed on purpose to cut
-- the moving parts down.
-- =============================================================

-- (using the default "public" schema — no separate schema needed)

-- One role for FastAPI. No PostgREST, no read-only role, no views — just
-- a normal app user with full rights on its own schema. Change the
-- password before deploying anywhere shared.
create role myb_app login password 'myb_app_pw';
grant usage on schema public to myb_app;
alter default privileges in schema public grant select, insert, update, delete on tables to myb_app;
alter default privileges in schema public grant usage, select on sequences to myb_app;

-- ---------- CONTENT TABLES ----------

create table quick_links (
    id          serial primary key,
    label       text not null,
    href        text not null,
    icon        text default 'link',
    sort_order  int  not null default 0,
    enabled     boolean not null default true
);

create table feature_tiles (
    id          serial primary key,
    title       text not null,
    href        text not null,
    umg_url     text,
    icon        text default 'doc',
    sort_order  int  not null default 0,
    enabled     boolean not null default true
);

create table gallery_images (
    id          serial primary key,
    caption     text,
    image_url   text not null,
    sort_order  int  not null default 0,
    enabled     boolean not null default true
);

create table events (
    id          serial primary key,
    title       text not null,
    description text,
    starts_at   timestamptz not null,
    location    text,
    enabled     boolean not null default true
);

create table news_items (
    id           serial primary key,
    title        text not null,
    summary      text,
    url          text,
    published_at timestamptz not null default now(),
    enabled      boolean not null default true
);

create table whats_new (
    id          serial primary key,
    title       text not null,
    body        text not null,
    active      boolean not null default true,
    published_at timestamptz not null default now()
);

-- Generic, site-wide search index. Deliberately NOT tied to any one content
-- type (quick_links, events, etc.) — that's the point: as you add more
-- sections later, you add rows here too (by hand, or eventually a trigger
-- that keeps it in sync), and the one /api/search endpoint covers all of
-- them without new backend code.
create table search_items (
    id          serial primary key,
    name        text not null,
    href        text not null,
    category    text,            -- e.g. 'system', 'policy', 'contact' — optional, for grouping results later
    keywords    text,            -- extra search terms beyond the name, space-separated
    active      boolean not null default true
);

create table newsletter_subscribers (
    id          serial primary key,
    email       text not null unique,
    subscribed_at timestamptz not null default now()
);

-- ---------- ANALYTICS TABLES ----------

create table visitors (
    visitor_id   uuid primary key,
    first_seen   timestamptz not null default now(),
    last_seen    timestamptz not null default now(),
    visit_count  int not null default 1
);

create table page_views (
    id          bigserial primary key,
    visitor_id  uuid not null references visitors(visitor_id),
    path        text not null,
    referrer    text,
    user_agent  text,
    viewed_at   timestamptz not null default now()
);

create index on page_views (viewed_at);
create index on page_views (visitor_id);

-- ---------- SEED DATA (safe to delete/replace) ----------

insert into quick_links (label, href, icon, sort_order) values
  ('IT Support Ticket', '/it-support', 'ticket', 1),
  ('ESS Portal', '/ess', 'user', 2),
  ('Telephone List', '/directory', 'phone', 3),
  ('Employee Handbook', '/handbook', 'book', 4);

insert into feature_tiles (title, href, icon, sort_order) values
  ('MYB Internal Site', '/internal', 'doc', 1),
  ('H.O. Meeting Room Booking', '/room-booking', 'meeting', 2),
  ('Money Laundering Prevention & Control', '/aml', 'shield', 3),
  ('Document Management System', '/dms', 'folder', 4),
  ('Organizational Flowchart', '/org-chart', 'chart', 5),
  ('Pay by Link', '/pay', 'card', 6);

insert into events (title, description, starts_at, location) values
  ('Annual Staff Townhall', 'Company-wide update from senior management.', now() + interval '7 days', 'HQ Auditorium'),
  ('Ramadan Working Hours Begin', 'Adjusted hours across all divisions.', now() + interval '20 days', 'All Branches');

insert into news_items (title, summary, url) values
  ('New ESS Portal Features Live', 'Leave requests and payslips now available on mobile.', '/news/ess-update'),
  ('MYB Marks 90 Years', 'A look back at nine decades of the group''s history.', '/news/90-years');

insert into whats_new (title, body) values
  ('New intranet, same shortcuts',
   'We''ve refreshed the homepage. All your usual links are still here — just look nicer and load faster.');

insert into search_items (name, href, category, keywords) values
  ('IT Support Ticket', '/it-support', 'system', 'helpdesk it issue bug'),
  ('ESS Portal', '/ess', 'system', 'leave payslip attendance self service'),
  ('Telephone List', '/directory', 'contact', 'phone extension directory staff'),
  ('Employee Handbook', '/handbook', 'policy', 'hr rules policy conduct'),
  ('MYB Internal Site', '/internal', 'system', ''),
  ('H.O. Meeting Room Booking', '/room-booking', 'system', 'room booking calendar meeting'),
  ('Money Laundering Prevention & Control', '/aml', 'policy', 'aml compliance kyc'),
  ('Document Management System', '/dms', 'system', 'dms documents files'),
  ('Organizational Flowchart', '/org-chart', 'policy', 'org chart structure hierarchy'),
  ('Pay by Link', '/pay', 'system', 'payment invoice link');
