# 📁 Project Structure & File Guide

Complete directory structure and file descriptions for the NRG E-Commerce Platform.

## 📂 Root Directory

```
NRG/
├── .gitignore                 # Git ignore file
├── README.md                  # Complete project documentation (500+ lines)
├── QUICKSTART.md              # 5-minute quick start guide
├── BUILDSTATUS.md             # Build completion summary
├── DEVTIPS.md                 # Development tips & best practices
├── PROJECT_STRUCTURE.md       # This file
│
├── backend/                   # Node.js/Express backend (REST API)
│   ├── src/
│   │   ├── index.ts           # Express server main entry point
│   │   ├── config/
│   │   │   └── database.ts    # PostgreSQL connection pool
│   │   ├── middleware/
│   │   │   └── auth.ts        # JWT auth, admin, customer middleware
│   │   ├── routes/
│   │   │   ├── auth.ts        # Register, login endpoints
│   │   │   ├── products.ts    # Product search & display
│   │   │   ├── cart.ts        # Shopping cart operations
│   │   │   ├── orders.ts      # Order management
│   │   │   ├── payments.ts    # Razorpay integration
│   │   │   └── admin.ts       # Admin product/order/inventory management
│   │   └── utils/
│   │       └── auth.ts        # JWT, password, SKU utilities
│   ├── scripts/
│   │   ├── migrate.ts         # Database schema creation (20 tables)
│   │   └── seed.ts            # Sample data seeding
│   ├── package.json           # Backend dependencies
│   ├── tsconfig.json          # TypeScript configuration
│   ├── loader.js              # TypeScript loader
│   ├── .env.example           # Environment variables template
│   └── README.md              # Backend-specific docs
│
└── frontend/                  # React frontend (SPA)
    ├── src/
    │   ├── App.tsx            # Main app router (11+ routes)
    │   ├── index.tsx          # React entry point
    │   ├── index.css          # Tailwind CSS + globals
    │   ├── api/
    │   │   └── client.ts      # Axios HTTP client + endpoints
    │   ├── components/
    │   │   ├── Navigation.tsx  # Header with cart & auth
    │   │   └── PrivateRoute.tsx # Protected route component
    │   ├── store/
    │   │   ├── authStore.ts   # Zustand auth state
    │   │   └── cartStore.ts   # Zustand cart state
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── Login.tsx      # Email/password login
    │   │   │   └── Register.tsx   # User registration
    │   │   ├── customer/
    │   │   │   ├── ProductListing.tsx    # Browse & filter products
    │   │   │   ├── ProductDetail.tsx     # Product specs & reviews
    │   │   │   ├── Cart.tsx              # Shopping cart
    │   │   │   ├── Checkout.tsx         # Address, coupon, payment
    │   │   │   ├── OrderConfirmation.tsx # Thank you page
    │   │   │   ├── OrderTracking.tsx    # Shipment tracking
    │   │   │   └── Account.tsx          # Profile & orders
    │   │   └── admin/
    │   │       ├── Dashboard.tsx        # Overview & KPIs
    │   │       ├── ProductManagement.tsx # Create/edit products
    │   │       ├── InventoryManagement.tsx # Stock management
    │   │       ├── OrderManagement.tsx  # Process orders
    │   │       └── Analytics.tsx        # Sales reports
    │   └── public/
    │       └── index.html     # HTML template
    ├── package.json           # Frontend dependencies
    ├── tsconfig.json          # TypeScript config
    ├── tsconfig.node.json     # Node TypeScript config
    └── .env.example           # Environment template

```

---

## 🔧 Backend File Descriptions

### Core Application

**`backend/src/index.ts`** (35 lines)
- Express server initialization
- Middleware setup (CORS, JSON parsing)
- Route registration for all endpoints
- Server listener on configurable port
- Health check endpoint

**`backend/src/config/database.ts`** (35 lines)
- PostgreSQL connection pool
- Query execution wrapper with logging
- Error handling for database operations
- Connection pooling configuration

### Middleware

**`backend/src/middleware/auth.ts`** (50 lines)
- JWT token verification
- Auth middleware for protected routes
- Admin middleware for admin-only access
- Customer middleware for customer-only access
- Optional auth middleware for open routes

### Routes (40+ API Endpoints)

**`backend/src/routes/auth.ts`** (95 lines)
- `POST /auth/register` - Create new account
- `POST /auth/login` - Authenticate user
- `GET /auth/me` - Get current user profile
- Password hashing & comparison
- JWT token generation & validation

**`backend/src/routes/products.ts`** (140 lines)
- `GET /products` - List products with filters
- `GET /products/:id` - Get product details
- `GET /search/suggestions` - Auto-complete search
- Filter by price, category, brand, specs
- Pagination support

**`backend/src/routes/cart.ts`** (130 lines)
- `GET /cart` - Get user's cart
- `POST /cart/items` - Add to cart
- `DELETE /cart/items/:itemId` - Remove item
- `PATCH /cart/items/:itemId` - Update quantity
- `DELETE /cart` - Clear cart
- Cart auto-creation on first use

**`backend/src/routes/orders.ts`** (160 lines)
- `POST /orders` - Create order from cart
- `GET /orders` - List user orders
- `GET /orders/:id` - Get order details
- `POST /orders/:id/cancel` - Cancel order
- Coupon validation & discount calculation
- Automatic cart clearing after order

**`backend/src/routes/payments.ts`** (170 lines)
- `POST /payments/create-order` - Create Razorpay order
- `POST /payments/verify` - Verify payment
- `POST /payments/refund` - Process refund
- HMAC signature verification
- Order status updates on payment success

**`backend/src/routes/admin.ts`** (280 lines)
- **Product Management:**
  - `POST /admin/products` - Create product
  - `PATCH /admin/products/:id` - Edit product
  - `POST /admin/products/:id/publish` - Publish to live
  - `POST /admin/products/:id/variants` - Add variants
  - `POST /admin/products/:id/images` - Add images

- **Inventory:**
  - `PATCH /admin/inventory/:id` - Adjust stock

- **Orders:**
  - `GET /admin/orders` - List all orders
  - `PATCH /admin/orders/:id/status` - Update status
  - `POST /admin/orders/:id/shipment` - Create shipment

- **Analytics:**
  - `GET /admin/analytics/sales` - Sales by date
  - `GET /admin/analytics/top-products` - Top sellers

### Utilities

**`backend/src/utils/auth.ts`** (40 lines)
- `generateToken()` - Create JWT
- `verifyToken()` - Validate JWT
- `hashPassword()` - Bcrypt hashing
- `comparePassword()` - Password verification
- `generateId()` - UUID generation
- `generateSKU()` - Unique SKU creation

### Database & Scripts

**`backend/scripts/migrate.ts`** (300+ lines)
- 20 tables created with proper schema
- Indexes on frequently queried columns
- Foreign key relationships
- NOT NULL constraints
- Default values & timestamps
- JSONB support for flexible specs

**`backend/scripts/seed.ts`** (150 lines)
- Admin user creation
- Sample categories (3)
- Sample brands (5)
- Sample product with variants
- Sample coupons
- Dummy data for testing

### Configuration Files

**`backend/package.json`**
- express, pg, jsonwebtoken, bcryptjs
- razorpay, cors, multer, dotenv
- TypeScript, tsx, Jest

**`backend/tsconfig.json`**
- ES2020 target
- ESModule resolution
- Strict type checking enabled

---

## 🎨 Frontend File Descriptions

### Core Application

**`frontend/src/App.tsx`** (60 lines)
- React Router setup with 11+ routes
- Public routes (login, register, products)
- Protected routes with PrivateRoute component
- Admin routes with role-based access
- Global toast notification provider

**`frontend/src/index.tsx`** (10 lines)
- React DOM root mounting
- Strict mode enabled for development

**`frontend/src/index.css`** (20 lines)
- Tailwind CSS directives
- Global styles
- Typography setup

### API Integration

**`frontend/src/api/client.ts`** (80 lines)
- Axios instance with interceptors
- Automatic JWT token injection
- Error handling
- Organized API endpoint groups:
  - authAPI (register, login, me)
  - productsAPI (getAll, getById, search)
  - cartAPI (get, add, remove, update, clear)
  - ordersAPI (create, getAll, getById, cancel)
  - paymentsAPI (createOrder, verify, refund)
  - adminAPI (products, inventory, orders, analytics)

### State Management

**`frontend/src/store/authStore.ts`** (30 lines)
- User data storage
- JWT token storage
- Authentication state
- Login/logout actions
- Persistent storage via localStorage

**`frontend/src/store/cartStore.ts`** (55 lines)
- Cart items array
- Add/remove/update operations
- Clear cart action
- Total price calculation
- Variant ID & quantity tracking

### Components

**`frontend/src/components/Navigation.tsx`** (100 lines)
- Header with branding
- Navigation links (products, admin, account)
- Shopping cart icon with item count
- User menu (login/logout)
- Mobile responsive menu
- Role-based navigation visibility

**`frontend/src/components/PrivateRoute.tsx`** (15 lines)
- Route protection with authentication check
- Role-based access control (adminOnly prop)
- Redirect to login if not authenticated
- Redirect to home if not admin

### Pages - Authentication

**`frontend/src/pages/auth/Login.tsx`** (80 lines)
- Email & password input fields
- Form validation
- API call to login endpoint
- Token storage in Zustand
- Role-based redirect (admin → /admin, customer → /)
- Loading state handling
- Toast error notifications

**`frontend/src/pages/auth/Register.tsx`** (120 lines)
- First name, last name, email, phone fields
- Password input
- Form validation
- User creation via API
- Auto-login on successful registration
- Clear error messages

### Pages - Customer

**`frontend/src/pages/customer/ProductListing.tsx`** (Stub)
- Product grid with filters
- Search functionality
- Category & brand filtering
- Price range slider
- Pagination
- Add to cart buttons

**`frontend/src/pages/customer/ProductDetail.tsx`** (Stub)
- Product gallery (multiple images)
- Product specifications (dynamic JSON display)
- Variant selector (capacity, voltage, etc.)
- Warranty information
- Customer reviews & ratings
- Related products
- Add to cart functionality

**`frontend/src/pages/customer/Cart.tsx`** (Stub)
- Cart items display
- Quantity adjustment
- Remove item action
- Cart total calculation
- Continue shopping link
- Proceed to checkout button

**`frontend/src/pages/customer/Checkout.tsx`** (Stub)
- Shipping address selection/creation
- Billing address toggle
- Coupon code input
- Order summary
- Razorpay payment integration
- Order confirmation

**`frontend/src/pages/customer/OrderConfirmation.tsx`** (Stub)
- Order number display
- Thank you message
- Order details summary
- Download invoice button
- Track order link
- Continue shopping button

**`frontend/src/pages/customer/OrderTracking.tsx`** (Stub)
- Order status timeline
- Shipment details
- Tracking number & carrier
- Estimated delivery date
- Actual delivery date
- Download invoice
- Return/support request buttons

**`frontend/src/pages/customer/Account.tsx`** (Stub)
- User profile information
- Address management (add/edit/delete)
- Order history with status
- Download invoices
- Return requests
- Support tickets

### Pages - Admin

**`frontend/src/pages/admin/Dashboard.tsx`** (Stub)
- KPI cards (total sales, orders, customers)
- Recent orders list
- Top products
- Sales chart by date
- Inventory alerts
- Quick action buttons

**`frontend/src/pages/admin/ProductManagement.tsx`** (Stub)
- Product listing table
- Search & filter
- Create new product form
- Edit product modal
- Variant management
- Image upload gallery
- Publish/draft toggle

**`frontend/src/pages/admin/InventoryManagement.tsx`** (Stub)
- Variant list with stock levels
- Add/remove stock buttons
- Stock movement history
- Low stock alerts
- Bulk adjustments
- Export inventory report

**`frontend/src/pages/admin/OrderManagement.tsx`** (Stub)
- Orders table with filters
- Order status dropdown
- Order details modal
- Shipment creation form
- Tracking number input
- Mark as delivered
- Refund button

**`frontend/src/pages/admin/Analytics.tsx`** (Stub)
- Sales chart (line/bar)
- Revenue by date range
- Top 10 products
- Customer metrics
- Order metrics
- Downloadable reports

### Public Assets

**`frontend/public/index.html`** (20 lines)
- HTML template
- Root div for React mounting
- Meta tags (viewport, charset, description)
- Title & favicon

---

## 📊 Database Schema (20 Tables)

| Table | Purpose | Key Columns |
|-------|---------|------------|
| users | Customer & admin accounts | id, email, password_hash, role |
| categories | Product categories | id, name, slug |
| brands | Product brands | id, name, logo_url |
| products | Product listings | id, name, sku, category_id, brand_id |
| product_variants | Size/capacity variants | id, product_id, sku, attributes |
| product_images | Product gallery | id, product_id, image_url, is_primary |
| inventory | Stock tracking | id, variant_id, stock_quantity |
| carts | Shopping carts | id, user_id |
| cart_items | Items in cart | id, cart_id, variant_id, quantity |
| addresses | Shipping addresses | id, user_id, street, city, state |
| orders | Customer orders | id, user_id, order_status, total_amount |
| order_items | Items in order | id, order_id, variant_id, quantity |
| payments | Razorpay payments | id, order_id, razorpay_payment_id |
| shipments | Shipping information | id, order_id, tracking_number |
| reviews | Product reviews | id, product_id, user_id, rating |
| coupons | Discount codes | id, code, discount_type, discount_value |
| returns | Return requests | id, order_id, status, refund_amount |
| service_requests | Support tickets | id, user_id, type, description |
| audit_logs | System audit trail | id, user_id, action, entity_type |

---

## 📋 Configuration Files

**`.env.example`** (Backend)
- PORT, NODE_ENV, DATABASE_URL
- JWT_SECRET, JWT_EXPIRE
- RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
- AWS_S3_BUCKET, AWS_REGION
- SMTP configuration

**`package.json`** (Backend)
- 15+ npm dependencies
- Scripts: dev, build, start, migrate, seed
- TypeScript & dev tooling

**`tsconfig.json`** (Backend & Frontend)
- ES2020 target
- Module: ESNext
- Strict type checking

**`.gitignore`**
- node_modules/, dist/, build/
- .env files
- IDE configs (.vscode, .idea)
- Logs and OS files

---

## 🔗 Dependencies Summary

### Backend
```
Frameworks: express
Database: pg (PostgreSQL)
Auth: jsonwebtoken, bcryptjs
Payment: razorpay
HTTP: axios
Utilities: uuid, dotenv, cors, multer
Dev: TypeScript, tsx, jest
```

### Frontend
```
UI: react, react-dom
Routing: react-router-dom
State: zustand
HTTP: axios
UI Components: lucide-react
Notifications: react-hot-toast
Styling: tailwindcss (via react-scripts)
Dev: TypeScript, react-scripts
```

---

## 🚀 Start Development

```bash
# Terminal 1 - Backend
cd backend && npm install && npm run dev

# Terminal 2 - Frontend
cd frontend && npm install && npm start

# Terminal 3 - Database (if needed)
psql -U user -d nrg_ecommerce
```

**Access Points:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:5432

---

## 📚 Documentation Files

| File | Content |
|------|---------|
| README.md | Complete project docs (500+ lines) |
| QUICKSTART.md | 5-minute setup guide |
| BUILDSTATUS.md | Build completion summary |
| DEVTIPS.md | Dev tips & best practices |
| PROJECT_STRUCTURE.md | This file |

---

**Total Files:** 40+ | **Total Lines of Code:** 3000+ | **Coverage:** Full-stack e-commerce platform
