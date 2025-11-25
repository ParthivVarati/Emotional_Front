import { Character } from './types';

export const CHARACTERS: Record<string, Character> = {
  tom: {
    id: 'tom',
    name: 'Tom',
    imageUrl: 'https://i.pinimg.com/736x/ac/4e/5b/ac4e5b1705fc23d31ff6b161fd325844.jpg', 
    apiEndpoint: 'http://127.0.0.1:5000/chat/tom',
    themeColor: 'bg-tom-DEFAULT',
    description: 'Direct, strategic, and focused — Tom cuts through the noise and gets you moving.',
  },
  jerry: {
    id: 'jerry',
    name: 'Jerry',
    imageUrl: 'https://i.pinimg.com/originals/a0/8c/6c/a08c6cbe7608eb401f0680b4373d6bc6.gif', 
    apiEndpoint: 'http://127.0.0.1:5000/chat/jerry',
    themeColor: 'bg-jerry-DEFAULT',
    description: 'Gentle, patient, and soothing — Jerry is always here to hold space for you, sweetheart.',
  },
};

export const MENTAL_HEALTH_INFO = `
Hi there! Did you know your feelings are like the weather? Sometimes it's sunny, and sometimes it rains. 
And that's okay! Talking about your feelings is a super power that makes you feel happy and strong.
`;

export const LOCAL_STORAGE_KEY = 'emotional_companion_chats_kids_v1';