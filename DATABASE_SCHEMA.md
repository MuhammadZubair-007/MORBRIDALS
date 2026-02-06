# Database Schema Reference

## Collections Overview

This document outlines the new MongoDB collections created for home page content management.

---

## 1. heroSlides Collection

**Purpose:** Main carousel banner slides at the top of the home page

**Schema:**
```json
{
  "_id": ObjectId,
  "image": "string (image path)",
  "title": "string",
  "description": "string",
  "button": "string (button text)",
  "order": "number (display order)",
  "isActive": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Example Document:**
```json
{
  "_id": ObjectId("..."),
  "image": "/images/slide1.jpg",
  "title": "Elegance Redefined",
  "description": "Discover our exquisite collection",
  "button": "Shop Now",
  "order": 0,
  "isActive": true,
  "createdAt": ISODate("2026-01-23T00:00:00Z"),
  "updatedAt": ISODate("2026-01-23T00:00:00Z")
}
```

---

## 2. brands Collection

**Purpose:** Brand names displayed in the scrolling brands section

**Schema:**
```json
{
  "_id": ObjectId,
  "name": "string (brand name)",
  "order": "number (scroll position)",
  "isActive": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Example Document:**
```json
{
  "_id": ObjectId("..."),
  "name": "SANIA MASKATIYA",
  "order": 0,
  "isActive": true,
  "createdAt": ISODate("2026-01-23T00:00:00Z"),
  "updatedAt": ISODate("2026-01-23T00:00:00Z")
}
```

**Current Brands:**
1. SANIA MASKATIYA
2. JUGNU
3. SUFFUSE
4. IMAGE EST. 1993
5. HUSSAIN REHAR
6. MARIA.B.
7. SANA SAFINAZ

---

## 3. shopCategories Collection

**Purpose:** Category tiles displayed in "Shop by Category" section

**Schema:**
```json
{
  "_id": ObjectId,
  "name": "string (category name)",
  "slug": "string (URL slug)",
  "image": "string (image path)",
  "order": "number (grid position)",
  "isActive": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Example Document:**
```json
{
  "_id": ObjectId("..."),
  "name": "Unstitched",
  "slug": "unstitched",
  "image": "/images/instagram/unstiched.jpg",
  "order": 0,
  "isActive": true,
  "createdAt": ISODate("2026-01-23T00:00:00Z"),
  "updatedAt": ISODate("2026-01-23T00:00:00Z")
}
```

**Current Shop Categories (Hardcoded):**
1. Unstitched → `/images/instagram/unstiched.jpg`
2. Stitched → `/images/instagram/Stitched.png`
3. Casual → `/images/img-20251030-wa0007.jpg`
4. Formal → `/images/instagram/formal 2.png`
5. Bridal → `/images/slide1.jpg`
6. Clutches & Jewelry → `/images/img-20250926-wa0069.jpg`

---

## 4. secondHeroSlides Collection

**Purpose:** Second carousel section with alternating text/image layout

**Schema:**
```json
{
  "_id": ObjectId,
  "image": "string (image path)",
  "title": "string",
  "subtitle": "string (description)",
  "href": "string (optional link)",
  "order": "number (carousel position)",
  "isActive": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Example Document:**
```json
{
  "_id": ObjectId("..."),
  "image": "/images/slide1.jpg",
  "title": "Bridal",
  "subtitle": "Create your perfect outfit with our premium bridal collection",
  "href": "/category?cat=bridal",
  "order": 0,
  "isActive": true,
  "createdAt": ISODate("2026-01-23T00:00:00Z"),
  "updatedAt": ISODate("2026-01-23T00:00:00Z")
}
```

**Current Slides (Hardcoded):**
1. Bridal
2. Ready to Wear (Stitched)
3. Casual Comfort
4. Exquisite Accessories

---

## 5. trendingProducts Collection

**Purpose:** Featured products in "Trending Now" section

**Schema:**
```json
{
  "_id": ObjectId,
  "name": "string (product name)",
  "price": "number (price in PKR)",
  "image": "string (image path)",
  "description": "string (optional product description)",
  "order": "number (display order)",
  "isActive": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Example Document:**
```json
{
  "_id": ObjectId("..."),
  "name": "Luxe Bridal Collection",
  "price": 45000,
  "image": "/images/slide1.jpg",
  "description": "Premium bridal wear with intricate embroidery",
  "order": 0,
  "isActive": true,
  "createdAt": ISODate("2026-01-23T00:00:00Z"),
  "updatedAt": ISODate("2026-01-23T00:00:00Z")
}
```

**Current Products (Hardcoded):**
1. Luxe Bridal Collection - 45,000 PKR
2. Formal Gold Ensemble - 18,500 PKR
3. Cream Casual Wear - 7,500 PKR
4. Royal Bridal Dress - 52,000 PKR

---

## 6. instagramPosts Collection

**Purpose:** Images displayed in Instagram gallery grid

**Schema:**
```json
{
  "_id": ObjectId,
  "image": "string (image path)",
  "order": "number (grid position)",
  "isActive": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Example Document:**
```json
{
  "_id": ObjectId("..."),
  "image": "/images/instagram/bridal.png",
  "order": 0,
  "isActive": true,
  "createdAt": ISODate("2026-01-23T00:00:00Z"),
  "updatedAt": ISODate("2026-01-23T00:00:00Z")
}
```

**Current Gallery Images (Hardcoded):**
1. `/images/instagram/bridal.png`
2. `/images/instagram/casual.png`
3. `/images/instagram/formal 2.png`
4. `/images/img-20250926-wa0069.jpg`
5. `/images/instagram/Stitched.png`
6. `/images/instagram/unstiched.jpg`

---

## 7. instagramSettings Collection (Optional)

**Purpose:** Store Instagram profile information

**Schema:**
```json
{
  "_id": ObjectId,
  "profileUrl": "string (Instagram profile URL)",
  "displayName": "string (Display name)",
  "updatedAt": "Date"
}
```

**Example:**
```json
{
  "_id": ObjectId("..."),
  "profileUrl": "https://www.instagram.com/morstyleedit/",
  "displayName": "@morstyleedit",
  "updatedAt": ISODate("2026-01-23T00:00:00Z")
}
```

---

## Existing Collections (Unchanged)

These collections remain from the original project:

1. **categories** - Product categories
   - Now includes 6 categories (Unstitched, Stitched, Casual, Formal, Bridal, Clutches & Jewelry)

2. **products** - Product inventory
   - Can now be filtered by all 6 categories correctly

3. **users** - User accounts

4. **orders** - Customer orders

---

## Index Recommendations

For optimal performance, consider creating these indexes:

```javascript
// heroSlides
db.heroSlides.createIndex({ "order": 1, "isActive": 1 })

// brands
db.brands.createIndex({ "order": 1, "isActive": 1 })

// shopCategories
db.shopCategories.createIndex({ "slug": 1 })
db.shopCategories.createIndex({ "order": 1, "isActive": 1 })

// secondHeroSlides
db.secondHeroSlides.createIndex({ "order": 1, "isActive": 1 })

// trendingProducts
db.trendingProducts.createIndex({ "order": 1, "isActive": 1 })

// instagramPosts
db.instagramPosts.createIndex({ "order": 1, "isActive": 1 })
```

---

## Data Relationships

```
┌─────────────────────────────────────┐
│   Website Home Page                 │
├─────────────────────────────────────┤
│ ┌─ heroSlides (carousel)           │
│ ├─ brands (scrolling list)         │
│ ├─ shopCategories (tiles)          │
│ ├─ secondHeroSlides (carousel)     │
│ ├─ trendingProducts (featured)     │
│ └─ instagramPosts (gallery)        │
└─────────────────────────────────────┘
           ↓ Admin Panel
    /api/homepage/*
           ↓
        MongoDB
```

---

## API Response Format

All endpoints follow this response format:

**Success Response (200/201):**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "field": "value",
    ...
  }
}
```

**Error Response (400/404/500):**
```json
{
  "success": false,
  "error": "Error message"
}
```

**List Response (GET):**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "field": "value" },
    { "_id": "...", "field": "value" }
  ]
}
```

---

## Data Migration Notes

- All new collections are created on first use
- No migration needed from existing data
- Existing home page content (hardcoded) continues to work
- New content from admin panel is additive

---

## Backup & Recovery

Database backups are automatically created before seeding:
- Location: `/scripts/backups/`
- Filename: `backup-YYYY-MM-DDTHH-mm-ss-sssZ.json`
- Contains: All collection data before reset

To restore from backup:
```bash
# Use MongoDB import tools or manual restoration
mongorestore --archive=backup-file.json
```

---

Generated: January 23, 2026
Status: Complete and Ready for Use
