# Habit Tracker

Aplikasi pelacakan kebiasaan modern dibangun dengan Next.js 15, React 19, PostgreSQL, dan Prisma.

## Fitur Utama

- 🔐 **Autentikasi** - Register/Login dengan JWT dan HttpOnly cookies
- 🎯 **Manajemen Habit** - CRUD habit dengan frekuensi fleksibel (harian, mingguan, hari tertentu)
- 📅 **Tracking Harian** - Dashboard hari ini dengan progress ring dan check-in mudah
- 🔥 **Streak & Analytics** - Heatmap seperti GitHub, streak counter, completion rate
- 🔔 **Pengingat** - Reminder time per habit (foundation untuk notifikasi)
- 🌙 **Dark Mode** - Dukungan tema gelap/terang

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL dengan Prisma ORM
- **Auth**: JWT (jose) + HttpOnly Cookies
- **Validation**: Zod + React Hook Form
- **Icons**: Lucide React
- **Date**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm/pnpm/yarn

### Installation

1. Clone dan masuk ke direktori:
```bash
cd habit-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment:
```bash
cp .env.example .env
# Edit .env dengan DATABASE_URL dan JWT_SECRET Anda
```

4. Setup database:
```bash
npm run db:push
# atau untuk development dengan Prisma Studio
npm run db:studio
```

5. Jalankan development server:
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Database Schema

```prisma
User {
  id, name, email, passwordHash, timezone, createdAt
}

Habit {
  id, userId, title, description, category,
  targetType (BOOLEAN|NUMERIC), targetValue,
  frequencyType (DAILY|CUSTOM_DAYS|WEEKLY), frequencyDays[],
  reminderTime, isArchived, createdAt
}

HabitLog {
  id, habitId, userId, completedDate,
  currentValue, status (COMPLETED|PARTIAL|SKIPPED)
}
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Registrasi
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Get session

### Habits
- `GET /api/habits` - List habits
- `POST /api/habits` - Create habit
- `GET /api/habits/:id` - Get habit detail
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Archive habit
- `POST /api/habits/:id/check-in` - Check-in habit
- `DELETE /api/habits/:id/check-in` - Undo check-in
- `GET /api/habits/dashboard/today` - Today's dashboard

### Analytics
- `GET /api/analytics/streaks` - Streak data
- `GET /api/analytics/heatmap?year=2024` - Heatmap data

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── dashboard/     # Dashboard page
│   ├── login/         # Login page
│   ├── register/      # Register page
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Landing page
│   └── globals.css    # Global styles
├── components/
│   ├── ui/            # Base UI components
│   ├── habits/        # Habit components
│   └── analytics/     # Analytics components
├── hooks/             # Custom React hooks
├── lib/               # Utilities (prisma, auth, validations)
├── types/             # TypeScript types
└── utils/             # Helper functions
```

## Deployment

### Vercel (Recommended)

1. Push ke GitHub
2. Import di Vercel
3. Set environment variables
4. Deploy

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## License

MIT