# 📊 Excel Auto-Sync Setup Guide

## How It Works

Your internship data will automatically sync from your OneDrive Excel file:
1. You edit and save your Excel file in OneDrive
2. Every 5 minutes, the server checks for updates
3. Data automatically refreshes in the app
4. No manual uploads needed!

---

##Step 1: Prepare Your Excel File

### Required Columns (at least these):
- **Intern ID** (or ID NO., S.NO)
- **Name** (required)
- **Email** (or MAIL ID)
- **College Name**
- **Department**
- **Starting Date** (or Training From)
- **Ending Date** (or Training To)
- **Phone NO**
- **Status** (Active/Completed/Disconnected)
- **Mentor**
- **Referred By**
- **Qualification**

The column names are case-insensitive and flexible!

---

## Step 2: Upload to OneDrive

1. Save your Excel file to **OneDrive**
2. Make sure it's in your OneDrive folder (probably already is based on your file path)

---

## Step 3: Get Share Link

1. Right-click your Excel file in OneDrive
2. Click "Share" or "Get Link"
3. Choose "Anyone with the link can view"
4. Click "Copy link"

Your link will look like:
```
https://onedrive.live.com/view.aspx?resid=...&authkey=...
```

---

## Step 4: Configure Backend

### Option A: Set Environment Variable on Render

1. Go to Render dashboard
2. Click on your backend service
3. Go to "Environment" tab
4. Add new environment variable:
   - **Key**: `EXCEL_SYNC_URL`
   - **Value**: [Paste your OneDrive link here]
5. Click "Save Changes"
6. Render will auto-redeploy

### Option B: Local Testing

Create `.env` file in server folder:
```
EXCEL_SYNC_URL=https://onedrive.live.com/view.aspx?resid=...
```

---

## Step 5: Verify It Works

1. After deployment, check Render logs
2. You should see:
   ```
   📥 Downloading Excel file from OneDrive...
   📊 Found X rows in Excel file
   ✅ Successfully synced X candidates from Excel
   🔄 Auto-sync enabled: Checking every 5 minutes
   ```

3. Visit your app - data should appear!

---

## How to Update Data

Just edit your Excel file and save it! The changes will sync automatically within 5 minutes.

**To force immediate sync:** Restart your backend service on Render.

---

## Troubleshooting

### "No Excel sync URL configured"
- You haven't set the `EXCEL_SYNC_URL` environment variable yet
- Follow Step 4 to configure it

### "Excel sync failed"
- Check that your OneDrive link is correct
- Make sure link has "view" permissions
- Verify Excel file has the required columns

### Data not updating
- Wait up to 5 minutes for auto-sync
- Or restart backend service to force sync
- Check that you saved the Excel file

---

## Benefits

✅ **No manual uploads** - Just edit Excel and save
✅ **Always current** - Syncs every 5 minutes
✅ **Works on deploy** - Data loads automatically when server starts
✅ **Familiar tool** - Use Excel as you normally would
✅ **Solve Render problem** - Database resets don't matter anymore!

---

## Next Steps

1. Get your OneDrive Excel share link
2. Give me the link and I'll configure it for you
3. Test that data syncs correctly
4. Deploy to Render with the configuration

**Ready to set this up! Just share your OneDrive Excel link.** 🚀
