'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Heart, Share2, MessageSquare } from 'lucide-react'
import { Supervivememorial } from '@/components/supervive-memorial'

export default function MemorialPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="absolute top-0 left-0 w-8 h-px bg-primary/40" />
        <div className="absolute top-0 left-0 w-px h-8 bg-primary/40" />
        <div className="absolute top-0 right-0 w-8 h-px bg-primary/40" />
        <div className="absolute top-0 right-0 w-px h-8 bg-primary/40" />

        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Memorial</h1>
            <p className="text-sm text-muted-foreground">
              Homenagem aos jogos que deixaram legado
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 lg:px-8 lg:py-12">
        <Supervivememorial />
      </main>

      {/* Footer */}
      <footer className="relative border-t mt-12">
        <div className="absolute bottom-0 left-0 w-8 h-px bg-primary/40" />
        <div className="absolute bottom-0 left-0 w-px h-8 bg-primary/40" />
        <div className="absolute bottom-0 right-0 w-8 h-px bg-primary/40" />
        <div className="absolute bottom-0 right-0 w-px h-8 bg-primary/40" />

        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Panela Tracker - Preservando memórias dos nossos jogos</p>
        </div>
      </footer>
    </div>
  )
}
