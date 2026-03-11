// ===== TASK SPEICHERN =====
const SAVE_TASK_BASE_URL =
   window.JOIN_CONFIG.BASE_URL;
const SAVE_TASK_IS_IN_TEMPLATES = window.location.pathname.includes("/templates/");
const SAVE_TASK_ASSET_BASE_PATH = window.location.pathname.includes("/templates/")
   ? "../assets/"
   : "./assets/";
const SAVE_TASK_PAGE_BASE_PATH = SAVE_TASK_IS_IN_TEMPLATES
   ? "./"
   : "./templates/";

function saveTaskAssetPath(relativePath) {
   return `${SAVE_TASK_ASSET_BASE_PATH}${relativePath}`;
}


function saveTaskPagePath(pageFile) {
   return `${SAVE_TASK_PAGE_BASE_PATH}${pageFile}`;
}


function getSelectedContacts() {
   const selectedOptions = document.querySelectorAll(`.${ASSIGNED_SELECTED_CLASS}`);
   const contacts = [];
   selectedOptions.forEach((option) => {
      const initialsElement = option.querySelector(".add-task__option-initials");
      const contactName = option.dataset.name || option.textContent.trim();
      const contactValue = option.dataset.value || "";
      const contactInitials = initialsElement?.textContent || "";
      contacts.push({
         name: contactName,
         initials: contactInitials,
         value: contactValue,
      });
   });
   return contacts;
}


function getSubtasksList() {
   const subtaskItems = document.querySelectorAll(".add-task__subtask-item");
   const subtasks = [];
   subtaskItems.forEach((item) => {
      const textElement = item.querySelector(".add-task__subtask-text");
      const inputElement = item.querySelector(".add-task__subtask-input");
      const subtaskText = textElement?.textContent || inputElement?.value || "";
      if (subtaskText.trim()) {
         subtasks.push({
            text: subtaskText.trim(),
            completed: item.dataset.completed === "true",
         });
      }
   });
   return subtasks;
}


function getDialogStatus() {
   const dialog = document.getElementById("addTaskDialog");
   return dialog?.dataset.taskStatus || "todo";
}


function getBasicInputs() {
   const title = document.querySelector("#addTaskTitle")?.value || "";
   const description = document.querySelector("#addTaskDescription")?.value || "";
   const date = document.querySelector("#addTaskDate")?.value || "";
   const activeButton = document.querySelector(".add-task__priority-option--active");
   let priority = "medium";
   if (activeButton) {
      if (activeButton.classList.contains("add-task__priority-option--urgent")) {
         priority = "urgent";
      } else if (activeButton.classList.contains("add-task__priority-option--medium")) {
         priority = "medium";
      } else if (activeButton.classList.contains("add-task__priority-option--low")) {
         priority = "low";
      }
   }
   const category = document.getElementById("addTaskCategoryInput")?.value?.trim() || "";
   return { title, description, date, priority, category };
}


function createTaskData(existingId = null) {
   const status = getDialogStatus();
   const { title, description, date, priority, category } = getBasicInputs();
   return {
      id: existingId || Date.now(),
      title,
      description,
      date,
      priority,
      category,
      assigned: getSelectedContacts(),
      subtasks: getSubtasksList(),
      status,
   };
}


async function addTaskToFirebase(taskData) {
   const response = await fetch(`${SAVE_TASK_BASE_URL}tasks.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
   });
   if (!response.ok) {
      throw new Error(`Task save failed: HTTP ${response.status}`);
   }
}


async function updateTaskInFirebase(taskKey, taskData) {
   const response = await fetch(`${SAVE_TASK_BASE_URL}tasks/${taskKey}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
   });
   if (!response.ok) {
      throw new Error(`Task update failed: HTTP ${response.status}`);
   }
}


function getDialogEditContext() {
   const dialog = document.getElementById("addTaskDialog");
   if (!dialog) return { isEdit: false, taskId: null, taskKey: null };
   const taskId = dialog.dataset.editTaskId || null;
   const taskKey = dialog.dataset.editTaskKey || null;
   return {
      isEdit: Boolean(taskId),
      taskId,
      taskKey,
   };
}


async function findTaskKeyByIdForSave(taskId) {
   if (!taskId) return null;
   const response = await fetch(`${SAVE_TASK_BASE_URL}tasks.json`);
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


function isInDialog() {
   const dialog = document.getElementById("addTaskDialog");
   return dialog && dialog.open;
}


function createSuccessMessage(isEdit = false) {
   const messageDiv = document.createElement("div");
   messageDiv.className = "task-success-message";
   const messageText = document.createElement("span");
   messageText.className = "task-success-message__text";
   messageText.textContent = isEdit ? "Task updated" : "Task added to board";
   const messageIcon = document.createElement("img");
   messageIcon.className = "task-success-message__icon";
   messageIcon.src = saveTaskAssetPath("icons/desktop/board.svg");
   messageIcon.alt = "Board";
   messageDiv.append(messageText, messageIcon);
   return messageDiv;
}


function showSuccessMessage(isEdit = false) {
   const message = createSuccessMessage(isEdit);
   document.body.appendChild(message);
   requestAnimationFrame(() => {
      message.classList.add("task-success-message--visible");
   });
   setTimeout(() => {
      message.remove();
   }, 1000);
}


function redirectAfterSave() {
   if (isInDialog()) {
      window.location.reload();
   } else {
      window.location.href = saveTaskPagePath("board.html");
   }
}


async function saveTaskToBoard() {
   const { isEdit, taskId, taskKey } = getDialogEditContext();
   const taskData = createTaskData(taskId);
   try {
      if (isEdit) {
         const resolvedTaskKey = taskKey || (await findTaskKeyByIdForSave(taskId));
         if (!resolvedTaskKey) {
            throw new Error(`Task key not found for edit id ${taskId}`);
         }
         await updateTaskInFirebase(resolvedTaskKey, taskData);
      } else {
         await addTaskToFirebase(taskData);
      }
      if (isInDialog()) {
         localStorage.setItem("showTaskSuccess", "true");
         localStorage.setItem("showTaskSuccessEdit", isEdit ? "true" : "false");
         redirectAfterSave();
         return;
      }
      showSuccessMessage(isEdit);
      setTimeout(() => {
         redirectAfterSave();
      }, 1000);
   } catch (error) {
      console.error(error);
   }
}
