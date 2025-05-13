
export interface Message {
  id: string;
  role: 'user' | 'system';
  content: string;
  image?: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}
