'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiClient, Message } from '@/lib/api'
import { generateId } from '@/lib/utils'

interface MessageInputProps {
  sessionId?: string
  onMessageSent?: (message: Message) => void
  onStreamUpdate?: (content: string) => void
  className?: string
  disabled?: boolean
}

export function MessageInput({
  sessionId,
  onMessageSent,
  onStreamUpdate,
  className,
  disabled = false,
}: MessageInputProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!input.trim() || !sessionId || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setError(null)
    setIsLoading(true)

    try {
      // Add user message immediately
      const userMessageObj: Message = {
        message_id: generateId(),
        session_id: sessionId,
        role: 'user',
        content: userMessage,
        created_at: new Date().toISOString(),
      }
      
      onMessageSent?.(userMessageObj)

      // Create assistant message placeholder
      const assistantMessageObj: Message = {
        message_id: generateId(),
        session_id: sessionId,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      }
      
      onMessageSent?.(assistantMessageObj)

      // Send message and handle streaming response
      const stream = await apiClient.sendMessage(sessionId, userMessage)
      const reader = stream.getReader()
      const decoder = new TextDecoder()

      let assistantContent = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            
            if (data === '[DONE]') {
              break
            }

            try {
              const parsed = JSON.parse(data)
              
              if (parsed.type === 'token' && parsed.content) {
                assistantContent += parsed.content
                onStreamUpdate?.(assistantContent)
              } else if (parsed.type === 'complete') {
                // Stream completed
                break
              } else if (parsed.type === 'error') {
                throw new Error(parsed.message || 'Stream error occurred')
              }
            } catch (parseError) {
              // Skip invalid JSON lines
              continue
            }
          }
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMessage)
      console.error('Error sending message:', err)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={className}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={disabled ? "Please wait..." : "Type your message..."}
              disabled={disabled || isLoading}
              className="flex-1"
              autoFocus
            />
            
            <Button
              type="submit"
              disabled={disabled || isLoading || !input.trim()}
              size="icon"
            >
              {isLoading ? '⏳' : '📤'}
            </Button>
          </form>
          
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Press Enter to send, Shift+Enter for new line</span>
            {sessionId && (
              <span className="font-mono">Session: {sessionId.slice(-8)}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
