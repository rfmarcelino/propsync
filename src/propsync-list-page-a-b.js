document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 PropSync List Page A/B Script Loaded');

  // --- Debug: Check for missing classes ---
  const missingClasses = [];
  const requiredSelectors = {
    'cards': '.card-wrapper',
    'filterButton': '.button-filter',
    'resetButton': '.button-reset',
    'bedroomWrappers': '.bedroom-wrapper',
    'priceRange': '.price-range',
    'sqrRange': '.sqr-range'
  };

  Object.entries(requiredSelectors).forEach(([name, selector]) => {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) {
      missingClasses.push(selector);
    }
    console.log(`${name} (${selector}): ${elements.length} found`);
  });

  if (missingClasses.length > 0) {
    console.warn('❌ Missing required CSS classes:', missingClasses);
    console.log('📋 Add these classes in Webflow:');
    missingClasses.forEach(cls => console.log(`   - ${cls}`));
  } else {
    console.log('✅ All required classes found!');
  }

  // --- Check availability link ---
  const applyButtons = document.querySelectorAll('[applylink]');
  applyButtons.forEach(function (button) {
    const linkValue = button.getAttribute('applylink');
    if (linkValue) {
      button.setAttribute('href', linkValue);
    }
  });
  // --- DOM Element Selectors ---
  const cards = document.querySelectorAll('.card-wrapper');
  const filterButton = document.querySelector('.button-filter');
  const resetButton = document.querySelector('.button-reset');

  // Bedroom Filter Elements
  const bedroomWrappers = document.querySelectorAll('.bedroom-wrapper');
  const bedroomCheckboxes = document.querySelectorAll('.bedroom-wrapper input[type="checkbox"]');

  // Price Range Slider Elements
  const priceRangeContainer = document.querySelector('.price-range');
  const priceMinHandler = priceRangeContainer?.querySelector('.price-min-handler');
  const priceMaxHandler = priceRangeContainer?.querySelector('.price-max-handler');
  const priceRangeBar = priceRangeContainer?.querySelector('.price-range-bar');
  const priceMinDisplay = priceRangeContainer?.querySelector('.price-min');
  const priceMaxDisplay = priceRangeContainer?.querySelector('.price-max');
  const priceTrack = priceMinHandler?.closest('.rangeslider_track'); // Find track relative to handler

  // Square Footage Range Slider Elements
  const sqrRangeContainer = document.querySelector('.sqr-range'); // Using hyphen as confirmed
  const sqrMinHandler = sqrRangeContainer?.querySelector('.sqr-min-handler');
  const sqrMaxHandler = sqrRangeContainer?.querySelector('.sqr-max-handler');
  const sqrRangeBar = sqrRangeContainer?.querySelector('.sqr-range-bar');
  const sqrMinDisplay = sqrRangeContainer?.querySelector('.sqr-min');
  const sqrMaxDisplay = sqrRangeContainer?.querySelector('.sqr-max');
  const sqrTrack = sqrMinHandler?.closest('.rangeslider_track'); // Find track relative to handler


  // Results Count Elements (Optional, based on example markup)
  const resultsCountEl = document.querySelector('[fs-cmsfilter-element="results-count"]');
  const itemsCountEl = document.querySelector('[fs-cmsfilter-element="items-count"]');


  // --- Initial Data Storage ---
  let overallMinPrice = Infinity;
  let overallMaxPrice = -Infinity;
  let overallMinSqr = Infinity;
  let overallMaxSqr = -Infinity;
  const availableBedrooms = new Set();
  const initialCardData = []; // Store initial card data for easier filtering

  // --- Helper Functions ---
  const parseVal = (el, selector, isFloat = false) => {
    const target = el.querySelector(selector);
    if (!target || !target.textContent) return null;
    const value = target.textContent.trim().replace(/[^0-9.]+/g, '');
    if (value === '') return null;
    const num = isFloat ? parseFloat(value) : parseInt(value, 10);
    return isNaN(num) ? null : num; // Return null if parsing fails
  };

  const formatCurrency = (value) => {
    // Simple formatting, ensure it returns a string
    return '$' + Math.round(value).toString(); // Add $ sign back
  }

  const formatSqft = (value) => {
    // Simple formatting, ensure it returns a string
    return Math.round(value).toString(); // No $ sign
  }

  // --- Initialization ---
  function initializeFilters() {
    console.log("Initializing filters...");

    // Debug: Show what card-like elements exist
    if (!cards || cards.length === 0) {
      console.warn("❌ No cards found with class '.card-wrapper'");
      console.log("🔍 Looking for potential card elements...");

      // Look for common card patterns
      const potentialCards = [
        document.querySelectorAll('[class*="card"]'),
        document.querySelectorAll('[class*="floor-plan"]'),
        document.querySelectorAll('[class*="unit"]'),
        document.querySelectorAll('[class*="listing"]')
      ];

      potentialCards.forEach((elements, index) => {
        const patterns = ['card', 'floor-plan', 'unit', 'listing'];
        if (elements.length > 0) {
          console.log(`   Found ${elements.length} elements with "${patterns[index]}" in class name`);
          console.log(`   First element classes:`, elements[0].className);
        }
      });

      console.log("💡 Add 'card-wrapper' class to your floor plan card containers");
    }

    // Reset overall ranges
    overallMinPrice = Infinity;
    overallMaxPrice = -Infinity;
    overallMinSqr = Infinity;
    overallMaxSqr = -Infinity;
    availableBedrooms.clear();
    initialCardData.length = 0; // Clear previous data

    if (!cards || cards.length === 0) {
      console.warn("No cards found with class '.card-wrapper'. Filtering will not work.");
      // Set default ranges even if no cards
      overallMinPrice = 0;
      overallMaxPrice = 1000;
      overallMinSqr = 0;
      overallMaxSqr = 2000;
    } else {
      cards.forEach((card, index) => {
        const bed = parseVal(card, '.bedroom-card-value');
        const priceMin = parseVal(card, '.price-min-card-value');
        const priceMax = parseVal(card, '.price-max-card-value');
        const sqrMin = parseVal(card, '.sqr-min-card-value');
        const sqrMax = parseVal(card, '.sqr-max-card-value');

        // Store data associated with the card element
        const cardData = {
          element: card,
          bed: bed,
          priceMin: priceMin,
          priceMax: priceMax,
          sqrMin: sqrMin,
          sqrMax: sqrMax,
        };
        initialCardData.push(cardData);

        // Update overall ranges and available bedrooms
        if (cardData.bed !== null) availableBedrooms.add(cardData.bed);
        if (cardData.priceMin !== null) overallMinPrice = Math.min(overallMinPrice, cardData.priceMin);
        if (cardData.priceMax !== null) overallMaxPrice = Math.max(overallMaxPrice, cardData.priceMax);
        if (cardData.sqrMin !== null) overallMinSqr = Math.min(overallMinSqr, cardData.sqrMin);
        if (cardData.sqrMax !== null) overallMaxSqr = Math.max(overallMaxSqr, cardData.sqrMax);
      });
    }

    // Handle cases where no data was found or only one value exists
    if (overallMinPrice === Infinity) overallMinPrice = 0;
    if (overallMaxPrice === -Infinity || overallMaxPrice < overallMinPrice) overallMaxPrice = Math.max(1000, overallMinPrice);
    if (overallMinSqr === Infinity) overallMinSqr = 0;
    if (overallMaxSqr === -Infinity || overallMaxSqr < overallMinSqr) overallMaxSqr = Math.max(2000, overallMinSqr);

    if (overallMaxPrice <= overallMinPrice) overallMaxPrice = overallMinPrice + 1;
    if (overallMaxSqr <= overallMinSqr) overallMaxSqr = overallMinSqr + 1;


    console.log("Overall Ranges:", { overallMinPrice, overallMaxPrice, overallMinSqr, overallMaxSqr });
    console.log("Available Bedrooms:", availableBedrooms);


    // --- Update Filter UI with Initial Values ---

    // Bedrooms: Show/hide options based on availability
    bedroomWrappers.forEach(wrapper => {
      const valueEl = wrapper.querySelector('.bedroom-value');
      const value = valueEl ? parseInt(valueEl.textContent.trim(), 10) : NaN;
      if (valueEl && !isNaN(value)) {
        wrapper.style.display = availableBedrooms.has(value) ? '' : 'none';
      } else {
        wrapper.style.display = 'none'; // Hide if no value found
      }
    });

    // Price Slider
    if (priceRangeContainer && priceMinDisplay && priceMaxDisplay) {
      console.log("✅ Setting up Price Slider UI");
      priceMinDisplay.textContent = formatCurrency(overallMinPrice);
      priceMaxDisplay.textContent = formatCurrency(overallMaxPrice);
      priceRangeContainer.dataset.min = overallMinPrice;
      priceRangeContainer.dataset.max = overallMaxPrice;
      // Set default styles explicitly before setup
      if (priceMinHandler) priceMinHandler.style.left = '0%';
      if (priceMaxHandler) priceMaxHandler.style.left = '100%';
      if (priceRangeBar) {
        priceRangeBar.style.left = '0%';
        priceRangeBar.style.width = '100%';
      }
      console.log("Price data attributes:", priceRangeContainer.dataset.min, priceRangeContainer.dataset.max);
    } else {
      console.warn("❌ Price slider UI elements not found:");
      console.log(`   .price-range container: ${priceRangeContainer ? '✅' : '❌'}`);
      console.log(`   .price-min display: ${priceMinDisplay ? '✅' : '❌'}`);
      console.log(`   .price-max display: ${priceMaxDisplay ? '✅' : '❌'}`);
      console.log(`   .price-min-handler: ${priceMinHandler ? '✅' : '❌'}`);
      console.log(`   .price-max-handler: ${priceMaxHandler ? '✅' : '❌'}`);
      console.log(`   .price-range-bar: ${priceRangeBar ? '✅' : '❌'}`);
    }

    // Sqr Footage Slider
    if (sqrRangeContainer && sqrMinDisplay && sqrMaxDisplay) {
      console.log("✅ Setting up Area Slider UI");
      sqrMinDisplay.textContent = formatSqft(overallMinSqr);
      sqrMaxDisplay.textContent = formatSqft(overallMaxSqr);
      sqrRangeContainer.dataset.min = overallMinSqr;
      sqrRangeContainer.dataset.max = overallMaxSqr;
      // Set default styles explicitly before setup
      if (sqrMinHandler) sqrMinHandler.style.left = '0%';
      if (sqrMaxHandler) sqrMaxHandler.style.left = '100%';
      if (sqrRangeBar) {
        sqrRangeBar.style.left = '0%';
        sqrRangeBar.style.width = '100%';
      }
      console.log("Sqr data attributes:", sqrRangeContainer.dataset.min, sqrRangeContainer.dataset.max);

    } else {
      console.warn("❌ Area slider UI elements not found:");
      console.log(`   .sqr-range container: ${sqrRangeContainer ? '✅' : '❌'}`);
      console.log(`   .sqr-min display: ${sqrMinDisplay ? '✅' : '❌'}`);
      console.log(`   .sqr-max display: ${sqrMaxDisplay ? '✅' : '❌'}`);
      console.log(`   .sqr-min-handler: ${sqrMinHandler ? '✅' : '❌'}`);
      console.log(`   .sqr-max-handler: ${sqrMaxHandler ? '✅' : '❌'}`);
      console.log(`   .sqr-range-bar: ${sqrRangeBar ? '✅' : '❌'}`);
    }

    // Initial results count
    const initialCount = initialCardData.length;
    updateResultsCount(initialCount);
    if (itemsCountEl) {
      itemsCountEl.textContent = initialCount;
    }
  }

  // --- Update Results Count ---
  function updateResultsCount(count) {
    if (resultsCountEl) {
      resultsCountEl.textContent = count;
    }
    console.log("Visible results:", count);
  }

  // --- Range Slider Logic ---
  function setupRangeSlider(sliderName, minHandle, maxHandle, rangeBar, minDisplay, maxDisplay, track, rangeContainer, valueFormatter) {
    // Added checks at the beginning
    if (!minHandle || !maxHandle || !rangeBar || !minDisplay || !maxDisplay || !track || !rangeContainer) {
      console.warn(`Cannot setup slider "${sliderName}": Missing one or more required elements.`, { minHandle, maxHandle, rangeBar, minDisplay, maxDisplay, track, rangeContainer });
      return;
    }


    let isDraggingMin = false;
    let isDraggingMax = false;
    let startX, startLeftPercent;
    let trackWidth, trackLeft;
    let minValue, maxValue;

    const updateSliderVisuals = (isInitial = false) => {
      minHandle.style.left = minHandle.style.left || '0%';
      maxHandle.style.left = maxHandle.style.left || '100%';

      const minPercent = parseFloat(minHandle.style.left);
      const maxPercent = parseFloat(maxHandle.style.left);

      // Update Range Bar
      rangeBar.style.left = `${minPercent}%`;
      rangeBar.style.width = `${maxPercent - minPercent}%`;

      // Read min/max values from data attributes for display calculation
      const currentMinValue = parseFloat(rangeContainer.dataset.min);
      const currentMaxValue = parseFloat(rangeContainer.dataset.max);

      // Update Display Values only if data is valid
      if (!isNaN(currentMinValue) && !isNaN(currentMaxValue) && currentMaxValue >= currentMinValue) {
        // Calculate the value corresponding to the handle's percentage position
        const displayMinVal = currentMinValue + (currentMaxValue - currentMinValue) * (minPercent / 100);
        const displayMaxVal = currentMinValue + (currentMaxValue - currentMinValue) * (maxPercent / 100);

        minDisplay.textContent = valueFormatter(displayMinVal);
        maxDisplay.textContent = valueFormatter(displayMaxVal);
      } else if (isInitial) {
        console.warn(`Slider "${sliderName}" data attributes invalid during initial visual update.`);
        minDisplay.textContent = valueFormatter(0);
        maxDisplay.textContent = valueFormatter(1000);
      }
    };

    const onDragStart = (e, handle) => {
      e.preventDefault();
      e.stopPropagation();

      const isMin = handle === minHandle;
      isDraggingMin = isMin;
      isDraggingMax = !isMin;

      // Read min/max from data attributes *at the start of the drag*
      minValue = parseFloat(rangeContainer.dataset.min);
      maxValue = parseFloat(rangeContainer.dataset.max);

      // Validate read values
      if (isNaN(minValue) || isNaN(maxValue) || maxValue < minValue) {
        console.error(`Slider "${sliderName}" has invalid min/max data attributes at drag start:`, rangeContainer.dataset.min, rangeContainer.dataset.max);
        isDraggingMin = isDraggingMax = false; // Abort drag
        return;
      }

      startX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
      startLeftPercent = parseFloat(handle.style.left || (isMin ? '0' : '100'));
      const rect = track.getBoundingClientRect();
      trackWidth = rect.width;
      trackLeft = rect.left;

      // Validate track dimensions
      if (trackWidth <= 0) {
        console.error(`Slider "${sliderName}" track has zero or negative width (${trackWidth}px). Cannot calculate drag.`);
        isDraggingMin = isDraggingMax = false;
        return;
      }

      document.addEventListener('mousemove', onDragging);
      document.addEventListener('touchmove', onDragging, { passive: false });
      document.addEventListener('mouseup', onDragEnd);
      document.addEventListener('touchend', onDragEnd);
      document.body.style.userSelect = 'none';
      handle.style.zIndex = '10'; // Bring dragged handle to front
      if (isMin) { maxHandle.style.zIndex = '5'; } else { minHandle.style.zIndex = '5'; }

    };

    const onDragging = (e) => {
      if (!isDraggingMin && !isDraggingMax) return;

      if (e.type.startsWith('touch')) {
        e.preventDefault();
      }

      const currentX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
      const deltaX = currentX - startX;
      let newPercent = startLeftPercent + (deltaX / trackWidth) * 100;

      // Clamp percentage between 0 and 100
      newPercent = Math.max(0, Math.min(100, newPercent));

      const otherHandlePercent = parseFloat((isDraggingMin ? maxHandle.style.left : minHandle.style.left) || (isDraggingMin ? '100' : '0'));

      if (isDraggingMin) {
        newPercent = Math.min(newPercent, otherHandlePercent);
        minHandle.style.left = `${newPercent}%`;
      } else {
        newPercent = Math.max(newPercent, otherHandlePercent);
        maxHandle.style.left = `${newPercent}%`;
      }

      updateSliderVisuals();
    };

    const onDragEnd = (e) => {
      if (!isDraggingMin && !isDraggingMax) return;

      isDraggingMin = false;
      isDraggingMax = false;
      document.removeEventListener('mousemove', onDragging);
      document.removeEventListener('touchmove', onDragging);
      document.removeEventListener('mouseup', onDragEnd);
      document.removeEventListener('touchend', onDragEnd);
      document.body.style.userSelect = '';
      minHandle.style.zIndex = '';
      maxHandle.style.zIndex = '';
    };

    // Attach starting event listeners
    minHandle.addEventListener('mousedown', (e) => onDragStart(e, minHandle));
    minHandle.addEventListener('touchstart', (e) => onDragStart(e, minHandle), { passive: true }); // Start can be passive
    maxHandle.addEventListener('mousedown', (e) => onDragStart(e, maxHandle));
    maxHandle.addEventListener('touchstart', (e) => onDragStart(e, maxHandle), { passive: true }); // Start can be passive

    updateSliderVisuals(true); // Pass true to indicate it's the initial setup
  }

  // --- Filter Application Logic ---
  function applyFilters() {
    console.log("Applying filters...");
    const selectedBedrooms = Array.from(bedroomCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => {
        const valueEl = cb.closest('.bedroom-wrapper')?.querySelector('.bedroom-value');
        return valueEl ? parseInt(valueEl.textContent.trim(), 10) : NaN;
      })
      .filter(val => !isNaN(val)); // Filter out NaN results just in case

    const selectedPriceMin = parseFloat(priceMinDisplay?.textContent.replace(/[^0-9.]+/g, '')) || overallMinPrice;
    const selectedPriceMax = parseFloat(priceMaxDisplay?.textContent.replace(/[^0-9.]+/g, '')) || overallMaxPrice;
    const selectedSqrMin = parseFloat(sqrMinDisplay?.textContent.replace(/[^0-9.]+/g, '')) || overallMinSqr;
    const selectedSqrMax = parseFloat(sqrMaxDisplay?.textContent.replace(/[^0-9.]+/g, '')) || overallMaxSqr;

    console.log("Current Filter Values:", { selectedBedrooms, selectedPriceMin, selectedPriceMax, selectedSqrMin, selectedSqrMax });

    let visibleCount = 0;

    initialCardData.forEach(cardData => {
      let isVisible = true;

      // Check Bedrooms
      if (selectedBedrooms.length > 0 && (cardData.bed === null || !selectedBedrooms.includes(cardData.bed))) {
        isVisible = false;
      }

      // Check Price Range overlap
      if (isVisible && priceMinDisplay && priceMaxDisplay && (cardData.priceMax !== null && cardData.priceMin !== null)) {
        if (cardData.priceMax < selectedPriceMin || cardData.priceMin > selectedPriceMax) {
          isVisible = false;
        }
      } else if (isVisible && priceMinDisplay && priceMaxDisplay && (cardData.priceMax === null || cardData.priceMin === null)) {
      }

      if (isVisible && sqrMinDisplay && sqrMaxDisplay && (cardData.sqrMax !== null && cardData.sqrMin !== null)) {
        if (cardData.sqrMax < selectedSqrMin || cardData.sqrMin > selectedSqrMax) {
          isVisible = false;
        }
      } else if (isVisible && sqrMinDisplay && sqrMaxDisplay && (cardData.sqrMax === null || cardData.sqrMin === null)) {
      }
      cardData.element.style.display = isVisible ? '' : 'none';
      if (isVisible) {
        visibleCount++;
      }
    });
    updateResultsCount(visibleCount);
  }

  // --- Reset Logic ---
  function resetFilters() {
    console.log("Resetting filters...");
    // Reset Bedroom Checkboxes
    bedroomCheckboxes.forEach(cb => cb.checked = false);

    // Reset Price Slider UI and Display
    if (priceRangeContainer && priceMinHandler && priceMaxHandler && priceRangeBar && priceMinDisplay && priceMaxDisplay) {
      priceMinHandler.style.left = '0%';
      priceMaxHandler.style.left = '100%';
      priceRangeBar.style.left = '0%';
      priceRangeBar.style.width = '100%';
      // Use the initially calculated overall values stored in data attributes
      const minP = parseFloat(priceRangeContainer.dataset.min);
      const maxP = parseFloat(priceRangeContainer.dataset.max);
      priceMinDisplay.textContent = formatCurrency(isNaN(minP) ? 0 : minP); // Use default if NaN
      priceMaxDisplay.textContent = formatCurrency(isNaN(maxP) ? 1000 : maxP); // Use default if NaN
    }

    // Reset Square Footage Slider UI and Display
    if (sqrRangeContainer && sqrMinHandler && sqrMaxHandler && sqrRangeBar && sqrMinDisplay && sqrMaxDisplay) {
      sqrMinHandler.style.left = '0%';
      sqrMaxHandler.style.left = '100%';
      sqrRangeBar.style.left = '0%';
      sqrRangeBar.style.width = '100%';
      // Use the initially calculated overall values stored in data attributes
      const minS = parseFloat(sqrRangeContainer.dataset.min);
      const maxS = parseFloat(sqrRangeContainer.dataset.max);
      sqrMinDisplay.textContent = formatSqft(isNaN(minS) ? 0 : minS); // Use default if NaN
      sqrMaxDisplay.textContent = formatSqft(isNaN(maxS) ? 2000 : maxS); // Use default if NaN
    }


    // Show all cards (using cached data for efficiency)
    initialCardData.forEach(cardData => {
      cardData.element.style.display = '';
    });

    // Update results count to show total
    updateResultsCount(initialCardData.length);
  }

  // --- Event Listeners ---
  if (filterButton) {
    filterButton.addEventListener('click', (e) => {
      e.preventDefault();
      applyFilters();
    });
  } else {
    console.warn("Filter button (.button-filter) not found.");
  }

  if (resetButton) {
    resetButton.addEventListener('click', (e) => {
      e.preventDefault();
      resetFilters();
    });
  } else {
    console.warn("Reset button (.button-reset) not found.");
  }

  // --- Initial Setup Execution ---
  initializeFilters();

  // --- Setup Sliders AFTER Initialization ---
  // Pass slider names for better logging during setup
  setupRangeSlider("Price", priceMinHandler, priceMaxHandler, priceRangeBar, priceMinDisplay, priceMaxDisplay, priceTrack, priceRangeContainer, formatCurrency);
  setupRangeSlider("Area", sqrMinHandler, sqrMaxHandler, sqrRangeBar, sqrMinDisplay, sqrMaxDisplay, sqrTrack, sqrRangeContainer, formatSqft);

  // Get all card-wrapper elements
  const cardWrappers = document.querySelectorAll('.card-wrapper');

  // Process each card-wrapper individually
  cardWrappers.forEach(function (wrapper) {
    // Square footage comparison
    const sqrMinValue = wrapper.querySelector('.sqr-min-card-value');
    const sqrMaxValue = wrapper.querySelector('.sqr-max-card-value');
    const sqrSpacer = wrapper.querySelector('.sqr-spacer');

    if (sqrMinValue && sqrMaxValue && sqrSpacer) {
      if (sqrMinValue.textContent === sqrMaxValue.textContent) {
        sqrSpacer.style.display = 'none';
        sqrMaxValue.style.display = 'none';
      }
    }

    // Price comparison
    const priceMinValue = wrapper.querySelector('.price-min-card-value');
    const priceMaxValue = wrapper.querySelector('.price-max-card-value');
    const priceSpacer = wrapper.querySelector('.price-spacer');
    const priceMaxDollar = wrapper.querySelector('.price-max-dollar');
    const startingAt = wrapper.querySelector('.startingat');

    if (priceMinValue && priceMaxValue && priceSpacer) {
      if (priceMinValue.textContent === priceMaxValue.textContent) {
        priceSpacer.style.display = 'none';
        priceMaxValue.style.display = 'none';

        // Also hide price-max-dollar
        if (priceMaxDollar) {
          priceMaxDollar.style.display = 'none';
        }

        // Show the .startingat element if present
        if (startingAt) {
          startingAt.style.display = 'inline';
        }
      }
    }
  });
});
