'use client';

import { CharacterDropdown } from '@/components/ui/character-dropdown';
import { useState } from 'react';

export default function TestPage() {
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">Character Dropdown Test</h1>

        <div className="bg-gray-900 p-6 rounded-lg">
          <CharacterDropdown
            value={selectedCharacter}
            onChange={setSelectedCharacter}
          />

          <div className="mt-4 text-white">
            Selected: {selectedCharacter || 'None'}
          </div>
        </div>
      </div>
    </div>
  );
}
