export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  characterId: CharacterId;
  messages: Message[];
  lastUpdated: number;
}

export type CharacterId = 'tom' | 'jerry';

export interface Character {
  id: CharacterId;
  name: string;
  imageUrl: string;
  apiEndpoint: string;
  themeColor: string;
  description: string;
}