'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Target, CheckCircle2, BarChart3, Bell, Zap, Flame, Trophy, Calendar, ArrowRight, Moon, Sun, Star, Heart, Brain, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/utils/helpers'

const features = [
  {
    icon: Target,
    title: 'Habit Fleksibel',
    desc: 'Harian, mingguan, atau hari tertentu. Target ya/tidak atau numerik (angka).',
    color: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  {
    icon: CheckCircle2,
    title: 'Tracking Harian',
    desc: 'Dashboard hari ini dengan progress ring visual dan check-in satu klik.',
    color: 'from-emerald-500 to-emerald-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Streak',
    desc: 'Heatmap seperti GitHub, streak counter, completion rate, dan visualisasi progress.',
    color: 'from-purple-500 to-purple-600',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
  {
    icon: Bell,
    title: 'Pengingat Otomatis',
    desc: 'Notifikasi sesuai jadwal habit yang Anda tentukan, jangan pernah terlewat.',
    color: 'from-orange-500 to-orange-600',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  },
  {
    icon: Flame,
    title: 'Streak System',
    desc: 'Current streak, best streak, dan motivasi visual untuk menjaga konsistensi.',
    color: 'from-red-500 to-red-600',
    iconBg: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  },
  {
    icon: Zap,
    title: 'Cepat & Modern',
    desc: 'Dibangun dengan Next.js 15, React 19, TypeScript, PostgreSQL & Prisma.',
    color: 'from-indigo-500 to-indigo-600',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
  },
]

const benefits = [
  { icon: Brain, title: 'Bangun Kebiasaan', desc: 'Psikologi habit formation dengan cue, routine, reward' },
  { icon: Calendar, title: 'Konsistensi Visual', desc: 'Heatmap tahunan memotivasi jangan putus chain' },
  { icon: Trophy, title: 'Gamifikasi', desc: 'Streak, achievement, dan progress ring yang memuaskan' },
  { icon: Heart, title: 'Self Improvement', desc: 'Fokus pada progress kecil yang konsisten setiap hari' },
  { icon: Star, title: 'Data-Driven', desc: 'Analytics lengkap untuk review performa bulanan' },
  { icon: Rocket, title: 'Mudah Digunakan', desc: 'UI bersih, intuitif, dan responsive di semua device' },
]

export default function LandingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    setMounted(true)
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

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  return (
    <div className={cn('min-h-screen transition-colors duration-300', theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50')}>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-950/80 border-b border-gray-200/50 dark:border-gray-800/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">HabitTracker</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                Masuk
              </Button>
              <Button size="sm" onClick={() => router.push('/register')}>
                Mulai Gratis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={theme === 'light' ? 'Mode gelap' : 'Mode terang'}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      <main className="pt-20">
        <section className="relative overflow-hidden py-20 md:py-32">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
          />
          <motion.div
            className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          />
          <motion.div
            className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '2s' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
          />

          <div className="container mx-auto px-6 relative">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Baru: Analytics Heatmap & Streak System!
              </motion.span>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Bangun Kebiasaan{' '}
                <span className="relative">
                  Positif
                  <motion.span
                    className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-purple-500 opacity-30"
                    animate={{ scaleX: [0, 1, 1], x: [-1, 0, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </span>{' '}
                Setiap Hari
              </h1>
              
              <motion.p
                className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Lacak progres, jaga streak, dan capai tujuan Anda dengan aplikasi habit tracker yang 
                <strong className="text-gray-900 dark:text-white">sederhana namun powerful</strong>. 
                Didesain berdasarkan sains pembentukan kebiasaan.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Button size="lg" className="w-full sm:w-auto group px-8 py-4 text-lg" onClick={() => router.push('/register')}>
                  Mulai Sekarang - Gratis Selamanya
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-4 text-lg" onClick={() => router.push('/login')}>
                  Sudah Punya Akun?
                </Button>
              </motion.div>

              <motion.div
                className="mt-10 flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Tidak perlu kartu kredit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Data privat & aman</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Cancel kapan saja</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                FITUR UTAMA
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Semua Yang Anda Butuhkan Untuk{' '}
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Bangun Kebiasaan</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Dirancang berdasarkan riset psikologi perilaku untuk membantu Anda membangun kebiasaan yang bertahan lama.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="group relative p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 hover:shadow-xl"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', feature.iconBg)}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{feature.desc}</p>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r"
                    style={{ background: feature.color }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                MENGAPA HABITTRACKER?
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Berbasis Sains{' '}
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Pembentukan Kebiasaan</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Tidak hanya tracker biasa. Kami menerapkan prinsip-prinsip behavioral psychology yang terbukti efektif.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-shadow"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                    <benefit.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="grid lg:grid-cols-2 gap-12 items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative">
                  <div className="aspect-video rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                    <div className="text-center p-8">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Target className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Preview Dashboard</h3>
                      <p className="text-gray-600 dark:text-gray-300">UI bersih, intuitif, dan menampilkan progres real-time</p>
                    </div>
                  </div>
                  <motion.div
                    className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full blur-3xl opacity-30"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                    SIAP MEMULAI?
                  </span>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                    Mulai Perjalanan{' '}
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Self Improvement</span>
                    Anda Hari Ini
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    Ribuan orang telah membangun kebiasaan positif dengan HabitTracker. 
                    Bergabunglah dengan komunitas yang fokus pada progress kecil setiap hari 
                    untuk hasil besar di masa depan.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="w-full sm:w-auto group px-8 py-4 text-lg" onClick={() => router.push('/register')}>
                      <Rocket className="w-5 h-5 mr-2" />
                      Daftar Gratis Sekarang
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-4 text-lg" onClick={() => router.push('/login')}>
                      Lanjutkan dengan Akun
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <footer className="bg-gray-950 text-white py-16">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">HabitTracker</span>
                </div>
                <p className="text-gray-400 max-w-sm">
                  Aplikasi pelacakan kebiasaan modern untuk membantu Anda membangun 
                  dan mempertahankan kebiasaan positif melalui sains behavioral psychology.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Fitur</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Habit Tracking</li>
                  <li>Streak System</li>
                  <li>Heatmap Analytics</li>
                  <li>Smart Reminders</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Dukungan</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Dokumentasi</li>
                  <li>FAQ</li>
                  <li>Kontak Kami</li>
                  <li>Changelog</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm">
                © 2025 HabitTracker. Dibangun dengan Next.js, React, TypeScript & Prisma.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}