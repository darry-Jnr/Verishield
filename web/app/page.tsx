'use client'

import { useState } from 'react'
import Navbar from '@/components/landing/navbar'
import Main from '@/components/landing/main'
import Footer from '@/components/landing/footer'
import SignIn from '@/components/modal/sign-in'

export default function Home() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="bg-canvas min-h-screen">
      <Navbar onSignIn={() => setShowModal(true)} />
      <Main onCta={() => setShowModal(true)} />
      <Footer />
      <SignIn open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}
