import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { createToken, setAuthCookie } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedDataRaw = registerSchema.parse(body)
    const validatedData = {
      ...validatedDataRaw,
      email: validatedDataRaw.email.trim().toLowerCase(),
    }

    console.log('Register attempt for email:', validatedData.email)
    const existingUser = await prisma.user.findUnique({ where: { email: validatedData.email } })

    if (existingUser) {
      console.log('Existing user found for', validatedData.email)
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(validatedData.password)

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
        timezone: validatedData.timezone,
      },
      select: { id: true, name: true, email: true, timezone: true },
    })
    console.log('Registered user:', user.email)

    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
    })

    await setAuthCookie(token)

    return NextResponse.json({ user, message: 'Registrasi berhasil' }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Data tidak valid', details: error }, { status: 400 })
    }
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}