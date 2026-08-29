'use client'

import { useEffect, useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Flame, Trophy, Target, Activity } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { format, startOfYear, endOfYear, startOfWeek, endOfWeek, eachDayOfInterval, getDay, isSameDay, isSameMonth } from 'date-fns'
import { cn } from '@/utils/helpers'
import { motion, AnimatePresence } from 'framer-motion'

interface HeatmapProps {
  data: Record<string, number>
  year: number
  onYearChange: (year: number) => void
  streaks?: Array<{ habitId: string; title: string; currentStreak: number; bestStreak: number; totalCompletions: number }>
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const DAYS_SHORT = ['M', 'S', 'S', 'R', 'K', 'J', 'S']
const DAYS_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

const LEVELS = [
  { min: 0, max: 0, color: 'bg-gray-200 dark:bg-gray-800', label: 'Tidak ada' },
  { min: 1, max: 2, color: 'bg-emerald-200 dark:bg-emerald-800', label: '1-2' },
  { min: 3, max: 4, color: 'bg-emerald-300 dark:bg-emerald-700', label: '3-4' },
  { min: 5, max: 6, color: 'bg-emerald-400 dark:bg-emerald-600', label: '5-6' },
  { min: 7, max: 8, color: 'bg-emerald-500 dark:bg-emerald-500', label: '7-8' },
  { min: 9, max: Infinity, color: 'bg-emerald-600 dark:bg-emerald-400', label: '9+' },
]

export function Heatmap({ data, year, onYearChange, streaks = [] }: HeatmapProps) {
  const [currentYear, setCurrentYear] = useState(year)
  const [hoveredCell, setHoveredCell] = useState<{ date: Date; count: number } | null>(null)

  useEffect(() => {
    setCurrentYear(year)
  }, [year])

  const weeks = useMemo(() => {
    const yearStart = startOfYear(new Date(currentYear, 0, 1))
    const yearEnd = endOfYear(new Date(currentYear, 11, 31))
    const weekStart = startOfWeek(yearStart, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(yearEnd, { weekStartsOn: 0 })
    const allDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

    const weeks: Date[][] = []
    let currentWeek: Date[] = []

    allDays.forEach((day) => {
      currentWeek.push(day)
      if (getDay(day) === 6) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    })
    if (currentWeek.length > 0) weeks.push(currentWeek)
    return weeks
  }, [currentYear])

  const getCount = (date: Date): number => {
    const key = format(date, 'yyyy-MM-dd')
    return data[key] || 0
  }

  const getLevel = (count: number) => {
    return LEVELS.find(l => count >= l.min && count <= l.max) || LEVELS[0]
  }

  const getColorClass = (count: number): string => {
    return getLevel(count).color
  }

  const isFuture = (date: Date) => date > new Date()

  const handleYearChange = (newYear: number) => {
    setCurrentYear(newYear)
    onYearChange(newYear)
  }

  const totalContributions = Object.values(data).reduce((sum, val) => sum + val, 0)
  const activeDays = Object.values(data).filter(val => val > 0).length
  const longestStreak = streaks.reduce((max, s) => Math.max(max, s.bestStreak), 0)
  const currentStreak = streaks.reduce((max, s) => Math.max(max, s.currentStreak), 0)

  return (
    <div className="space-y-6">
      {/* Main Heatmap Card */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Konsistensi {currentYear}</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {totalContributions} total • {activeDays} hari aktif • {weeks.length} minggu
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleYearChange(currentYear - 1)}
              aria-label="Tahun sebelumnya"
              className="w-8 h-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-mono text-sm font-medium w-16 text-center px-2 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {currentYear}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleYearChange(currentYear + 1)}
              disabled={currentYear >= new Date().getFullYear()}
              aria-label="Tahun berikutnya"
              className="w-8 h-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 pb-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" role="img" aria-label={`Heatmap aktivitas tahun ${currentYear}`}>
              <thead>
                <tr>
                  <th className="text-right pr-3 font-medium text-gray-500 dark:text-gray-400">Minggu</th>
                  {DAYS_SHORT.map((day, i) => (
                    <th key={i} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2 px-1">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, weekIndex) => (
                  <tr key={weekIndex}>
                    <td className="text-right pr-3 text-xs text-gray-500 dark:text-gray-400 align-top py-1">
                      {isSameMonth(week[0], week[6]) ? MONTHS[week[0].getMonth()] : ''}
                    </td>
                    {week.map((day, dayIndex) => {
                      const count = getCount(day)
                      const level = getLevel(count)
                      const isCurrentMonth = day.getMonth() === week[0].getMonth() || weekIndex === 0
                      const isToday = isSameDay(day, new Date())
                      const isFutureDay = isFuture(day)
                      
                      return (
                        <td key={dayIndex} className="text-center align-top py-1 px-1">
                          {isCurrentMonth ? (
                            <motion.button
                              className={cn(
                                'w-9 h-9 mx-auto rounded transition-all duration-200 relative group',
                                getColorClass(count),
                                isFutureDay && 'opacity-40 cursor-not-allowed',
                                isToday && 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900 scale-110',
                                'hover:scale-125 hover:z-10 active:scale-95',
                                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                              )}
                              title={`${DAYS_FULL[day.getDay()]}, ${format(day, 'dd MMM yyyy')}: ${count} habit${count !== 1 ? 's' : ''} selesai`}
                              onMouseEnter={() => setHoveredCell({ date: day, count })}
                              onMouseLeave={() => setHoveredCell(null)}
                              onFocus={() => setHoveredCell({ date: day, count })}
                              onBlur={() => setHoveredCell(null)}
                              disabled={isFutureDay}
                              aria-label={`${DAYS_FULL[day.getDay()]}, ${format(day, 'dd MMMM yyyy')}: ${count} habit selesai`}
                            >
                              {level.min > 0 && (
                                <motion.span
                                  className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-gray-900 text-white px-2 py-1 rounded shadow-lg"
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                >
                                  {count} habit
                                </motion.span>
                              )}
                            </motion.button>
                          ) : (
                            <div className="w-9 h-9 mx-auto" />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">Kurang</span>
            <div className="flex gap-1" role="img" aria-label="Legenda tingkat aktivitas">
              {LEVELS.map((level, i) => (
                <motion.div
                  key={i}
                  className={cn('w-9 h-9 rounded', level.color)}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.05 * i, type: 'spring', stiffness: 300 }}
                  title={`${level.label} habit/hari`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Lebih</span>
          </div>
        </CardContent>
      </Card>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredCell && !isFuture(hoveredCell.date) && (
          <motion.div
            className="fixed bottom-8 right-8 z-50"
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <Card className="w-64 shadow-xl border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', getColorClass(hoveredCell.count))}>
                    {hoveredCell.count > 0 ? (
                      <span className="text-xl font-bold text-white">✓</span>
                    ) : (
                      <span className="text-xl text-gray-400">○</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {format(hoveredCell.date, 'dd MMMM yyyy')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {DAYS_FULL[hoveredCell.date.getDay()]} • {hoveredCell.count} habit{hoveredCell.count !== 1 ? 's' : ''} selesai
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Stats */}
      {(streaks.length > 0 || totalContributions > 0) && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            icon={<Flame className="w-5 h-5" />}
            iconColor="text-orange-500"
            bgColor="bg-orange-100 dark:bg-orange-900/30"
            title="Streak Saat Ini"
            value={currentStreak}
            suffix="hari"
            trend={currentStreak > 0 ? 'Sedang berjalan 🔥' : 'Mulai hari ini'}
            trendColor={currentStreak > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}
          />
          <StatCard
            icon={<Trophy className="w-5 h-5" />}
            iconColor="text-yellow-500"
            bgColor="bg-yellow-100 dark:bg-yellow-900/30"
            title="Rekor Terbaik"
            value={longestStreak}
            suffix="hari"
            trend="Tertinggi sepanjang masa"
            trendColor="text-yellow-600 dark:text-yellow-400"
          />
          <StatCard
            icon={<Target className="w-5 h-5" />}
            iconColor="text-blue-500"
            bgColor="bg-blue-100 dark:bg-blue-900/30"
            title="Total Kontribusi"
            value={totalContributions}
            suffix="x"
            trend={`${activeDays} hari aktif dari ${weeks.length * 7} hari`}
            trendColor="text-blue-600 dark:text-blue-400"
          />
        </motion.div>
      )}
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  iconColor: string
  bgColor: string
  title: string
  value: number
  suffix: string
  trend: string
  trendColor: string
}

function StatCard({ icon, iconColor, bgColor, title, value, suffix, trend, trendColor }: StatCardProps) {
  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
              <span className="text-gray-500 dark:text-gray-400">{suffix}</span>
            </div>
            <p className={cn('text-xs', trendColor)}>{trend}</p>
          </div>
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', bgColor, iconColor)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}