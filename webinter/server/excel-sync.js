import Database from 'better-sqlite3';
import { createRequire } from 'module';
import https from 'https';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

// Configuration
const SYNC_URL = process.env.EXCEL_SYNC_URL || '';
const SYNC_INTERVAL_MINUTES = 5;

async function downloadFile(url) {
    if (!url) {
        console.log('⚠️  No sync URL configured.');
        return null;
    }

    let downloadUrl = url;

    console.log('📥 Processing sync URL:', url);

    // Google Sheets - convert to export URL
    if (url.includes('docs.google.com/spreadsheets')) {
        const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (match) {
            const spreadsheetId = match[1];
            downloadUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
            console.log('📊 Google Sheets detected, using export URL');
        }
    }
    // OneDrive
    else if (url.includes('1drv.ms') || url.includes('onedrive')) {
        downloadUrl = url + (url.includes('?') ? '&' : '?') + 'download=1';
    }

    return new Promise((resolve, reject) => {
        console.log('📥 Downloading from:', downloadUrl);

        https.get(downloadUrl, (response) => {
            console.log('Response status:', response.statusCode);

            if (response.statusCode === 302 || response.statusCode === 301) {
                console.log('Following redirect...');
                https.get(response.headers.location, (r) => {
                    const chunks = [];
                    r.on('data', chunk => chunks.push(chunk));
                    r.on('end', () => {
                        const buffer = Buffer.concat(chunks);
                        console.log('✅ Downloaded', buffer.length, 'bytes');
                        resolve(buffer);
                    });
                }).on('error', reject);
            } else if (response.statusCode === 200) {
                const chunks = [];
                response.on('data', chunk => chunks.push(chunk));
                response.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    console.log('✅ Downloaded', buffer.length, 'bytes');
                    resolve(buffer);
                });
            } else {
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        }).on('error', reject);
    });
}

export async function syncDataFromExcel(db) {
    try {
        console.log('🔄 Starting sync...');

        const buffer = await downloadFile(SYNC_URL);
        if (!buffer || buffer.length === 0) {
            console.log('⚠️  No data downloaded');
            return 0;
        }

        const workbook = XLSX.read(buffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        console.log(`📊 Found ${data.length} rows`);

        // Normalize keys
        const normalized = data.map(row => {
            const newRow = {};
            for (const key of Object.keys(row)) {
                newRow[key.trim().toLowerCase()] = row[key];
            }
            return newRow;
        });

        // Clear and insert
        db.prepare('DELETE FROM candidates').run();
        console.log('🗑️  Cleared existing data');

        const stmt = db.prepare(`
            INSERT INTO candidates (
                intern_id, name, college, department, year, start_date, end_date,
                phone, email, status, mentor, referred_by, qualification
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertMany = db.transaction((candidates) => {
            let count = 0;
            for (const c of candidates) {
                const excelDate = (val) => {
                    if (!val) return "";
                    if (typeof val === 'number') {
                        return new Date(Math.round((val - 25569) * 86400 * 1000)).toISOString().split('T')[0];
                    }
                    if (typeof val === 'string' && val.includes('-')) {
                        const parts = val.split('-');
                        if (parts.length === 3 && parts[0].length <= 2 && parts[2].length === 4) {
                            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                        }
                    }
                    return val;
                };

                const getVal = (keys) => {
                    for (const key of keys) {
                        if (c[key] !== undefined && c[key] !== "") return c[key];
                    }
                    return null;
                };

                const internId = getVal(['internilid', 'id no.', 'intern id', 'id', 's.no', 'no.']);
                const name = getVal(['name', 'full name', 'candidate name']);
                const college = getVal(['college name', 'collage name', 'college']);
                const dept = getVal(['department', 'dept', 'course']);
                const start = excelDate(getVal(['starting date', 'training from', 'start date']));
                const end = excelDate(getVal(['ending date', 'training to', 'end date']));

                let year = getVal(['year', 'batch']);
                if (start) year = start.split('-')[0];

                const phone = getVal(['phone no', 'phone', 'contact no']);
                const email = getVal(['mail id', 'email', 'email id']);
                const status = getVal(['status']) || 'Active';
                const mentor = getVal(['mentor']);
                const ref = getVal(['referred by', 'refered by']);
                const qual = getVal(['qualification', 'qual']);

                if (internId && name) {
                    stmt.run(internId, name, college, dept, year, start, end, phone, email, status, mentor, ref, qual);
                    count++;
                }
            }
            return count;
        });

        const count = insertMany(normalized);
        console.log(`✅ Successfully synced ${count} candidates`);
        return count;

    } catch (error) {
        console.error('❌ Sync failed:', error.message);
        return 0;
    }
}

export function setupAutoSync(db) {
    if (!SYNC_URL) {
        console.log('ℹ️  Auto-sync disabled. Set EXCEL_SYNC_URL to enable.');
        return;
    }

    // Sync on startup
    syncDataFromExcel(db);

    // Sync periodically
    const intervalMs = SYNC_INTERVAL_MINUTES * 60 * 1000;
    setInterval(() => {
        console.log(`⏰ Scheduled sync (every ${SYNC_INTERVAL_MINUTES} minutes)`);
        syncDataFromExcel(db);
    }, intervalMs);

    console.log(`🔄 Auto-sync enabled: Every ${SYNC_INTERVAL_MINUTES} minutes`);
}
