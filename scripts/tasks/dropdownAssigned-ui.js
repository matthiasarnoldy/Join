/**
 * Creates the assigned option element.
 *
 * @param {object} contact - The contact object.
 * @returns {HTMLLIElement} The assigned option element element.
 */
function createAssignedOptionElement(contact) {
   const option = document.createElement("li");
   option.className = "add-task__select-option add-task__select-option--assigned";
   option.dataset.value = `contact-${String(contact.id)}`;
   option.dataset.name = contact.name;
   option.dataset.color = contact.color || "#ff7a00";

   const content = document.createElement("div");
   content.className = "add-task__option-content";

   const initials = document.createElement("span");
   initials.className = "add-task__option-initials";
   initials.textContent = contact.initials;
   initials.style.backgroundColor = contact.color || "#ff7a00";

   content.append(initials, document.createTextNode(` ${contact.name}`));

   const checkbox = document.createElement("img");
   checkbox.src = assignedAssetPath("icons/desktop/checkBox.svg");
   checkbox.alt = "";
   checkbox.className = "add-task__option-checkbox";

   option.append(content, checkbox);
   return option;
}


/**
 * Checks whether the assigned menu is open.
 *
 * @param {object} elements - The elements object.
 * @returns {boolean} Whether the assigned menu is open.
 */
function isAssignedMenuOpen(elements) {
   return elements.select.classList.contains(ASSIGNED_OPEN_CLASS);
}


/**
 * Handles the search keydown.
 *
 * @param {Event} event - The event object that triggered the handler.
 * @param {HTMLInputElement|null} searchInput - The search input.
 * @returns {void} Nothing.
 */
function handleSearchKeydown(event, searchInput) {
   preventSearchDeletion(event, searchInput);
}


/**
 * Handles the search input.
 *
 * @param {Event} event - The event object that triggered the handler.
 * @param {HTMLInputElement|null} searchInput - The search input.
 * @param {HTMLElement|null} menu - The menu.
 * @returns {void} Nothing.
 */
function handleSearchInput(event, searchInput, menu) {
   ensureSearchPrefix(searchInput);
   filterContactOptions(searchInput, menu);
}


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
