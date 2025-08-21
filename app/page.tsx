'use client'

import { useState } from 'react'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { DocumentManager } from '@/components/documents/DocumentManager'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useSession } from '@/hooks/useSession'
import { TabType } from '@/lib/types'

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<TabType>('chat')
  const { session, createNewSession } = useSession()

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
  }

  const handleNewChat = () => {
    createNewSession()
    setActiveTab('chat')
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        className="flex w-64 border-r bg-muted/50"
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNewChat={handleNewChat}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />
        
        {/* Dynamic Content based on active tab */}
        <div className="flex-1">
          {activeTab === 'chat' ? (
            <ChatContainer className="h-full" />
          ) : (
            <div className="h-full overflow-auto">
              <div className="max-w-4xl mx-auto p-6">
                <DocumentManager 
                  sessionId={session?.session_id || ''}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
