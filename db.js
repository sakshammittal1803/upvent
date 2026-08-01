import pkg from 'pg';
const { Pool } = pkg;

// Use Vercel's POSTGRES_URL or a fallback local URL
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let db;

if (!connectionString) {
    console.warn("⚠️ DATABASE_URL or POSTGRES_URL is not set! The application will not connect to the database in this environment.");
} else {
    db = new Pool({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    db.on('connect', () => {
        console.log('Connected to PostgreSQL database.');
    });

    db.on('error', (err) => {
        console.error('Unexpected error on idle PostgreSQL client', err);
        process.exit(-1);
    });

    // Initialize Database Tables
    const initDb = async () => {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            
            await client.query(`
                CREATE TABLE IF NOT EXISTS events (
                    id SERIAL PRIMARY KEY,
                    title TEXT NOT NULL,
                    organizer TEXT,
                    category TEXT,
                    source TEXT DEFAULT 'manual',
                    start_datetime TEXT,
                    end_datetime TEXT,
                    duration_hours INTEGER,
                    registration_deadline TEXT,
                    mode TEXT,
                    venue_address TEXT,
                    meeting_link TEXT,
                    registration_url TEXT,
                    status TEXT,
                    notes TEXT,
                    reminder_enabled INTEGER DEFAULT 0,
                    reminder_hours_before INTEGER,
                    metadata TEXT,
                    tags TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            await client.query(`
                CREATE TABLE IF NOT EXISTS tasks (
                    id SERIAL PRIMARY KEY,
                    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
                    label TEXT NOT NULL,
                    due_datetime TEXT,
                    is_done INTEGER DEFAULT 0
                );
            `);

            await client.query(`
                CREATE TABLE IF NOT EXISTS user_credentials (
                    id SERIAL PRIMARY KEY,
                    email TEXT NOT NULL,
                    app_password TEXT NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            
            await client.query(`
                CREATE TABLE IF NOT EXISTS users (
                    uid TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    display_name TEXT,
                    photo_url TEXT,
                    role TEXT DEFAULT 'user',
                    provider TEXT,
                    email_verified INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'active',
                    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Indexes for performance at scale
            await client.query(`CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON events(start_datetime)`);
            await client.query(`CREATE INDEX IF NOT EXISTS idx_events_category ON events(category)`);
            await client.query(`CREATE INDEX IF NOT EXISTS idx_events_status ON events(status)`);
            await client.query(`CREATE INDEX IF NOT EXISTS idx_tasks_event_id ON tasks(event_id)`);

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            console.error('Database initialization failed:', e);
        } finally {
            client.release();
        }
    };

    initDb();
}

export default db;
