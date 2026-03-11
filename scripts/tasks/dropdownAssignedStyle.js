function renderAssignedContacts(menu, contacts) {
   menu.innerHTML = "";
   contacts.forEach((contact) => {
      menu.appendChild(createAssignedOptionElement(contact));
   });
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


function clearSearchAndReset(elements) {
   const searchInput = getSearchInput(elements.select);
   if (!searchInput) return;
   hideSearchInput(searchInput, elements.label);
   searchInput.value = "";
}


function resetAssignedPlaceholderIfEmpty(elements) {
   const selectedOptions = getSelectedOptions(elements.menu);
   if (selectedOptions.length === 0) {
      elements.label.textContent = ASSIGNED_PLACEHOLDER_TEXT;
      elements.input.value = "";
   }
}


function closeAssignedMenu(elements) {
   elements.select.classList.remove(ASSIGNED_OPEN_CLASS);
   elements.select.setAttribute("aria-expanded", "false");
   if (elements.group) elements.group.classList.remove("add-task__selection-group--assigned-open");
   clearSearchAndReset(elements);
   resetAssignedPlaceholderIfEmpty(elements);
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


function filterContactOptions(searchInput, menu) {
   const searchText = getSearchText(searchInput);
   const options = menu.querySelectorAll(".add-task__select-option--assigned");
   options.forEach((option) => {
      const optionText = option.textContent.toLowerCase();
      const matches = searchText === "" || optionText.includes(searchText);
      option.style.display = matches ? "flex" : "none";
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
   checkbox.src = assignedAssetPath("icons/desktop/checkBox--checked.svg");
}


function uncheckCheckbox(checkbox) {
   checkbox.src = assignedAssetPath("icons/desktop/checkBox.svg");
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
      const initialElement = createInitialElementFromOption(option, elements);
      if (!initialElement) return;
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
