'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, X, CheckCircle2, Clock, MessageSquare, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/utils/helpers'

interface Notification {
  id: string
  type: 'reminder' | 'streak' | 'achievement' | 'daily_digest'
  title: string
  message: string
  time: Date
  read: boolean
  habitId?: string
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'reminder',
    title: 'Waktunya Push Up!',
    message: 'Jangan lupa latihan push up 3 set x 15 reps',
    time: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
    habitId: '1',
  },
  {
    id: '2',
    type: 'streak',
    title: 'Streak 7 Hari! 🔥',
    message: 'Selamat! Kamu sudah 7 hari berturut-turut minum air 2L',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
    habitId: '2',
  },
  {
    id: '3',
    type: 'achievement',
    title: 'Pencapaian Baru: Konsisten 30 Hari',
    message: 'Kamu telah menyelesaikan habit "Membaca Buku" selama 30 hari',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
    habitId: '3',
  },
]

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reminder': return <Clock className="w-5 h-5 text-blue-500" />
      case 'streak': return <span className="text-2xl">🔥</span>
      case 'achievement': return <span className="text-2xl">🏆</span>
      case 'daily_digest': return <MessageSquare className="w-5 h-5 text-green-500" />
    }
  }

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'Baru saja'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} menit lalu`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} jam lalu`
    const days = Math.floor(hours / 24)
    return `${days} hari lalu`
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className={cn(
          'relative p-2 rounded-lg transition-colors',
          'hover:bg-gray-100 dark:hover:bg-gray-700'
        )}
        aria-label={`Notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ''}`}
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifikasi</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Tandai semua dibaca
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Belum ada notifikasi</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700" role="list">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={cn(
                      'p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                      !notification.read && 'bg-blue-50 dark:bg-blue-900/20'
                    )}
                    role="menuitem"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                        !notification.read && 'bg-primary/10'
                      )}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn('font-medium text-gray-900 dark:text-white', !notification.read && 'font-semibold')}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                            {getTimeAgo(notification.time)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="mt-2 text-xs text-primary hover:underline"
                          >
                            Tandai sebagai dibaca
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
              Tutup
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}