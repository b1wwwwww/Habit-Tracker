# Panduan Habit Tracker — Lengkap

> Copy-paste friendly. Semua command siap salin.

---

## 1. Status Prombakan — Sudah Semua?

**Ya, 6 perubahan selesai (build pass):**

| # | Perubahan | File |
|---|-----------|------|
| 1 | Fix 5 TS error (locale `id`, tipe `HabitWithStatus`) | `dashboard/page.tsx`, `types/index.ts`, `useHabits.ts` |
| 2 | Rombak `HabitCard` — glass, gradient, animasi streak | `components/habits/HabitCard.tsx` |
| 3 | Kalender Tahunan GitHub-style (tap tanggal, tooltip, select) | `components/analytics/Heatmap.tsx` |
| 4 | Dashboard progress ring 40px + grid stats | `app/dashboard/page.tsx` |
| 5 | `StreakCard` gradient + animasi flame | `components/analytics/StreakCard.tsx` |
| 6 | Global CSS — gradien background, glass, radius | `app/globals.css` |

Commit per perubahan sesuai syarat `stop tiap 1 perubahan → push`.

---

## 2. Cara Jalanin Project

```bash
# 1. Masuk folder
cd /home/nnabiel/All-Project/habit-tracker

# 2. Install
npm install

# 3. Env — copy & edit
cp .env.example .env
# Isi DATABASE_URL dan JWT_SECRET (lihat .env saat ini)

# 4. DB setup (pilih satu)
npm run db:push        # push schema ke Postgres
npx prisma migrate dev # kalau pakai migration

# 5. Generate client
npx prisma generate

# 6. Dev server
npm run dev
# Buka http://localhost:3000

# 7. Build check
npm run build
```

**Env contoh (sudah ada di .env):**
```
DATABASE_URL="postgresql://nnabiel:28085677@localhost:5432/habittracker?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 3. Cara Lihat DB — 3 Cara

### Cara A: Prisma Studio (paling mudah, UI browser)
```bash
npm run db:studio
# atau
npx prisma studio
# Buka http://localhost:5555 → lihat tabel users, habits, habit_logs
```

### Cara B: psql (terminal)
```bash
# Masuk psql
psql "postgresql://nnabiel:28085677@localhost:5432/habittracker"

# Di dalam psql:
\dt                          # list tabel
\d users                     # struktur users
\d habits
\d habit_logs
SELECT * FROM users LIMIT 5;
SELECT id, title, category, frequency_type FROM habits LIMIT 10;
SELECT habit_id, completed_date, status FROM habit_logs ORDER BY completed_date DESC LIMIT 10;

# Query streak contoh
SELECT h.title, COUNT(l.id) as total FROM habits h LEFT JOIN habit_logs l ON l.habit_id = h.id GROUP BY h.id;

\q                           # keluar
```

### Cara C: GUI (TablePlus / pgAdmin / DBeaver)
- Host: `localhost` Port: `5432`
- Database: `habittracker` User: `nnabiel` Password: `28085677`
- Connect → lihat tabel `users`, `habits`, `habit_logs`

### Seed / Reset cepat
```bash
# Hapus & buat ulang
npx prisma db push --force-reset
npx prisma generate
```

---

## 4. Cara Push ke GitHub (sesuai syarat stop-per-perubahan)

```bash
git status
git diff --stat

# Commit 1: Fix TS
git add src/types/index.ts src/hooks/useHabits.ts src/app/dashboard/page.tsx
git commit -m "fix: TS build error locale & HabitWithStatus"

# Commit 2: HabitCard
git add src/components/habits/HabitCard.tsx
git commit -m "ui: rombak HabitCard glass + animasi streak"

# Commit 3: Heatmap
git add src/components/analytics/Heatmap.tsx
git commit -m "feat: kalender tahunan heatmap interaktif"

# Commit 4: Dashboard
git add src/app/dashboard/page.tsx
git commit -m "ui: dashboard progress ring & stats glass"

# Commit 5: StreakCard
git add src/components/analytics/StreakCard.tsx
git commit -m "ui: StreakCard gradient & flame animasi"

# Commit 6: Global
git add src/app/globals.css
git commit -m "style: global gradient & glass"

git log --oneline -6
git push origin main
```

---

## 5. Cara Jelaskan Saat Demo / Presentasi

**1 kalimat pitch:**
> Habit Tracker Next.js 16 + Prisma Postgres — tracking harian, streak, kalender tahunan GitHub-style, animasi Framer Motion.

**Poin jelaskan per fitur:**
- **Landing** — hero gradient, fitur 6 kartu, dark/light toggle via localStorage
- **Dashboard** — progress ring `/api/habits/dashboard/today`, filter `isDueToday`, optimistic check-in di `useHabits`
- **HabitCard** — kategori badge, streak 🔥 animasi `scale [1,1.05,1]`, progress bar gradient, input numerik modal
- **Heatmap** — `weeks` dari `date-fns` (startOfYear→endOfWeek), 6 level warna, hover tooltip, select tanggal → detail card, `format(..., {locale: id})`
- **Streak** — `currentStreak/bestStreak` dari `calculateStreak()` (group by habit, `differenceInDays`), level Legend/Master/On Fire, progress 30 hari
- **DB** — Prisma schema `User 1—N Habit 1—N HabitLog`, `HabitLog @@unique([habitId, completedDate])`, auth JWT HttpOnly `jose`
- **Tech** — Next.js App Router, Tailwind v4, Framer Motion, Zod, date-fns, lucide-react, Turbopack build

**Alur demo live:**
1. `npm run db:studio` → tunjuk tabel
2. Register → Login → Buat habit (BOOLEAN & NUMERIC)
3. Dashboard → check-in → progress ring animasi
4. Statistik → Heatmap → tap tanggal 7+ muncul 🔥
5. Dark mode toggle

---

## 6. Checklist Verifikasi

```bash
npm run build        # harus Compiled successfully
npm run lint         # cek lint
npx prisma validate  # validasi schema
```

---

## 7. Troubleshooting

| Masalah | Fix |
|--------|-----|
| `DATABASE_URL` error | Cek `.env`, pastikan Postgres jalan `sudo service postgresql status` |
| `prisma generate` fail | `rm -rf node_modules && npm install && npx prisma generate` |
| Streak 0 terus | Cek `habit_logs.status = COMPLETED` & `completedDate` hari ini |
| Heatmap kosong | Cek `GET /api/analytics/heatmap?year=2025` return `heatmap` object |

---

**File ini siap salin. Tinggal commit:**
```bash
git add PANDUAN.md && git commit -m "docs: panduan lengkap project" && git push
```
