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

   /**
    * Closes the mobile detail menu.
    * @returns {void} Nothing.
    */
   function closeDetailMenu() {
      const menu = getDetailMenu();
      if (menu) menu.classList.add("d-none");
   }

   /**
    * Toggles the mobile detail menu.
    * @returns {void} Nothing.
    */
   function toggleDetailMenu() {
      const menu = getDetailMenu();
      if (menu) menu.classList.toggle("d-none");
   }

   /**
    * Returns the detail menu element.
    * @returns {HTMLElement|null} The detail menu element.
    */
   function getDetailMenu() {
      return document.getElementById("contact-detail-menu");
   }

   /**
    * Switches the view for desktop or mobile.
    * @returns {void} Nothing.
    */
   function switchView() {
      const elements = getViewElements();
      if (!hasResponsiveElements(elements)) return;
      const viewState = getViewState();
      toggleEmptyState(elements.detailEmpty);
      viewState.isMobile ? applyMobileView(elements, viewState.hasSelection) : applyDesktopView(elements);
   }

   /**
    * Collects the responsive view elements.
    * @returns {object} The view elements.
    */
   function getViewElements() {
      return {
         listView: document.querySelector(".contacts-list"),
         detailContainer: document.querySelector(".contacts-detail"),
         detailView: document.getElementById("detail-view"),
         detailEmpty: document.getElementById("detail-empty"),
         backButton: document.getElementById("btn-back-to-list"),
         detailMenuButton: document.getElementById("btn-contact-detail-menu"),
      };
   }

   /**
    * Checks whether the responsive elements exist.
    *
    * @param {object} elements - The collected view elements.
    * @returns {boolean} Whether the view can be updated.
    */
   function hasResponsiveElements(elements) {
      return Boolean(elements.listView && elements.detailContainer && elements.detailView);
   }

   /**
    * Returns the current responsive view state.
    * @returns {object} The view state.
    */
   function getViewState() {
      return {
         isMobile: window.matchMedia("(max-width: 820px)").matches,
         hasSelection: state.selectedContactId !== null,
      };
   }

   /**
    * Shows the empty detail placeholder.
    *
    * @param {HTMLElement|null} detailEmpty - The empty detail element.
    * @returns {void} Nothing.
    */
   function toggleEmptyState(detailEmpty) {
      if (!detailEmpty) return;
      detailEmpty.classList.remove("d-none");
   }

   /**
    * Applies the desktop contact layout.
    *
    * @param {object} elements - The view elements.
    * @returns {void} Nothing.
    */
   function applyDesktopView(elements) {
      toggleListView(elements.listView, false);
      setDetailContainerDisplay(elements.detailContainer, "");
      toggleClass(elements.backButton, "d-none", true);
      toggleMenuButton(elements.detailMenuButton, true);
      closeDetailMenu();
   }

   /**
    * Applies the mobile contact layout.
    *
    * @param {object} elements - The view elements.
    * @param {boolean} hasSelection - Whether a contact is selected.
    * @returns {void} Nothing.
    */
   function applyMobileView(elements, hasSelection) {
      hasSelection ? showMobileDetail(elements) : showMobileList(elements);
   }

   /**
    * Shows the mobile detail panel.
    *
    * @param {object} elements - The view elements.
    * @returns {void} Nothing.
    */
   function showMobileDetail(elements) {
      toggleListView(elements.listView, true);
      setDetailContainerDisplay(elements.detailContainer, "block");
      toggleClass(elements.detailView, "d-none", false);
      toggleClass(elements.backButton, "d-none", false);
      toggleMenuButton(elements.detailMenuButton, false);
   }

   /**
    * Shows the mobile contacts list.
    *
    * @param {object} elements - The view elements.
    * @returns {void} Nothing.
    */
   function showMobileList(elements) {
      toggleListView(elements.listView, false);
      setDetailContainerDisplay(elements.detailContainer, "");
      toggleClass(elements.detailView, "d-none", true);
      toggleClass(elements.backButton, "d-none", true);
      toggleMenuButton(elements.detailMenuButton, true);
      closeDetailMenu();
   }

   /**
    * Toggles the visibility of the list view.
    *
    * @param {HTMLElement|null} listView - The list element.
    * @param {boolean} shouldHide - Whether the list should be hidden.
    * @returns {void} Nothing.
    */
   function toggleListView(listView, shouldHide) {
      toggleClass(listView, "d-none", shouldHide);
   }

   /**
    * Sets the detail container display value.
    *
    * @param {HTMLElement|null} element - The container element.
    * @param {string} value - The display value.
    * @returns {void} Nothing.
    */
   function setDetailContainerDisplay(element, value) {
      if (element) element.style.display = value;
   }

   /**
    * Toggles the mobile menu button state.
    *
    * @param {HTMLElement|null} button - The menu button.
    * @param {boolean} shouldHide - Whether the button should be hidden.
    * @returns {void} Nothing.
    */
   function toggleMenuButton(button, shouldHide) {
      if (button) button.hidden = shouldHide;
   }

   /**
    * Toggles a class on an element.
    *
    * @param {HTMLElement|null} element - The target element.
    * @param {string} className - The class name.
    * @param {boolean} shouldAdd - Whether the class should be active.
    * @returns {void} Nothing.
    */
   function toggleClass(element, className, shouldAdd) {
      if (!element) return;
      element.classList.toggle(className, shouldAdd);
   }

   ContactsFeature.responsiveView = {
      switchView,
      closeDetailMenu,
      toggleDetailMenu,
   };

   window.ContactsFeature = ContactsFeature;
}
