// ===== TEXTAREA RESIZE =====

/**
 * Initializes the textarea resize.
 * @returns {void} Nothing.
 */
function initTextareaResize() {
   const wrappers = document.querySelectorAll(".add-task__input-field--textarea");
   wrappers.forEach(setupTextareaResize);
}


/**
 * Sets up the textarea resize.
 *
 * @param {HTMLElement|null} wrapper - The wrapper.
 * @returns {void} Nothing.
 */
function setupTextareaResize(wrapper) {
   const textarea = wrapper.querySelector("textarea");
   const handle = wrapper.querySelector(".add-task__textarea-resize");
   if (!textarea || !handle) return;
   handle.style.pointerEvents = "auto";
   handle.addEventListener("mousedown", (event) => {
      startTextareaResize(event, textarea);
   });
}


/**
 * Starts the textarea resize.
 *
 * @param {Event} event - The event object that triggered the handler.
 * @param {string} textarea - The textarea.
 * @returns {void} Nothing.
 */
function startTextareaResize(event, textarea) {
   event.preventDefault();
   const { minHeight, maxHeight } = getTextareaHeight(textarea);
   const startY = event.clientY;
   const startHeight = textarea.offsetHeight;
   const moveHandler = (e) => {
      handleMouseMove(e, startY, startHeight, textarea, minHeight, maxHeight);
   };
   const upHandler = () => {
      removeResizeListeners(moveHandler, upHandler);
   };
   document.addEventListener("mousemove", moveHandler);
   document.addEventListener("mouseup", upHandler);
}


/**
 * Returns the textarea height.
 *
 * @param {string} textarea - The textarea.
 * @returns {object} The textarea height object.
 */
function getTextareaHeight(textarea) {
   const styles = getComputedStyle(textarea);
   const minHeight = getPixelValue(styles.minHeight) || 48;
   const maxHeight = getPixelValue(styles.maxHeight) || 1000;
   return { minHeight, maxHeight };
}


/**
 * Returns the pixel value.
 *
 * @param {string} cssValue - The CSS value.
 * @returns {number} The pixel value value.
 */
function getPixelValue(cssValue) {
   return Number.parseFloat(cssValue) || 0;
}


/**
 * Handles the mouse move.
 *
 * @param {Event} event - The event object that triggered the handler.
 * @param {*} startY - The start y.
 * @param {number} startHeight - The start height.
 * @param {string} textarea - The textarea.
 * @param {number} minHeight - The min height.
 * @param {number} maxHeight - The max height.
 * @returns {void} Nothing.
 */
function handleMouseMove(event, startY, startHeight, textarea, minHeight, maxHeight) {
   const deltaY = event.clientY - startY;
   const newHeight = startHeight + deltaY;
   updateTextareaHeight(textarea, newHeight, minHeight, maxHeight);
}


/**
 * Updates the textarea height.
 *
 * @param {string} textarea - The textarea.
 * @param {object} newHeight - The new height.
 * @param {number} minHeight - The min height.
 * @param {number} maxHeight - The max height.
 * @returns {void} Nothing.
 */
function updateTextareaHeight(textarea, newHeight, minHeight, maxHeight) {
   const clampedHeight = clampValue(newHeight, minHeight, maxHeight);
   textarea.style.height = `${clampedHeight}px`;
}


/**
 * Returns the clamp value.
 *
 * @param {string} value - The value.
 * @param {*} min - The min.
 * @param {*} max - The max.
 * @returns {*} The clamp value result.
 */
function clampValue(value, min, max) {
   if (value < min) return min;
   if (value > max) return max;
   return value;
}


/**
 * Removes the resize listeners.
 *
 * @param {*} moveHandler - The move handler.
 * @param {*} upHandler - The up handler.
 * @returns {void} Nothing.
 */
function removeResizeListeners(moveHandler, upHandler) {
   document.removeEventListener("mousemove", moveHandler);
   document.removeEventListener("mouseup", upHandler);
}

// ===== PRIORITY FIELD =====

/**
 * Initializes the priority field.
 * @returns {void} Nothing.
 */
function initPriorityField() {
   const priorityField = document.getElementById("addTaskPriority");
   if (!priorityField) return;
   priorityField.addEventListener("click", handlePriorityClick);
}


/**
 * Handles the priority click.
 *
 * @param {Event} clickEvent - The event object that triggered the handler.
 * @returns {void} Nothing.
 */
function handlePriorityClick(clickEvent) {
   const clickedButton = clickEvent.target.closest(".add-task__priority-option");
   if (!clickedButton) return;
   const field = clickedButton.closest(".add-task__priority-field");
   const priorityButtons = field.querySelectorAll(".add-task__priority-option");
   removeActiveFromAll(priorityButtons);
   setButtonActive(clickedButton);
}


/**
 * Removes the active from all.
 *
 * @param {NodeListOf<Element>|Array<Element>} priorityButtons - The priority buttons collection.
 * @returns {void} Nothing.
 */
function removeActiveFromAll(priorityButtons) {
   priorityButtons.forEach(button => {
      button.classList.remove("add-task__priority-option--active");
   });
}


/**
 * Sets the button active.
 *
 * @param {HTMLElement|null} button - The button.
 * @returns {void} Nothing.
 */
function setButtonActive(button) {
   button.classList.add("add-task__priority-option--active");
}
