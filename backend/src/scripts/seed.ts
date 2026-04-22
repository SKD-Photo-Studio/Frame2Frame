/**
 * Seed Script: SKD Photo Studio — Frame2Frame
 *
 * Run from the backend/ directory:
 *   npx ts-node src/scripts/seed.ts
 *
 * Seeds: 1 tenant, 2 admins, 15 team members, 10 clients,
 *        12 events (10 past, 2 future), artist expenses,
 *        output expenses, and client payments.
 */

import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ── Helpers ──────────────────────────────────────────────────────────────────

function calcStatus(total: number, paid: number): string {
  if (paid >= total) return 'Paid';
  if (paid > 0) return 'Partial';
  return 'Unpaid';
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Starting seed...\n');

  // ── Guard: skip if already seeded ─────────────────────────────────────────
  const { data: existingTenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('company_name', 'SKD Photo Studio')
    .maybeSingle();

  if (existingTenant) {
    console.log('⚠️  SKD Photo Studio tenant already exists. Seed skipped.');
    console.log(`   Tenant ID: ${existingTenant.id}`);
    return;
  }

  // ── 1. Tenant ──────────────────────────────────────────────────────────────
  console.log('1️⃣  Inserting tenant...');
  const { data: tenantRows, error: tenantErr } = await supabase
    .from('tenants')
    .insert({ display_id: 'SKD-001', company_name: 'SKD Photo Studio' })
    .select();

  if (tenantErr || !tenantRows?.length) {
    console.error('❌ Failed to insert tenant:', tenantErr?.message);
    process.exit(1);
  }
  const tenant = tenantRows[0];
  const tid = tenant.id;
  console.log(`   ✅ Tenant "${tenant.company_name}" created (${tid})\n`);

  // ── 2. Users (2 admins + 15 team members) ──────────────────────────────────
  console.log('2️⃣  Inserting users...');
  const usersData = [
    // Admins
    { display_id: 'USR-1001', full_name: 'Bhanu Ashwyn', email: 'bhanu@skdstudios.in', phone_number: '9900112233', usual_role: 'Admin' },
    { display_id: 'USR-1002', full_name: 'SKD',          email: 'skd@skdstudios.in',   phone_number: '9900112200', usual_role: 'Admin' },
    // Team
    { display_id: 'USR-1003', full_name: 'Vikram Nair',     email: 'vikram@freelance.in',   phone_number: '9001122334', usual_role: 'Traditional Photographer' },
    { display_id: 'USR-1004', full_name: 'Priya Singh',     email: 'priya@freelance.in',    phone_number: '9002233445', usual_role: 'Cinematographer' },
    { display_id: 'USR-1005', full_name: 'Arun Kumar',      email: 'arun@freelance.in',     phone_number: '9003344556', usual_role: 'Candid Photographer' },
    { display_id: 'USR-1006', full_name: 'Ravi Verma',      email: 'ravi@freelance.in',     phone_number: '9004455667', usual_role: 'Traditional Videographer' },
    { display_id: 'USR-1007', full_name: 'Neha Gupta',      email: 'neha@freelance.in',     phone_number: '9005566778', usual_role: 'Editor' },
    { display_id: 'USR-1008', full_name: 'Karthik Iyer',    email: 'karthik@freelance.in',  phone_number: '9006677889', usual_role: 'Assistant' },
    { display_id: 'USR-1009', full_name: 'Sanjay Mehta',    email: 'sanjay@freelance.in',   phone_number: '9007788990', usual_role: 'Choreographer' },
    { display_id: 'USR-1010', full_name: 'Divya Krishnan',  email: 'divya@freelance.in',    phone_number: '9008899001', usual_role: 'Traditional Photographer' },
    { display_id: 'USR-1011', full_name: 'Rohit Sharma',    email: 'rohit@freelance.in',    phone_number: '9009900112', usual_role: 'Cinematographer' },
    { display_id: 'USR-1012', full_name: 'Anita Patel',     email: 'anita@freelance.in',    phone_number: '9100011223', usual_role: 'Candid Photographer' },
    { display_id: 'USR-1013', full_name: 'Suresh Rao',      email: 'suresh@freelance.in',   phone_number: '9111122334', usual_role: 'Traditional Videographer' },
    { display_id: 'USR-1014', full_name: 'Maya Reddy',      email: 'maya@freelance.in',     phone_number: '9122233445', usual_role: 'Editor' },
    { display_id: 'USR-1015', full_name: 'Arjun Pillai',    email: 'arjun@freelance.in',    phone_number: '9133344556', usual_role: 'Assistant' },
    { display_id: 'USR-1016', full_name: 'Kavitha Menon',   email: 'kavitha@freelance.in',  phone_number: '9144455667', usual_role: 'Director' },
    { display_id: 'USR-1017', full_name: 'Deepak Joshi',    email: 'deepak@freelance.in',   phone_number: '9155566778', usual_role: 'Traditional Photographer' },
  ];

  const { data: users, error: usersErr } = await supabase
    .from('users')
    .insert(usersData)
    .select();

  if (usersErr || !users?.length) {
    console.error('❌ Failed to insert users:', usersErr?.message);
    process.exit(1);
  }

  // Build lookup map: display_id -> uuid
  const userMap: Record<string, string> = {};
  users.forEach(u => { userMap[u.display_id] = u.id; });
  console.log(`   ✅ ${users.length} users created\n`);

  // ── 3. Workspace Memberships ───────────────────────────────────────────────
  console.log('3️⃣  Inserting workspace memberships...');
  const memberships = [
    { user_id: userMap['USR-1001'], tenant_id: tid, role: 'ADMIN' },
    { user_id: userMap['USR-1002'], tenant_id: tid, role: 'ADMIN' },
    ...['USR-1003','USR-1004','USR-1005','USR-1006','USR-1007','USR-1008',
        'USR-1009','USR-1010','USR-1011','USR-1012','USR-1013','USR-1014',
        'USR-1015','USR-1016','USR-1017'].map(d => ({
      user_id: userMap[d], tenant_id: tid, role: 'MEMBER',
    })),
  ];

  const { error: memErr } = await supabase.from('workspace_memberships').insert(memberships);
  if (memErr) { console.error('❌ Failed to insert memberships:', memErr.message); process.exit(1); }
  console.log(`   ✅ ${memberships.length} memberships created\n`);

  // ── 4. Clients ─────────────────────────────────────────────────────────────
  console.log('4️⃣  Inserting clients...');
  const clientsData = [
    { display_id: 'CLI-1001', tenant_id: tid, client_name: 'Rahul & Sneha Sharma',  phone_number: '9876543210', email: 'rahul.sneha@gmail.com',   notes: 'Referred by Priya. Prefers candid shots.' },
    { display_id: 'CLI-1002', tenant_id: tid, client_name: 'Ananya & Vikram Patel',  phone_number: '9123456789', email: 'ananya.vikram@gmail.com',  notes: 'VIP client. Multiple bookings expected.' },
    { display_id: 'CLI-1003', tenant_id: tid, client_name: 'Arjun & Meera Kapoor',   phone_number: '9988776655', email: 'arjun.meera@gmail.com',    notes: 'Destination wedding client.' },
    { display_id: 'CLI-1004', tenant_id: tid, client_name: 'Deepika Reddy',           phone_number: '8877665544', email: 'deepika.r@yahoo.com',      notes: '' },
    { display_id: 'CLI-1005', tenant_id: tid, client_name: 'Kiran & Priya Nair',      phone_number: '7766554433', email: 'kiran.priya@gmail.com',    notes: 'Budget-conscious. Focus on essentials.' },
    { display_id: 'CLI-1006', tenant_id: tid, client_name: 'Amit & Sunita Verma',     phone_number: '9001234567', email: 'amit.sunita@gmail.com',    notes: '' },
    { display_id: 'CLI-1007', tenant_id: tid, client_name: 'Ravi & Pooja Gupta',      phone_number: '9876501234', email: 'ravi.pooja@gmail.com',     notes: 'Loves traditional photography.' },
    { display_id: 'CLI-1008', tenant_id: tid, client_name: 'Suresh & Kavitha Kumar',  phone_number: '9812345678', email: 'suresh.kavitha@gmail.com', notes: '' },
    { display_id: 'CLI-1009', tenant_id: tid, client_name: 'Manoj & Divya Mehta',     phone_number: '9823456789', email: 'manoj.divya@gmail.com',    notes: 'Pre-wedding in Coorg.' },
    { display_id: 'CLI-1010', tenant_id: tid, client_name: 'Rajesh & Anita Iyer',     phone_number: '9834567890', email: 'rajesh.anita@gmail.com',   notes: '' },
  ];

  const { data: clients, error: clientsErr } = await supabase
    .from('clients_master')
    .insert(clientsData)
    .select();

  if (clientsErr || !clients?.length) {
    console.error('❌ Failed to insert clients:', clientsErr?.message);
    process.exit(1);
  }
  const clientMap: Record<string, string> = {};
  clients.forEach(c => { clientMap[c.display_id] = c.id; });
  console.log(`   ✅ ${clients.length} clients created\n`);

  // ── 5. Events ──────────────────────────────────────────────────────────────
  console.log('5️⃣  Inserting events...');
  const eventsData = [
    // ── PAST: 2025 ──
    { display_id: 'EVT-2001', tenant_id: tid, client_id: clientMap['CLI-1001'], event_type: 'Wedding',     venue: 'The Leela Palace',    city: 'Bangalore', package_value: 350000, event_dates: ['2025-01-18', '2025-01-19', '2025-01-20'] },
    { display_id: 'EVT-2002', tenant_id: tid, client_id: clientMap['CLI-1002'], event_type: 'Pre-Wedding', venue: 'Nandi Hills',          city: 'Bangalore', package_value: 85000,  event_dates: ['2025-03-05'] },
    { display_id: 'EVT-2003', tenant_id: tid, client_id: clientMap['CLI-1003'], event_type: 'Wedding',     venue: 'Taj Lake Palace',      city: 'Udaipur',   package_value: 520000, event_dates: ['2025-05-10', '2025-05-11', '2025-05-12'] },
    { display_id: 'EVT-2004', tenant_id: tid, client_id: clientMap['CLI-1004'], event_type: 'Birthday',    venue: '',                     city: 'Hyderabad', package_value: 45000,  event_dates: ['2025-07-22'] },
    { display_id: 'EVT-2005', tenant_id: tid, client_id: clientMap['CLI-1005'], event_type: 'Engagement',  venue: 'ITC Gardenia',         city: 'Bangalore', package_value: 120000, event_dates: ['2025-09-14'] },
    { display_id: 'EVT-2006', tenant_id: tid, client_id: clientMap['CLI-1006'], event_type: 'Wedding',     venue: 'Radisson Blu',         city: 'Chennai',   package_value: 280000, event_dates: ['2025-11-02', '2025-11-03'] },
    { display_id: 'EVT-2007', tenant_id: tid, client_id: clientMap['CLI-1007'], event_type: 'Anniversary', venue: 'Park Hyatt',           city: 'Chennai',   package_value: 65000,  event_dates: ['2025-12-15'] },
    // ── PAST: early 2026 ──
    { display_id: 'EVT-2008', tenant_id: tid, client_id: clientMap['CLI-1008'], event_type: 'Wedding',     venue: 'Sheraton Grand',       city: 'Bangalore', package_value: 420000, event_dates: ['2026-01-10', '2026-01-11', '2026-01-12'] },
    { display_id: 'EVT-2009', tenant_id: tid, client_id: clientMap['CLI-1009'], event_type: 'Pre-Wedding', venue: 'Coorg Wilderness',     city: 'Coorg',     package_value: 90000,  event_dates: ['2026-02-20'] },
    { display_id: 'EVT-2010', tenant_id: tid, client_id: clientMap['CLI-1010'], event_type: 'Engagement',  venue: 'The Ritz-Carlton',     city: 'Bangalore', package_value: 150000, event_dates: ['2026-03-08'] },
    // ── FUTURE: 2026 ──
    { display_id: 'EVT-2011', tenant_id: tid, client_id: clientMap['CLI-1001'], event_type: 'Wedding',     venue: 'Taj West End',         city: 'Bangalore', package_value: 400000, event_dates: ['2026-06-20', '2026-06-21'] },
    { display_id: 'EVT-2012', tenant_id: tid, client_id: clientMap['CLI-1002'], event_type: 'Wedding',     venue: 'The Oberoi Udaivilas', city: 'Udaipur',   package_value: 320000, event_dates: ['2026-07-12', '2026-07-13'] },
  ];

  const { data: events, error: eventsErr } = await supabase
    .from('events_master')
    .insert(eventsData)
    .select();

  if (eventsErr || !events?.length) {
    console.error('❌ Failed to insert events:', eventsErr?.message);
    process.exit(1);
  }
  const evtMap: Record<string, string> = {};
  events.forEach(e => { evtMap[e.display_id] = e.id; });
  console.log(`   ✅ ${events.length} events created (10 past, 2 future)\n`);

  // ── 6. Artist Expenses ─────────────────────────────────────────────────────
  // Note: 3 members (USR-1003 Vikram, USR-1004 Priya, USR-1007 Neha) also get
  // output_expenses rows for the same event → tests unified balance.
  console.log('6️⃣  Inserting artist expenses...');
  const artistExpData = [
    // EVT-2001 (Rahul & Sneha Wedding — The Leela, Jan 2025)
    { tenant_id: tid, event_id: evtMap['EVT-2001'], user_id: userMap['USR-1003'], assignment_role: 'Traditional Photographer', pay_type: 'Per Day',   date_start: '2025-01-18', date_end: '2025-01-20', no_of_days: 3, per_day_rate: 9000,  total_amount: 27000, advance_paid: 10000 },
    { tenant_id: tid, event_id: evtMap['EVT-2001'], user_id: userMap['USR-1004'], assignment_role: 'Cinematographer',         pay_type: 'Lump Sum', date_start: '2025-01-18', date_end: '2025-01-20', no_of_days: 3, per_day_rate: 0,     total_amount: 35000, advance_paid: 15000 },
    { tenant_id: tid, event_id: evtMap['EVT-2001'], user_id: userMap['USR-1005'], assignment_role: 'Candid Photographer',     pay_type: 'Per Day',   date_start: '2025-01-18', date_end: '2025-01-20', no_of_days: 3, per_day_rate: 10000, total_amount: 30000, advance_paid: 30000 },
    { tenant_id: tid, event_id: evtMap['EVT-2001'], user_id: userMap['USR-1008'], assignment_role: 'Assistant',              pay_type: 'Per Day',   date_start: '2025-01-18', date_end: '2025-01-20', no_of_days: 3, per_day_rate: 3000,  total_amount: 9000,  advance_paid: 5000  },

    // EVT-2002 (Ananya Pre-Wedding — Nandi Hills, Mar 2025)
    { tenant_id: tid, event_id: evtMap['EVT-2002'], user_id: userMap['USR-1005'], assignment_role: 'Candid Photographer',     pay_type: 'Lump Sum', date_start: '2025-03-05', date_end: '2025-03-05', no_of_days: 1, per_day_rate: 0,    total_amount: 15000, advance_paid: 15000 },

    // EVT-2003 (Arjun & Meera Wedding — Udaipur, May 2025)
    { tenant_id: tid, event_id: evtMap['EVT-2003'], user_id: userMap['USR-1003'], assignment_role: 'Traditional Photographer', pay_type: 'Per Day',  date_start: '2025-05-10', date_end: '2025-05-12', no_of_days: 3, per_day_rate: 10000, total_amount: 30000, advance_paid: 10000 },
    { tenant_id: tid, event_id: evtMap['EVT-2003'], user_id: userMap['USR-1004'], assignment_role: 'Cinematographer',          pay_type: 'Lump Sum', date_start: '2025-05-10', date_end: '2025-05-12', no_of_days: 3, per_day_rate: 0,     total_amount: 50000, advance_paid: 20000 },
    { tenant_id: tid, event_id: evtMap['EVT-2003'], user_id: userMap['USR-1006'], assignment_role: 'Traditional Videographer', pay_type: 'Per Day',  date_start: '2025-05-10', date_end: '2025-05-12', no_of_days: 3, per_day_rate: 7000,  total_amount: 21000, advance_paid: 0     },
    { tenant_id: tid, event_id: evtMap['EVT-2003'], user_id: userMap['USR-1008'], assignment_role: 'Assistant',               pay_type: 'Per Day',  date_start: '2025-05-10', date_end: '2025-05-12', no_of_days: 3, per_day_rate: 3000,  total_amount: 9000,  advance_paid: 9000  },

    // EVT-2005 (Kiran & Priya Engagement, Sep 2025)
    { tenant_id: tid, event_id: evtMap['EVT-2005'], user_id: userMap['USR-1010'], assignment_role: 'Traditional Photographer', pay_type: 'Lump Sum', date_start: '2025-09-14', date_end: '2025-09-14', no_of_days: 1, per_day_rate: 0,    total_amount: 18000, advance_paid: 8000 },
    { tenant_id: tid, event_id: evtMap['EVT-2005'], user_id: userMap['USR-1012'], assignment_role: 'Candid Photographer',      pay_type: 'Lump Sum', date_start: '2025-09-14', date_end: '2025-09-14', no_of_days: 1, per_day_rate: 0,    total_amount: 12000, advance_paid: 0    },

    // EVT-2006 (Amit & Sunita Wedding — Chennai, Nov 2025)
    { tenant_id: tid, event_id: evtMap['EVT-2006'], user_id: userMap['USR-1010'], assignment_role: 'Traditional Photographer', pay_type: 'Per Day', date_start: '2025-11-02', date_end: '2025-11-03', no_of_days: 2, per_day_rate: 9000,  total_amount: 18000, advance_paid: 10000 },
    { tenant_id: tid, event_id: evtMap['EVT-2006'], user_id: userMap['USR-1011'], assignment_role: 'Cinematographer',          pay_type: 'Per Day', date_start: '2025-11-02', date_end: '2025-11-03', no_of_days: 2, per_day_rate: 12000, total_amount: 24000, advance_paid: 0     },

    // EVT-2008 (Suresh & Kavitha Wedding — Bangalore, Jan 2026)
    { tenant_id: tid, event_id: evtMap['EVT-2008'], user_id: userMap['USR-1003'], assignment_role: 'Traditional Photographer', pay_type: 'Per Day',  date_start: '2026-01-10', date_end: '2026-01-12', no_of_days: 3, per_day_rate: 9000,  total_amount: 27000, advance_paid: 15000 },
    { tenant_id: tid, event_id: evtMap['EVT-2008'], user_id: userMap['USR-1004'], assignment_role: 'Cinematographer',          pay_type: 'Per Day',  date_start: '2026-01-10', date_end: '2026-01-12', no_of_days: 3, per_day_rate: 12000, total_amount: 36000, advance_paid: 20000 },
    { tenant_id: tid, event_id: evtMap['EVT-2008'], user_id: userMap['USR-1013'], assignment_role: 'Traditional Videographer', pay_type: 'Per Day',  date_start: '2026-01-10', date_end: '2026-01-12', no_of_days: 3, per_day_rate: 7000,  total_amount: 21000, advance_paid: 0     },
    { tenant_id: tid, event_id: evtMap['EVT-2008'], user_id: userMap['USR-1015'], assignment_role: 'Assistant',               pay_type: 'Per Day',  date_start: '2026-01-10', date_end: '2026-01-12', no_of_days: 3, per_day_rate: 3000,  total_amount: 9000,  advance_paid: 4000  },

    // EVT-2011 (Future — Raj & Sneha Wedding, Jun 2026)
    { tenant_id: tid, event_id: evtMap['EVT-2011'], user_id: userMap['USR-1003'], assignment_role: 'Traditional Photographer', pay_type: 'Per Day', date_start: '2026-06-20', date_end: '2026-06-21', no_of_days: 2, per_day_rate: 9000, total_amount: 18000, advance_paid: 0 },
    { tenant_id: tid, event_id: evtMap['EVT-2011'], user_id: userMap['USR-1016'], assignment_role: 'Director',                 pay_type: 'Lump Sum',date_start: '2026-06-20', date_end: '2026-06-21', no_of_days: 2, per_day_rate: 0,    total_amount: 15000, advance_paid: 5000 },

    // EVT-2012 (Future — Ananya & Vikram Wedding, Jul 2026)
    { tenant_id: tid, event_id: evtMap['EVT-2012'], user_id: userMap['USR-1017'], assignment_role: 'Traditional Photographer', pay_type: 'Per Day', date_start: '2026-07-12', date_end: '2026-07-13', no_of_days: 2, per_day_rate: 9000, total_amount: 18000, advance_paid: 0 },
  ];

  const { error: aeErr } = await supabase.from('artist_expenses').insert(artistExpData);
  if (aeErr) { console.error('❌ Failed to insert artist_expenses:', aeErr.message); process.exit(1); }
  console.log(`   ✅ ${artistExpData.length} artist expense rows created\n`);

  // ── 7. Output Expenses ─────────────────────────────────────────────────────
  // USR-1003 (Vikram), USR-1004 (Priya), USR-1007 (Neha) appear in BOTH tables
  // for the same event → unified balance test.
  console.log('7️⃣  Inserting output expenses...');
  const outputExpData = [
    // EVT-2001: Vikram (USR-1003) also gets an Album Design output expense
    { tenant_id: tid, event_id: evtMap['EVT-2001'], user_id: userMap['USR-1003'], assignment_role: 'Vendor',  deliverable: 'Album',            quantity: 1, total_amount: 18000, advance_paid: 5000  },
    // EVT-2001: Priya (USR-1004) also gets a Highlight edit output expense
    { tenant_id: tid, event_id: evtMap['EVT-2001'], user_id: userMap['USR-1004'], assignment_role: 'Editor',  deliverable: 'Highlight',        quantity: 1, total_amount: 12000, advance_paid: 6000  },
    // EVT-2001: Neha (USR-1007) — editor for main event
    { tenant_id: tid, event_id: evtMap['EVT-2001'], user_id: userMap['USR-1007'], assignment_role: 'Editor',  deliverable: 'Reel',             quantity: 3, total_amount: 9000,  advance_paid: 9000  },

    // EVT-2002
    { tenant_id: tid, event_id: evtMap['EVT-2002'], user_id: userMap['USR-1007'], assignment_role: 'Editor',  deliverable: 'Reel',             quantity: 2, total_amount: 6000,  advance_paid: 6000  },

    // EVT-2003: Neha (USR-1007) — Neha also gets artist_expense here for this event
    { tenant_id: tid, event_id: evtMap['EVT-2003'], user_id: userMap['USR-1007'], assignment_role: 'Editor',  deliverable: 'Highlight',        quantity: 1, total_amount: 15000, advance_paid: 5000  },
    { tenant_id: tid, event_id: evtMap['EVT-2003'], user_id: userMap['USR-1007'], assignment_role: 'Editor',  deliverable: 'Teaser',           quantity: 1, total_amount: 8000,  advance_paid: 0     },
    { tenant_id: tid, event_id: evtMap['EVT-2003'], user_id: userMap['USR-1007'], assignment_role: 'Editor',  deliverable: 'Traditional Video',quantity: 1, total_amount: 10000, advance_paid: 0     },

    // EVT-2004
    { tenant_id: tid, event_id: evtMap['EVT-2004'], user_id: userMap['USR-1014'], assignment_role: 'Editor',  deliverable: 'Reel',             quantity: 2, total_amount: 5000,  advance_paid: 2500  },

    // EVT-2005
    { tenant_id: tid, event_id: evtMap['EVT-2005'], user_id: userMap['USR-1014'], assignment_role: 'Editor',  deliverable: 'Highlight',        quantity: 1, total_amount: 8000,  advance_paid: 0     },

    // EVT-2006
    { tenant_id: tid, event_id: evtMap['EVT-2006'], user_id: userMap['USR-1007'], assignment_role: 'Editor',  deliverable: 'Highlight',        quantity: 1, total_amount: 14000, advance_paid: 7000  },
    { tenant_id: tid, event_id: evtMap['EVT-2006'], user_id: userMap['USR-1007'], assignment_role: 'Editor',  deliverable: 'Album',            quantity: 1, total_amount: 20000, advance_paid: 0     },

    // EVT-2007
    { tenant_id: tid, event_id: evtMap['EVT-2007'], user_id: userMap['USR-1014'], assignment_role: 'Editor',  deliverable: 'Reel',             quantity: 1, total_amount: 4000,  advance_paid: 4000  },

    // EVT-2008
    { tenant_id: tid, event_id: evtMap['EVT-2008'], user_id: userMap['USR-1007'], assignment_role: 'Editor',  deliverable: 'Highlight',        quantity: 1, total_amount: 15000, advance_paid: 8000  },
    { tenant_id: tid, event_id: evtMap['EVT-2008'], user_id: userMap['USR-1007'], assignment_role: 'Editor',  deliverable: 'Album',            quantity: 1, total_amount: 22000, advance_paid: 0     },

    // EVT-2009
    { tenant_id: tid, event_id: evtMap['EVT-2009'], user_id: userMap['USR-1014'], assignment_role: 'Editor',  deliverable: 'Reel',             quantity: 2, total_amount: 6000,  advance_paid: 6000  },

    // EVT-2011 (Future)
    { tenant_id: tid, event_id: evtMap['EVT-2011'], user_id: userMap['USR-1007'], assignment_role: 'Editor',  deliverable: 'Highlight',        quantity: 1, total_amount: 14000, advance_paid: 0     },

    // EVT-2012 (Future)
    { tenant_id: tid, event_id: evtMap['EVT-2012'], user_id: userMap['USR-1007'], assignment_role: 'Editor',  deliverable: 'Highlight',        quantity: 1, total_amount: 14000, advance_paid: 0     },
  ];

  const { error: oeErr } = await supabase.from('output_expenses').insert(outputExpData);
  if (oeErr) { console.error('❌ Failed to insert output_expenses:', oeErr.message); process.exit(1); }
  console.log(`   ✅ ${outputExpData.length} output expense rows created\n`);

  // ── 8. Client Payments ─────────────────────────────────────────────────────
  // Design ensures ≥4 events have remaining Client Balance (package_value > payments total).
  // EVT-2001: 250,000 paid of 350,000 → balance 100,000 ✓
  // EVT-2003: 370,000 paid of 520,000 → balance 150,000 ✓
  // EVT-2005:  80,000 paid of 120,000 → balance  40,000 ✓
  // EVT-2006: 200,000 paid of 280,000 → balance  80,000 ✓
  // EVT-2008: 300,000 paid of 420,000 → balance 120,000 ✓
  // EVT-2010: 100,000 paid of 150,000 → balance  50,000 ✓
  // EVT-2011: 100,000 paid of 400,000 → balance 300,000 ✓ (future)
  // EVT-2012:  80,000 paid of 320,000 → balance 240,000 ✓ (future)
  console.log('8️⃣  Inserting client payments...');
  const paymentsData = [
    { tenant_id: tid, event_id: evtMap['EVT-2001'], installment_type: 'Booking Amount', amount: 100000, payment_method: 'Online', transaction_id: 'TXN2501A', payment_date: '2024-11-10' },
    { tenant_id: tid, event_id: evtMap['EVT-2001'], installment_type: 'Installment 1',  amount: 150000, payment_method: 'Online', transaction_id: 'TXN2501B', payment_date: '2025-01-05' },

    { tenant_id: tid, event_id: evtMap['EVT-2002'], installment_type: 'Booking Amount', amount: 40000,  payment_method: 'Cash',   transaction_id: '',         payment_date: '2025-01-20' },
    { tenant_id: tid, event_id: evtMap['EVT-2002'], installment_type: 'Installment 1',  amount: 45000,  payment_method: 'Online', transaction_id: 'TXN2502A', payment_date: '2025-02-28' },

    { tenant_id: tid, event_id: evtMap['EVT-2003'], installment_type: 'Booking Amount', amount: 120000, payment_method: 'Online', transaction_id: 'TXN2503A', payment_date: '2024-12-01' },
    { tenant_id: tid, event_id: evtMap['EVT-2003'], installment_type: 'Installment 1',  amount: 150000, payment_method: 'Online', transaction_id: 'TXN2503B', payment_date: '2025-03-15' },
    { tenant_id: tid, event_id: evtMap['EVT-2003'], installment_type: 'Installment 2',  amount: 100000, payment_method: 'Online', transaction_id: 'TXN2503C', payment_date: '2025-04-20' },

    { tenant_id: tid, event_id: evtMap['EVT-2004'], installment_type: 'Booking Amount', amount: 25000,  payment_method: 'Cash',   transaction_id: '',         payment_date: '2025-06-10' },
    { tenant_id: tid, event_id: evtMap['EVT-2004'], installment_type: 'Installment 1',  amount: 20000,  payment_method: 'Online', transaction_id: 'TXN2504A', payment_date: '2025-07-20' },

    { tenant_id: tid, event_id: evtMap['EVT-2005'], installment_type: 'Booking Amount', amount: 50000,  payment_method: 'Online', transaction_id: 'TXN2505A', payment_date: '2025-07-01' },
    { tenant_id: tid, event_id: evtMap['EVT-2005'], installment_type: 'Installment 1',  amount: 30000,  payment_method: 'Cash',   transaction_id: '',         payment_date: '2025-09-01' },

    { tenant_id: tid, event_id: evtMap['EVT-2006'], installment_type: 'Booking Amount', amount: 80000,  payment_method: 'Online', transaction_id: 'TXN2506A', payment_date: '2025-08-15' },
    { tenant_id: tid, event_id: evtMap['EVT-2006'], installment_type: 'Installment 1',  amount: 120000, payment_method: 'Online', transaction_id: 'TXN2506B', payment_date: '2025-10-10' },

    { tenant_id: tid, event_id: evtMap['EVT-2007'], installment_type: 'Booking Amount', amount: 30000,  payment_method: 'Cash',   transaction_id: '',         payment_date: '2025-11-01' },
    { tenant_id: tid, event_id: evtMap['EVT-2007'], installment_type: 'Installment 1',  amount: 35000,  payment_method: 'Online', transaction_id: 'TXN2507A', payment_date: '2025-12-10' },

    { tenant_id: tid, event_id: evtMap['EVT-2008'], installment_type: 'Booking Amount', amount: 100000, payment_method: 'Online', transaction_id: 'TXN2608A', payment_date: '2025-10-20' },
    { tenant_id: tid, event_id: evtMap['EVT-2008'], installment_type: 'Installment 1',  amount: 200000, payment_method: 'Online', transaction_id: 'TXN2608B', payment_date: '2025-12-30' },

    { tenant_id: tid, event_id: evtMap['EVT-2009'], installment_type: 'Booking Amount', amount: 45000,  payment_method: 'Cash',   transaction_id: '',         payment_date: '2025-12-05' },
    { tenant_id: tid, event_id: evtMap['EVT-2009'], installment_type: 'Installment 1',  amount: 45000,  payment_method: 'Online', transaction_id: 'TXN2609A', payment_date: '2026-02-10' },

    { tenant_id: tid, event_id: evtMap['EVT-2010'], installment_type: 'Booking Amount', amount: 60000,  payment_method: 'Online', transaction_id: 'TXN2610A', payment_date: '2026-01-15' },
    { tenant_id: tid, event_id: evtMap['EVT-2010'], installment_type: 'Installment 1',  amount: 40000,  payment_method: 'Online', transaction_id: 'TXN2610B', payment_date: '2026-02-25' },

    { tenant_id: tid, event_id: evtMap['EVT-2011'], installment_type: 'Booking Amount', amount: 100000, payment_method: 'Online', transaction_id: 'TXN2611A', payment_date: '2026-03-01' },

    { tenant_id: tid, event_id: evtMap['EVT-2012'], installment_type: 'Booking Amount', amount: 80000,  payment_method: 'Online', transaction_id: 'TXN2612A', payment_date: '2026-03-10' },
  ];

  const { error: pmtErr } = await supabase.from('client_payments').insert(paymentsData);
  if (pmtErr) { console.error('❌ Failed to insert client_payments:', pmtErr.message); process.exit(1); }
  console.log(`   ✅ ${paymentsData.length} payment rows created\n`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('━'.repeat(60));
  console.log('✅  Seed complete!');
  console.log(`   Tenant ID : ${tid}`);
  console.log(`   Users     : ${users.length} (2 admins + 15 team)`);
  console.log(`   Clients   : ${clients.length}`);
  console.log(`   Events    : ${events.length} (10 past, 2 future)`);
  console.log('━'.repeat(60));
  console.log('\n💡 Cross-table members (artist + output expenses):');
  console.log('   USR-1003 Vikram Nair  — EVT-2001 (Trad Photo + Album Design)');
  console.log('   USR-1004 Priya Singh  — EVT-2001 (Cinematographer + Highlight edit)');
  console.log('   USR-1007 Neha Gupta   — EVT-2003 (Editor across both tables)');
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
