/**
 * Helper functions for step-by-step execution control
 */

export type StepFunction = () => void;
export type StepMode = 'auto' | 'step-by-step';
export type StepCallback = () => void;

/**
 * Step controller for agent workflow visualizations
 */
export class StepController {
  private steps: StepFunction[] = [];
  private currentStepIndex: number = 0;
  private isWaitingFlag: boolean = false;
  private isRunning: boolean = false;
  private mode: StepMode = 'auto';
  private speedFactor: number = 1;
  private onWaitChange: (isWaiting: boolean) => void;
  private waitingCallbacks: StepCallback[] = [];

  constructor(onWaitChange: (isWaiting: boolean) => void) {
    this.onWaitChange = onWaitChange;
  }

  /**
   * Add a step to the execution queue
   */
  addStep(stepFn: StepFunction): number {
    this.steps.push(stepFn);
    return this.steps.length - 1;
  }

  /**
   * Set the execution mode
   */
  setMode(mode: StepMode) {
    this.mode = mode;
    
    // If switching to auto and we're currently waiting, continue execution
    if (mode === 'auto' && this.isWaitingFlag) {
      this.advanceToNextStep();
    }
  }

  /**
   * Set the speed factor for auto mode
   */
  setSpeedFactor(factor: number) {
    this.speedFactor = factor;
  }

  /**
   * Check if controller is currently waiting for user input
   */
  isWaiting(): boolean {
    return this.isWaitingFlag;
  }

  /**
   * Wait for the next step (returns a Promise that resolves when user advances)
   */
  waitForNextStep(callback: StepCallback): void {
    this.isWaitingFlag = true;
    this.onWaitChange(true);
    this.waitingCallbacks.push(callback);
  }

  /**
   * Start the execution of steps
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.currentStepIndex = 0;
    this.executeNextStep();
  }

  /**
   * Reset the controller
   */
  reset() {
    this.steps = [];
    this.currentStepIndex = 0;
    this.isWaitingFlag = false;
    this.isRunning = false;
    this.waitingCallbacks = [];
  }

  /**
   * Execute the next step in the queue
   */
  private executeNextStep() {
    if (!this.isRunning || this.currentStepIndex >= this.steps.length) {
      this.isRunning = false;
      return;
    }

    // Execute the current step
    const currentStep = this.steps[this.currentStepIndex];
    currentStep();
    
    // Increment for next step
    this.currentStepIndex++;
    
    // If we've reached the end, we're done
    if (this.currentStepIndex >= this.steps.length) {
      this.isRunning = false;
      return;
    }
    
    // In step-by-step mode, wait for user to advance
    if (this.mode === 'step-by-step') {
      this.isWaitingFlag = true;
      this.onWaitChange(true);
    } else {
      // In auto mode, continue to next step after a delay
      setTimeout(() => {
        this.executeNextStep();
      }, 500 / this.speedFactor); // Base delay adjusted by speed factor
    }
  }

  /**
   * Advance to the next step (called when user clicks "Next Step")
   */
  advanceToNextStep() {
    if (!this.isWaitingFlag) return;
    
    this.isWaitingFlag = false;
    this.onWaitChange(false);
    
    // Execute all waiting callbacks
    const callbacks = [...this.waitingCallbacks];
    this.waitingCallbacks = [];
    
    callbacks.forEach(callback => {
      try {
        callback();
      } catch (e) {
        console.error('Error in step callback:', e);
      }
    });
    
    // Continue execution if we're in sequence mode
    if (this.isRunning && this.currentStepIndex < this.steps.length) {
      this.executeNextStep();
    }
  }

  /**
   * Stop the execution
   */
  stop() {
    this.isRunning = false;
    this.isWaitingFlag = false;
    this.onWaitChange(false);
    
    // Clear any waiting callbacks to prevent memory leaks
    this.waitingCallbacks = [];
  }
}