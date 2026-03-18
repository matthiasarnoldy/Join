"use strict";

{
   /**
    * Returns the task detail dialog.
    * @returns {HTMLDialogElement|null} The task detail dialog.
    */
   function getTaskDetailDialog() {
      return document.getElementById("taskDetailDialog");
   }

   /**
    * Closes the task detail dialog.
    * @returns {void} Nothing.
    */
   function closeTaskDetailDialog() {
      const dialog = getTaskDetailDialog();
      if (!dialog) return;
      dialog.close();
      delete dialog.dataset.taskId;
      window.updateBoardDialogScrollLock?.();
   }

   /**
    * Opens the task detail.
    *
    * @param {string|number} taskId - The task ID.
    * @returns {void} Nothing.
    */
   function openTaskDetail(taskId) {
      const dialog = getTaskDetailDialog();
      const taskData = window.BoardData?.getTask(taskId);
      if (!dialog || !taskData) return;
      dialog.dataset.taskId = String(taskId);
      window.BoardTaskDetailRender?.renderTaskDetail(taskData);
      dialog.showModal();
      window.updateBoardDialogScrollLock?.();
   }

   /**
    * Returns the selected detail checkbox.
    *
    * @param {Event} event - The change event.
    * @returns {HTMLInputElement|null} The selected detail checkbox.
    */
   function getTaskDetailCheckbox(event) {
      return event.target.closest(".task-detail__subtask-checkbox");
   }

   /**
    * Returns the detail subtask index.
    *
    * @param {HTMLInputElement|null} checkbox - The subtask checkbox.
    * @returns {number} The detail subtask index.
    */
   function getTaskDetailSubtaskIndex(checkbox) {
      return Number.parseInt(checkbox?.dataset.subtaskIndex || "", 10);
   }

   /**
    * Returns the task detail subtask toggle payload.
    *
    * @param {Event} event - The change event.
    * @returns {object|null} The task detail subtask toggle payload.
    */
   function getTaskDetailSubtaskTogglePayload(event) {
      const checkbox = getTaskDetailCheckbox(event);
      const taskId = getTaskDetailDialog()?.dataset.taskId;
      const subtaskIndex = getTaskDetailSubtaskIndex(checkbox);
      const currentTask = window.BoardData?.getTask(taskId);
      if (!checkbox || !taskId || Number.isNaN(subtaskIndex) || !currentTask?.subtasks?.[subtaskIndex]) return null;
      return { checkbox, taskId, subtaskIndex, currentTask };
   }

   /**
    * Returns the task with one toggled subtask.
    *
    * @param {object} task - The task object.
    * @param {number} subtaskIndex - The subtask index.
    * @param {boolean} isCompleted - Whether the subtask is completed.
    * @returns {object} The updated task.
    */
   function getTaskWithToggledSubtask(task, subtaskIndex, isCompleted) {
      const subtasks = (task.subtasks || []).map((subtask, index) => index === subtaskIndex ? { ...subtask, completed: isCompleted } : subtask);
      return { ...task, subtasks };
   }

   /**
    * Reloads the board and keeps the detail open.
    *
    * @param {string|number} taskId - The task ID.
    * @returns {Promise<void>} A promise that resolves when the board is reloaded.
    */
   async function reloadBoardAndKeepDetailOpen(taskId) {
      const tasks = await window.BoardData.loadTasks();
      window.BoardCards?.renderBoardFromTasks(tasks);
      window.BoardDnd?.initializeDraggableCards();
      openTaskDetail(taskId);
   }

   /**
    * Persists the task detail subtask toggle.
    *
    * @param {string|number} taskId - The task ID.
    * @param {object} updatedTask - The updated task object.
    * @returns {Promise<void>} A promise that resolves when the subtask toggle is stored.
    */
   async function persistTaskDetailSubtaskToggle(taskId, updatedTask) {
      await window.BoardData.putTask(taskId, updatedTask);
      await reloadBoardAndKeepDetailOpen(taskId);
   }

   /**
    * Reverts one detail checkbox state.
    *
    * @param {HTMLInputElement} checkbox - The subtask checkbox.
    * @returns {void} Nothing.
    */
   function revertTaskDetailCheckbox(checkbox) {
      checkbox.checked = !checkbox.checked;
   }

   /**
    * Handles the task detail subtask toggle.
    *
    * @param {Event} event - The change event.
    * @returns {Promise<void>} A promise that resolves when the change is handled.
    */
   async function handleTaskDetailSubtaskToggle(event) {
      const payload = getTaskDetailSubtaskTogglePayload(event);
      if (!payload) return;
      const updatedTask = getTaskWithToggledSubtask(payload.currentTask, payload.subtaskIndex, payload.checkbox.checked);
      try {
         await persistTaskDetailSubtaskToggle(payload.taskId, updatedTask);
      } catch (error) {
         revertTaskDetailCheckbox(payload.checkbox);
         console.error("Subtask update failed:", error);
      }
   }

   /**
    * Handles deleting the task.
    *
    * @param {string|number} taskId - The task ID.
    * @returns {Promise<void>} A promise that resolves when the task is deleted.
    */
   async function handleDeleteTask(taskId) {
      try {
         await window.BoardData.deleteTask(taskId);
         closeTaskDetailDialog();
         window.BoardCards?.renderBoardFromTasks(await window.BoardData.loadTasks());
      } catch (error) {
         console.error("Task delete failed:", error);
      }
   }

   /**
    * Handles the task detail delete click.
    *
    * @param {HTMLDialogElement|null} dialog - The dialog.
    * @returns {Promise<void>} A promise that resolves when the delete is handled.
    */
   async function handleTaskDetailDeleteClick(dialog) {
      const taskId = dialog?.dataset.taskId;
      if (taskId) await handleDeleteTask(taskId);
   }

   /**
    * Handles the task detail edit click.
    *
    * @param {HTMLDialogElement|null} dialog - The dialog.
    * @returns {Promise<void>} A promise that resolves when the edit is handled.
    */
   async function handleTaskDetailEditClick(dialog) {
      const taskId = dialog?.dataset.taskId;
      if (taskId) await window.BoardTaskDetailForm?.openEditTaskDialog(taskId);
   }

   /**
    * Binds one task detail button.
    *
    * @param {string} id - The button ID.
    * @param {string} eventName - The event name.
    * @param {*} handler - The event handler.
    * @returns {void} Nothing.
    */
   function bindTaskDetailButton(id, eventName, handler) {
      document.getElementById(id)?.addEventListener(eventName, handler);
   }

   /**
    * Handles the task detail delete button click.
    *
    * @param {HTMLDialogElement} dialog - The dialog.
    * @returns {void} Nothing.
    */
   function handleTaskDetailDeleteButtonClick(dialog) {
      handleTaskDetailDeleteClick(dialog);
   }

   /**
    * Handles the task detail edit button click.
    *
    * @param {HTMLDialogElement} dialog - The dialog.
    * @returns {void} Nothing.
    */
   function handleTaskDetailEditButtonClick(dialog) {
      handleTaskDetailEditClick(dialog);
   }

   /**
    * Binds the detail subtask list.
    * @returns {void} Nothing.
    */
   function bindTaskDetailSubtasks() {
      document.getElementById("taskDetailSubtasksList")?.addEventListener("change", handleTaskDetailSubtaskToggle);
   }

   /**
    * Binds the detail action buttons.
    *
    * @param {HTMLDialogElement} dialog - The dialog.
    * @returns {void} Nothing.
    */
   function bindTaskDetailActions(dialog) {
      bindTaskDetailButton("taskDetailClose", "click", closeTaskDetailDialog);
      bindTaskDetailButton("taskDetailDelete", "click", () => handleTaskDetailDeleteButtonClick(dialog));
      bindTaskDetailButton("taskDetailEdit", "click", () => handleTaskDetailEditButtonClick(dialog));
   }

   /**
    * Sets up the task detail interactions.
    * @returns {void} Nothing.
    */
   function setupTaskDetailInteractions() {
      const dialog = getTaskDetailDialog();
      if (!dialog || dialog.dataset.initialized === "true") return;
      dialog.dataset.initialized = "true";
      bindTaskDetailSubtasks();
      bindTaskDetailActions(dialog);
   }

   window.BoardTaskDetail = {
      closeTaskDetailDialog,
      openTaskDetail,
      setupTaskDetailInteractions,
   };
}
