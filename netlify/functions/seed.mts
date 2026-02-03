import type { Context } from '@netlify/functions';
import { getDb, jsonResponse, errorResponse, corsHeaders } from './db.mts';

export default async function handler(req: Request, _context: Context) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (req.method !== 'POST') {
    return errorResponse('POST required. Send POST to /api/seed to initialize the database.', 405);
  }

  const sql = getDb();

  try {
    // ── Create tables ──
    await sql`
      CREATE TABLE IF NOT EXISTS quarters (
        id SERIAL PRIMARY KEY,
        name VARCHAR(10) NOT NULL,
        theme VARCHAR(100) NOT NULL,
        pathway VARCHAR(50) NOT NULL,
        study VARCHAR(100) NOT NULL,
        focus VARCHAR(100) NOT NULL,
        scripture VARCHAR(50) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        color VARCHAR(20) NOT NULL,
        color_hex VARCHAR(10) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        date DATE NOT NULL,
        end_date DATE,
        status VARCHAR(20) NOT NULL DEFAULT 'draft'
          CHECK (status IN ('confirmed', 'pending', 'draft', 'needs-sponsor', 'completed', 'cancelled')),
        ministry VARCHAR(50),
        description TEXT,
        budget INTEGER,
        sponsor VARCHAR(100),
        category VARCHAR(20)
          CHECK (category IN ('worship', 'prayer', 'youth', 'fellowship', 'training', 'meetings', 'guest', 'special')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_events_date ON events(date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_events_status ON events(status)`;

    // ── Check if data already exists ──
    const existing = await sql`SELECT COUNT(*) as count FROM quarters`;
    if (Number(existing[0].count) > 0) {
      return jsonResponse({ message: 'Database already seeded', tables_created: true, seeded: false });
    }

    // ── Seed quarters ──
    await sql`
      INSERT INTO quarters (name, theme, pathway, study, focus, scripture, start_date, end_date, color, color_hex) VALUES
      ('Q1', 'Witness Pathway', 'Witness', 'Book of Philippians', 'Partnership in the Gospel', 'Acts 2:41', '2026-01-01', '2026-03-31', 'emerald', '#E2EFDA'),
      ('Q2', 'Bible Pathway', 'Bible', 'Expository Preaching', 'Essence of God''s Word', 'Acts 2:42', '2026-04-01', '2026-06-30', 'blue', '#DDEBF7'),
      ('Q3', 'Care Pathway', 'Care/Neighbour', 'Workshop (TBD)', 'Body Ministry', 'Acts 2:44-46', '2026-07-01', '2026-09-30', 'amber', '#FFF2CC'),
      ('Q4', 'Freedom & Justice Pathway', 'Freedom & Justice', 'Workshop (TBD)', 'Social Concern', 'Acts 2:47', '2026-10-01', '2026-12-31', 'orange', '#FCE4D6')
    `;

    // ── Seed events ──
    await sql`
      INSERT INTO events (title, date, status, ministry, description, budget, category) VALUES
      ('New Year Prayer Service', '2026-01-04', 'confirmed', 'Worship', 'New Year prayer and dedication service', NULL, 'worship'),
      ('Corporate Prayer Breakfast', '2026-01-03', 'confirmed', 'Prayer', '1st Saturday corporate prayer breakfast', NULL, 'prayer'),
      ('Women Fellowship', '2026-01-03', 'confirmed', 'Women', '1st Saturday women''s fellowship gathering', NULL, 'fellowship'),
      ('Communion Service', '2026-01-04', 'confirmed', 'Worship', '1st Sunday communion service', NULL, 'worship'),
      ('Mission Spot Sunday', '2026-01-11', 'confirmed', 'Missions', '2nd Sunday mission spotlight', NULL, 'worship'),
      ('Youth Alive Fellowship', '2026-01-16', 'confirmed', 'Youth', 'Friday youth fellowship', NULL, 'youth'),
      ('Planning Meeting', '2026-01-24', 'confirmed', 'Admin', 'Year kickoff planning meeting', NULL, 'meetings'),
      ('Guest Speaker Sunday', '2026-01-25', 'confirmed', 'Worship', '4th Sunday guest speaker', NULL, 'guest'),
      ('Combined Service / Communion', '2026-02-01', 'confirmed', 'Worship', '1st Sunday combined service with communion', NULL, 'worship'),
      ('Friday Night Prayer & Breakfast', '2026-02-06', 'confirmed', 'Prayer', '1st Friday night prayer and breakfast', NULL, 'prayer'),
      ('Corporate Prayer Breakfast', '2026-02-07', 'confirmed', 'Prayer', '1st Saturday corporate prayer breakfast', NULL, 'prayer'),
      ('Women Fellowship', '2026-02-07', 'confirmed', 'Women', '1st Saturday women''s fellowship', NULL, 'fellowship'),
      ('Doulos Service', '2026-02-08', 'confirmed', 'Worship', 'Doulos Service - Psalm 8:1 focus', NULL, 'special'),
      ('Pastor Break Begins', '2026-02-09', 'confirmed', 'Admin', 'Pastor break period begins (Feb 9-20)', NULL, 'meetings'),
      ('Mission Spot Sunday', '2026-02-08', 'confirmed', 'Missions', '2nd Sunday mission spotlight', NULL, 'worship'),
      ('YWAM Thomas Webber', '2026-02-16', 'confirmed', 'Worship', 'Guest preacher - YWAM Thomas Webber during pastor break', NULL, 'guest'),
      ('Pastor Break Ends', '2026-02-20', 'confirmed', 'Admin', 'Pastor break period ends', NULL, 'meetings'),
      ('KYB Workers Training', '2026-02-21', 'confirmed', 'Training', '3rd week KYB workers training', NULL, 'training'),
      ('Church Board Meeting', '2026-02-28', 'confirmed', 'Admin', '4th week church board meeting', NULL, 'meetings'),
      ('Combined Service / Communion', '2026-03-01', 'confirmed', 'Worship', '1st Sunday combined service with communion', NULL, 'worship'),
      ('Corporate Prayer Breakfast', '2026-03-07', 'confirmed', 'Prayer', '1st Saturday corporate prayer breakfast', NULL, 'prayer'),
      ('Women Fellowship', '2026-03-07', 'confirmed', 'Women', '1st Saturday women''s fellowship', NULL, 'fellowship'),
      ('KYB Workers Training', '2026-03-21', 'confirmed', 'Training', '3rd week KYB workers training', NULL, 'training'),
      ('Church Board Meeting', '2026-03-28', 'confirmed', 'Admin', '4th week church board meeting', NULL, 'meetings'),
      ('Q1 Full Breakfast', '2026-03-28', 'needs-sponsor', 'Fellowship', 'Quarter 1 full breakfast celebration - Partnership in the Gospel theme. Sponsorship needed.', 800, 'fellowship'),
      ('Passion Week - Day 1', '2026-04-13', 'pending', 'Worship', 'Holy Week observance begins (dates TBC with Pastor)', NULL, 'special'),
      ('Passion Week - Day 2', '2026-04-14', 'pending', 'Worship', 'Holy Week observance continues', NULL, 'special'),
      ('Passion Week - Day 3', '2026-04-15', 'pending', 'Worship', 'Holy Week observance continues', NULL, 'special'),
      ('Passion Week - Day 4', '2026-04-16', 'pending', 'Worship', 'Holy Week observance continues', NULL, 'special'),
      ('Good Friday Service', '2026-04-17', 'pending', 'Worship', 'Good Friday service and reflection', 300, 'special'),
      ('Easter Sunday', '2026-04-20', 'confirmed', 'Worship', 'Resurrection Sunday celebration', 2000, 'special'),
      ('Church Board Meeting', '2026-04-25', 'pending', 'Admin', '4th week church board meeting', NULL, 'meetings'),
      ('Combined Service / Communion', '2026-05-03', 'confirmed', 'Worship', '1st Sunday combined service with communion', NULL, 'worship'),
      ('Mother''s Day Service', '2026-05-10', 'confirmed', 'Worship', 'Special Mother''s Day service', 400, 'special'),
      ('Mission Spot Sunday', '2026-05-10', 'confirmed', 'Missions', '2nd Sunday mission spotlight', NULL, 'worship'),
      ('Community Outreach', '2026-05-16', 'confirmed', 'Evangelism', 'Community evangelism outreach', NULL, 'fellowship'),
      ('Church Board Meeting', '2026-05-30', 'pending', 'Admin', '4th week church board meeting', NULL, 'meetings'),
      ('Combined Service / Communion', '2026-06-07', 'draft', 'Worship', '1st Sunday combined service with communion', NULL, 'worship'),
      ('Father''s Day Service', '2026-06-21', 'draft', 'Worship', 'Special Father''s Day service', 400, 'special'),
      ('Q2 Full Breakfast', '2026-06-27', 'needs-sponsor', 'Fellowship', 'Quarter 2 full breakfast celebration - Essence of God''s Word theme. Sponsorship needed.', 800, 'fellowship'),
      ('Church Board Meeting', '2026-06-27', 'draft', 'Admin', '4th week church board meeting', NULL, 'meetings'),
      ('Family Church Camp', '2026-07-06', 'needs-sponsor', 'Fellowship', 'Annual family church camp during school holidays', 5000, 'fellowship'),
      ('Independence Day Service', '2026-07-05', 'draft', 'Worship', 'National day celebration service', NULL, 'worship'),
      ('Church Board Meeting', '2026-07-25', 'draft', 'Admin', '4th week church board meeting', NULL, 'meetings'),
      ('Combined Service / Communion', '2026-08-02', 'draft', 'Worship', '1st Sunday combined service with communion', NULL, 'worship'),
      ('VBS Week', '2026-08-03', 'needs-sponsor', 'Education', 'Vacation Bible School', 2500, 'training'),
      ('Church Board Meeting', '2026-08-29', 'draft', 'Admin', '4th week church board meeting', NULL, 'meetings'),
      ('Church Anniversary', '2026-09-13', 'pending', 'Admin', 'Church anniversary celebration', 5000, 'special'),
      ('Q3 Full Breakfast', '2026-09-26', 'needs-sponsor', 'Fellowship', 'Quarter 3 full breakfast celebration - Compassion & Care theme. Sponsorship needed.', 800, 'fellowship'),
      ('Church Board Meeting', '2026-09-26', 'draft', 'Admin', '4th week church board meeting', NULL, 'meetings'),
      ('Combined Service / Communion', '2026-10-04', 'draft', 'Worship', '1st Sunday combined service with communion', NULL, 'worship'),
      ('Harvest Festival', '2026-10-18', 'pending', 'Hospitality', 'Annual harvest thanksgiving', 2000, 'fellowship'),
      ('Church Board Meeting', '2026-10-31', 'draft', 'Admin', '4th week church board meeting', NULL, 'meetings'),
      ('Combined Service / Communion', '2026-11-01', 'draft', 'Worship', '1st Sunday combined service with communion', NULL, 'worship'),
      ('Church Board Meeting', '2026-11-28', 'draft', 'Admin', '4th week church board meeting', NULL, 'meetings'),
      ('Christmas Concert', '2026-12-20', 'draft', 'Worship', 'Annual Christmas concert', 3000, 'special'),
      ('Christmas Day Service', '2026-12-25', 'confirmed', 'Worship', 'Christmas Day worship service', 1000, 'special'),
      ('Q4 Full Breakfast', '2026-12-27', 'needs-sponsor', 'Fellowship', 'Quarter 4 full breakfast celebration - Freedom & Justice theme. Sponsorship needed.', 800, 'fellowship')
    `;

    return jsonResponse({
      message: 'Database initialized and seeded successfully',
      tables_created: true,
      seeded: true,
      events_count: 58,
      quarters_count: 4,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to seed database',
      500
    );
  }
}
