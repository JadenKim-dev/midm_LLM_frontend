'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { Session, Message, RAGContext } from '@/lib/types'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const createNewSession = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const newSession = await apiClient.createSession()
      setSession(newSession)
      setMessages([])
      
      return newSession
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session'
      setError(errorMessage)
      console.error('Error creating session:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      setError(null)
      const response = await apiClient.getMessages(sessionId)
      setMessages(response.messages)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages'
      setError(errorMessage)
      console.error('Error loading messages:', err)
    }
  }, [])

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message])
  }, [])

  const updateLastMessage = useCallback((content: string, contexts?: RAGContext[]) => {
    setMessages(prev => {
      const newMessages = [...prev]
      if (newMessages.length > 0) {
        const lastMessage = newMessages[newMessages.length - 1]
        if (lastMessage.role === 'assistant') {
          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            content: content,
            rag_context: contexts || lastMessage.rag_context,
          }
        }
      }
      return newMessages
    })
  }, [])

  const sendMessage = useCallback(async (
    message: string, 
    options?: {
      useRAG?: boolean
      topK?: number
    }
  ): Promise<void> => {
    if (!session?.session_id) {
      throw new Error('No active session')
    }

    try {
      setError(null)
      
      // Add user message
      const userMessage: Message = {
        message_id: `user_${Date.now()}`,
        session_id: session.session_id,
        role: 'user',
        content: message,
        created_at: new Date().toISOString(),
      }
      addMessage(userMessage)

      // Add assistant placeholder
      const assistantMessage: Message = {
        message_id: `assistant_${Date.now()}`,
        session_id: session.session_id,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      }
      addMessage(assistantMessage)

      // Send message with RAG options
      const stream = await apiClient.sendMessage(session.session_id, message, {
        use_rag: options?.useRAG || false,
        top_k: options?.topK || 5
      })

      let assistantContent = ''
      let currentContexts: RAGContext[] = []

      // Process streaming response
      for await (const chunk of apiClient.parseStreamResponse(stream)) {
        console.log('useSession - Stream chunk received:', chunk) // 디버깅용 로그
        
        if (chunk.type === 'content' && chunk.content) {
          assistantContent += chunk.content
          updateLastMessage(assistantContent, currentContexts)
        } else if (chunk.type === 'context' && chunk.context_info) {
          currentContexts = chunk.context_info
          updateLastMessage(assistantContent, currentContexts)
        } else if (chunk.type === 'done') {
          console.log('useSession - Stream completed') // 디버깅용 로그
          break
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMessage)
      throw err
    }
  }, [session, addMessage, updateLastMessage])

  // Initialize session on mount
  useEffect(() => {
    createNewSession()
  }, [createNewSession])

  // Load messages when session changes
  useEffect(() => {
    if (session?.session_id) {
      loadMessages(session.session_id)
    }
  }, [session?.session_id, loadMessages])

  return {
    session,
    messages,
    isLoading,
    error,
    createNewSession,
    loadMessages,
    addMessage,
    updateLastMessage,
    sendMessage,
  }
}
