import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { startOfDay, endOfDay, getDay } from 'date-fns'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { timezone: true },
    })

    const now = new Date()
    const today = getDay(now)
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const todayName = dayNames[today]

    const habits = await prisma.habit.findMany({
      where: {
        userId: session.userId,
        isArchived: false,
        OR: [
          { frequencyType: 'DAILY' },
          { frequencyType: 'CUSTOM_DAYS', frequencyDays: { has: todayName } },
          { frequencyType: 'WEEKLY' },
        ],
      },
      include: {
        logs: {
          where: {
            completedDate: { gte: startOfDay(now), lte: endOfDay(now) },
          },
          take: 1,
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const habitsWithStatus = habits.map((habit) => ({
      ...habit,
      todayLog: habit.logs[0] || null,
      isDueToday: true,
      logs: undefined,
    }))

    const completed = habitsWithStatus.filter((h) => h.todayLog?.status === 'COMPLETED').length
    const total = habitsWithStatus.length

    return NextResponse.json({
      habits: habitsWithStatus,
      summary: { completed, total, progress: total > 0 ? Math.round((completed / total) * 100) : 0 },
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}