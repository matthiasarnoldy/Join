"use strict";

{
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
   const ui = ContactsFeature.formUi;

   /**
    * Finds a contact by its ID.
    *
    * @param {string|number} contactId - The contact ID.
    * @returns {object|undefined} The matching contact.
    */
   function getContactById(contactId) {
      return state.contacts.find((contact) => String(contact.id) === String(contactId));
   }

   /**
    * Builds a random avatar color.
    * @returns {string} The random hex color.
    */
   function buildRandomColor() {
      return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
   }

   /**
    * Resets the editing state and form mode.
    * @returns {void} Nothing.
    */
   function resetMode() {
      state.editingContactId = null;
      state.editingContactKey = null;
      ui.setMode(false);
      ui.setAvatar(null);
   }

   /**
    * Opens the contact overlay.
    * @returns {void} Nothing.
    */
   function openOverlay() {
      ui.showOverlay();
   }

   /**
    * Closes the contact overlay and resets the form.
    * @returns {void} Nothing.
    */
   function closeOverlay() {
      ui.hideOverlay();
      ui.resetForm();
      resetMode();
   }

   /**
    * Opens edit mode for the selected contact.
    * @returns {void} Nothing.
    */
   function handleEdit() {
      const contact = getSelectedContact();
      if (!contact) return;
      setEditingContact(contact);
      ui.setMode(true);
      ui.fillForm(contact);
      ui.hideError();
      openOverlay();
   }

   /**
    * Returns the currently selected contact.
    * @returns {object|null} The selected contact.
    */
   function getSelectedContact() {
      return state.selectedContactId ? getContactById(state.selectedContactId) : null;
   }

   /**
    * Stores the current editing contact.
    *
    * @param {object} contact - The contact to edit.
    * @returns {void} Nothing.
    */
   function setEditingContact(contact) {
      state.editingContactId = contact.id;
      state.editingContactKey = contact._firebaseKey || null;
   }

   /**
    * Deletes the selected contact.
    * @returns {Promise<void>} A promise that resolves when deletion is complete.
    */
   async function deleteSelected() {
      if (!state.selectedContactId) return;
      try {
         await deleteSelectedContact();
      } catch (error) {
         handleDeleteError(error);
      }
   }

   /**
    * Deletes the selected contact and reloads the data.
    * @returns {Promise<void>} A promise that resolves when deletion is complete.
    */
   async function deleteSelectedContact() {
      const wasOverlayOpen = ui.isOverlayOpen();
      view.closeDetailMenu();
      await data.deleteContact(state.selectedContactId);
      await data.loadContacts();
      finishDelete(wasOverlayOpen);
   }

   /**
    * Finishes the delete flow in the UI.
    *
    * @param {boolean} wasOverlayOpen - Whether the overlay was open.
    * @returns {void} Nothing.
    */
   function finishDelete(wasOverlayOpen) {
      state.selectedContactId = null;
      hideDetailView();
      if (wasOverlayOpen) closeOverlay();
      refreshContactViews();
      view.showToast("Contact deleted");
   }

   /**
    * Hides the detail view element.
    * @returns {void} Nothing.
    */
   function hideDetailView() {
      document.getElementById("detail-view")?.classList.add("d-none");
   }

   /**
    * Handles a delete error in the UI.
    *
    * @param {Error} error - The delete error.
    * @returns {void} Nothing.
    */
   function handleDeleteError(error) {
      console.error("Contact deletion failed:", error);
      view.showToast("Contact could not be deleted", "error");
   }

   /**
    * Handles the secondary form action.
    * @returns {Promise<void>} A promise that resolves when the action is complete.
    */
   async function handleSecondaryAction() {
      if (state.editingContactId === null) return closeOverlay();
      if (state.selectedContactId === null) state.selectedContactId = state.editingContactId;
      await deleteSelected();
   }

   /**
    * Handles the contact form submit.
    *
    * @param {Event} event - The submit event.
    * @returns {Promise<void>} A promise that resolves when saving is complete.
    */
   async function handleSubmit(event) {
      event.preventDefault();
      const values = ui.getFormValues();
      if (showValidationErrors(values)) return;
      try {
         await saveAndRefresh(values);
      } catch (error) {
         handleSaveError(error);
      }
   }

   /**
    * Shows validation errors when needed.
    *
    * @param {object} values - The form values.
    * @returns {boolean} Whether validation failed.
    */
   function showValidationErrors(values) {
      const errors = ui.validateContactValues(values);
      if (!hasErrors(errors)) return false;
      ui.showErrors(errors);
      return true;
   }

   /**
    * Checks whether an error object contains entries.
    *
    * @param {object} errors - The validation errors.
    * @returns {boolean} Whether errors exist.
    */
   function hasErrors(errors) {
      return Object.keys(errors).length > 0;
   }

   /**
    * Saves the contact and refreshes the UI.
    *
    * @param {object} values - The form values.
    * @returns {Promise<void>} A promise that resolves when saving is complete.
    */
   async function saveAndRefresh(values) {
      const result = await saveContact(values);
      await reloadContacts(result.shouldReload);
      state.selectedContactId = result.selectedId;
      closeOverlay();
      refreshContactViews();
      view.showToast(result.toastMessage);
   }

   /**
    * Saves a contact in add or edit mode.
    *
    * @param {object} values - The form values.
    * @returns {Promise<object>} A promise that resolves to the save result.
    */
   async function saveContact(values) {
      return state.editingContactId === null ? addContact(values) : updateExistingContact(values);
   }

   /**
    * Adds a new contact.
    *
    * @param {object} values - The form values.
    * @returns {Promise<object>} A promise that resolves to the save result.
    */
   async function addContact(values) {
      await data.addContact(buildNewContact(values));
      return createSaveResult(state.selectedContactId, true, "Contact successfully created");
   }

   /**
    * Builds the payload for a new contact.
    *
    * @param {object} values - The form values.
    * @returns {object} The new contact payload.
    */
   function buildNewContact(values) {
      return {
         id: Date.now(),
         name: values.name,
         email: values.email,
         phone: values.phone,
         color: buildRandomColor(),
      };
   }

   /**
    * Updates the currently edited contact.
    *
    * @param {object} values - The form values.
    * @returns {Promise<object>} A promise that resolves to the save result.
    */
   async function updateExistingContact(values) {
      const contact = getEditingContact();
      if (isUnchangedContact(contact, values)) return createSaveResult(contact.id, false, "Contact updated");
      await data.updateContact(contact.id, buildUpdatedContact(contact, values), state.editingContactKey);
      return createSaveResult(contact.id, true, "Contact updated");
   }

   /**
    * Returns the contact that is currently being edited.
    * @returns {object} The editing contact.
    */
   function getEditingContact() {
      const contact = getContactById(state.editingContactId);
      if (!contact) throw new Error("Edited contact not found");
      return contact;
   }

   /**
    * Checks whether an edited contact changed.
    *
    * @param {object} contact - The original contact.
    * @param {object} values - The current form values.
    * @returns {boolean} Whether the contact is unchanged.
    */
   function isUnchangedContact(contact, values) {
      return values.name === String(contact.name || "").trim()
         && values.email === String(contact.email || "").trim()
         && values.phone === String(contact.phone || "").trim();
   }

   /**
    * Builds the payload for a contact update.
    *
    * @param {object} contact - The original contact.
    * @param {object} values - The form values.
    * @returns {object} The updated contact payload.
    */
   function buildUpdatedContact(contact, values) {
      return {
         id: contact.id,
         name: values.name,
         email: values.email,
         phone: values.phone,
         color: contact.color || buildRandomColor(),
      };
   }

   /**
    * Creates a save result object.
    *
    * @param {string|number|null} selectedId - The selected contact ID.
    * @param {boolean} shouldReload - Whether contacts should reload.
    * @param {string} toastMessage - The toast message.
    * @returns {object} The save result.
    */
   function createSaveResult(selectedId, shouldReload, toastMessage) {
      return { selectedId, shouldReload, toastMessage };
   }

   /**
    * Reloads contacts when needed.
    *
    * @param {boolean} shouldReload - Whether contacts should reload.
    * @returns {Promise<void>} A promise that resolves after reloading.
    */
   async function reloadContacts(shouldReload) {
      if (shouldReload) await data.loadContacts();
   }

   /**
    * Refreshes the contact list and detail view.
    * @returns {void} Nothing.
    */
   function refreshContactViews() {
      view.renderContacts();
      showSelectedDetail();
      view.switchView();
   }

   /**
    * Shows the selected contact detail again.
    * @returns {void} Nothing.
    */
   function showSelectedDetail() {
      const activeContact = getSelectedContact();
      if (activeContact) view.showDetail(activeContact);
      else hideDetailView();
   }

   /**
    * Handles a save error in the UI.
    *
    * @param {Error} error - The save error.
    * @returns {void} Nothing.
    */
   function handleSaveError(error) {
      console.error("Contact save failed:", error);
      ui.showError("Contact could not be saved. Please try again.");
      view.showToast("Contact could not be saved", "error");
   }

   ContactsFeature.form = {
      showError: ui.showError,
      hideError: ui.hideError,
      clearFieldError: ui.clearFieldError,
      bindErrorHideOnInput: ui.bindErrorHideOnInput,
      setMode: ui.setMode,
      setAvatar: ui.setAvatar,
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
}
