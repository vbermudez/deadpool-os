import React, { useEffect, useRef } from 'react';
import { Mood } from '../types';
import { motion } from 'framer-motion';

interface DeadpoolAvatarProps {
  mood: Mood;
  size?: number;
}

const DeadpoolAvatar: React.FC<DeadpoolAvatarProps> = ({ mood, size = 64 }) => {
  const getExpression = () => {
    switch (mood) {
      case 'excited':
        return '😄';
      case 'bored':
        return '😑';
      case 'sarcastic':
        return '😏';
      case 'hungry':
        return '🤤';
      case 'chaotic':
      default:
        return '😈';
    }
  };

  return (
    <motion.div
      key={mood}
      initial={{ scale: 0.8, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="relative"
      style={{ width: size, height: size }}
    >
      <div
        className="w-full h-full rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-3xl deadpool-glow border-4 border-black"
        style={{ fontSize: size * 0.6 }}
      >
        {getExpression()}
      </div>
      {/* Optional: Add eye mask effect */}
      <div className="absolute top-1/4 left-0 w-full h-1/3 bg-black opacity-30 rounded-full" />
    </motion.div>
  );
};

export default DeadpoolAvatar;
