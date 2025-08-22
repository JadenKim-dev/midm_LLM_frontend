'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Menu } from 'lucide-react'

interface HeaderProps {
  onMenuClick?: () => void
  isMobile?: boolean
}

export function Header({ onMenuClick, isMobile }: HeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="h-9 w-9 p-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <h1 className="text-lg font-semibold hidden sm:block">AI Chatbot</h1>
            <h1 className="text-base font-semibold sm:hidden">AI</h1>
          </div>
          <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
            v1.0.0
          </Badge>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            ⚙️ Settings
          </Button>
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            🌙 Dark Mode
          </Button>
          {/* Mobile: Show only icons */}
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 sm:hidden">
            ⚙️
            <span className="sr-only">Settings</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 sm:hidden">
            🌙
            <span className="sr-only">Dark Mode</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
