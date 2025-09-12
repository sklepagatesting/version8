// This script will now wait for a custom event to fire before it starts.
// This event is fired by the loader script once the initial loading sequence is complete.
window.addEventListener("scroller:start", () => {
  // --- Register GSAP Plugin ---
  gsap.registerPlugin(ModifiersPlugin);

  const scroller = document.getElementById("scroller");

  // --- Duplicate for seamless loop ---
  scroller.innerHTML += scroller.innerHTML;
  const scrollWidth = scroller.scrollWidth / 2;

  // --- Get initial offset from first card ---
  const firstCard = scroller.children[0];
  const cardStyle = window.getComputedStyle(firstCard);
  const marginRight = parseFloat(cardStyle.marginRight);
  const initialOffset = marginRight;

  let position = initialOffset;
  let velocity = 0;
  let scrollAllowed = false; // 🚫 Block all scroll input initially

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

  // --- SCROLL LOCK HELPERS ---
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

  // ✅ Lock all scrolling and inputs immediately
  lockScroll();

  // --- INTRO ANIMATION ---
  // The original setTimeout is kept but the containing `DOMContentLoaded`
  // listener is replaced with the `scroller:start` event listener.
  setTimeout(() => {
    const fastDuration = 2;
    const fastDistance = scrollWidth * 1.5;

    const tl = gsap.timeline({
      onComplete: () => {
        // ✅ Fully unlock after final offset is applied
        position = parseFloat(gsap.getProperty(scroller, "x"));
        scroller.style.height = "";
        scroller.style.overflow = "";

        unlockScroll(); // ✅ Allow normal page scrolling
        scrollAllowed = true; // ✅ Allow input to control carousel
      }
    });

    // Reveal cards + scroll carousel
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

  // --- WHEEL INPUT (disabled until scrollAllowed) ---
  window.addEventListener("wheel", (e) => {
    if (!scrollAllowed) return;
    velocity += e.deltaY * 0.05;
  }, { passive: true });

  // --- TOUCH INPUT (disabled until scrollAllowed) ---
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

  // --- GSAP Infinite Carousel Scroll Logic ---
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


















let isAnimating = false;

// Core hover logic — used for both desktop and mobile
function handleTitleHover(title, speed = 0.5) {
  const newSrc = title.dataset.img;
  if (!newSrc || currentImage.src === newSrc || isAnimating) return;

  isAnimating = true;
  nextImage.src = newSrc;
  nextImage.style.opacity = 1;
  nextImage.style.transform = "scale(1.1)";
  currentImage.style.transform = "scale(1)";

  gsap.to(currentImage, {
    opacity: 0,
    scale: 1.05,
    duration: speed,
    ease: "power4.out"
  });

  gsap.to(nextImage, {
    opacity: 1,
    scale: 1,
    duration: speed,
    ease: "power4.out",
    onComplete: () => {
      currentImage.src = newSrc;
      currentImage.style.opacity = 1;
      nextImage.style.opacity = 0;
      isAnimating = false;
    }
  });

  lastSrc = newSrc;
}

// Desktop hover
titles.forEach(title => {
  title.addEventListener("mouseenter", () => {
    handleTitleHover(title); // normal speed
  });
});

// Mobile scroll/select support
if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
  window.addEventListener("scroll", () => {
    const viewportHeight = window.innerHeight;
    let activeTitle = null;

    titles.forEach(title => {
      const rect = title.getBoundingClientRect();
      const midPoint = rect.top + rect.height / 2;

      if (midPoint > 0 && midPoint < viewportHeight) {
        activeTitle = title;
      }
    });

    if (activeTitle) {
      handleTitleHover(activeTitle, 0.2); // faster speed for fast scroll
    }
  }, { passive: true });
}







