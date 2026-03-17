(function () {
   const BOARD_STATUS_SEQUENCE = ["todo", "in-progress", "await-feedback", "done"];
   const BOARD_STATUS_LABELS = {
      todo: "To do",
      "in-progress": "In progress",
      "await-feedback": "Await feedback",
      done: "Done",
   };
   let activeMobileMoveMenu = null;

   /**
    * Returns the move status label.
    *
    * @param {string} status - The status.
    * @returns {string} The move status label.
    */
   function getMoveStatusLabel(status) {
      return BOARD_STATUS_LABELS[String(status || "")] || String(status || "");
   }

   /**
    * Returns the adjacent move targets.
    *
    * @param {string} status - The status.
    * @returns {Array<string>} The adjacent move targets list.
    */
   function getAdjacentMoveTargets(status) {
      const currentIndex = BOARD_STATUS_SEQUENCE.indexOf(String(status || ""));
      if (currentIndex === -1) return [];
      const targets = [];
      if (currentIndex > 0) targets.push(BOARD_STATUS_SEQUENCE[currentIndex - 1]);
      if (currentIndex < BOARD_STATUS_SEQUENCE.length - 1)
         targets.push(BOARD_STATUS_SEQUENCE[currentIndex + 1]);
      return targets;
   }

   /**
    * Closes the mobile move menu.
    * @returns {void} Nothing.
    */
   function closeMobileMoveMenu() {
      if (!activeMobileMoveMenu) return;
      activeMobileMoveMenu.classList.remove("board-mobile-move-menu--opened");
      activeMobileMoveMenu.innerHTML = "";
      activeMobileMoveMenu = null;
   }

   /**
    * Returns the mobile move menu.
    * @returns {HTMLDivElement} The mobile move menu element.
    */
   function getMobileMoveMenu() {
      let menu = document.getElementById("boardMobileMoveMenu");
      if (menu) return menu;
      menu = document.createElement("div");
      menu.id = "boardMobileMoveMenu";
      menu.className = "board-mobile-move-menu";
      document.body.appendChild(menu);
      menu.addEventListener("click", (event) => event.stopPropagation());
      return menu;
   }

   /**
    * Positions the mobile move menu.
    *
    * @param {HTMLElement|null} menu - The menu.
    * @param {HTMLElement|null} button - The button.
    * @returns {void} Nothing.
    */
   function positionMobileMoveMenu(menu, button) {
      if (!menu || !button) return;
      const rect = button.getBoundingClientRect();
      const menuWidth = menu.offsetWidth || 160;
      const viewportPadding = 16;
      const left = Math.min(
         Math.max(viewportPadding, rect.right - menuWidth),
         window.innerWidth - menuWidth - viewportPadding,
      );
      const top = Math.min(rect.bottom + 8, window.innerHeight - menu.offsetHeight - 16);
      menu.style.left = `${left}px`;
      menu.style.top = `${Math.max(16, top)}px`;
   }

   /**
    * Reapplies the current board search filter.
    * @returns {void} Nothing.
    */
   function reapplyCurrentSearchFilter() {
      const searchInput = document.getElementById("findTaskInput");
      const mobileSearchInput = document.getElementById("findTaskInputMobile");
      const currentValue = searchInput?.value || mobileSearchInput?.value || "";
      filterTasks(currentValue);
   }

   /**
    * Handles the mobile move action.
    *
    * @param {string|number} taskId - The task ID used for this operation.
    * @param {string} targetStatus - The target status.
    * @returns {Promise<void>} A promise that resolves when the operation is complete.
    */
   async function handleMobileMoveAction(taskId, targetStatus) {
      if (!taskId || !targetStatus) return;
      try {
         await window.BoardData?.updateTaskStatus(taskId, targetStatus);
         window.BoardCards?.renderBoardFromTasks(window.BoardData?.getAllTasks?.() || []);
         reapplyCurrentSearchFilter();
         window.BoardCards?.updatePlaceholders?.();
      } catch (error) {
         console.error("Mobile move action failed:", error);
      } finally {
         closeMobileMoveMenu();
      }
   }

   /**
    * Creates the mobile move menu title.
    *
    * @returns {HTMLDivElement} The mobile move menu title element.
    */
   function createMobileMoveMenuTitle() {
      const title = document.createElement("div");
      title.className = "board-mobile-move-menu__title";
      title.textContent = "Move to";
      return title;
   }

   /**
    * Creates a mobile move menu list item.
    *
    * @param {string|number} taskId - The task ID used for this operation.
    * @param {string} status - The target status.
    * @returns {HTMLLIElement} The mobile move menu list item element.
    */
   function createMobileMoveMenuItem(taskId, status) {
      const item = document.createElement("li");
      item.className = "board-mobile-move-menu__item";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "board-mobile-move-menu__button";
      button.textContent = getMoveStatusLabel(status);
      button.addEventListener("click", (event) => {
         event.stopPropagation();
         handleMobileMoveAction(taskId, status);
      });
      item.appendChild(button);
      return item;
   }

   /**
    * Creates the mobile move menu list.
    *
    * @param {string|number} taskId - The task ID used for this operation.
    * @param {Array<string>} targets - The targets list.
    * @returns {HTMLUListElement} The mobile move menu list element.
    */
   function createMobileMoveMenuList(taskId, targets) {
      const list = document.createElement("ul");
      list.className = "board-mobile-move-menu__list";
      targets.forEach((status) => {
         list.appendChild(createMobileMoveMenuItem(taskId, status));
      });
      return list;
   }

   /**
    * Opens the mobile move menu.
    *
    * @param {object} taskData - The task data object.
    * @param {HTMLElement|null} button - The button.
    * @returns {void} Nothing.
    */
   function openMobileMoveMenu(taskData, button) {
      if (!taskData || !button) return;
      const targets = getAdjacentMoveTargets(taskData.status);
      if (targets.length === 0) return;
      const menu = getMobileMoveMenu();
      if (activeMobileMoveMenu === menu && menu.dataset.taskId === String(taskData.id)) {
         closeMobileMoveMenu();
         return;
      }
      menu.innerHTML = "";
      menu.dataset.taskId = String(taskData.id);
      menu.append(createMobileMoveMenuTitle(), createMobileMoveMenuList(taskData.id, targets));
      menu.classList.add("board-mobile-move-menu--opened");
      activeMobileMoveMenu = menu;
      positionMobileMoveMenu(menu, button);
   }

   /**
    * Creates the task card mobile move button.
    *
    * @param {object} taskData - The task data object.
    * @returns {HTMLButtonElement} The task card mobile move button element.
    */
   function createTaskCardMoveButton(taskData) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "task-card__move-button";
      button.setAttribute("aria-label", "Move task");
      const icon = document.createElement("img");
      icon.className = "task-card__move-icon";
      icon.src = window.BoardCards.boardCardsAssetPath("icons/desktop/swap_horiz.svg");
      icon.alt = "";
      button.appendChild(icon);
      button.addEventListener("click", (event) => {
         event.stopPropagation();
         openMobileMoveMenu(window.BoardData?.getTask?.(taskData.id) || taskData, button);
      });
      return button;
   }

   /**
    * Initializes the mobile move menu interactions.
    * @returns {void} Nothing.
    */
   function initializeMobileMoveMenuInteractions() {
      if (document.body.dataset.boardMobileMoveInitialized === "true") return;
      document.body.dataset.boardMobileMoveInitialized = "true";
      document.addEventListener("click", () => closeMobileMoveMenu());
      window.addEventListener("resize", closeMobileMoveMenu);
      window.addEventListener("scroll", closeMobileMoveMenu, true);
   }

   /**
    * Sets the card visibility.
    *
    * @param {HTMLElement|null} card - The card.
    * @param {boolean} shouldShow - Whether it should show.
    * @returns {void} Nothing.
    */
   function setCardVisibility(card, shouldShow) {
      card.style.display = shouldShow ? "" : "none";
   }

   /**
    * Checks whether the card matches the search term.
    *
    * @param {HTMLElement|null} card - The card.
    * @param {string} lowerSearchTerm - The normalized search term.
    * @returns {boolean} Whether the card matches the search term.
    */
   function cardMatchesSearch(card, lowerSearchTerm) {
      const fallbackTitle =
         card.querySelector(".task-card__title")?.textContent.toLowerCase() || "";
      const fallbackDescription =
         card.querySelector(".task-card__description")?.textContent.toLowerCase() || "";
      const searchText =
         String(card.dataset.searchText || `${fallbackTitle} ${fallbackDescription}`)
            .toLowerCase();
      return searchText.includes(lowerSearchTerm);
   }

   /**
    * Filters the tasks.
    *
    * @param {*} searchTerm - The search term.
    * @returns {void} Nothing.
    */
   function filterTasks(searchTerm) {
      const allCards = document.querySelectorAll(".task-card");
      const lowerSearchTerm = String(searchTerm || "")
         .toLowerCase()
         .trim();
      if (lowerSearchTerm === "") {
         allCards.forEach((card) => setCardVisibility(card, true));
         updatePlaceholders();
         return;
      }
      allCards.forEach((card) => {
         const matchesSearch = cardMatchesSearch(card, lowerSearchTerm);
         setCardVisibility(card, matchesSearch);
      });
      updatePlaceholders();
   }

   /**
    * Ensures the placeholder exists.
    *
    * @param {HTMLElement|null} column - The column.
    * @returns {HTMLDivElement|null} The placeholder exists element, or null when it is not available.
    */
   function ensurePlaceholderExists(column) {
      const taskDirectory = column.querySelector(".board-task-directory");
      if (!taskDirectory) return null;
      let placeholder = taskDirectory.querySelector(".board-task-placeholder");
      if (!placeholder) {
         placeholder = document.createElement("div");
         placeholder.className = "board-task-placeholder";
         placeholder.textContent = "No tasks found";
         taskDirectory.insertBefore(placeholder, taskDirectory.firstChild);
      }
      return placeholder;
   }

   /**
    * Processes the column placeholder.
    *
    * @param {HTMLElement|null} column - The column.
    * @returns {void} Nothing.
    */
   function processColumnPlaceholder(column) {
      const taskDirectory = column.querySelector(".board-task-directory");
      if (!taskDirectory) return;
      const visibleCards = Array.from(taskDirectory.querySelectorAll(".task-card")).filter(
         (card) => card.style.display !== "none",
      );
      if (visibleCards.length === 0) {
         const placeholder = ensurePlaceholderExists(column);
         if (placeholder) placeholder.style.display = "";
      } else {
         const placeholder = taskDirectory.querySelector(".board-task-placeholder");
         if (placeholder) placeholder.style.display = "none";
      }
   }

   /**
    * Updates the placeholders.
    * @returns {void} Nothing.
    */
   function updatePlaceholders() {
      const columns = document.querySelectorAll(".board-task-column");
      columns.forEach(processColumnPlaceholder);
   }

   /**
    * Creates the task card.
    *
    * @param {object} taskData - The task data object.
    * @returns {HTMLElement} The task card element.
    */
   function createTaskCard(taskData) {
      const card = document.createElement("article");
      card.className = "task-card";
      card.dataset.taskId = taskData.id;
      card.dataset.searchText = `${String(taskData.title || "")} ${String(taskData.description || "")}`
         .toLowerCase()
         .trim();
      const viewData = window.BoardCards.getTaskCardRenderData(taskData);
      card.innerHTML = window.BoardCards.buildTaskCardHTML(taskData, viewData);
      card.appendChild(createTaskCardMoveButton(taskData));
      if (window.BoardDnd?.makeCardDraggable) {
         window.BoardDnd.makeCardDraggable(card);
      }
      return card;
   }

   /**
    * Adds the task to column.
    *
    * @param {object} taskData - The task data object.
    * @param {object} columns - The columns object.
    * @returns {void} Nothing.
    */
   function addTaskToColumn(taskData, columns) {
      if (taskData.category && typeof taskData.category !== "string") {
         taskData.category = String(taskData.category);
      }
      const taskDirectory = columns[taskData.status];
      if (!taskDirectory) return;
      const placeholder = taskDirectory.querySelector(".board-task-placeholder");
      if (placeholder) placeholder.remove();
      const card = createTaskCard(taskData);
      taskDirectory.appendChild(card);
   }

   /**
    * Clears the board task cards.
    * @returns {void} Nothing.
    */
   function clearBoardTaskCards() {
      const taskDirectories = document.querySelectorAll(".board-task-directory");
      taskDirectories.forEach((directory) => {
         directory.querySelectorAll(".task-card").forEach((card) => card.remove());
      });
   }

   /**
    * Renders the board from tasks.
    *
    * @param {Array<object>} tasks - The tasks list.
    * @returns {void} Nothing.
    */
   function renderBoardFromTasks(tasks) {
      clearBoardTaskCards();
      const columns = window.BoardCards.getBoardColumns();
      tasks.forEach((taskData) => {
         addTaskToColumn({ ...taskData, status: taskData.status || "todo" }, columns);
      });
      updatePlaceholders();
   }

   document.addEventListener("DOMContentLoaded", initializeMobileMoveMenuInteractions);

   Object.assign(window.BoardCards, {
      clearBoardTaskCards,
      filterTasks,
      renderBoardFromTasks,
      updatePlaceholders,
   });
})();
