# 💡 Development Tips & Best Practices

## Backend Development

### Running Commands

```bash
# Development (watch mode, auto-reload)
npm run dev

# Build TypeScript
npm run build

# Production (runs dist/index.js)
npm start

# Database migrations
npm run migrate

# Seed sample data
npm run seed

# Run tests
npm test
```

### Database Management

```bash
# Connect to PostgreSQL CLI
psql -U user -d nrg_ecommerce

# Common SQL queries
SELECT * FROM products WHERE category_id = '...';
SELECT * FROM orders WHERE user_id = '...';

# Reset database (caution!)
npm run migrate   # Re-creates all tables
```

### Adding New API Endpoints

1. **Create route file** in `src/routes/`
2. **Define handler functions** with request/response types
3. **Add to Express app** in `src/index.ts`
4. **Import middleware** for auth/admin checks

Example:
```typescript
// src/routes/example.ts
import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/example', authMiddleware, async (req: Request, res: Response) => {
  // Your handler
});

export default router;
```

### Debugging

```bash
# Add debug statements
console.log('Debug:', variable);

# VSCode Debugging
# Add breakpoints, press F5 (requires launch.json)
```

---

## Frontend Development

### Running Commands

```bash
# Development (hot reload)
npm start

# Build for production
npm build

# Run tests
npm test

# Analyze build size
npm run build -- --analyze
```

### Component Structure

**Good Component Pattern:**
```typescript
import React, { useState } from 'react';

interface Props {
  title: string;
  onAction?: () => void;
}

export default function MyComponent({ title, onAction }: Props) {
  const [state, setState] = useState(false);

  return (
    <div className="flex items-center gap-4">
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  );
}
```

### Using State Management

```typescript
// Read from store
import { useAuthStore } from './store/authStore';

function MyComponent() {
  const { user, isAuthenticated } = useAuthStore();
  
  return <div>{user?.email}</div>;
}

// Update store
const { setAuth, logout } = useAuthStore();
setAuth(userData, token);
logout();
```

### Making API Calls

```typescript
import { productsAPI, authAPI } from '../api/client';
import toast from 'react-hot-toast';

const handleFetch = async () => {
  try {
    const res = await productsAPI.getAll({ page: 1 });
    console.log(res.data.products);
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Error');
  }
};
```

### Styling with Tailwind

```tsx
// Responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Common patterns
className="flex items-center justify-between"
className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2"
className="border border-gray-300 rounded-lg shadow-md"

// Conditional classes
className={`button ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
```

---

## Common Tasks

### Adding a New Product Field

1. **Backend:**
   - Modify `CREATE TABLE products` in `backend/scripts/migrate.ts`
   - Update insert query in `admin.ts` route
   - Add validation

2. **Frontend:**
   - Update product form in ProductManagement page
   - Add field to product display pages

### Creating a New Admin Feature

1. Create page in `frontend/src/pages/admin/NewFeature.tsx`
2. Create API endpoints in `backend/src/routes/admin.ts`
3. Add route in `frontend/src/App.tsx`
4. Add navigation link in `components/Navigation.tsx`

### Handling Authentication Errors

```typescript
// Automatic redirect on 401 in future enhancement
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Performance Tips

### Backend
- ✅ Use database indexes for frequently queried columns
- ✅ Implement pagination for large result sets
- ✅ Cache product lists with Redis (future)
- ✅ Use connection pooling (configured in database.ts)
- ✅ Add request logging middleware

### Frontend
- ✅ Code splitting with React.lazy()
- ✅ Image optimization & lazy loading
- ✅ Memoize components with React.memo()
- ✅ Debounce search/filter operations
- ✅ Use virtual scrolling for large lists

---

## Testing Strategies

### Backend Testing

```bash
# Unit tests for auth
npm test -- auth.test.ts

# Integration tests for API
npm test -- routes.integration.test.ts

# Test database queries
npm test -- database.test.ts
```

### Frontend Testing

```bash
# Component tests
npm test -- Login.test.tsx

# Integration tests
npm test -- App.integration.test.tsx

# E2E tests with Cypress
npx cypress open
```

---

## Troubleshooting Common Issues

### Issue: TypeScript Compilation Errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Database Connection Fails

**Check:**
```bash
# PostgreSQL running?
psql --version

# Database exists?
psql -l | grep nrg_ecommerce

# Correct credentials in .env?
cat backend/.env | grep DATABASE
```

### Issue: API Response is Null

**Debug:**
```typescript
// Add logging in route
console.log('Query params:', req.query);
console.log('Request body:', req.body);
console.log('Database result:', result.rows);
```

### Issue: UI Not Updating After State Change

**Ensure:**
- Using proper Zustand syntax: `set({ value: newValue })`
- Component is imported correctly
- Not mutating state directly

---

## Environment Variables Reference

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nrg_ecommerce

# Authentication
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRE=7d

# Razorpay (Test Keys)
RAZORPAY_KEY_ID=rzp_test_xxxxxxx
RAZORPAY_KEY_SECRET=xxxxx

# Optional - AWS S3
AWS_S3_BUCKET=nrg-products
AWS_REGION=us-east-1

# Optional - Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY=rzp_test_xxxxxxx
```

---

## Useful Resources

### Documentation
- [Express.js Docs](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Razorpay Integration](https://razorpay.com/docs/api/)
- [Zustand Docs](https://zustand-demo.vercel.app/)

### Tools
- **Postman** - API testing
- **pgAdmin** - Database GUI
- **Git** - Version control
- **VSCode** - Code editor
- **Chrome DevTools** - Frontend debugging

---

## Code Style Guide

### TypeScript
```typescript
// ✅ Good
const getUserById = async (id: string): Promise<User> => {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

// ❌ Avoid
const getUser = async (id) => {
  const r = await query('SELECT * FROM users WHERE id = $1', [id]);
  return r.rows[0];
};
```

### Component Props
```typescript
// ✅ Good - Use interfaces for props
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

// ❌ Avoid - Any types
const Button = ({ label, onClick, disabled }: any) => { ... }
```

### Error Handling
```typescript
// ✅ Good
try {
  await someAsyncOperation();
} catch (error: any) {
  console.error('Operation failed:', error);
  res.status(500).json({ error: 'Failed to complete' });
}

// ❌ Avoid
try {
  await someAsyncOperation();
} catch (e) {
  res.json({ error: e });
}
```

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/add-wishlist

# Commit changes
git add .
git commit -m "feat: add wishlist feature"

# Push to remote
git push origin feature/add-wishlist

# Merge to main
git checkout main
git merge feature/add-wishlist
git push origin main
```

---

## Deployment Checklist

- [ ] Set production environment variables
- [ ] Database backup configured
- [ ] SSL certificates installed
- [ ] Rate limiting enabled
- [ ] CORS configured for production domain
- [ ] Error logging configured
- [ ] Monitoring setup (e.g., New Relic)
- [ ] CDN configured for static assets
- [ ] Database migrations run
- [ ] Seed data cleared (except defaults)
- [ ] Email service configured
- [ ] Payment gateway in production mode

---

## Contributing Guidelines

1. **Code Quality**
   - Use TypeScript strictly
   - Write meaningful variable names
   - Add JSDoc comments for public functions

2. **Commit Messages**
   - Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
   - Example: `feat: add product search filter`

3. **Testing**
   - Write tests for new features
   - Aim for 80%+ code coverage
   - Test edge cases

4. **Documentation**
   - Update README for new features
   - Document API changes
   - Add inline comments for complex logic

---

Happy coding! 🚀
