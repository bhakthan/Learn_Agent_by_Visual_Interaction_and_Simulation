// Improved ResizeObserver polyfill with error handling
(function() {
  // Only create a polyfill if ResizeObserver is not available
  if (!window.ResizeObserver) {
    // Define a minimal ResizeObserver polyfill
    window.ResizeObserver = class ResizeObserver {
      constructor(callback) {
        this.callback = callback;
        this.elements = new Set();
        this.active = false;
        
        // Create fallback using window resize
        this.checkResize = () => {
          if (!this.active) return;
          
          try {
            // Create entries for callback
            const entries = Array.from(this.elements).map(element => ({
              target: element,
              contentRect: element.getBoundingClientRect(),
              borderBoxSize: [{
                inlineSize: element.offsetWidth,
                blockSize: element.offsetHeight
              }],
              contentBoxSize: [{
                inlineSize: element.clientWidth,
                blockSize: element.clientHeight
              }]
            }));
            
            // Only call if there are entries
            if (entries.length > 0) {
              this.callback(entries);
            }
          } catch (error) {
            console.warn('Error in ResizeObserver polyfill:', error);
          }
        };
      }
      
      observe(element) {
        if (!element) return;
        
        this.elements.add(element);
        
        if (!this.active) {
          this.active = true;
          window.addEventListener('resize', this.checkResize);
          setTimeout(this.checkResize, 100); // Initial check
        }
      }
      
      unobserve(element) {
        if (!element) return;
        this.elements.delete(element);
      }
      
      disconnect() {
        this.elements.clear();
        this.active = false;
        window.removeEventListener('resize', this.checkResize);
      }
    };
  }
  
  // Even if ResizeObserver exists, patch it to prevent loop errors
  const originalResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class SafeResizeObserver extends originalResizeObserver {
    constructor(callback) {
      const safeCallback = (entries) => {
        try {
          // Use RAF to prevent loop errors
          window.requestAnimationFrame(() => {
            if (callback && entries.length > 0) {
              callback(entries);
            }
          });
        } catch (error) {
          console.warn('Suppressed error in ResizeObserver callback:', error);
        }
      };
      
      super(safeCallback);
    }
  };
  
  console.log('ResizeObserver polyfill initialized');
})();
