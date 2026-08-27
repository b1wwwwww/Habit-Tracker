'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Target, CheckCircle2, BarChart3, Bell, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (user) return null

  const features = [
    { icon: Target, title: 'Habit Fleksibel', desc: 'Harian, mingguan, atau hari tertentu dengan target angka atau ya/tidak' },
    { icon: CheckCircle2, title: 'Tracking Harian', desc: 'Dashboard hari ini dengan progress real-time dan undo mudah' },
    { icon: BarChart3, title: 'Analytics & Streak', desc: 'Heatmap seperti GitHub, streak counter, dan visualisasi progress' },
    { icon: Bell, title: 'Pengingat Otomatis', desc: 'Notifikasi sesuai jadwal habit yang Anda tentukan' },
    { icon: Zap, title: 'Cepat & Responsif', desc: 'Dibangun dengan Next.js 15, React 19, dan PostgreSQL' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">HabitTracker</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/login')}>
            Masuk
          </Button>
          <Button onClick={() => router.push('/register')}>
            Mulai Gratis
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Bangun Kebiasaan{' '}
            <span className="text-primary">Positif</span>{' '}
            Setiap Hari
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Lacak progres, jaga streak, dan capai tujuan Anda dengan aplikasi habit tracker yang sederhana namun powerful.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto" onClick={() => router.push('/register')}>
              Mulai Sekarang - Gratis
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => router.push('/login')}>
              Sudah Punya Akun?
            </Button>
          </div>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-700 mt-20">
        <div className="container mx-auto px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          © 2025 HabitTracker. Dibangun dengan Next.js & Prisma.
        </div>
      </footer>
    </div>
  )
}