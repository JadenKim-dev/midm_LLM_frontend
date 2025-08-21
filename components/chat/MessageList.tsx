'use client'

import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Message } from '@/lib/api'
import { formatTimestamp } from '@/lib/utils'

interface MessageListProps {
  messages: Message[]
  isLoading?: boolean
  className?: string
}

export function MessageList({ messages, isLoading, className }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user'
    const isAssistant = message.role === 'assistant'

    return (
      <div
        key={message.message_id || index}
        className={`flex gap-3 mb-4 message-fade-in ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Avatar */}
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className={isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
            {isUser ? '👤' : '🤖'}
          </AvatarFallback>
        </Avatar>

        {/* Message Content */}
        <div className={`flex flex-col max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
          <Card className={`${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
          }`}>
            <CardContent className="p-3">
              <div className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </div>
            </CardContent>
          </Card>
          
          {/* Timestamp */}
          <div className="text-xs text-muted-foreground mt-1 px-1">
            {formatTimestamp(message.created_at)}
          </div>
        </div>
      </div>
    )
  }

  const renderTypingIndicator = () => (
    <div className="flex gap-3 mb-4">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className="bg-secondary">
          🤖
        </AvatarFallback>
      </Avatar>
      
      <Card className="bg-muted">
        <CardContent className="p-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <ScrollArea ref={scrollAreaRef} className={`${className} scrollbar-thin`}>
      <div className="p-4 space-y-4">
        {/* Welcome Message */}
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-muted-foreground py-8">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold mb-2">Welcome to AI Chat!</h3>
            <p className="text-sm">Start a conversation by typing a message below.</p>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && messages.length === 0 && renderLoadingSkeleton()}

        {/* Messages */}
        {messages.map((message, index) => renderMessage(message, index))}

        {/* Typing Indicator */}
        {isLoading && messages.length > 0 && renderTypingIndicator()}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}
