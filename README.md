# Class Buddy - POS Multi Toko

Aplikasi Point of Sale (POS) berbasis web untuk manajemen multi toko dengan fitur lengkap termasuk authentication, role-based access control, dan integrasi pembayaran QRIS.

## 📋 Table of Contents

- [Teknologi Stack](#teknologi-stack)
- [Fitur Backend](#fitur-backend)
- [API Endpoints](#api-endpoints)
- [Setup dengan Docker](#setup-dengan-docker)
- [Setup Manual](#setup-manual)
- [Struktur Database](#struktur-database)
- [Edge Functions](#edge-functions)
- [Security Features](#security-features)

## 🛠️ Teknologi Stack

### Frontend
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **TanStack Query** - Data Fetching
- **React Router** - Routing

### Backend (Supabase)
- **PostgreSQL 15** - Database
- **PostgREST** - REST API
- **GoTrue** - Authentication
- **Deno** - Edge Functions Runtime
- **Storage API** - File Storage

## 🚀 Fitur Backend

### 1. Authentication & Authorization
- ✅ Email/Password Authentication
- ✅ JWT Token Management
- ✅ User Approval Workflow
- ✅ Role-based Access Control (Admin/User)
- ✅ Biometric Login Support
- ✅ Password Reset via Email

### 2. Database (8 Tables)
- `profiles` - User profiles
- `stores` - Toko/merchant data
- `products` - Product catalog
- `receipts` - Transaction records
- `receipt_items` - Transaction details
- `subscriptions` - Subscription plans
- `user_roles` - User permissions
- `user_approvals` - Pending approvals

### 3. Edge Functions (Serverless)
- `reset-password` - Password reset handler
- `notify-admin-new-user` - New user notification
- `upload-qris` - QRIS image upload

### 4. Storage
- Public bucket: `store-assets`
- QRIS image storage
- Auto-generated public URLs

### 5. Security
- Row Level Security (RLS) on all tables
- User data isolation
- Admin privilege checks
- Input validation
- CORS configuration

## 📡 API Endpoints

**Base URL:** `https://czopvrdqbuezueacfjyf.supabase.co`

### REST API (Database)
```
GET    /rest/v1/products          - List products
POST   /rest/v1/products          - Create product
PATCH  /rest/v1/products?id=eq.X  - Update product
DELETE /rest/v1/products?id=eq.X  - Delete product

GET    /rest/v1/receipts          - List receipts
POST   /rest/v1/receipts          - Create receipt
GET    /rest/v1/receipt_items     - List receipt items

GET    /rest/v1/stores            - List stores
POST   /rest/v1/stores            - Create store

GET    /rest/v1/profiles          - List profiles
GET    /rest/v1/user_roles        - List user roles
```

### Edge Functions
```
POST /functions/v1/reset-password
Body: { "email": "user@example.com" }

POST /functions/v1/notify-admin-new-user
Body: { "userEmail": "new@example.com", "username": "newuser" }

POST /functions/v1/upload-qris
Body: FormData with 'file' and 'storeId'
```

### Auth API
```
POST /auth/v1/signup              - Register new user
POST /auth/v1/token?grant_type=password  - Login
POST /auth/v1/recover             - Request password reset
GET  /auth/v1/user                - Get current user
POST /auth/v1/logout              - Logout
```

### Storage API
```
GET /storage/v1/object/public/store-assets/{path}  - Get file
POST /storage/v1/object/store-assets/{path}        - Upload file
```

## 🐳 Setup dengan Docker

### Prerequisites
- Docker Desktop installed
- Git installed

### Quick Start

1. **Clone Repository**
```bash
git clone <repository-url>
cd class-buddy-notify-15-main
```

2. **Build & Run dengan Docker Compose**
```bash
docker-compose up -d
```

3. **Akses Aplikasi**
```
Frontend: http://localhost:5173
```

4. **Stop Containers**
```bash
docker-compose down
```

5. **Rebuild setelah perubahan code**
```bash
docker-compose up -d --build
```

### Docker Commands Berguna

```bash
# Lihat logs
docker-compose logs -f

# Lihat logs service tertentu
docker-compose logs -f frontend

# Restart service
docker-compose restart frontend

# Remove containers dan volumes
docker-compose down -v

# Exec ke dalam container
docker-compose exec frontend sh
```

## 💻 Setup Manual (Tanpa Docker)

### Prerequisites
- Node.js 18+ installed
- npm atau bun installed

### Installation

1. **Clone Repository**
```bash
git clone <repository-url>
cd class-buddy-notify-15-main
```

2. **Install Dependencies**
```bash
npm install
# atau
bun install
```

3. **Setup Environment Variables**

File `.env` sudah berisi konfigurasi Supabase:
```env
VITE_SUPABASE_URL=https://czopvrdqbuezueacfjyf.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **Run Development Server**
```bash
npm run dev
# atau
bun dev
```

5. **Akses Aplikasi**
```
http://localhost:5173
```

## 📊 Struktur Database

### ERD (Entity Relationship Diagram)

```
auth.users (Supabase Auth)
    ↓ (1:1)
profiles (User details)
    ↓ (1:N)
user_roles (Permissions)

profiles
    ↓ (1:N)
stores (Merchants)
    ↓ (1:N)
products (Catalog)

receipts (Transactions)
    ↓ (1:N)
receipt_items (Line items)
    ↓ (N:1)
products
```

### Key Tables

**profiles**
- `user_id` (PK, FK to auth.users)
- `username`, `full_name`, `email`
- `is_approved` (boolean)
- RLS: Users can only see their own profile

**stores**
- `id` (PK)
- `user_id` (FK to profiles)
- `name`, `address`, `qris_url`
- RLS: Users can only manage their own stores

**products**
- `id` (PK)
- `store_id` (FK to stores)
- `name`, `price`, `stock`, `barcode`
- RLS: Accessible by store owner

**receipts**
- `id` (PK)
- `store_id` (FK to stores)
- `receipt_number`, `total_amount`, `payment_method`
- RLS: Accessible by store owner

## ⚡ Edge Functions

### 1. reset-password
**Path:** `supabase/functions/reset-password/index.ts`

**Fungsi:** Mengirim email reset password ke user yang terdaftar

**Security:**
- Email whitelist validation
- CORS enabled
- Error handling lengkap

**Endpoint:**
```bash
curl -X POST https://czopvrdqbuezueacfjyf.supabase.co/functions/v1/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"tokoanjar036@gmail.com"}'
```

### 2. notify-admin-new-user
**Path:** `supabase/functions/notify-admin-new-user/index.ts`

**Fungsi:** Notifikasi admin ketika ada user baru register

**Flow:**
1. Fetch admin users dari `user_roles` table
2. Ambil email admin dari `profiles` table
3. Log notification (future: kirim email via Resend)

### 3. upload-qris
**Path:** `supabase/functions/upload-qris/index.ts`

**Fungsi:** Upload QRIS image ke Supabase Storage

**Features:**
- Support multipart/form-data dan JSON base64
- Auto-create bucket jika belum ada
- Generate public URL
- File validation

## 🔒 Security Features

### Row Level Security (RLS)

**Contoh Policy:**

```sql
-- Users can only read their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

### Security Definer Functions

```sql
-- Role check function (prevents RLS recursion)
CREATE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### Database Triggers

```sql
-- Auto create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## 🧪 Testing

### Test Edge Functions
```bash
# Reset Password
curl -X POST https://czopvrdqbuezueacfjyf.supabase.co/functions/v1/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"tokoanjar036@gmail.com"}'

# Upload QRIS
curl -X POST https://czopvrdqbuezueacfjyf.supabase.co/functions/v1/upload-qris \
  -F "file=@qris.png" \
  -F "storeId=123"
```

### Test REST API
```bash
# Get products (requires auth token)
curl https://czopvrdqbuezueacfjyf.supabase.co/rest/v1/products \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📦 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Upload dist folder
```

### Backend (Supabase)
Backend sudah deployed di Supabase Cloud:
- Database: https://czopvrdqbuezueacfjyf.supabase.co
- Edge Functions: Auto-deployed via Supabase CLI

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is for educational purposes (UTS Project).

## 👥 Team

- **Developer:** [Your Name]
- **Mata Kuliah:** Pembelajaran Sisi Server
- **Dosen:** [Nama Dosen]

## 📞 Support

For issues and questions:
- GitHub Issues: [repository-url]/issues
- Email: tokoanjar036@gmail.com

---

## 🎓 Dokumentasi untuk UTS

### Arsitektur Backend
- PostgreSQL Database (8 tables)
- Row Level Security (RLS) policies
- Serverless Edge Functions (Deno)
- RESTful API (PostgREST)
- JWT Authentication
- File Storage (S3-compatible)

### Keunggulan
✅ Scalable - Serverless architecture  
✅ Secure - RLS + JWT + Input validation  
✅ Modern - TypeScript + React + Tailwind  
✅ Production-ready - Error handling + logging  
✅ Multi-tenant - Store isolation  

### Tech Stack Diagram
```
React (Frontend)
    ↓ HTTPS
Supabase API Gateway
    ↓
┌─────────┬──────────┬─────────┐
│ PostgREST│  GoTrue  │ Storage │
└─────────┴──────────┴─────────┘
    ↓         ↓          ↓
PostgreSQL + Edge Functions (Deno)
```

---

**Project URL**: https://lovable.dev/projects/05ae667a-d57a-4c1a-89a2-2f01b3d5f67a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/05ae667a-d57a-4c1a-89a2-2f01b3d5f67a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/05ae667a-d57a-4c1a-89a2-2f01b3d5f67a) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
# commit dummy supaya AI deteksi perubahan Wed Oct  8 15:40:33 WIB 2025
