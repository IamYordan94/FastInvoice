import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import React from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #eee',
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    paddingVertical: 8,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 5,
  },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 12,
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: '1pt solid #eee',
    fontSize: 10,
    color: '#666',
  },
})

function InvoicePDF({ invoice }: any) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE {invoice.invoiceNumber}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>From:</Text>
              <Text style={styles.value}>{invoice.user.companyName || invoice.user.name}</Text>
              {invoice.user.companyAddress && (
                <Text>{invoice.user.companyAddress}</Text>
              )}
              {invoice.user.vatNumber && (
                <Text>VAT: {invoice.user.vatNumber}</Text>
              )}
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>To:</Text>
              <Text style={styles.value}>{invoice.client.clientName}</Text>
              {invoice.client.contactName && (
                <Text>{invoice.client.contactName}</Text>
              )}
              {invoice.client.address && (
                <Text>{invoice.client.address}</Text>
              )}
              {invoice.client.vatNumber && (
                <Text>VAT: {invoice.client.vatNumber}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Issue Date:</Text>
              <Text>{formatDate(invoice.issueDate)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Due Date:</Text>
              <Text>{formatDate(invoice.dueDate)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Currency:</Text>
              <Text>{invoice.currency}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Description</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>Qty</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>Price</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>Tax %</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>Total</Text>
          </View>
          {invoice.invoiceLines.map((line: any) => (
            <View key={line.id} style={styles.tableRow}>
              <Text style={styles.tableCell}>{line.description}</Text>
              <Text style={[styles.tableCell, { textAlign: 'right' }]}>{line.quantity}</Text>
              <Text style={[styles.tableCell, { textAlign: 'right' }]}>
                {formatCurrency(line.unitPrice, invoice.currency)}
              </Text>
              <Text style={[styles.tableCell, { textAlign: 'right' }]}>{line.taxRate}%</Text>
              <Text style={[styles.tableCell, { textAlign: 'right' }]}>
                {formatCurrency(line.lineTotal, invoice.currency)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal, invoice.currency)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.taxTotal, invoice.currency)}</Text>
          </View>
          <View style={[styles.totalRow, { borderTop: '1pt solid #000', paddingTop: 5, marginTop: 5 }]}>
            <Text style={[styles.totalLabel, { fontWeight: 'bold' }]}>Total:</Text>
            <Text style={[styles.totalValue, { fontSize: 14 }]}>
              {formatCurrency(invoice.total, invoice.currency)}
            </Text>
          </View>
        </View>

        {invoice.paymentInstructions && (
          <View style={styles.footer}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Payment Instructions:</Text>
            <Text>{invoice.paymentInstructions}</Text>
          </View>
        )}

        {invoice.user.ibanOrBankDetails && (
          <View style={styles.footer}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Bank Details:</Text>
            <Text>{invoice.user.ibanOrBankDetails}</Text>
          </View>
        )}

        {invoice.notes && (
          <View style={styles.footer}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Notes:</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}

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

    const doc = React.createElement(InvoicePDF, { invoice })
    const pdfBlob = await pdf(doc).toBlob()

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

