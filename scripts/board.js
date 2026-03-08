let draggedCard = null;
let dragPreviewCard = null;
const BOARD_BASE_URL =
   "https://join-4bce1-default-rtdb.europe-west1.firebasedatabase.app/";
const taskKeyById = {};
const tasksById = {};

function getAddTaskDialog() {
   return document.getElementById("addTaskDialog");
}

function getTaskDetailDialog() {
   return document.getElementById("taskDetailDialog");
}

function setAddTaskDialogMode(isEditMode) {
   const title = document.getElementById("addTaskDialogTitle");
   const buttonText = document.querySelector(".add-task__button-text");
   if (title) title.textContent = isEditMode ? "Edit Task" : "Add Tasks";
   if (buttonText) buttonText.textContent = isEditMode ? "Save changes" : "Create Task";
}

function resetAddTaskDialogMode() {
   const dialog = getAddTaskDialog();
   if (!dialog) return;
   delete dialog.dataset.editTaskId;
   delete dialog.dataset.editTaskKey;
   setAddTaskDialogMode(false);
}

function openDialog(status = "todo") {
   const dialog = getAddTaskDialog();
   if (!dialog) return;
   dialog.dataset.taskStatus = status;
   resetAddTaskDialogMode();
   dialog.showModal();
}

function closeDialog() {
   const dialog = getAddTaskDialog();
   if (!dialog) return;
   dialog.close();
   delete dialog.dataset.taskStatus;
   resetAddTaskDialogMode();
}

function closeTaskDetailDialog() {
   const dialog = getTaskDetailDialog();
   if (!dialog) return;
   dialog.close();
   delete dialog.dataset.taskId;
}

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

function getStatusByDirectoryId(directoryId) {
   return STATUS_BY_DIRECTORY_ID[directoryId] || null;
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

async function getTaskKeyById(taskId) {
   let taskKey = taskKeyById[String(taskId)];
   if (!taskKey) {
      taskKey = await findTaskKeyById(taskId);
      if (taskKey) taskKeyById[String(taskId)] = taskKey;
   }
   return taskKey;
}

async function putTaskToFirebase(taskId, taskData) {
   const taskKey = await getTaskKeyById(taskId);
   if (!taskKey) throw new Error(`Task key not found for id ${taskId}`);
   const response = await fetch(`${BOARD_BASE_URL}tasks/${taskKey}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...taskData, id: taskData.id ?? taskId }),
   });
   if (!response.ok) {
      throw new Error(`Task update failed: HTTP ${response.status}`);
   }
   taskKeyById[String(taskId)] = taskKey;
}

async function deleteTaskFromFirebase(taskId) {
   const taskKey = await getTaskKeyById(taskId);
   if (!taskKey) throw new Error(`Task key not found for id ${taskId}`);
   const response = await fetch(`${BOARD_BASE_URL}tasks/${taskKey}.json`, {
      method: "DELETE",
   });
   if (!response.ok) {
      throw new Error(`Task delete failed: HTTP ${response.status}`);
   }
   delete taskKeyById[String(taskId)];
   delete tasksById[String(taskId)];
}

async function updateTaskStatusInFirebase(taskId, newStatus) {
   if (!taskId || !newStatus) return;
   const currentTask = tasksById[String(taskId)];
   if (!currentTask) return;
   const updatedTask = {
      ...currentTask,
      id: currentTask.id ?? taskId,
      status: newStatus,
   };
   await putTaskToFirebase(taskId, updatedTask);
   tasksById[String(taskId)] = updatedTask;
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
         const normalizedTask = { ...task, id: resolvedId };
         taskKeyById[String(resolvedId)] = key;
         tasksById[String(resolvedId)] = normalizedTask;
         return normalizedTask;
      });
}

async function loadTasks() {
   clearBoardTaskCards();
   Object.keys(taskKeyById).forEach((taskId) => delete taskKeyById[taskId]);
   Object.keys(tasksById).forEach((taskId) => delete tasksById[taskId]);
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

function renderTaskDetail(taskData) {
   const label = document.getElementById("taskDetailCategory");
   const title = document.getElementById("taskDetailTitle");
   const description = document.getElementById("taskDetailDescription");
   const dueDate = document.getElementById("taskDetailDate");
   const priorityText = document.getElementById("taskDetailPriorityText");
   const priorityIcon = document.getElementById("taskDetailPriorityIcon");
   const assignedList = document.getElementById("taskDetailAssignedList");
   const subtasksList = document.getElementById("taskDetailSubtasksList");

   if (label) {
      label.className = "task-detail__label";
      if (taskData.category === "technical") {
         label.classList.add("task-detail__label--teal");
      }
      label.textContent = getCategoryLabel(taskData.category) || "No category";
   }
   if (title) title.textContent = taskData.title || "Untitled task";
   if (description)
      description.textContent = taskData.description || "No description";
   if (dueDate) dueDate.textContent = taskData.date || "No due date";
   if (priorityText) priorityText.textContent = getPriorityLabel(taskData.priority);
   if (priorityIcon) {
      priorityIcon.src = getPriorityIcon(taskData.priority);
      priorityIcon.alt = getPriorityLabel(taskData.priority);
   }

   if (assignedList) {
      assignedList.innerHTML = "";
      const assignees = taskData.assigned || [];
      if (assignees.length === 0) {
         const emptyItem = document.createElement("li");
         emptyItem.className = "task-detail__empty";
         emptyItem.textContent = "No assignees";
         assignedList.appendChild(emptyItem);
      } else {
         assignees.forEach((assignee, index) => {
            const item = document.createElement("li");
            item.className = "task-detail__assigned-item";
            const avatar = document.createElement("span");
            const colors = ["orange", "teal", "purple"];
            avatar.className = `avatar avatar--${colors[index % colors.length]}`;
            avatar.textContent = assignee.initials || "?";
            const name = document.createElement("span");
            name.className = "task-detail__assigned-name";
            name.textContent = assignee.name || "Unnamed";
            item.append(avatar, name);
            assignedList.appendChild(item);
         });
      }
   }

   if (subtasksList) {
      subtasksList.innerHTML = "";
      const subtasks = taskData.subtasks || [];
      if (subtasks.length === 0) {
         const emptyItem = document.createElement("li");
         emptyItem.className = "task-detail__empty";
         emptyItem.textContent = "No subtasks";
         subtasksList.appendChild(emptyItem);
      } else {
         subtasks.forEach((subtask, index) => {
            const item = document.createElement("li");
            item.className = "task-detail__subtask-item";
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "task-detail__subtask-checkbox";
            checkbox.checked = Boolean(subtask.completed);
            checkbox.dataset.subtaskIndex = String(index);
            const text = document.createElement("span");
            text.className = "task-detail__subtask-text";
            text.textContent = subtask.text || `Subtask ${index + 1}`;
            if (checkbox.checked) text.classList.add("task-detail__subtask-text--done");
            item.append(checkbox, text);
            subtasksList.appendChild(item);
         });
      }
   }
}

function openTaskDetail(taskId) {
   const dialog = getTaskDetailDialog();
   if (!dialog) return;
   const taskData = tasksById[String(taskId)];
   if (!taskData) return;
   dialog.dataset.taskId = String(taskId);
   renderTaskDetail(taskData);
   dialog.showModal();
}

function setupTaskCardClicks() {
   const grid = document.querySelector(".board-task-grid");
   if (!grid || grid.dataset.cardClickInitialized === "true") return;
   grid.dataset.cardClickInitialized = "true";
   grid.addEventListener("click", (event) => {
      const card = event.target.closest(".task-card");
      if (!card || draggedCard) return;
      openTaskDetail(card.dataset.taskId);
   });
}

async function handleTaskDetailSubtaskToggle(event) {
   const checkbox = event.target.closest(".task-detail__subtask-checkbox");
   if (!checkbox) return;
   const dialog = getTaskDetailDialog();
   const taskId = dialog?.dataset.taskId;
   const subtaskIndex = Number.parseInt(checkbox.dataset.subtaskIndex || "", 10);
   if (!taskId || Number.isNaN(subtaskIndex)) return;
   const currentTask = tasksById[String(taskId)];
   if (!currentTask?.subtasks?.[subtaskIndex]) return;

   const updatedSubtasks = (currentTask.subtasks || []).map((subtask, index) =>
      index === subtaskIndex
         ? { ...subtask, completed: checkbox.checked }
         : subtask,
   );
   const updatedTask = { ...currentTask, subtasks: updatedSubtasks };

   try {
      await putTaskToFirebase(taskId, updatedTask);
      tasksById[String(taskId)] = updatedTask;
      await loadTasks();
      openTaskDetail(taskId);
   } catch (error) {
      checkbox.checked = !checkbox.checked;
      console.error("Subtask update failed:", error);
   }
}

function setPriorityInForm(priority) {
   const priorityField = document.getElementById("addTaskPriority");
   if (!priorityField) return;
   const buttons = priorityField.querySelectorAll(".add-task__priority-option");
   buttons.forEach((button) =>
      button.classList.remove("add-task__priority-option--active"),
   );
   const target = priorityField.querySelector(
      `.add-task__priority-option--${priority || "medium"}`,
   );
   if (target) target.classList.add("add-task__priority-option--active");
}

function setCategoryInForm(category) {
   const input = document.getElementById("addTaskCategoryInput");
   const select = document.getElementById("addTaskCategory");
   if (!input || !select) return;
   const label = select.querySelector(".add-task__select-value");
   const option = document.querySelector(
      `#addTaskCategoryMenu .add-task__select-option[data-value="${category}"]`,
   );
   input.value = category || "";
   if (label) {
      label.textContent = option
         ? option.textContent.trim()
         : "Select task category";
      label.dataset.lastLabel = label.textContent;
   }
   input.dataset.lastValue = input.value;
   input.dispatchEvent(new Event("input", { bubbles: true }));
}

function setAssignedInForm(assigned) {
   const options = document.querySelectorAll(
      "#addTaskAssignedMenu .add-task__select-option--assigned",
   );
   const assignedValues = new Set((assigned || []).map((person) => person.value));
   const assignedNames = new Set((assigned || []).map((person) => person.name));

   options.forEach((option) => {
      const optionName = option.textContent.trim();
      const optionValue = option.dataset.value || "";
      const isSelected =
         assignedValues.has(optionValue) || assignedNames.has(optionName);
      const checkbox = option.querySelector(".add-task__option-checkbox");
      option.classList.toggle(ASSIGNED_SELECTED_CLASS, isSelected);
      if (checkbox) {
         checkbox.src = isSelected
            ? "./assets/icons/desktop/checkBox--checked.svg"
            : "./assets/icons/desktop/checkBox.svg";
      }
   });

   const input = document.getElementById("addTaskAssignedInput");
   if (input) {
      input.value = (assigned || []).length > 0 ? "assigned" : "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
   }

   if (typeof getAssignedElements === "function" && typeof updateContactInitials === "function") {
      const elements = getAssignedElements();
      if (elements) updateContactInitials(elements);
   }
}

function setSubtasksInForm(subtasks) {
   const list = document.querySelector(".add-task__subtask-list");
   if (!list) return;
   list.innerHTML = "";
   (subtasks || []).forEach((subtask) => {
      if (typeof createSubtaskItem === "function") {
         const item = createSubtaskItem(subtask.text || "");
         item.dataset.completed = subtask.completed ? "true" : "false";
         list.prepend(item);
         if (typeof setupSubtaskListeners === "function") {
            setupSubtaskListeners(item);
         }
      }
   });
}

function fillAddTaskFormForEdit(taskData) {
   const title = document.getElementById("addTaskTitle");
   const description = document.getElementById("addTaskDescription");
   const date = document.getElementById("addTaskDate");
   if (title) {
      title.value = taskData.title || "";
      title.dispatchEvent(new Event("input", { bubbles: true }));
   }
   if (description) {
      description.value = taskData.description || "";
      description.dispatchEvent(new Event("input", { bubbles: true }));
   }
   if (date) {
      date.value = taskData.date || "";
      date.dispatchEvent(new Event("input", { bubbles: true }));
   }
   setPriorityInForm(taskData.priority || "medium");
   setCategoryInForm(taskData.category || "");
   setAssignedInForm(taskData.assigned || []);
   setSubtasksInForm(taskData.subtasks || []);
}

function openEditTaskDialog(taskId) {
   const dialog = getAddTaskDialog();
   const taskData = tasksById[String(taskId)];
   if (!dialog || !taskData) return;

   if (typeof handleClearClick === "function") {
      const clearButton = dialog.querySelector(".add-task__button--cancel");
      if (clearButton) {
         const fakeEvent = { preventDefault: () => {} };
         handleClearClick(fakeEvent, clearButton);
      }
   }

   const taskKey = taskKeyById[String(taskId)] || "";
   dialog.dataset.taskStatus = taskData.status || "todo";
   dialog.dataset.editTaskId = String(taskId);
   if (taskKey) dialog.dataset.editTaskKey = taskKey;
   setAddTaskDialogMode(true);
   fillAddTaskFormForEdit(taskData);
   closeTaskDetailDialog();
   dialog.showModal();
}

async function handleDeleteTask(taskId) {
   const shouldDelete = window.confirm("Delete this task?");
   if (!shouldDelete) return;
   try {
      await deleteTaskFromFirebase(taskId);
      closeTaskDetailDialog();
      await loadTasks();
      updatePlaceholders();
   } catch (error) {
      console.error("Task delete failed:", error);
   }
}

function setupTaskDetailInteractions() {
   const dialog = getTaskDetailDialog();
   if (!dialog || dialog.dataset.initialized === "true") return;
   dialog.dataset.initialized = "true";

   const closeButton = document.getElementById("taskDetailClose");
   const deleteButton = document.getElementById("taskDetailDelete");
   const editButton = document.getElementById("taskDetailEdit");
   const subtasksList = document.getElementById("taskDetailSubtasksList");

   if (closeButton) {
      closeButton.addEventListener("click", () => closeTaskDetailDialog());
   }
   if (subtasksList) {
      subtasksList.addEventListener("change", handleTaskDetailSubtaskToggle);
   }
   if (deleteButton) {
      deleteButton.addEventListener("click", async () => {
         const taskId = dialog.dataset.taskId;
         if (!taskId) return;
         await handleDeleteTask(taskId);
      });
   }
   if (editButton) {
      editButton.addEventListener("click", () => {
         const taskId = dialog.dataset.taskId;
         if (!taskId) return;
         openEditTaskDialog(taskId);
      });
   }
}

document.addEventListener("DOMContentLoaded", async () => {
   await loadTasks();
   initializeDraggableCards();
   setupDropZones();
   updatePlaceholders();
   setupColumnAddButtons();
   setupTaskSearch();
   setupTaskCardClicks();
   setupTaskDetailInteractions();

   const shouldShowSuccess = localStorage.getItem("showTaskSuccess");
   if (shouldShowSuccess === "true") {
      const successIsEdit = localStorage.getItem("showTaskSuccessEdit") === "true";
      localStorage.removeItem("showTaskSuccess");
      localStorage.removeItem("showTaskSuccessEdit");
      if (typeof showSuccessMessage === "function") {
         showSuccessMessage(successIsEdit);
      }
   }
});

window.addEventListener("click", (event) => {
   const addDialog = getAddTaskDialog();
   if (addDialog && event.target === addDialog) {
      closeDialog();
   }
   const detailDialog = getTaskDetailDialog();
   if (detailDialog && event.target === detailDialog) {
      closeTaskDetailDialog();
   }
});
