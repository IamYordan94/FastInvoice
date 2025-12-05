import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { clientName, contactName, email, address, vatNumber, defaultPaymentTerms } = body

    if (!clientName) {
      return NextResponse.json(
        { message: 'Client name is required' },
        { status: 400 }
      )
    }

    const client = await prisma.client.create({
      data: {
        userId: session.user.id,
        clientName,
        contactName: contactName || null,
        email: email || null,
        address: address || null,
        vatNumber: vatNumber || null,
        defaultPaymentTerms: defaultPaymentTerms || 14,
      },
    })

    return NextResponse.json({ message: 'Client created', client }, { status: 201 })
  } catch (error) {
    console.error('Client creation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const clients = await prisma.client.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ clients })
  } catch (error) {
    console.error('Clients fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

