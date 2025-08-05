import React, { useState } from "react";
import ChatSidebar from "@/components/ai/ChatSidebar";
import ChatInterface from "@/components/ai/ChatInterface";

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
}

// Mock data for conversations
const mockConversations: ChatConversation[] = [
  {
    id: '1',
    title: 'Elektronik Market Analizi',
    lastMessage: 'Mevcut trendlere göre, elektronik piyasasında...',
    timestamp: '2 hours ago',
    category: 'market',
    messages: [
      {
        id: '1',
        content: 'Elektronik piyasasının mevcut trendlerini analiz edebilir misiniz?',
        role: 'user',
        timestamp: '2:30 PM'
      },
      {
        id: '2',
        content: 'Mevcut trendlere göre, elektronik piyasasında akıllı ev aletleri ve kullanıcı dostu teknolojilerde güçlü büyüme görülmektedir. Burada ana görüşler:\n\n• Akıllı ev aletleri: Yıllık 23% büyüme\n• Kullanıcı dostu teknolojiler: Yıllık 18% büyüme\n• Oyun aksesuarları: Yıllık 15% büyüme\n\nHerhangi bir kategoriye daha derinlemesine inmek ister misiniz?',
        role: 'assistant',
        timestamp: '2:31 PM',
        suggestions: ['Analyze smart home devices', 'Wearables market deep dive', 'Gaming trends analysis']
      }
    ]
  },
  {
    id: '2',
    title: 'Ürün Listeleme Optimizasyonu',
    lastMessage: 'Optimizasyon önerileri...',
    timestamp: '1 day ago',
    category: 'product',
    messages: [
      {
        id: '1',
        content: 'Kablosuz kulaklık listelemesini nasıl optimize edebilirim?',
        role: 'user',
        timestamp: 'Yesterday 3:15 PM'
      },
      {
        id: '2',
        content: 'Kablosuz kulaklık listelemesi için optimize edilmiş öneriler:\n\n**Başlık Optimizasyonu:**\n• Önemli özellikleri içerir: "Premium Bluetooth Kulaklık - Gürültü Yalıtımı, 30H Batarya"\n\n**Eklemek için Anahtar Kelimeler:**\n• bluetooth kulaklık\n• gürültü yalıtımı\n• kablosuz kulaklık\n• uzun batarya ömrü\n\n**Resimler:**\n• Kullanım görüntüleri ekleyin\n• Özellik çağrısı ekleyin\n• Boyut karşılaştırması gösterin\n\nMarketplace gereksinimlerinize yardımcı olmak ister misiniz?',
        role: 'assistant',
        timestamp: 'Yesterday 3:16 PM'
      }
    ]
  }
];

export default function AI() {
  const [conversations, setConversations] = useState<ChatConversation[]>(mockConversations);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentConversation = conversations.find(c => c.id === activeConversation);

  const handleNewConversation = () => {
    const newId = Date.now().toString();
    const newConversation: ChatConversation = {
      id: newId,
      title: 'Yeni Konuşma',
      lastMessage: '',
      timestamp: 'Şimdi',
      category: 'general',
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
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Add user message
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation 
        ? { 
            ...conv, 
            messages: [...conv.messages, userMessage],
            lastMessage: content,
            timestamp: 'Şimdi'
          }
        : conv
    ));

    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `"${content}" hakkında soruyorsunuz. Bu bir mock yanıtıdır. Gerçek uygulamada, bu AI arka ucunuzla bağlanır.

Burada size yardımcı olabilirim:
• Market analizi ve trendler
• Ürün optimizasyon stratejileri  
• Fiyat önerileri
• Performans bilgileri
• Çoklu platform listeleme yönetimi

Bu konulardan herhangi birini açıklayabilirim?`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['Market trendleri', 'Ürün optimizasyonu', 'Fiyat stratejisi']
      };

      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation 
          ? { 
              ...conv, 
              messages: [...conv.messages, aiMessage],
              lastMessage: aiMessage.content.substring(0, 50) + '...',
              timestamp: 'Şimdi',
              title: conv.title === 'Yeni Konuşma' 
                ? content.substring(0, 30) + (content.length > 30 ? '...' : '')
                : conv.title
            }
          : conv
      ));

      setIsLoading(false);
    }, 1500);
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