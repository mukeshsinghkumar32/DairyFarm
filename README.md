# Sohani Dairy Farm — React + Node.js + MongoDB

Full-stack dairy cattle catalogue with a public React website and secure Node.js/Express admin CRUD dashboard.

## Features

* Home, About Us, Products and Contact pages
* Dynamic category submenu:

  * Sahiwal
  * HF
  * Gir
  * Jersey
  * Murrah
* Category-wise cattle/product listings
* Individual cow/product detail pages
* Enquiry functionality
* WhatsApp CTA
* Secure admin authentication using JWT
* Admin category CRUD
* Admin cow/product CRUD
* Product image upload
* Product availability status
* Featured product status
* MongoDB database
* Mongoose models
* Starter seed data
* Responsive professional UI
* RESTful API architecture
* Protected admin routes
* API validation and error handling

---

# Technology Stack

## Frontend

* React 18+
* React Router
* Axios
* Vite
* CSS / CSS Modules
* Responsive design

## Backend

* Node.js 20+
* Express.js
* MongoDB
* Mongoose
* JWT authentication
* bcrypt
* Multer for image uploads
* CORS
* dotenv
* Express validation/error handling

## Database

MongoDB Community or MongoDB Atlas.

---

# Requirements

* Node.js 20+
* npm 10+
* MongoDB Community or MongoDB Atlas
* Git

---

# Project Structure

```text
sohani-dairy-farm/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── categoryController.js
│   │   │   ├── productController.js
│   │   │   └── enquiryController.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── uploadMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   │
│   │   ├── models/
│   │   │   ├── Admin.js
│   │   │   ├── Category.js
│   │   │   ├── Product.js
│   │   │   └── Enquiry.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   └── enquiryRoutes.js
│   │   │
│   │   ├── seed/
│   │   │   └── seed.js
│   │   │
│   │   ├── utils/
│   │   │   └── generateToken.js
│   │   │
│   │   └── server.js
│   │
│   ├── uploads/
│   │   ├── products/
│   │   └── categories/
│   │
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Contact.jsx
│   │   │   └── admin/
│   │   │       ├── Login.jsx
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Categories.jsx
│   │   │       ├── Products.jsx
│   │   │       └── Enquiries.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```env
PORT=5000

MONGODB_URI=mongodb://127.0.0.1:27017/sohani_dairy

JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173

UPLOAD_DIR=uploads
```

For MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/sohani_dairy
```

Start the backend:

```bash
npm run dev
```

Production:

```bash
npm start
```

Backend API:

```text
http://localhost:5000
```

---

# Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Start React:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# MongoDB Models

## Admin

```text
Admin
├── name
├── email
├── password
├── role
├── createdAt
└── updatedAt
```

Password must always be stored as a bcrypt hash.

---

## Category

```text
Category
├── name
├── slug
├── description
├── image
├── isActive
├── createdAt
└── updatedAt
```

Example categories:

```text
Sahiwal
HF
Gir
Jersey
Murrah
```

---

## Product / Cow

```text
Product
├── category
├── name
├── slug
├── description
├── breed
├── age
├── gender
├── price
├── location
├── images[]
├── availability
├── isFeatured
├── specifications
├── createdAt
└── updatedAt
```

Example:

```json
{
  "name": "Premium Sahiwal Cow",
  "breed": "Sahiwal",
  "age": 4,
  "gender": "Female",
  "price": 85000,
  "availability": "available",
  "isFeatured": true
}
```

---

## Enquiry

```text
Enquiry
├── name
├── phone
├── email
├── subject
├── message
├── product
├── status
├── createdAt
└── updatedAt
```

---

# Authentication

Use JWT-based authentication instead of Laravel Sanctum.

Login flow:

```text
Admin Login
     ↓
POST /api/v1/admin/login
     ↓
Validate email/password
     ↓
bcrypt password verification
     ↓
Generate JWT
     ↓
React stores authentication state
     ↓
Protected admin routes
```

JWT should be sent with protected requests:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# API Endpoints

## Public APIs

### Categories

```http
GET /api/v1/categories
GET /api/v1/categories/:slug
```

### Products

```http
GET /api/v1/products
GET /api/v1/products/:slug
GET /api/v1/products/category/:slug
GET /api/v1/products/featured
```

Optional filters:

```http
GET /api/v1/products?category=sahiwal
GET /api/v1/products?availability=available
GET /api/v1/products?featured=true
GET /api/v1/products?search=cow
```

### Contact / Enquiry

```http
POST /api/v1/contact
```

---

# Admin APIs

## Authentication

```http
POST /api/v1/admin/login
GET /api/v1/admin/me
POST /api/v1/admin/logout
```

`/me` should require a valid JWT.

---

## Categories

```http
GET    /api/v1/admin/categories
POST   /api/v1/admin/categories
GET    /api/v1/admin/categories/:id
PUT    /api/v1/admin/categories/:id
DELETE /api/v1/admin/categories/:id
```

---

## Products

```http
GET    /api/v1/admin/products
POST   /api/v1/admin/products
GET    /api/v1/admin/products/:id
PUT    /api/v1/admin/products/:id
DELETE /api/v1/admin/products/:id
```

Product creation/update should support:

```text
multipart/form-data
```

for image uploads.

---

## Enquiries

```http
GET    /api/v1/admin/enquiries
GET    /api/v1/admin/enquiries/:id
PUT    /api/v1/admin/enquiries/:id
DELETE /api/v1/admin/enquiries/:id
```

---

# Image Upload

Use Multer.

Example:

```text
POST /api/v1/admin/products
Content-Type: multipart/form-data
```

Fields:

```text
name
category
description
price
age
gender
availability
isFeatured
images[]
```

Images should be stored under:

```text
backend/uploads/products/
```

The API should return accessible image URLs.

Example:

```json
{
  "image": "http://localhost:5000/uploads/products/sahiwal-cow.jpg"
}
```

For production, the image layer can later be moved to Cloudinary, AWS S3, or another object-storage service without changing the React product UI.

---

# Seed Data

Create a seed command:

```bash
npm run seed
```

The seed should create:

### Admin

```text
Email:
admin@sohanidairy.in

Password:
Admin@123
```

### Categories

```text
Sahiwal
HF
Gir
Jersey
Murrah
```

### Sample Products

Create multiple sample cattle/products across all five categories.

The README must clearly state:

> Change the default admin password immediately after the first production login.

---

# React Routes

## Public

```text
/
├── /
├── /about
├── /products
├── /products/:slug
├── /category/:slug
└── /contact
```

## Admin

```text
/admin/login
/admin
/admin/categories
/admin/products
/admin/products/create
/admin/products/:id/edit
/admin/enquiries
```

Admin routes must be protected.

Unauthenticated users attempting to access:

```text
/admin
/admin/products
/admin/categories
/admin/enquiries
```

should be redirected to:

```text
/admin/login
```

---

# React API Service

Use Axios with a centralized API client.

Example:

```js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
```

Do not create separate Axios instances throughout the application.

---

# Admin Dashboard

The dashboard should provide:

```text
Dashboard
│
├── Total Products
├── Available Products
├── Featured Products
├── Categories
└── New Enquiries
```

Admin navigation:

```text
Dashboard
Categories
Products
Enquiries
Logout
```

---

# Product Management

Admin should be able to:

* Add product
* Edit product
* Delete product
* Upload multiple images
* Select category
* Set price
* Set age
* Set gender
* Set availability
* Mark as featured
* Add description
* Add specifications
* Preview images

---

# Public Product Experience

The public website should include:

### Product Listing

```text
Search
Category
Breed
Availability
Price
Featured
```

### Product Card

```text
Product Image
Breed
Name
Age
Location
Price
Availability
View Details
WhatsApp
Enquire Now
```

### Product Details

```text
Image Gallery
Product Name
Breed
Age
Gender
Price
Location
Availability
Description
Specifications

[Enquire Now]
[WhatsApp]
```

---

# WhatsApp CTA

Generate a WhatsApp URL dynamically using the product name and URL.

Example message:

```text
Hello Sohani Dairy Farm,

I am interested in:
Premium Sahiwal Cow

Please share more details.
```

The WhatsApp number should come from frontend configuration rather than being hard-coded throughout components.

---

# Security Requirements

Implement:

* JWT authentication
* bcrypt password hashing
* Protected admin routes
* CORS configuration
* Environment variables
* Request validation
* MongoDB query validation
* File type validation
* File size limits
* Centralized error handling
* Authentication middleware
* No passwords in API responses
* No secrets committed to Git
* `.env` in `.gitignore`

For production, also add:

* Helmet
* Rate limiting
* HTTPS
* Secure cookie-based token storage where appropriate
* Request logging
* MongoDB indexes
* Image optimization
* API pagination

---

# Production Environment

Frontend:

```env
VITE_API_URL=https://api.sohanidairy.in/api/v1
```

Backend:

```env
NODE_ENV=production
PORT=5000

MONGODB_URI=mongodb+srv://...

JWT_SECRET=YOUR_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=7d

FRONTEND_URL=https://sohanidairy.in
```

Recommended production architecture:

```text
                    ┌────────────────────┐
                    │   React Frontend   │
                    │ sohanidairy.in     │
                    └─────────┬──────────┘
                              │
                              │ HTTPS / REST API
                              ▼
                    ┌────────────────────┐
                    │ Node.js + Express  │
                    │ api.sohanidairy.in │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │      MongoDB       │
                    │ Atlas / Production │
                    └────────────────────┘
```

---

# Final Stack

```text
Frontend
React + Vite
       │
       │ REST API
       ▼
Backend
Node.js + Express
       │
       ├── JWT Authentication
       ├── Multer Uploads
       ├── REST APIs
       └── Validation
       │
       ▼
Database
MongoDB + Mongoose
```

This version removes **Laravel, PHP, Composer, Laravel Sanctum, Laravel migrations, and Laravel-specific commands** completely and uses **React + Node.js/Express + MongoDB** throughout.
