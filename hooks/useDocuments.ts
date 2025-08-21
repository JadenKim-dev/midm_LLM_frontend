'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { Document, DocumentUploadResponse } from '@/lib/types'

interface UseDocumentsOptions {
  sessionId?: string
  autoLoad?: boolean
}

export function useDocuments(options: UseDocumentsOptions = {}) {
  const { sessionId, autoLoad = true } = options

  // State
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [documentCount, setDocumentCount] = useState(0)

  // Cache for session documents to avoid unnecessary re-fetches
  const [cache, setCache] = useState<Map<string, { documents: Document[], timestamp: number }>>(new Map())
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Load documents for a session
  const loadDocuments = useCallback(async (targetSessionId?: string, force = false) => {
    const sessionToLoad = targetSessionId || sessionId
    if (!sessionToLoad) {
      setDocuments([])
      setDocumentCount(0)
      return
    }

    // Check cache first
    const cached = cache.get(sessionToLoad)
    const now = Date.now()
    
    if (!force && cached && (now - cached.timestamp) < CACHE_DURATION) {
      setDocuments(cached.documents)
      setDocumentCount(cached.documents.length)
      return cached.documents
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.getSessionDocuments(sessionToLoad)
      const docs = response.documents || []
      
      setDocuments(docs)
      setDocumentCount(docs.length)
      
      // Update cache
      setCache(prev => new Map(prev).set(sessionToLoad, {
        documents: docs,
        timestamp: now
      }))

      return docs
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load documents'
      setError(errorMessage)
      console.error('Error loading documents:', err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, cache])

  // Upload document
  const uploadDocument = useCallback(async (
    file: File, 
    targetSessionId?: string
  ): Promise<DocumentUploadResponse | null> => {
    const sessionToUse = targetSessionId || sessionId
    if (!sessionToUse) {
      throw new Error('No session ID provided')
    }

    setIsUploading(true)
    setError(null)

    try {
      const response = await apiClient.uploadDocument(file, sessionToUse)
      
      // Invalidate cache and reload documents
      setCache(prev => {
        const newCache = new Map(prev)
        newCache.delete(sessionToUse)
        return newCache
      })
      
      await loadDocuments(sessionToUse, true)
      
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document'
      setError(errorMessage)
      throw err
    } finally {
      setIsUploading(false)
    }
  }, [sessionId, loadDocuments])

  // Delete document
  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    if (!sessionId) {
      throw new Error('No session ID available')
    }

    setError(null)

    try {
      await apiClient.deleteDocument(documentId)
      
      // Update local state immediately
      setDocuments(prev => prev.filter(doc => doc.document_id !== documentId))
      setDocumentCount(prev => Math.max(0, prev - 1))
      
      // Invalidate cache
      setCache(prev => {
        const newCache = new Map(prev)
        newCache.delete(sessionId)
        return newCache
      })
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document'
      setError(errorMessage)
      throw err
    }
  }, [sessionId])

  // Get document by ID
  const getDocument = useCallback((documentId: string): Document | undefined => {
    return documents.find(doc => doc.document_id === documentId)
  }, [documents])

  // Refresh documents (force reload)
  const refreshDocuments = useCallback(async () => {
    if (sessionId) {
      await loadDocuments(sessionId, true)
    }
  }, [sessionId, loadDocuments])

  // Clear cache for specific session
  const clearCache = useCallback((targetSessionId?: string) => {
    const sessionToClear = targetSessionId || sessionId
    if (sessionToClear) {
      setCache(prev => {
        const newCache = new Map(prev)
        newCache.delete(sessionToClear)
        return newCache
      })
    }
  }, [sessionId])

  // Clear all cache
  const clearAllCache = useCallback(() => {
    setCache(new Map())
  }, [])

  // Auto-load documents when sessionId changes
  useEffect(() => {
    if (autoLoad && sessionId) {
      loadDocuments()
    } else if (!sessionId) {
      setDocuments([])
      setDocumentCount(0)
      setError(null)
    }
  }, [sessionId, autoLoad, loadDocuments])

  // Cleanup cache periodically
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now()
      setCache(prev => {
        const newCache = new Map()
        for (const [key, value] of prev.entries()) {
          if ((now - value.timestamp) < CACHE_DURATION) {
            newCache.set(key, value)
          }
        }
        return newCache
      })
    }

    const interval = setInterval(cleanup, CACHE_DURATION)
    return () => clearInterval(interval)
  }, [])

  return {
    // State
    documents,
    documentCount,
    isLoading,
    isUploading,
    error,
    
    // Actions
    loadDocuments,
    uploadDocument,
    deleteDocument,
    refreshDocuments,
    getDocument,
    
    // Cache management
    clearCache,
    clearAllCache,
    
    // Computed values
    hasDocuments: documentCount > 0,
    isEmpty: documentCount === 0 && !isLoading,
  }
}