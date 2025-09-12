// This is the final, complete JavaScript file that combines all features.
// It handles the first-visit-only loader, the hero and text animations,
// the page transitions, and ensures everything is synchronized correctly.
// This script replaces all previous scripts you were using.

// --- Inject transition elements and styles early ---
(function injectTransitionElements() {
  const style = document.createElement("style");
  style.innerHTML = `
    html, body {
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

// --- Determine if the loader should run ---
const shouldRunLoader = (() => {
  const isFirstLoadInSession = !sessionStorage.getItem('hasRunLoader');
  let navigationType = 'navigate';
  if (window.performance && window.performance.getEntriesByType) {
    const navEntries = window.performance.getEntriesByType("navigation");
    if (navEntries.length > 0) navigationType = navEntries[0].type;
  }
  return isFirstLoadInSession && navigationType !== 'back_forward';
})();

// --- Text reveal with IntersectionObserver ---
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const textLine = entry.target.querySelector('.text-line');
      if (textLine) {
        const allContainers = Array.from(document.querySelectorAll('.text-container'));
        const index = allContainers.indexOf(entry.target);
        textLine.style.animationDelay = `${index * 0.2}s`;
        textLine.classList.add('animate');
        observer.unobserve(entry.target);
      }
    }
  });
}, { threshold: 1 });

function startObservingText() {
  document.querySelectorAll('.text-container').forEach(container => {
    observer.observe(container);
  });
}

function heroIn() {
  gsap.from(".hero", {
    y: 50,
    opacity: 0,
    duration: 1.2,
    ease: "power4.inOut"
  });
}

// --- Loader animation ---
function runLoader() {
  const screen = document.createElement('div');
  Object.assign(screen.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100dvh',
    backgroundColor: 'white',
    zIndex: '999999999',
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    transform: 'scale(1)',
    transition: 'clip-path 1s cubic-bezier(.94,-0.01,0,.99), transform 1s cubic-bezier(.89,.04,0,.99)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'black',
    fontSize: '12px',
    fontFamily: 'Arial, sans-serif'
  });
  document.documentElement.appendChild(screen);

  const shadowOverlay = document.createElement('div');
  Object.assign(shadowOverlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100dvh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: '999999998',
    opacity: '1',
    transition: 'opacity 1s ease-out'
  });
  document.documentElement.appendChild(shadowOverlay);

  const whiteOverlay = document.createElement('div');
  Object.assign(whiteOverlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100dvh',
    backgroundColor: 'white',
    zIndex: '999999997'
  });
  document.documentElement.appendChild(whiteOverlay);

  const counter = document.createElement('div');
  counter.textContent = '0%';
  counter.style.transform = 'scale(1)';
  counter.style.transition = 'transform 0.2s ease';
  screen.appendChild(counter);

  let fakeProgress = 0;
  let interval = setInterval(() => {
    if (fakeProgress < 90) {
      fakeProgress += Math.random() * 5;
      counter.textContent = `${Math.floor(fakeProgress)}%`;
      counter.style.transform = `scale(${1 + fakeProgress / 100})`;
    }
  }, 100);

  window.addEventListener('load', () => {
    clearInterval(interval);

    let finalProgress = fakeProgress;
    const completeInterval = setInterval(() => {
      finalProgress += 2;
      counter.textContent = `${Math.min(100, Math.floor(finalProgress))}%`;
      counter.style.transform = `scale(${1 + finalProgress / 100})`;

      if (finalProgress >= 100) {
        clearInterval(completeInterval);
        screen.style.clipPath = 'polygon(0 0, 100% 0, 100% 0, 0 0)';
        screen.style.transform = 'scale(0)';
        shadowOverlay.style.opacity = '0';

        setTimeout(() => {
          screen.remove();
          shadowOverlay.remove();
          whiteOverlay.remove();

          const wrapper = document.getElementById("main-content");
          if (wrapper) wrapper.style.display = "block";
          document.body.style.overflow = "auto";
          document.body.classList.remove("preload");

          heroIn();
          startObservingText();
          window.dispatchEvent(new Event("scroller:start"));
          window.dispatchEvent(new Event("page:ready")); // Signal that the page is ready and transitions can be active
        }, 1000);
      }
    }, 20);
  });
}

// Global flag to control when transitions are allowed
let isPageReady = false;

// --- Page Transition Logic ---
function setupPageTransition() {
  const transitionEl = document.getElementById("page-transition");
  const overlayEl = document.getElementById("page-overlay");

  document.querySelectorAll('[data-transition]').forEach(link => {
    link.addEventListener('click', (e) => {
      // Only run the transition if the page is ready
      if (!isPageReady) {
        return;
      }
      
      e.preventDefault();
      const href = link.getAttribute('href');

      // Hide elements first
      transitionEl.style.display = "none";
      overlayEl.style.display = "none";

      // Reset styles to small dot at bottom center
      transitionEl.style.transition = "none";
      transitionEl.style.bottom = "0";
      transitionEl.style.left = "50%";
      transitionEl.style.width = "10px";
      transitionEl.style.height = "10px";
      transitionEl.style.borderRadius = "50%";
      transitionEl.style.transform = "translateX(-50%) translateY(0) scale(1)";
      overlayEl.style.transition = "none";
      overlayEl.style.background = "rgba(0,0,0,0)";

      // Show elements before animating
      transitionEl.style.display = "block";
      overlayEl.style.display = "block";

      requestAnimationFrame(() => {
        // Animate to full screen from bottom center
        transitionEl.style.transition = "bottom 1s ease-in-out, width 1s ease-in-out, height 1s ease-in-out, transform 1s ease-in-out";
        transitionEl.style.bottom = "50%";
        transitionEl.style.width = "100vw";
        transitionEl.style.height = "100vh";
        transitionEl.style.borderRadius = "0";
        transitionEl.style.transform = "translateX(-50%) translateY(50%) scale(1)";

        overlayEl.style.transition = "background 1s ease-in-out";
        overlayEl.style.background = "rgba(0,0,0,0.5)";
      });

      setTimeout(() => {
        window.location.href = href;
      }, 1000);
    });
  });
}

// --- Breakpoint reload ---
const BREAKPOINTS = {
  mobile: { min: 0, max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024, max: Infinity }
};

function getBreakpoint() {
  const w = window.innerWidth;
  if (w <= BREAKPOINTS.mobile.max) return "mobile";
  if (w <= BREAKPOINTS.tablet.max) return "tablet";
  return "desktop";
}

let prevBreakpoint = getBreakpoint();

window.addEventListener("resize", () => {
  const bp = getBreakpoint();
  if (bp !== prevBreakpoint) {
    prevBreakpoint = bp; // update immediately
    sessionStorage.removeItem("hasRunLoader");

    // Force full reload with cache bust
    window.location.href = window.location.pathname +
      (window.location.search ? window.location.search + '&' : '?') +
      '_br=' + Date.now();
  }
});


// --- Loader and Transition Control ---
document.addEventListener('DOMContentLoaded', () => {
  if (shouldRunLoader) {
    runLoader();
    sessionStorage.setItem('hasRunLoader', 'true');
  } else {
    // If loader is skipped (e.g., back navigation), the page is ready immediately.
    const wrapper = document.getElementById("main-content");
    if (wrapper) wrapper.style.display = "block";
    document.body.style.overflow = "auto";
    document.body.classList.remove("preload");
    
    // Set the flag and fire the events for a skipped loader.
    isPageReady = true;
    startObservingText();
    heroIn();
    window.dispatchEvent(new Event("scroller:start"));
  }

  // Listen for the custom event to set the flag
  window.addEventListener('page:ready', () => {
    isPageReady = true;
  });

  // Set up page transition listeners after the DOM is ready.
  setupPageTransition();
});

// --- Idle session reset logic ---
let activityTimer;
const IDLE_TIMEOUT = 5 * 60 * 1000;
function resetIdleTimer() {
  clearTimeout(activityTimer);
  activityTimer = setTimeout(() => {
    sessionStorage.removeItem('hasRunLoader');
    console.log("Idle detected, loader flag reset.");
  }, IDLE_TIMEOUT);
}
['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'].forEach(evt =>
  document.addEventListener(evt, resetIdleTimer, false)
);
resetIdleTimer();

// --- bfcache handling ---
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    const wrapper = document.getElementById("main-content");
    if (wrapper) wrapper.style.display = "block";
    document.body.style.overflow = "auto";
    document.body.classList.remove("preload");
  }
});