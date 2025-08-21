'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient, Session, Message } from '@/lib/api'

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

  const updateLastMessage = useCallback((content: string) => {
    setMessages(prev => {
      const newMessages = [...prev]
      if (newMessages.length > 0) {
        const lastMessage = newMessages[newMessages.length - 1]
        if (lastMessage.role === 'assistant') {
          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            content: content,
          }
        }
      }
      return newMessages
    })
  }, [])

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
  }
}
