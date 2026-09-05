'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, Circle, MoreHorizontal, Trash2, Edit, Target, Zap, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Habit, HabitLog } from '@/types'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/helpers'
import { format } from 'date-fns'

interface HabitCardProps {
  habit: Habit & { todayLog?: HabitLog | null; currentStreak?: number; bestStreak?: number }
  onCheckIn: (habitId: string, value: number) => Promise<void>
  onUndo: (habitId: string) => Promise<void>
  onEdit: (habit: Habit) => void
  onDelete: (habitId: string) => void
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Kesehatan: <span className="text-2xl">🏥</span>,
  Produktivitas: <span className="text-2xl">📋</span>,
  Keuangan: <span className="text-2xl">💰</span>,
  Kebugaran: <span className="text-2xl">💪</span>,
  Pendidikan: <span className="text-2xl">📚</span>,
  Hobi: <span className="text-2xl">🎨</span>,
  Lainnya: <span className="text-2xl">✨</span>,
}

const CATEGORY_COLORS: Record<string, string> = {
  Kesehatan: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  Produktivitas: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  Keuangan: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  Kebugaran: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  Pendidikan: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  Hobi: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  Lainnya: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
}

export function HabitCard({ habit, onCheckIn, onUndo, onEdit, onDelete }: HabitCardProps) {
  const { todayLog, targetType, targetValue, title, category, frequencyType, frequencyDays, currentStreak, bestStreak } = habit
  const isCompleted = todayLog?.status === 'COMPLETED'
  const isPartial = todayLog?.status === 'PARTIAL'
  const currentValue = todayLog?.currentValue || 0
  const progress = targetType === 'NUMERIC' && targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0

  const [showMenu, setShowMenu] = useState(false)
  const [showNumericInput, setShowNumericInput] = useState(false)
  const [inputValue, setInputValue] = useState(currentValue || targetValue)
  const menuRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const frequencyLabel = frequencyType === 'DAILY' 
    ? 'Setiap hari' 
    : frequencyType === 'WEEKLY' 
      ? 'Mingguan' 
      : `Hari: ${frequencyDays.join(', ')}`

  const categoryIcon = CATEGORY_ICONS[category] || CATEGORY_ICONS.Lainnya
  const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.Lainnya

  const handleComplete = async () => {
    if (isCompleted) return
    
    if (targetType === 'NUMERIC') {
      await onCheckIn(habit.id, targetValue)
    } else {
      await onCheckIn(habit.id, 1)
    }
  }

  const handleCustomInput = async () => {
    const value = parseInt(inputValue.toString(), 10)
    if (value > 0) {
      await onCheckIn(habit.id, Math.min(value, targetValue))
      setShowNumericInput(false)
    }
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative p-5 rounded-3xl transition-all duration-300 backdrop-blur-xl',
        'bg-white/80 dark:bg-gray-900/80 shadow-sm hover:shadow-xl',
        'border border-gray-100/80 dark:border-gray-800/80',
        isCompleted 
          ? 'bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent border-emerald-500/30 dark:border-emerald-500/30' 
          : 'hover:border-primary/40 dark:hover:border-primary/40'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div 
            className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner', categoryColor)}
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            {categoryIcon}
          </motion.div>
          <div>
            <span className={cn('text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider', categoryColor)}>
              {category}
            </span>
            <span className="block text-xs text-gray-400 dark:text-gray-500 mt-1">
              {frequencyLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(currentStreak && currentStreak > 0) && (
            <motion.div 
              className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100/80 dark:bg-orange-900/40 px-3 py-1.5 rounded-2xl shadow-sm border border-orange-200/50 dark:border-orange-800/50"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Zap className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span>{currentStreak} hari</span>
            </motion.div>
          )}

          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Opsi habit"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  className="absolute right-0 top-full mt-2 w-44 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 z-30"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <button
                    onClick={() => { onEdit(habit); setShowMenu(false) }}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2.5 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-primary" /> Edit Habit
                  </button>
                  <button
                    onClick={() => { onDelete(habit.id); setShowMenu(false) }}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus Habit
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <h3 className={cn(
        'text-lg font-bold text-gray-900 dark:text-white mb-3 tracking-tight',
        isCompleted && 'line-through text-gray-400 dark:text-gray-500'
      )}>
        {title}
      </h3>

      {targetType === 'NUMERIC' && (
        <div className="mb-4 bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            <span>Progress: <strong className="text-gray-900 dark:text-white">{isCompleted ? targetValue : currentValue}</strong> / {targetValue}</span>
            <span className="text-primary font-bold">{isCompleted ? 100 : Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden p-0.5">
            <motion.div
              className={cn(
                'h-full rounded-full transition-all duration-500 bg-gradient-to-r',
                isCompleted ? 'from-emerald-400 to-teal-500' : 'from-blue-500 to-purple-600'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${isCompleted ? 100 : progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/80">
        <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isCompleted ? 'Selesai hari ini!' : 'Belum selesai'}</span>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted ? (
            <motion.button
              onClick={() => {
                if (targetType === 'NUMERIC') setShowNumericInput(true)
                else onUndo(habit.id)
              }}
              className={cn(
                'px-4 py-2.5 rounded-2xl flex items-center gap-2 font-medium text-sm transition-all duration-300 shadow-sm',
                'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Selesai</span>
            </motion.button>
          ) : (
            <>
              {targetType === 'NUMERIC' && (
                <motion.button
                  onClick={() => setShowNumericInput(true)}
                  className="px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm flex items-center gap-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  <Target className="w-4 h-4 text-primary" />
                  <span>Input</span>
                </motion.button>
              )}
              <motion.button
                onClick={handleComplete}
                className={cn(
                  'px-5 py-2.5 rounded-2xl flex items-center gap-2 font-medium text-sm transition-all duration-300 shadow-lg',
                  'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 shadow-primary/25'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <Circle className="w-4 h-4 stroke-[3]" />
                <span>Check-in</span>
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Numeric Input Modal */}
      <AnimatePresence>
        {showNumericInput && !isCompleted && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNumericInput(false)}
          >
            <motion.div
              className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Input Progres</h4>
                <button
                  onClick={() => setShowNumericInput(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Berapa <strong className="text-gray-900 dark:text-white">{title.toLowerCase()}</strong> yang sudah dilakukan?
              </p>

              <div className="flex items-center justify-center gap-3 mb-6">
                <button
                  onClick={() => setInputValue(Math.max(1, inputValue - 1))}
                  className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors active:scale-95"
                  aria-label="Kurangi"
                >
                  −
                </button>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(Math.max(1, Math.min(targetValue, parseInt(e.target.value) || 1)))}
                  className="w-24 h-12 text-center text-2xl font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary"
                  min={1}
                  max={targetValue}
                  autoFocus
                />
                <button
                  onClick={() => setInputValue(Math.min(targetValue, inputValue + 1))}
                  className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors active:scale-95"
                  aria-label="Tambah"
                >
                  +
                </button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowNumericInput(false)}
                >
                  Batal
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCustomInput}
                  loading={false}
                >
                  {isCompleted ? 'Selesai' : `Simpan (${inputValue}/${targetValue})`}
                </Button>
              </div>

              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">
                Target: {targetValue} • Tap cepat untuk selesai ({targetValue})
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}