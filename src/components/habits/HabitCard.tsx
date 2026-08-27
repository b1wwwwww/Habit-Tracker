'use client'

import { CheckCircle2, Circle, Trash2, Edit, AlertCircle } from 'lucide-react'
import { Habit, HabitLog } from '@/types'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/helpers'

interface HabitCardProps {
  habit: Habit & { todayLog?: HabitLog | null }
  onCheckIn: (habitId: string, value: number) => Promise<void>
  onUndo: (habitId: string) => Promise<void>
  onEdit: (habit: Habit) => void
  onDelete: (habitId: string) => void
}

export function HabitCard({ habit, onCheckIn, onUndo, onEdit, onDelete }: HabitCardProps) {
  const { todayLog, targetType, targetValue, title, category, frequencyType, frequencyDays } = habit
  const isCompleted = todayLog?.status === 'COMPLETED'
  const isPartial = todayLog?.status === 'PARTIAL'
  const currentValue = todayLog?.currentValue || 0
  const progress = targetType === 'NUMERIC' && targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0

  const frequencyLabel = frequencyType === 'DAILY' 
    ? 'Harian' 
    : frequencyType === 'WEEKLY' 
      ? 'Mingguan' 
      : `Custom: ${frequencyDays.join(', ')}`

  const handleCheckIn = async () => {
    if (isCompleted) return
    const newValue = targetType === 'BOOLEAN' ? 1 : Math.min(currentValue + 1, targetValue)
    await onCheckIn(habit.id, newValue)
  }

  const handleUndo = async () => {
    await onUndo(habit.id)
  }

  return (
    <div className={cn('relative p-4 rounded-xl border transition-all', isCompleted ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700')}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={cn('font-semibold text-gray-900 dark:text-white truncate', isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : '')}>
              {title}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {category}
            </span>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
              {frequencyLabel}
            </span>
            {targetType === 'NUMERIC' && (
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Target: {targetValue}
              </span>
            )}
          </p>

          {targetType === 'NUMERIC' && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>{currentValue} / {targetValue}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    isCompleted ? 'bg-green-500' : 'bg-primary'
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isCompleted ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30"
              aria-label="Batalkan penyelesaian"
            >
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleCheckIn}
              className="w-10 h-10 p-0"
              aria-label={targetType === 'BOOLEAN' ? 'Tandai selesai' : 'Tambah progres'}
            >
              <Circle className="w-6 h-6" />
            </Button>
          )}
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(habit)} aria-label="Edit habit">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(habit.id)} aria-label="Hapus habit">
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}