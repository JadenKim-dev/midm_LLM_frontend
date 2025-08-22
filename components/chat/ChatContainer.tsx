'use client'

import { useSession } from '@/hooks/useSession'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { SessionHeader } from './SessionHeader'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ChatContainerProps {
  className?: string
}

export function ChatContainer({ className }: ChatContainerProps) {
  const {
    session,
    messages,
    isLoading,
    error,
    createNewSession,
    addMessage,
    updateLastMessage,
    sendMessage,
  } = useSession()

  if (error) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Session Header */}
      <SessionHeader 
        session={session}
        onNewSession={createNewSession}
        isLoading={isLoading}
      />
      
      {/* Messages Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-2 sm:p-4">
        <MessageList 
          messages={messages}
          isLoading={isLoading}
          className="flex-1 overflow-hidden"
        />
        
        <MessageInput
          sessionId={session?.session_id}
          onMessageSent={addMessage}
          onStreamUpdate={updateLastMessage}
          onSendMessage={sendMessage}
          className="mt-2 sm:mt-4"
          disabled={!session || isLoading}
        />
      </div>
    </div>
  )
}
