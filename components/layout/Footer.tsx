'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api'

export function Footer() {
  const [healthStatus, setHealthStatus] = useState<{
    status: string
    llm_server_available: boolean
    database_connected: boolean
  } | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await apiClient.checkHealth()
        setHealthStatus(health)
      } catch (error) {
        console.error('Health check failed:', error)
        setHealthStatus({
          status: 'unhealthy',
          llm_server_available: false,
          database_connected: false,
        })
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-10 items-center justify-between px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>© 2024 AI Chatbot</span>
          <span>•</span>
          <span>Powered by Next.js & React</span>
        </div>

        <div className="flex items-center gap-2">
          {healthStatus && (
            <>
              <Badge 
                variant={healthStatus.status === 'healthy' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {healthStatus.status === 'healthy' ? '🟢' : '🔴'} API
              </Badge>
              
              <Badge 
                variant={healthStatus.llm_server_available ? 'default' : 'destructive'}
                className="text-xs"
              >
                {healthStatus.llm_server_available ? '🟢' : '🔴'} LLM
              </Badge>
              
              <Badge 
                variant={healthStatus.database_connected ? 'default' : 'destructive'}
                className="text-xs"
              >
                {healthStatus.database_connected ? '🟢' : '🔴'} DB
              </Badge>
            </>
          )}
        </div>
      </div>
    </footer>
  )
}
