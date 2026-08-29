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
      // For numeric habits, tap completes with target value
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

  const handleLongPress = () => {
    if (targetType === 'NUMERIC' && !isCompleted) {
      setInputValue(targetValue)
      setShowNumericInput(true)
    }
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative p-4 rounded-2xl border transition-all duration-300',
        'bg-white dark:bg-gray-800',
        'border-gray-200 dark:border-gray-700',
        'hover:border-gray-300 dark:hover:border-gray-600',
        'hover:shadow-md dark:hover:shadow-lg',
        isCompleted && 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onContextMenu={(e) => { e.preventDefault(); setShowMenu(true) }}
    >
      {/* Category badge & streak */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none">{categoryIcon}</span>
          <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', categoryColor)}>
            {category}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {(currentStreak && currentStreak > 0) && (
            <span className="flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
              <Zap className="w-3 h-3" />
              {currentStreak}
            </span>
          )}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Opsi habit"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <button
                    onClick={() => { onEdit(habit); setShowMenu(false) }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => { onDelete(habit.id); setShowMenu(false) }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className={cn(
        'font-semibold text-gray-900 dark:text-white mb-2 truncate',
        isCompleted && 'line-through text-gray-400 dark:text-gray-500'
      )}>
        {title}
      </h3>

      {/* Frequency & Progress */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
          {frequencyLabel}
        </span>
        {targetType === 'NUMERIC' && (
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Target: {targetValue}
          </span>
        )}
      </div>

      {/* Progress bar for numeric */}
      {targetType === 'NUMERIC' && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <span>{isCompleted ? targetValue : currentValue} / {targetValue}</span>
            <span>{isCompleted ? 100 : Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full transition-all duration-500 ease-out',
                isCompleted ? 'bg-emerald-500' : 'bg-primary'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${isCompleted ? 100 : progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Button - Main interaction */}
      <div className="flex items-center justify-end gap-2 pt-2">
        {isCompleted ? (
          <motion.button
            onClick={handleCustomInput}
            onContextMenu={handleLongPress}
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200',
              'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
              'hover:scale-105 active:scale-95'
            )}
            whileTap={{ scale: 0.95 }}
            aria-label="Ubah nilai"
          >
            <Check className="w-6 h-6" />
          </motion.button>
        ) : (
          <>
            {targetType === 'NUMERIC' && (
              <motion.button
                onClick={handleCustomInput}
                onContextMenu={handleLongPress}
                className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center transition-all hover:bg-gray-200 dark:hover:bg-gray-600"
                whileTap={{ scale: 0.95 }}
                aria-label="Input nilai kustom"
              >
                <Target className="w-5 h-5" />
              </motion.button>
            )}
            <motion.button
              onClick={handleComplete}
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200',
                'bg-primary text-white',
                'hover:opacity-90 active:scale-95',
                'shadow-lg shadow-primary/25'
              )}
              whileTap={{ scale: 0.92 }}
              aria-label={targetType === 'BOOLEAN' ? 'Tandai selesai' : `Selesai (${targetValue})`}
              disabled={isCompleted}
            >
              <Circle className="w-6 h-6 stroke-2" />
            </motion.button>
          </>
        )}
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