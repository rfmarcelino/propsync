document.addEventListener('DOMContentLoaded', () => {
  // --- Helper Functions ---
  const parseVal = (el, selector) => {
    const target = el.querySelector(selector);
    if (!target || !target.textContent) return null;
    const value = target.textContent.trim().replace(/[^0-9.]+/g, '');
    if (value === '') return null;
    const num = parseInt(value, 10);
    return isNaN(num) ? null : num;
  };

  // --- Check availability link ---
  const applyButtons = document.querySelectorAll('[applylink]');
  applyButtons.forEach(function (button) {
    const linkValue = button.getAttribute('applylink');
    if (linkValue) {
      button.setAttribute('href', linkValue);
    }
  });

  // --- Format prices with commas ---
  const priceElements = document.querySelectorAll('.price-min-card-value, .price-max-card-value');
  priceElements.forEach(priceEl => {
    const price = parseVal(document, '.' + priceEl.className.split(' ')[0]);
    if (price !== null && price >= 0) {
      priceEl.textContent = Math.round(price).toLocaleString();
    }
  });

  // --- Format square footage with commas ---
  const sqrElements = document.querySelectorAll('.sqr-min-card-value, .sqr-max-card-value');
  sqrElements.forEach(sqrEl => {
    const sqr = parseVal(document, '.' + sqrEl.className.split(' ')[0]);
    if (sqr !== null) {
      sqrEl.textContent = Math.round(sqr).toLocaleString();
    }
  });
  // Square footage comparison
  const sqrMinValue = document.querySelector('.sqr-min-card-value');
  const sqrMaxValue = document.querySelector('.sqr-max-card-value');
  const sqrSpacer = document.querySelector('.sqr-spacer');

  if (sqrMinValue && sqrMaxValue && sqrSpacer) {
    if (sqrMinValue.textContent === sqrMaxValue.textContent) {
      sqrSpacer.style.display = 'none';
      sqrMaxValue.style.display = 'none';
    }
  }

  // Price comparison
  const priceMinValue = document.querySelector('.price-min-card-value');
  const priceMaxValue = document.querySelector('.price-max-card-value');
  const priceSpacer = document.querySelector('.price-spacer');
  const startingAt = document.querySelector('.startingat');

  if (priceMinValue && priceMaxValue && priceSpacer) {
    if (priceMinValue.textContent === priceMaxValue.textContent) {
      priceSpacer.style.display = 'none';
      priceMaxValue.style.display = 'none';

      // Show the .startingat element if present
      if (startingAt) {
        startingAt.style.display = 'inline';
      }
    }
  }
  // Image slider
  // Get elements
  const slider = document.querySelector(".floorplan-slider");
  const slideContainer = slider.querySelector(".w-dyn-items");
  const slideItems = slider.querySelectorAll(".w-dyn-item");
  const leftArrow = slider.querySelector(".slider-arrow-left_small");
  const rightArrow = slider.querySelector(".slider-arrow-right_small");

  let currentSlide = 0;
  let slideInterval;
  const totalSlides = slideItems.length;

  // Initialize slider
  function initSlider() {
    // Set up the slider container for animations
    slideContainer.style.display = "flex";
    slideContainer.style.transition = "transform 0.5s ease-in-out";
    slideContainer.style.width = `${totalSlides * 100}%`;

    // Set up individual slides
    slideItems.forEach(slide => {
      slide.style.flex = "1";
      slide.style.width = `${100 / totalSlides}%`;
    });

    // Start automatic sliding
    startAutoSlide();

    // Add click event listeners to arrows
    leftArrow.addEventListener("click", () => moveSlide("left"));
    rightArrow.addEventListener("click", () => moveSlide("right"));
  }

  // Move to a specific slide index with animation
  function goToSlide(index) {
    currentSlide = index;
    const offset = -currentSlide * (100 / totalSlides);
    slideContainer.style.transform = `translateX(${offset}%)`;
  }

  // Handle slide movement based on direction
  function moveSlide(direction) {
    if (direction === "right") {
      currentSlide = (currentSlide + 1) % totalSlides;
    } else {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    }

    goToSlide(currentSlide);
    resetAutoSlide();
  }

  // Start automatic sliding (right to left motion = next slide)
  function startAutoSlide() {
    slideInterval = setInterval(() => moveSlide("right"), 2000);
  }

  // Reset the auto slide timer when manually navigating
  function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
  }

  // Initialize the slider
  initSlider();
});
