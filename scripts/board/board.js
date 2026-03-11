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

   const shouldShowSuccess = localStorage.getItem("showTaskSuccess");
   if (shouldShowSuccess === "true") {
      const successIsEdit = localStorage.getItem("showTaskSuccessEdit") === "true";
      localStorage.removeItem("showTaskSuccess");
      localStorage.removeItem("showTaskSuccessEdit");
      if (typeof showSuccessMessage === "function") {
         showSuccessMessage(successIsEdit);
      }
   }
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

window.getAddTaskDialog = getAddTaskDialog;
window.getTaskDetailDialog = getTaskDetailDialog;
window.setAddTaskDialogMode = setAddTaskDialogMode;
window.resetAddTaskDialogMode = resetAddTaskDialogMode;
window.openDialog = openDialog;
window.closeDialog = closeDialog;
