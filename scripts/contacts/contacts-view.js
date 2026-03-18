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
   const responsiveView = ContactsFeature.responsiveView || {};

   /**
    * Formats a phone number for display.
    *
    * @param {*} number - The raw phone number.
    * @returns {string} The formatted phone number.
    */
   function formatPhoneNumber(number) {
      const cleaned = normalizePhoneNumber(number);
      if (!cleaned) return "";
      if (!cleaned.startsWith("+49")) return cleaned;
      return formatGermanPhone(cleaned.slice(3));
   }

   /**
    * Normalizes a raw phone number string.
    *
    * @param {*} number - The raw phone number.
    * @returns {string} The normalized phone number.
    */
   function normalizePhoneNumber(number) {
      let cleaned = String(number || "").replace(/[\s\-().]/g, "");
      if (cleaned.startsWith("00")) cleaned = `+${cleaned.slice(2)}`;
      if (cleaned.startsWith("0") && !cleaned.startsWith("+")) cleaned = `+49${cleaned.slice(1)}`;
      return cleaned;
   }

   /**
    * Formats a German local phone number.
    *
    * @param {string} local - The local phone number part.
    * @returns {string} The formatted phone number.
    */
   function formatGermanPhone(local) {
      if (isGermanMobile(local)) return `+49 ${local.slice(0, 4)} ${local.slice(4)}`;
      if (isGermanAreaCode(local)) return `+49 ${local.slice(0, 2)} ${local.slice(2)}`;
      return `+49 ${local}`;
   }

   /**
    * Checks whether a number looks like a German mobile number.
    *
    * @param {string} local - The local phone number part.
    * @returns {boolean} Whether the number is mobile.
    */
   function isGermanMobile(local) {
      return /^1[567]/.test(local) && local.length > 4;
   }

   /**
    * Checks whether a number has a German area code.
    *
    * @param {string} local - The local phone number part.
    * @returns {boolean} Whether the number has an area code.
    */
   function isGermanAreaCode(local) {
      return /^[2-9][0-9]/.test(local) && local.length > 2;
   }

   /**
    * Builds initials from a contact name.
    *
    * @param {string} name - The full contact name.
    * @returns {string} The initials.
    */
   function getInitials(name) {
      const parts = getNameParts(name);
      if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      return parts[0] ? parts[0].substring(0, 2).toUpperCase() : "??";
   }

   /**
    * Splits a name into usable parts.
    *
    * @param {string} name - The full contact name.
    * @returns {Array<string>} The name parts.
    */
   function getNameParts(name) {
      return String(name || "").trim().split(/\s+/).filter(Boolean);
   }

   /**
    * Groups contacts by their first letter.
    *
    * @param {Array<object>} contacts - The contacts list.
    * @returns {object} The grouped contacts.
    */
   function groupContacts(contacts) {
      return contacts.reduce(addContactToGroup, {});
   }

   /**
    * Adds a contact to its letter group.
    *
    * @param {object} groups - The grouped contacts.
    * @param {object} contact - The contact to group.
    * @returns {object} The updated groups.
    */
   function addContactToGroup(groups, contact) {
      const letter = getContactLetter(contact);
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(contact);
      return groups;
   }

   /**
    * Returns the group letter for a contact.
    *
    * @param {object} contact - The contact.
    * @returns {string} The group letter.
    */
   function getContactLetter(contact) {
      return (contact.name || "?").charAt(0).toUpperCase();
   }

   /**
    * Renders the contacts list.
    * @returns {void} Nothing.
    */
   function renderContacts() {
      const listContainer = document.getElementById("contacts-list-content");
      if (!listContainer) return;
      listContainer.innerHTML = buildContactsMarkup(getSortedContacts());
   }

   /**
    * Returns the contacts sorted by name.
    * @returns {Array<object>} The sorted contacts.
    */
   function getSortedContacts() {
      return [...state.contacts].sort(compareContactsByName);
   }

   /**
    * Compares two contacts by name.
    *
    * @param {object} a - The first contact.
    * @param {object} b - The second contact.
    * @returns {number} The compare result.
    */
   function compareContactsByName(a, b) {
      return (a.name || "").localeCompare(b.name || "");
   }

   /**
    * Builds the full contacts list markup.
    *
    * @param {Array<object>} contacts - The contacts list.
    * @returns {string} The contacts markup.
    */
   function buildContactsMarkup(contacts) {
      return Object.entries(groupContacts(contacts)).map(buildGroupMarkup).join("");
   }

   /**
    * Builds the markup for one contact group.
    *
    * @param {Array<*>} entry - The group entry.
    * @returns {string} The group markup.
    */
   function buildGroupMarkup(entry) {
      const [letter, contacts] = entry;
      return contactGroupSectionHTML(letter, contacts.map(buildContactMarkup).join(""));
   }

   /**
    * Builds the markup for one contact row.
    *
    * @param {object} contact - The contact.
    * @returns {string} The contact markup.
    */
   function buildContactMarkup(contact) {
      return contactListItemHTML(contact, getInitials(contact.name), getActiveClass(contact.id));
   }

   /**
    * Returns the active class for a contact row.
    *
    * @param {string|number} contactId - The contact ID.
    * @returns {string} The active class name.
    */
   function getActiveClass(contactId) {
      return String(contactId) === String(state.selectedContactId) ? "active" : "";
   }

   /**
    * Shows the detail view for a contact.
    *
    * @param {object} contact - The selected contact.
    * @returns {void} Nothing.
    */
   function showDetail(contact) {
      const elements = getDetailElements();
      if (!contact || !elements.view) return;
      elements.view.classList.remove("d-none");
      fillDetailElements(elements, contact);
   }

   /**
    * Collects the detail view elements.
    * @returns {object} The detail view elements.
    */
   function getDetailElements() {
      return {
         view: document.getElementById("detail-view"),
         initials: document.getElementById("detail-initials"),
         name: document.getElementById("detail-name"),
         email: document.getElementById("detail-email"),
         phone: document.getElementById("detail-phone"),
      };
   }

   /**
    * Fills the detail view with contact data.
    *
    * @param {object} elements - The detail elements.
    * @param {object} contact - The selected contact.
    * @returns {void} Nothing.
    */
   function fillDetailElements(elements, contact) {
      setDetailInitials(elements.initials, contact);
      setDetailText(elements.name, contact.name);
      setDetailEmail(elements.email, contact.email);
      setDetailText(elements.phone, formatPhoneNumber(contact.phone));
   }

   /**
    * Updates the detail initials badge.
    *
    * @param {HTMLElement|null} element - The initials element.
    * @param {object} contact - The selected contact.
    * @returns {void} Nothing.
    */
   function setDetailInitials(element, contact) {
      if (!element) return;
      element.innerText = getInitials(contact.name);
      element.style.backgroundColor = contact.color;
   }

   /**
    * Sets text on a detail element.
    *
    * @param {HTMLElement|null} element - The target element.
    * @param {string} value - The text value.
    * @returns {void} Nothing.
    */
   function setDetailText(element, value) {
      if (element) element.innerText = value;
   }

   /**
    * Sets the detail email link.
    *
    * @param {HTMLAnchorElement|null} element - The email link element.
    * @param {string} email - The email address.
    * @returns {void} Nothing.
    */
   function setDetailEmail(element, email) {
      if (!element) return;
      element.innerText = email;
      element.href = `mailto:${email}`;
   }

   /**
    * Closes the mobile detail menu.
    * @returns {void} Nothing.
    */
   function closeDetailMenu() {
      if (typeof responsiveView.closeDetailMenu === "function") responsiveView.closeDetailMenu();
   }

   /**
    * Toggles the mobile detail menu.
    * @returns {void} Nothing.
    */
   function toggleDetailMenu() {
      if (typeof responsiveView.toggleDetailMenu === "function") responsiveView.toggleDetailMenu();
   }

   /**
    * Switches the view for desktop or mobile.
    * @returns {void} Nothing.
    */
   function switchView() {
      if (typeof responsiveView.switchView === "function") responsiveView.switchView();
   }

   /**
    * Creates a toast element.
    *
    * @param {string} message - The toast message.
    * @param {string} type - The toast type.
    * @returns {HTMLDivElement} The toast element.
    */
   function createToastMessage(message, type) {
      const messageDiv = document.createElement("div");
      messageDiv.className = "contact-success-message";
      if (type === "error") messageDiv.classList.add("contact-success-message--error");
      messageDiv.textContent = message;
      return messageDiv;
   }

   /**
    * Shows a short toast message.
    *
    * @param {string} message - The toast message.
    * @param {string} [type="success"] - The toast type.
    * @returns {void} Nothing.
    */
   function showToast(message, type = "success") {
      removeToasts();
      const toast = createToastMessage(message, type);
      document.body.appendChild(toast);
      requestAnimationFrame(() => showToastElement(toast));
      setTimeout(() => toast.remove(), 1200);
   }

   /**
    * Removes all contact toast messages.
    * @returns {void} Nothing.
    */
   function removeToasts() {
      document.querySelectorAll(".contact-success-message").forEach(removeElement);
   }

   /**
    * Removes one DOM element.
    *
    * @param {Element} element - The element to remove.
    * @returns {void} Nothing.
    */
   function removeElement(element) {
      element.remove();
   }

   /**
    * Makes a toast visible.
    *
    * @param {HTMLElement} toast - The toast element.
    * @returns {void} Nothing.
    */
   function showToastElement(toast) {
      toast.classList.add("contact-success-message--visible");
   }

   ContactsFeature.view = {
      formatPhoneNumber,
      getInitials,
      groupContacts,
      renderContacts,
      showDetail,
      switchView,
      closeDetailMenu,
      toggleDetailMenu,
      showToast,
   };

   window.ContactsFeature = ContactsFeature;
}
