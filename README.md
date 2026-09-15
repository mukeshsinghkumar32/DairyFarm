# Sohani Dairy Farm — React + Laravel + MongoDB

Full-stack dairy cattle catalogue with public website and secure admin CRUD.

## Features

- Home, About Us, Products and Contact pages
- Dynamic category submenu (Sahiwal, HF, Gir, Jersey, Murrah)
- Category-wise listing and cow detail pages
- Enquiry and WhatsApp CTA
- Laravel Sanctum admin authentication
- Category CRUD and cow/product CRUD
- Product image upload, availability and featured status
- MongoDB models and starter seed data
- Responsive professional UI

## Requirements

- PHP 8.2+, Composer 2
- Node.js 20+
- MongoDB Community/Atlas
- PHP MongoDB extension (`pecl install mongodb`)

## Backend setup

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan storage:link
php artisan db:seed
php artisan serve
```

For local MongoDB keep `DB_URI=mongodb://127.0.0.1:27017`. For Atlas replace it with your Atlas connection string.

## Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

## Default admin

- URL: `http://localhost:5173/admin/login`
- Email: `admin@sohanidairy.in`
- Password: `Admin@123`

Change the seeded password before production use.

## Main API endpoints

Public: `/api/v1/categories`, `/api/v1/products`, `/api/v1/contact`  
Admin: `/api/v1/admin/login`, `/api/v1/admin/categories`, `/api/v1/admin/products`, `/api/v1/admin/enquiries`
