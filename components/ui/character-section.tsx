'use client';

import { useState } from 'react';
import { Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CharacterSectionProps {
  characterNames: string[];
  characterImages: Record<string, string>;
  onUpload: (name: string, file: File) => void;
  onGenerate: (name: string) => void;
  onAddCharacter?: (name: string) => void;
}

export function CharacterSection({
  characterNames,
  characterImages,
  onUpload,
  onGenerate,
  onAddCharacter
}: CharacterSectionProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedCharacter) {
      onUpload(selectedCharacter, file);
    }
  };

  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[11px] text-zinc-400 w-24 pt-1.5">Character</span>

      <div className="flex-1 space-y-3">
        {/* Character chips */}
        <div className="flex gap-2 flex-wrap">
          {characterNames.length > 0 ? (
            characterNames.map((name) => (
              <button
                key={name}
                onClick={() => setSelectedCharacter(selectedCharacter === name ? null : name)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  selectedCharacter === name
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-transparent hover:border-white/10'
                }`}
              >
                {characterImages[name] ? (
                  <img
                    src={characterImages[name]}
                    alt={name}
                    className="w-5 h-5 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <span className="text-sm">👤</span>
                )}
                <span>{name}</span>
              </button>
            ))
          ) : (
            <span className="text-zinc-500 text-[11px]">No characters</span>
          )}
        </div>

        {/* Expanded character image */}
        <AnimatePresence>
          {selectedCharacter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              {/* Character image */}
              <div className="relative w-full aspect-square max-w-xs bg-black/20 rounded-lg overflow-hidden border border-white/10">
                {characterImages[selectedCharacter] ? (
                  <img
                    src={characterImages[selectedCharacter]}
                    alt={selectedCharacter}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <span className="text-xs">No image</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10">
                    <Upload className="w-3.5 h-3.5 text-white" />
                    <span className="text-[10px] font-bold text-white">Upload</span>
                  </div>
                </label>

                <button
                  onClick={() => selectedCharacter && onGenerate(selectedCharacter)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#D1FE17]/10 hover:bg-[#D1FE17]/20 rounded-lg transition-colors border border-[#D1FE17]/20"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D1FE17]" />
                  <span className="text-[10px] font-bold text-[#D1FE17]">Generate</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add character input */}
        {onAddCharacter && (
          <input
            type="text"
            placeholder="Add character (Type & Enter)"
            className="w-full bg-black/20 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white outline-none focus:border-[#D1FE17]/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const val = e.currentTarget.value.trim();
                if (val && !characterNames.includes(val)) {
                  onAddCharacter(val);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
