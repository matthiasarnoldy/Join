"use strict";

{
   const ContactsFeature = window.ContactsFeature || {};
   ContactsFeature.state = ContactsFeature.state || {
      selectedContactId: null,
      editingContactId: null,
      editingContactKey: null,
      contacts: [],
   };
   const view = ContactsFeature.view;
   const FIELD_IDS = ["add-name", "add-email", "add-phone"];
   const NAME_PATTERN = /^[A-Za-zÄÖÜäöüß]+(?:\s+[A-Za-zÄÖÜäöüß]+)*$/;
   const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+\.[A-Za-z]{2,}$/;
   const PHONE_PATTERN = /^\+?[\d\s\-().]{6,20}$/;

   /**
    * Returns the trimmed form values.
    * @returns {object} The current form values.
    */
   function getFormValues() {
      return {
         name: getFieldValue("add-name"),
         email: getFieldValue("add-email"),
         phone: getFieldValue("add-phone"),
      };
   }

   /**
    * Returns one trimmed field value.
    *
    * @param {string} id - The input ID.
    * @returns {string} The trimmed field value.
    */
   function getFieldValue(id) {
      return document.getElementById(id)?.value.trim() || "";
   }

   /**
    * Checks whether a contact name is valid.
    *
    * @param {string} name - The contact name.
    * @returns {boolean} Whether the name is valid.
    */
   function isValidContactName(name) {
      const trimmedName = String(name || "").trim();
      return trimmedName.length >= 2 && NAME_PATTERN.test(trimmedName);
   }

   /**
    * Checks whether an email address is valid.
    *
    * @param {string} email - The email address.
    * @returns {boolean} Whether the email is valid.
    */
   function isValidContactEmail(email) {
      return EMAIL_PATTERN.test(String(email || "").trim().toLowerCase());
   }

   /**
    * Checks whether a phone number is valid.
    *
    * @param {string} phone - The phone number.
    * @returns {boolean} Whether the phone number is valid.
    */
   function isValidContactPhone(phone) {
      const trimmed = String(phone || "").trim();
      return !trimmed || PHONE_PATTERN.test(trimmed);
   }

   /**
    * Validates the contact form values.
    *
    * @param {object} values - The form values.
    * @returns {object} The validation errors.
    */
   function validateContactValues(values) {
      const errors = {};
      addNameError(errors, values.name);
      addEmailError(errors, values.email);
      addPhoneError(errors, values.phone);
      return errors;
   }

   /**
    * Adds a name validation error when needed.
    *
    * @param {object} errors - The error object.
    * @param {string} name - The contact name.
    * @returns {void} Nothing.
    */
   function addNameError(errors, name) {
      if (!name) errors["add-name"] = "";
      else if (!isValidContactName(name)) errors["add-name"] = "Please enter a valid name.";
   }

   /**
    * Adds an email validation error when needed.
    *
    * @param {object} errors - The error object.
    * @param {string} email - The email address.
    * @returns {void} Nothing.
    */
   function addEmailError(errors, email) {
      if (!email) errors["add-email"] = "";
      else if (!isValidContactEmail(email)) errors["add-email"] = "Please enter a valid email address.";
   }

   /**
    * Adds a phone validation error when needed.
    *
    * @param {object} errors - The error object.
    * @param {string} phone - The phone number.
    * @returns {void} Nothing.
    */
   function addPhoneError(errors, phone) {
      if (phone && !isValidContactPhone(phone)) errors["add-phone"] = "Please enter a valid phone number.";
   }

   /**
    * Shows one error message on multiple fields.
    *
    * @param {string} message - The error message.
    * @param {Array<string>} [invalidIds=["add-name", "add-email"]] - The invalid field IDs.
    * @returns {void} Nothing.
    */
   function showError(message, invalidIds = ["add-name", "add-email"]) {
      hideError();
      invalidIds.forEach((id) => showFieldError(id, message));
   }

   /**
    * Shows all validation errors.
    *
    * @param {object} errors - The validation errors.
    * @returns {void} Nothing.
    */
   function showErrors(errors) {
      hideError();
      Object.entries(errors).forEach(applyErrorEntry);
   }

   /**
    * Applies one validation error entry.
    *
    * @param {Array<*>} entry - The error entry.
    * @returns {void} Nothing.
    */
   function applyErrorEntry([id, message]) {
      showFieldError(id, message);
   }

   /**
    * Shows an error on one field.
    *
    * @param {string} id - The field ID.
    * @param {string} message - The error message.
    * @returns {void} Nothing.
    */
   function showFieldError(id, message) {
      const input = document.getElementById(id);
      const errorEl = getFieldErrorElement(id);
      setErrorText(errorEl, message);
      toggleFieldStyles(input, true);
   }

   /**
    * Sets the text for an error element.
    *
    * @param {HTMLElement|null} errorEl - The error element.
    * @param {string} message - The error message.
    * @returns {void} Nothing.
    */
   function setErrorText(errorEl, message) {
      if (!errorEl) return;
      errorEl.textContent = message || errorEl.dataset.defaultMessage || "";
      errorEl.style.display = "block";
      errorEl.style.opacity = "1";
   }

   /**
    * Hides all field errors.
    * @returns {void} Nothing.
    */
   function hideError() {
      FIELD_IDS.forEach(clearFieldError);
   }

   /**
    * Clears the error for one field.
    *
    * @param {string} id - The field ID.
    * @returns {void} Nothing.
    */
   function clearFieldError(id) {
      const input = document.getElementById(id);
      const errorEl = getFieldErrorElement(id);
      resetErrorText(errorEl);
      toggleFieldStyles(input, false);
   }

   /**
    * Resets one error element to its default text.
    *
    * @param {HTMLElement|null} errorEl - The error element.
    * @returns {void} Nothing.
    */
   function resetErrorText(errorEl) {
      if (!errorEl) return;
      errorEl.textContent = errorEl.dataset.defaultMessage || "";
      errorEl.style.opacity = "0";
   }

   /**
    * Toggles the error styles for one field.
    *
    * @param {HTMLElement|null} input - The input element.
    * @param {boolean} isError - Whether the field has an error.
    * @returns {void} Nothing.
    */
   function toggleFieldStyles(input, isError) {
      input?.classList.toggle("login__input--error", isError);
      input?.closest(".contact-modal__field")?.classList.toggle("contact-modal__field--error", isError);
   }

   /**
    * Returns the error element for one field.
    *
    * @param {string} id - The field ID.
    * @returns {HTMLElement|null} The error element.
    */
   function getFieldErrorElement(id) {
      return document.querySelector(`[data-error-for="${id}"]`);
   }

   /**
    * Binds error clearing to all form fields.
    * @returns {void} Nothing.
    */
   function bindErrorHideOnInput() {
      FIELD_IDS.forEach(bindFieldInputHandler);
   }

   /**
    * Binds the error reset for one field.
    *
    * @param {string} id - The field ID.
    * @returns {void} Nothing.
    */
   function bindFieldInputHandler(id) {
      const field = document.getElementById(id);
      if (!field) return;
      const handler = () => clearFieldError(id);
      field.removeEventListener("input", field._contactErrorHandler);
      field._contactErrorHandler = handler;
      field.addEventListener("input", handler);
   }

   /**
    * Updates the form mode labels.
    *
    * @param {boolean} isEditMode - Whether edit mode is active.
    * @returns {void} Nothing.
    */
   function setMode(isEditMode) {
      setTitleText(isEditMode);
      setSubmitText(isEditMode);
      setSecondaryActionState(isEditMode);
   }

   /**
    * Sets the contact form title.
    *
    * @param {boolean} isEditMode - Whether edit mode is active.
    * @returns {void} Nothing.
    */
   function setTitleText(isEditMode) {
      const title = document.getElementById("contact-form-title");
      if (title) title.innerText = isEditMode ? "Edit Contact" : "Add Contact";
   }

   /**
    * Sets the submit button label.
    *
    * @param {boolean} isEditMode - Whether edit mode is active.
    * @returns {void} Nothing.
    */
   function setSubmitText(isEditMode) {
      const submitButton = document.getElementById("contact-form-submit");
      if (submitButton) submitButton.innerText = isEditMode ? "Save" : "Create contact";
   }

   /**
    * Sets the secondary button state.
    *
    * @param {boolean} isEditMode - Whether edit mode is active.
    * @returns {void} Nothing.
    */
   function setSecondaryActionState(isEditMode) {
      const button = document.getElementById("contact-form-cancel");
      if (!button) return;
      button.innerText = isEditMode ? "Delete" : "Cancel";
      button.dataset.mode = isEditMode ? "delete" : "cancel";
   }

   /**
    * Updates the contact avatar preview.
    *
    * @param {object|null} [contact=null] - The contact for the avatar preview.
    * @returns {void} Nothing.
    */
   function setAvatar(contact = null) {
      const avatar = document.querySelector(".contact-modal__avatar");
      const initialsElement = avatar?.querySelector(".contact-modal__avatar-initials");
      if (!avatar || !initialsElement) return;
      contact && contact.name ? applyContactAvatar(avatar, initialsElement, contact) : resetAvatar(avatar, initialsElement);
   }

   /**
    * Applies a contact avatar preview.
    *
    * @param {HTMLElement} avatar - The avatar element.
    * @param {HTMLElement} initialsElement - The initials element.
    * @param {object} contact - The contact.
    * @returns {void} Nothing.
    */
   function applyContactAvatar(avatar, initialsElement, contact) {
      initialsElement.innerText = view.getInitials(contact.name);
      avatar.style.backgroundColor = contact.color || "#d1d1d1";
      avatar.classList.add("contact-modal__avatar--initials");
   }

   /**
    * Resets the avatar preview.
    *
    * @param {HTMLElement} avatar - The avatar element.
    * @param {HTMLElement} initialsElement - The initials element.
    * @returns {void} Nothing.
    */
   function resetAvatar(avatar, initialsElement) {
      initialsElement.innerText = "";
      avatar.style.backgroundColor = "";
      avatar.classList.remove("contact-modal__avatar--initials");
   }

   /**
    * Fills the form with contact data.
    *
    * @param {object} contact - The contact to show in the form.
    * @returns {void} Nothing.
    */
   function fillForm(contact) {
      setInputValue("add-name", contact.name);
      setInputValue("add-email", contact.email);
      setInputValue("add-phone", contact.phone);
      setAvatar(contact);
   }

   /**
    * Sets one form input value.
    *
    * @param {string} id - The input ID.
    * @param {string} value - The input value.
    * @returns {void} Nothing.
    */
   function setInputValue(id, value) {
      const input = document.getElementById(id);
      if (input) input.value = value || "";
   }

   /**
    * Resets the form values and errors.
    * @returns {void} Nothing.
    */
   function resetForm() {
      document.getElementById("contact-form")?.reset();
      hideError();
   }

   /**
    * Shows the contact overlay.
    * @returns {void} Nothing.
    */
   function showOverlay() {
      document.getElementById("overlay")?.classList.remove("d-none");
      bindErrorHideOnInput();
   }

   /**
    * Hides the contact overlay.
    * @returns {void} Nothing.
    */
   function hideOverlay() {
      document.getElementById("overlay")?.classList.add("d-none");
   }

   /**
    * Checks whether the overlay is open.
    * @returns {boolean} Whether the overlay is open.
    */
   function isOverlayOpen() {
      const overlay = document.getElementById("overlay");
      return Boolean(overlay) && !overlay.classList.contains("d-none");
   }

   ContactsFeature.formUi = {
      getFormValues,
      validateContactValues,
      showError,
      showErrors,
      hideError,
      clearFieldError,
      bindErrorHideOnInput,
      setMode,
      setAvatar,
      fillForm,
      resetForm,
      showOverlay,
      hideOverlay,
      isOverlayOpen,
   };

   window.ContactsFeature = ContactsFeature;
}
