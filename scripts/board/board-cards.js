(function () {
   function setCardVisibility(card, shouldShow) {
      card.style.display = shouldShow ? "" : "none";
   }

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

   function updatePlaceholders() {
      const columns = document.querySelectorAll(".board-task-column");
      columns.forEach(processColumnPlaceholder);
   }

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

   function getPriorityIcon(priority) {
      const icons = {
         urgent: "./assets/icons/desktop/Priority orange.svg",
         medium: "./assets/icons/desktop/Priority gleich.svg",
         low: "./assets/icons/desktop/Priority green.svg",
      };
      return icons[priority] || icons.medium;
   }

   function getPriorityLabel(priority) {
      const labels = {
         urgent: "Urgent",
         medium: "Medium",
         low: "Low",
      };
      return labels[String(priority || "")] || "Medium";
   }

   function getCategoryLabel(category) {
      const categoryStr = String(category || "");
      const labels = {
         technical: "Technical Task",
         "user-story": "User Story",
      };
      return labels[categoryStr] || categoryStr;
   }

   function getAvatarDisplayCount(totalAssignees) {
      const avatarWidth = 32;
      const overlap = 8;
      const available = 220;
      const maxAvatars =
         Math.floor((available - avatarWidth) / (avatarWidth - overlap)) + 1;
      return totalAssignees > maxAvatars ? maxAvatars - 1 : totalAssignees;
   }

   function renderSingleAvatar(assignee, index) {
      const colors = ["orange", "teal", "purple"];
      const color = colors[index % colors.length];
      return typeof taskCardAvatarHTML === "function"
         ? taskCardAvatarHTML(color, assignee.initials)
         : `<span class="avatar avatar--${color}">${assignee.initials}</span>`;
   }

   function renderAvatarOverflow(remaining) {
      return typeof taskCardAvatarOverflowHTML === "function"
         ? taskCardAvatarOverflowHTML(remaining)
         : `<span class="avatar avatar--overflow">+${remaining}</span>`;
   }

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

   function getSubtaskStats(subtasks) {
      const total = subtasks?.length || 0;
      const completed = (subtasks || []).filter((item) => item.completed).length;
      const progress = total ? (completed / total) * 100 : 0;
      return { total, completed, progress };
   }

   function buildSubtasksHTML(subtasks) {
      const { total, completed, progress } = getSubtaskStats(subtasks);
      if (typeof taskCardSubtasksHTML !== "function" || total === 0) return "";
      return taskCardSubtasksHTML(completed, total, progress);
   }

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

   function getBoardColumns() {
      return {
         todo: document.getElementById("TodoTask"),
         "in-progress": document.getElementById("InProgressTask"),
         "await-feedback": document.getElementById("AwaitTask"),
         done: document.getElementById("DoneTask"),
      };
   }

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

   function clearBoardTaskCards() {
      const taskDirectories = document.querySelectorAll(".board-task-directory");
      taskDirectories.forEach((directory) => {
         directory.querySelectorAll(".task-card").forEach((card) => card.remove());
      });
   }

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

   function setupColumnAddButtons(onAddClick) {
      const addButtons = document.querySelectorAll(".board-column__add");
      addButtons.forEach((button) => {
         button.addEventListener("click", () => {
            const status = button.dataset.status || "todo";
            onAddClick(status);
         });
      });
   }

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
