// ===== ASSIGNED SELECT =====

// ASSIGNED SELECT: Konstanten + konsolidierter DOM-Getter
const ASSIGNED_SELECTED_CLASS = "add-task__select-option--selected";
const ASSIGNED_OPEN_CLASS = "add-task__select--open";
const ASSIGNED_PLACEHOLDER_TEXT = "Select contacts to assign";

function getAssignedElements() {
   const select = document.getElementById("addTaskAssigned");
   if (!select) return null;
   const menu = document.getElementById("addTaskAssignedMenu");
   const input = document.getElementById("addTaskAssignedInput");
   const label = select.querySelector(".add-task__select-value");
   const initials = document.getElementById("addTaskAssignedInitials");
   const selectionGroup = select.closest(".add-task__information-group--selection");
   if (!menu || !input || !label) return null;
   return {
      select,
      menu,
      input,
      label,
      initials,
      group: selectionGroup
   };
}

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

function closeAssignedMenu(elements) {
   elements.select.classList.remove(ASSIGNED_OPEN_CLASS);
   elements.select.setAttribute("aria-expanded", "false");
   if (elements.group) {
      elements.group.classList.remove("add-task__selection-group--assigned-open");
   }
   // Suche verstecken und leeren
   const searchInput = getSearchInput(elements.select);
   if (searchInput) {
      hideSearchInput(searchInput, elements.label);
      searchInput.value = "";
   }
   // Wenn keine Kontakte ausgewählt, Placeholder Text anzeigen
   const selectedOptions = getSelectedOptions(elements.menu);
   if (selectedOptions.length === 0) {
      elements.label.textContent = ASSIGNED_PLACEHOLDER_TEXT;
      elements.input.value = "";
   }
}

function isAssignedMenuOpen(elements) {
   return elements.select.classList.contains(ASSIGNED_OPEN_CLASS);
}

function getSearchInput(select) {
   return select.querySelector(".add-task__select-input");
}

function showSearchInput(searchInput, label) {
   searchInput.style.display = "block";
   searchInput.value = "To: ";
   label.style.display = "none";
   setTimeout(() => {
      searchInput.setSelectionRange(4, 4);
      searchInput.focus();
   }, 0);
}

function hideSearchInput(searchInput, label) {
   searchInput.style.display = "none";
   searchInput.value = "";
   label.style.display = "block";
}

function preventSearchDeletion(event, searchInput) {
   const cursorPosition = searchInput.selectionStart;
   if (event.key === "Backspace" && cursorPosition <= 4) {
      event.preventDefault();
   }
   if (event.key === "Delete" && cursorPosition < 4) {
      event.preventDefault();
   }
}

function ensureSearchPrefix(searchInput) {
   if (!searchInput.value.startsWith("To: ")) {
      const searchText = searchInput.value.replace(/^To: /, "");
      searchInput.value = "To: " + searchText;
      const cursorPos = 4 + searchText.length;
      searchInput.setSelectionRange(cursorPos, cursorPos);
   }
}

function getSearchText(searchInput) {
   return searchInput.value.substring(4).toLowerCase().trim();
}

function filterContactOptions(searchInput, menu) {
   const searchText = getSearchText(searchInput);
   const options = menu.querySelectorAll(".add-task__select-option--assigned");
   options.forEach((option) => {
      const optionText = option.textContent.toLowerCase();
      const matches = searchText === "" || optionText.includes(searchText);
      option.style.display = matches ? "flex" : "none";
   });
}

function handleSearchKeydown(event, searchInput) {
   preventSearchDeletion(event, searchInput);
}

function handleSearchInput(event, searchInput, menu) {
   ensureSearchPrefix(searchInput);
   filterContactOptions(searchInput, menu);
}

function setupSearchListeners(searchInput, menu) {
   searchInput.addEventListener("keydown", (e) => {
      handleSearchKeydown(e, searchInput);
   });
   searchInput.addEventListener("input", (e) => {
      handleSearchInput(e, searchInput, menu);
   });
}

function resetAssignedPlaceholder(elements) {
   const searchInput = getSearchInput(elements.select);
   if (!searchInput) return;
   showSearchInput(searchInput, elements.label);
   setupSearchListeners(searchInput, elements.menu);
   const placeholder = elements.label.dataset.placeholder || elements.label.textContent;
   elements.label.textContent = placeholder;
   elements.label.dataset.placeholder = placeholder;
   elements.input.value = "";
   elements.input.dispatchEvent(new Event("input", { bubbles: true }));
}

function showAllContacts(menu) {
   const options = menu.querySelectorAll(".add-task__select-option--assigned");
   options.forEach((option) => {
      option.style.display = "flex";
   });
}

function restoreAssignedSelection(elements) {
   const searchInput = getSearchInput(elements.select);
   if (searchInput) {
      hideSearchInput(searchInput, elements.label);
   }
   showAllContacts(elements.menu);
   const defaultText = ASSIGNED_PLACEHOLDER_TEXT;
   elements.label.textContent = defaultText;
   elements.input.value = "";
   elements.label.style.display = "block";
   elements.input.dispatchEvent(new Event("input", { bubbles: true }));
}

function toggleAssignedMenu(elements) {
   if (isAssignedMenuOpen(elements)) {
      closeAssignedMenu(elements);
   } else {
      openAssignedMenu(elements);
   }
   updateContactInitials(elements);
}

function checkCheckbox(checkbox) {
   checkbox.src = "./assets/icons/desktop/checkBox--checked.svg";
}

function uncheckCheckbox(checkbox) {
   checkbox.src = "./assets/icons/desktop/checkBox.svg";
}

function toggleContactSelection(option) {
   const isSelected = option.classList.toggle(ASSIGNED_SELECTED_CLASS);
   const checkbox = option.querySelector(".add-task__option-checkbox");
   if (!checkbox) return;
   if (isSelected) checkCheckbox(checkbox); else uncheckCheckbox(checkbox);
}

function handleAssignedOptionClick(event, elements) {
   event.stopPropagation();
   const option = event.target.closest(".add-task__select-option");
   if (!option) return;
   toggleContactSelection(option);
   updateContactInitials(elements);
}

function getContainerWidth(container) {
   return container.offsetWidth;
}

function calculateMaxInitials(containerWidth) {
   const initialWidth = 50; // 42px + 8px gap
   const totalSlots = Math.floor(containerWidth / initialWidth);
   return totalSlots;
}

function shouldShowOverflow(selectedCount, maxSlots) {
   return selectedCount > maxSlots;
}

function getMaxDisplayCount(selectedCount, maxSlots) {
   if (shouldShowOverflow(selectedCount, maxSlots)) {
      return maxSlots - 1;
   }
   return maxSlots;
}

function getSelectedOptions(menu) {
   return menu.querySelectorAll(`.${ASSIGNED_SELECTED_CLASS}`);
}

function removeContactSelection(option) {
   option.classList.remove(ASSIGNED_SELECTED_CLASS);
   const checkbox = option.querySelector(".add-task__option-checkbox");
   if (checkbox) {
      uncheckCheckbox(checkbox);
   }
}

function clearInitialsContainer(container) {
   container.innerHTML = "";
}

function addInitialsToContainer(selectedOptions, container, maxDisplay, elements) {
   let displayCount = 0;
   selectedOptions.forEach((option) => {
      if (displayCount >= maxDisplay) return;
      const initialsText = option.querySelector(".add-task__option-initials")?.textContent;
      if (!initialsText) return;
      const html = createInitialHTML(initialsText);
      const temp = document.createElement("div");
      temp.innerHTML = html;
      const initialElement = temp.firstElementChild;
      if (!initialElement) return;
      initialElement.addEventListener("click", () => {
         removeContactSelection(option);
         updateContactInitials(elements);
      });
      container.appendChild(initialElement);
      displayCount++;
   });
   return displayCount;
}

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

function getSelectWrapper(select) {
   return select?.closest(".add-task__select-wrapper");
}

function getFooter() {
   return document.querySelector(".add-task__footer");
}

function hasSelectedContacts(selectedOptions) {
   return selectedOptions.length > 0;
}

function updateWrapperPadding(wrapper, hasContacts, menuOpen) {
   if (!wrapper) return;
   if (hasContacts && !menuOpen) {
      wrapper.style.paddingBottom = "52px";
   } else {
      wrapper.style.paddingBottom = "0px";
   }
}

function updateFooterPosition(footer, hasContacts, menuOpen) {
   if (!footer) return;
   if (hasContacts && !menuOpen) {
      footer.style.transform = "translateY(-34px)";
   } else {
      footer.style.transform = "translateY(0)";
   }
}

function getInitialsParameters(elements) {
   if (!elements.initials) return null;
   const selectedOptions = getSelectedOptions(elements.menu);
   const menuOpen = isAssignedMenuOpen(elements);
   clearInitialsContainer(elements.initials);
   const containerWidth = getContainerWidth(elements.initials);
   const maxSlots = calculateMaxInitials(containerWidth);
   const maxDisplay = getMaxDisplayCount(selectedOptions.length, maxSlots);
   return { selectedOptions, menuOpen, maxDisplay };
}

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

function updateContactInitials(elements) {
   const params = getInitialsParameters(elements);
   if (!params) return;
   renderInitials(elements, params.selectedOptions, params.maxDisplay);
   const wrapper = getSelectWrapper(elements.select);
   const footer = getFooter();
   const hasContacts = hasSelectedContacts(params.selectedOptions);
   updateWrapperPadding(wrapper, hasContacts, params.menuOpen);
   updateFooterPosition(footer, hasContacts, params.menuOpen);
}

function setupAssignedListeners(elements) {
   if (!elements) return;
   // click on select (open/close)
   elements.select.addEventListener("click", (event) => {
      event.stopPropagation();
      const clickedInput = event.target.closest(".add-task__select-input");
      if (!clickedInput) toggleAssignedMenu(elements);
   });
   // option clicks
   elements.menu.addEventListener("click", (event) => {
      handleAssignedOptionClick(event, elements);
   });
   // search input interactions
   const searchInput = getSearchInput(elements.select);
   if (searchInput) {
      searchInput.addEventListener("click", (e) => e.stopPropagation());
      searchInput.addEventListener("mousedown", (e) => e.stopPropagation());
      searchInput.addEventListener("focus", () => {
         if (!isAssignedMenuOpen(elements)) toggleAssignedMenu(elements);
      });
   }
   // document click closes the menu
   document.addEventListener("click", (event) => {
      const clickedInput = event.target.closest(".add-task__select-input");
      if (clickedInput) return;
      closeAssignedMenu(elements);
   });
}

function initAssignedSelect() {
   const elements = getAssignedElements();
   if (!elements) return;
   elements.select.setAttribute("aria-expanded", "false");
   elements.label.dataset.placeholder = elements.label.textContent;
   if (elements.input.value) {
      elements.input.dataset.lastValue = elements.input.value;
      elements.label.dataset.lastLabel = elements.label.textContent;
   }
   setupAssignedListeners(elements);
}
