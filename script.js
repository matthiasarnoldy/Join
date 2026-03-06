// Navigation and header interactions shared across pages.

const ACTIVE_CLASS = "navBar__quicklink--active";
const NAV_ITEM_SELECTOR = ".navBar__quicklink, .legalInformation";
const UI_IDS = {
   navSummary: "nav-summary",
   navAddTask: "nav-add-task",
   navBoard: "nav-board",
   navContacts: "nav-contacts",
   navPrivacyPolicy: "nav-Privacy-Policy",
   navLegalNotice: "nav-Legal-Notice",
   help: "help",
   loginInitials: "login__initials",
   dropdownHelp: "dropdownHelp",
   dropdownPrivacyPolicy: "dropdownPrivacyPolicy",
   dropdownLegalNotice: "dropdownLegalNotice",
   arrowBack: "help__arrowBack",
};
const NAV_LINKS = [
   ["navSummary", "./summary.html", "navSummary"],
   ["navAddTask", "./add-task.html", "navAddTask"],
   ["navBoard", "./board.html", "navBoard"],
   ["navContacts", "./contacts.html", "navContacts"],
   ["navPrivacyPolicy", "./privacy-Policy.html", "navPrivacyPolicy"],
   ["navLegalNotice", "./legalnotice.html", "navLegalNotice"],
   ["help", "./help.html", null],
   ["dropdownHelp", "./help.html", null],
   ["dropdownPrivacyPolicy", "./privacy-Policy.html", "navPrivacyPolicy"],
   ["dropdownLegalNotice", "./legalnotice.html", "navLegalNotice"],
];

/**
 * Returns all navigation elements that can carry the active class.
 *
 * @returns {NodeListOf<Element>}
 */
function getNavItems() {
   return document.querySelectorAll(NAV_ITEM_SELECTOR);
}

/**
 * Removes the active navigation class from all quick links and applies it to
 * the given navigation element.
 *
 * @param {Element|null} clickedItem - The navigation element that should be marked as active.
 * @returns {void}
 */
function setActiveNav(clickedItem) {
   clearActiveNav();
   if (clickedItem) clickedItem.classList.add(ACTIVE_CLASS);
}

/**
 * Clears the active navigation state from all quick links and legal links.
 *
 * @returns {void}
 */
function clearActiveNav() {
   getNavItems().forEach((item) => item.classList.remove(ACTIVE_CLASS));
}

/**
 * Reads all configured UI elements from the DOM and returns them by key.
 *
 * @returns {Record<string, HTMLElement|null>}
 */
function getUiElements() {
   return Object.fromEntries(
      Object.entries(UI_IDS).map(([key, id]) => [key, document.getElementById(id)])
   );
}

/**
 * Adds a click listener only when the given element exists.
 *
 * @param {HTMLElement|null} element - Target element for the click listener.
 * @param {(event: MouseEvent) => void} handler - Click callback function.
 * @returns {void}
 */
function bindClick(element, handler) {
   if (!element) return;
   element.addEventListener("click", handler);
}

/**
 * Applies active-state behavior and redirects to a page for one link element.
 *
 * @param {HTMLElement|null} element - Link element to bind.
 * @param {string} targetPath - Relative page path to navigate to.
 * @param {Element|null} activeItem - Element to mark as active, or null to clear active state.
 * @returns {void}
 */
function bindNavLink(element, targetPath, activeItem) {
   bindClick(element, () => {
      if (activeItem) setActiveNav(activeItem);
      else clearActiveNav();
      location.href = targetPath;
   });
}

/**
 * Binds all configured navigation links from the mapping table.
 *
 * @param {Record<string, HTMLElement|null>} ui - Lookup object containing page elements.
 * @returns {void}
 */
function bindNavigation(ui) {
   NAV_LINKS.forEach(([elementKey, path, activeKey]) =>
      bindNavLink(ui[elementKey], path, activeKey ? ui[activeKey] : null)
   );
}

/**
 * Toggles the user dropdown state when initials in the header are clicked.
 *
 * @param {HTMLElement|null} loginInitials - Header element with user initials.
 * @returns {void}
 */
function bindLoginToggle(loginInitials) {
   bindClick(loginInitials, () => {
      const dropdownMenu = document.getElementById("dropdownMenu");
      if (!dropdownMenu || !loginInitials) return;
      dropdownMenu.classList.toggle("header__dropdown--opened");
      loginInitials.classList.toggle("login__initials--opened");
   });
}

/**
 * Closes the user dropdown when clicking outside of menu and initials.
 *
 * @param {MouseEvent} event - Native click event from the window listener.
 * @param {HTMLElement|null} loginInitials - Header element with user initials.
 * @returns {void}
 */
function closeDropdownOnOutsideClick(event, loginInitials) {
   const dropdownMenu = document.getElementById("dropdownMenu");
   if (!dropdownMenu || !loginInitials) return;
   if (!dropdownMenu.contains(event.target) && event.target !== loginInitials) {
      dropdownMenu.classList.remove("header__dropdown--opened");
      loginInitials.classList.remove("login__initials--opened");
   }
}

/**
 * Attaches window click logic that closes the dropdown for outside clicks.
 *
 * @param {HTMLElement|null} loginInitials - Header element with user initials.
 * @returns {void}
 */
function bindWindowDropdownClose(loginInitials) {
   window.addEventListener("click", (event) =>
      closeDropdownOnOutsideClick(event, loginInitials)
   );
}

/**
 * Binds back-navigation behavior to the help arrow.
 *
 * @param {HTMLElement|null} arrowBack - Back-arrow element used on help pages.
 * @returns {void}
 */
function bindBackArrow(arrowBack) {
   bindClick(arrowBack, () => window.history.back());
}

/**
 * Redirects to the board when clicking any summary card in the document.
 *
 * @returns {void}
 */
function bindSummaryCardRedirect() {
   document.addEventListener("click", (event) => {
      if (event.target.closest(".summary__card")) location.href = "./board.html";
   });
}

/**
 * Initializes global UI behavior such as navigation clicks, dropdown handling,
 * back navigation, and summary-card redirect logic.
 *
 * @returns {void}
 */
function initGlobalUi() {
   const ui = getUiElements();
   bindNavigation(ui);
   bindLoginToggle(ui.loginInitials);
   bindWindowDropdownClose(ui.loginInitials);
   bindBackArrow(ui.arrowBack);
   bindSummaryCardRedirect();
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initGlobalUi);
} else {
   initGlobalUi();
}
