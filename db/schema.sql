-- =============================================================
-- MYB Intranet — schema
-- Two roles:
--   web_anon    -> read-only, used by PostgREST for public content tables
--   web_writer  -> used only by FastAPI (server-side) for writes
-- =============================================================

create schema if not exists api;

-- ---------- CONTENT TABLES (exposed read-only via PostgREST) ----------

create table api.quick_links (
    id          serial primary key,
    label       text not null,
    href        text not null,
    icon        text default 'link',       -- icon key, matched in frontend/src/components/Icon.jsx
    sort_order  int  not null default 0,
    enabled     boolean not null default true
);

create table api.feature_tiles (
    id          serial primary key,
    title       text not null,
    href        text not null,
    icon        text default 'doc',
    sort_order  int  not null default 0,
    enabled     boolean not null default true
);

create table api.gallery_images (
    id          serial primary key,
    caption     text,
    image_url   text not null,
    sort_order  int  not null default 0,
    enabled     boolean not null default true
);

create table api.events (
    id          serial primary key,
    title       text not null,
    description text,
    starts_at   timestamptz not null,
    location    text,
    enabled     boolean not null default true
);

create table api.news_items (
    id           serial primary key,
    title        text not null,
    summary      text,
    url          text,
    published_at timestamptz not null default now(),
    enabled      boolean not null default true
);

create table api.newsletter_subscribers (
    id          serial primary key,
    email       text not null unique,
    subscribed_at timestamptz not null default now()
);

-- ---------- ANALYTICS TABLES (written only by FastAPI, never by PostgREST) ----------

create table api.visitors (
    visitor_id   uuid primary key,
    first_seen   timestamptz not null default now(),
    last_seen    timestamptz not null default now(),
    visit_count  int not null default 1
);

create table api.page_views (
    id          bigserial primary key,
    visitor_id  uuid not null references api.visitors(visitor_id),
    path        text not null,
    referrer    text,
    user_agent  text,
    viewed_at   timestamptz not null default now()
);

create index on api.page_views (viewed_at);
create index on api.page_views (visitor_id);

-- ---------- ROLES & PERMISSIONS ----------

-- web_anon: the role PostgREST actually queries as (no login of its own —
-- PostgREST connects as `authenticator` and does SET ROLE web_anon per request).
create role web_anon nologin;
create role authenticator noinherit login password 'postgres';
grant web_anon to authenticator;

-- web_writer: used only by FastAPI's own DB connection (see backend/app/config.py).
create role web_writer login password 'web_writer_pw';

grant usage on schema api to web_anon, web_writer;

-- NOTE: web_anon is intentionally NOT granted select on the raw tables above.
-- Only the *_public views below are exposed, so disabled rows, past events,
-- and the `enabled` column itself never leak to the public API.

-- FastAPI role: read+write everything (it applies its own logic before writing)
grant select, insert, update, delete on all tables in schema api to web_writer;
grant usage, select on all sequences in schema api to web_writer;

-- Only show enabled rows to anon via a view (simpler than RLS for this small scope)
create view api.quick_links_public as
  select id, label, href, icon, sort_order from api.quick_links
  where enabled order by sort_order;
grant select on api.quick_links_public to web_anon;

create view api.feature_tiles_public as
  select id, title, href, icon, sort_order from api.feature_tiles
  where enabled order by sort_order;
grant select on api.feature_tiles_public to web_anon;

create view api.events_public as
  select id, title, description, starts_at, location from api.events
  where enabled and starts_at >= now() - interval '1 day'
  order by starts_at asc;
grant select on api.events_public to web_anon;

create view api.gallery_images_public as
  select id, caption, image_url, sort_order from api.gallery_images
  where enabled order by sort_order;
grant select on api.gallery_images_public to web_anon;

create view api.news_items_public as
  select id, title, summary, url, published_at from api.news_items
  where enabled order by published_at desc limit 20;
grant select on api.news_items_public to web_anon;

-- ---------- SEED DATA (safe to delete/replace) ----------

insert into api.quick_links (label, href, icon, sort_order) values
  ('IT Support Ticket', '/it-support', 'ticket', 1),
  ('ESS Portal', '/ess', 'user', 2),
  ('Telephone List', '/directory', 'phone', 3),
  ('Employee Handbook', '/handbook', 'book', 4);

insert into api.feature_tiles (title, href, icon, sort_order) values
  ('MYB Internal Site', '/internal', 'doc', 1),
  ('H.O. Meeting Room Booking', '/room-booking', 'meeting', 2),
  ('Money Laundering Prevention & Control', '/aml', 'shield', 3),
  ('Document Management System', '/dms', 'folder', 4),
  ('Organizational Flowchart', '/org-chart', 'chart', 5),
  ('Pay by Link', '/pay', 'card', 6);

insert into api.events (title, description, starts_at, location) values
  ('Annual Staff Townhall', 'Company-wide update from senior management.', now() + interval '7 days', 'HQ Auditorium'),
  ('Ramadan Working Hours Begin', 'Adjusted hours across all divisions.', now() + interval '20 days', 'All Branches');

insert into api.news_items (title, summary, url) values
  ('New ESS Portal Features Live', 'Leave requests and payslips now available on mobile.', '/news/ess-update'),
  ('MYB Marks 90 Years', 'A look back at nine decades of the group''s history.', '/news/90-years');
