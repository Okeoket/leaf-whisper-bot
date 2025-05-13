
import React, { useEffect, useRef, useState } from 'react';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';
import WelcomeMessage from '@/components/WelcomeMessage';
import { Button } from '@/components/ui/button';
import { Message } from '@/types';
import { predictDisease } from '@/services/api';
import * as SessionStorage from '@/utils/sessionStorage';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize session from localStorage
  useEffect(() => {
    try {
      const currentSession = SessionStorage.getCurrentSession();
      setSessionId(currentSession.id);
      setMessages(currentSession.messages);
    } catch (error) {
      console.error('Error loading session:', error);
      // Create new session if there's an error
      const newSession = SessionStorage.createSession();
      setSessionId(newSession.id);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text: string, image: File | null) => {
    if (!text.trim() && !image) return;

    let imageUrl = '';
    
    // If there's an image, create a local URL for display
    if (image) {
      imageUrl = URL.createObjectURL(image);
    }

    // Create and add user message
    const userMessage: Message = {
      id: SessionStorage.generateId(),
      role: 'user',
      content: text.trim(),
      ...(imageUrl && { image: imageUrl }),
      timestamp: Date.now()
    };

    // Update UI
    setMessages(prev => [...prev, userMessage]);
    
    // Save to session storage
    SessionStorage.addMessage(sessionId, userMessage);

    // Set loading state
    setIsLoading(true);

    try {
      // Call API
      const response = await predictDisease({
        text: text.trim() || undefined,
        image: image || undefined
      });

      // Create system response
      const systemMessage: Message = {
        id: SessionStorage.generateId(),
        role: 'system',
        content: `Kết quả chẩn đoán: ${response.disease_name}`,
        timestamp: Date.now()
      };

      // Update UI with system response
      setMessages(prev => [...prev, systemMessage]);
      
      // Save to session storage
      SessionStorage.addMessage(sessionId, systemMessage);
    } catch (error) {
      console.error('Error getting prediction:', error);
      toast({
        title: "Lỗi",
        description: "Không thể nhận chẩn đoán. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    // Create new session
    const newSession = SessionStorage.createSession();
    setSessionId(newSession.id);
    setMessages([]);
    
    toast({
      title: "Đã xóa cuộc trò chuyện",
      description: "Bắt đầu cuộc hội thoại mới",
    });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ChatHeader />
      
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <WelcomeMessage />
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearChat}
                  className="text-xs bg-secondary/50 hover:bg-secondary border-border/50"
                >
                  Cuộc trò chuyện mới
                </Button>
              </div>
              
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Index;
