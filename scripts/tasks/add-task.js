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

// ===== CLEAR BUTTON =====

function initClearButtons() {
   const clearButtons = document.querySelectorAll(".add-task__button--cancel");
   clearButtons.forEach(setupClearButton);
}

function setupClearButton(button) {
   button.addEventListener("click", (event) => {
      handleClearClick(event, button);
   });
}

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

function resetAssignedLabel(label) {
   if (!label) return;
   label.textContent = ASSIGNED_PLACEHOLDER_TEXT;
}

function resetAssignedInput(input) {
   if (!input) return;
   input.value = "";
}

function resetAssignedInitials(initialsContainer) {
   if (!initialsContainer) return;
   initialsContainer.innerHTML = "";
}

function resetAssignedMenuState(select) {
   if (!select) return;
   select.classList.remove(ASSIGNED_OPEN_CLASS);
   select.setAttribute("aria-expanded", "false");
}

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

function resetValidation(container) {
   const fields = container.querySelectorAll(".add-task__input-field--required");
   fields.forEach(hideFieldError);
   const createButton = container.querySelector(".add-task__button--create");
   if (createButton) {
      disableButton(createButton);
   }
}