# PostgreSQL Database Setup Guide

## Windows Installation

### Option 1: Using PostgreSQL Installer (Recommended)

1. **Download PostgreSQL:**
   - Visit: https://www.postgresql.org/download/windows/
   - Download PostgreSQL 15 or 16

2. **Run the Installer:**
   - Run `postgresql-xx-x64.exe`
   - Click through the wizard
   - **Important:** Remember the password you set for the `postgres` user

3. **Installation Settings:**
   - Port: `5432` (default)
   - Locale: `[Default locale]`
   - Data Directory: `C:\Program Files\PostgreSQL\15\data` (default)

4. **Verify Installation:**
   ```powershell
   # Test PostgreSQL connection
   psql -U postgres
   ```
   If prompted for password, enter what you set during installation.

### Option 2: Using PostgreSQL Portable (No Installation)

1. Download portable PostgreSQL from: https://www.enterprisedb.com/download-postgresql-binaries
2. Extract to a folder like `C:\postgresql-portable`
3. Run `initdb` to initialize the database

### Option 3: Using WSL (Windows Subsystem for Linux)

```powershell
# In PowerShell (Windows Terminal)
wsl --install -d Ubuntu

# In WSL Ubuntu terminal
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

---

## Create Database and User

Once PostgreSQL is running:

### Step 1: Connect as Admin
```powershell
psql -U postgres
```

### Step 2: Create Database
```sql
CREATE DATABASE nrg_ecommerce;
```

### Step 3: Create Database User
```sql
CREATE USER nrg_user WITH PASSWORD 'nrg_password_123';
```

### Step 4: Grant Privileges
```sql
ALTER ROLE nrg_user SET client_encoding TO 'utf8';
ALTER ROLE nrg_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE nrg_user SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE nrg_ecommerce TO nrg_user;
```

### Step 5: Exit psql
```sql
\q
```

---

## Configure Backend `.env` File

Copy `.env.example` to `.env` in the backend folder:

```bash
cp backend\.env.example backend\.env
```

Edit `backend\.env`:

```env
PORT=5000
DATABASE_URL=postgresql://nrg_user:nrg_password_123@localhost:5432/nrg_ecommerce
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
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

---

## Verify Database Connection

```bash
# In backend folder
psql -U nrg_user -d nrg_ecommerce -h localhost
```

If you get a `psql` prompt, you're connected! Type `\q` to exit.

---

## Run Migrations

Once PostgreSQL is running and `.env` is configured:

```powershell
cd backend
npm run migrate
```

Expected output:
```
✅ Database connected successfully
✅ Migration tables created
✅ All migrations completed
```

---

## Seed Sample Data

```powershell
npm run seed
```

This creates:
- Admin user: `admin@nrg.com` / `admin@123`
- Sample categories, brands, products
- Test coupons

---

## Troubleshooting

### PostgreSQL Not Starting

**Windows Service:**
```powershell
# Check if service is running
Get-Service postgresql-x64-15

# Start service
Start-Service postgresql-x64-15

# Restart service
Restart-Service postgresql-x64-15
```

**Connection Refused Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

Solutions:
1. Ensure PostgreSQL is running: `Get-Service postgresql-x64-15`
2. Check DATABASE_URL in .env is correct
3. Verify credentials (user, password, database name)
4. Check port 5432 is accessible: `netstat -ano | findstr :5432`

### Password Authentication Failed

```
FATAL: password authentication failed for user "nrg_user"
```

Solution:
- Verify the password in DATABASE_URL matches what you set
- Reset password:
  ```sql
  ALTER USER nrg_user WITH PASSWORD 'new_password';
  ```

### Database Already Exists

```
ERROR: database "nrg_ecommerce" already exists
```

Solution:
- Drop and recreate:
  ```sql
  DROP DATABASE IF EXISTS nrg_ecommerce;
  CREATE DATABASE nrg_ecommerce;
  GRANT ALL PRIVILEGES ON DATABASE nrg_ecommerce TO nrg_user;
  ```

---

## Check Database Contents

```sql
-- Connect to database
psql -U nrg_user -d nrg_ecommerce

-- List tables
\dt

-- Check specific table
SELECT * FROM users LIMIT 5;
SELECT * FROM categories;

-- View schema
\d products
```

---

## Backup Database

```powershell
# Backup
pg_dump -U nrg_user -d nrg_ecommerce -f backup.sql

# Restore
psql -U nrg_user -d nrg_ecommerce -f backup.sql
```

---

## Quick Start Summary

1. **Install PostgreSQL** (Option 1, 2, or 3 above)
2. **Create database and user:**
   ```sql
   CREATE DATABASE nrg_ecommerce;
   CREATE USER nrg_user WITH PASSWORD 'nrg_password_123';
   GRANT ALL PRIVILEGES ON DATABASE nrg_ecommerce TO nrg_user;
   ```
3. **Configure `.env`** in backend folder
4. **Run migrations:**
   ```bash
   cd backend
   npm run migrate
   ```
5. **Seed data:**
   ```bash
   npm run seed
   ```
6. **Start server:**
   ```bash
   npm run dev
   ```

---

## Next Steps

After database setup:

1. Start backend: `npm run dev`
2. In another terminal, start frontend: `cd frontend && npm start`
3. Open http://localhost:3000
4. Login with: `admin@nrg.com` / `admin@123`

---

**Questions?** Check troubleshooting section or run `npm run migrate` with verbose output for more details.
