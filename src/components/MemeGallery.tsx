import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { useImageStore } from '../stores/imageStore';
import { useAchievementStore } from '../stores/achievementStore';
import { soundManager } from '../utils/soundManager';
import { GeneratedImage } from '../types';
import { apiService } from '../services/api';

const MemeGallery: React.FC = () => {
  const { images, isGenerating, addImage, setIsGenerating, clearImages } = useImageStore();
  const { unlockAchievement } = useAchievementStore();
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    setIsGenerating(false);
  }, [setIsGenerating]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);

    try {
      const response = await apiService.generateImage(prompt);

      if (response.error) {
        console.error('Image generation error:', response.error);
        alert(`Error: ${response.error}`);
        return;
      }
      
      if (response.url) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: response.url,
          prompt: prompt,
          timestamp: new Date(),
        };
        addImage(newImage);
        
        // Unlock achievement for first image
        if (images.length === 0) {
          unlockAchievement('first-image');
          soundManager.playAchievement();
        }
        
        setPrompt('');
      } else {
        alert('No image URL returned from server');
      }
    } catch (error) {
      console.error('Image generation failed:', error);
      alert('Failed to generate image. Check your API key and connection.');
    } finally {
      // Always reset generating state
      setIsGenerating(false);
    }
  };

  const suggestedPrompts = [
    'Deadpool eating a giant chimichanga',
    'Deadpool as a superhero coder',
    'Deadpool breaking through the screen',
    'Deadpool playing video games',
    'Deadpool with a sword made of code',
  ];

  return (
    <div className="h-full flex flex-col bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white comic-text mb-2">
          🖼️ Deadpool's Meme Gallery
        </h2>
        <p className="text-gray-400">
          Generate comic-style images with DALL-E 3. Each image costs chimichangas... just kidding, it's
          on your API bill! 😈
        </p>
      </div>

      {/* Image Generation Input */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Describe what you want to see... (e.g., 'Deadpool riding a unicorn')"
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-deadpool-red"
            disabled={isGenerating}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="bg-deadpool-red text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors deadpool-glow flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ImageIcon className="w-5 h-5" />
                Generate
              </>
            )}
          </button>
        </div>

        {/* Suggested Prompts */}
        <div className="flex flex-wrap gap-2">
          <span className="text-gray-400 text-sm">Quick ideas:</span>
          {suggestedPrompts.map((suggested, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(suggested)}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full transition-colors"
              disabled={isGenerating}
            >
              {suggested}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Actions */}
      {images.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-400">
            {images.length} image{images.length !== 1 ? 's' : ''} generated
          </p>
          <button
            onClick={clearImages}
            className="text-red-400 hover:text-red-300 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      )}

      {/* Image Grid */}
      <div className="flex-1 overflow-y-auto">
        {images.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <ImageIcon className="w-24 h-24 mb-4 opacity-50" />
            <p className="text-xl mb-2">No images yet!</p>
            <p className="text-sm">Generate your first Deadpool meme above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {images.map((image, idx) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-red-500/50 transition-shadow"
              >
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-64 object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <p className="text-white text-sm mb-2 line-clamp-2">{image.prompt}</p>
                  <p className="text-gray-500 text-xs">
                    {image.timestamp.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-4 bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 text-yellow-200 text-sm">
        <p>
          <strong>💡 Tip:</strong> Images are stored in your browser's local storage. They'll
          persist between sessions but won't survive a cache clear. Download your favorites!
        </p>
      </div>
    </div>
  );
};

export default MemeGallery;
