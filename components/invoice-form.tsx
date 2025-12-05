'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Client {
  id: string
  clientName: string
  defaultPaymentTerms: number
}

interface Item {
  id: string
  name: string
  description: string | null
  unitPrice: number
  unitLabel: string
  taxRate: number
}

interface InvoiceLine {
  id: string
  itemId?: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  lineTotal: number
}

export default function InvoiceForm({ clients, items, defaultCurrency }: { clients: Client[], items: Item[], defaultCurrency: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 14)
    return date.toISOString().split('T')[0]
  })
  const [currency, setCurrency] = useState(defaultCurrency)
  const [notes, setNotes] = useState('')
  const [paymentInstructions, setPaymentInstructions] = useState('')
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([])

  const selectedClient = clients.find(c => c.id === selectedClientId)

  function addLineFromItem(item: Item) {
    const lineTotal = item.unitPrice * (1 + item.taxRate / 100)
    setInvoiceLines([
      ...invoiceLines,
      {
        id: Math.random().toString(),
        itemId: item.id,
        description: item.name + (item.description ? ` - ${item.description}` : ''),
        quantity: 1,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        lineTotal: lineTotal,
      },
    ])
  }

  function addCustomLine() {
    setInvoiceLines([
      ...invoiceLines,
      {
        id: Math.random().toString(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        lineTotal: 0,
      },
    ])
  }

  function updateLine(id: string, field: keyof InvoiceLine, value: any) {
    setInvoiceLines(invoiceLines.map(line => {
      if (line.id === id) {
        const updated = { ...line, [field]: value }
        if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
          updated.lineTotal = updated.quantity * updated.unitPrice * (1 + updated.taxRate / 100)
        }
        return updated
      }
      return line
    }))
  }

  function removeLine(id: string) {
    setInvoiceLines(invoiceLines.filter(line => line.id !== id))
  }

  function handleClientChange(clientId: string) {
    setSelectedClientId(clientId)
    const client = clients.find(c => c.id === clientId)
    if (client) {
      const newDueDate = new Date(issueDate)
      newDueDate.setDate(newDueDate.getDate() + client.defaultPaymentTerms)
      setDueDate(newDueDate.toISOString().split('T')[0])
    }
  }

  const subtotal = invoiceLines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0)
  const taxTotal = invoiceLines.reduce((sum, line) => {
    const lineSubtotal = line.quantity * line.unitPrice
    return sum + (lineSubtotal * line.taxRate / 100)
  }, 0)
  const total = subtotal + taxTotal

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!selectedClientId) {
      setError('Please select a client')
      setLoading(false)
      return
    }

    if (invoiceLines.length === 0) {
      setError('Please add at least one line item')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClientId,
          issueDate,
          dueDate,
          currency,
          notes: notes || null,
          paymentInstructions: paymentInstructions || null,
          lines: invoiceLines.map(line => ({
            itemId: line.itemId || null,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRate: line.taxRate,
            lineTotal: line.lineTotal,
          })),
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create invoice')
      }

      const { invoice } = await res.json()
      router.push(`/invoices/${invoice.id}`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">Client *</Label>
            <select
              id="clientId"
              value={selectedClientId}
              onChange={(e) => handleClientChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.clientName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date *</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Invoice Lines</CardTitle>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" size="sm" onClick={addCustomLine}>
                <Plus className="mr-2 h-4 w-4" />
                Custom Line
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {items.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <Label className="text-sm font-medium mb-2 block">Quick Add Items:</Label>
              <div className="flex flex-wrap gap-2">
                {items.map(item => (
                  <Button
                    key={item.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addLineFromItem(item)}
                  >
                    {item.name} ({formatCurrency(item.unitPrice, currency)})
                  </Button>
                ))}
              </div>
            </div>
          )}

          {invoiceLines.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No items added yet. Click "Quick Add Items" above or "Custom Line" to add items.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoiceLines.map((line, index) => (
                <div key={line.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Line {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(line.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Description *</Label>
                      <Input
                        value={line.description}
                        onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                        required
                        placeholder="Service or product description"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-2">
                        <Label>Quantity *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={line.quantity}
                          onChange={(e) => updateLine(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit Price *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.unitPrice}
                          onChange={(e) => updateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tax %</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={line.taxRate}
                          onChange={(e) => updateLine(line.id, 'taxRate', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-600">Line Total: </span>
                    <span className="font-semibold">{formatCurrency(line.lineTotal, currency)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatCurrency(taxTotal, currency)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Additional notes for the invoice"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentInstructions">Payment Instructions</Label>
            <textarea
              id="paymentInstructions"
              value={paymentInstructions}
              onChange={(e) => setPaymentInstructions(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Payment instructions (e.g., bank details, payment terms)"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        <Button type="submit" disabled={loading || invoiceLines.length === 0}>
          {loading ? 'Creating...' : 'Create Invoice'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

