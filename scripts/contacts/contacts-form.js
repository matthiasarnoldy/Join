(function initContactsFormNamespace() {
   const ContactsFeature = window.ContactsFeature || {};
   ContactsFeature.state = ContactsFeature.state || {
      selectedContactId: null,
      editingContactId: null,
      contacts: [],
   };

   const state = ContactsFeature.state;
   const data = ContactsFeature.data;
   const view = ContactsFeature.view;

   function getContactById(contactId) {
      return state.contacts.find((contact) => String(contact.id) === String(contactId));
   }

   function buildRandomColor() {
      return `#${Math.floor(Math.random() * 16777215)
         .toString(16)
         .padStart(6, "0")}`;
   }

   function showError(message, invalidIds = ["add-name", "add-email"]) {
      const errorEl = document.getElementById("contactFormError");
      if (!errorEl) return;
      errorEl.textContent = message;
      errorEl.style.display = "block";
      errorEl.style.opacity = "1";
      invalidIds.forEach((id) => {
         const input = document.getElementById(id);
         input?.classList.add("login__input--error");
         input
            ?.closest(".contact-modal__field")
            ?.classList.add("contact-modal__field--error");
      });
   }

   function hideError() {
      const errorEl = document.getElementById("contactFormError");
      if (!errorEl) return;
      errorEl.style.opacity = "0";
      ["add-name", "add-email", "add-phone"].forEach((id) => {
         const input = document.getElementById(id);
         input?.classList.remove("login__input--error");
         input
            ?.closest(".contact-modal__field")
            ?.classList.remove("contact-modal__field--error");
      });
   }

   function clearFieldError(id) {
      const input = document.getElementById(id);
      input?.classList.remove("login__input--error");
      input
         ?.closest(".contact-modal__field")
         ?.classList.remove("contact-modal__field--error");
      const anyStillInvalid = ["add-name", "add-email", "add-phone"].some(
         (fieldId) =>
            document
               .getElementById(fieldId)
               ?.classList.contains("login__input--error")
      );
      if (!anyStillInvalid) hideError();
   }

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

   function resetMode() {
      state.editingContactId = null;
      setMode(false);
      setAvatar(null);
   }

   function openOverlay() {
      document.getElementById("overlay")?.classList.remove("d-none");
      bindErrorHideOnInput();
   }

   function closeOverlay() {
      document.getElementById("overlay")?.classList.add("d-none");
      document.getElementById("contact-form")?.reset();
      hideError();
      resetMode();
   }

   function handleEdit() {
      if (!state.selectedContactId) return;
      const contact = getContactById(state.selectedContactId);
      if (!contact) return;

      state.editingContactId = contact.id;
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

   async function handleSubmit(event) {
      event.preventDefault();

      const name = document.getElementById("add-name")?.value.trim() || "";
      const email = document.getElementById("add-email")?.value.trim() || "";
      const phone = document.getElementById("add-phone")?.value.trim() || "";

      const invalidIds = [];
      if (!name) invalidIds.push("add-name");
      if (!email || !email.includes("@") || !email.includes(".")) {
         invalidIds.push("add-email");
      }
      if (invalidIds.length > 0) {
         showError("These fields are required", invalidIds);
         return;
      }

      try {
         const editedContactId = state.editingContactId;

         if (editedContactId !== null) {
            const selectedContact = getContactById(editedContactId);
            await data.updateContact(editedContactId, {
               name,
               email,
               phone,
               color: selectedContact?.color || buildRandomColor(),
            });
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
