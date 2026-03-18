"use strict";

{
   /**
    * Creates the task card mobile move button.
    *
    * @param {object} taskData - The task data object.
    * @returns {HTMLButtonElement} The task card move button.
    */
   function createTaskCardMoveButton(taskData) {
      if (typeof window.BoardCards?.createTaskCardMoveButton === "function") {
         return window.BoardCards.createTaskCardMoveButton(taskData);
      }
      return document.createElement("button");
   }

   /**
    * Initializes the mobile move menu interactions.
    * @returns {void} Nothing.
    */
   function initializeMobileMoveMenuInteractions() {
      if (typeof window.BoardCards?.initializeMobileMoveMenuInteractions === "function") {
         window.BoardCards.initializeMobileMoveMenuInteractions();
      }
   }

   /**
    * Sets the card visibility.
    *
    * @param {HTMLElement} card - The task card.
    * @param {boolean} shouldShow - Whether the card should stay visible.
    * @returns {void} Nothing.
    */
   function setCardVisibility(card, shouldShow) {
      card.style.display = shouldShow ? "" : "none";
   }

   /**
    * Returns the normalized card search text.
    *
    * @param {HTMLElement} card - The task card.
    * @returns {string} The normalized card search text.
    */
   function getCardSearchText(card) {
      const fallbackTitle = card.querySelector(".task-card__title")?.textContent || "";
      const fallbackDescription = card.querySelector(".task-card__description")?.textContent || "";
      return String(card.dataset.searchText || `${fallbackTitle} ${fallbackDescription}`).toLowerCase();
   }

   /**
    * Checks whether the card matches the search term.
    *
    * @param {HTMLElement} card - The task card.
    * @param {string} lowerSearchTerm - The normalized search term.
    * @returns {boolean} Whether the card matches the search term.
    */
   function cardMatchesSearch(card, lowerSearchTerm) {
      return getCardSearchText(card).includes(lowerSearchTerm);
   }

   /**
    * Shows all task cards.
    *
    * @param {NodeListOf<HTMLElement>} allCards - The task cards.
    * @returns {void} Nothing.
    */
   function showAllTaskCards(allCards) {
      allCards.forEach((card) => setCardVisibility(card, true));
   }

   /**
    * Applies the search filter to all cards.
    *
    * @param {NodeListOf<HTMLElement>} allCards - The task cards.
    * @param {string} lowerSearchTerm - The normalized search term.
    * @returns {void} Nothing.
    */
   function applySearchFilter(allCards, lowerSearchTerm) {
      allCards.forEach((card) => setCardVisibility(card, cardMatchesSearch(card, lowerSearchTerm)));
   }

   /**
    * Filters the tasks.
    *
    * @param {*} searchTerm - The search term.
    * @returns {void} Nothing.
    */
   function filterTasks(searchTerm) {
      const allCards = document.querySelectorAll(".task-card");
      const lowerSearchTerm = String(searchTerm || "").toLowerCase().trim();
      if (lowerSearchTerm === "") showAllTaskCards(allCards);
      else applySearchFilter(allCards, lowerSearchTerm);
      updatePlaceholders();
   }

   /**
    * Inserts one placeholder into a task directory.
    *
    * @param {HTMLElement} taskDirectory - The task directory.
    * @returns {void} Nothing.
    */
   function insertPlaceholder(taskDirectory) {
      if (typeof boardPlaceholderHTML === "function") taskDirectory.insertAdjacentHTML("afterbegin", boardPlaceholderHTML());
   }

   /**
    * Ensures the placeholder exists.
    *
    * @param {HTMLElement} column - The board column.
    * @returns {HTMLDivElement|null} The placeholder element.
    */
   function ensurePlaceholderExists(column) {
      const taskDirectory = column.querySelector(".board-task-directory");
      if (!taskDirectory) return null;
      if (!taskDirectory.querySelector(".board-task-placeholder")) insertPlaceholder(taskDirectory);
      return taskDirectory.querySelector(".board-task-placeholder");
   }

   /**
    * Returns the visible task cards in one directory.
    *
    * @param {HTMLElement} taskDirectory - The task directory.
    * @returns {Array<HTMLElement>} The visible task cards.
    */
   function getVisibleTaskCards(taskDirectory) {
      return Array.from(taskDirectory.querySelectorAll(".task-card")).filter((card) => card.style.display !== "none");
   }

   /**
    * Toggles one placeholder.
    *
    * @param {HTMLElement|null} placeholder - The placeholder.
    * @param {boolean} shouldShow - Whether the placeholder should show.
    * @returns {void} Nothing.
    */
   function togglePlaceholder(placeholder, shouldShow) {
      if (placeholder) placeholder.style.display = shouldShow ? "" : "none";
   }

   /**
    * Processes one column placeholder.
    *
    * @param {HTMLElement} column - The board column.
    * @returns {void} Nothing.
    */
   function processColumnPlaceholder(column) {
      const taskDirectory = column.querySelector(".board-task-directory");
      if (!taskDirectory) return;
      const hasVisibleCards = getVisibleTaskCards(taskDirectory).length > 0;
      const placeholder = hasVisibleCards ? taskDirectory.querySelector(".board-task-placeholder") : ensurePlaceholderExists(column);
      togglePlaceholder(placeholder, !hasVisibleCards);
   }

   /**
    * Updates the placeholders.
    * @returns {void} Nothing.
    */
   function updatePlaceholders() {
      document.querySelectorAll(".board-task-column").forEach(processColumnPlaceholder);
   }

   /**
    * Returns the normalized task search text.
    *
    * @param {object} taskData - The task data object.
    * @returns {string} The normalized task search text.
    */
   function buildTaskSearchText(taskData) {
      return `${String(taskData.title || "")} ${String(taskData.description || "")}`.toLowerCase().trim();
   }

   /**
    * Sets the task card base data.
    *
    * @param {HTMLElement} card - The task card.
    * @param {object} taskData - The task data object.
    * @returns {void} Nothing.
    */
   function setTaskCardData(card, taskData) {
      card.className = "task-card";
      card.dataset.taskId = taskData.id;
      card.dataset.searchText = buildTaskSearchText(taskData);
   }

   /**
    * Fills the task card content.
    *
    * @param {HTMLElement} card - The task card.
    * @param {object} taskData - The task data object.
    * @returns {void} Nothing.
    */
   function fillTaskCardContent(card, taskData) {
      const viewData = window.BoardCards.getTaskCardRenderData(taskData);
      card.innerHTML = window.BoardCards.buildTaskCardHTML(taskData, viewData);
      card.appendChild(createTaskCardMoveButton(taskData));
   }

   /**
    * Enables drag and drop for one task card.
    *
    * @param {HTMLElement} card - The task card.
    * @returns {void} Nothing.
    */
   function initializeTaskCardDrag(card) {
      if (window.BoardDnd?.makeCardDraggable) window.BoardDnd.makeCardDraggable(card);
   }

   /**
    * Creates the task card.
    *
    * @param {object} taskData - The task data object.
    * @returns {HTMLElement} The task card element.
    */
   function createTaskCard(taskData) {
      const card = document.createElement("article");
      setTaskCardData(card, taskData);
      fillTaskCardContent(card, taskData);
      initializeTaskCardDrag(card);
      return card;
   }

   /**
    * Returns the normalized task data.
    *
    * @param {object} taskData - The task data object.
    * @returns {object} The normalized task data.
    */
   function normalizeTaskData(taskData) {
      const category = typeof taskData.category === "string" ? taskData.category : String(taskData.category || "");
      return { ...taskData, category };
   }

   /**
    * Adds the task to one column.
    *
    * @param {object} taskData - The task data object.
    * @param {object} columns - The board columns.
    * @returns {void} Nothing.
    */
   function addTaskToColumn(taskData, columns) {
      const normalizedTask = normalizeTaskData(taskData);
      const taskDirectory = columns[normalizedTask.status];
      if (!taskDirectory) return;
      taskDirectory.querySelector(".board-task-placeholder")?.remove();
      taskDirectory.appendChild(createTaskCard(normalizedTask));
   }

   /**
    * Clears the board task cards.
    * @returns {void} Nothing.
    */
   function clearBoardTaskCards() {
      document.querySelectorAll(".board-task-directory .task-card").forEach((card) => card.remove());
   }

   /**
    * Renders the board from tasks.
    *
    * @param {Array<object>} tasks - The tasks list.
    * @returns {void} Nothing.
    */
   function renderBoardFromTasks(tasks) {
      const columns = window.BoardCards.getBoardColumns();
      clearBoardTaskCards();
      tasks.forEach((taskData) => addTaskToColumn({ ...taskData, status: taskData.status || "todo" }, columns));
      updatePlaceholders();
   }

   document.addEventListener("DOMContentLoaded", initializeMobileMoveMenuInteractions);

   Object.assign(window.BoardCards, {
      clearBoardTaskCards,
      filterTasks,
      renderBoardFromTasks,
      updatePlaceholders,
   });
}
