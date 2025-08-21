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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <h2 className="text-lg font-semibold">AI Chat Assistant</h2>
            </div>
            
            {session && (
              <Badge variant="outline" className="font-mono text-xs">
                ID: {session.session_id.slice(-8)}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {session && (
              <div className="text-xs text-muted-foreground">
                Created: {new Date(session.created_at).toLocaleTimeString()}
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onNewSession}
              disabled={isLoading}
            >
              {isLoading ? '⏳' : '➕'} New Session
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
