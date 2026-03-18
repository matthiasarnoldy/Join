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
let isTaskSaveInProgress = false;

/**
 * Saves the task asset path.
 *
 * @param {string} relativePath - The relative path.
 * @returns {string} The task asset path.
 */
function saveTaskAssetPath(relativePath) {
   return `${SAVE_TASK_ASSET_BASE_PATH}${relativePath}`;
}


/**
 * Saves the task page path.
 *
 * @param {string} pageFile - The page file.
 * @returns {string} The task page path.
 */
function saveTaskPagePath(pageFile) {
   return `${SAVE_TASK_PAGE_BASE_PATH}${pageFile}`;
}


/**
 * Returns one selected contact.
 *
 * @param {HTMLElement|null} option - The selected option.
 * @returns {object} The selected contact object.
 */
function getSelectedContact(option) {
   const initialsElement = option.querySelector(".add-task__option-initials");
   return {
      name: option.dataset.name || option.textContent.trim(),
      initials: initialsElement?.textContent || "",
      value: option.dataset.value || "",
   };
}


/**
 * Returns the selected contacts.
 * @returns {Array<object>} The selected contacts list.
 */
function getSelectedContacts() {
   return Array.from(document.querySelectorAll(`.${ASSIGNED_SELECTED_CLASS}`)).map(getSelectedContact);
}


/**
 * Returns one subtask text.
 *
 * @param {HTMLElement|null} item - The subtask item.
 * @returns {string} The subtask text.
 */
function getSubtaskText(item) {
   const textElement = item.querySelector(".add-task__subtask-text");
   const inputElement = item.querySelector(".add-task__subtask-input");
   return String(textElement?.textContent || inputElement?.value || "").trim();
}


/**
 * Returns one subtask item payload.
 *
 * @param {HTMLElement|null} item - The subtask item.
 * @returns {object|null} The subtask item payload.
 */
function getSubtaskPayload(item) {
   const text = getSubtaskText(item);
   if (!text) return null;
   return { text, completed: item.dataset.completed === "true" };
}


/**
 * Returns the subtasks list.
 * @returns {Array<object>} The subtasks list list.
 */
function getSubtasksList() {
   return Array.from(document.querySelectorAll(".add-task__subtask-item")).map(getSubtaskPayload).filter(Boolean);
}


/**
 * Returns the dialog status.
 * @returns {string} The dialog status.
 */
function getDialogStatus() {
   const dialog = document.getElementById("addTaskDialog");
   return dialog?.dataset.taskStatus || "todo";
}


/**
 * Returns one input value.
 *
 * @param {string} selector - The field selector.
 * @returns {string} The input value.
 */
function getTaskInputValue(selector) {
   return document.querySelector(selector)?.value || "";
}


/**
 * Returns the active priority button.
 * @returns {HTMLElement|null} The active priority button.
 */
function getActivePriorityButton() {
   return document.querySelector(".add-task__priority-option--active");
}


/**
 * Returns whether the button is urgent.
 *
 * @param {HTMLElement|null} button - The priority button.
 * @returns {boolean} Whether the button is urgent.
 */
function isUrgentPriorityButton(button) {
   return button.classList.contains("add-task__priority-option--urgent");
}


/**
 * Returns whether the button is low.
 *
 * @param {HTMLElement|null} button - The priority button.
 * @returns {boolean} Whether the button is low.
 */
function isLowPriorityButton(button) {
   return button.classList.contains("add-task__priority-option--low");
}


/**
 * Returns the priority from button.
 *
 * @param {HTMLElement|null} button - The priority button.
 * @returns {string} The priority value.
 */
function getPriorityFromButton(button) {
   if (!button) return "medium";
   if (isUrgentPriorityButton(button)) return "urgent";
   if (isLowPriorityButton(button)) return "low";
   return "medium";
}


/**
 * Returns the task category input value.
 * @returns {string} The task category input value.
 */
function getCategoryInputValue() {
   return document.getElementById("addTaskCategoryInput")?.value?.trim() || "";
}


/**
 * Returns the basic inputs.
 * @returns {object} The basic inputs object.
 */
function getBasicInputs() {
   return {
      title: getTaskInputValue("#addTaskTitle"),
      description: getTaskInputValue("#addTaskDescription"),
      date: getTaskInputValue("#addTaskDate"),
      priority: getPriorityFromButton(getActivePriorityButton()),
      category: getCategoryInputValue(),
   };
}


/**
 * Creates the task data.
 *
 * @param {string|number|null} [existingId=null] - The existing ID used for this operation. Defaults to null.
 * @returns {object} The task data object.
 */
function createTaskData(existingId = null) {
   const basicInputs = getBasicInputs();
   return {
      id: existingId || Date.now(),
      ...basicInputs,
      assigned: getSelectedContacts(),
      subtasks: getSubtasksList(),
      status: getDialogStatus(),
   };
}


/**
 * Adds the task to Firebase.
 *
 * @param {object} taskData - The task data object.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
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


/**
 * Updates the task in Firebase.
 *
 * @param {string} taskKey - The task key.
 * @param {object} taskData - The task data object.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
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


/**
 * Returns the dialog edit context.
 * @returns {object} The dialog edit context object.
 */
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


/**
 * Loads the tasks for save lookup.
 * @returns {Promise<object|null>} A promise that resolves to the save lookup tasks data.
 */
async function loadTasksForSaveLookup() {
   const response = await fetch(`${SAVE_TASK_BASE_URL}tasks.json`);
   if (!response.ok) return null;
   return response.json();
}


/**
 * Returns the save lookup task entries.
 *
 * @param {object} data - The task data object.
 * @returns {Array<Array<*>>} The save lookup task entries.
 */
function getSaveLookupTaskEntries(data) {
   if (!data) return [];
   return Array.isArray(data) ? data.map((task, index) => [String(index), task]) : Object.entries(data);
}


/**
 * Returns the matching save lookup task entry.
 *
 * @param {Array<Array<*>>} entries - The task entries.
 * @param {string|number} taskId - The task ID used for this operation.
 * @returns {Array<*>|undefined} The matching save lookup task entry.
 */
function findSaveLookupTaskEntry(entries, taskId) {
   return entries.find(([, task]) => task && String(task.id ?? "") === String(taskId));
}


/**
 * Finds the task key by ID for save.
 *
 * @param {string|number} taskId - The task ID used for this operation.
 * @returns {Promise<string|null>} A promise that resolves to the task key by ID for save, or null when it is not available.
 */
async function findTaskKeyByIdForSave(taskId) {
   if (!taskId) return null;
   const data = await loadTasksForSaveLookup();
   const match = findSaveLookupTaskEntry(getSaveLookupTaskEntries(data), taskId);
   return match ? match[0] : null;
}


/**
 * Updates an existing task for save.
 *
 * @param {string|number} taskId - The task ID used for this operation.
 * @param {string|null} taskKey - The task key.
 * @param {object} taskData - The task data object.
 * @returns {Promise<void>} A promise that resolves when the task update is complete.
 */
async function persistEditedTask(taskId, taskKey, taskData) {
   const resolvedTaskKey = taskKey || (await findTaskKeyByIdForSave(taskId));
   if (!resolvedTaskKey) throw new Error(`Task key not found for edit id ${taskId}`);
   await updateTaskInFirebase(resolvedTaskKey, taskData);
}


/**
 * Persists the task data.
 *
 * @param {object} editContext - The dialog edit context object.
 * @param {object} taskData - The task data object.
 * @returns {Promise<void>} A promise that resolves when the task data is stored.
 */
async function persistTaskData(editContext, taskData) {
   if (editContext.isEdit) return persistEditedTask(editContext.taskId, editContext.taskKey, taskData);
   await addTaskToFirebase(taskData);
}


/**
 * Saves the task to board.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function saveTaskToBoard() {
   if (isTaskSaveInProgress) return false;
   isTaskSaveInProgress = true;
   const editContext = getDialogEditContext();
   const taskData = createTaskData(editContext.taskId);
   try {
      await persistTaskData(editContext, taskData);
      return handleSaveSuccess(editContext.isEdit);
   } catch (error) {
      isTaskSaveInProgress = false;
      console.error(error);
      return false;
   }
}
