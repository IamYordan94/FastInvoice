import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateInvoiceNumber } from '@/lib/utils'

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
    const { clientId, issueDate, dueDate, currency, notes, paymentInstructions, lines } = body

    if (!clientId || !issueDate || !dueDate || !lines || lines.length === 0) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate invoice number
    const year = new Date(issueDate).getFullYear()
    const count = await prisma.invoice.count({
      where: {
        userId: session.user.id,
        invoiceNumber: {
          startsWith: `${year}-`,
        },
      },
    })
    const invoiceNumber = generateInvoiceNumber(year, count + 1)

    // Calculate totals
    const subtotal = lines.reduce((sum: number, line: any) => 
      sum + (line.quantity * line.unitPrice), 0
    )
    const taxTotal = lines.reduce((sum: number, line: any) => {
      const lineSubtotal = line.quantity * line.unitPrice
      return sum + (lineSubtotal * line.taxRate / 100)
    }, 0)
    const total = subtotal + taxTotal

    // Create invoice with lines
    const invoice = await prisma.invoice.create({
      data: {
        userId: session.user.id,
        clientId,
        invoiceNumber,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        currency: currency || 'EUR',
        status: 'DRAFT',
        subtotal,
        taxTotal,
        total,
        notes: notes || null,
        paymentInstructions: paymentInstructions || null,
        invoiceLines: {
          create: lines.map((line: any) => ({
            itemId: line.itemId || null,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRate: line.taxRate,
            lineTotal: line.lineTotal,
          })),
        },
      },
      include: {
        client: true,
        invoiceLines: true,
      },
    })

    return NextResponse.json({ message: 'Invoice created', invoice }, { status: 201 })
  } catch (error) {
    console.error('Invoice creation error:', error)
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

    const invoices = await prisma.invoice.findMany({
      where: { userId: session.user.id },
      include: {
        client: true,
        invoiceLines: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('Invoices fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

