import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { subDays, startOfDay, format, differenceInDays } from 'date-fns'

function calculateStreaks(logs: { completedDate: Date }[], frequencyType: string, frequencyDays: string[]) {
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

    const habits = await prisma.habit.findMany({
      where: { userId: session.userId, isArchived: false },
      include: {
        logs: {
          where: {
            status: 'COMPLETED',
          },
          select: { completedDate: true },
          orderBy: { completedDate: 'desc' },
        },
      },
    })

    const streaks = habits.map((habit) => {
      const { currentStreak, bestStreak } = calculateStreaks(
        habit.logs,
        habit.frequencyType,
        habit.frequencyDays
      )
      return {
        habitId: habit.id,
        title: habit.title,
        currentStreak,
        bestStreak,
        totalCompletions: habit.logs.length,
      }
    })

    return NextResponse.json({ streaks })
  } catch (error) {
    console.error('Streaks error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}