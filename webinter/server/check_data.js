import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'internship_v3.db');
const db = new Database(dbPath);

console.log('\n========================================');
console.log('   DATABASE INSPECTION REPORT');
console.log('========================================\n');

// Count total candidates
const totalCount = db.prepare('SELECT COUNT(*) as count FROM candidates').get();
console.log(`📊 Total Candidates: ${totalCount.count}\n`);

if (totalCount.count > 0) {
    // Check for missing values
    console.log('🔍 Checking for Missing Values:\n');

    const missingInternId = db.prepare('SELECT COUNT(*) as count FROM candidates WHERE intern_id IS NULL OR intern_id = ""').get();
    const missingName = db.prepare('SELECT COUNT(*) as count FROM candidates WHERE name IS NULL OR name = ""').get();
    const missingCollege = db.prepare('SELECT COUNT(*) as count FROM candidates WHERE college IS NULL OR college = "" OR college = "NIL"').get();
    const missingDept = db.prepare('SELECT COUNT(*) as count FROM candidates WHERE department IS NULL OR department = "" OR department = "NIL"').get();
    const missingStartDate = db.prepare('SELECT COUNT(*) as count FROM candidates WHERE start_date IS NULL OR start_date = ""').get();
    const missingEndDate = db.prepare('SELECT COUNT(*) as count FROM candidates WHERE end_date IS NULL OR end_date = "" OR end_date = "NIL"').get();
    const missingMentor = db.prepare('SELECT COUNT(*) as count FROM candidates WHERE mentor IS NULL OR mentor = "" OR mentor = "NIL"').get();
    const missingEmail = db.prepare('SELECT COUNT(*) as count FROM candidates WHERE email IS NULL OR email = ""').get();
    const missingPhone = db.prepare('SELECT COUNT(*) as count FROM candidates WHERE phone IS NULL OR phone = ""').get();

    console.log(`   Intern ID:    ${missingInternId.count} missing`);
    console.log(`   Name:         ${missingName.count} missing`);
    console.log(`   College:      ${missingCollege.count} missing/NIL`);
    console.log(`   Department:   ${missingDept.count} missing/NIL`);
    console.log(`   Start Date:   ${missingStartDate.count} missing`);
    console.log(`   End Date:     ${missingEndDate.count} missing/NIL`);
    console.log(`   Mentor:       ${missingMentor.count} missing/NIL`);
    console.log(`   Email:        ${missingEmail.count} missing`);
    console.log(`   Phone:        ${missingPhone.count} missing\n`);

    // Show sample records
    console.log('📋 Sample Records (First 5):\n');
    const samples = db.prepare('SELECT * FROM candidates LIMIT 5').all();
    samples.forEach((record, idx) => {
        console.log(`   Record ${idx + 1}:`);
        console.log(`      ID: ${record.id} | Intern ID: ${record.intern_id || 'MISSING'}`);
        console.log(`      Name: ${record.name || 'MISSING'}`);
        console.log(`      College: ${record.college || 'MISSING'}`);
        console.log(`      Department: ${record.department || 'MISSING'}`);
        console.log(`      Dates: ${record.start_date || 'MISSING'} to ${record.end_date || 'MISSING'}`);
        console.log(`      Status: ${record.status || 'MISSING'}`);
        console.log('');
    });
}

// Check admin user
console.log('========================================');
console.log('   ADMIN USER INFORMATION');
console.log('========================================\n');

const adminUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
if (adminUser) {
    console.log(`✅ Admin user exists`);
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Password: [HASHED - stored securely]`);
    console.log(`   Hash: ${adminUser.password.substring(0, 20)}...`);
    console.log(`\n   ℹ️  Default password is: admin123`);
    console.log(`   ℹ️  To change password, use reset_password.js\n`);
} else {
    console.log('❌ Admin user not found!\n');
}

console.log('========================================\n');

db.close();
