(function initContactsViewNamespace() {
   const ContactsFeature = window.ContactsFeature || {};
   ContactsFeature.state = ContactsFeature.state || {
      selectedContactId: null,
      editingContactId: null,
      editingContactKey: null,
      contacts: [],
   };

   const state = ContactsFeature.state;

   /**
    * Formats the phone number.
    *
    * @param {*} number - The number.
    * @returns {string} The phone number.
    */
   function formatPhoneNumber(number) {
      if (!number) return "";

      let cleaned = String(number).replace(/[\s\-().]/g, "");

      if (cleaned.startsWith("00")) {
         cleaned = `+${cleaned.slice(2)}`;
      }

      if (cleaned.startsWith("0") && !cleaned.startsWith("+")) {
         cleaned = `+49${cleaned.slice(1)}`;
      }

      if (cleaned.startsWith("+49")) {
         const local = cleaned.slice(3);

         if (/^1[567]/.test(local) && local.length > 4) {
            return `+49 ${local.slice(0, 4)} ${local.slice(4)}`;
         }

         if (/^[2-9][0-9]/.test(local) && local.length > 2) {
            return `+49 ${local.slice(0, 2)} ${local.slice(2)}`;
         }

         return `+49 ${local}`;
      }

      return cleaned;
   }

   /**
    * Returns the initials.
    *
    * @param {string} name - The name.
    * @returns {string} The initials.
    */
   function getInitials(name) {
      const parts = String(name || "")
         .trim()
         .split(/\s+/)
         .filter(Boolean);
      if (parts.length >= 2) {
         return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return parts[0] ? parts[0].substring(0, 2).toUpperCase() : "??";
   }

   /**
    * Groups the contacts.
    *
    * @param {Array<object>} contacts - The contacts list.
    * @returns {Array<object>} The contacts list.
    */
   function groupContacts(contacts) {
      return contacts.reduce((groups, contact) => {
         const letter = (contact.name || "?").charAt(0).toUpperCase();
         if (!groups[letter]) groups[letter] = [];
         groups[letter].push(contact);
         return groups;
      }, {});
   }

   /**
    * Renders the contacts.
    * @returns {void} Nothing.
    */
   function renderContacts() {
      const listContainer = document.getElementById("contacts-list-content");
      if (!listContainer) return;

      const sortedContacts = [...state.contacts].sort((a, b) =>
         (a.name || "").localeCompare(b.name || "")
      );
      const groupedContacts = groupContacts(sortedContacts);

      let html = "";
      Object.keys(groupedContacts).forEach((letter) => {
         html += `<div class="group-header">${letter}</div><hr>`;
         groupedContacts[letter].forEach((contact) => {
            const activeClass =
               String(contact.id) === String(state.selectedContactId)
                  ? "active"
                  : "";
            html += `
        <div class="contact-item ${activeClass}" data-id="${contact.id}">
          <div class="initials" style="background:${contact.color}">${getInitials(
             contact.name
          )}</div>
          <div class="contact-info">
            <span class="name">${contact.name}</span>
            <span class="email">${contact.email}</span>
          </div>
        </div>`;
         });
      });

      listContainer.innerHTML = html;
   }

   /**
    * Shows the detail.
    *
    * @param {object} contact - The contact object.
    * @returns {void} Nothing.
    */
   function showDetail(contact) {
      if (!contact) return;
      const view = document.getElementById("detail-view");
      if (!view) return;
      view.classList.remove("d-none");

      const detailInitials = document.getElementById("detail-initials");
      const detailName = document.getElementById("detail-name");
      const detailEmail = document.getElementById("detail-email");
      const detailPhone = document.getElementById("detail-phone");

      if (detailInitials) {
         detailInitials.innerText = getInitials(contact.name);
         detailInitials.style.backgroundColor = contact.color;
      }
      if (detailName) detailName.innerText = contact.name;
      if (detailEmail) {
         detailEmail.innerText = contact.email;
         detailEmail.href = `mailto:${contact.email}`;
      }
      if (detailPhone) {
         detailPhone.innerText = formatPhoneNumber(contact.phone);
      }
   }

   /**
    * Closes the detail menu.
    * @returns {void} Nothing.
    */
   function closeDetailMenu() {
      const menu = document.getElementById("contact-detail-menu");
      if (menu) menu.classList.add("d-none");
   }

   /**
    * Toggles the detail menu.
    * @returns {void} Nothing.
    */
   function toggleDetailMenu() {
      const menu = document.getElementById("contact-detail-menu");
      if (!menu) return;
      menu.classList.toggle("d-none");
   }

   /**
    * Switches the view.
    * @returns {void} Nothing.
    */
   function switchView() {
      const listView = document.querySelector(".contacts-list");
      const detailContainer = document.querySelector(".contacts-detail");
      const detailView = document.getElementById("detail-view");
      const detailEmpty = document.getElementById("detail-empty");
      const backButton = document.getElementById("btn-back-to-list");
      const detailMenuButton = document.getElementById("btn-contact-detail-menu");

      if (!listView || !detailContainer || !detailView) return;

      const isMobile = window.matchMedia("(max-width: 820px)").matches;
      const hasSelection = state.selectedContactId !== null;

      if (detailEmpty) {
         detailEmpty.classList.remove("d-none");
      }

      if (!isMobile) {
         listView.classList.remove("d-none");
         detailContainer.style.display = "";
         if (backButton) backButton.classList.add("d-none");
         if (detailMenuButton) detailMenuButton.hidden = true;
         closeDetailMenu();
         return;
      }

      if (hasSelection) {
         listView.classList.add("d-none");
         detailContainer.style.display = "block";
         detailView.classList.remove("d-none");
         if (backButton) backButton.classList.remove("d-none");
         if (detailMenuButton) detailMenuButton.hidden = false;
         return;
      }

      listView.classList.remove("d-none");
      detailContainer.style.display = "";
      detailView.classList.add("d-none");
      if (backButton) backButton.classList.add("d-none");
      if (detailMenuButton) detailMenuButton.hidden = true;
      closeDetailMenu();
   }

   /**
    * Creates the toast message.
    *
    * @param {string} message - The message.
    * @param {string} type - The type.
    * @returns {HTMLDivElement} The toast message element.
    */
   function createToastMessage(message, type) {
      const messageDiv = document.createElement("div");
      messageDiv.className = "contact-success-message";
      if (type === "error") {
         messageDiv.classList.add("contact-success-message--error");
      }
      messageDiv.textContent = message;
      return messageDiv;
   }

   /**
    * Shows the toast.
    *
    * @param {string} message - The message.
    * @param {string} [type="success"] - The type. Defaults to "success".
    * @returns {void} Nothing.
    */
   function showToast(message, type = "success") {
      const existingMessages = document.querySelectorAll(
         ".contact-success-message"
      );
      existingMessages.forEach((item) => item.remove());
      const toast = createToastMessage(message, type);
      document.body.appendChild(toast);
      requestAnimationFrame(() => {
         toast.classList.add("contact-success-message--visible");
      });
      setTimeout(() => {
         toast.remove();
      }, 1200);
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
})();
