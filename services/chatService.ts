import { Message, ChatSession, CharacterId } from '../types';
import { LOCAL_STORAGE_KEY } from '../constants';

export const saveChatToStorage = (sessions: ChatSession[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Failed to save to local storage", error);
  }
};

export const loadChatsFromStorage = (): ChatSession[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load from local storage", error);
    return [];
  }
};

export const sendMessageToBackend = async (endpoint: string, message: string): Promise<string> => {
  try {
    console.log(`[ChatService] Sending POST to ${endpoint} with message:`, message);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ChatService] Server responded with error ${response.status}:`, errorText);
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[ChatService] Received response data:", data);

    // Priority 1: Check for 'reply' (matches your provided code snippet)
    if (data && typeof data.reply === 'string') {
        return data.reply;
    }

    // Priority 2: Check for 'response' (common alternative)
    if (data && typeof data.response === 'string') {
        return data.response;
    }

    // Priority 3: Check for 'message' (common alternative)
    if (data && typeof data.message === 'string') {
        return data.message;
    }

    // Priority 4: If data itself is a string, return it
    if (typeof data === 'string') {
        return data;
    }

    console.warn("[ChatService] Could not find 'reply', 'response', or 'message' in response:", data);
    return "I heard you, but I'm not sure what to say back! (Response format error)";

  } catch (error) {
    console.error("[ChatService] Connection Error:", error);
    throw error;
  }
};