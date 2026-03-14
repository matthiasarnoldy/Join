document.addEventListener("DOMContentLoaded", initAllFeatures);

/**
 * Initializes the all features.
 * @returns {void} Nothing.
 */
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

// ===== CLEAR BUTTON =====

/**
 * Initializes the clear buttons.
 * @returns {void} Nothing.
 */
function initClearButtons() {
   const clearButtons = document.querySelectorAll(".add-task__button--cancel");
   clearButtons.forEach(setupClearButton);
}


/**
 * Sets up the clear button.
 *
 * @param {HTMLElement|null} button - The button.
 * @returns {void} Nothing.
 */
function setupClearButton(button) {
   button.addEventListener("click", (event) => {
      handleClearClick(event, button);
   });
}


/**
 * Handles clearing the click.
 *
 * @param {Event} event - The event object that triggered the handler.
 * @param {HTMLElement|null} button - The button.
 * @returns {void} Nothing.
 */
function handleClearClick(event, button) {
   event.preventDefault();
   const container = button.closest(".main_flex-instructions") || document;
   clearAllInputs(container);
   resetPriority(container);
   resetAssigned(container);
   resetCategory(container);
   clearSubtasks(container);
   resetValidation(container);
}


/**
 * Clears the all inputs.
 *
 * @param {HTMLElement|null} container - The container.
 * @returns {void} Nothing.
 */
function clearAllInputs(container) {
   const inputs = container.querySelectorAll("input, textarea, select");
   inputs.forEach((input) => {
      if (input.type === "checkbox" || input.type === "radio") {
         input.checked = false;
      } else {
         input.value = "";
         input.dispatchEvent(new Event("input", { bubbles: true }));
      }
   });
}


/**
 * Resets the priority.
 *
 * @param {HTMLElement|null} container - The container.
 * @returns {void} Nothing.
 */
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


/**
 * Resets the assigned.
 *
 * @param {HTMLElement|null} container - The container.
 * @returns {void} Nothing.
 */
function resetAssigned(container) {
   const select = container.querySelector(".add-task__select--assigned");
   if (!select) return;
   resetAssignedOptions(container.querySelector("#addTaskAssignedMenu"));
   resetAssignedLabel(select.querySelector(".add-task__select-value"));
   resetAssignedInput(container.querySelector("#addTaskAssignedInput"));
   resetAssignedInitials(container.querySelector("#addTaskAssignedInitials"));
   resetAssignedMenuState(select);
   resetAssignedSpacing(select);
}


/**
 * Resets the assigned options.
 *
 * @param {HTMLElement|null} menu - The menu.
 * @returns {void} Nothing.
 */
function resetAssignedOptions(menu) {
   if (!menu) return;
   const selectedOptions = menu.querySelectorAll(`.${ASSIGNED_SELECTED_CLASS}`);
   selectedOptions.forEach((option) => {
      option.classList.remove(ASSIGNED_SELECTED_CLASS);
      const checkbox = option.querySelector(".add-task__option-checkbox");
      if (checkbox) {
         uncheckCheckbox(checkbox);
      }
   });
}


/**
 * Resets the assigned label.
 *
 * @param {HTMLElement|null} label - The label.
 * @returns {void} Nothing.
 */
function resetAssignedLabel(label) {
   if (!label) return;
   label.textContent = ASSIGNED_PLACEHOLDER_TEXT;
}


/**
 * Resets the assigned input.
 *
 * @param {HTMLElement|null} input - The input.
 * @returns {void} Nothing.
 */
function resetAssignedInput(input) {
   if (!input) return;
   input.value = "";
}


/**
 * Resets the assigned initials.
 *
 * @param {HTMLElement|null} initialsContainer - The initials container.
 * @returns {void} Nothing.
 */
function resetAssignedInitials(initialsContainer) {
   if (!initialsContainer) return;
   initialsContainer.innerHTML = "";
}


/**
 * Resets the assigned menu state.
 *
 * @param {HTMLElement|null} select - The select.
 * @returns {void} Nothing.
 */
function resetAssignedMenuState(select) {
   if (!select) return;
   select.classList.remove(ASSIGNED_OPEN_CLASS);
   select.setAttribute("aria-expanded", "false");
}


/**
 * Resets the assigned spacing.
 *
 * @param {HTMLElement|null} select - The select.
 * @returns {void} Nothing.
 */
function resetAssignedSpacing(select) {
   const wrapper = getSelectWrapper(select);
   const footer = getFooter();
   if (wrapper) {
      wrapper.style.paddingBottom = "0px";
   }
   if (footer) {
      footer.style.transform = "translateY(0)";
   }
}


/**
 * Resets the category.
 *
 * @param {HTMLElement|null} container - The container.
 * @returns {void} Nothing.
 */
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


/**
 * Clears the subtasks.
 *
 * @param {HTMLElement|null} container - The container.
 * @returns {void} Nothing.
 */
function clearSubtasks(container) {
   const lists = container.querySelectorAll(".add-task__subtask-list");
   lists.forEach((list) => {
      list.innerHTML = "";
   });
}


/**
 * Resets the validation.
 *
 * @param {HTMLElement|null} container - The container.
 * @returns {void} Nothing.
 */
function resetValidation(container) {
   const fields = container.querySelectorAll(".add-task__input-field--required");
   fields.forEach(hideFieldError);
   const createButton = container.querySelector(".add-task__button--create");
   if (createButton) {
      disableButton(createButton);
   }
}