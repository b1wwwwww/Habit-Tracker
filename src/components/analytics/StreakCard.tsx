'use client'

import { Flame, Trophy, Target, Calendar, Zap, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/utils/helpers'
import { motion } from 'framer-motion'

interface StreakCardProps {
  title: string
  currentStreak: number
  bestStreak: number
  totalCompletions: number
}

export function StreakCard({ title, currentStreak, bestStreak, totalCompletions }: StreakCardProps) {
  const isActive = currentStreak > 0
  const level = currentStreak >= 30 ? 'Legend' : currentStreak >= 14 ? 'Master' : currentStreak >= 7 ? 'On Fire' : currentStreak >= 3 ? 'Warming' : 'Starter'
  const progress = Math.min((currentStreak / 30) * 100, 100)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Card className={cn('relative overflow-hidden border-0 rounded-3xl shadow-sm hover:shadow-xl transition-all backdrop-blur-xl', isActive ? 'bg-gradient-to-br from-orange-500 via-red-500 to-amber-500 text-white' : 'bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800')}>
        {isActive && <motion.div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />}
        <motion.div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ background: isActive ? '#fff' : '#f97316' }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }} />
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className={cn('text-xs font-bold tracking-widest uppercase truncate', isActive ? 'text-white/80' : 'text-gray-400')}>{title}</p>
              <div className="flex items-center gap-2 mt-2">
                <motion.div animate={isActive ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : {}} transition={{ duration: 1.5, repeat: Infinity }}>
                  <Flame className={cn('w-9 h-9', isActive ? 'text-white fill-white' : 'text-orange-500')} />
                </motion.div>
                <motion.span className={cn('text-4xl font-black tracking-tight', isActive ? 'text-white' : 'text-gray-900 dark:text-white')} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                  {currentStreak}
                </motion.span>
                <span className={cn('text-sm font-bold', isActive ? 'text-white/80' : 'text-gray-500')}>hari</span>
                {isActive && <span className="ml-2 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-bold flex items-center gap-1"><Zap className="w-3 h-3 fill-white" />{level}</span>}
              </div>
              <div className={cn('mt-3 h-2 rounded-full overflow-hidden', isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800')}>
                <motion.div className={cn('h-full rounded-full', isActive ? 'bg-white' : 'bg-gradient-to-r from-orange-500 to-red-500')} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: 0.4 }} />
              </div>
            </div>
            <div className={cn('text-right p-3 rounded-2xl shrink-0', isActive ? 'bg-white/15 backdrop-blur' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30')}>
              <p className={cn('text-[10px] font-bold tracking-widest uppercase', isActive ? 'text-white/70' : 'text-amber-600 dark:text-amber-400')}>Rekor</p>
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <Trophy className={cn('w-5 h-5', isActive ? 'text-white' : 'text-amber-500')} />
                <span className={cn('text-xl font-black', isActive ? 'text-white' : 'text-gray-900 dark:text-white')}>{bestStreak}</span>
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className={cn('p-3.5 rounded-2xl flex items-center gap-3', isActive ? 'bg-white/15 backdrop-blur' : 'bg-gray-50 dark:bg-gray-800/60')}>
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', isActive ? 'bg-white/20' : 'bg-blue-100 dark:bg-blue-900/30')}><Target className={cn('w-4 h-4', isActive ? 'text-white' : 'text-blue-600')} /></div>
              <div><p className={cn('text-[10px] font-bold uppercase tracking-wide', isActive ? 'text-white/70' : 'text-gray-500')}>Total</p><p className={cn('text-lg font-black', isActive ? 'text-white' : 'text-gray-900 dark:text-white')}>{totalCompletions}x</p></div>
            </div>
            <div className={cn('p-3.5 rounded-2xl flex items-center gap-3', isActive ? 'bg-white/15 backdrop-blur' : 'bg-gray-50 dark:bg-gray-800/60')}>
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', isActive ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-900/30')}><Sparkles className={cn('w-4 h-4', isActive ? 'text-white' : 'text-emerald-600')} /></div>
              <div><p className={cn('text-[10px] font-bold uppercase tracking-wide', isActive ? 'text-white/70' : 'text-gray-500')}>Status</p><p className={cn('text-sm font-black', isActive ? 'text-white' : 'text-gray-900 dark:text-white')}>{isActive ? 'Aktif 🔥' : 'Mulai'}</p></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface StreaksListProps {
  streaks: Array<{ habitId: string; title: string; currentStreak: number; bestStreak: number; totalCompletions: number }>
}

export function StreaksList({ streaks }: StreaksListProps) {
  if (streaks.length === 0) {
    return (
      <Card className="rounded-3xl border-dashed">
        <CardContent className="py-14 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </motion.div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada habit. Buat habit pertama!</p>
        </CardContent>
      </Card>
    )
  }
  const sorted = [...streaks].sort((a, b) => b.currentStreak - a.currentStreak)
  return (
    <motion.div className="space-y-4" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>
      {sorted.map((s) => (
        <motion.div key={s.habitId} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
          <StreakCard title={s.title} currentStreak={s.currentStreak} bestStreak={s.bestStreak} totalCompletions={s.totalCompletions} />
        </motion.div>
      ))}
    </motion.div>
  )
}
