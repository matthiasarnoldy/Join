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
            window.BoardCards.filterTasks(value);
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
      const available = 172;
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
         return buildTaskCardFallbackHTML(taskData, viewData);
      }
      return "";
   }

   /**
    * Builds the task card fallback HTML.
    *
    * @param {object} taskData - The task data object.
    * @param {object} viewData - The view data object.
    * @returns {string} The task card fallback HTML.
    */
   function buildTaskCardFallbackHTML(taskData, viewData) {
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
         if (event.target.closest(".task-card__move-button")) return;
         const card = event.target.closest(".task-card");
         if (!card || window.BoardDnd?.isDragging?.()) return;
         onCardClick(card.dataset.taskId);
      });
   }

   window.BoardCards = {
      boardCardsAssetPath,
      getBoardColumns,
      getTaskCardRenderData,
      buildTaskCardHTML,
      getCategoryLabel,
      getPriorityIcon,
      getPriorityLabel,
      setupColumnAddButtons,
      setupTaskCardClicks,
      setupTaskSearch,
   };
})();
