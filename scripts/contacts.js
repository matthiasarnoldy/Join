let selectedContactId = null;
let editingContactId = null;
let contactsState = [];

const CONTACTS_BASE_URL =
   "https://join-4bce1-default-rtdb.europe-west1.firebasedatabase.app/";

function normalizeContact(contact, firebaseKey) {
   if (!contact || typeof contact !== "object") return null;
   const resolvedId = contact.id ?? firebaseKey;
   return {
      ...contact,
      id: resolvedId,
      _firebaseKey: firebaseKey,
   };
}

function normalizeFirebaseContacts(data) {
   if (!data) return [];
   const entries = Array.isArray(data)
      ? data.map((contact, index) => [String(index), contact])
      : Object.entries(data);
   return entries
      .map(([key, contact]) => normalizeContact(contact, key))
      .filter(Boolean);
}

async function loadContactsFromFirebase() {
   try {
      const response = await fetch(`${CONTACTS_BASE_URL}contacts.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      contactsState = normalizeFirebaseContacts(data);
   } catch (error) {
      console.error("Contact loading failed:", error);
      contactsState = [];
   }
}

async function addContactToFirebase(contact) {
   const response = await fetch(`${CONTACTS_BASE_URL}contacts.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact),
   });
   if (!response.ok) {
      throw new Error(`Contact save failed: HTTP ${response.status}`);
   }
}

async function findContactKeyById(contactId) {
   const targetId = String(contactId);
   const match = contactsState.find((contact) => String(contact.id) === targetId);
   return match?._firebaseKey || null;
}

async function deleteContactFromFirebase(contactId) {
   const contactKey = await findContactKeyById(contactId);
   if (!contactKey) throw new Error(`Contact key not found for id ${contactId}`);
   const response = await fetch(
      `${CONTACTS_BASE_URL}contacts/${contactKey}.json`,
      {
         method: "DELETE",
      },
   );
   if (!response.ok) {
      throw new Error(`Contact delete failed: HTTP ${response.status}`);
   }
}

async function updateContactInFirebase(contactId, contactData) {
   const contactKey = await findContactKeyById(contactId);
   if (!contactKey) throw new Error(`Contact key not found for id ${contactId}`);
   const response = await fetch(
      `${CONTACTS_BASE_URL}contacts/${contactKey}.json`,
      {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(contactData),
      },
   );
   if (!response.ok) {
      throw new Error(`Contact update failed: HTTP ${response.status}`);
   }
}

function showContactToast(message, type = "success") {
   if (typeof window.showAppToast === "function") {
      window.showAppToast(message, { type, duration: 1200 });
      return;
   }
}

async function initContactsPage() {
   await loadContactsFromFirebase();
   renderContacts();
   bindEvents();
   switchView();
}

function renderContacts() {
   const listContainer = document.getElementById("contacts-list-content");
   if (!listContainer) return;

   const sorted = [...contactsState].sort((a, b) =>
      (a.name || "").localeCompare(b.name || ""),
   );
   const grouped = groupContacts(sorted);

   let html = "";
   for (const letter in grouped) {
      html += `<div class="group-header">${letter}</div><hr>`;
      grouped[letter].forEach((c) => {
         const activeClass =
            String(c.id) === String(selectedContactId) ? "active" : "";
         html += `
        <div class="contact-item ${activeClass}" data-id="${c.id}">
          <div class="initials" style="background:${c.color}">${getInitials(
            c.name,
         )}</div>
          <div class="contact-info">
            <span class="name">${c.name}</span>
            <span class="email">${c.email}</span>
          </div>
        </div>`;
      });
   }
   listContainer.innerHTML = html;
}

function groupContacts(contacts) {
   return contacts.reduce((groups, contact) => {
      const letter = (contact.name || "?").charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(contact);
      return groups;
   }, {});
}

function getInitials(name) {
   const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
   if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
   }
   return parts[0] ? parts[0].substring(0, 2).toUpperCase() : "??";
}

function handleContactClick(e) {
   const item = e.target.closest(".contact-item");
   if (!item) return;

   const clickedContactId = item.dataset.id;
   if (String(selectedContactId) === String(clickedContactId)) {
      selectedContactId = null;
      closeContactDetailMenu();
      document.getElementById("detail-view").classList.add("d-none");
      renderContacts();
      switchView();
      return;
   }

   selectedContactId = clickedContactId;
   const contact = contactsState.find(
      (c) => String(c.id) === String(selectedContactId),
   );
   if (!contact) return;

   renderContacts(); // Für Active Highlight
   showDetail(contact);
   switchView();
}

function switchView() {
   const listView = document.querySelector(".contacts-list");
   const detailContainer = document.querySelector(".contacts-detail");
   const detailView = document.getElementById("detail-view");
   const detailEmpty = document.getElementById("detail-empty");
   const backButton = document.getElementById("btn-back-to-list");
   const detailMenuButton = document.getElementById("btn-contact-detail-menu");

   if (!listView || !detailContainer || !detailView) return;

   const isMobile = window.matchMedia("(max-width: 820px)").matches;
   const hasSelection = selectedContactId !== null;

   if (detailEmpty) {
      detailEmpty.classList.remove("d-none");
   }

   if (!isMobile) {
      listView.classList.remove("d-none");
      detailContainer.style.display = "";
      if (backButton) backButton.classList.add("d-none");
      if (detailMenuButton) detailMenuButton.hidden = true;
      closeContactDetailMenu();
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
   closeContactDetailMenu();
}

function handleBackToList() {
   selectedContactId = null;
   closeContactDetailMenu();
   document.getElementById("detail-view").classList.add("d-none");
   renderContacts();
   switchView();
}

function showDetail(contact) {
   if (!contact) return;
   const view = document.getElementById("detail-view");
   view.classList.remove("d-none");

   document.getElementById("detail-initials").innerText = getInitials(
      contact.name,
   );
   document.getElementById("detail-initials").style.backgroundColor =
      contact.color;
   document.getElementById("detail-name").innerText = contact.name;
   document.getElementById("detail-email").innerText = contact.email;
   document.getElementById("detail-email").href = `mailto:${contact.email}`;
   document.getElementById("detail-phone").innerText = contact.phone;
}

function setContactFormMode(isEditMode) {
   const title = document.getElementById("contact-form-title");
   const submitButton = document.getElementById("contact-form-submit");
   if (title) title.innerText = isEditMode ? "Edit Contact" : "Add Contact";
   if (submitButton) {
      submitButton.innerText = isEditMode ? "Save contact" : "Create contact";
   }
}

function resetContactFormMode() {
   editingContactId = null;
   setContactFormMode(false);
}

function handleEditContact() {
   if (!selectedContactId) return;
   const contact = contactsState.find(
      (c) => String(c.id) === String(selectedContactId),
   );
   if (!contact) return;

   editingContactId = contact.id;
   setContactFormMode(true);

   document.getElementById("add-name").value = contact.name || "";
   document.getElementById("add-email").value = contact.email || "";
   document.getElementById("add-phone").value = contact.phone || "";
   document.getElementById("contactFormError").innerText = "";

   if (typeof window.openOverlay === "function") {
      window.openOverlay();
   }
}

function closeContactDetailMenu() {
   const menu = document.getElementById("contact-detail-menu");
   if (menu) menu.classList.add("d-none");
}

function toggleContactDetailMenu() {
   const menu = document.getElementById("contact-detail-menu");
   if (!menu) return;
   menu.classList.toggle("d-none");
}

async function handleCreateContact(e) {
   e.preventDefault();
   const name = document.getElementById("add-name").value;
   const email = document.getElementById("add-email").value;
   const phone = document.getElementById("add-phone").value;
   const errorMsg = document.getElementById("contactFormError");

   if (!name || !email.includes("@") || !email.includes(".") || !phone) {
      errorMsg.innerText = "Bitte gültige Daten eingeben.";
      return;
   }

   try {
      if (editingContactId !== null) {
         const selectedContact = contactsState.find(
            (c) => String(c.id) === String(editingContactId),
         );
         await updateContactInFirebase(editingContactId, {
            name,
            email,
            phone,
            color:
               selectedContact?.color ||
               "#" + Math.floor(Math.random() * 16777215).toString(16),
         });
      } else {
         const newContact = {
            id: Date.now(),
            name,
            email,
            phone,
            color: "#" + Math.floor(Math.random() * 16777215).toString(16),
         };
         await addContactToFirebase(newContact);
      }

      const wasEdit = editingContactId !== null;
      await loadContactsFromFirebase();
      if (wasEdit) {
         selectedContactId = editingContactId;
      }
      resetContactFormMode();
      closeOverlay();
      renderContacts();
      const activeContact = contactsState.find(
         (c) => String(c.id) === String(selectedContactId),
      );
      if (activeContact) showDetail(activeContact);
      switchView();
      showContactToast(wasEdit ? "Contact updated" : "Contact successfully created");
   } catch (error) {
      console.error("Contact creation failed:", error);
      errorMsg.innerText = "Kontakt konnte nicht gespeichert werden.";
      showContactToast("Contact could not be saved", "error");
   }
}

async function deleteContact() {
   if (!selectedContactId) return;
   try {
      closeContactDetailMenu();
      await deleteContactFromFirebase(selectedContactId);
      await loadContactsFromFirebase();
      selectedContactId = null;
      document.getElementById("detail-view").classList.add("d-none");
      renderContacts();
      switchView();
      showContactToast("Contact deleted");
   } catch (error) {
      console.error("Contact deletion failed:", error);
      showContactToast("Contact could not be deleted", "error");
   }
}

function bindEvents() {
   const addContactButton = document.getElementById("btn-add-contact");
   const editButton = document.getElementById("btn-edit");
   const deleteButton = document.getElementById("btn-delete");
   const detailMenuButton = document.getElementById("btn-contact-detail-menu");
   const detailMenuEdit = document.getElementById("btn-contact-detail-edit");
   const detailMenuDelete = document.getElementById("btn-contact-detail-delete");

   if (typeof window.closeOverlay === "function") {
      const originalCloseOverlay = window.closeOverlay;
      window.closeOverlay = function patchedCloseOverlay() {
         resetContactFormMode();
         originalCloseOverlay();
      };
   }

   addContactButton?.addEventListener("click", () => {
      resetContactFormMode();
      closeContactDetailMenu();
   });

   document
      .getElementById("contacts-list-content")
      .addEventListener("click", handleContactClick);
   document
      .getElementById("contact-form")
      .addEventListener("submit", handleCreateContact);
   editButton?.addEventListener("click", handleEditContact);
   deleteButton?.addEventListener("click", deleteContact);

   detailMenuButton?.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleContactDetailMenu();
   });

   detailMenuEdit?.addEventListener("click", () => {
      closeContactDetailMenu();
      editButton?.click();
   });

   detailMenuDelete?.addEventListener("click", () => {
      closeContactDetailMenu();
      deleteButton?.click();
   });

   document.addEventListener("click", (event) => {
      const menu = document.getElementById("contact-detail-menu");
      const isClickInsideMenu = event.target.closest("#contact-detail-menu");
      const isClickOnMenuButton = event.target.closest("#btn-contact-detail-menu");
      if (menu && !menu.classList.contains("d-none") && !isClickInsideMenu && !isClickOnMenuButton) {
         closeContactDetailMenu();
      }
   });

   document
      .getElementById("btn-back-to-list")
      .addEventListener("click", handleBackToList);
   window.addEventListener("resize", switchView);
}

window.addEventListener("DOMContentLoaded", initContactsPage);
