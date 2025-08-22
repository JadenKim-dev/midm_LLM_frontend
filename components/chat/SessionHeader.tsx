'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Session } from '@/lib/api'

interface SessionHeaderProps {
  session: Session | null
  onNewSession: () => void
  isLoading?: boolean
}

export function SessionHeader({ session, onNewSession, isLoading }: SessionHeaderProps) {
  return (
    <Card className="border-b rounded-none">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg">🤖</span>
              <h2 className="text-base sm:text-lg font-semibold truncate">AI Chat Assistant</h2>
            </div>
            
            {session && (
              <Badge variant="outline" className="font-mono text-xs shrink-0">
                ID: {session.session_id.slice(-8)}
              </Badge>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
            {session && (
              <div className="text-xs text-muted-foreground order-2 sm:order-1">
                Created: {new Date(session.created_at).toLocaleTimeString()}
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onNewSession}
              disabled={isLoading}
              className="order-1 sm:order-2 shrink-0"
            >
              <span className="sm:hidden">{isLoading ? '⏳' : '➕'}</span>
              <span className="hidden sm:inline">{isLoading ? '⏳' : '➕'} New</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
