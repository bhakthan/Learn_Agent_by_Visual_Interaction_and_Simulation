window.ResizeObserver = window.ResizeObserver || class ResizeObserver { 
  constructor(cb) { this.cb = cb; }
  observe() {}
  unobserve() {}
  disconnect() {}
};
