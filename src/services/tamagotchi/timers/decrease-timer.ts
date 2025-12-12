export class DecreaseTimer {
  private intervalId: number | null = null;
  private lastDecreaseTime: number;
  private lastFullHappinessTime: number | null;
  private lastFullFullnessTime: number | null;
  private onDecrease: (canDecreaseHappiness: boolean, canDecreaseFullness: boolean) => void;
  private onSave: () => void;

  constructor(
    initialLastDecrease: number | null,
    initialLastFullHappiness: number | null,
    initialLastFullFullness: number | null,
    onDecrease: (canDecreaseHappiness: boolean, canDecreaseFullness: boolean) => void,
    onSave: () => void
  ) {
    this.lastDecreaseTime = initialLastDecrease ?? Date.now();
    this.lastFullHappinessTime = initialLastFullHappiness;
    this.lastFullFullnessTime = initialLastFullFullness;
    this.onDecrease = onDecrease;
    this.onSave = onSave;
  }

  getLastDecreaseTime(): number {
    return this.lastDecreaseTime;
  }

  getLastFullHappinessTime(): number | null {
    return this.lastFullHappinessTime;
  }

  getLastFullFullnessTime(): number | null {
    return this.lastFullFullnessTime;
  }

  setLastFullHappinessTime(timestamp: number): void {
    this.lastFullHappinessTime = timestamp;
  }

  setLastFullFullnessTime(timestamp: number): void {
    this.lastFullFullnessTime = timestamp;
  }

  applyTimeBasedDecrease(): void {
    const now = Date.now();
    const timePassed = now - this.lastDecreaseTime;
    const minutesPassed = timePassed / 60000;
    const tenMinutesInMs = 10 * 60 * 1000;
    
    if (minutesPassed >= 1) {
      const canDecreaseHappiness = this.canDecreaseHappiness(now, tenMinutesInMs);
      const canDecreaseFullness = this.canDecreaseFullness(now, tenMinutesInMs);
      
      this.onDecrease(canDecreaseHappiness, canDecreaseFullness);
      
      this.lastDecreaseTime = now - (timePassed % 60000);
      this.onSave();
    }
  }

  start(): void {
    this.intervalId = window.setInterval(() => {
      const now = Date.now();
      const tenMinutesInMs = 10 * 60 * 1000;
      
      const canDecreaseHappiness = this.canDecreaseHappiness(now, tenMinutesInMs);
      const canDecreaseFullness = this.canDecreaseFullness(now, tenMinutesInMs);
      
      this.onDecrease(canDecreaseHappiness, canDecreaseFullness);
      this.lastDecreaseTime = Date.now();
      this.onSave();
    }, 60000);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private canDecreaseHappiness(now: number, tenMinutesInMs: number): boolean {
    if (this.lastFullHappinessTime === null) return true;
    const timeSinceFull = now - this.lastFullHappinessTime;
    return timeSinceFull >= tenMinutesInMs;
  }

  private canDecreaseFullness(now: number, tenMinutesInMs: number): boolean {
    if (this.lastFullFullnessTime === null) return true;
    const timeSinceFull = now - this.lastFullFullnessTime;
    return timeSinceFull >= tenMinutesInMs;
  }
}

