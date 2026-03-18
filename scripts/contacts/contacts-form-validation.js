"use strict";

{
   const ContactsFeature = window.ContactsFeature || {};
   const NAME_PATTERN = /^[A-Za-zÄÖÜäöüß]+(?:\s+[A-Za-zÄÖÜäöüß]+)*$/;
   const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+\.[A-Za-z]{2,}$/;
   const PHONE_PATTERN = /^\+?[\d\s\-().]{6,20}$/;

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

   ContactsFeature.formUiValidation = {
      isValidContactName,
      isValidContactEmail,
      isValidContactPhone,
      addNameError,
      addEmailError,
      addPhoneError,
      validateContactValues,
   };

   window.ContactsFeature = ContactsFeature;
}
