# 🎓 RG Internship Management System

A modern, full-stack web application designed to streamline the management of internship candidates for organizations. This system provides HR teams with powerful tools to track, analyze, and manage internship programs efficiently.

---

## 📖 What is This Project?

This is a **complete internship management solution** that helps HR departments:

- **Track Candidates**: Maintain detailed records of all internship applicants and active interns
- **Visualize Data**: See trends and patterns through interactive charts and analytics
- **Import/Export Data**: Bulk upload candidates from Excel files and export reports
- **Monitor Progress**: Track internship durations, extensions, and completion status
- **Search & Filter**: Quickly find candidates by status, year, department, or college

**Who is this for?**
- HR Managers managing internship programs
- Companies with regular internship batches (like TCS, Infosys, etc.)
- Educational institutions tracking student internships
- Organizations needing structured intern management

---

## ✨ Key Features

### 1. 📊 **Analytics Dashboard**
Visual insights into your internship program with interactive charts:
- **Pie Charts**: Status distribution (Active/Completed/Disconnected), College breakdown
- **Bar Charts**: Candidates by year, Department distribution
- **Line Charts**: Monthly trends showing growth over time

### 2. 👥 **Candidate Management**
Complete candidate lifecycle management:
- Add candidates manually with detailed forms
- View individual candidate profiles with full history
- Track internship start and end dates
- Monitor candidate status (Active, Completed, Disconnected)
- Assign mentors and track referrals

### 3. 📁 **Excel Import/Export**
Bulk operations made easy:
- **Import**: Upload Excel files with hundreds of candidates at once
- **Export**: Download complete candidate database as Excel
- **Smart Mapping**: Automatically recognizes various column name formats
- **Duplicate Handling**: Updates existing records instead of creating duplicates

### 4. 🔍 **Advanced Search & Filters**
Find candidates quickly:
- Search by name, email, or intern ID
- Filter by status, year, department, or college
- Combine multiple filters for precise results
- Real-time search results

### 5. 📈 **Extension Management**
Track internship extensions:
- Record extension requests with reasons
- Maintain history of all extensions
- Update end dates automatically
- View extension timeline for each candidate

### 6. 🔐 **Secure Authentication**
Protected access:
- Admin login with encrypted passwords
- Session management with JWT tokens
- Password change functionality
- Secure API endpoints

---

## 🏗️ Technical Architecture

### **Technology Stack**

**Frontend (Client):**
- **React 19** - Modern UI library for building interactive interfaces
- **Vite** - Lightning-fast build tool and dev server
- **React Router** - Client-side routing for navigation
- **Chart.js** - Beautiful, responsive charts for analytics
- **Axios** - HTTP client for API communication

**Backend (Server):**
- **Node.js** - JavaScript runtime for server-side code
- **Express** - Web framework for building REST APIs
- **SQLite** - Lightweight, file-based database (no separate DB server needed)
- **bcrypt** - Password hashing for security
- **JWT** - Token-based authentication
- **Multer** - File upload handling for Excel imports
- **XLSX** - Excel file parsing and generation

### **How It Works**

```
┌─────────────┐         HTTP Requests        ┌─────────────┐
│   Browser   │ ◄─────────────────────────► │   Express   │
│  (React UI) │      JSON Data/Files        │   Server    │
└─────────────┘                              └─────────────┘
                                                     │
                                                     │ SQL Queries
                                                     ▼
                                              ┌─────────────┐
                                              │   SQLite    │
                                              │  Database   │
                                              └─────────────┘
```

1. **User Interface**: React app runs in browser (port 5173)
2. **API Server**: Express server handles requests (port 3000)
3. **Database**: SQLite stores all data in a single file (`internship_v3.db`)

---

## 🚀 Quick Start Guide

### **Prerequisites**

Before you begin, ensure you have:
- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Windows/Mac/Linux** operating system

### **Installation Steps**

**Step 1: Install Dependencies**

Open terminal/command prompt and run:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

**Step 2: Start the Application**

**Option A - Easy Way (Windows):**
```bash
# Just double-click this file
start.bat
```

**Option B - Manual Way (All OS):**

Open **two separate terminals**:

Terminal 1 (Backend):
```bash
cd server
node index.js
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

**Step 3: Access the Application**

Open your web browser and go to:
```
http://localhost:5173
```

**Step 4: Login**

Use the default credentials:
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change this password immediately after first login!

---

## 📁 Project Structure Explained

```
webinter/
│
├── 📂 client/                          # Frontend Application
│   ├── 📂 src/
│   │   ├── 📂 pages/                  # All page components
│   │   │   ├── Login.jsx              # Login page
│   │   │   ├── Dashboard.jsx          # Main candidate list
│   │   │   ├── Analytics.jsx          # Charts and insights
│   │   │   ├── AddCandidate.jsx       # Add/Import candidates
│   │   │   ├── CandidateProfile.jsx   # Individual candidate view
│   │   │   └── ChangePassword.jsx     # Password management
│   │   ├── api.js                     # API configuration (connects to backend)
│   │   ├── App.jsx                    # Main app component with routing
│   │   └── index.css                  # Global styles (dark theme)
│   ├── package.json                   # Frontend dependencies
│   └── vite.config.js                 # Vite build configuration
│
├── 📂 server/                          # Backend Application
│   ├── index.js                       # Main server file (all API endpoints)
│   ├── internship_v3.db              # 💾 DATABASE FILE (SQLite)
│   ├── package.json                   # Backend dependencies
│   │
│   └── 🛠️ Utility Scripts:
│       ├── drop_db.js                 # Clear all data from database
│       ├── check_data.js              # Inspect database contents
│       └── change_password.js         # Change admin password
│
├── README.md                          # This file (project documentation)
└── start.bat                          # Windows startup script
```

### **What Each Component Does**

**Frontend (client/):**
- Provides the user interface you see in the browser
- Handles user interactions (clicks, form submissions)
- Displays data in tables and charts
- Communicates with backend via HTTP requests

**Backend (server/):**
- Processes API requests from frontend
- Manages database operations (create, read, update, delete)
- Handles authentication and security
- Processes Excel file uploads
- Serves data to frontend

**Database (internship_v3.db):**
- Stores all candidate information
- Stores user credentials (hashed passwords)
- Stores extension history
- Single file, no separate database server needed

---

## 💡 How to Use the System

### **1. Adding Candidates**

**Method A - Manual Entry:**
1. Click "Add Candidate" in navigation
2. Fill in the form with candidate details
3. Click "Save Candidate"
4. Candidate appears in dashboard immediately

**Method B - Excel Import:**
1. Click "Add Candidate" → "Excel Import" tab
2. Prepare Excel file with these columns:
   - `ID NO.` or `INTERN ID`
   - `NAME`
   - `COLLEGE NAME`
   - `DEPARTMENT`
   - `STARTING DATE`
   - `ENDING DATE`
   - `PHONE NO`
   - `MAIL ID`
   - `STATUS`
   - `MENTOR`
   - `REFERRED BY`
3. Click "Choose File" and select your Excel
4. Click "Upload & Import"
5. System processes and imports all candidates

### **2. Viewing Analytics**

1. Click "Analytics" in navigation
2. View 5 different charts:
   - Status distribution (pie chart)
   - Candidates by year (bar chart)
   - Department breakdown (bar chart)
   - College distribution (pie chart)
   - Monthly trends (line chart)

### **3. Searching Candidates**

1. Go to Dashboard
2. Use filter boxes at the top:
   - **Search**: Type name, email, or intern ID
   - **Status**: Select Active/Completed/Disconnected
   - **Year**: Enter start year (e.g., 2024)
   - **College**: Type college name
   - **Department**: Type department name
3. Results update automatically

### **4. Managing Extensions**

1. Click "View" on any candidate
2. Scroll to "Extend Internship" section
3. Enter new end date and reason
4. Click "Submit Extension"
5. Extension is recorded in history

### **5. Exporting Data**

1. Go to Dashboard
2. Apply any filters you want (optional)
3. Click "Export to Excel"
4. Excel file downloads with all visible candidates

---

## 🔧 Utility Scripts

Located in `server/` folder. **Stop the server before running these!**

### **Clear Database**
```bash
cd server
node drop_db.js
```
Deletes all candidates and extensions. Database will be recreated on next server start.

### **Check Data**
```bash
cd server
node check_data.js
```
Shows statistics about missing values, sample records, and admin user info.

### **Change Password**
```bash
cd server
node change_password.js
```
Interactive script to change admin password securely.

---

## 📤 Deploying to Another Machine

### **Simple Transfer Method**

1. **Copy the entire `webinter` folder** to the new machine (USB/cloud/network)

2. **On the new machine**, install Node.js from https://nodejs.org/

3. **Install dependencies:**
   ```bash
   cd webinter/server
   npm install
   
   cd ../client
   npm install
   ```

4. **Start the application:**
   - Windows: Double-click `start.bat`
   - Mac/Linux: Run both servers manually (see Quick Start)

5. **Access**: Open browser to http://localhost:5173

### **Starting Fresh (No Old Data)**

If you want to deploy without old candidate data:
1. Delete `server/internship_v3.db` before copying
2. Database will be recreated automatically with default admin user

---

## 🔐 Security Best Practices

### **For Production Use:**

1. **Change Default Password**
   - Login → Change Password
   - Use strong password (min 8 chars, mix of letters/numbers/symbols)

2. **Update Secret Key**
   - Edit `server/index.js` line 20
   - Change `SECRET_KEY` to a random string

3. **Configure CORS**
   - Edit `server/index.js` line 23
   - Replace `origin: '*'` with your actual domain

4. **Use HTTPS**
   - Deploy behind reverse proxy (nginx/Apache)
   - Enable SSL certificates

5. **Environment Variables**
   - Store sensitive data in `.env` file
   - Never commit passwords to version control

---

## 🐛 Troubleshooting

### **Problem: "Port already in use"**

**Solution:**
```bash
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or change port in server/index.js
const PORT = 3001;  // Line 19
```

### **Problem: "Cannot connect to backend"**

**Solution:**
1. Ensure backend server is running (check terminal)
2. Verify it shows: `Server running on http://127.0.0.1:3000`
3. Check `client/src/api.js` has correct URL

### **Problem: "Module not found"**

**Solution:**
```bash
# Delete and reinstall dependencies
cd server
rm -rf node_modules package-lock.json
npm install

cd ../client  
rm -rf node_modules package-lock.json
npm install
```

### **Problem: Charts not showing**

**Solution:**
1. Ensure you have candidate data in database
2. Refresh the page (Ctrl + F5)
3. Check browser console for errors (F12)

### **Problem: Excel import fails**

**Solution:**
1. Check column names match expected format
2. Ensure dates are in correct format (DD-MM-YYYY or Excel date)
3. Check for special characters in data
4. Try with smaller file first (test with 10 rows)

---

## 📊 Database Schema

### **Candidates Table**
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Auto-increment primary key |
| intern_id | TEXT | Unique intern identifier |
| name | TEXT | Full name (required) |
| college | TEXT | College/university name |
| department | TEXT | Department/course |
| year | TEXT | Start year (auto-extracted from start_date) |
| start_date | TEXT | Internship start date (YYYY-MM-DD) |
| end_date | TEXT | Internship end date (YYYY-MM-DD) |
| phone | TEXT | Contact number |
| email | TEXT | Email address |
| status | TEXT | Active/Completed/Disconnected |
| mentor | TEXT | Assigned mentor name |
| referred_by | TEXT | Referral source |
| created_at | DATETIME | Record creation timestamp |

### **Users Table**
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Auto-increment primary key |
| username | TEXT | Login username (unique) |
| password | TEXT | Bcrypt hashed password |
| role | TEXT | User role (default: admin) |

### **Extensions Table**
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Auto-increment primary key |
| candidate_id | INTEGER | Foreign key to candidates |
| old_end_date | TEXT | Previous end date |
| new_end_date | TEXT | Extended end date |
| reason | TEXT | Extension reason |
| created_at | DATETIME | Extension timestamp |

---

## 🎯 Common Use Cases

### **Scenario 1: New Internship Batch**
1. Receive Excel file from colleges
2. Go to Add Candidate → Excel Import
3. Upload file
4. Review imported candidates in Dashboard
5. Check Analytics for batch overview

### **Scenario 2: Individual Application**
1. Candidate applies via email/form
2. Go to Add Candidate → Manual Entry
3. Fill in details
4. Save candidate
5. Assign mentor and track progress

### **Scenario 3: Internship Completion**
1. Internship period ends
2. Find candidate in Dashboard
3. Click View
4. Change status to "Completed"
5. Export report for records

### **Scenario 4: Monthly Reporting**
1. Go to Analytics
2. View monthly trends chart
3. Export candidate data
4. Generate reports for management

---

## 📝 Frequently Asked Questions

**Q: Can I run this without internet?**
A: Yes! Everything runs locally. No internet needed after installation.

**Q: How many candidates can it handle?**
A: SQLite can handle millions of records. Tested with 10,000+ candidates smoothly.

**Q: Can multiple users access simultaneously?**
A: Currently single admin user. For multi-user, consider deploying on a server.

**Q: What if I lose the database file?**
A: Always backup `internship_v3.db` regularly. No backup = data loss.

**Q: Can I customize the fields?**
A: Yes! Edit `server/index.js` (database schema) and `client/src/pages/AddCandidate.jsx` (form).

**Q: Is my data secure?**
A: Data stays on your machine. Passwords are hashed. For production, follow security best practices.

---

## 🆘 Getting Help

If you encounter issues:

1. **Check this README** - Most common issues are covered
2. **Review console logs** - Press F12 in browser, check Console tab
3. **Check server terminal** - Look for error messages
4. **Verify Node.js version** - Run `node --version` (should be 16+)
5. **Reinstall dependencies** - Delete `node_modules` and run `npm install`

---

## 📄 License

This project is developed and owned by **Sai Kumar and Team**.
All rights reserved © 2024 Sai Kumar and Team.

---

## 🙏 Credits

**Developed by:** Sai Kumar and Team

**Built with love using:**
- React & Vite for blazing-fast frontend
- Node.js & Express for robust backend
- SQLite for reliable data storage
- Chart.js for beautiful visualizations

---

**Version:** 3.0  
**Last Updated:** December 2024  
**Developed & Maintained by:** Sai Kumar and Team

---

## 🚀 Ready to Start?

1. Install Node.js
2. Run `npm install` in both folders
3. Double-click `start.bat`
4. Open http://localhost:5173
5. Login with admin/admin123
6. Start managing your interns!

**Happy Internship Managing! 🎓**
