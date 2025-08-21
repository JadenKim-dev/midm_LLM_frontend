import { ChatContainer } from '@/components/chat/ChatContainer'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function ChatPage() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar className="flex w-64 border-r bg-muted/50" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />
        
        {/* Chat Container */}
        <ChatContainer className="flex-1" />
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
