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

// ===== FORMULAR-VALIDIERUNG =====

/**
 * Finds the required fields.
 * @returns {NodeListOf<Element>} The required fields collection.
 */
function findRequiredFields() {
   return document.querySelectorAll(".add-task__input-field--required");
}


/**
 * Returns the field input.
 *
 * @param {HTMLElement|null} field - The field.
 * @returns {*} The field input result.
 */
function getFieldInput(field) {
   return field.querySelector("input, textarea, select");
}


/**
 * Checks whether the empty is field.
 *
 * @param {HTMLElement|null} field - The field.
 * @returns {boolean} Whether the empty is field.
 */
function isFieldEmpty(field) {
   const input = getFieldInput(field);
   if (!input) return true;
   const inputValue = input.value.trim();
   return inputValue === "";
}


/**
 * Checks whether the filled is field.
 *
 * @param {HTMLElement|null} field - The field.
 * @returns {boolean} Whether the filled is field.
 */
function isFieldFilled(field) {
   return !isFieldEmpty(field);
}


/**
 * Enables the button.
 *
 * @param {HTMLElement|null} button - The button.
 * @returns {void} Nothing.
 */
function enableButton(button) {
   button.classList.remove("is-disabled");
   button.setAttribute("aria-disabled", "false");
}


/**
 * Disables the button.
 *
 * @param {HTMLElement|null} button - The button.
 * @returns {void} Nothing.
 */
function disableButton(button) {
   button.classList.add("is-disabled");
   button.setAttribute("aria-disabled", "true");
}


/**
 * Updates the button state.
 *
 * @param {HTMLElement|null} button - The button.
 * @param {boolean} isValid - Whether it is valid.
 * @returns {void} Nothing.
 */
function updateButtonState(button, isValid) {
   if (isValid) {
      enableButton(button);
   } else {
      disableButton(button);
   }
}


/**
 * Shows the field error.
 *
 * @param {HTMLElement|null} field - The field.
 * @returns {void} Nothing.
 */
function showFieldError(field) {
   field.classList.add("add-task__input-field--error");
}


/**
 * Hides the field error.
 *
 * @param {HTMLElement|null} field - The field.
 * @returns {void} Nothing.
 */
function hideFieldError(field) {
   field.classList.remove("add-task__input-field--error");
}


/**
 * Shows the errors on empty fields.
 *
 * @param {object} fields - The fields object.
 * @returns {void} Nothing.
 */
function showErrorsOnEmptyFields(fields) {
   fields.forEach((field) => {
      if (isFieldEmpty(field)) {
         showFieldError(field);
      }
   });
}


/**
 * Checks the all fields filled.
 *
 * @param {object} fields - The fields object.
 * @returns {Array<*>} The all fields filled list.
 */
function checkAllFieldsFilled(fields) {
   return Array.from(fields).every(isFieldFilled);
}


/**
 * Handles the field input.
 *
 * @param {HTMLElement|null} field - The field.
 * @param {object} allFields - The all fields object.
 * @param {HTMLElement|null} button - The button.
 * @returns {void} Nothing.
 */
function handleFieldInput(field, allFields, button) {
   hideFieldError(field);
   const allValid = checkAllFieldsFilled(allFields);
   updateButtonState(button, allValid);
}


/**
 * Adds the input listener.
 *
 * @param {HTMLElement|null} field - The field.
 * @param {object} allFields - The all fields object.
 * @param {HTMLElement|null} button - The button.
 * @returns {void} Nothing.
 */
function addInputListener(field, allFields, button) {
   const input = getFieldInput(field);
   if (!input) return;
   input.addEventListener("input", () => {
      handleFieldInput(field, allFields, button);
   });
}


/**
 * Sets up the live validation.
 *
 * @param {object} fields - The fields object.
 * @param {HTMLElement|null} button - The button.
 * @returns {void} Nothing.
 */
function setupLiveValidation(fields, button) {
   fields.forEach((field) => {
      addInputListener(field, fields, button);
   });
}


/**
 * Handles createing the button click.
 *
 * @param {Event} event - The event object that triggered the handler.
 * @param {object} fields - The fields object.
 * @returns {void} Nothing.
 */
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


/**
 * Sets up the create button.
 *
 * @param {HTMLElement|null} button - The button.
 * @returns {void} Nothing.
 */
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


/**
 * Initializes the form validation.
 * @returns {void} Nothing.
 */
function initFormValidation() {
   const createButtons = document.querySelectorAll(".add-task__button--create");
   createButtons.forEach(setupCreateButton);
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