import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import InvoiceForm from '@/components/invoice-form'

export default async function NewInvoicePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const [clients, items, user] = await Promise.all([
    prisma.client.findMany({
      where: { userId: session.user.id },
      orderBy: { clientName: 'asc' },
    }),
    prisma.item.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
    }),
  ])

  if (clients.length === 0) {
    redirect('/clients/new?redirect=/invoices/new')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">Invoice Generator</h1>
            <a href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create New Invoice</h2>
          <p className="text-gray-600 mt-2">
            Select a client, add items, and generate your invoice in seconds.
          </p>
        </div>

        <InvoiceForm clients={clients} items={items} defaultCurrency={user?.defaultCurrency || 'EUR'} />
      </main>
    </div>
  )
}

