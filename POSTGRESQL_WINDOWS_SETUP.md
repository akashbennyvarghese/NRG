# PostgreSQL Installation & Setup Guide for Windows

## 🚀 Step-by-Step Installation

### Step 1: Download PostgreSQL

1. Visit: **https://www.postgresql.org/download/windows/**
2. Click "Interactive installer by EDB"
3. Download **PostgreSQL 16** (or latest version)
4. File will be named: `postgresql-16.x-x64.exe`

### Step 2: Run the Installer

1. Double-click the installer `postgresql-16.x-x64.exe`
2. Click **Next** to proceed

### Step 3: Installation Directory

- Default: `C:\Program Files\PostgreSQL\16`
- Click **Next**

### Step 4: Select Components

Make sure these are **checked**:
- ✅ PostgreSQL Server
- ✅ pgAdmin 4
- ✅ Stack Builder
- ✅ Command Line Tools

Click **Next**

### Step 5: Data Directory

- Default: `C:\Program Files\PostgreSQL\16\data`
- Click **Next**

### Step 6: Superuser Password (⚠️ IMPORTANT)

**Enter a password for the `postgres` superuser:**

```
Password: postgres_password_123
Confirm: postgres_password_123
```

**Remember this password!** You'll need it later.

Click **Next**

### Step 7: Port

- Default: `5432`
- Leave as is
- Click **Next**

### Step 8: Locale

- Keep default: `[Default locale]`
- Click **Next**

### Step 9: Review

- Click **Next** to begin installation
- Wait for installation to complete (2-3 minutes)

### Step 10: Completion

- Uncheck "Launch Stack Builder" (optional)
- Click **Finish**

---

## ✅ Verify Installation

Open **PowerShell** and run:

```powershell
psql --version
```

**Expected output:**
```
psql (PostgreSQL) 16.x
```

If you see this, PostgreSQL is installed! ✅

---

## 🗄️ Create NRG Database & User

### Step 1: Connect as Admin

Open PowerShell and run:

```powershell
psql -U postgres
```

You'll be prompted for the password you set during installation.

**Expected output:**
```
psql (16.x, server 16.x)
Type "help" for help.

postgres=#
```

### Step 2: Create Database

At the `postgres=#` prompt, paste this:

```sql
CREATE DATABASE nrg_ecommerce;
```

**Expected output:**
```
CREATE DATABASE
```

### Step 3: Create Database User

```sql
CREATE USER nrg_user WITH PASSWORD 'nrg_password_123';
```

**Expected output:**
```
CREATE ROLE
```

### Step 4: Grant Privileges

```sql
ALTER ROLE nrg_user SET client_encoding TO 'utf8';
ALTER ROLE nrg_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE nrg_user SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE nrg_ecommerce TO nrg_user;
```

**Expected output:**
```
ALTER ROLE
ALTER ROLE
ALTER ROLE
GRANT
```

### Step 5: Exit psql

```sql
\q
```

You should return to the PowerShell prompt.

---

## 🔧 Configure Backend .env File

Now update the backend `.env` file with the database credentials:

### Open File

Edit `D:\python\NRG\backend\.env`:

```env
PORT=5000
DATABASE_URL=postgresql://nrg_user:nrg_password_123@localhost:5432/nrg_ecommerce
JWT_SECRET=your_super_secret_jwt_key_12345_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
AWS_S3_BUCKET=nrg-products
AWS_REGION=us-east-1
AWS_ACCESS_KEY=your_aws_key
AWS_SECRET_KEY=your_aws_secret
ADMIN_EMAIL=admin@nrg.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_password
```

### Critical: Update DATABASE_URL

```
DATABASE_URL=postgresql://nrg_user:nrg_password_123@localhost:5432/nrg_ecommerce
```

This must match:
- **User:** `nrg_user`
- **Password:** `nrg_password_123`
- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `nrg_ecommerce`

---

## ✔️ Test Connection

### From PowerShell

```powershell
psql -U nrg_user -d nrg_ecommerce -h localhost
```

If you get a prompt like `nrg_ecommerce=>`, you're connected! Type `\q` to exit.

---

## 🎯 Run Migrations & Seed

Now you can run the database setup:

### Terminal 1: Backend Setup

```powershell
cd d:\python\NRG\backend

# Run migrations (creates tables)
npm run migrate

# Seed sample data (admin user, products, coupons)
npm run seed

# Start development server
npm run dev
```

**Expected output:**
```
✅ Database migration completed successfully
✅ Admin user created
✅ Sample data seeded
🚀 Server running on port 5000
```

### Terminal 2: Frontend Setup (in new terminal)

```powershell
cd d:\python\NRG\frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start development server
npm start
```

App will open at `http://localhost:3000`

---

## 🔑 Test Login Credentials

After seeding, use these credentials:

```
Email:    admin@nrg.com
Password: admin@123
```

---

## 🐛 Troubleshooting

### Error: "psql: command not found"

**Solution:** PostgreSQL is not in system PATH. Add it manually:

1. Open System Environment Variables
   - Press: `Win + X` → System
   - Click: Advanced System Settings
   - Click: Environment Variables

2. Edit PATH:
   - Under "System variables" → Find "Path" → Click "Edit"
   - Click "New"
   - Add: `C:\Program Files\PostgreSQL\16\bin`
   - Click OK

3. Restart PowerShell and try again:
   ```powershell
   psql --version
   ```

### Error: "password authentication failed"

**Solution:** Password mismatch in `.env` file

1. Verify `.env` has correct credentials:
   ```
   DATABASE_URL=postgresql://nrg_user:nrg_password_123@localhost:5432/nrg_ecommerce
   ```

2. Reset password in PostgreSQL:
   ```powershell
   psql -U postgres
   ```
   Then:
   ```sql
   ALTER USER nrg_user WITH PASSWORD 'nrg_password_123';
   \q
   ```

### Error: "database nrg_ecommerce does not exist"

**Solution:** Database wasn't created. Create it:

```powershell
psql -U postgres
```

Then:
```sql
CREATE DATABASE nrg_ecommerce;
GRANT ALL PRIVILEGES ON DATABASE nrg_ecommerce TO nrg_user;
\q
```

### Error: "connect ECONNREFUSED 127.0.0.1:5432"

**Solution:** PostgreSQL service is not running

```powershell
# Start PostgreSQL service
Start-Service postgresql-x64-16
```

Or restart it:
```powershell
Restart-Service postgresql-x64-16
```

Check status:
```powershell
Get-Service postgresql-x64-16
```

Should show: `Running`

---

## 📊 Verify Database Setup

### List Databases

```powershell
psql -U postgres -l
```

Should show `nrg_ecommerce` in the list.

### List Tables

```powershell
psql -U nrg_user -d nrg_ecommerce -c "\dt"
```

After migration, should show 20 tables:
```
users, categories, brands, products, product_variants,
product_images, inventory, carts, cart_items, addresses,
orders, order_items, payments, shipments, reviews,
coupons, returns, service_requests, audit_logs, etc.
```

### Check Admin User

```powershell
psql -U nrg_user -d nrg_ecommerce -c "SELECT email, role FROM users LIMIT 1;"
```

Should show:
```
      email       | role
-----------------+-------
admin@nrg.com | admin
```

---

## 🔄 Start/Stop PostgreSQL Service

### Start

```powershell
Start-Service postgresql-x64-16
```

### Stop

```powershell
Stop-Service postgresql-x64-16
```

### Restart

```powershell
Restart-Service postgresql-x64-16
```

### Check Status

```powershell
Get-Service postgresql-x64-16
```

---

## 📝 Quick Reference

| Command | Purpose |
|---------|---------|
| `psql --version` | Check installation |
| `psql -U postgres` | Connect as superuser |
| `psql -U nrg_user -d nrg_ecommerce` | Connect as app user |
| `\l` | List databases |
| `\dt` | List tables |
| `\du` | List users/roles |
| `\q` | Exit psql |
| `\h CREATE DATABASE` | Show help for command |

---

## ✅ You're Ready!

After completing all steps:

1. ✅ PostgreSQL installed
2. ✅ Database created
3. ✅ User created with permissions
4. ✅ .env configured
5. ✅ Migrations ready to run
6. ✅ Seeds ready to populate

**Next:**
```powershell
cd d:\python\NRG\backend
npm run migrate
npm run seed
npm run dev
```

Then in another terminal:
```powershell
cd d:\python\NRG\frontend
npm start
```

Open `http://localhost:3000` and login with `admin@nrg.com` / `admin@123`

---

**Need help?** Check the troubleshooting section above or review the main `README.md`

