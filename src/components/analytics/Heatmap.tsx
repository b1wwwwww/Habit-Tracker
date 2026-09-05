'use client'

import { useEffect, useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Flame, Trophy, Target, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { format, startOfYear, endOfYear, startOfWeek, endOfWeek, eachDayOfInterval, getDay, isSameDay } from 'date-fns'
import { id as localeId } from 'date-fns/locale/id'
import { cn } from '@/utils/helpers'
import { motion, AnimatePresence } from 'framer-motion'

interface HeatmapProps {
  data: Record<string, number>
  year: number
  onYearChange: (year: number) => void
  streaks?: Array<{ habitId: string; title: string; currentStreak: number; bestStreak: number; totalCompletions: number }>
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const LEVELS = [
  { min: 0, max: 0, color: 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700/60', label: '0' },
  { min: 1, max: 1, color: 'bg-emerald-200 dark:bg-emerald-900/70 border-emerald-300 dark:border-emerald-800', label: '1' },
  { min: 2, max: 3, color: 'bg-emerald-300 dark:bg-emerald-800 border-emerald-400 dark:border-emerald-700', label: '2-3' },
  { min: 4, max: 6, color: 'bg-emerald-400 dark:bg-emerald-600 border-emerald-500 dark:border-emerald-500', label: '4-6' },
  { min: 7, max: 8, color: 'bg-emerald-500 dark:bg-emerald-500 border-emerald-600 dark:border-emerald-400', label: '7-8' },
  { min: 9, max: Infinity, color: 'bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 border-emerald-700', label: '9+' },
]

export function Heatmap({ data, year, onYearChange, streaks = [] }: HeatmapProps) {
  const [currentYear, setCurrentYear] = useState(year)
  const [hovered, setHovered] = useState<{ date: Date; count: number } | null>(null)
  const [selected, setSelected] = useState<{ date: Date; count: number } | null>(null)

  useEffect(() => setCurrentYear(year), [year])

  const weeks = useMemo(() => {
    const yStart = startOfYear(new Date(currentYear, 0, 1))
    const yEnd = endOfYear(new Date(currentYear, 11, 31))
    const wStart = startOfWeek(yStart, { weekStartsOn: 0 })
    const wEnd = endOfWeek(yEnd, { weekStartsOn: 0 })
    const allDays = eachDayOfInterval({ start: wStart, end: wEnd })
    const w: Date[][] = []
    let cur: Date[] = []
    allDays.forEach((d) => {
      cur.push(d)
      if (getDay(d) === 6) { w.push(cur); cur = [] }
    })
    if (cur.length) w.push(cur)
    return w
  }, [currentYear])

  const getCount = (d: Date) => data[format(d, 'yyyy-MM-dd')] || 0
  const getLevel = (c: number) => LEVELS.find(l => c >= l.min && c <= l.max) || LEVELS[0]
  const isFuture = (d: Date) => d > new Date() && !isSameDay(d, new Date())
  const total = Object.values(data).reduce((a, b) => a + b, 0)
  const activeDays = Object.values(data).filter(v => v > 0).length
  const longestStreak = streaks.reduce((m, s) => Math.max(m, s.bestStreak), 0)
  const currentStreak = streaks.reduce((m, s) => Math.max(m, s.currentStreak), 0)

  const handleYear = (y: number) => { setCurrentYear(y); onYearChange(y); setSelected(null) }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-gray-200/70 dark:border-gray-800/70 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                  Kalender Tahunan {currentYear}
                  <Sparkles className="w-4 h-4 text-amber-500 hidden sm:block" />
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                  {total} kontribusi • {activeDays} hari aktif • Tap tanggal untuk detail
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => handleYear(currentYear - 1)} className="w-8 h-8 p-0 rounded-xl">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-mono text-sm font-bold w-16 text-center px-2 py-1.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl">
                {currentYear}
              </span>
              <Button variant="ghost" size="sm" onClick={() => handleYear(currentYear + 1)} disabled={currentYear >= new Date().getFullYear()} className="w-8 h-8 p-0 rounded-xl">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-thin">
              <div className="min-w-[720px]">
                <div className="grid gap-1 ml-8 sm:ml-10 mb-2" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
                  {weeks.map((week, i) => {
                    const monthStart = week.find(d => d.getDate() >= 1 && d.getDate() <= 7)
                    const show = monthStart && monthStart.getFullYear() === currentYear
                    return (
                      <span key={i} className="text-[10px] sm:text-xs font-medium text-gray-400 dark:text-gray-500">
                        {show ? MONTHS[monthStart!.getMonth()] : ''}
                      </span>
                    )
                  })}
                </div>

                <div className="flex gap-1">
                  <div className="flex flex-col gap-1 mr-1 sm:mr-2 justify-between py-0.5 shrink-0">
                    {DAYS_SHORT.map((d, i) => (
                      <span key={i} className={cn('text-[10px] h-[14px] sm:h-[16px] flex items-center font-medium', i % 2 === 1 ? 'text-gray-400 dark:text-gray-500' : 'text-transparent')}>
                        {d.slice(0, 2)}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-1 flex-1">
                    {weeks.map((week, wi) => (
                      <motion.div key={wi} className="flex flex-col gap-1 flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: wi * 0.008 }}>
                        {week.map((day) => {
                          const count = getCount(day)
                          const level = getLevel(count)
                          const isToday = isSameDay(day, new Date())
                          const future = isFuture(day)
                          const inYear = day.getFullYear() === currentYear
                          const isSelected = selected && isSameDay(selected.date, day)
                          const isHovered = hovered && isSameDay(hovered.date, day)

                          if (!inYear && (day < startOfYear(new Date(currentYear, 0, 1)) || day > endOfYear(new Date(currentYear, 11, 31)))) {
                            return <div key={day.toISOString()} className="w-full aspect-square max-w-[16px]" />
                          }

                          return (
                            <div key={day.toISOString()} className="relative flex-1 flex">
                              <motion.button
                                onMouseEnter={() => setHovered({ date: day, count })}
                                onMouseLeave={() => setHovered(null)}
                                onFocus={() => setHovered({ date: day, count })}
                                onBlur={() => setHovered(null)}
                                onClick={() => !future && setSelected({ date: day, count })}
                                disabled={future}
                                aria-label={`${format(day, 'EEEE, dd MMMM yyyy', { locale: localeId })}: ${count} selesai`}
                                className={cn(
                                  'w-full aspect-square rounded-[4px] border transition-all duration-200 relative group max-w-[16px] mx-auto',
                                  level.color,
                                  future && 'opacity-30 cursor-not-allowed',
                                  isToday && 'ring-2 ring-violet-500 ring-offset-1 dark:ring-offset-gray-900 z-10 scale-110',
                                  isSelected && 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-900 z-10 scale-110',
                                  !future && 'hover:scale-[1.35] hover:z-20 hover:shadow-md active:scale-95 cursor-pointer',
                                  'focus:outline-none focus:ring-2 focus:ring-violet-500'
                                )}
                                whileHover={!future ? { scale: 1.2 } : {}}
                                whileTap={!future ? { scale: 0.9 } : {}}
                              >
                                {count >= 7 && !future && <span className="absolute inset-0 flex items-center justify-center text-[7px]">🔥</span>}
                              </motion.button>

                              <AnimatePresence>
                                {isHovered && !future && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 pointer-events-none"
                                  >
                                    <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded-xl px-3 py-2 shadow-xl whitespace-nowrap border border-white/10">
                                      <p className="font-semibold">{format(day, 'EEEE, dd MMM yyyy', { locale: localeId })}</p>
                                      <p className="opacity-80">{count === 0 ? 'Belum ada aktivitas' : `${count} habit selesai`}{isToday ? ' • Hari ini' : ''}</p>
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-white rotate-45 -mt-1" />
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )
                        })}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Kurang</span>
                <div className="flex gap-1.5">
                  {LEVELS.map((level, i) => (
                    <motion.div key={i} className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] border', level.color)} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.05 * i, type: 'spring' }} title={level.label} />
                  ))}
                </div>
                <span>Lebih</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">Klik tanggal untuk lihat streak & detail</p>
            </div>

            <AnimatePresence>
              {selected && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-emerald-500/10 border border-violet-200/50 dark:border-violet-800/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm shrink-0', getLevel(selected.count).color)}>
                      {selected.count > 0 ? <span className="text-lg">✓</span> : <span className="text-gray-400">○</span>}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{format(selected.date, 'EEEE, dd MMMM yyyy', { locale: localeId })}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selected.count === 0 ? 'Tidak ada habit selesai' : `${selected.count} habit selesai`} {isSameDay(selected.date, new Date()) && '• Hari ini'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="rounded-xl">Tutup</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {(streaks.length > 0 || total > 0) && (
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StatCard icon={<Flame className="w-5 h-5" />} gradient="from-orange-500 to-red-500" title="Streak Aktif" value={currentStreak} suffix="hari" trend={currentStreak > 0 ? 'Menyala! 🔥' : 'Mulai streak hari ini'} />
          <StatCard icon={<Trophy className="w-5 h-5" />} gradient="from-amber-500 to-yellow-500" title="Rekor Terbaik" value={longestStreak} suffix="hari" trend="Rekor sepanjang masa" />
          <StatCard icon={<Target className="w-5 h-5" />} gradient="from-blue-500 to-violet-600" title="Total Kontribusi" value={total} suffix="x" trend={`${activeDays} hari aktif`} />
        </motion.div>
      )}
    </div>
  )
}

function StatCard({ icon, gradient, title, value, suffix, trend }: { icon: React.ReactNode; gradient: string; title: string; value: number; suffix: string; trend: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 400 }}>
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/60 dark:border-gray-800/60 hover:shadow-lg transition-all">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-1">{title}</p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <motion.span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>{value}</motion.span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{suffix}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{trend}</p>
            </div>
            <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg shrink-0', gradient)}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
