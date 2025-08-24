import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Maximize2, Minimize2, Bot } from "lucide-react";
import ChatSidebar from "./ChatSidebar";
import ChatInterface from "./ChatInterface";
import { aiService, type ChatMessage } from "@/services/ai";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  suggestions?: string[];
}

interface ChatConversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  category: 'market' | 'product' | 'general';
  messages: Message[];
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for conversations
const mockConversations: ChatConversation[] = [
  {
    id: '1',
    title: 'Elektronik Ürünler için Market Analizi',
    lastMessage: 'Güncel trendlere göre, elektronik piyasası güçlü bir şekilde büyümekte...',
    timestamp: '2 saat önce',
    category: 'market',
    messageCount: 2,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    messages: [
      {
        id: '1',
        content: 'Elektronik piyasasının güncel trendlerini analiz edebilir misiniz?',
        role: 'user',
        timestamp: '2:30 PM'
      },
      {
        id: '2',
        content: 'Güncel trendlere göre, elektronik piyasasında akıllı ev cihazları ve kullanıcı dostu teknolojiler güçlü bir şekilde büyümekte. Burada ana görüşler:\n\n• Akıllı ev cihazları: %23 Yıllık Büyüme\n• Kullanıcı dostu teknolojiler: %18 Yıllık Büyüme\n• Oyun cihazları: %15 Yıllık Büyüme\n\nBelirli bir kategoriye daha derinlemesine inmek ister misiniz?',
        role: 'assistant',
        timestamp: '2:31 PM',
        suggestions: ['Akıllı ev cihazlarını analiz et', 'Kullanıcı dostu teknolojileri derinlemesine incele', 'Oyun cihazları trendlerini analiz et']
      }
    ]
  },
  {
    id: '2',
    title: 'Ürün Listesi Optimizasyonu',
    lastMessage: 'Burada size yardımcı olabilirim...',
    timestamp: '1 gün önce',
    category: 'product',
    messageCount: 2,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    messages: [
      {
        id: '1',
        content: 'Nasıl yapabilirim? Burada size yardımcı olabilirim...',
        role: 'user',
        timestamp: 'Yesterday 3:15 PM'
      },
      {
        id: '2',
        content: 'Burada size yardımcı olabilirim:\n\n**Başlık Optimizasyonu:**\n• Önemli özellikleri içerir: "Premium Bluetooth Kulaklık - Gürültü Yalıtımı, 30H Batarya"\n\n**Eklemek için Anahtar Kelimeler:**\n• bluetooth kulaklık\n• gürültü yalıtımı\n• kablosuz kulaklık\n• uzun batarya ömrü\n\n**Resimler:**\n• Kullanım görüntüleri ekleyin\n• Özellik çağrısı ekleyin\n• Boyut karşılaştırması gösterin\n\nMarketplace gereksinimlerinize yardımcı olmak ister misiniz?',
        role: 'assistant',
        timestamp: 'Yesterday 3:16 PM'
      }
    ]
  }
];

export default function AIPanel({ isOpen, onClose }: AIPanelProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>(mockConversations);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
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
      category: 'general',
      messageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newId);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversation === id) {
      setActiveConversation(null);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeConversation) {
      handleNewConversation();
      // Wait a bit for the new conversation to be set
      setTimeout(() => handleSendMessage(content), 100);
      return;
    }

    const userMessage = aiService.createUserMessage(content);

    // Add user message immediately
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation 
        ? { 
            ...conv, 
            messages: [...conv.messages, userMessage],
            lastMessage: content,
            timestamp: 'Şimdi',
            messageCount: conv.messages.length + 1,
            updatedAt: new Date().toISOString()
          }
        : conv
    ));

    setIsLoading(true);

    try {
      // Get current conversation for context
      const currentConv = conversations.find(c => c.id === activeConversation);
      const allMessages = currentConv ? [...currentConv.messages, userMessage] : [userMessage];

      // Send message to AI service
      const response = await aiService.sendConversationMessages(
        allMessages,
        activeConversation
      );

      // Format AI response
      const aiMessage = aiService.formatChatMessage(response);

      // Add AI response
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation 
          ? { 
              ...conv, 
              messages: [...conv.messages.filter(m => m.id !== userMessage.id), userMessage, aiMessage],
              lastMessage: aiMessage.content.substring(0, 50) + '...',
              timestamp: 'Şimdi',
              messageCount: conv.messages.length + 1,
              title: conv.title === 'Yeni Konuşma' 
                ? content.substring(0, 30) + (content.length > 30 ? '...' : '')
                : conv.title,
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

  if (!isOpen) return null;

  const panelClasses = isMaximized 
    ? "fixed inset-0 z-50" 
    : "fixed top-4 right-4 bottom-4 left-4 md:left-auto md:w-[900px] z-50";

  return (
    <div className={panelClasses}>
      <Card className="w-full h-full shadow-2xl border-border/50 bg-background/95 backdrop-blur-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/90">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold">Stox AI</h2>
              <p className="text-xs text-muted-foreground">Kişisel Çoklu Market AI Aracı</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMaximized(!isMaximized)}
              className="h-8 w-8 p-0"
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100%-73px)]">
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
      </Card>
    </div>
  );
}