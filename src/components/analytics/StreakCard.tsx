'use client'

import { Flame, Trophy, Target, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/utils/helpers'

interface StreakCardProps {
  title: string
  currentStreak: number
  bestStreak: number
  totalCompletions: number
}

export function StreakCard({ title, currentStreak, bestStreak, totalCompletions }: StreakCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <Flame className="w-8 h-8 text-orange-500" />
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{currentStreak}</span>
              <span className="text-gray-500 dark:text-gray-400">hari</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Rekor Terbaik</p>
            <div className="flex items-baseline justify-end gap-1">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">{bestStreak}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Selesai</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{totalCompletions}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">Persentase</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {currentStreak > 0 ? 'Aktif' : 'Mulai'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StreaksListProps {
  streaks: Array<{
    habitId: string
    title: string
    currentStreak: number
    bestStreak: number
    totalCompletions: number
  }>
}

export function StreaksList({ streaks }: StreaksListProps) {
  if (streaks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Belum ada habit. Buat habit pertama Anda!</p>
        </CardContent>
      </Card>
    )
  }

  const sortedStreaks = [...streaks].sort((a, b) => b.currentStreak - a.currentStreak)

  return (
    <div className="space-y-4">
      {sortedStreaks.map((streak) => (
        <StreakCard
          key={streak.habitId}
          title={streak.title}
          currentStreak={streak.currentStreak}
          bestStreak={streak.bestStreak}
          totalCompletions={streak.totalCompletions}
        />
      ))}
    </div>
  )
}