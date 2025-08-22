'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RAGToggle } from './RAGToggle'
import { apiClient } from '@/lib/api'
import { Message, RAGContext } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { SessionStorage } from '@/lib/sessionStorage'

interface MessageInputProps {
  sessionId?: string
  onMessageSent?: (message: Message) => void
  onStreamUpdate?: (content: string, contexts?: RAGContext[]) => void
  onSendMessage?: (message: string, options?: { useRAG?: boolean; topK?: number }) => Promise<void>
  className?: string
  disabled?: boolean
}

export function MessageInput({
  sessionId,
  onMessageSent,
  onStreamUpdate,
  onSendMessage,
  className,
  disabled = false,
}: MessageInputProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useRAG, setUseRAG] = useState(false)
  const [ragContexts, setRagContexts] = useState<RAGContext[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!input.trim() || !sessionId || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setError(null)
    setIsLoading(true)

    try {
      // 세션 활동 시 세션 연장
      SessionStorage.extendSession()
      
      // onSendMessage prop이 있으면 훅의 sendMessage 사용 (권장)
      if (onSendMessage) {
        await onSendMessage(userMessage, {
          useRAG: useRAG,
          topK: 5
        })
      } else {
        // 기존 방식 (하위 호환성)
        const userMessageObj: Message = {
          message_id: generateId(),
          session_id: sessionId,
          role: 'user',
          content: userMessage,
          created_at: new Date().toISOString(),
        }
        
        onMessageSent?.(userMessageObj)

        const assistantMessageObj: Message = {
          message_id: generateId(),
          session_id: sessionId,
          role: 'assistant',
          content: '',
          created_at: new Date().toISOString(),
        }
        
        onMessageSent?.(assistantMessageObj)

        const stream = await apiClient.sendMessage(sessionId, userMessage, {
          use_rag: useRAG,
          top_k: 5
        })

        let assistantContent = ''
        let currentContexts: RAGContext[] = []

        for await (const chunk of apiClient.parseStreamResponse(stream)) {
          console.log('Stream chunk received:', chunk) // 디버깅용 로그
          
          if (chunk.type === 'content' && chunk.content) {
            assistantContent += chunk.content
            onStreamUpdate?.(assistantContent, currentContexts)
          } else if (chunk.type === 'context' && chunk.context_info) {
            currentContexts = chunk.context_info
            setRagContexts(currentContexts)
            onStreamUpdate?.(assistantContent, currentContexts)
          } else if (chunk.type === 'done') {
            console.log('Stream completed') // 디버깅용 로그
            break
          }
        }

        if (currentContexts.length > 0) {
          assistantMessageObj.rag_context = currentContexts
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

  const getPlaceholderText = () => {
    if (disabled) return "Please wait..."
    if (isLoading) return "AI is thinking..."
    if (useRAG) return "Ask anything about your documents..."
    return "Type your message..."
  }

  return (
    <div className={className}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* RAG Toggle */}
      {sessionId && (
        <div className="mb-4">
          <RAGToggle
            sessionId={sessionId}
            useRAG={useRAG}
            onToggle={setUseRAG}
            disabled={disabled || isLoading}
          />
        </div>
      )}
      
      <Card className={useRAG ? 'ring-1 ring-blue-200 bg-blue-50/30' : ''}>
        <CardContent className="p-3 sm:p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholderText()}
              disabled={disabled || isLoading}
              className={`flex-1 h-11 ${useRAG ? 'border-blue-200 focus:border-blue-400' : ''}`}
              style={{ fontSize: '16px' }}
              autoFocus
            />
            
            <Button
              type="submit"
              disabled={disabled || isLoading || !input.trim()}
              size="icon"
              className={`h-11 w-11 ${useRAG ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              {isLoading ? '⏳' : useRAG ? '🔍' : '📤'}
            </Button>
          </form>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 text-xs text-muted-foreground space-y-1 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
              <span className="hidden sm:inline">Enter to send, Shift+Enter for new line</span>
              <span className="sm:hidden">Tap to send</span>
              {useRAG && (
                <span className="text-blue-600 font-medium">
                  🔍 RAG Mode Active
                </span>
              )}
            </div>
            {sessionId && (
              <span className="font-mono text-xs">Session: {sessionId.slice(-8)}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
