import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyPassword } from '@/lib/password'
import { createToken, setAuthCookie } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedDataRaw = loginSchema.parse(body)
    const validatedData = {
      ...validatedDataRaw,
      email: validatedDataRaw.email.trim().toLowerCase(),
    }

    const user = await prisma.user.findUnique({ where: { email: validatedData.email } })

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    const isValid = await verifyPassword(validatedData.password, user.passwordHash)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
    })

    await setAuthCookie(token)

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
      },
      message: 'Login berhasil',
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Data tidak valid', details: error }, { status: 400 })
    }
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}