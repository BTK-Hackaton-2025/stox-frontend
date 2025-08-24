import React, { useState } from "react";
import ChatSidebar from "@/components/ai/ChatSidebar";
import ChatInterface from "@/components/ai/ChatInterface";
import { aiService, type ChatMessage, type ChatConversation } from "@/services/ai";
import { useToast } from "@/hooks/use-toast";

// TODO: Replace with API call to fetch user's chat conversations
const mockConversations: ChatConversation[] = [];

export default function AI() {
  const [conversations, setConversations] = useState<ChatConversation[]>(mockConversations);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const currentConversation = conversations.find(c => c.id === activeConversation);

  const handleNewConversation = () => {
    const newId = Date.now().toString();
    const newConversation: ChatConversation = {
      id: newId,
      title: 'Yeni Konuşma',
      lastMessage: '',
      timestamp: 'Şimdi',
      category: 'general' as const,
      messages: [],
      messageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newId);
    return newId;
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversation === id) {
      setActiveConversation(null);
    }
  };

  const handleSendMessage = async (content: string) => {
    let conversationId = activeConversation;
    
    if (!conversationId) {
      const newId = Date.now().toString();
      const newConversation: ChatConversation = {
        id: newId,
        title: 'Yeni Konuşma',
        lastMessage: '',
        timestamp: 'Şimdi',
        category: 'general' as const,
        messages: [],
        messageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversation(newId);
      conversationId = newId;
    }

    const userMessage = aiService.createUserMessage(content);

    // Add user message immediately
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { 
            ...conv, 
            messages: [...conv.messages, userMessage],
            lastMessage: content,
            timestamp: 'Şimdi',
            messageCount: conv.messageCount + 1,
            updatedAt: new Date().toISOString()
          }
        : conv
    ));

    setIsLoading(true);

    try {
      // Get current conversation for context
      const currentConv = conversations.find(c => c.id === conversationId);
      const allMessages = currentConv ? [...currentConv.messages, userMessage] : [userMessage];

      // Send message to AI service
      const response = await aiService.sendConversationMessages(
        allMessages,
        conversationId
      );

      // Format AI response
      const aiMessage = aiService.formatChatMessage(response);

      // Add AI response
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              messages: [...conv.messages.filter(m => m.id !== userMessage.id), userMessage, aiMessage],
              lastMessage: aiMessage.content.substring(0, 50) + '...',
              timestamp: 'Şimdi',
              title: conv.title === 'Yeni Konuşma' 
                ? content.substring(0, 30) + (content.length > 30 ? '...' : '')
                : conv.title,
              messageCount: conv.messageCount + 1,
              updatedAt: new Date().toISOString()
            }
          : conv
      ));

    } catch (error) {
      console.error('AI chat failed:', error);
      toast({
        title: "AI Chat Hatası",
        description: error instanceof Error ? error.message : 'AI ile iletişim kurarken bir hata oluştu',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex bg-background rounded-lg border border-border/50 overflow-hidden">
      <ChatSidebar
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={setActiveConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
      />
      
      <div className="flex-1 flex flex-col">
        <ChatInterface
          messages={currentConversation?.messages || []}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          conversationTitle={currentConversation?.title || 'Yeni Konuşma'}
        />
      </div>
    </div>
  );
}