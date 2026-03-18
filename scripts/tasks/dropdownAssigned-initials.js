/**
 * Checks whether the overflow should show.
 *
 * @param {number} selectedCount - The selected count.
 * @param {number} maxSlots - The max slots.
 * @returns {boolean} Whether the overflow should show.
 */
function shouldShowOverflow(selectedCount, maxSlots) {
   return selectedCount > maxSlots;
}


/**
 * Creates the initial element from option.
 *
 * @param {*} option - The option.
 * @param {object} elements - The elements object.
 * @returns {HTMLDivElement|null} The initial element from option element, or null when it is not available.
 */
function createInitialElementFromOption(option, elements) {
   const initialsText = option.querySelector(".add-task__option-initials")?.textContent;
   if (!initialsText) return null;
   const avatarColor = option.dataset.color || "#ff7a00";
   const temp = document.createElement("div");
   temp.innerHTML = createInitialHTML(initialsText, avatarColor);
   const initialElement = temp.firstElementChild;
   if (!initialElement) return null;
   initialElement.addEventListener("click", () => {
      removeContactSelection(option);
      updateContactInitials(elements);
   });
   return initialElement;
}


/**
 * Checks whether there are selected contacts.
 *
 * @param {NodeListOf<Element>|Array<Element>} selectedOptions - The selected options collection.
 * @returns {boolean} Whether there are selected contacts.
 */
function hasSelectedContacts(selectedOptions) {
   return selectedOptions.length > 0;
}


/**
 * Clears the initials container.
 *
 * @param {HTMLElement|null} container - The container.
 * @returns {void} Nothing.
 */
function clearInitialsContainer(container) {
   container.innerHTML = "";
}


/**
 * Adds the initials to container.
 *
 * @param {NodeListOf<Element>|Array<Element>} selectedOptions - The selected options collection.
 * @param {HTMLElement|null} container - The container.
 * @param {*} maxDisplay - The max display.
 * @param {object} elements - The elements object.
 * @returns {*} The initials to container result.
 */
function addInitialsToContainer(selectedOptions, container, maxDisplay, elements) {
   let displayCount = 0;
   selectedOptions.forEach((option) => {
      if (displayCount >= maxDisplay) return;
      const initialElement = createInitialElementFromOption(option, elements);
      if (!initialElement) return;
      container.appendChild(initialElement);
      displayCount++;
   });
   return displayCount;
}


/**
 * Adds the overflow indicator.
 *
 * @param {HTMLElement|null} container - The container.
 * @param {number} totalCount - The total count.
 * @param {number} displayedCount - The displayed count.
 * @returns {void} Nothing.
 */
function addOverflowIndicator(container, totalCount, displayedCount) {
   const remainingCount = totalCount - displayedCount;
   if (remainingCount > 0) {
      const html = createOverflowHTML(remainingCount);
      const temp = document.createElement("div");
      temp.innerHTML = html;
      const overflowElement = temp.firstElementChild;
      if (overflowElement) container.appendChild(overflowElement);
   }
}


/**
 * Updates the wrapper padding.
 *
 * @param {HTMLElement|null} wrapper - The wrapper.
 * @param {boolean} hasContacts - Whether there are contacts.
 * @param {HTMLElement|null} menuOpen - The menu open.
 * @returns {void} Nothing.
 */
function updateWrapperPadding(wrapper, hasContacts, menuOpen) {
   if (!wrapper) return;
   if (hasContacts && !menuOpen) {
      wrapper.style.paddingBottom = "52px";
   } else {
      wrapper.style.paddingBottom = "0px";
   }
}


/**
 * Renders the initials.
 *
 * @param {object} elements - The elements object.
 * @param {NodeListOf<Element>|Array<Element>} selectedOptions - The selected options collection.
 * @param {*} maxDisplay - The max display.
 * @returns {*} The initials result.
 */
function renderInitials(elements, selectedOptions, maxDisplay) {
   const displayedCount = addInitialsToContainer(
      selectedOptions,
      elements.initials,
      maxDisplay,
      elements
   );
   addOverflowIndicator(elements.initials, selectedOptions.length, displayedCount);
   return displayedCount;
}


/**
 * Updates the contact initials.
 *
 * @param {object} elements - The elements object.
 * @returns {void} Nothing.
 */
function updateContactInitials(elements) {
   const params = getInitialsParameters(elements);
   if (!params) return;
   renderInitials(elements, params.selectedOptions, params.maxDisplay);
   const wrapper = getSelectWrapper(elements.select);
   const hasContacts = hasSelectedContacts(params.selectedOptions);
   updateWrapperPadding(wrapper, hasContacts, params.menuOpen);
}
