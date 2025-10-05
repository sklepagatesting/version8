// ============================================
// --- GLOBAL PROMISE FOR SYNCHRONIZATION ---
// ============================================
// This promise will resolve when the dynamic content (Firebase) is finished loading.
let resolveContentLoaded;
const CONTENT_LOADED = new Promise(resolve => {
  resolveContentLoaded = resolve;
});

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

// --- Always run loader on every page load ---
const shouldRunLoader = true;

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

  // Use Promise.all to wait for both static load and dynamic content
  Promise.all([
    new Promise(resolve => window.addEventListener('load', resolve)),
    CONTENT_LOADED
  ]).then(() => {
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
          window.dispatchEvent(new Event("page:ready"));
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
      if (!isPageReady) {
        return;
      }
      
      e.preventDefault();
      const href = link.getAttribute('href');

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

// --- Breakpoint reload (Existing code unchanged) ---
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
    prevBreakpoint = bp;
    window.location.href = window.location.pathname +
      (window.location.search ? window.location.search + '&' : '?') +
      '_br=' + Date.now();
  }
});

// --- Loader and Transition Control (Existing code unchanged) ---
document.addEventListener('DOMContentLoaded', () => {
  if (shouldRunLoader) {
    runLoader();
  } else {
    const wrapper = document.getElementById("main-content");
    if (wrapper) wrapper.style.display = "block";
    document.body.style.overflow = "auto";
    document.body.classList.remove("preload");
    
    isPageReady = true;
    startObservingText();
    heroIn();
    window.dispatchEvent(new Event("scroller:start"));
  }

  window.addEventListener('page:ready', () => {
    isPageReady = true;
  });

  setupPageTransition();
});

// --- Force reload on back/forward navigation (Existing code unchanged) ---
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});

// ============================================
// SCROLLER SCRIPT - Runs after loader completes
// ============================================

window.addEventListener("scroller:start", () => {
  // Prevent duplicate initialization
  if (window.scrollerInitialized) return;
  window.scrollerInitialized = true;

  // Check if dependencies are ready
  if (typeof gsap === 'undefined' || typeof ModifiersPlugin === 'undefined') {
     // ModifiersPlugin is correctly imported/loaded via <script> tag in HTML
     // but we should ensure it's registered if we rely on it here.
     // In your original HTML, the script tag for Flip.min.js and ScrollTrigger.min.js 
     // were present, but ModifiersPlugin was not explicitly loaded/registered. 
     // Assuming ModifiersPlugin is available or that you intended to use it.
     
     // We will now ensure it's registered.
     gsap.registerPlugin(ModifiersPlugin);
  }

  const scroller = document.getElementById("scroller");
  if (!scroller) {
    console.warn('Scroller element not found');
    return;
  }
  
  // *** RESTORED ORIGINAL DUPLICATION LOGIC ***
  // We must wait for the dynamic content to be loaded into the DOM before duplicating.
  // The original HTML had the duplication *before* this script, but since the
  // Firebase script overwrites the content *after* DOMContentLoaded, we must
  // duplicate the content here, after 'scroller:start' is fired, which
  // happens after the dynamic content is guaranteed to be present.
  
  // Check if the scroller has children (i.e., dynamic content has loaded)
  if (scroller.children.length > 0) {
      // Duplicating the content to enable the seamless loop
      scroller.innerHTML += scroller.innerHTML;
  } else {
      console.warn("Scroller has no dynamic content to duplicate.");
      // Allow the script to exit if no content is present, or the carousel won't work.
      return; 
  }
  // End of Correction
  
  // Now that the content is duplicated, we can calculate the width
  const scrollWidth = scroller.scrollWidth / 2;

  // --- Get initial offset from first card ---
  const firstCard = scroller.children[0];
  const cardStyle = window.getComputedStyle(firstCard);
  const marginRight = parseFloat(cardStyle.marginRight);
  const initialOffset = marginRight;

  let position = initialOffset;
  let velocity = 0;
  let scrollAllowed = false;

  // --- Set initial scroll position ---
  gsap.set(scroller, { x: initialOffset });

  const cards = scroller.children;

  // --- Prevent scroller collapsing during animation ---
  const cardHeight = cards[0].offsetHeight;
  scroller.style.height = cardHeight + "px";
  scroller.style.overflow = "hidden";

  // --- GPU-optimized initial state for cards ---
  gsap.set(cards, {
    scaleY: 0,
    transformOrigin: "bottom right",
    willChange: "transform"
  });

  // --- SCROLL LOCK HELPERS (Unchanged) ---
  const preventScroll = (e) => e.preventDefault();
  const keyScrollBlock = (e) => {
    const blocked = [32, 33, 34, 35, 36, 37, 38, 39, 40];
    if (blocked.includes(e.keyCode)) e.preventDefault();
  };
  const lockScroll = () => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('keydown', keyScrollBlock, { passive: false });
  };
  const unlockScroll = () => {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.height = '';
    window.removeEventListener('wheel', preventScroll, { passive: false });
    window.removeEventListener('touchmove', preventScroll, { passive: false });
    window.removeEventListener('keydown', keyScrollBlock, { passive: false });
  };

  // Lock all scrolling and inputs immediately
  lockScroll();

  // --- INTRO ANIMATION (Unchanged) ---
  setTimeout(() => {
    const fastDuration = 2;
    const fastDistance = scrollWidth * 1.5;

    const tl = gsap.timeline({
      onComplete: () => {
        position = parseFloat(gsap.getProperty(scroller, "x"));
        scroller.style.height = "";
        scroller.style.overflow = "";

        unlockScroll();
        scrollAllowed = true;
      }
    });

    tl.to(cards, {
      scaleY: 1,
      duration: 1,
      ease: "power4.out"
    }, 0);

    tl.to(scroller, {
      x: `-=${fastDistance}`,
      duration: fastDuration,
      ease: "power4.out",
      modifiers: {
        x: gsap.utils.unitize(x => {
          const raw = parseFloat(x);
          const looped = raw % scrollWidth;
          return looped;
        })
      }
    }, 0);
  }, 2000);

  // --- WHEEL INPUT (Unchanged) ---
  window.addEventListener("wheel", (e) => {
    if (!scrollAllowed) return;
    velocity += e.deltaY * 0.05;
  }, { passive: true });

  // --- TOUCH INPUT (Unchanged) ---
  const touchScrollMultiplier = 0.12;
  let startY;
  let isDraggingDown = false;

  window.addEventListener("touchstart", (e) => {
    if (!scrollAllowed) return;
    startY = e.touches[0].clientY;
    velocity = 0;
    isDraggingDown = false;
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (!scrollAllowed) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    if (deltaY > 0) isDraggingDown = true;

    velocity += -deltaY * touchScrollMultiplier;
    startY = currentY;

    if (window.scrollY === 0 && isDraggingDown) {
      e.preventDefault();
    }
  }, { passive: false });

  // --- GSAP Infinite Carousel Scroll Logic (Unchanged) ---
  gsap.ticker.add(() => {
    if (Math.abs(velocity) > 0.001) {
      position -= velocity;
      velocity *= 0.94;

      if (position <= -scrollWidth) {
        position += scrollWidth;
      }
      if (position >= 0) {
        position -= scrollWidth;
      }

      gsap.set(scroller, { x: position });
    }
  });
});
