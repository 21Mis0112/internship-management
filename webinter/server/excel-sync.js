import Database from 'better-sqlite3';
import { createRequire } from 'module';
import https from 'https';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

// ===== CONFIGURATION =====
// Replace this with your OneDrive Excel file share link
const EXCEL_FILE_URL = process.env.EXCEL_SYNC_URL || '';

// How often to check for updates (in minutes)
const SYNC_INTERVAL_MINUTES = 5;

// ===== AUTO-SYNC FUNCTIONALITY =====

async function downloadExcelFile(url) {
    if (!url) {
        console.log('⚠️  No Excel sync URL configured. Skipping auto-sync.');
        return null;
    }

    // Convert OneDrive share link to direct download link
    let downloadUrl = url;

    console.log('📥 Processing OneDrive link:', url);

    if (url.includes('1drv.ms')) {
        // For short links, convert to embed download format
        // https://1drv.ms/x/... → needs to be expanded and downloaded
        downloadUrl = url.replace('/x/', '/download/');
        if (!downloadUrl.includes('download=1')) {
            downloadUrl += (downloadUrl.includes('?') ? '&' : '?') + 'download=1';
        }
    } else if (url.includes('onedrive.live.com')) {
        // For full links
        downloadUrl = url.replace('view.aspx', 'download.aspx');
        downloadUrl = downloadUrl.replace('edit.aspx', 'download.aspx');
        if (!downloadUrl.includes('download=1')) {
            downloadUrl += (downloadUrl.includes('?') ? '&' : '?') + 'download=1';
        }
    }

    return new Promise((resolve, reject) => {
        console.log('📥 Downloading from:', downloadUrl);

        https.get(downloadUrl, (response) => {
            console.log('Response status:', response.statusCode);

            if (response.statusCode === 302 || response.statusCode === 301) {
                // Follow redirect
                console.log('Following redirect to:', response.headers.location);
                https.get(response.headers.location, (redirectResponse) => {
                    const chunks = [];
                    redirectResponse.on('data', chunk => chunks.push(chunk));
                    redirectResponse.on('end', () => {
                        const buffer = Buffer.concat(chunks);
                        console.log('✅ Downloaded', buffer.length, 'bytes');
                        resolve(buffer);
                    });
                }).on('error', reject);
            } else {
                const chunks = [];
                response.on('data', chunk => chunks.push(chunk));
                response.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    console.log('✅ Downloaded', buffer.length, 'bytes');
                    resolve(buffer);
                });
            }
        }).on('error', (err) => {
            console.error('Download error:', err.message);
            reject(err);
        });
    });
}

export async function syncDataFromExcel(db) {
    try {
        console.log('🔄 Starting Excel sync...');

        const fileBuffer = await downloadExcelFile(EXCEL_FILE_URL);
        if (!fileBuffer) return;

        // Parse Excel file
        const workbook = XLSX.read(fileBuffer);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        console.log(`📊 Found ${data.length} rows in Excel file`);

        // Normalize keys
        const normalizedData = data.map(row => {
            const newRow = {};
            for (const key of Object.keys(row)) {
                newRow[key.trim().toLowerCase()] = row[key];
            }
            return newRow;
        });

        // Clear existing candidates
        db.prepare('DELETE FROM candidates').run();
        console.log('🗑️  Cleared existing data');

        // Insert new data
        const stmt = db.prepare(`
            INSERT INTO candidates (
                intern_id, name, college, department, year, start_date, end_date,
                phone, email, status, mentor, referred_by, qualification
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertMany = db.transaction((candidates) => {
            let addedCount = 0;
            for (const c of candidates) {
                // Date converter
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

                // Helper to find value
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
                if (start) {
                    year = start.split('-')[0];
                }

                const phone = getVal(['phone no', 'phone', 'contact no']);
                const email = getVal(['mail id', 'email', 'email id']);
                const status = getVal(['status']) || 'Active';
                const mentor = getVal(['mentor']);
                const ref = getVal(['referred by', 'refered by']);
                const qual = getVal(['qualification', 'qual']);

                if (internId && name) {
                    stmt.run(internId, name, college, dept, year, start, end, phone, email, status, mentor, ref, qual);
                    addedCount++;
                }
            }
            return addedCount;
        });

        const count = insertMany(normalizedData);
        console.log(`✅ Successfully synced ${count} candidates from Excel`);
        return count;

    } catch (error) {
        console.error('❌ Excel sync failed:', error.message);
        return 0;
    }
}

export function setupAutoSync(db) {
    if (!EXCEL_FILE_URL) {
        console.log('ℹ️  Excel auto-sync disabled. Set EXCEL_SYNC_URL to enable.');
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

    console.log(`🔄 Auto-sync enabled: Checking every ${SYNC_INTERVAL_MINUTES} minutes`);
}
