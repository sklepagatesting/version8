// --- Inertia-based Smooth Scroll ---
(function() {
  let currentY = 0;                // Current scroll position
  let velocity = 0;                // Current scroll velocity
  const friction = 0.98;           // Scroll resistance (lower = more resistance)
  const stopThreshold = 0.05;      // Minimum velocity before stopping
  const maxInputVelocity = 3;      // Limit input speed from one wheel/touch event
  const maxTotalVelocity = 50;     // Maximum velocity allowed
  const scrollScale = 0.2;         // How much wheel movement affects scroll

  function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  function animate() {
    // Apply friction to slow down scrolling
    velocity *= friction;

    // Stop if velocity is very small
    if (Math.abs(velocity) < stopThreshold) {
      velocity = 0;
      return;
    }

    // Update scroll position
    currentY += velocity;

    // Ensure we don't scroll beyond page boundaries
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    currentY = clamp(currentY, 0, maxScroll);

    // Move the page
    window.scrollTo(0, currentY);

    // Keep animating until velocity reaches zero
    requestAnimationFrame(animate);
  }

  // Handle mouse wheel input
  window.addEventListener('wheel', (e) => {
    e.preventDefault();

    // Convert wheel delta to velocity
    let inputVelocity = e.deltaY * scrollScale;
    inputVelocity = clamp(inputVelocity, -maxInputVelocity, maxInputVelocity);

    // Add to current velocity and clamp total
    velocity += inputVelocity;
    velocity = clamp(velocity, -maxTotalVelocity, maxTotalVelocity);

    // If there's enough velocity, start animation loop
    if (Math.abs(velocity) >= stopThreshold) {
      requestAnimationFrame(animate);
    }
  }, { passive: false });

  // Sync starting position with actual scroll
  window.addEventListener('load', () => {
    currentY = window.scrollY;
  });
})();
