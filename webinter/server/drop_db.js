import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'internship_v3.db');
const db = new Database(dbPath);

try {
    // Drop the table so it gets recreated with new schema
    db.prepare('DROP TABLE IF EXISTS candidates').run();
    console.log('Dropped candidates table');
    db.prepare('DROP TABLE IF EXISTS extensions').run();
    console.log('Dropped extensions table');

} catch (err) {
    console.error('Error dropping tables:', err);
}
