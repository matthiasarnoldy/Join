(function initContactsDataNamespace() {
   const DEFAULT_CONTACTS_BASE_URL =
      "https://join-4bce1-default-rtdb.europe-west1.firebasedatabase.app/";

   const ContactsFeature = window.ContactsFeature || {};
   ContactsFeature.state = ContactsFeature.state || {
      selectedContactId: null,
      editingContactId: null,
      editingContactKey: null,
      contacts: [],
   };

   const state = ContactsFeature.state;

   /**
    * Returns the contacts base URL.
    * @returns {string} The contacts base URL.
    */
   function getContactsBaseUrl() {
      return (
         (window.JOIN_CONFIG && window.JOIN_CONFIG.BASE_URL) ||
         DEFAULT_CONTACTS_BASE_URL
      );
   }

   /**
    * Normalizes the contact.
    *
    * @param {object} contact - The contact object.
    * @param {string} firebaseKey - The Firebase key.
    * @returns {object|null} The contact object, or null when it is not available.
    */
   function normalizeContact(contact, firebaseKey) {
      if (!contact || typeof contact !== "object") return null;
      const resolvedId = contact.id ?? firebaseKey;
      return {
         ...contact,
         id: resolvedId,
         _firebaseKey: firebaseKey,
      };
   }

   /**
    * Normalizes the Firebase contacts.
    *
    * @param {object} data - The data object.
    * @returns {Array<object>} The Firebase contacts list.
    */
   function normalizeFirebaseContacts(data) {
      if (!data) return [];
      const entries = Array.isArray(data)
         ? data.map((contact, index) => [String(index), contact])
         : Object.entries(data);
      return entries
         .map(([key, contact]) => normalizeContact(contact, key))
         .filter(Boolean);
   }

   /**
    * Loads the contacts.
    * @returns {Promise<Array<object>>} A promise that resolves to the contacts list.
    */
   async function loadContacts() {
      try {
         const response = await fetch(`${getContactsBaseUrl()}contacts.json`);
         if (!response.ok) throw new Error(`HTTP ${response.status}`);
         const data = await response.json();
         state.contacts = normalizeFirebaseContacts(data);
      } catch (error) {
         console.error("Contact loading failed:", error);
         state.contacts = [];
      }
      return state.contacts;
   }

   /**
    * Adds the contact.
    *
    * @param {object} contact - The contact object.
    * @returns {Promise<void>} A promise that resolves when the operation is complete.
    */
   async function addContact(contact) {
      const response = await fetch(`${getContactsBaseUrl()}contacts.json`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(contact),
      });
      if (!response.ok) {
         throw new Error(`Contact save failed: HTTP ${response.status}`);
      }
   }

   /**
    * Finds the contact key by ID.
    *
    * @param {string|number} contactId - The contact ID used for this operation.
    * @returns {Promise<string|null>} A promise that resolves to the contact key by ID, or null when it is not available.
    */
   async function findContactKeyById(contactId) {
      const targetId = String(contactId);
      const match = state.contacts.find(
         (contact) => String(contact.id) === targetId
      );
      return match?._firebaseKey || null;
   }

   /**
    * Updates the contact.
    *
    * @param {string|number} contactId - The contact ID used for this operation.
    * @param {object} contactData - The contact data object.
    * @param {string|null} [contactKeyOverride=null] - The contact key override. Defaults to null.
    * @returns {Promise<void>} A promise that resolves when the operation is complete.
    */
   async function updateContact(contactId, contactData, contactKeyOverride = null) {
      const contactKey =
         (await findContactKeyById(contactId)) || contactKeyOverride;
      if (!contactKey) {
         throw new Error(`Contact key not found for id ${contactId}`);
      }

      const payload = {
         ...contactData,
         id: contactData.id ?? contactId,
      };

      const response = await fetch(
         `${getContactsBaseUrl()}contacts/${contactKey}.json`,
         {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
         }
      );
      if (!response.ok) {
         throw new Error(`Contact update failed: HTTP ${response.status}`);
      }
   }

   /**
    * Deletes the contact.
    *
    * @param {string|number} contactId - The contact ID used for this operation.
    * @returns {Promise<void>} A promise that resolves when the operation is complete.
    */
   async function deleteContact(contactId) {
      const contactKey = await findContactKeyById(contactId);
      if (!contactKey) {
         throw new Error(`Contact key not found for id ${contactId}`);
      }
      const response = await fetch(
         `${getContactsBaseUrl()}contacts/${contactKey}.json`,
         {
            method: "DELETE",
         }
      );
      if (!response.ok) {
         throw new Error(`Contact delete failed: HTTP ${response.status}`);
      }
   }

   ContactsFeature.data = {
      normalizeContact,
      normalizeFirebaseContacts,
      loadContacts,
      addContact,
      updateContact,
      deleteContact,
      findContactKeyById,
   };

   window.ContactsFeature = ContactsFeature;
})();
