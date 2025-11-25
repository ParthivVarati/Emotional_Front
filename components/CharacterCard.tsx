import React from "react";
import { MessageCircle } from "lucide-react";
import { Character } from "../types";

interface CharacterCardProps {
  character: Character;
  onClick: (character: Character) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onClick,
}) => {
  const isTom = character.id === "tom";
  const borderColor = isTom ? "border-blue-300" : "border-orange-300";
  const shadowColor = isTom ? "shadow-blue-200" : "shadow-orange-200";
  const buttonColor = isTom
    ? "bg-blue-500 hover:bg-blue-600"
    : "bg-orange-500 hover:bg-orange-600";

  return (
    <div
      onClick={() => onClick(character)}
      className={`
        relative group cursor-pointer w-full md:w-80 
        transform transition-all duration-300 hover:-translate-y-6 hover:rotate-1
      `}
    >
      {/* Card Body */}
      <div
        className={`
        bg-white rounded-[2.5rem] overflow-hidden border-8 ${borderColor}
        shadow-[0_15px_0_0_rgba(0,0,0,0.1)] hover:shadow-[0_25px_0_0_rgba(0,0,0,0.15)]
        flex flex-col h-[480px] transition-all duration-300
      `}
      >
        {/* Image Area with Zoom Effect */}
        <div
          className={`h-[55%] overflow-hidden relative ${character.themeColor} bg-opacity-20`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Decorative Background Circle */}
            <div
              className={`w-56 h-56 rounded-full ${character.themeColor} opacity-20 absolute scale-0 group-hover:scale-150 transition-transform duration-700`}
            ></div>
          </div>
          <img
            src={character.imageUrl}
            alt={character.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2"
          />

          {/* Fun Badge */}
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 flex flex-col items-center text-center bg-white relative">
          <h3 className="text-5xl font-bold mb-2 text-gray-800 group-hover:animate-bounce-slight tracking-tight">
            {character.name}
          </h3>

          <p className="text-gray-500 text-lg leading-snug mb-6 font-medium">
            {character.description}
          </p>

          <button
            className={`
            mt-auto flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-xl shadow-xl
            transform transition-all active:scale-95 group-hover:scale-105 group-hover:-rotate-1
            ${buttonColor}
          `}
          >
            <MessageCircle
              size={26}
              fill="currentColor"
              className="text-white/50"
            />
            Let's Play!
          </button>
        </div>
      </div>

      {/* Decorative dots behind card */}
      <div
        className={`absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-[2.5rem] border-4 border-dashed ${
          isTom ? "border-blue-200" : "border-orange-200"
        } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      ></div>
    </div>
  );
};
