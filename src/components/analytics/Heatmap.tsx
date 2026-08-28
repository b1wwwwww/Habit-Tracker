'use client'

import { useEffect, useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Flame, Target, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { format, startOfYear, endOfYear, startOfWeek, endOfWeek, eachDayOfInterval, getDay, isSameDay, isSameMonth, subYears, addYears } from 'date-fns'
import { cn } from '@/utils/helpers'

interface HeatmapProps {
  data: Record<string, number>
  year: number
  onYearChange: (year: number) => void
  streaks?: Array<{ habitId: string; title: string; currentStreak: number; bestStreak: number; totalCompletions: number }>
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const DAYS_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

const LEVEL_COLORS = {
  light: {
    0: 'bg-gray-100',
    1: 'bg-emerald-100',
    2: 'bg-emerald-200',
    3: 'bg-emerald-300',
    4: 'bg-emerald-400',
    5: 'bg-emerald-500',
  },
  dark: {
    0: 'bg-gray-800',
    1: 'bg-emerald-900/30',
    2: 'bg-emerald-900/50',
    3: 'bg-emerald-900/70',
    4: 'bg-emerald-800',
    5: 'bg-emerald-700',
  }
}

export function Heatmap({ data, year, onYearChange, streaks = [] }: HeatmapProps) {
  const [currentYear, setCurrentYear] = useState(year)
  const [hoveredDay, setHoveredDay] = useState<{ date: Date; count: number } | null>(null)

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

  const getLevel = (count: number): number => {
    if (count === 0) return 0
    if (count <= 2) return 1
    if (count <= 4) return 2
    if (count <= 6) return 3
    if (count <= 8) return 4
    return 5
  }

  const getColorClass = (count: number): string => {
    const level = getLevel(count)
    return `dark:${LEVEL_COLORS.dark[level as keyof typeof LEVEL_COLORS.dark]} ${LEVEL_COLORS.light[level as keyof typeof LEVEL_COLORS.light]}`
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
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Konsistensi {currentYear}</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">{totalContributions} kontribusi total • {activeDays} hari aktif</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleYearChange(currentYear - 1)} aria-label="Tahun sebelumnya">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-mono text-sm font-medium w-16 text-center px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">{currentYear}</span>
            <Button variant="ghost" size="sm" onClick={() => handleYearChange(currentYear + 1)} disabled={currentYear >= new Date().getFullYear()} aria-label="Tahun berikutnya">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" role="img" aria-label={`Heatmap aktivitas tahun ${currentYear}`}>
              <thead>
                <tr>
                  <th className="text-right pr-2 font-medium text-gray-500 dark:text-gray-400">Minggu</th>
                  {DAYS.map((day) => (
                    <th key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, weekIndex) => (
                  <tr key={weekIndex}>
                    <td className="text-right pr-2 text-xs text-gray-500 dark:text-gray-400 align-top py-1">
                      {isSameMonth(week[0], week[6]) ? MONTHS[week[0].getMonth()] : ''}
                    </td>
                    {week.map((day, dayIndex) => {
                      const count = getCount(day)
                      const level = getLevel(count)
                      const isCurrentMonth = day.getMonth() === week[0].getMonth() || weekIndex === 0
                      const isToday = isSameDay(day, new Date())
                      const isFutureDay = isFuture(day)
                      
                      return (
                        <td key={dayIndex} className="text-center align-top py-1">
                          {isCurrentMonth ? (
                            <div
                              className={cn(
                                'w-7 h-7 mx-auto rounded transition-all duration-300 cursor-pointer relative group',
                                getColorClass(count),
                                isFutureDay && 'opacity-30 cursor-not-allowed',
                                isToday && 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900 scale-110',
                                'hover:scale-125 hover:z-10'
                              )}
                              title={`${DAYS_FULL[day.getDay()]}, ${format(day, 'dd MMM yyyy')}: ${count} habit${count !== 1 ? 's' : ''} selesai`}
                              role="button"
                              tabIndex={0}
                              onMouseEnter={() => setHoveredDay({ date: day, count })}
                              onMouseLeave={() => setHoveredDay(null)}
                              onFocus={() => setHoveredDay({ date: day, count })}
                              onBlur={() => setHoveredDay(null)}
                            >
                              {level > 0 && (
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  {count} habit
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="w-7 h-7 mx-auto" />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Kurang</span>
            <div className="flex gap-1">
              <div className="w-7 h-7 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="w-7 h-7 rounded bg-emerald-100 dark:bg-emerald-900/30" />
              <div className="w-7 h-7 rounded bg-emerald-200 dark:bg-emerald-900/50" />
              <div className="w-7 h-7 rounded bg-emerald-300 dark:bg-emerald-900/70" />
              <div className="w-7 h-7 rounded bg-emerald-400 dark:bg-emerald-800" />
              <div className="w-7 h-7 rounded bg-emerald-500 dark:bg-emerald-700" />
            </div>
            <span>Lebih</span>
          </div>
        </CardContent>
      </Card>

      {hoveredDay && (
        <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-right-4">
          <Card className="w-64 shadow-xl border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <span className="text-2xl">{hoveredDay.count > 0 ? '✓' : '○'}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {format(hoveredDay.date, 'dd MMMM yyyy')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {DAYS_FULL[hoveredDay.date.getDay()]} • {hoveredDay.count} habit{hoveredDay.count !== 1 ? 's' : ''} selesai
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {(streaks.length > 0 || totalContributions > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<Flame className="w-5 h-5" />}
            iconColor="text-orange-500"
            bgColor="bg-orange-100 dark:bg-orange-900/30"
            title="Streak Saat Ini"
            value={currentStreak}
            suffix="hari"
            trend={currentStreak > 0 ? 'Aktif' : 'Mulai hari ini'}
          />
          <StatCard
            icon={<Trophy className="w-5 h-5" />}
            iconColor="text-yellow-500"
            bgColor="bg-yellow-100 dark:bg-yellow-900/30"
            title="Rekor Terbaik"
            value={longestStreak}
            suffix="hari"
            trend="Tertinggi sepanjang masa"
          />
          <StatCard
            icon={<Target className="w-5 h-5" />}
            iconColor="text-blue-500"
            bgColor="bg-blue-100 dark:bg-blue-900/30"
            title="Total Kontribusi"
            value={totalContributions}
            suffix="x"
            trend={`${activeDays} hari aktif dari ${weeks.length * 7} hari`}
          />
        </div>
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
}

function StatCard({ icon, iconColor, bgColor, title, value, suffix, trend }: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
              <span className="text-gray-500 dark:text-gray-400">{suffix}</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{trend}</p>
          </div>
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bgColor, iconColor)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}