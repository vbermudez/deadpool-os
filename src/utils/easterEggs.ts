import { useEffect, useState } from 'react';
import { useAchievementStore } from '../stores/achievementStore';
import { soundManager } from './soundManager';

// Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];

export function useKonamiCode(onComplete: () => void) {
  useEffect(() => {
    let position = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === KONAMI_CODE[position]) {
        position++;
        if (position === KONAMI_CODE.length) {
          position = 0;
          onComplete();
        }
      } else {
        position = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);
}

// Secret click counter on specific elements
export function useSecretClickCounter(elementId: string, targetClicks: number, onComplete: () => void) {
  useEffect(() => {
    let clicks = 0;

    const handleClick = () => {
      clicks++;
      if (clicks >= targetClicks) {
        clicks = 0;
        onComplete();
      }
    };

    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener('click', handleClick);
      return () => element.removeEventListener('click', handleClick);
    }
  }, [elementId, targetClicks, onComplete]);
}

// Idle detection
export function useIdleDetection(idleTimeMs: number, onIdle: () => void) {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(onIdle, idleTimeMs);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [idleTimeMs, onIdle]);
}

// Easter egg manager
export interface EasterEgg {
  id: string;
  name: string;
  description: string;
  trigger: () => void;
  found: boolean;
}

export function useEasterEggs() {
  const { unlockAchievement } = useAchievementStore();
  const [foundEggs, setFoundEggs] = useState<Set<string>>(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('found-easter-eggs');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }
    return new Set();
  });

  const markEggFound = (eggId: string) => {
    if (foundEggs.has(eggId)) return;

    setFoundEggs((prev) => {
      const updated = new Set(prev);
      updated.add(eggId);
      localStorage.setItem('found-easter-eggs', JSON.stringify(Array.from(updated)));
      return updated;
    });

    soundManager.playAchievement();
    unlockAchievement('easter-egg-found');
    
    // Show notification
    showEasterEggNotification(eggId);
  };

  return { foundEggs, markEggFound };
}

function showEasterEggNotification(eggId: string) {
  const messages: Record<string, string> = {
    'konami-code': '🎮 KONAMI CODE ACTIVATED! Old school gamer detected!',
    'avatar-spam': '🤪 You really like clicking my face, huh? Weirdo.',
    'secret-tab': '🗂️ Found the secret tab! You sneaky devil!',
    'hidden-message': '📨 You found the hidden message in the code!',
    'triple-click': '🖱️ Triple click master! Have a cookie. 🍪',
  };

  const message = messages[eggId] || '🥚 Easter Egg Found!';
  
  // Create floating notification
  const notification = document.createElement('div');
  notification.className = 'fixed top-20 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold comic-text z-50 animate-bounce shadow-2xl';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.5s';
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// Secret code words in chat
export function checkForSecretWords(message: string): string[] {
  const secrets: string[] = [];
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('chimichanga') && lowerMessage.includes('joke')) {
    secrets.push('made-deadpool-laugh');
  }

  if (lowerMessage.includes('meta') || lowerMessage.includes('fourth wall')) {
    secrets.push('fourth-wall-shattered');
  }

  if (lowerMessage.includes('easter egg')) {
    secrets.push('egg-hunter');
  }

  return secrets;
}

// Hidden developer console message
export function showSecretConsoleMessage() {
  if (typeof console !== 'undefined') {
    const styles = [
      'color: #ff0000',
      'font-size: 20px',
      'font-weight: bold',
      'text-shadow: 2px 2px 0px #000',
    ].join(';');

    console.log('%c🎭 DEADPOOL WAS HERE 🎭', styles);
    console.log('%cYou found the secret console message! 🥚', 'color: #ffd700; font-size: 16px;');
    console.log('%cHere\'s a hint: Try the Konami Code... ↑ ↑ ↓ ↓ ← → ← → B A', 'color: #00ff00;');
    console.log('%cOr click my avatar 10 times rapidly...', 'color: #00ffff;');
  }
}

// Animation for special events
export function triggerConfetti() {
  const colors = ['#ff0000', '#ffd700', '#ff69b4', '#00ffff', '#00ff00'];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'fixed pointer-events-none z-50';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '-10px';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.style.transition = 'all 3s ease-out';

    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.style.top = '100vh';
      confetti.style.left = (parseFloat(confetti.style.left) + (Math.random() * 40 - 20)) + '%';
      confetti.style.transform = `rotate(${Math.random() * 720}deg)`;
      confetti.style.opacity = '0';
    }, 50);

    setTimeout(() => confetti.remove(), 3100);
  }
}
