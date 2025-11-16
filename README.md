# NRG E-Commerce Platform

A full-stack e-commerce platform for selling batteries, solar panels, and related accessories. Built with Node.js/Express backend and React frontend, featuring admin dashboard, product management, inventory control, and payment processing.

## 📋 Project Structure

```
NRG/
├── backend/              # Node.js + Express backend
│   ├── src/
│   │   ├── index.ts      # Main server entry point
│   │   ├── config/       # Database configuration
│   │   ├── middleware/   # Auth, CORS middleware
│   │   ├── routes/       # API endpoints
│   │   └── utils/        # Helper functions
│   ├── scripts/
│   │   └── migrate.ts    # Database migrations
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/             # React frontend
    ├── src/
    │   ├── App.tsx       # Main app component
    │   ├── pages/        # Page components
    │   ├── components/   # Reusable components
    │   ├── store/        # Zustand state management
    │   ├── api/          # API client
    │   └── index.tsx     # React entry point
    ├── package.json
    └── tsconfig.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- PostgreSQL 12+
- Razorpay account (for payments)

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://user:password@localhost:5432/nrg_ecommerce
   JWT_SECRET=your_secret_key_here
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

3. **Run database migrations:**
   ```bash
   npm run migrate
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   App runs on `http://localhost:3000`

## 🔑 Key Features

### Customer Features
- ✅ User registration & login with JWT auth
- ✅ Browse products with filters (price, brand, specs)
- ✅ Add to cart & checkout
- ✅ Razorpay payment integration
- ✅ Order tracking with shipment info
- ✅ Account management & order history
- ✅ Product reviews & ratings

### Admin Features
- ✅ Product CRUD (create, read, update, delete)
- ✅ Product variants management
- ✅ Inventory tracking & stock management
- ✅ Order processing workflow (pending → shipped → delivered)
- ✅ Shipment management with tracking
- ✅ Sales analytics & top products report
- ✅ Coupon management

## 📡 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+91-9876543210"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Products Endpoints

#### Get All Products
```http
GET /api/products?category=batteries&minPrice=1000&maxPrice=10000&page=1&limit=20
```

#### Get Product Details
```http
GET /api/products/:id
```

### Cart Endpoints

#### Get Cart
```http
GET /api/cart
Authorization: Bearer <token>
```

#### Add to Cart
```http
POST /api/cart/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "variant_id": "uuid",
  "quantity": 1
}
```

### Orders Endpoints

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "shipping_address_id": "uuid",
  "billing_address_id": "uuid",
  "coupon_code": "SUMMER20"
}
```

#### Get User Orders
```http
GET /api/orders
Authorization: Bearer <token>
```

### Payments Endpoints

#### Create Payment Order
```http
POST /api/payments/create-order
Content-Type: application/json

{
  "orderId": "uuid",
  "amount": 5000
}
```

#### Verify Payment
```http
POST /api/payments/verify
Content-Type: application/json

{
  "orderId": "uuid",
  "razorpay_order_id": "order_id",
  "razorpay_payment_id": "payment_id",
  "razorpay_signature": "signature"
}
```

### Admin Endpoints

#### Create Product
```http
POST /api/admin/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Solar Panel 400W",
  "category_id": "uuid",
  "brand_id": "uuid",
  "base_price": 25000,
  "offer_price": 22000,
  "warranty_months": 25,
  "description": "High efficiency mono-crystalline solar panel",
  "specifications": {
    "wattage": "400W",
    "efficiency": "21.5%",
    "dimensions": "1956x992x40mm"
  }
}
```

#### Publish Product
```http
POST /api/admin/products/:productId/publish
Authorization: Bearer <admin-token>
```

#### Add Product Variant
```http
POST /api/admin/products/:productId/variants
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "100Ah variant",
  "attributes": {
    "capacity": "100Ah",
    "voltage": "48V"
  },
  "price": 15000,
  "stock_quantity": 50
}
```

#### Update Order Status
```http
PATCH /api/admin/orders/:orderId/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "shipped"
}
```

#### Create Shipment
```http
POST /api/admin/orders/:orderId/shipment
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "tracking_number": "SHIP123456",
  "carrier": "Fedex",
  "estimated_delivery": "2024-01-20"
}
```

#### Get Sales Analytics
```http
GET /api/admin/analytics/sales?from=2024-01-01&to=2024-01-31
Authorization: Bearer <admin-token>
```

## 🗄️ Database Schema

### Core Tables
- **users** - Customer & admin accounts
- **categories** - Product categories
- **brands** - Product brands
- **products** - Product listings
- **product_variants** - Product variants (Ah, voltage, wattage)
- **product_images** - Product gallery
- **inventory** - Stock tracking
- **carts** - Shopping carts
- **cart_items** - Items in cart
- **orders** - Customer orders
- **order_items** - Items in orders
- **payments** - Payment records
- **shipments** - Shipping info
- **reviews** - Product reviews
- **coupons** - Discount codes
- **returns** - Return requests
- **service_requests** - Support tickets

See `backend/scripts/migrate.ts` for complete schema.

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Role-based access control (RBAC)
- ✅ Razorpay payment signature verification
- ✅ SQL injection prevention via parameterized queries
- ✅ CORS middleware for API protection

## 📦 Dependencies

### Backend
- **express** - Web framework
- **pg** - PostgreSQL client
- **jsonwebtoken** - JWT auth
- **bcryptjs** - Password hashing
- **razorpay** - Payment gateway
- **cors** - Cross-origin requests

### Frontend
- **react** - UI library
- **react-router-dom** - Routing
- **axios** - HTTP client
- **zustand** - State management
- **react-hot-toast** - Notifications
- **lucide-react** - Icons
- **tailwindcss** - Styling (via React Scripts)

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/nrg_ecommerce
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
AWS_S3_BUCKET=nrg-products
AWS_REGION=us-east-1
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_password
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY=your_razorpay_public_key
```

## 🛠️ Development Workflow

1. **Backend Development**
   ```bash
   cd backend
   npm run dev    # Watch mode with hot reload
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm start      # Development server with hot reload
   ```

3. **Database Migrations**
   ```bash
   cd backend
   npm run migrate  # Run migrations on schema change
   ```

## 📦 Build & Deployment

### Build Backend
```bash
cd backend
npm run build
npm start    # Run production build
```

### Build Frontend
```bash
cd frontend
npm run build
# Outputs to build/ directory
```

## 🚀 Deployment Checklist

- [ ] Set production environment variables
- [ ] Configure PostgreSQL database
- [ ] Set up Razorpay production credentials
- [ ] Configure AWS S3 for image storage
- [ ] Enable HTTPS
- [ ] Set up email service (SMTP)
- [ ] Configure CORS for production domain
- [ ] Set up logging and monitoring
- [ ] Run database migrations
- [ ] Build and test production build

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify credentials

### JWT Token Expired
```
Error: Invalid or expired token
```
- Clear browser localStorage
- Login again
- Check JWT_SECRET and JWT_EXPIRE settings

### Razorpay Payment Failed
- Verify Razorpay keys in .env
- Check payment amount in paise (multiply by 100)
- Validate webhook signature

## 📞 Support

For issues, create a GitHub issue or contact development team.

## 📄 License

ISC License

---

**Built with ❤️ for solar & battery commerce**
