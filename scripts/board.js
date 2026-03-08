let draggedCard = null;
let dragPreviewCard = null;
const BOARD_BASE_URL =
   "https://join-4bce1-default-rtdb.europe-west1.firebasedatabase.app/";
const taskKeyById = {};

function openDialog(status = "todo") {
   const dialog = document.getElementById("addTaskDialog");
   if (dialog) {
      // Status im Dialog speichern für späteren Abruf
      dialog.dataset.taskStatus = status;
      dialog.showModal();
   }
}

function closeDialog() {
   const dialog = document.getElementById("addTaskDialog");
   if (dialog) {
      dialog.close();
      // Status zurücksetzen
      delete dialog.dataset.taskStatus;
   }
}

// Event-Listener für Plus-Buttons in den Spalten
function setupColumnAddButtons() {
   const addButtons = document.querySelectorAll(".board-column__add");
   addButtons.forEach((button) => {
      button.addEventListener("click", () => {
         const status = button.dataset.status || "todo";
         openDialog(status);
      });
   });
}

const STATUS_BY_DIRECTORY_ID = {
   TodoTask: "todo",
   InProgressTask: "in-progress",
   AwaitTask: "await-feedback",
   DoneTask: "done",
};

// ===== TASK SUCHE =====

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
      searchInput.addEventListener("input", (e) => {
         const value = e.target.value;
         searchInputs.forEach((input) => {
            if (input !== e.target) input.value = value;
         });
         filterTasks(value);
      });
   });
}

// ===== DRAG & DROP LOGIC =====
function getStatusByDirectoryId(directoryId) {
   return STATUS_BY_DIRECTORY_ID[directoryId] || null;
}

async function updateTaskStatusInFirebase(taskId, newStatus) {
   if (!taskId || !newStatus) return;
   let taskKey = taskKeyById[String(taskId)];
   if (!taskKey) {
      taskKey = await findTaskKeyById(taskId);
   }
   if (!taskKey) {
      throw new Error(`Task key not found for id ${taskId}`);
   }
   const taskUrl = `${BOARD_BASE_URL}tasks/${taskKey}.json`;
   const currentTaskResponse = await fetch(taskUrl);
   if (!currentTaskResponse.ok) {
      throw new Error(
         `Task fetch before update failed: HTTP ${currentTaskResponse.status}`,
      );
   }
   const currentTask = await currentTaskResponse.json();
   if (!currentTask || typeof currentTask !== "object") {
      throw new Error(`Task data missing for key ${taskKey}`);
   }
   const updatedTask = {
      ...currentTask,
      id: currentTask.id ?? taskId,
      status: newStatus,
   };
   const response = await fetch(taskUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
   });
   if (!response.ok) {
      throw new Error(`Task status update failed: HTTP ${response.status}`);
   }
   taskKeyById[String(taskId)] = taskKey;
}

async function findTaskKeyById(taskId) {
   const response = await fetch(`${BOARD_BASE_URL}tasks.json`);
   if (!response.ok) return null;
   const data = await response.json();
   if (!data) return null;
   const entries = Array.isArray(data)
      ? data.map((task, index) => [String(index), task])
      : Object.entries(data);
   const match = entries.find(
      ([, task]) => task && String(task.id ?? "") === String(taskId),
   );
   return match ? match[0] : null;
}

function clearDropHighlights() {
   const directories = document.querySelectorAll(".board-task-directory");
   directories.forEach((directory) =>
      directory.classList.remove("board-task-directory--dragover"),
   );
}

function getInsertBeforeElement(container, mouseY) {
   const cards = Array.from(container.querySelectorAll(".task-card")).filter(
      (card) => card !== draggedCard && card.style.display !== "none",
   );
   let closest = {
      offset: Number.NEGATIVE_INFINITY,
      element: null,
   };

   cards.forEach((card) => {
      const box = card.getBoundingClientRect();
      const offset = mouseY - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
         closest = { offset, element: card };
      }
   });

   return closest.element;
}

function handleCardDragStart(card, event) {
   draggedCard = card;
   card.classList.add("task-card--dragging");
   if (!event.dataTransfer) return;
   event.dataTransfer.effectAllowed = "move";
   dragPreviewCard = card.cloneNode(true);
   dragPreviewCard.classList.add("task-card--drag-preview");
   dragPreviewCard.style.width = `${card.offsetWidth}px`;
   document.body.appendChild(dragPreviewCard);
   event.dataTransfer.setDragImage(
      dragPreviewCard,
      card.offsetWidth / 2,
      card.offsetHeight / 2,
   );
   event.dataTransfer.setData("text/plain", card.dataset.taskId || "demo-card");
}

function handleCardDragEnd(card) {
   card.classList.remove("task-card--dragging");
   if (dragPreviewCard) {
      dragPreviewCard.remove();
      dragPreviewCard = null;
   }
   clearDropHighlights();
   draggedCard = null;
   updatePlaceholders();
}

function makeCardDraggable(card) {
   if (!card || card.dataset.dndInitialized === "true") return;
   card.dataset.dndInitialized = "true";
   card.setAttribute("draggable", "true");
   card.addEventListener("dragstart", (event) =>
      handleCardDragStart(card, event),
   );
   card.addEventListener("dragend", () => handleCardDragEnd(card));
}

function initializeDraggableCards() {
   const cards = document.querySelectorAll(".task-card");
   cards.forEach(makeCardDraggable);
}

function handleDirectoryDragOver(directory, event) {
   if (!draggedCard) return;
   event.preventDefault();
   directory.classList.add("board-task-directory--dragover");
   const placeholder = directory.querySelector(".board-task-placeholder");
   if (placeholder) placeholder.style.display = "none";
   const insertBeforeElement = getInsertBeforeElement(directory, event.clientY);
   if (insertBeforeElement)
      directory.insertBefore(draggedCard, insertBeforeElement);
   else directory.appendChild(draggedCard);
}

function handleDirectoryDragLeave(directory, event) {
   if (directory.contains(event.relatedTarget)) return;
   directory.classList.remove("board-task-directory--dragover");
   const placeholder = directory.querySelector(".board-task-placeholder");
   if (!placeholder) return;
   const hasVisibleCards = Array.from(
      directory.querySelectorAll(".task-card"),
   ).some((card) => card !== draggedCard && card.style.display !== "none");
   placeholder.style.display = hasVisibleCards ? "none" : "";
}

async function handleDirectoryDrop(directory, event) {
   event.preventDefault();
   directory.classList.remove("board-task-directory--dragover");
   const targetStatus = getStatusByDirectoryId(directory.id);
   const draggedTaskId =
      event.dataTransfer?.getData("text/plain") || draggedCard?.dataset.taskId;
   if (!draggedTaskId || !targetStatus) return;
   try {
      await updateTaskStatusInFirebase(draggedTaskId, targetStatus);
   } catch (error) {
      console.error("Task status update failed:", error);
   }
   updatePlaceholders();
}

function initializeDropZone(directory) {
   if (directory.dataset.dropzoneInitialized === "true") return;
   directory.dataset.dropzoneInitialized = "true";
   directory.addEventListener("dragover", (event) =>
      handleDirectoryDragOver(directory, event),
   );
   directory.addEventListener("dragleave", (event) =>
      handleDirectoryDragLeave(directory, event),
   );
   directory.addEventListener("drop", (event) =>
      handleDirectoryDrop(directory, event),
   );
}

function setupDropZones() {
   const directories = document.querySelectorAll(".board-task-directory");
   directories.forEach((directory) => initializeDropZone(directory));
}

// ===== TASK CARDS GENERIEREN =====

function getPriorityIcon(priority) {
   const icons = {
      urgent: "./assets/icons/desktop/Priority orange.svg",
      medium: "./assets/icons/desktop/Priority gleich.svg",
      low: "./assets/icons/desktop/Priority green.svg",
   };
   return icons[priority] || icons.medium;
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

// Subtask, avatar and card HTML are provided by template.js (pure HTML, no logic)
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
   if (typeof taskCardHTML === "function")
      return taskCardHTML(
         viewData.categoryClass,
         viewData.categoryLabel,
         taskData.title,
         taskData.description,
         viewData.subtasksHTML,
         viewData.avatarsHTML,
         viewData.priorityIconSrc,
      );
   if (typeof taskCardFallbackHTML === "function")
      return taskCardFallbackHTML(
         viewData.categoryClass,
         viewData.categoryLabel,
         taskData.title,
         taskData.description,
         viewData.subtasksHTML,
         viewData.avatarsHTML,
         viewData.priorityIconSrc,
      );
   return "";
}

function createTaskCard(taskData) {
   const card = document.createElement("article");
   card.className = "task-card";
   card.dataset.taskId = taskData.id;
   const viewData = getTaskCardRenderData(taskData);
   card.innerHTML = buildTaskCardHTML(taskData, viewData);
   makeCardDraggable(card);
   return card;
}

function addTaskToColumn(taskData, columns) {
   if (taskData.category && typeof taskData.category !== "string")
      taskData.category = String(taskData.category);
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

function normalizeFirebaseTasks(data) {
   if (!data) return [];
   const entries = Array.isArray(data)
      ? data.map((task, index) => [String(index), task])
      : Object.entries(data);
   return entries
      .filter(([, task]) => task && typeof task === "object")
      .map(([key, task]) => {
         const resolvedId = task.id ?? key;
         taskKeyById[String(resolvedId)] = key;
         return { ...task, id: resolvedId };
      });
}

async function loadTasks() {
   clearBoardTaskCards();
   Object.keys(taskKeyById).forEach((taskId) => delete taskKeyById[taskId]);
   const columns = {
      todo: document.getElementById("TodoTask"),
      "in-progress": document.getElementById("InProgressTask"),
      "await-feedback": document.getElementById("AwaitTask"),
      done: document.getElementById("DoneTask"),
   };
   try {
      const response = await fetch(`${BOARD_BASE_URL}tasks.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const tasks = normalizeFirebaseTasks(data);
      tasks.forEach((taskData) =>
         addTaskToColumn(
            { ...taskData, status: taskData.status || "todo" },
            columns,
         ),
      );
   } catch (error) {
      console.error("Task loading failed:", error);
   }
}

// Tasks beim Laden der Seite anzeigen
document.addEventListener("DOMContentLoaded", async () => {
   await loadTasks();
   initializeDraggableCards();
   setupDropZones();
   updatePlaceholders();
   setupColumnAddButtons();
   setupTaskSearch();

   const shouldShowSuccess = localStorage.getItem("showTaskSuccess");
   if (shouldShowSuccess === "true") {
      localStorage.removeItem("showTaskSuccess");
      if (typeof showSuccessMessage === "function") {
         showSuccessMessage();
      }
   }
});

window.addEventListener("click", (event) => {
   const dialog = document.getElementById("addTaskDialog");
   if (dialog && event.target === dialog) {
      dialog.close();
   }
});
