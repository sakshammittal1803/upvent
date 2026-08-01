import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import db from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://lh3.googleusercontent.com"],
            connectSrc: ["'self'", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com"],
            frameSrc: ["'self'", "https://apis.google.com"]
        }
    },
    crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '1mb' })); // Prevent large payload attacks

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', apiLimiter);

// Get all events
app.get('/api/events', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    try {
        const { rows } = await db.query('SELECT * FROM events ORDER BY start_datetime ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single event by ID
app.get('/api/events/:id', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const id = req.params.id;
    try {
        const { rows } = await db.query('SELECT * FROM events WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        const row = rows[0];
        
        // fetch tasks
        const { rows: taskRows } = await db.query('SELECT * FROM tasks WHERE event_id = $1', [id]);
        row.tasks = taskRows || [];
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new event
app.post('/api/events', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const { title, organizer, category, start_datetime, end_datetime, duration_hours, registration_deadline, mode, venue_address, meeting_link, registration_url, status, notes, tags, metadata, tasks } = req.body;
    
    // Strict input validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required and must be a valid string.' });
    }
    if (start_datetime && isNaN(Date.parse(start_datetime))) {
        return res.status(400).json({ error: 'start_datetime must be a valid date string.' });
    }

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const insertQuery = `
            INSERT INTO events (title, organizer, category, start_datetime, end_datetime, duration_hours, registration_deadline, mode, venue_address, meeting_link, registration_url, status, notes, tags, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING id
        `;
        const values = [title, organizer, category, start_datetime, end_datetime, duration_hours, registration_deadline, mode, venue_address, meeting_link, registration_url, status, notes, tags ? JSON.stringify(tags) : null, metadata ? JSON.stringify(metadata) : null];
        
        const { rows } = await client.query(insertQuery, values);
        const eventId = rows[0].id;
        
        if (tasks && Array.isArray(tasks) && tasks.length > 0) {
            for (const t of tasks) {
                await client.query('INSERT INTO tasks (event_id, label, due_datetime) VALUES ($1, $2, $3)', [eventId, t.label, t.due_datetime]);
            }
        }
        
        await client.query('COMMIT');
        res.json({ id: eventId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Exception in /api/events POST:', err);
        res.status(500).json({ error: 'Internal server error while creating event.' });
    } finally {
        client.release();
    }
});

// Update an event
app.put('/api/events/:id', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const id = req.params.id;
    const { title, organizer, category, start_datetime, end_datetime, duration_hours, registration_deadline, mode, venue_address, meeting_link, registration_url, status, notes, tags, metadata } = req.body;
    
    try {
        const updateQuery = `
            UPDATE events 
            SET title = $1, organizer = $2, category = $3, start_datetime = $4, end_datetime = $5, duration_hours = $6, registration_deadline = $7, mode = $8, venue_address = $9, meeting_link = $10, registration_url = $11, status = $12, notes = $13, tags = $14, metadata = $15, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $16
        `;
        const values = [title, organizer, category, start_datetime, end_datetime, duration_hours, registration_deadline, mode, venue_address, meeting_link, registration_url, status, notes, tags ? JSON.stringify(tags) : null, metadata ? JSON.stringify(metadata) : null, id];
        
        const { rowCount } = await db.query(updateQuery, values);
        res.json({ updated: rowCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an event
app.delete('/api/events/:id', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const id = req.params.id;
    try {
        const { rowCount } = await db.query('DELETE FROM events WHERE id = $1', [id]);
        res.json({ deleted: rowCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save User Credentials (IMAP)
app.post('/api/credentials', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const { email, appPassword } = req.body;
    if (!email || !appPassword) {
        return res.status(400).json({ error: 'Email and App Password required' });
    }

    try {
        await db.query(`INSERT INTO user_credentials (email, app_password) VALUES ($1, $2)`, [email, appPassword]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error saving credentials', err);
        res.status(500).json({ error: 'Failed to save credentials' });
    }
});

// Sync Firebase User to Postgres
app.post('/api/users/sync', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const { uid, email, display_name, photo_url, provider, email_verified } = req.body;
    
    if (!uid || !email) {
        return res.status(400).json({ error: 'uid and email are required' });
    }

    try {
        const { rows } = await db.query('SELECT * FROM users WHERE uid = $1', [uid]);
        if (rows.length > 0) {
            // Update existing user
            const row = rows[0];
            await db.query(
                `UPDATE users SET display_name = $1, photo_url = $2, last_login = CURRENT_TIMESTAMP WHERE uid = $3`,
                [display_name || row.display_name, photo_url || row.photo_url, uid]
            );
            res.json({ success: true, action: 'updated' });
        } else {
            // Create new user
            await db.query(
                `INSERT INTO users (uid, email, display_name, photo_url, provider, email_verified) VALUES ($1, $2, $3, $4, $5, $6)`,
                [uid, email, display_name || null, photo_url || null, provider || 'firebase', email_verified ? 1 : 0]
            );
            res.json({ success: true, action: 'created' });
        }
    } catch (err) {
        console.error("Database error during user sync", err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Sync via IMAP
app.post('/api/sync/imap', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    try {
        // Get latest credentials
        const { rows } = await db.query('SELECT * FROM user_credentials ORDER BY id DESC LIMIT 1');
        if (rows.length === 0) {
            return res.status(401).json({ error: 'No credentials found. Please connect first.' });
        }
        
        const credRow = rows[0];
        const client = new ImapFlow({
            host: 'imap.gmail.com',
            port: 993,
            secure: true,
            auth: {
                user: credRow.email,
                pass: credRow.app_password
            },
            logger: false
        });
        
        await client.connect();
        let lock = await client.getMailboxLock('INBOX');
        const newEvents = [];
        
        try {
            const since = new Date();
            since.setDate(since.getDate() - 365);

            const searchCriteria = {
                since: since,
                or: [
                    { subject: 'hackathon' },
                    { subject: 'webinar' },
                    { subject: 'event' }
                ]
            };

            const uids = await client.search(searchCriteria);
            
            if (uids && uids.length > 0) {
                const limitUids = uids.slice(-20);
                for await (let message of client.fetch(limitUids, { source: true })) {
                    const parsed = await simpleParser(message.source);
                    const subject = parsed.subject || 'Unknown Event';
                    const from = parsed.from?.text || 'Unknown Organizer';

                    const title = subject.replace(/^(Fwd|Re):\s*/i, '').trim();
                    const organizer = from.split('<')[0].trim();
                    const category = subject.toLowerCase().includes('hackathon') ? 'Hackathon' : 
                                     subject.toLowerCase().includes('webinar') ? 'Webinar' : 'Event';

                    newEvents.push({
                        title,
                        organizer,
                        category,
                        source: 'Gmail',
                        start_datetime: new Date().toISOString(),
                        mode: 'online',
                        status: 'Registered'
                    });
                }
            }

            // Save extracted events
            for (let e of newEvents) {
                await db.query(
                    `INSERT INTO events (title, organizer, category, source, start_datetime, mode, status) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [e.title, e.organizer, e.category, e.source, e.start_datetime, e.mode, e.status]
                );
            }

        } finally {
            lock.release();
        }

        await client.logout();
        res.json({ success: true, count: newEvents.length, events: newEvents });

    } catch (error) {
        console.error('IMAP Error', error);
        res.status(500).json({ error: 'Failed to sync emails. Check app password.' });
    }
});

// Mock Sync for other connected platforms (historical data)
app.post('/api/sync/mock/:platform', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const platform = req.params.platform;
    const pastDate1 = new Date();
    pastDate1.setDate(pastDate1.getDate() - 150); // 5 months ago
    const pastDate2 = new Date();
    pastDate2.setDate(pastDate2.getDate() - 45); // 1.5 months ago

    const mockEvents = [
        {
            title: `Historical ${platform} Event 1`,
            organizer: platform,
            category: 'Hackathon',
            source: platform,
            start_datetime: pastDate1.toISOString(),
            mode: 'online',
            status: 'Registered'
        },
        {
            title: `Historical ${platform} Event 2`,
            organizer: platform,
            category: 'Webinar',
            source: platform,
            start_datetime: pastDate2.toISOString(),
            mode: 'offline',
            status: 'Registered'
        }
    ];

    try {
        for (let e of mockEvents) {
            await db.query(
                `INSERT INTO events (title, organizer, category, source, start_datetime, mode, status) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [e.title, e.organizer, e.category, e.source, e.start_datetime, e.mode, e.status]
            );
        }
        res.json({ success: true, count: mockEvents.length, events: mockEvents });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// AI Extraction Route
import { GoogleGenAI, Type } from '@google/genai';
app.post('/api/extract-event', async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Text is required' });

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(503).json({ 
                error: 'GEMINI_API_KEY is not configured in the backend. Please add it to your .env file to enable AI Extraction.',
                needsKey: true
            });
        }

        const ai = new GoogleGenAI({ apiKey });
        
        const schema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, confidence: { type: Type.INTEGER } } },
                description: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, confidence: { type: Type.INTEGER } } },
                category: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, confidence: { type: Type.INTEGER } } },
                organizer: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, confidence: { type: Type.INTEGER } } },
                venue_address: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, confidence: { type: Type.INTEGER } } },
                start_datetime: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, confidence: { type: Type.INTEGER } } },
                end_datetime: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, confidence: { type: Type.INTEGER } } },
                registration_deadline: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, confidence: { type: Type.INTEGER } } },
                mode: { type: Type.OBJECT, properties: { value: { type: Type.STRING, enum: ['online', 'offline'] }, confidence: { type: Type.INTEGER } } },
                meeting_link: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, confidence: { type: Type.INTEGER } } },
                registration_url: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, confidence: { type: Type.INTEGER } } },
                tags: { type: Type.OBJECT, properties: { value: { type: Type.ARRAY, items: { type: Type.STRING } }, confidence: { type: Type.INTEGER } } },
                metadata: { 
                    type: Type.OBJECT, 
                    properties: { 
                        contact_person: { type: Type.STRING },
                        contact_number: { type: Type.STRING },
                        email: { type: Type.STRING },
                        speaker: { type: Type.STRING },
                        prize_pool: { type: Type.STRING },
                        eligibility: { type: Type.STRING },
                        social_links: { type: Type.ARRAY, items: { type: Type.STRING } }
                    } 
                }
            }
        };

        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: `You are an expert event data extraction assistant. Parse the following unstructured text into the exact requested JSON schema.
For datetimes, parse them accurately (e.g. "Tomorrow at 10am", "Next Friday") and return valid ISO 8601 strings (YYYY-MM-DDTHH:mm:ss.sssZ). Assume current year is ${new Date().getFullYear()} if missing.
For category, classify intelligently (e.g. Hackathon, Webinar, Workshop, Seminar).
For every core field, provide the extracted string 'value' and a 'confidence' score from 0-100 based on how certain you are.
For metadata, just extract the string values without confidence scores.
If you cannot extract a field, omit it or return null.

Text to parse:
"""
${text}
"""`,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.1,
            }
        });

        const result = JSON.parse(response.text);
        res.json({ success: true, data: result });
    } catch (err) {
        console.error('AI Extraction Error:', err);
        next(err);
    }
});

// Duplicate Detection Route
app.post('/api/events/check-duplicate', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const { title, start_datetime } = req.body;
    if (!title) return res.json({ duplicate: false });

    try {
        const { rows } = await db.query('SELECT * FROM events WHERE title ILIKE $1 OR start_datetime = $2', [`%${title}%`, start_datetime]);
        if (rows && rows.length > 0) {
            res.json({ duplicate: true, existingEvent: rows[0] });
        } else {
            res.json({ duplicate: false });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve frontend in local dev (ignored on Vercel via vercel.json rewrites)
app.use(express.static(path.join(__dirname, 'dist')));

app.use((req, res, _next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, _next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ 
        error: 'An unexpected internal server error occurred.',
        message: process.env.NODE_ENV === 'production' ? 'Server Error' : err.message
    });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

// Export for Vercel Serverless Functions
export default app;
