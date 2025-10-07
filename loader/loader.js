// page-transition.js (Updated with cleanup for bfcache)

// --- Inject transition elements and styles early ---
(function injectTransitionElements() {
  const style = document.createElement("style");
  style.innerHTML = `
    html, body {
      /* Added to ensure background color is set for transition */
      background: white; 
      margin: 0;
      padding: 0;
    }
    #page-transition {
      position: fixed;
      bottom: 0;
      left: 50%;
      width: 60px;
      height: 10px;
      background: white;
      border-radius: 50%;
      transform: translateX(-50%) translateY(0) scale(1);
      z-index: 10000;
      pointer-events: none;
      transition:
        bottom 1s ease-in-out,
        width 1s ease-in-out,
        height 1s ease-in-out,
        transform 1s ease-in-out;
      display: none;
    }
    #page-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0);
      pointer-events: none;
      z-index: 9999;
      transition: background 1s ease-in-out;
      display: none;
    }
  `;
  document.head.appendChild(style);

  const transitionDiv = document.createElement("div");
  transitionDiv.id = "page-transition";
  const overlayDiv = document.createElement("div");
  overlayDiv.id = "page-overlay";

  document.body.insertBefore(transitionDiv, document.body.firstChild);
  document.body.insertBefore(overlayDiv, document.body.firstChild);
})();

// --- Cleanup function for when the page loads/restores ---
function cleanupTransitionElements() {
    const transitionEl = document.getElementById("page-transition");
    const overlayEl = document.getElementById("page-overlay");
    if (transitionEl) transitionEl.style.display = 'none';
    if (overlayEl) overlayEl.style.display = 'none';
}

function setupPageTransition() {
  const transitionEl = document.getElementById("page-transition");
  const overlayEl = document.getElementById("page-overlay");

  document.querySelectorAll('[data-transition]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');

      // Reset style to small dot
      transitionEl.style.display = "none";
      overlayEl.style.display = "none";
      transitionEl.style.transition = "none";
      transitionEl.style.bottom = "0";
      transitionEl.style.left = "50%";
      transitionEl.style.width = "10px";
      transitionEl.style.height = "10px";
      transitionEl.style.borderRadius = "50%";
      transitionEl.style.transform = "translateX(-50%) translateY(0) scale(1)";
      overlayEl.style.transition = "none";
      overlayEl.style.background = "rgba(0,0,0,0)";
      transitionEl.style.display = "block";
      overlayEl.style.display = "block";

      requestAnimationFrame(() => {
        // Animate to full screen
        transitionEl.style.transition =
          "bottom 1s ease-in-out, width 1s ease-in-out, height 1s ease-in-out, transform 1s ease-in-out";
        transitionEl.style.bottom = "50%";
        transitionEl.style.width = "100vw";
        transitionEl.style.height = "100vh";
        transitionEl.style.borderRadius = "0";
        transitionEl.style.transform = "translateX(-50%) translateY(50%) scale(1)";
        overlayEl.style.transition = "background 1s ease-in-out";
        overlayEl.style.background = "rgba(0,0,0,0.5)";
      });

      // Navigate after the transition time
      setTimeout(() => {
        window.location.href = href;
      }, 1000);
    });
  });
}

// Attach the main setup
document.addEventListener('DOMContentLoaded', setupPageTransition);

// --- Solution: Cleanup on Load and Restore ---

// 1. Cleanup immediately when the DOM loads (for a fresh navigation)
document.addEventListener('DOMContentLoaded', cleanupTransitionElements);

// 2. Cleanup when the page is restored from the browser's Back/Forward cache (bfcache)
window.addEventListener('pageshow', (event) => {
    // Check if the page was restored from bfcache
    if (event.persisted) { 
        cleanupTransitionElements();
    }
});
