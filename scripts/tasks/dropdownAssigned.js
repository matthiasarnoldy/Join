// ===== ASSIGNED SELECT =====

// ASSIGNED SELECT: Konstanten + konsolidierter DOM-Getter
const ASSIGNED_SELECTED_CLASS = "add-task__select-option--selected";
const ASSIGNED_OPEN_CLASS = "add-task__select--open";
const ASSIGNED_PLACEHOLDER_TEXT = "Select contacts to assign";
const ASSIGNED_ASSET_BASE_PATH = window.location.pathname.includes("/templates/")
   ? "../assets/"
   : "./assets/";
const ASSIGNED_CONTACTS_BASE_URL =
   window.JOIN_CONFIG.BASE_URL;

function assignedAssetPath(relativePath) {
   return `${ASSIGNED_ASSET_BASE_PATH}${relativePath}`;
}


function getInitialsFromName(name) {
   const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
   if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
   }
   if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
   return "??";
}


function normalizeAssignedContacts(data) {
   if (!data) return [];
   const entries = Array.isArray(data)
      ? data.map((contact, index) => [String(index), contact])
      : Object.entries(data);
   return entries
      .filter(([, contact]) => contact && typeof contact === "object")
      .map(([key, contact]) => {
         const resolvedId = contact.id ?? key;
         const resolvedName = String(contact.name || "").trim();
         return {
            id: resolvedId,
            name: resolvedName,
            initials: getInitialsFromName(resolvedName),
            color: String(contact.color || "").trim(),
         };
      })
      .filter((contact) => contact.name !== "")
      .sort((a, b) => a.name.localeCompare(b.name));
}


async function loadAssignedContactsFromFirebase() {
   const response = await fetch(`${ASSIGNED_CONTACTS_BASE_URL}contacts.json`);
   if (!response.ok) {
      throw new Error(`Assigned contacts load failed: HTTP ${response.status}`);
   }
   const data = await response.json();
   return normalizeAssignedContacts(data);
}


function createAssignedOptionElement(contact) {
   const option = document.createElement("li");
   option.className = "add-task__select-option add-task__select-option--assigned";
   option.dataset.value = `contact-${String(contact.id)}`;
   option.dataset.name = contact.name;
   option.dataset.color = contact.color || "#ff7a00";

   const content = document.createElement("div");
   content.className = "add-task__option-content";

   const initials = document.createElement("span");
   initials.className = "add-task__option-initials";
   initials.textContent = contact.initials;
   initials.style.backgroundColor = contact.color || "#ff7a00";

   content.append(initials, document.createTextNode(` ${contact.name}`));

   const checkbox = document.createElement("img");
   checkbox.src = assignedAssetPath("icons/desktop/checkBox.svg");
   checkbox.alt = "";
   checkbox.className = "add-task__option-checkbox";

   option.append(content, checkbox);
   return option;
}


function getAssignedElements() {
   const select = document.getElementById("addTaskAssigned");
   if (!select) return null;
   const menu = document.getElementById("addTaskAssignedMenu"), input = document.getElementById("addTaskAssignedInput"), label = select.querySelector(".add-task__select-value"), initials = document.getElementById("addTaskAssignedInitials"), selectionGroup = select.closest(".add-task__information-group--selection");
   if (!menu || !input || !label) return null;
   return { select, menu, input, label, initials, group: selectionGroup };
}


function isAssignedMenuOpen(elements) {
   return elements.select.classList.contains(ASSIGNED_OPEN_CLASS);
}


function getSearchInput(select) {
   return select.querySelector(".add-task__select-input");
}


function preventSearchDeletion(event, searchInput) {
   const cursorPosition = searchInput.selectionStart;
   if (event.key === "Backspace" && cursorPosition <= 4) {
      event.preventDefault();
   }
   if (event.key === "Delete" && cursorPosition < 4) {
      event.preventDefault();
   }
}


function ensureSearchPrefix(searchInput) {
   if (!searchInput.value.startsWith("To: ")) {
      const searchText = searchInput.value.replace(/^To: /, "");
      searchInput.value = "To: " + searchText;
      const cursorPos = 4 + searchText.length;
      searchInput.setSelectionRange(cursorPos, cursorPos);
   }
}


function getSearchText(searchInput) {
   return searchInput.value.substring(4).toLowerCase().trim();
}


function handleSearchKeydown(event, searchInput) {
   preventSearchDeletion(event, searchInput);
}


function handleSearchInput(event, searchInput, menu) {
   ensureSearchPrefix(searchInput);
   filterContactOptions(searchInput, menu);
}


function setupSearchListeners(searchInput, menu) {
   searchInput.addEventListener("keydown", (e) => {
      handleSearchKeydown(e, searchInput);
   });
   searchInput.addEventListener("input", (e) => {
      handleSearchInput(e, searchInput, menu);
   });
}


function getContainerWidth(container) {
   return container.offsetWidth;
}


function calculateMaxInitials(containerWidth) {
   const initialWidth = 50; // 42px + 8px gap
   const totalSlots = Math.floor(containerWidth / initialWidth);
   return totalSlots;
}


function shouldShowOverflow(selectedCount, maxSlots) {
   return selectedCount > maxSlots;
}


function getMaxDisplayCount(selectedCount, maxSlots) {
   if (shouldShowOverflow(selectedCount, maxSlots)) {
      return maxSlots - 1;
   }
   return maxSlots;
}


function getSelectedOptions(menu) {
   return menu.querySelectorAll(`.${ASSIGNED_SELECTED_CLASS}`);
}


function createInitialElementFromOption(option, elements) {
   const initialsText = option.querySelector(".add-task__option-initials")?.textContent;
   if (!initialsText) return null;
   const avatarColor = option.dataset.color || "#ff7a00";
   const temp = document.createElement("div");
   temp.innerHTML = createInitialHTML(initialsText, avatarColor);
   const initialElement = temp.firstElementChild;
   if (!initialElement) return null;
   initialElement.addEventListener("click", () => {
      removeContactSelection(option);
      updateContactInitials(elements);
   });
   return initialElement;
}


function getSelectWrapper(select) {
   return select?.closest(".add-task__select-wrapper");
}


function getFooter() {
   return document.querySelector(".add-task__footer");
}


function hasSelectedContacts(selectedOptions) {
   return selectedOptions.length > 0;
}


function getInitialsParameters(elements) {
   if (!elements.initials) return null;
   const selectedOptions = getSelectedOptions(elements.menu);
   const menuOpen = isAssignedMenuOpen(elements);
   clearInitialsContainer(elements.initials);
   const containerWidth = getContainerWidth(elements.initials);
   const maxSlots = calculateMaxInitials(containerWidth);
   const maxDisplay = getMaxDisplayCount(selectedOptions.length, maxSlots);
   return { selectedOptions, menuOpen, maxDisplay };
}


function setupSelectClickListener(elements) {
   elements.select.addEventListener("click", (event) => {
      event.stopPropagation();
      const clickedInput = event.target.closest(".add-task__select-input");
      if (!clickedInput) toggleAssignedMenu(elements);
   });
}


function setupMenuClickListener(elements) {
   elements.menu.addEventListener("click", (event) => {
      handleAssignedOptionClick(event, elements);
   });
}


function setupSearchInputListenersForAssigned(elements) {
   const searchInput = getSearchInput(elements.select);
   if (!searchInput) return;
   searchInput.addEventListener("click", (e) => e.stopPropagation());
   searchInput.addEventListener("mousedown", (e) => e.stopPropagation());
   searchInput.addEventListener("focus", () => {
      if (!isAssignedMenuOpen(elements)) toggleAssignedMenu(elements);
   });
}


function setupDocumentCloseListener(elements) {
   document.addEventListener("click", (event) => {
      const clickedInput = event.target.closest(".add-task__select-input");
      if (clickedInput) return;
      closeAssignedMenu(elements);
   });
}


function setupAssignedListeners(elements) {
   if (!elements) return;
   setupSelectClickListener(elements);
   setupMenuClickListener(elements);
   setupSearchInputListenersForAssigned(elements);
   setupDocumentCloseListener(elements);
}


async function initAssignedSelect() {
   const elements = getAssignedElements();
   if (!elements) return;
   try {
      const contacts = await loadAssignedContactsFromFirebase();
      renderAssignedContacts(elements.menu, contacts);
   } catch (error) {
      console.error("Assigned contacts loading failed:", error);
      elements.menu.innerHTML = "";
   }
   elements.select.setAttribute("aria-expanded", "false");
   elements.label.dataset.placeholder = elements.label.textContent;
   if (elements.input.value) {
      elements.input.dataset.lastValue = elements.input.value;
      elements.label.dataset.lastLabel = elements.label.textContent;
   }
   setupAssignedListeners(elements);
}
