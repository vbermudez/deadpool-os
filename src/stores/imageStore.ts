import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GeneratedImage } from '../types';

interface ImageState {
  images: GeneratedImage[];
  isGenerating: boolean;
  addImage: (image: GeneratedImage) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  clearImages: () => void;
}

export const useImageStore = create<ImageState>()(
  persist(
    (set) => ({
      images: [],
      isGenerating: false,

      addImage: (image) =>
        set((state) => ({
          images: [image, ...state.images],
        })),

      setIsGenerating: (isGenerating) => set({ isGenerating }),

      clearImages: () => set({ images: [] }),
    }),
    {
      name: 'deadpool-image-storage',
    }
  )
);
