document.addEventListener("DOMContentLoaded", initAllFeatures);

function initAllFeatures() {
   initDatePicker();
   initFormValidation();
   initPriorityField();
   initCategorySelect();
   initAssignedSelect();
   initTextareaResize();
   initClearButtons();
   initSubtaskControls();
}

// ===== TASK SPEICHERN =====

function getTaskStatus() {
   const dialog = document.getElementById("addTaskDialog");
   return dialog?.dataset.taskStatus || "todo";
}

function getTaskTitle() {
   const titleInput = document.querySelector("#addTaskTitle");
   return titleInput?.value || "";
}

function getTaskDescription() {
   const descriptionInput = document.querySelector("#addTaskDescription");
   return descriptionInput?.value || "";
}

function getTaskDate() {
   const dateInput = document.querySelector("#addTaskDate");
   return dateInput?.value || "";
}

function getTaskPriority() {
   const checkedPriority = document.querySelector('input[name="priority"]:checked');
   return checkedPriority?.value || "medium";
}

function getTaskCategory() {
   const categoryInput = document.getElementById("addTaskCategoryInput");
   return categoryInput?.value?.trim() || "";
}

function getSelectedContacts() {
   const selectedOptions = document.querySelectorAll(".add-task__select-option--selected");
   const contacts = [];
   
   selectedOptions.forEach((option) => {
      const initialsElement = option.querySelector(".add-task__option-initials");
      const contactName = option.textContent.trim();
      const contactValue = option.dataset.value || "";
      const contactInitials = initialsElement?.textContent || "";
      
      contacts.push({
         name: contactName,
         initials: contactInitials,
         value: contactValue
      });
   });
   
   return contacts;
}

function getSubtasksList() {
   const subtaskItems = document.querySelectorAll(".add-task__subtask-item");
   const subtasks = [];
   
   subtaskItems.forEach((item) => {
      const textElement = item.querySelector(".add-task__subtask-text");
      const subtaskText = textElement?.textContent || "";
      
      if (subtaskText) {
         subtasks.push({
            text: subtaskText,
            completed: false
         });
      }
   });
   
   return subtasks;
}

function createTaskData() {
   return {
      id: Date.now(),
      title: getTaskTitle(),
      description: getTaskDescription(),
      date: getTaskDate(),
      priority: getTaskPriority(),
      category: getTaskCategory(),
      assigned: getSelectedContacts(),
      subtasks: getSubtasksList(),
      status: getTaskStatus()
   };
}

function loadTasksFromStorage() {
   const tasksJson = sessionStorage.getItem("tasks") || "[]";
   return JSON.parse(tasksJson);
}

function saveTasksToStorage(tasks) {
   const tasksJson = JSON.stringify(tasks);
   sessionStorage.setItem("tasks", tasksJson);
}

function addTaskToStorage(taskData) {
   const allTasks = loadTasksFromStorage();
   allTasks.push(taskData);
   saveTasksToStorage(allTasks);
}

function isInDialog() {
   const dialog = document.getElementById("addTaskDialog");
   return dialog && dialog.open;
}

function createSuccessMessage() {
   const messageDiv = document.createElement("div");
   messageDiv.className = "task-success-message";
   const messageText = document.createElement("span");
   messageText.className = "task-success-message__text";
   messageText.textContent = "Task added to board";

   const messageIcon = document.createElement("img");
   messageIcon.className = "task-success-message__icon";
   messageIcon.src = "./assets/icons/desktop/board.svg";
   messageIcon.alt = "Board";

   messageDiv.append(messageText, messageIcon);
   
   return messageDiv;
}

function showSuccessMessage() {
   const message = createSuccessMessage();
   document.body.appendChild(message);
   requestAnimationFrame(() => {
      message.classList.add("task-success-message--visible");
   });
   
   setTimeout(() => {
      message.remove();
   }, 1000);
}

function redirectAfterSave() {
   if (isInDialog()) {
      window.location.reload();
   } else {
      window.location.href = "./board.html";
   }
}

function saveTaskToBoard() {
   const taskData = createTaskData();
   
   addTaskToStorage(taskData);
   if (isInDialog()) {
      sessionStorage.setItem("showTaskSuccess", "true");
      redirectAfterSave();
      return;
   }

   showSuccessMessage();
   
   setTimeout(() => {
      redirectAfterSave();
   }, 1000);
}

// ===== FORMULAR-VALIDIERUNG =====

function findRequiredFields() {
   return document.querySelectorAll(".add-task__input-field--required");
}

function getFieldInput(field) {
   return field.querySelector("input, textarea, select");
}

function isFieldEmpty(field) {
   const input = getFieldInput(field);
   if (!input) return true;
   
   const inputValue = input.value.trim();
   return inputValue === "";
}

function isFieldFilled(field) {
   return !isFieldEmpty(field);
}

function enableButton(button) {
   button.classList.remove("is-disabled");
   button.setAttribute("aria-disabled", "false");
}

function disableButton(button) {
   button.classList.add("is-disabled");
   button.setAttribute("aria-disabled", "true");
}

function updateButtonState(button, isValid) {
   if (isValid) {
      enableButton(button);
   } else {
      disableButton(button);
   }
}

function showFieldError(field) {
   field.classList.add("add-task__input-field--error");
}

function hideFieldError(field) {
   field.classList.remove("add-task__input-field--error");
}

function showErrorsOnEmptyFields(fields) {
   fields.forEach((field) => {
      if (isFieldEmpty(field)) {
         showFieldError(field);
      }
   });
}

function checkAllFieldsFilled(fields) {
   return Array.from(fields).every(isFieldFilled);
}

function handleFieldInput(field, allFields, button) {
   hideFieldError(field);
   
   const allValid = checkAllFieldsFilled(allFields);
   updateButtonState(button, allValid);
}

function addInputListener(field, allFields, button) {
   const input = getFieldInput(field);
   if (!input) return;
   
   input.addEventListener("input", () => {
      handleFieldInput(field, allFields, button);
   });
}

function setupLiveValidation(fields, button) {
   fields.forEach((field) => {
      addInputListener(field, fields, button);
   });
}

function handleCreateButtonClick(event, fields) {
   const allFilled = checkAllFieldsFilled(fields);
   
   if (!allFilled) {
      event.preventDefault();
      showErrorsOnEmptyFields(fields);
      return;
   }
   
   event.preventDefault();
   saveTaskToBoard();
}

function setupCreateButton(button) {
   const form = button.closest("form") || document;
   const requiredFields = form.querySelectorAll(".add-task__input-field--required");
   
   if (requiredFields.length === 0) return;
   
   const allValid = checkAllFieldsFilled(requiredFields);
   updateButtonState(button, allValid);
   setupLiveValidation(requiredFields, button);
   
   button.addEventListener("click", (event) => {
      handleCreateButtonClick(event, requiredFields);
   });
}

function initFormValidation() {
   const createButtons = document.querySelectorAll(".add-task__button--create");
   createButtons.forEach(setupCreateButton);
}

// ===== TEXTAREA RESIZE =====

function initTextareaResize() {
   const wrappers = document.querySelectorAll(".add-task__input-field--textarea");
   wrappers.forEach(setupTextareaResize);
}

function setupTextareaResize(wrapper) {
   const textarea = wrapper.querySelector("textarea");
   const handle = wrapper.querySelector(".add-task__textarea-resize");
   if (!textarea || !handle) return;
   handle.style.pointerEvents = "auto";
   handle.addEventListener("mousedown", (event) => {
      startTextareaResize(event, textarea);
   });
}

function startTextareaResize(event, textarea) {
   event.preventDefault();
   const { minHeight, maxHeight } = getTextareaHeight(textarea);
   const startY = event.clientY;
   const startHeight = textarea.offsetHeight;
   const moveHandler = (e) => {
      handleMouseMove(e, startY, startHeight, textarea, minHeight, maxHeight);
   };
   const upHandler = () => {
      removeResizeListeners(moveHandler, upHandler);
   };
   document.addEventListener("mousemove", moveHandler);
   document.addEventListener("mouseup", upHandler);
}

function getTextareaHeight(textarea) {
   const styles = getComputedStyle(textarea);
   const minHeight = getPixelValue(styles.minHeight) || 48;
   const maxHeight = getPixelValue(styles.maxHeight) || 1000;
   return { minHeight, maxHeight };
}

function getPixelValue(cssValue) {
   return Number.parseFloat(cssValue) || 0;
}

function handleMouseMove(event, startY, startHeight, textarea, minHeight, maxHeight) {
   const deltaY = event.clientY - startY;
   const newHeight = startHeight + deltaY;
   updateTextareaHeight(textarea, newHeight, minHeight, maxHeight);
}

function updateTextareaHeight(textarea, newHeight, minHeight, maxHeight) {
   const clampedHeight = clampValue(newHeight, minHeight, maxHeight);
   textarea.style.height = `${clampedHeight}px`;
}

function clampValue(value, min, max) {
   if (value < min) return min;
   if (value > max) return max;
   return value;
}

function removeResizeListeners(moveHandler, upHandler) {
   document.removeEventListener("mousemove", moveHandler);
   document.removeEventListener("mouseup", upHandler);
}

// ===== PRIORITY FIELD =====

function initPriorityField() {
   const priorityField = document.getElementById("addTaskPriority");
   if (!priorityField) return;
   priorityField.addEventListener("click", handlePriorityClick);
}

function handlePriorityClick(clickEvent) {
   const clickedButton = clickEvent.target.closest(".add-task__priority-option");
   if (!clickedButton) return;
   const field = clickedButton.closest(".add-task__priority-field");
   const priorityButtons = field.querySelectorAll(".add-task__priority-option");
   removeActiveFromAll(priorityButtons);
   setButtonActive(clickedButton);
}

function removeActiveFromAll(priorityButtons) {
   priorityButtons.forEach(button => {
      button.classList.remove("add-task__priority-option--active");
   });
}

function setButtonActive(button) {
   button.classList.add("add-task__priority-option--active");
}

// ===== CATEGORY SELECT =====

function getCategorySelect() {
   return document.getElementById("addTaskCategory");
}

function getCategoryMenu() {
   return document.getElementById("addTaskCategoryMenu");
}

function getCategoryInput() {
   return document.getElementById("addTaskCategoryInput");
}

function getCategoryLabelElement() {
   return document.querySelector("#addTaskCategory .add-task__select-value");
}

function getCategoryElements() {
   const select = getCategorySelect();
   const selectionGroup = select?.closest(".add-task__selection-group");
   
   return {
      select: select,
      menu: getCategoryMenu(),
      input: getCategoryInput(),
      label: getCategoryLabelElement(),
      group: selectionGroup
   };
}

function areCategoryElementsReady(elements) {
   return elements.select && elements.menu && elements.input && elements.label;
}

function openCategoryMenu(elements) {
   elements.select.classList.add("add-task__select--open");
   elements.select.setAttribute("aria-expanded", "true");
   
   if (elements.group) {
      elements.group.classList.add("add-task__selection-group--category-open");
   }
}

function closeCategoryMenu(elements) {
   elements.select.classList.remove("add-task__select--open");
   elements.select.setAttribute("aria-expanded", "false");
   
   if (elements.group) {
      elements.group.classList.remove("add-task__selection-group--category-open");
   }
}

function isCategoryMenuOpen(elements) {
   return elements.select.classList.contains("add-task__select--open");
}

function toggleCategoryMenu(elements) {
   if (isCategoryMenuOpen(elements)) {
      closeCategoryMenu(elements);
      restoreCategorySelection(elements);
   } else {
      openCategoryMenu(elements);
      resetCategoryPlaceholder(elements);
   }
}

function getCategoryPlaceholder(label) {
   return label.dataset.placeholder || label.textContent;
}

function resetCategoryPlaceholder(elements) {
   const placeholder = getCategoryPlaceholder(elements.label);
   
   elements.label.textContent = placeholder;
   elements.label.dataset.placeholder = placeholder;
   elements.input.value = "";
   elements.input.dispatchEvent(new Event("input", { bubbles: true }));
}

function getLastCategoryValue(input) {
   return input.dataset.lastValue;
}

function getLastCategoryLabel(label) {
   return label.dataset.lastLabel;
}

function restoreCategorySelection(elements) {
   const lastValue = getLastCategoryValue(elements.input);
   const lastLabel = getLastCategoryLabel(elements.label);
   
   if (!lastValue || !lastLabel) return;
   
   elements.label.textContent = lastLabel;
   elements.input.value = lastValue;
   elements.input.dispatchEvent(new Event("input", { bubbles: true }));
}

function saveCategorySelection(option, elements) {
   const optionValue = option.dataset.value;
   const optionText = option.textContent.trim();
   
   elements.input.value = optionValue;
   elements.label.textContent = optionText;
   elements.input.dataset.lastValue = optionValue;
   elements.label.dataset.lastLabel = optionText;
   elements.input.dispatchEvent(new Event("input", { bubbles: true }));
}

function selectCategoryOption(option, elements) {
   saveCategorySelection(option, elements);
   closeCategoryMenu(elements);
}

function handleCategorySelectClick(event, elements) {
   event.stopPropagation();
   toggleCategoryMenu(elements);
}

function handleCategoryOptionClick(event, elements) {
   event.stopPropagation();
   
   const option = event.target.closest(".add-task__select-option");
   if (!option) return;
   
   selectCategoryOption(option, elements);
}

function setupCategoryClickListeners(elements) {
   elements.select.addEventListener("click", (event) => {
      handleCategorySelectClick(event, elements);
   });
   
   elements.menu.addEventListener("click", (event) => {
      handleCategoryOptionClick(event, elements);
   });
   
   document.addEventListener("click", () => {
      closeCategoryMenu(elements);
   });
}

function initCategorySelect() {
   const elements = getCategoryElements();
   if (!areCategoryElementsReady(elements)) return;
   
   elements.select.setAttribute("aria-expanded", "false");
   elements.label.dataset.placeholder = elements.label.textContent;
   
   if (elements.input.value) {
      elements.input.dataset.lastValue = elements.input.value;
      elements.label.dataset.lastLabel = elements.label.textContent;
   }
   
   setupCategoryClickListeners(elements);
}

// ===== ASSIGNED SELECT =====

function getAssignedSelect() {
   return document.getElementById("addTaskAssigned");
}

function getAssignedMenu() {
   return document.getElementById("addTaskAssignedMenu");
}

function getAssignedInput() {
   return document.getElementById("addTaskAssignedInput");
}

function getAssignedLabel() {
   return document.querySelector("#addTaskAssigned .add-task__select-value");
}

function getInitialsContainer() {
   return document.getElementById("addTaskAssignedInitials");
}

function getAssignedElements() {
   const select = getAssignedSelect();
   const selectionGroup = select?.closest(".add-task__information-group--selection");
   
   return {
      select: select,
      menu: getAssignedMenu(),
      input: getAssignedInput(),
      label: getAssignedLabel(),
      initials: getInitialsContainer(),
      group: selectionGroup
   };
}

function areAssignedElementsReady(elements) {
   return elements.select && elements.menu && elements.input && elements.label;
}

function openAssignedMenu(elements) {
   elements.select.classList.add("add-task__select--open");
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
   elements.select.classList.remove("add-task__select--open");
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
      elements.label.textContent = "Select contacts to assign";
      elements.input.value = "";
   }
}

function isAssignedMenuOpen(elements) {
   return elements.select.classList.contains("add-task__select--open");
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
   
   const defaultText = "Select contacts to assign";
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

function isCheckboxChecked(checkbox) {
   return checkbox.src.includes("checked");
}

function checkCheckbox(checkbox) {
   checkbox.src = "./assets/icons/desktop/checkBox--checked.svg";
}

function uncheckCheckbox(checkbox) {
   checkbox.src = "./assets/icons/desktop/checkBox.svg";
}

function toggleContactSelection(option) {
   const isSelected = option.classList.toggle("add-task__select-option--selected");
   const checkbox = option.querySelector(".add-task__option-checkbox");
   
   if (checkbox) {
      if (isSelected) {
         checkCheckbox(checkbox);
      } else {
         uncheckCheckbox(checkbox);
      }
   }
}

function handleAssignedSelectClick(event, elements) {
   event.stopPropagation();
   
   const clickedInput = event.target.closest(".add-task__select-input");
   if (clickedInput) return;
   
   toggleAssignedMenu(elements);
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
   return menu.querySelectorAll(".add-task__select-option--selected");
}

function createInitialElement(option, elements) {
   const initialsText = option.querySelector(".add-task__option-initials")?.textContent;
   if (!initialsText) return null;
   
   const initialSpan = document.createElement("span");
   initialSpan.className = "add-task__assigned-initial";
   initialSpan.textContent = initialsText;
   
   initialSpan.addEventListener("click", () => {
      removeContactSelection(option);
      updateContactInitials(elements);
   });
   
   return initialSpan;
}

function removeContactSelection(option) {
   option.classList.remove("add-task__select-option--selected");
   
   const checkbox = option.querySelector(".add-task__option-checkbox");
   if (checkbox) {
      uncheckCheckbox(checkbox);
   }
}

function createOverflowElement(remainingCount) {
   const overflowSpan = document.createElement("span");
   overflowSpan.className = "add-task__assigned-overflow";
   overflowSpan.textContent = `+${remainingCount}`;
   return overflowSpan;
}

function clearInitialsContainer(container) {
   container.innerHTML = "";
}

function addInitialsToContainer(selectedOptions, container, maxDisplay, elements) {
   let displayCount = 0;
   
   selectedOptions.forEach((option) => {
      if (displayCount < maxDisplay) {
         const initialElement = createInitialElement(option, elements);
         if (initialElement) {
            container.appendChild(initialElement);
            displayCount++;
         }
      }
   });
   
   return displayCount;
}

function addOverflowIndicator(container, totalCount, displayedCount) {
   const remainingCount = totalCount - displayedCount;
   
   if (remainingCount > 0) {
      const overflowElement = createOverflowElement(remainingCount);
      container.appendChild(overflowElement);
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

function updateContactInitials(elements) {
   if (!elements.initials) return;
   
   const selectedOptions = getSelectedOptions(elements.menu);
   const menuOpen = isAssignedMenuOpen(elements);
   
   clearInitialsContainer(elements.initials);
   
   const containerWidth = getContainerWidth(elements.initials);
   const maxSlots = calculateMaxInitials(containerWidth);
   const maxDisplay = getMaxDisplayCount(selectedOptions.length, maxSlots);
   
   const displayedCount = addInitialsToContainer(
      selectedOptions,
      elements.initials,
      maxDisplay,
      elements
   );
   
   addOverflowIndicator(elements.initials, selectedOptions.length, displayedCount);
   
   const wrapper = getSelectWrapper(elements.select);
   const footer = getFooter();
   const hasContacts = hasSelectedContacts(selectedOptions);
   
   updateWrapperPadding(wrapper, hasContacts, menuOpen);
   updateFooterPosition(footer, hasContacts, menuOpen);
}

function setupAssignedClickListeners(elements) {
   elements.select.addEventListener("click", (event) => {
      handleAssignedSelectClick(event, elements);
   });
   
   elements.menu.addEventListener("click", (event) => {
      handleAssignedOptionClick(event, elements);
   });
}

function setupSearchClickListeners(elements) {
   const searchInput = getSearchInput(elements.select);
   if (!searchInput) return;
   
   searchInput.addEventListener("click", (e) => e.stopPropagation());
   searchInput.addEventListener("mousedown", (e) => e.stopPropagation());
   
   searchInput.addEventListener("focus", () => {
      if (!isAssignedMenuOpen(elements)) {
         toggleAssignedMenu(elements);
      }
   });
}

function setupDocumentClickListener(elements) {
   document.addEventListener("click", (event) => {
      const clickedInput = event.target.closest(".add-task__select-input");
      if (clickedInput) return;
      
      closeAssignedMenu(elements);
   });
}

function setupAssignedListeners(elements) {
   setupAssignedClickListeners(elements);
   setupSearchClickListeners(elements);
   setupDocumentClickListener(elements);
}

function initAssignedSelect() {
   const elements = getAssignedElements();
   if (!areAssignedElementsReady(elements)) return;
   
   elements.select.setAttribute("aria-expanded", "false");
   elements.label.dataset.placeholder = elements.label.textContent;
   
   if (elements.input.value) {
      elements.input.dataset.lastValue = elements.input.value;
      elements.label.dataset.lastLabel = elements.label.textContent;
   }
   
   setupAssignedListeners(elements);
}

// ===== SUBTASKS =====

function createSubtaskHTML(subtaskText) {
   return `
      <span class="add-task__subtask-text">${subtaskText}</span>
      <div class="add-task__subtask-item-actions">
         <button type="button" class="add-task__subtask-item-button add-task__subtask-item-button--edit" data-action="edit">
            <img src="./assets/icons/desktop/subtask__pencil.svg" alt="" class="add-task__subtask-item-icon" />
         </button>
         <button type="button" class="add-task__subtask-item-button add-task__subtask-item-button--delete-edit" data-action="delete-edit" style="display: none;">
            <img src="./assets/icons/desktop/subtask__trash.svg" alt="" class="add-task__subtask-item-icon" />
         </button>
         <span class="add-task__subtask-dividingline"></span>
         <button type="button" class="add-task__subtask-item-button add-task__subtask-item-button--delete" data-action="delete">
            <img src="./assets/icons/desktop/subtask__trash.svg" alt="" class="add-task__subtask-item-icon" />
         </button>
         <button type="button" class="add-task__subtask-item-button add-task__subtask-item-button--check" data-action="check" style="display: none;">
            <img src="./assets/icons/desktop/check.svg" alt="" class="add-task__subtask-item-icon" />
         </button>
      </div>
   `;
}

function createSubtaskItem(subtaskText) {
   const item = document.createElement("li");
   item.className = "add-task__subtask-item";
   item.innerHTML = createSubtaskHTML(subtaskText);
   return item;
}

function deleteSubtaskItem(item) {
   item.remove();
}

function setupSubtaskDeleteButton(item, button) {
   button.addEventListener("click", () => {
      deleteSubtaskItem(item);
   });
}

function setupSubtaskEditButton(item, button, textElement, checkButton) {
   button.addEventListener("click", () => {
      enableSubtaskEdit(item, textElement, checkButton);
   });
}

function setupSubtaskDoubleClick(item, textElement, checkButton) {
   textElement.addEventListener("dblclick", () => {
      enableSubtaskEdit(item, textElement, checkButton);
   });
}

function createEditInput(currentText) {
   const input = document.createElement("input");
   input.type = "text";
   input.className = "add-task__subtask-input";
   input.value = currentText;
   return input;
}

function replaceTextWithInput(textElement, inputElement) {
   textElement.replaceWith(inputElement);
   inputElement.focus();
   inputElement.select();
}

function createTextElement(text) {
   const span = document.createElement("span");
   span.className = "add-task__subtask-text";
   span.textContent = text;
   return span;
}

function replaceInputWithText(inputElement, textElement) {
   inputElement.replaceWith(textElement);
}

function reattachEditListeners(item, textElement, checkButton) {
   setupSubtaskDoubleClick(item, textElement, checkButton);
   
   const editButton = item.querySelector(".add-task__subtask-item-button[data-action='edit']");
   const newEditButton = editButton.cloneNode(true);
   editButton.replaceWith(newEditButton);
   
   setupSubtaskEditButton(item, newEditButton, textElement, checkButton);
}

function saveSubtaskEdit(item, inputElement, checkButton) {
   const newText = inputElement.value.trim();
   
   if (newText) {
      const newTextElement = createTextElement(newText);
      replaceInputWithText(inputElement, newTextElement);
      item.classList.remove("add-task__subtask-item--editing");
      reattachEditListeners(item, newTextElement, checkButton);
   } else {
      inputElement.focus();
   }
}

function cancelSubtaskEdit(item, inputElement, originalText, checkButton) {
   const newTextElement = createTextElement(originalText);
   replaceInputWithText(inputElement, newTextElement);
   item.classList.remove("add-task__subtask-item--editing");
   reattachEditListeners(item, newTextElement, checkButton);
}

function setupEditKeyboardEvents(item, inputElement, originalText, checkButton) {
   inputElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
         saveSubtaskEdit(item, inputElement, checkButton);
      } else if (e.key === "Escape") {
         cancelSubtaskEdit(item, inputElement, originalText, checkButton);
      }
   });
}

function setupEditBlurEvent(item, inputElement, checkButton) {
   inputElement.addEventListener("blur", () => {
      setTimeout(() => {
         if (item.classList.contains("add-task__subtask-item--editing")) {
            saveSubtaskEdit(item, inputElement, checkButton);
         }
      }, 100);
   });
}

function setupCheckButtonListener(checkButton, item, inputElement) {
   const checkHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      saveSubtaskEdit(item, inputElement, checkButton);
   };
   
   checkButton.addEventListener("click", checkHandler);
}

function enableSubtaskEdit(item, textElement, checkButton) {
   const originalText = textElement.textContent;
   item.classList.add("add-task__subtask-item--editing");
   
   const inputElement = createEditInput(originalText);
   replaceTextWithInput(textElement, inputElement);
   
   setupCheckButtonListener(checkButton, item, inputElement);
   setupEditBlurEvent(item, inputElement, checkButton);
   setupEditKeyboardEvents(item, inputElement, originalText, checkButton);
}

function setupSubtaskListeners(item) {
   const textElement = item.querySelector(".add-task__subtask-text");
   const deleteButton = item.querySelector(".add-task__subtask-item-button[data-action='delete']");
   const deleteEditButton = item.querySelector(".add-task__subtask-item-button[data-action='delete-edit']");
   const checkButton = item.querySelector(".add-task__subtask-item-button[data-action='check']");
   const editButton = item.querySelector(".add-task__subtask-item-button[data-action='edit']");
   
   setupSubtaskDeleteButton(item, deleteButton);
   setupSubtaskDeleteButton(item, deleteEditButton);
   setupSubtaskEditButton(item, editButton, textElement, checkButton);
   setupSubtaskDoubleClick(item, textElement, checkButton);
}

function addSubtaskToList(list, subtaskText) {
   const item = createSubtaskItem(subtaskText);
   setupSubtaskListeners(item);
   list.prepend(item);
}

function clearSubtaskInput(input) {
   input.value = "";
   input.focus();
}

function addSubtaskFromInput(input, list) {
   const inputValue = input.value.trim();
   if (!inputValue) return;
   
   addSubtaskToList(list, inputValue);
   clearSubtaskInput(input);
}

function setupSubtaskButtons(group) {
   const input = group.querySelector(".add-task__input--subtasks");
   const list = group.querySelector(".add-task__subtask-list");
   const clearButton = group.querySelector(".add-task__subtask-button[data-action='clear']");
   const addButton = group.querySelector(".add-task__subtask-button[data-action='add']");
   
   if (!input || !list || !clearButton || !addButton) return;
   
   clearButton.addEventListener("click", () => {
      clearSubtaskInput(input);
   });
   
   addButton.addEventListener("click", () => {
      addSubtaskFromInput(input, list);
   });
}

function initSubtaskControls() {
   const groups = document.querySelectorAll(".add-task__input-group--subtasks");
   groups.forEach(setupSubtaskButtons);
}

// ===== CLEAR BUTTON =====

function clearAllInputs(container) {
   const inputs = container.querySelectorAll("input, textarea, select");
   
   inputs.forEach((input) => {
      if (input.type === "checkbox" || input.type === "radio") {
         input.checked = false;
      } else {
         input.value = "";
      }
   });
}

function resetPriority(container) {
   const priorityField = container.querySelector(".add-task__priority-field");
   if (!priorityField) return;
   
   const allButtons = priorityField.querySelectorAll(".add-task__priority-option");
   removeActiveFromAll(allButtons);
   
   const mediumButton = priorityField.querySelector(".add-task__priority-option--medium");
   if (mediumButton) {
      setButtonActive(mediumButton);
   }
}

function resetCategory(container) {
   const select = container.querySelector(".add-task__select--category");
   if (!select) return;
   
   const label = select.querySelector(".add-task__select-value");
   const input = container.querySelector("#addTaskCategoryInput");
   if (!label || !input) return;
   
   const placeholder = label.dataset.placeholder || "Select task category";
   label.textContent = placeholder;
   label.dataset.placeholder = placeholder;
   label.dataset.lastLabel = "";
   input.value = "";
   input.dataset.lastValue = "";
   
   select.classList.remove("add-task__select--open");
   select.setAttribute("aria-expanded", "false");
   input.dispatchEvent(new Event("input", { bubbles: true }));
}

function clearSubtasks(container) {
   const lists = container.querySelectorAll(".add-task__subtask-list");
   lists.forEach((list) => {
      list.innerHTML = "";
   });
}

function resetAssigned(container) {
   const select = container.querySelector(".add-task__select--assigned");
   if (!select) return;
   
   const menu = container.querySelector("#addTaskAssignedMenu");
   const label = select.querySelector(".add-task__select-value");
   const input = container.querySelector("#addTaskAssignedInput");
   const initialsContainer = container.querySelector("#addTaskAssignedInitials");
   
   if (menu) {
      const selectedOptions = menu.querySelectorAll(".add-task__select-option--selected");
      selectedOptions.forEach((option) => {
         option.classList.remove("add-task__select-option--selected");
         const checkbox = option.querySelector(".add-task__option-checkbox");
         if (checkbox) {
            uncheckCheckbox(checkbox);
         }
      });
   }
   
   if (label) {
      label.textContent = "Select contacts to assign";
   }
   
   if (input) {
      input.value = "";
   }
   
   if (initialsContainer) {
      initialsContainer.innerHTML = "";
   }
   
   select.classList.remove("add-task__select--open");
   select.setAttribute("aria-expanded", "false");
   
   const wrapper = getSelectWrapper(select);
   const footer = getFooter();
   
   if (wrapper) {
      wrapper.style.paddingBottom = "0px";
   }
   
   if (footer) {
      footer.style.transform = "translateY(0)";
   }
}

function resetValidation(container) {
   const fields = container.querySelectorAll(".add-task__input-field--required");
   fields.forEach(hideFieldError);
   
   const createButton = container.querySelector(".add-task__button--create");
   if (createButton) {
      disableButton(createButton);
   }
}

function handleClearClick(event, button) {
   event.preventDefault();
   
   const container = button.closest(".main_flex-instructions") || document;
   
   clearAllInputs(container);
   clearSubtasks(container);
   resetCategory(container);
   resetPriority(container);
   resetValidation(container);
   resetAssigned(container);
}

function setupClearButton(button) {
   button.addEventListener("click", (event) => {
      handleClearClick(event, button);
   });
}

function initClearButtons() {
   const clearButtons = document.querySelectorAll(".add-task__button--cancel");
   clearButtons.forEach(setupClearButton);
}