import React, { useState, useEffect } from "react";
import { Heart, Star, Cloud } from "lucide-react";
import { CHARACTERS, MENTAL_HEALTH_INFO } from "./constants";
import { Character, ChatSession, Message } from "./types";
import { CharacterCard } from "./components/CharacterCard";
import { ChatInterface } from "./components/ChatInterface";
import { BubbleGame } from "./components/BubbleGame";
import {
  saveChatToStorage,
  loadChatsFromStorage,
} from "./services/chatService";

const App: React.FC = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const [allSessions, setAllSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    const storedSessions = loadChatsFromStorage();
    setAllSessions(storedSessions);
  }, []);

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    const charSessions = allSessions.filter(
      (s) => s.characterId === character.id
    );

    if (charSessions.length > 0) {
      const sorted = [...charSessions].sort(
        (a, b) => b.lastUpdated - a.lastUpdated
      );
      setActiveSessionId(sorted[0].id);
    } else {
      setActiveSessionId(Date.now().toString());
    }
  };

  const handleBackToHome = () => {
    setSelectedCharacter(null);
    setActiveSessionId(null);
  };

  const handleCreateNewSession = () => {
    const newId = Date.now().toString();
    setActiveSessionId(newId);
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const handleUpdateSession = (sessionId: string, messages: Message[]) => {
    if (!selectedCharacter) return;

    setAllSessions((prev) => {
      const existingIndex = prev.findIndex((s) => s.id === sessionId);
      const newSessions = [...prev];

      if (existingIndex >= 0) {
        newSessions[existingIndex] = {
          ...newSessions[existingIndex],
          messages,
          lastUpdated: Date.now(),
        };
      } else {
        newSessions.push({
          id: sessionId,
          characterId: selectedCharacter.id,
          messages,
          lastUpdated: Date.now(),
        });
      }

      saveChatToStorage(newSessions);
      return newSessions;
    });
  };

  const getActiveMessages = (): Message[] => {
    if (!activeSessionId) return [];
    const session = allSessions.find((s) => s.id === activeSessionId);
    return session ? session.messages : [];
  };

  const getCharacterHistory = (): ChatSession[] => {
    if (!selectedCharacter) return [];
    return allSessions
      .filter((s) => s.characterId === selectedCharacter.id)
      .sort((a, b) => b.lastUpdated - a.lastUpdated);
  };

  if (selectedCharacter && activeSessionId) {
    return (
      <ChatInterface
        character={selectedCharacter}
        onBack={handleBackToHome}
        currentSessionId={activeSessionId}
        sessions={getCharacterHistory()}
        initialMessages={getActiveMessages()}
        onUpdateSession={handleUpdateSession}
        onNewSession={handleCreateNewSession}
        onSelectSession={handleSelectSession}
      />
    );
  }

  return (
    <div className="min-h-screen bg-sky-200 flex flex-col relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      {/* Moving Clouds */}
      <div
        className="absolute top-10 left-0 text-white/40 animate-move-clouds opacity-80"
        style={{ animationDuration: "45s" }}
      >
        <Cloud size={140} fill="currentColor" />
      </div>
      <div
        className="absolute top-32 left-0 text-white/30 animate-move-clouds opacity-60"
        style={{ animationDuration: "65s", animationDelay: "-20s" }}
      >
        <Cloud size={100} fill="currentColor" />
      </div>
      <div
        className="absolute bottom-32 left-0 text-white/50 animate-move-clouds opacity-90"
        style={{ animationDuration: "55s", animationDelay: "-10s" }}
      >
        <Cloud size={180} fill="currentColor" />
      </div>

      {/* Sun with rotating rays */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-yellow-300 rounded-full blur-2xl opacity-50 animate-pulse"></div>
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] border-[50px] border-dashed border-white/10 rounded-full animate-spin-slow"></div>

      {/* Hot Air Balloon Decoration */}
      <div className="absolute top-20 left-20 animate-float-slow hidden lg:block opacity-80 hover:scale-110 transition-transform cursor-pointer">
        <div className="w-16 h-20 bg-red-400 rounded-t-full rounded-b-md relative shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-orange-300 to-red-400 rounded-t-full rounded-b-md opacity-80"></div>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-brown-600 rounded-sm bg-yellow-700"></div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 z-10 relative flex flex-col justify-center items-center">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto items-center gap-12 mb-12">
          {/* Title Area */}
          <div className="flex-1 text-center lg:text-right order-2 lg:order-2 animate-pop-in">
            <h1 className="text-7xl md:text-8xl font-bold text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.1)] leading-tight transform -rotate-2 tracking-tight">
              My Feelings
              <br />
              <span className="text-yellow-300 inline-block transform rotate-2">
                Buddy
              </span>
            </h1>
            <div className="mt-4 flex justify-center lg:justify-end gap-3">
              <Star
                className="text-yellow-400 fill-current animate-spin-slow"
                size={42}
              />
              <Star
                className="text-pink-400 fill-current animate-bounce"
                size={32}
              />
              <Star
                className="text-green-400 fill-current animate-pulse"
                size={38}
              />
            </div>
          </div>

          {/* Info Bubble */}
          <div className="flex-1 order-1 lg:order-1 animate-slide-up bg-white/95 backdrop-blur-sm rounded-[3rem] p-10 shadow-2xl border-8 border-white transform rotate-1 hover:rotate-0 transition-transform duration-500 relative group">
            <div className="absolute -top-8 -left-8 bg-pink-400 text-white p-4 rounded-full shadow-lg transform -rotate-12 group-hover:rotate-12 transition-transform duration-300">
              <Heart fill="currentColor" size={40} />
            </div>
            <p className="text-2xl md:text-3xl text-gray-600 font-medium text-center leading-relaxed font-sans">
              {MENTAL_HEALTH_INFO}
            </p>
          </div>
        </div>

        {/* Puzzle / Mini-Game Section */}
        <div
          className="w-full max-w-4xl mb-16 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <BubbleGame />
        </div>

        {/* Character Selection */}
        <div
          className="w-full max-w-5xl animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="text-center mb-10">
            <span className="bg-white text-fun-blue px-10 py-4 rounded-full text-2xl font-bold shadow-lg inline-block transform hover:scale-105 hover:rotate-1 transition-all border-4 border-white/50">
              Who would you like to share your feelings with?
            </span>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-12 p-4">
            <CharacterCard
              character={CHARACTERS.tom}
              onClick={handleCharacterSelect}
            />

            <CharacterCard
              character={CHARACTERS.jerry}
              onClick={handleCharacterSelect}
            />
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-white/90 text-lg font-bold relative z-10">
        <p className="drop-shadow-md">
          Made to prioritize your Mental Health 💖
        </p>
      </footer>
    </div>
  );
};

export default App;
