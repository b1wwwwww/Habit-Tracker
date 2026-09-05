import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { checkInSchema } from '@/lib/validations'
import { startOfDay, endOfDay } from 'date-fns'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = checkInSchema.parse(body)

    const habit = await prisma.habit.findFirst({
      where: { id, userId: session.userId },
    })

    if (!habit) {
      return NextResponse.json({ error: 'Habit tidak ditemukan' }, { status: 404 })
    }

    const today = new Date()
    const start = startOfDay(today)
    const end = endOfDay(today)

    const existingLog = await prisma.habitLog.findFirst({
      where: {
        habitId: id,
        userId: session.userId,
        completedDate: { gte: start, lte: end },
      },
    })

    let log
    if (existingLog) {
      log = await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: {
          currentValue: validatedData.currentValue,
          status: validatedData.status,
        },
      })
    } else {
      log = await prisma.habitLog.create({
        data: {
          habitId: id,
          userId: session.userId,
          completedDate: today,
          currentValue: validatedData.currentValue,
          status: validatedData.status,
        },
      })
    }

    return NextResponse.json({ log })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Data tidak valid', details: error }, { status: 400 })
    }
    console.error('Check-in error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const today = new Date()
    const start = startOfDay(today)
    const end = endOfDay(today)

    const log = await prisma.habitLog.findFirst({
      where: {
        habitId: id,
        userId: session.userId,
        completedDate: { gte: start, lte: end },
      },
    })

    if (!log) {
      return NextResponse.json({ message: 'Log sudah tidak ada' }, { status: 200 })
    }

    await prisma.habitLog.delete({ where: { id: log.id } })

    return NextResponse.json({ message: 'Check-in dibatalkan' })
  } catch (error) {
    console.error('Delete check-in error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}