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

   function getContactsBaseUrl() {
      return (
         (window.JOIN_CONFIG && window.JOIN_CONFIG.BASE_URL) ||
         DEFAULT_CONTACTS_BASE_URL
      );
   }

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

   async function findContactKeyById(contactId) {
      const targetId = String(contactId);
      const match = state.contacts.find(
         (contact) => String(contact.id) === targetId
      );
      return match?._firebaseKey || null;
   }

   async function updateContact(contactId, contactData, contactKeyOverride = null) {
      const contactKey = contactKeyOverride || (await findContactKeyById(contactId));
      if (!contactKey) {
         throw new Error(`Contact key not found for id ${contactId}`);
      }
      const response = await fetch(
         `${getContactsBaseUrl()}contacts/${contactKey}.json`,
         {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contactData),
         }
      );
      if (!response.ok) {
         throw new Error(`Contact update failed: HTTP ${response.status}`);
      }
   }

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
