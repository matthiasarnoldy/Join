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
 * Locks the create button during save.
 *
 * @param {HTMLButtonElement|null} button - The button.
 * @returns {void} Nothing.
 */
function lockCreateButton(button) {
   if (!button) return;
   button.disabled = true;
   button.dataset.submitting = "true";
   button.classList.add("is-disabled");
   button.setAttribute("aria-disabled", "true");
}


/**
 * Unlocks the create button after failed save.
 *
 * @param {HTMLButtonElement|null} button - The button.
 * @param {boolean} isValid - Whether the form is valid.
 * @returns {void} Nothing.
 */
function unlockCreateButton(button, isValid) {
   if (!button) return;
   button.disabled = false;
   delete button.dataset.submitting;
   updateButtonState(button, isValid);
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
   if (button?.dataset.submitting === "true") return;
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
async function handleCreateButtonClick(event, fields) {
   const button = event.currentTarget;
   if (button?.dataset.submitting === "true") {
      event.preventDefault();
      return;
   }
   const allFilled = checkAllFieldsFilled(fields);
   if (!allFilled) {
      event.preventDefault();
      showErrorsOnEmptyFields(fields);
      return;
   }
   event.preventDefault();
   lockCreateButton(button);
   const saveSucceeded = await saveTaskToBoard();
   if (!saveSucceeded) {
      unlockCreateButton(button, allFilled);
   }
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
   button.addEventListener("click", async (event) => {
      await handleCreateButtonClick(event, requiredFields);
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
