import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { startOfDay, endOfDay, parse } from 'date-fns'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`

    const habits = await prisma.habit.findMany({
      where: {
        reminderTime: { not: null },
        isArchived: false,
      },
      include: {
        user: true,
      },
    })

    const remindersToSend: Array<{
      habitId: string
      userId: string
      title: string
      email: string
      reminderTime: string
    }> = []

    for (const habit of habits) {
      if (!habit.reminderTime) continue

      const [habitHour, habitMinute] = habit.reminderTime.split(':').map(Number)
      const habitTime = `${String(habitHour).padStart(2, '0')}:${String(habitMinute).padStart(2, '0')}`

      if (currentTimeStr === habitTime) {
        const today = new Date()
        const start = startOfDay(today)
        const end = endOfDay(today)

        const existingLog = await prisma.habitLog.findFirst({
          where: {
            habitId: habit.id,
            userId: habit.userId,
            completedDate: { gte: start, lte: end },
          },
        })

        if (!existingLog) {
          remindersToSend.push({
            habitId: habit.id,
            userId: habit.userId,
            title: habit.title,
            email: habit.user.email,
            reminderTime: habit.reminderTime,
          })
        }
      }
    }

    if (remindersToSend.length > 0) {
      console.log(`[Cron] Sending ${remindersToSend.length} reminders`)
      for (const reminder of remindersToSend) {
        console.log(`[Reminder] Habit: ${reminder.title}, User: ${reminder.email}, Time: ${reminder.reminderTime}`)
      }
    }

    return NextResponse.json({
      success: true,
      remindersCount: remindersToSend.length,
      reminders: remindersToSend,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengirim reminder' },
      { status: 500 }
    )
  }
}
