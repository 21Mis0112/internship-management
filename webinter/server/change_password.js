import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import readline from 'readline';

const dbPath = path.join(process.cwd(), 'internship_v3.db');
const db = new Database(dbPath);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n========================================');
console.log('   ADMIN PASSWORD CHANGE UTILITY');
console.log('========================================\n');

// Function to ask questions
function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function changePassword() {
    try {
        const username = await question('Enter username (default: admin): ') || 'admin';
        const newPassword = await question('Enter new password: ');

        if (!newPassword || newPassword.trim() === '') {
            console.log('\n❌ Password cannot be empty!\n');
            rl.close();
            db.close();
            return;
        }

        // Check if user exists
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

        if (!user) {
            console.log(`\n❌ User "${username}" not found!\n`);
            rl.close();
            db.close();
            return;
        }

        // Hash the new password
        const hash = bcrypt.hashSync(newPassword, 10);

        // Update the password
        db.prepare('UPDATE users SET password = ? WHERE username = ?').run(hash, username);

        console.log(`\n✅ Password changed successfully for user: ${username}`);
        console.log(`   New password: ${newPassword}\n`);
        console.log('========================================\n');

    } catch (err) {
        console.error('\n❌ Error:', err.message, '\n');
    } finally {
        rl.close();
        db.close();
    }
}

changePassword();
