import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            Your Personal Billing Brain
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Set things up once. From then on, invoices are 3 clicks.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🧠</div>
            <h3 className="font-semibold text-lg mb-2">Remembers Everything</h3>
            <p className="text-gray-600 text-sm">
              Your business info, clients, and services saved once, used forever
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="font-semibold text-lg mb-2">Lightning Fast</h3>
            <p className="text-gray-600 text-sm">
              Create professional invoices in seconds, not minutes
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="font-semibold text-lg mb-2">Track Everything</h3>
            <p className="text-gray-600 text-sm">
              See who paid, who's late, and your totals at a glance
            </p>
          </div>
        </div>

        <div className="mt-12 space-x-4">
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              Get Started Free
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

