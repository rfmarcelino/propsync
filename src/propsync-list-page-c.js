  document.addEventListener('DOMContentLoaded', function() {

    const accordionListContainer = document.querySelector('.accordion_list');
  const allCardWrappers = Array.from(document.querySelectorAll('.accordion_component .card-wrapper')); // Get all cards initially
  const templateAccordion = document.querySelector('.accordion_accordion'); // Get the template structure

  if (!accordionListContainer || !templateAccordion || allCardWrappers.length === 0) {
    console.error("Required elements not found. Make sure .accordion_list, .accordion_accordion, and .card-wrapper elements exist.");
  // Optionally hide the whole component if nothing can be built
  const component = document.querySelector('.accordion_component');
  if(component) component.style.display = 'none';
  return;
    }

  // --- 1. & 2. Gather and Group Data ---
  const floorPlanGroups = { };

  // Helper function to get floor type name
  function getFloorTypeName(bedValue) {
        const num = parseInt(bedValue, 10);
  if (isNaN(num)) return "Unknown"; // Handle cases where value isn't a number
  if (num === 0) return "Studio";
  if (num === 1) return "1 Bedroom";
  return `${num} Bedroom`; // For 2, 3, 4, 5, 6...
    }

    allCardWrappers.forEach(card => {
        const bedElement = card.querySelector('.bedroom-card-value');
  const priceElement = card.querySelector('.price-min-card-value');

  if (bedElement && priceElement) {
            const bedValue = bedElement.textContent.trim();
  const priceValue = parseInt(priceElement.textContent.trim().replace(/[^0-9]/g, ''), 10); // Clean and parse price
  const floorType = getFloorTypeName(bedValue);
  const numericBedValue = parseInt(bedValue, 10); // Keep numeric value for sorting

  if (isNaN(priceValue) || priceValue < 0) {
    console.warn("Skipping card with invalid or negative price:", priceValue, "for type:", floorType, card);
  return; // Skip card if price is invalid or negative
            }

  if (!floorPlanGroups[floorType]) {
    floorPlanGroups[floorType] = {
      cards: [],
      minPrice: Infinity,
      numericBedValue: isNaN(numericBedValue) ? Infinity : numericBedValue // Store for sorting
    };
            }

  floorPlanGroups[floorType].cards.push(card);
  floorPlanGroups[floorType].minPrice = Math.min(floorPlanGroups[floorType].minPrice, priceValue);
        } else {
    console.warn("Skipping card, missing bed or price element:", card);
        }
    });

    // --- 3. Prepare for Generation (Sort by bedroom number) ---
    const sortedFloorTypes = Object.keys(floorPlanGroups).sort((a, b) => {
        const groupA = floorPlanGroups[a];
  const groupB = floorPlanGroups[b];
  return groupA.numericBedValue - groupB.numericBedValue;
    });

  // --- 4. & 5. Generate and Populate Accordions ---
  accordionListContainer.innerHTML = ''; // Clear the original container (which might just have the template)

    sortedFloorTypes.forEach(floorType => {
        const group = floorPlanGroups[floorType];

        if (group.cards.length > 0) {
            // Clone the template
            const newAccordion = templateAccordion.cloneNode(true);

  // Find elements within the clone
  const question = newAccordion.querySelector('.accordion_question');
  const answer = newAccordion.querySelector('.accordion_answer');
  const titleTextElement = newAccordion.querySelector('.floorplan-accordian-text');
  const cardList = newAccordion.querySelector('.floorplan-collection-list'); // Target the list inside the answer

  if (!question || !answer || !titleTextElement || !cardList) {
    console.error("Template accordion structure is missing required elements.");
  return; // Skip if template is broken
            }

  // --- Update Title ---
  const formattedPrice = group.minPrice.toLocaleString();
  const title = `${floorType} Starting at $${formattedPrice} -- Number of ${group.cards.length} Floorplans`;
  titleTextElement.textContent = title;
  // Update the simpler title too if needed
  const simpleTitleElement = newAccordion.querySelector('.bedroom-text');
  if(simpleTitleElement) simpleTitleElement.textContent = floorType;


  // --- Populate Cards ---
  cardList.innerHTML = ''; // Clear any template cards within the list
            group.cards.forEach(cardElement => {
    // Important: We move the *original* card elements, not clones
    cardList.appendChild(cardElement);
            });

  // --- Set Initial State (Collapsed) ---
  answer.style.maxHeight = '0px';
  answer.style.opacity = '0';
  answer.style.overflow = 'hidden'; // Ensure content is clipped
  newAccordion.classList.remove('active'); // Ensure no active class initially

  // Append the new accordion to the main list
  accordionListContainer.appendChild(newAccordion);
        }
    });

  // --- 6. Add Interaction ---
  accordionListContainer.addEventListener('click', function(event) {
        const question = event.target.closest('.accordion_question');
  if (!question) return; // Exit if click wasn't on or inside a question

  const accordion = question.closest('.accordion_accordion');
  if (!accordion) return; // Exit if structure is wrong

  const answer = accordion.querySelector('.accordion_answer');
  const iconWrapper = question.querySelector('.accordion_icon-wrapper');

  if (!answer || !iconWrapper) return; // Exit if structure is wrong

  const isActive = accordion.classList.contains('active');

  if (isActive) {
    // Collapse
    answer.style.maxHeight = '0px';
  answer.style.opacity = '0';
  iconWrapper.style.transform = 'rotate(0deg)';
  accordion.classList.remove('active');
        } else {
    // Expand
    accordion.classList.add('active');
  // Set max-height to scrollHeight for smooth animation
  answer.style.maxHeight = answer.scrollHeight + 'px';
  answer.style.opacity = '1';
  iconWrapper.style.transform = 'rotate(45deg)';

        }
    });
  // Get all card-wrapper elements
  const cardWrappers = document.querySelectorAll('.card-wrapper');

  // Helper function for parsing values
  const parseVal = (el, selector) => {
    const target = el.querySelector(selector);
    if (!target || !target.textContent) return null;
    const value = target.textContent.trim().replace(/[^0-9.]+/g, '');
    if (value === '') return null;
    const num = parseInt(value, 10);
    return isNaN(num) ? null : num;
  };

  // Process each card-wrapper individually
  cardWrappers.forEach(function(wrapper) {
    // Format prices with commas - direct approach
    const priceElements = wrapper.querySelectorAll('.price-min-card-value, .price-max-card-value');
    priceElements.forEach(priceEl => {
      if (priceEl.textContent) {
        const value = priceEl.textContent.trim().replace(/[^0-9.]+/g, '');
        const price = parseInt(value, 10);
        if (!isNaN(price) && price >= 0) {
          priceEl.textContent = price.toLocaleString();
        }
      }
    });

    // Format square footage with commas - direct approach
    const sqrElements = wrapper.querySelectorAll('.sqr-min-card-value, .sqr-max-card-value');
    sqrElements.forEach(sqrEl => {
      if (sqrEl.textContent) {
        const value = sqrEl.textContent.trim().replace(/[^0-9.]+/g, '');
        const sqr = parseInt(value, 10);
        if (!isNaN(sqr)) {
          sqrEl.textContent = sqr.toLocaleString();
        }
      }
    });

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
