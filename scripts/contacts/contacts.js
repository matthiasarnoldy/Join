(function initContactsEntryNamespace() {
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
   const form = ContactsFeature.form;

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
    * Initializes the contacts page.
    * @returns {Promise<void>} A promise that resolves when the operation is complete.
    */
   async function initContactsPage() {
      await data.loadContacts();
      view.renderContacts();
      bindEvents();
      view.switchView();
   }

   /**
    * Handles the contact click.
    *
    * @param {Event} event - The event object that triggered the handler.
    * @returns {void} Nothing.
    */
   function handleContactClick(event) {
      const item = event.target.closest(".contact-item");
      if (!item) return;

      const clickedContactId = item.dataset.id;
      if (String(state.selectedContactId) === String(clickedContactId)) {
         state.selectedContactId = null;
         view.closeDetailMenu();
         document.getElementById("detail-view")?.classList.add("d-none");
         view.renderContacts();
         view.switchView();
         return;
      }

      state.selectedContactId = clickedContactId;
      const contact = getContactById(state.selectedContactId);
      if (!contact) return;

      view.renderContacts();
      view.showDetail(contact);
      view.switchView();
   }

   /**
    * Handles the back to list.
    * @returns {void} Nothing.
    */
   function handleBackToList() {
      state.selectedContactId = null;
      view.closeDetailMenu();
      document.getElementById("detail-view")?.classList.add("d-none");
      view.renderContacts();
      view.switchView();
   }

   /**
    * Binds the events.
    * @returns {void} Nothing.
    */
   function bindEvents() {
      const addContactButton = document.getElementById("btn-add-contact");
      const contactsList = document.getElementById("contacts-list-content");
      const contactForm = document.getElementById("contact-form");
      const secondaryButton = document.getElementById("contact-form-cancel");
      const editButton = document.getElementById("btn-edit");
      const deleteButton = document.getElementById("btn-delete");
      const detailMenuButton = document.getElementById("btn-contact-detail-menu");
      const detailMenuEdit = document.getElementById("btn-contact-detail-edit");
      const detailMenuDelete = document.getElementById("btn-contact-detail-delete");
      const backButton = document.getElementById("btn-back-to-list");

      addContactButton?.addEventListener("click", () => {
         form.resetMode();
         view.closeDetailMenu();
      });

      contactsList?.addEventListener("click", handleContactClick);
      contactForm?.addEventListener("submit", form.handleSubmit);
      secondaryButton?.addEventListener("click", form.handleSecondaryAction);
      editButton?.addEventListener("click", form.handleEdit);
      deleteButton?.addEventListener("click", form.deleteSelected);

      detailMenuButton?.addEventListener("click", (event) => {
         event.stopPropagation();
         view.toggleDetailMenu();
      });

      detailMenuEdit?.addEventListener("click", () => {
         view.closeDetailMenu();
         editButton?.click();
      });

      detailMenuDelete?.addEventListener("click", () => {
         view.closeDetailMenu();
         deleteButton?.click();
      });

      document.addEventListener("click", (event) => {
         const menu = document.getElementById("contact-detail-menu");
         const isClickInsideMenu = event.target.closest("#contact-detail-menu");
         const isClickOnMenuButton = event.target.closest(
            "#btn-contact-detail-menu"
         );
         if (
            menu &&
            !menu.classList.contains("d-none") &&
            !isClickInsideMenu &&
            !isClickOnMenuButton
         ) {
            view.closeDetailMenu();
         }
      });

      backButton?.addEventListener("click", handleBackToList);
      window.addEventListener("resize", view.switchView);
   }

   ContactsFeature.entry = {
      initContactsPage,
      bindEvents,
      handleContactClick,
      handleBackToList,
   };

   window.ContactsFeature = ContactsFeature;

   if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", initContactsPage);
   } else {
      initContactsPage();
   }
})();
