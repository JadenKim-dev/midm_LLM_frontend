'use client'

import { useState } from 'react'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { DocumentManager } from '@/components/documents/DocumentManager'
import PresentationContainer from '@/components/presentation/PresentationContainer'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SessionInfo } from '@/components/SessionInfo'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { IOSInstallPrompt } from '@/components/pwa/IOSInstallPrompt'
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator'
import { useSession } from '@/hooks/useSession'
import { useMobile } from '@/hooks/useMobile'
import { TabType } from '@/lib/types'

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<TabType>('chat')
  const { session, createNewSession, clearSession } = useSession()
  const { isMobile, isSidebarOpen, toggleSidebar, closeSidebar } = useMobile()

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    if (isMobile) {
      closeSidebar()
    }
  }

  const handleNewChat = () => {
    createNewSession()
    setActiveTab('chat')
    if (isMobile) {
      closeSidebar()
    }
  }

  const handleClearSession = () => {
    clearSession()
    setActiveTab('chat')
    if (isMobile) {
      closeSidebar()
    }
  }

  return (
    <div className="relative flex min-h-screen bg-background overflow-x-hidden">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        className={`
          ${isMobile 
            ? `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              } md:relative md:translate-x-0 md:z-auto`
            : 'w-64 border-r bg-muted/50 min-h-screen sticky top-0'
          }
          flex border-r bg-muted/50 min-h-screen
        `}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNewChat={handleNewChat}
        onClearSession={handleClearSession}
        isMobile={isMobile}
        onClose={closeSidebar}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header */}
        <Header 
          onMenuClick={toggleSidebar}
          isMobile={isMobile}
        />
        
        {/* Dynamic Content based on active tab */}
        <div className="flex-1 overflow-x-hidden">
          {activeTab === 'chat' ? (
            <div className="h-full flex flex-col">
              <div className="p-3 sm:p-4 pb-0">
                <SessionInfo />
              </div>
              <ChatContainer className="flex-1" />
            </div>
          ) : activeTab === 'documents' ? (
            <div className="h-full overflow-auto">
              <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
                <SessionInfo />
                <DocumentManager 
                  sessionId={session?.session_id || ''}
                />
              </div>
            </div>
          ) : activeTab === 'presentations' ? (
            <div className="h-full overflow-auto">
              <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6">
                <SessionInfo />
                <PresentationContainer 
                  sessionId={session?.session_id || ''}
                />
              </div>
            </div>
          ) : null}
        </div>
        
        {/* Footer */}
        <Footer />
      </div>

      {/* PWA Components */}
      <InstallPrompt />
      <IOSInstallPrompt />
      <OfflineIndicator />
    </div>
  )
}
