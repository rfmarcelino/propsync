document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 PropSync Unified Script Loaded');

  // --- Helper Functions ---
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
    const value = target.textContent.trim().replace(/[^0-9.]+/g, '');
    if (value === '') return null;
    const num = isFloat ? parseFloat(value) : parseInt(value, 10);
    return isNaN(num) ? null : num;
  };

  // --- Apply Links ---
  const applyButtons = document.querySelectorAll('[applylink]');
  applyButtons.forEach(function (button) {
    const linkValue = button.getAttribute('applylink');
    if (linkValue) {
      button.setAttribute('href', linkValue);
    }
  });

  // --- Format All Price Elements ---
  const formatPriceElements = () => {
    const priceSelectors = ['.price-min', '.price-max', '.price-min-card-value', '.price-max-card-value'];

    priceSelectors.forEach(selector => {
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

    if (priceMinValue && priceMaxValue && priceSpacer) {
      if (priceMinValue.textContent === priceMaxValue.textContent) {
        priceSpacer.style.display = 'none';
        priceMaxValue.style.display = 'none';

        if (startingAt) {
          startingAt.style.display = 'inline';
        }
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
      leftArrow.addEventListener("click", () => moveSlide("left"));
      rightArrow.addEventListener("click", () => moveSlide("right"));
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
      slideInterval = setInterval(() => moveSlide("right"), 2000);
    };

    const resetAutoSlide = () => {
      clearInterval(slideInterval);
      startAutoSlide();
    };

    initSlider();
  };

  // --- List Page A/B Filtering Functionality ---
  const initListPageFiltering = () => {
    const cards = document.querySelectorAll('.card-wrapper');
    const filterButton = document.querySelector('.button-filter');
    const resetButton = document.querySelector('.button-reset');

    if (!cards.length || !filterButton || !resetButton) return;

    const bedroomWrappers = document.querySelectorAll('.bedroom-wrapper');
    const bedroomCheckboxes = document.querySelectorAll('.bedroom-wrapper input[type="checkbox"]');
    const priceRangeContainer = document.querySelector('.price-range');
    const sqrRangeContainer = document.querySelector('.sqr-range');
    const resultsCountEl = document.querySelector('[fs-cmsfilter-element="results-count"]');

    let isAnySliderDragging = false;
    let overallMinPrice = Infinity;
    let overallMaxPrice = -Infinity;
    let overallMinSqr = Infinity;
    let overallMaxSqr = -Infinity;
    const availableBedrooms = new Set();
    const initialCardData = [];

    // Initialize card data and filter out cards with negative prices
    cards.forEach((card) => {
      const bed = parseVal(card, '.bedroom-card-value');
      const priceMin = parseVal(card, '.price-min-card-value');
      const priceMax = parseVal(card, '.price-max-card-value');
      const sqrMin = parseVal(card, '.sqr-min-card-value');
      const sqrMax = parseVal(card, '.sqr-max-card-value');

      // Hide cards with negative minimum price
      if (priceMin !== null && priceMin < 0) {
        card.style.display = 'none';
        return;
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
    });

    if (overallMinPrice === Infinity) overallMinPrice = 0;
    if (overallMaxPrice === -Infinity || overallMaxPrice < overallMinPrice) overallMaxPrice = Math.max(1000, overallMinPrice);
    if (overallMinSqr === Infinity) overallMinSqr = 0;
    if (overallMaxSqr === -Infinity || overallMaxSqr < overallMinSqr) overallMaxSqr = Math.max(2000, overallMinSqr);

    // Setup range sliders
    const setupRangeSlider = (sliderName, container, valueFormatter) => {
      if (!container) return;

      const minHandle = container.querySelector(`.${sliderName}-min-handler`);
      const maxHandle = container.querySelector(`.${sliderName}-max-handler`);
      const rangeBar = container.querySelector(`.${sliderName}-range-bar`);
      const minDisplay = container.querySelector(`.${sliderName}-min`);
      const maxDisplay = container.querySelector(`.${sliderName}-max`);
      const track = minHandle?.closest('.rangeslider_track');

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
        }
      };

      minHandle.addEventListener('mousedown', (e) => onDragStart(e, minHandle));
      minHandle.addEventListener('touchstart', (e) => onDragStart(e, minHandle), { passive: true });
      maxHandle.addEventListener('mousedown', (e) => onDragStart(e, maxHandle));
      maxHandle.addEventListener('touchstart', (e) => onDragStart(e, maxHandle), { passive: true });

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

    // Filter functionality
    const applyFilters = () => {
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
    };

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
    };

    filterButton.addEventListener('click', (e) => {
      e.preventDefault();
      applyFilters();
    });

    resetButton.addEventListener('click', (e) => {
      e.preventDefault();
      resetFilters();
    });

    // Initial count
    if (resultsCountEl) {
      resultsCountEl.textContent = initialCardData.length;
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

    // Group cards and filter out negative prices
    allCardWrappers.forEach(card => {
      const bedElement = card.querySelector('.bedroom-card-value');
      const priceElement = card.querySelector('.price-min-card-value');

      if (bedElement && priceElement) {
        const bedValue = bedElement.textContent.trim();
        const priceValue = parseInt(priceElement.textContent.trim().replace(/[^0-9]/g, ''), 10);

        // Skip cards with negative prices
        if (priceValue < 0) {
          card.style.display = 'none';
          return;
        }

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
        floorPlanGroups[floorType].minPrice = Math.min(floorPlanGroups[floorType].minPrice, priceValue);
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

        const title = `${floorType} Starting at ${formatCurrency(group.minPrice)} -- Number of ${group.cards.length} Floorplans`;
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
    accordionListContainer.addEventListener('click', function(event) {
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

          if (priceMaxDollar) {
            priceMaxDollar.style.display = 'none';
          }

          if (startingAt) {
            startingAt.style.display = 'inline';
          }
        }
      }
    });
  };

  // --- Initialize All Functionality ---
  formatPriceElements();
  initPageTemplate();
  initListPageFiltering();
  initAccordionFunctionality();
  initCardComparisons();

  console.log('✅ PropSync initialization complete');
});
