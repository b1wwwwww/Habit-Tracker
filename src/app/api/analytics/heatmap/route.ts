import { NextResponse, NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { startOfDay, format, startOfYear, endOfYear } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10)
    const habitId = searchParams.get('habitId')

    const yearStart = startOfYear(new Date(year, 0, 1))
    const yearEnd = endOfYear(new Date(year, 11, 31))

    const whereClause: Record<string, unknown> = {
      userId: session.userId,
      completedDate: { gte: yearStart, lte: yearEnd },
      status: 'COMPLETED',
    }

    if (habitId) {
      whereClause.habitId = habitId
    }

    const logs = await prisma.habitLog.findMany({
      where: whereClause,
      select: { completedDate: true, habitId: true },
    })

    const heatmapData: Record<string, number> = {}

    for (const log of logs) {
      const dateKey = format(startOfDay(new Date(log.completedDate)), 'yyyy-MM-dd')
      heatmapData[dateKey] = (heatmapData[dateKey] || 0) + 1
    }

    return NextResponse.json({ heatmap: heatmapData, year })
  } catch (error) {
    console.error('Heatmap error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}