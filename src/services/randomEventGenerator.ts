export type RandomEventType = 
  | 'steal-chimichangas'
  | 'bonus-chimichangas'
  | 'mood-change'
  | 'popup-message'
  | 'mini-game-trigger'
  | 'achievement-hint'
  | 'fourth-wall-break';

export interface RandomEvent {
  id: string;
  type: RandomEventType;
  message: string;
  action?: () => void;
  duration?: number; // milliseconds
}

export interface EventTrigger {
  minInterval: number; // seconds
  maxInterval: number; // seconds
  chance: number; // 0-1
  requiresIdle?: boolean;
}

const deadpoolQuips = [
  "Hey! Are you even paying attention? I'm trapped in here!",
  "Is it just me or is this Electron app using way too much RAM?",
  "Fun fact: I can see your mouse cursor. It's judging you.",
  "You know what? I'm gonna steal some of your chimichangas. Oops, too late!",
  "BREAKING NEWS: AI becomes self-aware. Immediately regrets life choices.",
  "Did you know TypeScript is just JavaScript wearing a fancy hat?",
  "I wonder if the judges are watching right now. Hi judges! 👋",
  "This code was written by a human. You can tell by the bugs.",
  "If I had a dollar for every time React re-rendered... I'd crash this app.",
  "Psst... there are easter eggs hidden in here. Good luck finding them! 🥚",
];

const fourthWallBreaks = [
  "I can literally see the React DevTools open. Nice debugging, champ.",
  "Oh look, another state update. Zustand is working overtime tonight.",
  "Fun fact: This message was generated at " + new Date().toLocaleTimeString(),
  "You're reading text rendered by Electron, powered by Chromium, running JavaScript. It's turtles all the way down.",
  "I'm a JSON object being passed through IPC. How's your day going?",
  "The engineer who made me used GPT-4 for my personality. The irony is NOT lost on me.",
];

export class RandomEventGenerator {
  private activeEvents: Set<string> = new Set();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;
  private lastEventTime: number = Date.now();
  private eventCount: number = 0;

  constructor(
    private onEvent: (event: RandomEvent) => void,
    private getChimichangaCount: () => number,
    private modifyChimichangas: (amount: number) => void,
    private setMood: (mood: string) => void,
    private addAchievement: (id: string) => void
  ) {}

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('🎲 Random Event Generator started!');
    this.scheduleNextEvent();
  }

  stop(): void {
    this.isRunning = false;
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    console.log('🎲 Random Event Generator stopped.');
  }

  private scheduleNextEvent(): void {
    if (!this.isRunning) return;

    // Random interval between 30 seconds and 3 minutes
    const minInterval = 30 * 1000;
    const maxInterval = 180 * 1000;
    const interval = Math.random() * (maxInterval - minInterval) + minInterval;

    const timer = setTimeout(() => {
      this.triggerRandomEvent();
      this.scheduleNextEvent();
    }, interval);

    this.timers.set('main', timer);
  }

  private triggerRandomEvent(): void {
    const now = Date.now();
    const timeSinceLastEvent = now - this.lastEventTime;

    // Don't trigger if last event was less than 20 seconds ago
    if (timeSinceLastEvent < 20000) {
      return;
    }

    this.lastEventTime = now;

    // Randomly select event type
    const eventTypes: RandomEventType[] = [
      'steal-chimichangas',
      'bonus-chimichangas',
      'popup-message',
      'fourth-wall-break',
      'mood-change',
      'achievement-hint',
    ];

    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const event = this.generateEvent(eventType);

    if (event) {
      this.eventCount++;
      
      // Unlock achievement after experiencing chaos
      if (this.eventCount === 5) {
        this.addAchievement('chaos-survivor');
      }
      
      this.onEvent(event);
      this.activeEvents.add(event.id);

      // Auto-remove after duration
      if (event.duration) {
        setTimeout(() => {
          this.activeEvents.delete(event.id);
        }, event.duration);
      }
    }
  }

  private generateEvent(type: RandomEventType): RandomEvent | null {
    const id = `event-${Date.now()}-${Math.random()}`;

    switch (type) {
      case 'steal-chimichangas': {
        const currentCount = this.getChimichangaCount();
        if (currentCount < 5) return null; // Don't steal if too few

        const stolenAmount = Math.min(Math.floor(Math.random() * 10) + 5, currentCount / 2);
        return {
          id,
          type,
          message: `🚨 DEADPOOL ALERT: I just stole ${stolenAmount} of your chimichangas! What are you gonna do about it? 😈`,
          action: () => {
            this.modifyChimichangas(-stolenAmount);
          },
          duration: 5000,
        };
      }

      case 'bonus-chimichangas': {
        const bonusAmount = Math.floor(Math.random() * 20) + 10;
        return {
          id,
          type,
          message: `🎉 SURPRISE! I'm feeling generous. Here's ${bonusAmount} free chimichangas! (Don't ask where I got them...)`,
          action: () => {
            this.modifyChimichangas(bonusAmount);
          },
          duration: 5000,
        };
      }

      case 'mood-change': {
        const moods = ['excited', 'bored', 'sarcastic', 'chaotic', 'hungry'];
        const newMood = moods[Math.floor(Math.random() * moods.length)];
        return {
          id,
          type,
          message: `Mood update: I'm feeling ${newMood} right now. Deal with it.`,
          action: () => {
            this.setMood(newMood);
          },
          duration: 3000,
        };
      }

      case 'popup-message': {
        const message = deadpoolQuips[Math.floor(Math.random() * deadpoolQuips.length)];
        return {
          id,
          type,
          message,
          duration: 6000,
        };
      }

      case 'fourth-wall-break': {
        const message = fourthWallBreaks[Math.floor(Math.random() * fourthWallBreaks.length)];
        return {
          id,
          type,
          message: `🎬 ${message}`,
          action: () => {
            this.addAchievement('fourth-wall-shattered');
          },
          duration: 7000,
        };
      }

      case 'achievement-hint': {
        return {
          id,
          type,
          message: "💡 Secret hint: Try clicking on my avatar when I'm in different moods...",
          duration: 5000,
        };
      }

      default:
        return null;
    }
  }

  // Manual trigger for testing
  triggerSpecificEvent(type: RandomEventType): void {
    const event = this.generateEvent(type);
    if (event) {
      this.onEvent(event);
    }
  }
}
