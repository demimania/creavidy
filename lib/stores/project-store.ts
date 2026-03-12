import { create } from 'zustand';

export interface Scene {
    id: string;
    order: number;
    description: string;
    narrationText: string;
    mediaUrl: string | null;
    mediaType: 'image' | 'video';
    duration: number;
    timestampStart: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface VideoSummary {
    style: string;
    narrator: { id: string; name: string; type: 'voice' | 'avatar' } | null;
    character: string;
    musicMood: string;
    sceneMediaType: 'images' | 'video';
    duration: number;
    aspectRatio: string;
    platform: string;
    scriptSections: {
        beginning: string;
        development: string;
        climax: string;
        conclusion: string;
    };
}

export type ProjectStep = 'home' | 'chat' | 'storyboard' | 'canvas' | 'export';

interface ProjectState {
    // Project data
    projectId: string | null;
    projectTitle: string;
    prompt: string;
    referenceImage: File | null;
    referenceImageUrl: string | null;

    // Video config
    style: string;
    voice: { id: string; name: string; type: 'voice' | 'avatar' } | null;
    duration: number;
    aspectRatio: string;
    platform: string;

    // Generated data
    scenes: Scene[];
    chatMessages: ChatMessage[];
    videoSummary: VideoSummary | null;

    // Navigation
    currentStep: ProjectStep;
    maxReachedStep: ProjectStep;

    // Credits
    credits: number;

    // Loading
    isGenerating: boolean;

    // Actions
    setPrompt: (prompt: string) => void;
    setStyle: (style: string) => void;
    setVoice: (voice: { id: string; name: string; type: 'voice' | 'avatar' } | null) => void;
    setDuration: (duration: number) => void;
    setAspectRatio: (ratio: string) => void;
    setPlatform: (platform: string) => void;
    setReferenceImage: (file: File | null, url: string | null) => void;
    setCurrentStep: (step: ProjectStep) => void;
    setProjectTitle: (title: string) => void;
    addChatMessage: (message: ChatMessage) => void;
    setScenes: (scenes: Scene[]) => void;
    setVideoSummary: (summary: VideoSummary) => void;
    setIsGenerating: (loading: boolean) => void;
    setCredits: (credits: number) => void;
    resetProject: () => void;
}

const STEP_ORDER: ProjectStep[] = ['home', 'chat', 'storyboard', 'canvas', 'export'];

const initialState = {
    projectId: null,
    projectTitle: 'Untitled Project',
    prompt: '',
    referenceImage: null,
    referenceImageUrl: null,
    style: 'realistic',
    voice: null,
    duration: 15,
    aspectRatio: '16:9',
    platform: 'youtube',
    scenes: [],
    chatMessages: [],
    videoSummary: null,
    currentStep: 'home' as ProjectStep,
    maxReachedStep: 'home' as ProjectStep,
    credits: 1250,
    isGenerating: false,
};

export const useProjectStore = create<ProjectState>((set) => ({
    ...initialState,

    setPrompt: (prompt) => set({ prompt }),
    setStyle: (style) => set({ style }),
    setVoice: (voice) => set({ voice }),
    setDuration: (duration) => set({ duration }),
    setAspectRatio: (aspectRatio) => set({ aspectRatio }),
    setPlatform: (platform) => set({ platform }),
    setReferenceImage: (file, url) => set({ referenceImage: file, referenceImageUrl: url }),
    setProjectTitle: (title) => set({ projectTitle: title }),
    setIsGenerating: (isGenerating) => set({ isGenerating }),
    setCredits: (credits) => set({ credits }),

    setCurrentStep: (step) => set((state) => {
        const stepIdx = STEP_ORDER.indexOf(step);
        const maxIdx = STEP_ORDER.indexOf(state.maxReachedStep);
        return {
            currentStep: step,
            maxReachedStep: stepIdx > maxIdx ? step : state.maxReachedStep,
        };
    }),

    addChatMessage: (message) => set((state) => ({
        chatMessages: [...state.chatMessages, message],
    })),

    setScenes: (scenes) => set({ scenes }),
    setVideoSummary: (summary) => set({ videoSummary: summary }),

    resetProject: () => set(initialState),
}));
