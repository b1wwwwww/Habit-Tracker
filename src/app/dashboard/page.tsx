'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Target, CheckCircle2, LogOut, Sun, Moon, Menu, X, Bell, BarChart3, Settings, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { HabitCard } from '@/components/habits/HabitCard'
import { HabitForm } from '@/components/habits/HabitForm'
import { Heatmap } from '@/components/analytics/Heatmap'
import { StreaksList } from '@/components/analytics/StreakCard'
import { NotificationBell } from '@/components/ui/NotificationBell'
import { useAuth } from '@/hooks/useAuth'
import { useHabits, HabitInput } from '@/hooks/useHabits'
import { useDashboard } from '@/hooks/useDashboard'
import { useStreaks } from '@/hooks/useAnalytics'
import { useHeatmap } from '@/hooks/useAnalytics'
import { formatDate } from '@/utils/helpers'
import { cn } from '@/utils/helpers'

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const { habits, loading: habitsLoading, fetchHabits, createHabit, updateHabit, deleteHabit, checkIn, undoCheckIn } = useHabits()
  const { data: dashboard, loading: dashboardLoading, fetchDashboard } = useDashboard()
  const { streaks, loading: streaksLoading, fetchStreaks } = useStreaks()
  const { heatmap, year: heatmapYear, loading: heatmapLoading, fetchHeatmap, changeYear } = useHeatmap()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showHabitForm, setShowHabitForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<HabitInput | null>(null)
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'today' | 'analytics'>('today')
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchHabits()
      fetchDashboard()
      fetchStreaks()
      fetchHeatmap()
    }
  }, [user, fetchHabits, fetchDashboard, fetchStreaks, fetchHeatmap])

  const handleCreateHabit = async (data: { title: string; description?: string; category: string; targetType: 'BOOLEAN' | 'NUMERIC'; targetValue: number; frequencyType: 'DAILY' | 'CUSTOM_DAYS' | 'WEEKLY'; frequencyDays: string[]; reminderTime?: string | null }) => {
    await createHabit(data)
    setShowHabitForm(false)
  }

  const handleUpdateHabit = async (data: { title: string; description?: string; category: string; targetType: 'BOOLEAN' | 'NUMERIC'; targetValue: number; frequencyType: 'DAILY' | 'CUSTOM_DAYS' | 'WEEKLY'; frequencyDays: string[]; reminderTime?: string | null }) => {
    if (editingHabitId) {
      await updateHabit(editingHabitId, data)
      setShowHabitForm(false)
      setEditingHabit(null)
      setEditingHabitId(null)
    }
  }

  const handleDeleteHabit = async () => {
    if (deleteConfirm) {
      await deleteHabit(deleteConfirm)
      setDeleteConfirm(null)
    }
  }

  const handleEditHabit = (h: typeof habits[0]) => {
    setEditingHabit({
      title: h.title,
      description: h.description || '',
      category: h.category,
      targetType: h.targetType,
      targetValue: h.targetValue,
      frequencyType: h.frequencyType,
      frequencyDays: h.frequencyDays,
      reminderTime: h.reminderTime,
    })
    setEditingHabitId(h.id)
    setShowHabitForm(true)
  }

  const handleCheckIn = async (habitId: string, value: number) => {
    await checkIn(habitId, value)
  }

  const handleUndo = async (habitId: string) => {
    await undoCheckIn(habitId)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) return null

  const completedCount = dashboard?.summary.completed || 0
  const totalCount = dashboard?.summary.total || 0
  const progress = dashboard?.summary.progress || 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2">
                <Target className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">HabitTracker</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-4">
                <button onClick={() => setActiveTab('today')} className={cn('px-3 py-2 rounded-lg text-sm font-medium transition-colors', activeTab === 'today' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700')}>
                  Hari Ini
                </button>
                <button onClick={() => setActiveTab('analytics')} className={cn('px-3 py-2 rounded-lg text-sm font-medium transition-colors', activeTab === 'analytics' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700')}>
                  Analytics
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <NotificationBell />
                <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name || user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Keluar</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <aside className={cn('fixed inset-0 z-50 flex md:hidden', sidebarOpen ? 'block' : 'hidden')}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="relative w-64 bg-white dark:bg-gray-800 h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Menu</h3>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <button onClick={() => { setActiveTab('today'); setSidebarOpen(false) }} className={cn('w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors', activeTab === 'today' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700')}>
              <Target className="w-5 h-5 inline mr-2" /> Hari Ini
            </button>
            <button onClick={() => { setActiveTab('analytics'); setSidebarOpen(false) }} className={cn('w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors', activeTab === 'analytics' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700')}>
              <BarChart3 className="w-5 h-5 inline mr-2" /> Analytics
            </button>
          </nav>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" className="w-full" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" /> Keluar
            </Button>
          </div>
        </div>
      </aside>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'today' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hari Ini</h1>
                <p className="text-gray-500 dark:text-gray-400">{formatDate(new Date())}</p>
              </div>
              <Button onClick={() => { setEditingHabit(null); setShowHabitForm(true) }}>
                <Plus className="w-4 h-4 mr-2" />
                Habit Baru
              </Button>
            </div>

            <div className="mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Progres Hari Ini</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{completedCount} / {totalCount}</p>
                    </div>
                    <div className="w-48 h-48 relative">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="12"
                          className="dark:stroke-gray-700"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="12"
                          strokeDasharray={`${progress * 5.53} 553`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">{progress}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

{totalCount === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Belum Ada Habit</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Mulai bangun kebiasaan positif dengan membuat habit pertama Anda</p>
                  <Button onClick={() => { setEditingHabit(null); setShowHabitForm(true) }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Habit Pertama
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {dashboard?.habits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onCheckIn={handleCheckIn}
                    onUndo={handleUndo}
                    onEdit={handleEditHabit}
                    onDelete={(id) => setDeleteConfirm(id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                <p className="text-gray-500 dark:text-gray-400">Lihat progres dan konsistensi kebiasaan Anda</p>
              </div>
            </div>

            <div className="mb-8">
              <Heatmap data={heatmap} year={heatmapYear} onYearChange={changeYear} streaks={streaks} />
            </div>
          </>
        )}

        <HabitForm
          isOpen={showHabitForm}
          onClose={() => { setShowHabitForm(false); setEditingHabit(null); setEditingHabitId(null) }}
          onSubmit={editingHabit ? handleUpdateHabit : handleCreateHabit}
          initialData={editingHabit}
        />

        <ConfirmModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDeleteHabit}
          title="Hapus Habit"
          message="Apakah Anda yakin ingin menghapus habit ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Hapus"
          variant="danger"
        />
      </main>
    </div>
  )
}