'use client'

import { useState } from 'react'
import { MessageCircle, FileText, Plus, Presentation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TabType } from '@/lib/types'

interface SidebarProps {
  className?: string
  activeTab?: TabType
  onTabChange?: (tab: TabType) => void
  onNewChat?: () => void
  onClearSession?: () => void
}

export function Sidebar({ 
  className, 
  activeTab = 'chat', 
  onTabChange,
  onNewChat,
  onClearSession
}: SidebarProps) {
  const [sessions] = useState([
    { id: '1', title: 'General Chat', lastMessage: 'Hello there!', timestamp: '10:30 AM' },
    { id: '2', title: 'Code Help', lastMessage: 'How to use React hooks?', timestamp: '09:15 AM' },
    { id: '3', title: 'Writing Assistant', lastMessage: 'Help me write an email', timestamp: 'Yesterday' },
  ])

  const tabs = [
    { id: 'chat' as TabType, label: '채팅', icon: MessageCircle },
    { id: 'documents' as TabType, label: '문서', icon: FileText },
    { id: 'presentations' as TabType, label: '발표자료', icon: Presentation },
  ]

  return (
    <aside className={className}>
      <div className="flex flex-col h-full">
        {/* Tab Navigation */}
        <div className="p-4 border-b">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  className={`
                    flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'chat' ? (
            <>
              {/* New Chat Button */}
              <div className="p-4 border-b space-y-2">
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={onNewChat}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  새 채팅
                </Button>
                {onClearSession && (
                  <Button 
                    variant="outline"
                    className="w-full" 
                    size="sm"
                    onClick={onClearSession}
                  >
                    세션 초기화
                  </Button>
                )}
              </div>

              {/* Session List */}
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                  <div className="px-2 py-1">
                    <h3 className="text-sm font-medium text-muted-foreground">최근 세션</h3>
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
            </>
          ) : activeTab === 'documents' ? (
            <>
              {/* Documents Tab Content */}
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    문서 관리는 메인 영역에서<br />
                    확인할 수 있습니다.
                  </p>
                </div>
              </div>
            </>
          ) : activeTab === 'presentations' ? (
            <>
              {/* Presentations Tab Content */}
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center text-muted-foreground">
                  <Presentation className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    발표자료 생성은 메인 영역에서<br />
                    확인할 수 있습니다.
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>연결됨</span>
            </div>
            <div>AI Chat v1.0.0</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
