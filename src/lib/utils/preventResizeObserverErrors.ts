/**
 * Global fixes for ReactFlow and ResizeObserver errors
 */

/**
 * Apply global optimizations to ReactFlow components
 * This helps prevent common issues with React Flow rendering
 */
export function applyReactFlowGlobalOptimizations() {
  // Wait until DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOptimizations);
  } else {
    initOptimizations();
  }
}

function initOptimizations() {
  // Create global CSS that optimizes ReactFlow rendering
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    /* Essential stability fixes for ReactFlow elements */
    .react-flow__viewport, 
    .react-flow__container,
    .react-flow__renderer,
    .react-flow {
      transform: translateZ(0) !important;
      will-change: transform !important;
      backface-visibility: hidden !important;
      -webkit-backface-visibility: hidden !important;
      contain: layout !important;
    }

    .react-flow__node {
      opacity: 1 !important;
      visibility: visible !important;
      display: block !important;
    }

    .react-flow__edge-path {
      opacity: 1 !important;
      visibility: visible !important;
      stroke-width: 1.5px !important;
    }
  `;
  document.head.appendChild(styleEl);

  // Setup global error suppressions
  setupErrorSuppressions();

  // Schedule periodic fixes
  window.setInterval(() => {
    applyReactFlowFixes();
  }, 10000);

  // Apply initial fixes
  setTimeout(applyReactFlowFixes, 1000);
  setTimeout(applyReactFlowFixes, 3000);
}

function applyReactFlowFixes() {
  // Fix all ReactFlow nodes
  document.querySelectorAll('.react-flow__node').forEach(node => {
    if (node instanceof HTMLElement) {
      node.style.opacity = '1';
      node.style.visibility = 'visible';
      node.style.display = 'block';
      node.style.transform = 'translateZ(0)';
    }
  });

  // Fix all ReactFlow edges
  document.querySelectorAll('.react-flow__edge').forEach(edge => {
    if (edge instanceof HTMLElement) {
      edge.style.opacity = '1';
      edge.style.visibility = 'visible';
    }
    
    // Fix edge paths
    edge.querySelectorAll('path').forEach(path => {
      path.setAttribute('stroke-width', '1.5');
      path.setAttribute('opacity', '1');
      path.setAttribute('visibility', 'visible');
    });
  });

  // Fix all flow containers
  document.querySelectorAll('.react-flow__container, .react-flow__renderer, .react-flow__viewport').forEach(el => {
    if (el instanceof HTMLElement) {
      el.style.transform = 'translateZ(0)';
      el.style.backfaceVisibility = 'hidden';
      el.style.contain = 'layout paint';
    }
  });
}

function setupErrorSuppressions() {
  // Suppress ResizeObserver loop errors
  const originalConsoleError = console.error;
  console.error = function(msg, ...args) {
    if (
      typeof msg === 'string' &&
      (msg.includes('ResizeObserver loop') ||
       msg.includes('ResizeObserver was created') ||
       msg.includes('undelivered notifications') ||
       msg.includes('ResizeObserver completed'))
    ) {
      return; // Suppress these errors
    }
    
    // Pass through all other errors
    return originalConsoleError.apply(console, [msg, ...args]);
  };
}