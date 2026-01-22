import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Video, Download, Loader2, Film } from 'lucide-react';
import { useImageStore } from '../stores/imageStore';
import { useAchievementStore } from '../stores/achievementStore';
import { soundManager } from '../utils/soundManager';

const VideoCompiler: React.FC = () => {
  const { images } = useImageStore();
  const { unlockAchievement } = useAchievementStore();
  const [isCompiling, setIsCompiling] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const compileVideo = async () => {
    if (images.length < 2) {
      alert('You need at least 2 images to create a video!');
      return;
    }

    setIsCompiling(true);
    soundManager.playClick();

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1024;
      canvas.height = 1024;

      const stream = canvas.captureStream(30); // 30 FPS
      
      // Try different codecs based on browser support
      let mimeType = 'video/webm;codecs=vp8'; // vp8 is more widely supported
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      
      console.log('Using codec:', mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        console.log('Data available:', e.data.size, 'bytes');
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped. Total chunks:', chunks.length);
        if (chunks.length === 0) {
          alert('Recording failed: No data captured. Try again or use a different browser.');
          setIsCompiling(false);
          return;
        }
        
        const blob = new Blob(chunks, { type: 'video/webm' });
        console.log('Final blob size:', blob.size, 'bytes');
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setIsCompiling(false);
        
        // Unlock achievement
        unlockAchievement('video-creator');
        soundManager.playAchievement();
      };

      // Start recording with 100ms timeslice to ensure data is captured
      mediaRecorder.start(100);

      // Wait for MediaRecorder to be ready before drawing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Draw all frames sequentially with proper timing
      for (let i = 0; i < images.length; i++) {
        const img = new Image();
        img.src = images[i].url;

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => {
            console.error('Failed to load image:', images[i].url);
            resolve();
          };
        });

        // Draw this frame continuously for 2 seconds using requestAnimationFrame
        const startTime = Date.now();
        const frameDuration = 2000; // 2 seconds per image
        
        await new Promise<void>((resolve) => {
          const drawLoop = () => {
            const elapsed = Date.now() - startTime;
            
            if (elapsed < frameDuration) {
              // Clear canvas
              ctx.fillStyle = '#000000';
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              // Draw image centered
              const scale = Math.min(
                canvas.width / img.width,
                canvas.height / img.height
              );
              const x = (canvas.width - img.width * scale) / 2;
              const y = (canvas.height - img.height * scale) / 2;
              ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

              // Add caption
              ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
              ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 24px Arial';
              ctx.textAlign = 'center';
              ctx.fillText(
                images[i].prompt,
                canvas.width / 2,
                canvas.height - 50
              );

              requestAnimationFrame(drawLoop);
            } else {
              resolve();
            }
          };
          drawLoop();
        });
      }

      // Draw "The End" screen continuously for 2 seconds
      const startTime = Date.now();
      await new Promise<void>((resolve) => {
        const drawEndScreen = () => {
          const elapsed = Date.now() - startTime;
          
          if (elapsed < 2000) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 80px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('THE END', canvas.width / 2, canvas.height / 2 - 50);
            ctx.font = '40px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.fillText('(Made with DeadpoolOS 💀)', canvas.width / 2, canvas.height / 2 + 50);
            
            requestAnimationFrame(drawEndScreen);
          } else {
            resolve();
          }
        };
        drawEndScreen();
      });

      // Stop recording
      mediaRecorder.stop();
    } catch (error) {
      console.error('Failed to compile video:', error);
      alert('Failed to compile video. This feature requires a modern browser.');
      setIsCompiling(false);
    }
  };

  const downloadVideo = () => {
    if (!videoUrl) return;

    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `deadpool-compilation-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    soundManager.playSuccess();
  };

  return (
    <div className="h-full overflow-y-auto flex flex-col bg-gradient-to-br from-purple-900 via-red-900 to-black p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white comic-text mb-2">
          🎬 Video Compilation Studio
        </h2>
        <p className="text-gray-300">
          Turn your generated images into an epic video montage! Each image shows for 2 seconds with
          smooth transitions.
        </p>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-black/50 rounded-lg p-4 mb-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <Film className="w-8 h-8 text-red-500" />
          <div>
            <p className="text-gray-400 text-sm">Available Images</p>
            <p className="text-2xl font-bold text-white">{images.length}</p>
          </div>
        </div>
        {images.length < 2 && (
          <p className="text-yellow-400 mt-2 text-sm">
            ⚠️ Generate at least 2 images in the Gallery to create a video
          </p>
        )}
      </div>

      {!videoUrl && (
        <motion.button
          onClick={compileVideo}
          disabled={isCompiling || images.length < 2}
          className="bg-gradient-to-r from-red-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-red-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all deadpool-glow flex items-center justify-center gap-3 text-lg font-bold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isCompiling ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Compiling Video... ({images.length} images)
            </>
          ) : (
            <>
              <Video className="w-6 h-6" />
              Compile Video Montage
            </>
          )}
        </motion.button>
      )}

      {videoUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col gap-4"
        >
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              className="w-full h-auto"
              style={{ maxHeight: '500px' }}
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={downloadVideo}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-bold"
            >
              <Download className="w-5 h-5" />
              Download Video
            </button>

            <button
              onClick={() => {
                setVideoUrl(null);
                soundManager.playClick();
              }}
              className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-bold"
            >
              Create Another
            </button>
          </div>

          <div className="bg-green-900/50 border border-green-500 rounded-lg p-4">
            <p className="text-green-300 font-bold mb-2">🎉 Video Compiled Successfully!</p>
            <p className="text-gray-300 text-sm">
              Your epic Deadpool montage is ready. Download it and share it with the world! The video
              includes all {images.length} images with captions and a fancy ending screen.
            </p>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      {!videoUrl && !isCompiling && (
        <div className="mt-6 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-3">📝 How it Works:</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-red-500">1.</span>
              <span>Generate at least 2 images in the Meme Gallery</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">2.</span>
              <span>Click "Compile Video Montage" to start</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">3.</span>
              <span>Each image will show for 2 seconds with its caption</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">4.</span>
              <span>Video ends with an epic "THE END" screen</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">5.</span>
              <span>Download your masterpiece as a WebM video file!</span>
            </li>
          </ul>

          <div className="mt-4 p-3 bg-purple-900/30 border border-purple-500 rounded">
            <p className="text-purple-300 text-sm">
              💡 <strong>Pro Tip:</strong> The more images you have, the longer and more epic your video
              will be! Videos are recorded at 30 FPS for smooth playback.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCompiler;
