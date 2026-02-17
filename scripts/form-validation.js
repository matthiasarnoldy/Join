// ===== FORM VALIDATION =====

function findRequiredFields(container) {
   return Array.from(container.querySelectorAll(".add-task__input-field--required"));
}

function getInputFromField(field) {
   return field.querySelector("input, textarea, select");
}

function isFieldFilled(field) {
   const input = getInputFromField(field);
   if (!input) return false;
   return input.value.trim() !== "";
}

function setButtonState(button, allFieldsValid) {
   if (allFieldsValid) {
      button.classList.remove("is-disabled");
      button.setAttribute("aria-disabled", "false");
   } else {
      button.classList.add("is-disabled");
      button.setAttribute("aria-disabled", "true");
   }
}

function showErrorsOnEmptyFields(fields) {
   fields.forEach((field) => {
      if (!isFieldFilled(field)) {
         field.classList.add("add-task__input-field--error");
      }
   });
}

function handleFieldInput(field, fields, button) {
   field.classList.remove("add-task__input-field--error");
   const allValid = fields.every(isFieldFilled);
   setButtonState(button, allValid);
}

function setupLiveValidation(fields, button) {
   fields.forEach((field) => {
      const input = getInputFromField(field);
      if (input) {
         input.addEventListener("input", () => handleFieldInput(field, fields, button));
      }
   });
}

function handleCreateButtonClick(event, fields) {
   const allValid = fields.every(isFieldFilled);
   if (!allValid) {
      showErrorsOnEmptyFields(fields);
   }
}

function setupCreateButton(button) {
   const container = button.closest(".main_flex-instructions") || document;
   const fields = findRequiredFields(container);
   
   if (fields.length > 0) {
      setupLiveValidation(fields, button);
      setButtonState(button, fields.every(isFieldFilled));
      button.addEventListener("click", (event) => handleCreateButtonClick(event, fields));
   }
}

function initFormValidation() {
   const createButtons = document.querySelectorAll(".add-task__button--create");
   createButtons.forEach(setupCreateButton);
}

function clearFormFields(container) {
   const inputs = container.querySelectorAll(".add-task__input");
   inputs.forEach((input) => {
      input.value = "";
      input.classList.remove("add-task__input-field--error");
   });
}

function resetValidationState(container) {
   const fields = findRequiredFields(container);
   fields.forEach((field) => {
      field.classList.remove("add-task__input-field--error");
   });
}

function resetPriorityToMedium(container) {
   const buttons = container.querySelectorAll(".add-task__priority-button");
   buttons.forEach((btn) => {
      if (btn.dataset.priority === "medium") {
         btn.classList.add("add-task__priority-button--active");
      } else {
         btn.classList.remove("add-task__priority-button--active");
      }
   });
}
