/**
 * Controller for managing step-by-step animations and visualizations
 */

export class StepController {
  private isRunning: boolean = false;
  private waitingCallback: (() => void) | null = null;
  private setWaitingCallback: (isWaiting: boolean) => void;
  
  /**
   * Create a new step controller
   * @param setWaitingCallback Callback function to update waiting state
   */
  constructor(setWaitingCallback: (isWaiting: boolean) => void) {
    this.setWaitingCallback = setWaitingCallback;
  }
  
  /**
   * Wait for the user to trigger the next step
   * @param onAdvance Callback to execute when next step is triggered
   */
  waitForNextStep(onAdvance: () => void) {
    // Don't wait if not running
    if (!this.isRunning) {
      onAdvance();
      return;
    }
    
    // Store the callback
    this.waitingCallback = onAdvance;
    
    // Update waiting state
    this.setWaitingCallback(true);
  }
  
  /**
   * Advance to the next step
   */
  advanceToNextStep() {
    // Execute the callback if one exists
    if (this.waitingCallback) {
      const callback = this.waitingCallback;
      this.waitingCallback = null;
      
      // Update waiting state
      this.setWaitingCallback(false);
      
      // Execute callback after a short delay to allow UI to update
      setTimeout(() => {
        callback();
      }, 50);
    }
  }
  
  /**
   * Start the controller
   */
  start() {
    this.isRunning = true;
  }
  
  /**
   * Stop the controller and clear any pending callbacks
   */
  stop() {
    this.isRunning = false;
    this.waitingCallback = null;
    this.setWaitingCallback(false);
  }
  
  /**
   * Check if the controller is currently waiting for user input
   */
  isWaiting() {
    return !!this.waitingCallback;
  }
}