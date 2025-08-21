'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [sessions] = useState([
    { id: '1', title: 'General Chat', lastMessage: 'Hello there!', timestamp: '10:30 AM' },
    { id: '2', title: 'Code Help', lastMessage: 'How to use React hooks?', timestamp: '09:15 AM' },
    { id: '3', title: 'Writing Assistant', lastMessage: 'Help me write an email', timestamp: 'Yesterday' },
  ])

  return (
    <aside className={className}>
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <Button className="w-full" size="sm">
            ➕ New Chat
          </Button>
        </div>

        {/* Session List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            <div className="px-2 py-1">
              <h3 className="text-sm font-medium text-muted-foreground">Recent Sessions</h3>
            </div>
            
            {sessions.map((session) => (
              <Card key={session.id} className="cursor-pointer hover:bg-accent transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-medium truncate">{session.title}</h4>
                    <Badge variant="outline" className="text-xs ml-2">
                      {session.id}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-1">
                    {session.lastMessage}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {session.timestamp}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Connected</span>
            </div>
            <div>AI Chat v1.0.0</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
