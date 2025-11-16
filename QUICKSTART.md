cd # 🚀 NRG E-Commerce Platform - Quick Start Guide

Welcome! This is a complete full-stack e-commerce solution for batteries and solar products.

## ⚡ 5-Minute Quick Start

### 1️⃣ Backend Setup (3 min)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your settings (DATABASE_URL, RAZORPAY_KEYS, etc.)
nano .env  # or use your editor

# Run database migrations
npm run migrate

# (Optional) Seed sample data
npm run seed

# Start development server
npm run dev
```

**✅ Backend running on:** `http://localhost:5000`

### 2️⃣ Frontend Setup (2 min)

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

**✅ Frontend running on:** `http://localhost:3000`

---

## 🔓 Test Login Credentials

After running `npm run seed`, use these credentials:

- **Email:** `admin@nrg.com`
- **Password:** `admin@123`
- **Role:** Admin (access to `/admin` dashboard)

**→ Go to:** `http://localhost:3000/login`

---

## 📁 Project Structure

```
backend/              # Node.js/Express API
  src/
    routes/           # API endpoints (auth, products, orders, payments)
    config/           # Database connection
    middleware/       # JWT auth, CORS
    utils/            # Helpers (auth, SKU generation)
  scripts/
    migrate.ts        # Create database schema
    seed.ts           # Insert sample data

frontend/             # React application
  src/
    pages/            # Customer & Admin pages
    components/       # Reusable UI components
    store/            # Zustand state (auth, cart)
    api/              # Axios HTTP client
```

---

## 🎯 Key Features Implemented

### ✅ Customer Features
- User registration & login
- Browse products with filters
- Add to cart
- Checkout with Razorpay payment
- Order history & tracking
- Account management

### ✅ Admin Features
- Product management (create, edit, publish)
- Product variants & specifications
- Inventory tracking
- Order processing workflow
- Shipment tracking
- Sales analytics

---

## 📡 Testing API Endpoints

Use **Postman** or **curl** to test. Get the token from login response:

### Example: Get All Products
```bash
curl http://localhost:5000/api/products?page=1&limit=20
```

### Example: Create Product (Admin only)
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Solar Panel 400W",
    "category_id": "category-uuid",
    "brand_id": "brand-uuid",
    "base_price": 25000,
    "offer_price": 22000
  }'
```

See **README.md** for complete API documentation.

---

## ⚙️ Environment Configuration

### Backend `.env`
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/nrg_ecommerce
JWT_SECRET=your_super_secret_key_change_in_production
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
```

### Frontend `.env`
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🐛 Troubleshooting

### ❌ Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Fix:** Make sure PostgreSQL is running:
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Start PostgreSQL service from Services
```

### ❌ Port Already in Use
```bash
# Change PORT in backend .env or kill process
lsof -ti:5000 | xargs kill -9  # macOS/Linux
```

### ❌ npm install fails
```bash
# Clear npm cache
npm cache clean --force
npm install
```

---

## 🚢 Deployment Ready

The project is structured for easy deployment:

**Backend:** Deploy to Heroku, AWS EC2, DigitalOcean, etc.
**Frontend:** Deploy to Vercel, Netlify, AWS S3+CloudFront, etc.

See README.md for deployment checklist.

---

## 📚 Next Steps

1. **Customize branding** - Update logo, colors in `frontend/src`
2. **Add email notifications** - Configure SMTP in backend
3. **Set up AWS S3** - For product image storage
4. **Integrate payment** - Configure production Razorpay keys
5. **Deploy to production** - Follow deployment checklist

---

## 💡 Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐
│   React App     │         │  Express Server  │
│  (Port 3000)    │◄────────►  (Port 5000)     │
└─────────────────┘         └──────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │   PostgreSQL DB  │
                            │  (Port 5432)     │
                            └──────────────────┘
                                     
                            ┌──────────────────┐
                            │  Razorpay API    │
                            │  (Payments)      │
                            └──────────────────┘
```

---

## 📞 Support & Resources

- **TypeScript Issues?** → See `tsconfig.json` files
- **API Docs?** → Check `README.md` API section
- **Database Schema?** → See `backend/scripts/migrate.ts`
- **Components?** → Check `frontend/src/components/`

---

## ✨ You're All Set!

🎉 Your e-commerce platform is ready to go!

**Next action:** Open `http://localhost:3000` and login with:
- Email: `admin@nrg.com`
- Password: `admin@123`

Happy coding! 🚀
