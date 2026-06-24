'use client'

import { Component } from 'react'

export default class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 mb-6">
            <span className="text-2xl">!</span>
          </div>
          <h1 className="text-primary text-lg font-medium mb-2">Something went wrong</h1>
          <p className="text-muted text-sm mb-6 max-w-sm text-center">An unexpected error occurred. Try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Refresh page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
