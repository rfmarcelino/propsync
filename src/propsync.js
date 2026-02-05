document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 PropSync Unified Script Loaded');

  // --- Disable Finsweet CMS Filter (if present) ---
  // PropSync will take full control of filtering
  const disableFinsweetCMSFilter = () => {
    // Remove all fs-cmsfilter attributes to prevent interference
    const finsweetElements = document.querySelectorAll('[fs-cmsfilter-element], [fs-cmsfilter-field], [fs-cmsfilter-reset]');
    
    if (finsweetElements.length > 0) {
      console.log(`🚫 Disabling Finsweet CMS Filter (found ${finsweetElements.length} elements)`);
      
      finsweetElements.forEach(el => {
        // Remove all fs-cmsfilter-* attributes
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('fs-cmsfilter')) {
            el.removeAttribute(attr.name);
          }
        });
      });
      
      // Disable Finsweet script if it's loaded
      if (window.fsAttributes) {
        window.fsAttributes = undefined;
      }
      
      console.log('✅ Finsweet CMS Filter disabled - PropSync has full control');
    }
  };

  // Run immediately to prevent Finsweet from initializing
  disableFinsweetCMSFilter();

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
    const textContent = target.textContent.trim();

    // Handle "Studio" as 0 for bedroom values
    if (selector.includes('bedroom') && textContent.toLowerCase() === 'studio') {
      return 0;
    }

    const value = textContent.replace(/[^0-9.-]+/g, '');
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

  // --- Debug: Check for Duplicate Classes ---
  const checkForDuplicateClasses = () => {
    // Classes that should only appear once in the document
    const uniqueClasses = [
      '.propsync-tabs',
      '.button-filter',
      '.button-reset',
      '.price-range',
      '.sqr-range',
      '.items-summary'
    ];

    const duplicates = [];

    uniqueClasses.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 1) {
        duplicates.push({
          selector,
          count: elements.length,
          elements: Array.from(elements)
        });
      }
    });

    if (duplicates.length > 0) {
      console.warn('⚠️ PropSync: Duplicate classes detected!');
      console.warn('These classes should only appear once in the document:');
      duplicates.forEach(({ selector, count, elements }) => {
        console.warn(`  ❌ ${selector}: found ${count} instances`);
        elements.forEach((el, idx) => {
          console.warn(`     Instance ${idx + 1}:`, el);
        });
      });
      console.warn('💡 Tip: Use more specific selectors or unique classes to avoid conflicts.');
    }

    return duplicates;
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
    // Handle card bedroom values (.bedroom-card-value)
    const cards = document.querySelectorAll('.card-wrapper');
    cards.forEach(card => {
      const bedroomValueEl = card.querySelector('.bedroom-card-value');
      if (!bedroomValueEl) return;

      const bedroomValue = bedroomValueEl.textContent.trim();
      const isStudio = bedroomValue.toLowerCase() === 'studio';
      // Check if the value is "0" (after parsing, it should be numeric)
      const bedNum = parseInt(bedroomValue.replace(/[^0-9.-]+/g, ''), 10);

      if (bedNum === 0 || isStudio) {
        // Ensure it shows "Studio" (replace "0" if needed, or keep "Studio")
        if (!isStudio) {
          bedroomValueEl.textContent = 'Studio';
        }

        // Find and hide sibling elements containing "Bedroom" or "Bed" text
        // Look within the same parent container (e.g., .bed-bath-wrapper or .floorplans-details)
        const parent = bedroomValueEl.parentElement;
        if (parent) {
          // Check all siblings in the same parent
          const siblings = Array.from(parent.children);
          siblings.forEach(sibling => {
            if (sibling !== bedroomValueEl) {
              const siblingText = sibling.textContent.trim();
              // Hide if it's exactly "Bed" or "Bedroom" (or contains "Bedroom")
              if (siblingText === 'Bed' || siblingText.includes('Bedroom')) {
                sibling.style.display = 'none';
              }
            }
          });
        }
      }
    });

    // Handle filter checkbox bedroom values (.bedroom-value or label)
    const bedroomWrappers = document.querySelectorAll('.bedroom-wrapper');
    bedroomWrappers.forEach(wrapper => {
      const bedroomValueEl = wrapper.querySelector('.bedroom-value');
      const label = wrapper.querySelector('label');

      // Use .bedroom-value if it exists, otherwise use label
      const textElement = bedroomValueEl || label;
      if (!textElement) return;

      const bedroomValue = textElement.textContent.trim();
      const bedroomValueLower = bedroomValue.toLowerCase();

      // Check for studio patterns
      const isStudio = bedroomValueLower === 'studio' || bedroomValueLower === 'studio bedroom' || bedroomValueLower === '0 bedroom';

      // Parse the bedroom number
      let bedNum;
      if (isStudio) {
        bedNum = 0;
      } else if (bedroomValueLower.startsWith('0')) {
        bedNum = 0;
      } else {
        // Extract first number from text (e.g., "1 Bedroom" -> 1)
        const match = bedroomValue.match(/(\d+)/);
        bedNum = match ? parseInt(match[1], 10) : NaN;
      }

      // Store the original numeric value in a data attribute for filtering
      if (!isNaN(bedNum)) {
        textElement.setAttribute('data-bedroom-num', bedNum.toString());
      }

      if (bedNum === 0) {
        // Replace with "Studio" text
        if (textElement === label) {
          // If using label directly, preserve checkbox but update text
          const checkbox = label.querySelector('input[type="checkbox"]');
          if (checkbox) {
            // Clear label and add back checkbox + new text
            label.innerHTML = '';
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(' Studio'));
          } else {
            label.textContent = 'Studio';
          }
        } else {
          // If using .bedroom-value element
          textElement.textContent = 'Studio';

          // Find and hide sibling elements containing "Bedroom" or "Bed" text
          // Look within the parent (usually the label) for siblings
          const parent = textElement.parentElement;
          if (parent) {
            const siblings = Array.from(parent.children);
            siblings.forEach(sibling => {
              if (sibling !== textElement && sibling.tagName !== 'INPUT') {
                const siblingText = sibling.textContent.trim();
                // Hide if it's exactly "Bed" or "Bedroom" (or contains "Bedroom")
                if (siblingText === 'Bed' || siblingText === 'Bedroom' || siblingText.includes('Bedroom')) {
                  sibling.style.display = 'none';
                }
              }
            });
          }
        }
      }
    });
  };

  // --- Helper: Parse URL parameters ---
  const getUrlParameter = (name) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  };

  // --- List Page A/B Filtering Functionality ---
  const initListPageFiltering = (accordionModeActive = false) => {
    const cards = document.querySelectorAll('.card-wrapper');
    const filterButton = document.querySelector('.button-filter');
    const resetButton = document.querySelector('.button-reset');
    const propsyncTabs = document.querySelector('.propsync-tabs');

    // Determine mode: tabs mode vs filter mode
    const isTabMode = !!propsyncTabs;

    // --- Diagnostic: Check for required classes (BEFORE early return) ---
    // Define classes needed for each mode
    const commonClasses = [
      '.card-wrapper',
      '.bedroom-card-value',
      '.price-min-card-value',
      '.price-max-card-value',
      '.sqr-min-card-value',
      '.sqr-max-card-value'
    ];

    const filterModeClasses = [
      '.button-filter',
      '.button-reset',
      '.bedroom-wrapper',
      '.bedroom-wrapper input[type="checkbox"]',
      '.price-range',
      '.sqr-range',
      '.items-summary',
      '.items-count',
      '.results-count',
      '.bedroom-value',
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

    const tabModeClasses = [
      '.propsync-tabs'
    ];

    // Select appropriate classes based on mode
    const requiredClasses = isTabMode
      ? [...commonClasses, ...tabModeClasses]
      : [...commonClasses, ...filterModeClasses];

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

    // Skip diagnostics if Accordion Mode is already active
    if (accordionModeActive) {
      return; // Don't show filter/tab diagnostics when accordion mode is handling the page
    }

    // Filter out expected missing classes
    // In filter mode: .button-filter can be missing (auto-submit fallback)
    // In tab mode: filter classes are expected to be missing
    let otherMissingClasses = missingClasses;
    if (!isTabMode) {
      otherMissingClasses = missingClasses.filter(cls => cls !== '.button-filter');
    }

    // Determine if we have a mostly complete mode structure
    const hasSignificantClasses = foundClasses.length >= requiredClasses.length * 0.5; // At least 50% of required classes

    // Show diagnostics if in Filter/Tab mode with missing classes
    if (hasSignificantClasses && otherMissingClasses.length > 0) {
      const modeLabel = isTabMode ? 'Tab Mode' : 'Filter Mode';
      console.warn(`\n🔍 PropSync Diagnostics (${modeLabel}):`);
      console.warn(`   Found ${foundClasses.length}/${requiredClasses.length} ${isTabMode ? 'tab' : 'filter'} mode classes`);
      console.warn('   ❌ Missing required classes:');
      otherMissingClasses.forEach(cls => console.warn(`      - ${cls}`));
      console.warn('   💡 Complete the structure to enable filtering\n');
    }
    // If no mode detected at all, provide guidance
    else if (!hasSignificantClasses && !isTabMode) {
      console.warn('\n🔍 PropSync Diagnostics:');
      console.warn('   ❌ No filtering mode detected');
      console.warn(`   ℹ️  Found only ${foundClasses.length}/${requiredClasses.length} required classes`);
      console.warn('   💡 To enable filtering, add one of these structures:');
      console.warn('      • Tab Mode: Add .propsync-tabs container');
      console.warn('      • Filter Mode: Add .button-filter and filter controls');
      console.warn('      • Accordion Mode: Add .accordion_accordion elements');
      console.warn('   📖 See README.md for full structure requirements\n');
    }

    // Only require cards to exist - filterButton and resetButton are optional (auto-submit fallback)
    if (!cards.length) return;

    console.log('✅ PropSync filtering initialized with', cards.length, 'cards');

    const bedroomWrappers = document.querySelectorAll('.bedroom-wrapper');
    const bedroomCheckboxes = document.querySelectorAll('.bedroom-wrapper input[type="checkbox"]');
    const priceRangeContainer = document.querySelector('.price-range');
    const sqrRangeContainer = document.querySelector('.sqr-range');
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

      // Mark cards with prices under $1 (including $0 and negative) as sold out
      if ((priceMin !== null && priceMin < 1) || (priceMax !== null && priceMax < 1)) {
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
      // Exclude prices under $1 (sold out) from price range calculation
      if (cardData.priceMin !== null && cardData.priceMin >= 1) overallMinPrice = Math.min(overallMinPrice, cardData.priceMin);
      if (cardData.priceMax !== null && cardData.priceMax >= 1) overallMaxPrice = Math.max(overallMaxPrice, cardData.priceMax);
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
      console.log('📊 Available bedrooms found:', Array.from(availableBedrooms));

      // Check if tabs are inside an accordion structure - if so, move them outside
      const accordionComponent = propsyncTabs.closest('.accordion_component');
      if (accordionComponent) {
        console.log('📍 Tabs detected inside accordion - moving to top of accordion component');
        // Create a wrapper for tabs if it doesn't exist
        let tabsWrapper = accordionComponent.querySelector('.propsync-tabs-wrapper');
        if (!tabsWrapper) {
          tabsWrapper = document.createElement('div');
          tabsWrapper.className = 'propsync-tabs-wrapper';
          tabsWrapper.style.marginBottom = '20px';
          accordionComponent.insertBefore(tabsWrapper, accordionComponent.firstChild);
        }
        // Move tabs to wrapper (or keep reference if already moved)
        if (propsyncTabs.parentElement !== tabsWrapper) {
          tabsWrapper.appendChild(propsyncTabs);
        }
      }

      // Helper function to get bedroom label
      const getBedroomLabel = (bedCount) => {
        if (bedCount === 0) return 'Studio';
        if (bedCount === 1) return '1 Bedroom';
        return `${bedCount} Bedroom`;
      };

      // Generate tabs based on available bedroom counts
      const sortedBedrooms = Array.from(availableBedrooms).sort((a, b) => a - b);

      console.log('📋 Generating tabs for bedroom counts:', sortedBedrooms);

      // Ensure the tabs container is visible
      propsyncTabs.style.display = '';
      propsyncTabs.style.visibility = 'visible';
      propsyncTabs.style.opacity = '1';

      // Clear existing tabs
      propsyncTabs.innerHTML = '';

      // Create "View All" tab (active by default)
      const viewAllTab = document.createElement('div');
      viewAllTab.className = 'tab__link active';
      viewAllTab.setAttribute('data-bedroom-filter', 'all');
      // Ensure tab is visible
      viewAllTab.style.display = '';
      viewAllTab.style.visibility = 'visible';
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
        // Ensure tab is visible
        tab.style.display = '';
        tab.style.visibility = 'visible';
        const buttonText = document.createElement('div');
        buttonText.className = 'button-text';
        buttonText.textContent = getBedroomLabel(bedCount);
        tab.appendChild(buttonText);
        propsyncTabs.appendChild(tab);
      });

      const generatedTabs = propsyncTabs.querySelectorAll('.tab__link');
      console.log('✅ Tabs generated. Total tabs:', generatedTabs.length);

      if (generatedTabs.length === 0) {
        console.error('❌ No tabs were generated! Available bedrooms:', Array.from(availableBedrooms));
      } else {
        console.log('📝 Tab container has', generatedTabs.length, 'tabs');
        generatedTabs.forEach((tab, idx) => {
          console.log(`   Tab ${idx + 1}:`, tab.textContent.trim(), tab.className);
        });

        // Diagnostic: Check computed styles
        const computedStyle = window.getComputedStyle(propsyncTabs);
        console.log('🔍 Tab container computed styles:', {
          display: computedStyle.display,
          visibility: computedStyle.visibility,
          opacity: computedStyle.opacity,
          height: computedStyle.height,
          width: computedStyle.width
        });

        // Check first tab styles
        if (generatedTabs.length > 0) {
          const firstTabStyle = window.getComputedStyle(generatedTabs[0]);
          console.log('🔍 First tab computed styles:', {
            display: firstTabStyle.display,
            visibility: firstTabStyle.visibility,
            opacity: firstTabStyle.opacity
          });
        }
      }

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

      // Check for URL parameter and apply filter
      const bedParam = getUrlParameter('bed');
      if (bedParam !== null) {
        console.log(`🔗 URL parameter detected: bed=${bedParam}`);

        // Find and activate the corresponding tab
        const targetTab = propsyncTabs.querySelector(`[data-bedroom-filter="${bedParam}"]`);

        if (targetTab) {
          // Remove active class from all tabs
          propsyncTabs.querySelectorAll('.tab__link').forEach(t => t.classList.remove('active'));

          // Add active class to target tab
          targetTab.classList.add('active');

          // Apply the filter
          applyTabFilter(bedParam);
          console.log(`✅ Tab filter applied for ${bedParam} bedroom(s)`);
        } else {
          console.warn(`⚠️  No tab found for bed=${bedParam}, showing all results`);
          applyTabFilter('all');
        }
      } else {
        // Initial filter (show all)
        applyTabFilter('all');
      }

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
      const label = wrapper.querySelector('label');

      // Determine which element contains the bedroom text
      const textElement = valueEl || label;

      if (!textElement) {
        wrapper.style.display = 'none';
        return;
      }

      // Check if we have a stored numeric value (for "Studio" case)
      const storedNum = textElement.getAttribute('data-bedroom-num');
      let value = NaN;
      if (storedNum !== null) {
        value = parseInt(storedNum, 10);
      } else {
        // Fallback: parse text content, handling "Studio" or "Studio Bedroom" as 0
        const textContent = textElement.textContent.trim().toLowerCase();
        if (textContent === 'studio' || textContent === 'studio bedroom' || textContent === '0 bedroom') {
          value = 0;
        } else {
          // Extract first number from text (e.g., "1 Bedroom" -> 1)
          const match = textContent.match(/(\d+)/);
          if (match) {
            value = parseInt(match[1], 10);
          }
        }
      }

      wrapper.style.display = (!isNaN(value) && availableBedrooms.has(value)) ? '' : 'none';
    });

    // Filter functionality with debouncing
    const applyFilters = debounce(() => {
      const selectedBedrooms = Array.from(bedroomCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => {
          const wrapper = cb.closest('.bedroom-wrapper');
          const valueEl = wrapper?.querySelector('.bedroom-value');
          const label = wrapper?.querySelector('label');

          // Determine which element contains the bedroom text
          const textElement = valueEl || label;

          if (!textElement) return NaN;

          // Check if we have a stored numeric value (for "Studio" case)
          const storedNum = textElement.getAttribute('data-bedroom-num');
          if (storedNum !== null) {
            return parseInt(storedNum, 10);
          }

          // Fallback: parse text content, handling "Studio" or "Studio Bedroom" as 0
          const textContent = textElement.textContent.trim().toLowerCase();
          if (textContent === 'studio' || textContent === 'studio bedroom' || textContent === '0 bedroom') {
            return 0;
          }

          // Extract first number from text (e.g., "1 Bedroom" -> 1)
          const match = textContent.match(/(\d+)/);
          if (match) {
            return parseInt(match[1], 10);
          }

          return NaN;
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

        // Price filter (skip for sold-out cards with prices under $1)
        if (isVisible && cardData.priceMax !== null && cardData.priceMin !== null) {
          // Don't filter out sold-out cards (prices under $1, including $0 and negative)
          const isSoldOut = cardData.priceMin < 1 || cardData.priceMax < 1;
          if (!isSoldOut && (cardData.priceMax < priceMin || cardData.priceMin > priceMax)) {
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

    // Check for URL parameter and apply filter
    const bedParam = getUrlParameter('bed');
    if (bedParam !== null) {
      console.log(`🔗 URL parameter detected: bed=${bedParam}`);

      let filterApplied = false;

      // Find and check the corresponding bedroom checkbox
      bedroomWrappers.forEach(wrapper => {
        const valueEl = wrapper.querySelector('.bedroom-value');
        const label = wrapper.querySelector('label');
        const checkbox = wrapper.querySelector('input[type="checkbox"]');

        if (!checkbox) return;

        const textElement = valueEl || label;
        if (!textElement) return;

        // Get the stored numeric value or parse from text
        const storedNum = textElement.getAttribute('data-bedroom-num');
        let bedValue = null;

        if (storedNum !== null) {
          bedValue = storedNum;
        } else {
          const textContent = textElement.textContent.trim().toLowerCase();
          if (textContent === 'studio' || textContent === 'studio bedroom' || textContent === '0 bedroom') {
            bedValue = '0';
          } else {
            const match = textContent.match(/(\d+)/);
            if (match) {
              bedValue = match[1];
            } else {
              // Fallback: try parsing the entire text as a number
              const parsed = parseInt(textContent, 10);
              if (!isNaN(parsed)) {
                bedValue = String(parsed);
              }
            }
          }
        }

        // Check the checkbox if it matches the URL parameter
        if (bedValue === bedParam) {
          // Set the actual checkbox state
          checkbox.checked = true;
          
          // Update Webflow's visual checkbox element (if using Webflow custom checkboxes)
          const webflowCheckboxDiv = wrapper.querySelector('.w-checkbox-input');
          if (webflowCheckboxDiv) {
            webflowCheckboxDiv.classList.add('w--redirected-checked');
          }
          
          filterApplied = true;
        }
      });

      if (filterApplied) {
        // Apply filters after setting the checkbox from URL parameter
        applyFilters();
        console.log(`✅ Filter applied for ${bedParam} bedroom(s)`);
      } else {
        console.warn(`⚠️  No filter option found for bed=${bedParam}, showing all results`);
      }
    }

    // Initial count
    if (itemsCountEl) {
      itemsCountEl.textContent = initialCardData.length;
    }
    if (resultCountSummaryEl) {
      resultCountSummaryEl.textContent = initialCardData.length;
    }
  };

  // --- List Page C Accordion Functionality ---

  // Helper: Get floor type name from bedroom value
  const getFloorTypeName = (bedValue) => {
    if (bedValue.toLowerCase() === 'studio') return "Studio";
    const num = parseInt(bedValue, 10);
    if (isNaN(num)) return "Unknown";
    if (num === 0) return "Studio";
    if (num === 1) return "1 Bedroom";
    return `${num} Bedroom`;
  };

  // Helper: Add accordion click interactivity
  const addAccordionClickHandler = (container) => {
    addEventListenerWithCleanup(container, 'click', function(event) {
      const question = event.target.closest('.accordion_question');
      if (!question) return;

      const accordion = question.closest('.accordion_accordion');
      if (!accordion) return;

      const answer = accordion.querySelector('.accordion_answer');
      const iconWrapper = question.querySelector('.accordion_icon-wrapper');

      if (!answer) return;

      const isActive = accordion.classList.contains('active');

      if (isActive) {
        answer.style.maxHeight = '0px';
        answer.style.opacity = '0';
        if (iconWrapper) iconWrapper.style.transform = 'rotate(0deg)';
        accordion.classList.remove('active');
      } else {
        accordion.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.opacity = '1';
        if (iconWrapper) iconWrapper.style.transform = 'rotate(45deg)';
      }
    });
  };

  // Helper: Process card data (sold out marking, availability)
  const processCardData = (card) => {
    const bedElement = card.querySelector('.bedroom-card-value');
    const priceElement = card.querySelector('.price-min-card-value');
    const priceMaxElement = card.querySelector('.price-max-card-value');

    if (!bedElement || !priceElement) return null;

    const bedValue = bedElement.textContent.trim();
    const priceValue = parseInt(priceElement.textContent.trim().replace(/[^0-9.-]+/g, ''), 10);
    const priceMaxValue = priceMaxElement ? parseInt(priceMaxElement.textContent.trim().replace(/[^0-9.-]+/g, ''), 10) : null;

    // Mark cards with prices under $1 (including $0 and negative) as sold out
    if (priceValue < 1 || (priceMaxValue !== null && priceMaxValue < 1)) {
      const priceContainer = card.querySelector('.price-range');
      markPriceContainerAsSoldOut(priceContainer || card);
    }

    // Process availability wrapper
    processAvailabilityWrapper(card);

    const floorType = getFloorTypeName(bedValue);
    const numericBedValue = bedValue.toLowerCase() === 'studio' ? 0 : parseInt(bedValue, 10);

    if (isNaN(priceValue)) return null;

    return {
      bedValue,
      priceValue,
      priceMaxValue,
      floorType,
      numericBedValue: isNaN(numericBedValue) ? Infinity : numericBedValue
    };
  };

  // Accordion structure: Has .accordion_accordion with cards already inside
  const initAccordionStructure = () => {
    const allAccordions = document.querySelectorAll('.accordion_accordion');
    const accordions = Array.from(allAccordions).filter(acc => {
      // Only process accordions NOT inside .accordion_list (those are templates)
      return !acc.closest('.accordion_list') && !acc.parentElement?.classList.contains('accordion_list');
    });

    // Only show diagnostics if accordion elements exist
    if (allAccordions.length > 0) {
      console.warn('🔍 PropSync Accordion Diagnostics:');
      console.warn(`   Found ${allAccordions.length} .accordion_accordion element(s)`);
    }

    if (!accordions.length) {
      if (allAccordions.length > 0) {
        console.warn(`   ⚠️  All ${allAccordions.length} accordion(s) filtered out (templates inside .accordion_list)`);
        console.warn('   💡 TIP: Accordions should be placed OUTSIDE .accordion_list container');
        console.warn('   📖 Minimum structure: .accordion_accordion > .accordion_answer > .card-wrapper');
        console.warn('   ❌ Accordion Mode NOT activated\n');
      }
      // Silently return false when no accordion elements found - this is expected on Filter/Tab pages
      return false;
    }

    console.warn(`   Processing ${accordions.length} accordion(s)`);

    let processedAny = false;

    accordions.forEach((accordion, accordionIndex) => {
      const answer = accordion.querySelector('.accordion_answer');

      // Try to find cards - check for .floorplan-collection-list first (preferred), then fallback to direct children
      const cardList = answer?.querySelector('.floorplan-collection-list');
      let cards = [];

      if (cardList) {
        cards = Array.from(cardList.querySelectorAll('.card-wrapper'));
      } else if (answer) {
        // Fallback: look for cards directly in .accordion_answer
        cards = Array.from(answer.querySelectorAll('.card-wrapper'));
      }

      console.warn(`\n   📂 Accordion #${accordionIndex + 1}:`);
      console.warn(`      - Has .accordion_answer: ${!!answer}`);
      console.warn(`      - Cards container: ${cardList ? '.floorplan-collection-list' : 'direct in .accordion_answer'}`);
      console.warn(`      - Found ${cards.length} card(s)`);

      if (!cards.length) {
        console.warn('      ⚠️  Skipped - No .card-wrapper elements found');
        return;
      }

      processedAny = true;

      // Group cards by floor type
      const floorPlanGroups = {};

      cards.forEach(card => {
        const cardData = processCardData(card);
        if (!cardData) return;

        const { floorType, numericBedValue, priceValue } = cardData;

        if (!floorPlanGroups[floorType]) {
          floorPlanGroups[floorType] = {
            cards: [],
            minPrice: Infinity,
            numericBedValue
          };
        }

        floorPlanGroups[floorType].cards.push(card);
        if (priceValue >= 1) {
          floorPlanGroups[floorType].minPrice = Math.min(floorPlanGroups[floorType].minPrice, priceValue);
        }
      });

      // Sort floor types by bedroom count
      const sortedTypes = Object.keys(floorPlanGroups).sort((a, b) => {
        return floorPlanGroups[a].numericBedValue - floorPlanGroups[b].numericBedValue;
      });

      console.warn(`      📊 Grouped into ${sortedTypes.length} bedroom type(s):`);
      sortedTypes.forEach(type => {
        const group = floorPlanGroups[type];
        const priceText = group.minPrice === Infinity ? 'N/A' : formatCurrency(group.minPrice);
        console.warn(`         • ${type}: ${group.cards.length} card(s), starting at ${priceText}`);
      });

      // Use the first accordion as template, hide it
      accordion.style.display = 'none';
      const parentContainer = accordion.parentElement;

      // Create one accordion per bedroom type
      let lastInsertedAccordion = accordion;

      sortedTypes.forEach((floorType, index) => {
        const group = floorPlanGroups[floorType];

        // Clone the template accordion
        const newAccordion = accordion.cloneNode(true);
        newAccordion.style.display = 'block';

        // Get elements in the cloned accordion
        const newAnswer = newAccordion.querySelector('.accordion_answer');

        // Try to find card container - prefer .floorplan-collection-list, fallback to .accordion_answer
        let newCardContainer = newAnswer?.querySelector('.floorplan-collection-list');
        if (!newCardContainer) {
          newCardContainer = newAnswer;
        }

        if (!newCardContainer) return;

        // Replace {{floor_type}} placeholder
        const bedroomTextElements = newAccordion.querySelectorAll('.bedroom-text');
        bedroomTextElements.forEach(el => {
          el.textContent = el.textContent.replace(/\{\{floor_type\}\}/g, floorType);
        });

        // Replace {{starting_price}} and {{floor_type}} in accordion text
        const accordionTextElements = newAccordion.querySelectorAll('.floorplan-accordian-text');
        accordionTextElements.forEach(el => {
          let text = el.textContent;

          // Replace {{starting_price}}
          if (text.includes('{{starting_price}}')) {
            const priceText = group.minPrice === Infinity ? 'N/A' : formatCurrency(group.minPrice);
            text = text.replace(/\{\{starting_price\}\}/g, priceText);
          }

          // Replace {{floor_type}}
          text = text.replace(/\{\{floor_type\}\}/g, floorType);

          el.textContent = text;
        });

        // Clear the card container and add only cards for this bedroom type
        newCardContainer.innerHTML = '';
        group.cards.forEach(cardElement => {
          newCardContainer.appendChild(cardElement);
        });

        // Set initial collapsed state
        if (newAnswer) {
          newAnswer.style.maxHeight = '0px';
          newAnswer.style.opacity = '0';
          newAnswer.style.overflow = 'hidden';
          newAnswer.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
        }
        newAccordion.classList.remove('active');

        // Insert the new accordion after the last inserted accordion
        if (parentContainer) {
          parentContainer.insertBefore(newAccordion, lastInsertedAccordion.nextSibling);
          lastInsertedAccordion = newAccordion;
        }
      });

      // Add click handler to parent container
      if (parentContainer) {
        addAccordionClickHandler(parentContainer);
      }

      console.warn(`      ✅ Created ${sortedTypes.length} accordion section(s)`);
    });

    if (processedAny) {
      console.warn('\n   ✅ Accordion Mode ACTIVATED');
    }

    return processedAny;
  };

  const initAccordionFunctionality = () => {
    return initAccordionStructure();
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

        if ((priceMinNum < 1) || (priceMaxNum < 1)) {
          // Try to find price container, fallback to wrapper
          const container = priceContainer || wrapper;
          markPriceContainerAsSoldOut(container);
          // Process availability wrapper even when price is under $1
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
  // Run diagnostics first
  checkForDuplicateClasses();

  // Log card count on load
  const initialCards = document.querySelectorAll('.card-wrapper');
  console.log(`📦 Found ${initialCards.length} cards on page load`);

  formatPriceElements();
  formatSquareFootageElements();
  initPageTemplate();
  replaceZeroBedroomWithStudio();
  const accordionModeActive = initAccordionFunctionality(); // Must run BEFORE initListPageFiltering to read original prices
  initListPageFiltering(accordionModeActive);
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
