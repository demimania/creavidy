'use client';

import { CharacterSection } from '@/components/ui/character-section';

export default function TestPage() {
  const mockCharacters = [
    {
      id: 'sarah',
      name: 'Sarah',
      avatar: '👩‍🌾',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'
    },
    {
      id: 'finn',
      name: 'Finn',
      avatar: '🐴',
      image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=400&fit=crop'
    }
  ];

  const handleUpload = (characterId: string, file: File) => {
    console.log('Upload file for:', characterId, file);
  };

  const handleGenerate = (characterId: string) => {
    console.log('Generate image for:', characterId);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">Character Section Test</h1>

        <div className="bg-gray-900 p-6 rounded-lg">
          <CharacterSection
            characters={mockCharacters}
            onUpload={handleUpload}
            onGenerate={handleGenerate}
          />
        </div>
      </div>
    </div>
  );
}
