-- =============================================================================
-- Frame2Frame — Initial Schema
-- Reference file. Tables are already created in Supabase.
-- Run this only in a fresh environment.
-- =============================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- =============================================================================
-- 1. TENANTS (Studios / Orgs)
-- =============================================================================
create table if not exists tenants (
  id           uuid primary key default gen_random_uuid(),
  display_id   text not null unique,          -- e.g. SKD-001
  company_name text not null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- =============================================================================
-- 2. USERS (Global pool: admins, team members, freelancers)
-- =============================================================================
create table if not exists users (
  id           uuid primary key default gen_random_uuid(),
  display_id   text not null unique,          -- e.g. USR-1001
  full_name    text not null,
  email        text,
  phone_number text,
  usual_role   text,                          -- default role; pre-fills assignment_role in expenses
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- =============================================================================
-- 3. WORKSPACE_MEMBERSHIPS (User <-> Tenant bridge)
-- =============================================================================
create table if not exists workspace_memberships (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  tenant_id  uuid not null references tenants(id) on delete cascade,
  role       text not null check (role in ('ADMIN', 'MEMBER')),
  is_active  boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, tenant_id)
);

-- =============================================================================
-- 4. CLIENTS_MASTER
-- =============================================================================
create table if not exists clients_master (
  id           uuid primary key default gen_random_uuid(),
  display_id   text not null,                 -- e.g. CLI-1001 (unique within tenant)
  tenant_id    uuid not null references tenants(id),
  client_name  text not null,
  phone_number text,
  email        text,
  notes        text,
  is_active    boolean default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (display_id, tenant_id)
);

-- =============================================================================
-- 5. EVENTS_MASTER
-- =============================================================================
create table if not exists events_master (
  id            uuid primary key default gen_random_uuid(),
  display_id    text not null,                -- e.g. EVT-2001 (unique within tenant)
  tenant_id     uuid not null references tenants(id),
  client_id     uuid not null references clients_master(id),
  event_type    text not null,
  venue         text,
  city          text,
  package_value numeric(12, 2) default 0,
  event_dates   date[],                       -- Stored as an array on the event
  is_active     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (display_id, tenant_id)
);

-- =============================================================================
-- 6. ARTIST_EXPENSES (On-site roles: photographers, videographers, etc.)
-- =============================================================================
create table if not exists artist_expenses (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id),
  event_id        uuid not null references events_master(id),
  user_id         uuid not null references users(id),
  assignment_role text not null,              -- Can differ from user's usual_role
  pay_type        text not null check (pay_type in ('Lump Sum', 'Per Day')),
  date_start      date,
  date_end        date,
  no_of_days      numeric(5, 1),
  per_day_rate    numeric(12, 2),
  total_amount    numeric(12, 2) not null default 0,
  advance_paid    numeric(12, 2) not null default 0,
  -- NOTE: Balance (total_amount - advance_paid) and status are NEVER stored.
  -- They are calculated dynamically by the backend at query time.
  is_active       boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- =============================================================================
-- 7. OUTPUT_EXPENSES (Deliverables: editors, albums, reels, etc.)
-- =============================================================================
create table if not exists output_expenses (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id),
  event_id        uuid not null references events_master(id),
  user_id         uuid not null references users(id),
  assignment_role text not null default 'Editor',  -- e.g. Editor, Vendor
  deliverable     text not null,
  quantity        integer not null default 1,
  total_amount    numeric(12, 2) not null default 0,
  advance_paid    numeric(12, 2) not null default 0,
  -- NOTE: Balance and status calculated dynamically.
  is_active       boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- =============================================================================
-- 8. CLIENT_PAYMENTS (Inflow from clients per event)
-- =============================================================================
create table if not exists client_payments (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references tenants(id),
  event_id         uuid not null references events_master(id),
  installment_type text,                      -- e.g. 'Booking Amount', 'Installment 1'
  amount           numeric(12, 2) not null,
  payment_method   text not null default 'Cash',
  transaction_id   text,
  payment_date     date not null,
  is_active        boolean default true,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- =============================================================================
-- ROW LEVEL SECURITY (Enable on all tables; backend bypasses via service role)
-- =============================================================================
alter table tenants              enable row level security;
alter table users                enable row level security;
alter table workspace_memberships enable row level security;
alter table clients_master       enable row level security;
alter table events_master        enable row level security;
alter table artist_expenses      enable row level security;
alter table output_expenses      enable row level security;
alter table client_payments      enable row level security;
