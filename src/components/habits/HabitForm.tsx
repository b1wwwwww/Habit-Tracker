'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, CalendarDays, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { habitSchema, HabitInput } from '@/lib/validations'
import { CATEGORIES, FREQUENCY_OPTIONS, TARGET_TYPES } from '@/utils/helpers'
import { cn } from '@/utils/helpers'

interface HabitFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: HabitInput) => Promise<void>
  initialData?: HabitInput | null
  loading?: boolean
}

export function HabitForm({ isOpen, onClose, onSubmit, initialData, loading }: HabitFormProps) {
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<HabitInput>({
    resolver: zodResolver(habitSchema),
    defaultValues: initialData
      ? {
          title: initialData.title || '',
          description: initialData.description || '',
          category: initialData.category || 'Kesehatan',
          targetType: initialData.targetType || 'BOOLEAN',
          targetValue: initialData.targetValue || 1,
          frequencyType: initialData.frequencyType || 'DAILY',
          frequencyDays: initialData.frequencyDays || [],
          reminderTime: initialData.reminderTime || null,
        }
      : {
          title: '',
          description: '',
          category: 'Kesehatan',
          targetType: 'BOOLEAN',
          targetValue: 1,
          frequencyType: 'DAILY',
          frequencyDays: [],
          reminderTime: null,
        },
    mode: 'onChange',
  })

  const targetType = watch('targetType')
  const frequencyType = watch('frequencyType')

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || 'Kesehatan',
        targetType: initialData.targetType || 'BOOLEAN',
        targetValue: initialData.targetValue || 1,
        frequencyType: initialData.frequencyType || 'DAILY',
        frequencyDays: initialData.frequencyDays || [],
        reminderTime: initialData.reminderTime || null,
      })
    } else {
      reset({
        title: '',
        description: '',
        category: 'Kesehatan',
        targetType: 'BOOLEAN',
        targetValue: 1,
        frequencyType: 'DAILY',
        frequencyDays: [],
        reminderTime: null,
      })
    }
  }, [isOpen, initialData, reset])

  const dayOptions = [
    { value: 'MON', label: 'Senin' },
    { value: 'TUE', label: 'Selasa' },
    { value: 'WED', label: 'Rabu' },
    { value: 'THU', label: 'Kamis' },
    { value: 'FRI', label: 'Jumat' },
    { value: 'SAT', label: 'Sabtu' },
    { value: 'SUN', label: 'Minggu' },
  ]

  const handleDayChange = (day: string, checked: boolean) => {
    const currentDays = watch('frequencyDays') || []
    if (checked) {
      setValue('frequencyDays', [...currentDays, day])
    } else {
      setValue('frequencyDays', currentDays.filter((d) => d !== day))
    }
  }

  const onFormSubmit = async (data: HabitInput) => {
    await onSubmit(data)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Habit' : 'Buat Habit Baru'}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <Input
          label="Nama Habit *"
          placeholder="Contoh: Minum Air 2L"
          error={errors.title?.message}
          {...register('title')}
        />

        <Input
          label="Deskripsi (opsional)"
          placeholder="Detail tambahan..."
          {...register('description')}
        />

        <Select
          label="Kategori *"
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          error={errors.category?.message}
          {...register('category')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Tipe Target *"
            options={[
              { value: 'BOOLEAN', label: 'Selesai/Belum (Ya/Tidak)' },
              { value: 'NUMERIC', label: 'Numerik (Angka)' },
            ]}
            error={errors.targetType?.message}
            {...register('targetType')}
          />

          <Select
            label="Frekuensi *"
            options={[
              { value: 'DAILY', label: 'Harian' },
              { value: 'CUSTOM_DAYS', label: 'Hari Tertentu' },
              { value: 'WEEKLY', label: 'Mingguan' },
            ]}
            error={errors.frequencyType?.message}
            {...register('frequencyType')}
          />
        </div>

        {targetType === 'NUMERIC' && (
          <Input
            label="Target Angka *"
            type="number"
            min="1"
            placeholder="Contoh: 2000"
            error={errors.targetValue?.message}
            {...register('targetValue', { valueAsNumber: true })}
          />
        )}

        {frequencyType === 'CUSTOM_DAYS' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pilih Hari <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {dayOptions.map((day) => (
                <label
                  key={day.value}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors',
                    watch('frequencyDays')?.includes(day.value)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={watch('frequencyDays')?.includes(day.value) || false}
                    onChange={(e) => handleDayChange(day.value, e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  {day.label}
                </label>
              ))}
            </div>
            {errors.frequencyDays && (
              <p className="mt-1.5 text-sm text-red-500">{errors.frequencyDays.message}</p>
            )}
          </div>
        )}

        <Input
          label="Waktu Pengingat (opsional)"
          type="time"
          placeholder="HH:MM"
          helperText="Format 24 jam"
          error={errors.reminderTime?.message}
          {...register('reminderTime')}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" loading={loading}>
            {isEditing ? 'Simpan' : 'Buat'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}