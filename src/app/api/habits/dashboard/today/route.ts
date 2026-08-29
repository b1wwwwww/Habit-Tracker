import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { startOfDay, endOfDay, getDay, differenceInDays, subDays } from 'date-fns'

function calculateStreak(logs: { completedDate: Date }[], frequencyType: string, frequencyDays: string[]) {
  if (logs.length === 0) return { currentStreak: 0, bestStreak: 0 }

  const sortedLogs = logs
    .map((log) => startOfDay(new Date(log.completedDate)))
    .sort((a, b) => b.getTime() - a.getTime())

  const uniqueDates = [...new Set(sortedLogs.map((d) => d.getTime()))].map((t) => new Date(t))

  let currentStreak = 0
  let bestStreak = 0
  let tempStreak = 0
  let expectedDate = startOfDay(new Date())

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  for (const logDate of uniqueDates) {
    const isDue = frequencyType === 'DAILY' || 
      (frequencyType === 'CUSTOM_DAYS' && frequencyDays.includes(dayNames[logDate.getDay()])) ||
      frequencyType === 'WEEKLY'

    if (!isDue) continue

    const diff = differenceInDays(expectedDate, logDate)

    if (diff === 0) {
      tempStreak++
      expectedDate = subDays(expectedDate, 1)
    } else if (diff > 0) {
      if (tempStreak > bestStreak) bestStreak = tempStreak
      if (currentStreak === 0) currentStreak = tempStreak
      tempStreak = 1
      expectedDate = subDays(logDate, 1)
    }
  }

  if (tempStreak > bestStreak) bestStreak = tempStreak
  if (currentStreak === 0) currentStreak = tempStreak

  return { currentStreak, bestStreak }
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Fetch all logs for streak calculation
    const habitIds = habits.map(h => h.id)
    const allLogs = await prisma.habitLog.findMany({
      where: {
        habitId: { in: habitIds },
        status: 'COMPLETED',
      },
      select: { habitId: true, completedDate: true },
      orderBy: { completedDate: 'desc' },
    })

    // Group logs by habit
    const logsByHabit = allLogs.reduce((acc, log) => {
      if (!acc[log.habitId]) acc[log.habitId] = []
      acc[log.habitId].push(log)
      return acc
    }, {} as Record<string, { completedDate: Date }[]>)

    const habitsWithStatus = habits.map((habit) => {
      const habitLogs = logsByHabit[habit.id] || []
      const { currentStreak, bestStreak } = calculateStreak(habitLogs, habit.frequencyType, habit.frequencyDays)
      
      return {
        ...habit,
        todayLog: habit.logs[0] || null,
        isDueToday: true,
        currentStreak,
        bestStreak,
        logs: undefined,
      }
    })

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