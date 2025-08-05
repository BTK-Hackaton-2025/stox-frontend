import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Maximize2, Minimize2, Bot } from "lucide-react";
import ChatSidebar from "./ChatSidebar";
import ChatInterface from "./ChatInterface";

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

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for conversations
const mockConversations: ChatConversation[] = [
  {
    id: '1',
    title: 'Market Analysis for Electronics',
    lastMessage: 'Based on current trends, the electronics market shows...',
    timestamp: '2 hours ago',
    category: 'market',
    messages: [
      {
        id: '1',
        content: 'Can you analyze the current market trends for electronics?',
        role: 'user',
        timestamp: '2:30 PM'
      },
      {
        id: '2',
        content: 'Based on current trends, the electronics market shows strong growth in smart home devices and wearable technology. Here are the key insights:\n\n• Smart home devices: 23% growth YoY\n• Wearables: 18% growth YoY\n• Gaming peripherals: 15% growth YoY\n\nWould you like me to dive deeper into any specific category?',
        role: 'assistant',
        timestamp: '2:31 PM',
        suggestions: ['Analyze smart home devices', 'Wearables market deep dive', 'Gaming trends analysis']
      }
    ]
  },
  {
    id: '2',
    title: 'Product Listing Optimization',
    lastMessage: 'Here are the optimization recommendations...',
    timestamp: '1 day ago',
    category: 'product',
    messages: [
      {
        id: '1',
        content: 'How can I optimize my wireless headphones listing?',
        role: 'user',
        timestamp: 'Yesterday 3:15 PM'
      },
      {
        id: '2',
        content: 'Here are the optimization recommendations for your wireless headphones listing:\n\n**Title Optimization:**\n• Include key features: "Premium Wireless Bluetooth Headphones - Noise Cancelling, 30H Battery Life"\n\n**Keywords to add:**\n• bluetooth headphones\n• noise cancelling\n• wireless earbuds\n• long battery life\n\n**Images:**\n• Add lifestyle images showing usage\n• Include feature callouts\n• Show size comparison\n\nWould you like me to help with specific marketplace requirements?',
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

  const currentConversation = conversations.find(c => c.id === activeConversation);

  const handleNewConversation = () => {
    const newId = Date.now().toString();
    const newConversation: ChatConversation = {
      id: newId,
      title: 'New Conversation',
      lastMessage: '',
      timestamp: 'Just now',
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
            timestamp: 'Just now'
          }
        : conv
    ));

    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about "${content}". This is a mock response from Stox AI. In the actual implementation, this would be connected to your AI backend service.

Here's what I can help you with:
• Market analysis and trends
• Product optimization strategies  
• Pricing recommendations
• Performance insights
• Cross-platform listing management

Would you like me to elaborate on any of these topics?`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['Market trends', 'Product optimization', 'Pricing strategy']
      };

      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation 
          ? { 
              ...conv, 
              messages: [...conv.messages, aiMessage],
              lastMessage: aiMessage.content.substring(0, 50) + '...',
              timestamp: 'Just now',
              title: conv.title === 'New Conversation' 
                ? content.substring(0, 30) + (content.length > 30 ? '...' : '')
                : conv.title
            }
          : conv
      ));

      setIsLoading(false);
    }, 1500);
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
              <p className="text-xs text-muted-foreground">Personal Multi-Market AI Agent</p>
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
              conversationTitle={currentConversation?.title || 'New Conversation'}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}