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
    const { name, description, unitPrice, unitLabel, taxRate } = body

    if (!name || unitPrice === undefined) {
      return NextResponse.json(
        { message: 'Name and unit price are required' },
        { status: 400 }
      )
    }

    const item = await prisma.item.create({
      data: {
        userId: session.user.id,
        name,
        description: description || null,
        unitPrice: parseFloat(unitPrice),
        unitLabel: unitLabel || 'hour',
        taxRate: parseFloat(taxRate) || 0,
      },
    })

    return NextResponse.json({ message: 'Item created', item }, { status: 201 })
  } catch (error) {
    console.error('Item creation error:', error)
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

    const items = await prisma.item.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Items fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

