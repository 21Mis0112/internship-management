import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { setupAutoSync } from './excel-sync.js';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'super_secret_key_change_me_in_prod';

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Database Setup
const db = new Database('internship_v3.db', { verbose: console.log });
db.pragma('journal_mode = WAL');

// Initialize Schema
const initDb = () => {
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin'
    );
  `);

    // Updated Schema based on user request (UNIQUE intern_id)
    db.exec(`
    CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      intern_id TEXT UNIQUE,
      name TEXT NOT NULL,
      college TEXT,
      department TEXT,
      year TEXT,
      start_date TEXT,
      end_date TEXT,
      phone TEXT,
      email TEXT,
      status TEXT DEFAULT 'Applied',
      mentor TEXT,
      referred_by TEXT,
      qualification TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

    db.exec(`
    CREATE TABLE IF NOT EXISTS extensions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id INTEGER,
      old_end_date TEXT,
      new_end_date TEXT,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(candidate_id) REFERENCES candidates(id)
    );
  `);

    const admin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
    if (!admin) {
        const hash = bcrypt.hashSync('admin123', 10);
        db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', hash);
        console.log('Default admin user created: admin / admin123');
    }

    try {
        db.prepare('ALTER TABLE candidates ADD COLUMN qualification TEXT').run();
        console.log('Added qualification column to candidates table');
    } catch (err) {
        // Column likely already exists
    }

    // Add source column for smart sync (manual vs sheet)
    try {
        db.prepare('ALTER TABLE candidates ADD COLUMN source TEXT DEFAULT "manual"').run();
        console.log('Added source column to candidates table');
        // Mark existing records as from sheet
        db.prepare('UPDATE candidates SET source = "sheet" WHERE source IS NULL').run();
        console.log('Updated existing candidates with source=sheet');
    } catch (err) {
        // Column likely already exists
    }
};

initDb();

// Set up Excel auto-sync (syncs on startup and every 5 minutes)
setupAutoSync(db);

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}
const upload = multer({ dest: 'uploads/' });

// Routes

// Root endpoint - API status
app.get('/', (req, res) => {
    res.json({
        message: 'Internship Management System API',
        status: 'running',
        version: '3.0',
        endpoints: {
            auth: '/api/auth/login',
            candidates: '/api/candidates',
            analytics: '/api/analytics'
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '8h' });
    res.json({ token, user: { username: user.username, role: user.role } });
});

app.post('/api/auth/update-password', (req, res) => {
    const { username, oldPassword, newPassword } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user || !bcrypt.compareSync(oldPassword, user.password)) {
        return res.status(401).json({ error: 'Invalid current password' });
    }

    const hash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE username = ?').run(hash, username);
    res.json({ message: 'Password updated successfully' });
});

// Get Distinct Statuses
app.get('/api/candidates/statuses', (req, res) => {
    try {
        const statuses = db.prepare('SELECT DISTINCT status FROM candidates WHERE status IS NOT NULL ORDER BY status').all();
        res.json(statuses.map(s => s.status));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Analytics Data
app.get('/analytics', (req, res) => {
    try {
        // Status Distribution - Calculate based on end_date
        const statusData = db.prepare(`
            SELECT
                CASE
                    WHEN end_date IS NOT NULL AND end_date != '' AND DATE(end_date) < DATE('now') THEN 'COMPLETED'
                    WHEN end_date IS NOT NULL AND end_date != '' AND DATE(end_date) >= DATE('now') THEN 'ACTIVE'
                    ELSE UPPER(status)
                END as status,
                COUNT(*) as count
            FROM candidates
            GROUP BY status
            ORDER BY count DESC
        `).all();

        // Yearly Distribution (from start_date)
        const yearData = db.prepare(`
            SELECT 
                CAST(SUBSTR(start_date, 1, 4) AS INTEGER) as year,
                COUNT(*) as count
            FROM candidates 
            WHERE start_date IS NOT NULL AND start_date != ''
            GROUP BY year
            ORDER BY year
        `).all();

        // Department Distribution
        const deptData = db.prepare(`
            SELECT department, COUNT(*) as count 
            FROM candidates 
            WHERE department IS NOT NULL AND department != '' AND department != 'NIL'
            GROUP BY department
            ORDER BY count DESC
            LIMIT 10
        `).all();

        // College Distribution
        const collegeData = db.prepare(`
            SELECT college, COUNT(*) as count 
            FROM candidates 
            WHERE college IS NOT NULL AND college != '' AND college != 'NIL'
            GROUP BY college
            ORDER BY count DESC
            LIMIT 10
        `).all();

        // Monthly Trends (last 12 months based on created_at)
        const monthlyData = db.prepare(`
            SELECT 
                STRFTIME('%Y-%m', created_at) as month,
                COUNT(*) as count
            FROM candidates
            WHERE created_at IS NOT NULL
            GROUP BY month
            ORDER BY month DESC
            LIMIT 12
        `).all().reverse();

        res.json({
            statusDistribution: statusData,
            yearlyTrends: yearData,
            departmentBreakdown: deptData,
            collegeDistribution: collegeData,
            monthlyTrends: monthlyData
        });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Candidates List
app.get('/api/candidates', (req, res) => {
    const { status, college, search, year, department } = req.query;
    let query = 'SELECT * FROM candidates WHERE 1=1';
    const params = [];

    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }
    if (year) {
        query += ' AND start_date LIKE ?';
        params.push(`${year}%`);
    }
    if (college) {
        query += ' AND college LIKE ?';
        params.push(`%${college}%`);
    }
    if (department) {
        query += ' AND department LIKE ?';
        params.push(`%${department}%`);
    }
    if (search) {
        if (search.toUpperCase().startsWith('INT')) {
            // Strict Intern ID search if it looks like an ID
            query += ' AND intern_id LIKE ?';
            params.push(`%${search}%`);
        } else {
            // General search
            query += ' AND (name LIKE ? OR email LIKE ? OR intern_id LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
    }

    query += ' ORDER BY created_at DESC';
    const candidates = db.prepare(query).all(...params);
    res.json(candidates);
});

// Export Excel - MUST be before :id route
app.get('/api/candidates/export', (req, res) => {
    const candidates = db.prepare('SELECT * FROM candidates').all();
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(candidates);
    XLSX.utils.book_append_sheet(wb, ws, 'Candidates');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="candidates_export.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
});

// Get Single Candidate
app.get('/api/candidates/:id', (req, res) => {
    const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json(candidate);
});

// Create Candidate
app.post('/api/candidates', (req, res) => {
    const {
        intern_id, name, college, department, start_date, end_date,

        phone, email, status, mentor, referred_by, qualification
    } = req.body;

    // Derive year from start_date
    let derivedYear = req.body.year;
    if (start_date) {
        // Handle both YYYY-MM-DD and DD-MM-YYYY formats
        const parts = start_date.split('-');
        if (parts.length === 3) {
            // If first part is 4 digits, it's YYYY-MM-DD
            if (parts[0].length === 4) {
                derivedYear = parts[0];
            }
            // If last part is 4 digits, it's DD-MM-YYYY
            else if (parts[2].length === 4) {
                derivedYear = parts[2];
            }
        }
    }

    console.log('Manual Candidate Creation:', {
        intern_id, name, college, department, derivedYear, start_date, end_date,
        phone, email, status, mentor, referred_by, qualification
    });

    try {
        const stmt = db.prepare(`
      INSERT INTO candidates (
        intern_id, name, college, department, year, start_date, end_date, 
        phone, email, status, mentor, referred_by, qualification, source
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual')
    `);
        // Convert empty string to null for intern_id to avoid UNIQUE constraint issues
        const finalInternId = intern_id && intern_id.trim() !== '' ? intern_id : null;

        const info = stmt.run(
            finalInternId, name, college, department, derivedYear, start_date, end_date,
            phone, email, status || 'Active', mentor, referred_by, qualification
        );
        console.log('Candidate created successfully with ID:', info.lastInsertRowid);
        res.json({ id: info.lastInsertRowid, ...req.body });
    } catch (err) {
        console.error('Error creating candidate:', err.message);

        // Provide user-friendly error messages
        if (err.message.includes('UNIQUE constraint failed: candidates.intern_id')) {
            res.status(400).json({
                error: `This Intern ID "${intern_id}" already exists in the database. Please use a different Intern ID or leave it blank.`
            });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

// Import Excel
app.post('/api/candidates/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        // Normalize keys to lowercase and trim
        const normalizedData = data.map(row => {
            const newRow = {};
            for (const key of Object.keys(row)) {
                newRow[key.trim().toLowerCase()] = row[key];
            }
            return newRow;
        });

        console.log('Excel Upload Debug:', {
            filename: req.file.originalname,
            rowCount: data.length,
            firstRowOriginal: data.length > 0 ? data[0] : {},
            firstRowNormalized: normalizedData.length > 0 ? normalizedData[0] : {}
        });
        if (normalizedData.length > 0) {
            console.log('ALL AVAILABLE KEYS:', Object.keys(normalizedData[0]));
        }

        const stmt = db.prepare(`
      INSERT INTO candidates (
        intern_id, name, college, department, year, start_date, end_date, 
        phone, email, status, mentor, referred_by, qualification, source
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sheet')
      ON CONFLICT(intern_id) DO UPDATE SET
        name=excluded.name,
        college=excluded.college,
        department=excluded.department,
        year=excluded.year,
        start_date=excluded.start_date,
        end_date=excluded.end_date,
        phone=excluded.phone,
        email=excluded.email,
        status=excluded.status,
        mentor=excluded.mentor,
        referred_by=excluded.referred_by,
        qualification=excluded.qualification,
        source='sheet'
    `);

        const insertMany = db.transaction((candidates) => {
            let addedCount = 0;
            for (const c of candidates) {
                // Date converter: handles Excel serial dates and DD-MM-YYYY format
                const excelDate = (val) => {
                    if (!val) return "";

                    // Handle Excel serial date (number)
                    if (typeof val === 'number') {
                        return new Date(Math.round((val - 25569) * 86400 * 1000)).toISOString().split('T')[0];
                    }

                    // Handle DD-MM-YYYY format (convert to YYYY-MM-DD)
                    if (typeof val === 'string' && val.includes('-')) {
                        const parts = val.split('-');
                        if (parts.length === 3) {
                            // Check if it's DD-MM-YYYY (day is first)
                            if (parts[0].length <= 2 && parts[2].length === 4) {
                                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                            }
                        }
                    }

                    return val;
                };

                // Helper to find value from multiple possible keys
                const getVal = (keys) => {
                    for (const key of keys) {
                        if (c[key] !== undefined && c[key] !== "") return c[key];
                    }
                    return null;
                };

                const internId = getVal(['internilid', 'id no.', 'intern id', 'id', 's.no', 'no.', 's.no.']);
                const name = getVal(['name', 'full name', 'candidate name']);
                const college = getVal(['college name', 'collage name', 'college']);
                const dept = getVal(['department', 'dept', 'course']);
                const start = excelDate(getVal(['starting date', 'trainingnilfrom', 'training from', 'training starting date', 'start date']));
                const end = excelDate(getVal(['ending date', 'training to', 'end date']));

                // DATA CLEANING: Derive Year from Start Date if possible
                let year = getVal(['year', 'batch', 'student year']);
                if (start) {
                    // Extract year from YYYY-MM-DD format (after conversion)
                    year = start.split('-')[0];
                }

                const phone = getVal(['phone no', 'phone', 'contact no', 'mobile']);
                const email = getVal(['mail id', 'email', 'email id']);
                const status = getVal(['status']) || 'Active';
                const mentor = getVal(['mentor']);
                const ref = getVal(['referred by', 'refered by']);
                const qual = getVal(['qualification', 'qual', 'degree']);

                if (internId && name) {
                    const info = stmt.run(internId, name, college, dept, year, start, end, phone, email, status, mentor, ref, qual);
                    addedCount += info.changes;
                } else {
                    if (candidates.indexOf(c) < 5) {
                        console.log('Skipping row due to missing ID or Name:', JSON.stringify(c));
                        console.log('Detected InternID:', internId, 'Name:', name);
                    }
                }
            }
            return addedCount;
        });

        const count = insertMany(normalizedData);
        res.json({ message: `Successfully imported ${count} candidates (${data.length - count} skipped as duplicates or missing ID)` });
    } catch (err) {
        console.error('Upload Error Details:', err.code, err.message);
        res.status(500).json({ error: 'Database Error: ' + err.message });
    }
});

// Export Excel
app.get('/api/candidates/export', (req, res) => {
    const candidates = db.prepare('SELECT * FROM candidates').all();
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(candidates);
    XLSX.utils.book_append_sheet(wb, ws, 'Candidates');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="candidates_export.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
});

// Extension
app.post('/api/candidates/:id/extend', (req, res) => {
    const { id } = req.params;
    const { new_end_date, reason } = req.body;

    const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const update = db.transaction(() => {
        db.prepare('INSERT INTO extensions (candidate_id, old_end_date, new_end_date, reason) VALUES (?, ?, ?, ?)').run(id, candidate.end_date, new_end_date, reason);
        db.prepare('UPDATE candidates SET end_date = ? WHERE id = ?').run(new_end_date, id);
    });

    try {
        update();
        res.json({ message: 'Extension recorded' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});
