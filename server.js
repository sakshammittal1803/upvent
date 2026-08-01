import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
let db = null;
let dbInitError = null;
try {
    if (getApps().length === 0) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Some hosting providers escape newlines, others don't.
                privateKey: process.env.FIREBASE_PRIVATE_KEY 
                    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '')
                    : undefined,
            })
        });
    }
    db = getFirestore();
    console.log("Firebase Admin initialized successfully.");
} catch (error) {
    dbInitError = error.message;
    console.error('CRITICAL: Firebase Admin Initialization Error:', error.message);
}

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
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', apiLimiter);

// ---------------------------------------------------------
// API ROUTES (Firebase Firestore)
// ---------------------------------------------------------

// Database Check Middleware
app.use('/api', (req, res, next) => {
    if (!db) {
        return res.status(500).json({ 
            error: `Firebase Admin Init Error: ${dbInitError}. Please check Vercel Environment Variables.` 
        });
    }
    next();
});

// Get all events
app.get('/api/events', async (req, res) => {
    try {
        const snapshot = await db.collection('events').orderBy('start_datetime', 'asc').get();
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single event by ID
app.get('/api/events/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const doc = await db.collection('events').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Event not found' });
        }
        const row = { id: doc.id, ...doc.data() };
        
        // fetch tasks
        const tasksSnapshot = await db.collection('tasks').where('event_id', '==', id).get();
        row.tasks = tasksSnapshot.docs.map(t => ({ id: t.id, ...t.data() }));
        
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new event
app.post('/api/events', async (req, res) => {
    const { title, organizer, category, start_datetime, end_datetime, duration_hours, registration_deadline, mode, venue_address, meeting_link, registration_url, status, notes, tags, metadata, tasks } = req.body;
    
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required and must be a valid string.' });
    }
    if (start_datetime && isNaN(Date.parse(start_datetime))) {
        return res.status(400).json({ error: 'start_datetime must be a valid date string.' });
    }

    try {
        const eventRef = await db.collection('events').add({
            title, organizer, category, start_datetime, end_datetime, duration_hours, registration_deadline, mode, venue_address, meeting_link, registration_url, status, notes, tags: tags || [], metadata: metadata || {},
            created_at: FieldValue.serverTimestamp(),
            updated_at: FieldValue.serverTimestamp()
        });
        
        const eventId = eventRef.id;
        
        if (tasks && Array.isArray(tasks) && tasks.length > 0) {
            const batch = db.batch();
            tasks.forEach(t => {
                const taskRef = db.collection('tasks').doc();
                batch.set(taskRef, {
                    event_id: eventId,
                    label: t.label,
                    due_datetime: t.due_datetime,
                    is_done: 0
                });
            });
            await batch.commit();
        }
        
        res.json({ id: eventId });
    } catch (err) {
        console.error('Exception in /api/events POST:', err);
        res.status(500).json({ error: 'Internal server error while creating event.' });
    }
});

// Update an event
app.put('/api/events/:id', async (req, res) => {
    const id = req.params.id;
    const { title, organizer, category, start_datetime, end_datetime, duration_hours, registration_deadline, mode, venue_address, meeting_link, registration_url, status, notes, tags, metadata } = req.body;
    
    try {
        await db.collection('events').doc(id).update({
            title, organizer, category, start_datetime, end_datetime, duration_hours, registration_deadline, mode, venue_address, meeting_link, registration_url, status, notes, tags: tags || [], metadata: metadata || {},
            updated_at: FieldValue.serverTimestamp()
        });
        res.json({ updated: 1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an event
app.delete('/api/events/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await db.collection('events').doc(id).delete();
        
        // Delete associated tasks
        const tasksSnapshot = await db.collection('tasks').where('event_id', '==', id).get();
        if (!tasksSnapshot.empty) {
            const batch = db.batch();
            tasksSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }
        
        res.json({ deleted: 1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save User Credentials (IMAP)
app.post('/api/credentials', async (req, res) => {
    const { email, appPassword } = req.body;
    if (!email || !appPassword) {
        return res.status(400).json({ error: 'Email and App Password required' });
    }

    try {
        await db.collection('user_credentials').add({
            email, 
            app_password: appPassword,
            updated_at: FieldValue.serverTimestamp()
        });
        res.json({ success: true });
    } catch (err) {
        console.error('Error saving credentials', err);
        res.status(500).json({ error: 'Failed to save credentials' });
    }
});

// Sync Firebase User to DB
app.post('/api/users/sync', async (req, res) => {
    const { uid, email, display_name, photo_url, provider, email_verified } = req.body;
    
    if (!uid || !email) {
        return res.status(400).json({ error: 'uid and email are required' });
    }

    try {
        const userRef = db.collection('users').doc(uid);
        const doc = await userRef.get();
        
        if (doc.exists) {
            await userRef.update({
                display_name: display_name || doc.data().display_name,
                photo_url: photo_url || doc.data().photo_url,
                last_login: FieldValue.serverTimestamp()
            });
            res.json({ success: true, action: 'updated' });
        } else {
            await userRef.set({
                email,
                display_name: display_name || null,
                photo_url: photo_url || null,
                provider: provider || 'firebase',
                email_verified: email_verified ? 1 : 0,
                status: 'active',
                last_login: FieldValue.serverTimestamp(),
                created_at: FieldValue.serverTimestamp()
            });
            res.json({ success: true, action: 'created' });
        }
    } catch (err) {
        console.error("Database error during user sync", err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Sync via IMAP
app.post('/api/sync/imap', async (req, res) => {
    try {
        const snapshot = await db.collection('user_credentials').orderBy('updated_at', 'desc').limit(1).get();
        if (snapshot.empty) {
            return res.status(401).json({ error: 'No credentials found. Please connect first.' });
        }
        
        const credRow = snapshot.docs[0].data();
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
                        status: 'Registered',
                        created_at: FieldValue.serverTimestamp()
                    });
                }
            }

            // Save extracted events to Firestore
            if (newEvents.length > 0) {
                const batch = db.batch();
                newEvents.forEach(e => {
                    const eventRef = db.collection('events').doc();
                    batch.set(eventRef, e);
                });
                await batch.commit();
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
    const platform = req.params.platform;
    const pastDate1 = new Date();
    pastDate1.setDate(pastDate1.getDate() - 150);
    const pastDate2 = new Date();
    pastDate2.setDate(pastDate2.getDate() - 45);

    const mockEvents = [
        {
            title: `Historical ${platform} Event 1`,
            organizer: platform,
            category: 'Hackathon',
            source: platform,
            start_datetime: pastDate1.toISOString(),
            mode: 'online',
            status: 'Registered',
            created_at: FieldValue.serverTimestamp()
        },
        {
            title: `Historical ${platform} Event 2`,
            organizer: platform,
            category: 'Webinar',
            source: platform,
            start_datetime: pastDate2.toISOString(),
            mode: 'offline',
            status: 'Registered',
            created_at: FieldValue.serverTimestamp()
        }
    ];

    try {
        const batch = db.batch();
        mockEvents.forEach(e => {
            const eventRef = db.collection('events').doc();
            batch.set(eventRef, e);
        });
        await batch.commit();
        
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
    const { title, start_datetime } = req.body;
    if (!title) return res.json({ duplicate: false });

    try {
        // Query by start_datetime as primary filter for NoSQL efficiency
        let snapshot;
        if (start_datetime) {
            snapshot = await db.collection('events').where('start_datetime', '==', start_datetime).get();
        } else {
            // Fallback: check recent events
            snapshot = await db.collection('events').orderBy('created_at', 'desc').limit(50).get();
        }
        
        const docs = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
        
        // In-memory filter for title similarity (since NoSQL lacks ILIKE)
        const duplicate = docs.find(e => e.title && e.title.toLowerCase().includes(title.toLowerCase()));

        if (duplicate) {
            res.json({ duplicate: true, existingEvent: duplicate });
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
