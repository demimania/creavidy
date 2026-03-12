'use client';

import { useState } from 'react';
import { Upload, Sparkles } from 'lucide-react';
import Image from 'next/image';

interface Character {
  id: string;
  name: string;
  avatar: string;
  image?: string;
}

interface CharacterSectionProps {
  characters: Character[];
  onUpload?: (characterId: string, file: File) => void;
  onGenerate?: (characterId: string) => void;
}

export function CharacterSection({
  characters,
  onUpload,
  onGenerate
}: CharacterSectionProps) {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedCharacterId && onUpload) {
      onUpload(selectedCharacterId, file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Character chips */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-400 min-w-[80px]">Karakter</span>

        <div className="flex gap-2 flex-wrap">
          {characters.map((character) => (
            <button
              key={character.id}
              onClick={() => setSelectedCharacterId(
                selectedCharacterId === character.id ? null : character.id
              )}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                selectedCharacterId === character.id
                  ? 'bg-cyan-500/20 ring-2 ring-cyan-500'
                  : 'bg-gray-800/50 hover:bg-gray-700/50'
              }`}
            >
              <Image
                src={character.avatar}
                alt={character.name}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="text-sm text-white">{character.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Expanded character image */}
      {selectedCharacter && (
        <div className="pl-[92px] space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Character image */}
          <div className="relative w-full max-w-md aspect-square bg-gray-800/50 rounded-lg overflow-hidden">
            {selectedCharacter.image ? (
              <Image
                src={selectedCharacter.image}
                alt={selectedCharacter.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <span>No image</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Upload className="w-4 h-4 text-gray-300" />
                <span className="text-sm text-gray-300">Upload</span>
              </div>
            </label>

            <button
              onClick={() => selectedCharacterId && onGenerate?.(selectedCharacterId)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm text-white">Generate</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
