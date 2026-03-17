(function initContactsFormNamespace() {
   const ContactsFeature = window.ContactsFeature || {};
   ContactsFeature.state = ContactsFeature.state || {
      selectedContactId: null,
      editingContactId: null,
      editingContactKey: null,
      contacts: [],
   };

   const state = ContactsFeature.state;
   const data = ContactsFeature.data;
   const view = ContactsFeature.view;

   /**
    * Returns the contact by ID.
    *
    * @param {string|number} contactId - The contact ID used for this operation.
    * @returns {string} The contact by ID.
    */
   function getContactById(contactId) {
      return state.contacts.find((contact) => String(contact.id) === String(contactId));
   }

   /**
    * Builds the random color.
    * @returns {string} The random color.
    */
   function buildRandomColor() {
      return `#${Math.floor(Math.random() * 16777215)
         .toString(16)
         .padStart(6, "0")}`;
   }

   /**
    * Checks whether the contact name is valid.
    *
    * @param {string} name - The name.
    * @returns {boolean} Whether the contact name is valid.
    */
   function isValidContactName(name) {
      const trimmedName = String(name || "").trim();
      const namePattern = /^[A-Za-zÄÖÜäöüß]+(?:\s+[A-Za-zÄÖÜäöüß]+)*$/;
      return trimmedName.length >= 2 && namePattern.test(trimmedName);
   }

   /**
    * Checks whether the contact email is valid.
    *
    * @param {string} email - The email.
    * @returns {boolean} Whether the contact email is valid.
    */
   function isValidContactEmail(email) {
      const emailPattern = /^[^\s@]+@[^\s@.]+\.[A-Za-z]{2,}$/;
      return emailPattern.test(String(email || "").trim().toLowerCase());
   }

   /**
    * Checks whether the contact phone number is valid.
    * The phone field is optional – returns true when empty.
    *
    * @param {string} phone - The phone number.
    * @returns {boolean} Whether the phone number is valid (or empty).
    */
   function isValidContactPhone(phone) {
      const trimmed = String(phone || "").trim();
      if (!trimmed) return true;
      const phonePattern = /^\+?[\d\s\-().]{6,20}$/;
      return phonePattern.test(trimmed);
   }

   /**
    * Returns the field error element.
    *
    * @param {string} id - The element ID.
    * @returns {HTMLElement|null} The field error element, or null when it is not available.
    */
   function getFieldErrorElement(id) {
      return document.querySelector(`[data-error-for="${id}"]`);
   }

   /**
    * Shows the error.
    *
    * @param {string} message - The message.
    * @param {Array<*>} [invalidIds=["add-name", "add-email"]] - The invalid IDs used for this operation. Defaults to ["add-name", "add-email"].
    * @returns {void} Nothing.
    */
   function showError(message, invalidIds = ["add-name", "add-email"]) {
      hideError();
      invalidIds.forEach((id) => {
         const input = document.getElementById(id);
         const errorEl = getFieldErrorElement(id);
         if (errorEl) {
            errorEl.textContent = message || errorEl.dataset.defaultMessage || "";
            errorEl.style.display = "block";
            errorEl.style.opacity = "1";
         }
         input?.classList.add("login__input--error");
         input
            ?.closest(".contact-modal__field")
            ?.classList.add("contact-modal__field--error");
      });
   }

   /**
    * Hides the error.
    * @returns {void} Nothing.
    */
   function hideError() {
      ["add-name", "add-email", "add-phone"].forEach((id) => {
         const input = document.getElementById(id);
         const errorEl = getFieldErrorElement(id);
         if (errorEl) {
            errorEl.textContent = errorEl.dataset.defaultMessage || "";
            errorEl.style.opacity = "0";
         }
         input?.classList.remove("login__input--error");
         input
            ?.closest(".contact-modal__field")
            ?.classList.remove("contact-modal__field--error");
      });
   }

   /**
    * Clears the field error.
    *
    * @param {string} id - The element ID.
    * @returns {void} Nothing.
    */
   function clearFieldError(id) {
      const input = document.getElementById(id);
      const errorEl = getFieldErrorElement(id);
      input?.classList.remove("login__input--error");
      input
         ?.closest(".contact-modal__field")
         ?.classList.remove("contact-modal__field--error");
      if (errorEl) {
         errorEl.textContent = errorEl.dataset.defaultMessage || "";
         errorEl.style.opacity = "0";
      }
   }

   /**
    * Binds the error hide on input.
    * @returns {void} Nothing.
    */
   function bindErrorHideOnInput() {
      ["add-name", "add-email", "add-phone"].forEach((id) => {
         const field = document.getElementById(id);
         if (!field) return;
         const handler = () => clearFieldError(id);
         field.removeEventListener("input", field._contactErrorHandler);
         field._contactErrorHandler = handler;
         field.addEventListener("input", handler);
      });
   }

   /**
    * Sets the mode.
    *
    * @param {boolean} isEditMode - Whether the mode is edit.
    * @returns {void} Nothing.
    */
   function setMode(isEditMode) {
      const title = document.getElementById("contact-form-title");
      const submitButton = document.getElementById("contact-form-submit");
      const secondaryButton = document.getElementById("contact-form-cancel");
      const isMobile = window.matchMedia("(max-width: 820px)").matches;

      if (title) title.innerText = isEditMode ? "Edit Contact" : "Add Contact";
      if (submitButton) {
         submitButton.innerText = isEditMode
            ? isMobile
               ? "Save"
               : "Save"
            : "Create contact";
      }
      if (secondaryButton) {
         secondaryButton.innerText = isEditMode ? "Delete" : "Cancel";
         secondaryButton.dataset.mode = isEditMode ? "delete" : "cancel";
      }
   }

   /**
    * Sets the avatar.
    *
    * @param {object|null} [contact=null] - The contact object. Defaults to null.
    * @returns {void} Nothing.
    */
   function setAvatar(contact = null) {
      const avatar = document.querySelector(".contact-modal__avatar");
      if (!avatar) return;

      const initialsElement = avatar.querySelector(
         ".contact-modal__avatar-initials"
      );
      if (!initialsElement) return;

      if (contact && contact.name) {
         initialsElement.innerText = view.getInitials(contact.name);
         avatar.style.backgroundColor = contact.color || "#d1d1d1";
         avatar.classList.add("contact-modal__avatar--initials");
         return;
      }

      initialsElement.innerText = "";
      avatar.style.backgroundColor = "";
      avatar.classList.remove("contact-modal__avatar--initials");
   }

   /**
    * Resets the mode.
    * @returns {void} Nothing.
    */
   function resetMode() {
      state.editingContactId = null;
      state.editingContactKey = null;
      setMode(false);
      setAvatar(null);
   }

   /**
    * Opens the overlay.
    * @returns {void} Nothing.
    */
   function openOverlay() {
      document.getElementById("overlay")?.classList.remove("d-none");
      bindErrorHideOnInput();
   }

   /**
    * Closes the overlay.
    * @returns {void} Nothing.
    */
   function closeOverlay() {
      document.getElementById("overlay")?.classList.add("d-none");
      document.getElementById("contact-form")?.reset();
      hideError();
      resetMode();
   }

   /**
    * Handles the edit.
    * @returns {void} Nothing.
    */
   function handleEdit() {
      if (!state.selectedContactId) return;
      const contact = getContactById(state.selectedContactId);
      if (!contact) return;

      state.editingContactId = contact.id;
      state.editingContactKey = contact._firebaseKey || null;
      setMode(true);

      const nameInput = document.getElementById("add-name");
      const emailInput = document.getElementById("add-email");
      const phoneInput = document.getElementById("add-phone");

      if (nameInput) nameInput.value = contact.name || "";
      if (emailInput) emailInput.value = contact.email || "";
      if (phoneInput) phoneInput.value = contact.phone || "";

      setAvatar(contact);
      hideError();
      openOverlay();
   }

   /**
    * Deletes the selected.
    * @returns {Promise<void>} A promise that resolves when the operation is complete.
    */
   async function deleteSelected() {
      if (!state.selectedContactId) return;
      try {
         const overlay = document.getElementById("overlay");
         const isOverlayOpen =
            Boolean(overlay) && !overlay.classList.contains("d-none");

         view.closeDetailMenu();
         await data.deleteContact(state.selectedContactId);
         await data.loadContacts();

         state.selectedContactId = null;
         document.getElementById("detail-view")?.classList.add("d-none");

         if (isOverlayOpen) {
            closeOverlay();
         }

         view.renderContacts();
         view.switchView();
         view.showToast("Contact deleted");
      } catch (error) {
         console.error("Contact deletion failed:", error);
         view.showToast("Contact could not be deleted", "error");
      }
   }

   /**
    * Handles the secondary action.
    * @returns {Promise<void>} A promise that resolves when the operation is complete.
    */
   async function handleSecondaryAction() {
      if (state.editingContactId !== null) {
         if (state.selectedContactId === null) {
            state.selectedContactId = state.editingContactId;
         }
         await deleteSelected();
         return;
      }

      closeOverlay();
   }

   /**
    * Handles the submit.
    *
    * @param {Event} event - The event object that triggered the handler.
    * @returns {Promise<void>} A promise that resolves when the operation is complete.
    */
   async function handleSubmit(event) {
      event.preventDefault();

      const name = document.getElementById("add-name")?.value.trim() || "";
      const email = document.getElementById("add-email")?.value.trim() || "";
      const phone = document.getElementById("add-phone")?.value.trim() || "";

      const fieldErrors = {};
      if (!name) {
         fieldErrors["add-name"] = "";
      } else if (!isValidContactName(name)) {
         fieldErrors["add-name"] = "Please enter a valid name.";
      }
      if (!email) {
         fieldErrors["add-email"] = "";
      } else if (!isValidContactEmail(email)) {
         fieldErrors["add-email"] = "Please enter a valid email address.";
      }
      if (phone && !isValidContactPhone(phone)) {
         fieldErrors["add-phone"] = "Please enter a valid phone number.";
      }
      if (Object.keys(fieldErrors).length > 0) {
         hideError();
         Object.entries(fieldErrors).forEach(([id, message]) => {
            const input = document.getElementById(id);
            const errorEl = getFieldErrorElement(id);
            if (errorEl) {
               errorEl.textContent = message || errorEl.dataset.defaultMessage || "";
               errorEl.style.display = "block";
               errorEl.style.opacity = "1";
            }
            input?.classList.add("login__input--error");
            input?.closest(".contact-modal__field")?.classList.add("contact-modal__field--error");
         });
         return;
      }

      try {
         const editedContactId = state.editingContactId;

         if (editedContactId !== null) {
            const selectedContact = getContactById(editedContactId);
            const originalName = String(selectedContact?.name || "").trim();
            const originalEmail = String(selectedContact?.email || "").trim();
            const originalPhone = String(selectedContact?.phone || "").trim();
            const hasChanges =
               name !== originalName ||
               email !== originalEmail ||
               phone !== originalPhone;

            if (!hasChanges) {
               state.selectedContactId = editedContactId;
               closeOverlay();
               view.renderContacts();
               if (selectedContact) {
                  view.showDetail(selectedContact);
               }
               view.switchView();
               view.showToast("Contact updated");
               return;
            }

            const updatedContact = {
               id: selectedContact?.id ?? editedContactId,
               name,
               email,
               phone,
               color: selectedContact?.color || buildRandomColor(),
            };

            await data.updateContact(
               editedContactId,
               updatedContact,
               state.editingContactKey
            );
         } else {
            await data.addContact({
               id: Date.now(),
               name,
               email,
               phone,
               color: buildRandomColor(),
            });
         }

         const wasEdit = editedContactId !== null;
         await data.loadContacts();

         if (wasEdit) {
            state.selectedContactId = editedContactId;
         }

         closeOverlay();
         view.renderContacts();

         const activeContact = getContactById(state.selectedContactId);
         if (activeContact) {
            view.showDetail(activeContact);
         }

         view.switchView();
         view.showToast(
            wasEdit ? "Contact updated" : "Contact successfully created"
         );
      } catch (error) {
         console.error("Contact save failed:", error);
         showError("Contact could not be saved. Please try again.");
         view.showToast("Contact could not be saved", "error");
      }
   }

   ContactsFeature.form = {
      showError,
      hideError,
      clearFieldError,
      bindErrorHideOnInput,
      setMode,
      setAvatar,
      resetMode,
      openOverlay,
      closeOverlay,
      handleEdit,
      handleSubmit,
      handleSecondaryAction,
      deleteSelected,
   };

   window.ContactsFeature = ContactsFeature;
   window.openOverlay = openOverlay;
   window.closeOverlay = closeOverlay;
})();
