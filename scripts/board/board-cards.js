(function () {
   const BOARD_CARDS_ASSET_BASE_PATH = window.location.pathname.includes("/templates/")
      ? "../assets/"
      : "./assets/";

   /**
    * Returns the board cards asset path.
    *
    * @param {string} relativePath - The relative path.
    * @returns {string} The board cards asset path.
    */
   function boardCardsAssetPath(relativePath) {
      return `${BOARD_CARDS_ASSET_BASE_PATH}${relativePath}`;
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
         const title =
            card.querySelector(".task-card__title")?.textContent.toLowerCase() ||
            "";
         setCardVisibility(card, title.includes(lowerSearchTerm));
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
      const visibleCards = Array.from(
         taskDirectory.querySelectorAll(".task-card"),
      ).filter((card) => card.style.display !== "none");

      if (visibleCards.length === 0) {
         const placeholder = ensurePlaceholderExists(column);
         if (placeholder) placeholder.style.display = "";
      } else {
         const placeholder = taskDirectory.querySelector(
            ".board-task-placeholder",
         );
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
    * Sets up the task search.
    * @returns {void} Nothing.
    */
   function setupTaskSearch() {
      const searchInputs = [
         document.getElementById("findTaskInput"),
         document.getElementById("findTaskInputMobile"),
      ].filter(Boolean);

      searchInputs.forEach((searchInput) => {
         searchInput.addEventListener("input", (event) => {
            const value = event.target.value;
            searchInputs.forEach((input) => {
               if (input !== event.target) input.value = value;
            });
            filterTasks(value);
         });
      });
   }

   /**
    * Returns the priority icon.
    *
    * @param {string} priority - The priority.
    * @returns {string} The priority icon.
    */
   function getPriorityIcon(priority) {
      const icons = {
         urgent: boardCardsAssetPath("icons/desktop/Priority orange.svg"),
         medium: boardCardsAssetPath("icons/desktop/Priority gleich.svg"),
         low: boardCardsAssetPath("icons/desktop/Priority green.svg"),
      };
      return icons[priority] || icons.medium;
   }

   /**
    * Returns the priority label.
    *
    * @param {string} priority - The priority.
    * @returns {string} The priority label.
    */
   function getPriorityLabel(priority) {
      const labels = {
         urgent: "Urgent",
         medium: "Medium",
         low: "Low",
      };
      return labels[String(priority || "")] || "Medium";
   }

   /**
    * Returns the category label.
    *
    * @param {string} category - The category.
    * @returns {string} The category label.
    */
   function getCategoryLabel(category) {
      const categoryStr = String(category || "");
      const labels = {
         technical: "Technical Task",
         "user-story": "User Story",
      };
      return labels[categoryStr] || categoryStr;
   }

   /**
    * Returns the avatar display count.
    *
    * @param {Array<object>} totalAssignees - The total assignees list.
    * @returns {number} The avatar display count value.
    */
   function getAvatarDisplayCount(totalAssignees) {
      const avatarWidth = 32;
      const overlap = 8;
      const available = 220;
      const maxAvatars =
         Math.floor((available - avatarWidth) / (avatarWidth - overlap)) + 1;
      return totalAssignees > maxAvatars ? maxAvatars - 1 : totalAssignees;
   }

   /**
    * Renders the single avatar.
    *
    * @param {*} assignee - The assignee.
    * @param {number} index - The index.
    * @returns {*} The single avatar result.
    */
   function renderSingleAvatar(assignee, index) {
      const colors = ["orange", "teal", "purple"];
      const color = colors[index % colors.length];
      return typeof taskCardAvatarHTML === "function"
         ? taskCardAvatarHTML(color, assignee.initials)
         : `<span class="avatar avatar--${color}">${assignee.initials}</span>`;
   }

   /**
    * Renders the avatar overflow.
    *
    * @param {number} remaining - The remaining.
    * @returns {*} The avatar overflow result.
    */
   function renderAvatarOverflow(remaining) {
      return typeof taskCardAvatarOverflowHTML === "function"
         ? taskCardAvatarOverflowHTML(remaining)
         : `<span class="avatar avatar--overflow">+${remaining}</span>`;
   }

   /**
    * Builds the avatars HTML.
    *
    * @param {object} taskData - The task data object.
    * @returns {string} The avatars HTML.
    */
   function buildAvatarsHTML(taskData) {
      const assignees = taskData.assigned || [];
      if (assignees.length === 0) return "";
      const displayCount = getAvatarDisplayCount(assignees.length);
      const avatarHTML = assignees
         .slice(0, displayCount)
         .map((assignee, index) => renderSingleAvatar(assignee, index))
         .join("");
      const remaining = assignees.length - displayCount;
      return remaining > 0
         ? avatarHTML + renderAvatarOverflow(remaining)
         : avatarHTML;
   }

   /**
    * Returns the subtask stats.
    *
    * @param {Array<object>} subtasks - The subtasks list.
    * @returns {object} The subtask stats object.
    */
   function getSubtaskStats(subtasks) {
      const total = subtasks?.length || 0;
      const completed = (subtasks || []).filter((item) => item.completed).length;
      const progress = total ? (completed / total) * 100 : 0;
      return { total, completed, progress };
   }

   /**
    * Builds the subtasks HTML.
    *
    * @param {Array<object>} subtasks - The subtasks list.
    * @returns {string} The subtasks HTML.
    */
   function buildSubtasksHTML(subtasks) {
      const { total, completed, progress } = getSubtaskStats(subtasks);
      if (typeof taskCardSubtasksHTML !== "function" || total === 0) return "";
      return taskCardSubtasksHTML(completed, total, progress);
   }

   /**
    * Returns the task card render data.
    *
    * @param {object} taskData - The task data object.
    * @returns {object} The task card render data object.
    */
   function getTaskCardRenderData(taskData) {
      return {
         categoryClass:
            taskData.category === "technical" ? "task-card__label--teal" : "",
         categoryLabel: getCategoryLabel(taskData.category),
         priorityIconSrc: getPriorityIcon(taskData.priority),
         avatarsHTML: buildAvatarsHTML(taskData),
         subtasksHTML: buildSubtasksHTML(taskData.subtasks),
      };
   }

   /**
    * Builds the task card HTML.
    *
    * @param {object} taskData - The task data object.
    * @param {object} viewData - The view data object.
    * @returns {string} The task card HTML.
    */
   function buildTaskCardHTML(taskData, viewData) {
      if (typeof taskCardHTML === "function") {
         return taskCardHTML(
            viewData.categoryClass,
            viewData.categoryLabel,
            taskData.title,
            taskData.description,
            viewData.subtasksHTML,
            viewData.avatarsHTML,
            viewData.priorityIconSrc,
         );
      }
      if (typeof taskCardFallbackHTML === "function") {
         return taskCardFallbackHTML(
            viewData.categoryClass,
            viewData.categoryLabel,
            taskData.title,
            taskData.description,
            viewData.subtasksHTML,
            viewData.avatarsHTML,
            viewData.priorityIconSrc,
         );
      }
      return "";
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
      const viewData = getTaskCardRenderData(taskData);
      card.innerHTML = buildTaskCardHTML(taskData, viewData);
      if (window.BoardDnd?.makeCardDraggable) {
         window.BoardDnd.makeCardDraggable(card);
      }
      return card;
   }

   /**
    * Returns the board columns.
    * @returns {object} The board columns object.
    */
   function getBoardColumns() {
      return {
         todo: document.getElementById("TodoTask"),
         "in-progress": document.getElementById("InProgressTask"),
         "await-feedback": document.getElementById("AwaitTask"),
         done: document.getElementById("DoneTask"),
      };
   }

   /**
    * Adds the task to column.
    *
    * @param {object} taskData - The task data object.
    * @param {NodeListOf<Element>|Array<Element>} columns - The columns collection.
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
      const columns = getBoardColumns();
      tasks.forEach((taskData) => {
         addTaskToColumn(
            { ...taskData, status: taskData.status || "todo" },
            columns,
         );
      });
      updatePlaceholders();
   }

   /**
    * Sets up the column add buttons.
    *
    * @param {*} onAddClick - The on add click.
    * @returns {void} Nothing.
    */
   function setupColumnAddButtons(onAddClick) {
      const addButtons = document.querySelectorAll(".board-column__add");
      addButtons.forEach((button) => {
         button.addEventListener("click", () => {
            const status = button.dataset.status || "todo";
            onAddClick(status);
         });
      });
   }

   /**
    * Sets up the task card clicks.
    *
    * @param {HTMLElement|null} onCardClick - The on card click.
    * @returns {void} Nothing.
    */
   function setupTaskCardClicks(onCardClick) {
      const grid = document.querySelector(".board-task-grid");
      if (!grid || grid.dataset.cardClickInitialized === "true") return;
      grid.dataset.cardClickInitialized = "true";
      grid.addEventListener("click", (event) => {
         const card = event.target.closest(".task-card");
         if (!card || window.BoardDnd?.isDragging?.()) return;
         onCardClick(card.dataset.taskId);
      });
   }

   window.BoardCards = {
      clearBoardTaskCards,
      getCategoryLabel,
      getPriorityIcon,
      getPriorityLabel,
      renderBoardFromTasks,
      setupColumnAddButtons,
      setupTaskCardClicks,
      setupTaskSearch,
      updatePlaceholders,
   };
})();
