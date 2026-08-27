import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { habitSchema } from '@/lib/validations'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const habits = await prisma.habit.findMany({
      where: { userId: session.userId, isArchived: false },
      orderBy: { createdAt: 'desc' },
      include: {
        logs: {
          where: {
            completedDate: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
          take: 1,
        },
      },
    })

    const habitsWithStatus = habits.map((habit) => ({
      ...habit,
      todayLog: habit.logs[0] || null,
      logs: undefined,
    }))

    return NextResponse.json({ habits: habitsWithStatus })
  } catch (error) {
    console.error('Get habits error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = habitSchema.parse(body)

    const habit = await prisma.habit.create({
      data: {
        ...validatedData,
        userId: session.userId,
      },
    })

    return NextResponse.json({ habit }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Data tidak valid', details: error }, { status: 400 })
    }
    console.error('Create habit error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}