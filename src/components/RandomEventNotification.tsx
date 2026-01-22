import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { RandomEvent } from '../services/randomEventGenerator';

interface RandomEventNotificationProps {
  event: RandomEvent | null;
  onDismiss: () => void;
}

const RandomEventNotification: React.FC<RandomEventNotificationProps> = ({ event, onDismiss }) => {
  if (!event) return null;

  const getBackgroundColor = () => {
    switch (event.type) {
      case 'steal-chimichangas':
        return 'bg-red-600';
      case 'bonus-chimichangas':
        return 'bg-green-600';
      case 'mood-change':
        return 'bg-purple-600';
      case 'fourth-wall-break':
        return 'bg-blue-600';
      case 'achievement-hint':
        return 'bg-yellow-600';
      default:
        return 'bg-deadpool-red';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: -50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.8 }}
        transition={{ type: 'spring', damping: 15 }}
        className={`fixed top-24 left-1/2 -translate-x-1/2 ${getBackgroundColor()} text-white px-6 py-4 rounded-lg shadow-2xl z-50 max-w-md w-full mx-4 deadpool-glow`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-bold comic-text text-lg">{event.message}</p>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RandomEventNotification;
