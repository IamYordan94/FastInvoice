import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pdf } from '@react-pdf/renderer'
import InvoicePDF from '@/components/invoice-pdf'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        user: true,
        invoiceLines: true,
      },
    })

    if (!invoice || invoice.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Invoice not found' },
        { status: 404 }
      )
    }

    const pdfBlob = await pdf(<InvoicePDF invoice={invoice} />).toBlob()

    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

