document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 PropSync Unified Script Loaded');

  // --- Helper Functions ---
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeoutWithCleanup(later, wait);
    };
  };

  // Event listener tracking for cleanup
  const eventListeners = [];
  const trackedIntervals = [];
  const trackedTimeouts = [];

  const addEventListenerWithCleanup = (element, event, handler, options = false) => {
    element.addEventListener(event, handler, options);
    eventListeners.push({ element, event, handler, options });
  };

  const setIntervalWithCleanup = (handler, timeout) => {
    const intervalId = setInterval(handler, timeout);
    trackedIntervals.push(intervalId);
    return intervalId;
  };

  const setTimeoutWithCleanup = (handler, timeout) => {
    const timeoutId = setTimeout(handler, timeout);
    trackedTimeouts.push(timeoutId);
    return timeoutId;
  };

  const cleanup = () => {
    // Remove all event listeners
    eventListeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    eventListeners.length = 0;

    // Clear all intervals
    trackedIntervals.forEach(id => clearInterval(id));
    trackedIntervals.length = 0;

    // Clear all timeouts
    trackedTimeouts.forEach(id => clearTimeout(id));
    trackedTimeouts.length = 0;
  };

  const formatNumber = (value) => {
    if (value == null || isNaN(value)) return '';
    return Math.round(value).toLocaleString();
  };

  const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return '';
    return '$' + formatNumber(value);
  };

  const parseVal = (el, selector, isFloat = false) => {
    const target = el.querySelector(selector);
    if (!target || !target.textContent) return null;
    const value = target.textContent.trim().replace(/[^0-9.-]+/g, '');
    if (value === '' || value === '-') return null;
    const num = isFloat ? parseFloat(value) : parseInt(value, 10);
    return isNaN(num) ? null : num;
  };

  const markPriceContainerAsSoldOut = (priceContainer) => {
    if (!priceContainer) return;

    // Find all price elements within the container
    const priceMinValue = priceContainer.querySelector('.price-min-card-value');
    const priceMaxValue = priceContainer.querySelector('.price-max-card-value');
    const minDollar = priceContainer.querySelector('.price-min-dollar');
    const maxDollar = priceContainer.querySelector('.price-max-dollar');
    const spacer = priceContainer.querySelector('.price-spacer');
    const startingAt = priceContainer.querySelector('.w-condition-invisible');
    const startingAtClass = priceContainer.querySelector('.startingat');

    // Hide dollar signs, spacer, max price, and "Starting at" text
    [minDollar, maxDollar, spacer, startingAt, startingAtClass, priceMaxValue].forEach(el => {
      if (el) el.style.display = 'none';
    });

    // Replace price min value with "Sold Out"
    if (priceMinValue) {
      priceMinValue.textContent = 'Sold Out';
      priceMinValue.style.display = '';  // Make sure it's visible
    }
  };

  const processAvailabilityWrapper = (container) => {
    if (!container) return;

    const availabilityWrapper = container.querySelector('.availability-wrapper');
    if (!availabilityWrapper) return;

    const availableItems = availabilityWrapper.querySelector('.available-items');
    const availableText = availabilityWrapper.querySelector('.available-text');
    const soldOutEl = availabilityWrapper.querySelector('.available-sold-out');

    if (!availableItems) return;

    const itemCount = parseInt(availableItems.textContent.trim(), 10);

    if (isNaN(itemCount)) return;

    if (itemCount === 0) {
      // Show sold out, hide available items and text
      availableItems.style.display = 'none';
      if (availableText) {
        availableText.style.display = 'none';
      }
      if (soldOutEl) {
        soldOutEl.style.display = '';
      }
    } else if (itemCount > 9) {
      // Replace with "9+" and show available text
      availableItems.textContent = '9+';
      availableItems.style.display = '';
      if (availableText) {
        availableText.style.display = '';
      }
      if (soldOutEl) {
        soldOutEl.style.display = 'none';
      }
    } else {
      // Normal case (1-9 items)
      availableItems.style.display = '';
      if (availableText) {
        availableText.style.display = '';
      }
      if (soldOutEl) {
        soldOutEl.style.display = 'none';
      }
    }
  };

  // --- Apply Links ---
  const applyButtons = document.querySelectorAll('[applylink]');
  applyButtons.forEach(function (button) {
    const linkValue = button.getAttribute('applylink');
    if (linkValue) {
      button.setAttribute('href', linkValue);
    }
  });

  // --- Format All Price and Square Footage Elements ---
  const formatPriceElements = () => {
    const priceSelectors = ['.price-min', '.price-max', '.price-min-card-value', '.price-max-card-value'];

    priceSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        // Skip if already formatted (contains $ or commas)
        if (element.textContent.includes('$') || element.textContent.includes(',')) {
          return;
        }

        const value = parseVal(element.parentElement, selector);
        if (value !== null && value >= 0) {
          element.textContent = formatNumber(value);
        }
      });
    });
  };

  // --- Format All Square Footage Elements ---
  const formatSquareFootageElements = () => {
    const sqrSelectors = ['.sqr-min', '.sqr-max', '.sqr-min-card-value', '.sqr-max-card-value'];

    sqrSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        const value = parseVal(element.parentElement, selector);
        if (value !== null && value >= 0) {
          element.textContent = formatNumber(value);
        }
      });
    });
  };

  // --- Page Template Functionality ---
  const initPageTemplate = () => {
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
    const priceMinDollar = document.querySelector('.price-min-dollar');
    const priceMaxDollar = document.querySelector('.price-max-dollar');

    if (priceMinValue && priceSpacer) {
      const minPrice = priceMinValue.textContent.trim();
      const maxPrice = priceMaxValue ? priceMaxValue.textContent.trim() : null;

      // If prices are equal OR max price doesn't exist, show "Starting at" format
      if (!maxPrice || minPrice === maxPrice) {
        priceSpacer.style.display = 'none';
        if (priceMaxValue) priceMaxValue.style.display = 'none';
        if (priceMaxDollar) priceMaxDollar.style.display = 'none';
        if (startingAt) startingAt.style.display = 'inline';
        if (priceMinDollar) priceMinDollar.style.display = 'inline';
      } else {
        // Prices are different, hide "Starting at" and show full range
        if (startingAt) startingAt.style.display = 'none';
        priceSpacer.style.display = 'inline';
        if (priceMaxValue) priceMaxValue.style.display = 'inline';
        if (priceMaxDollar) priceMaxDollar.style.display = 'inline';
        if (priceMinDollar) priceMinDollar.style.display = 'inline';
      }
    }

    // Image slider
    const slider = document.querySelector(".floorplan-slider");
    if (!slider) return;

    const slideContainer = slider.querySelector(".w-dyn-items");
    const slideItems = slider.querySelectorAll(".w-dyn-item");
    const leftArrow = slider.querySelector(".slider-arrow-left_small");
    const rightArrow = slider.querySelector(".slider-arrow-right_small");

    if (!slideContainer || !slideItems.length || !leftArrow || !rightArrow) return;

    let currentSlide = 0;
    let slideInterval;
    const totalSlides = slideItems.length;

    const initSlider = () => {
      slideContainer.style.display = "flex";
      slideContainer.style.transition = "transform 0.5s ease-in-out";
      slideContainer.style.width = `${totalSlides * 100}%`;

      slideItems.forEach(slide => {
        slide.style.flex = "1";
        slide.style.width = `${100 / totalSlides}%`;
      });

      startAutoSlide();
      addEventListenerWithCleanup(leftArrow, "click", () => moveSlide("left"));
      addEventListenerWithCleanup(rightArrow, "click", () => moveSlide("right"));
    };

    const goToSlide = (index) => {
      currentSlide = index;
      const offset = -currentSlide * (100 / totalSlides);
      slideContainer.style.transform = `translateX(${offset}%)`;
    };

    const moveSlide = (direction) => {
      if (direction === "right") {
        currentSlide = (currentSlide + 1) % totalSlides;
      } else {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      }
      goToSlide(currentSlide);
      resetAutoSlide();
    };

    const startAutoSlide = () => {
      slideInterval = setIntervalWithCleanup(() => moveSlide("right"), 2000);
    };

    const resetAutoSlide = () => {
      clearInterval(slideInterval);
      startAutoSlide();
    };

    initSlider();
  };

  // --- Replace "0 Bedroom" with "Studio" ---
  const replaceZeroBedroomWithStudio = () => {
    const cards = document.querySelectorAll('.card-wrapper');
    cards.forEach(card => {
      const bedroomValueEl = card.querySelector('.bedroom-card-value');
      if (!bedroomValueEl) return;

      const bedroomValue = bedroomValueEl.textContent.trim();
      // Check if the value is "0" (after parsing, it should be numeric)
      const bedNum = parseInt(bedroomValue.replace(/[^0-9.-]+/g, ''), 10);

      if (bedNum === 0) {
        // Replace "0" with "Studio"
        bedroomValueEl.textContent = 'Studio';

        // Find and hide sibling elements containing "Bedroom" text
        // Look within the same parent container (e.g., .bed-bath-wrapper)
        const parent = bedroomValueEl.parentElement;
        if (parent) {
          // Check all siblings in the same parent
          const siblings = Array.from(parent.children);
          siblings.forEach(sibling => {
            if (sibling !== bedroomValueEl && sibling.textContent.includes('Bedroom')) {
              sibling.style.display = 'none';
            }
          });
        }
      }
    });
  };

  // --- List Page A/B Filtering Functionality ---
  const initListPageFiltering = () => {
    const cards = document.querySelectorAll('.card-wrapper');
    const filterButton = document.querySelector('.button-filter');
    const resetButton = document.querySelector('.button-reset');

    // --- Diagnostic: Check for required filter classes (BEFORE early return) ---
    const requiredClasses = [
      '.card-wrapper',
      '.button-filter',
      '.button-reset',
      '.bedroom-wrapper',
      '.bedroom-wrapper input[type="checkbox"]',
      '.price-range',
      '.sqr-range',
      '[fs-cmsfilter-element="results-count"]',
      '.items-summary',
      '.items-count',
      '.results-count',
      '.bedroom-value',
      '.bedroom-card-value',
      '.price-min-card-value',
      '.price-max-card-value',
      '.sqr-min-card-value',
      '.sqr-max-card-value',
      '.price-min',
      '.price-max',
      '.sqr-min',
      '.sqr-max',
      '.price-min-handler',
      '.price-max-handler',
      '.price-range-bar',
      '.sqr-min-handler',
      '.sqr-max-handler',
      '.sqr-range-bar'
    ];

    const foundClasses = [];
    const missingClasses = [];

    requiredClasses.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        foundClasses.push(selector);
      } else {
        missingClasses.push(selector);
      }
    });

    // Only show diagnostics if classes OTHER than .button-filter are missing
    // .button-filter is expected to be missing and is handled by auto-submit mode
    const otherMissingClasses = missingClasses.filter(cls => cls !== '.button-filter');

    if (foundClasses.length >= 2 && otherMissingClasses.length > 0) {
      console.warn('🔍 PropSync Filter Diagnostics:');
      console.warn(`   Found ${foundClasses.length}/${requiredClasses.length} required classes`);
      console.warn('   ❌ Missing required classes:');
      otherMissingClasses.forEach(cls => console.warn(`      - ${cls}`));
    }

    // Only require cards to exist - filterButton and resetButton are optional (auto-submit fallback)
    if (!cards.length) return;

    console.log('✅ PropSync filtering initialized with', cards.length, 'cards');

    const propsyncTabs = document.querySelector('.propsync-tabs');
    const bedroomWrappers = document.querySelectorAll('.bedroom-wrapper');
    const bedroomCheckboxes = document.querySelectorAll('.bedroom-wrapper input[type="checkbox"]');
    const priceRangeContainer = document.querySelector('.price-range');
    const sqrRangeContainer = document.querySelector('.sqr-range');
    const resultsCountEl = document.querySelector('[fs-cmsfilter-element="results-count"]');
    const itemsSummaryEl = document.querySelector('.items-summary');
    const itemsCountEl = itemsSummaryEl?.querySelector('.items-count');
    const resultCountSummaryEl = itemsSummaryEl?.querySelector('.results-count');

    // Define auto-submit mode early so it's available in setupRangeSlider
    const autoSubmitMode = !filterButton;
    if (autoSubmitMode) {
      console.log('📱 Auto-submit mode enabled (button-filter missing)');
    }

    let isAnySliderDragging = false;
    let overallMinPrice = Infinity;
    let overallMaxPrice = -Infinity;
    let overallMinSqr = Infinity;
    let overallMaxSqr = -Infinity;
    const availableBedrooms = new Set();
    const initialCardData = [];

    // Initialize card data and mark cards with negative prices as sold out
    cards.forEach((card) => {
      const bed = parseVal(card, '.bedroom-card-value');
      const priceMin = parseVal(card, '.price-min-card-value');
      const priceMax = parseVal(card, '.price-max-card-value');
      const sqrMin = parseVal(card, '.sqr-min-card-value');
      const sqrMax = parseVal(card, '.sqr-max-card-value');

      // Mark cards with negative prices as sold out
      if ((priceMin !== null && priceMin < 0) || (priceMax !== null && priceMax < 0)) {
        const priceContainer = card.querySelector('.price-range');
        markPriceContainerAsSoldOut(priceContainer || card);
        // Process availability wrapper for this card
        processAvailabilityWrapper(card);
        // Don't return - continue processing the card
      }

      const cardData = {
        element: card,
        bed: bed,
        priceMin: priceMin,
        priceMax: priceMax,
        sqrMin: sqrMin,
        sqrMax: sqrMax,
      };
      initialCardData.push(cardData);

      if (cardData.bed !== null) availableBedrooms.add(cardData.bed);
      if (cardData.priceMin !== null) overallMinPrice = Math.min(overallMinPrice, cardData.priceMin);
      if (cardData.priceMax !== null) overallMaxPrice = Math.max(overallMaxPrice, cardData.priceMax);
      if (cardData.sqrMin !== null) overallMinSqr = Math.min(overallMinSqr, cardData.sqrMin);
      if (cardData.sqrMax !== null) overallMaxSqr = Math.max(overallMaxSqr, cardData.sqrMax);

      // Process availability wrapper for this card
      processAvailabilityWrapper(card);
    });

    if (overallMinPrice === Infinity) overallMinPrice = 0;
    if (overallMaxPrice === -Infinity || overallMaxPrice < overallMinPrice) overallMaxPrice = Math.max(1000, overallMinPrice);
    if (overallMinSqr === Infinity) overallMinSqr = 0;
    if (overallMaxSqr === -Infinity || overallMaxSqr < overallMinSqr) overallMaxSqr = Math.max(2000, overallMinSqr);

    // --- Tab Filtering Functionality ---
    if (propsyncTabs) {
      console.log('📑 Tab filtering mode enabled');

      // Helper function to get bedroom label
      const getBedroomLabel = (bedCount) => {
        if (bedCount === 0) return 'Studio';
        if (bedCount === 1) return '1 Bedroom';
        return `${bedCount} Bedroom`;
      };

      // Generate tabs based on available bedroom counts
      const sortedBedrooms = Array.from(availableBedrooms).sort((a, b) => a - b);

      // Clear existing tabs
      propsyncTabs.innerHTML = '';

      // Create "View All" tab (active by default)
      const viewAllTab = document.createElement('div');
      viewAllTab.className = 'tab__link active';
      viewAllTab.setAttribute('data-bedroom-filter', 'all');
      const viewAllButtonText = document.createElement('div');
      viewAllButtonText.className = 'button-text';
      viewAllButtonText.textContent = 'View All';
      viewAllTab.appendChild(viewAllButtonText);
      propsyncTabs.appendChild(viewAllTab);

      // Create tabs for each bedroom count
      sortedBedrooms.forEach(bedCount => {
        const tab = document.createElement('div');
        tab.className = 'tab__link';
        tab.setAttribute('data-bedroom-filter', bedCount.toString());
        const buttonText = document.createElement('div');
        buttonText.className = 'button-text';
        buttonText.textContent = getBedroomLabel(bedCount);
        tab.appendChild(buttonText);
        propsyncTabs.appendChild(tab);
      });

      // Tab filtering function
      const applyTabFilter = (selectedBedroom) => {
        let visibleCount = 0;

        initialCardData.forEach(cardData => {
          let isVisible = false;

          if (selectedBedroom === 'all') {
            isVisible = true;
          } else {
            const filterBed = parseInt(selectedBedroom, 10);
            isVisible = cardData.bed === filterBed;
          }

          cardData.element.style.display = isVisible ? '' : 'none';
          if (isVisible) visibleCount++;
        });

        // Update result counts
        if (resultsCountEl) {
          resultsCountEl.textContent = visibleCount;
        }
        if (itemsCountEl) {
          itemsCountEl.textContent = visibleCount;
        }
        if (resultCountSummaryEl) {
          resultCountSummaryEl.textContent = initialCardData.length;
        }
      };

      // Add click listeners to tabs
      propsyncTabs.querySelectorAll('.tab__link').forEach(tab => {
        addEventListenerWithCleanup(tab, 'click', (e) => {
          e.preventDefault();

          // Remove active class from all tabs
          propsyncTabs.querySelectorAll('.tab__link').forEach(t => t.classList.remove('active'));

          // Add active class to clicked tab
          tab.classList.add('active');

          // Apply filter
          const filterValue = tab.getAttribute('data-bedroom-filter');
          applyTabFilter(filterValue);
        });
      });

      // Initial filter (show all)
      applyTabFilter('all');

      // Return early - tabs mode doesn't use checkboxes/sliders
      return;
    }

    // Setup range sliders
    const setupRangeSlider = (sliderName, container, valueFormatter) => {
      if (!container) return;

      const minHandle = container.querySelector(`.${sliderName}-min-handler`);
      const maxHandle = container.querySelector(`.${sliderName}-max-handler`);
      const rangeBar = container.querySelector(`.${sliderName}-range-bar`);
      const minDisplay = container.querySelector(`.${sliderName}-min`);
      const maxDisplay = container.querySelector(`.${sliderName}-max`);
      const track = minHandle?.closest('.filters1_rangeslider2-track, .rangeslider_track');

      if (!minHandle || !maxHandle || !rangeBar || !minDisplay || !maxDisplay || !track) return;

      let isDraggingMin = false;
      let isDraggingMax = false;
      let startX, startLeft, trackWidth, trackLeft, dataMin, dataMax;

      const updateSliderVisuals = () => {
        const minLeft = parseFloat(minHandle.style.left) || 0;
        const maxLeft = parseFloat(maxHandle.style.left) || 100;

        rangeBar.style.left = `${minLeft}%`;
        rangeBar.style.width = `${maxLeft - minLeft}%`;

        const min = parseFloat(container.dataset.min);
        const max = parseFloat(container.dataset.max);

        if (!isNaN(min) && !isNaN(max)) {
          const minValue = min + (minLeft / 100) * (max - min);
          const maxValue = min + (maxLeft / 100) * (max - min);
          minDisplay.textContent = valueFormatter(minValue);
          maxDisplay.textContent = valueFormatter(maxValue);
        }
      };

      const onDragStart = (e, handle) => {
        if (isAnySliderDragging) return;
        isAnySliderDragging = true;
        e.preventDefault();
        const isMin = handle === minHandle;
        isDraggingMin = isMin;
        isDraggingMax = !isMin;

        dataMin = parseFloat(container.dataset.min);
        dataMax = parseFloat(container.dataset.max);

        if (isNaN(dataMin) || isNaN(dataMax)) return;

        startX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        startLeft = parseFloat(handle.style.left) || (isMin ? 0 : 100);

        const rect = track.getBoundingClientRect();
        trackWidth = rect.width;
        trackLeft = rect.left;

        if (trackWidth <= 0) return;

        document.addEventListener('mousemove', onDragging);
        document.addEventListener('touchmove', onDragging, { passive: false });
        document.addEventListener('mouseup', onDragEnd);
        document.addEventListener('touchend', onDragEnd);
      };

      const onDragging = (e) => {
        if (!isDraggingMin && !isDraggingMax) return;

        if (e.type.startsWith('touch')) e.preventDefault();

        const currentX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        let newLeft = startLeft + ((currentX - startX) / trackWidth) * 100;
        newLeft = Math.max(0, Math.min(100, newLeft));

        const otherLeft = parseFloat((isDraggingMin ? maxHandle.style.left : minHandle.style.left)) || (isDraggingMin ? 100 : 0);

        if (isDraggingMin) {
          newLeft = Math.min(newLeft, otherLeft);
          minHandle.style.left = `${newLeft}%`;
        } else {
          newLeft = Math.max(newLeft, otherLeft);
          maxHandle.style.left = `${newLeft}%`;
        }

        updateSliderVisuals();
      };

      const onDragEnd = () => {
        if (isDraggingMin || isDraggingMax) {
          isAnySliderDragging = false;
          isDraggingMin = false;
          isDraggingMax = false;
          document.removeEventListener('mousemove', onDragging);
          document.removeEventListener('touchmove', onDragging);
          document.removeEventListener('mouseup', onDragEnd);
          document.removeEventListener('touchend', onDragEnd);

          // Trigger auto-apply in auto-submit mode
          if (autoSubmitMode) {
            setTimeoutWithCleanup(() => applyFilters(), 50);
          }
        }
      };

      addEventListenerWithCleanup(minHandle, 'mousedown', (e) => onDragStart(e, minHandle));
      addEventListenerWithCleanup(minHandle, 'touchstart', (e) => onDragStart(e, minHandle), { passive: true });
      addEventListenerWithCleanup(maxHandle, 'mousedown', (e) => onDragStart(e, maxHandle));
      addEventListenerWithCleanup(maxHandle, 'touchstart', (e) => onDragStart(e, maxHandle), { passive: true });

      updateSliderVisuals();
    };

    // Initialize sliders
    if (priceRangeContainer) {
      const priceMinDisplay = priceRangeContainer.querySelector('.price-min');
      const priceMaxDisplay = priceRangeContainer.querySelector('.price-max');

      if (priceMinDisplay && priceMaxDisplay) {
        priceMinDisplay.textContent = formatNumber(overallMinPrice);
        priceMaxDisplay.textContent = formatNumber(overallMaxPrice);
        priceRangeContainer.dataset.min = overallMinPrice;
        priceRangeContainer.dataset.max = overallMaxPrice;

        const priceMinHandler = priceRangeContainer.querySelector('.price-min-handler');
        const priceMaxHandler = priceRangeContainer.querySelector('.price-max-handler');
        const priceRangeBar = priceRangeContainer.querySelector('.price-range-bar');

        if (priceMinHandler) priceMinHandler.style.left = '0%';
        if (priceMaxHandler) priceMaxHandler.style.left = '100%';
        if (priceRangeBar) {
          priceRangeBar.style.left = '0%';
          priceRangeBar.style.width = '100%';
        }
      }

      setupRangeSlider('price', priceRangeContainer, formatNumber);
    }

    if (sqrRangeContainer) {
      const sqrMinDisplay = sqrRangeContainer.querySelector('.sqr-min');
      const sqrMaxDisplay = sqrRangeContainer.querySelector('.sqr-max');

      if (sqrMinDisplay && sqrMaxDisplay) {
        sqrMinDisplay.textContent = formatNumber(overallMinSqr);
        sqrMaxDisplay.textContent = formatNumber(overallMaxSqr);
        sqrRangeContainer.dataset.min = overallMinSqr;
        sqrRangeContainer.dataset.max = overallMaxSqr;

        const sqrMinHandler = sqrRangeContainer.querySelector('.sqr-min-handler');
        const sqrMaxHandler = sqrRangeContainer.querySelector('.sqr-max-handler');
        const sqrRangeBar = sqrRangeContainer.querySelector('.sqr-range-bar');

        if (sqrMinHandler) sqrMinHandler.style.left = '0%';
        if (sqrMaxHandler) sqrMaxHandler.style.left = '100%';
        if (sqrRangeBar) {
          sqrRangeBar.style.left = '0%';
          sqrRangeBar.style.width = '100%';
        }
      }

      setupRangeSlider('sqr', sqrRangeContainer, formatNumber);
    }

    // Show/hide bedroom options
    bedroomWrappers.forEach(wrapper => {
      const valueEl = wrapper.querySelector('.bedroom-value');
      const value = valueEl ? parseInt(valueEl.textContent.trim(), 10) : NaN;
      wrapper.style.display = (!isNaN(value) && availableBedrooms.has(value)) ? '' : 'none';
    });

    // Filter functionality with debouncing
    const applyFilters = debounce(() => {
      const selectedBedrooms = Array.from(bedroomCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => {
          const wrapper = cb.closest('.bedroom-wrapper');
          const valueEl = wrapper?.querySelector('.bedroom-value');
          return valueEl ? parseInt(valueEl.textContent.trim(), 10) : NaN;
        })
        .filter(val => !isNaN(val));

      const priceMin = priceRangeContainer ? parseFloat(priceRangeContainer.querySelector('.price-min')?.textContent.replace(/[^0-9.]+/g, '')) || overallMinPrice : overallMinPrice;
      const priceMax = priceRangeContainer ? parseFloat(priceRangeContainer.querySelector('.price-max')?.textContent.replace(/[^0-9.]+/g, '')) || overallMaxPrice : overallMaxPrice;
      const sqrMin = sqrRangeContainer ? parseFloat(sqrRangeContainer.querySelector('.sqr-min')?.textContent.replace(/[^0-9.]+/g, '')) || overallMinSqr : overallMinSqr;
      const sqrMax = sqrRangeContainer ? parseFloat(sqrRangeContainer.querySelector('.sqr-max')?.textContent.replace(/[^0-9.]+/g, '')) || overallMaxSqr : overallMaxSqr;

      let visibleCount = 0;

      initialCardData.forEach(cardData => {
        let isVisible = true;

        // Bedroom filter
        if (selectedBedrooms.length > 0 && (cardData.bed === null || !selectedBedrooms.includes(cardData.bed))) {
          isVisible = false;
        }

        // Price filter
        if (isVisible && cardData.priceMax !== null && cardData.priceMin !== null) {
          if (cardData.priceMax < priceMin || cardData.priceMin > priceMax) {
            isVisible = false;
          }
        }

        // Square footage filter
        if (isVisible && cardData.sqrMax !== null && cardData.sqrMin !== null) {
          if (cardData.sqrMax < sqrMin || cardData.sqrMin > sqrMax) {
            isVisible = false;
          }
        }

        cardData.element.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleCount++;
      });

      if (resultsCountEl) {
        resultsCountEl.textContent = visibleCount;
      }
      if (itemsCountEl) {
        itemsCountEl.textContent = visibleCount;
      }
      if (resultCountSummaryEl) {
        resultCountSummaryEl.textContent = initialCardData.length;
      }
    }, 300); // 300ms debounce delay

    const resetFilters = () => {
      bedroomCheckboxes.forEach(cb => cb.checked = false);

      if (priceRangeContainer) {
        const priceMinHandler = priceRangeContainer.querySelector('.price-min-handler');
        const priceMaxHandler = priceRangeContainer.querySelector('.price-max-handler');
        const priceRangeBar = priceRangeContainer.querySelector('.price-range-bar');
        const priceMinDisplay = priceRangeContainer.querySelector('.price-min');
        const priceMaxDisplay = priceRangeContainer.querySelector('.price-max');

        if (priceMinHandler) priceMinHandler.style.left = '0%';
        if (priceMaxHandler) priceMaxHandler.style.left = '100%';
        if (priceRangeBar) {
          priceRangeBar.style.left = '0%';
          priceRangeBar.style.width = '100%';
        }
        if (priceMinDisplay) priceMinDisplay.textContent = formatNumber(overallMinPrice);
        if (priceMaxDisplay) priceMaxDisplay.textContent = formatNumber(overallMaxPrice);
      }

      if (sqrRangeContainer) {
        const sqrMinHandler = sqrRangeContainer.querySelector('.sqr-min-handler');
        const sqrMaxHandler = sqrRangeContainer.querySelector('.sqr-max-handler');
        const sqrRangeBar = sqrRangeContainer.querySelector('.sqr-range-bar');
        const sqrMinDisplay = sqrRangeContainer.querySelector('.sqr-min');
        const sqrMaxDisplay = sqrRangeContainer.querySelector('.sqr-max');

        if (sqrMinHandler) sqrMinHandler.style.left = '0%';
        if (sqrMaxHandler) sqrMaxHandler.style.left = '100%';
        if (sqrRangeBar) {
          sqrRangeBar.style.left = '0%';
          sqrRangeBar.style.width = '100%';
        }
        if (sqrMinDisplay) sqrMinDisplay.textContent = formatNumber(overallMinSqr);
        if (sqrMaxDisplay) sqrMaxDisplay.textContent = formatNumber(overallMaxSqr);
      }

      initialCardData.forEach(cardData => {
        cardData.element.style.display = '';
      });

      if (resultsCountEl) {
        resultsCountEl.textContent = initialCardData.length;
      }
      if (itemsCountEl) {
        itemsCountEl.textContent = initialCardData.length;
      }
      if (resultCountSummaryEl) {
        resultCountSummaryEl.textContent = initialCardData.length;
      }
    };

    // Attach filter button listener if it exists
    if (filterButton) {
      addEventListenerWithCleanup(filterButton, 'click', (e) => {
        e.preventDefault();
        applyFilters();
      });
    }

    // Attach reset button listener if it exists
    if (resetButton) {
      addEventListenerWithCleanup(resetButton, 'click', (e) => {
        e.preventDefault();
        resetFilters();
      });
    }

    // Auto-apply when bedroom checkboxes change in auto-submit mode
    if (autoSubmitMode) {
      bedroomCheckboxes.forEach(checkbox => {
        addEventListenerWithCleanup(checkbox, 'change', () => {
          applyFilters();
        });
      });
    }

    // Initial count
    if (resultsCountEl) {
      resultsCountEl.textContent = initialCardData.length;
    }
    if (itemsCountEl) {
      itemsCountEl.textContent = initialCardData.length;
    }
    if (resultCountSummaryEl) {
      resultCountSummaryEl.textContent = initialCardData.length;
    }
  };

  // --- List Page C Accordion Functionality ---
  const initAccordionFunctionality = () => {
    const accordionListContainer = document.querySelector('.accordion_list');
    const templateAccordion = document.querySelector('.accordion_accordion');
    const allCardWrappers = Array.from(document.querySelectorAll('.accordion_component .card-wrapper'));

    if (!accordionListContainer || !templateAccordion || !allCardWrappers.length) return;

    const floorPlanGroups = {};

    const getFloorTypeName = (bedValue) => {
      const num = parseInt(bedValue, 10);
      if (isNaN(num)) return "Unknown";
      if (num === 0) return "Studio";
      if (num === 1) return "1 Bedroom";
      return `${num} Bedroom`;
    };

    // Group cards and mark negative prices as sold out
    allCardWrappers.forEach(card => {
      const bedElement = card.querySelector('.bedroom-card-value');
      const priceElement = card.querySelector('.price-min-card-value');
      const priceMaxElement = card.querySelector('.price-max-card-value');

      if (bedElement && priceElement) {
        const bedValue = bedElement.textContent.trim();
        const priceValue = parseInt(priceElement.textContent.trim().replace(/[^0-9.-]+/g, ''), 10);
        const priceMaxValue = priceMaxElement ? parseInt(priceMaxElement.textContent.trim().replace(/[^0-9.-]+/g, ''), 10) : null;

        // Mark cards with negative prices as sold out
        if (priceValue < 0 || (priceMaxValue !== null && priceMaxValue < 0)) {
          const priceContainer = card.querySelector('.price-range');
          markPriceContainerAsSoldOut(priceContainer || card);
          // Don't return - continue processing the card
        }

        // Process availability wrapper for this card
        processAvailabilityWrapper(card);

        const floorType = getFloorTypeName(bedValue);
        const numericBedValue = parseInt(bedValue, 10);

        if (isNaN(priceValue)) return;

        if (!floorPlanGroups[floorType]) {
          floorPlanGroups[floorType] = {
            cards: [],
            minPrice: Infinity,
            numericBedValue: isNaN(numericBedValue) ? Infinity : numericBedValue
          };
        }

        floorPlanGroups[floorType].cards.push(card);
        // Only include positive prices in min price calculation
        if (priceValue >= 0) {
          floorPlanGroups[floorType].minPrice = Math.min(floorPlanGroups[floorType].minPrice, priceValue);
        }
      }
    });

    const sortedFloorTypes = Object.keys(floorPlanGroups).sort((a, b) => {
      return floorPlanGroups[a].numericBedValue - floorPlanGroups[b].numericBedValue;
    });

    accordionListContainer.innerHTML = '';

    sortedFloorTypes.forEach(floorType => {
      const group = floorPlanGroups[floorType];

      if (group.cards.length > 0) {
        const newAccordion = templateAccordion.cloneNode(true);
        const question = newAccordion.querySelector('.accordion_question');
        const answer = newAccordion.querySelector('.accordion_answer');
        const titleTextElement = newAccordion.querySelector('.floorplan-accordian-text');
        const cardList = newAccordion.querySelector('.floorplan-collection-list');

        if (!question || !answer || !titleTextElement || !cardList) return;

        // Build title based on whether there are available units
        let title;
        if (group.minPrice === Infinity) {
          // All cards are sold out
          title = `${floorType} -- Number of ${group.cards.length} Floorplans`;
        } else {
          title = `${floorType} Starting at ${formatCurrency(group.minPrice)} -- Number of ${group.cards.length} Floorplans`;
        }
        titleTextElement.textContent = title;

        const simpleTitleElement = newAccordion.querySelector('.bedroom-text');
        if (simpleTitleElement) simpleTitleElement.textContent = floorType;

        cardList.innerHTML = '';
        group.cards.forEach(cardElement => {
          cardList.appendChild(cardElement);
        });

        answer.style.maxHeight = '0px';
        answer.style.opacity = '0';
        answer.style.overflow = 'hidden';
        newAccordion.classList.remove('active');

        accordionListContainer.appendChild(newAccordion);
      }
    });

    // Accordion interaction
    addEventListenerWithCleanup(accordionListContainer, 'click', function(event) {
      const question = event.target.closest('.accordion_question');
      if (!question) return;

      const accordion = question.closest('.accordion_accordion');
      if (!accordion) return;

      const answer = accordion.querySelector('.accordion_answer');
      const iconWrapper = question.querySelector('.accordion_icon-wrapper');

      if (!answer || !iconWrapper) return;

      const isActive = accordion.classList.contains('active');

      if (isActive) {
        answer.style.maxHeight = '0px';
        answer.style.opacity = '0';
        iconWrapper.style.transform = 'rotate(0deg)';
        accordion.classList.remove('active');
      } else {
        accordion.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.opacity = '1';
        iconWrapper.style.transform = 'rotate(45deg)';
      }
    });
  };

  // --- Card Price/Square Footage Comparison ---
  const initCardComparisons = () => {
    document.querySelectorAll('.card-wrapper').forEach(wrapper => {
      // Check for negative prices first and mark as sold out
      const priceMinValue = wrapper.querySelector('.price-min-card-value');
      const priceMaxValue = wrapper.querySelector('.price-max-card-value');
      const priceContainer = wrapper.querySelector('.price-range');

      if (priceMinValue && priceMaxValue) {
        const priceMinNum = parseInt(priceMinValue.textContent.trim().replace(/[^0-9.-]+/g, ''), 10);
        const priceMaxNum = parseInt(priceMaxValue.textContent.trim().replace(/[^0-9.-]+/g, ''), 10);

        if ((priceMinNum < 0) || (priceMaxNum < 0)) {
          // Try to find price container, fallback to wrapper
          const container = priceContainer || wrapper;
          markPriceContainerAsSoldOut(container);
          // Process availability wrapper even when price is negative
          processAvailabilityWrapper(wrapper);
          return; // Skip further processing for this card
        }
      }

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
      const priceSpacer = wrapper.querySelector('.price-spacer');
      const priceMaxDollar = wrapper.querySelector('.price-max-dollar');
      const startingAt = wrapper.querySelector('.startingat');
      const priceMinDollar = wrapper.querySelector('.price-min-dollar');

      if (priceMinValue && priceSpacer) {
        const minPrice = priceMinValue.textContent.trim();
        const maxPrice = priceMaxValue ? priceMaxValue.textContent.trim() : null;

        // If prices are equal OR max price doesn't exist, show "Starting at" format
        if (!maxPrice || minPrice === maxPrice) {
          priceSpacer.style.display = 'none';
          if (priceMaxValue) priceMaxValue.style.display = 'none';
          if (priceMaxDollar) priceMaxDollar.style.display = 'none';
          if (startingAt) startingAt.style.display = 'inline';
          if (priceMinDollar) priceMinDollar.style.display = 'inline';
        } else {
          // Prices are different, hide "Starting at" and show full range
          if (startingAt) startingAt.style.display = 'none';
          priceSpacer.style.display = 'inline';
          if (priceMaxValue) priceMaxValue.style.display = 'inline';
          if (priceMaxDollar) priceMaxDollar.style.display = 'inline';
          if (priceMinDollar) priceMinDollar.style.display = 'inline';
        }
      }

      // Process availability wrapper
      processAvailabilityWrapper(wrapper);
    });
  };

  // --- Initialize All Functionality ---
  formatPriceElements();
  formatSquareFootageElements();
  initPageTemplate();
  initListPageFiltering();
  replaceZeroBedroomWithStudio();
  initAccordionFunctionality();
  initCardComparisons();

  console.log('✅ PropSync initialization complete');

  // Cleanup on page unload
  addEventListenerWithCleanup(window, 'beforeunload', cleanup);

  // Handle page visibility changes to pause/resume intervals
  let sliderIntervalId = null;
  addEventListenerWithCleanup(document, 'visibilitychange', () => {
    if (document.hidden) {
      // Page is hidden, pause intervals to save resources
      if (sliderIntervalId) {
        clearInterval(sliderIntervalId);
        sliderIntervalId = null;
      }
    } else {
      // Page is visible, restart auto-slider if it exists
      const slider = document.querySelector(".floorplan-slider");
      if (slider) {
        const slideContainer = slider.querySelector(".w-dyn-items");
        const slideItems = slider.querySelectorAll(".w-dyn-item");
        if (slideContainer && slideItems.length > 0) {
          // Restart auto-slide functionality
          const moveSlide = () => {
            const totalSlides = slideItems.length;
            let currentSlide = 0;

            // Get current slide from transform
            const currentTransform = slideContainer.style.transform;
            if (currentTransform) {
              const match = currentTransform.match(/translateX\(([-\d.]+)%\)/);
              if (match) {
                currentSlide = Math.round(-parseFloat(match[1]) / (100 / totalSlides));
              }
            }

            currentSlide = (currentSlide + 1) % totalSlides;
            const offset = -currentSlide * (100 / totalSlides);
            slideContainer.style.transform = `translateX(${offset}%)`;
          };

          sliderIntervalId = setIntervalWithCleanup(moveSlide, 2000);
        }
      }
    }
  });

  // Expose cleanup function for manual cleanup if needed
  window.propSyncCleanup = cleanup;
});
