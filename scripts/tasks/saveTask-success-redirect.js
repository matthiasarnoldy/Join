/**
 * Checks whether the dialog is in.
 * @returns {boolean} Whether the dialog is in.
 */
function isInDialog() {
   const dialog = document.getElementById("addTaskDialog");
   return dialog && dialog.open;
}


/**
 * Creates the success message.
 *
 * @param {boolean} [isEdit=false] - Whether edit mode is active. Defaults to false.
 * @returns {HTMLDivElement} The success message element.
 */
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


/**
 * Shows the success message.
 *
 * @param {boolean} [isEdit=false] - Whether edit mode is active. Defaults to false.
 * @returns {void} Nothing.
 */
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


/**
 * Redirects the after save.
 * @returns {void} Nothing.
 */
function redirectAfterSave() {
   if (isInDialog()) {
      window.location.reload();
   } else {
      window.location.href = withSaveTaskAuthUserQuery(
         saveTaskPagePath("board.html"),
      );
   }
}


/**
 * Returns the save task auth user ID from URL.
 * @returns {string} The save task auth user ID from URL.
 */
function getSaveTaskAuthUserIdFromUrl() {
   const params = new URLSearchParams(window.location.search);
   return String(params.get("uid") || "").trim();
}


/**
 * Builds the save task auth user query.
 *
 * @param {string} path - The path.
 * @returns {string} The save task auth user query.
 */
function withSaveTaskAuthUserQuery(path) {
   const userId = getSaveTaskAuthUserIdFromUrl();
   if (!userId) return path;
   const separator = path.includes("?") ? "&" : "?";
   return `${path}${separator}uid=${encodeURIComponent(userId)}`;
}


/**
 * Stores the task save success flags.
 *
 * @param {boolean} isEdit - Whether edit mode is active.
 * @returns {void} Nothing.
 */
function storeTaskSaveSuccessFlags(isEdit) {
   localStorage.setItem("showTaskSuccess", "true");
   localStorage.setItem("showTaskSuccessEdit", isEdit ? "true" : "false");
}


/**
 * Handles the dialog save success.
 *
 * @param {boolean} isEdit - Whether edit mode is active.
 * @returns {boolean} Whether the dialog save handling is complete.
 */
function handleDialogSaveSuccess(isEdit) {
   storeTaskSaveSuccessFlags(isEdit);
   redirectAfterSave();
   return true;
}


/**
 * Schedules the redirect after save.
 * @returns {void} Nothing.
 */
function scheduleRedirectAfterSave() {
   setTimeout(() => {
      redirectAfterSave();
   }, 1000);
}


/**
 * Handles the page save success.
 *
 * @param {boolean} isEdit - Whether edit mode is active.
 * @returns {boolean} Whether the page save handling is complete.
 */
function handlePageSaveSuccess(isEdit) {
   showSuccessMessage(isEdit);
   scheduleRedirectAfterSave();
   return true;
}


/**
 * Handles the save success.
 *
 * @param {boolean} isEdit - Whether edit mode is active.
 * @returns {boolean} Whether the save success was handled.
 */
function handleSaveSuccess(isEdit) {
   return isInDialog() ? handleDialogSaveSuccess(isEdit) : handlePageSaveSuccess(isEdit);
}
