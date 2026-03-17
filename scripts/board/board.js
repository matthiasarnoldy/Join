/**
 * Returns the add task dialog.
 * @returns {HTMLDialogElement|null} The add task dialog element, or null when it is not available.
 */
function getAddTaskDialog() {
   return document.getElementById("addTaskDialog");
}

/**
 * Returns the task detail dialog.
 * @returns {HTMLDialogElement|null} The task detail dialog element, or null when it is not available.
 */
function getTaskDetailDialog() {
   return document.getElementById("taskDetailDialog");
}

/**
 * Updates the board dialog scroll lock.
 * @returns {void} Nothing.
 */
function updateBoardDialogScrollLock() {
   const addDialogOpen = Boolean(getAddTaskDialog()?.open);
   const detailDialogOpen = Boolean(getTaskDetailDialog()?.open);
   const shouldLockScroll = addDialogOpen || detailDialogOpen;
   document.documentElement.classList.toggle(
      "board-dialog-open",
      shouldLockScroll,
   );
   document.body.classList.toggle("board-dialog-open", shouldLockScroll);
}

/**
 * Sets the add task dialog mode.
 *
 * @param {boolean} isEditMode - Whether the mode is edit.
 * @returns {void} Nothing.
 */
function setAddTaskDialogMode(isEditMode) {
   const title = document.getElementById("addTaskDialogTitle");
   const buttonText = document.querySelector(".add-task__button-text");
   if (title) title.textContent = isEditMode ? "Edit Task" : "Add Task";
   if (buttonText)
      buttonText.textContent = isEditMode ? "Save changes" : "Create Task";
}

/**
 * Resets the add task dialog mode.
 * @returns {void} Nothing.
 */
function resetAddTaskDialogMode() {
   const dialog = getAddTaskDialog();
   if (!dialog) return;
   delete dialog.dataset.editTaskId;
   delete dialog.dataset.editTaskKey;
   setAddTaskDialogMode(false);
}

/**
 * Clears all fields in the given container.
 *
 * @param {HTMLElement|null} container - The container.
 * @returns {void} Nothing.
 */
function clearContainerFields(container) {
   const inputs = container.querySelectorAll("input, textarea, select");
   inputs.forEach((input) => {
      if (input.type === "checkbox" || input.type === "radio") {
         input.checked = false;
      } else {
         input.value = "";
         input.dispatchEvent(new Event("input", { bubbles: true }));
      }
   });
}

/**
 * Clears the add task dialog form state.
 * @returns {void} Nothing.
 */
function clearAddTaskDialogForm() {
   const dialog = getAddTaskDialog();
   if (!dialog) return;
   const container = dialog.querySelector(".dialog_flex-instructions") || dialog;
   if (typeof clearAllInputs === "function") {
      clearAllInputs(container);
   } else {
      clearContainerFields(container);
   }
   if (typeof resetPriority === "function") resetPriority(container);
   if (typeof resetAssigned === "function") resetAssigned(container);
   if (typeof resetCategory === "function") resetCategory(container);
   if (typeof clearSubtasks === "function") clearSubtasks(container);
   if (typeof resetValidation === "function") resetValidation(container);
}

/**
 * Opens the dialog.
 *
 * @param {string} [status="todo"] - The status. Defaults to "todo".
 * @returns {void} Nothing.
 */
function openDialog(status = "todo") {
   const dialog = getAddTaskDialog();
   if (!dialog) return;
   clearAddTaskDialogForm();
   dialog.dataset.taskStatus = status;
   resetAddTaskDialogMode();
   dialog.showModal();
   updateBoardDialogScrollLock();
}

/**
 * Closes the dialog.
 * @returns {void} Nothing.
 */
function closeDialog() {
   const dialog = getAddTaskDialog();
   if (!dialog) return;
   dialog.close();
   delete dialog.dataset.taskStatus;
   resetAddTaskDialogMode();
   updateBoardDialogScrollLock();
}

/**
 * Handles the board success message display state.
 * @returns {void} Nothing.
 */
function handleBoardSuccessMessage() {
   const shouldShowSuccess = localStorage.getItem("showTaskSuccess");
   if (shouldShowSuccess === "true") {
      const successIsEdit =
         localStorage.getItem("showTaskSuccessEdit") === "true";
      localStorage.removeItem("showTaskSuccess");
      localStorage.removeItem("showTaskSuccessEdit");
      if (typeof showSuccessMessage === "function") {
         showSuccessMessage(successIsEdit);
      }
   }
}

/**
 * Initializes the board.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function initializeBoard() {
   const tasks = await window.BoardData.loadTasks();
   window.BoardCards.renderBoardFromTasks(tasks);
   window.BoardDnd.initializeDraggableCards();
   window.BoardDnd.setupDropZones();
   window.BoardCards.updatePlaceholders();
   window.BoardCards.setupColumnAddButtons((status) => openDialog(status));
   window.BoardCards.setupTaskSearch();
   window.BoardCards.setupTaskCardClicks((taskId) =>
      window.BoardTaskDetail.openTaskDetail(taskId),
   );
   window.BoardTaskDetail.setupTaskDetailInteractions();
   handleBoardSuccessMessage();
}

document.addEventListener("DOMContentLoaded", initializeBoard);

window.addEventListener("click", (event) => {
   const addDialog = getAddTaskDialog();
   if (addDialog && event.target === addDialog) {
      closeDialog();
   }
   const detailDialog = getTaskDetailDialog();
   if (detailDialog && event.target === detailDialog) {
      window.BoardTaskDetail.closeTaskDetailDialog();
   }
});

window.addEventListener("DOMContentLoaded", () => {
   const addDialog = getAddTaskDialog();
   const detailDialog = getTaskDetailDialog();
   addDialog?.addEventListener("close", updateBoardDialogScrollLock);
   detailDialog?.addEventListener("close", updateBoardDialogScrollLock);
});

window.getAddTaskDialog = getAddTaskDialog;
window.getTaskDetailDialog = getTaskDetailDialog;
window.updateBoardDialogScrollLock = updateBoardDialogScrollLock;
window.setAddTaskDialogMode = setAddTaskDialogMode;
window.resetAddTaskDialogMode = resetAddTaskDialogMode;
window.clearAddTaskDialogForm = clearAddTaskDialogForm;
window.openDialog = openDialog;
window.closeDialog = closeDialog;
