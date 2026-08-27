'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { format, startOfYear, endOfYear, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, getDay, isSameDay, isSameMonth } from 'date-fns'
import { cn } from '@/utils/helpers'

interface HeatmapProps {
  data: Record<string, number>
  year: number
  onYearChange: (year: number) => void
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export function Heatmap({ data, year, onYearChange }: HeatmapProps) {
  const [currentYear, setCurrentYear] = useState(year)

  useEffect(() => {
    setCurrentYear(year)
  }, [year])

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

  const getCount = (date: Date): number => {
    const key = format(date, 'yyyy-MM-dd')
    return data[key] || 0
  }

  const getColor = (count: number): string => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
    if (count <= 2) return 'bg-green-200 dark:bg-green-900'
    if (count <= 4) return 'bg-green-300 dark:bg-green-800'
    if (count <= 6) return 'bg-green-400 dark:bg-green-700'
    return 'bg-green-500 dark:bg-green-600'
  }

  const isFuture = (date: Date) => date > new Date()

  const handleYearChange = (newYear: number) => {
    setCurrentYear(newYear)
    onYearChange(newYear)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Konsistensi {currentYear}</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleYearChange(currentYear - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-mono text-sm font-medium w-16 text-center">{currentYear}</span>
          <Button variant="ghost" size="sm" onClick={() => handleYearChange(currentYear + 1)} disabled={currentYear >= new Date().getFullYear()}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
                  {week.map((day, dayIndex) => (
                    <td key={dayIndex} className="text-center align-top py-1">
                      {day.getMonth() === week[0].getMonth() || weekIndex === 0 ? (
                        <div
                          className={cn(
                            'w-6 h-6 mx-auto rounded transition-colors cursor-pointer',
                            getColor(getCount(day)),
                            isFuture(day) && 'opacity-30 cursor-not-allowed',
                            isSameDay(day, new Date()) && 'ring-2 ring-primary'
                          )}
                          title={`${format(day, 'dd MMM yyyy')}: ${getCount(day)} habit${getCount(day) !== 1 ? 's' : ''} selesai`}
                          role="button"
                          tabIndex={0}
                        />
                      ) : (
                        <div className="w-6 h-6 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
          <span>Kurang</span>
          <div className="flex gap-1">
            <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="w-6 h-6 rounded bg-green-200 dark:bg-green-900" />
            <div className="w-6 h-6 rounded bg-green-300 dark:bg-green-800" />
            <div className="w-6 h-6 rounded bg-green-400 dark:bg-green-700" />
            <div className="w-6 h-6 rounded bg-green-500 dark:bg-green-600" />
          </div>
          <span>Lebih</span>
        </div>
      </CardContent>
    </Card>
  )
}