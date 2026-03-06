# Raven — Premium Fragrances

Raven is a luxurious, full-stack e-commerce web application designed for browsing and purchasing niche, premium fragrances. The platform is built around a modern black and gold premium aesthetic with interactive, buttery-smooth animations and a deeply immersive shopping experience.

## ✨ Features

- **Premium UI/UX:** A bespoke black and gold dark theme with subtle grain overlays, custom cursors, and fluid scroll animations.
- **Advanced Filtering:** Browse fragrances by collection (Bestsellers, New Arrivals), gender, scent family, and price range.
- **Immersive Product Details:** Detailed breakdown of fragrance pyramids (Top, Heart, Base notes), longevity, sillage, and customer reviews.
- **Seamless Cart & Checkout:** An integrated cart drawer and multi-step checkout experience.
- **Responsive Design:** Fully tailored for mobile, tablet, and desktop viewports.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS v4 (with custom tokens in standard CSS)
- **State Management:** Zustand (for Cart/UI state)
- **Data Fetching:** React Query (@tanstack/react-query)
- **Routing:** React Router v7
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Carousels:** Embla Carousel React

### Backend
- **Runtime:** Node.js + Express
- **Language:** TypeScript
- **Database & Auth:** Supabase (PostgreSQL + Supabase JS Client)
- **Caching & Rate Limiting:** Redis (@upstash/redis)
- **Validation:** Zod
- **Security:** Helmet, CORS, bcrypt, jsonwebtoken

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm
- Supabase project (for database and authentication)
- Redis instance (Upstash recommended)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd PERFUME-WEBSITE
   ```

2. **Install Frontend Dependencies:**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

### Running the Application

**Start the Frontend Development Server:**
```bash
# From the root directory
npm run dev
```
The frontend will be available at `http://localhost:5173`.

**Start the Backend Development Server:**
```bash
# From the backend directory
npm run dev
```
The API server will run on `http://localhost:5000` (or the port specified in your environment variables).

### Database Setup & Seeding

Inside the `backend` folder, you can run the following scripts to initialize and seed your Supabase database:

```bash
cd backend
npm run migrate # Run database migrations
npm run seed    # Seed initial product and category data
```

## 🎨 Theme Configuration

The aesthetic of Raven is heavily customized. Global design tokens, including the primary dark theme colors (`#0d0d0d`, `#1a1a1a`) and gold accents (`#d4af37`), are defined locally in `src/styles/globals.css` and `src/index.css` via Tailwind v4's `@theme` directive.

## 📄 License

This project is licensed under the MIT License.
