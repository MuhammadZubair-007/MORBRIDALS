# MÓRBRIDALS E-Commerce Setup Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Git (optional)

## Step 1: Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your values:
   ```env
   MONGODB_URI=mongodb+srv://fa23bse159_db_user:Cricketlover1@cluster0.gdb4yx5.mongodb.net/?appName=Cluster0
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
   NODE_ENV=development
   ```

   **Important:** Change `JWT_SECRET` to a secure random string in production!

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Create Admin Account

Run the admin creation script:

```bash
npm run create-admin
```

This creates an admin user with:
- **Email:** admin@morbridals.com
- **Password:** admin123

**Important:** Change these credentials after first login!

## Step 4: Seed Database (Optional)

To populate the database with sample products and categories:

```bash
npm run seed
```

This will create:
- 6 categories (Unstitched, Stitched, Casual, Formal, Bridal, Clutches & Jewelry)
- 10+ sample products
- Sample data for testing

## Step 5: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 6: Access Admin Dashboard

1. Navigate to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Login with the admin credentials:
   - Email: admin@morbridals.com
   - Password: admin123

## Features Implemented

### 1. Admin Authentication System
- Secure login with email + password
- Password hashing using bcryptjs
- JWT-based authentication
- Session persistence with localStorage
- Protected admin routes

### 2. Role-Based Access Control (RBAC)
- User vs Admin roles
- Only admins can:
  - Access admin dashboard
  - Create/update/delete products
  - Manage orders & categories
  - View analytics

### 3. Admin Dashboard
- **Products Tab:**
  - View all products with images
  - Add new products with image upload
  - Edit existing products
  - Delete products (with option to delete images)
  - Filter by category
  - Toggle featured/stock status

- **Categories Tab:**
  - View all categories
  - Category image management

- **Orders Tab:**
  - View all orders
  - Order status management
  - Customer details

### 4. API Protection Middleware
- Protect `/api/products` (write operations)
- Protect `/api/orders`
- Protect `/api/categories`
- Block unauthenticated users
- Block non-admin users from admin endpoints

### 5. File Upload System
- Upload product images
- Automatic file management
- Option to delete files when deleting products
- Supports multiple image formats (JPG, PNG, WebP)

### 6. Database Schemas
- **Users:** Authentication & role management
- **Products:** Full product catalog
- **Categories:** Product organization
- **Orders:** Order tracking & management
- **Cart:** Shopping cart functionality

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user/admin

### Products
- `GET /api/products` - Get all products
- `GET /api/products?category=Bridal` - Filter by category
- `GET /api/products?featured=true` - Get featured products
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/[id]` - Update product (admin only)
- `DELETE /api/products/[id]` - Delete product (admin only)
- `DELETE /api/products/[id]?deleteImages=true` - Delete with images

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/[id]` - Update category (admin only)
- `DELETE /api/categories/[id]` - Delete category (admin only)

### Orders
- `GET /api/orders` - Get all orders (admin only)
- `POST /api/orders` - Create order
- `PUT /api/orders/[id]` - Update order status (admin only)

### File Upload
- `POST /api/upload` - Upload file (returns URL)

## Security Features

1. **Password Hashing:** All passwords hashed with bcryptjs (12 rounds)
2. **JWT Tokens:** Secure authentication tokens (7-day expiry)
3. **Role Verification:** Middleware checks user roles
4. **API Protection:** Protected endpoints require authentication
5. **Environment Variables:** Sensitive data in .env.local
6. **Input Validation:** Server-side validation for all inputs

## Troubleshooting

### MongoDB Connection Issues
- Verify your MongoDB URI is correct
- Check network access in MongoDB Atlas
- Ensure IP address is whitelisted

### Admin Login Not Working
- Run `npm run create-admin` again
- Check that JWT_SECRET is set in .env.local
- Clear browser localStorage and try again

### Products Not Showing
- Check MongoDB connection
- Run `npm run seed` to add sample data
- Check console for errors

### Image Upload Failing
- Verify file size (max 5MB recommended)
- Check supported formats (JPG, PNG, WebP)
- Ensure proper permissions on upload directory

## Production Deployment

1. Change JWT_SECRET to a secure random string
2. Update MongoDB URI to production database
3. Change admin password after first login
4. Enable HTTPS
5. Set NODE_ENV=production
6. Configure proper CORS settings
7. Set up CDN for images (optional)
8. Enable rate limiting (recommended)

## Support

For issues or questions, please refer to:
- API Documentation: `/API_DOCUMENTATION.md`
- Main README: `/README.md`

---

**MÓRBRIDALS** - Elegance Redefined
