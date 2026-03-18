/**
 * Clears the assigned menu.
 *
 * @param {HTMLElement|null} menu - The menu.
 * @returns {void} Nothing.
 */
function clearAssignedMenu(menu) {
   menu.innerHTML = "";
}


/**
 * Loads the assigned contacts into the menu.
 *
 * @param {object} elements - The elements object.
 * @returns {Promise<void>} A promise that resolves when the contacts are loaded.
 */
async function loadAssignedContacts(elements) {
   try {
      renderAssignedContacts(elements.menu, await loadAssignedContactsFromFirebase());
   } catch (error) {
      console.error("Assigned contacts loading failed:", error);
      clearAssignedMenu(elements.menu);
   }
}


/**
 * Stores the current assigned input state.
 *
 * @param {object} elements - The elements object.
 * @returns {void} Nothing.
 */
function rememberAssignedInputState(elements) {
   if (!elements.input.value) return;
   elements.input.dataset.lastValue = elements.input.value;
   elements.label.dataset.lastLabel = elements.label.textContent;
}


/**
 * Initializes the assigned select state.
 *
 * @param {object} elements - The elements object.
 * @returns {void} Nothing.
 */
function initializeAssignedSelectState(elements) {
   elements.select.setAttribute("aria-expanded", "false");
   elements.label.dataset.placeholder = elements.label.textContent;
   rememberAssignedInputState(elements);
}


/**
 * Initializes the assigned select.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function initAssignedSelect() {
   const elements = getAssignedElements();
   if (!elements) return;
   await loadAssignedContacts(elements);
   initializeAssignedSelectState(elements);
   setupAssignedListeners(elements);
}
