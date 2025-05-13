
import React, { useEffect, useRef, useState } from 'react';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';
import WelcomeMessage from '@/components/WelcomeMessage';
import { Button } from '@/components/ui/button';
import { Message } from '@/types';
import { predictDisease, getWeatherData } from '@/services/api';
import * as SessionStorage from '@/utils/sessionStorage';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

interface LocationFormValues {
  location: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const form = useForm<LocationFormValues>({
    defaultValues: {
      location: ''
    }
  });

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

      // Create location request system message
      const locationRequestMessage: Message = {
        id: SessionStorage.generateId(),
        role: 'system',
        content: `Kết quả chẩn đoán: ${response.disease_name}`,
        timestamp: Date.now(),
        diseaseInfo: response,
        isLocationRequest: true
      };

      // Update UI with location request message
      setMessages(prev => [...prev, locationRequestMessage]);
      
      // Save to session storage
      SessionStorage.addMessage(sessionId, locationRequestMessage);
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

  const handleRequestLocation = (messageId: string) => {
    setCurrentMessageId(messageId);
    setLocationDialogOpen(true);
  };

  const handleLocationSubmit = async (values: LocationFormValues) => {
    setLocationDialogOpen(false);
    
    if (!values.location.trim()) return;
    
    // Add user message with location
    const userLocationMessage: Message = {
      id: SessionStorage.generateId(),
      role: 'user',
      content: `Vị trí của tôi: ${values.location}`,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userLocationMessage]);
    SessionStorage.addMessage(sessionId, userLocationMessage);

    // Show loading
    setIsLoading(true);

    try {
      // Get weather data
      const weatherData = await getWeatherData(values.location);
      
      // Find the message to update
      const updatedMessages = messages.map(msg => {
        if (msg.id === currentMessageId) {
          return {
            ...msg,
            weatherInfo: weatherData,
            isLocationRequest: false
          };
        }
        return msg;
      });

      // Update messages
      setMessages(updatedMessages);
      
      // Update in session storage
      updatedMessages.forEach(msg => {
        if (msg.id === currentMessageId) {
          SessionStorage.updateMessage(sessionId, msg);
        }
      });

      toast({
        title: "Thông tin thời tiết",
        description: `Đã cập nhật thông tin thời tiết cho ${weatherData.location}`,
      });
    } catch (error) {
      console.error('Error getting weather data:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lấy thông tin thời tiết. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      form.reset();
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
                <ChatMessage 
                  key={message.id} 
                  message={message}
                  onRequestLocation={handleRequestLocation} 
                />
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

      <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập vị trí của bạn</DialogTitle>
            <DialogDescription>
              Vui lòng cung cấp vị trí để nhận thông tin thời tiết và khuyến nghị điều trị phù hợp
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleLocationSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vị trí (thành phố hoặc tỉnh)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh, Đà Nẵng..." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocationDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit">Xác nhận</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
