# E-Commerce API Documentation

## Base URL
All API routes are prefixed with `/api`

## Authentication
Currently, no authentication is required. Add JWT or session-based auth as needed.

---

## Products API

### Get All Products
**GET** `/api/products`

**Query Parameters:**
- `category` (optional) - Filter by category name
- `featured` (optional) - Set to "true" to get only featured products

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Luxe Bridal Collection",
      "description": "Exquisite bridal dress with intricate embroidery",
      "price": 45000,
      "category": "Bridal",
      "images": ["/uploads/image1.jpg"],
      "sizes": ["S", "M", "L"],
      "colors": ["Ivory", "Gold"],
      "inStock": true,
      "featured": true,
      "sku": "BR001",
      "createdAt": "2025-01-19T...",
      "updatedAt": "2025-01-19T..."
    }
  ]
}
```

### Get Single Product
**GET** `/api/products/[id]`

**Response:**
```json
{
  "success": true,
  "data": { /* Product object */ }
}
```

### Create Product
**POST** `/api/products`

**Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 15000,
  "category": "Formal",
  "images": ["/uploads/image1.jpg"],
  "sizes": ["S", "M", "L"],
  "colors": ["Red", "Blue"],
  "inStock": true,
  "featured": false,
  "sku": "FRM001"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* Created product object */ }
}
```

### Update Product
**PUT** `/api/products/[id]`

**Body:** (All fields optional)
```json
{
  "name": "Updated Name",
  "price": 18000,
  "inStock": false
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* Updated product object */ }
}
```

### Delete Product
**DELETE** `/api/products/[id]?deleteImages=true`

**Query Parameters:**
- `deleteImages` (optional) - Set to "true" to also delete associated image files

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "deletedImages": true
}
```

---

## Categories API

### Get All Categories
**GET** `/api/categories`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Bridal",
      "slug": "bridal",
      "description": "Luxury bridal wear collection",
      "image": "/uploads/bridal.jpg",
      "parentCategory": null,
      "createdAt": "2025-01-19T...",
      "updatedAt": "2025-01-19T..."
    }
  ]
}
```

### Create Category
**POST** `/api/categories`

**Body:**
```json
{
  "name": "Casual",
  "slug": "casual",
  "description": "Comfortable casual wear",
  "image": "/uploads/casual.jpg",
  "parentCategory": null
}
```

### Update Category
**PUT** `/api/categories/[id]`

**Body:** (All fields optional)

### Delete Category
**DELETE** `/api/categories/[id]?deleteImage=true`

**Query Parameters:**
- `deleteImage` (optional) - Set to "true" to also delete the category image

---

## Orders API

### Get All Orders
**GET** `/api/orders`

**Query Parameters:**
- `userId` (optional) - Filter orders by user ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "items": [
        {
          "productId": "507f1f77bcf86cd799439013",
          "name": "Product Name",
          "price": 15000,
          "quantity": 2,
          "size": "M",
          "color": "Red",
          "image": "/uploads/product.jpg"
        }
      ],
      "totalAmount": 30000,
      "shippingAddress": {
        "name": "John Doe",
        "phone": "+92300...",
        "street": "123 Main St",
        "city": "Karachi",
        "state": "Sindh",
        "zipCode": "75500",
        "country": "Pakistan"
      },
      "paymentMethod": "COD",
      "paymentStatus": "pending",
      "orderStatus": "processing",
      "createdAt": "2025-01-19T...",
      "updatedAt": "2025-01-19T..."
    }
  ]
}
```

### Create Order
**POST** `/api/orders`

**Body:**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439013",
      "name": "Product Name",
      "price": 15000,
      "quantity": 2,
      "size": "M",
      "color": "Red",
      "image": "/uploads/product.jpg"
    }
  ],
  "totalAmount": 30000,
  "shippingAddress": {
    "name": "John Doe",
    "phone": "+92300...",
    "street": "123 Main St",
    "city": "Karachi",
    "state": "Sindh",
    "zipCode": "75500",
    "country": "Pakistan"
  },
  "paymentMethod": "COD"
}
```

### Update Order
**PUT** `/api/orders/[id]`

**Body:** (Update status)
```json
{
  "orderStatus": "shipped",
  "paymentStatus": "paid"
}
```

### Delete Order
**DELETE** `/api/orders/[id]`

---

## File Upload API

### Upload File
**POST** `/api/upload`

**Body:** (multipart/form-data)
- `file` - The file to upload

**Response:**
```json
{
  "success": true,
  "url": "/uploads/1234567890-image.jpg",
  "filename": "1234567890-image.jpg"
}
```

### Delete File
**DELETE** `/api/upload`

**Body:**
```json
{
  "url": "/uploads/1234567890-image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## Usage Examples

### Example: Create Product with Image Upload

```javascript
// 1. Upload image first
const formData = new FormData();
formData.append('file', imageFile);

const uploadRes = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
const { url } = await uploadRes.json();

// 2. Create product with image URL
const productRes = await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'New Product',
    description: 'Product description',
    price: 15000,
    category: 'Formal',
    images: [url],
    sizes: ['S', 'M', 'L'],
    inStock: true
  })
});
```

### Example: Delete Product with Images

```javascript
// Delete product and its images
const res = await fetch('/api/products/[id]?deleteImages=true', {
  method: 'DELETE'
});
```

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error
