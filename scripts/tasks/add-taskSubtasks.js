// ===== SUBTASKS =====

/**
 * Initializes the subtask controls.
 * @returns {void} Nothing.
 */
function initSubtaskControls() {
   const groups = document.querySelectorAll(".add-task__input-group--subtasks");
   groups.forEach(setupSubtaskButtons);
}


/**
 * Returns the subtask control elements.
 *
 * @param {*} group - The group.
 * @returns {object|null} The subtask control elements object.
 */
function getSubtaskControls(group) {
   const input = group.querySelector(".add-task__input--subtasks");
   const list = group.querySelector(".add-task__subtask-list");
   const clearButton = group.querySelector(".add-task__subtask-button[data-action='clear']");
   const addButton = group.querySelector(".add-task__subtask-button[data-action='add']");
   if (!input || !list || !clearButton || !addButton) return null;
   return { input, list, clearButton, addButton };
}


/**
 * Binds the subtask clear button.
 *
 * @param {HTMLElement|null} button - The clear button.
 * @param {HTMLElement|null} input - The subtask input.
 * @returns {void} Nothing.
 */
function bindSubtaskClearButton(button, input) {
   button.addEventListener("click", () => clearSubtaskInput(input));
}


/**
 * Binds the subtask add button.
 *
 * @param {HTMLElement|null} button - The add button.
 * @param {HTMLElement|null} input - The subtask input.
 * @param {HTMLElement|null} list - The subtask list.
 * @returns {void} Nothing.
 */
function bindSubtaskAddButton(button, input, list) {
   button.addEventListener("click", () => addSubtaskFromInput(input, list));
}


/**
 * Handles the subtask input keydown.
 *
 * @param {Event} event - The event object that triggered the handler.
 * @param {HTMLElement|null} input - The subtask input.
 * @param {HTMLElement|null} list - The subtask list.
 * @returns {void} Nothing.
 */
function handleSubtaskInputKeydown(event, input, list) {
   if (event.key !== "Enter") return;
   event.preventDefault();
   addSubtaskFromInput(input, list);
}


/**
 * Binds the subtask input.
 *
 * @param {HTMLElement|null} input - The subtask input.
 * @param {HTMLElement|null} list - The subtask list.
 * @returns {void} Nothing.
 */
function bindSubtaskInput(input, list) {
   input.addEventListener("keydown", (event) => handleSubtaskInputKeydown(event, input, list));
}


/**
 * Sets up the subtask buttons.
 *
 * @param {*} group - The group.
 * @returns {void} Nothing.
 */
function setupSubtaskButtons(group) {
   const controls = getSubtaskControls(group);
   if (!controls) return;
   bindSubtaskClearButton(controls.clearButton, controls.input);
   bindSubtaskAddButton(controls.addButton, controls.input, controls.list);
   bindSubtaskInput(controls.input, controls.list);
}


/**
 * Clears the subtask input.
 *
 * @param {HTMLElement|null} input - The input.
 * @returns {void} Nothing.
 */
function clearSubtaskInput(input) {
   input.value = "";
   input.focus();
}


/**
 * Adds the subtask from input.
 *
 * @param {HTMLElement|null} input - The input.
 * @param {HTMLElement|null} list - The list.
 * @returns {void} Nothing.
 */
function addSubtaskFromInput(input, list) {
   const inputValue = input.value.trim();
   if (!inputValue) return;
   addSubtaskToList(list, inputValue);
   clearSubtaskInput(input);
}


/**
 * Creates the edit input.
 *
 * @param {object} currentText - The current text object.
 * @returns {HTMLInputElement} The edit input element.
 */
function createEditInput(currentText) {
   const input = document.createElement("input");
   input.type = "text";
   input.className = "add-task__subtask-input";
   input.value = currentText;
   return input;
}


/**
 * Creates the text element.
 *
 * @param {string} text - The text.
 * @returns {HTMLSpanElement} The text element element.
 */
function createTextElement(text) {
   const span = document.createElement("span");
   span.className = "add-task__subtask-text";
   span.textContent = text;
   return span;
}


/**
 * Replaces the input with text.
 *
 * @param {HTMLElement|null} inputElement - The input element.
 * @param {HTMLElement|null} textElement - The text element.
 * @returns {void} Nothing.
 */
function replaceInputWithText(inputElement, textElement) {
   inputElement.replaceWith(textElement);
}


/**
 * Handles the reattach edit listeners.
 *
 * @param {HTMLElement|null} item - The item.
 * @param {HTMLElement|null} textElement - The text element.
 * @param {HTMLElement|null} checkButton - The check button.
 * @returns {void} Nothing.
 */
function reattachEditListeners(item, textElement, checkButton) {
   setupSubtaskDoubleClick(item, textElement, checkButton);
   const editButton = item.querySelector(".add-task__subtask-item-button[data-action='edit']");
   const newEditButton = editButton.cloneNode(true);
   editButton.replaceWith(newEditButton);
   setupSubtaskEditButton(item, newEditButton, textElement, checkButton);
}


/**
 * Saves the subtask edit.
 *
 * @param {HTMLElement|null} item - The item.
 * @param {HTMLElement|null} inputElement - The input element.
 * @param {HTMLElement|null} checkButton - The check button.
 * @returns {void} Nothing.
 */
function saveSubtaskEdit(item, inputElement, checkButton) {
   const newText = inputElement.value.trim();
   if (newText) {
      const newTextElement = createTextElement(newText);
      replaceInputWithText(inputElement, newTextElement);
      item.classList.remove("add-task__subtask-item--editing");
      reattachEditListeners(item, newTextElement, checkButton);
   } else {
      inputElement.focus();
   }
}


/**
 * Cancels the subtask edit.
 *
 * @param {HTMLElement|null} item - The item.
 * @param {HTMLElement|null} inputElement - The input element.
 * @param {string} originalText - The original text.
 * @param {HTMLElement|null} checkButton - The check button.
 * @returns {void} Nothing.
 */
function cancelSubtaskEdit(item, inputElement, originalText, checkButton) {
   const newTextElement = createTextElement(originalText);
   replaceInputWithText(inputElement, newTextElement);
   item.classList.remove("add-task__subtask-item--editing");
   reattachEditListeners(item, newTextElement, checkButton);
}


/**
 * Sets up the edit keyboard events.
 *
 * @param {HTMLElement|null} item - The item.
 * @param {HTMLElement|null} inputElement - The input element.
 * @param {string} originalText - The original text.
 * @param {HTMLElement|null} checkButton - The check button.
 * @returns {void} Nothing.
 */
function setupEditKeyboardEvents(item, inputElement, originalText, checkButton) {
   inputElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
         saveSubtaskEdit(item, inputElement, checkButton);
      } else if (e.key === "Escape") {
         cancelSubtaskEdit(item, inputElement, originalText, checkButton);
      }
   });
}


/**
 * Sets up the edit blur event.
 *
 * @param {HTMLElement|null} item - The item.
 * @param {HTMLElement|null} inputElement - The input element.
 * @param {HTMLElement|null} checkButton - The check button.
 * @returns {void} Nothing.
 */
function setupEditBlurEvent(item, inputElement, checkButton) {
   inputElement.addEventListener("blur", () => {
      setTimeout(() => {
         if (item.classList.contains("add-task__subtask-item--editing")) {
            saveSubtaskEdit(item, inputElement, checkButton);
         }
      }, 100);
   });
}


/**
 * Adds the subtask to list.
 *
 * @param {HTMLElement|null} list - The list.
 * @param {object} subtaskText - The subtask text object.
 * @returns {void} Nothing.
 */
function addSubtaskToList(list, subtaskText) {
   const item = createSubtaskItem(subtaskText);
   setupSubtaskListeners(item);
   list.prepend(item);
}


/**
 * Creates the subtask item.
 *
 * @param {object} subtaskText - The subtask text object.
 * @returns {HTMLLIElement} The subtask item element.
 */
function createSubtaskItem(subtaskText) {
   const item = document.createElement("li");
   item.className = "add-task__subtask-item";
   item.innerHTML = createSubtaskHTML(subtaskText);
   return item;
}


/**
 * Sets up the subtask listeners.
 *
 * @param {HTMLElement|null} item - The item.
 * @returns {void} Nothing.
 */
function setupSubtaskListeners(item) {
   const textElement = item.querySelector(".add-task__subtask-text");
   const deleteButton = item.querySelector(".add-task__subtask-item-button[data-action='delete']");
   const deleteEditButton = item.querySelector(".add-task__subtask-item-button[data-action='delete-edit']");
   const checkButton = item.querySelector(".add-task__subtask-item-button[data-action='check']");
   const editButton = item.querySelector(".add-task__subtask-item-button[data-action='edit']");
   setupSubtaskDeleteButton(item, deleteButton);
   setupSubtaskDeleteButton(item, deleteEditButton);
   setupSubtaskEditButton(item, editButton, textElement, checkButton);
   setupSubtaskDoubleClick(item, textElement, checkButton);
}


/**
 * Sets up the subtask delete button.
 *
 * @param {HTMLElement|null} item - The item.
 * @param {HTMLElement|null} button - The button.
 * @returns {void} Nothing.
 */
function setupSubtaskDeleteButton(item, button) {
   button.addEventListener("click", () => {
      deleteSubtaskItem(item);
   });
}


/**
 * Sets up the subtask edit button.
 *
 * @param {HTMLElement|null} item - The item.
 * @param {HTMLElement|null} button - The button.
 * @param {HTMLElement|null} textElement - The text element.
 * @param {HTMLElement|null} checkButton - The check button.
 * @returns {void} Nothing.
 */
function setupSubtaskEditButton(item, button, textElement, checkButton) {
   button.addEventListener("click", () => {
      enableSubtaskEdit(item, textElement, checkButton);
   });
}



/**
 * Sets up the subtask double click.
 *
 * @param {HTMLElement|null} item - The item.
 * @param {HTMLElement|null} textElement - The text element.
 * @param {HTMLElement|null} checkButton - The check button.
 * @returns {void} Nothing.
 */
function setupSubtaskDoubleClick(item, textElement, checkButton) {
   textElement.addEventListener("dblclick", () => {
      enableSubtaskEdit(item, textElement, checkButton);
   });
}


/**
 * Deletes the subtask item.
 *
 * @param {HTMLElement|null} item - The item.
 * @returns {void} Nothing.
 */
function deleteSubtaskItem(item) {
   item.remove();
}


/**
 * Enables the subtask edit.
 *
 * @param {HTMLElement|null} item - The item.
 * @param {HTMLElement|null} textElement - The text element.
 * @param {HTMLElement|null} checkButton - The check button.
 * @returns {void} Nothing.
 */
function enableSubtaskEdit(item, textElement, checkButton) {
   const originalText = textElement.textContent;
   item.classList.add("add-task__subtask-item--editing");
   const inputElement = createEditInput(originalText);
   replaceTextWithInput(textElement, inputElement);
   setupCheckButtonListener(checkButton, item, inputElement);
   setupEditBlurEvent(item, inputElement, checkButton);
   setupEditKeyboardEvents(item, inputElement, originalText, checkButton);
}


/**
 * Replaces the text with input.
 *
 * @param {HTMLElement|null} textElement - The text element.
 * @param {HTMLElement|null} inputElement - The input element.
 * @returns {void} Nothing.
 */
function replaceTextWithInput(textElement, inputElement) {
   textElement.replaceWith(inputElement);
   inputElement.focus();
   inputElement.select();
}


/**
 * Sets up the check button listener.
 *
 * @param {HTMLElement|null} checkButton - The check button.
 * @param {HTMLElement|null} item - The item.
 * @param {HTMLElement|null} inputElement - The input element.
 * @returns {void} Nothing.
 */
function setupCheckButtonListener(checkButton, item, inputElement) {
   const checkHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      saveSubtaskEdit(item, inputElement, checkButton);
   };
   checkButton.addEventListener("click", checkHandler);
}
