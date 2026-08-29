'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Target, Menu, LogOut, User, Bell, BarChart3, Sun, Moon, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { HabitCard } from '@/components/habits/HabitCard'
import { HabitForm } from '@/components/habits/HabitForm'
import { Heatmap } from '@/components/analytics/Heatmap'
import { NotificationBell } from '@/components/ui/NotificationBell'
import { useAuth } from '@/hooks/useAuth'
import { useHabits, HabitInput } from '@/hooks/useHabits'
import { useDashboard } from '@/hooks/useDashboard'
import { useStreaks } from '@/hooks/useAnalytics'
import { useHeatmap } from '@/hooks/useAnalytics'
import { format } from 'date-fns'
import id from 'date-fns/locale/id'
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
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

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    setTheme(initialTheme)
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const handleCreateHabit = async (data: HabitInput) => {
    await createHabit(data)
    setShowHabitForm(false)
  }

  const handleUpdateHabit = async (data: HabitInput) => {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  if (!user) return null

  const completedCount = dashboard?.summary.completed || 0
  const totalCount = dashboard?.summary.total || 0
  const progress = dashboard?.summary.progress || 0
  const todayHabits = dashboard?.habits || []
  const dueToday = todayHabits.filter(h => h.isDueToday)
  const completedToday = dueToday.filter(h => h.todayLog?.status === 'COMPLETED').length

  return (
    <div className={cn('min-h-screen transition-colors duration-300', theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50')}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-gray-950/80 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Buka menu"
              >
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">HabitTracker</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('today')}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    activeTab === 'today'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  )}
                >
                  Hari Ini
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    activeTab === 'analytics'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  )}
                >
                  <BarChart3 className="w-4 h-4 inline mr-1" />
                  Statistik
                </button>
              </div>

              <NotificationBell />
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                aria-label={theme === 'light' ? 'Mode gelap' : 'Mode terang'}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name || user.email}</span>
              </div>

              <Button variant="ghost" size="sm" onClick={logout} className="hidden sm:flex">
                <LogOut className="w-4 h-4 mr-1" />
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <motion.div
              className="relative w-72 bg-white dark:bg-gray-900 h-full shadow-xl"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Menu</h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="p-4 space-y-2">
                <button
                  onClick={() => { setActiveTab('today'); setSidebarOpen(false) }}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-xl font-medium transition-colors',
                    activeTab === 'today'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <Target className="w-5 h-5 inline mr-3" /> Hari Ini
                </button>
                <button
                  onClick={() => { setActiveTab('analytics'); setSidebarOpen(false) }}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-xl font-medium transition-colors',
                    activeTab === 'analytics'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <BarChart3 className="w-5 h-5 inline mr-3" /> Statistik
                </button>
              </nav>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
                <Button variant="outline" className="w-full" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" /> Keluar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 py-6 pb-20">
        {/* Today Tab */}
        {activeTab === 'today' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hari Ini</h1>
                <p className="text-gray-500 dark:text-gray-400">{format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}</p>
              </div>
              <Button
                onClick={() => { setEditingHabit(null); setEditingHabitId(null); setShowHabitForm(true) }}
                className="group"
              >
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                Habit Baru
              </Button>
            </div>

            {/* Progress Ring */}
            <div className="mb-8">
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative w-36 h-36">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="72"
                            cy="72"
                            r="66"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            className="dark:stroke-gray-700"
                          />
                          <motion.circle
                            cx="72"
                            cy="72"
                            r="66"
                            fill="none"
                            stroke="url(#progressGradient)"
                            strokeWidth="8"
                            strokeDasharray={`${progress * 4.15} 415`}
                            strokeDashoffset="0"
                            strokeLinecap="round"
                            className="transition-all duration-700 ease-out"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: progress / 100 }}
                          />
                          <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <motion.span
                              className="text-4xl font-bold text-gray-900 dark:text-white"
                              initial={{ scale: 0.5 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', delay: 0.3 }}
                            >
                              {progress}%
                            </motion.span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Progres Hari Ini</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedToday} / {dueToday.length} selesai</p>
                      </div>
                    </div>
                    {dueToday.length > 0 && (
                      <motion.div
                        className="text-right hidden sm:block"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Sisa</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{dueToday.length - completedToday}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">habit lagi</p>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Habits List */}
            {dueToday.length === 0 ? (
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="py-16 text-center">
                  <motion.div
                    className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                  >
                    <Target className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Belum Ada Habit Hari Ini</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
                    Tambah habit yang mau dilakukan hari ini, atau atur jadwal habit yang sudah ada.
                  </p>
                  <Button onClick={() => { setEditingHabit(null); setEditingHabitId(null); setShowHabitForm(true) }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Habit Pertama
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                className="space-y-3"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                }}
              >
                {dueToday.map((habit, index) => (
                  <motion.div key={habit.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <HabitCard
                      habit={{ ...habit, currentStreak: habit.currentStreak, bestStreak: habit.bestStreak }}
                      onCheckIn={handleCheckIn}
                      onUndo={handleUndo}
                      onEdit={handleEditHabit}
                      onDelete={(id) => setDeleteConfirm(id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statistik</h1>
                <p className="text-gray-500 dark:text-gray-400">Lihat progres dan konsistensi kebiasaan Anda</p>
              </div>
            </div>

            <Heatmap data={heatmap} year={heatmapYear} onYearChange={changeYear} streaks={streaks} />
          </motion.div>
        )}

        {/* Habit Form Modal */}
        <HabitForm
          isOpen={showHabitForm}
          onClose={() => { setShowHabitForm(false); setEditingHabit(null); setEditingHabitId(null) }}
          onSubmit={editingHabit ? handleUpdateHabit : handleCreateHabit}
          initialData={editingHabit}
        />

        {/* Delete Confirm Modal */}
        <ConfirmModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDeleteHabit}
          title="Hapus Habit"
          message="Apakah Anda yakin ingin menghapus habit ini? Semua data progres akan terhapus permanen."
          confirmText="Hapus"
          variant="danger"
        />
      </main>
    </div>
  )
}