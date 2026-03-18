/**
 * Applies the assigned option data.
 *
 * @param {object} contact - The contact object.
 * @param {HTMLLIElement} option - The assigned option element.
 * @returns {void} Nothing.
 */
function applyAssignedOptionData(contact, option) {
   option.dataset.value = `contact-${String(contact.id)}`;
   option.dataset.name = contact.name;
   option.dataset.color = contact.color || "#ff7a00";
}


/**
 * Creates the assigned initials element.
 *
 * @param {object} contact - The contact object.
 * @returns {HTMLSpanElement} The assigned initials element.
 */
function createAssignedOptionInitials(contact) {
   const initials = document.createElement("span");
   initials.className = "add-task__option-initials";
   initials.textContent = contact.initials;
   initials.style.backgroundColor = contact.color || "#ff7a00";
   return initials;
}


/**
 * Creates the assigned option content.
 *
 * @param {object} contact - The contact object.
 * @returns {HTMLDivElement} The assigned option content element.
 */
function createAssignedOptionContent(contact) {
   const content = document.createElement("div");
   content.className = "add-task__option-content";
   content.append(createAssignedOptionInitials(contact), document.createTextNode(` ${contact.name}`));
   return content;
}


/**
 * Creates the assigned option checkbox.
 * @returns {HTMLImageElement} The assigned option checkbox.
 */
function createAssignedOptionCheckbox() {
   const checkbox = document.createElement("img");
   checkbox.src = assignedAssetPath("icons/desktop/checkBox.svg");
   checkbox.alt = "";
   checkbox.className = "add-task__option-checkbox";
   return checkbox;
}


/**
 * Creates the assigned option element.
 *
 * @param {object} contact - The contact object.
 * @returns {HTMLLIElement} The assigned option element element.
 */
function createAssignedOptionElement(contact) {
   const option = document.createElement("li");
   option.className = "add-task__select-option add-task__select-option--assigned";
   applyAssignedOptionData(contact, option);
   option.append(createAssignedOptionContent(contact), createAssignedOptionCheckbox());
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
 * Renders the assigned contacts.
 *
 * @param {HTMLElement|null} menu - The menu.
 * @param {Array<object>} contacts - The contacts list.
 * @returns {void} Nothing.
 */
function renderAssignedContacts(menu, contacts) {
   menu.innerHTML = "";
   contacts.forEach((contact) => {
      menu.appendChild(createAssignedOptionElement(contact));
   });
}


/**
 * Opens the assigned menu.
 *
 * @param {object} elements - The elements object.
 * @returns {void} Nothing.
 */
function openAssignedMenu(elements) {
   elements.select.classList.add(ASSIGNED_OPEN_CLASS);
   elements.select.setAttribute("aria-expanded", "true");
   if (elements.group) {
      elements.group.classList.add("add-task__selection-group--assigned-open");
   }
   const searchInput = getSearchInput(elements.select);
   if (searchInput) {
      showSearchInput(searchInput, elements.label);
      setupSearchListeners(searchInput, elements.menu);
      searchInput.focus();
   }
}


/**
 * Clears the search and reset.
 *
 * @param {object} elements - The elements object.
 * @returns {void} Nothing.
 */
function clearSearchAndReset(elements) {
   const searchInput = getSearchInput(elements.select);
   if (!searchInput) return;
   hideSearchInput(searchInput, elements.label);
   searchInput.value = "";
}


/**
 * Resets the assigned placeholder if empty.
 *
 * @param {object} elements - The elements object.
 * @returns {void} Nothing.
 */
function resetAssignedPlaceholderIfEmpty(elements) {
   const selectedOptions = getSelectedOptions(elements.menu);
   if (selectedOptions.length === 0) {
      elements.label.textContent = ASSIGNED_PLACEHOLDER_TEXT;
      elements.input.value = "";
   }
}


/**
 * Closes the assigned menu.
 *
 * @param {object} elements - The elements object.
 * @returns {void} Nothing.
 */
function closeAssignedMenu(elements) {
   elements.select.classList.remove(ASSIGNED_OPEN_CLASS);
   elements.select.setAttribute("aria-expanded", "false");
   if (elements.group) elements.group.classList.remove("add-task__selection-group--assigned-open");
   clearSearchAndReset(elements);
   resetAssignedPlaceholderIfEmpty(elements);
   updateContactInitials(elements);
}


/**
 * Shows the search input.
 *
 * @param {HTMLInputElement|null} searchInput - The search input.
 * @param {HTMLElement|null} label - The label.
 * @returns {void} Nothing.
 */
function showSearchInput(searchInput, label) {
   searchInput.style.display = "block";
   searchInput.value = "To: ";
   label.style.display = "none";
   setTimeout(() => {
      searchInput.setSelectionRange(4, 4);
      searchInput.focus();
   }, 0);
}


/**
 * Hides the search input.
 *
 * @param {HTMLInputElement|null} searchInput - The search input.
 * @param {HTMLElement|null} label - The label.
 * @returns {void} Nothing.
 */
function hideSearchInput(searchInput, label) {
   searchInput.style.display = "none";
   searchInput.value = "";
   label.style.display = "block";
}


/**
 * Filters the contact options.
 *
 * @param {HTMLInputElement|null} searchInput - The search input.
 * @param {HTMLElement|null} menu - The menu.
 * @returns {void} Nothing.
 */
function filterContactOptions(searchInput, menu) {
   const searchText = getSearchText(searchInput);
   const options = menu.querySelectorAll(".add-task__select-option--assigned");
   options.forEach((option) => {
      const optionText = option.textContent.toLowerCase();
      const matches = searchText === "" || optionText.includes(searchText);
      option.style.display = matches ? "flex" : "none";
   });
}


/**
 * Shows the all contacts.
 *
 * @param {HTMLElement|null} menu - The menu.
 * @returns {void} Nothing.
 */
function showAllContacts(menu) {
   const options = menu.querySelectorAll(".add-task__select-option--assigned");
   options.forEach((option) => {
      option.style.display = "flex";
   });
}


/**
 * Toggles the assigned menu.
 *
 * @param {object} elements - The elements object.
 * @returns {void} Nothing.
 */
function toggleAssignedMenu(elements) {
   if (isAssignedMenuOpen(elements)) {
      closeAssignedMenu(elements);
   } else {
      openAssignedMenu(elements);
   }
   updateContactInitials(elements);
}


/**
 * Checks the checkbox.
 *
 * @param {HTMLElement|null} checkbox - The checkbox.
 * @returns {void} Nothing.
 */
function checkCheckbox(checkbox) {
   checkbox.src = assignedAssetPath("icons/desktop/checkBox--checked.svg");
}


/**
 * Unchecks the checkbox.
 *
 * @param {HTMLElement|null} checkbox - The checkbox.
 * @returns {void} Nothing.
 */
function uncheckCheckbox(checkbox) {
   checkbox.src = assignedAssetPath("icons/desktop/checkBox.svg");
}


/**
 * Toggles the contact selection.
 *
 * @param {*} option - The option.
 * @returns {void} Nothing.
 */
function toggleContactSelection(option) {
   const isSelected = option.classList.toggle(ASSIGNED_SELECTED_CLASS);
   const checkbox = option.querySelector(".add-task__option-checkbox");
   if (!checkbox) return;
   if (isSelected) checkCheckbox(checkbox); else uncheckCheckbox(checkbox);
}


/**
 * Handles the assigned option click.
 *
 * @param {Event} event - The event object that triggered the handler.
 * @param {object} elements - The elements object.
 * @returns {void} Nothing.
 */
function handleAssignedOptionClick(event, elements) {
   event.stopPropagation();
   const option = event.target.closest(".add-task__select-option");
   if (!option) return;
   toggleContactSelection(option);
   updateContactInitials(elements);
}


/**
 * Removes the contact selection.
 *
 * @param {*} option - The option.
 * @returns {void} Nothing.
 */
function removeContactSelection(option) {
   option.classList.remove(ASSIGNED_SELECTED_CLASS);
   const checkbox = option.querySelector(".add-task__option-checkbox");
   if (checkbox) {
      uncheckCheckbox(checkbox);
   }
}

