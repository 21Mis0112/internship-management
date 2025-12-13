const Database = require('better-sqlite3');
const db = new Database('internship_v3.db');

console.log('Fixing status field inconsistencies...\n');

// Get current status distribution
console.log('Current status distribution:');
const currentStatuses = db.prepare('SELECT status, COUNT(*) as count FROM candidates GROUP BY status').all();
currentStatuses.forEach(s => console.log(`  ${s.status}: ${s.count}`));

// Standardize all statuses to proper case
console.log('\nStandardizing statuses...');

// Fix ACTIVE -> Active
const activeFixed = db.prepare("UPDATE candidates SET status = 'Active' WHERE UPPER(status) = 'ACTIVE'").run();
console.log(`Fixed ${activeFixed.changes} 'ACTIVE' -> 'Active'`);

// Fix COMPLETED -> Completed
const completedFixed = db.prepare("UPDATE candidates SET status = 'Completed' WHERE UPPER(status) = 'COMPLETED'").run();
console.log(`Fixed ${completedFixed.changes} 'COMPLETED' -> 'Completed'`);

// Fix DISCONNECTED -> Disconnected
const disconnectedFixed = db.prepare("UPDATE candidates SET status = 'Disconnected' WHERE UPPER(status) = 'DISCONNECTED'").run();
console.log(`Fixed ${disconnectedFixed.changes} 'DISCONNECTED' -> 'Disconnected'`);

console.log('\nFinal status distribution:');
const finalStatuses = db.prepare('SELECT status, COUNT(*) as count FROM candidates GROUP BY status').all();
finalStatuses.forEach(s => console.log(`  ${s.status}: ${s.count}`));

console.log('\n✅ Status standardization complete!');
db.close();
