'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Download, CheckCircle, Send } from 'lucide-react'

interface InvoiceLine {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  lineTotal: number
  item: {
    name: string
  } | null
}

interface Invoice {
  id: string
  invoiceNumber: string
  issueDate: Date | string
  dueDate: Date | string
  currency: string
  status: string
  subtotal: number
  taxTotal: number
  total: number
  notes: string | null
  paymentInstructions: string | null
  client: {
    clientName: string
    contactName: string | null
    email: string | null
    address: string | null
    vatNumber: string | null
  }
  user: {
    name: string
    companyName: string | null
    companyAddress: string | null
    vatNumber: string | null
    ibanOrBankDetails: string | null
  }
  invoiceLines: InvoiceLine[]
}

export default function InvoiceView({ invoice }: { invoice: Invoice }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function getStatusColor(status: string) {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'SENT':
        return 'bg-blue-100 text-blue-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  async function handleDownloadPDF() {
    setLoading(true)
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/pdf`)
      if (!res.ok) throw new Error('Failed to generate PDF')
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoice.invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('PDF download error:', error)
      alert('Failed to download PDF')
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkAsPaid() {
    if (!confirm('Mark this invoice as paid?')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/paid`, {
        method: 'PUT',
      })

      if (!res.ok) throw new Error('Failed to update invoice')

      router.refresh()
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to update invoice')
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkAsSent() {
    setLoading(true)
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/sent`, {
        method: 'PUT',
      })

      if (!res.ok) throw new Error('Failed to update invoice')

      router.refresh()
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to update invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h2>
          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(invoice.status)}`}>
            {invoice.status}
          </span>
        </div>
        <div className="flex space-x-2">
          {invoice.status === 'DRAFT' && (
            <Button variant="outline" onClick={handleMarkAsSent} disabled={loading}>
              <Send className="mr-2 h-4 w-4" />
              Mark as Sent
            </Button>
          )}
          {invoice.status !== 'PAID' && (
            <Button variant="outline" onClick={handleMarkAsPaid} disabled={loading}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Paid
            </Button>
          )}
          <Button onClick={handleDownloadPDF} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-2">From:</h3>
              <div className="text-sm">
                <div className="font-semibold">{invoice.user.companyName || invoice.user.name}</div>
                {invoice.user.companyAddress && (
                  <div className="whitespace-pre-line text-gray-600">{invoice.user.companyAddress}</div>
                )}
                {invoice.user.vatNumber && (
                  <div className="text-gray-600">VAT: {invoice.user.vatNumber}</div>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">To:</h3>
              <div className="text-sm">
                <div className="font-semibold">{invoice.client.clientName}</div>
                {invoice.client.contactName && (
                  <div className="text-gray-600">{invoice.client.contactName}</div>
                )}
                {invoice.client.address && (
                  <div className="whitespace-pre-line text-gray-600">{invoice.client.address}</div>
                )}
                {invoice.client.vatNumber && (
                  <div className="text-gray-600">VAT: {invoice.client.vatNumber}</div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
            <div>
              <div className="text-gray-600">Issue Date</div>
              <div className="font-semibold">{formatDate(invoice.issueDate)}</div>
            </div>
            <div>
              <div className="text-gray-600">Due Date</div>
              <div className="font-semibold">{formatDate(invoice.dueDate)}</div>
            </div>
            <div>
              <div className="text-gray-600">Currency</div>
              <div className="font-semibold">{invoice.currency}</div>
            </div>
          </div>

          <div className="border-t pt-4 mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Quantity</th>
                  <th className="text-right py-2">Unit Price</th>
                  <th className="text-right py-2">Tax %</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.invoiceLines.map((line) => (
                  <tr key={line.id} className="border-b">
                    <td className="py-3">{line.description}</td>
                    <td className="text-right py-3">{line.quantity}</td>
                    <td className="text-right py-3">{formatCurrency(line.unitPrice, invoice.currency)}</td>
                    <td className="text-right py-3">{line.taxRate}%</td>
                    <td className="text-right py-3 font-semibold">
                      {formatCurrency(line.lineTotal, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-6">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(invoice.taxTotal, invoice.currency)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total, invoice.currency)}</span>
              </div>
            </div>
          </div>

          {invoice.paymentInstructions && (
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <h4 className="font-semibold mb-2">Payment Instructions:</h4>
              <p className="text-sm whitespace-pre-line">{invoice.paymentInstructions}</p>
            </div>
          )}

          {invoice.user.ibanOrBankDetails && (
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <h4 className="font-semibold mb-2">Bank Details:</h4>
              <p className="text-sm">{invoice.user.ibanOrBankDetails}</p>
            </div>
          )}

          {invoice.notes && (
            <div className="p-4 bg-gray-50 rounded">
              <h4 className="font-semibold mb-2">Notes:</h4>
              <p className="text-sm whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

