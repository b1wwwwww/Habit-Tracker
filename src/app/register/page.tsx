'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Target, Mail, Lock, User, Eye, EyeOff, Loader2, Globe } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterInput } from '@/lib/validations'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/helpers'

const TIMEZONES = [
  'Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura',
  'Asia/Singapore', 'Asia/Kuala_Lumpur', 'Asia/Bangkok',
  'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London',
]

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  })

  const onSubmit = async (data: RegisterInput) => {
    setError('')
    try {
      await registerUser(data.name, data.email, data.password, data.timezone)
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrasi gagal')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Target className="w-12 h-12 text-primary mx-auto" />
          </div>
          <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
          <CardDescription>Mulai perjalanan membangun kebiasaan positif Anda</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nama Lengkap"
              type="text"
              placeholder="Nama Anda"
              error={errors.name?.message}
              leftIcon={<User className="w-5 h-5 text-gray-400" />}
              {...register('name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="anda@email.com"
              error={errors.email?.message}
              leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 8 karakter"
                error={errors.password?.message}
                leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Input
              label="Zona Waktu"
              type="text"
              placeholder="Asia/Jakarta"
              leftIcon={<Globe className="w-5 h-5 text-gray-400" />}
              {...register('timezone')}
              list="timezone-list"
            />
            <datalist id="timezone-list">
              {TIMEZONES.map((tz) => <option key={tz} value={tz} />)}
            </datalist>

            <Button type="submit" className="w-full">
              Daftar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Masuk di sini
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}