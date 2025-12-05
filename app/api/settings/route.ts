import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { companyName, companyAddress, vatNumber, ibanOrBankDetails, defaultCurrency } = body

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        companyName: companyName || null,
        companyAddress: companyAddress || null,
        vatNumber: vatNumber || null,
        ibanOrBankDetails: ibanOrBankDetails || null,
        defaultCurrency: defaultCurrency || 'EUR',
      },
    })

    return NextResponse.json({ message: 'Settings updated', user })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

