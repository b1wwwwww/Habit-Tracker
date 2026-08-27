import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { habitSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const habit = await prisma.habit.findFirst({
      where: { id, userId: session.userId },
      include: {
        logs: {
          orderBy: { completedDate: 'desc' },
          take: 30,
        },
      },
    })

    if (!habit) {
      return NextResponse.json({ error: 'Habit tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ habit })
  } catch (error) {
    console.error('Get habit error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function PUT(
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
    const validatedData = habitSchema.parse(body)

    const habit = await prisma.habit.findFirst({
      where: { id, userId: session.userId },
    })

    if (!habit) {
      return NextResponse.json({ error: 'Habit tidak ditemukan' }, { status: 404 })
    }

    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json({ habit: updatedHabit })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Data tidak valid', details: error }, { status: 400 })
    }
    console.error('Update habit error:', error)
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

    const habit = await prisma.habit.findFirst({
      where: { id, userId: session.userId },
    })

    if (!habit) {
      return NextResponse.json({ error: 'Habit tidak ditemukan' }, { status: 404 })
    }

    await prisma.habit.update({
      where: { id },
      data: { isArchived: true },
    })

    return NextResponse.json({ message: 'Habit diarsipkan' })
  } catch (error) {
    console.error('Delete habit error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}