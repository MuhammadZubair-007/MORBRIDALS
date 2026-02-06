# Admin Panel - Home Page Management Guide

## Accessing the Home Page Admin

1. Go to `/admin` in your application
2. Log in with your admin credentials
3. Click the **"Home Page" (🏠)** tab in the sidebar

---

## Managing Different Sections

### 1. 🎠 Hero Carousel (Main Banner)

**Purpose:** Manage the large rotating banner at the top of the home page

**What you can do:**
- Add new slides with custom title, description, button text, and image
- Delete existing slides
- Change the order of slides
- Toggle active/inactive status

**Example:**
- Title: "Summer Collection 2025"
- Description: "Embrace the season with our vibrant designs"
- Button: "Shop Summer"
- Image: `/images/slide2.jpg`

---

### 2. 🏢 Brands Scrolling

**Purpose:** Manage the brand names that scroll across the page

**What you can do:**
- Add brand names (e.g., "SANIA MASKATIYA", "JUGNU", etc.)
- Delete brands
- Reorder brands
- Toggle active/inactive status

**Example Brands:**
- SANIA MASKATIYA
- JUGNU
- SUFFUSE
- IMAGE EST. 1993
- HUSSAIN REHAR
- MARIA.B.
- SANA SAFINAZ

---

### 3. 🛍️ Shop by Category Tiles

**Purpose:** Manage the 6 category tiles displayed on the home page (not the actual product categories)

**Note:** The current 6 categories are hardcoded in the home page:
1. Unstitched
2. Stitched
3. Casual
4. Formal
5. Bridal
6. Clutches & Jewelry ✅ (Now fixed - shows in all filters!)

**You can:**
- Add additional promotional category tiles
- Edit existing category information
- Delete tiles
- Change display order
- Update category images

---

### 4. 🎨 Second Hero Carousel

**Purpose:** Manage the second large carousel section with alternating text/image layout

**What you can do:**
- Add new carousel slides with title, subtitle, image, and optional link
- Delete slides
- Reorder slides
- Add navigation links to category pages

**Example:**
- Title: "Bridal"
- Subtitle: "Create your perfect outfit with our premium bridal collection"
- Image: `/images/slide1.jpg`
- Link: `/category?cat=bridal`

---

### 5. ⭐ Trending Products

**Purpose:** Manage featured products displayed in the "Trending Now" section

**What you can do:**
- Add products with name, price, image, and description
- Delete products
- Reorder products
- Set which products appear in the "Trending Now" section

**Example Product:**
- Name: "Luxe Bridal Collection"
- Price: 45000 (PKR)
- Image: `/images/slide1.jpg`
- Description: "Premium bridal wear"

---

### 6. 📷 Instagram Gallery

**Purpose:** Manage the Instagram gallery grid at the bottom of the home page

**What you can do:**
- Add image URLs from your photo collection
- Delete gallery images
- Reorder gallery items
- Upload multiple images

**Currently displays:** 6 Instagram-style images in a grid

**Example Images:**
- `/images/instagram/bridal.png`
- `/images/instagram/casual.png`
- `/images/instagram/formal 2.png`
- `/images/img-20250926-wa0069.jpg`
- `/images/instagram/Stitched.png`
- `/images/instagram/unstiched.jpg`

---

## Key Features

✅ **Real-time Updates:** Changes appear immediately on the website
✅ **Easy Management:** Simple add/edit/delete interface
✅ **Order Control:** Set the order items appear on page
✅ **Image Support:** Works with all image paths
✅ **No Picture Removal:** All existing home page images are preserved
✅ **Database Backed:** All changes are saved to MongoDB

---

## Database Behind the Scenes

Each section has its own MongoDB collection:
- `heroSlides` → Hero Carousel
- `brands` → Brand Names
- `shopCategories` → Category Tiles
- `secondHeroSlides` → Second Hero
- `trendingProducts` → Trending Products
- `instagramPosts` → Instagram Gallery

---

## Tips & Best Practices

1. **Image Paths:** Use paths like `/images/...` for consistency
2. **Pricing:** Enter prices as numbers without commas (e.g., 45000, not 45,000)
3. **Order:** Items are displayed in the order you see them (based on "order" field)
4. **Testing:** After adding content, refresh the home page to verify it appears correctly
5. **Backup:** The system automatically creates backups when seeding (check `/scripts/backups/`)

---

## Troubleshooting

**Content not appearing?**
- Refresh the home page (hard refresh with Ctrl+Shift+R)
- Check the browser console for errors
- Verify the image path is correct

**Image not loading?**
- Ensure the image file exists in the `/public/` directory
- Check the image path format
- Use absolute paths like `/images/filename.jpg`

**Changes not saving?**
- Check your internet connection
- Verify you're still logged in as admin
- Check the browser console for API errors

---

## Product Category Fix ✅

The category issue has been resolved:
- ✅ Admin panel now shows 6 categories (not 5)
- ✅ "Clutches & Jewelry" category is properly seeded
- ✅ Products with "Clutches & Jewelry" category now appear in filters correctly
- ✅ Website displays all 6 category tiles on home page

---

## Questions or Issues?

All changes are logged with timestamps. Check `/scripts/backups/` for automatic backups of your data.
