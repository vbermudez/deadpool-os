import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Code2 } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { useAchievementStore } from '../stores/achievementStore';

interface CodeChallenge {
  id: number;
  code: string;
  errors: { line: number; error: string }[];
  description: string;
}

const challenges: CodeChallenge[] = [
  {
    id: 1,
    code: `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {
    total += items[i].price;
  }
  return total;
}`,
    errors: [
      { line: 2, error: 'Off-by-one error: should be i < items.length' },
    ],
    description: 'Find the array boundary bug',
  },
  {
    id: 2,
    code: `const user = {
  name: 'Deadpool',
  age: 30,
};

if (user.name = 'Wade') {
  console.log('Found Wade!');
}`,
    errors: [
      { line: 5, error: 'Assignment (=) instead of comparison (===)' },
    ],
    description: 'Spot the operator mistake',
  },
  {
    id: 3,
    code: `async function fetchData() {
  const response = fetch('https://api.example.com/data');
  const data = response.json();
  return data;
}`,
    errors: [
      { line: 1, error: 'Missing await before fetch()' },
      { line: 2, error: 'Missing await before .json()' },
    ],
    description: 'Find the async/await issues',
  },
  {
    id: 4,
    code: `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => {
  n * 2;
});
console.log(doubled);`,
    errors: [
      { line: 2, error: 'Missing return statement in arrow function' },
    ],
    description: 'Debug the array transformation',
  },
  {
    id: 5,
    code: `class Superhero {
  constructor(name) {
    this.name = name;
  }
  
  greet() {
    setTimeout(function() {
      console.log('Hi, I am ' + this.name);
    }, 1000);
  }
}`,
    errors: [
      { line: 6, error: 'Wrong "this" context in setTimeout callback' },
    ],
    description: 'Fix the "this" binding issue',
  },
];

const CodeTypoHunter: React.FC = () => {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState<CodeChallenge | null>(null);
  const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());

  const { incrementChimichangas } = useGameStore();
  const { unlockAchievement } = useAchievementStore();

  const startNewChallenge = () => {
    const challenge = challenges[currentChallengeIndex];
    setCurrentChallenge(challenge);
    setSelectedLines(new Set());
    setIsComplete(false);
    setFeedback('');
  };

  useEffect(() => {
    startNewChallenge();
  }, [currentChallengeIndex]);

  const toggleLine = (lineNumber: number) => {
    if (isComplete) return;

    const newSelected = new Set(selectedLines);
    if (newSelected.has(lineNumber)) {
      newSelected.delete(lineNumber);
    } else {
      newSelected.add(lineNumber);
    }
    setSelectedLines(newSelected);
  };

  const checkAnswer = () => {
    if (!currentChallenge || isComplete) return;

    setAttempts((a) => a + 1);

    const errorLines = new Set(currentChallenge.errors.map((e) => e.line));
    const selectedArray = Array.from(selectedLines);

    const correct = selectedArray.every((line) => errorLines.has(line));
    const allFound = errorLines.size === selectedArray.length;

    if (correct && allFound) {
      setIsComplete(true);
      const points = 20;
      setScore((s) => s + points);
      incrementChimichangas(points);
      setFeedback('🎉 CORRECT! You found all the bugs!');
      
      const newCompleted = new Set(completedChallenges);
      newCompleted.add(currentChallenge.id);
      setCompletedChallenges(newCompleted);
      
      if (newCompleted.size === challenges.length) {
        unlockAchievement('bug-hunter');
      }
    } else if (correct && !allFound) {
      setFeedback('⚠️ Correct so far, but you missed some bugs!');
    } else {
      setFeedback('❌ Not quite right. Keep looking!');
    }
  };

  const nextChallenge = () => {
    const nextIndex = (currentChallengeIndex + 1) % challenges.length;
    setCurrentChallengeIndex(nextIndex);
  };

  const showHint = () => {
    if (!currentChallenge) return;
    const firstError = currentChallenge.errors[0];
    setFeedback(`💡 Hint: Check line ${firstError.line}...`);
  };

  if (!currentChallenge) {
    return <div>Loading...</div>;
  }

  const codeLines = currentChallenge.code.split('\n');

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-indigo-900 to-black p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-white comic-text mb-2">
            🐛 Code Typo Hunter
          </h2>
          <p className="text-gray-300 mb-4">{currentChallenge.description}</p>
          <p className="text-yellow-400 text-sm">
            Click on the lines with bugs, then check your answer!
          </p>
        </div>

        <div className="flex justify-center gap-6 mb-6">
          <div className="bg-black/50 rounded-lg px-4 py-2 backdrop-blur">
            <p className="text-gray-400 text-sm">Score</p>
            <p className="text-2xl font-bold text-yellow-400">{score}</p>
          </div>
          <div className="bg-black/50 rounded-lg px-4 py-2 backdrop-blur">
            <p className="text-gray-400 text-sm">Attempts</p>
            <p className="text-2xl font-bold text-blue-400">{attempts}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-xl border-2 border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-mono text-sm">buggy-code.js</span>
          </div>

          <div className="font-mono text-sm">
            {codeLines.map((line, index) => {
              const lineNumber = index;
              const isSelected = selectedLines.has(lineNumber);
              const isError = currentChallenge.errors.some((e) => e.line === lineNumber);
              const showError = isComplete && isError;

              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className={`flex gap-3 px-3 py-1 rounded cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-yellow-500/20 border-l-4 border-yellow-500'
                      : 'hover:bg-gray-700/50'
                  } ${showError ? 'border-l-4 border-red-500' : ''}`}
                  onClick={() => toggleLine(lineNumber)}
                >
                  <span className="text-gray-500 select-none w-8 text-right">
                    {lineNumber}
                  </span>
                  <span className={`flex-1 ${showError ? 'text-red-400' : 'text-gray-200'}`}>
                    {line || ' '}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-yellow-400" />}
                  {showError && <XCircle className="w-4 h-4 text-red-400" />}
                </motion.div>
              );
            })}
          </div>
        </div>

        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center p-4 rounded-lg mb-4 ${
              feedback.includes('CORRECT')
                ? 'bg-green-500/20 text-green-300'
                : feedback.includes('Hint')
                ? 'bg-blue-500/20 text-blue-300'
                : 'bg-yellow-500/20 text-yellow-300'
            }`}
          >
            {feedback}
          </motion.div>
        )}

        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6"
          >
            <h3 className="text-red-400 font-bold mb-2">🐛 Bug Explanations:</h3>
            {currentChallenge.errors.map((error, idx) => (
              <div key={idx} className="text-sm text-gray-300 mb-2">
                <span className="text-red-400 font-mono">Line {error.line}:</span> {error.error}
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-red-500/30">
              <p className="text-green-400 font-bold">
                Progress: {completedChallenges.size} / {challenges.length} challenges completed
              </p>
              {completedChallenges.size === challenges.length && (
                <p className="text-yellow-400 mt-2">🏆 Achievement Unlocked: Bug Hunter!</p>
              )}
            </div>
          </motion.div>
        )}

        <div className="flex justify-center gap-4">
          {!isComplete ? (
            <>
              <button
                onClick={checkAnswer}
                disabled={selectedLines.size === 0}
                className="bg-deadpool-red text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors deadpool-glow"
              >
                Check Answer
              </button>
              <button
                onClick={showHint}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                💡 Hint
              </button>
            </>
          ) : (
            <button
              onClick={nextChallenge}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors deadpool-glow"
            >
              Next Challenge →
            </button>
          )}
        </div>

        <div className="mt-6 text-center">
          <div className="bg-deadpool-red/20 border border-deadpool-red rounded-lg p-4 inline-block comic-text text-white">
            {attempts === 0 && "Come on, find those bugs! I know you can do it... probably."}
            {attempts === 1 && !isComplete && "First try? Not bad! Or maybe just lucky... 🤔"}
            {attempts > 1 && !isComplete && "Still looking? The bugs aren't THAT well hidden!"}
            {isComplete && "Nice! You're like a debugging ninja! Or a lucky guesser. 🥷"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeTypoHunter;
