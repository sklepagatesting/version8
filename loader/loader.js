document.write(`
  <style>
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
  </style>
  <div id="page-transition"></div>
  <div id="page-overlay"></div>
`);

document.addEventListener("DOMContentLoaded", () => {
  const transitionEl = document.getElementById("page-transition");
  const overlayEl = document.getElementById("page-overlay");

  // Initialize Swup targeting #swup container
  const swup = new Swup({
    containers: ["#swup"],
    animationSelector: "[data-transition]",
  });

  function animateOut() {
    return new Promise((resolve) => {
      // Show and animate transition to full screen
      transitionEl.style.display = "block";
      overlayEl.style.display = "block";

      // Reset styles
      transitionEl.style.transition = "none";
      transitionEl.style.bottom = "0";
      transitionEl.style.left = "50%";
      transitionEl.style.width = "10px";
      transitionEl.style.height = "10px";
      transitionEl.style.borderRadius = "50%";
      transitionEl.style.transform = "translateX(-50%) translateY(0) scale(1)";
      overlayEl.style.transition = "none";
      overlayEl.style.background = "rgba(0,0,0,0)";

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
        resolve();
      }, 1000); // match transition duration
    });
  }

  function animateIn() {
    // Animate transition back to small dot and hide
    transitionEl.style.transition = "bottom 1s ease-in-out, width 1s ease-in-out, height 1s ease-in-out, transform 1s ease-in-out";
    transitionEl.style.bottom = "0";
    transitionEl.style.width = "10px";
    transitionEl.style.height = "10px";
    transitionEl.style.borderRadius = "50%";
    transitionEl.style.transform = "translateX(-50%) translateY(0) scale(1)";

    overlayEl.style.transition = "background 1s ease-in-out";
    overlayEl.style.background = "rgba(0,0,0,0)";

    setTimeout(() => {
      transitionEl.style.display = "none";
      overlayEl.style.display = "none";
    }, 1000);
  }

  // Swup lifecycle hooks
  swup.on("clickLink", (event) => {
    // Prevent immediate navigation, play animation first
    event.preventDefault();

    animateOut().then(() => {
      swup.loadPage({
        url: event.detail.href,
      });
    });
  });

  swup.on("contentReplaced", () => {
    animateIn();

    // Trigger your text animation if needed here
    const lines = document.querySelectorAll('.text-line');
    lines.forEach((line, i) => {
      line.style.animationDelay = `${i * 0.2}s`;
      line.classList.add('text-line');
    });
  });

  // On initial load, fade background and trigger text animation
  setTimeout(() => {
    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';

    const lines = document.querySelectorAll('.text-line');
    lines.forEach((line, i) => {
      line.style.animationDelay = `${i * 0.2}s`;
      line.classList.add('text-line');
    });
  }, 50);
});
