'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <h1 className="text-lg font-semibold">AI Chatbot</h1>
          </div>
          <Badge variant="secondary" className="text-xs">
            v1.0.0
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            ⚙️ Settings
          </Button>
          <Button variant="ghost" size="sm">
            🌙 Dark Mode
          </Button>
        </div>
      </div>
    </header>
  )
}
