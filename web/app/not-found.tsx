import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 border border-subtle mb-6">
        <span className="text-2xl text-muted">404</span>
      </div>
      <h1 className="text-primary text-lg font-medium mb-2">Page not found</h1>
      <p className="text-muted text-sm mb-6 max-w-sm text-center">The page you're looking for doesn't exist.</p>
      <Link
        href="/"
        className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
      >
        Go home
      </Link>
    </div>
  )
}
