# MÓRBRIDALS - Next.js E-Commerce Website

This is a complete Next.js conversion of your HTML/CSS/Tailwind e-commerce website for MÓRBRIDALS, maintaining the exact same frontend design and user interface.

## 📁 Project Structure

```
├── app/
│   ├── page.tsx           # Homepage (index.html converted)
│   ├── category/page.tsx  # Category listing (specific_category.html converted)
│   ├── product/page.tsx   # Product details (discription.html converted)
│   ├── cart/page.tsx      # Shopping cart (AddToCart.html converted)
│   ├── shipping/page.tsx  # Shipping form (Shipping.html converted)
│   ├── login/page.tsx     # Login/Register (login.html converted)
│   ├── admin/             # Admin panel for managing products
│   │   ├── page.tsx       # Admin homepage
│   │   ├── products.tsx   # Product management
│   │   └── categories.tsx # Category management
│   ├── layout.tsx         # Root layout with fonts
│   └── globals.css        # Global styles
├── public/
│   ├── images/            # All your product images
│   └── uploads/           # Directory for uploaded files
└── README.md
```

## 🖼️ Image Placement Guide

### Already Included Images:
- ✅ `logo.jpg` - Your MÓRBRIDALS logo
- ✅ `slide1.jpg` - Hero carousel slide 1
- ✅ `slide2.jpg` - Hero carousel slide 2
- ✅ Product images from your uploads

### Where to Place Your Additional Images:

Create the following folder structure in your project:

```
public/
└── images/
    ├── logo.jpg (✅ Already added)
    ├── slide1.jpg (✅ Already added)
    ├── slide2.jpg (✅ Already added)
    ├── products/
    │   ├── bridal-1.jpg
    │   ├── bridal-2.jpg
    │   ├── formal-1.jpg
    │   ├── casual-1.jpg
    │   └── ... (add more product images)
    ├── categories/
    │   ├── unstitched.jpg
    │   ├── stitched.jpg
    │   ├── casual.jpg
    │   ├── formal.jpg
    │   ├── bridal.jpg
    │   └── accessories.jpg
    └── jewelry/
        └── clutches-jewelry.jpg
```

## 🎨 Design Features Preserved:

### From Original HTML:
1. ✅ **Announcement Bar** - Scrolling "Drop Your Order Now" / "Delivery all across the World!"
2. ✅ **Fixed Header** - With MÓRBRIDALS logo and brand name
3. ✅ **Hero Carousel** - 4 slides with auto-play (2000ms intervals)
4. ✅ **Brands Scrolling Section** - Horizontal infinite scroll animation
5. ✅ **Shop by Category** - 6 categories (Unstitched, Stitched, Casual, Formal, Bridal, Clutches & Jewelry)
6. ✅ **Second Hero Carousel** - Split layout with text and images
7. ✅ **Trending Now** - Product grid with hover effects
8. ✅ **Shop Our Instagram** - 6-column image grid
9. ✅ **Footer** - With newsletter signup and social media icons

### Color Scheme:
- Primary Navy: `#0a2463`
- Teal: `#14b8a6`
- Cream: `#e8dcc4`
- Light Cream: `#f5f0e8`

### Typography:
- **Headings**: Playfair Display (serif)
- **Body**: Poppins (sans-serif)

## 🚀 Getting Started

### Installation:

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production:

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 📋 Pages Overview

### 1. Homepage (`/`)
- Announcement bar with auto-scrolling messages
- Fixed header with menu, logo, search, and cart icons
- Hero carousel with 4 slides
- Brands scrolling section
- Shop by Category (6 categories)
- Second hero carousel
- Trending products section
- Shop Our Instagram section
- Footer with newsletter

### 2. Category Page (`/category`)
- Product listing with filters
- Sidebar with price range and category filters
- Product grid with hover effects
- Sorting options

### 3. Product Page (`/product`)
- Product image gallery
- Product details and description
- Size selection
- Quantity selector
- Add to cart button
- Related products section

### 4. Cart Page (`/cart`)
- Cart items list
- Quantity adjustment
- Remove items
- Order summary
- Proceed to checkout

### 5. Shipping Page (`/shipping`)
- Shipping information form
- Full address fields
- Continue to payment

### 6. Login Page (`/login`)
- Login/Register toggle
- Email/password authentication
- Social login options (Google, Facebook)

### 7. Admin Panel (`/admin`)
- Manage products
- View all products
- Add new products with image upload
- Delete products (with option to delete images)
- Edit product details
- Manage categories

## 🎯 Key Features

- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Server-side rendering with Next.js 15
- ✅ Optimized images with Next.js Image component
- ✅ Smooth animations and transitions
- ✅ Interactive carousels with auto-play
- ✅ Hover effects on product cards
- ✅ Sticky header with scroll effects
- ✅ Font Awesome icons included
- ✅ Google Fonts (Playfair Display & Poppins)
- ✅ MongoDB database integration
- ✅ CRUD operations for products, categories, orders, and users
- ✅ Admin panel for managing products and categories
- ✅ Authentication & security features
- ✅ Role-Based Access Control (RBAC)

## 📦 Dependencies

```json
{
  "next": "15.1.4",
  "react": "19.0.0",
  "react-dom": "19.0.0",
  "tailwindcss": "^4.0.0",
  "mongoose": "^7.0.0",
  "multer": "^2.0.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^8.5.1"
}
```

## 🔧 Customization

### Update Product Images:
1. Place your images in `/public/images/products/`
2. Update image paths in the component files
3. Example: Change `/images/product-1.jpg` to your image name

### Update Categories:
Edit `app/page.tsx` and update the categories array with your images:

```tsx
{
  name: "Your Category",
  image: "/images/categories/your-category.jpg"
}
```

### Update Colors:
Edit `app/globals.css` and modify the CSS variables:

```css
:root {
  --navy: #0a2463;
  --teal: #14b8a6;
  /* ... other colors */
}
```

### Update Social Media Links:
Update social media links in the footer section of each page:
- Facebook
- Instagram
- WhatsApp
- Pinterest

## 🌐 Deployment

### Deploy to Vercel (Recommended):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## 📞 Support

For any questions or issues:
- Check the Next.js documentation: [nextjs.org](https://nextjs.org)
- Tailwind CSS docs: [tailwindcss.com](https://tailwindcss.com)
- MongoDB docs: [mongodb.com](https://docs.mongodb.com)

## ✨ Notes

- All images are stored in `/public/images/` directory
- The logo (`IMG_1895.PNG`) has been added as `logo.jpg`
- Product images from your uploads have been integrated
- The UI matches your original HTML design exactly
- All sections from your HTML are preserved in React components
- Uploaded files are stored in `/public/uploads/`

## 🗄️ MongoDB Database Integration

This project now includes full MongoDB integration with complete CRUD operations for products, categories, orders, and users.

### Database Connection

Your MongoDB connection is already configured:
- **Database Name**: `ecommerce`
- **Connection String**: Set in `.env.local`

### Collections

1. **products** - Store all product information
2. **categories** - Store product categories
3. **orders** - Store customer orders
4. **users** - Store user accounts with authentication
5. **carts** - Store shopping cart data

### Initial Setup

#### 1. Create Environment File

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Your `.env.local` should contain:

```env
MONGODB_URI=mongodb+srv://fa23bse159_db_user:Cricketlover1@cluster0.gdb4yx5.mongodb.net/?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a secure random string in production!

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Create Admin Account

Run this command to create an admin user:

```bash
npm run create-admin
```

This creates:
- **Email:** admin@morbridals.com
- **Password:** admin123

**⚠️ Important:** Change these credentials after first login!

#### 4. Seed the Database (Optional)

Run this command to populate your database with sample data:

```bash
npm run seed
```

This will create:
- 6 categories (Unstitched, Stitched, Casual, Formal, Bridal, Clutches & Jewelry)
- 10+ sample products with images
- Sample data for testing

#### 5. Start Development Server

```bash
npm run dev
```

#### 6. Access Admin Dashboard

Navigate to [http://localhost:3000/admin](http://localhost:3000/admin) and login with:
- Email: admin@morbridals.com
- Password: admin123

## 🔐 Authentication & Security

### Features Implemented

#### 1. Admin Authentication System
- ✅ Secure login with email + password
- ✅ Password hashing using bcryptjs (12 rounds)
- ✅ JWT-based authentication with 7-day expiry
- ✅ Session persistence using localStorage
- ✅ Protected admin routes

#### 2. Role-Based Access Control (RBAC)
- ✅ **User** role - Can browse, add to cart, place orders
- ✅ **Admin** role - Full access to admin dashboard

**Admin Privileges:**
- Access admin dashboard
- Create/update/delete products
- Manage orders & categories
- View all users
- Upload/delete product images

#### 3. API Protection Middleware
All admin operations are protected:
- ✅ `/api/products` (POST, PUT, DELETE) - Admin only
- ✅ `/api/categories` (POST, PUT, DELETE) - Admin only
- ✅ `/api/orders` (GET all, UPDATE status) - Admin only
- ✅ Automatic token verification
- ✅ Role checking on every request

#### 4. Admin Dashboard Security
- ✅ Login page with form validation
- ✅ Automatic redirect for non-admin users
- ✅ Prevent direct URL access without authentication
- ✅ Secure API calls with JWT token
- ✅ Logout functionality

#### 5. Security Best Practices
- ✅ Password hashing (never store plain text)
- ✅ JWT secret stored in environment variables
- ✅ HTTP-only cookies (recommended for production)
- ✅ Input validation on all forms
- ✅ SQL injection prevention with MongoDB
- ✅ XSS protection with React

### Authentication Flow

#### User Registration
```javascript
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### User/Admin Login
```javascript
POST /api/auth/login
{
  "email": "admin@morbridals.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "admin@morbridals.com",
      "name": "Admin",
      "role": "admin"
    }
  }
}
```

#### Protected API Calls
```javascript
fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(productData)
})
```

## 📱 Admin Dashboard

### Features

#### Products Management
- **View All Products** - Grid/list view with images
- **Add New Product** - Form with image upload
- **Edit Product** - Update details, change images
- **Delete Product** - Option to keep or delete associated images
- **Toggle Status** - Featured, In Stock flags
- **Category Filter** - Filter by product category

#### Categories Management
- **View All Categories** - Grid view with category images
- **Add Category** - Create new product categories
- **Edit Category** - Update category details
- **Delete Category** - Remove categories

#### Orders Management
- **View All Orders** - Complete order history
- **Order Details** - Customer info, items, totals
- **Update Status** - Change order status (Processing, Shipped, Delivered)
- **Filter Orders** - By status, date, customer

### Admin Dashboard Navigation
```
/admin
├── Products Tab (default)
│   ├── Add Product
│   ├── Edit Product
│   └── Delete Product
├── Categories Tab
│   ├── View Categories
│   └── Manage Categories
└── Orders Tab
    ├── View Orders
    └── Update Order Status
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user/admin

#### Products
- `GET /api/products` - Get all products
- `GET /api/products?category=Bridal` - Filter by category
- `GET /api/products?featured=true` - Get featured products
- `GET /api/products/[id]` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/[id]` - Update product (admin only)
- `DELETE /api/products/[id]` - Delete product (admin only)
- `DELETE /api/products/[id]?deleteImages=true` - Delete with images (admin only)

#### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/[id]` - Update category (admin only)
- `DELETE /api/categories/[id]?deleteImage=true` - Delete category (admin only)

#### Orders
- `GET /api/orders` - Get all orders (admin only)
- `GET /api/orders?userId=[id]` - Get user orders
- `POST /api/orders` - Create order
- `PUT /api/orders/[id]` - Update order status (admin only)
- `DELETE /api/orders/[id]` - Delete order (admin only)

#### File Upload
- `POST /api/upload` - Upload file (multipart/form-data)
- `DELETE /api/upload` - Delete file by URL

## 🚀 Production Deployment

### Security Checklist

Before deploying to production:

1. ✅ Change `JWT_SECRET` to a secure random string (min 32 characters)
2. ✅ Update admin password from default (admin123)
3. ✅ Set `NODE_ENV=production` in environment variables
4. ✅ Enable HTTPS (SSL certificate)
5. ✅ Configure CORS for your domain
6. ✅ Set up rate limiting on API routes
7. ✅ Enable MongoDB IP whitelist
8. ✅ Use environment variables for all secrets
9. ✅ Set up CDN for images (optional)
10. ✅ Enable database backups

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
4. Deploy!

### Environment Variables in Vercel

Go to Project Settings → Environment Variables and add:

```
MONGODB_URI = mongodb+srv://...
JWT_SECRET = your-production-secret-key
NODE_ENV = production
```

## 📚 Additional Documentation

- **API Documentation**: See `API_DOCUMENTATION.md` for complete API reference
- **Setup Guide**: See `SETUP_GUIDE.md` for detailed setup instructions
- **Database Schemas**: See `types/index.ts` for TypeScript interfaces

## 🔧 Troubleshooting

### Admin Login Issues
- Ensure you've run `npm run create-admin`
- Check that `JWT_SECRET` is set in `.env.local`
- Clear browser localStorage and try again

### MongoDB Connection Failed
- Verify MongoDB URI in `.env.local`
- Check IP whitelist in MongoDB Atlas
- Ensure network access is configured

### Products Not Loading
- Run `npm run seed` to add sample data
- Check MongoDB connection in console
- Verify API routes are accessible

### Image Upload Not Working
- Check file size (max 5MB recommended)
- Verify supported formats (JPG, PNG, WebP)
- Ensure `/public/uploads` directory exists

---

**MÓRBRIDALS - Elegance Redefined** ✨

Complete e-commerce solution with MongoDB, authentication, and admin dashboard!
