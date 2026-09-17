# Testing Checklist - Habit Tracker

## 1. Authentication Flow
- [ ] Register dengan email/password valid
- [ ] Register dengan email sudah terdaftar → error message
- [ ] Register password < 8 char → validation error
- [ ] Login dengan credentials benar
- [ ] Login dengan credentials salah → error
- [ ] Logout → redirect ke landing
- [ ] Protected route `/dashboard` tanpa auth → redirect `/login`
- [ ] Session persist setelah refresh (JWT cookie)

## 2. Habit Management
- [ ] Create habit BOOLEAN type (Setiap hari)
- [ ] Create habit NUMERIC type (target 10, misalnya)
- [ ] Create habit dengan frequency CUSTOM_DAYS
- [ ] Edit habit (ubah title/category/target)
- [ ] Delete habit → confirm modal → habit hilang
- [ ] Habit list tampil dengan kategori badge + streak indicator
- [ ] Archive habit functionality (jika ada)

## 3. Check-in & Notes
- [ ] Check-in BOOLEAN habit (1-click)
- [ ] Check-in NUMERIC habit → modal input +/- buttons
- [ ] Add note di modal → save ke database
- [ ] Note persists setelah refresh
- [ ] Undo check-in → habit kembali uncompleted
- [ ] Check-in same habit 2x same day → update (tidak duplicate)

## 4. Dashboard & Progress
- [ ] Progress ring animasi smooth (0% → 100%)
- [ ] Progress ring text update real-time
- [ ] Stat cards (Total Habit, Sisa Tugas) sync dengan progress
- [ ] Confetti trigger saat progress = 100% ✨
- [ ] "Belum Ada Habit Hari Ini" empty state muncul
- [ ] Tab switch (Hari Ini ↔ Statistik) lancar

## 5. Analytics & Heatmap
- [ ] Heatmap grid render dengan 6 level warna
- [ ] Hover cell → tooltip muncul (format: "Senin, 17 Sep 2026: 3 habit selesai")
- [ ] Click cell → detail card muncul
- [ ] Year navigation (prev/next) works
- [ ] Streak stat cards (Current/Best/Total) update
- [ ] 🔥 emoji muncul di cell dengan ≥7 completions

## 6. UI/UX
- [ ] Dark/Light mode toggle works
- [ ] Theme persist di localStorage
- [ ] Responsive mobile (hamburger menu)
- [ ] Mobile sidebar open/close smooth
- [ ] Loading spinner animasi smooth
- [ ] Toast messages disappear after 3s
- [ ] Buttons feedback (hover/active states)

## 7. Database & Optimization
- [ ] Check habit_logs table punya `note` field
- [ ] Check indexes created (`user_id`, `userId, completedDate`)
- [ ] Query dashboard < 500ms (check logs)
- [ ] No N+1 queries di habit fetch

## 8. Cron & Reminders (Foundation)
- [ ] POST /api/cron/send-reminders dengan Bearer token valid
- [ ] Console logs reminder tasks (belum email)
- [ ] Skip reminders jika habit sudah selesai hari ini
- [ ] Check cron timestamp di response

## 9. Security
- [ ] Security headers present (check DevTools)
- [ ] No XSS vulnerabilities (input sanitized)
- [ ] API endpoints require auth (test without token)
- [ ] CORS headers correct
- [ ] Password hashed bcryptjs (check DB)

## 10. Landing Page
- [ ] Hero section load smooth
- [ ] Dashboard mockup preview animasi
- [ ] Testimonial section 3 cards render
- [ ] Star rating visible di testimonial
- [ ] CTA buttons redirect correct pages
- [ ] Footer info complete

## 11. Edge Cases
- [ ] Create 100 habits → performance OK
- [ ] Check-in dari 2 browser tab simultaneously → sync correctly
- [ ] Timezone handling (jika setting timezone)
- [ ] Leap year heatmap (Feb 29)
- [ ] Session timeout behavior

## 12. Build & Deploy
- [ ] npm run build → 0 errors
- [ ] npm run lint → 0 errors
- [ ] npm run db:push → schema sync
- [ ] .env vars set correctly
- [ ] Prisma client generated

---

**Last Updated:** 2026-09-17  
**Status:** Ready for QA
